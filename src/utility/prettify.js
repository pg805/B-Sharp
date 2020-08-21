'use strict';

function toString(object) {
    return JSON.stringify(object, null, '\t');
}

function fromString(string) {
    return JSON.parse(string);
}

module.exports = {
    toString : toString,
    fromString : fromString
};