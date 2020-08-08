'use strict';

// libraries
const { IdMap } = require('../utility/IdMap.js'),
    { toString } = require('../utility/prettify.js'),
    Discord = require('discord.js'),
    { logger } = require('../utility/logger.js'),
    settings = require('../utility/settings.js'),
    gavel = '<:Gavel:709146592254623894>';

let settingsObject = settings.updateSettings();

// helper functions that I don't want called from outside
function createEmbed(title, options) {
    logger.debug(`embed options: ${toString(options)}`);
    const embed = new Discord.MessageEmbed()
        .setColor('4DCC22')
        .setTitle(`${title}`);
    const description = [];
    options
        .forEach((optionID, optionValue) => {
            logger.debug(`option : ${toString(optionValue)}`);
            description.push(`${optionValue.emote} = ${optionValue.optionName}`);
        });
    embed.setDescription(description.join('\n\n'));
    logger.debug(`embed: ${toString(embed.toJSON())}`);
    return embed;
}

// classes themselves
class Options {
    constructor(optionMap) {
        this.winner = [];
        this.optionMap = optionMap;
    }

    type() {
        return 'Options';
    }

    forEach(mapFunction) {
        this.optionMap.forEach(mapFunction);
        return;
    }

    updateVote(reactionID) {
        const newOption = this.optionMap.get(reactionID);
        newOption.vote += 1;
        logger.info(`update vote: ${toString(newOption)}`);
        this.optionMap = this.optionMap.set(reactionID, newOption);
        return this;
    }

    subtractVote(reactionID) {
        const newOption = this.optionMap.get(reactionID);
        newOption.vote -= 1;
        logger.info(`update vote: ${toString(newOption)}`);
        this.optionMap = this.optionMap.set(reactionID, newOption);
        return this;
    }

    getEmoteName(reactionID) {
        const emoteObject = this.optionMap.get(reactionID);
        return `${emoteObject.emote} **${emoteObject.optionName}**! ${emoteObject.emote}`;
    }

    // can probably make this a bit cleaner or usuable elsewhere
    getDescriptor(optionID) {
        const option = this.userMap.get(optionID);
        return `${option.emote} = ${option.optionName}`;
    }

    deactivateOptions() {
        return {
            winner : this.winner,
            optionMap : this.optionMap.toObject()
        };
    }

    calculateWinner(title) {
        let winnerVotes = 0;
        const showVote = [];

        this
            .forEach((optionID, optionValue) => {
                showVote.push(`${optionValue.emote} ${optionValue.optionName} = ${optionValue.vote}`);
                if(optionValue.vote > winnerVotes) {
                    logger.debug(`refresh winner ${optionValue.optionName}`);
                    this.winner = [];
                    this.winner.push(optionID);
                    winnerVotes = optionValue.vote;
                } else if(optionValue.vote == winnerVotes) {
                    this.winner.push(optionID);
                }
            });

        logger.debug(`winners: ${toString(this.winner)}`);

        this.winner = this.winner
            .map(optionID => {
                logger.debug(`winner: ${this.getEmoteName(optionID)}`);
                return this.getEmoteName(optionID);
            });

        logger.debug(`winners map: ${toString(this.winner)}`);

        const embed = new Discord.MessageEmbed()
            .setColor('4DCC22')
            .setTitle(`${title} Results:`);

        if(this.winner.length == 1) {
            embed
                .setDescription(`${gavel} The winner is ${this.winner[0]}\n\n**Total Votes:**\n\n${showVote.join('\n\n')}`);
        } else {
            embed
                .setDescription(`${gavel} The winners are \n${this.winner.join('\n')}\n\n**Total Votes**\n\n${showVote.join('\n\n')}`);
        }

        return embed;
    }

    static fromObject(object, keepVotes) {
        logger.info(`keep votes: ${keepVotes}`);
        logger.debug(`creating options: ${toString(object)}`);
        return new Options(IdMap
            .fromObject(object)
            .map((optionID, optionValue) => {
                if(!keepVotes) {
                    optionValue.vote = 0;
                }
                return optionValue;
            }));
    }

    static reactivateOptions(object) {
        logger.info(`options: ${toString(object)}`);
        return new Options(IdMap.fromObject(object.optionMap));
    }
}

