const Discord = require('discord.js'),
    { DISCORDTOKEN } = require('../data/keys.json'),
    { logger } = require('./utility/logger.js'),
    DiscordManager = require('./utility/DiscordManager.js');

logger.info('Starting bot...');

const client = new Discord.Client({ ws: { intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_VOICE_STATES'] } });

const discordManager = DiscordManager.createDiscordManager(client);

// const forgoTurtID = '593804670313562112',
//     botTestID = '594244452437065729';

// login bot
client.login(DISCORDTOKEN);

// let forgoTurts;
// let botTest;

// login message
client.on('ready', () => {
    // poll.checkTime();
    // poll.onLoad(client.channels);

    discordManager.logon();
    // forgoTurts = client.guilds.cache.get(forgoTurtID);
    // botTest = client.guilds.cache.get(botTestID);

    // for Josh Panel.
    console.log('Bot Started');
});

// logs client errors and warnings
client.on('debug', debug => logger.debug(`Discord Debug: ${debug}`));
client.on('warn', warning => logger.warn(`Discord Warning: ${warning}`));
client.on('error', error => logger.error(`Discord Error: ${error}`));

client.on('message', (message) => DiscordManager.listen(message));


// exit message
process.on('exit', (code) => {
    // poll.onOffload();
    logger.info(`About to exit with code: ${code}`);
});

// promise error
process.on('unhandledRejection', error => logger.error(`Uncaught Promise Rejection: ${error}`));

process.on('SIGTERM', () =>
    process.exit(0),
);

// Auto Responses
discordManager.autoResponse(
    /\bbush\b/g,
    'NIIII https://tenor.com/view/monty-python-knights-who-say-ni-ni-gif-12279570'
);

// Chat Commands
discordManager.command(
    /refresh/g,
    'Restarting self',
    () => process.exit(0),
    false
);

// Dm Commands