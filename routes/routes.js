import express from 'express';
import { Project } from '../models/Project.js';

export const router = express.Router();


// GALLERY PAGE: Show all projects
router.get('/', async (req, res, next) => {
  try {
    const selected = req.query.category || 'all';

    const filter = {};
    if (selected !== 'all') {
      if (selected === 'cts' || selected === 'cap') {
        filter.program = selected;   // CTS/CAP selection
      } else {
        filter.goal = selected;      // UN goal selection
      }
    }

    const projects = await Project.find(filter).sort({ projectName: 1 });

    res.render('index', {
      title: "Westridge Service Fair",
      projects,
      currentCategory: selected
    });
  } catch (err) {
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
    const { projectName, presenterName, program, goal, description, image, semester } = req.body;

    await Project.create({ projectName, presenterName, program, goal, description, image, semester });

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
        presenterName: "Alice Johnson",
        program: "cap",
        goal: "quality-education",
        description: "Weekly literacy tutoring for 2nd and 3rd grade students. A CAP project focused on closing the reading gap in our local community.",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
        semester: "Fall 2025",
        attendance: []
      },
      {
        projectName: "Westridge Community Garden Expansion",
        presenterName: "Mary Smith",
        program: "cap",
        goal: "sustainable-cities",
        description: "A CAP project focused on native species and composting. This project aims to enhance biodiversity and promote sustainable gardening practices.",
        image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800",
        semester: "Spring 2026",
        attendance: []
      },
      {
        projectName: "Ocean Plastic Awareness",
        presenterName: "Bobby Brown",
        program: "cts",
        goal: "life-below-water",
        description: "A CTS journey focused on beach cleanups and education. This project aims to raise awareness about ocean plastic pollution and its impact on marine life.",
        image: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800",
        semester: "Fall 2025",
        attendance: []
      }
    ];

    // Clear old data
    await Project.deleteMany({}); 

    // Insert the new data
    await Project.insertMany(seedProjects);
    
    res.send("<h1>Success!</h1><p>Database seeded. <a href='/'>Go to Gallery</a></p>");
  } catch (err) {
    res.status(500).send("Error seeding database: " + err.message);
  }
});
// Search functionality
router.get("/search", async (req, res, next) => {
  try {
    const q = (req.query.search || "").trim();

    const filter = q
      ? {
          $or: [
            { projectName: { $regex: q, $options: "i" } },
            { presenterName: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const projects = await Project.find(filter).sort({ projectName: 1 });

    res.render("index", {
      title: "Westridge Service Fair",
      projects,
      currentCategory: "all", // IMPORTANT: index.ejs expects this
      q,
    });
  } catch (err) {
    next(err); // IMPORTANT: make sure your route has next
  }
});
//Add a St. John route that lists all of the attendance in a table
router.post("/attendance", async(req, res) =>{
  try{
    const projects = await Project.find({});
    res.render('attendance', { projects });
  }
  catch(err){
    next(err);
  }
})

  
