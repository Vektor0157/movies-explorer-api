const express = require('express');

const router = express.Router();

const { getUsers, updateUser } = require('../controllers/users');
const { validationUpdateUser } = require('../middlewares/celebrate');

router.get('/me', getUsers);
router.patch('/me', validationUpdateUser, updateUser);

module.exports = router;
