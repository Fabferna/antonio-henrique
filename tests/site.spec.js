// @ts-check
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

// Embeds e miniaturas externas não fazem parte do que testamos aqui
const EXTERNAL = /vumbnail|spotify|vimeo|scdn|ERR_|net::/i;

async function open(page) {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !EXTERNAL.test(m.text())) errors.push(m.text()); });
    await page.route(/vumbnail\.com|open\.spotify\.com|player\.vimeo\.com/, r => r.abort());
    await page.goto('/');
    return errors;
}

const isMobile = (testInfo) => testInfo.project.name === 'mobile';

test.describe('Estrutura e acessibilidade', () => {
    test('carrega sem erros de JS e com um único h1', async ({ page }) => {
        const errors = await open(page);
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('h1')).toContainText('Antônio');
        expect(errors).toEqual([]);
    });

    test('não tem rolagem horizontal na página', async ({ page }) => {
        await open(page);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(0);
    });

    test('skip link é o primeiro foco e leva ao conteúdo', async ({ page }, testInfo) => {
        test.skip(isMobile(testInfo), 'Teclado físico só no desktop');
        await open(page);
        await page.keyboard.press('Tab');
        const skip = page.getByRole('link', { name: 'Pular para o conteúdo' });
        await expect(skip).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page.locator('#conteudo')).toBeFocused();
    });

    test('axe: sem violações sérias ou críticas', async ({ page }) => {
        await open(page);
        // Revela tudo para o axe medir o contraste do estado final
        await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('is-in')));
        await page.waitForTimeout(1000);
        const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .exclude('iframe')
            .analyze();
        const serious = results.violations.filter(v => ['serious', 'critical'].includes(v.impact || ''));
        expect(serious.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
    });
});

test.describe('Galeria de cartazes', () => {
    test('botão "próximos" avança e atualiza o contador', async ({ page }) => {
        await open(page);
        const rail = page.getByTestId('rail');
        await rail.scrollIntoViewIfNeeded();
        const viewport = rail.locator('[data-rail-viewport]');
        await expect(rail.locator('[data-rail-prev]')).toBeDisabled();
        await rail.getByRole('button', { name: 'Próximos cartazes' }).click();
        await expect.poll(() => viewport.evaluate(el => el.scrollLeft)).toBeGreaterThan(100);
        await expect(rail.locator('[data-rail-current]')).not.toHaveText('01');
        await expect(rail.locator('[data-rail-prev]')).toBeEnabled();
    });

    test('setas do teclado andam um cartaz por vez', async ({ page }, testInfo) => {
        test.skip(isMobile(testInfo), 'Teclado físico só no desktop');
        await open(page);
        const viewport = page.locator('[data-rail-viewport]');
        await viewport.focus();
        await page.keyboard.press('ArrowRight');
        await expect(page.locator('[data-rail-current]')).toHaveText('02');
        await page.keyboard.press('End');
        await expect(page.locator('[data-rail-current]')).not.toHaveText('02');
        await page.keyboard.press('Home');
        await expect(page.locator('[data-rail-current]')).toHaveText('01');
    });

    test('arrastar com o mouse rola a galeria sem abrir o modal', async ({ page }, testInfo) => {
        test.skip(isMobile(testInfo), 'No touch a rolagem é nativa');
        await open(page);
        const viewport = page.locator('[data-rail-viewport]');
        await viewport.scrollIntoViewIfNeeded();
        const box = await viewport.boundingBox();
        if (!box) throw new Error('rail sem caixa');
        const y = box.y + box.height / 2;
        await page.mouse.move(box.x + box.width * 0.7, y);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * 0.4, y, { steps: 8 });
        await page.mouse.move(box.x + box.width * 0.2, y, { steps: 8 });
        await page.mouse.up();
        expect(await viewport.evaluate(el => el.scrollLeft)).toBeGreaterThan(200);
        await expect(page.getByTestId('media-modal')).not.toBeVisible();
    });

    test('clicar num cartaz abre o modal; Esc fecha e devolve o foco', async ({ page }) => {
        await open(page);
        const poster = page.locator('.c-poster__button[data-type="image"]').first();
        await poster.scrollIntoViewIfNeeded();
        await poster.click();
        const modal = page.getByTestId('media-modal');
        await expect(modal).toBeVisible();
        await expect(modal.locator('img')).toHaveAttribute('alt', 'Dark Souls — Artorias');
        await page.keyboard.press('Escape');
        await expect(modal).not.toBeVisible();
        await expect(poster).toBeFocused();
    });

    test('vídeos não tocam com prefers-reduced-motion', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await open(page);
        await page.getByTestId('rail').scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        const playing = await page.locator('.c-poster video').evaluateAll(vs => vs.filter(v => !v.paused).length);
        expect(playing).toBe(0);
    });
});

test.describe('Modais', () => {
    test('galeria de social media navega com as setas e dá a volta', async ({ page }) => {
        await open(page);
        await page.locator('[data-gallery="social"]').click();
        const modal = page.getByTestId('media-modal');
        await expect(modal.locator('[data-modal-count]')).toHaveText('01 / 05');
        await modal.getByRole('button', { name: 'Próxima imagem' }).click();
        await expect(modal.locator('[data-modal-count]')).toHaveText('02 / 05');
        await modal.getByRole('button', { name: 'Imagem anterior' }).click();
        await modal.getByRole('button', { name: 'Imagem anterior' }).click();
        await expect(modal.locator('[data-modal-count]')).toHaveText('05 / 05');
        await modal.getByRole('button', { name: 'Fechar' }).click();
        await expect(modal).not.toBeVisible();
    });

    test('openGallery aceita startIndex (assinatura pública preservada)', async ({ page }) => {
        await open(page);
        await page.evaluate(() => window.openGallery('foto', 2));
        await expect(page.getByTestId('media-modal').locator('[data-modal-count]')).toHaveText('03 / 03');
    });

    test('modal de cliente mostra nome e serviços', async ({ page }) => {
        await open(page);
        const btn = page.locator('[data-client="gilbarco"]');
        await btn.scrollIntoViewIfNeeded();
        await btn.click();
        const modal = page.getByTestId('client-modal');
        await expect(modal).toBeVisible();
        await expect(modal.locator('.c-client-sheet__name')).toHaveText('Gilbarco Veeder-Root');
        await expect(modal.locator('.c-chips li')).toHaveCount(3);
        await page.keyboard.press('Escape');
        await expect(modal).not.toBeVisible();
    });

    test('showreel abre o player do Vimeo', async ({ page }) => {
        await open(page);
        await page.getByTestId('reel').click();
        await expect(page.getByTestId('media-modal').locator('iframe')).toHaveAttribute('src', /player\.vimeo\.com\/video\/1187397152/);
    });
});

test.describe('Navegação', () => {
    test('menu móvel abre, navega e fecha', async ({ page }, testInfo) => {
        test.skip(!isMobile(testInfo), 'Menu só existe no mobile');
        await open(page);
        await page.getByTestId('menu-open').click();
        const menu = page.getByTestId('menu');
        await expect(menu).toBeVisible();
        await menu.getByRole('link', { name: /Contato/ }).click();
        await expect(menu).not.toBeVisible();
        await expect(page.locator('#contato')).toBeInViewport();
    });

    test('links do header apontam para seções existentes', async ({ page }, testInfo) => {
        test.skip(isMobile(testInfo), 'Links visíveis só no desktop');
        await open(page);
        const hrefs = await page.locator('.l-header__links a').evaluateAll(as => as.map(a => a.getAttribute('href')));
        for (const h of hrefs) await expect(page.locator(String(h))).toHaveCount(1);
    });
});