class Users {
    constructor(embed, options, userMap) {
        this.embed = embed;
        this.options = options;
        this.userMap = userMap;
    }

    type() {
        return 'Users';
    }

    async sendEmbed(channel, userID) {
        return channel
            .send(this.embed)
            .then(message => {
                logger.debug(`line 108 channel: ${toString(channel)}`);
                logger.debug(`line 109 message: ${toString(message)}`);
                if (!message) {
                    this.userMap = this.userMap.set(userID, 'user unavailable');
                    return this;
                }

                this.addReactions(message, this.options.optionMap.ids());

                this.userMap = this.userMap.set(userID, {
                    'message' : message,
                    'channel' : channel,
                    'vote' : null
                });

                logger.debug(`userMap: ${toString(this.userMap.toObject())}`);
                logger.debug(`Users send Message: ${toString(this)}`);
                return this;
            })
            .catch(error => logger.error(`line 126 :: message send error: ${error}`));
    }

    addUser(user) {
        user.createDM()
            .then(channel => this.sendEmbed(channel, user.id))
            .catch(error => logger.error(`line 132 :: DM channel error: ${error}`));

        logger.debug(`check users object: ${toString(this)}`);
        return this;
    }

    updateMessage(voteString) {
        return new Discord.MessageEmbed(this.embed)
            .setDescription(`${this.embed.description}\n\n=====================`)
            .addField('You Voted For', voteString);
    }

    addCollector(message) {
        const collector = message.createReactionCollector((reaction, user) => !user.bot && (reaction.count == 2), { dispose: true, time: 864000000, errors: ['time'] });

        collector.on('collect', (reaction, user) => {
            logger.debug('collecting');
            message.reactions.cache.mapValues(react => {
                if(reaction.emoji.id != react.emoji.id) react.users.remove(settings.id);
            });
            message
                .edit(
                    this
                        .updateMessage(this.options.getEmoteName(reaction.emoji.id))
                        .addField('_ _\n\nYour vote will be automatically confirmed in 1 minute.', `_ _\n✅ = confirm vote\n\n${reaction.emoji} = change vote`))
                .then(newMessage => {
                    newMessage.react('✅')
                        .then(() => this.updateCollector(collector, reaction.emoji.id, user.id));
                    reaction.users.remove(settings.id);
                });
        });


        collector.on('end', (collected, reason) => {
            logger.info(`poll collector: Collected ${collected.size} items.  Ended because ${reason}.`);
        });
    }

    updateCollector(collector, reactionID, userID) {
        logger.debug(`updating collector for user: ${userID}`);
        // idle?
        logger.debug(`collect listener count before: ${collector.listenerCount('collect')}`);
        logger.debug(`end listener count before: ${collector.listenerCount('end')}`);

        collector.removeAllListeners('collect');
        collector.removeAllListeners('end');

        logger.debug(`collect listener count after: ${collector.listenerCount('collect')}`);
        logger.debug(`end listener count after: ${collector.listenerCount('end')}`);

        collector.filter = (freaction, fuser) => !fuser.bot && (freaction.emoji.name == '✅' || freaction.emoji.id == reactionID);
        collector.options = { dispose: true, time: 60000, errors: ['time'] };
        collector.resetTimer();

        collector.on('collect', (reaction) => {
            logger.debug(`confirming vote: ${reaction.message.id}`);
            if (reaction.emoji.name == '✅') {
                this.handleVote(reaction.message, reactionID, userID);
                collector.stop('Confirm Vote');
            }
        });

        // dispose?
        collector.on('remove', (reaction, user) => {
            this.sendEmbed(reaction.message.channel, user.id);
            reaction.message.delete();
        });

        collector.on('end', (collected, reason) => {
            logger.info(`poll collector: Collected ${collected.size} items.  Ended because ${reason}.`);
            if (reason == 'time') this.handleVote(collector.message, reactionID, userID);
        });
    }

    handleVote(oldMessage, reactionID, userID) {
        logger.debug(`message id: ${oldMessage.id}`);
        logger.debug(`reaction id: ${reactionID}`);
        logger.debug(`user id: ${userID}`);
        this.options.updateVote(reactionID);
        const emoteName = this.options.getEmoteName(reactionID);
        const channel = oldMessage.channel;

        channel
            .send(this.updateMessage(emoteName))
            .then(message => {
                this.userMap = this.userMap.set(userID, {
                    'message' : message,
                    'channel' : message.channel,
                    'vote' : reactionID
                });
                oldMessage.delete();
                return this;
            });
    }

