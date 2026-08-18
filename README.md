# Attendance Manager

A local-first dashboard for tracking a class roster, session attendance, and prepaid student credit. It is designed for small programs that need a fast daily workflow without accounts, hosted credentials, or a database setup.

## What it does

- Build and manage a student roster
- Mark attendance for any date
- Derive session charges and current credit automatically
- Review an individual student’s attendance history and adjust their starting credit
- Export a CSV summary or complete JSON backup
- Keep all data in the browser’s local storage
- Load sample data to explore the product immediately

## Why local-first

This version is deliberately self-contained: data never leaves the browser unless the user exports it. That makes the project easy to run, safe to demo, and simple to deploy as a static site.

## Run locally

Requires Node.js 22.12 or newer.

```bash
git clone https://github.com/NiTHIN-K/Attendance-Manager.git
cd Attendance-Manager
npm install
npm run dev
```

Open the local URL printed by Vite. Use **Load sample** from the header to populate a demonstration workspace.

## Quality checks

```bash
npm test
npm run build
```

The test suite covers attendance updates, safe cleanup, student summaries, export formatting, workspace metrics, and local-data normalization. The production build is checked in continuous integration.

## Project structure

```text
src/App.jsx               Application workflow and interface
src/lib/attendance.js     Pure attendance, credit, export, and storage helpers
src/index.css             Responsive visual system
test/                     Node.js unit tests
```

## Data model

Each student has a starting credit. Every date they are marked present counts as one session and applies the configured session fee. Current credit is derived rather than stored independently, so the balance always reflects the attendance record.

```text
current credit = starting credit − (recorded sessions × session fee)
```

## Deployment

This is a static Vite application. Build it with `npm run build` and host the generated `dist/` directory on any static host. No environment variables or server-side configuration are required.

## License

Released under the [GNU GPL v3.0](LICENSE).
