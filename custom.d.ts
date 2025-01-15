/// <reference types="vite/client" />

declare const CONFIG: {
  appName: string
  appNameCapitalized: string
  appTitle: string
  hostname: string
  nip05Domain: string
  icon: string
  navLogo: string
  defaultTheme: string
  defaultNotesTheme: string
  navItems: string[]
  rightColumnFilters: boolean
  aboutText: string
  repository: string
  features: {
    git: boolean
    cashu: boolean
    pushNotifications: boolean
    analytics: boolean
  }
  defaultSettings: {
    youtubePrivacyMode: boolean
    notificationServer: string
  }
}
