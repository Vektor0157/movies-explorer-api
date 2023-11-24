require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ServerError = require('./errors/ServerError');
const usersRouter = require('./routes/users');
const moviesRouter = require('./routes/movies');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();
const {
  PORT = 3000,
  MONGO_URL = 'mongodb://127.0.0.1:27017/bitfilmsdb',
} = process.env;

mongoose.connect(MONGO_URL, {
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

app.use(errorLogger);
app.use(ServerError);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});
