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
      return bcrypt
        .hash(password, 10)
        .then((hash) => User.create({
          name,
          email,
          password: hash,
        }));
    })
    .then((user) => {
      res.status(201).send(user);
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictError('Пользователь уже зарегистрирован'));
      }
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Отправленные некорректные данные'));
      }
      return next(err);
    });
}

function login(req, res, next) {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch(next);
}

function getUserInfo(req, res, next) {
  const userId = req.user._id;
  User.findById(userId)
    .then((userInfo) => {
      if (!userInfo) {
        throw new NotFoundError('Пользователь с таким id не найден');
      }
      res.status(200).send(userInfo);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return next(new ValidationError(`Некорректные данные: ${error.message}`));
      }
      return next(error);
    });
}

function updateUserInfo(req, res, next) {
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
  getUserInfo,
  updateUserInfo,
};
