'use strict';

const { logger } = require('./logger.js'),
    { toString } = require('./prettify.js');

function checkID(id) {
    if(/^\d+$/.test(id)) {
        return id;
    } else {
        throw `Type Error: id must be an integer id :: ${id} is not`;
    }
}

class IdMap {
    constructor(id, value = null, tail = null) {
        this.id = checkID(`${id}`);
        this.value = value;
        this.tail = tail;
    }

    static emptyMap() {
        return emptyMap;
    }

    add(id, value) {
        return new IdMap(`${id}`, value, this);
    }

    // TODO from array function
    // TODO map function

    static fromJSON(json) {
        return IdMap.fromObject(JSON.parse(json));
    }

    static toJSON(map) {
        return JSON.stringify(map.toObject());
    }

    static fromObject(object) {
        return this.fromObjectHelper(object, Object.keys(object), Object.keys(object).length);
    }

    static fromObjectHelper(object, keys, offset) {
        if (offset <= 0) {
            return IdMap.emptyMap();
        } else if (keys[offset - 1]) {
            return IdMap.fromObjectHelper(object, keys, offset - 1).add(keys[offset - 1], object[keys[offset - 1]]);
        }
    }

    isEmpty() {
        return false;
    }

    has(id) {
        if (this.id == `${id}`) {
            return true;
        } else {
            return this.tail.has(id);
        }
    }

    ids() {
        return [this.id].concat(this.tail.ids());
    }

    values() {
        return [this.value].concat(this.tail.values());
    }

    toObject() {
        const object = this.tail.toObject();
        object[this.id] = this.value;
        return object;
    }

    type() {
        return 'IdMap';
    }

    length() {
        return this.tail.length() + 1;
    }

    get(id) {
        if (this.id == `${id}`) {
            return this.value;
        } else {
            return this.tail.get(id);
        }
    }

    set(id, value) {
        if (this.id == `${id}`) {
            return this.tail.add(id, value);
        } else {
            this.tail = this.tail.set(id, value);
            return this;
        }
    }

    getObject(id) {
        const object = {};
        if (this.id == `${id}`) {
            object[id] = this.value;
            return object;
        } else {
            return this.tail.getObject(id);
        }
    }

    remove(id) {
        if(this.id == `${id}`) {
            return this.tail;
        } else {
            return this.tail.remove(id).add(this.id, this.value);
        }
    }

    filter(predicate) {
        if(predicate(this.value)) {
            return this.tail.filter(predicate).add(this.id, this.value);
        } else {
            return this.tail.filter(predicate);
        }
    }

    map(mapFunction) {
        return this.tail.map(mapFunction).add(this.id, mapFunction(this.id, this.value));
    }

    flatmap(mapFunction) {
        return this.map(mapFunction).toObject();
    }

    forEach(mapFunction) {
        mapFunction(this.id, this.value);
        this.tail.forEach(mapFunction);
        return;
    }

    toString() {
        return `[${this.id} -> ${toString(this.value)}],\n${this.tail.toString()}`;
    }

    idsToString(newLine) {
        if (newLine) {
            return `${this.id},\n${this.tail.idsToString()}`;
        }
        return `${this.id}, ${this.tail.idsToString()}`;
    }

    valuesToString(newLine) {

        if (newLine) {
            return `${this.value},\n${this.tail.valuesToString()}`;
        }
        return `${this.value}, ${this.tail.valuesToString()}`;
    }
}

class EmptyIdMap extends IdMap {
    constructor(id = '0', value = null, tail = null) {
        super(id, value, tail);
        this.id = null;
    }

    isEmpty() {
        return true;
    }

    type() {
        return 'IdMap';
    }

    get(id) {
        logger.error(`${id} is not in empty mapping`);
        throw 'can\'t get from empty mapping';
    }

    getObject(id) {
        logger.error(`${id} is not in empty mapping`);
        throw 'can\'t getObject from empty mapping';
    }

    remove() {
        return this;
    }

    set(id, value) {
        return this.add(id, value);
    }


    has() {
        return false;
    }

    ids() {
        return [];
    }

    values() {
        return [];
    }

    toObject() {
        return {};
    }

    length() {
        return 0;
    }

    filter() {
        return this;
    }

    map() {
        return this;
    }

    forEach() {
        return;
    }

    toString() {
        return '[Empty]';
    }

    idsToString() {
        return 'Empty()';
    }

    valuesToString() {
        return 'Empty()';
    }
}

// singleton I guess
const emptyMap = Object.freeze(new EmptyIdMap());

module.exports = {
    IdMap : IdMap
};