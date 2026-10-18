const express = require('express');
const router = express.Router();
const { addRating, getNGORatings } = require('../controllers/ratingController');

router.post('/', addRating);
router.get('/ngo/:ngoId', getNGORatings);

module.exports = router;
