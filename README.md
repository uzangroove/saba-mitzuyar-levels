# סבא מצוייר — Saba Mitzuyar

A Hebrew 2D platformer where Saba Shimon rescues Savta Rebecca from a castle!

## Features

- **4 Worlds** — Earth, Water, Sky, Space — each with unique physics feel
- **40 Levels** + 4 boss fights (10 per world)
- **Moving platforms** with player attachment, vertical drift
- **Crumbling platforms** — shake, then fall!
- **Full Hebrew RTL UI** with animated menus
- **Level Select screen** with world overview and progress tracking
- **Persistent save** via localStorage
- **Gamepad + keyboard** support
- **External GameAPI** for embedding in educational platforms

## Setup

```bash
npm install
npm run dev        # Dev server at http://localhost:3000
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
```

## Tech Stack

- **Phaser 3.88** — 2D game engine (WebGL)
- **TypeScript 5.3** — strict mode
- **Vite 8** — bundler & dev server

## External API

The game exposes a global `SabaMitzuyar` object for embedding:

```javascript
// Launch the game inside a container element
SabaMitzuyar.launch('game-container');

// Listen for game events
SabaMitzuyar.on('levelComplete', (level, coins) => { /* ... */ });
SabaMitzuyar.on('gameOver', () => { /* ... */ });
SabaMitzuyar.on('exit', () => { /* ... */ });

// Save data exchange with external app
const save = SabaMitzuyar.getSave();
SabaMitzuyar.loadSave(save);
```

## Controls

| Action | Keyboard | Gamepad |
|--------|----------|---------|
| Move | Arrow keys / A D | Left stick |
| Jump | Space / W | A button |
| Dash | Z | R1 |
| Hammer | X | X button |
| Run | Shift | L1 |

## Deployment

The game auto-deploys to GitHub Pages on every push to `main` via GitHub Actions.

After pushing:
1. Go to **Settings → Pages** in your GitHub repo
2. Set Source to **Deploy from branch** → `gh-pages`
3. Your game will be live at `https://<username>.github.io/saba-mitzuyar-levels/`

## World Physics

| World | Gravity | Max Fall | Feel |
|-------|---------|----------|------|
| Earth | 1.0× | normal | Standard platforming |
| Water | 0.28× | 220 | Floaty, buoyant |
| Sky | 0.65× | 600 | Light gravity |
| Space | 0.12× | 180 | Near-zero G, high inertia |
