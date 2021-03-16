'use strict';
exports.__esModule = true;
var DiscordManager_1 = require("./utility/discord/DiscordManager");
// library dependencies
var logger_js_1 = require("./utility/logger.js");
// const discordManager = require('./utility/discord/DiscordManager.ts');
// const logger = require('./utility/logger.ts');
// exit message
process.on('exit', function (code) {
    logger_js_1["default"].info("About to exit with code: " + code);
});
// promise error
process.on('unhandledRejection', function (error) { return logger_js_1["default"].error("Uncaught Promise Rejection: " + error); });
// exit
process.on('SIGTERM', function () {
    return process.exit(0);
});
DiscordManager_1["default"].initialize();
