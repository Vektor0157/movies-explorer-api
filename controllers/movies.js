const Movies = require('../models/movie');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const BadRequestError = require('../errors/BadRequestError');

function getMovies(req, res, next) {
  const userId = req.user._id;
  Movies.find({ owner: userId })
    .then((movies) => res.status(200).send(movies))
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
  Movies.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner: req.user._id,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданны некорректные данные'));
      }
      return next(err);
    });
}

function deleteMovie(req, res, next) {
  const { movieId } = req.params;
  Movies.findById(movieId)
    .then((movie) => {
      if (!movie) {
        return next(new NotFoundError('Фильм не найден'));
      }
      if (movie.owner.toString() !== req.user._id) {
        return next(new ForbiddenError('У вас нет прав на удаление этого фильма'));
      }
      return Movies.findByIdAndDelete(movieId)
        .then((deletedMovie) => {
          if (!deletedMovie) {
            next(new NotFoundError('Фильм не найден'));
          }
          res.send(deletedMovie);
        });
    })
    .catch(next);
}

module.exports = {
  getMovies,
  deleteMovie,
  createMovie,
};
