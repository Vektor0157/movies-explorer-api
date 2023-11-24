require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cors = require('cors');
const { validateLogin, validateCreateUser } = require('./middlewares/celebrate');
const auth = require('./middlewares/auth');
const usersRouter = require('./routes/users');
const moviesRouter = require('./routes/movies');
const ServerError = require('./errors/ServerError');
const NotFoundError = require('./errors/NotFoundError');
const { createUser, login, logout } = require('./controllers/users');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();
const {
  PORT = 3000,
  MONGO_URL = 'mongodb://127.0.0.1:27017/bitfilmsdb',
} = process.env;

mongoose.connect(`${MONGO_URL}`, {
  useNewUrlParser: true,
// eslint-disable-next-line no-console
}).then(() => console.log('Connected to MongoDB'));

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://api.vmovies.nomoredomainsmonster.ru',
    'https://api.vmovies.nomoredomainsmonster.ru',
    'http://vmovies.nomoredomainsmonster.ru',
    'https://vmovies.nomoredomainsmonster.ru',
  ],
}));

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use('/', express.json());
app.use('/users', usersRouter);
app.use('/movies', moviesRouter);

app.post('/signin', validateLogin, login);
app.post('/signup', validateCreateUser, createUser);
app.post('/signout', logout);

app.use('*', auth, () => {
  throw new NotFoundError('Not Found');
});

app.use(errorLogger);
app.use(errors());
app.use(ServerError);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});
