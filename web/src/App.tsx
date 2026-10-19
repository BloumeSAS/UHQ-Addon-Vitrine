import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Admin from './pages/Admin';

/**
 * Routes :
 *   /       → vitrine PUBLIQUE (aucune connexion requise)
 *   /admin  → réglages de la vitrine (admin du panel, jeton transmis par le panel)
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