    addReactions(message, options) {
        if (options.length > 0) {
            logger.debug(`reaction id: ${options[0]}`);
            message
                .react(options[0])
                .then(() => {
                    this.addReactions(message, options.slice(1));
                })
                .catch(error => logger.error(`reaction error: ${error}`));
        } else {
            logger.debug(`adding collector to message: ${message.id}`);
            this.addCollector(message);
        }
    }

    reactivateMessages(channelManager) {
        logger.debug(`refreshed user map: ${this.userMap.toString()}`);
        this.userMap
            .map((userID, userValue) => {
                channelManager
                    .fetch(userValue.channel)
                    .then(channel =>
                        channel.messages
                            .fetch(userValue.message)
                            .then(message => {
                                logger.debug(`channel: ${toString(channel)}`);
                                logger.debug(`message: ${toString(message)}`);
                                this.addCollector(message);
                                this.userMap = this.userMap
                                    .set(userID, {
                                        'message' : message,
                                        'channel' : channel,
                                        'vote' : userValue.vote
                                    });
                                logger.debug(`new userObject: ${toString(this.userMap.get(userID))}`);
                                return this;
                            })
                    );
            });
    }

    deactivateUsers(deleteReactions) {
        return {
            embed : this.embed.toJSON(),
            options : this.options.deactivateOptions(),
            userMap : this.userMap.map((userId, userValue) => {
                logger.debug(`user value: ${toString(userValue)}`);
                if(deleteReactions && !userValue.vote) userValue.message.reactions.removeAll();
                return {
                    message : userValue.message.id,
                    channel : userValue.channel.id,
                    vote : userValue.vote
                };
            }).toObject()
        };
    }

    resend(userID) {
        if(!this.userMap.has(userID)) return 'User Not in Poll';

        const oldObject = this
            .userMap
            .get(userID);

        if(oldObject.vote) {
            this.options = this
                .options
                .subtractVote(oldObject.vote);
        }

        this.sendEmbed(oldObject.channel, userID);

        return `Resent Embed to ${userID}`;
    }

    static sendDMs(userCache, options, embed) {
        logger.debug(`sending dm to: ${toString(userCache[0])}`);
        if(!userCache.length) {
            return new Users(embed, options, IdMap.emptyMap());
        } else {
            return Users
                .sendDMs(userCache
                    .slice(1), options, embed)
                .addUser(userCache[0]);
        }
    }

    static reactivateUsers(object) {

        logger.info('reactivating Users');

        logger.debug(`refresh user map: ${toString(object.userMap)}`);
        return new Users(
            new Discord.MessageEmbed(object.embed),
            // should be reactivate options, not fromObject
            Options.fromObject(object.options.optionMap, true),
            IdMap.fromObject(object.userMap)
        );
    }
}

class Poll {
    constructor(id, title, callDate, callChannel, pollUsers = null, solicitor = null, active = false) {
        this.id = id;
        this.title = title;
        this.callDate = callDate;
        this.callChannel = callChannel;
        this.solicitor = solicitor;
        this.users = pollUsers;
        this.active = active;
    }

    activatePoll(users, options, channel) {
        logger.debug(`activate options: ${JSON.stringify(options)}`);
        this.active = true;
        const newOptions = Options.fromObject(options);

        this.users = Users
            .sendDMs(users, newOptions, createEmbed(this.title, newOptions));
        logger.debug(`new users: ${toString(this.users)}`);

        logger.info(`solicitor channel: ${toString(channel)}`);
        if (channel) {
            this
                .sendSolicitor(channel)
                .then(solicitor => this.solicitor = solicitor);
            logger.debug(`send solicitor here: ${toString(this.solicitor)}`);
            return this;
        } else {
            logger.debug(`solicitor: ${toString(this.solicitor)}`);
            return this;
        }
    }

    deactivatePoll(removeReactions) {
        if(this.active) {
            return {
                id : this.id,
                title : this.title,
                callDate : this.callDate,
                callChannel : this.callChannel.id,
                solicitor : {
                    message : this.solicitor.message.id,
                    channel : this.solicitor.channel.id
                },
                users : this.users.deactivateUsers(removeReactions),
                active : false
            };
        } else {
            return 'poll not active';
        }
    }

