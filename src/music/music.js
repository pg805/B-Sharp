'use strict';

const Youtube = require('simple-youtube-api'),
    { YOUTUBEAPIKEY } = require('../../data/keys'),
    ytdl = require('ytdl-core'),
    youtube = new Youtube(YOUTUBEAPIKEY),
    { logger } = require('../utility/logger.js'),
    Discord = require('discord.js'),
    lowQualityList = ['https://youtu.be/yP9BCYR2UOw'],
    soundList = require('../../data/audioClips/_soundlist.json'),
    soundCommandList = Object.keys(soundList),
    musicObject = {
        queue: [],
        dispatcher: null,
        isLoop: false,
        voiceChannel: null,
    };

async function youtubeURLSearch(url, textChannel) {
    try {
        // using try catch because there are many api calls and as a result -async await usage
        /*
		the 'replace' and 'split' methods create an array that looks
		like this: [ 'https://www.youtube.com/watch?', 'v=', 'dQw4w9WgXcQ' ]
		then we declare an 'id' variable and assign it to the 3rd element
		*/
        const query = url
            .replace(/(>|<)/gi, '')
            .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
        // eslint-disable-next-line no-useless-escape
        const id = query[2].split(/[^0-9a-z_\-]/i)[0];

        // getting a video object by calling
        // the getVideoByID provided to us by simple-youtube-api
        const video = await youtube.getVideoByID(id) .catch(error => logger.error(`getVidByID Error: ${JSON.stringify(error)}`));

        // construct the song object
        const title = video.title;
        const songConst = {
            url,
            title,
        };

        logger.info(`url: ${songConst.url}`);

        // push the song object to queue
        musicObject.queue.push(songConst);
        /*
		If there is no song playing, call the playSong method
		else if there is a song playing, return a msg that says the song was
		added to queue
		*/
        // catches errors from getVideoByID method
    } catch (error) {
        logger.error(`Get Video By ID Error: ${JSON.stringify(error)}`);
        return textChannel.channel.send('Something went wrong with the youtube URL search, please try later');
    }
}

async function youtubeNameSearch(searchName, textChannel) {
    let songEmbed;

    try {
        /*
        call 'searchVideos' method to get a list of 5 video objects that match the
        query. Then create an array of the 5 videos numbered from 1 to 5 with their
        titles.
        */
        const videos = await youtube.searchVideos(searchName, 5);
        const vidNameArr = [];
        for (let i = 0; i < videos.length; i++) {
            vidNameArr.push(`${i + 1}: ${videos[i].title}`);
        }
        vidNameArr.push('exit');
        /* construct a message embed that will be displayed to the chat, it
        contains the song titles fetched using 'searchVideos'.
        */
        const embed = new Discord.MessageEmbed()
            .setColor('#e9f931')
            .setTitle('Choose a song by commenting a number between 1 and 5')
            .addField('Song 1', vidNameArr[0])
            .addField('Song 2', vidNameArr[1])
            .addField('Song 3', vidNameArr[2])
            .addField('Song 4', vidNameArr[3])
            .addField('Song 5', vidNameArr[4])
            .addField('Exit', 'exit');
        songEmbed = await textChannel.send({ embed });

        let response;

        try {
            /*
        assign 'response' variable whatever the user types. The correct
        responses are numbers between 1-5 or 'exit'. There is also a time limit
        of 1 minute to respond.
        */
            response = await textChannel.awaitMessages(
                msg => (msg.content > 0 && msg.content < 6) || msg.content === 'exit',
                {
                    max: 1,
                    maxProcessed: 1,
                    time: 60000,
                    errors: ['time'],
                },
            );
            // catch errors from 'awaitMessages' and respond correctly
        } catch (error) {
            logger.error('Await Message Error: ' + error);
            songEmbed.delete();
            return textChannel.send(
                'Please try again and enter a number between 1 and 5 or exit',
            );
        }
        if (response.first().content === 'exit') return songEmbed.delete();
        // assign videoIndex to the song number the user enters
        const videoIndex = parseInt(response.first().content);

        songEmbed.delete();

        let video;

        // logger.info('video: ' + JSON.stringify(video));

        try {
            // fetch the video object using 'getVideoByID'
            video = await youtube.getVideoByID(videos[videoIndex - 1].id);
            if (video.raw.snippet.liveBroadcastContent === 'live') {
                return textChannel.send('I don\'t support live streams!');
            }
            // catch errors from 'getVideoByID'
        } catch (error) {
            logger.error(`Get Video By ID Error: ${error}`);
            songEmbed.delete();
            return textChannel.send(
                'An error has occured when trying to get the video ID from youtube',
            );
        }

        const url = `https://www.youtube.com/watch?v=${video.raw.id}`;
        const title = video.title;

        logger.info(`url: ${url}`);

        const songConst = {
            url,
            title,
        };

        logger.info(`url2: ${songConst.url}`);

        musicObject.queue.push(songConst);


    } catch (error) {
        // if the songEmbed wasn't deleted because of an error related to playSong() - delete it
        if (songEmbed) {
            songEmbed.delete();
        }

        logger.error(`Youtube Name Search Error: ${error}`);

        return textChannel.send(
            'Something went wrong with searching the video you requested :(',
        );
    }
}

