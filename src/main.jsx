import React from 'react';
import { createRoot } from 'react-dom/client';
import { AlertCircle } from 'lucide-react';
import './styles.css';

const cardModules = import.meta.glob('./content/cards/*.json', { eager: true });

const cards = Object.values(cardModules)
  .map((module) => module.default)
  .sort((a, b) => (a.order || 999) - (b.order || 999));

function getCardLabel(card) {
  return card.label || card.name || card.title || card.slug;
}

function getCardSlug() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[0] === 'cards' ? parts[1] : null;
}

function buildBackground(card) {
  const layers = [];

  if (card.backgroundImage) {
    layers.push(`linear-gradient(135deg, rgba(3, 7, 18, 0.68), rgba(15, 23, 42, 0.28))`);
    layers.push(`url(${card.backgroundImage})`);
  } else {
    layers.push(`radial-gradient(circle at 15% 20%, ${card.accentColor || '#38bdf8'}55, transparent 32%)`);
    layers.push(`radial-gradient(circle at 85% 10%, #a855f755, transparent 34%)`);
    layers.push(`radial-gradient(circle at 50% 90%, #22c55e44, transparent 35%)`);
    layers.push(`linear-gradient(135deg, ${card.backgroundColor || '#020617'}, #111827 48%, #030712)`);
  }

  return layers.join(', ');
}

function CardPage({ card }) {
  const label = getCardLabel(card);
  const style = {
    '--accent': card.accentColor || '#38bdf8',
    backgroundImage: buildBackground(card),
  };

  if (card.backgroundImage) {
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
  }

  return (
    <main className="card-scene" style={style}>
      <div className="ambient-grid" />
      <section className="card-shell" aria-label={`${label} business card`}>
        {card.image ? (
          <img className="business-card-image" src={card.image} alt={`${label} business card`} />
        ) : (
          <div className="missing-card-image">Upload a business card image for {label}.</div>
        )}
      </section>
    </main>
  );
}

function DirectoryPage() {
  return (
    <main className="directory-scene">
      <section className="directory-panel">
        <p className="eyebrow">Business Card Manager</p>
        <h1>Upload card images and publish QR pages</h1>
        <p className="directory-copy">Use the admin area to upload already-designed business card images. Each role gets a public page like `/cards/ceo` for QR codes.</p>
        <div className="action-row">
          <a className="primary-action" href="/admin/">Upload / Manage Cards</a>
          {cards[0] && <a className="secondary-action" href={`/cards/${cards[0].slug}`}>View Sample Page</a>}
        </div>
        <div className="card-list">
          {cards.map((card) => (
            <a key={card.slug} href={`/cards/${card.slug}`}>
              <span>{getCardLabel(card)}</span>
              <small>/cards/{card.slug}</small>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

function NotFoundPage({ slug }) {
  return (
    <main className="directory-scene">
      <section className="directory-panel error-panel">
        <AlertCircle size={34} />
        <h1>Card not found</h1>
        <p>No business card exists for `{slug}` yet. Create it in `/admin` and publish the site again.</p>
        <a className="admin-link" href="/admin/">Open Admin</a>
      </section>
    </main>
  );
}

function App() {
  const slug = getCardSlug();

  if (!slug) {
    return <DirectoryPage />;
  }

  const card = cards.find((item) => item.slug === slug);
  return card ? <CardPage card={card} /> : <NotFoundPage slug={slug} />;
}

createRoot(document.getElementById('root')).render(<App />);
