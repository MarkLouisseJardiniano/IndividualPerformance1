// Import required modules
const express = require('express');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;

// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mongo-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


const courseSchema = new mongoose.Schema({
    code: String,
    description: String,
    units: Number,
    tags: [String]
});


const Course = mongoose.model('Course', courseSchema);

// Middleware
app.use(express.json());

app.get('/courses', async (req, res) => {
    try {
        // Retrieve all courses from the database
        const allCourses = await Course.find();

        // Combine all courses into a single array
        const CoursesArray = allCourses.reduce((acc, curr) => {
            return acc.concat(Object.values(curr.toObject()).filter(Array.isArray).flat());
        }, []);

        // Sort the combined array alphabetically by description
        CoursesArray.sort((a, b) => a.description.localeCompare(b.description));

        // Send the sorted courses in the response
        res.send(CoursesArray);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// Route to get courses by query using BSIS or BSIT
app.get('/courses/:query', async (req, res) => {
    const query = req.params.query.toUpperCase();

    // Validate the query parameter
    if (query !== 'BSIS' && query !== 'BSIT') {
        return res.status(400).send('Invalid Course. Please provide BSIS or BSIT.');
    }

    try {
        const allCourses = await Course.find();

        // Combine all courses into a single array
        const coursesArray = allCourses.reduce((acc, curr) => {
            return acc.concat(Object.values(curr.toObject()).filter(Array.isArray).flat());
        }, []);

        // To filter courses based on the query
        const filteredCourses = coursesArray.filter(course =>
            course.tags.includes(query) &&
            (course.tags.includes('BSIS') || course.tags.includes('BSIT'))
        );

        // For Extracting the name and specialization(description) of each course
        const coursesExtract = filteredCourses.map(course => ({
            name: course.code,
            specialization: course.description
        }));

        res.send(coursesExtract);
    } catch (err) {
        res.status(500).send(err.message);
    }
});




// Start server
app.listen(PORT, async () => {
    try {
        console.log(`Server is running on port ${PORT}`);
    } catch (err) {
        console.error('Error populating initial data:', err);
    }
});

