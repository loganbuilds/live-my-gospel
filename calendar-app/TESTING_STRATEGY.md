# Testing Strategy for Live My Gospel Calendar

## Overview

This document outlines the comprehensive testing strategy for the Live My Gospel calendar application. The goal is to achieve world-class engineering quality through a multi-layered testing approach.

## Testing Stack

### 1. Unit Testing
- **Framework**: Vitest 4.0.6
- **Utilities**: @testing-library/jest-dom
- **Purpose**: Test individual functions in isolation

### 2. Integration Testing
- **Framework**: React Testing Library 16.3.0
- **Purpose**: Test component interactions and state management

### 3. End-to-End Testing
- **Framework**: Playwright (to be configured)
- **Purpose**: Test complete user workflows

## Current Implementation Status

### ✅ Completed
1. **Testing Infrastructure Setup**
   - Vitest configuration with React 19 support
   - React Testing Library integration
   - Test scripts in package.json:
     - `npm test` - Run tests in watch mode
     - `npm run test:run` - Run tests once
     - `npm run test:ui` - Open Vitest UI
     - `npm run test:coverage` - Generate coverage report

2. **Utility Functions Unit Tests**
   - **File**: `lib/time-utils.test.ts` (37 tests passing)
   - **Coverage**: Time parsing, formatting, and date calculations
   - **Test Categories**:
     - Time parsing (AM/PM to 24-hour format)
     - Duration calculations
     - Event positioning
     - Date formatting
     - Week calculation (Wednesday-based)
     - Integration tests for reversibility

### 📋 Next Steps

## Phase 1: Unit Test Coverage (1-2 weeks)

### 1.1 Extract More Utility Functions
Currently, the main `page.tsx` has 1500+ lines. Extract testable logic:

**Priority Files to Create:**
```
lib/
  ├── time-utils.ts ✅ (done)
  ├── time-utils.test.ts ✅ (done)
  ├── event-utils.ts (to create)
  ├── event-utils.test.ts (to create)
  ├── calendar-utils.ts (to create)
  └── calendar-utils.test.ts (to create)
```

**Functions to Extract:**

**`lib/event-utils.ts`**
- Event validation
- Event conflict detection
- Event filtering by date
- Event sorting
- Repeat event generation

**`lib/calendar-utils.ts`**
- Calendar day generation for date picker
- Month navigation logic
- Date comparison utilities
- Holiday/special day detection (future)

### 1.2 Target Code Coverage
- **Goal**: 80%+ coverage for utility functions
- **Strategy**: Test both happy paths and edge cases
- **Run**: `npm run test:coverage` to track progress

## Phase 2: Component Refactoring (2-3 weeks)

### 2.1 Break Down `page.tsx`
The monolithic component should be split into testable components:

```
components/
  ├── Calendar/
  │   ├── Calendar.tsx
  │   ├── Calendar.test.tsx
  │   ├── CalendarGrid.tsx
  │   ├── CalendarGrid.test.tsx
  │   ├── EventBlock.tsx
  │   └── EventBlock.test.tsx
  ├── Events/
  │   ├── EventForm.tsx
  │   ├── EventForm.test.tsx
  │   ├── EventTypeSelector.tsx
  │   ├── EventTypeSelector.test.tsx
  │   └── EventSummary.tsx
  ├── Pickers/
  │   ├── DatePicker.tsx
  │   ├── DatePicker.test.tsx
  │   ├── TimePicker.tsx
  │   └── TimePicker.test.tsx
  └── WeeklyIndicators/
      ├── WeeklyIndicators.tsx
      └── WeeklyIndicators.test.tsx
```

### 2.2 Component Testing Strategy

**Example Test Structure for Components:**

```typescript
describe('EventForm', () => {
  // Rendering tests
  it('should render with default values', () => {...});

  // Interaction tests
  it('should update title when user types', async () => {...});

  // Validation tests
  it('should show error for invalid time range', () => {...});

  // Integration tests
  it('should call onSave with correct data', async () => {...});
});
```

## Phase 3: Integration Testing (2-3 weeks)

### 3.1 State Management Testing
Test complex state interactions:

**Test Scenarios:**
- Creating an event updates the events array
- Dragging an event updates position and shows undo
- Undo restores previous event state
- Date navigation filters events correctly
- Weekly indicators recalculate on event changes

### 3.2 Drag and Drop Testing
Special focus on the drag-and-drop functionality:

```typescript
describe('Event Drag and Drop', () => {
  it('should update event time when dragged vertically', () => {...});
  it('should move event to different day when dragged horizontally', () => {...});
  it('should snap to 15-minute intervals', () => {...});
  it('should show undo snackbar after drag', () => {...});
  it('should restore event on undo', () => {...});
});
```

