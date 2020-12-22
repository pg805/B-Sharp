const Discord = require('discord.js'),
    { DISCORDTOKEN } = require('../data/keys.json'),
    { logger } = require('./utility/logger.js');

const client = new Discord.Client({ ws: { intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_VOICE_STATES'] } }),
    forgoTurtID = '593804670313562112',
    botTestID = '594244452437065729';

// login bot
client.login(DISCORDTOKEN);

let forgoTurts;
let botTest;

// login message
client.on('ready', () => {
    // poll.checkTime();
    // poll.onLoad(client.channels);
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
client.on('debug', debug => logger.debug(`Discord Debug: ${debug}`));
client.on('warn', warning => logger.warn(`Discord Warning: ${warning}`));
client.on('error', error => logger.error(`Discord Error: ${error}`));

client.on('message', (message) => DiscordManager.listen(message));
// Auto Responses

// Chat Commands

// Dm Commands