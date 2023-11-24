const express = require('express');

const router = express.Router();
const { validateUpdateUser } = require('../middlewares/celebrate');
const { getUserById, updateUser } = require('../controllers/users');

router.get('/me', getUserById);
router.patch('/me', validateUpdateUser, updateUser);

module.exports = router;