async function play(args, channels, volume) {
    /*
	Searches for songs on youtube, adds them to queue, and starts player.
	input: input : the message , a discord.js message object
	input: song : the song to play, a string
    */

    // checks if vc is correct (they are in one and it is the bots if the bot is already playing)
    if (!channels.voiceChannel || (channels.voiceChannel != musicObject.botVoiceChannel && musicObject.botVoiceChannel)) {
        return channels.textChannel.send('You must be in the correct Voice Channel to play music.');
    }

    const song = args.join(' ');

    // url search
    if (song.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
        await youtubeURLSearch(song, channels.textChannel);
    } else {
        await youtubeNameSearch(song, channels.textChannel);
    }

    if (!musicObject.dispatcher) {
        return playSong(channels, volume);
    } else {
        return channels.textChannel.send(`${musicObject.queue[musicObject.queue.length - 1].title} added to queue`);
    }
}

async function playSong(channels, volume) {
    /*
	Creates the stream and plays it in the channel
	input: message : the message input, a discord.js message object
    */

    logger.info(`url3: ${typeof musicObject.queue[0].url}`);

    const stream = ytdl(musicObject.queue[0].url, {
        type: 'opus',
        volume: 0.1,
        // highest audio quality
        quality: 'highestaudio',
        // this line downloads part of the song before starting, it reduces stuttering
        highWaterMark: 1024 * 1024 * 10,
    });

    // provide ytdl library with the song url
    if (lowQualityList.includes(musicObject.queue[0].url)) {
        stream.quality = 'lowestaudio';
    }

    channels.voiceChannel
    // join the voice channel the user is in
        .join()
        .then(connection => {
            // sends voice packet data to the voice connection
            const dispatcher = connection
                .play(
                    stream,
                    { seek: 0, volume: volume },
                );

            musicObject.dispatcher = dispatcher;
            musicObject.botVoiceChannel = channels.voiceChannel;

            // event emitted when the song starts
            dispatcher.on('start', () => {
                return channels.textChannel.send(
                    `:musical_note: Now playing: ${musicObject.queue[0].title} :musical_note:`,
                );
            });
            // event emitted when the song ends
            // eslint-disable-next-line no-unused-vars
            dispatcher.on('finish', (reason) => {
                // remove the song from queue
                logger.info(`Stop Reason: ${reason}`);
                if (musicObject.isLoop && reason != 'manual stop') {
                    musicObject.queue.push(musicObject.queue.shift());
                } else {
                    musicObject.queue.shift();
                }
                // if the queue has more songs, continue playing

                // message.channel.send(reason);
                if (musicObject.queue.length >= 1) {
                    return playSong(channels);
                    // else if the queue is empty, assign isPlaying to false and leave the channel
                } else {
                    musicObject.dispatcher = null;
                    musicObject.botVoiceChannel.leave();
                    musicObject.botVoiceChannel = null;
                    return;
                }
            });

            // event emitted if an error occures
            dispatcher.on('error', error => {
                channels.textChannel.send('Cannot play song');
                return logger.error(`Dispatcher error: ${error}`);
            });
        })
    // catches dispatcher errors
        .catch(error => {
            return logger.error(`Connection error: ${error}`);
        });
}

