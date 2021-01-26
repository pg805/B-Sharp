import { restartBot } from '../../bot';
const sunEmote = '<:Sun:661243429648596992>';

function runCommand(commandMessage:any, channelID:number, discordManager:any) {
	switch(commandMessage.name) {
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