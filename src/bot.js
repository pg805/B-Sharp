'use strict';

// library dependencies
const { logger } = require('./utility/logger.js'),
	Discord = require('discord.js'),
	musicCommands = require('./music/music.js'),
	settings = require('./utility/settings.js'),
	poll = require('./poll/pollManager.js'),
	{ DISCORDTOKEN } = require('../data/keys.json');
	// idMap = require('./utility/idMap.js');

let settingsObject = settings.updateSettings();

// server setup and auto pinger (every 5 minutes)

setInterval(() => {
	//
}, 2800000);

// channel id variables for ease of use
// const gameNightID = '593865324198363157';
// const eventsAndPollsID = '593809110236004353';
// slide into my DMs
// const pgdmID = '594244966113476629';
const gameNightRollID = '<@&701273992627093614>';
// const gavelEmote = '<:Gavel:602039132746809344>';
const sunEmote = '<:Sun:661243429648596992>';

// const fetch = require('node-fetch');

// client setup
const client = new Discord.Client(),
	forgoTurtID = '593804670313562112',
	botTestID = '594244452437065729';

let forgoTurts;
let botTest;

// logger.info(`load turts: ${forgoTurts.name}`);

// login bot
client.login(DISCORDTOKEN);

// login message
client.on('ready', () => {
	// poll.checkTime();
	poll.onLoad(client.channels);
	logger.info('Connected');
	logger.info('Logged in as: ');
	logger.info(`${client.user.username} - (${client.user.id})`);
	logger.info('Watching:');
	logger.info(`${client.guilds.cache.array().map(guild => `${guild.name} - (${guild.id})`).join(', ')}`);
	forgoTurts = client.guilds.cache.get(forgoTurtID);
	botTest = client.guilds.cache.get(botTestID);

	// for Josh Panel.
	console.log('Bot Started');
});

// logs client errors and warnings
// client.on('debug', m => logger.debug('debug', m));
client.on('warn', m => logger.warn('warn', m));
client.on('error', m => logger.error('error', m));

// exit message
process.on('exit', (code) => {
	poll.onOffload();
	logger.info(`About to exit with code: ${code}`);
});

// promise error
process.on('unhandledRejection', error => logger.error(`Uncaught Promise Rejection: ${error}`));

process.on('SIGTERM', () =>
	process.exit(0),
);

function restartBot(textChannel) {
	textChannel
		.send('restarting bot')
		.then(() => process.exit(0));
}

function checkChannels(message) {

	// if it's a dm channel it will never reach here, this is a reminder
	// TODO: add functionality for dm channels to run commands and stuff
	if(message.channel.type == 'dm') return;

	const channelsObject = {
		'voiceChannel': null,
		'textChannel': null,
		'guild': null,
	};

	channelsObject.guild = message.guild;

	if (!settingsObject.guilds[channelsObject.guild.id]) {
		settings.addGuild(channelsObject.guild.id);
		settingsObject = settings.updateSettings();
	}

	const guildObject = settingsObject.guilds[channelsObject.guild.id];

	channelsObject.botVoiceChannel = client.voice.connections.first.channel;

	if(message.channel.id == guildObject.textChannel || guildObject.textChannel == null) {
		channelsObject.textChannel = message.channel;
	}

	if(message.member.voice.channel && (message.member.voice.channel.id == guildObject.voiceChannel || guildObject.voiceChannel == null)) {
		channelsObject.voiceChannel = message.member.voice.channel;
	}

	return channelsObject;
}

function makeCommand(message) {
	const commandObject = {
		'name': null,
		'args': null,
	};

	// separate arguments and remove prefix
	commandObject.args = message.content.slice(settingsObject.prefix.length).split(/ +/);

	// get command name
	// NOTE: ALL COMMANDS MUST BE LOWERCASE IN CODE
	commandObject.name = commandObject.args.shift().toLowerCase();

	return commandObject;
}

