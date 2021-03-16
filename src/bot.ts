'use strict';
import DiscordManager from './utility/discord/DiscordManager';

// library dependencies
import logger from './utility/logger.js';

// const discordManager = require('./utility/discord/DiscordManager.ts');
// const logger = require('./utility/logger.ts');

// exit message
process.on('exit', (code) => {
    logger.info(`About to exit with code: ${code}`);
});

// promise error
process.on('unhandledRejection', (error) => logger.error(`Uncaught Promise Rejection: ${error}`));

// exit
process.on('SIGTERM', () =>
    process.exit(0),
);

DiscordManager.initialize();
