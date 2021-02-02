'use strict';
import { Snowflake } from 'discord.js';
import { DiscordManager } from './utility/discord/DiscordManager.js';
/*

*/

// library dependencies
import { logger } from './utility/logger.js';

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

/**
 * asdf
 * @param {Snowflake} channelID asdf
 * @param {DiscordManager} discordManager asdf
 */
export function restartBot(channelID:Snowflake, discordManager:DiscordManager):void {
    // todo add my id here
    // channel instead of user id
    discordManager.sendMessage(channelID, 'restarting bot.')
        .then(() => process.exit(0));
}
