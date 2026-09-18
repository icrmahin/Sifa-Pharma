import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import * as Linking from 'expo-linking'
import { supabase } from '../lib/supabase'
import type { User } from '../types/user'
import type { AuthSession, AuthContextType, LoginForm, RegisterForm } from '../types/auth'

// Production allowlist — must match DB is_admin() allowlist exactly
const ADMIN_EMAILS = new Set(['icrmahin@gmail.com', 'hibbullah82026@gmail.com'])

function isEmailAllowlisted(email?: string | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.has(email.trim().toLowerCase())
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await handleSessionChange(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await handleSessionChange(session)
    })

    // Deep-link handling for email confirmation and password recovery (standalone Android via sifapharma://)
    const handleUrl = async (url: string | null) => {
      if (!url) return
      try {
        const parsed = Linking.parse(url)
        const query = parsed.queryParams as Record<string, string> | null
        // PKCE code flow (Supabase emails with ?code=...)
        const code = query?.code as string | undefined
        const token_hash = query?.token_hash as string | undefined
        const type = query?.type as string | undefined
        const error_code = query?.error_code as string | undefined
        if (error_code) {
          // let UI surface via onAuthStateChange error handling
          return
        }
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(url)
          if (error) console.warn('[AuthProvider] exchangeCodeForSession error', error.message)
        } else if (token_hash && type) {
          // legacy token_hash flow (recovery, signup, email_change)
          const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any })
          if (error) console.warn('[AuthProvider] verifyOtp error', error.message)
        } else {
          // Handle case where url contains access_token in hash (implicit flow fallback)
          const hash = url.split('#')[1]
          if (hash) {
            const params = new URLSearchParams(hash)
            const access_token = params.get('access_token')
            const refresh_token = params.get('refresh_token')
            if (access_token && refresh_token) {
              await supabase.auth.setSession({ access_token, refresh_token })
            }
          }
        }
      } catch (e) {
        console.warn('[AuthProvider] handleUrl error', e)
      }
    }

    Linking.getInitialURL().then(handleUrl)
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url))

    return () => {
      subscription.unsubscribe()
      sub.remove()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchProfileRole(userId: string): Promise<'customer' | 'admin' | null> {
    try {
      const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single()
      if (error || !data) return null
      return data.role as 'customer' | 'admin'
    } catch {
      return null
    }
  }

  async function checkIsAdminRpc(): Promise<boolean | null> {
    try {
      const { data, error } = await supabase.rpc('is_admin')
      if (error) return null
      return data === true
    } catch {
      return null
    }
  }

  async function handleSessionChange(session: any) {
    if (session?.user) {
      const email = session.user.email as string | undefined
      // Display role from profiles (derived), but authorization truth is email allowlist + DB is_admin()
      const profileRole = await fetchProfileRole(session.user.id)
      // DB truth via RPC (when available) otherwise fallback to email allowlist
      const rpcAdmin = await checkIsAdminRpc()
      const emailAdmin = isEmailAllowlisted(email)

      // If RPC available, trust it; else use email allowlist (same as DB). Profiles role is NOT trusted for admin.
      const hardenedIsAdmin = rpcAdmin !== null ? rpcAdmin : emailAdmin
      // Keep role for display but ensure isAdmin follows hardened truth
      const displayRole: 'customer' | 'admin' = hardenedIsAdmin ? 'admin' : 'customer'
      // Log mismatch for observability (customer with profiles.role admin should not be admin)
      if (profileRole === 'admin' && !hardenedIsAdmin) {
        console.warn('[AuthProvider] blocked admin impersonation: profiles.role=admin but email not allowlisted', email)
      }

      const authSession: AuthSession = {
        id: (session as any).id || session.access_token?.slice(0, 8) || '',
        userId: session.user.id || '',
        role: displayRole,
        email: email || undefined,
        phone: session.user.phone || undefined,
        isAdmin: hardenedIsAdmin,
      }
      setSession(authSession)
      setIsAdmin(hardenedIsAdmin)

      const appUser: User = {
        id: session.user.id || '',
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
        email: session.user.email,
        phone: session.user.phone,
        role: displayRole,
        avatar: session.user.user_metadata?.avatar_url,
        createdAt: session.user.created_at || new Date().toISOString(),
      }
      setUser(appUser)
    } else {
      setSession(null)
      setUser(null)
      setIsAdmin(false)
    }
  }

  const login = useCallback(async (form: LoginForm): Promise<AuthSession> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    if (error) {
      // Surface email-not-confirmed clearly
      if (error.message.toLowerCase().includes('not confirmed') || error.message.toLowerCase().includes('email not confirmed')) {
        throw new Error('Email not confirmed. Please check your inbox and confirm via the link (sifapharma://).')
      }
      throw new Error(error.message)
    }
    if (!data.session || !data.user) {
      // With enable_confirmations=true, signUp returns no session until confirmed; signIn should always have session if confirmed
      throw new Error('No session returned. If you just signed up, check your email for confirmation.')
    }
    const email = data.user.email
    const hardenedIsAdmin = isEmailAllowlisted(email)
    // Also verify via RPC after session established (best effort)
    let rpcAdmin: boolean | null = null
    try {
      const r = await supabase.rpc('is_admin')
      if (!r.error) rpcAdmin = r.data === true
    } catch {}
    const finalIsAdmin = rpcAdmin !== null ? rpcAdmin : hardenedIsAdmin
    const role: 'customer' | 'admin' = finalIsAdmin ? 'admin' : 'customer'
    return {
      id: (data.session as any).id || '',
      userId: data.user.id || '',
      role,
      email: data.user.email,
      phone: data.user.phone,
      isAdmin: finalIsAdmin,
    }
  }, [])

  const register = useCallback(async (form: RegisterForm): Promise<AuthSession> => {
    const emailRedirectTo = Linking.createURL('auth-callback')
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          phone: form.phone,
          role: 'customer',
        },
        emailRedirectTo,
      },
    })
    if (error) throw new Error(error.message)
    // With confirmations enabled, data.session will be null and user must confirm email
    if (!data.session || !data.user) {
      // Supabase returns user with confirmation_sent_at when email confirmation required
      // Surface as informational error so UI can show "check email"
      throw new Error('Account created. Please check your email to confirm before signing in.')
    }
    // Seed confirmed immediately (local dev with Mailpit or hosted with auto-confirm disabled? still confirm)
    return {
      id: (data.session as any).id || '',
      userId: data.user.id || '',
      role: 'customer',
      email: data.user.email,
      phone: form.phone,
      isAdmin: isEmailAllowlisted(data.user.email),
    }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
    setSession(null)
    setUser(null)
    setIsAdmin(false)
  }, [])

  const refreshUser = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser) {
      // Build minimal session-shaped object for handleSessionChange
      await handleSessionChange({ user: currentUser, access_token: '' })
    }
  }, [])

  const value = useMemo<AuthContextType>(() => ({
    session,
    user,
    isAdmin,
    loading,
    signOut,
    logout: signOut,
    login,
    register,
    refreshUser,
  }), [session, user, isAdmin, loading, signOut, login, register, refreshUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within AuthProvider')
  return value
}
