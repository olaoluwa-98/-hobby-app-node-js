const express = require('express');
const router = express.Router();
const Hobby = require('../models/hobby.js');
const User = require('../models/user.js');

var jwt = require('jsonwebtoken');
const app = express();
const validator = require('express-validator');

const secret = 'hobbyappsessiontoken';
app.set('hobby_secret', secret); // secret variable

// Twilio Credentials
const accountSid = 'AC98aa039aab01649db06b22019d47f0b8';
const authToken = 'bdb73c7e8d8a039499c629b6428239fa';

// require the Twilio module and create a REST client
const client = require('twilio')(accountSid, authToken);

router.use(function(req, res, next) {
  let token = req.headers['x-access-token'];
  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('hobby_secret'), function(err, decoded) {      
      if (err) {
        return res.status(422).json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        console.log(decoded);
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(422).send({ 
        success: false, 
        message: 'No token provided.' 
    });
  }
});

router.get('/user', function(req, res) {  
  User.findOne({
    username: req.decoded.username
  }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.status(422).json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
        return res.json({
          success: true,
          message: 'Found the user!',
          user: {
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone_no": user.phone_no        
          }
      });
      }
  });
});

// API for adding and removing hobbies from database
router.get('/hobbies', function(req, res, next){
	Hobby.find({user_id: req.decoded.user_id})
  .sort({ created_at: -1 })
  .select('_id title body favorite created_at updated_at')
  .then(function(hobbies){
		return res.json({ success: true, message: "Hobbies Found", hobbies: hobbies });
	}).catch(next);
});

router.put('/fav-hobby', function(req, res, next){
  Hobby.findOneAndUpdate({user_id: req.decoded.user_id, favorite: true}, {favorite: false})
  .then(function(hobby){
      Hobby.findOneAndUpdate({user_id: req.decoded.user_id, _id: req.body.hobby_id}, {favorite: true })
      .select('_id title body favorite created_at updated_at')
      .then(function(fav_hobby){
        return res.json({ success: true, message: "Hobby made favorite!", hobby: fav_hobby});
      }).catch(next);    
  }).catch(next);
});

router.put('/unfav-hobby', function(req, res, next){
  Hobby.findOneAndUpdate({user_id: req.decoded.user_id, _id: req.body.hobby_id, favorite: true}, {favorite: false})
  .select('_id title body favorite created_at updated_at')
  .then(function(hobby){
        return res.json({ success: true, message: "Removed favorite!", hobby: hobby});
  }).catch(next);
});

router.post('/add-hobby', function(req, res, next){
  req.check("title", "Enter a valid title, Max of 30 chars.").exists().isLength({max: 30});
  req.check("body", "Enter a valid description, Max of 140 chars like twitter.").exists().isLength({max: 140});
  var errors = req.validationErrors();
        if (errors)
          return res.status(422).json({ success:false, message: 'there are invalid inputs', errors:errors});
  req.body.user_id = req.decoded.user_id;
  Hobby.create(req.body)
  .then(function(hobby){
    client.messages
    .create({
      to: '+23a4' + req.decoded.phone_no.slice(1),
      from: '+13059164641',
      body: '\n--Message from Emmanuel Awotunde\'s HobbyApp--'
      + '\nHello @' + req.decoded.username
      + '\nYou Added A new Hobby Successfully\nTitle:\t' + hobby.title
      + '\nDescription:\t' + hobby.body
      + '\n At ' + hobby.created_at,
    })
    .then((message) => {
      console.log(message);
      return res.json({ success: true, message: "New Hobby Added (SMS and Mail Sent!)", created_at: hobby.created_at });
    })
    .catch(function(err) {
      console.error(err);
      return res.status(422).json({ success:false, message: 'New Hobby Added But SMS failed to send', type:2, errors:err, created_at:hobby.created_at});
    });
  }).catch(next);
});

router.put('/edit-hobby/', function(req, res, next){
  req.check("title", "Enter a valid title, Max of 30 chars.").exists().isLength({max: 30});
  req.check("body", "Enter a valid description, Max of 140 chars like twitter.").exists().isLength({max: 140});
  var errors = req.validationErrors();
        if (errors)
          return res.status(422).json({ success:false, message: 'there are invalid inputs', type:2, errors:errors});
  Hobby.findByIdAndUpdate({user_id: req.decoded.user_id, _id: req.body.hobby_id})
  .then(function(hobby){
    return res.send(hobby);
  }).catch(next);
});

router.delete('/remove-hobby/:id', function(req, res, next){
  Hobby.findOneAndRemove({user_id: req.decoded.user_id, _id: req.params.id})
  .then(function(hobby){
    return res.json({ success: true, message: "Hobby Removed", title: hobby.title });
  }).catch(next);

});
// END OF API FOR HOBBY MANIPULATION

module.exports = router;