const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');
const BadRequestError = require('../errors/BadRequestError');
const ValidationError = require('../errors/ValidationError');

function createUser(req, res, next) {
  const {
    email,
    password,
    name,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({ email, password: hash, name }))
    .then((user) => {
      res.status(200).send({
        data: {
          name: user.name,
          email: user.email,
          password: user.password,
        },
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Пользователь с данным email уже существует'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
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

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.send({ users });
    })
    .catch(next);
};

const getUserById = (req, res, next) => {
  const { userId } = req.user._id;
  User.findById(userId)
    .then((user) => {
      if (user) {
        return res.send(user);
      }
      throw new NotFoundError('User not found');
    })
    .catch(next);
};

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
  getUsers,
  login,
  createUser,
  getUserById,
  updateUser,
};
