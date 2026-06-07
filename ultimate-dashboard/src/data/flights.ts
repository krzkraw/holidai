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
  {"bucket":"main","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-16 → 2026-09-27","price":"1131 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-16 → 2026-09-30","price":"442 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-16 → 2026-09-24","price":"1207 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-16 → 2026-09-24","price":"1383 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-16 → 2026-09-27","price":"1133 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-16 → 2026-09-27","price":"1430 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-16 → 2026-09-30","price":"815 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-14 → 2026-09-22","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-14 → 2026-09-25","price":"1101 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-14 → 2026-09-28","price":"1241 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-14 → 2026-09-25","price":"1916 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-14 → 2026-09-28","price":"1561 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-14 → 2026-09-22","price":"1112 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-14 → 2026-09-25","price":"1117 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-14 → 2026-09-25","price":"1068 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-14 → 2026-09-28","price":"1244 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-14 → 2026-09-28","price":"1120 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-14 → 2026-09-22","price":"3050 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-14 → 2026-09-25","price":"1945 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-14 → 2026-09-28","price":"1620 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-14 → 2026-09-28","price":"1356 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-16 → 2026-09-24","price":"1570 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-16 → 2026-09-27","price":"2064 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-16 → 2026-09-30","price":"1877 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-16 → 2026-09-24","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-16 → 2026-09-27","price":"1711 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-16 → 2026-09-30","price":"685 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-16 → 2026-09-24","price":"1585 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-16 → 2026-09-27","price":"2082 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-16 → 2026-09-30","price":"1892 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-16 → 2026-09-24","price":"1199 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-16 → 2026-09-27","price":"1535 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-16 → 2026-09-27","price":"1628 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-16 → 2026-09-30","price":"1437 zł","info":"DIRECT","source":"esky"},
  {"bucket":"main","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-16 → 2026-09-30","price":"979 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Grecja","path":"KRK ⇄ ZTH","dates":"2026-09-12 → 2026-09-20","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"main","destination":"Grecja","path":"KRK ⇄ ZTH","dates":"2026-09-12 → 2026-09-23","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"main","destination":"Grecja","path":"KRK ⇄ ZTH","dates":"2026-09-12 → 2026-09-26","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"main","destination":"Grecja","path":"KRK ⇄ ZTH","dates":"2026-09-12 → 2026-09-20","price":"2699 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Grecja","path":"KRK ⇄ ZTH","dates":"2026-09-12 → 2026-09-23","price":"2300 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Grecja","path":"KRK ⇄ ZTH","dates":"2026-09-12 → 2026-09-26","price":"1538 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Turcja","path":"KRK ⇄ DLM","dates":"2026-09-16 → 2026-09-24","price":"1389 zł","info":"przesiadka 1x","source":"skyscanner"},
  {"bucket":"main","destination":"Turcja","path":"KRK ⇄ DLM","dates":"2026-09-16 → 2026-09-27","price":"1507 zł","info":"przesiadka 1x","source":"skyscanner"},
  {"bucket":"main","destination":"Turcja","path":"KRK ⇄ DLM","dates":"2026-09-16 → 2026-09-30","price":"2233 zł","info":"przesiadka 2x","source":"skyscanner"},
  {"bucket":"main","destination":"Turcja","path":"KRK ⇄ DLM","dates":"2026-09-16 → 2026-09-24","price":"4569 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Turcja","path":"KRK ⇄ DLM","dates":"2026-09-16 → 2026-09-27","price":"4917 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"main","destination":"Turcja","path":"KRK ⇄ DLM","dates":"2026-09-16 → 2026-09-30","price":"7360 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-12 → 2026-09-20","price":"536 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-12 → 2026-09-23","price":"460 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-12 → 2026-09-26","price":"1148 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-14 → 2026-09-22","price":"469 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-14 → 2026-09-25","price":"523 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-14 → 2026-09-28","price":"1078 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-12 → 2026-09-20","price":"1074 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-12 → 2026-09-23","price":"922 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-12 → 2026-09-26","price":"1150 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-12 → 2026-09-26","price":"803 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-14 → 2026-09-22","price":"945 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-14 → 2026-09-25","price":"880 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-14 → 2026-09-28","price":"917 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Albania","path":"KRK ⇄ TIA","dates":"2026-09-14 → 2026-09-28","price":"823 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-12 → 2026-09-20","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-12 → 2026-09-23","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-12 → 2026-09-26","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-16 → 2026-09-24","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-16 → 2026-09-27","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-16 → 2026-09-30","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-12 → 2026-09-20","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-12 → 2026-09-23","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-12 → 2026-09-26","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-16 → 2026-09-24","price":"1365 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-16 → 2026-09-27","price":"1493 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-16 → 2026-09-30","price":"715 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-12 → 2026-09-20","price":"1369 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-12 → 2026-09-23","price":"1271 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-12 → 2026-09-26","price":"1122 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-12 → 2026-09-26","price":"1363 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-16 → 2026-09-24","price":"1371 zł","info":"przesiadka 2x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-16 → 2026-09-27","price":"1171 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-16 → 2026-09-30","price":"975 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ PFO","dates":"2026-09-16 → 2026-09-30","price":"975 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-12 → 2026-09-20","price":"1487 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-12 → 2026-09-20","price":"1489 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-12 → 2026-09-23","price":"1359 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-12 → 2026-09-26","price":"1152 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-12 → 2026-09-26","price":"1153 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-16 → 2026-09-24","price":"1458 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-16 → 2026-09-24","price":"1158 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-16 → 2026-09-27","price":"1579 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-16 → 2026-09-27","price":"1293 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Cypr","path":"KRK ⇄ LCA","dates":"2026-09-16 → 2026-09-30","price":"1539 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-12 → 2026-09-23","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-12 → 2026-09-26","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-14 → 2026-09-22","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-14 → 2026-09-25","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-14 → 2026-09-28","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-12 → 2026-09-20","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-12 → 2026-09-23","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-12 → 2026-09-26","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-14 → 2026-09-22","price":"-","info":"brak lotów dla naszych filtrów","source":"skyscanner"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-14 → 2026-09-25","price":"2330 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-14 → 2026-09-28","price":"1058 zł","info":"DIRECT","source":"skyscanner"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-12 → 2026-09-20","price":"1995 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-12 → 2026-09-23","price":"1662 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-12 → 2026-09-26","price":"1604 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-12 → 2026-09-26","price":"1608 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-14 → 2026-09-22","price":"1295 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-14 → 2026-09-22","price":"1296 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-14 → 2026-09-25","price":"1704 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-14 → 2026-09-28","price":"1310 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ CHQ","dates":"2026-09-14 → 2026-09-28","price":"1437 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-12 → 2026-09-20","price":"2045 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-12 → 2026-09-23","price":"1829 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-14 → 2026-09-22","price":"1400 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-14 → 2026-09-25","price":"2455 zł","info":"DIRECT","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-14 → 2026-09-25","price":"1365 zł","info":"przesiadka 1x","source":"esky"},
  {"bucket":"extra","destination":"Kreta","path":"KRK ⇄ HER","dates":"2026-09-14 → 2026-09-28","price":"2179 zł","info":"DIRECT","source":"esky"},
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
