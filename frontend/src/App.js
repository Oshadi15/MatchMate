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
import MyHelpRequests from "./components/campus_assistant/myHelpRequest";

// import BrowseItems from './components/Lost-Found_MS/BrowseItems';
import ReplyHelpRequest from "./components/campus_assistant/replyHelpRequest";
import ManageLocation from "./components/campus_assistant/manageLocation";
import LocationFinder from "./components/campus_assistant/locationFinder";

import AdminLogin from "./components/AdminLogin/AdminLogin";
import Userlogin from "./components/Userlogin/Userlogin";

import AdminBrowse from "./components/Lost-Found_MS/AdminBrowse";

import UserDashboard from "./components/userDashboard/userDashboard";


// Admin Dashboard
import AdminDashboard from "./components/AdminDashBoard/AdminDashBoard";
import StudentSignup from "./components/UserManagement/StudentSignup";
import LostFoundManagement from "./components/AdminDashBoard/LostFoundManagement";
import FeedbackInsert from "./components/FeedbackInsert/FeedbackInsert";
import FeedbackDisplay from "./components/FeedbackDisplay/FeedbackDisplay";
import UserMatches from "./components/Smart_Matching/UserMatches";
import AdminMatchPanel from "./components/Smart_Matching/AdminMatchPanel";
import Logout from "./components/Logout/Logout";
import AdminAnalysis from "./components/AdminDashBoard/AdminAnalysis";


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
        <Route path="/manage-location" element={<Layout><ManageLocation /></Layout>} />
        <Route path="/location-finder" element={<Layout><LocationFinder /></Layout>} />
        <Route path="/my-help-requests" element={<MyHelpRequests />} />
        
      
        <Route path="/signup" element={<StudentSignup />} />
        <Route path="/login" element={<Userlogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/analysis" element={<AdminAnalysis />} />
        {/* <Route path='/found' element={<FoundForm/>} />
         <Route path='/lost' element={<LostForm/>} />
         <Route path='/report' element={<ReportSelection/>} /> */}
         <Route path="/adminlogin" element={<AdminLogin />} />
         <Route path="/admin/lostfound" element={<LostFoundManagement />} />

        <Route path="/found" element={<Layout><FoundForm onSubmitSuccess={handleFormSubmit} /></Layout>} />
        <Route path="/lost" element={<Layout><LostForm onSubmitSuccess={handleFormSubmit} /></Layout>} />
        <Route path="/report" element={<Layout><ReportSelection /> </Layout>} />
        <Route path="/browseitems" element={<Layout><BrowseItems refreshFlag={refreshFlag} /></Layout>} />
        <Route path="/feedback" element={<Layout><FeedbackInsert /></Layout>} />
        <Route path="/admin/feedback" element={<FeedbackDisplay />} />
        <Route path="/dashboard" element={<Layout><UserDashboard /></Layout>} />
        <Route path="/adminbrowse" element={<AdminBrowse />} />
         <Route path='/usermatches' element={<Layout><UserMatches/></Layout>} />
        <Route path='/adminmatches' element={<AdminMatchPanel/>} />
        <Route path="/logout" element={<Logout />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;