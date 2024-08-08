import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [originalDetails, setOriginalDetails] = useState(null);
  const role = localStorage.getItem('role') || '';  

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8082/projects/${projectId}`);
        setProjectDetails(response.data);
        setOriginalDetails(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!projectDetails) {
    return <p>No project details found</p>;
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`http://localhost:8082/projects/${projectId}`, projectDetails);
      if (response.status === 200) {
        setIsEditing(false);
        setOriginalDetails(projectDetails);
      } else {
        throw new Error('Error saving changes');
      }
    } catch (error) {
      console.error('Error saving project details:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProjectDetails(originalDetails);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value
    }));
  };

  return (
    <div className="project-details-container">
      <h1>Project Details</h1>
      <table className="project-details-table">
        <tbody>
          <tr>
            <td>Title:</td>
            <td>
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  value={projectDetails.title}
                  onChange={handleChange}
                />
              ) : (
                projectDetails.title
              )}
            </td>
          </tr>
          <tr>
            <td>Description:</td>
            <td>
              {isEditing ? (
                <textarea
                  name="description"
                  value={projectDetails.description}
                  onChange={handleChange}
                />
              ) : (
                projectDetails.description
              )}
            </td>
          </tr>
          <tr>
            <td>Task List:</td>
            <td>
              <ul>
                {projectDetails.taskList.map((task, index) => (
                  <li key={index}>
                    {isEditing ? (
                      <input
                        type="text"
                        name={`taskList_${index}`}
                        value={task.task}
                        onChange={(e) => {
                          const newTaskList = [...projectDetails.taskList];
                          newTaskList[index].task = e.target.value;
                          setProjectDetails((prevDetails) => ({
                            ...prevDetails,
                            taskList: newTaskList
                          }));
                        }}
                      />
                    ) : (
                      task.task
                    )}
                  </li>
                ))}
              </ul>
            </td>
          </tr>
          <tr>
            <td>User ID:</td>
            <td>{projectDetails.userId}</td>
          </tr>
          <tr>
            <td>Assign Date:</td>
            <td>{isEditing ? <input type="date" name="assignDate" value={projectDetails.assignDate} onChange={handleChange} /> : new Date(projectDetails.assignDate).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td>Due Date:</td>
            <td>{isEditing ? <input type="date" name="dueDate" value={projectDetails.dueDate} onChange={handleChange} /> : new Date(projectDetails.dueDate).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td>Start Date:</td>
            <td>{isEditing ? <input type="date" name="startDate" value={projectDetails.startDate} onChange={handleChange} /> : new Date(projectDetails.startDate).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td>End Date:</td>
            <td>{isEditing ? <input type="date" name="endDate" value={projectDetails.endDate} onChange={handleChange} /> : new Date(projectDetails.endDate).toLocaleDateString()}</td>
          </tr>
        </tbody>
      </table>
      {(['admin', 'manager'].includes(role) && !isEditing) && (
        <button className="edit-button" onClick={handleEdit}>Edit</button>
      )}
      {isEditing ? (
        <div>
          <button className="save-button" onClick={handleSave}>Save</button>
          <button className="cancel-button" onClick={handleCancel}>Cancel</button>
        </div>
      ) : null}
    </div>
  );
};

export default ProjectDetails;
