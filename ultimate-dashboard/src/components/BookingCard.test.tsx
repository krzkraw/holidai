import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { BookingJson } from '../data/bookings';
import { BookingCard } from './BookingCard';

function booking(overrides: Partial<BookingJson> = {}): BookingJson {
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
    ...overrides,
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

  it('places the rating pill directly after the hotel name', () => {
    const html = renderToStaticMarkup(
      <BookingCard booking={booking({ rating: 9.5, reviews: 123 })} selectedStayDays={11} />,
    );

    expect(html).toContain('booking-title-row');
    expect(html).toContain(
      '<div class="booking-title-row"><h3 class="booking-title" title="Corner Favorite Hotel">Corner Favorite Hotel</h3><span class="booking-rating">',
    );
    expect(html.indexOf('booking-title-row')).toBeLessThan(html.indexOf('booking-specs'));
  });

  it('renders the thumbnail as a fixed-size low-priority lazy image without changing the source URL', () => {
    const imageUrl = 'https://example.com/original-hotel-thumbnail.jpg';
    const html = renderToStaticMarkup(
      <BookingCard
        booking={booking({
          details: {
            ...booking().details,
            imageUrls: [imageUrl],
          },
        })}
        selectedStayDays={11}
      />,
    );
    const thumbnail = html.match(/<img[^>]*class="booking-thumb-image"[^>]*>/)?.[0] ?? '';

    expect(thumbnail).toContain(`src="${imageUrl}"`);
    expect(thumbnail).toContain('loading="lazy"');
    expect(thumbnail).toContain('decoding="async"');
    expect(thumbnail).toMatch(/\swidth="\d+"/);
    expect(thumbnail).toMatch(/\sheight="\d+"/);
    expect(thumbnail).toMatch(/\s(?:fetchpriority|fetchPriority)="low"/);
  });
});
