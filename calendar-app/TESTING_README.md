# Testing Quick Start Guide

## What Was Set Up

### 1. Testing Framework
- **Vitest** - Fast, modern test runner for JavaScript/TypeScript
- **React Testing Library** - For component testing
- **@testing-library/jest-dom** - Custom matchers for better assertions
- **jsdom** - Browser environment simulation

### 2. Configuration Files
- `vitest.config.ts` - Main Vitest configuration
- `vitest.setup.ts` - Test setup and global configurations
- Updated `package.json` with test scripts

### 3. Example Implementation
- `lib/time-utils.ts` - Extracted utility functions from main component
- `lib/time-utils.test.ts` - Comprehensive unit tests (37 tests passing)

## Running Tests

### Quick Commands
```bash
# Run tests in watch mode (recommended for development)
npm test

# Run tests once (good for CI/CD)
npm run test:run

# Open visual UI for exploring tests
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Results

Current status: **37 tests passing** ✅

```
Test Files  1 passed (1)
Tests  37 passed (37)
Duration  2.14s
```

### What's Tested
- ✅ Time parsing (AM/PM to 24-hour format)
- ✅ Minutes calculation
- ✅ Event duration calculation
- ✅ Event positioning offsets
- ✅ Time formatting
- ✅ Date formatting
- ✅ Week calculation (Wednesday-based calendar)
- ✅ Integration tests for reversibility

## Example Test Output

```typescript
describe('parseTimeToHour', () => {
  it('should parse morning times correctly', () => {
    expect(parseTimeToHour('7:30 AM')).toBe(7);
    expect(parseTimeToHour('9:00 AM')).toBe(9);
  });

  it('should handle midnight correctly', () => {
    expect(parseTimeToHour('12:00 AM')).toBe(0);
  });
});
```

## Next Steps

### Phase 1: Continue Unit Testing
1. Extract more utility functions from `page.tsx`
2. Create `event-utils.ts` for event manipulation logic
3. Create `calendar-utils.ts` for calendar calculations
4. Aim for 80%+ code coverage

### Phase 2: Component Testing
1. Break down the 1500-line `page.tsx` into smaller components
2. Write tests for each component
3. Test user interactions (clicks, typing, drag-and-drop)

### Phase 3: E2E Testing
1. Install Playwright
2. Write end-to-end tests for complete user workflows
3. Test across different browsers

## Writing Your First Test

### 1. Create a Test File
Name your test file with `.test.ts` or `.test.tsx` extension:
```
myFunction.ts
myFunction.test.ts  ← Test file
```

### 2. Write a Test
```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myFunction';

describe('myFunction', () => {
  it('should return expected value', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### 3. Run Your Test
```bash
npm test
```

## Common Matchers

```typescript
// Equality
expect(value).toBe(5)
expect(value).toEqual({ key: 'value' })

// Truthiness
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeDefined()
expect(value).toBeNull()

// Numbers
expect(value).toBeGreaterThan(3)
expect(value).toBeLessThan(5)
expect(value).toBeCloseTo(4.2, 1)

// Strings
expect(str).toMatch(/pattern/)
expect(str).toContain('substring')

// Arrays
expect(arr).toContain('item')
expect(arr).toHaveLength(3)

// DOM (with @testing-library/jest-dom)
expect(element).toBeInTheDocument()
expect(element).toHaveTextContent('text')
expect(element).toBeVisible()
```

## Test Organization

```typescript
describe('Feature Name', () => {
  // Group related tests
  describe('when condition is true', () => {
    it('should behave correctly', () => {
      // Test implementation
    });
  });

  describe('when condition is false', () => {
    it('should handle error case', () => {
      // Test implementation
    });
  });
});
```

## Debugging Tests

### 1. Use test:ui
```bash
npm run test:ui
```
Opens a visual interface where you can:
- See all tests
- Run individual tests
- View test output
- Debug failures

### 2. Use console.log
```typescript
it('should work', () => {
  const result = myFunction();
  console.log('Result:', result);
  expect(result).toBe(expected);
});
```

### 3. Use Vitest Debug Mode
```typescript
it.only('should work', () => {
  // Only this test will run
});

it.skip('should work', () => {
  // This test will be skipped
});
```

## Coverage Report

After running `npm run test:coverage`, open:
```
calendar-app/coverage/index.html
```

This shows:
- Which files are tested
- Which lines are covered
- Which branches are tested
- Overall coverage percentage

## Tips for Writing Good Tests

### ✅ Do
- Test behavior, not implementation
- Write descriptive test names
- Test edge cases and error conditions
- Keep tests simple and focused
- Use meaningful variable names

### ❌ Don't
- Test implementation details
- Make tests depend on each other
- Write overly complex tests
- Test third-party libraries
- Aim for 100% coverage at the expense of quality

## Resources

- **Full Strategy**: See `TESTING_STRATEGY.md`
- **Vitest Docs**: https://vitest.dev/
- **Testing Library**: https://testing-library.com/
- **Example Tests**: Check `lib/time-utils.test.ts`

## Need Help?

1. Run `npm run test:ui` to explore tests visually
2. Check existing test files for examples
3. Review `TESTING_STRATEGY.md` for comprehensive guide
4. Check Vitest documentation for specific features

---

**Happy Testing! 🧪**
