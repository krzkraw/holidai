export type DestinationKey = 'Albania' | 'Grecja' | 'Cypr' | 'Turcja' | 'Kreta';

export type ViewId = 'summary' | 'albania' | 'grecja' | 'cypr' | 'turcja' | 'kreta';

export type TileKind =
  | 'hero'
  | 'ranking'
  | 'matchmaker'
  | 'strategic'
  | 'budget'
  | 'checklist'
  | 'conflicts'
  | 'destination'
  | 'controls'
  | 'hotel-reserve';

export type TileLayout = {
  id: string;
  kind: TileKind;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type MatrixGroup = {
  destination: DestinationKey;
  lengths: string[];
  variants: string[];
  rowsPerLengthVariant: number;
};

export type DestinationTab = {
  id: ViewId;
  label: string;
  destination?: DestinationKey;
};

export type ScoreSet = {
  turtles: number;
  snorkeling: number;
  logistics: number;
  economy: number;
  sightseeing: number;
};

export type DestinationProfile = {
  key: DestinationKey;
  viewId: ViewId;
  displayName: string;
  region: string;
  accent: string;
  oneLine: string;
  bestFor: string[];
  term: string;
  base: string[];
  transfer: string[];
  car: string[];
  weather: string[];
  water: string[];
  turtles: string[];
  nature: string[];
  culture: string[];
  pluses: string[];
  risks: string[];
  scores: ScoreSet;
  localCosts: {
    foodMultiplier: string;
    buffer: string;
    carComparison: string;
  };
};

const VARIANT_A = 'A — super: plaża / ocena / okolica';
const VARIANT_B = 'B — rozsądnie: lokalizacja / opinia / pralka preferowana';
const VARIANT_C = 'C — po kosztach: prywatna łazienka i rozsądne warunki';
const VARIANT_D = 'D — charakter: natura / klify / baza wypadowa';

export const HOTEL_MATRIX_GROUPS: MatrixGroup[] = [
  {
    destination: 'Albania',
    lengths: ['8', '11', '14'],
    variants: [VARIANT_A, VARIANT_B, VARIANT_C],
    rowsPerLengthVariant: 10
  },
  {
    destination: 'Grecja',
    lengths: ['8', '11', '14'],
    variants: [VARIANT_A, VARIANT_B, VARIANT_C],
    rowsPerLengthVariant: 10
  },
  {
    destination: 'Cypr',
    lengths: ['8', '11', '14'],
    variants: [VARIANT_A, VARIANT_B, VARIANT_C],
    rowsPerLengthVariant: 10
  },
  {
    destination: 'Turcja',
    lengths: ['8', '11', '14'],
    variants: [VARIANT_A, VARIANT_B, VARIANT_C, VARIANT_D],
    rowsPerLengthVariant: 10
  },
  {
    destination: 'Kreta',
    lengths: ['8', '11', '14'],
    variants: [VARIANT_A, VARIANT_B, VARIANT_C, VARIANT_D],
    rowsPerLengthVariant: 10
  }
];

export const DESTINATION_TABS: DestinationTab[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'albania', label: 'Albania', destination: 'Albania' },
  { id: 'grecja', label: 'Grecja / Zakynthos', destination: 'Grecja' },
  { id: 'cypr', label: 'Cypr', destination: 'Cypr' },
  { id: 'turcja', label: 'Turcja', destination: 'Turcja' },
  { id: 'kreta', label: 'Kreta', destination: 'Kreta' }
];

