const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

const passport = require('passport');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// connect to db
mongoose.connect('mongodb://localhost/hobbydb', { config:{ autoIndex: false}, useMongoClient: true })
  .then(() =>  console.log('connection successful, we\'re ready to fetch your stuff'))
  .catch((err) => console.error(err));

mongoose.Promise = global.Promise;

app.use(cors({origin: 'http://localhost:4200'}));
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json());
app.use(session({ secret: 'qwerasdfzxcv' }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));

// initialize routes
app.use('/api', require('./routes/api'));

// error handling middleware
app.use(function(err, req, res, next){
	res.status(422).send( { error:err.message } );
});

app.listen(port, function() {
	console.log('We are ready to consume the APIs');
});
