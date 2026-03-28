import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Layout from "./components/common/Layout";

// Components
import FoundForm from './components/Lost-Found_MS/FoundForm';
import LostForm from './components/Lost-Found_MS/LostForm';
import BrowseItems from './components/Lost-Found_MS/BrowseItems';
import ReportSelection from './components/Lost-Found_MS/Report';
import Home from "./components/HomePage/Home";
import HelpBoard from "./components/campus_assistant/helpBoard";
import CreateHelpRequest from "./components/campus_assistant/createHelpRequest";
import SmartAssistantHome from "./components/campus_assistant/smartAssistantHome";
// import BrowseItems from './components/Lost-Found_MS/BrowseItems';
import ReplyHelpRequest from "./components/campus_assistant/replyHelpRequest";
import AdminLogin from "./components/AdminLogin/AdminLogin";


// Admin Dashboard
import AdminDashboard from "./components/AdminDashBoard/AdminDashBoard";
import StudentSignup from "./components/UserManagement/StudentSignup";
import LostFoundManagement from "./components/AdminDashBoard/LostFoundManagement";

function App() {
  const [refreshFlag, setRefreshFlag] = useState(false);

  // This function will be called by forms after successful submit
  const handleFormSubmit = () => setRefreshFlag(!refreshFlag);

  return (
    <BrowserRouter>
   
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/help" element={<Layout><HelpBoard /></Layout>} />
        <Route path="/create" element={<Layout><CreateHelpRequest /></Layout>} />
        <Route path="/campus-assistant" element={<Layout><SmartAssistantHome /></Layout>} />
        <Route path="/help/reply/:id" element={<Layout><ReplyHelpRequest /></Layout>} />
        
      
        <Route path="/signup" element={<StudentSignup />} />
        <Route path="/admin" element={<AdminDashboard />} />
        {/* <Route path='/found' element={<FoundForm/>} />
         <Route path='/lost' element={<LostForm/>} />
         <Route path='/report' element={<ReportSelection/>} /> */}
         <Route path="/adminlogin" element={<AdminLogin />} />
         <Route path="/admin/lostfound" element={<LostFoundManagement />} />

        <Route path="/found" element={<Layout><FoundForm onSubmitSuccess={handleFormSubmit} /></Layout>} />
        <Route path="/lost" element={<Layout><LostForm onSubmitSuccess={handleFormSubmit} /></Layout>} />
        <Route path="/report" element={<Layout><ReportSelection /></Layout>} />
        <Route path="/browseitems" element={<Layout><BrowseItems refreshFlag={refreshFlag} /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;