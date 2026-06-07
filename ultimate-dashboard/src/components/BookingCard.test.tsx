import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { BookingJson } from '../data/bookings';
import { BookingCard } from './BookingCard';

function booking(): BookingJson {
  return {
    destination: 'Albania',
    tier: 'A',
    name: 'Corner Favorite Hotel',
    rating: null,
    reviews: 0,
    laundry: '',
    washingMachineConfirmed: false,
    washingMachineOnlyInReviews: false,
    laundryService: false,
    kitchen: false,
    privateBathroom: true,
    beachView: false,
    seaView: false,
    parking: false,
    beachInfo: 'plaża',
    evaluation: 8.4,
    pageContent: '',
    details: {
      title: 'Corner Favorite Hotel',
      country: 'Albania',
      propertyName: 'Corner Favorite Hotel',
      address: '',
      coordinates: null,
      imageUrls: ['https://example.com/hotel.jpg'],
      description: '',
      stayPrices: [],
      roomTable: { columns: [], rows: [], raw: '' },
      review: { score: null, count: 0 },
      comments: [],
      surroundingsRaw: '',
      amenities: {
        flatList: [],
        laundry: { confirmed: false, onlyInReviews: false, service: false, evidence: [] },
      },
      policy: { houseRulesRaw: '', importantInfoRaw: '' },
      authorSummaryBullets: [],
      captureQuality: 'complete',
      issues: [],
      placeholders: [],
      enrichments: {},
    },
    url: 'https://example.com/corner-favorite-hotel',
    stays: [{ days: 11, checkIn: '2026-09-16', checkOut: '2026-09-27', price: 1300 }],
  };
}

describe('BookingCard', () => {
  it('places the favorite toggle in the card corner outside the thumbnail', () => {
    const html = renderToStaticMarkup(
      <BookingCard booking={booking()} selectedStayDays={11} isFavorite onFavoriteToggle={() => undefined} />,
    );

    expect(html).toContain('booking-favorite-toggle--card-corner');
    expect(html.indexOf('booking-favorite-toggle')).toBeLessThan(html.indexOf('booking-card-primary'));
    expect(html.indexOf('booking-favorite-toggle')).toBeLessThan(html.indexOf('booking-thumb'));
  });
});
