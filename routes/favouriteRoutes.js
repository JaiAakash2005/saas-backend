const express = require("express");
const router = express.Router();

const {
  addFavorite,
  getFavorites,
  removeFavorite,
} = require("../controllers/favouriteController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/:templateId", authMiddleware, addFavorite);
router.delete("/:templateId", authMiddleware, removeFavorite);

router.get("/", authMiddleware, getFavorites);

module.exports = router;
