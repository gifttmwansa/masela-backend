const express = require("express");
const { v4: uuid } = require("uuid");

const db = require("../db");
const { requireAdmin } = require("../adminAuth");

const router = express.Router();

router.get("/", (req, res) => {
  const settings = getSettings();

  const rows = db
    .prepare(
      "SELECT * FROM medicine_achievements ORDER BY year ASC, created_at ASC"
    )
    .all();

  res.json({
    ...settings,
    achievements: rows.map(toAchievement),
  });
});

router.patch("/settings", requireAdmin, (req, res) => {
  const { currentYear } = req.body;

  if (currentYear) {
    db.prepare(
      "UPDATE settings SET value = ? WHERE key = 'medicine_current_year'"
    ).run(String(currentYear));
  }

  res.json(getSettings());
});

router.post("/achievements", requireAdmin, (req, res) => {
  const { year, title, note, date } = req.body;

  if (!year) {
    return res.status(400).json({
      error: "year is required",
    });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({
      error: "title is required",
    });
  }

  const row = {
    id: uuid(),
    year: Number(year),
    title: title.trim(),
    note: note || "",
    date: date || null,
    created_at: new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO medicine_achievements
      (id, year, title, note, date, created_at)
     VALUES
      (@id, @year, @title, @note, @date, @created_at)`
  ).run(row);

  res.status(201).json(toAchievement(row));
});


router.delete(
  "/achievements/:id",
  requireAdmin,
  (req, res) => {
    db.prepare(
      "DELETE FROM medicine_achievements WHERE id = ?"
    ).run(req.params.id);

    res.status(204).end();
  }
);

function getSettings() {
  const rows = db
    .prepare("SELECT key, value FROM settings")
    .all();

  const map = Object.fromEntries(
    rows.map((r) => [r.key, r.value])
  );

  return {
    currentYear: Number(
      map.medicine_current_year || 1
    ),
    totalYears: Number(
      map.medicine_total_years || 6
    ),
    school:
      map.medicine_school ||
      "University of Zambia",
  };
}

function toAchievement(row) {
  return {
    id: row.id,
    year: row.year,
    title: row.title,
    note: row.note,
    date: row.date,
    createdAt: row.created_at,
  };
}

module.exports = router;