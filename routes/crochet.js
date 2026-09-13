const express = require("express");
const { v4: uuid } = require("uuid");

const db = require("../db");
const { requireAdmin } = require("../adminAuth");

const router = express.Router();

router.get("/wishlist", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM crochet_wishlist ORDER BY created_at DESC")
    .all();

  res.json(rows.map(toWishlistItem));
});


router.post("/wishlist", requireAdmin, (req, res) => {
  const { item, targetDate } = req.body;

  if (!item || !item.trim()) {
    return res.status(400).json({
      error: "item is required",
    });
  }

  const row = {
    id: uuid(),
    item: item.trim(),
    target_date: targetDate || null,
    done: 0,
    created_at: new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO crochet_wishlist
      (id, item, target_date, done, created_at)
     VALUES
      (@id, @item, @target_date, @done, @created_at)`
  ).run(row);

  res.status(201).json(toWishlistItem(row));
});

router.patch("/wishlist/:id", requireAdmin, (req, res) => {
  const { done } = req.body;

  const result = db
    .prepare("UPDATE crochet_wishlist SET done = ? WHERE id = ?")
    .run(done ? 1 : 0, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "not found",
    });
  }

  const row = db
    .prepare("SELECT * FROM crochet_wishlist WHERE id = ?")
    .get(req.params.id);

  res.json(toWishlistItem(row));
});

router.delete("/wishlist/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM crochet_wishlist WHERE id = ?").run(
    req.params.id
  );

  res.status(204).end();
});

function toWishlistItem(row) {
  return {
    id: row.id,
    item: row.item,
    targetDate: row.target_date,
    done: !!row.done,
    createdAt: row.created_at,
  };
}

module.exports = router;