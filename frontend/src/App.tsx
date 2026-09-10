import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import MeetFlow from "@/pages/MeetFlow";
import Leaderboard from "@/pages/Leaderboard";
import LiveScoreBoard from "@/pages/LiveScoreBoard";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/meet-flow" element={<MeetFlow />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/live-scoreboard" element={<LiveScoreBoard />} />
    </Routes>
  );
}