export const DESTINATION_PROFILES: Record<DestinationKey, DestinationProfile> = {
  Albania: {
    key: 'Albania',
    viewId: 'albania',
    displayName: 'Albania',
    region: 'Saranda / Ksamil / Himare',
    accent: '#38b894',
    oneLine: 'Najlepsza opcja budżetowa: surowy błękit, tanie życie, klify i trudniejszy transfer.',
    bestFor: ['koszt lokalny', 'krajobraz morze + góry', 'dłuższy pobyt'],
    term: 'Rekomendowany termin 16-30 września 2026; 14 dni albo 14 nocy / 15 dni. Krótsze pobyty są słabsze, bo transfer z Tirany zjada część wyjazdu.',
    base: [
      'Saranda jako główna baza.',
      'Łączyć z Ksamil, Butrint i Blue Eye.',
      'Rozważyć 2-3 noce Himare / Vlore przy trasie; nie robić całego pobytu tylko w Ksamilu.'
    ],
    transfer: [
      'Tirana-Saranda ok. 260 km, 3.5-5 h.',
      'Transfer określony jako męczący i wyczerpujący.',
      'Dobrze podzielić trasę przez Vlore, Llogara albo Gjirokastra; pierwszy i ostatni dzień bez ambitnego planu.'
    ],
    car: [
      'Auto klasy B/C.',
      'Ultimate: ok. 1 700-2 300 PLN / 14 dni plus paliwo i parking 700-1 000 PLN.',
      'Rozbieżne kalkulatory: 80 PLN/dzień w wielkim porównaniu, 140 PLN/dzień w systemie porównawczym.',
      'Ryzyka: chaos drogowy, mniej przewidywalna infrastruktura, depozyt i karta kredytowa kierowcy.'
    ],
    weather: [
      'Powietrze ok. 25-29°C; rozszerzony raport: dzień 25-28°C, noc 17-19°C.',
      'Woda ok. 24-26°C.',
      'Opady niskie lub umiarkowane, większe niż na Cyprze, zwykle nadal dobry termin.'
    ],
    water: [
      'Bardzo dobra przejrzystość przy Ksamilu, Mirror Beach, Himare, Gjipe i rejsach Karaburun-Sazan.',
      'Dno w Ksamilu często piaszczyste lub sztucznie podsypywane, więc fauna i snorkeling są przeciętne.',
      'Lepszy snorkeling przy dzikich skalistych zatoczkach wokół Himare, Gjipe i Karaburun-Sazan.'
    ],
    turtles: [
      'Brak stałych populacji w porównaniu z Zakynthos, Cyprem i Turcją.',
      'Żółwie możliwe rzadko i przypadkowo; nie powinny być głównym powodem wyboru.'
    ],
    nature: [
      'Ksamil i wysepki, Butrint, Blue Eye, Gjipe, Himare, Dhermi, Llogara Pass, Karaburun-Sazan Marine Park.',
      'Llogara Pass jako trasa górska ok. 1027 m n.p.m.',
      'Jezioro / laguna Butrint i kanał Vivari jako kontrast wobec plaż.'
    ],
    culture: [
      'Butrint / UNESCO, Gjirokastra i Berat przy trasie.',
      'Charakter bałkański, osmański i śródziemnomorski.',
      'Saranda i Ksamil są bardziej bazą plażową niż celem muzealnym.'
    ],
    pluses: ['najniższy koszt lokalny', 'bardzo dobra woda wizualnie', 'klify i góry blisko morza', 'dużo krajobrazów'],
    risks: ['długi dojazd z Tirany', 'słabsza fauna morska', 'żółwie niepewne', 'depozyty i karta kredytowa', 'trudniejszy styl jazdy'],
    scores: { turtles: 1, snorkeling: 3, logistics: 4, economy: 9, sightseeing: 7 },
    localCosts: {
      foodMultiplier: '0.85',
      buffer: '800 PLN',
      carComparison: '80 PLN/dzień vs 140 PLN/dzień'
    }
  },
  Grecja: {
    key: 'Grecja',
    viewId: 'grecja',
    displayName: 'Grecja / Zakynthos',
    region: 'Keri / Laganas Bay / Vasilikos',
    accent: '#f3b84c',
    oneLine: 'Najmocniejsza destynacja pod Caretta caretta, łatwa logistycznie, ale mniej pojemna na długi pobyt.',
    bestFor: ['żółwie', 'łatwe dystanse', 'kompaktowa wyspa'],
    term: 'Rekomendowany termin 12-26 września 2026. Start przed drugą połową miesiąca, ale najlepszy układ dla Zakynthos.',
    base: [
      'Bazy: Keri, Laganas Bay, Vasilikos.',
      'Wybór bazy zależy od priorytetu: żółwie i zatoka, spokojny półwysep albo jaskinie i klify.',
      'Laganas wskazywany jako główny obszar żółwi.'
    ],
    transfer: [
      'Logistyka lokalna łatwa: krótki dojazd do baz, mała wyspa, krótkie dystanse.',
      'Pobyt powyżej 11 dni może zacząć nużyć motoryzacyjnie.'
    ],
    car: [
      'Auto klasy B/C.',
      'Wielkie porównanie: 100 PLN/dzień; system porównawczy: 190 PLN/dzień.',
      'Większość prostsza niż Albania; sprawdzić depozyt i zasady wypożyczalni.'
    ],
    weather: [
      'Wrzesień nadal ciepły i wakacyjny.',
      'Woda zwykle ciepła, a ryzyko pogody umiarkowanie niskie.',
      'Początek terminu 12.09 daje najlepsze loty, ale jest wcześniejszy niż idealna druga połowa miesiąca.'
    ],
    water: [
      'Snorkeling średni do dobrego, szczególnie jaskinie Keri i skaliste fragmenty.',
      'Wyspa wygrywa fauną żółwi, niekoniecznie bogactwem rafy.',
      'W lagunie i strefach ochronnych trzeba respektować zasady.'
    ],
    turtles: [
      'Najmocniejszy kierunek pod Caretta caretta.',
      'Laganas Bay, Marathonisi, Kalamaki i Gerakas jako kluczowe obszary.',
      'Obserwacje nie są gwarancją, ale prawdopodobieństwo jest najwyższe w zestawieniu.'
    ],
    nature: [
      'Keri Caves, klify, zatoki i południowe plaże.',
      'Kompaktowa wyspa dobra na spokojny odpoczynek.',
      'Mniej różnorodna lądowo niż Cypr, Turcja i Kreta.'
    ],
    culture: [
      'Miasteczka i lokalny grecki charakter.',
      'Kultura jest dodatkiem, nie głównym powodem wyboru.',
      'Najważniejszy punkt decyzji to fauna morska.'
    ],
    pluses: ['najlepsze żółwie', 'łatwa logistyka', 'krótkie dystanse', 'czytelny wyjazd bez trudnego transferu'],
    risks: ['możliwa monotonia powyżej 11 dni', 'tłumy w Laganas', 'snorkeling nie tak mocny jak Turcja', 'warianty pralek słabsze w starych raportach'],
    scores: { turtles: 10, snorkeling: 6, logistics: 9, economy: 5, sightseeing: 5 },
    localCosts: {
      foodMultiplier: '1.25',
      buffer: '1100 PLN',
      carComparison: '100 PLN/dzień vs 190 PLN/dzień'
    }
  },
  Cypr: {
    key: 'Cypr',
    viewId: 'cypr',
    displayName: 'Cypr Południowy',
    region: 'Pafos / Polis / Latchi / Akamas',
    accent: '#55a7e8',
    oneLine: 'Najlepszy balans pogody, wody, kultury i Akamas; droższy niż Albania, prostszy logistycznie.',
    bestFor: ['pogoda', 'balans', 'kultura i Akamas'],
    term: 'Preferowany zachodni Cypr w drugiej połowie września 2026; baza Pafos / Polis / Latchi zależnie od priorytetu.',
    base: [
      'Pafos dla kultury i krótszej logistyki.',
      'Polis / Latchi dla Akamas, Blue Lagoon, Lara Bay i spokojniejszej bazy.',
      'Larnaka odrzucona względem zachodu ze względu na Akamas i żółwie.'
    ],
    transfer: [
      'Pafos daje krótsze dojazdy niż Albania.',
      'Przy Polis / Latchi auto jest praktycznie obowiązkowe.',
      'Lokalna logistyka oceniana jako jedna z najłatwiejszych, mimo konieczności auta.'
    ],
    car: [
      'Auto klasy B/C.',
      'Wielkie porównanie: 95 PLN/dzień; system porównawczy: 180 PLN/dzień.',
      'Ruch lewostronny; pierwsze 2 dni wymagają adaptacji.'
    ],
    weather: [
      'Najpewniejsza pogoda w trójce Albania-Zakynthos-Cypr.',
      'Najcieplejsza woda i najniższe ryzyko opadów.',
      'Dobry kierunek, jeśli priorytetem jest stabilność warunków.'
    ],
    water: [
      'Blue Lagoon, Sea Caves, Akamas i Lara Bay są mocnymi punktami wodnymi.',
      'Snorkeling oceniany wysoko, choć Turcja może być mocniejsza pod widoczność i skaliste dno.',
      'Dobry balans ciepłej, przejrzystej wody i infrastruktury.'
    ],
    turtles: [
      'Bardzo mocny kierunek pod żółwie, zwłaszcza Lara Bay i Akamas.',
      'Dashboardy oceniają Cypr wysoko, choć ultimate pod żółwie wskazywał Zakynthos.'
    ],
    nature: [
      'Akamas, Lara Bay, Blue Lagoon, Avakas Gorge, klify i zachodnie wybrzeże.',
      'Góry i wąwozy jako uzupełnienie morza.',
      'Dobrze łączy plaże z naturą lądową.'
    ],
    culture: [
      'Pafos UNESCO, Tombs of the Kings, Kourion i wioski.',
      'Najmocniejsza kultura/archeologia w pierwotnej trójce.',
      'Dobry wybór, jeśli wyjazd ma być nie tylko plażowy.'
    ],
    pluses: ['najpewniejsza pogoda', 'ciepła woda', 'Akamas i kultura', 'łatwiejsza logistyka niż Albania'],
    risks: ['wyższe koszty', 'ruch lewostronny', 'auto praktycznie obowiązkowe przy Polis/Latchi', 'sprawdzać dojazdy na plaże i do sklepów'],
    scores: { turtles: 9, snorkeling: 8, logistics: 8, economy: 5, sightseeing: 9 },
    localCosts: {
      foodMultiplier: '1.20',
      buffer: '1200 PLN',
      carComparison: '95 PLN/dzień vs 180 PLN/dzień'
    }
  },
  Turcja: {
    key: 'Turcja',
    viewId: 'turcja',
    displayName: 'Turcja Egejska',
    region: 'Fethiye / Kas / Dalyan',
    accent: '#e98f45',
    oneLine: 'Najsilniejsza nowa kandydatka: widoczność, skaliste dno, Dalyan/Iztuzu i mocny koszt lokalny.',
    bestFor: ['snorkeling', 'natura i klify', 'koszt życia'],
    term: 'Wrzesień 2026 jako ciepły, nadal morski termin; trasa może łączyć Fethiye, Kas i Dalyan.',
    base: [
      'Fethiye dla wygodnej bazy i okolicy.',
      'Kas dla skalistego dna, widoczności i charakteru.',
      'Dalyan / Iztuzu dla żółwi i przyrody rzeczno-morskiej.'
    ],
    transfer: [
      'Logistyka zależy od lotniska i układu trasy.',
      'D400 jest atrakcją sama w sobie, ale dystanse są większe niż na małej wyspie.',
      'Poza UE: uwzględnić formalności, dokumenty i dane komórkowe.'
    ],
    car: [
      'Wielkie porównanie: 105 PLN/dzień; system porównawczy: 160 PLN/dzień.',
      'W checklistach pojawia się wymóg paszportu ważnego minimum 150 dni od daty wjazdu.',
      'Wypożyczalnie i ubezpieczyciele mogą wymagać paszportu.'
    ],
    weather: [
      'Ciepły kierunek wrześniowy z mocną wodą.',
      'Warunki wodne szczególnie atrakcyjne dla skalistych zatok.',
      'Należy uwzględnić większą złożoność logistyczną niż Cypr/Zakynthos.'
    ],
    water: [
      'Najlepsza w zestawieniu widoczność i skaliste dno według ekstraktu.',
      'Kas wskazywany jako bardzo mocny punkt snorkelingowy.',
      'Dalyan i Iztuzu dodają aspekt żółwi i przyrody.'
    ],
    turtles: [
      'Dalyan i Iztuzu Beach oceniane bardzo wysoko.',
      'Silna alternatywa dla Zakynthos i Cypru pod żółwie.'
    ],
    nature: [
      'Fethiye, Kas, Dalyan, Iztuzu, kaniony, klify i trasa D400.',
      'Bardzo mocna pod krajobraz i bazę wypadową.',
      'Wariant D z CSV pasuje do natury, klifów i charakteru.'
    ],
    culture: [
      'Kultura i archeologia oceniane wysoko w nowszych dashboardach.',
      'Dobra opcja, jeśli ma być więcej lądu, miast i historii niż na Zakynthos.',
      'Inny charakter niż UE/Grecja/Cypr.'
    ],
    pluses: ['najmocniejszy snorkeling', 'bardzo dobre żółwie', 'tanie koszty życia', 'dużo natury i trasa D400'],
    risks: ['poza UE', 'formalności paszportowe', 'większe dystanse', 'trzeba sprawdzić ubezpieczenie auta i dane komórkowe'],
    scores: { turtles: 9, snorkeling: 10, logistics: 6, economy: 8, sightseeing: 9 },
    localCosts: {
      foodMultiplier: '0.75',
      buffer: '900 PLN',
      carComparison: '105 PLN/dzień vs 160 PLN/dzień'
    }
  },
  Kreta: {
    key: 'Kreta',
    viewId: 'kreta',
    displayName: 'Kreta Zachodnia',
    region: 'Chania / Kissamos / Rethymno',
    accent: '#9c7cf4',
    oneLine: 'Bezpieczna europejska opcja z lagunami, wąwozami i kulturą; droższa i mniej żółwiowa.',
    bestFor: ['laguny i wąwozy', 'kultura', 'przewidywalność UE'],
    term: 'Wrzesień 2026 dla zachodniej Krety; region Chania / Kissamos / Rethymno.',
    base: [
      'Chania dla miasta, kultury i gastronomii.',
      'Kissamos dla Balos i zachodnich wycieczek.',
      'Rethymno jako alternatywa miejsko-plażowa.'
    ],
    transfer: [
      'Dobra przewidywalność europejska.',
      'Dystanse i górskie drogi wymagają planowania.',
      'Balos bezpieczniej robić rejsem z Kissamos, bo droga szutrowa może wyłączać ubezpieczenie.'
    ],
    car: [
      'Wielkie porównanie: 120 PLN/dzień; system porównawczy: 210 PLN/dzień.',
      'Auto potrzebne do lagun, wąwozów i tras poza miastami.',
      'Sprawdzać ograniczenia ubezpieczenia na drogach szutrowych.'
    ],
    weather: [
      'Ciepły wrzesień, ale północ może łapać fale Meltemi.',
      'Dobra opcja krajobrazowa i stabilna europejsko.',
      'Warunki wodne zależą od strony wyspy i wiatru.'
    ],
    water: [
      'Balos, laguny i zatoki są wizualnie bardzo mocne.',
      'Snorkeling raczej krajobrazowy niż faunistycznie najlepszy.',
      'Meltemi może utrudniać wodę na północy.'
    ],
    turtles: [
      'Żółwie oceniane średnio; ARCHELON Chania pojawia się jako kontekst.',
      'Nie jest to kierunek żółwiowy na poziomie Zakynthos, Cypru lub Turcji.'
    ],
    nature: [
      'Balos, Elafonisi, Falassarna, Samaria i inne wąwozy, klify i zachodnie krajobrazy.',
      'Wariant D z CSV pasuje do lagun, natury i bazy wypadowej.',
      'Jedna z najmocniejszych opcji lądowo-krajobrazowych.'
    ],
    culture: [
      'Chania, Rethymno, muzea, stare miasta i kuchnia.',
      'Wysoka wartość zwiedzania obok plaż.',
      'Dobra opcja dla bezpiecznej, europejskiej wersji wakacji.'
    ],
    pluses: ['laguny i wąwozy', 'kultura i miasta', 'przewidywalność UE', 'duża różnorodność dnia'],
    risks: ['wyższe koszty życia', 'droższe auto', 'Meltemi na północy', 'Balos i drogi szutrowe a ubezpieczenie'],
    scores: { turtles: 5, snorkeling: 6, logistics: 8, economy: 4, sightseeing: 9 },
    localCosts: {
      foodMultiplier: '1.30',
      buffer: '1300 PLN',
      carComparison: '120 PLN/dzień vs 210 PLN/dzień'
    }
  }
};

