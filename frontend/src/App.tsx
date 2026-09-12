import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import MeetFlow from "@/pages/MeetFlow";
import Leaderboard from "@/pages/Leaderboard";
import LiveScoreBoard from "@/pages/LiveScoreBoard";
import Records from "@/pages/Records";
import { trackEvent } from "@/lib/analytics";

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const screen = location.pathname === "/" ? "nominations" : location.pathname.replace(/^\//, "").replaceAll("/", "_");
    trackEvent("screen_view", { screen });
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/meet-flow" element={<MeetFlow />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/live-scoreboard" element={<LiveScoreBoard />} />
        <Route path="/records" element={<Records />} />
      </Routes>
    </>
  );
}
