'use strict';

// load libraries and other files
const fs = require('fs'),
	Discord = require('discord.js'),
	{ logger } = require('./logger.js'),
	settings = require('./settings.js'),
	activePolls = require('./data/activePolls.json'),
	pollOptions = require('./data/pollOptions.json'),
	completePolls = require('./data/completePolls.json');

// load settings object
let settingsObject = settings.updateSettings();

/**
 * runs whenever the bot loads reactivating active polls.
 * channelManager :: A discord client channel manager object
 */
function onLoad(channelManager) {
	// info message to keep the user up to date
	logger.info('Loading Polls:');

	// functional programming!!!
	activePolls.polls
		// reactivate the active polls
		.map(poll => {

			// read collector to one time poll message
			channelManager.fetch(poll.oneTimeMessage.channelID)
				.then(channel => {
					// logger.info(`channel id: ${channel.id}`);
					channel.messages.fetch(poll.oneTimeMessage.id)
						.then(m => {
							poll.oneTimeMessage = m;
							oneTimeReactionCollector(poll, m, createMessage(poll.options, poll.title));
						});
				});

			// check which users have or haven't voted
			poll.users.userCache
				.filter(user => {
					// logger.info(`filter user: ${user.displayName}`);
					// logger.info(`filter user id: ${user.userID}`);
					// logger.info(`has not voted: ${!poll.users.votes.userVotes[user.userID]}`);
					return !poll.users.votes.userVotes[user.userID];
				})
				.map(user => {
					// logger.info(`user id: ${user.userID}`);
					// logger.info(`user display name: ${user.displayName}`);
					// logger.info(`user vote: ${poll.users.votes.userVotes[user.userID]}`);
					// logger.info(`user message object: ${JSON.stringify(poll.users.messages[user.userID])}`);
					if (!poll.users.messages[user.userID]) {
						logger.info(`Bad User: ${user.displayName}`);
						logger.info(`user message object: ${JSON.stringify(poll.users.messages[user.userID], null, 4)}`);
						return;
					}
					channelManager.fetch(poll.users.messages[user.userID].channel.id)
						// grab the previous message from the dm channel
						.then(channel => {
							// logger.info(`channel: ${channel}`);
							if(channel) {
								// logger.info(`channel id: ${channel.id}`);
								poll.users.messages[user.userID].channel = channel;
								channel.messages
									.fetch(poll.users.messages[user.userID].message.id)
									// reactivate the collector
									.then(message => {
										poll.users.messages[user.userID].message = message;
										return addCollector(poll, message);
									})
									.catch(error => logger.error(`Message Load Error: ${error}`));
							}
						})
						.catch(error => logger.error(`Channel Load Error: ${error}`));
				});
		});
}

// run when the bot is about to turn off
function onOffload() {
	logger.info('off loading polls:');
	fs.writeFileSync('./data/activePolls.json', JSON.stringify(activePolls, null, 4), (error) => logger.error(`File Write Error: ${error}`));
	return;
}

// creates the poll options from a list of strings
function createMessage(options, title) {
	const embed = new Discord.MessageEmbed()
		.setColor('4DCC22')
		.setTitle(`${title}`);
	const description = [];
	options
		.map(option => {
			description.push(`${option.emote} = ${option.optionName}`);
		});
	embed.setDescription(description.join('\n\n'));
	return embed;
}

/**
 * gets all members of a certain guild with a certain role
 * guild :: a discord guild object
 * roleID :: a string representing a discord snowflake for a specific role
 */
function getRoleMembers(guild, roleID) {
	return guild.roles
		.fetch(roleID)
		.then(role => role.members
			.array())
		.catch(error => `Role Error: ${error}`);
}

/**
 * Runs whenever a user reacts to a message on an active poll.  Updates votes and message embed
 * poll :: poll object defined in this document
 * reaction :: a discord message reaction
 * user :: a discord user
 */
function handleReactions(poll, reaction, user) {
	// grabs the game name from the options based on which emote the user reacted with
	const gameVote = poll.options
		.filter(option => `${option.emote.match(/[0-9]+/g)}` == reaction.emoji.id)
		.shift().optionName;

	// recreates the embed object to show what the user voted for
	const embed = new Discord.MessageEmbed(poll.users.messages[user.id].embed)
		.setDescription(`${poll.users.messages[user.id].embed.description}\n\n=====================`)
		.addField('You Voted For', `${reaction.emoji} **${gameVote}**! ${reaction.emoji}`);

	// grabs the old message
	const message = poll.users.messages[user.id].message;

	// updates votes to show what the user voted for
	poll.users.votes.userVotes[user.id] = reaction.emoji.identifier;
	poll.users.votes.totalVotes[reaction.emoji.id] += 1;

	// send the new message and save it in the poll
	message.channel.send(embed)
		.then(newMessage => poll.users.messages[user.id].message = newMessage);

	// delete the old message
	message.delete();

	// store the new embed JSON
	poll.users.messages[user.id].embed = embed.toJSON();
	return;
}

