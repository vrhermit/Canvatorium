const fs = require("fs");

module.exports = {
  devServer: {
    open: process.platform === "darwin",
    host: "0.0.0.0",
    port: 8080,

    hotOnly: false
  }
};
