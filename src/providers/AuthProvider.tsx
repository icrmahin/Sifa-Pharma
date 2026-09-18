import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '../types/user'
import type { AuthSession, AuthContextType, LoginForm, RegisterForm } from '../types/auth'

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

    return () => { subscription.unsubscribe() }
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

  async function handleSessionChange(session: any) {
    if (session?.user) {
      // Authoritative role is from profiles table, NOT user_metadata
      const profileRole = await fetchProfileRole(session.user.id)
      const userRole: 'customer' | 'admin' = profileRole ?? 'customer'
      const authSession: AuthSession = {
        id: session.id || '',
        userId: session.user.id || '',
        role: userRole,
        email: session.user.email || undefined,
        phone: session.user.phone || undefined,
        isAdmin: userRole === 'admin',
      }
      setSession(authSession)
      setIsAdmin(authSession.isAdmin)

      const appUser: User = {
        id: session.user.id || '',
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
        email: session.user.email,
        phone: session.user.phone,
        role: authSession.role,
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
    if (error) throw new Error(error.message)
    if (!data.session || !data.user) throw new Error('No session returned')
    // Fetch authoritative role from profiles after login
    let authoritativeRole: 'customer' | 'admin' = 'customer'
    try {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      if (profile?.role === 'admin' || profile?.role === 'customer') authoritativeRole = profile.role
    } catch {
      // fallback to customer if profile not yet available
    }
    return {
      id: (data.session as any).id || '',
      userId: data.user.id || '',
      role: authoritativeRole,
      email: data.user.email,
      phone: data.user.phone,
      isAdmin: authoritativeRole === 'admin',
    }
  }, [])

  const register = useCallback(async (form: RegisterForm): Promise<AuthSession> => {
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          phone: form.phone,
          role: 'customer',
        },
      },
    })
    if (error) throw new Error(error.message)
    if (!data.session || !data.user) throw new Error('No session returned')
    return {
      id: (data.session as any).id || '',
      userId: data.user.id || '',
      role: 'customer',
      email: data.user.email,
      phone: form.phone,
      isAdmin: false,
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
      await handleSessionChange({ user: currentUser, session: null })
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
