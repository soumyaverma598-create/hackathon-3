const express = require('express');
const { getAll, markRead } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(verifyToken);
router.get('/', getAll);
router.put('/:id/read', markRead);
module.exports = router;
