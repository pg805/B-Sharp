'use strict';

const { createPoll, reactivatePoll } = require('./Poll.js'),
	{ IdMap } = require('../utility/IdMap.js'),
	{ logger } = require('../utility/logger.js'),
	{ toString } = require('../utility/prettify.js'),
	polls = require('../../data/polls/activePolls.json'),
	fs = require('fs'),
	date = new Date(),
	options = require('../../data/polls/pollOptions.json');

let activePolls = IdMap.emptyMap(),
	completePolls = IdMap.fromObject(require('../../data/polls/completePolls.json'));

function getRoleMembers(guild, roleID) {
	return guild.roles
		.fetch(roleID)
		.then(role => role.members
			.array())
		.catch(error => `Role Error: ${error}`);
}

function testPoll(guild, roleId, solicitorChannel, title, pollOptions) {
	logger.debug('beginning test');
	const newPoll = createPoll(title);
	logger.debug(`create poll: ${newPoll.toString()}`);
	logger.debug(`pollOptions: ${pollOptions}`);
	logger.debug(`options: ${toString(options[pollOptions])}`);
	getRoleMembers(guild, roleId)
		.then(members => {
			logger.debug(`members: ${members}`);
			newPoll.activatePoll(members, options[pollOptions], solicitorChannel);
			logger.debug(`active poll: ${newPoll.toString()}`);
		});
	activePolls = activePolls.set(newPoll.id, newPoll);
}

function callPoll(pollID, channel = null) {
	if(!activePolls.has(pollID)) return `${pollID} not active`;

	if (channel) {
		completePolls.set(pollID, activePolls.get(pollID).callPoll(channel));
	} else {
		completePolls.set(pollID, activePolls.get(pollID).callPoll());
	}

	activePolls = activePolls.remove(pollID);
	return `called poll ${pollID}`;
}

function onLoad(channelManager) {
	logger.info('Loading Polls:');
	activePolls = IdMap
		.fromObject(polls)
		.map((pollID, poll) => reactivatePoll(poll, channelManager));
}

function checkTime() {
	logger.debug(`date: ${date.toISOString()}`);
}

function onOffload() {
	logger.info('Off Loading Polls:');
	logger.info(`off load polls: ${toString(activePolls.toObject())}`);
	fs.writeFileSync(
		'./data/polls/activePolls.json',
		toString(
			activePolls
				.map((pollID, poll) =>
					poll
						.deactivatePoll())
				.toObject()),
		(error) => logger.error(`File Write Error: ${error}`));
	fs.writeFileSync(
		'./data/polls/completePolls.json',
		toString(completePolls.toObject()),
		(error) => logger.error(`File Write Error: ${error}`));

	return;
}

function resetPolls() {
	activePolls = IdMap.emptyMap();
	completePolls = IdMap.emptyMap();
}

exports.testPoll = testPoll;
exports.onLoad = onLoad;
exports.onOffload = onOffload;
exports.resetPolls = resetPolls;
exports.callPoll = callPoll;
exports.checkTime = checkTime;