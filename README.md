# Catholic Games

Five small, respectful Catholic 2D mobile web mini-games, plus a home-screen launch pad. Each game is a single self-contained HTML file (inline CSS/JS, canvas shapes only — no external assets).

## Games

| Folder | Game |
|--------|------|
| `candle-runner/` | Carry a lit candle down the aisle |
| `procession-dash/` | Steer a Corpus Christi procession |
| `st-michael-defence/` | St Michael banishes shadowy wisps |
| `bell-tower-climb/` | Climb the tower and ring the bell |
| `noahs-ark-catch/` | Catch animal pairs in the rain |

The home screen (`index.html`) also links to two external games: **Altar Server** and **Parish Priest**.

## Drop onto a website

Copy this whole folder to any static host (GitHub Pages, Netlify, Apache, nginx, an app WebView, etc.):

```bash
cp -r catholic-mini-games /var/www/html/games
```

Open `index.html` (or the folder URL). All links between the home screen and the five mini-games are **relative**, so no path rewriting is needed. Best scores use `localStorage` in the browser.

## Embed in an app

Point a WebView at `index.html`, or load any game folder’s `index.html` directly. Portrait 360×780 canvas; touch + keyboard. Optional: serve `manifest.webmanifest` so phones can “Add to Home Screen”.

## Local preview

```bash
cd catholic-mini-games
python3 -m http.server 8080
# open http://localhost:8080/
```

## Notes

- Mute preference is shared via `localStorage` key `cmgMute`.
- Tone: reverent; demons are shadowy wisps banished by God’s light; no gore or mockery.
