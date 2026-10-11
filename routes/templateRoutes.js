const express = require("express");
const router = express.Router();

const {
  getAllTemplates,
  getTemplateById,
} = require("../controllers/templateController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", getAllTemplates);
router.get("/:id", authMiddleware, getTemplateById);

module.exports = router;
