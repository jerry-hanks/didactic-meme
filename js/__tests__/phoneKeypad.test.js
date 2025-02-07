import { getPermutations, getFinalResults, getValidPermutations } from '../phoneKeypad.js';

describe('getPermutations', () => {
    test('should return correct permutations for input "98"', () => {
        const input = '98';
        const expected = {
            "98": [
                'WT', 'WU', 'WV',
                'XT', 'XU', 'XV',
                'YT', 'YU', 'YV',
                'ZT', 'ZU', 'ZV'
            ]
        };
        expect(getPermutations(input)).toEqual(expected);
    });

    test('should return correct permutations for a single digit "2"', () => {
        const input = '2';
        const expected = {
            "2": ['A', 'B', 'C']
        };
        expect(getPermutations(input)).toEqual(expected);
    });

    test('should return an empty array for an empty input', () => {
        const input = '';
        const expected = [];
        expect(getPermutations(input)).toEqual(expected);
    });

    // test('should skip digits that are not mapped (e.g., "1")', () => {
    //     const input = '1';
    //     // Since "1" is not in our mapping, we expect an empty result.
    //     const expected = [];
    //     expect(getPermutations(input)).toEqual(expected);
    // });

    test('should handle multiple digits like "213"', () => {
        const input = '213';
        const expected = {
            "2": ['A', 'B', 'C'],
            "1": ["1"],
            "3": ['D', 'E', 'F']
        };
        expect(getPermutations(input)).toEqual(expected);
    });    

    // test('Output check for 2312', () => {
    //     const input = '2312';
    //     const expected = [
    //         "AA 1 A",
    //         "AB 1 A",
    //         "AC 1 A",
    //         "BA 1 A",
    //         "BB 1 A",
    //         "BC 1 A",
    //         "CA 1 A",
    //         "CB 1 A",
    //         "CC 1 A",
    //         "AA 1 B",
    //         "AB 1 B",
    //         "AC 1 B",
    //         "BA 1 B",
    //         "BB 1 B",
    //         "BC 1 B",
    //         "CA 1 B",
    //         "CB 1 B",
    //         "CC 1 B",
    //         "AA 1 C",
    //         "AB 1 C",
    //         "AC 1 C",
    //         "BA 1 C",
    //         "BB 1 C",
    //         "BC 1 C",
    //         "CA 1 C",
    //         "CB 1 C",
    //         "CC 1 C"
    //     ];
    //     expect(getFinalResults(input)).toEqual(expected);
    // });

    test('getValidPermutations 98', async () => {
        const input = '98';
        const validResult = await getValidPermutations(input);
        // For example, if none of the generated permutations for "98" are valid words, then:
        expect(validResult["98"]).toEqual([ 'WT', 'WU', 'XU', 'YT' ]);
    });

    test('getValidPermutations 981', async () => {
        const input = '981';
        const expected = {
            "98" : [ 'WT', 'WU', 'XU', 'YT' ],
            "1" : [ '1']
        }
        const validResult = await getValidPermutations(input);
        // For example, if none of the generated permutations for "98" are valid words, then:
        expect(validResult).toEqual(expected);
    });
});
