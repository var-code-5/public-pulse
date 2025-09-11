const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

// SVG Support
const { transformer, resolver } = getDefaultConfig(__dirname);

const config = getDefaultConfig(__dirname);
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...resolver.sourceExts, "svg"],
};
 
module.exports = withNativeWind(config, { input: './global.css' });