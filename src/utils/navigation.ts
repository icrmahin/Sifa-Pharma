import { router } from 'expo-router'

export function goBack(fallback: string = '/(auth)/welcome'): void {
  if (router.canGoBack()) {
    router.back()
  } else {
    router.replace(fallback as any)
  }
}

export function goBackToTabs(): void {
  goBack('/(customer)/(tabs)')
}
