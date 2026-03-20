
import './App.css';

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HelpBoard from "./components/campus_assistant/helpBoard";
import CreateHelpRequest from "./components/campus_assistant/createHelpRequest";

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 15, display: "flex", gap: 15 }}>
        <Link to="/">Help Board</Link>
        <Link to="/create">Create Help Request</Link>
      </div>

      <Routes>
        <Route path="/" element={<HelpBoard />} />
        <Route path="/create" element={<CreateHelpRequest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;