import { test } from '@playwright/test';

test('Verify correct selectors are working', async ({ page }) => {
  await page.goto('https://www.swifttranslator.com');
  
  // Wait for page to load
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  // Take a screenshot
  await page.screenshot({ path: 'page-screenshot.png', fullPage: true });
  
  console.log('\n=== Testing Input Field ===');
  
  // Test 1: Find input by placeholder (RECOMMENDED)
  try {
    const inputByPlaceholder = page.getByPlaceholder('Input Your Singlish Text Here.');
    await inputByPlaceholder.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Input field found by placeholder');
    
    // Test typing
    await inputByPlaceholder.fill('oyaa');
    console.log('✅ Successfully typed "oyaa" in input');
  } catch (error) {
    console.log('❌ Input field by placeholder failed:', error.message);
  }
  
  console.log('\n=== Testing Output Field ===');
  
  // Test 2: Find output div
  try {
    const outputDiv = page.locator('div.w-full.h-80.p-3.rounded-lg.ring-1.ring-slate-300.whitespace-pre-wrap.overflow-y-auto.flex-grow.bg-slate-50').first();
    await outputDiv.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Output div found');
    
    // Wait for translation
    await page.waitForTimeout(2000);
    
    const outputText = await outputDiv.textContent();
    console.log('✅ Output text:', outputText);
  } catch (error) {
    console.log('❌ Output div failed:', error.message);
  }
  
  console.log('\n=== Alternative Output Selector ===');
  
  // Test 3: Simpler output selector
  try {
    const outputSimple = page.locator('div.bg-slate-50').first();
    await outputSimple.waitFor({ state: 'visible', timeout: 5000 });
    const outputText = await outputSimple.textContent();
    console.log('✅ Output with simpler selector:', outputText);
  } catch (error) {
    console.log('❌ Simple output selector failed:', error.message);
  }
  
  console.log('\n=== Page Structure ===');
  
  // Print all textareas
  const allTextareas = await page.locator('textarea').all();
  console.log(`Found ${allTextareas.length} textarea(s)`);
  
  for (let i = 0; i < allTextareas.length; i++) {
    const placeholder = await allTextareas[i].getAttribute('placeholder');
    const className = await allTextareas[i].getAttribute('class');
    console.log(`  Textarea ${i + 1}: placeholder="${placeholder}", class="${className}"`);
  }
  
  // Print all divs with specific classes
  const outputDivs = await page.locator('div.bg-slate-50').all();
  console.log(`Found ${outputDivs.length} output div(s) with bg-slate-50 class`);
  
  console.log('\n=== Test Complete ===');
});
