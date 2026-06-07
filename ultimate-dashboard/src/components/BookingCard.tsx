import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  BookingJson,
  StayJson,
  formatStayPrice,
  getStayForDays,
  renderRoomCellLines,
} from '../data/bookings';

export type BookingCardProps = {
  booking: BookingJson;
  selectedStayDays: number | string;
  isFavorite?: boolean;
  onFavoriteToggle?: (booking: BookingJson) => void;
};

export type BookingReportPortalProps = {
  booking: BookingJson;
  selectedStayDays: number | string;
  onClose: () => void;
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80';

const ROOM_TABLE_HEADERS = ['Typ pokoju i opcje', 'Goście', 'Cena', 'Warunki'];

export function BookingCard({ booking, selectedStayDays, isFavorite = false, onFavoriteToggle }: BookingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const selectedStay = getStayForDays(booking, selectedStayDays) ?? booking.stays[0] ?? null;
  const images = useMemo(() => getPropertyImages(booking), [booking]);
  const price = formatStayPrice(selectedStay);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <article className={`booking-card ${isExpanded ? 'booking-card--expanded' : ''}`}>
      {onFavoriteToggle ? (
        <button
          className={
            isFavorite
              ? 'booking-favorite-toggle booking-favorite-toggle--card-corner booking-favorite-toggle--active'
              : 'booking-favorite-toggle booking-favorite-toggle--card-corner'
          }
          type="button"
          aria-label={isFavorite ? `Usuń ${booking.name} z ulubionych` : `Dodaj ${booking.name} do ulubionych`}
          aria-pressed={isFavorite}
          title={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
          onClick={() => onFavoriteToggle(booking)}
        >
          <HomeIcon />
        </button>
      ) : null}
      <div className="booking-card-primary">
        <div className="booking-thumb">
          {images[0] ? (
            <img
              className="booking-thumb-image"
              src={images[0]}
              alt={booking.name}
              loading="lazy"
              decoding="async"
              width={148}
              height={148}
              fetchPriority="low"
              onError={(event) => {
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          ) : (
            <div className="booking-thumb-empty">Brak zdjęcia</div>
          )}
          <span className="booking-evaluation" title="Ocena dopasowania">
            {booking.evaluation.toFixed(1)}
          </span>
        </div>

        <div className="booking-summary">
          <div className="booking-summary-top">
            <span className="booking-destination">{booking.destination}</span>
          </div>

          <div className="booking-title-row">
            <h3 className="booking-title" title={booking.name}>
              {booking.name}
            </h3>
            <RatingPill booking={booking} />
          </div>

          <div className="booking-specs" aria-label={`${booking.name} szybkie parametry`}>
            <SpecPill icon={<CompassIcon />} text={booking.beachInfo || 'Brak danych o plaży'} />
            <SpecPill
              icon={<WasherIcon />}
              text={getLaundryStatusText(booking)}
              tone={booking.washingMachineConfirmed ? 'positive' : booking.laundryService ? 'warning' : 'muted'}
            />
            <SpecPill
              icon={<BathIcon />}
              text={booking.privateBathroom ? 'Prywatna łazienka' : 'Wspólna łazienka'}
              tone={booking.privateBathroom ? 'positive' : 'muted'}
            />
          </div>

          <div className="booking-card-footer">
            <div className="booking-price">
              <span>{selectedStay ? `${selectedStay.days} dni pobytu` : `${selectedStayDays} dni pobytu`}</span>
              <strong>{price}</strong>
            </div>
            <div className="booking-actions">
              <button className="booking-report-button" type="button" onClick={() => setIsModalOpen(true)}>
                Pełny raport
              </button>
              <button
                className={`booking-icon-button ${isExpanded ? 'booking-icon-button--expanded' : ''}`}
                type="button"
                aria-label={isExpanded ? 'Zwiń szczegóły hotelu' : 'Rozwiń szczegóły hotelu'}
                aria-expanded={isExpanded}
                onClick={() => setIsExpanded((current) => !current)}
              >
                <ChevronDownIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isExpanded ? <BookingCardExpanded booking={booking} selectedStay={selectedStay} /> : null}

      {isModalOpen ? <BookingReportPortal booking={booking} selectedStayDays={selectedStayDays} onClose={closeModal} /> : null}
    </article>
  );
}

export function BookingReportPortal({ booking, selectedStayDays, onClose }: BookingReportPortalProps) {
  const selectedStay = getStayForDays(booking, selectedStayDays) ?? booking.stays[0] ?? null;
  const images = useMemo(() => getPropertyImages(booking), [booking]);

  if (!selectedStay) {
    return null;
  }

  return createPortal(
    <BookingReportModal booking={booking} images={images} selectedStay={selectedStay} onClose={onClose} />,
    document.body,
  );
}

function BookingCardExpanded({ booking, selectedStay }: { booking: BookingJson; selectedStay: StayJson | null }) {
  const enrichments = getVisibleEnrichments(booking);

  return (
    <div className="booking-expanded">
      <div className="booking-expanded-grid">
        <div>
          <span className="booking-kicker">Standard / tier</span>
          <p>{booking.tier}</p>
        </div>
        <div>
          <span className="booking-kicker">Wybrane daty</span>
          <p>{selectedStay ? `${selectedStay.checkIn} do ${selectedStay.checkOut}` : 'Brak terminu w danych'}</p>
        </div>
      </div>

      <div className="booking-feature-cloud" aria-label={`${booking.name} cechy`}>
        <FeaturePill label="Kuchnia" active={booking.kitchen} />
        <FeaturePill label="Parking" active={booking.parking} />
        <FeaturePill label="Widok na morze" active={booking.seaView} />
        <FeaturePill label="Przy plaży" active={booking.beachView} />
      </div>

      {enrichments.length > 0 ? (
        <div className="booking-ai-summary">
          {enrichments.slice(0, 3).map(([title, content]) => (
            <div className="booking-ai-block" key={title}>
              <strong>{translateEnrichmentTitle(title)}</strong>
              <p>{content}</p>
            </div>
          ))}
        </div>
      ) : null}

      {booking.details.authorSummaryBullets.length > 0 ? (
        <div className="booking-bullets">
          <strong>Najważniejsze wnioski</strong>
          <ul>
            {booking.details.authorSummaryBullets.slice(0, 4).map((bullet, index) => (
              <li key={`${booking.url}-bullet-${index}`}>
                {renderRoomCellLines(bullet).map((line, lineIndex) => (
                  <span key={`${line}-${lineIndex}`}>{line}</span>
                ))}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function BookingReportModal({
  booking,
  images,
  selectedStay,
  onClose,
}: {
  booking: BookingJson;
  images: readonly string[];
  selectedStay: StayJson;
  onClose: () => void;
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const modalRef = useRef<HTMLElement | null>(null);
  const price = formatStayPrice(selectedStay);
  const enrichments = getVisibleEnrichments(booking);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    modalRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [booking.url]);

  const activeImage = images[activeImageIndex] ?? images[0];

  return (
    <div
      className="booking-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="booking-modal"
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`booking-report-${slugify(booking.name)}`}
      >
        <header className="booking-modal-header">
          <div className="booking-modal-tags">
            <span>{booking.destination}</span>
            <span>{booking.tier}</span>
          </div>
          <button className="booking-modal-close" type="button" aria-label="Zamknij raport" onClick={onClose}>
            <CloseIcon />
          </button>
        </header>

        <div className="booking-modal-body">
          <section className="booking-modal-title">
            <h2 id={`booking-report-${slugify(booking.name)}`}>{booking.name}</h2>
            <div className="booking-modal-meta">
              <RatingPill booking={booking} />
              <span>Ocena dopasowania: {booking.evaluation.toFixed(1)}/10</span>
              {booking.details.address ? (
                <span>
                  <MapPinIcon /> {booking.details.address}
                </span>
              ) : null}
            </div>
          </section>

          {activeImage ? (
            <section className="booking-gallery" aria-label={`${booking.name} galeria`}>
              <div className="booking-gallery-main">
                <img src={activeImage} alt={`${booking.name} zdjęcie ${activeImageIndex + 1}`} />
              </div>
              <div className="booking-gallery-strip">
                {images.slice(0, 8).map((image, index) => (
                  <button
                    key={image}
                    className={activeImageIndex === index ? 'booking-gallery-thumb booking-gallery-thumb--active' : 'booking-gallery-thumb'}
                    type="button"
                    aria-label={`Pokaż zdjęcie ${index + 1}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img src={image} alt="" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className="booking-modal-matrix">
            <div className="booking-modal-box booking-modal-box--accent">
              <h3>Wybrany pobyt</h3>
              <span className="booking-kicker">{selectedStay.days} dni</span>
              <p className="booking-modal-dates">
                <CalendarIcon /> {selectedStay.checkIn} do {selectedStay.checkOut}
              </p>
              <strong className="booking-modal-price">{price}</strong>
              <div className="booking-stays-list">
                <span>Wszystkie długości</span>
                {booking.stays.map((stay) => (
                  <div className={stay.days === selectedStay.days ? 'booking-stay-row booking-stay-row--selected' : 'booking-stay-row'} key={stay.days}>
                    <span>{stay.days} dni</span>
                    <strong>{formatStayPrice(stay)}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="booking-modal-box">
              <h3>Parametry</h3>
              <dl className="booking-definition-list">
                <div>
                  <dt>Plaża</dt>
                  <dd>{booking.beachInfo || 'Brak danych'}</dd>
                </div>
                <div>
                  <dt>Kuchnia</dt>
                  <dd>{booking.kitchen ? 'Dostępna' : 'Brak lub brak danych'}</dd>
                </div>
                <div>
                  <dt>Łazienka</dt>
                  <dd>{booking.privateBathroom ? 'Prywatna' : 'Wspólna'}</dd>
                </div>
                <div>
                  <dt>Parking</dt>
                  <dd>{booking.parking ? 'Potwierdzony' : 'Brak dedykowanego parkingu'}</dd>
                </div>
              </dl>
            </div>

            <div className="booking-modal-box">
              <h3>Pranie</h3>
              <div className={`booking-laundry-report ${booking.washingMachineConfirmed ? 'booking-laundry-report--success' : 'booking-laundry-report--warn'}`}>
                <WasherIcon />
                <div>
                  <strong>{getLaundryStatusText(booking)}</strong>
                  <span>{booking.laundry}</span>
                </div>
              </div>
              {booking.details.amenities.laundry.evidence[0] ? (
                <p className="booking-laundry-evidence">{booking.details.amenities.laundry.evidence[0]}</p>
              ) : null}
            </div>
          </section>

          {enrichments.length > 0 ? (
            <section className="booking-enrichments">
              <h3>Szczegółowa ocena</h3>
              <div className="booking-enrichments-grid">
                {enrichments.map(([title, content]) => (
                  <article className="booking-enrichment-card" key={title}>
                    <h4>{title}</h4>
                    <p>{content}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {booking.details.roomTable.rows.length > 0 ? (
            <section className="booking-room-section">
              <h3>Pokoje i opcje</h3>
              <div className="booking-room-table-wrap">
                <table className="booking-room-table">
                  <thead>
                    <tr>
                      {ROOM_TABLE_HEADERS.map((header) => (
                        <th key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {booking.details.roomTable.rows.slice(0, 6).map((row, rowIndex) => (
                      <tr key={`${booking.url}-room-${rowIndex}`}>
                        {ROOM_TABLE_HEADERS.map((header, cellIndex) => (
                          <td key={header}>
                            {renderRoomCellLines(row[cellIndex] ?? '').map((line, lineIndex) => (
                              <span key={`${line}-${lineIndex}`}>{line}</span>
                            ))}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {booking.details.comments.length > 0 ? (
            <section className="booking-comments">
              <h3>Opinie gości</h3>
              <div className="booking-comments-grid">
                {booking.details.comments.slice(0, 4).map((comment, index) => (
                  <blockquote className="booking-comment" key={`${comment.author}-${index}`}>
                    <p>{comment.text}</p>
                    <cite>{comment.author || 'Anonimowy gość'}</cite>
                  </blockquote>
                ))}
              </div>
            </section>
          ) : null}

          {booking.details.policy.houseRulesRaw || booking.details.policy.importantInfoRaw ? (
            <section className="booking-policy">
              <h3>Regulamin</h3>
              <div className="booking-policy-grid">
                {booking.details.policy.houseRulesRaw ? (
                  <div>
                    <h4>Zasady pobytu</h4>
                    <pre>{booking.details.policy.houseRulesRaw}</pre>
                  </div>
                ) : null}
                {booking.details.policy.importantInfoRaw &&
                booking.details.policy.importantInfoRaw !== 'Brak sekcji Ważne Informacje.' ? (
                  <div>
                    <h4>Ważne informacje</h4>
                    <pre>{booking.details.policy.importantInfoRaw}</pre>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>

        <footer className="booking-modal-footer">
          <button className="booking-modal-secondary" type="button" onClick={onClose}>
            Zamknij raport
          </button>
          <a className="booking-modal-link" href={booking.url} target="_blank" rel="noreferrer">
            Zobacz na Booking.com <ExternalLinkIcon />
          </a>
        </footer>
      </section>
    </div>
  );
}

function RatingPill({ booking }: { booking: BookingJson }) {
  if (booking.rating === null) {
    return <span className="booking-rating booking-rating--muted">Brak oceny</span>;
  }

  return (
    <span className="booking-rating">
      <StarIcon />
      <strong>{booking.rating.toFixed(1)}</strong>
      <span>({booking.reviews})</span>
    </span>
  );
}

function SpecPill({
  icon,
  text,
  tone = 'neutral',
}: {
  icon: React.ReactNode;
  text: string;
  tone?: 'neutral' | 'positive' | 'warning' | 'muted';
}) {
  return (
    <span className={`booking-spec booking-spec--${tone}`} title={text}>
      {icon}
      <span>{text}</span>
    </span>
  );
}

function FeaturePill({ label, active }: { label: string; active: boolean }) {
  return (
    <span className={active ? 'booking-feature booking-feature--yes' : 'booking-feature booking-feature--no'}>
      {active ? <CheckIcon /> : <XIcon />}
      {label}
    </span>
  );
}

function getPropertyImages(booking: BookingJson): readonly string[] {
  return booking.details.imageUrls.filter(
    (url) =>
      !url.includes('/review/avatars/') &&
      !url.includes('images-flags') &&
      !url.includes('googleusercontent.com'),
  );
}

function getVisibleEnrichments(booking: BookingJson): readonly [string, string][] {
  return Object.entries(booking.details.enrichments).filter(([, content]) => content.trim() !== '');
}

function getLaundryStatusText(booking: BookingJson): string {
  if (booking.washingMachineConfirmed) {
    return 'Pralka w pokoju';
  }

  if (booking.washingMachineOnlyInReviews) {
    return 'Pralka w opiniach';
  }

  if (booking.laundryService) {
    return 'Usługa prania';
  }

  return 'Brak pralki';
}

function translateEnrichmentTitle(title: string): string {
  if (title === 'Overall Impression') {
    return 'Wrażenie';
  }

  if (title === 'Location & Beach') {
    return 'Plaża i okolica';
  }

  if (title === 'Best For') {
    return 'Najlepszy dla';
  }

  return title;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function StarIcon() {
  return (
    <svg className="booking-icon booking-icon--gold" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7.1-6.2-3.8L5.8 21l1.6-7.1L2 9.2l7.1-.6L12 2Z" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg className="booking-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 11 12 3l9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="booking-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function WasherIcon() {
  return (
    <svg className="booking-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M9 6h.01M15 6h.01" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg className="booking-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4ZM7 12V6a3 3 0 0 1 6 0v1" />
      <path d="M5 20 4 22M19 20l1 2" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg className="booking-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg className="booking-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="booking-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="booking-icon booking-icon--green" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="booking-icon booking-icon--red" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="booking-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="booking-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 4h6v6M10 14 20 4M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
    </svg>
  );
}
