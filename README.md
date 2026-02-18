# eBay E2E Testing with Playwright & Allure Reports

## 📋 Project Overview

This project implements an end-to-end (E2E) automation testing framework for eBay's e-commerce platform. The framework demonstrates:

- ✅ **Page Object Model (POM)** architecture
- ✅ **Object-Oriented Programming (OOP)** principles
- ✅ **Data-Driven Testing** with external JSON configuration
- ✅ **Smart locators** and robust element handling
- ✅ **Variant selection** (size, color, quantity)
- ✅ **Pagination support** for multi-page results
- ✅ **Price parsing** and validation
- ✅ **Allure Reports** integration

---

## 🎯 Test Scenarios

The framework implements 4 core functions:

### 1. **Login Function**
```typescript
async login(username?: string, password?: string)
```
- Currently operates in **Guest mode** (no credentials required)
- Prepared for future authentication implementation
- Navigates to eBay homepage

### 2. **Search Items by Price**
```typescript
async searchItemsByNameUnderPrice(query: string, maxPrice: number, limit: number): Promise<string[]>
```
- Searches for products by keyword
- Applies price filter (max price)
- Extracts up to N items meeting price criteria
- **Supports pagination** - automatically navigates through multiple pages
- Returns array of product URLs

### 3. **Add Items to Cart**
```typescript
async addItemsToCart(urls: string[]): Promise<void>
```
- Iterates through product URLs
- **Automatically selects random variants** (size, color, material)
- Adds items to shopping cart
- Takes screenshots for each item

### 4. **Assert Cart Total**
```typescript
async assertCartTotalNotExceeds(budgetPerItem: number, itemsCount: number): Promise<void>
```
- Opens shopping cart
- Validates total amount ≤ (budgetPerItem × itemsCount)
- Captures cart screenshot
- Throws assertion error if budget exceeded

---

## 🏗️ Architecture

### Project Structure

```
playwright-TS-e2e-ebay-allure/
├── config/
│   └── env.config.ts           # Environment configuration (URLs, timeouts)
├── pages/                       # Page Object Model
│   ├── BasePage.ts             # Base class with common methods
│   ├── LoginPage.ts            # Authentication page
│   ├── SearchPage.ts           # Search & filtering & pagination
│   ├── ProductPage.ts          # Variant selection & add to cart
│   └── CartPage.ts             # Cart validation
├── utils/                       # Helper utilities
│   ├── PriceParser.ts          # Price string → number conversion
│   └── RandomSelector.ts       # Random variant selection
├── data/
│   └── test-data.json          # Test scenarios (Data-Driven)
├── tests/
│   └── ebay-shopping.spec.ts   # Main test suite
├── playwright.config.ts         # Playwright configuration
├── package.json
└── README.md
```

### Design Principles

#### **1. Page Object Model (POM)**
- Each page is represented by a class
- Locators are defined as class members
- Business logic is encapsulated in page methods
- Tests only interact with page objects, not raw locators

#### **2. Object-Oriented Programming (OOP)**
- Inheritance: All pages extend `BasePage`
- Encapsulation: Private methods for internal logic
- Single Responsibility Principle (SRP): Each class has one purpose

#### **3. Data-Driven Testing**
- Test data stored in `data/test-data.json`
- Tests iterate over scenarios dynamically
- Easy to add new test cases without code changes

#### **4. Robust Locators**
- Multiple fallback selectors for each element
- Smart variant detection (size/color dropdowns and buttons)
- Graceful handling of missing elements

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning)

### Installation

1. **Clone the repository** (or download ZIP)
```bash
git clone <repository-url>
cd playwright-TS-e2e-ebay-allure
```

2. **Install dependencies**
```bash
npm install
```

3. **Install Playwright browsers**
```bash
npx playwright install
```

---

## ▶️ Running Tests

### Run Tests (Chromium only - faster)
```bash
npm test
```

### Run Tests (All browsers)
```bash
npm run test:all
```

### Run Tests in Headed Mode (visible browser)
```bash
npm run test:headed
```

### Run Tests in Debug Mode
```bash
npm run test:debug
```

### Run Tests with UI Mode
```bash
npm run test:ui
```

---

## 📊 Viewing Reports

### Allure Report (Recommended)
```bash
npm run report:allure
```
This will:
1. Generate the Allure report from results
2. Automatically open it in your browser

### Playwright HTML Report
```bash
npm run report:html
```

### Report Locations
- **Allure Results**: `./allure-results/`
- **Allure Report**: `./allure-report/`
- **Playwright Report**: `./playwright-report/`
- **Screenshots**: `./test-results/screenshots/`

---

## 🎨 Code Conventions

This project follows TypeScript and Playwright best practices:

