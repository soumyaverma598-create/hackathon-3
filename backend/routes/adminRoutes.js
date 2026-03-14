const express = require('express');
const { getUsers, createUser, updateUser, getConfig } = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(verifyToken);
router.use(requireAdmin);

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.get('/config', getConfig);
module.exports = router;
