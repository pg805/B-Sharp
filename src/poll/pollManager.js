'use strict';

const { createPoll, reactivatePoll } = require('./Poll.js'),
    { IdMap } = require('../utility/IdMap.js'),
    { logger } = require('../utility/logger.js'),
    { toString } = require('../utility/prettify.js'),
    polls = require('../../data/polls/activePolls.json'),
    fs = require('fs'),
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

function testPoll(guild, roleId, callChannel, solicitorChannel, title, pollOptions, weeks = 0, days = 0, hours = 0, minutes = 2) {

    const callDate = new Date();
    const date = new Date();

    logger.debug(`current date: ${date.getDate()}`);
    logger.debug(`week days: ${weeks * 7}`);
    logger.debug(`days: ${days}`);
    logger.debug(`date math: ${parseInt(date.getDate()) + (parseInt(weeks) * 7) + parseInt((days))}`);

    callDate.setDate(parseInt(date.getDate()) + (parseInt(weeks) * 7) + parseInt((days)));

    logger.debug(`future date: ${callDate.getDate()}`);

    callDate.setHours(parseInt(date.getHours()) + parseInt(hours), parseInt(date.getMinutes()) + parseInt(minutes), 0, 0);


    logger.debug('beginning test');
    logger.debug(`create poll calldate: ${callDate.getTime()}`);
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
        schedule.scheduleJob(callDate, () => {
            logger.debug(`calling poll: ${newPoll.id}`);
            logger.debug(callPoll(newPoll.id));
        })
    );

    jobs.map((id, value) =>
        logger.debug('job: ' + value.nextInvocation()));

    activePolls = activePolls.set(newPoll.id, newPoll);
}

function startPoll(guild, roleId, callChannel, solicitorChannel, title, pollOptions, weeks = 0, days = 0, hours = 0, minutes = 2) {
    const callDate = new Date();

    callDate.setDate(parseInt(callDate.getDate()) + (parseInt(weeks) * 7) + parseInt((days)));

    callDate.setHours(parseInt(callDate.getHours()) + parseInt(hours), parseInt(callDate.getMinutes()) + parseInt(minutes), 0, 0);

    const newPoll = createPoll(title, callChannel, callDate.getTime());
    getRoleMembers(guild, roleId)
        .then(members => {
            newPoll.activatePoll(members, options[pollOptions], solicitorChannel);
        });

    jobs = jobs.set(
        newPoll.id,
        schedule.scheduleJob(callDate, () => {
            callPoll(newPoll.id);
        })
    );

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
    const date = new Date();
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

function printJobs() {
    jobs.map((id, value) =>
        logger.debug('job: ' + value.nextInvocation()));
}

exports.startPoll = startPoll;
exports.testPoll = testPoll;
exports.onLoad = onLoad;
exports.onOffload = onOffload;
exports.resetPolls = resetPolls;
exports.callPoll = callPoll;
exports.checkTime = checkTime;
exports.resend = resend;
exports.printJobs = printJobs;