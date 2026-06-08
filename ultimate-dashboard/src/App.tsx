import { useEffect, useMemo, useRef, useState } from 'react';
import { BookingFavoritesMenu } from './components/BookingFavoritesMenu';
import { BookingGrid } from './components/BookingGrid';
import { BookingPriceRangesTile } from './components/BookingPriceRangesTile';
import { FlightFavoritesMenu } from './components/FlightFavoritesMenu';
import { FlightOptionsTile } from './components/FlightOptionsTile';
import { ShaderBackground } from './components/ShaderBackground';
import { getCompactLengthLabel, getCompactVariantLabel } from './controls';
import { BookingJson, loadBookingsData } from './data/bookings';
import { FLIGHT_OPTIONS } from './data/flights';
import type { FlightOption } from './data/flights';
import {
  FavoriteBookingsByDestination,
  FavoriteFlightsByDestination,
  getBookingFavoriteKey,
  getFavoriteBookingsForDestination,
  getFavoriteFlightsForDestination,
  getFlightFavoriteKey,
  resolveSelectedFavoriteAfterToggle,
  toggleFavoriteBooking,
  toggleFavoriteFlight
} from './favorites';
import {
  CHECKLIST,
  DESTINATION_PROFILES,
  DESTINATION_TABS,
  DestinationKey,
  GLOBAL_RANKING,
  HOTEL_MATRIX_GROUPS,
  REJECTED_ALTERNATIVES,
  SUMMARY_WEIGHTS,
  ScoreSet,
  TILES_BY_VIEW,
  TileLayout,
  ViewId,
  calculateMatches,
  getDestinationControls,
  getViewLayout
} from './model';
import { readDashboardPreferences, writeDashboardPreferences } from './preferences';
import { calculateTripTotal, calculateTripTotalRange, formatTripTotal, formatTripTotalRange } from './selection';

const initialWeights: ScoreSet = {
  turtles: 3,
  snorkeling: 3,
  logistics: 3,
  economy: 3,
  sightseeing: 3
};

const initialLengthByDestination: Record<DestinationKey, string> = {
  Albania: '14',
  Grecja: '14',
  Cypr: '14',
  Turcja: '14',
  Kreta: '14'
};

const CANVAS_TRANSITION_MS = 640;
const CANVAS_VIEW_RETENTION_BUFFER_MS = 80;
const CANVAS_VIEW_RETENTION_MS = CANVAS_TRANSITION_MS + CANVAS_VIEW_RETENTION_BUFFER_MS;
const PHONE_VIEWPORT_MAX_WIDTH = 768;
const PHONE_VIEWPORT_QUERY = `(max-width: ${PHONE_VIEWPORT_MAX_WIDTH}px)`;

export function shouldRenderViewContent(
  activeView: ViewId,
  previousView: ViewId | null | undefined,
  viewId: ViewId,
): boolean {
  return viewId === activeView || viewId === previousView;
}

export function resolveLightweightVisualsPreference(preference: boolean | null | undefined): boolean {
  return preference ?? true;
}

function createInitialVariantByDestination(): Record<DestinationKey, string> {
  return Object.fromEntries(HOTEL_MATRIX_GROUPS.map((group) => [group.destination, group.variants[0]])) as Record<DestinationKey, string>;
}

function hydrateLengthPreferences(storedLengths: Partial<Record<DestinationKey, string>>): Record<DestinationKey, string> {
  const nextLengths = { ...initialLengthByDestination };

  for (const group of HOTEL_MATRIX_GROUPS) {
    const storedLength = storedLengths[group.destination];
    if (storedLength && group.lengths.includes(storedLength)) {
      nextLengths[group.destination] = storedLength;
    }
  }

  return nextLengths;
}

function hydrateVariantPreferences(storedVariants: Partial<Record<DestinationKey, string>>): Record<DestinationKey, string> {
  const nextVariants = createInitialVariantByDestination();

  for (const group of HOTEL_MATRIX_GROUPS) {
    const storedVariant = storedVariants[group.destination];
    if (storedVariant && group.variants.includes(storedVariant)) {
      nextVariants[group.destination] = storedVariant;
    }
  }

  return nextVariants;
}

