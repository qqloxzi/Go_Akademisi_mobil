/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // NativeWind v4 dark mode — useColorScheme() ile kontrol edilir (bkz. SettingsContext).
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#1E3A5F',
        'accent-blue': '#2E9FE0',
        'ice-white': '#F5F5F5',
        ink: '#1A1A1A',
        silver: '#D7DADD',
        'silver-dark': '#242629',
        streak: '#E8752B',
        token: '#D9A83B',
        heart: '#D6564F',
        success: '#4C9A6A',
        // Koyu mod yüzey renkleri
        'dark-bg': '#0f172a',
        'dark-surface': '#1e293b',
        'dark-card': '#1e293b',
        'dark-border': '#334155',
        'dark-muted': '#94a3b8',
      },
      borderRadius: {
        '4xl': 32,
        '5xl': 40,
      },
      fontFamily: {
        sans: ['PlusJakartaSans-Regular'],
        medium: ['PlusJakartaSans-Medium'],
        semibold: ['PlusJakartaSans-SemiBold'],
        bold: ['PlusJakartaSans-Bold'],
        extrabold: ['PlusJakartaSans-ExtraBold'],
        // Web'deki "font-drama" — italik serif vurgu (bkz. index.css .font-drama)
        display: ['CormorantGaramond-SemiBoldItalic'],
        // Web'deki "font-data" — XP/kyu/rakam gösterimi (bkz. index.css .font-data)
        mono: ['IBMPlexMono-Medium'],
        'mono-semibold': ['IBMPlexMono-SemiBold'],
      },
      boxShadow: {
        card: '0 8px 30px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
