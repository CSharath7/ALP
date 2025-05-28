import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";

import HomePage from "./pages/Home";
import ChildLogin from "./pages/ChildLogin";
import ChildRegister from "./pages/ChildRegister";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import AdminPanel from "./pages/Admin";
import Profile from "./pages/Profile";
import Games from "./pages/Games";
import Navbar from "./components/Navbar";
import ResetPassword from "./pages/ResetPassword";
import Math from "./pages/Math";
import Pattern from "./pages/Pattern";
import Memory from "./pages/Memory";
import LiveFeed from "./pages/LiveFeed"
import WordWizard from "./pages/WordWizard";
import RoleBasedDashboard from "./pages/RoleDashBoard"
import TherapistDetails from './pages/TherapistDetails';

// ProtectedRoute component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

// Layout with conditional Navbar and routes
function Layout() {
  const token = localStorage.getItem("token");
  const location = useLocation();

  const hideNavbarRoutes = ["/", "/login", "/signup"];
  const showNavbar = token && !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
      
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/Childlogin" element={<ChildLogin />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Routes */}
        <Route
          path="/admin"
          element={<AdminPanel />
            // <ProtectedRoute>
            //   <AdminPanel />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/ChildRegister"
          element={
            <ProtectedRoute>
              <ChildRegister/>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/livefeed"
          element={
            <ProtectedRoute>
              <LiveFeed />
            </ProtectedRoute>
          }
        />

        <Route
          path="/math"
          element={
            <ProtectedRoute>
              <Math />
            </ProtectedRoute>
          }
        />
        <Route
          path="/memory"
          element={
            <ProtectedRoute>
              <Memory />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/wordwizard"
          element={
            <ProtectedRoute>
              <WordWizard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/pattern"
          element={
            <ProtectedRoute>
              <Pattern />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<RoleBasedDashboard />} />

        <Route
          path="/reset-password"
          element={
            <ProtectedRoute>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games"
          element={
            <ProtectedRoute>
              <Games />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/therapist/:id" 
          element={
            <ProtectedRoute>
              <TherapistDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;