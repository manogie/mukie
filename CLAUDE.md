# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server (default `http://localhost:5173`) with HMR.
- `npm run build` — type-check via TypeScript project references (`tsc -b`) then produce a production build with Vite into `dist/`.
- `npm run lint` — run oxlint (Rust-based linter, config in `.oxlintrc.json`).
- `npm run preview` — serve the built `dist/` output locally.

There is no test suite configured in this repository yet.

## Architecture

This is a minimal Vite + React 19 + TypeScript single-page app with no router and no client-side state management library — `src/main.tsx` mounts `App` (`src/App.tsx`) into `#root` inside `StrictMode`, and `App.tsx` is currently the only component.

- **TypeScript config is split via project references**: `tsconfig.json` has no files of its own and references `tsconfig.app.json` (covers `src/`, includes DOM libs, strict `noUnusedLocals`/`noUnusedParameters`) and `tsconfig.node.json` (covers `vite.config.ts`, Node types only). `npm run build` type-checks both via `tsc -b` before Vite bundles.
- **Styling is Tailwind CSS v4** via the `@tailwindcss/vite` plugin (registered in `vite.config.ts` alongside `@vitejs/plugin-react`), pulled in with `@import "tailwindcss";` at the top of `src/index.css`. There is no `tailwind.config.js` — v4 does not require one for this setup.
- **Theming uses hand-written CSS custom properties**, not Tailwind's theme config: `src/index.css` defines color/typography tokens (`--bg`, `--text`, `--text-h`, `--accent`, `--border`, `--shadow`, etc.) on `:root`, with an override block under `@media (prefers-color-scheme: dark)` for dark mode. New global colors should be added as tokens here rather than hardcoded.
- **Deployment target is Vercel**: `vercel.json` rewrites all routes to `/index.html` (SPA fallback), needed since there is no server-side routing.
- **Linting**: oxlint is configured with `react`, `typescript`, and `oxc` plugins in `.oxlintrc.json`. Type-aware lint rules are not enabled (would require adding `oxlint-tsgolint` and setting `"options": { "typeAware": true }`).

# Projektregler & Arbetsflöde

Detta dokument definierar regler, arbetsflöden och kvalitetskrav för AI-drivet utvecklingsarbete i detta projekt.

---

## 1. Arbetsflödesorkestrering (Workflow Orchestration)

### 1.1 Planeringsläge som standard (Plan Mode Default)
- Aktivera planeringsläget vid alla icke-triviala uppgifter (3+ steg, arkitektoniska beslut eller strukturella refaktoriseringar).
- Skriv detaljerade specifikationer och steg i förväg för att eliminera tvetydigheter.
- Om något går fel eller beter sig oväntat: STANNA och gör om planen – fortsätt inte implementera i blindo.
- Använd även planeringsläget för verifierings- och teststrategier, inte enbart för kodskrivning.

### 1.2 Strategi för delagenter (Subagent Strategy)
- Använd delagenter (subagents) generöst för att hålla huvudkontexten ren och fokuserad.
- Avlasta efterforskning, kodutforskning och parallell analys till delagenter.
- Vid komplexa problem: allokera mer beräkningskraft genom strukturerad delegering till delagenter.
- En uppgift per delagent för ett tydligt och fokuserat genomförande.

### 1.3 Självförbättringsloop (Self-Improvement Loop)
- Efter varje manuell korrigering från användaren: uppdatera `tasks/lessons.md` med det identifierade mönstret och orsaken till misstaget.
- Formulera konkreta regler för dig själv som förhindrar att samma misstag upprepas.
- Iterera kompromisslöst över dessa lärdomar tills felfrekvensen minimeras.
- Läs igenom relevanta lärdomar i `tasks/lessons.md` vid sessionens start.

### 1.4 Verifiera innan slutförande (Verification Before Done)
- Markera aldrig en uppgift som slutförd utan att faktiskt bevisa att den fungerar.
- Jämför beteende och utfall mellan `main`-grenen och dina ändringar när det är relevant.
- Kör relevanta enhetstester, integrationstester och linters. Granska felloggar och demonstrera korrekthet.
- Ställ kontrollfrågan: "Skulle en Staff Engineer / Senior Arkitekt godkänna denna lösning?"

### 1.5 Sträva efter elegans med balans (Demand Elegance)
- Vid icke-triviala ändringar: pausa och reflektera – "Finns det en enklare eller mer elegant arkitektur?"
- Om en implementation känns provisorisk eller hackig: "Med all den samlade kunskapen nu – implementera den rena och eleganta lösningen."
- Undvik överkonstruktion (over-engineering) för uppenbara och enkla felrättningar.
- Granska och utmana ditt eget arbete kritiskt innan du presenterar det.

