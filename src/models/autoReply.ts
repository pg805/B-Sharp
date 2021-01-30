/**
 * A class representing an autoreply.  Whenever *pattern* appears in chat, the bot will reply with *response* automatically
 */
export default class AutoReply {
    /**
     * instantiates a new autoreply class
     * @param {RegExp} pattern the regular expression that the bot watches for
     * @param {string} response the bot's response to the regular expression
     */
    constructor(
        public pattern:RegExp,
        public response:string
    // eslint-disable-next-line no-empty-function
    ) {}
}