export const GLOBAL_RANKING = [
  ['Najniższe koszty lokalne', 'Albania', 'Najtańsze życie, jedzenie i ogólny pobyt; współczynnik jedzenia 0.85.'],
  ['Żółwie', 'Zakynthos / Cypr / Turcja', 'Ultimate wskazuje Zakynthos; nowsze dashboardy bardzo wysoko oceniają Cypr i Turcję.'],
  ['Najpewniejsza pogoda', 'Cypr', 'Najniższe ryzyko opadów w trójce i najcieplejsza woda.'],
  ['Klify, natura, krajobraz', 'Albania / Cypr / Turcja / Kreta', 'Ultimate wskazuje Albanię lub Cypr; rozszerzone dashboardy dodają Turcję i Kretę.'],
  ['Kultura i archeologia', 'Cypr / Turcja / Kreta', 'Cypr prowadził w ultimate; systemowy matchmaker wysoko ocenia także Turcję i Kretę.'],
  ['Najłatwiejsza logistyka lokalna', 'Cypr / Zakynthos / Kreta', 'Łatwe dojazdy, przewidywalność i krótkie dystanse względem Albanii i Turcji.']
];

export const REJECTED_ALTERNATIVES = [
  ['Włochy / Bari / Apulia', 'Odrzucone jako zbyt drogie całkowicie; noclegi i ubezpieczenia aut przebijały budżet względem Albanii i Turcji.'],
  ['Malta', 'Tanie loty nie równoważyły drogich noclegów apartamentowych z wymogiem pralki.'],
  ['Rodos / Korfu / Kreta', 'W ultimate przegrały z Zakynthos pod żółwie; Kreta wraca w nowszych dashboardach jako osobna destynacja.'],
  ['Larnaka vs Pafos', 'Preferowany zachodni Cypr: Pafos / Polis / Latchi ze względu na Akamas, Lara Bay, Blue Lagoon i żółwie.']
];

