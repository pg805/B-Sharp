const fs = require('fs'),
	{ logger } = require('./logger.js'),
	settingsObject = require('../../data/settings.json');

/*
Reserved Characters:
Discord Names: @
Discord Channels: #
*/
const illegalPrefix = ['@', '#'];

/*
Reset Constant Array
*/
const resetArray = ['reset', 'none', 'null'];

function updateSetting(setting, newVal) {
	settingsObject[setting] = newVal;
	refreshSettings();
}

function updateGuildSetting(guildID, setting, newVal) {
	settingsObject.guilds[guildID][setting] = newVal;
	refreshSettings();
}

function addGuild(guildID) {
	settingsObject.guilds[guildID] = {
		'textChannel': null,
		'voiceChannel': null,
	};

	refreshSettings();
}

function updateSettings() {
	return JSON.parse(fs.readFileSync('./data/settings.json', (error) => logger.error('File Read Error:' + error)));
}

/*
  Refreshes the settings file
*/
function refreshSettings() {
	fs.writeFileSync('./data/settings.json', JSON.stringify(settingsObject, null, 4), (error) => logger.error(`File Write Error: ${error}`));
	return;
}

function updatePrefix(newVal, channelObject) {
	// checks if there are arguments
	if (newVal.length) {
		// checks if the new prefix is illegal
		if (!illegalPrefix.includes(newVal[0])) {
			// updates prefix and settings
			updateSetting('prefix', newVal[0]);
			channelObject.textChannel.send(`Prefix has been updated to \`${newVal[0]}\`.`);
		} else {
			channelObject.textChannel.send(`\`${newVal[0]}\` is a reserved character.`);
		}
	} else {
		channelObject.textChannel.send('Updating prefix requires and argument.');
	}
}

function updateTextChannel(newVal, channelObject) {

	if (newVal.length) {
		// grabs the text channel from the channelObject
		const newTextChannel = channelObject.guild.channels.cache.find(
			channel => channel.type == 'text' && (channel.id == /[0-9]+/g.exec(newVal[0]) || channel.name == newVal[0]));

		if(newTextChannel) {
			updateGuildSetting(channelObject.guild.id, 'textChannel', newTextChannel.id);
			channelObject.textChannel.send(`Text channel for ${channelObject.guild.name} has been updated to <#${newTextChannel.id}>.`);
		} else if (resetArray.includes(newVal[0])) {
			updateGuildSetting(channelObject.guild.id, 'textChannel', null);
			channelObject.textChannel.send(`Text channel for ${channelObject.guild.name} has been reset.`);
		}else {
			// more info?  format?
			channelObject.textChannel.send('Please input a valid text channel as an argument.');
		}
	} else {
		channelObject.textChannel.send('Changing the text channel requires a valid text channel argument.');
	}
}

function updateVoiceChannel(newVal, channelObject) {

	if (newVal.length) {
		// grabs the text channel from the channelObject
		const newVoiceChannel = channelObject.guild.channels.cache.find(
			channel => channel.type == 'voice' && (channel.id == /[0-9]+/g.exec(newVal[0]) || channel.name == newVal[0]));

		if(newVoiceChannel) {
			updateGuildSetting(channelObject.guild.id, 'voiceChannel', newVoiceChannel.id);
			channelObject.textChannel.send(`Text channel for ${channelObject.guild.name} has been updated to <#${newVoiceChannel.id}>.`);
		} else if (resetArray.includes(newVal[0])) {
			updateGuildSetting(channelObject.guild.id, 'voiceChannel', null);
			channelObject.textChannel.send(`Voice channel for ${channelObject.guild.name} has been reset.`);
		}else {
			// more info?  format?
			channelObject.textChannel.send('Please input a valid voice channel as an argument.');
		}
	} else {
		channelObject.textChannel.send('Changing the voice channel requires a valid voice channel argument.');
	}
}

function updateVolume(newVal, channelObject) {
	if (/(1?[0-9]{1,2}|full|zero)/g.test(newVal[0])) {
		let newVolume = newVal[0].match(/(1?[0-9]{1,2}|full|zero)/g)[0];

		if (newVolume == 'full') {
			newVolume = 1;
		} else if (newVolume == 'zero') {
			newVolume = 0;
		} else {
			newVolume = parseInt(newVolume) / 100;
		}

		// updates volume and settings
		updateSetting('volume', newVolume);

		channelObject.textChannel.send(`Volume updated to ${newVolume * 100}/100.`);
	} else {
		channelObject.textChannel.send('Please enter a number "full" or "zero."');
	}
}

function updatePollID() {
	updateSetting('pollID', settingsObject.pollID + 1);
	refreshSettings();
	return;
}

exports.updatePollID = updatePollID;
exports.updateSettings = updateSettings;
exports.updatePrefix = updatePrefix;
exports.updateTextChannel = updateTextChannel;
exports.updateVoiceChannel = updateVoiceChannel;
exports.updateVolume = updateVolume;
exports.addGuild = addGuild;