import express from 'express';
import { Project } from '../models/Project.js';

export const router = express.Router();

/*
  GET /
  - Most recent entry
  - Table of all entries
  - Create form
*/
// GALLERY PAGE: Show all projects
router.get('/', async (req, res, next) => {
  try {
    // 1. Get the sorted category from the URL
    const selectedCategory = req.query.category || 'all';

    // 2. Build the filter object for MongoDB
    let filter = {};
    if (selectedCategory !== 'all') {
      filter.category = selectedCategory;
    }

    // 3. Fetch only the projects we want, sorted alphabetically
    const projects = await Project.find(filter).sort({ projectName: 1 });

    // 4. Send the data to EJS to render the page
    res.render('index', { 
      title: "Westridge Service Fair", 
      projects, 
      currentCategory: selectedCategory 
    });

  } 
  catch (err) { 
    next(err); 
  }
});

// Zoom-in page: Show the details of one specific project
router.get('/project/:id', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    res.render('details', { project }); 
  } catch (err) { next(err); }
});

// CREATE: Handle form submission to add a new project
router.post('/add-project', async (req, res, next) => {
  try {
    const { projectName, category, description, image, semester } = req.body;
    await Project.create({ projectName, category, description, image, semester });
    res.redirect('/');
  } catch (err) { next(err); }
});

// CHECK-IN: Handle form submission to log attendance for a project
router.post('/checkin', async (req, res) => {
  try {
    const { projectId, studentName } = req.body;

    // Push the object matching your new model structure
    await Project.findByIdAndUpdate(projectId, {
      $push: { 
        attendance: { studentName: studentName } 
      }
    });

    res.redirect(`/project/${projectId}`);
  } catch (err) {
    next(err);
  }
});
router.get('/seed-database', async (req, res) => {
  try {
    // Define the data
    const seedProjects = [
      {
        projectName: "Reading Partners at Madison Elementary",
        category: "quality-education",
        description: "Weekly literacy tutoring for 2nd and 3rd grade students.",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
        semester: "Fall 2025",
        attendance: []
      },
      {
        projectName: "Westridge Community Garden Expansion",
        category: "cap",
        description: "A CAP project focused on native species and composting.",
        image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800",
        semester: "Spring 2026",
        attendance: []
      },
      {
        projectName: "Ocean Plastic Awareness",
        category: "cts",
        description: "A CTS journey focused on beach cleanups and education.",
        image: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800",
        semester: "Fall 2025",
        attendance: []
      }
    ];

    // Clear old data
    await Project.deleteMany({}); 
    
    // Insert the data
    await Project.insertMany(seedProjects);
    
    res.send("<h1>Success!</h1><p>Database seeded. <a href='/'>Go to Gallery</a></p>");
  } catch (err) {
    res.status(500).send("Error seeding database: " + err.message);
  }
});