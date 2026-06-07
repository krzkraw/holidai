import type { DestinationKey } from '../model';

export type FlightBucket = 'main' | 'extra';

export type FlightOption = {
  bucket: FlightBucket;
  destination: DestinationKey;
  path: string;
  dates: string;
  price: string;
  info: string;
  source: string;
};

export const FLIGHT_BUCKET_LABELS: Record<FlightBucket, string> = {
  main: 'Loty w terminach',
  extra: 'Dodatkowe loty',
};

const HOTEL_DATE_TO_STAY_DAYS: Record<DestinationKey, Record<string, string>> = {
  Albania: {
    '2026-09-16 → 2026-09-24': '8',
    '2026-09-16 → 2026-09-27': '11',
    '2026-09-16 → 2026-09-30': '14',
  },
  Grecja: {
    '2026-09-12 → 2026-09-20': '8',
    '2026-09-12 → 2026-09-23': '11',
    '2026-09-12 → 2026-09-26': '14',
  },
  Cypr: {
    '2026-09-14 → 2026-09-22': '8',
    '2026-09-14 → 2026-09-25': '11',
    '2026-09-14 → 2026-09-28': '14',
  },
  Turcja: {
    '2026-09-16 → 2026-09-24': '8',
    '2026-09-16 → 2026-09-27': '11',
    '2026-09-16 → 2026-09-30': '14',
  },
  Kreta: {
    '2026-09-16 → 2026-09-24': '8',
    '2026-09-16 → 2026-09-27': '11',
    '2026-09-16 → 2026-09-30': '14',
  },
};

