const express = require('express');
const router = express.Router();
const Hobby = require('../models/hobby.js');
const passport = require('passport');

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

// API for adding and removing hobbies from database
router.get('/hobbies', function(req, res, next){
	Hobby.find({}).then(function(hobbies){
		res.send(hobbies);
	}).catch(next);
});

router.get('/hobby/:id', function(req, res, next){
	Hobby.find({_id: req.params.id}).then(function(hobby){
		res.send(hobby);
	}).catch(next);
});

router.post('/add-hobby', function(req, res, next){
	console.log(req.body);

	Hobby.create(req.body).then(function (err, hobby){
		if (err) return next(err);
		res.send(hobby);
	}).catch(next);
});

router.put('/edit-hobby/:id', function(req, res, next){
	Hobby.findByIdAndUpdate({ _id: req.params.id }).then(function(hobby){
		res.send(hobby);
	}).catch(next);
});

router.delete('/remove-hobby/:id', function(req, res, next){
	Hobby.findByIdAndRemove({ _id: req.params.id }).then(function(hobby){
		res.send(hobby);
	}).catch(next);
	
});
// END OF API FOR HOBBY MANIPULATION

// APIs for authenticating the users

router.post('/register', function(req, res) {
  if (!req.body.email || !req.body.password) 
  {
    res.json({success: false, msg: 'Please enter the email and password'});
  }
  else 
  {
    var newUser = new User({
      name: req.body.email,
      password: req.body.password
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Successful created new user.'});
    });

  }

});

router.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

module.exports = router;