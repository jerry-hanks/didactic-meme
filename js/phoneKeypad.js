// phoneKeypad.js

export const phoneKeypad = {
    '2': ['A', 'B', 'C'],
    '3': ['D', 'E', 'F'],
    '4': ['G', 'H', 'I'],
    '5': ['J', 'K', 'L'],
    '6': ['M', 'N', 'O'],
    '7': ['P', 'Q', 'R', 'S'],
    '8': ['T', 'U', 'V'],
    '9': ['W', 'X', 'Y', 'Z']
};

/**
 * Loads the words from the provided URL and returns a Promise that resolves to a Set of words.
 *
 * @returns {Promise<Set<string>>} A promise that resolves to a Set containing all the words.
 */
export async function loadWordsIntoSet() {
    const url = "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt";

    // Fetch the text file from the URL
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch words: ${response.status} ${response.statusText}`);
    }

    // Get the text content
    const text = await response.text();

    // Split the text into lines and filter out any empty lines
    const wordsArray = text.split(/\r?\n/).filter(Boolean);

    // Return a new Set containing all the words
    return new Set(wordsArray);
}


/**
 * getPermutations
 * 
 * Splits the input string into groups whenever a '0' or '1' is encountered.
 * For groups consisting of digits 2-9, it computes the Cartesian product
 * (i.e. all possible letter combinations) based on the mapping of each digit.
 * For groups that are simply "0" or "1", the result is an array containing the digit.
 * 
 * Examples:
 * - Input "98" produces:
 *   { "98": ['WT', 'WU', 'WV', 'XT', 'XU', 'XV', 'YT', 'YU', 'YV', 'ZT', 'ZU', 'ZV'] }
 *
 * - Input "2" produces:
 *   { "2": ['A', 'B', 'C'] }
 *
 * - Input "213" produces:
 *   { "2": ['A', 'B', 'C'], "1": ["1"], "3": ['D', 'E', 'F'] }
 *
 * - For an empty input, an empty array is returned.
 *
 * @param {string} input - The input string of digits.
 * @returns {Object|Array} - An object mapping each group to its permutations or an empty array if input is empty.
 */
export function getPermutations(input) {
    if (input === '') return [];

    // Split the input into groups. When a '0' or '1' is encountered,
    // end the current group (if any) and add the digit as its own group.
    const groups = [];
    let currentGroup = '';
    for (const char of input) {
        if (char === '0' || char === '1') {
            if (currentGroup !== '') {
                groups.push(currentGroup);
                currentGroup = '';
            }
            groups.push(char);
        } else {
            currentGroup += char;
        }
    }
    if (currentGroup !== '') groups.push(currentGroup);

    // Build the result object: For each group, compute its letter permutations.
    const result = {};
    for (const group of groups) {
        if (group === '0' || group === '1') {
            result[group] = [group];
        } else {
            let combinations = [''];
            for (const digit of group) {
                const letters = phoneKeypad[digit];
                if (!letters) {
                    combinations = [];
                    break;
                }
                const newCombinations = [];
                for (const prefix of combinations) {
                    for (const letter of letters) {
                        newCombinations.push(prefix + letter);
                    }
                }
                combinations = newCombinations;
            }
            result[group] = combinations;
        }
    }

    return result;
}

/**
 * getValidPermutations
 *
 * Uses loadWordsIntoSet to load a set of valid English words, then generates all permutations
 * from the input (using getPermutations). For each key in the resulting object, if the key is
 * not "0" or "1", it filters the array so that only those strings (when converted to lowercase)
 * that are present in the valid words set remain. If the key is "0" or "1", no filtering is applied.
 *
 * The function returns a structure similar to getPermutations, but with each array containing only valid words
 * (or unfiltered if the group is "0" or "1").
 *
 * @param {string} input - The input string of digits.
 * @returns {Promise<Object|Array>} A promise that resolves to an object mapping each group to its valid word permutations.
 */
export async function getValidPermutations(input) {
    // Load the valid words set.
    const wordsSet = await loadWordsIntoSet();
    // Generate all permutations for the input.
    const permutations = getPermutations(input);

    // For each key in permutations, conditionally filter the array.
    const validPermutations = {};
    for (const key in permutations) {
        if (key === "0" || key === "1") {
            // Do not filter if the group is "0" or "1".
            validPermutations[key] = permutations[key];
        } else {
            // Otherwise, filter using the wordsSet.
            validPermutations[key] = permutations[key].filter(word =>
                wordsSet.has(word.toLowerCase())
            );
        }
    }

    return validPermutations;
}

/**
 * getFinalResults (Updated with Split‐and‐Resplit Logic)
 *
 * This function does the following:
 *   1. Calls getValidPermutations(input) and saves the result.
 *   2. Recursively “splits” any segment (a string of digits) whose valid permutation array is empty.
 *      The splitting is done at the middle (using floor division), and the process continues until the segment is one letter.
 *   3. Uses a recursive process (with Cartesian product) to compute final combination strings.
 *   4. Returns an object with two keys:
 *        - validPermutations: the updated mapping (with splits) for the input.
 *        - finalResults: the computed final combinations array.
 *
 * @param {string} input - The input string of digits.
 * @returns {Promise<Object>} - An object with keys { validPermutations, finalResults }.
 */
export async function getFinalResults(input) {
    // --- Helper A: Recursively update valid mapping by splitting segments that yield an empty array ---
    async function splitValidMapping(segment) {
      // Get the valid permutations for this segment.
      const vp = await getValidPermutations(segment);
      const keys = Object.keys(vp);
      // If the segment is "atomic" (i.e. getValidPermutations returns a single key equal to the segment)
      if (keys.length === 1 && keys[0] === segment) {
        if (vp[segment].length > 0) {
          // If there are valid results, return the array.
          return vp[segment];
        } else if (segment.length > 1) {
          // No valid results—split the segment at the middle and process each half.
          const mid = Math.floor(segment.length / 2);
          const leftSegment = segment.slice(0, mid);
          const rightSegment = segment.slice(mid);
          const leftRes = await splitValidMapping(leftSegment);
          const rightRes = await splitValidMapping(rightSegment);
          // Return an object mapping the left and right parts.
          return { [leftSegment]: leftRes, [rightSegment]: rightRes };
        } else {
          // Single character with no valid result.
          return vp[segment]; // likely an empty array
        }
      } else {
        // If multiple keys are returned (for example, due to delimiters), process each key.
        const result = {};
        for (const k of keys) {
          if (vp[k].length === 0 && k.length > 1) {
            result[k] = await splitValidMapping(k);
          } else {
            result[k] = vp[k];
          }
        }
        return result;
      }
    }
  
    // --- Helper B: Recursively process a segment to compute final combinations ---
    async function processSegment(segment) {
      const vpLocal = await getValidPermutations(segment);
      const keys = Object.keys(vpLocal);
      // If the segment is atomic (a single group)...
      if (keys.length === 1 && keys[0] === segment) {
        const arr = vpLocal[segment];
        if (arr.length > 0) {
          return arr;
        } else if (segment.length > 1) {
          // No valid results for this atomic group: split it and process each half.
          const mid = Math.floor(segment.length / 2);
          const left = segment.slice(0, mid);
          const right = segment.slice(mid);
          const leftRes = await processSegment(left);
          const rightRes = await processSegment(right);
          const combined = [];
          for (const l of leftRes) {
            for (const r of rightRes) {
              combined.push(l + " " + r);
            }
          }
          return combined;
        } else {
          return [];
        }
      } else {
        // Otherwise, the segment contains multiple groups (e.g. due to delimiters "0" or "1")
        // Re-split the segment using the same logic as in getPermutations.
        const groups = [];
        let current = "";
        for (const char of segment) {
          if (char === "0" || char === "1") {
            if (current !== "") {
              groups.push(current);
              current = "";
            }
            groups.push(char);
          } else {
            current += char;
          }
        }
        if (current !== "") groups.push(current);
        // For each group, get its valid results (recursively processing if needed)
        const arrays = [];
        for (const grp of groups) {
          let vpGrp = await getValidPermutations(grp);
          if (vpGrp.hasOwnProperty(grp) && vpGrp[grp].length > 0) {
            arrays.push(vpGrp[grp]);
          } else {
            const res = await processSegment(grp);
            arrays.push(res);
          }
        }
        // Cartesian product helper.
        function cartesian(arrays) {
          let result = [[]];
          for (const arr of arrays) {
            const temp = [];
            for (const prefix of result) {
              for (const item of arr) {
                temp.push([...prefix, item]);
              }
            }
            result = temp;
          }
          return result;
        }
        const prod = cartesian(arrays);
        return prod.map(arr => arr.join(" "));
      }
    }
  
    // --- Main body of getFinalResults ---
    // Save the original valid permutations mapping.
    const originalValidPerms = await getValidPermutations(input);
    // Create an updated valid permutations mapping that applies the split logic.
    const updatedValidPerms = await splitValidMapping(input);
    // Compute the final combinations using the recursive processing.
    const finalCombinations = await processSegment(input);
    
    // Return an object that contains both the updated valid mapping and the final results.
    return {
      validPermutations: updatedValidPerms,
      finalResults: finalCombinations
    };
  }
  