/**
 * adds a discord collector to a poll message
 * poll :: a poll object defined in this document
 * message :: a discord message object
 */
function addCollector(poll, message) {
	const collector = message.createReactionCollector((reaction, user) => !user.bot, { max: 1, time: 864000000, errors: ['time'] });
	collector.on('collect', (reaction, user) => handleReactions(poll, reaction, user));
	collector.on('end', (collected, reason) => logger.info(`Collected ${collected.size} items.  Ended because ${reason}.`));
}

/**
 * Adds emote reactions to a poll message for each option in a poll
 * options :: an array of option objects
 * message :: a discord message object
 */
function addReactions(options, message) {
	options.forEach(option => {
		message
			.react(`${option.emote.match(/[0-9]+/g)}`)
			.catch(error => logger.error(`Reaction Error: ${error}`));
	});
	return;
}

function sendDM(user, poll, embed) {
	user.createDM()
		.then(channel => channel
			.send(embed)
			.then(message => {
				if (!message) { return false; }
				poll.users.messages[user.id] = {
					'username': user.username,
					'message': message,
					'embed': embed.toJSON(),
					'channel': channel,
				};
				poll.users.votes.userVotes[user.id] = null;
				addReactions(poll.options, message);
				addCollector(poll, message);
				return true;
				// logger.info(`message${i}:${message}`);
			})
			.catch(error => logger.error(`message send error: ${error}`)))
		.catch(error => logger.error(`DM channel error: ${error}`));
}


// sends dm to users
function sendDMs(poll, embed) {
	// logger.info(`users: ${poll.users.userCache}`);
	for (let i = 0; i < poll.users.userCache.length; i++) {
		// logger.info(`dm channel: ${poll.users.userCache[i].dmChannel}`);
		sendDM(poll.users.userCache[i], poll, embed);
	}
	return;
}


function addUserToPoll(poll, user, embed) {
	// logger.info(`userCache: ${JSON.stringify(poll.users.userCache)}`);
	// add to poll users if the message was properly sent
	if (sendDM(user, poll, embed)) { poll.users.userCache.push(user); }
}

function handleOneTimeReactions(poll, reaction, user, embed) {
	// logger.info(`userID of reaction: ${user.userID} == ${user.id}`);
	if (poll.users.userCache.find(u => u.userID === user.userID || u.userID === user.id)) { return; }
	// grab user as guild member to save user in same format
	// logger.info(`userID of reaction2: ${user.userID} == ${user.id}`);
	reaction.message.guild.members.fetch(user.id)
		.then(u =>
			addUserToPoll(poll, u, embed),
		);
}

function oneTimeReactionCollector(poll, message, embed) {
	// logger.info('one time collector: added');
	const collector = message.createReactionCollector((reaction, user) => !user.bot && reaction.emoji.name == '✅', { time: 864000000, errors: ['time'] });
	collector.on('collect', (reaction, user) => handleOneTimeReactions(poll, reaction, user, embed));
	collector.on('end', (collected, reason) => logger.info(`Collected ${collected.size} items.  Ended because ${reason}.`));
}

function sendOneTimePollMessage(poll, channel, embed) {
	channel.send('', { embed: { title: poll.title, description: 'React to this message with :white_check_mark: to recieve this week\'s Game Night poll **if you don\'t have the Poll role**.', color: '4DCC22' } })
		.then(m => {
			m.react('✅');
			poll.oneTimeMessage = m;
			oneTimeReactionCollector(poll, m, embed);
		});
}


/*
	A poll is an ID, a title, a set of votes, a list of options, and a list of messages

	A poll's id is an integer, each new poll has it's id incremented from the previous poll
	A poll's title is a string
	A set of votes is an object where a username is the key and an emote is the value
	A list of options is a list of emote representing the possible choices for the poll
	A list of messages is the messages sent out with the poll

	This function returns a poll given a list of options
*/
function createPoll(users, options, title) {
	settings.updatePollID();
	settingsObject = settings.updateSettings();

	const totalVotesObject = {};

	options.forEach(option => totalVotesObject[option.emote.match(/[0-9]+/g)] = 0);

	return {
		'id': settingsObject.pollID,
		'title': title,
		'options': options,
		'users': {
			'userCache': users,
			'messages': {},
			'votes': {
				'userVotes': {},
				'totalVotes': totalVotesObject,
			},
		},
	};
}

