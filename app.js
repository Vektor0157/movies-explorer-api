require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { celebrate, errors, Joi } = require('celebrate');
const cors = require('cors');
const helmet = require('helmet');
const auth = require('./middlewares/auth');
const usersRouter = require('./routes/users');
const moviesRouter = require('./routes/movies');
const ServerError = require('./errors/ServerError');
const NotFoundError = require('./errors/NotFoundError');
const { createUser, login } = require('./controllers/users');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();

const {
  PORT = 3000,
  MONGO_URL = 'mongodb://127.0.0.1:27017/bitfilmsdb',
} = process.env;

mongoose.connect(`${MONGO_URL}`, {
  useNewUrlParser: true,
}).then(() => console.log('Connected to MongoDB'));

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://vmovies.nomoredomainsmonster.ru',
    'https://vmovies.nomoredomainsmonster.ru',
  ],
}));

app.use(requestLogger);
app.use(helmet());

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use('/', express.json());
app.use('/users', auth, usersRouter);
app.use('/movies', auth, moviesRouter);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

app.use('*', auth, (req, res, next) => {
  next(new NotFoundError('Not Found'));
});

app.use(errorLogger);
app.use(errors());
app.use(ServerError);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});
