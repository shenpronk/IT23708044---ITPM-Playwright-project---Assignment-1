import { test, expect } from '@playwright/test';
import fs from 'fs';

// Load test cases from JSON (converted from Excel)
const testCasesRaw = JSON.parse(fs.readFileSync('./tests/test_cases_from_excel.json', 'utf-8'));

// Find the positive UI test
const posUITest = testCasesRaw.find(tc => tc.id === 'Pos_UI_0001');

if (posUITest) {
  test(`[${posUITest.id}] ${posUITest.name}`, async ({ page }) => {
    test.setTimeout(90000);
    
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const inputField = page.getByPlaceholder('Input Your Singlish Text Here.');
    await inputField.waitFor({ state: 'visible', timeout: 15000 });

    const outputField = page.locator('div.bg-slate-50').first();

    // --- Test: Real-time output updating behavior (NOT exact text match!)
    
    // Step 1: Clear input
    await inputField.clear();
    await page.waitForTimeout(2000);

    // Step 2: Type partial input and verify real-time update
    const inputText = posUITest.input;
    const midpoint = Math.floor(inputText.length / 2);

    // Type first half
    await inputField.fill(inputText.substring(0, midpoint));
    await page.waitForTimeout(5000);

    // Output should update in real-time (not empty)
    await outputField.waitFor({ state: 'visible', timeout: 10000 });
    const partialOutput = await outputField.textContent();
    expect(partialOutput.trim().length).toBeGreaterThan(0);
    console.log('✅ Real-time output detected during typing');

    // Step 3: Complete the input
    await inputField.clear();
    await page.waitForTimeout(2000);
    await inputField.fill(inputText);
    await page.waitForTimeout(8000);

    // Verify final output exists (content check, not exact match)
    const finalOutput = await outputField.textContent();
    expect(finalOutput.trim().length).toBeGreaterThan(0);
    
    // Verify output is in Sinhala unicode (contains Sinhala characters)
    const hasSinhalaChars = /[\u0D80-\u0DFF]/.test(finalOutput);
    expect(hasSinhalaChars).toBe(true);
    
    console.log(`✅ ${posUITest.id} passed - Real-time conversion working`);
    console.log(`  Input: ${inputText}`);
    console.log(`  Output: ${finalOutput.trim()}`);
    console.log(`  Note: UI test checks real-time behavior, not exact text match`);
  });
}
