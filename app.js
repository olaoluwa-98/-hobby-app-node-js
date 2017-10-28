const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const sha1 = require('sha1');

mongoose.Promise = require('bluebird');

// connect to db
mongoose.connect('mongodb://localhost/hobbydb', { config:{ autoIndex: false}, useMongoClient: true })
  .then(() =>  console.log('connection successful, we\'re ready to fetch your stuff'))
  .catch((err) => console.error(err));

app.use(cors({origin: 'http://localhost:4200'}));
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json());
app.set('hobby_secret', "hobbyappsessiontoken"); // secret variable
app.use(cookieParser());

app.use(express.static('public'));

const User = require('./models/user.js');

// error handling middleware
app.use(function(err, req, res, next){
	res.status(422).send( { error:err.message } );
});

// APIs for authenticating the users
app.post('/login', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.status(422).json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
      // check if password matches
      if (!user.validPassword(req.body.password)) {
        res.status(422).json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {
        // if user is found and password is right
        // create a token with only our given payload
        // we don't want to pass in the entire user since that has the password
        const payload = {
          user_id: user._id,
          username: user.username,
        };
        var token = jwt.sign(payload, app.get('hobby_secret'), { expiresIn: 1440*60 });

        console.log(token);

        return res.json({
          success: true,
          message: 'Enjoy your token!',
          user: {
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone_no": user.phone_no,
          },
          token: token
        });
      }
    }
  });
});

app.post('/register', function(req, res) {
  if (!req.body.email || !req.body.username || !req.body.first_name || !req.body.last_name || !req.body.password || !req.body.phone_no) 
  {
  	console.log(req.body);
    return res.status(422).json({success: false, message: 'Please enter all fields correctly'});
  }
  else 
  {
    var newUser = new User();
    newUser.email =  req.body.email;
    newUser.email_token =  newUser.generateEmailToken(req.body.email);
    newUser.username =  req.body.username;
    newUser.phone_no =  req.body.phone_no;
    newUser.first_name =  req.body.first_name;
    newUser.last_name =  req.body.last_name;    
    newUser.password = newUser.generateHash(req.body.password);
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.status(422).json({success: false, message: 'Username already exists.'});
      	}
      const payload = {
          user_id: newUser._id,
          username: newUser.username
        };      
      var token = jwt.sign(payload, app.get('hobby_secret'), { expiresIn: 1440 * 60 } );
      return res.json({
          success: true,
          message: 'Successfully registered. Enjoy your token!',
          user: {
            "username": newUser.username,
            "email": newUser.email,
            "first_name": newUser.first_name,
            "last_name": newUser.last_name,
            "phone_no": newUser.phone_no
          },
          token: token });
      });
  }
});

// initialize routes
app.use('/api', require('./routes/api'));

app.listen(port, function() {
	console.log('We are ready to consume the APIs');
});