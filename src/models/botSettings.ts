import { Snowflake } from "discord.js";

/**
 * asdfas
 */
export default class BotSettings {
    /**
     * asdf
     * @param {string} prefix asfd
     * @param {number} volume afsdf
     */
    constructor(
        public debug:boolean,
        public discordID:Snowflake,
        public youtubeID:Snowflake,
        public pollID: number
    // eslint-disable-next-line no-empty-function
    ) {}
}
