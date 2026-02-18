import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { PriceParser } from '../utils/PriceParser';
import { config } from '../config/env.config';

/**
 * SearchPage - Handles product search, filtering, and pagination
 */
export class SearchPage extends BasePage {
  // Search Elements
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  
  // Price Filter Elements
  readonly minPriceInput: Locator;
  readonly maxPriceInput: Locator;
  readonly priceSubmitButton: Locator;
  
  // Pagination Elements
  readonly nextPageButton: Locator;
  
  // XPath Selectors for item extraction
  private readonly itemCardXPath: string = '//li[@data-gr3 and @class="s-card s-card--vertical"]';
  private readonly itemPriceXPath: string = 'xpath=.//span[contains(@class, "s-item__price") or contains(@class, "price")]';
  private readonly itemLinkXPath: string = 'xpath=.//a[contains(@href, "itm/")]';
  
  // Selector strings for visibility checks
  private readonly maxPriceInputSelector: string = 'input[name*="MaxPrice"]';
  private readonly priceSubmitSelector: string = 'button:has-text("Submit")';
  private readonly nextPageSelector: string = 'a.pagination__next, a[aria-label*="next"]';

  constructor(page: Page) {
    super(page);
    this.searchBox = page.locator('input[type="text"][placeholder*="Search"]').first();
    this.searchButton = page.locator('#gh-search-btn').first();
    this.minPriceInput = page.locator('input[name*="MinPrice"], input[aria-label*="Minimum"]').first();
    this.maxPriceInput = page.locator('input[name*="MaxPrice"], input[aria-label*="Maximum"]').first();
    this.priceSubmitButton = page.locator('button:has-text("Submit price range")').first();
    this.nextPageButton = page.locator('a.pagination__next, a[aria-label="Go to next search page"]').first();
  }

  /**
   * Search for products by keyword
   * @param query - Search keyword
   */
  async searchByKeyword(query: string): Promise<void> {
    await this.searchBox.fill(query);
    await this.searchButton.click();
    await this.waitForPageLoad();
    console.log(`Searched for: ${query}`);
  }

  /**
   * Apply price filter if available
   * @param maxPrice - Maximum price to filter
   */
  async applyPriceFilter(maxPrice: number): Promise<void> {
    try {
      // Check if price filter exists
      const isPriceFilterVisible = await this.isElementVisible(this.maxPriceInputSelector);
      
      if (isPriceFilterVisible) {
        await this.maxPriceInput.fill(maxPrice.toString());
        
        // Try to submit the filter
        const isSubmitVisible = await this.isElementVisible(this.priceSubmitSelector);
        if (isSubmitVisible) {
          await this.priceSubmitButton.click();
          await this.waitForPageLoad();
          console.log(`Applied price filter: max $${maxPrice}`);
        }
      } else {
        console.log('Price filter not available on page - will filter manually');
      }
    } catch (error) {
      console.log('Could not apply price filter - will filter manually');
    }
  }

  /**
   * Extract product items from current page under specified price
   * @param maxPrice - Maximum price threshold
   * @param limit - Maximum number of items to collect
   * @returns Array of product URLs
   */
  async searchItemsByNameUnderPrice(
    query: string,
    maxPrice: number,
    limit: number = 5
  ): Promise<string[]> {
    // Perform search
    await this.searchByKeyword(query);
    
    // Try to apply price filter
    await this.applyPriceFilter(maxPrice);

    // Collect items with pagination support
    return await this.collectItemsWithPaging(maxPrice, limit);
  }

  /**
   * Collect items from multiple pages if needed
   * @param maxPrice - Maximum price threshold
   * @param limit - Number of items to collect
   * @returns Array of product URLs
   */
  private async collectItemsWithPaging(maxPrice: number, limit: number): Promise<string[]> {
    const collectedUrls: string[] = [];
    let currentPage = 1;

    while (collectedUrls.length < limit && currentPage <= config.pagination.maxPages) {
      console.log(`Collecting items from page ${currentPage}...`);
      
      const pageItems = await this.extractItemsFromCurrentPage(maxPrice);
      
      for (const item of pageItems) {
        if (collectedUrls.length >= limit) break;
        collectedUrls.push(item);
      }

      console.log(`Collected ${collectedUrls.length}/${limit} items so far`);

      // Check if we need more items and next page exists
      if (collectedUrls.length >= limit) break;
      
      const hasNext = await this.hasNextPage();
      if (!hasNext) {
        console.log('No more pages available');
        break;
      }

      await this.goToNextPage();
      currentPage++;
    }

    return collectedUrls.slice(0, limit);
  }

  /**
   * Extract items from current page using XPath
   * @param maxPrice - Maximum price threshold
   * @returns Array of product URLs that meet price criteria
   */
  private async extractItemsFromCurrentPage(maxPrice: number): Promise<string[]> {
    await this.page.waitForTimeout(2000); // Wait for items to load
    
    const items: string[] = [];

    // Find all search result items using XPath (as per requirements)
    const itemElements = await this.page.locator(this.itemCardXPath).all();

    for (const item of itemElements) {
      try {
        // Get price using XPath
        const priceElement = item.locator(this.itemPriceXPath).first();
        const priceText = await priceElement.textContent();
        
        if (!priceText) continue;

        const price = PriceParser.parse(priceText);
        
        // Check if price is within budget
        if (price > 0 && price <= maxPrice) {
          // Get product URL using XPath
          const linkElement = item.locator(this.itemLinkXPath).first();
          const url = await linkElement.getAttribute('href');
          
          if (url) {
            items.push(url);
            console.log(`Found item: ${price} - ${url.substring(0, 50)}...`);
          }
        }
      } catch (error) {
        // Skip invalid items
        continue;
      }
    }

    return items;
  }

  /**
   * Check if next page button exists
   * @returns True if next page is available
   */
  async hasNextPage(): Promise<boolean> {
    try {
      const nextButton = await this.page.locator(this.nextPageSelector).first();
      const isVisible = await nextButton.isVisible({ timeout: 3000 });
      const isDisabled = await nextButton.getAttribute('aria-disabled');
      return isVisible && isDisabled !== 'true';
    } catch {
      return false;
    }
  }

  /**
   * Navigate to next page
   */
  async goToNextPage(): Promise<void> {
    try {
      await this.nextPageButton.click();
      await this.waitForPageLoad();
      console.log('Navigated to next page');
    } catch (error) {
      console.log('Could not navigate to next page');
    }
  }
}
