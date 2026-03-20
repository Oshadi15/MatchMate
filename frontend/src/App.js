import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";
import HelpBoard from "./components/campus_assistant/helpBoard";
import CreateHelpRequest from "./components/campus_assistant/createHelpRequest";
import FoundForm from './components/Lost-Found_MS/FoundForm';
import LostForm from './components/Lost-Found_MS/LostForm';
import ReportSelection from './components/Lost-Found_MS/Report';
import MyRequests from "./components/campus_assistant/myRequests";
import SmartAssistantHome from "./components/campus_assistant/smartAssistantHome";


// Admin Dashboard
import AdminDashboard from "./components/AdminDashBoard/AdminDashBoard";

// Home
import Home from "./components/HomePage/Home";

// ✅ Student Signup
import StudentSignup from "./components/UserManagement/StudentSignup";

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 15, display: "flex", gap: 15 }}>
        <Link to="/">Home</Link>
        <Link to="/help">Help Board</Link>
        <Link to="/create">Create Help Request</Link>
        <Link to="/signup">Student Signup</Link>
        <Link to="/admin">Admin Dashboard</Link>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/help" element={<HelpBoard />} />
        <Route path="/create" element={<CreateHelpRequest />} />

        {/* ✅ Student Signup Route */}
        <Route path="/signup" element={<StudentSignup />} />

        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/campus-assistant" element={<SmartAssistantHome />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path='/found' element={<FoundForm/>} />
         <Route path='/lost' element={<LostForm/>} />
         <Route path='/report' element={<ReportSelection/>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;