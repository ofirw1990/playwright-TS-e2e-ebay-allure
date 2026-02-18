import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { RandomSelector } from '../utils/RandomSelector';
import { PriceParser } from '../utils/PriceParser';

/**
 * ProductPage - Handles product variants selection and adding to cart
 */
export class ProductPage extends BasePage {
  // Cart and Product Elements
  readonly addToCartButton: Locator;
  readonly quantitySelect: Locator;
  readonly priceElement: Locator;

  // Size Variant Selectors
  readonly sizeDropdownButton: Locator;
  readonly sizeDropdownOptions: Locator;

  // Color Variant Selectors
  readonly colorDropdownButton: Locator;
  readonly colorDropdownOptions: Locator;

  constructor(page: Page) {
    super(page);
    
    // Cart and Product
    this.addToCartButton = page.locator('//a[contains(@id,"atcBtn_btn")]');
    this.quantitySelect = page.locator('select[id*="quantity" i], select[name*="quantity" i]');
    this.priceElement = page.locator('.x-price-primary, [itemprop="price"], .vi-price, .display-price');
    
    // Size Variants
    this.sizeDropdownButton = page.locator("//span[text()='size:']");
    this.sizeDropdownOptions = page.locator("//span[text()='size:']/ancestor::div[contains(@class,'vim') and contains(@class,'x-sku')]//div[@role='option']");
    
    // Color Variants
    this.colorDropdownButton = page.locator("//span[text()='color:']");
    this.colorDropdownOptions = page.locator("//span[text()='color:']/ancestor::div[contains(@class,'vim') and contains(@class,'x-sku')]//div[@role='option']");
  }

