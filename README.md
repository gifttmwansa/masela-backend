# Masela backend

A small Node.js + Express API backing the Masela site: crochet wishlist,
book notes/checklist/photo, writing pieces, medicine achievements, and
video uploads. Data lives in a SQLite file (`masela.db`); uploaded photos
and videos live in `uploads/`.

## Run it locally

```
cd server
npm install
npm start
```

This starts the API at `http://localhost:4000`. Check it's alive:

```
curl http://localhost:4000/api/health
# {"ok":true}
```

The frontend (in the other folder) expects the API at this address by
default — no extra setup needed for local development.

## Deploying to Render (free tier)

Render is the easiest place to put this, because SQLite + file uploads
need a real, persistent disk — which rules out purely serverless hosts.

1. **Push this `server/` folder to its own GitHub repo** (or a
   subfolder of a repo — Render lets you set a "root directory").

2. **Create a new Web Service on Render** (render.com → New → Web
   Service), pointing at that repo.
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance type:** Free

3. **Add a persistent disk** (Render dashboard → your service →
   Disks → Add Disk). This is the part that makes your data survive
   restarts and redeploys — without it, every deploy wipes the
   database and uploaded files.
   - **Mount path:** `/var/data`
   - **Size:** 1 GB is plenty to start (Render's free disk tier)

4. **Set environment variables** (Settings → Environment):
   - `DB_DIR` = `/var/data`
   - `UPLOAD_DIR` = `/var/data/uploads`
   - `PUBLIC_URL` = the URL Render gives your service, e.g.
     `https://masela-api.onrender.com` (you'll see this after the
     first deploy — add it, then redeploy)
   - `FRONTEND_URL` = wherever you deploy the frontend, e.g.
     `https://masela.vercel.app` (locks down CORS to just your site)

5. **Deploy.** Render will build and start the service. Visit
   `https://<your-service>.onrender.com/api/health` to confirm it's up.

6. **Point the frontend at it** — in the frontend project, set
   `VITE_API_URL=https://<your-service>.onrender.com` (see the
   frontend's own README) and rebuild/redeploy the frontend.

### A note on Render's free tier

Free web services on Render spin down after periods of inactivity and
take ~30–50 seconds to wake back up on the next request. That means
the *first* visitor after a quiet spell will see a slow initial load
while the backend wakes up — normal, not a bug. If that's ever
annoying, Render's cheapest paid tier ($7/mo) removes the sleep
behavior.

### A note on the free disk's size limit

Video files add up fast. Keep an eye on usage in the Render dashboard;
if you're getting close to the disk limit, either upgrade the disk
size or periodically remove older videos through the site itself.

## API reference

All endpoints are under `/api`. JSON in, JSON out, except uploads
(book photo, videos) which use `multipart/form-data`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness check |
| GET/POST | `/crochet/wishlist` | List / add a wishlist item |
| PATCH/DELETE | `/crochet/wishlist/:id` | Toggle done / remove |
| GET/POST | `/books/notes` | Reading notes |
| DELETE | `/books/notes/:id` | Remove a note |
| GET/POST | `/books/checklist` | To-read list |
| PATCH/DELETE | `/books/checklist/:id` | Toggle done / remove |
| GET/POST | `/books/photo` | Currently-reading photo |
| GET | `/writing` | List all pieces |
| POST | `/writing` | Add a piece `{type, title, content}` |
| DELETE | `/writing/:id` | Remove a piece |
| GET | `/medicine` | Achievements + current year + school |
| PATCH | `/medicine/settings` | Update current year |
| POST | `/medicine/achievements` | Add `{year, title, note, date}` |
| DELETE | `/medicine/achievements/:id` | Remove |
| GET/POST | `/videos` | List / upload (field name `video`) |
| DELETE | `/videos/:id` | Remove (also deletes the file) |
