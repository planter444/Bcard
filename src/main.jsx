import React, { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertCircle, Download } from 'lucide-react';
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
  const cardRef = useRef(null);
  const label = getCardLabel(card);
  const style = {
    '--accent': card.accentColor || '#38bdf8',
    backgroundImage: buildBackground(card),
  };

  if (card.backgroundImage) {
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
  }

  const handleDownload = async () => {
    if (!card.image || !cardRef.current) return;
    
    try {
      // Load the image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = card.image;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Create canvas to capture the card with border radius
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Get the displayed dimensions
      const cardImage = cardRef.current.querySelector('.business-card-image');
      const rect = cardImage.getBoundingClientRect();
      
      // Set canvas size to match the image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Calculate scale ratio
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      // Apply border radius clipping
      const borderRadius = parseFloat(getComputedStyle(cardImage).borderRadius) * Math.max(scaleX, scaleY);
      
      // Create rounded rectangle path
      ctx.beginPath();
      const x = 0, y = 0, w = canvas.width, h = canvas.height, r = borderRadius;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.clip();
      
      // Draw the image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${label.replace(/\s+/g, '-').toLowerCase()}-business-card.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 'image/png');
      
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to simple download
      const response = await fetch(card.image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${label.replace(/\s+/g, '-').toLowerCase()}-business-card.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  return (
    <main className="card-scene" style={style}>
      <div className="ambient-grid" />
      <section className="card-shell" ref={cardRef} aria-label={`${label} business card`}>
        {card.image ? (
          <img className="business-card-image" src={card.image} alt={`${label} business card`} />
        ) : (
          <div className="missing-card-image">Upload a business card image for {label}.</div>
        )}
        {card.image && (
          <button className="download-button" onClick={handleDownload} aria-label="Download business card">
            <Download size={16} />
            <span>Download Card</span>
          </button>
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
