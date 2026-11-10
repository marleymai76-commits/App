// Luxury Logo Generator Client Service for SISTENFOX
// Uses server-side Gemini API proxy (/api/generate-logo) with instant vector fallback

function createClientLuxuryLogo(businessName: string = 'SISTENFOX', niche: string = 'SaaS'): string {
  const cleanName = (businessName || 'SISTENFOX').trim();
  const initials = cleanName
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('') || 'SF';

  const nicheUpper = (niche || 'PREMIUM SAAS').toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
    <defs>
      <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#1f1807" stop-opacity="1" />
        <stop offset="60%" stop-color="#0a0a0a" stop-opacity="1" />
        <stop offset="100%" stop-color="#040404" stop-opacity="1" />
      </radialGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fdf0cd" />
        <stop offset="25%" stop-color="#d4af37" />
        <stop offset="50%" stop-color="#aa771c" />
        <stop offset="75%" stop-color="#f5d77f" />
        <stop offset="100%" stop-color="#8a5a00" />
      </linearGradient>
      <linearGradient id="goldStroke" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#d4af37" stop-opacity="0.3" />
        <stop offset="50%" stop-color="#fdf0cd" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#aa771c" stop-opacity="0.3" />
      </linearGradient>
      <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <rect width="500" height="500" rx="36" fill="url(#bgGlow)" />
    <rect x="20" y="20" width="460" height="460" rx="28" fill="none" stroke="url(#goldStroke)" stroke-width="1.5" stroke-dasharray="8 4" />
    <rect x="32" y="32" width="436" height="436" rx="22" fill="none" stroke="url(#goldGrad)" stroke-width="1" opacity="0.4" />

    <path d="M 40 60 L 40 40 L 60 40" fill="none" stroke="url(#goldGrad)" stroke-width="2.5" />
    <path d="M 460 60 L 460 40 L 440 40" fill="none" stroke="url(#goldGrad)" stroke-width="2.5" />
    <path d="M 40 440 L 40 460 L 60 460" fill="none" stroke="url(#goldGrad)" stroke-width="2.5" />
    <path d="M 460 440 L 460 460 L 440 460" fill="none" stroke="url(#goldGrad)" stroke-width="2.5" />

    <g transform="translate(250, 210)">
      <circle r="120" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.5" stroke-dasharray="4 6" />
      <circle r="105" fill="#0d0d0d" stroke="url(#goldGrad)" stroke-width="3" filter="url(#goldGlow)" />
      <polygon points="0,-85 75,0 0,85 -75,0" fill="none" stroke="url(#goldStroke)" stroke-width="2" />

      <path d="M -30 -50 L -15 -68 L 0 -55 L 15 -68 L 30 -50 Z" fill="url(#goldGrad)" />
      <circle cx="-15" cy="-72" r="3" fill="#fdf0cd" />
      <circle cx="0" cy="-60" r="3.5" fill="#fdf0cd" />
      <circle cx="15" cy="-72" r="3" fill="#fdf0cd" />

      <text x="0" y="28" font-family="'Cinzel', 'Playfair Display', 'Times New Roman', serif" font-size="62" font-weight="bold" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="4">
        ${initials}
      </text>
      <text x="0" y="60" font-size="12" fill="#d4af37" text-anchor="middle" letter-spacing="6">★ ★ ★</text>
    </g>

    <text x="250" y="380" font-family="'Cinzel', 'Playfair Display', 'Times New Roman', serif" font-size="24" font-weight="bold" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="6">
      ${cleanName.toUpperCase()}
    </text>

    <line x1="140" y1="400" x2="220" y2="400" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.7" />
    <polygon points="250,396 254,400 250,404 246,400" fill="#fdf0cd" />
    <line x1="280" y1="400" x2="360" y2="400" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.7" />

    <text x="250" y="426" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#a88d44" text-anchor="middle" letter-spacing="8">
      ${nicheUpper} • EXCLUSIVE
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export async function generateSistenfoxLogo(businessName: string = 'SISTENFOX', niche: string = 'SaaS'): Promise<string | null> {
  try {
    const response = await fetch('/api/generate-logo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ businessName, niche }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.logoUrl) {
        return data.logoUrl;
      }
    }
    
    // Fallback if server returned non-ok or empty logo
    return createClientLuxuryLogo(businessName, niche);
  } catch (error) {
    console.warn('[Logo Generator] Servidor indisponível, utilizando gerador vetorial de luxo:', error);
    return createClientLuxuryLogo(businessName, niche);
  }
}
