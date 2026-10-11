const mongoose = require("mongoose");
const Favorite = require("../models/Favourite");
const Template = require("../models/Template");

// POST /api/favorites/:templateId
async function addFavorite(req, res) {
  try {
    const { templateId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.isValidObjectId(templateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid template ID",
      });
    }

    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    try {
      const favorite = await Favorite.create({
        user: userId,
        template: templateId,
      });

      return res.status(201).json({
        success: true,
        message: "Template added to favorites",
        favorite,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Template is already in favorites",
        });
      }

      throw error;
    }
  } catch (error) {
    console.error("Add favorite error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to add favorite",
    });
  }
}

// GET /api/favorites
async function getFavorites(req, res) {
  try {
    const userId = req.user.userId;

    const favorites = await Favorite.find({ user: userId })
      .populate("template")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: favorites.length,
      favorites,
    });
  } catch (error) {
    console.error("Get favorites error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch favorites",
    });
  }
}
async function removeFavorite(req, res) {
  try {
    const { templateId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid template ID",
      });
    }

    const favorite = await Favorite.findOneAndDelete({
      user: userId,
      template: templateId,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Removed from favorites successfully",
    });
  } catch (error) {
    console.error("Remove favorite error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to remove favorite",
    });
  }
}
module.exports = {
  addFavorite,
  getFavorites,
  removeFavorite,
};
