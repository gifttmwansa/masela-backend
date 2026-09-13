const express = require("express");
const { v4: uuid } = require("uuid");

const db = require("../db");
const { requireAdmin } = require("../adminAuth");

const router = express.Router();

router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM writing_pieces ORDER BY created_at DESC")
    .all();

  res.json(rows.map(toPiece));
});

router.post("/", requireAdmin, (req, res) => {
  const { type, title, content } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      error: "title is required",
    });
  }

  if (!content || !content.trim()) {
    return res.status(400).json({
      error: "content is required",
    });
  }

  const row = {
    id: uuid(),
    type: type && type.trim() ? type.trim() : "Fragment",
    title: title.trim(),
    content: content.trim(),
    created_at: new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO writing_pieces
      (id, type, title, content, created_at)
     VALUES
      (@id, @type, @title, @content, @created_at)`
  ).run(row);

  res.status(201).json(toPiece(row));
});

router.delete("/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM writing_pieces WHERE id = ?").run(
    req.params.id
  );

  res.status(204).end();
});

function toPiece(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
  };
}

module.exports = router;