  /**
   * Check for CAPTCHA or bot detection
   */
  private async checkForCaptcha(): Promise<void> {
    try {
      // Check for common CAPTCHA indicators
      const captchaSelectors = [
        'iframe[title*="recaptcha"]',
        'iframe[src*="captcha"]',
        '[class*="captcha"]',
        '#px-captcha',
        '.g-recaptcha',
        'text=Please verify you are a human',
        'text=Security Verification',
      ];

      for (const selector of captchaSelectors) {
        if (await this.page.locator(selector).first().isVisible({ timeout: 1000 })) {
          throw new Error('❌ CAPTCHA/Bot detection encountered! Test cannot continue.');
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('CAPTCHA')) {
        throw error;
      }
      // Timeout is OK - no captcha found
    }
  }

  /**
   * Get product price from page
   * @returns Product price as number
   */
  async getProductPrice(): Promise<number> {
    try {
      const priceText = await this.priceElement.first().textContent();
      return priceText ? PriceParser.parse(priceText) : 0;
    } catch {
      console.log('Could not get product price');
      return 0;
    }
  }

  /**
   * Select random variants (size, color, etc.) if available
   * This is a critical function for handling dynamic product options
   */
  async selectRandomVariants(): Promise<void> {
    console.log('Checking for product variants...');

    // Check for CAPTCHA first
    await this.checkForCaptcha();

    // 1. Handle Size Selection (Dropdown)
    await this.selectSizeVariant();

    // 2. Handle Color Selection (Buttons or Dropdown)
    await this.selectColorVariant();

    // 3. Handle Other Dropdowns (Material, Style, etc.)
    await this.selectOtherDropdowns();

    // 4. Handle Quantity (keep default 1 or select random)
    await this.selectQuantity();

    // Wait a bit for selections to process
    await this.page.waitForTimeout(1000);
    console.log('Variant selection completed');
  }

  /**
   * Select size variant if available
   */
  private async selectSizeVariant(): Promise<void> {
    try {
      // Open the size dropdown
      if (await this.sizeDropdownButton.first().isVisible({ timeout: 2000 })) {
        await this.sizeDropdownButton.first().click();
        console.log('Opened size dropdown');
        await this.page.waitForTimeout(500);
        
        // Get all options (skip first one - it's "Select")
        const allOptions = await this.sizeDropdownOptions.all();
        
        if (allOptions.length > 1) {
          // Remove first option (Select/placeholder)
          const validOptions = allOptions.slice(1);
          
          // Select random option
          const randomOption = RandomSelector.getRandomElement(validOptions);
          if (randomOption) {
            const optionText = await randomOption.textContent();
            await randomOption.click();
            console.log(`Selected size: ${optionText?.trim()}`);
            return;
          }
        }
      }

      console.log('No size variant found or already selected');
    } catch (error) {
      console.log('No size variant found or already selected');
    }
  }

  /**
   * Select color variant if available
   */
  private async selectColorVariant(): Promise<void> {
    try {
      // Open the color dropdown
      if (await this.colorDropdownButton.first().isVisible({ timeout: 2000 })) {
        await this.colorDropdownButton.first().click();
        console.log('Opened color dropdown');
        await this.page.waitForTimeout(500);
        
        // Get all options (skip first one - it's "Select")
        const allOptions = await this.colorDropdownOptions.all();
        
        if (allOptions.length > 1) {
          // Remove first option (Select/placeholder)
          const validOptions = allOptions.slice(1);
          
          // Select random option
          const randomOption = RandomSelector.getRandomElement(validOptions);
          if (randomOption) {
            const optionText = await randomOption.textContent();
            await randomOption.click();
            console.log(`Selected color: ${optionText?.trim()}`);
            return;
          }
        }
      }

      console.log('No color variant found or already selected');
    } catch (error) {
      console.log('No color variant found or already selected');
    }
  }

  /**
   * Select other dropdown variants (material, style, etc.)
   */
  private async selectOtherDropdowns(): Promise<void> {
    try {
      const allSelects = await this.page.locator('select[id*="msku"], select.x-msku__select').all();

      for (const select of allSelects) {
        const id = await select.getAttribute('id');
        
        // Skip if already handled (size, color, quantity)
        if (id && (
          id.toLowerCase().includes('quantity') ||
          id.toLowerCase().includes('size') ||
          id.toLowerCase().includes('color')
        )) {
          continue;
        }

        if (await select.isVisible({ timeout: 1000 })) {
          const options = await select.locator('option').all();
          
          const validOptions = [];
          for (const option of options) {
            const value = await option.getAttribute('value');
            if (value && value !== '') {
              validOptions.push(value);
            }
          }

          if (validOptions.length > 1) { // More than just "Select" option
            const randomValue = RandomSelector.getRandomElement(validOptions);
            if (randomValue) {
              await select.selectOption(randomValue);
              console.log(`Selected variant: ${randomValue}`);
            }
          }
        }
      }
    } catch (error) {
      console.log('No other variants to select');
    }
  }

  /**
   * Select quantity (keep default 1)
   */
  private async selectQuantity(): Promise<void> {
    try {
      if (await this.quantitySelect.first().isVisible({ timeout: 2000 })) {
        // Keep default quantity of 1
        await this.quantitySelect.first().selectOption('1');
        console.log('Quantity set to 1');
      }
    } catch (error) {
      console.log('Quantity field not found - using default');
    }
  }

  /**
   * Add item to cart after selecting variants
   */
  async addToCart(): Promise<void> {
    try {
      // Wait for Add to Cart button to be visible
      await this.addToCartButton.first().waitFor({ state: 'visible', timeout: 5000 });
      
      await this.addToCartButton.first().click();
      await this.page.waitForTimeout(2000); // Wait for cart update
      await this.page.pause();
      console.log('Item added to cart');
    } catch (error) {
      console.log('❌ Error: Could not add item to cart');
      throw new Error(`Failed to add item to cart: ${error}`);
    }
  }

  /**
   * Main function to add items to cart with variant selection
   * @param urls - Array of product URLs
   */
  async addItemsToCart(urls: string[]): Promise<void> {
    console.log(`Adding ${urls.length} items to cart...`);

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`\n--- Processing item ${i + 1}/${urls.length} ---`);

      try {
        // Navigate to product page
        await this.goto(url);
        await this.page.waitForTimeout(2000);

        // Check for CAPTCHA
        await this.checkForCaptcha();

        // Get price
        const price = await this.getProductPrice();
        console.log(`Product price: $${price}`);

        // Select variants
        await this.selectRandomVariants();

        // Add to cart
        await this.addToCart();
        
        // Take screenshot
        await this.takeScreenshot(`item_${i + 1}_added`);
        
        successCount++;

      } catch (error) {
        failureCount++;
        console.log(`❌ Error processing item ${i + 1}:`, error);
        await this.takeScreenshot(`item_${i + 1}_error`);
        
        // If it's a CAPTCHA error, stop the whole process
        if (error instanceof Error && error.message.includes('CAPTCHA')) {
          throw error;
        }
        
        // For other errors, continue but log warning
        console.log(`⚠️  Warning: Failed to add item ${i + 1}, continuing with next item...`);
      }
    }

    console.log(`\n✓ Successfully added: ${successCount}/${urls.length} items`);
    
    if (failureCount > 0) {
      console.log(`⚠️  Failed to add: ${failureCount}/${urls.length} items`);
    }
    
    // Fail the test if too many items failed
    if (failureCount === urls.length) {
      throw new Error(`❌ Failed to add any items to cart (0/${urls.length})`);
    }
  }
}
