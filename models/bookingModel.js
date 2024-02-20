// models/bookingModel.js
const mongoose = require('mongoose');

// Check if the model is already defined
if (mongoose.models.Booking) {
    module.exports = mongoose.models.Booking;
} else {
    // Define the Booking model
    const bookingSchema = new mongoose.Schema({
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
        // Add other fields as needed
    });

    const Booking = mongoose.model('Booking', bookingSchema);

    module.exports = Booking;
}
