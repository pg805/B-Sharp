import Guild from './guild';

/**
 * asdfas
 */
export default class Settings {
    /**
     * asdf
     * @param {string} id asdf
     * @param {string} prefix asfd
     * @param {number} volume afsdf
     * @param {number} pollIncrement asfd
     * @param {boolean} debug asdf
     */
    constructor(
        public id:string,
        public prefix:string,
        public volume:number,
        // think of better name
        public pollIncrement:number,
        public debug:boolean
    // eslint-disable-next-line no-empty-function
    ) {}
}
