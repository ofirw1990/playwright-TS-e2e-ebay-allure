/**
 * PriceParser Utility
 * Handles price string parsing to numeric values
 */

export class PriceParser {
  /**
   * Parse price string to number
   * Handles formats like: "$50.99", "$1,234.56", "US $999.00"
   * @param priceText - The price string from the page
   * @returns Numeric price value
   */
  static parse(priceText: string): number {
    if (!priceText) {
      return 0;
    }

    // Remove all non-numeric characters except dots
    const cleanPrice = priceText.replace(/[^0-9.]/g, '');
    const price = parseFloat(cleanPrice);

    return isNaN(price) ? 0 : price;
  }

  /**
   * Format number to price string
   * @param price - Numeric price
   * @returns Formatted price string (e.g., "$50.99")
   */
  static format(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  /**
   * Check if price text contains a valid price
   * @param priceText - The price string to validate
   * @returns True if valid price exists
   */
  static isValid(priceText: string): boolean {
    return this.parse(priceText) > 0;
  }
}
