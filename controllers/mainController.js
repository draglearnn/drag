const express = require('express');
const router = express.Router();
const passport = require('passport');
const { ensureAuthenticated } = require('../middleware'); // Adjust the path based on your actual structure
const academicLevels = ['primary', 'highschool', 'university'];
const User = require('../models/userModel');
const Tutor = require('../models/tutorModel');
// Add this at the top with other imports
const Booking = require('../models/bookingModel');
const Lesson = require('../models/bookingModel');


const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const ObjectId = require('mongoose').Types.ObjectId;

// Authentication Routes
router.get('/register', (req, res) => {
    res.render('Authi/register');
});

const getCurrentUser = (req) => {
    if (req && req.isAuthenticated && typeof req.isAuthenticated === 'function') {
        return req.isAuthenticated() ? req.user : null;
    } else {
        return null;
    }
};







router.get('/test-current-user', (req, res) => {
    const currentUser = getCurrentUser(req);

    if (currentUser) {
        res.send(`Current User: ${currentUser.username}`);
    } else {
        res.send('No authenticated user.');
    }
});

router.post('/register', async (req, res, next) => {
    const { email, username, password, confirmPassword, role } = req.body;

    if (!email) {
        return res.render('Authi/register', { error: 'Email is required' });
    }

    if (password !== confirmPassword) {
        return res.render('Authi/register', { error: 'Passwords do not match' });
    }

    const user = new User({ email, username, role });
    user.role = role;

    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
        if (err) return next(err);
        console.log(registeredUser);
        res.redirect('/dashboard');
    });
});