function clearDestinationValue(
  values: Partial<Record<DestinationKey, string>>,
  destination: DestinationKey,
): Partial<Record<DestinationKey, string>> {
  const nextValues = { ...values };
  delete nextValues[destination];
  return nextValues;
}

function setDestinationValue(
  values: Partial<Record<DestinationKey, string>>,
  destination: DestinationKey,
  value: string | undefined,
): Partial<Record<DestinationKey, string>> {
  return value ? { ...values, [destination]: value } : clearDestinationValue(values, destination);
}

function getIsPhoneViewport() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.matchMedia(PHONE_VIEWPORT_QUERY).matches;
  } catch {
    return window.innerWidth <= PHONE_VIEWPORT_MAX_WIDTH;
  }
}

export function App() {
  const viewportRef = useRef<HTMLElement | null>(null);
  const storedPreferences = useMemo(() => readDashboardPreferences(), []);
  const [activeView, setActiveView] = useState<ViewId>('summary');
  const [previousView, setPreviousView] = useState<ViewId | null>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [isPhoneViewport, setIsPhoneViewport] = useState(getIsPhoneViewport);
  const [bookings, setBookings] = useState<readonly BookingJson[]>([]);
  const [bookingsStatus, setBookingsStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [lightweightMobileVisuals, setLightweightMobileVisuals] = useState<boolean | null>(
    storedPreferences.lightweightMobileVisuals,
  );
  const [mobilePerformanceNoticeDismissed, setMobilePerformanceNoticeDismissed] = useState(
    storedPreferences.mobilePerformanceNoticeDismissed,
  );
  const [favoriteBookingsByDestination, setFavoriteBookingsByDestination] = useState<FavoriteBookingsByDestination>(
    storedPreferences.favorites,
  );
  const [favoriteFlightsByDestination, setFavoriteFlightsByDestination] = useState<FavoriteFlightsByDestination>(
    storedPreferences.flightFavorites,
  );
  const [selectedBookingByDestination, setSelectedBookingByDestination] = useState<Partial<Record<DestinationKey, string>>>(
    storedPreferences.selectedBookings,
  );
  const [selectedFlightByDestination, setSelectedFlightByDestination] = useState<Partial<Record<DestinationKey, string>>>(
    storedPreferences.selectedFlights,
  );
  const [weights, setWeights] = useState<ScoreSet>(initialWeights);
  const [lengthByDestination, setLengthByDestination] = useState<Record<DestinationKey, string>>(() =>
    hydrateLengthPreferences(storedPreferences.lengths),
  );
  const [variantByDestination, setVariantByDestination] = useState<Record<DestinationKey, string>>(() =>
    hydrateVariantPreferences(storedPreferences.variants),
  );

  const matches = useMemo(() => calculateMatches(weights), [weights]);
  const activeColumn = getViewLayout(activeView, 1).column;
  const activeOffset = pageWidth > 0 ? `${activeColumn * -pageWidth}px` : `${activeColumn * -100}vw`;
  const canvasStackStyle = { '--active-offset': activeOffset } as React.CSSProperties;
  const activeDestination = DESTINATION_TABS.find((tab) => tab.id === activeView)?.destination;
  const activeLength = activeDestination ? lengthByDestination[activeDestination] : '';
  const activeVariant = activeDestination ? variantByDestination[activeDestination] : '';
  const renderSummaryContent = shouldRenderViewContent(activeView, previousView, 'summary');
  const effectiveLightweightVisuals = resolveLightweightVisualsPreference(lightweightMobileVisuals);
  const showMobilePerformanceToast =
    isPhoneViewport && effectiveLightweightVisuals && !mobilePerformanceNoticeDismissed;
  const appShellClasses = ['app-shell', effectiveLightweightVisuals ? 'app-shell--lightweight-visuals' : '']
    .filter(Boolean)
    .join(' ');

  useEffect(() => {
    const updatePageWidth = () => {
      setPageWidth(viewportRef.current?.clientWidth ?? window.innerWidth);
    };
    const resizeObserver = new ResizeObserver(updatePageWidth);

    updatePageWidth();

    if (viewportRef.current) {
      resizeObserver.observe(viewportRef.current);
    }

    window.addEventListener('resize', updatePageWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updatePageWidth);
    };
  }, []);

  useEffect(() => {
    const updatePhoneViewport = () => {
      setIsPhoneViewport(getIsPhoneViewport());
    };

    updatePhoneViewport();

    let mediaQuery: MediaQueryList | null = null;

    try {
      mediaQuery = window.matchMedia(PHONE_VIEWPORT_QUERY);
      const handleChange = (event: MediaQueryListEvent) => {
        setIsPhoneViewport(event.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      window.addEventListener('resize', updatePhoneViewport);

      return () => {
        mediaQuery?.removeEventListener('change', handleChange);
        window.removeEventListener('resize', updatePhoneViewport);
      };
    } catch {
      window.addEventListener('resize', updatePhoneViewport);

      return () => {
        window.removeEventListener('resize', updatePhoneViewport);
      };
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    loadBookingsData()
      .then((loadedBookings) => {
        if (!isActive) {
          return;
        }

        setBookings(loadedBookings);
        setBookingsStatus('ready');
        setBookingsError(null);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setBookings([]);
        setBookingsStatus('error');
        setBookingsError(error instanceof Error ? error.message : 'Nie udało się załadować danych Booking.');
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    writeDashboardPreferences({
      favorites: favoriteBookingsByDestination,
      flightFavorites: favoriteFlightsByDestination,
      dynamicBackgroundShader: null,
      lengths: lengthByDestination,
      lightweightMobileVisuals,
      mobilePerformanceNoticeDismissed,
      selectedBookings: selectedBookingByDestination,
      selectedFlights: selectedFlightByDestination,
      variants: variantByDestination,
    });
  }, [
    favoriteBookingsByDestination,
    favoriteFlightsByDestination,
    lengthByDestination,
    lightweightMobileVisuals,
    mobilePerformanceNoticeDismissed,
    selectedBookingByDestination,
    selectedFlightByDestination,
    variantByDestination,
  ]);

  useEffect(() => {
    if (!previousView) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPreviousView((currentPreviousView) => (currentPreviousView === previousView ? null : currentPreviousView));
    }, CANVAS_VIEW_RETENTION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [previousView]);

  const jumpToView = (view: ViewId) => {
    if (view !== activeView) {
      setPreviousView(activeView);
    }

    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={appShellClasses}>
      <ShaderBackground activeView={activeView} enabled />
      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark">UH</span>
          <div>
            <p className="eyebrow">Wrzesień 2026 · KRK · 2 osoby</p>
            <h1>Ultimate Holiday Canvas</h1>
          </div>
        </div>
        <div className="topbar-actions">
          <nav className="tabbar" aria-label="Holiday dashboard views">
            {DESTINATION_TABS.map((tab) => (
              <button
                key={tab.id}
                className={activeView === tab.id ? 'tab active' : 'tab'}
                type="button"
                onClick={() => jumpToView(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <FxToggle
            lightweightVisualsEnabled={effectiveLightweightVisuals}
            onChange={(enabled) => setLightweightMobileVisuals(enabled)}
          />
        </div>
      </header>

      {showMobilePerformanceToast && (
        <div className="mobile-performance-toast" role="status">
          <span>Wykryto telefon. Wyłączono rozmycie szkła i ustawiono lżejszą przezroczystość dla płynniejszego działania.</span>
          <button type="button" onClick={() => setMobilePerformanceNoticeDismissed(true)}>
            OK
          </button>
        </div>
      )}

      <main className="canvas-viewport" ref={viewportRef}>
        {bookingsStatus !== 'ready' && (
          <div className={`booking-data-banner booking-data-banner--${bookingsStatus}`} role={bookingsStatus === 'error' ? 'alert' : 'status'}>
            <strong>{bookingsStatus === 'loading' ? 'Ładowanie hoteli Booking.com' : 'Błąd danych Booking.com'}</strong>
            <span>{bookingsStatus === 'loading' ? 'Czytam ./data/bookings/bookings.json.gz.' : bookingsError}</span>
          </div>
        )}
        <div className="canvas-stack" style={canvasStackStyle}>
          <section
            id="view-summary"
            className="canvas-section summary-section"
            aria-labelledby={renderSummaryContent ? 'summary-title' : undefined}
            aria-hidden={renderSummaryContent ? undefined : true}
          >
            {renderSummaryContent && (
              <>
                <CanvasTitle
                  id="summary-title"
                  title="Summary"
                  subtitle="Scalony widok decyzji: raportowa kompletność ultimate-desktop plus interaktywne widgety z Gemini v2."
                />
                <div className="canvas-plane summary-plane">
                  {TILES_BY_VIEW.summary.map((tile) => (
                    <SummaryTile key={tile.id} tile={tile} weights={weights} setWeights={setWeights} matches={matches} />
                  ))}
                </div>
              </>
            )}
          </section>

          {DESTINATION_TABS.filter((tab) => tab.destination).map((tab) => {
            const destination = tab.destination as DestinationKey;
            const profile = DESTINATION_PROFILES[destination];
            const renderViewContent = shouldRenderViewContent(activeView, previousView, tab.id);

            if (!renderViewContent) {
              return (
                <section
                  id={`view-${tab.id}`}
                  key={tab.id}
                  className="canvas-section"
                  style={{ '--accent': profile.accent } as React.CSSProperties}
                  aria-hidden="true"
                />
              );
            }

            const controls = getDestinationControls(destination);
            const selectedLength = lengthByDestination[destination];
            const selectedVariant = variantByDestination[destination];
            const favoriteIds = favoriteBookingsByDestination[destination] ?? [];
            const favoriteFlightIds = favoriteFlightsByDestination[destination] ?? [];
            const favoriteBookings = getFavoriteBookingsForDestination(bookings, destination, favoriteBookingsByDestination);
            const favoriteFlights = getFavoriteFlightsForDestination(FLIGHT_OPTIONS, destination, favoriteFlightsByDestination);
            const selectedBookingKey = selectedBookingByDestination[destination];
            const selectedFlightKey = selectedFlightByDestination[destination];
            const selectedBooking = favoriteBookings.find((booking) => getBookingFavoriteKey(booking) === selectedBookingKey) ?? null;
            const selectedFlight = favoriteFlights.find((flight) => getFlightFavoriteKey(flight) === selectedFlightKey) ?? null;
            const selectedTripTotal = calculateTripTotal(selectedBooking, selectedLength, selectedFlight);
            const favoriteTripTotalRange = calculateTripTotalRange(favoriteBookings, selectedLength, favoriteFlights);
            return (
              <section
                id={`view-${tab.id}`}
                key={tab.id}
                className="canvas-section"
                style={{ '--accent': profile.accent } as React.CSSProperties}
                aria-labelledby={`${tab.id}-title`}
              >
                <DestinationTitle
                  id={`${tab.id}-title`}
                  profile={profile}
                  favoriteBookings={favoriteBookings}
                  favoriteFlights={favoriteFlights}
                  selectedBookingKey={selectedBookingKey}
                  selectedFlightKey={selectedFlightKey}
                  selectedStayDays={selectedLength}
                  selectedTripTotalText={selectedTripTotal ? formatTripTotal(selectedTripTotal) : null}
                  favoriteTripTotalRangeText={formatTripTotalRange(favoriteTripTotalRange)}
                  onRemoveFavorite={(booking) =>
                    {
                      const favoriteKey = getBookingFavoriteKey(booking);
                      setFavoriteBookingsByDestination((current) => toggleFavoriteBooking(current, destination, booking));
                      setSelectedBookingByDestination((current) =>
                        current[destination] === favoriteKey ? clearDestinationValue(current, destination) : current,
                      );
                    }
                  }
                  onSelectFavorite={(booking) =>
                    setSelectedBookingByDestination((current) => ({ ...current, [destination]: getBookingFavoriteKey(booking) }))
                  }
                  onRemoveFlightFavorite={(flight) =>
                    {
                      const favoriteKey = getFlightFavoriteKey(flight);
                      setFavoriteFlightsByDestination((current) => toggleFavoriteFlight(current, destination, flight));
                      setSelectedFlightByDestination((current) =>
                        current[destination] === favoriteKey ? clearDestinationValue(current, destination) : current,
                      );
                    }
                  }
                  onSelectFlightFavorite={(flight) =>
                    setSelectedFlightByDestination((current) => ({ ...current, [destination]: getFlightFavoriteKey(flight) }))
                  }
                />
                <BookingPriceRangesTile
                  bookings={bookings}
                  destination={destination}
                  lengths={controls.lengths}
                  variants={controls.variants}
                  selectedLength={selectedLength}
                  selectedVariant={selectedVariant}
                />
                <FlightOptionsTile
                  destination={destination}
                  favoriteFlightIds={favoriteFlightIds}
                  selectedLength={selectedLength}
                  onFavoriteToggle={(flight) => {
                    const favoriteKey = getFlightFavoriteKey(flight);
                    setFavoriteFlightsByDestination((current) => toggleFavoriteFlight(current, destination, flight));
                    setSelectedFlightByDestination((current) =>
                      setDestinationValue(
                        current,
                        destination,
                        resolveSelectedFavoriteAfterToggle(favoriteFlightIds, current[destination], favoriteKey),
                      ),
                    );
                  }}
                />
                <div className="canvas-plane destination-plane">
                  {TILES_BY_VIEW[tab.id].map((tile) => (
                    <DestinationTile
                      key={tile.id}
                      tile={tile}
                      profile={profile}
                      bookings={bookings}
                      selectedLength={selectedLength}
                      selectedVariant={selectedVariant}
                      favoriteIds={favoriteIds}
                      onFavoriteToggle={(booking) =>
                        {
                          const favoriteKey = getBookingFavoriteKey(booking);
                          setFavoriteBookingsByDestination((current) => toggleFavoriteBooking(current, destination, booking));
                          setSelectedBookingByDestination((current) =>
                            setDestinationValue(
                              current,
                              destination,
                              resolveSelectedFavoriteAfterToggle(favoriteIds, current[destination], favoriteKey),
                            ),
                          );
                        }
                      }
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {activeDestination && activeLength && activeVariant && (
        <DestinationControls
          compact
          destination={activeDestination}
          selectedLength={activeLength}
          selectedVariant={activeVariant}
          onLengthChange={(value) =>
            setLengthByDestination((current) => ({ ...current, [activeDestination]: value }))
          }
          onVariantChange={(value) =>
            setVariantByDestination((current) => ({ ...current, [activeDestination]: value }))
          }
        />
      )}
    </div>
  );
}

function FxToggle({
  lightweightVisualsEnabled,
  onChange
}: {
  lightweightVisualsEnabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  const nextModeLabel = lightweightVisualsEnabled ? 'pełne szkło' : 'lekkie wizuale';

  return (
    <button
      className={lightweightVisualsEnabled ? 'fx-toggle fx-toggle--light' : 'fx-toggle fx-toggle--heavy'}
      type="button"
      aria-label={`FX ${lightweightVisualsEnabled ? 'L' : 'H'}; przełącz na ${nextModeLabel}`}
      aria-pressed={!lightweightVisualsEnabled}
      onClick={() => onChange(!lightweightVisualsEnabled)}
    >
      <span className="fx-toggle-label">FX</span>
      <span className="fx-toggle-track" aria-hidden="true">
        <span className="fx-toggle-thumb" />
        <span className={lightweightVisualsEnabled ? 'fx-toggle-option fx-toggle-option--active' : 'fx-toggle-option'}>L</span>
        <span className={lightweightVisualsEnabled ? 'fx-toggle-option' : 'fx-toggle-option fx-toggle-option--active'}>H</span>
      </span>
    </button>
  );
}

function CanvasTitle({ id, title, subtitle }: { id: string; title: string; subtitle: string }) {
  return (
    <div className="canvas-title">
      <h2 id={id}>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function DestinationTitle({
  id,
  profile,
  favoriteBookings,
  favoriteFlights,
  selectedBookingKey,
  selectedFlightKey,
  selectedStayDays,
  selectedTripTotalText,
  favoriteTripTotalRangeText,
  onRemoveFavorite,
  onSelectFavorite,
  onRemoveFlightFavorite,
  onSelectFlightFavorite
}: {
  id: string;
  profile: (typeof DESTINATION_PROFILES)[DestinationKey];
  favoriteBookings: readonly BookingJson[];
  favoriteFlights: readonly FlightOption[];
  selectedBookingKey?: string;
  selectedFlightKey?: string;
  selectedStayDays: number | string;
  selectedTripTotalText: string | null;
  favoriteTripTotalRangeText: string | null;
  onRemoveFavorite: (booking: BookingJson) => void;
  onSelectFavorite: (booking: BookingJson) => void;
  onRemoveFlightFavorite: (flight: FlightOption) => void;
  onSelectFlightFavorite: (flight: FlightOption) => void;
}) {
  return (
    <div className="canvas-title canvas-title-destination">
      <div className="destination-title-row">
        <div>
          <div className="destination-heading-main">
            <h2 id={id}>{profile.displayName}</h2>
            <BookingFavoritesMenu
              destination={profile.key}
              favoriteBookings={favoriteBookings}
              selectedBookingKey={selectedBookingKey}
              selectedStayDays={selectedStayDays}
              onRemoveFavorite={onRemoveFavorite}
              onSelectFavorite={onSelectFavorite}
            />
            <FlightFavoritesMenu
              destination={profile.key}
              favoriteFlights={favoriteFlights}
              selectedFlightKey={selectedFlightKey}
              onRemoveFavorite={onRemoveFlightFavorite}
              onSelectFavorite={onSelectFlightFavorite}
            />
            {selectedTripTotalText ? (
              <span className="selected-trip-total" aria-label={`${profile.displayName} suma wybranego hotelu i lotu`}>
                Suma: <strong>{selectedTripTotalText}</strong>
              </span>
            ) : null}
            {favoriteTripTotalRangeText ? (
              <span className="selected-trip-total selected-trip-total--range" aria-label={`${profile.displayName} zakres sum ulubionych hoteli i lotów`}>
                <strong>{favoriteTripTotalRangeText}</strong>
              </span>
            ) : null}
          </div>
          <p>{profile.region}</p>
        </div>
        <div className="destination-costs" aria-label={`${profile.displayName} koszty lokalne`}>
          <span>Jedzenie / zycie: {profile.localCosts.foodMultiplier}</span>
          <span>Bufor: {profile.localCosts.buffer}</span>
          <span>Auto: {profile.localCosts.carComparison}</span>
        </div>
      </div>
      <div className="destination-signals">
        <div className="signal-line">
          <div className="pill-cloud positive">
            {profile.pluses.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div className="signal-line">
          <div className="pill-cloud risk">
            {profile.risks.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryTile({
  tile,
  weights,
  setWeights,
  matches
}: {
  tile: TileLayout;
  weights: ScoreSet;
  setWeights: (weights: ScoreSet) => void;
  matches: ReturnType<typeof calculateMatches>;
}) {
  return (
    <Tile tile={tile}>
      {tile.kind === 'hero' && <HeroSummary />}
      {tile.kind === 'ranking' && <RankingTable />}
      {tile.kind === 'matchmaker' && <Matchmaker weights={weights} setWeights={setWeights} matches={matches} />}
      {tile.kind === 'strategic' && <StrategicTable />}
      {tile.kind === 'budget' && <BudgetAssumptions />}
      {tile.kind === 'checklist' && <Checklist />}
      {tile.kind === 'conflicts' && <ConflictTile />}
    </Tile>
  );
}

function DestinationTile({
  tile,
  profile,
  selectedLength,
  selectedVariant,
  bookings,
  favoriteIds,
  onFavoriteToggle
}: {
  tile: TileLayout;
  profile: (typeof DESTINATION_PROFILES)[DestinationKey];
  selectedLength: string;
  selectedVariant: string;
  bookings: readonly BookingJson[];
  favoriteIds: readonly string[];
  onFavoriteToggle: (booking: BookingJson) => void;
}) {
  return (
    <Tile tile={tile}>
      {tile.id.endsWith('-head') && <DestinationHead profile={profile} />}
      {tile.id.endsWith('-base') && <DetailList items={profile.base} />}
      {tile.id.endsWith('-transfer') && <DetailList items={profile.transfer} />}
      {tile.id.endsWith('-car') && <DetailList items={profile.car} />}
      {tile.id.endsWith('-weather') && <DetailList items={profile.weather} />}
      {tile.id.endsWith('-water') && <DetailList items={profile.water} />}
      {tile.id.endsWith('-turtles') && <DetailList items={profile.turtles} />}
      {tile.id.endsWith('-nature') && <DetailList items={profile.nature} />}
      {tile.id.endsWith('-culture') && <DetailList items={profile.culture} />}
      {tile.kind === 'hotel-reserve' && (
        <BookingGrid
          bookings={bookings}
          destination={profile.key}
          selectedLength={selectedLength}
          selectedVariant={selectedVariant}
          favoriteIds={favoriteIds}
          onFavoriteToggle={onFavoriteToggle}
        />
      )}
    </Tile>
  );
}

function Tile({ tile, children }: { tile: TileLayout; children: React.ReactNode }) {
  const tileClasses = [
    'tile',
    `tile-${tile.kind}`,
    tile.id.endsWith('-head') || tile.kind === 'hotel-reserve' ? 'tile--full' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={tileClasses}
      style={
        {
          '--col': tile.col,
          '--row': tile.row,
          '--col-span': tile.colSpan,
          '--row-span': tile.rowSpan
        } as React.CSSProperties
      }
    >
      <div className="tile-header">
        <span>{tile.title}</span>
      </div>
      {children}
    </article>
  );
}

function HeroSummary() {
  return (
    <div className="hero-summary">
      <h3>Wakacyjna mapa decyzji na jednym płótnie</h3>
      <p>
        Albania wygrywa budżetem. Zakynthos wygrywa żółwiami. Cypr daje najlepszy balans pogody,
        wody i kultury. Turcja i Kreta rozszerzają wybór o mocny snorkeling, klify, laguny i
        bardziej krajobrazowy wariant wyjazdu.
      </p>
      <div className="decision-strip">
        <span>5 destynacji</span>
        <span>3 długości pobytu</span>
        <span>17 wariantów CSV</span>
        <span>170 hoteli · 510 pobytów</span>
      </div>
    </div>
  );
}

function RankingTable() {
  return (
    <div className="soft-table">
      {GLOBAL_RANKING.map(([priority, winner, reason]) => (
        <div className="table-row" key={priority}>
          <b>{priority}</b>
          <strong>{winner}</strong>
          <p>{reason}</p>
        </div>
      ))}
    </div>
  );
}

function Matchmaker({
  weights,
  setWeights,
  matches
}: {
  weights: ScoreSet;
  setWeights: (weights: ScoreSet) => void;
  matches: ReturnType<typeof calculateMatches>;
}) {
  return (
    <div className="matchmaker">
      <div className="sliders">
        {(Object.keys(SUMMARY_WEIGHTS) as Array<keyof ScoreSet>).map((key) => (
          <label key={key}>
            <span>
              {SUMMARY_WEIGHTS[key]} <b>{weights[key]}</b>
            </span>
            <input
              type="range"
              min="1"
              max="5"
              value={weights[key]}
              onChange={(event) => setWeights({ ...weights, [key]: Number(event.target.value) })}
            />
          </label>
        ))}
      </div>
      <div className="match-results">
        {matches.map((match) => (
          <div className="match-card" key={match.destination} style={{ '--accent': match.accent } as React.CSSProperties}>
            <span>{match.label}</span>
            <b>{match.score}%</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function StrategicTable() {
  return (
    <div className="strategic-grid">
      {Object.values(DESTINATION_PROFILES).map((profile) => (
        <div className="strategic-card" key={profile.key} style={{ '--accent': profile.accent } as React.CSSProperties}>
          <b>{profile.displayName}</b>
          <span>{profile.region}</span>
          <div className="score-grid">
            <Score label="Żółwie" value={profile.scores.turtles} />
            <Score label="Snorkel" value={profile.scores.snorkeling} />
            <Score label="Logistyka" value={profile.scores.logistics} />
            <Score label="Ekonomia" value={profile.scores.economy} />
            <Score label="Zwiedzanie" value={profile.scores.sightseeing} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span>{label}</span>
      <b>{value}/10</b>
    </div>
  );
}

function BudgetAssumptions() {
  return (
    <div className="budget-list">
      {Object.values(DESTINATION_PROFILES).map((profile) => (
        <div key={profile.key}>
          <b>{profile.displayName}</b>
          <span>jedzenie {profile.localCosts.foodMultiplier}</span>
          <span>bufor {profile.localCosts.buffer}</span>
          <span>auto {profile.localCosts.carComparison}</span>
        </div>
      ))}
    </div>
  );
}

function Checklist() {
  return (
    <ul className="checklist">
      {CHECKLIST.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function ConflictTile() {
  return (
    <div className="conflicts">
      <div>
        <h3>Alternatywy odrzucone</h3>
        {REJECTED_ALTERNATIVES.map(([name, reason]) => (
          <p key={name}>
            <b>{name}:</b> {reason}
          </p>
        ))}
      </div>
      <div>
        <h3>Rozbieżności zachowane</h3>
        <p>Stawki auta różnią się między dashboardami, więc pokazujemy oba kalkulatory zamiast ukrywać konflikt.</p>
        <p>Hotele reagują na długość pobytu i wariant z dolnego toolbara; loty pozostają osobnym etapem danych.</p>
      </div>
    </div>
  );
}

function DestinationHead({ profile }: { profile: (typeof DESTINATION_PROFILES)[DestinationKey] }) {
  return (
    <div className="destination-head">
      <p className="region">{profile.region}</p>
      <h3>{profile.oneLine}</h3>
      <p>{profile.term}</p>
      <div className="pill-cloud">
        {profile.bestFor.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function DestinationControls({
  destination,
  selectedLength,
  selectedVariant,
  onLengthChange,
  onVariantChange,
  compact = false
}: {
  destination: DestinationKey;
  selectedLength: string;
  selectedVariant: string;
  onLengthChange: (value: string) => void;
  onVariantChange: (value: string) => void;
  compact?: boolean;
}) {
  const controls = getDestinationControls(destination);
  const visibleRows = controls.rowsPerLengthVariant;
  const classes = compact ? 'controls-card controls-card--compact' : 'controls-card';

  return (
    <div className={classes}>
      <div className="segmented" aria-label={`${destination} stay length`}>
        {controls.lengths.map((length) => (
          <button
            key={length}
            className={selectedLength === length ? 'selected' : ''}
            type="button"
            title={`${length} dni`}
            aria-label={`${length} dni`}
            onClick={() => onLengthChange(length)}
          >
            <span className="control-pill-label">{compact ? getCompactLengthLabel(length) : `${length} dni`}</span>
          </button>
        ))}
      </div>
      <div className="variant-pills" aria-label={`${destination} variants`}>
        {controls.variants.map((variant) => {
          const selected = selectedVariant === variant;
          return (
            <button
              key={variant}
              className={selected ? 'selected' : ''}
              type="button"
              title={variant}
              aria-label={variant}
              onClick={() => onVariantChange(variant)}
            >
              <span className="control-pill-label">{compact ? getCompactVariantLabel(variant, selected) : variant}</span>
            </button>
          );
        })}
      </div>
      {!compact && (
        <p>
          CSV scope: {controls.totalRows} rows for this destination. Current future hotel slice:{' '}
          <b>{visibleRows} rows</b> for {selectedLength} dni / {selectedVariant.slice(0, 1)}.
        </p>
      )}
    </div>
  );
}

function DetailList({ items }: { items: string[] }) {
  return (
    <ul className="detail-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