export const CHECKLIST = [
  'Pralka i hotelowe detale będą wiązane później; w v1 pilnować tylko długości i wariantu z CSV.',
  'Przy aucie sprawdzić depozyt, udział własny, politykę paliwową i wymóg karty kredytowej.',
  'Przy żółwiach respektować strefy ochronne i nie zakładać gwarancji obserwacji.',
  'Albania: nie przeciążać pierwszego i ostatniego dnia przez transfer Tirana-Saranda.',
  'Cypr: ruch lewostronny i auto praktycznie obowiązkowe przy Polis / Latchi / Akamas.',
  'Turcja: formalności poza UE, paszport i dane komórkowe.',
  'Kreta: Balos najlepiej rejsem z Kissamos, bo szuter może wyłączać ubezpieczenie.'
];

export const SUMMARY_WEIGHTS: Record<keyof ScoreSet, string> = {
  turtles: 'Żółwie',
  snorkeling: 'Snorkeling',
  logistics: 'Logistyka',
  economy: 'Ekonomia',
  sightseeing: 'Zwiedzanie'
};

export const TILES_BY_VIEW: Record<ViewId, TileLayout[]> = {
  summary: [
    { id: 'summary-hero', kind: 'hero', title: 'Ultimate Holiday Canvas', x: 72, y: 70, w: 680, h: 300 },
    { id: 'summary-ranking', kind: 'ranking', title: 'Ranking priorytetów', x: 790, y: 80, w: 590, h: 520 },
    { id: 'summary-matchmaker', kind: 'matchmaker', title: 'Interaktywny matchmaker', x: 90, y: 430, w: 620, h: 560 },
    { id: 'summary-strategic', kind: 'strategic', title: 'Tabela strategiczna', x: 750, y: 650, w: 720, h: 520 },
    { id: 'summary-budget', kind: 'budget', title: 'Koszty lokalne', x: 140, y: 1060, w: 540, h: 430 },
    { id: 'summary-checklist', kind: 'checklist', title: 'Odprawa i checklista', x: 740, y: 1230, w: 620, h: 460 },
    { id: 'summary-conflicts', kind: 'conflicts', title: 'Rozbieżności i decyzje', x: 140, y: 1560, w: 640, h: 390 }
  ],
  albania: destinationTiles('albania'),
  grecja: destinationTiles('grecja'),
  cypr: destinationTiles('cypr'),
  turcja: destinationTiles('turcja'),
  kreta: destinationTiles('kreta')
};

