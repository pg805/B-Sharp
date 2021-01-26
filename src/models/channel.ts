import AutoReply from "./autoReply";

export default class Channel {
	constructor(
		public id:number,
		public commands:string[],
		public autoReplies:AutoReply[]
	) {}
}