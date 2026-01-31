# SwiftTranslator – Playwright Test Suite
## IT3040 ITPM Assignment 1

Automated test suite for [swifttranslator.com](https://www.swifttranslator.com/) covering **35 test cases** as per assignment requirements:
- **24 Positive Functional tests** (Pos_Fun_0001 to Pos_Fun_0024)
- **7 Negative UI tests** (Neg_UI_0001 to Neg_UI_0007)
- **3 Negative Functional tests** (Neg_Fun_0008 to Neg_Fun_0010)
- **1 Positive UI test** (Pos_UI_0001)

**Total: 24 positive (including 1 UI) + 10 negative = 34 functional + 1 UI = 35 tests** ✅

---

## Assignment Requirements Met

### ✅ 24 Positive Scenarios (System Converts Correctly)
All test cases where SwiftTranslator correctly converts Singlish to Sinhala, covering:
- Sentence structures (simple, compound, complex)
- Interrogative and imperative forms
- Tense variations (past, present, future)
- Singular/plural forms
- Mixed Singlish + English content
- Polite vs informal phrasing
- Various input lengths (S, M, L)

### ✅ 10 Negative Scenarios (System Fails or Behaves Incorrectly)
- **7 Negative UI tests** - Document UI rendering/conversion issues
- **3 Negative Functional tests** - Document functional conversion failures

### ✅ 1 UI-Related Test Scenario
- **Pos_UI_0001** - Tests real-time output updating behavior

### ✅ Coverage Areas (As Required by Assignment)
Each of the following is covered at least once:
- ✅ Sentence structures (simple, compound, complex)
- ✅ Interrogative (questions) and imperative (commands)
- ✅ Positive and negative sentence forms
- ✅ Daily language usage
- ✅ Common greetings, requests, and responses
- ✅ Polite vs informal phrasing
- ✅ Multi-word expressions and collocations
- ✅ Joined vs segmented word variations
- ✅ Repeated word expressions for emphasis
- ✅ Tense variations (past, present, future)
- ✅ Negation patterns
- ✅ Singular/plural usage and pronoun variations
- ✅ Request forms with varying politeness
- ✅ Input length variation (S ≤30, M 31-299, L ≥300)
- ✅ Mixed language content (Singlish + English)
- ✅ English technical/brand terms embedded
- ✅ Places and common English words
- ✅ English abbreviations
- ✅ Punctuation marks
- ✅ Currency, time, date formats
- ✅ Multiple spaces and line breaks
- ✅ Informal language and slang

---

## Prerequisites

- **Node.js** v18 or higher → [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

---

## Installation & Setup

### 1. Extract or Clone the Project

```bash
cd IT23708044-ITPM-ASSIGNME  # Or your folder name
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Playwright Browsers

```bash
npx playwright install
```

If you get a permission error on Windows, run in **Administrator** terminal.

---

## Running the Tests

### Verify Tests Are Detected

```bash
npx playwright test --list
```

You should see all 35 tests listed.

### Run All Tests (Headless Mode)

```bash
npm test
```

### Run All Tests With Visible Browser

```bash
npm run test:headed
```

### Run Specific Test File

```bash
# Run only positive/negative functional tests (27 tests)
npx playwright test tests/functional.test.js

# Run only negative UI tests (7 tests)
npx playwright test tests/neg_ui.test.js

# Run only positive UI test (1 test)
npx playwright test tests/ui.test.js
```

### Run Single Test Case by ID

```bash
npx playwright test --grep "Pos_Fun_0001"
npx playwright test --grep "Neg_UI_0001"
npx playwright test --grep "Pos_UI_0001"
```

### Run With Debug Mode

```bash
npx playwright test --debug
```

---

## View Test Report

After any test run, open the HTML report:

```bash
npx playwright show-report
```

This shows:
- Pass/fail status for all tests
- Execution times
- Screenshots for failures
- Full test logs

---

## Project Structure

```
IT23708044-ITPM-ASSIGNME/
├── node_modules/
├── playwright-report/           ← Generated HTML report
├── test-results/                ← Screenshots & artifacts
├── tests/                       
│   ├── test_cases_from_excel.json   ← Test cases from your Excel file
│   ├── functional.test.js           ← Pos_Fun + Neg_Fun tests (27 cases)
│   ├── neg_ui.test.js               ← Neg_UI tests (7 cases)
│   └── ui.test.js                   ← Pos_UI test (1 case)
├── package.json                 
├── playwright.config.js         ← Playwright configuration
├── README.md                    ← This file
└── Assignment_1_-_Test_cases.xlsx  ← Your Excel file with test cases
```

---

## How the Tests Work

### Selector Strategy (Fixed!)

Based on actual website inspection:

**Input field:**
```javascript
page.getByPlaceholder('Input Your Singlish Text Here.')
```

**Output field (Important!):**
```javascript
page.locator('div.bg-slate-50').first()  // It's a DIV, not textarea!
```

### Test Flow

1. Navigate to swifttranslator.com
2. Wait for page to load
3. Find input textarea using placeholder text
4. Type Singlish input
5. Wait for real-time Sinhala output in output div
6. Read output using `textContent()` (since it's a div)
7. Compare with expected output

### Expected Results

**Positive Tests (should PASS ✅):**
- Actual output matches expected output
- System converts correctly

**Negative Tests (should FAIL ❌ by design):**
- Actual output does NOT match expected output
- Documents known bugs/issues

---

## Test Case Categories

### Positive Functional Tests (24 cases) - Status: Pass

| Test ID | Description | Length | Coverage Area |
|---------|-------------|--------|---------------|
| Pos_Fun_0001 | Singular form conversion | S | Daily language, Simple sentence |
| Pos_Fun_0002 | Plural tense conversion | S | Daily language, Plural form |
| Pos_Fun_0003 | Abbreviation preservation | S | Mixed Singlish + English |
| Pos_Fun_0004 | Polite request form | M | Greeting/request, Imperative |
| Pos_Fun_0005 | Multi-lined story with English | L | Mixed language, Past tense |
| ... | ... | ... | ... |
| Pos_Fun_0024 | Imperative command form | S | Daily language, Imperative |

### Negative UI Tests (7 cases) - Status: Fail (Expected)

| Test ID | Description | Issue Type |
|---------|-------------|-----------|
| Neg_UI_0001 | English slang | Slang not preserved |
| Neg_UI_0002 | Names in capital | Incorrect transliteration |
| Neg_UI_0003 | Time reference complex | Wrong character rendering |
| Neg_UI_0004 | English brand name | Brand name corrupted |
| Neg_UI_0005 | Formal plural present | Incorrect character |
| Neg_UI_0006 | Expected spelling missed | Spelling error |
| Neg_UI_0007 | English word not preserved | English converted wrongly |

### Negative Functional Tests (3 cases) - Status: Fail (Expected)

| Test ID | Description | Issue Type |
|---------|-------------|-----------|
| Neg_Fun_0008 | Words joined without spaces | No word segmentation |
| Neg_Fun_0009 | Non-standard slang spelling | Repeated characters issue |
| Neg_Fun_0010 | Complex lettering | Character rendering error |

### Positive UI Test (1 case) - Status: Pass

| Test ID | Description | What it tests |
|---------|-------------|---------------|
| Pos_UI_0001 | Real-time output updates | Output updates while typing |

---

## Understanding Test Results

### Expected Outcome

When you run `npm test`, you should see:

```
✅ 25 passed  (24 Pos_Fun + 1 Pos_UI)
❌ 10 failed  (7 Neg_UI + 3 Neg_Fun) - This is EXPECTED!
```

**The negative tests are DESIGNED to fail** - they document known bugs in the system.

---

## Troubleshooting

### "No tests found"
```bash
# Verify installation
npm install

# List tests
npx playwright test --list
```

### Tests timeout
```bash
# Run with visible browser to see what's happening
npm run test:headed

# Or increase timeout in playwright.config.js
```

### Selector errors
The selectors are based on the actual website structure:
- Input: `<textarea>` with placeholder "Input Your Singlish Text Here."
- Output: `<div>` with class `bg-slate-50`

### Output doesn't match
- Website may have been updated
- Check if test case expected output is correct
- Run in headed mode to see actual output

---

## Assignment Submission Checklist

- [x] 24 positive functional test cases
- [x] 10 negative test cases (7 UI + 3 Functional)
- [x] 1 positive UI test case
- [x] All coverage areas addressed
- [x] Playwright automation complete
- [x] Test cases documented in Excel
- [x] README.md with clear instructions
- [x] playwright.config.js included
- [x] package.json with dependencies
- [x] Git repository ready (make it public!)

---

## Notes

- The output field is a `<div>`, not a `<textarea>` - this is why we use `textContent()`
- Website translates in real-time as you type
- Negative tests document known issues - their failure is expected
- Test cases match the Excel file exactly
- No samples from assignment brief are used (as required)

---

## Support

If tests fail unexpectedly:
1. Run `npm run test:headed` to see browser
2. Check `npx playwright show-report` for details
3. Verify Node.js version: `node --version` (should be v18+)
4. Ensure browsers installed: `npx playwright install`
5. Check if website is accessible

---

## Git Repository

Remember to:
1. Create a public Git repository
2. Push all files to it
3. Include the repository link in a separate text file
4. Ensure it's accessible for marking

```bash
git init
git add .
git commit -m "Initial commit - IT3040 ITPM Assignment 1"
git remote add origin <your-repo-url>
git push -u origin main
```

---

**Student ID:** IT23708044  
**Course:** IT3040 - ITPM  
**Assignment:** Assignment 1 - Test Automation
