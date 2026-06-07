import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');

function ruleFor(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = styles.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[\\s\\S]*?)\\}`));

  return match?.groups?.body ?? '';
}

function ruleContainingSelector(selector: string, bodyNeedle: string): string {
  for (const match of styles.matchAll(/(?<selectors>[^{}]+)\{(?<body>[^{}]*)\}/g)) {
    const selectors = match.groups?.selectors.split(',').map((item) => item.trim()) ?? [];
    const body = match.groups?.body ?? '';

    if (selectors.includes(selector) && body.includes(bodyNeedle)) {
      return body;
    }
  }

  return '';
}

describe('bottom toolbar visual treatment', () => {
  it('keeps the compact toolbar itself transparent', () => {
    const compactToolbar = ruleFor('.controls-card--compact');

    expect(compactToolbar).toContain('background: transparent');
    expect(compactToolbar).not.toContain('backdrop-filter');
    expect(compactToolbar).not.toContain('box-shadow');
  });

  it('adds the shared glow hover to control pills', () => {
    expect(styles).toContain('.variant-pills button::before');
    expect(styles).toContain('.segmented button::before');
    expect(styles).toContain('radial-gradient(circle, color-mix');
    expect(styles).toContain('transform: translateY(-4px) scale(1.12)');
  });

  it('applies the same glow layer to the other pill families', () => {
    for (const selector of [
      '.tab::before',
      '.destination-costs span::before',
      '.decision-strip span::before',
      '.pill-cloud span::before',
      '.budget-list span::before',
      '.booking-price-ranges-active span::before',
      '.booking-favorites-button::before',
      '.booking-favorite-row-prices span::before',
      '.booking-grid-context span::before',
      '.booking-spec::before',
      '.booking-feature::before',
      '.booking-rating::before',
      '.booking-report-button::before',
      '.booking-modal-link::before',
      '.booking-modal-secondary::before',
      '.booking-modal-tags span::before',
      '.booking-modal-meta > span::before',
      '.booking-stays-list > span::before',
    ]) {
      expect(styles).toContain(selector);
    }
  });

  it('gives destination and bottom toolbar pills a visible parent hover state', () => {
    for (const selector of [
      '.destination-costs span:hover,',
      '.pill-cloud span:hover,',
      '.decision-strip span:hover,',
      '.controls-card--compact .segmented button:hover,',
      '.controls-card--compact .variant-pills button:hover,',
    ]) {
      expect(styles).toContain(selector);
    }

    expect(styles).toContain('transform: translateY(-3px) scale(1.035)');
    expect(styles).toContain('0 14px 34px rgba(0, 0, 0, 0.42)');
  });

  it('keeps enough scroll clearance behind the bottom toolbar', () => {
    expect(styles).toContain('--bottom-toolbar-clearance');
    expect(styles).toContain('padding-bottom: var(--bottom-toolbar-clearance)');
    expect(styles).toContain('0 10px 26px rgba(0, 0, 0, 0.32)');
  });

  it('keeps shared liquid-glass transitions and backdrop effects without permanent transform will-change', () => {
    const sharedPillRule = ruleContainingSelector('.variant-pills button', 'transform 220ms ease');

    expect(sharedPillRule).toContain('transition:');
    expect(sharedPillRule).toContain('transform 220ms ease');
    expect(ruleFor('.tab')).toContain('backdrop-filter: blur(14px)');
    expect(sharedPillRule).not.toMatch(/will-change\s*:\s*transform/);
  });
});