function savePolls() {
	fs.writeFile('.data/activePolls.json', JSON.stringify(activePolls, null, 4), (error) => logger.error(error));
}

// function createOption(optionName, emote) {
// 	return {
// 		'optionName': optionName,
// 		'emote': emote,
// 	};
// }

// function gameNightPoll(){

// };

function testPoll(guild, roleID, oneTimeChannelID, title) {
	getRoleMembers(guild, roleID)
		.then(role => {
			// logger.info(`Role Members: ${JSON.stringify(role)}`);
			pollMaster(
				role,
				pollOptions.gameNightOptions,
				title,
				guild.channels.cache.get(oneTimeChannelID),
			);
		},
		);
}


function calculateVotes(votes) {
	let winners = [];
	let winnerVotes = 0;

	// logger.info(`votes: ${JSON.stringify(votes)}`);

	Object.keys(votes.totalVotes)
		.forEach(key => {
			// logger.info(`key: ${key}`);
			// logger.info(`winners: ${JSON.stringify(winners)}`);
			// logger.info(`totalVotes: ${votes.totalVotes[key]}`);
			// logger.info(`winner votes: ${winnerVotes}`);
			if (votes.totalVotes[key] > winnerVotes) {
				winners = [];
				winners.push(key);
				winnerVotes = votes.totalVotes[key];
			} else if (votes.totalVotes[key] == winnerVotes) {
				winners.push(key);
			}
		});

	// logger.info(`winners: ${winners}`);
	return winners;
}

function callPoll(pollID, textChannel, gavel) {

	const finishedPoll = activePolls.polls.filter(poll => poll.id == pollID).shift();

	if(!finishedPoll) return textChannel.send('poll does not exist!');

	finishedPoll.oneTimeMessage.delete();

	const winners = calculateVotes(finishedPoll.users.votes);

	// logger.info(`winners: ${JSON.stringify(winners)}`);

	const winnerObject = finishedPoll.options.filter(option => option.emote.match(/[0-9]+/g) == winners[0]).shift();

	// logger.info(`winner object: ${JSON.stringify(winnerObject)}`);

	const winnerEmbed = new Discord.MessageEmbed()
		.setColor('4DCC22')
		.setTitle(`${finishedPoll.title}`);

	let message = `${gavel} The winner is ${winnerObject.emote} **${winnerObject.optionName}**! ${winnerObject.emote}\n\nTotal Votes:\n`;

	finishedPoll.options
		.forEach(option =>
			message += `\n ${option.emote} = ${finishedPoll.users.votes.totalVotes[option.emote.match(/[0-9]+/g)]}`
		);

	winnerEmbed.setDescription(message);

	textChannel.send(winnerEmbed);

	completePolls.polls.push(finishedPoll);
	activePolls.polls = activePolls.polls.filter(poll => poll.id != pollID);
	fs.writeFileSync('./data/completePolls.json', JSON.stringify(completePolls, null, 4), (error) => logger.error(`File Write Error: ${error}`));
}

function pollMaster(users, options, title, oneTimeChannel) {
	const poll = createPoll(users, options, title);

	const embed = createMessage(poll.options, poll.title);

	// logger.info(`poll: ${JSON.stringify(poll)}`);
	sendDMs(poll, embed);
	// logger.info(`messages: ${JSON.stringify(poll.users.messages)}`);
	sendOneTimePollMessage(poll, oneTimeChannel, embed);
	activePolls.polls.push(poll);
	// logger.info(`Active Poll: ${JSON.stringify(activePolls)}`);
}

function resetPolls() {
	activePolls.polls = [];
	completePolls.polls = [];
}

function fudge() {
	const poll = activePolls.polls[0];

	logger.info(`poll: ${JSON.stringify[poll]}`);

	poll.users.votes.totalVotes['601258625876361227'] = 5;
	poll.users.votes.totalVotes['601258627596025887'] = 6;
	poll.users.votes.totalVotes['601258626115567616'] = 0;
	poll.users.votes.totalVotes['602049090334752768'] = 4;
	poll.users.votes.totalVotes['654903183432482827'] = 3;
	poll.users.votes.totalVotes['625834392379457556'] = 1;
	poll.users.votes.totalVotes['614700732859285545'] = 1;
}

exports.savePoll = savePolls;
exports.pollMaster = pollMaster;
exports.testPoll = testPoll;
exports.onLoad = onLoad;
exports.onOffload = onOffload;
exports.callPoll = callPoll;
exports.resetPolls = resetPolls;
exports.fudge = fudge;