import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage - Handles authentication
 * Currently supports Guest mode, prepared for future login implementation
 */
export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    // eBay login selectors (for future use)
    this.usernameInput = page.locator('#userid');
    this.passwordInput = page.locator('#pass');
    this.loginButton = page.locator('#sgnBt');
  }

  /**
   * Login function - Authentication
   * @param username - Optional username
   * @param password - Optional password
   */
  async login(username?: string, password?: string): Promise<void> {
    if (!username || !password) {
      console.log('No credentials provided - Proceeding as Guest.');
      await this.goto('https://www.ebay.com');
      await this.waitForPageLoad();
      return;
    }

    // Future: Implement actual login when credentials are available
    // await this.goto('https://signin.ebay.com');
    // await this.usernameInput.fill(username);
    // await this.passwordInput.fill(password);
    // await this.loginButton.click();
    // await this.waitForPageLoad();
  }
}
