import { DiscordManager } from './DiscordManager';
import { restartBot } from '../../bot';
import { Snowflake } from 'discord.js';
import Instruction from '../../models/instruction';
const sunEmote = '<:Sun:661243429648596992>';

/**
 * Routs the command and arguments to the correct location to run a commands
 * @param {Instruction} commandMessage The instruction for the bot to run a command.
 * @param {Snowflake} channelID The unique identifier of the channel.
 * @param {DiscordManager} discordManager The Discord Manager that will communicate with Discord.
 */
function runCommand(
    commandMessage:Instruction,
    channelID:Snowflake,
    discordManager:DiscordManager
) {
    switch (commandMessage.name) {
        case 'settings':
            // send commandMessage to settings.ts
            break;

        case 'music':
            // send commandMessage to music.ts
            break;

        case 'poll':
            // send commandMessage to pollManager.ts
            break;

        case 'emote':
            // send command
            discordManager.sendMessage(channelID, sunEmote);
            break;

        case 'refresh':
            // send command
            restartBot(channelID, discordManager);
            break;
    }
}