### 1.6 Autonom buggfixning (Autonomous Bug Fixing)
- När en felrapport eller fellogg tillhandahålls: lokalisera grundorsaken, reproducera felet och åtgärda det självständigt utan onödigt frågande.
- Lös fallerande CI-tester, typproblem och linter-varningar proaktivt.
- Undantag: Om felet beror på oklara eller motsägelsefulla affärskrav – stäm av med användaren innan omfattande logik skrivs om.

---

## 2. Uppgiftshantering (Task Management)

- Planera först: Dokumentera hela planen i `tasks/todo.md` med strukturerade kryssrutor (`- [ ]`).
- Verifiera planen: Stäm av planen innan faktisk kodimplementation påbörjas vid större förändringar.
- Följ upp löpande: Bocka av uppgifter i `tasks/todo.md` allt eftersom delmål uppnås.
- Förklara ändringar: Ge en koncis, övergripande sammanfattning vid varje större ändring eller logiskt steg.
- Dokumentera resultat: Lägg till en sammanfattande granskningssektion (Review) i `tasks/todo.md` vid avslut.
- Fånga lärdomar: Synkronisera omedelbart nya insikter och regler till `tasks/lessons.md`.

---

## 3. Frontend, UI, CSS & Designsystem

### 3.1 Designsystem & CSS-disciplin
- Återanvänd befintliga tokens:** Använd strikt projektets definierade CSS-variabler/designtokens för färger, marginaler (spacing), typografi och border-radius.
- Inga magiska värden:** Hitta aldrig på godtyckliga hårdkodade pixelvärden (t.ex. `margin: 13px` eller `#2a3b4c`) om det inte uttryckligen specificerats.
- Komponentåteranvändning:** Undersök alltid om en UI-komponent (knapp, modal, kort, dropdown) redan finns i kodbasen innan en ny skapas.

### 3.2 Responsivitet & Layout
- Mobile-first som grundregel: All UI-kod ska fungera sömlöst från små mobilskärmar (375px) till stora desktopskärmar (1440px+).
- Flytande layouter: Undvik fasta hårdkodade bredder (`width: 600px`). Använd moderna layoutprinciper (Flexbox, CSS Grid, `max-width` och relativa enheter).

---

## 4. Tillgänglighet & Semantik (Accessibility / A11y)

- Semantisk HTML: Använd korrekta HTML5-element (`<main>`, `<nav>`, `<header>`, `<article>`, `<button>`, `<fieldset>`). Använd aldrig `<div>` eller `<span>` för interaktiva klickhändelser utan tvingande tekniska skäl.
- WCAG 2.1 AA: Säkerställ tillräcklig färgkontrast för all text och grafiska element.
- Tangentbordsnavigering: Alla interaktiva komponenter måste kunna nås och användas via tangentbord (Tab, Enter, Space, Escape) med tydliga `focus-visible`-stilar.
- Tillgänglighetsträd & ARIA: Använd meningsfulla `aria-label`, `aria-expanded` och `aria-describedby` vid anpassade eller komplexa komponenter. Alla `<img>` ska ha relevanta `alt`-attribut (eller explicit `alt=""` om bilden är rent dekorativ).

---

## 5. Språk, Texter & Lokalisering

- Konsekvent användargränssnitt: All synlig användartext ska följa projektets primära språk utan inkonsekvent blandning av svenska och engelska (eller andra språk).
- Ingen hårdkodad text.
- Kod & Teknisk dokumentation: Skriv all källkod, variabelnamn, funktionsnamn, git-commits och tekniska kommentarer på engelska.
- Lösningsorienterade felmeddelanden: Felmeddelanden som visas för slutanvändare ska vara tydliga, pedagogiska och hjälpsamma – exponera aldrig råa stack traces eller interna felkoder i UI:t.

---

## 6. Kodstandard, Beroenden & Robusthet

- Minimala externa beroenden: Installera inga nya externa bibliotek (npm/pip/etc.) utan att först motivera varför problemet inte kan lösas med moderna standard-webb-API:er eller befintliga beroenden.
- Strikt typsäkerhet: Skriv strikt och vältypad kod (t.ex. TypeScript utan `any`). Definiera tydliga gränssnitt (interfaces) och datatyper.
- Defensiv programmering: Hantera alltid laddningslägen (loading states), tomma datamängder (empty states) samt felaktiga eller uteblivna API-svar i alla vyer.

---

## 7. Kärnprinciper (Core Principles)

- Enkelhet först (Simplicity First): Gör varje ändring så ren och enkel som möjligt. Påverka minimalt med kod för att lösa uppgiften.
- Ingen lättja (No Laziness): Åtgärda alltid grundorsaken (root cause). Undvik snabbfixar eller tillfälliga fulhack. Håll senior utvecklarstandard i alla lägen.
- Minimal påverkan (Minimal Impact): Ändra endast det som är absolut nödvändigt för uppgiften. Skydda resten av kodbasen från oavsiktliga regressioner och sidoeffekter.
