import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { SearchPage } from '../pages/SearchPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import testData from '../data/test-data.json';

/**
 * eBay E2E Shopping Test Suite
 * Tests product search, filtering, variant selection, and cart validation
 */

test.describe('eBay Shopping E2E Tests', () => {
  let loginPage: LoginPage;
  let searchPage: SearchPage;
  let productPage: ProductPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    // Initialize Page Objects
    loginPage = new LoginPage(page);
    searchPage = new SearchPage(page);
    productPage = new ProductPage(page);
    cartPage = new CartPage(page);

    // Login (Guest mode)
    await loginPage.login();
  });

  /**
   * Data-Driven Test: Search and Add Items to Cart
   * Tests each scenario from test-data.json
   */
  for (const scenario of testData.scenarios) {
    test(`${scenario.name} - Search, Add to Cart, and Validate Total`, async ({ page }) => {
      console.log(`\n========================================`);
      console.log(`TEST: ${scenario.name}`);
      console.log(`Description: ${scenario.description}`);
      console.log(`Query: "${scenario.query}" | Max Price: $${scenario.maxPrice} | Limit: ${scenario.limit}`);
      console.log(`========================================\n`);

      // Step 1: Search for items under specified price
      console.log('STEP 1: Searching for items...');
      const productUrls = await searchPage.searchItemsByNameUnderPrice(
        scenario.query,
        scenario.maxPrice,
        scenario.limit
      );

      console.log(`\nFound ${productUrls.length} items within budget`);
      expect(productUrls.length).toBeGreaterThan(0);

      // Log collected URLs
      productUrls.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url.substring(0, 80)}...`);
      });

      // Step 2: Add items to cart with variant selection
      console.log('\n\nSTEP 2: Adding items to cart...');
      await productPage.addItemsToCart(productUrls);

      // Step 3: Validate cart total
      console.log('\n\nSTEP 3: Validating cart total...');
      await cartPage.assertCartTotalNotExceeds(scenario.maxPrice, productUrls.length);

      console.log(`\n✓ Test passed: ${scenario.name}`);
    });
  }

  /**
   * Individual Test Functions (as specified in requirements)
   */

//   test('searchItemsByNameUnderPrice Function Test', async ({ page }) => {
//     const query = 'laptop';
//     const maxPrice = 500;
//     const limit = 5;

//     console.log(`Testing searchItemsByNameUnderPrice("${query}", ${maxPrice}, ${limit})`);

//     const urls = await searchPage.searchItemsByNameUnderPrice(query, maxPrice, limit);

//     console.log(`Found ${urls.length} items`);
//     expect(urls).toBeInstanceOf(Array);
//     expect(urls.length).toBeGreaterThanOrEqual(0);
//     expect(urls.length).toBeLessThanOrEqual(limit);
//   });

//   test('addItemsToCart Function Test', async ({ page }) => {
//     // First get some items
//     const urls = await searchPage.searchItemsByNameUnderPrice('mouse', 30, 2);

//     if (urls.length > 0) {
//       console.log(`Testing addItemsToCart with ${urls.length} items`);
//       await productPage.addItemsToCart(urls);

//       // Verify items were added
//       await cartPage.openCart();
//       const itemsCount = await cartPage.getItemsCount();
//       console.log(`Cart now contains ${itemsCount} items`);
//       expect(itemsCount).toBeGreaterThan(0);
//     } else {
//       console.log('No items found - skipping addItemsToCart test');
//     }
//   });

//   test('assertCartTotalNotExceeds Function Test', async ({ page }) => {
//     // Search and add items first
//     const query = 'keyboard';
//     const maxPrice = 100;
//     const limit = 3;

//     const urls = await searchPage.searchItemsByNameUnderPrice(query, maxPrice, limit);

//     if (urls.length > 0) {
//       await productPage.addItemsToCart(urls);

//       console.log(`Testing assertCartTotalNotExceeds(${maxPrice}, ${urls.length})`);
//       await cartPage.assertCartTotalNotExceeds(maxPrice, urls.length);
//     } else {
//       console.log('No items found - skipping assertion test');
//     }
//   });

//   /**
//    * Edge Case Test: Handle items with variants
//    */
//   test('Variant Selection Test - Items with Size/Color', async ({ page }) => {
//     const urls = await searchPage.searchItemsByNameUnderPrice('shirt', 50, 2);

//     if (urls.length > 0) {
//       console.log('Testing variant selection on clothing items');
//       await productPage.addItemsToCart(urls);

//       await cartPage.openCart();
//       const itemsCount = await cartPage.getItemsCount();
//       expect(itemsCount).toBeGreaterThan(0);
//       console.log('✓ Successfully handled items with variants');
//     }
//   });

//   /**
//    * Pagination Test: Ensure we can collect items from multiple pages
//    */
//   test('Pagination Test - Collect items from multiple pages', async ({ page }) => {
//     // Search for common term with low price to force pagination
//     const urls = await searchPage.searchItemsByNameUnderPrice('cable', 10, 8);

//     console.log(`Collected ${urls.length} items (potentially from multiple pages)`);
//     expect(urls.length).toBeGreaterThan(0);
//   });
});
