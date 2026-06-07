import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');

function ruleFor(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = styles.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[\\s\\S]*?)\\}`));

  return match?.groups?.body ?? '';
}

describe('booking card hover treatment', () => {
  it('uses the same luminous hover language as canvas tiles', () => {
    expect(styles).toContain('.booking-card');

    const baseGlow = ruleFor('.booking-card::before');
    const hoverGlow = ruleFor('.booking-card:hover::before');
    const hoverCard = ruleFor('.booking-card:hover');

    expect(baseGlow).toContain('inset: auto -20% 55% 30%');
    expect(baseGlow).toContain('opacity: 0.72');
    expect(hoverGlow).toContain('translateY(-8px) scale(1.16)');
    expect(hoverCard).toContain('background: rgba(255, 255, 255, 0.09)');
    expect(hoverCard).not.toContain('color-mix');
  });
});
