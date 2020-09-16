var router = require('express').Router();
const IconController = require('../../controllers/IconController');

router.get('/test', function(req, res, next) {
    res.status(200).json({ msg: 'test' });
});
router.post('/generate-icons', IconController.process);
router.post('/download', IconController.download);

module.exports = router;