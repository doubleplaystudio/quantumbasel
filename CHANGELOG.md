# Changelog

## v1.10.0 – 2026-11-26

- Neu: `data-lp-inview-out` auf einer Section – die `data-lp-inview`-Elemente darin blenden beim Rausscrollen gestaffelt nach oben aus (Fade, Blur, wie die Hero-Headline) und beim Zurückscrollen wieder ein
- Schwelle als Wert des Attributs (Anteil der Bildschirmhöhe, den die Unterkante der Section passieren muss; Default 0.6)

## v1.9.0 – 2026-11-26

- Neu: `data-lp-inview="words"` / `data-lp-inview` – Reveal im Hero-Stil für beliebige Elemente außerhalb des Heros, ausgelöst beim Reinscrollen (IntersectionObserver)
- Gemeinsam sichtbar werdende Elemente laufen in DOM-Reihenfolge gestaffelt, `data-lp-delay` überschreibt den Start
- `data-lp-inview-repeat` spielt die Animation beim Zurückscrollen erneut ab
- Eigene Wort-Klasse (`.lp-iword`), damit In-View-Texte nicht vom Hero-Fade-out beim Scrollen erfasst werden

## v1.8.0 – 2026-11-26

- Neu: `data-lp-dissolve-trigger` – Partikel-Expansion startet ab einer Scroll-Schwelle und läuft zeitbasiert (easeInOut) ab, statt an die Scroll-Position gekoppelt zu sein; beim Zurückscrollen setzt sich das Logo wieder zusammen
- Neu: `data-lp-dissolve-duration` – Dauer der Expansion in Sekunden (Default 1.4)
- Ohne `dissolve-trigger` bleibt das bisherige scroll-gekoppelte Verhalten

## v1.7.0 – 2026-11-26

- Neu: Headline, Subline und Button (`reveal` / `reveal-words`) blenden beim Scrollen im selben Stil aus (Fade, Blur, leicht nach oben, gestaffelt) und beim Zurückscrollen zügig wieder ein
- Neu: `data-lp-text-out-at` – ab welcher Scroll-Distanz die Texte ausblenden (Default 0.03 vh ≈ 30 px, `off` = nie)
- Neu: `data-lp-tilt-length` – Dauer des Kippens/Schrumpfens beim Scrollen (Default 1 vh)
- Tuning-Panel: Regler „Kippen Dauer“

## v1.6.0 – 2026-11-26

- Cursor-Wolke läuft jetzt im selben WebGL-Canvas: identische Partikel, Größenverteilung, Logo-Farben und Glow-Schimmer wie der Loop (statt eigenem 2D-Canvas)
- Schnelle Mausbewegungen ziehen die Wolke zu einem Kometenschweif, in Ruhe ist sie rund
- Neu: `data-lp-blend` – Loop-Partikel unter dem Cursor verwirbeln und verschwimmen weich ineinander (Default 1, 0 = altes Ausweichen)
- Die Loop-Interaktion folgt jetzt der Cursor-Wolke, damit beide an derselben Stelle reagieren
- Neu: `data-lp-cursor-count`; Tuning-Panel: Regler „Verschwimmen“

## v1.5.0 – 2026-11-26

- Partikel-Cursor: normaler Mauszeiger bleibt sichtbar, die Wolke zieht ihm nach statt ihn zu ersetzen
- Kein Label mehr per Default (`data-lp-cursor-label` bleibt optional)
- Neu: `data-lp-cursor-trail` – wie stark die Wolke nachzieht
- Hero hat keinen Grab-Cursor mehr

## v1.4.0 – 2026-11-26

- Neu: Partikel-Cursor über dem Hero – kleine Wolke in den Logo-Farben statt Systemcursor, folgt zäh der Maus, zieht sich beim Drehen zusammen, kurzer Puls beim Klick
- Label „Drag“ neben der Wolke (`data-lp-cursor-label`, leer = aus), Größe über `data-lp-cursor-size`, abschaltbar mit `data-lp-cursor="false"`
- Nur auf Geräten mit Maus aktiv; über Links, Buttons und Formularfeldern erscheint der normale Cursor, beim Wegscrollen blendet die Wolke aus

## v1.3.1 – 2026-11-26

- Fix: Klicks auf Links und Buttons in der Hero-Section gingen verloren, weil die Drag-Fläche den Zeiger sofort eingefangen hat
- Drag startet nicht mehr auf Links, Buttons, Formularfeldern und Elementen mit `data-lp-no-drag`
- Zeiger wird erst nach > 4 px Bewegung eingefangen; normale Klicks bleiben unberührt

## v1.3.0 – 2026-11-26

- Neu: `data-lp-offset-y` – Logo vertikal verschieben (Anteil der Bildschirmhöhe), z. B. für Hero-Text unten
- Neu: `data-lp-scale` – Logo-Größe
- Beide mit Mobile-Override: `data-lp-offset-y-mobile`, `data-lp-scale-mobile` (< 768 px)
- Tuning-Panel: Regler „Logo-Position“ und „Logo-Größe“; „Attribute kopieren“ gibt auf Mobile die `-mobile`-Attribute aus
- Neu: `data-logo-particles="reveal-words"` – Headline blendet nach dem Intro Wort für Wort ein (Fade, Blur, leicht von unten)
- Neu: `data-logo-particles="reveal"` – Elemente wie Subline oder Button blenden gestaffelt danach ein; `data-lp-delay` überschreibt den Zeitpunkt
- Head-Snippet erweitert, damit auch `reveal`-Elemente beim Laden nicht aufblitzen
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