function destinationTiles(view: ViewId): TileLayout[] {
  return [
    { id: `${view}-head`, kind: 'destination', title: 'Profil kierunku', x: 70, y: 70, w: 650, h: 330 },
    { id: `${view}-controls`, kind: 'controls', title: 'Długość i wariant', x: 780, y: 95, w: 560, h: 280 },
    { id: `${view}-logistics`, kind: 'destination', title: 'Baza i logistyka', x: 115, y: 470, w: 590, h: 470 },
    { id: `${view}-weather`, kind: 'destination', title: 'Pogoda, woda, żółwie', x: 755, y: 440, w: 650, h: 520 },
    { id: `${view}-nature`, kind: 'destination', title: 'Natura i kultura', x: 100, y: 1030, w: 640, h: 510 },
    { id: `${view}-risks`, kind: 'destination', title: 'Plusy, ryzyka, koszty lokalne', x: 800, y: 1040, w: 560, h: 470 },
    { id: `${view}-hotel-reserve`, kind: 'hotel-reserve', title: 'Miejsce na przyszłe hotele', x: 170, y: 1640, w: 1120, h: 360 }
  ];
}

export function getDestinationControls(destination: DestinationKey) {
  const group = HOTEL_MATRIX_GROUPS.find((item) => item.destination === destination);

  if (!group) {
    throw new Error(`Unknown destination: ${destination}`);
  }

  return {
    ...group,
    totalRows: group.lengths.length * group.variants.length * group.rowsPerLengthVariant
  };
}

