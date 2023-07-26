/**
 * Generate a random integer from 0 to the given upper bound, exclusive.
 * This uses the crypto API to try and generate random numbers in a somewhat
 * cryptographically secure way, less susceptible to bias compared to the usual
 * Math.random() method.
 * @param high The upper bound of the random generator
 * @return A random integer in the range [0, high).
 */
export function randomInt(high: number): number {
  // Get byte array for storing crypto values, the length of which depending on size of range
  const byteArray = new Uint8Array(Math.ceil(high / 256));
  const byteMax = 256 ** byteArray.length;

  // Get max multiple that is evenly divisible by upper bound
  const highestMultiple = byteMax - (byteMax % high);

  let byteSum: number;
  do {
    // Fill byte array with random values
    crypto.getRandomValues(byteArray);

    // Sum bytes into actual value
    byteSum = byteArray.reduce((acc, byte, idx, array) => acc + byte ** (array.length - idx), 0);
  } while (
    // If the summed value is not within the unbiased range, redo
    byteSum >= highestMultiple
  );

  // Get the remainder of the byte value and the upper bound to get the actual random value we want
  return byteSum % high;
}

/**
 * Builds up a shuffled version of the provided array and returns it.
 * @param input The array to shuffle.
 * @return A shuffled copy of the input array.
 */
export function shuffle<T>(input: T[]): T[] {
  const output: T[] = [];

  for (let i = 0; i < input.length; i += 1) {
    // Get a random index from 0 to the current index, inclusive
    const randomIdx = randomInt(i + 1);

    // Swap current and random indices if needed to make room
    if (randomIdx !== i) {
      output[i] = output[randomIdx];
    }

    // Place next item from input into random index location
    output[randomIdx] = input[i];
  }

  return output;
}
