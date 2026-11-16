# Changelog

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
