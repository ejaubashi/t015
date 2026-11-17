import { test, expect } from '@playwright/test';
test('navigation, product details, sound and responsive layout', async ({page},info)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('h1')).toContainText('STICK');
 await expect(page.locator('body')).toHaveJSProperty('scrollWidth',await page.evaluate(()=>innerWidth));
 await page.screenshot({path:`/tmp/sweet-${info.project.name}.png`});
 const menu=page.locator('.menu-pull');await menu.click();await expect(menu).toHaveAttribute('aria-expanded','true');
 await page.locator('nav a[href="#collection"]').click();await expect(menu).toHaveAttribute('aria-expanded','false');
 const product=page.locator('.create .pack').first();await product.scrollIntoViewIfNeeded();await product.click();
 await expect(page.locator('dialog')).toBeVisible();await expect(page.locator('.dialog-copy h2')).toContainText('MASKING');
 await page.keyboard.press('Escape');await expect(page.locator('dialog')).not.toBeVisible();
 await page.getByRole('button',{name:'Enable sound'}).click();await expect(page.locator('.sound')).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Disable sound'}).click();await expect(page.locator('.sound')).toHaveAttribute('aria-pressed','false');
 await page.locator('.create').scrollIntoViewIfNeeded();await page.waitForTimeout(900);await page.screenshot({path:`/tmp/sweet-products-${info.project.name}.png`});
 expect(errors).toEqual([]);
});
