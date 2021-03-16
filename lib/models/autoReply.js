"use strict";
exports.__esModule = true;
/**
 * A class representing an autoreply.  Whenever *pattern* appears in chat, the bot will reply with *response* automatically
 */
var AutoReply = /** @class */ (function () {
    /**
     * instantiates a new autoreply class
     * @param {RegExp} pattern the regular expression that the bot watches for
     * @param {string} response the bot's response to the regular expression
     */
    function AutoReply(pattern, response
    // eslint-disable-next-line no-empty-function
    ) {
        this.pattern = pattern;
        this.response = response;
    }
    return AutoReply;
}());
exports["default"] = AutoReply;