client.on('message', message => {

	if (message.author.bot) return;

	// checks if someone said a dirty word
	if (message.content.toLowerCase().match(/\bbush\b/g)) {
		message.channel.send('NIIII https://tenor.com/view/monty-python-knights-who-say-ni-ni-gif-12279570');
	}

	if (message.content.toLowerCase().match(/\bnostalgi(a|c)\b/g)) {
		message.channel.send('Please don\'t be nostalgic.');
	}

	if (message.content.toLowerCase().match(/(\bbat(s)?\b)/g)) {
		message.channel.send('Why can\'t bees be bats?');
	}

	if (message.content.toLowerCase().match(/(\bwhat\stime(s)?\b)/g)) {
		message.channel.send('Game Nights are on Saturdays at 10:29p.m. Eastern.');
	}

	if (message.content.toLowerCase().match(/(\bshrug\b)/g)) {
		message.channel.send('¯\\_(ツ)_/¯');
	}

	// grab the voice and text channel if they are set for the guild.  Also grabs the guild object if the setting needs to be changed.
	const channelObject = checkChannels(message);

	// checks if a command is used or if bot sent message or if the message was sent in the set text chat
	if (!message.content.startsWith(settingsObject.prefix) || !channelObject.textChannel) return;

	const command = makeCommand(message);

	// check which command
	switch (command.name) {
		// kill switch
		case 'refresh':
			restartBot(channelObject.textChannel);
			break;

		// emote test command, please ignore
		case 'sun':
			channelObject.textChannel.send(sunEmote);
			break;

		case 'settings':
			switch(command.args.shift()) {
				case 'prefix':
					settings.updatePrefix(command.args, channelObject);
					break;

				case 'tc':
				case 'text':
					settings.updateTextChannel(command.args, channelObject);
					break;

				case 'vc':
				case 'voice':
					settings.updateVoiceChannel(command.args, channelObject);
					break;

				case 'volume':
					settings.updateVolume(command.args, channelObject);
					break;
			}
			settingsObject = settings.updateSettings();
			break;

		// poll start
		case 'testpoll':
			logger.info(`test initiated: poll ${settingsObject.pollID + 1}`);
			client.channels
				.fetch('706231027374489721')
				.then(channel => poll.testPoll(message.guild, '661235522034860033', channel, 'Test Poll', 'turtleville'));
			break;

		case 'callpoll':
			if(command.args.length != 2) {
				channelObject.textChannel.send('You need a channel, nerd: maybe 593865324198363157');
				return;
			}

			client.channels
				.fetch(command.args[1])
				.then(channel =>
					channelObject
						.textChannel
						.send(
							poll.callPoll(
								command.args[0], channel
							)));
			break;

		case 'resetpolls':
			poll.resetPolls();
			channelObject.textChannel.send('polls reset');
			break;

		case 'gamenighttest':
			channelObject.textChannel.send(`Staring Game Night Poll: ${settingsObject.pollID + 1}`);
			settingsObject = settings.updateSettings();
			client.channels
				.fetch('593809110236004353')
				.then(channel => poll.testPoll(forgoTurts, `${gameNightRollID.match(/[0-9]+/g)}`, channel, 'Weekly Game Night Poll', 'gameNightOptions'));
			break;

		case 'turtlepoll':
			channelObject.textChannel.send(
				`Starting poll :: **${settingsObject.pollID + 1}**` +
				`\nTitle = **${command.args[0].replace('_', ' ')}**` +
				`\nRoll = **${command.args[1]}**` +
				`\nChannel = **${command.args[2]}**` +
				`\nOptions = **${command.args[3]}**`);
			settingsObject = settings.updateSettings();
			client.channels
				.fetch(command.args[2])
				.then(channel => poll.testPoll(botTest, command.args[1], channel, command.args[0].replace('_', ' '), command.args[3]));
			break;

		case 'checktime':
			channelObject.textChannel.send('checking time');
			// poll.checkTime();
			break;

		case 'play':
			musicCommands.play(command.args, channelObject, settingsObject.volume);
			break;

		case 'stop':
			musicCommands.stop(channelObject);
			break;

		case 'queue':
			musicCommands.queue(command.args, channelObject.textChannel);
			break;

		case 'skip':
			musicCommands.skip(command.args, channelObject);
			break;

		case 'loop':
			musicCommands.loop(channelObject.textChannel);
			break;

		default:
			musicCommands.soundEffect(command.name, channelObject);
	}

});