const express = require('express');

const router = express.Router();
const { validateCreateMovie, validateDeleteMovie } = require('../middlewares/celebrate');

const {
  getAllMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

router.get('/', getAllMovies);
router.post('/', validateCreateMovie, createMovie);
router.delete('/:movieId', validateDeleteMovie, deleteMovie);

module.exports = router;
