const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const Tutor = require('../models/tutorModel');
const User = require('../models/userModel');

mongoose.connect("mongodb+srv://websiteclient:K8K1iBAOzjSMnnIl@cluster0.f7diq.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedDB = async () => {
  try {
    // Find a user (author) to associate with the tutor
    const author = await User.findOne({ /* your user query */ });

    // Create a tutor with the associated author and specific Cloudinary image
    const tutor = new Tutor({
      name: 'Visit the stellenbosch',
      subject: 'physics',
      price: 50,
      image: [{
        url: 'https://res.cloudinary.com/darf17drw/image/upload/v1706442478/Tutors/mwidmwtrjajlfxs5ct6r.png',
        filename: 'Tutors/mwidmwtrjajlfxs5ct6r',
        _id: new ObjectId('65b63eef1576683ae7c79760')
      }],
      author: author._id
    });

    // Save the tutor to the database
    await tutor.save();

    // Query the tutor with the populated author
    const populatedTutor = await Tutor.findById(tutor._id).populate('author');

    // Access and console log author information
    console.log('Author found:', populatedTutor.author);

    console.log('Seed successful!');
  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

seedDB();
