'use strict';
/*

*/

// library dependencies
import { logger } from './utility/logger.js';
import settings from './settings';
import discordManager from './utility/discord/DiscordManager';

// exit message
process.on('exit', (code) => {
    logger.info(`About to exit with code: ${code}`);
});

// promise error
process.on('unhandledRejection', error => logger.error(`Uncaught Promise Rejection: ${error}`));

// exit
process.on('SIGTERM', () =>
    process.exit(0),
);

export function restartBot(channelID, discordManager) {
    // todo add my id here
    // channel instead of user id
    discordManager.sendMessage(channelID , 'restarting bot.')
        .then(() => process.exit(0));
}
