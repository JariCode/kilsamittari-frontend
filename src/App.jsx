import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DiaryPage from './pages/DiaryPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminPage from './pages/AdminPage.jsx';

function App() {
  return (
    <Routes>
      {/* Etusivu, ei kirjautumista vaadita */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/rekisteroidy" element={<RegisterPage />} />
      <Route path="/kirjaudu" element={<LoginPage />} />

      {/* Päiväkirja vaatii kirjautumisen */}
      <Route
        path="/paivakirja"
        element={
          <ProtectedRoute>
            <DiaryPage />
          </ProtectedRoute>
        }
      />
      {/* Profiilisivu vaatii kirjautumisen */}
      <Route
        path="/profiili"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      {/* Admin-sivu vaatii kirjautumisen sekä admin-oikeudet */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;