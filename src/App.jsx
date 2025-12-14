import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Subjects from './pages/Subjects';
import SubjectView from './pages/SubjectView';
// import PDFView from './pages/PDFView';
import PDFView from './pages/PDFView';
import Favorites from './pages/Favorites';
import Recent from './pages/Recent';
import SearchResults from './pages/SearchResults';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/subjects" element={<Subjects />} />
                    <Route path="/subject/:id" element={<SubjectView />} />
                    <Route path="/view/:id" element={<PDFView />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/recent" element={<Recent />} />
                    <Route path="/search" element={<SearchResults />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
