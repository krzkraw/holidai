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

describe('canvas performance styles', () => {
  it('moves the canvas stack with transforms instead of transitioning left', () => {
    const canvasStack = ruleFor('.canvas-stack');

    expect(canvasStack).toMatch(/transform\s*:\s*translate(?:3d|X)\(/);
    expect(canvasStack).not.toMatch(/(?:^|[\s;])left\s*:/);
    expect(canvasStack).not.toMatch(/transition\s*:\s*all\b/);
    expect(canvasStack).not.toMatch(/transition(?:-[^:]*)?\s*:[^;]*\bleft\b/);
    expect(canvasStack).not.toMatch(/will-change\s*:[^;]*\bleft\b/);
  });

  it('does not use broad transition-all policies', () => {
    expect(styles).not.toMatch(/transition\s*:\s*all\b/);
  });

  it('keeps the shader visible and un-dimmed in lightweight FX mode', () => {
    const lightweightShader = ruleFor('.app-shell--lightweight-visuals .shader-background canvas');

    expect(lightweightShader).not.toMatch(/opacity\s*:\s*0\.(?:[0-4]\d?|5[0-9]?)/);
    expect(lightweightShader).not.toContain('filter: none !important');
  });

  it('keeps lightweight tile and booking-card hover geometry stable', () => {
    const lightweightHover = ruleContainingSelector(
      '.app-shell--lightweight-visuals .tile:hover',
      'transform:',
    );

    expect(lightweightHover).not.toBe('');
    expect(lightweightHover).not.toMatch(/scale\(/);
    expect(lightweightHover).not.toMatch(/translateY\(-[3-9]px\)/);
  });

  it('supports reduced-motion users in CSS, not only in the shader loop', () => {
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toMatch(/scroll-behavior\s*:\s*auto/);
    expect(styles).toMatch(/animation\s*:\s*none\s*!important/);
  });
});
