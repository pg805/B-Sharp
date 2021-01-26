export default class AutoReply {
	constructor(
		public pattern:RegExp,
		public response:string
	) {}
}