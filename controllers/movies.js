const Movies = require('../models/movie');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const BadRequestError = require('../errors/BadRequestError');

function getAllMovies(req, res, next) {
  Movies
    .find({ owner: req.user._id })
    .then((movies) => res.send(movies.reverse()))
    .catch(next);
}

function createMovie(req, res, next) {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  const { userId } = req.user._id;
  Movies
    .create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      thumbnail,
      owner: userId,
      movieId,
      nameRU,
      nameEN,
    })
    .then((movie) => res.status(201).send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданны некорректные данные'));
      }
      return next(err);
    });
}

function deleteMovie(req, res, next) {
  const { movieId } = req.params;
  const { userId } = req.user;
  Movies.findById({ _id: movieId })
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Данные по указанному id не найдены');
      }
      const { owner: movieOwner } = movie;
      if (movieOwner.valueOf() !== userId) {
        throw new ForbiddenError('Нет прав на удаление чужого фильма');
      }
      return Movies.findByIdAndDelete(movieId);
    })
    .then((deletedMovie) => {
      if (!deletedMovie) {
        throw new NotFoundError('Фильм уже был удален');
      }
      res.send({ data: deletedMovie });
    })
    .catch(next);
}

module.exports = {
  getAllMovies,
  deleteMovie,
  createMovie,
};
