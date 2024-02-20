const express = require('express');
const router = express.Router();
const Lesson = require('../models/lessonModel');

// Handle POST request to create a new lesson
router.post('/lessons/create', async (req, res) => {
    try {
        // Assuming tutorId and userId are obtained from the request or session
        const tutorId = req.body.tutorId;  // Replace with the actual way you get tutorId
        const userId = req.user._id;  // Replace with the actual way you get userId

        // Create a new Lesson instance
        const newLesson = new Lesson({
            tutor: tutorId,
            parent: userId,
            date: new Date(),
            time: "10:00 AM",  // Replace with the actual time
            duration: 1,  // Replace with the actual duration
        });

        // Save the new lesson to the database
        await newLesson.save();

        // Redirect or send a response indicating success
        res.status(201).json({ message: 'Lesson created successfully' });
    } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(500).json({ error: 'Unexpected error occurred' });
    }
});

module.exports = router;
