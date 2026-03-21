import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

// Components
import FoundForm from './components/Lost-Found_MS/FoundForm';
import LostForm from './components/Lost-Found_MS/LostForm';
import BrowseItems from './components/Lost-Found_MS/BrowseItems';
import ReportSelection from './components/Lost-Found_MS/Report';
import Home from "./components/HomePage/Home";
import HelpBoard from "./components/campus_assistant/helpBoard";
import CreateHelpRequest from "./components/campus_assistant/createHelpRequest";
import MyRequests from "./components/campus_assistant/myRequests";
import SmartAssistantHome from "./components/campus_assistant/smartAssistantHome";
// import BrowseItems from './components/Lost-Found_MS/BrowseItems';
import ReplyHelpRequest from "./components/campus_assistant/replyHelpRequest";




// Admin Dashboard
import AdminDashboard from "./components/AdminDashBoard/AdminDashBoard";
import StudentSignup from "./components/UserManagement/StudentSignup";

function App() {
  const [refreshFlag, setRefreshFlag] = useState(false);

  // This function will be called by forms after successful submit
  const handleFormSubmit = () => setRefreshFlag(!refreshFlag);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/help" element={<HelpBoard />} />
        <Route path="/create" element={<CreateHelpRequest />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/campus-assistant" element={<SmartAssistantHome />} />
        <Route path="/help/reply/:id" element={<ReplyHelpRequest />} />
        
      
        <Route path="/signup" element={<StudentSignup />} />
        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/found" element={<FoundForm onSubmitSuccess={handleFormSubmit} />} />
        <Route path="/lost" element={<LostForm onSubmitSuccess={handleFormSubmit} />} />
        <Route path="/report" element={<ReportSelection />} />
        <Route path="/browseitems" element={<BrowseItems refreshFlag={refreshFlag} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;