const express = require('express');
const { getAll, markRead, sendNotification, sendApplicationStatusNotification } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(verifyToken);
router.get('/', getAll);
router.put('/:id/read', markRead);
router.post('/send', sendNotification);
router.post('/send-status', sendApplicationStatusNotification);
module.exports = router;
