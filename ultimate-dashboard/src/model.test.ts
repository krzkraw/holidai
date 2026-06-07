import { describe, expect, it } from 'vitest';
import {
  DESTINATION_TABS,
  HOTEL_MATRIX_GROUPS,
  TILES_BY_VIEW,
  ViewId,
  getDestinationControls,
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
});
