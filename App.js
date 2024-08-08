import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProjectForm from './ProjectForm';
import ProjectTitles from './ProjectTitles';
import Login from './login';
import Signup from './Signup';
import ProjectDetails from './ProjectDetails';

const App = () => {
  const [authenticated, setAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const role = localStorage.getItem('role');
    if (role) {
      setAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setAuthenticated={setAuthenticated} />} />
        <Route path="/signup" element={<Signup />} />
        {authenticated ? (
          <>
            <Route path="/projects" element={<ProjectForm />} />
            <Route path="/project-titles" element={<ProjectTitles />} />
            <Route path="/projects/:projectId" element={<ProjectDetails />} />
            <Route path="/" element={<Navigate to="/project-titles" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
