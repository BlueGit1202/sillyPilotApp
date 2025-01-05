const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add socket.io-client to the list of extra node modules
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'engine.io-client': require.resolve('engine.io-client'),
  'debug': require.resolve('debug'),
};

// Add socket.io-client to the list of sourceExts
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

// Configure network inspector to show more details
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Log request details
      console.log(`[Metro] ${req.method} ${req.url}`);
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
