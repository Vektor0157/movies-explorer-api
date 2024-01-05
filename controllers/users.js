const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');
const BadRequestError = require('../errors/BadRequestError');
const ValidationError = require('../errors/ValidationError');

function createUser(req, res, next) {
  const { name, email, password } = req.body;
  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return next(new ConflictError('Пользователь с таким email уже существует'));
      }
      return bcrypt.hash(password, 10)
        .then((hash) => User.create({ email, password: hash, name }))
        .then((user) => {
          res.status(200).send(user);
        });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError(`Некорректные данные: ${err.message}`));
      }
      return next(err);
    });
}

function login(req, res, next) {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then(({ _id: userId }) => {
      if (userId) {
        const token = jwt.sign(
          { userId },
          NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key',
          { expiresIn: '7d' },
        );
        return res.send({ token });
      }
      throw new BadRequestError('Invalid user data');
    })
    .catch(next);
}

function getUserById(req, res, next) {
  const userId = req.user._id;
  User.findById(userId)
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Отправленные некорректные данные'));
      }
      if (err.name === 'DocumentNotFoundError') {
        return next(
          new NotFoundError(`Пользователь с таким Id: ${userId} не найден`),
        );
      }
      return next(res);
    });
}

function updateUser(req, res, next) {
  const { email, name } = req.body;
  const userId = req.user._id;
  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser && existingUser._id !== userId) {
        throw new ConflictError('Пользователь с таким email уже существует');
      } else {
        User.findByIdAndUpdate(
          userId,
          { email, name },
          { new: true, runValidators: true },
        )
          .then((user) => {
            if (!user) {
              throw new NotFoundError('Пользователь с таким id не найден');
            }
            res.status(200).send({ email: user.email, name: user.name });
          })
          .catch((error) => {
            if (error.name === 'ValidationError') {
              return next(new ValidationError(`Некорректные данные: ${error.message}`));
            }
            return next(error);
          });
      }
    })
    .catch(next);
}

module.exports = {
  login,
  createUser,
  getUserById,
  updateUser,
};
