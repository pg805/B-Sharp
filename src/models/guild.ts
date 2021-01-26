import AutoReply from "./autoReply";
import Channel from "./channel";

export default class Guild {
	constructor(
		public id:number,
		public autoReplies:AutoReply[],
		public channels:Channel[],
	) {}
}