const crypto = require("crypto");

function isValidAdminKey(providedKey) {
  const expectedKey = process.env.ADMIN_KEY || "";

  if (!expectedKey || !providedKey) {
    return false;
  }

  const providedBuffer = Buffer.from(providedKey);
  const expectedBuffer = Buffer.from(expectedKey);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    providedBuffer,
    expectedBuffer
  );
}

function requireAdmin(req, res, next) {
  const expectedKey = process.env.ADMIN_KEY || "";
  const providedKey = req.get("x-admin-key") || "";

  if (!expectedKey) {
    console.error("ADMIN_KEY is not configured on the server.");

    return res.status(500).json({
      error: "Admin authentication is not configured.",
    });
  }

  if (!isValidAdminKey(providedKey)) {
    return res.status(401).json({
      error: "Unauthorized.",
    });
  }

  next();
}

function verifyAdmin(req, res) {
  const expectedKey = process.env.ADMIN_KEY || "";
  const providedKey = req.get("x-admin-key") || "";

  if (!expectedKey) {
    console.error("ADMIN_KEY is not configured on the server.");

    return res.status(500).json({
      error: "Admin authentication is not configured.",
    });
  }

  if (!isValidAdminKey(providedKey)) {
    return res.status(401).json({
      valid: false,
      error: "Incorrect password.",
    });
  }

  res.json({
    valid: true,
  });
}

module.exports = {
  requireAdmin,
  verifyAdmin,
};