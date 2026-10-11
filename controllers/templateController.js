const mongoose = require("mongoose");
const Template = require("../models/Template");

// GET /api/templates?page=1&limit=6
async function getAllTemplates(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Page must be >= 1 and limit must be between 1 and 50",
      });
    }

    const skip = (page - 1) * limit;

    const [templates, totalTemplates] = await Promise.all([
      Template.find().sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit),

      Template.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalTemplates / limit);

    return res.status(200).json({
      success: true,
      templates,
      pagination: {
        currentPage: page,
        limit,
        totalTemplates,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1 && totalPages > 0,
      },
    });
  } catch (error) {
    console.error("Get templates error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch templates",
    });
  }
}

// GET /api/templates/:id
async function getTemplateById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid template ID",
      });
    }

    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    return res.status(200).json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("Get template error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch template",
    });
  }
}

module.exports = {
  getAllTemplates,
  getTemplateById,
};