export const FLIGHT_OPTIONS = [
  {"bucket":"main","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-16 → 2026-09-24","price":"1196 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-16 → 2026-09-24","price":"1207 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-16 → 2026-09-24","price":"681 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-16 → 2026-09-27","price":"1134 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-16 → 2026-09-27","price":"1133 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-16 → 2026-09-27","price":"703 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-16 → 2026-09-30","price":"853 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-16 → 2026-09-30","price":"850 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-16 → 2026-09-30","price":"622 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-14 → 2026-09-22","price":"1216 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-14 → 2026-09-25","price":"1097 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-14 → 2026-09-28","price":"1104 zł","info":"przesiadka 1x","source":"skyscanner"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-14 → 2026-09-28","price":"1244 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-14 → 2026-09-28","price":"1126 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-14 → 2026-09-22","price":"1260 zł","info":"przesiadka 2x","source":"skyscanner"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-14 → 2026-09-22","price":"1402 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-14 → 2026-09-25","price":"1816 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-14 → 2026-09-25","price":"1914 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-14 → 2026-09-25","price":"1674 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-14 → 2026-09-28","price":"1561 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-14 → 2026-09-28","price":"1627 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-14 → 2026-09-28","price":"5656 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-16 → 2026-09-24","price":"1570 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-16 → 2026-09-24","price":"1582 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-16 → 2026-09-24","price":"1332 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-16 → 2026-09-27","price":"2064 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-16 → 2026-09-27","price":"2079 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-16 → 2026-09-27","price":"1616 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-16 → 2026-09-30","price":"1877 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-16 → 2026-09-30","price":"1892 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-16 → 2026-09-30","price":"1420 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-16 → 2026-09-24","price":"1282 zł","info":"przesiadka 1x","source":"skyscanner"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-16 → 2026-09-24","price":"1156 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-16 → 2026-09-27","price":"3421 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-16 → 2026-09-27","price":"24711 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-16 → 2026-09-30","price":"1370 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-16 → 2026-09-30","price":"1413 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-16 → 2026-09-30","price":"979 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Grecja","path":"KRK ⇄ ZTH","dates":"2026-09-12 → 2026-09-20","price":"2337 zł","info":"przesiadka 2x","source":"skyscanner"},
  {"bucket":"main","destination":"Grecja","path":"KRK ⇄ ZTH","dates":"2026-09-12 → 2026-09-20","price":"3124 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"main","destination":"Grecja","path":"KRK ⇄ ZTH","dates":"2026-09-12 → 2026-09-23","price":"1388 zł","info":"przesiadka 2x","source":"skyscanner"},
  {"bucket":"main","destination":"Grecja","path":"KRK ⇄ ZTH","dates":"2026-09-12 → 2026-09-23","price":"1472 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"main","destination":"Grecja","path":"KRK ⇄ ZTH","dates":"2026-09-12 → 2026-09-26","price":"1607 zł","info":"przesiadka 2x","source":"skyscanner"},
  {"bucket":"main","destination":"Grecja","path":"KRK ⇄ ZTH","dates":"2026-09-12 → 2026-09-26","price":"1538 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"main","destination":"Turcja","path":"KRK ⇄ DLM","dates":"2026-09-16 → 2026-09-24","price":"2778 zł","info":"przesiadka 2x","source":"skyscanner"},
  {"bucket":"main","destination":"Turcja","path":"KRK ⇄ DLM","dates":"2026-09-16 → 2026-09-24","price":"4931 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"main","destination":"Turcja","path":"KRK ⇄ DLM","dates":"2026-09-16 → 2026-09-27","price":"3124 zł","info":"przesiadka 2x","source":"skyscanner"},
  {"bucket":"main","destination":"Turcja","path":"KRK ⇄ DLM","dates":"2026-09-16 → 2026-09-27","price":"5130 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"main","destination":"Turcja","path":"KRK ⇄ DLM","dates":"2026-09-16 → 2026-09-30","price":"2233 zł","info":"przesiadka 2x","source":"skyscanner"},
  {"bucket":"main","destination":"Turcja","path":"KRK ⇄ DLM","dates":"2026-09-16 → 2026-09-30","price":"7360 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-12 → 2026-09-20","price":"1075 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-12 → 2026-09-20","price":"2274 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-12 → 2026-09-20","price":"1072 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-12 → 2026-09-23","price":"920 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-12 → 2026-09-23","price":"3908 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-12 → 2026-09-23","price":"919 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-12 → 2026-09-26","price":"1148 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-12 → 2026-09-26","price":"4464 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-12 → 2026-09-26","price":"1148 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-14 → 2026-09-22","price":"942 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-14 → 2026-09-22","price":"718 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-14 → 2026-09-22","price":"937 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-14 → 2026-09-25","price":"880 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-14 → 2026-09-25","price":"799 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-14 → 2026-09-25","price":"1056 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-14 → 2026-09-28","price":"916 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-14 → 2026-09-28","price":"821 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-14 → 2026-09-28","price":"1078 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-12 → 2026-09-20","price":"1369 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-12 → 2026-09-20","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-12 → 2026-09-23","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-12 → 2026-09-26","price":"1122 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-12 → 2026-09-26","price":"1347 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-12 → 2026-09-26","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-16 → 2026-09-24","price":"1465 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-16 → 2026-09-24","price":"1398 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-16 → 2026-09-24","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-16 → 2026-09-27","price":"1689 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-16 → 2026-09-27","price":"1170 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-16 → 2026-09-27","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-16 → 2026-09-30","price":"1586 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-16 → 2026-09-30","price":"975 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-16 → 2026-09-30","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-12 → 2026-09-20","price":"1487 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-12 → 2026-09-20","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-12 → 2026-09-23","price":"1358 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-12 → 2026-09-23","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-12 → 2026-09-26","price":"2407 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-12 → 2026-09-26","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-16 → 2026-09-24","price":"1395 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-16 → 2026-09-24","price":"1156 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-16 → 2026-09-24","price":"1365 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-16 → 2026-09-27","price":"1516 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-16 → 2026-09-27","price":"1292 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-16 → 2026-09-27","price":"1493 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-16 → 2026-09-30","price":"1516 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-16 → 2026-09-30","price":"1292 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-16 → 2026-09-30","price":"1430 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-12 → 2026-09-20","price":"1995 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-12 → 2026-09-23","price":"1660 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-12 → 2026-09-26","price":"1604 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-14 → 2026-09-22","price":"1295 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-14 → 2026-09-25","price":"1704 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-14 → 2026-09-28","price":"1310 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-12 → 2026-09-20","price":"2042 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-12 → 2026-09-23","price":"1781 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-12 → 2026-09-26","price":"1836 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-12 → 2026-09-26","price":"1472 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-14 → 2026-09-22","price":"1259 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-14 → 2026-09-25","price":"2635 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-14 → 2026-09-25","price":"1365 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-14 → 2026-09-28","price":"2315 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-14 → 2026-09-28","price":"1325 zł","info":"przesiadka 1x","source":"esky"},
] as const satisfies readonly FlightOption[];

export function getFlightOptionsForDestination(
  flights: readonly FlightOption[],
  destination: DestinationKey,
  bucket: FlightBucket,
): readonly FlightOption[] {
  return flights.filter((flight) => flight.destination === destination && flight.bucket === bucket);
}

export function getFlightStayDays(destination: DestinationKey, flight: Pick<FlightOption, 'dates'>): string | null {
  return HOTEL_DATE_TO_STAY_DAYS[destination][flight.dates] ?? null;
}

export function formatFlightInfo(flight: Pick<FlightOption, 'info' | 'source'>): string {
  return `${flight.info} · ${flight.source}`;
}

export function parseFlightPrice(flight: Pick<FlightOption, 'price'>): number | null {
  const digits = flight.price.replace(/[^\d]/g, '');

  if (!digits) {
    return null;
  }

  return Number.parseInt(digits, 10);
}
