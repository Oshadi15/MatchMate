import './App.css';

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HelpBoard from "./components/campus_assistant/helpBoard";
import CreateHelpRequest from "./components/campus_assistant/createHelpRequest";

// ✅ Admin Dashboard
import AdminDashboard from "./components/AdminDashBoard/AdminDashBoard";

// ✅ Home component (adjust path if needed)
import Home from "./components/HomePage/Home";

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 15, display: "flex", gap: 15 }}>
        <Link to="/">Home</Link>
        <Link to="/help">Help Board</Link>
        <Link to="/create">Create Help Request</Link>
        <Link to="/admin">Admin Dashboard</Link>
      </div>

      <Routes>
        {/* ✅ Home route */}
        <Route path="/" element={<Home />} />

        {/* Updated help route */}
        <Route path="/help" element={<HelpBoard />} />

        <Route path="/create" element={<CreateHelpRequest />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;