'use strict';

// library dependencies
const http = require('http'),
	express = require('express'),
	app = express(),
	{ logger } = require('./utility/logger.js'),
	Discord = require('discord.js'),
	musicCommands = require('./music/music.js'),
	settings = require('./utility/settings.js'),
	poll = require('./poll/pollManager.js');
	// idMap = require('./utility/idMap.js');

let settingsObject = settings.updateSettings();

// server setup and auto pinger (every 5 minutes)
app.get('/', (request, response) => {
	logger.info('Ping Recieved');
	logger.info(`Total Uptime: ${Math.floor(process.uptime())} seconds.`);
	// try to log in if it's not for no reason

	if (!isLoggedIn) {
		client.login(process.env.TOKEN);
	}
	response.sendStatus(200);
});
const listener = app.listen(process.env.PORT, function() {
	logger.info(`Your app is listening on port ${listener.address().port}`);
});
setInterval(() => {
	http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 2800000);

// channel id variables for ease of use
// const gameNightID = '593865324198363157';
// const eventsAndPollsID = '593809110236004353';
// slide into my DMs
// const pgdmID = '594244966113476629';
const gameNightRollID = '<@&701273992627093614>';
// const gavelEmote = '<:Gavel:602039132746809344>';
const sunEmote = '<:Sun:661243429648596992>';


// Global Variable to check if the bot is logged in
let isLoggedIn = false;

// const fetch = require('node-fetch');

// client setup
const client = new Discord.Client(),
	forgoTurtID = '593804670313562112';

let forgoTurts;

// logger.info(`load turts: ${forgoTurts.name}`);

// login bot
client.login(process.env.TOKEN);

// login message
client.on('ready', () => {
	// poll.checkTime();
	poll.onLoad(client.channels);
	logger.info('Connected');
	logger.info('Logged in as: ');
	logger.info(`${client.user.username} - (${client.user.id})`);
	logger.info('Watching:');
	logger.info(`${client.guilds.cache.array().map(guild => `${guild.name} - (${guild.id})`).join(', ')}`);
	isLoggedIn = true;
	forgoTurts = client.guilds.cache.get(forgoTurtID);
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
	textChannel.send('restarting bot');
	process.exit(0);
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
		message.channel.send('10:29p.m. Eastern.');
	}

	// grab the voice and text channel if they are set for the guild.  Also grabs the guild object if the setting needs to be changed.
	const channelObject = checkChannels(message);

	// checks if a command is used or if bot sent message or if the message was sent in the set text chat
	if (!message.content.startsWith(settingsObject.prefix) || !channelObject.textChannel) return;

	const command = makeCommand(message);

	// check which command
	switch (command.name) {
		case 'refresh':
			restartBot();
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
				.then(channel => poll.testPoll(message.guild, '661235522034860033', channel));
			break;

		case 'callpoll':
			poll.callPoll(command.args[0], channelObject.textChannel);
			break;

		case 'resetpolls':
			poll.resetPolls();
			channelObject.textChannel.send('polls reset');
			break;

		case 'gamenighttest':
			channelObject.textChannel.send(`Staring Game Night Poll: ${settingsObject.pollID + 1}`);
			client.channels
				.fetch('593809110236004353')
				.then(channel => poll.testPoll(forgoTurts, `${gameNightRollID.match(/[0-9]+/g)}`, channel));
			break;

		case 'callgamenight':
			client.channels
				.fetch('593865324198363157')
				.then(channel => {
					poll.callPoll(command.args[0], channel);
					return;
				});
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