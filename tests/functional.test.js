import { test, expect } from '@playwright/test';
import fs from 'fs';

// Load test cases from JSON (converted from Excel)
const testCasesRaw = JSON.parse(fs.readFileSync('./tests/test_cases_from_excel.json', 'utf-8'));

// Filter functional tests (Pos_Fun and Neg_Fun)
const functionalTests = testCasesRaw.filter(
  tc => tc.id.startsWith('Pos_Fun') || tc.id.startsWith('Neg_Fun')
);

// IMPROVED Helper function to wait for output to stabilize
async function waitForOutputToStabilize(outputField, maxWaitMs = 20000) {
  const startTime = Date.now();
  let previousOutput = '';
  let stableCount = 0;
  const requiredStableChecks = 6; // 3 seconds of stability (6 x 500ms)
  
  while (Date.now() - startTime < maxWaitMs) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const currentOutput = await outputField.textContent();
      
      // Only consider stable if output has actual content AND hasn't changed
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
      // Output field might not be ready yet, continue waiting
      continue;
    }
  }
  
  // Return the last output we got
  return previousOutput;
}

for (const tc of functionalTests) {
  test(`[${tc.id}] ${tc.name}`, async ({ page }) => {
    // Increase timeout for slow conversions
    test.setTimeout(90000); // 90 seconds per test
    
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Extra wait for page to fully load
    await page.waitForTimeout(2000);

    // Use the CORRECT selector - input textarea with placeholder
    const inputField = page.getByPlaceholder('Input Your Singlish Text Here.');
    await inputField.waitFor({ state: 'visible', timeout: 15000 });

    // Clear any existing text
    await inputField.clear();
    await page.waitForTimeout(1000); // Wait after clearing
    
    // Type the input
    await inputField.fill(tc.input);
    await page.waitForTimeout(1000); // Wait after typing

    // Wait for real-time output to appear - output is a DIV with bg-slate-50 class
    const outputField = page.locator('div.bg-slate-50').first();
    await outputField.waitFor({ state: 'visible', timeout: 15000 });

    // Smart wait: Wait for output to stabilize (stop changing)
    const actualOutput = await waitForOutputToStabilize(outputField, 20000);
    const trimmedActual = actualOutput.trim();
    const trimmedExpected = tc.expected.trim();

    // Determine if test should pass or fail based on status
    if (tc.status === 'Pass' || tc.status === 'pass') {
      // For PASS cases: actual output should match expected output
      try {
        expect(trimmedActual).toBe(trimmedExpected);
        console.log(`✅ ${tc.id} passed as expected`);
      } catch (error) {
        console.log(`\n❌ ${tc.id} FAILED - Output mismatch`);
        console.log(`  Test: ${tc.name}`);
        console.log(`  Input:    "${tc.input}"`);
        console.log(`  Expected: "${trimmedExpected}"`);
        console.log(`  Actual:   "${trimmedActual}"`);
        
        // Show character-by-character diff for debugging
        if (trimmedExpected.length !== trimmedActual.length) {
          console.log(`  Length: Expected ${trimmedExpected.length}, Got ${trimmedActual.length}`);
        }
        
        // Find first difference
        for (let i = 0; i < Math.max(trimmedExpected.length, trimmedActual.length); i++) {
          if (trimmedExpected[i] !== trimmedActual[i]) {
            console.log(`  First diff at position ${i}:`);
            console.log(`    Expected char: "${trimmedExpected[i]}" (code: ${trimmedExpected.charCodeAt(i)})`);
            console.log(`    Actual char:   "${trimmedActual[i]}" (code: ${trimmedActual.charCodeAt(i)})`);
            break;
          }
        }
        console.log('');
        throw error;
      }
    } else {
      // For FAIL cases: actual output should NOT match expected output
      // (the app produces incorrect output, which is the known failure)
      try {
        expect(trimmedActual).not.toBe(trimmedExpected);
        console.log(`✅ ${tc.id} failed as expected (documenting bug)`);
      } catch (error) {
        console.log(`❌ ${tc.id} passed unexpectedly (bug may be fixed)`);
        console.log(`  Expected: ${trimmedExpected}`);
        console.log(`  Actual:   ${trimmedActual}`);
        throw error;
      }
    }
  });
}