function queue(args, textChannel) {
    // clear queue
    if (args[0] == 'clear') {
        while (musicObject.queue.length > 1) {
            musicObject.queue.pop();
        }
        textChannel.send('Queue emptied.');
        return;
        // otherwise make an embed that tells everyone what is in the queue
    } else if (musicObject.queue.length) {

        const queueEmbed = new Discord.MessageEmbed()
            .setColor('#e9f931')
            .setTitle('Current Queue');
        for (let queueIndex = 0; queueIndex < musicObject.queue.length; queueIndex++) {
            queueEmbed.addField(`Song ${queueIndex + 1}:`, `${musicObject.queue[queueIndex].title}`);
        }

        textChannel.send(queueEmbed);
    } else {
        textChannel.send('The queue is currently empty.');
    }
}

function stop(channels) {

    // logger.info('User Voice Channel: ' + JSON.stringify(channels.voiceChannel));
    // logger.info('bot Voice Channel: ' + JSON.stringify(musicObject.botVoiceChannel));


    if (channels.voiceChannel == musicObject.botVoiceChannel && musicObject.dispatcher) {
        while (musicObject.queue.length) {
            musicObject.queue.pop();
        }
        musicObject.dispatcher.end('manual stop');
        musicObject.dispatcher = null;
        musicObject.botVoiceChannel.leave();
        musicObject.botVoiceChannel = null;
        return channels.textChannel.send('Music Stopped');
    } else {
        return channels.textChannel.send('You must be in a voice channel with B-Sharp to use this command.');
    }
}

function skip(args, channels) {
    if (channels.voiceChannel == musicObject.botVoiceChannel && musicObject.dispatcher) {
        if (args.length && args[0].match(/[0-9]+/g) && args[0] <= musicObject.queue.length) {
            musicObject.queue.splice(0, parseInt(args[0]) - 2);
            musicObject.dispatcher.end('manual stop');
        } else if (args[0] > musicObject.queue.length) {
            channels.textChannel.send(`Cannot skip to ${args[0]}, no song at that position.`);
            // skip the current song
        } else {
            musicObject.dispatcher.end('manual stop');
        }
    } else {
        return channels.textChannel.send('You must be in a voice channel with B-Sharp to use this command.');
    }
}

function loop(textChannel) {
    // sets loop to off
    if (musicObject.isLoop) {
        musicObject.isLoop = false;
        return textChannel.send('Loop mode off.');
        // sets loop to on
    } else {
        musicObject.isLoop = true;
        return textChannel.send('Loop mode on.');
    }
}

// checks if a sound is being used or a command

function soundEffect(soundName, channels) {
    if (soundCommandList.includes(soundName)) {
        if (channels.voiceChannel && !musicObject.dispatcher) {
            // grabs the sound object
            const soundObject = soundList[soundName];
            // joins voice channel and plays audio clip
            channels.voiceChannel.join().then(connection => {
                // choose a random file from the object to play
                const file2Play = soundObject['file'][Math.floor(Math.random() * soundObject['file'].length)];
                // TODO: log which file was choosen (might add stats)
                logger.info(file2Play);
                const hawtDispatcher = connection.play(file2Play);
                // success message and gif
                hawtDispatcher.on('start', () => {
                    channels.textChannel.send(soundObject['gif']);
                });
                // end message
                hawtDispatcher.on('finish', () => {
                    channels.voiceChannel.leave();
                    musicObject.dispatcher = null;
                });
                // error message
                hawtDispatcher.on('error', (error) => {
                    logger.error(`Dispatcher Error: ${error}`);
                });
            });
        } else {
            channels.textChannel.send('You must be in a voice channel and the bot must not be playing a song to use this command.');
        }
    }
    return;
}

exports.play = play;
exports.queue = queue;
exports.stop = stop;
exports.skip = skip;
exports.loop = loop;
exports.soundEffect = soundEffect;