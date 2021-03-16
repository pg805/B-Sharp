"use strict";
exports.__esModule = true;
/**
 * wrapper for a discord channel
 */
var Channel = /** @class */ (function () {
    /**
     * insantiates a new channel
     * @param {Snowflake} id unique identifier for the channel
     * @param {string} commands list of allowed commands1
     * @param {AutoReply} autoReplies list of allowed autoreplies
     */
    function Channel(id, commands, autoReplies
    // eslint-disable-next-line no-empty-function
    ) {
        this.id = id;
        this.commands = commands;
        this.autoReplies = autoReplies;
    }
    return Channel;
}());
exports["default"] = Channel;
