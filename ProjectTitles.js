import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import axios from 'axios';
import './index.css';

const ProjectTitles = () => {
  const [titles, setTitles] = useState([]);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [originalTitles, setOriginalTitles] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const role = localStorage.getItem('role') || '';
  const navigate = useNavigate();

  useEffect(() => {
    fetchTitles();
  }, []);

  const fetchTitles = async () => {
    try {
      const response = await axios.get('http://localhost:8082/project-titles');
      if (!response.data) {
        throw new Error('Empty response received');
      }
      setTitles(response.data);
      setOriginalTitles(response.data);
      setError('');
    } catch (error) {
      setError('Error fetching titles');
      console.error('Error fetching titles:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put('http://localhost:8082/project-titles', {
        titles: titles.map((titleObj) => ({
          _id: titleObj._id,
          title: titleObj.title,
          status: titleObj.status,
          assignDate: titleObj.assignDate,
          endDate: titleObj.endDate,
        })),
      });

      if (response.status === 200) {
        setIsEditing(false);
        const updatedOriginalTitles = [...titles];
        setOriginalTitles(updatedOriginalTitles);
        console.log('Changes saved successfully!');
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      setError('Error updating titles');
      console.error('Error updating titles:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTitles(originalTitles);
    console.log('Changes reverted!');
  };

  const handleChange = (e, index) => {
    const newTitles = [...titles];
    newTitles[index] = { ...newTitles[index], [e.target.name]: e.target.value };
    setTitles(newTitles);
  };

  const handleSort = (key) => {
    const newDirection = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction: newDirection });

    const sortedTitles = [...titles].sort((a, b) => {
      if (newDirection === 'asc') {
        return a[key].localeCompare(b[key]);
      } else {
        return b[key].localeCompare(a[key]);
      }
    });

    setTitles(sortedTitles);
  };

  const handleAdd = () => {
    navigate('/projects');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="project-titles-container">
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="logo-section">
          <img src="/path/to/logo.png" alt="Company Logo" />
        </div>
        <div className="links-section">
          <ul>
            <li>
              <Link to="/dashboard">
                <span className="icon"><DashboardIcon /></span> {isCollapsed ? '' : 'Dashboard'}
              </Link>
            </li>
            <li>
              <Link to="/profile">
                <span className="icon"><PersonIcon /></span> {isCollapsed ? '' : 'Profile'}
              </Link>
            </li>
            <li>
              <Link to="/projects">
                <span className="icon"><FolderIcon /></span> {isCollapsed ? '' : 'Projects'}
              </Link>
            </li>
          </ul>
          <button onClick={toggleCollapse} className="collapse-button">
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>
      </div>
      <div className="main-content">
        <h2>Project Titles</h2>
        {!isEditing && (
          <button className="add-button" onClick={handleAdd}>
            Add Project
          </button>
        )}
        {isEditing ? (
          <div>
            <table className="edit-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Assign Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {titles.map((titleObj, index) => (
                  <tr key={titleObj._id}>
                    <td>
                      <input
                        type="text"
                        name="title"
                        value={titleObj.title}
                        onChange={(e) => handleChange(e, index)}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        name="assignDate"
                        value={formatDate(titleObj.assignDate)}
                        onChange={(e) => handleChange(e, index)}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        name="endDate"
                        value={formatDate(titleObj.endDate)}
                        onChange={(e) => handleChange(e, index)}
                      />
                    </td>
                    <td>
                      {['admin', 'manager'].includes(role) ? (
                        <select
                          name="status"
                          value={titleObj.status}
                          onChange={(e) => handleChange(e, index)}
                        >
                          <option value="Ongoing">Ongoing</option>
                          <option value="Pending">Pending</option>
                          <option value="Complete">Complete</option>
                        </select>
                      ) : (
                        <span>{titleObj.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <table className="project-titles-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('title')}>
                  Title{' '}
                  {sortConfig.key === 'title' &&
                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('assignDate')}>
                  Assign Date{' '}
                  {sortConfig.key === 'assignDate' &&
                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('endDate')}>
                  End Date{' '}
                  {sortConfig.key === 'endDate' &&
                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('status')}>
                  Status{' '}
                  {sortConfig.key === 'status' &&
                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {titles.map((titleObj) => (
                <tr key={titleObj._id}>
                  <td>
                    <Link to={`/projects/${titleObj._id}`}>{titleObj.title}</Link>
                  </td>
                  <td>{formatDate(titleObj.assignDate)}</td>
                  <td>{formatDate(titleObj.endDate)}</td>
                  <td>{titleObj.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {['admin', 'manager'].includes(role) && !isEditing && (
          <div>
            <button className="edit-button" onClick={handleEdit}>
              Edit
            </button>
          </div>
        )}
        {isEditing && (
          <div>
            <button className="save-button" onClick={handleSave}>
              Save
            </button>
            <button className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default ProjectTitles;
