const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const db = require("../db");
const {
  upload,
  UPLOAD_DIR,
  publicUrlFor,
} = require("../uploadConfig");
const { requireAdmin } = require("../adminAuth");

const router = express.Router();


router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM videos ORDER BY created_at DESC")
    .all();

  res.json(rows.map(toVideo));
});

router.post(
  "/",
  requireAdmin,
  upload.single("video"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: "video file is required",
      });
    }

    const { title, description } = req.body;

    const row = {
      id: uuid(),
      title:
        title && title.trim()
          ? title.trim()
          : req.file.originalname,
      description: description || "",
      filename: req.file.filename,
      created_at: new Date().toISOString(),
    };

    db.prepare(
      `INSERT INTO videos
        (id, title, description, filename, created_at)
       VALUES
        (@id, @title, @description, @filename, @created_at)`
    ).run(row);

    res.status(201).json(toVideo(row));
  }
);

router.delete("/:id", requireAdmin, (req, res) => {
  const row = db
    .prepare("SELECT * FROM videos WHERE id = ?")
    .get(req.params.id);

  if (row) {
    const filePath = path.join(
      UPLOAD_DIR,
      row.filename
    );

    fs.unlink(filePath, () => {});
  }

  db.prepare("DELETE FROM videos WHERE id = ?").run(
    req.params.id
  );

  res.status(204).end();
});

function toVideo(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    url: publicUrlFor(row.filename),
    createdAt: row.created_at,
  };
}

module.exports = router;