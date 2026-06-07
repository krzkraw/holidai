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
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
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

export const GRID = {
  columns: 6,
  gap: 18
} as const;

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
    oneLine: 'Najlepsza opcja budżetowa: morze, zatoki, góry i Butrint; świetna wizualnie, ale logistycznie trudniejsza niż wyspy.',
    bestFor: ['koszt lokalny', 'krajobraz morze + góry', 'dłuższy pobyt'],
    term: 'Rekomendowany termin 16-30 września 2026. Najlepiej 14/15 dni; 11/12 dni też działa, ale 7/8 dni słabnie przez transfer z Tirany.',
    base: [
      'Saranda jako główna baza.',
      'Łączyć z Ksamil, Butrint i Blue Eye.',
      'Rozważyć 2-3 noce w Himarze / Dhermi / okolicy Vlory; nie robić całego pobytu tylko w Ksamilu.'
    ],
    transfer: [
      'Tirana-Saranda ok. 4.5-6 h samochodem.',
      'Najbardziej użytkowy jest dziś przejazd przez SH4 / Gjirokastrę / Kardhiq–Delvinë; nowa oś oszczędza około 30 minut.',
      'Wariant przez Vlore - Llogara - Himare jest piękniejszy, ale męczący; pierwszy i ostatni dzień bez ambitnego planu.'
    ],
    car: [
      'Auto klasy B/C.',
      'Realny zakres: ok. 90-160 PLN/dzień; przy 14 dniach ok. 1 300-2 200 PLN za samo auto plus paliwo i parking.',
      'Ryzyka: chaos drogowy, mniej przewidywalna infrastruktura, depozyt i karta kredytowa kierowcy.'
    ],
    weather: [
      'Powietrze w późnym lecie wciąż bardzo ciepłe: dzień zwykle wysokie 20+°C, noce około 20°C lub lekko poniżej.',
      'Woda ok. 24-26°C.',
      'Opady niskie do umiarkowanych; nadal bardzo dobry termin kąpielowy.'
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
    scores: { turtles: 1, snorkeling: 4, logistics: 4, economy: 9, sightseeing: 7 },
    localCosts: {
      foodMultiplier: '0.85',
      buffer: '900 PLN',
      carComparison: '90 PLN/dzień vs 160 PLN/dzień'
    }
  },
  Grecja: {
    key: 'Grecja',
    viewId: 'grecja',
    displayName: 'Grecja / Zakynthos',
    region: 'Keri / Laganas Bay / Vasilikos',
    accent: '#f3b84c',
    oneLine: 'Najmocniejsza destynacja pod Caretta caretta, łatwa logistycznie i bardzo dobra na wrześniowy wyjazd, ale mniej pojemna na długi pobyt.',
    bestFor: ['żółwie', 'łatwe dystanse', 'kompaktowa wyspa'],
    term: 'Rekomendowany termin 16-30 września 2026. 7/8 lub 11/12 dni są najlepsze; 14/15 dni jest możliwe, ale wyspa szybko staje się monotonna.',
    base: [
      'Bazy: Keri, Laganas Bay, Vasilikos.',
      'Laganas / Kalamaki są najlepsze, jeśli priorytetem są żółwie; Vasilikos i Gerakas są spokojniejsze; Keri daje klify i jaskinie.',
      'Laganas wskazywany jako główny obszar żółwi.'
    ],
    transfer: [
      'Lotnisko - Laganas / Kalamaki to zwykle 10-15 min, Lotnisko - Keri 20-30 min, Lotnisko - Vasilikos / Gerakas 25-40 min.',
      'Logistyka lokalna łatwa: krótki dojazd do baz, mała wyspa, krótkie dystanse.',
      'Pobyt powyżej 11 dni może zacząć nużyć motoryzacyjnie.'
    ],
    car: [
      'Auto klasy B/C.',
      'Realny zakres sezonowy: ok. 120-220 PLN/dzień; najtańsze oferty zwykle mają ostrzejszy depozyt i ubezpieczenie.',
      'Większość prostsza niż Albania; sprawdzić depozyt i zasady wypożyczalni.'
    ],
    weather: [
      'Wrzesień nadal ciepły i wakacyjny; średni maks około 27.6°C, średni min około 18.8°C.',
      'Woda zwykle ciepła; opady około 25.4 mm i średnio 2.8 dnia z opadem >= 1 mm.',
      'Druga połowa września nadal jest bardzo dobra kąpielowo.'
    ],
    water: [
      'Snorkeling średni do dobrego, szczególnie jaskinie Keri i skaliste fragmenty.',
      'Wyspa wygrywa fauną żółwi, niekoniecznie bogactwem rafy.',
      'W lagunie i strefach ochronnych trzeba respektować zasady.'
    ],
    turtles: [
      'Najmocniejszy kierunek pod Caretta caretta.',
      'Laganas Bay, Marathonisi, Kalamaki, Gerakas i Sekania jako kluczowe obszary; Sekania jest zamknięta dla odwiedzających.',
      'Obserwacje nie są gwarancją, ale prawdopodobieństwo jest najwyższe w zestawieniu.'
    ],
    nature: [
      'Keri Caves, Blue Caves, klify, zatoki i południowe plaże.',
      'Kompaktowa wyspa dobra na spokojny odpoczynek.',
      'Mniej różnorodna lądowo niż Cypr, Turcja i Kreta.'
    ],
    culture: [
      'Miasteczka i lokalny grecki charakter.',
      'Kultura jest dodatkiem, nie głównym powodem wyboru.',
      'Najważniejszy punkt decyzji to fauna morska.'
    ],
    pluses: ['najlepsze żółwie', 'łatwa logistyka', 'krótkie dystanse', 'czytelny wyjazd bez trudnego transferu'],
    risks: ['możliwa monotonia powyżej 11 dni', 'tłumy w Laganas', 'snorkeling nie tak mocny jak Turcja', 'strefy ochronne i ograniczenia plaż lęgowych'],
    scores: { turtles: 10, snorkeling: 6, logistics: 9, economy: 5, sightseeing: 5 },
    localCosts: {
      foodMultiplier: '1.25',
      buffer: '1100 PLN',
      carComparison: '120 PLN/dzień vs 220 PLN/dzień'
    }
  },
  Cypr: {
    key: 'Cypr',
    viewId: 'cypr',
    displayName: 'Cypr Południowy',
    region: 'Pafos / Polis / Latchi / Akamas',
    accent: '#55a7e8',
    oneLine: 'Najlepszy balans pogody, wody, kultury i Akamas; ciepły, stabilny i prostszy logistycznie niż Albania.',
    bestFor: ['pogoda', 'balans', 'kultura i Akamas'],
    term: 'Preferowany zachodni Cypr w drugiej połowie września 2026; 11/12 dni optymalne, 14/15 też ma sens przy szerszym objeździe.',
    base: [
      'Pafos dla kultury i krótszej logistyki.',
      'Polis / Latchi dla Akamas, Blue Lagoon, Lara Bay i spokojniejszej bazy.',
      'Larnaka odrzucona względem zachodu ze względu na Akamas, Lara i żółwie.'
    ],
    transfer: [
      'Pafos Airport - Pafos to zwykle 15-25 min; Pafos - Polis / Latchi 45-60 min.',
      'Przy Polis / Latchi auto jest praktycznie obowiązkowe.',
      'Lokalna logistyka oceniana jako jedna z najłatwiejszych, mimo konieczności auta.'
    ],
    car: [
      'Auto klasy B/C.',
      'Wielkie porównanie: 95 PLN/dzień; system porównawczy: 180 PLN/dzień.',
      'Ruch lewostronny; pierwsze 2 dni wymagają adaptacji.'
    ],
    weather: [
      'Pafos i zachód trzymają zwykle około 30°C w dzień i 19°C w nocy.',
      'Morze we wrześniu trzyma około 26°C.',
      'Najpewniejsza pogoda w trójce Albania-Zakynthos-Cypr.'
    ],
    water: [
      'Blue Lagoon, Sea Caves, Akamas i Lara Bay są mocnymi punktami wodnymi.',
      'Snorkeling oceniany wysoko, choć Turcja może być mocniejsza pod widoczność i skaliste dno.',
      'Dobry balans ciepłej, przejrzystej wody i infrastruktury.'
    ],
    turtles: [
      'Bardzo mocny kierunek pod żółwie, zwłaszcza Lara Bay i Akamas.',
      'To bardziej plaże lęgowe i obszar ochrony niż obietnica pewnej obserwacji w wodzie.'
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
    scores: { turtles: 8, snorkeling: 8, logistics: 8, economy: 5, sightseeing: 9 },
    localCosts: {
      foodMultiplier: '1.20',
      buffer: '1200 PLN',
      carComparison: '110 PLN/dzień vs 190 PLN/dzień'
    }
  },
  Turcja: {
    key: 'Turcja',
    viewId: 'turcja',
    displayName: 'Turcja Egejska',
    region: 'Fethiye / Kaş / Dalyan',
    accent: '#e98f45',
    oneLine: 'Najsilniejsza nowa kandydatka: widoczność, skaliste dno, Dalyan / İztuzu i mocny koszt lokalny.',
    bestFor: ['snorkeling', 'żółwie', 'natura i klify'],
    term: 'Wrzesień 2026 z lotem do Dalaman; 11/12 lub 14/15 dni najlepsze, 7/8 dni tylko przy jednej bazie.',
    base: [
      'Fethiye dla wygodnej bazy i okolicy.',
      'Kaş dla skalistego dna, widoczności i charakteru.',
      'Dalyan / İztuzu dla żółwi i przyrody rzeczno-morskiej.'
    ],
    transfer: [
      'Dalaman - Dalyan to zwykle 30-40 min, Dalaman - Fethiye / Ölüdeniz 45-60 min, Dalaman - Kaş około 2.5-3.5 h.',
      'D400 jest atrakcją sama w sobie, ale dystanse są większe niż na małej wyspie.',
      'Poza UE: uwzględnić dokument podróży, roaming i dane komórkowe.'
    ],
    car: [
      'Wielkie porównanie: ok. 110-190 PLN/dzień.',
      'Polak może wjechać także na dowód osobisty; jeśli jedziesz na paszporcie, obowiązuje 150 dni ważności od dnia wjazdu.',
      'Wypożyczalnie zwykle i tak oczekują dokumentu, prawa jazdy i karty na kierowcę.'
    ],
    weather: [
      'Ciepły kierunek wrześniowy z mocną wodą; morze trzyma około 27.4°C.',
      'Warunki wodne szczególnie atrakcyjne dla skalistych zatok.',
      'Należy uwzględnić większą złożoność logistyczną niż Cypr / Zakynthos.'
    ],
    water: [
      'Najlepsza w zestawieniu widoczność i skaliste dno według ekstraktu.',
      'Kaş wskazywany jako bardzo mocny punkt snorkelingowy.',
      'Dalyan i Iztuzu dodają aspekt żółwi i przyrody.'
    ],
    turtles: [
      'Dalyan i İztuzu Beach oceniane bardzo wysoko.',
      'Silna alternatywa dla Zakynthos i Cypru pod żółwie; plaża ma nocne zamknięcie i ochronę gniazd.'
    ],
    nature: [
      'Fethiye, Kaş, Dalyan, İztuzu, Butterfly Valley, kaniony, klify i trasa D400.',
      'Bardzo mocna pod krajobraz i bazę wypadową.',
      'Butterfly Valley ma ściany dochodzące do około 350 m, więc to realnie klifowy kierunek.'
    ],
    culture: [
      'Xanthos-Letoon / UNESCO, Fethiye Museum, Tomb of Amyntas i Kaunos.',
      'Kultura i archeologia oceniane wysoko w nowszych dashboardach.',
      'Mocniejszy i grubszy kierunek niż Zakynthos pod warstwę historyczną.'
    ],
    pluses: ['najmocniejszy snorkeling', 'bardzo dobre żółwie', 'tanie koszty życia', 'dużo natury i trasa D400'],
    risks: ['poza UE', 'większe dystanse', 'formalności zależne od dokumentu i wypożyczalni', 'trzeba sprawdzić ubezpieczenie auta i dane komórkowe'],
    scores: { turtles: 9, snorkeling: 9, logistics: 6, economy: 8, sightseeing: 9 },
    localCosts: {
      foodMultiplier: '0.80',
      buffer: '1000 PLN',
      carComparison: '110 PLN/dzień vs 190 PLN/dzień'
    }
  },
  Kreta: {
    key: 'Kreta',
    viewId: 'kreta',
    displayName: 'Kreta Zachodnia',
    region: 'Chania / Kissamos / Rethymno',
    accent: '#9c7cf4',
    oneLine: 'Bezpieczna europejska opcja z lagunami, wąwozami i starym miastem; droższa i umiarkowanie żółwiowa.',
    bestFor: ['laguny i wąwozy', 'kultura', 'przewidywalność UE'],
    term: 'Wrzesień 2026 dla zachodniej Krety; 11/12 dni optymalne, 14/15 przy szerszym objeździe, 7/8 tylko przy Chania + Kissamos.',
    base: [
      'Chania dla miasta, kultury i gastronomii.',
      'Kissamos dla Balos i zachodnich wycieczek.',
      'Rethymno jako alternatywa miejsko-plażowa.'
    ],
    transfer: [
      'Chania Airport leży ok. 14 km od Chanii; 20-30 min do Chanii, 55-70 min do Kissamos, 70-90 min do Rethymno.',
      'Dystanse i górskie drogi wymagają planowania.',
      'Balos bezpieczniej robić rejsem z Kissamos, bo droga szutrowa może wyłączać ubezpieczenie.'
    ],
    car: [
      'Wielkie porównanie: ok. 130-220 PLN/dzień.',
      'Auto potrzebne do lagun, wąwozów i tras poza miastami.',
      'Sprawdzać ograniczenia ubezpieczenia na drogach szutrowych.'
    ],
    weather: [
      'Ciepły wrzesień, ale północ może łapać fale Meltemi.',
      'Woda na północy to zwykle około 24°C.',
      'Dobra opcja krajobrazowa i stabilna europejsko.'
    ],
    water: [
      'Balos, laguny i zatoki są wizualnie bardzo mocne.',
      'Snorkeling raczej krajobrazowy niż faunistycznie najlepszy.',
      'Meltemi może utrudniać wodę na północy.'
    ],
    turtles: [
      'Sezonowe projekty ARCHELON działają od połowy maja do połowy października, więc żółwie są realnym elementem tła wyspy.',
      'Nie jest to kierunek żółwiowy na poziomie Zakynthos, Cypru lub Turcji.'
    ],
    nature: [
      'Balos, Elafonisi, Falassarna, Samaria i inne wąwozy, klify i zachodnie krajobrazy.',
      'Samaria Gorge ma około 16 km i jest jednym z najmocniejszych produktów przyrodniczych zachodu Krety.',
      'Jedna z najmocniejszych opcji lądowo-krajobrazowych.'
    ],
    culture: [
      'Chania, Rethymno, muzea, stare miasta i kuchnia.',
      'Wysoka wartość zwiedzania obok plaż.',
      'Dobra opcja dla bezpiecznej, europejskiej wersji wakacji.'
    ],
    pluses: ['laguny i wąwozy', 'kultura i miasta', 'przewidywalność UE', 'duża różnorodność dnia'],
    risks: ['wyższe koszty życia', 'droższe auto', 'Meltemi na północy', 'Balos i drogi szutrowe a ubezpieczenie'],
    scores: { turtles: 6, snorkeling: 6, logistics: 8, economy: 4, sightseeing: 9 },
    localCosts: {
      foodMultiplier: '1.30',
      buffer: '1300 PLN',
      carComparison: '130 PLN/dzień vs 220 PLN/dzień'
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
  'Karty hoteli korzystają z długości pobytu i wariantu z toolbara; cena pochodzi z booking.stays.',
  'Przy aucie sprawdzić depozyt, udział własny, politykę paliwową i wymóg karty kredytowej.',
  'Przy żółwiach respektować strefy ochronne i nie zakładać gwarancji obserwacji.',
  'Albania: nie przeciążać pierwszego i ostatniego dnia przez transfer Tirana-Saranda.',
  'Cypr: ruch lewostronny i auto praktycznie obowiązkowe przy Polis / Latchi / Akamas.',
  'Turcja: sprawdzić dokument podróży, roaming i ubezpieczenie auta.',
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
    { id: 'summary-hero', kind: 'hero', title: 'Ultimate Holiday Canvas', col: 1, row: 1, colSpan: 3, rowSpan: 3 },
    { id: 'summary-ranking', kind: 'ranking', title: 'Ranking priorytetów', col: 4, row: 1, colSpan: 3, rowSpan: 3 },
    { id: 'summary-matchmaker', kind: 'matchmaker', title: 'Interaktywny matchmaker', col: 1, row: 4, colSpan: 3, rowSpan: 3 },
    { id: 'summary-strategic', kind: 'strategic', title: 'Tabela strategiczna', col: 4, row: 4, colSpan: 3, rowSpan: 3 },
    { id: 'summary-budget', kind: 'budget', title: 'Koszty lokalne', col: 1, row: 7, colSpan: 3, rowSpan: 3 },
    { id: 'summary-checklist', kind: 'checklist', title: 'Odprawa i checklista', col: 4, row: 7, colSpan: 3, rowSpan: 3 },
    { id: 'summary-conflicts', kind: 'conflicts', title: 'Rozbieżności i decyzje', col: 1, row: 10, colSpan: 3, rowSpan: 3 }
  ],
  albania: destinationTiles('albania'),
  grecja: destinationTiles('grecja'),
  cypr: destinationTiles('cypr'),
  turcja: destinationTiles('turcja'),
  kreta: destinationTiles('kreta')
};

function destinationTiles(view: ViewId): TileLayout[] {
  return [
    { id: `${view}-head`, kind: 'destination', title: 'Profil kierunku', col: 1, row: 1, colSpan: 3, rowSpan: 3 },
    { id: `${view}-base`, kind: 'destination', title: 'Baza', col: 4, row: 1, colSpan: 3, rowSpan: 1 },
    { id: `${view}-transfer`, kind: 'destination', title: 'Transfer', col: 4, row: 2, colSpan: 3, rowSpan: 1 },
    { id: `${view}-car`, kind: 'destination', title: 'Auto', col: 4, row: 3, colSpan: 3, rowSpan: 1 },
    { id: `${view}-weather`, kind: 'destination', title: 'Pogoda', col: 1, row: 4, colSpan: 2, rowSpan: 2 },
    { id: `${view}-water`, kind: 'destination', title: 'Woda / snorkeling', col: 3, row: 4, colSpan: 2, rowSpan: 2 },
    { id: `${view}-turtles`, kind: 'destination', title: 'Żółwie', col: 5, row: 4, colSpan: 2, rowSpan: 2 },
    { id: `${view}-nature`, kind: 'destination', title: 'Natura', col: 1, row: 6, colSpan: 3, rowSpan: 2 },
    { id: `${view}-culture`, kind: 'destination', title: 'Kultura', col: 4, row: 6, colSpan: 3, rowSpan: 2 },
    { id: `${view}-hotel-reserve`, kind: 'hotel-reserve', title: 'Hotele Booking.com', col: 1, row: 8, colSpan: 3, rowSpan: 3 }
  ];
}

export function getViewLayout(view: ViewId, pageWidth: number) {
  const column = DESTINATION_TABS.findIndex((tab) => tab.id === view);

  if (column < 0) {
    throw new Error(`Unknown view: ${view}`);
  }

  return {
    column,
    x: column * pageWidth
  };
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

      const lastColumn = tile.col + tile.colSpan - 1;

      if (tile.col < 1 || tile.row < 1 || tile.colSpan < 1 || tile.rowSpan < 1) {
        errors.push(`${view}: invalid geometry for ${tile.id}`);
      }

      if (lastColumn > GRID.columns) {
        errors.push(`${view}: tile ${tile.id} exceeds grid columns`);
      }
    }

    if (view !== 'summary' && !tiles.some((tile) => tile.kind === 'hotel-reserve')) {
      errors.push(`${view}: missing hotel reserve tile`);
    }
  }

  return errors;
}
