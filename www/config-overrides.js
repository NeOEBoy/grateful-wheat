const CopyPlugin = require("copy-webpack-plugin");

/* config-overrides.js */
module.exports = function override(config, env) {
    //do stuff with the webpack config...
    var copy = new CopyPlugin({
        patterns: [
          { from: "image", to: "image" },
        ],
      });

    config.plugins.push(copy);
    return config;
}
