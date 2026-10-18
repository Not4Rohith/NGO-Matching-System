const express = require('express');
const router = express.Router();
const {
  createAidRequest,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  previewMatch
} = require('../controllers/aidRequestController');

router.post('/', createAidRequest);
router.get('/', getAllRequests);
router.post('/match-preview', previewMatch);
router.get('/:id', getRequestById);
router.put('/:id/status', updateRequestStatus);

module.exports = router;
