'use strict';

const { createLogger, format, transports } = require('winston'),
	settings = require('../../data/settings.json');

// logger formating
const loggerFormat = format.printf(log => `[${log.timestamp} : ${log.level}] - ${log.message}`);

// create logger
const logger = createLogger({
	level: 'info',
	format: format.combine(
		format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss',
		}),
		format.errors({ stack: true }),
		format.splat(),
		loggerFormat,
	),
	defaultMeta: { service: 'Epictetus' },
	transports: [
		// Write to all logs with level `info` and below to `epictetus-combined.log`.
		// Write all logs error (and below) to `epictetus-error.log`.
		new transports.File({ filename: './data/logs/epictetus-error.log', level: 'error' }),
		new transports.File({ filename: './data/logs/epictetus-combined.log' }),
		console(),
	],
});

// adds a console logger
function console() {
	if (process.env.NODE_ENV !== 'production') {
		return new transports.Console({
			format: format.combine(
				format.colorize(),
				loggerFormat,
			),
			level: settings.debug ? 'debug' : 'info'
		});
	}
}

exports.logger = logger;