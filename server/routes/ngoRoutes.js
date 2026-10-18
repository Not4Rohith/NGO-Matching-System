const express = require('express');
const router = express.Router();
const {
  getAllNGOs,
  getNGOById,
  createNGO,
  seedNGOs
} = require('../controllers/ngoController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllNGOs);
router.post('/seed', seedNGOs);
router.get('/:id', getNGOById);
router.post('/', protect, authorize('admin', 'ngo'), createNGO);

module.exports = router;
