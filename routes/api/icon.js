var router = require('express').Router();
const IconController = require('../../controllers/IconController');

router.get('generate-icons', IconController.process);
router.post('download', IconController.download);

module.exports = router;