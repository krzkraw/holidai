import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');

function ruleFor(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = styles.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[\\s\\S]*?)\\}`));

  return match?.groups?.body ?? '';
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
});