router.get('/login', (req, res) => {
    res.render('Authi/login');
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    const redirectUrl = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

// Homepage and Dashboard
router.get('/', async (req, res) => {
    const tutors = await Tutor.find();
    res.render('home', { pageTitle: 'Home', tutors: tutors });
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', { pageTitle: 'Dashboard', user: req.user });
});

// Academic Levels Routes
academicLevels.forEach(level => {
    router.get(`/academiclevels/${level}`, ensureAuthenticated, (req, res) => {
        const pageTitle = `${level.charAt(0).toUpperCase() + level.slice(1)} Information`;
        const viewName = `academiclevels/${level}`;
        res.render(viewName, { pageTitle });
    });
});

// Tutor Routes
router.get('/tutors', async (req, res) => {
    try {
        const tutors = await Tutor.find();
        res.render('tutors/index', { tutors });
    } catch (error) {
        res.render('error');
    }
});

router.get('/tutors/create', ensureAuthenticated, (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    res.render('tutors/create');
});

router.post('/tutors/create', upload.array('tutorImage'), async (req, res) => {
    try {
        const tutorName = req.body.name;
        const tutorSubject = req.body.subject;
        const tutorPrice = req.body.price;
        const tutorImages = req.files.map(file => ({
            url: file.path,
            filename: file.filename
        }));
        const currentUser = getCurrentUser(req);

        if (!currentUser) {
            req.flash('error', 'Authentication required.');
            return res.redirect('/login');
        }

        const newTutor = new Tutor({
            name: tutorName,
            subject: tutorSubject,
            price: tutorPrice,
            image: tutorImages,
            author: currentUser._id
        });

        await newTutor.save();

        res.redirect('/tutors');
    } catch (error) {
        console.error(error);
        req.flash('error', 'An unexpected error occurred. Please try again later.');
        res.render('error');
    }
});

// Assuming you have a tutor object and want to pass its ID to the view
router.get('/tutors/:id', async (req, res) => {
    try {
        const tutor = await Tutor.findById(req.params.id).populate('author');

        if (!tutor) {
            res.render('error');
            return;
        }

        console.log('Author:', tutor.author);
        res.render('tutors/show', {
            pageTitle: 'Tutor Details',
            tutorId: req.params.id,  // Pass the tutorId variable to the view
            tutor: tutor,
            currentUser: getCurrentUser(req),
            name: tutor.name,
            subject: tutor.subject,
            message: 'Custom message goes here'
        });
    } catch (error) {
        res.render('error');
    }
});


router.get('/tutors/:id/edit', ensureAuthenticated, async (req, res) => {
    try {
        const tutor = await Tutor.findById(req.params.id);
        res.render('tutors/edit', { tutor });
    } catch (error) {
        res.render('error');
    }
});

router.post('/tutors/:id/edit', multer({ storage }).array('tutorImage'), async (req, res) => {
    try {
        const tutor = await Tutor.findById(req.params.id);
        const tutorName = req.body.name;
        const tutorSubject = req.body.subject;
        const tutorImages = req.files.map(file => ({
            url: file.path,
            filename: file.filename
        }));

        console.log("MBUSO", tutorImages);

        console.log('Original Tutor:', tutor);

        if (tutorImages.length > 0) {
            tutor.image.push(...tutorImages);
        }

        tutor.name = tutorName;
        tutor.subject = tutorSubject;

        const updatedTutor = await tutor.save();

        console.log('Updated Tutor:', updatedTutor);

        res.redirect(`/tutors/${updatedTutor._id}`);
    } catch (error) {
        console.error(error);
        res.render('error');
    }
});

router.post('/tutors/:id', async (req, res) => {
    try {
        const deletedTutor = await Tutor.findByIdAndDelete(req.params.id);
        if (!deletedTutor) {
            return res.status(404).send('Tutor not found');
        }

        res.redirect('/tutors');
    } catch (error) {
        console.error('Error in delete route:', error);
        res.render('error');
    }
});


// ...

router.get('/apply-lesson/:tutorId', async (req, res) => {
    try {
        const tutor = await Tutor.findById(req.params.tutorId);

        if (!tutor) {
            console.log('Tutor not found for ID:', req.params.tutorId);
            res.render('error', { error: 'Tutor not found' });
            return;
        }

        res.render('apply-lesson', { pageTitle: 'Apply for Lesson', tutor });
    } catch (error) {
        console.error(error);
        res.render('error', { error: 'An unexpected error occurred. Please try again later.' });
    }
});


// ...

// Lesson Submission Route
// Lesson Application Form Submission Route (POST)
// ...

// Lesson Submission Route
// Lesson Submission Route
// Lesson Submission Route
router.post('/apply-lesson/:tutorId', async (req, res) => {
    try {
        const { date, time, duration } = req.body;
        const tutorId = req.params.tutorId;
        const currentUser = getCurrentUser(req);

        if (!currentUser) {
            req.flash('error', 'Authentication required.');
            return res.redirect('/login');
        }

        // Create a new Lesson instance with the required fields
        const newLesson = new Lesson({
            tutor: tutorId,
            parent: currentUser._id, // Assuming currentUser is the user object
            date: new Date(date),
            time: time,
            duration: duration,
            // Add other fields as needed
        });

        // Save the new lesson to the database
        const savedLesson = await newLesson.save();

        // Create a corresponding Booking record
        const newBooking = new Booking({
            tutor: tutorId,
            parent: currentUser._id,
            date: savedLesson.date,
            // Add other fields as needed
        });

        // Save the new booking to the database
        await newBooking.save();

        req.flash('success', 'Lesson application successful!');
        res.redirect('/thankyou?lessonId=' + savedLesson._id);

    } catch (error) {
        console.error(error);
        req.flash('error', 'An unexpected error occurred. Please try again later.');
        res.render('error');
    }
});


// ...




// User Bookings Route
router.get('/bookings', ensureAuthenticated, async (req, res) => {
    try {
        const currentUser = getCurrentUser(req);

        if (!currentUser) {
            req.flash('error', 'Authentication required.');
            return res.redirect('/login');
        }

        // Retrieve bookings for the current user
        const bookings = await Booking.find({ parent: currentUser._id })
            .populate('tutor') // Populate the tutor information if needed
            .sort({ date: 'asc' });

        res.render('bookings', { pageTitle: 'My Bookings', bookings });
    } catch (error) {
        console.error(error);
        req.flash('error', 'An unexpected error occurred. Please try again later.');
        res.render('error');
    }
});
// ...
// Thank You Route
router.get('/thank-you', (req, res) => {
    const lessonId = req.query.lessonId;
    // res.render('thank-you', { pageTitle: 'Thank You', lessonId });
    res.redirect('/thank-you?lessonId=' + savedLesson._id);

});




router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.render('Authi/logout');
    });
});

module.exports = router;