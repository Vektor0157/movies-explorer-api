const express = require('express');

const router = express.Router();
const {
  getUsers, updateUser,
} = require('../controllers/users');
const { validationUpdateUser, validationUserId } = require('../middlewares/celebrate');

router.patch('/me', validationUpdateUser, updateUser);
router.get('/me', validationUserId, getUsers);

module.exports = router;
