const mongoose = require('mongoose');
const User = require('./user');

const regexUrl = /https?:\/\/(www)?[0-9a-z\-._~:/?#[\]@!$&'()*+,;=]+#?$/i;

const movieSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
    },
    director: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
      validate: regexUrl,
    },
    trailerLink: {
      type: String,
      required: true,
      validate: regexUrl,
    },
    thumbnail: {
      type: String,
      required: true,
      validate: regexUrl,
    },
    owner: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
    movieId: {
      type: String,
      required: true,
    },
    nameRU: {
      type: String,
      required: true,
    },
    nameEN: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  },
);

module.exports = mongoose.model('movie', movieSchema);
