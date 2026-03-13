const express = require('express');
const {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes using verifyToken middleware
router.post('/', verifyToken, createApplication);
router.get('/', verifyToken, getAllApplications);
router.get('/:id', verifyToken, getApplicationById);
router.put('/:id/status', verifyToken, updateApplicationStatus);

module.exports = router;
