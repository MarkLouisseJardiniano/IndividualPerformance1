// Import required modules
const express = require('express');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;

const courses = require('./courses.json');
// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mongo-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
//Middleware
app.use(express.json());

// Define the route to get all courses
app.get('/courses', (req, res) => {
    if (req.query.sortBy && req.query.sortBy !== 'description') {
        return res.status(400).send('Invalid sortBy parameter the value only allowed is description');
    }
    // Concatenate all courses from all years into a single array
    const allSubjects = [].concat(...courses.map(years => Object.values(years)).flat());

    // Sort courses by their descriptions if sortBy is provided and valid
    if (req.query.sortBy) {
        allSubjects.sort((a, b) => {
            if (a.description < b.description) return -1;
            if (a.description > b.description) return 1;
            return 0;
        });
    }
    // Send subjects in response
    res.send(allSubjects);
});

app.get('/courses/:query', (req, res) => {
    const query = req.params.query;
    // Flatten the courses array to get all subjects
    const allSubjects = [].concat(...courses.map(years => 
        Object.values(years)).flat());
    
    // Filter courses based on the query
    const filteredCourses = allSubjects.filter(course => 
        course.tags.includes(query) || 
        course.description.includes(query) || 
        course.units === parseInt(query));

    // Send the filtered courses in the response
    if (!filteredCourses.length){
        return res.status(404).send('No courses found');
    }
    res.send(filteredCourses);
});

// Start server
app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});
