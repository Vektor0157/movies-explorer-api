const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ConflictError = require('../errors/ConflictError');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');

const { NODE_ENV, JWT_SECRET } = process.env;

const createUser = (req, res, next) => {
  bcrypt.hash(String(req.body.password), 10)
    .then((hashedPassword) => {
      User.create({
        ...req.body, password: hashedPassword,
      })
        .then((user) => {
          res.status(201).send({ data: user });
        })
        .catch((err) => {
          if (err.message === 'Validation failed') {
            next(new BadRequestError('Данные пользователя введены неверно'));
            return;
          }
          if (err.code === 11000) {
            next(new ConflictError('Пользоваиель с таким email уже существует'));
            return;
          }
          next(err);
        });
    })
    .catch((e) => {
      next(e);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .select('+password')
    .orFail(() => new ConflictError('Пользователь уже существует'))
    .then((user) => {
      bcrypt.compare(password, user.password)
        .then((isValidUser) => {
          if (isValidUser) {
            const token = jwt.sign({
              _id: user._id,
            }, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key');
            res.status(200).send({ data: user.toJSON(), token });
          } else {
            next(new BadRequestError('Данные пользователя введены неверно'));
          }
        })
        .catch(next);
    })
    .catch((err) => {
      next(err);
    });
};

const getUsers = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.status(200).send(user);
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name },
    { new: true, runValidators: true },
  )
    .then((updatedData) => {
      res.status(200).send(updatedData);
    })
    .catch((err) => {
      if (err.message === 'Validation') {
        next(new BadRequestError('Данные пользователя введены неверно'));
        return;
      }
      next(err);
    });
};

module.exports = {
  getUsers,
  login,
  createUser,
  updateUser,
};
