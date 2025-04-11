import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/Home";
import ChildLogin from "./pages/ChildLogin";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import AdminPanel from "./pages/Admin";
import ProtectedRoute from "./pages/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Games from "./pages/Games";
import Navbar from "./components/Navbar";
import ResetPassword from "./pages/ResetPassword";
import Math from "./pages/Math";
import Story from "./pages/Story";
import Pattern from "./pages/Pattern";
import Memory from "./pages/Memory";
import SpellBee from "./pages/SpellBee";
import WordWizard from "./pages/WordWizard";
import WordDetective from "./pages/WordDetective";
import SoundMatch from "./pages/SoundMatch";
import MemoryMatrix from "./pages/MemoryMatrix";
function Layout() {
  const token = localStorage.getItem("token");
  const location = useLocation(); // Get the current route

  // Hide Navbar on these routes
  const hideNavbarRoutes = ["/", "/login", "/signup"];
  const showNavbar = token && !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/child" element={<ChildLogin />} />

        {/* Protected Routes */}
  
          <Route path="/math" element={<Math />} />
          <Route path="/Memory" element={<Memory />} />
          <Route path="/SpellBee" element={<SpellBee />} />
          <Route path="/WordWizard" element={<WordWizard />} />
          <Route path="/WordDetective" element={<WordDetective />} />
          <Route path="/MemoryMatrix" element={<MemoryMatrix />} />
          <Route path="/SoundMatch" element={<SoundMatch />} />
          <Route path="/story" element={<Story />} />
          <Route path="/pattern" element={<Pattern />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/games" element={<Games />} />
        
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;