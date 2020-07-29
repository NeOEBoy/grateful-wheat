// pm2.config.js
module.exports = {
  apps: [{
    name: "grateful-wheat-api-production",
    script: "./bin/www",
    env: {
      "NODE_ENV": "production",
      "PORT": "9000"
    }
  }]
}