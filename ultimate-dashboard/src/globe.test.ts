import { describe, expect, it } from 'vitest';

import { BookingJson } from './data/bookings';
import {
  getHotelGlobeMarkers,
  getMarkerPresentation,
  getSphericalFocus,
  latLonToUnitVector,
} from './globe';

function booking(overrides: Partial<BookingJson> = {}): BookingJson {
  return {
    destination: 'Cypr',
    tier: 'A - sample',
    name: 'Akamas Blue',
    rating: 9,
    reviews: 100,
    laundry: '',
    washingMachineConfirmed: true,
    washingMachineOnlyInReviews: false,
    laundryService: false,
    kitchen: true,
    privateBathroom: true,
    beachView: false,
    seaView: true,
    parking: true,
    beachInfo: 'plaża',
    evaluation: 8.8,
    pageContent: '',
    details: {
      title: 'Akamas Blue',
      country: 'Cypr',
      propertyName: 'Akamas Blue',
      address: 'Polis',
      coordinates: { latitude: 35.036, longitude: 32.426 },
      imageUrls: [],
      description: '',
      stayPrices: [],
      roomTable: { columns: [], rows: [], raw: '' },
      review: { score: 9, count: 100 },
      comments: [],
      surroundingsRaw: '',
      amenities: {
        flatList: [],
        laundry: { confirmed: true, onlyInReviews: false, service: false, evidence: [] },
      },
      policy: { houseRulesRaw: '', importantInfoRaw: '' },
      authorSummaryBullets: [],
      captureQuality: 'complete',
      issues: [],
      placeholders: [],
      enrichments: {},
    },
    url: 'https://example.com/akamas-blue',
    stays: [
      { days: 8, checkIn: '2026-09-16', checkOut: '2026-09-24', price: 2100 },
      { days: 11, checkIn: '2026-09-16', checkOut: '2026-09-27', price: 2800 },
    ],
    ...overrides,
  };
}

describe('hotel globe model', () => {
  it('builds priced markers only for the selected destination, tier, and valid coordinates', () => {
    const markers = getHotelGlobeMarkers(
      [
        booking(),
        booking({ name: 'No Coordinates', details: { ...booking().details, coordinates: null } }),
        booking({ name: 'Wrong Tier', tier: 'B - sample' }),
        booking({ name: 'Wrong Destination', destination: 'Kreta' }),
      ],
      { destination: 'Cypr', selectedVariant: 'A - sample', selectedStayDays: 11 },
    );

    expect(markers).toHaveLength(1);
    expect(markers[0]).toMatchObject({
      destination: 'Cypr',
      name: 'Akamas Blue',
      latitude: 35.036,
      longitude: 32.426,
      priceText: '2 800 PLN',
    });
  });

  it('converts latitude and longitude onto the expected unit sphere axes', () => {
    expect(latLonToUnitVector(0, 0)).toEqual({ x: 0, y: 0, z: 1 });
    expect(latLonToUnitVector(0, 90).x).toBeCloseTo(1);
    expect(latLonToUnitVector(90, 0).y).toBeCloseTo(1);
  });

  it('chooses a focus point and closer camera distance for a tight hotel cluster', () => {
    const focus = getSphericalFocus([
      { latitude: 35, longitude: 32 },
      { latitude: 35.2, longitude: 32.4 },
      { latitude: 34.8, longitude: 32.1 },
    ]);

    expect(focus.latitude).toBeCloseTo(35, 0);
    expect(focus.longitude).toBeCloseTo(32.1, 0);
    expect(focus.targetDistance).toBeLessThan(2.5);
    expect(focus.startDistance).toBeGreaterThan(5);
  });

  it('scales projected markers from dots through pins to price labels', () => {
    expect(getMarkerPresentation(24)).toMatchObject({ mode: 'dot' });
    expect(getMarkerPresentation(70)).toMatchObject({ mode: 'pin' });
    expect(getMarkerPresentation(132)).toMatchObject({ mode: 'price' });
    expect(getMarkerPresentation(132).scale).toBeGreaterThan(getMarkerPresentation(24).scale);
  });
});
