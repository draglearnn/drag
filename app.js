
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const localStrategy = require('passport-local');
const User = require('./models/userModel');
const flash = require('connect-flash');  // Assuming you have installed connect-flash
const bodyParser = require('body-parser');
 const path = require('path');  
const multer = require('multer');
const upload = multer({ dest: 'upload/'})
const mainController = require('./controllers/mainController');


const lessonsRoutes = require('./controllers/lessonsController');


const app = express();
app.use(bodyParser.urlencoded({ extended: true })); // Add this line to parse URL-encoded bodies
app.use(bodyParser.json());

app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {

});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 60 * 60 * 24,
  }),
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24 * 7, // Corrected the duration format
  },
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));



passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});


app.use('/', mainController);
app.use('/api', lessonsRoutes);  // Use the router object



app.all('*', (req, res, next) => {
  res.status(404).render('error');
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
