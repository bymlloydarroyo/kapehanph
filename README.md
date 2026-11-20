# Kapehan — Philippines Coffee Shop Locator

A responsive café finder for the Philippines. Built with plain HTML, CSS and JavaScript, plus Three.js for the 3D hero.

## Features
- 3D coffee cup hero (Three.js) with floating beans and mouse parallax
- Featured cafés, popular cities, and a searchable, filterable café list
- Star ratings with numbers, open/closed status (Philippine time), café profile popup
- "View in Google Maps" links and a "Near me" sort using the browser location
- Sign up / sign in required before submitting a café
- Dark mode (remembers your choice), mobile bottom navbar, tablet and desktop layouts

## Files
- `index.html` — page structure
- `style.css` — design tokens, layout, responsive rules, animations
- `script.js` — café data, search and filters, auth, dialogs, 3D scene

## Run it
Open `index.html` in a browser, or enable GitHub Pages on the repo (Settings → Pages).

## Notes
- Café data is sample data for demo use.
- Accounts and submitted cafés are stored in the browser's localStorage. This is a front-end demo, not a secure login. Use Firebase or Supabase for real authentication.
