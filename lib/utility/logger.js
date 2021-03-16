'use strict';
exports.__esModule = true;
var winston_1 = require("winston");
// talk to iggy about this import statement
require("../../data/settings.jsonc");
var editSettings_1 = require("../editSettings");
// logger formating
// eslint-disable-next-line max-len
var loggerFormat = winston_1.format.printf(function (log) { return "[" + log.timestamp + " : " + log.level + "] - " + log.message; });
// create logger
var logger = winston_1.createLogger({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }), winston_1.format.errors({ stack: true }), winston_1.format.splat(), loggerFormat),
    defaultMeta: { service: 'Epictetus' },
    transports: [
        // Write to all logs with level `info` and below to `epictetus-combined.log`.
        // Write all logs error (and below) to `epictetus-error.log`.
        new winston_1.transports.File({
            filename: './data/logs/epictetus-error.log',
            level: 'error'
        }),
        new winston_1.transports.File({
            filename: './data/logs/epictetus-combined.log'
        }),
        terminalConsole(),
    ]
});
/**
 * allows the bot to send messages to a console
 * @return {Console} console object to send logging statements to
 */
function terminalConsole() {
    if (process.env.NODE_ENV !== 'production') {
        return new winston_1.transports.Console({
            format: winston_1.format.combine(winston_1.format.colorize(), loggerFormat),
            level: editSettings_1.getBotSettings().debug ? 'debug' : 'info'
        });
    }
}
exports["default"] = logger;
