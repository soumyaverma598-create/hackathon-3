const express = require('express');
const {
  createNotification,
  getNotificationsByUserId,
  markAsRead
} = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, createNotification);
router.get('/user/:userId', verifyToken, getNotificationsByUserId);
router.put('/:id/read', verifyToken, markAsRead);

module.exports = router;
