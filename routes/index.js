const router = require('express').Router();
const userRoutes = require('./users');
const movieRoutes = require('./movies');
const { createUser, login } = require('../controllers/users');
const auth = require('../middlewares/auth');
const { validationCreateUser, validationLogin } = require('../middlewares/celebrate');

router.post('/signup', validationCreateUser, createUser);
router.post('/signin', validationLogin, login);

router.use('/users', auth, userRoutes);
router.use('/movies', auth, movieRoutes);

module.exports = router;
