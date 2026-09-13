require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { UPLOAD_DIR } = require("./uploadConfig");
const { verifyAdmin } = require("./adminAuth");

const crochetRoutes = require("./routes/crochet");
const booksRoutes = require("./routes/books");
const writingRoutes = require("./routes/writing");
const medicineRoutes = require("./routes/medicine");
const videosRoutes = require("./routes/videos");

const app = express();

const PORT = process.env.PORT || 4000;
const allowedOrigin = process.env.FRONTEND_URL || "*";

app.use(
  cors({
    origin: allowedOrigin,
    allowedHeaders: ["Content-Type", "x-admin-key"],
  })
);

app.use(express.json());

app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/verify", verifyAdmin);
app.use("/api/crochet", crochetRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/writing", writingRoutes);
app.use("/api/medicine", medicineRoutes);
app.use("/api/videos", videosRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    error: err.message || "Something went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`Masela API listening on port ${PORT}`);
});