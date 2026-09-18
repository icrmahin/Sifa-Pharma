import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

// SSR/static-rendering (expo export, node) has no window — AsyncStorage will throw "window is not defined".
// On web, let Supabase use its default (localStorage) via undefined. On native, use AsyncStorage.
const isWeb = Platform.OS === 'web'
const isSSR = typeof window === 'undefined'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(isWeb || isSSR ? {} : { storage: AsyncStorage }),
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})