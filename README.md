# Business Card Showcase

A Netlify-only frontend for QR-linked organization business cards.

## How it works

- Public card URLs use `/cards/<slug>`.
- The CEO sample page is `/cards/ceo`.
- Each QR code should point to the matching Netlify URL, for example `https://your-site.netlify.app/cards/ceo`.
- The card page intentionally has no website header or footer.
- Card content lives in `src/content/cards/*.json`.
- Uploaded card and background images live in `public/uploads/cards`.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Admin setup on Netlify

The admin is available at `/admin/` after deployment. It uses Decap CMS with Netlify Identity and Git Gateway, so you do not need Supabase, Render, or Cloudinary for the current requirements.

1. Push this project to a Git repository.
2. Create a Netlify site from that repository.
3. In Netlify, enable Identity.
4. In Netlify Identity settings, enable Git Gateway.
5. Invite the admin user from Netlify Identity.
6. Open `https://your-site.netlify.app/admin/` and sign in.
7. Create a new Business Card entry.
8. Upload the business card image and optionally a background image.
9. Publish the entry. Netlify will rebuild the site.
10. Create a QR code that points to `/cards/<slug>`.

## Card fields

- `slug`: URL name, for example `ceo`, `john-doe`, or `finance-director`.
- `image`: the uploaded business card image shown on the page.
- `backgroundImage`: optional custom background image.
- `backgroundColor`: fallback background color.
- `accentColor`: glow/accent color around the card.

## When Cloudinary or Render would be needed

- Cloudinary is only useful if you want advanced image transformations, CDN optimization, or a large image library outside the Git repository.
- Render is only needed if you later want a custom backend for real-time uploads, user roles beyond Netlify Identity, analytics, or database-driven cards.
- Supabase is not necessary for this static CMS workflow.
