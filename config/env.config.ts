/**
 * Environment Configuration
 * Centralized configuration for URLs, timeouts, and settings
 */

export const config = {
  baseURL: 'https://www.ebay.com',
  
  timeout: {
    default: 30000,
    navigation: 60000,
    element: 10000,
  },
  
  currency: {
    symbol: '$',
    code: 'USD',
  },
  
  pagination: {
    maxPages: 10, // Maximum pages to traverse during search
  },
  
  screenshots: {
    path: './test-results/screenshots',
  },
};
