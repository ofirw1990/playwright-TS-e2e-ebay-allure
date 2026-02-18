/**
 * RandomSelector Utility
 * Handles random selection of variants (size, color, etc.)
 */

export class RandomSelector {
  /**
   * Get random index from array
   * @param length - Array length
   * @returns Random index
   */
  static getRandomIndex(length: number): number {
    if (length <= 0) return 0;
    return Math.floor(Math.random() * length);
  }

  /**
   * Get random element from array
   * @param array - Array to select from
   * @returns Random element or null if array is empty
   */
  static getRandomElement<T>(array: T[]): T | null {
    if (!array || array.length === 0) return null;
    const index = this.getRandomIndex(array.length);
    return array[index];
  }

  /**
   * Get random number between min and max (inclusive)
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns Random number
   */
  static getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
