# LLD Mastery for Java Interviews

A dependency-free static learning site for low-level design interview preparation. It is designed like an academy reader: dashboard, syllabus navigation, expandable lessons, progress tracking, confidence scoring, parked lessons, quiz mode, quick reference, notes, diagrams, Java code, trade-offs, and interview Q&A.

## Run Locally

Open `index.html` directly in a browser, or serve the folder:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Deploy To Netlify

1. Create a new Netlify site from this folder or Git repository.
2. Leave the build command empty.
3. Set publish directory to `.`.

The included `netlify.toml` already matches this setup.

## Deploy To Vercel

1. Import the repository in Vercel.
2. Use the static project defaults.
3. No build command is required.

The included `vercel.json` keeps the app static and uses Vercel's default static hosting behavior. The site uses hash routes, so no server rewrites are required.

## Content Model

The active course content lives in `lld-syllabus.js`, with the advanced OS/JVM/concurrency Redis-Lite track added by `concurrency-track.js`.

Each lesson is intentionally separated into clear study sections:

- Problem and mental model
- Core concept
- Deep dive
- Concepts
- Examples
- Flow diagram
- Trade-offs and comparative decisions
- Failure modes
- Use when / avoid when
- Java code
- Interview questions with answers
- Revision checklist

The current syllabus includes:

- 25 topics
- 115 lessons
- 345 interview Q&A prompts
- Case studies such as Parking Lot, Vending Machine, Library Management, Elevator, Splitwise, BookMyShow, Cache, Rate Limiter, Task Scheduler, Food Delivery, Ride Sharing, Hotel Booking, Chess, ATM, plus a 30-day OS/JVM-to-Redis-Lite concurrency capstone track

Add or edit base lessons by updating `window.LLD_SYLLABUS` in `lld-syllabus.js`. Add or edit the 30-day concurrency/Redis-Lite track in `concurrency-track.js`. The site has no backend and no API hooks, so it can be deployed as plain static files.