### 3.3 Modal Interactions
Test all modal flows:
- Event type selection → Event form → Save
- Event click → Event summary → Edit
- Date picker navigation and selection
- Time picker (analog clock) interaction

## Phase 4: E2E Testing with Playwright (1-2 weeks)

### 4.1 Setup Playwright
```bash
npm install -D @playwright/test
npx playwright install
```

### 4.2 Critical User Journeys

**Test Suite 1: Event Management**
```typescript
test('should create a new event end-to-end', async ({ page }) => {
  // Navigate to calendar
  // Click on time slot
  // Select event type
  // Fill out form
  // Save event
  // Verify event appears in calendar
});

test('should edit an existing event', async ({ page }) => {...});
test('should delete an event', async ({ page }) => {...});
```

**Test Suite 2: Calendar Navigation**
```typescript
test('should navigate between dates', async ({ page }) => {...});
test('should navigate between weeks', async ({ page }) => {...});
test('should use date picker to jump to specific date', async ({ page }) => {...});
```

**Test Suite 3: Drag and Drop**
```typescript
test('should drag event to new time', async ({ page }) => {...});
test('should drag event to different day', async ({ page }) => {...});
test('should undo drag operation', async ({ page }) => {...});
```

**Test Suite 4: Weekly Indicators**
```typescript
test('should update indicators when events are added', async ({ page }) => {...});
test('should allow editing indicator values', async ({ page }) => {...});
```

### 4.3 Cross-Browser Testing
- Chromium (primary)
- Firefox
- WebKit (Safari)
- Mobile viewports

## Phase 5: Performance & Accessibility Testing (1 week)

### 5.1 Performance Tests
- Lighthouse CI integration
- Measure event rendering time with large datasets
- Test scroll performance with 100+ events

### 5.2 Accessibility Tests
- `@axe-core/playwright` for automated a11y testing
- Keyboard navigation tests
- Screen reader compatibility
- WCAG 2.1 AA compliance

## Testing Best Practices

### 1. Test Structure (AAA Pattern)
```typescript
it('should do something', () => {
  // Arrange: Set up test data
  const input = '7:30 AM';

  // Act: Execute the function
  const result = parseTimeToHour(input);

  // Assert: Verify the result
  expect(result).toBe(7);
});
```

### 2. Test Naming
- Use descriptive names: "should [expected behavior] when [condition]"
- Group related tests with `describe` blocks
- Test both positive and negative cases

### 3. Test Independence
- Each test should be able to run in isolation
- Use `beforeEach` for setup, `afterEach` for cleanup
- Don't rely on test execution order

### 4. Mocking Strategy
- Mock external dependencies (APIs, localStorage)
- Don't mock the code you're testing
- Use real implementations when possible

### 5. Coverage Goals
- **Utilities**: 90%+ coverage (pure functions are easy to test)
- **Components**: 80%+ coverage (focus on user interactions)
- **Integration**: 70%+ coverage (test critical paths)
- **E2E**: Cover all user journeys (not measured by coverage)

## Running Tests

### Development Workflow
```bash
# Watch mode during development
npm test

# Run all tests once
npm run test:run

# Visual UI for debugging
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### CI/CD Integration (Future)
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

## Example Test Files

### Unit Test Example (Already Implemented)
See `lib/time-utils.test.ts` - This demonstrates:
- Clear test organization with `describe` blocks
- Edge case testing (midnight, noon, invalid inputs)
- Integration tests (reversibility checks)
- Comprehensive coverage (37 tests for 7 functions)

### Component Test Example (To Implement)
```typescript
// components/Events/EventForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventForm from './EventForm';

describe('EventForm', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
  });

  it('should render all form fields', () => {
    render(<EventForm onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
  });

  it('should call onSave with form data when submitted', async () => {
    const user = userEvent.setup();
    render(<EventForm onSave={mockOnSave} onCancel={mockOnCancel} />);

    await user.type(screen.getByLabelText(/title/i), 'Morning Workout');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Morning Workout'
      })
    );
  });
});
```

## Continuous Improvement

### Code Review Checklist
- [ ] All new features include tests
- [ ] Tests are meaningful (not just for coverage)
- [ ] Edge cases are covered
- [ ] Tests are readable and maintainable
- [ ] No flaky tests (tests that randomly fail)

### Metrics to Track
- Overall test coverage percentage
- Number of tests (target: 200+ tests)
- Test execution time (keep under 30s for unit tests)
- Flaky test rate (target: 0%)
- PR merge rate with tests vs without

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Questions or Issues?

For testing-related questions:
1. Check the Vitest documentation
2. Review existing test examples in `lib/time-utils.test.ts`
3. Run tests with `npm run test:ui` for interactive debugging
4. Use `console.log` or debugger statements in tests

---

**Last Updated**: January 2025
**Status**: Phase 1 (Unit Testing) - In Progress
**Current Coverage**: 37 tests passing, utility functions covered
