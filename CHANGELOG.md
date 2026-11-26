# Changelog

## v1.3.0 – 2026-11-26

- Neu: `data-lp-offset-y` – Logo vertikal verschieben (Anteil der Bildschirmhöhe), z. B. für Hero-Text unten
- Neu: `data-lp-scale` – Logo-Größe
- Beide mit Mobile-Override: `data-lp-offset-y-mobile`, `data-lp-scale-mobile` (< 768 px)
- Tuning-Panel: Regler „Logo-Position“ und „Logo-Größe“; „Attribute kopieren“ gibt auf Mobile die `-mobile`-Attribute aus
- Defaults unverändert

## v1.2.0 – 2026-11-16

- Neu: `data-logo-particles="intro-hide"` – Elemente (z. B. die Nav) bleiben ausgeblendet, bis sich das Logo gebildet hat, und blenden dann weich ein
- Kommen sofort zurück bei Scroll, Wheel, Touch oder Taste; beim Replay (oben auf der Seite) werden sie wieder versteckt
- Neu: `data-lp-reveal-at` – Zeitpunkt des Einblendens als Anteil des Intros (Default 0.8)
- `html.lp-intro-done` wird gesetzt, sobald das Intro-UI sichtbar ist (bei reduced-motion und ohne WebGL sofort)
- Head-Snippet gegen kurzes Aufblitzen beim Laden, siehe README

## v1.1.0 – 2026-11-16

- Neu: `data-lp-pulse` – Helligkeit der Licht-Pulse (war fest eingebaut)
- Neu: `data-lp-shimmer-speed` – Tempo des Flirrens
- Neu: `data-lp-dissolve-start` / `data-lp-dissolve-length` – Start und Länge der Auflösung beim Scrollen
- Tuning-Panel: Regler für alle neuen Optionen, „Flow-Tempo“ heißt jetzt „Puls-Tempo“
- Defaults unverändert: ohne neue Attribute sieht alles aus wie in v1.0.0

## v1.0.0 – 2026-11-16

- Erstes Release: Partikel-Logo-Hero (`logo-particles.js` + `quantumbasel.data.js`)
- Intro (Partikel ziehen sich entlang der Schleife zusammen), Licht-Pulse, 3D-Tiefe der Kreuzung
- Zähe Maus-Streuung und Drag-Rotation (`data-lp-viscosity`), Scroll-Tilt und Auflösung ins Partikelfeld
- Optionen per Data-Attribute, Tuning-Panel über `?lp-tune`, Lenis-Erkennung, reduced-motion, `LogoParticles.destroy()`
