'use strict';

const { createPoll, reactivatePoll } = require('./Poll.js'),
    { IdMap } = require('../utility/IdMap.js'),
    { logger } = require('../utility/logger.js'),
    { toString } = require('../utility/prettify.js'),
    polls = require('../../data/polls/activePolls.json'),
    fs = require('fs'),
    date = new Date(),
    options = require('../../data/polls/pollOptions.json'),
    schedule = require('node-schedule');

let activePolls = IdMap.emptyMap(),
    jobs = IdMap.emptyMap(),
    completePolls = IdMap.fromObject(require('../../data/polls/completePolls.json'));

function getRoleMembers(guild, roleID) {
    return guild.roles
        .fetch(roleID)
        .then(role => role.members
            .array())
        .catch(error => `Role Error: ${error}`);
}

function testPoll(guild, roleId, callChannel, solicitorChannel, title, pollOptions, weeks = 0, days = 0, hours = 0, minutes = 5) {

    const callDate = new Date();
    callDate.setDate(date.getDate() + (weeks * 7) + (days));
    callDate.setMinutes(date.getMinutes() + minutes, 0, 0);


    logger.debug('beginning test');
    const newPoll = createPoll(title, callChannel, callDate.getTime());
    logger.debug(`create poll: ${newPoll.toString()}`);
    logger.debug(`pollOptions: ${pollOptions}`);
    logger.debug(`options: ${toString(options[pollOptions])}`);
    logger.debug(`guild: ${guild}`);
    getRoleMembers(guild, roleId)
        .then(members => {
            logger.debug(`members: ${members}`);
            newPoll.activatePoll(members, options[pollOptions], solicitorChannel);
            logger.debug(`active poll: ${newPoll.toString()}`);
        });

    logger.debug(`calldate: ${callDate.toISOString()}`);
    logger.debug(`current date: ${date.toISOString()}`);

    jobs = jobs.set(
        newPoll.id,
        schedule.scheduleJob(callDate, () => callPoll(newPoll.pollID))
    );
    activePolls = activePolls.set(newPoll.id, newPoll);
}

function startPoll(guild, roleId, solicitorChannel, title, pollOptions) {
    const newPoll = createPoll(title);
    getRoleMembers(guild, roleId)
        .then(members => {
            newPoll.activatePoll(members, options[pollOptions], solicitorChannel);
        });
    activePolls = activePolls.set(newPoll.id, newPoll);
}

function callPoll(pollID) {
    if(!activePolls.has(pollID)) return `${pollID} not active`;

    completePolls.set(pollID, activePolls.get(pollID).callPoll());

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
    logger.debug(`milliseconds: ${date.getTime()}`);
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

function resend(pollID, userID) {
    if(!activePolls.has(pollID)) return `${pollID} not active`;

    return activePolls
        .get(pollID)
        .resend(userID);
}

function resetPolls() {
    activePolls = IdMap.emptyMap();
    completePolls = IdMap.emptyMap();
}

exports.startPoll = startPoll;
exports.testPoll = testPoll;
exports.onLoad = onLoad;
exports.onOffload = onOffload;
exports.resetPolls = resetPolls;
exports.callPoll = callPoll;
exports.checkTime = checkTime;
exports.resend = resend;