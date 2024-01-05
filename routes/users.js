const express = require('express');

const router = express.Router();
const { celebrate, Joi } = require('celebrate');
const { getUserById, updateUser, getUsers } = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getUserById);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
  }),
}), updateUser);

module.exports = router;