### Naming Conventions
- **Classes**: `PascalCase` (e.g., `SearchPage`, `ProductPage`)
- **Methods**: `camelCase` (e.g., `searchByKeyword`, `addToCart`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_PRICE`, `DEFAULT_TIMEOUT`)
- **Private methods**: Prefixed with `private` keyword

### Code Style
- **Async/Await**: All Playwright operations use async/await
- **Type Safety**: Full TypeScript typing (no `any` types)
- **Error Handling**: Try-catch blocks for critical operations
- **Logging**: Console output for debugging and transparency
- **Comments**: JSDoc comments for public methods

---

## 🔧 Configuration

### Environment Configuration (`config/env.config.ts`)
```typescript
{
  baseURL: 'https://www.ebay.com',
  timeout: {
    default: 30000,
    navigation: 60000,
    element: 10000,
  },
  currency: { symbol: '$', code: 'USD' },
  pagination: { maxPages: 10 }
}
```

### Test Data (`data/test-data.json`)
```json
{
  "scenarios": [
    {
      "name": "Shoes under $220",
      "query": "shoes",
      "maxPrice": 220,
      "limit": 5
    }
  ]
}
```

To add new scenarios, simply add objects to the `scenarios` array.

---

## 🎯 Key Features

### ✅ Smart Variant Selection
The framework automatically handles:
- **Size dropdowns** - Selects random available size
- **Color buttons** - Clicks random color option
- **Other variants** - Handles material, style, etc.
- **Quantity** - Maintains default quantity of 1

### ✅ Pagination Support
- Automatically navigates to next page if insufficient items found
- Collects items from up to 10 pages (configurable)
- Stops when target number of items is reached

### ✅ Price Parsing
Handles various price formats:
- `$50.99`
- `$1,234.56`
- `US $999.00`

### ✅ Robust Locators
Uses multiple fallback selectors:
```typescript
const totalSelectors = [
  '[data-test-id="SUBTOTAL"] .text-display-24',
  '.cart-summary-amount',
  '.total-row .text-display-24',
  'span:has-text("Subtotal") + span',
];
```

---

## 🚨 Limitations & Assumptions

### Authentication
- **Guest Mode Only**: Currently no login required
- Future implementation prepared with selectors
- eBay allows browsing and cart operations without authentication

### Currency
- **USD Only**: All prices in US Dollars ($)
- Parser configured for USD format

### Browsers
- **Default**: Chromium (Chrome) for speed
- **Available**: Firefox, WebKit (Safari)
- Use `npm run test:all` for multi-browser testing

### Network
- Tests require stable internet connection
- eBay website availability required
- Timeouts configured for slow networks (60s navigation)

### Cart Persistence
- Cart contents may persist between test runs
- Consider clearing cart before critical tests
- Tests are designed to work with existing cart items

### Dynamic Content
- eBay uses dynamic pricing and inventory
- Tests may find fewer items than requested
- Assertions handle variable item counts

---

## 📈 Test Results

### Success Criteria
✅ At least 1 item found within price range  
✅ All items successfully added to cart  
✅ Cart total ≤ (budgetPerItem × itemsCount)  
✅ Screenshots captured for all steps  

### Typical Execution Time
- Single scenario: 2-3 minutes
- Full test suite: 10-15 minutes
- Depends on: network speed, item availability, page load times

---

## 🐛 Troubleshooting

### Issue: Tests timeout
**Solution**: Increase timeout in `playwright.config.ts`:
```typescript
timeout: 180000, // 3 minutes
```

### Issue: No items found
**Solution**: 
- Check internet connection
- Try different search query
- Increase `maxPrice` in test data

### Issue: Cannot add to cart
**Solution**:
- Item may require variant selection (already handled)
- Item may be sold out
- Check screenshots in `test-results/screenshots/`

### Issue: Allure report not generating
**Solution**:
```bash
# Install Allure CLI globally
npm install -g allure-commandline

# Generate report manually
allure generate allure-results --clean
allure open
```

---

## 📚 Test Cases Included

1. **Data-Driven Scenarios** (from JSON)
   - Shoes under $220
   - Laptop under $500

2. **Function Tests**
   - `searchItemsByNameUnderPrice` validation
   - `addItemsToCart` validation
   - `assertCartTotalNotExceeds` validation

3. **Edge Case Tests**
   - Variant selection on clothing items
   - Pagination with multiple pages
   - Items with/without variants

---

## 🎓 Technologies Used

| Technology | Purpose |
|------------|---------|
| **Playwright** | Browser automation framework |
| **TypeScript** | Type-safe programming language |
| **Allure** | Test reporting and visualization |
| **Node.js** | JavaScript runtime |
| **JSON** | Test data storage (Data-Driven) |

---

## 👨‍💻 Development Notes

### Adding New Tests
1. Add scenario to `data/test-data.json`
2. Tests will automatically pick it up (Data-Driven)

### Adding New Pages
1. Create class extending `BasePage`
2. Define locators as `readonly` members
3. Implement business logic methods

### Modifying Locators
- Update locators in respective Page Objects
- Use Playwright Inspector: `npx playwright codegen ebay.com`

---

## 📞 Support

For issues or questions:
1. Check `test-results/` for screenshots and traces
2. Review console output for detailed logs
3. Use debug mode: `npm run test:debug`

---

## 📄 License

ISC

---

**Author**: Automation Engineer  
**Framework**: Playwright + TypeScript + Allure  
**Last Updated**: February 2026
