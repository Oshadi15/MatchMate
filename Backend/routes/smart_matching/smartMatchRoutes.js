const express = require('express');
const router = express.Router();
const smartMatchController = require('../../controllers/smart_matching/smartMatchController');

router.post('/run-match', smartMatchController.findMatches);
router.post('/run-image-ai', smartMatchController.runImageAiForMatches);
router.get('/all-matches', smartMatchController.getMatches);
router.get('/user-matches', smartMatchController.getUserMatches);
router.post('/claim/:id', smartMatchController.claimMatch);
router.post('/reject/:id', smartMatchController.rejectMatchByOwner);

// Delete one match by ID
router.delete('/:id', smartMatchController.deleteMatch);

// delete All matches
router.delete('/delete/all', smartMatchController.deleteAllMatches);

router.post('/notify/:id', smartMatchController.notifyUser);

module.exports = router;