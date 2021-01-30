/**
 * Instructs the bot to run a command.
 */
export default class Instruction {
    /**
     * Creates a new instruction instance
     * @param {string} name The name of the command to be run.
     * @param {string} args The list of arguments for the command.
     */
    constructor(
        public name:string,
        public args:string[]
    // eslint-disable-next-line no-empty-function
    ) {}
}
