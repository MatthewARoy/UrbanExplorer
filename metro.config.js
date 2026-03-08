const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /src\/__tests__\/.*/,
  /src\/__mocks__\/.*/,
  /jest\.config\.js/,
];

// Replace import.meta.env references that Zustand devtools uses,
// which are not supported by Metro's web bundler.
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    ...config.transformer?.minifierConfig,
  },
};

module.exports = config;
