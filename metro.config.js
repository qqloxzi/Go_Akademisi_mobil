const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

// SGF ders dosyaları raw asset olarak yüklenir (bkz. src/data/sgfLoader.ts).
if (!config.resolver.assetExts.includes('sgf')) {
  config.resolver.assetExts.push('sgf')
}

module.exports = withNativeWind(config, { input: './src/global.css' })