export function calculateMatches(weights: ScoreSet) {
  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0);

  return Object.values(DESTINATION_PROFILES)
    .map((profile) => {
      const weighted =
        profile.scores.turtles * weights.turtles +
        profile.scores.snorkeling * weights.snorkeling +
        profile.scores.logistics * weights.logistics +
        profile.scores.economy * weights.economy +
        profile.scores.sightseeing * weights.sightseeing;

      return {
        destination: profile.key,
        label: profile.displayName,
        accent: profile.accent,
        score: Math.round((weighted / (totalWeight * 10)) * 100)
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function validateTileLayouts() {
  const errors: string[] = [];

  for (const [view, tiles] of Object.entries(TILES_BY_VIEW)) {
    const ids = new Set<string>();

    for (const tile of tiles) {
      if (ids.has(tile.id)) {
        errors.push(`${view}: duplicate tile id ${tile.id}`);
      }
      ids.add(tile.id);

      if (tile.x < 0 || tile.y < 0 || tile.w <= 0 || tile.h <= 0) {
        errors.push(`${view}: invalid geometry for ${tile.id}`);
      }
    }

    if (view !== 'summary' && !tiles.some((tile) => tile.kind === 'hotel-reserve')) {
      errors.push(`${view}: missing hotel reserve tile`);
    }
  }

  return errors;
}
