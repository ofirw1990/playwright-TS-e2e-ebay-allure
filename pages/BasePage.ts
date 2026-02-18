import { Page } from '@playwright/test';
import { config } from '../config/env.config';

/**
 * BasePage - Base class for all Page Objects
 * Contains common functionality shared across pages
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a URL
   * @param url - Full URL or relative path
   */
  async goto(url: string): Promise<void> {
    const fullUrl = url.startsWith('http') ? url : `${config.baseURL}${url}`;
    await this.page.goto(fullUrl, {
      timeout: config.timeout.navigation,
      waitUntil: 'domcontentloaded',
    });
  }

  /**
   * Wait for element to be visible
   * @param selector - CSS or XPath selector
   * @param timeout - Optional custom timeout
   */
  async waitForElement(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, {
      state: 'visible',
      timeout: timeout || config.timeout.element,
    });
  }

  /**
   * Click on element
   * @param selector - CSS or XPath selector
   */
  async clickElement(selector: string): Promise<void> {
    await this.page.click(selector, { timeout: config.timeout.element });
  }

  /**
   * Take screenshot with custom name
   * @param name - Screenshot filename
   */
  async takeScreenshot(name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}_${timestamp}.png`;
    await this.page.screenshot({
      path: `${config.screenshots.path}/${filename}`,
      fullPage: true,
    });
    console.log(`Screenshot saved: ${filename}`);
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('load', {
      timeout: config.timeout.navigation,
    });
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Check if element exists on page
   * @param selector - CSS or XPath selector
   */
  async isElementVisible(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, {
        state: 'visible',
        timeout: 3000,
      });
      return true;
    } catch {
      return false;
    }
  }
}
