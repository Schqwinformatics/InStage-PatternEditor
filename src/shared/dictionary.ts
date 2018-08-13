import * as _ from 'lodash';

export interface DictionaryDto<K, V> {
    keys: K[];
    values: V[];
}

export class Dictionary<K, V> implements DictionaryDto<K, V> {
    private _keys: K[];
    private _values: V[];

    constructor() {
        this._keys = [];
        this._values = [];
    }

    static fromArrays<K, V>(keys: K[], values: V[]): Dictionary<K, V> {
        let result = new Dictionary<K, V>();
        result._keys = keys;
        result._values = values;

        return result;
    }

    add(key: K, value: V): void {
        if (key === null) {
            throw new Error(`Error: key cannot be null.`);
        }

        if (_.includes(this._keys, key)) {
            throw new Error(`Error: key ${key} is already contained in dictionary.`);
        }

        this._keys.push(key);
        this._values.push(value);
    }

    item(key: K): V {
        if (key === null) {
            throw new Error(`Error: key cannot be null.`);
        }

        if (!_.includes(this._keys, key)) {
            throw new Error(`Error: key ${key} not found in dictionary.`);
        }

        const index = _.indexOf(this._keys, key);

        return this._values[index];
    }

    setItem(key: K, value: V): void {
        if (key === null) {
            throw new Error(`Error: key cannot be null.`);
        }

        if (!_.includes(this._keys, key)) {
            throw new Error(`Error: key ${key} not found in dictionary.`);
        }

        const index = _.indexOf(this._keys, key);
        this._values[index] = value;
    }

    get count(): number {
        return this._keys.length;
    }

    get keys(): K[] {
        return this._keys.filter(() => true);
    }

    get values(): V[] {
        return this._values.filter(() => true);
    }

    containsKey(key: K): boolean {
        return _.includes(this._keys, key);
    }

    remove(key: K): boolean {
        if (!_.includes(this._keys, key)) {
            return false;
        }

        const index = _.indexOf(this._keys, key);
        _.remove(this._keys, (item) => this._keys.indexOf(item) === index);
        _.remove(this._values, (item) => this._values.indexOf(item) === index);

        return true;
    }

    clear(): void {
        this._keys = [];
        this._values = [];
    }

    toJSON(): DictionaryDto<K, V> {
        return {
            keys: this._keys,
            values: this._values
        };
    }
}