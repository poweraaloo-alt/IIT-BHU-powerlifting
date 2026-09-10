import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import MeetFlow from "@/pages/MeetFlow";
import Leaderboard from "@/pages/Leaderboard";
import LiveScoreBoard from "@/pages/LiveScoreBoard";
import { trackEvent } from "@/lib/analytics";

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const screen = location.pathname === "/" ? "nominations" : location.pathname.replace(/^\//, "").replaceAll("/", "_");
    trackEvent("screen_view", { screen });
  }, [location.pathname]);

  return null;
}

// One <Route> per page in src/pages; HashRouter already wraps this in main.tsx.
export default function App() {
  return (
    <>
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/meet-flow" element={<MeetFlow />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/live-scoreboard" element={<LiveScoreBoard />} />
      </Routes>
    </>
  );
}
