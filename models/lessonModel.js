const mongoose = require('mongoose');

// Check if the model is already defined
if (mongoose.models.Lesson) {
    module.exports = mongoose.models.Lesson;
} else {
    // Define the Lesson model
    const lessonSchema = new mongoose.Schema({
        tutor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tutor', // Replace with the actual name of your Tutor model
            required: true,
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Replace with the actual name of your User model
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
            min: [1, 'Duration must be at least 1 minute'], // Assuming lessons cannot have a duration less than 1
        },
    });

    const Lesson = mongoose.model('Lesson', lessonSchema);

    module.exports = Lesson;
}
