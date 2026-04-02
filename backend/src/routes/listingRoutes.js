const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate, authorizeRole } = require('../middleware/auth');
const {
  createListing, getAllListings, getMyListings,
  updateListing, deleteListing
} = require('../controllers/listingController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { files: 3 } });

router.get('/', getAllListings);                                                          // Public
router.post('/', authenticate, authorizeRole('farmer'), upload.array('photos', 3), createListing);
router.get('/my', authenticate, authorizeRole('farmer'), getMyListings);
router.put('/:listing_id', authenticate, authorizeRole('farmer'), updateListing);
router.delete('/:listing_id', authenticate, authorizeRole('farmer'), deleteListing);

module.exports = router;