    sendSolicitor(channel) {
        logger.debug(`solicitor channel: ${toString(channel)}`);
        return channel.send('',
            { embed: {
                title: this.title,
                description: `${gavel} React to this message with :white_check_mark: to recieve this week's Game Night poll **if you don't have the Poll role**. ${gavel}`, color: '4DCC22' }
            })
            .then(message => {
                message.react('✅');
                this.addSolicitorCollector(message);
                return {
                    'message' : message,
                    'channel' : message.channel
                };
            });
    }


    addSolicitorCollector(message) {
        const collector = message.createReactionCollector((reaction, user) => !user.bot && reaction.emoji.name == '✅', { time: 864000000, errors: ['time'] });
        collector.on('collect', (reaction, user) => this.handleSolicitor(reaction, user));
        collector.on('end', (collected, reason) => logger.info(`Collected ${collected.size} items.  Ended because ${reason}.`));
        return;
    }

    handleSolicitor(reaction, user) {
        if(!this.users.userMap.has(user.id)) this.users.addUser(user, this.options);
        return;
    }

    callPoll() {
        const solicitor = this.solicitor;
        this.callChannel.send(this.users.options.calculateWinner(this.title));
        this.solicitor = {
            'message' : { 'id' : solicitor.message.id },
            'channel' : { 'id' : solicitor.channel.id },
        };
        solicitor.message.delete();
        this.active = false;
        return this.deactivatePoll(true);
    }

    reactivateSolicitor(channelManager) {
        logger.debug(`reset solicitor: ${this.solicitor.message}`);
        channelManager
            .fetch(this.solicitor.channel)
            .then(channel => {
                channel.messages
                    .fetch(this.solicitor.message)
                    .then(message => {
                        this.addSolicitorCollector(message);
                        this.solicitor = {
                            'message' : message,
                            'channel' : channel
                        };
                        logger.debug(`solicitor: ${toString(this.solicitor)}`);
                    });
            });
    }

    reactivateCallChannel(channelManager) {
        channelManager
            .fetch(this.callChannel)
            .then(channel => this.callChannel = channel);
    }

    toString() {

        // temp stuff
        let messageID = 'solicitor not sent yet',
            channelID = 'solicitor not sent yet',
            users = 'users not sent yet';

        if (this.solicitor) {
            messageID = this.solicitor.message.id;
            channelID = this.solicitor.channel.id;
        }

        if (this.users) {
            users = toString(this.users.deactivateUsers());
        }

        return `{\n
			\t"id" : ${this.id},\n
			\t"title" : ${this.title},\n
			\t"solicitor" : {\n
				\t\t"message" : ${messageID},\n
				\t\t"channel" : ${channelID}\n
			\t\t},\n
			\t"users" : ${users},\n
			\t"active" : ${this.active}\n
	}`;
    }

    resend(userID) {
        return this.users.resend(userID);
    }

    static createPoll(title, callChannel, callDate) {
        logger.debug(`creating poll: ${title}`);
        settings.updatePollID();
        settingsObject = settings.updateSettings();
        logger.debug(`poll has id: ${settingsObject.pollID}`);
        return new Poll(settingsObject.pollID, title, callDate, callChannel);
    }

    static reactivatePoll(object, channelManager) {
        const reactivatedPoll = new Poll(
            object.id,
            object.title,
            object.callDate,
            object.callChannel,
            Users.reactivateUsers(object.users, channelManager),
            object.solicitor,
            true
        );

        logger.info(`reactivated users: ${reactivatedPoll.id}`);

        reactivatedPoll.reactivateCallChannel(channelManager);

        logger.info(`reactivated call channel: ${reactivatedPoll.callChannel}`);

        reactivatedPoll.reactivateSolicitor(channelManager);

        logger.info(`reactivated solicitor: ${reactivatedPoll.solicitor.message.id}`);

        reactivatedPoll.users.reactivateMessages(channelManager);

        logger.info('reactivated messages');

        return reactivatedPoll;
    }
}

module.exports = {
    createPoll : Poll.createPoll,
    reactivatePoll : Poll.reactivatePoll
};