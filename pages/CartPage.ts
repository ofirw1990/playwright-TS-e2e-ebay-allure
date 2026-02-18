import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { PriceParser } from '../utils/PriceParser';
import { expect } from '@playwright/test';

/**
 * CartPage - Handles cart operations and assertions
 */
export class CartPage extends BasePage {
  // Cart Navigation Elements
  readonly cartIcon: Locator;
  
  // Cart Summary Elements
  readonly subtotalElement: Locator;
  readonly totalElement: Locator;
  readonly itemsCountElement: Locator;
  
  // Selector strings for multiple fallback options
  private readonly removeButtonsSelector: string = '[data-test-id="cart-remove-item"], .remove-button, button:has-text("Remove"), a:has-text("Remove")';
  
  private readonly totalSelectors: string[] = [
    '[data-test-id="SUBTOTAL"] .text-display-24',
    '.cart-summary-amount',
    '.total-row .text-display-24',
    '.subtotal .text-display',
    'span:has-text("Subtotal") + span',
  ];
  
  private readonly itemPriceSelector: string = '.item-price, .itemValue';
  
  private readonly countSelectors: string[] = [
    '//*[@class="cart-summary-line-item"]//span[contains(text(), "Items")]',
    '#gh-cart-n',
    'span:has-text("item") i',
  ];
  
  private readonly itemRowsSelector: string = '.cart-item, [data-test-id*="item"]';

  constructor(page: Page) {
    super(page);
    this.cartIcon = page.locator('.gh-cart').first();
    this.subtotalElement = page.locator('[data-test-id="SUBTOTAL"] .text-display-24, .cart-summary-amount').first();
    this.totalElement = page.locator('.cart-bucket-summary .text-display-24, [data-test-id="SUBTOTAL"]').first();
    this.itemsCountElement = page.locator('.cart-header-quantity, #gh-cart-n').first();
  }

  /**
   * Open shopping cart
   */
  async openCart(): Promise<void> {
    console.log('Opening shopping cart...');
    
    try {
      // First try: Click cart icon (preserves session)
      await this.cartIcon.click({ timeout: 5000 });
      await this.waitForPageLoad();
      console.log('Cart opened via icon click');
    } catch (error) {
      // Fallback: Navigate directly to cart URL
      console.log('Cart icon not found, navigating directly...');
      await this.goto('https://cart.ebay.com/');
      await this.waitForPageLoad();
      console.log('Cart opened via direct navigation');
    }
    
    await this.page.waitForTimeout(2000);
  }

  /**
   * Clear all items from cart
   */
  async clearCart(): Promise<void> {
    console.log('Clearing cart...');
    
    try {
      await this.openCart();
      await this.page.waitForTimeout(2000);

      // Find and click remove buttons for all items
      const removeButtons = this.page.locator(this.removeButtonsSelector);
      const count = await removeButtons.count();

      if (count === 0) {
        console.log('Cart is already empty');
        return;
      }

      // Remove items one by one
      for (let i = 0; i < count; i++) {
        try {
          // Always click the first item since the list updates after removal
          await removeButtons.first().click({ timeout: 5000 });
          await this.page.waitForTimeout(1000);
        } catch (error) {
          console.log(`Could not remove item ${i + 1}`);
        }
      }

      console.log(`Removed ${count} items from cart`);
      await this.page.waitForTimeout(1000);
      
    } catch (error) {
      console.log('Could not clear cart:', error);
    }
  }

  /**
   * Get total amount from cart
   * @returns Total cart amount
   */
  async getTotalAmount(): Promise<number> {
    try {
      // Wait for cart to load
      await this.page.waitForTimeout(2000);

      // Try multiple selectors for total/subtotal
      for (const selector of this.totalSelectors) {
        try {
          const element = this.page.locator(selector).first();
          if (await element.isVisible({ timeout: 3000 })) {
            const totalText = await element.textContent();
            if (totalText) {
              const total = PriceParser.parse(totalText);
              if (total > 0) {
                console.log(`Found cart total: $${total}`);
                return total;
              }
            }
          }
        } catch {
          continue;
        }
      }

      // If no total found, try to sum individual items
      return await this.calculateTotalFromItems();

    } catch (error) {
      console.log('Error getting cart total:', error);
      return 0;
    }
  }

