/*

*/
import Guild from '../../models/guild.js';
import { logger } from '../logger.js';

const commandFile: Guild[] = require('../../../data/commands.jsonc');

function makeCommand(message) {
    const commandObject = {
        'name': null,
        'args': null,
    };

    // separate arguments and remove prefix
    commandObject.args = message.content.slice(settings.prefix.length).split(/ +/);

    // get command name
    // NOTE: ALL COMMANDS MUST BE LOWERCASE IN CODE
    commandObject.name = commandObject.args.shift().toLowerCase();

    return commandObject;
}

function listen(message: any, discordManager:any) {
	let dmFlag = true;

	commandFile.forEach((guild) => {
		if (message.guild.id == guild.id) {
			dmFlag = false;

			guild.autoReplies.forEach((autoReply) => {
				if(message.content.toLowerCase().match(autoReply.pattern)) {
					discordManager.sendMessage(message.channel.id, autoReply.response);
				}
			});

			guild.channels.forEach((channel) => {
				if (message.channel.id == channel.id) {
					channel.autoReplies.forEach((autoReply) => {
						if(message.content.toLowerCase().match(autoReply.pattern)) {
							discordManager.sendMessage(message.channel.id, autoReply.response);
						}
					});

					if(message.content.startsWith(settings.prefix)) {
						channel.commands.forEach((command) => {
							const commandMessage = makeCommand(message.content);

							if(commandMessage.name == command){
								
							}
						});
					}
				}
			});
		}
	});

	if (dmFlag) {

	}
}
