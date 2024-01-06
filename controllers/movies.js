const Movies = require('../models/movie');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const BadRequestError = require('../errors/BadRequestError');

function getAllMovies(req, res, next) {
  Movies
    .find({ owner: req.user._id })
    .then((movies) => res.send(movies))
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
  const owner = req.user._id;
  Movies.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => res.status(201).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданны некорректные данные'));
      } else {
        next(err);
      }
    });
}

function deleteMovie(req, res, next) {
  const { movieId } = req.params.id;
  Movies.findById(movieId)
    .orFail(() => { throw new NotFoundError('Фильм с указанным id не найден'); })
    .then((movie) => {
      if (!(movie.owner.toJSON() === req.user._id)) {
        throw new ForbiddenError('Нет доступа удалять фильмы других пользователей.');
      }
      return Movies.findByIdAndRemove(movieId)
        .then((deleteMovies) => res.send(deleteMovies))
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Передан некорректный id фильма'));
      } else {
        next(err);
      }
    });
}

module.exports = {
  getAllMovies,
  deleteMovie,
  createMovie,
};
