export const COMPRESSED_BOOKINGS_URL = './data/bookings/bookings.json.gz';
export const PLAIN_BOOKINGS_URL = './data/bookings/bookings.json';

export type BookingsDataFormat = 'gzip' | 'json';

export async function parseBookingsResponse(response: Response, format: BookingsDataFormat): Promise<unknown> {
  if (!response.ok) {
    throw new Error(`Failed to load bookings data: ${response.status} ${response.statusText}`.trim());
  }

  if (format === 'json') {
    return response.json();
  }

  if (response.headers.get('content-encoding')?.toLowerCase().includes('gzip')) {
    return response.json();
  }

  if (!response.body) {
    throw new Error('Bookings gzip response has no body');
  }

  if (typeof DecompressionStream === 'undefined') {
    throw new Error('Browser does not support gzip decompression streams');
  }

  const decompressedStream = response.body.pipeThrough(new DecompressionStream('gzip'));
  return new Response(decompressedStream).json();
}

export async function loadBookingsData(): Promise<unknown> {
  try {
    const compressedResponse = await fetch(COMPRESSED_BOOKINGS_URL);
    return await parseBookingsResponse(compressedResponse, 'gzip');
  } catch {
    const plainResponse = await fetch(PLAIN_BOOKINGS_URL);
    return parseBookingsResponse(plainResponse, 'json');
  }
}
