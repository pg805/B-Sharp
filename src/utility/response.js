class Response {
    constructor(pattern) {
        this.pattern = pattern;
    }
}

class MessageResponse extends Response {
    constructor (pattern, response) {
        super(pattern);
        this.response = response;
    }
}