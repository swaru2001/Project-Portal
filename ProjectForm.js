import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const ProjectForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    taskList: [{ task: '' }],
    userId: '',
    password: '',
    assignDate: '',
    dueDate: '',
    startDate: '',
    endDate: ''
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleButtonClick = () => {
    navigate('/project-titles');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleTaskChange = (e, index) => {
    const { value } = e.target;
    setFormData((prevData) => {
      const newTaskList = [...prevData.taskList];
      newTaskList[index].task = value;
      return { ...prevData, taskList: newTaskList };
    });
  };

  const handleTaskAddition = () => {
    setFormData((prevData) => ({
      ...prevData,
      taskList: [...prevData.taskList, { task: '' }]
    }));
  };

  const handleTaskDeletion = (index) => {
    setFormData((prevData) => {
      const newTaskList = [...prevData.taskList];
      newTaskList.splice(index, 1);
      return { ...prevData, taskList: newTaskList };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8082/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data);
      navigate('/project-titles');
    } catch (error) {
      console.error('Fetch error:', error);
      alert('An error occurred while creating the project. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      <div className="header">
        <h2>Project Form</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title:</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required />
        </div>
        <div className="form-groups">
          <label>Task List:</label>
          {formData.taskList.map((task, index) => (
            <div key={index} className="task-item">
              <input
                type="text"
                value={task.task}
                onChange={(e) => handleTaskChange(e, index)}
                required
              />
              <button type="button" onClick={() => handleTaskDeletion(index)}>Delete</button>
            </div>
          ))}
          <button type="button" onClick={handleTaskAddition}>Add Task</button>
        </div>
        <div className="form-group">
          <label>User ID:</label>
          <input type="text" name="userId" value={formData.userId} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Assign Date:</label>
          <input type="date" name="assignDate" value={formData.assignDate} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Due Date:</label>
          <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Starting Date:</label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>End Date:</label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
        </div>
        <button type="submit">Submit</button>
        <button type="button" onClick={handleButtonClick}>View Project Titles</button>
      </form>
    </div>
  );
};

export default ProjectForm;
