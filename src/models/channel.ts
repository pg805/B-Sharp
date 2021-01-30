import { Snowflake } from 'discord.js';
import AutoReply from './autoReply';

/**
 * wrapper for a discord channel
 */
export default class Channel {
    /**
     * insantiates a new channel
     * @param {Snowflake} id unique identifier for the channel
     * @param {string} commands list of allowed commands1
     * @param {AutoReply} autoReplies list of allowed autoreplies
     */
    constructor(
        public id:Snowflake,
        public commands:string[],
        public autoReplies:AutoReply[]
    // eslint-disable-next-line no-empty-function
    ) {}
}
