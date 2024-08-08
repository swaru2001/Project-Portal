const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const port = 8082;

app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(bodyParser.json());



mongoose.connect('mongodb://localhost:27017/projectDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },

});

const User = mongoose.model('User', userSchema);

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  taskList: [{ task: String }],
  userId: { type: String, required: true },
  assignDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum:['complete', 'ongoing','pending',], default: 'ongoing'}
});

const Project = mongoose.model('Project', projectSchema);


app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    
    if (!email || !password) {
      return res.status(400).json({ message: 'Username/email and password are required' });
    }
    const user = await User.findOne({ $or: [{ email }, { username: email }] });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.status(200).json({ role: user.role });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password, confirmPassword, role } = req.body;

    if (!username || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
      });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    if (role !== 'admin' && role !== 'manager' && role !== 'intern' && role !== 'employee') {
      return res.status(400).json({ message: 'Invalid role specified' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.post('/demo', async (req, res) => {
  try {
    const { title, description, taskList, userId, assignDate, dueDate, startDate, endDate, status } = req.body;
    const existingProject = await Project.findOne({ title, userId });
    
    if (existingProject) {
      return res.status(409).json({ message: 'Project title already exists for this user' });
    }
    const newProject = new Project({
      title,
      description,
      taskList,
      userId,
      assignDate,
      dueDate,
      startDate,
      endDate,
      status
    });

    await newProject.save();
    res.status(201).json({ message: 'Project created successfully', project: newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/project-titles', async (req, res) => {
  try {
    const titles = await Project.find({}, 'title assignDate endDate status');
    res.status(200).json(titles);
  } catch (err) {
    console.error('Error fetching project titles:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/projects/:projectId', async (req, res) => {
  const projectId = req.params.projectId;
  try {
    const projectDetails = await Project.findById(projectId);
    if (!projectDetails) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(200).json(projectDetails);
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/project-titles', async (req, res) => {
  const { titles } = req.body;
  try {
    const updatePromises = titles.map(({ _id, title, status }) =>
      Project.findByIdAndUpdate(_id, { title, status}, { new: true })
    );
    await Promise.all(updatePromises);
    res.status(200).json({ message: 'Titles updated successfully' });
  } catch (error) {
    console.error('Error updating project titles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/projects/:projectId', async (req, res) => {
  const projectId = req.params.projectId;
  const updateData = req.body;
  try {
    const updatedProject = await Project.findByIdAndUpdate(projectId, updateData, { new: true });
    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error updating project details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
