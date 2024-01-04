const express = require('express');

const router = express.Router();
const { validateUpdateUser } = require('../middlewares/celebrate');
const { getUserByInfo, updateUserInfo } = require('../controllers/users');

router.get('/me', getUserByInfo);
router.patch('/me', validateUpdateUser, updateUserInfo);

module.exports = router;
