const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail_url: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },

    longDescription: {
      type: String,
      default: "",
    },
    features: {
      type: [String],
      default: [],
    },
    pagesIncluded: {
      type: [String],
      default: [],
    },
    useCases: {
      type: [String],
      default: [],
    },
    techStack: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    previewImages: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      default: "Beginner friendly",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Template", templateSchema);
