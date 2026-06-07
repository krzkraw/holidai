import { describe, expect, it } from 'vitest';

import { parseBookingsResponse } from './bookings';

async function gzipJson(value: unknown): Promise<ArrayBuffer> {
  const stream = new Blob([JSON.stringify(value)]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Response(stream).arrayBuffer();
}

describe('bookings data loader', () => {
  it('decompresses gzip booking JSON responses', async () => {
    const bookings = [{ destination: 'Albania', stays: [{ days: 8 }] }];
    const response = new Response(await gzipJson(bookings));

    await expect(parseBookingsResponse(response, 'gzip')).resolves.toEqual(bookings);
  });

  it('falls back to plain JSON responses', async () => {
    const bookings = [{ destination: 'Cypr', stays: [{ days: 14 }] }];
    const response = new Response(JSON.stringify(bookings));

    await expect(parseBookingsResponse(response, 'json')).resolves.toEqual(bookings);
  });

  it('does not double-decompress responses already decoded by the browser', async () => {
    const bookings = [{ destination: 'Kreta', stays: [{ days: 11 }] }];
    const response = new Response(JSON.stringify(bookings), {
      headers: { 'content-encoding': 'gzip' },
    });

    await expect(parseBookingsResponse(response, 'gzip')).resolves.toEqual(bookings);
  });
});
