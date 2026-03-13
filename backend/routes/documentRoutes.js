const express = require('express');
const {
  uploadDocument,
  getDocumentsByApplicationId
} = require('../controllers/documentController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, uploadDocument);
router.get('/application/:applicationId', verifyToken, getDocumentsByApplicationId);

module.exports = router;
