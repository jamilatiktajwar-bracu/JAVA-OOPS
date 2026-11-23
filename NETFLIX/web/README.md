# Netflix UI Concept (Frontend)

A responsive, Netflix-inspired streaming UI prototype built with plain HTML, CSS, and JavaScript. It is part of the Java OOP Netflix simulation repository.

## Run locally
Open `index.html` directly in a browser. No build tools or dependencies are required.

## Features
- Cinematic hero section and responsive dark streaming layout
- Home, TV Shows, Movies, New & Popular, My List, Continue Watching, Trending, Originals, and Top Picks views
- Search titles, genres, and descriptions
- Interactive movie cards, detail modal, demo playback toast
- Add/remove My List, profile menu, mobile-responsive navigation
- Keyboard accessible card/modal interactions and reduced reliance on external libraries

## Prototype limitations
This UI is a front-end prototype using local mock content and browser-memory state. It does not connect to the Java classes or a backend yet. Play opens a demo notification, not real video. The poster imagery uses remote Unsplash images and requires an internet connection.

## Next integration steps
1. Add a Java REST API (e.g., Spring Boot) exposing catalog, user profile, watchlist, and playback endpoints.
2. Replace mock data with API calls and persist the watchlist.
3. Implement authentication, profiles, and real playback/provider integrations.
4. Keep API credentials and secrets server-side; do not put them in browser code.
