"use strict";
exports.__esModule = true;
/**
 * wrapper for a discord guild
 */
var Guild = /** @class */ (function () {
    /**
     * defines guild types and members
     * @param {Snowflake} id the string representing the id
     * @param {AutoReply} autoReplies the list of autoreplies allowed in this guild
     * @param {Channel} channels the list of channels watched in this guild
     */
    function Guild(id, settings, voiceChannels, textChannels, autoReplies) {
        this.id = id;
        this.settings = settings;
        this.voiceChannels = voiceChannels;
        this.textChannels = textChannels;
        this.autoReplies = autoReplies;
    }
    return Guild;
}());
exports["default"] = Guild;
