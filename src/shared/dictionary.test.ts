import { Dictionary } from "./dictionary";

describe("Dictionary Tests", () => {
    let dictionary: Dictionary<string, number>;

    beforeEach(() => {
        dictionary = new Dictionary<string, number>();
    });

    describe("When adding a key value pair", () => {
        it("it should contain the key", () => {
            dictionary.add('testkey', 1337);
            expect(dictionary.item('testkey')).toBeDefined();
        });

        it("it should have added the value", () => {
            dictionary.add('testkey', 1337);
            expect(dictionary.item('testkey')).toBe(1337);
        });

        it("should allow 0 as key", () => {
            let numberDictionary = new Dictionary<number, number>();
            numberDictionary.add(0, 1337);
            expect(numberDictionary.item(0)).toBe(1337);
        });
    });

    describe("When adding multiple pairs", () => {
        it("it should have the right count", () => {
            dictionary.add('testkey1', 1337);
            dictionary.add('testkey2', 1338);

            expect(dictionary.count).toBe(2);
        });

        it("it should have the right key and value lists", () => {
            dictionary.add('testkey1', 1337);
            dictionary.add('testkey2', 1338);

            expect(dictionary.keys[0]).toBe('testkey1');
            expect(dictionary.keys[1]).toBe('testkey2');

            expect(dictionary.values[0]).toBe(1337);
            expect(dictionary.values[1]).toBe(1338);
        });

        it("it should throw an error on duplicate key inserts", () => {
            dictionary.add('testkey', 1337);

            expect(() => dictionary.add('testkey', 1338)).toThrowError('Error: key testkey is already contained in dictionary.');
        });
    });

    describe("When getting an item", () => {
        it("it should return the right value", () => {
            dictionary.add('testkey1', 1);
            dictionary.add('testkey2', 1337);
            dictionary.add('testkey3', 3);
            const item = dictionary.item('testkey2');

            expect(item).toBe(1337);
        });

        it("it should throw an error when the item is not present", () => {
            expect(() => dictionary.item('testkey')).toThrowError('Error: key testkey not found in dictionary.');
        });
    });

    describe("When deleting an item", () => {
        it("it should success when the key is in the dictionary", () => {
            dictionary.add('testkey1', 1337);
            const result = dictionary.remove('testkey1');

            expect(result).toBe(true);
        });

        it("it should fail when the key is not in the dictionary", () => {
            dictionary.add('testkey1', 1337);
            const result = dictionary.remove('testkey2');

            expect(result).toBe(false);
        });

        it("it should have deleted the key", () => {
            dictionary.add('testkey1', 1337);
            dictionary.add('testkey2', 1338);
            dictionary.add('testkey3', 1339);

            dictionary.remove('testkey2');

            expect(dictionary.keys.find((key) => {
                return key === 'testkey2';
            })).toBe(false);
        });

        it("it should have deleted the value", () => {
            dictionary.add('testkey1', 1337);
            dictionary.add('testkey2', 1338);
            dictionary.add('testkey3', 1339);

            dictionary.remove('testkey2');

            expect(dictionary.values.find((key) => {
                return key === 1338;
            })).toBe(false);
        });
    });

    describe("When clearing the dictionary", () => {
        it("it should have cleared all items", () => {
            dictionary.add('testkey1', 1337);
            dictionary.add('testkey2', 1338);
            dictionary.add('testkey3', 1339);
            dictionary.clear();

            expect(dictionary.count).toBe(0);
            expect(dictionary.keys.length).toBe(0);
            expect(dictionary.values.length).toBe(0);
        });
    });

    describe("When trying to modify dictionarys internal lists outside the class", () => {
        it("it should not have changed the internal lists", () => {
            dictionary.add('testkey1', 1337);
            dictionary.add('testkey2', 1338);
            dictionary.add('testkey3', 1339);

            let keys = dictionary.keys;
            let values = dictionary.values;

            keys.push('testvalue4');
            values.push(1336);

            expect(dictionary.count).toBe(3);
            expect(dictionary.keys.find((key) => {
                return key === 'testvalue4';
            })).toBe(false);
            expect(dictionary.values.find((key) => {
                return key === 1336;
            })).toBe(false);
        });
    });
});