const express = require("express");
const { v4: uuid } = require("uuid");

const db = require("../db");
const { upload, publicUrlFor } = require("../uploadConfig");
const { requireAdmin } = require("../adminAuth");

const router = express.Router();


router.get("/notes", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM book_notes ORDER BY created_at DESC")
    .all();

  res.json(rows.map(toNote));
});

router.post("/notes", requireAdmin, (req, res) => {
  const { title, note } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      error: "title is required",
    });
  }

  const row = {
    id: uuid(),
    title: title.trim(),
    note: note || "",
    created_at: new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO book_notes
      (id, title, note, created_at)
     VALUES
      (@id, @title, @note, @created_at)`
  ).run(row);

  res.status(201).json(toNote(row));
});


router.delete("/notes/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM book_notes WHERE id = ?").run(req.params.id);

  res.status(204).end();
});


router.get("/checklist", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM book_checklist ORDER BY created_at DESC")
    .all();

  res.json(rows.map(toChecklistItem));
});

router.post("/checklist", requireAdmin, (req, res) => {
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      error: "title is required",
    });
  }

  const row = {
    id: uuid(),
    title: title.trim(),
    done: 0,
    created_at: new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO book_checklist
      (id, title, done, created_at)
     VALUES
      (@id, @title, @done, @created_at)`
  ).run(row);

  res.status(201).json(toChecklistItem(row));
});

router.patch("/checklist/:id", requireAdmin, (req, res) => {
  const { done } = req.body;

  const result = db
    .prepare("UPDATE book_checklist SET done = ? WHERE id = ?")
    .run(done ? 1 : 0, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "not found",
    });
  }

  const row = db
    .prepare("SELECT * FROM book_checklist WHERE id = ?")
    .get(req.params.id);

  res.json(toChecklistItem(row));
});


router.delete("/checklist/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM book_checklist WHERE id = ?").run(
    req.params.id
  );

  res.status(204).end();
});


router.get("/photo", (req, res) => {
  const row = db
    .prepare("SELECT * FROM book_photo WHERE id = 1")
    .get();

  res.json({
    url: row ? publicUrlFor(row.filename) : null,
  });
});


router.post(
  "/photo",
  requireAdmin,
  upload.single("photo"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: "photo file is required",
      });
    }

    db.prepare(
      `INSERT INTO book_photo (id, filename)
       VALUES (1, ?)
       ON CONFLICT(id)
       DO UPDATE SET filename = excluded.filename`
    ).run(req.file.filename);

    res.status(201).json({
      url: publicUrlFor(req.file.filename),
    });
  }
);

function toNote(row) {
  return {
    id: row.id,
    title: row.title,
    note: row.note,
    createdAt: row.created_at,
  };
}

function toChecklistItem(row) {
  return {
    id: row.id,
    title: row.title,
    done: !!row.done,
    createdAt: row.created_at,
  };
}

module.exports = router;