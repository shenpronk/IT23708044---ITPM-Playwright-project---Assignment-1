#!/usr/bin/env node

/**
 * Quick diagnostic tool for failing tests
 * Run this to identify which tests need fixing and why
 */

import fs from 'fs';
import { chromium } from '@playwright/test';

const FAILING_TESTS = [
  'Pos_Fun_0001',
  'Pos_Fun_0009', 
  'Pos_Fun_0011',
  'Pos_Fun_0012',
  'Pos_Fun_0018',
  'Pos_Fun_0024',
  'Pos_UI_0001'
];

async function diagnoseTests() {
  console.log('🔍 Diagnosing failing tests...\n');
  console.log('⏱️  Using smart wait: waiting for output to stabilize\n');
  
  const testCases = JSON.parse(fs.readFileSync('./tests/test_cases_from_excel.json', 'utf-8'));
  const failingTCs = testCases.filter(tc => FAILING_TESTS.includes(tc.id));
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const results = [];
  
  // Helper function to wait for output to stabilize
  async function waitForOutputToStabilize(outputField, maxWaitMs = 15000) {
    const startTime = Date.now();
    let previousOutput = '';
    let stableCount = 0;
    
    while (Date.now() - startTime < maxWaitMs) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const currentOutput = await outputField.textContent();
      
      if (currentOutput === previousOutput) {
        stableCount++;
        if (stableCount >= 4) { // Output stable for 2 seconds (4 x 500ms)
          console.log(`   ⏱️  Output stabilized after ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
          return currentOutput;
        }
      } else {
        stableCount = 0;
        previousOutput = currentOutput;
      }
    }
    
    console.log(`   ⏱️  Max wait reached (${(maxWaitMs / 1000)}s)`);
    return previousOutput;
  }
  
  for (const tc of failingTCs) {
    console.log(`\n📝 Testing ${tc.id}: ${tc.name}`);
    console.log(`   Input: ${tc.input}`);
    
    await page.goto('https://www.swifttranslator.com');
    await page.waitForLoadState('domcontentloaded');
    
    const inputField = page.getByPlaceholder('Input Your Singlish Text Here.');
    await inputField.waitFor({ state: 'visible', timeout: 10000 });
    const outputField = page.locator('div.bg-slate-50').first();
    
    await inputField.clear();
    await page.waitForTimeout(500);
    await inputField.fill(tc.input);
    
    // Smart wait: Wait for output to stabilize
    const actualOutput = await waitForOutputToStabilize(outputField, 15000);
    const trimmedActual = actualOutput.trim();
    const trimmedExpected = tc.expected.trim();
    
    const matches = trimmedActual === trimmedExpected;
    
    console.log(`   Expected: ${trimmedExpected}`);
    console.log(`   Actual:   ${trimmedActual}`);
    console.log(`   Match: ${matches ? '✅ YES' : '❌ NO'}`);
    
    if (!matches) {
      console.log(`   ⚠️  This needs to be updated in Excel!`);
      
      // Character comparison
      if (trimmedExpected.length !== trimmedActual.length) {
        console.log(`   Length diff: Expected ${trimmedExpected.length}, Got ${trimmedActual.length}`);
      }
      
      // Find differences
      const maxLen = Math.max(trimmedExpected.length, trimmedActual.length);
      for (let i = 0; i < maxLen; i++) {
        if (trimmedExpected[i] !== trimmedActual[i]) {
          console.log(`   First diff at char ${i}:`);
          console.log(`     Expected: "${trimmedExpected[i]}" (${trimmedExpected.charCodeAt(i)})`);
          console.log(`     Actual:   "${trimmedActual[i]}" (${trimmedActual.charCodeAt(i)})`);
          break;
        }
      }
    }
    
    results.push({
      id: tc.id,
      name: tc.name,
      input: tc.input,
      expectedInExcel: trimmedExpected,
      actualFromWebsite: trimmedActual,
      matches: matches,
      needsExcelUpdate: !matches
    });
  }
  
  await browser.close();
  
  // Save results
  fs.writeFileSync('./tests/diagnostic_results.json', JSON.stringify(results, null, 2), 'utf-8');
  
  console.log('\n\n📊 SUMMARY');
  console.log('='.repeat(60));
  
  const needsUpdate = results.filter(r => r.needsExcelUpdate);
  
  console.log(`\nTests that need Excel updates: ${needsUpdate.length}`);
  
  if (needsUpdate.length > 0) {
    console.log('\n⚠️  UPDATE YOUR EXCEL FILE:');
    console.log('\nReplace the "Expected output" column with these values:\n');
    
    needsUpdate.forEach(r => {
      console.log(`${r.id}:`);
      console.log(`  Current Expected: ${r.expectedInExcel}`);
      console.log(`  Should Be:        ${r.actualFromWebsite}`);
      console.log('');
    });
  }
  
  console.log('\n✅ Full results saved to: tests/diagnostic_results.json');
  console.log('\nNext steps:');
  console.log('1. Update your Excel file with the correct "Expected output" values above');
  console.log('2. Re-generate test_cases_from_excel.json from the updated Excel');
  console.log('3. Re-run tests: npm test');
}

diagnoseTests().catch(console.error);
