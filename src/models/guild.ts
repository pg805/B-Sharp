import { Snowflake } from 'discord.js';
import { PrefixUnaryOperator } from 'typescript';
import AutoReply from './autoReply';
import Channel from './channel';
import GuildSettings from './guildSettings';

/**
 * wrapper for a discord guild
 */
export default class Guild {
    /**
     * defines guild types and members
     * @param {Snowflake} id the string representing the id
     * @param {AutoReply} autoReplies the list of autoreplies allowed in this guild
     * @param {Channel} channels the list of channels watched in this guild
     */
    constructor(
        public id:Snowflake,
        public settings: GuildSettings,
        public voiceChannels: Snowflake[],
        public textChannels:Channel[],
        public autoReplies:AutoReply[],
    // eslint-disable-next-line no-empty-function
    ) {}
}
