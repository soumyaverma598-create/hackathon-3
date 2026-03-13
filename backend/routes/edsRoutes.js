const express = require('express');
const {
  createQuery,
  resolveQuery,
  getQueriesByApplicationId
} = require('../controllers/edsController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, createQuery);
router.put('/:id/resolve', verifyToken, resolveQuery);
router.get('/application/:applicationId', verifyToken, getQueriesByApplicationId);

module.exports = router;