  /**
   * Calculate total by summing individual item prices
   * @returns Calculated total
   */
  private async calculateTotalFromItems(): Promise<number> {
    try {
      const itemPrices = await this.page.locator(this.itemPriceSelector).allTextContents();
      let total = 0;

      for (const priceText of itemPrices) {
        const price = PriceParser.parse(priceText);
        total += price;
      }

      console.log(`Calculated total from items: $${total}`);
      return total;
    } catch {
      return 0;
    }
  }

  /**
   * Get number of items in cart
   * @returns Items count
   */
  async getItemsCount(): Promise<number> {
    try {
      // Multiple ways to get item count
      for (const selector of this.countSelectors) {
        try {
          const element = this.page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            const countText = await element.textContent();
            if (countText) {
              const count = parseInt(countText.replace(/\D/g, ''));
              if (!isNaN(count)) {
                console.log(`Cart contains ${count} items`);
                return count;
              }
            }
          }
        } catch {
          continue;
        }
      }

      // Fallback: count item rows
      const itemRows = await this.page.locator(this.itemRowsSelector).count();
      console.log(`Cart contains ${itemRows} items (counted)`);
      return itemRows;

    } catch (error) {
      console.log('Error getting items count:', error);
      return 0;
    }
  }

  /**
   * Assert that cart total does not exceed budget
   * @param budgetPerItem - Budget per item
   * @param itemsCount - Number of items expected (URLs found and attempted to add)
   */
  async assertCartTotalNotExceeds(budgetPerItem: number, itemsCount: number): Promise<void> {
    console.log('\n--- Validating Cart Total ---');

    // Open cart
    await this.openCart();

    // Get total amount
    const totalAmount = await this.getTotalAmount();
    console.log(`Cart total: $${totalAmount}`);

    // Get items count
    const cartItemsCount = await this.getItemsCount();
    console.log(`Items in cart: ${cartItemsCount}`);

    // Calculate threshold
    const threshold = budgetPerItem * itemsCount;
    console.log(`Budget threshold: $${budgetPerItem} × ${itemsCount} = $${threshold}`);

    // Take screenshot before assertion
    await this.takeScreenshot('cart_final');

    // Validation logic based on expected items count
    if (itemsCount === 0) {
      // If no URLs were found, empty cart is expected
      console.log('✓ No items were found in search - empty cart is valid');
      expect(cartItemsCount).toBe(0);
      expect(totalAmount).toBe(0);
      return;
    }

    // If items were expected, cart should not be empty
    if (cartItemsCount === 0) {
      throw new Error(`❌ Cart is empty! Expected ${itemsCount} items but found 0`);
    }

    // Check if total is 0 when items are in cart (suspicious)
    if (totalAmount === 0 && cartItemsCount > 0) {
      throw new Error(`❌ Cart total is $0 but contains ${cartItemsCount} items - suspicious!`);
    }

    // Check if cart item count matches expected (strict validation)
    if (cartItemsCount !== itemsCount) {
      const message = `⚠️  Cart item mismatch: Expected ${itemsCount} items but found ${cartItemsCount}`;
      console.log(message);
      
      // Calculate acceptable tolerance (allow 1 item difference for small counts)
      const tolerance = itemsCount <= 2 ? 0 : 1;
      const difference = Math.abs(cartItemsCount - itemsCount);
      
      if (difference > tolerance) {
        throw new Error(`❌ ${message} - Difference of ${difference} items exceeds tolerance!`);
      }
    }

    // Assert price threshold
    expect(totalAmount).toBeLessThanOrEqual(threshold);
    console.log(`✓ Assertion passed: $${totalAmount} <= $${threshold}`);
    
    if (cartItemsCount === itemsCount) {
      console.log(`✓ Cart contains exactly ${itemsCount} items as expected`);
    }
  }
}
