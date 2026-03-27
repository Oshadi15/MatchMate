const express = require('express');
const router = express.Router();
const smartMatchController = require('../../controllers/smart_matching/smartMatchController');

router.post('/run-match', smartMatchController.findMatches);
router.get('/all-matches', smartMatchController.getMatches);

// Delete one match by ID
router.delete('/:id', smartMatchController.deleteMatch);

// delete All matches
router.delete('/delete/all', smartMatchController.deleteAllMatches);

router.post('/notify/:id', smartMatchController.notifyUser);

module.exports = router;