import { describe, expect, it } from 'vitest';
import {
  DESTINATION_TABS,
  HOTEL_MATRIX_GROUPS,
  GRID,
  TILES_BY_VIEW,
  ViewId,
  getDestinationControls,
  getViewLayout,
  validateTileLayouts
} from './model';

describe('holiday dashboard model', () => {
  it('groups CSV-derived hotel matrix controls by destination, length, and variant', () => {
    expect(HOTEL_MATRIX_GROUPS).toHaveLength(5);

    const albania = getDestinationControls('Albania');
    expect(albania.lengths).toEqual(['8', '11', '14']);
    expect(albania.variants).toHaveLength(3);
    expect(albania.totalRows).toBe(90);

    const turcja = getDestinationControls('Turcja');
    expect(turcja.lengths).toEqual(['8', '11', '14']);
    expect(turcja.variants).toContain('D — charakter: natura / klify / baza wypadowa');
    expect(turcja.totalRows).toBe(120);
  });

  it('generates the approved summary and destination tab set', () => {
    expect(DESTINATION_TABS.map((tab) => tab.label)).toEqual([
      'Summary',
      'Albania',
      'Grecja / Zakynthos',
      'Cypr',
      'Turcja',
      'Kreta'
    ]);
  });

  it('keeps each canvas tile positioned and every destination includes a hotel reserve tile', () => {
    expect(validateTileLayouts()).toEqual([]);

    const destinationViews: ViewId[] = ['albania', 'grecja', 'cypr', 'turcja', 'kreta'];

    for (const view of destinationViews) {
      expect(TILES_BY_VIEW[view].some((tile) => tile.kind === 'hotel-reserve')).toBe(true);
    }
  });

  it('lays tabs out as responsive horizontal pages that progress left to right', () => {
    const desktopPageWidth = 1280;
    const mobilePageWidth = 390;
    const desktopLayouts = DESTINATION_TABS.map((tab) => getViewLayout(tab.id, desktopPageWidth));
    const mobileLayouts = DESTINATION_TABS.map((tab) => getViewLayout(tab.id, mobilePageWidth));

    expect(desktopLayouts.map((layout) => layout.column)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(desktopLayouts.map((layout) => layout.x)).toEqual(desktopLayouts.map((_, index) => index * desktopPageWidth));
    expect(mobileLayouts.map((layout) => layout.x)).toEqual(mobileLayouts.map((_, index) => index * mobilePageWidth));
  });

  it('uses a uniform masonry grid with bounded tile spans', () => {
    for (const tiles of Object.values(TILES_BY_VIEW)) {
      const occupiedCells = new Set<string>();

      for (const tile of tiles) {
        expect(tile.col).toBeGreaterThanOrEqual(1);
        expect(tile.row).toBeGreaterThanOrEqual(1);
        expect(tile.colSpan).toBeGreaterThanOrEqual(1);
        expect(tile.rowSpan).toBeGreaterThanOrEqual(1);
        expect(tile.col + tile.colSpan - 1).toBeLessThanOrEqual(GRID.columns);
        expect(tile.colSpan).toBeLessThanOrEqual(3);
        expect(tile.rowSpan).toBeLessThanOrEqual(3);

        for (let col = tile.col; col < tile.col + tile.colSpan; col += 1) {
          for (let row = tile.row; row < tile.row + tile.rowSpan; row += 1) {
            const cell = `${col}:${row}`;
            expect(occupiedCells.has(cell), `${tile.id} overlaps cell ${cell}`).toBe(false);
            occupiedCells.add(cell);
          }
        }
      }
    }
  });
});
