const express = require('express');

const router = express.Router();

const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');
const { validationCreateMovie, validationDeleteMovie } = require('../middlewares/celebrate');

router.get('/', getMovies);
router.post('/', validationCreateMovie, createMovie);
router.delete('/:movieId', validationDeleteMovie, deleteMovie);

module.exports = router;
