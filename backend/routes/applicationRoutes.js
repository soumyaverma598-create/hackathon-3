const express = require('express');
const router = express.Router();

const {
  getAll,
  getById,
  create,
  updateStatus,
  submitApplication,
} = require('../controllers/applicationController');

const { verifyToken } = require('../middleware/authMiddleware');
const { uploadMiddleware, uploadDoc, getByApplicationId } = require('../controllers/documentController');
const { submitPayment } = require('../controllers/paymentController');
const { getByApplicationId: getEDS, create: createEDS, update: updateEDS } = require('../controllers/edsController');
const { generate: generateGist, getByApplicationId: getGist } = require('../controllers/gistController');
const { get: getMom, update: updateMom, generateDoc, finalize, downloadCertificate } = require('../controllers/momController');

// Support Option B (unauthenticated pass-through) for specific PDF routes
router.post('/:id/mom/generate', generateDoc);
router.post('/:id/mom/finalize', finalize);
router.get('/:id/certificate', downloadCertificate);

router.use(verifyToken);

router.get('/',    getAll);
router.post('/',   create);
router.get('/:id', getById);
router.put('/:id/status',  updateStatus);
router.patch('/:id/submit', submitApplication);  // ← new

router.post('/:id/documents', uploadMiddleware, uploadDoc);
router.get('/:id/documents',  getByApplicationId);

router.post('/:id/payment', submitPayment);

router.get('/:id/eds',              getEDS);
router.post('/:id/eds',             createEDS);
router.put('/:id/eds/:queryId',     updateEDS);
router.put('/:id/eds/:queryId/close', (req, res, next) => {
  req.body = { ...req.body, status: 'closed' };
  return updateEDS(req, res, next);
});

router.get('/:id/gist',  getGist);
router.post('/:id/gist', generateGist);

router.get('/:id/mom',           getMom);
router.put('/:id/mom',           updateMom);

module.exports = router;