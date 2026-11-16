# QuantumBasel – Logo Particles

Webflow Custom Code für die QuantumBasel-Website. Aktuell: Partikel-Logo-Hero.

```
logo-particles/
  logo-particles.js      Modul (Logik, Three.js)
  quantumbasel.data.js   Partikeldaten der Logo-Form
example/index.html       lokale Testseite (über lokalen Server öffnen)
tools/generate-logo-data.py  Daten aus dem Logo-PNG neu erzeugen
```

## Logo Particles – Webflow-Setup

WebGL-Partikel-Hero (Three.js). Die Logo-Form kommt aus `quantumbasel.data.js`, das Verhalten aus `logo-particles.js`. Alles wird über Data-Attribute gesteuert, Layout und Typo bleiben in Webflow.

## 1. Dateien hosten

Die Partikeldaten sind ca. 210 KB groß und passen damit nicht in Webflows Custom-Code-Felder (Limit: 50.000 Zeichen). Beide Dateien liegen in diesem Repo und werden per jsDelivr über ein Release-Tag geladen:

```
https://cdn.jsdelivr.net/gh/doubleplaystudio/quantumbasel@v1.0.0/logo-particles/logo-particles.js
https://cdn.jsdelivr.net/gh/doubleplaystudio/quantumbasel@v1.0.0/logo-particles/quantumbasel.data.js
```

Three.js lädt das Modul selbst von jsDelivr (v0.170, gepinnt).

## 2. Struktur im Webflow-Designer

| Element | Attribut | Hinweis |
|---|---|---|
| Hero-Section | `data-logo-particles="hero"` | 100vh, Hintergrund **transparent**, dient als Drag-Fläche |
| Overlay-Wrapper | `data-logo-particles="chrome"` | `position: fixed; inset: 0; z-index: 2`, blendet beim Scrollen aus |
| Labels („Quantum“, „Basel“) | `data-logo-particles="split"` | im Overlay; optional `data-lp-delay="900"` (ms) |
| Replay-Button | `data-logo-particles="replay"` | im Overlay |
| Hinweis-Text | `data-logo-particles="hint"` | optional, erscheint nach dem Intro |

Außerdem:
- **`.main-content`** braucht `position: relative; z-index: 1`. Der Canvas liegt fixed bei `z-index: 0` direkt im Body.
- **Hintergrundfarbe** gehört auf `.global-body`, nicht auf Sections. Die Sections über dem Hero müssen transparent sein, sonst verdecken sie das Partikelfeld.
- **Echte H1:** Die Labels sind dekorativ. Eine echte H1 legt ihr in der Hero-Section als visually-hidden an.

## 3. Custom Code (Page Settings → Before `</body>`)

```html
<script src="https://cdn.jsdelivr.net/gh/doubleplaystudio/quantumbasel@v1.0.0/logo-particles/quantumbasel.data.js"></script>
<script type="module" src="https://cdn.jsdelivr.net/gh/doubleplaystudio/quantumbasel@v1.0.0/logo-particles/logo-particles.js"></script>
```

Die Data-Datei muss **vor** dem Modul geladen werden.

## 4. Optionen (Attribute auf der Hero-Section)

| Attribut | Default | Wirkung |
|---|---|---|
| `data-lp-viscosity` | `1` | Zähigkeit von Maus & Drag (0 = direkt, 3 = sehr träge) |
| `data-lp-mouse` | `1` | Stärke der Maus-Streuung |
| `data-lp-size` | `1` | Partikelgröße |
| `data-lp-glow` | `1` | Helligkeit |
| `data-lp-flow` | `1` | Tempo der Licht-Pulse |
| `data-lp-shimmer` | `1` | Flirren der Partikel |
| `data-lp-count` / `data-lp-count-mobile` | `20000` / `9000` | Partikelanzahl |
| `data-lp-tints` | Logo-Farben | Farben des Sternenfelds, z. B. `#b6f5a0,#6fe3d6,#6f95dc` |

**Tuning:** Hängt `?lp-tune` an die Staging-URL. Dann erscheint ein Regler-Panel, und „Attribute kopieren“ liefert die fertigen Attribute zum Einfügen in Webflow.

## 5. Hinweise

- **Designer-Vorschau:** Custom Code läuft im Designer nicht. Testen auf Staging (`*.webflow.io`).
- **Lenis:** Lenis wird automatisch erkannt (`window.lenis`). Scroll-Position und Replay laufen dann über Lenis.
- **Kein WebGL:** In dem Fall bekommt `<html>` die Klasse `lp-no-webgl`. Darüber zeigt ihr in Webflow ein statisches Logo-Bild.
- **`prefers-reduced-motion`:** Das Intro wird übersprungen, und die Szene steht still.
- **Page-Transitions:** `window.LogoParticles.destroy()` räumt alles auf, `.replay()` startet das Intro neu.
- **Neues Logo:** Mit `python3 tools/generate-logo-data.py <logo.png> out.json debug.png` aus dem Icon-PNG neu erzeugen und dann nach `quantumbasel.data.js` konvertieren. Das Skript ist auf die Achter-Schleife abgestimmt: Bildausschnitt und Kreuzungspunkt stehen fest im Code. Die Logik im Modul bleibt gleich.

## Releases

Jede Änderung bekommt ein neues Tag (`vX.Y.Z`) und einen Eintrag in `CHANGELOG.md`. In Webflow danach die Versionsnummer in den Script-URLs anheben. jsDelivr cached Tags dauerhaft, deshalb nie ein bestehendes Tag überschreiben.
