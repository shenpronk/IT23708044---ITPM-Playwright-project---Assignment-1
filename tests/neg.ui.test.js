import { test, expect } from '@playwright/test';
import fs from 'fs';

// Load test cases from JSON (converted from Excel)
const testCasesRaw = JSON.parse(fs.readFileSync('./tests/test_cases_from_excel.json', 'utf-8'));

// Filter negative UI tests
const negUITests = testCasesRaw.filter(tc => tc.id.startsWith('Neg_UI'));

// IMPROVED Helper function to wait for output to stabilize
async function waitForOutputToStabilize(outputField, maxWaitMs = 20000) {
  const startTime = Date.now();
  let previousOutput = '';
  let stableCount = 0;
  const requiredStableChecks = 6; // 3 seconds of stability
  
  while (Date.now() - startTime < maxWaitMs) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const currentOutput = await outputField.textContent();
      
      if (currentOutput === previousOutput && currentOutput.trim().length > 0) {
        stableCount++;
        if (stableCount >= requiredStableChecks) {
          return currentOutput;
        }
      } else {
        stableCount = 0;
        previousOutput = currentOutput;
      }
    } catch (error) {
      continue;
    }
  }
  
  return previousOutput;
}

for (const tc of negUITests) {
  test(`[${tc.id}] ${tc.name}`, async ({ page }) => {
    test.setTimeout(90000);
    
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const inputField = page.getByPlaceholder('Input Your Singlish Text Here.');
    await inputField.waitFor({ state: 'visible', timeout: 15000 });

    await inputField.clear();
    await page.waitForTimeout(1000);
    await inputField.fill(tc.input);
    await page.waitForTimeout(1000);

    const outputField = page.locator('div.bg-slate-50').first();
    await outputField.waitFor({ state: 'visible', timeout: 15000 });

    const actualOutput = await waitForOutputToStabilize(outputField, 20000);
    const trimmedActual = actualOutput.trim();
    const trimmedExpected = tc.expected.trim();

    // Neg_UI cases: the app produces WRONG output – actual should NOT match expected
    try {
      expect(trimmedActual).not.toBe(trimmedExpected);
      console.log(`✅ ${tc.id} failed as expected (documenting UI bug)`);
    } catch (error) {
      console.log(`❌ ${tc.id} passed unexpectedly (bug may be fixed)`);
      console.log(`  Expected: ${trimmedExpected}`);
      console.log(`  Actual:   ${trimmedActual}`);
      throw error;
    }
  });
}
