var router = require('express').Router();

router.use('/', require('./icon'));

router.use(function(err, req, res, next){
  if(err.name === 'ValidationError'){
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key){
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

router.get('/status', function(req, res) {
  res.send({ status: 200 });
});

module.exports = router;