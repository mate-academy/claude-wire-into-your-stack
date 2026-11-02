const express = require("express");
const store = require("../db/store");

const router = express.Router();

// GET /health — simple liveness check
router.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// GET /api/status — system health check (also verifies the user store responds)
router.get("/status", async (req, res, next) => {
  try {
    const users = await store.getAllUsers();

    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks: { store: Array.isArray(users) ? "ok" : "unavailable" },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

// Перевірено лінтером
