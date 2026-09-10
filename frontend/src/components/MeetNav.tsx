import { Dumbbell, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function MeetNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#1E305B]/80 bg-[#080F20]/90 backdrop-blur-md" data-testid="meet-header">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3" data-testid="home-nav-link">
          <div className="flex size-9 items-center justify-center bg-[#E63946] text-[#080F20]" data-testid="meet-mark"><Dumbbell className="size-5" /></div>
          <div>
            <p className="font-heading text-sm font-black uppercase tracking-[0.16em]">IIT BHU</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#64748B]">Powerlifting team trials</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2" data-testid="top-navigation">
          <Link to="/leaderboard" className="px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8] hover:text-white" data-testid="leaderboard-nav-link">Leaderboard</Link>
          <Link to="/live-scoreboard" className="px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8] hover:text-white" data-testid="live-scoreboard-nav-link">Live Scores</Link>
          <Link to="/" className="px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8] hover:text-white" data-testid="nominations-nav-link">Nominations</Link>
          <Link to="/meet-flow" className="border border-[#E63946]/50 bg-[#E63946]/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#FF6B73] hover:border-[#E63946] hover:bg-[#E63946]/20" data-testid="meet-flow-nav-link">Meet Flow</Link>
        </nav>
      </div>
      <div className="border-t border-[#1E305B]/70 bg-[#101B35]/70" data-testid="event-details-bar">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-5 gap-y-3 px-5 py-3 sm:grid-cols-4 lg:px-8">
          <div data-testid="event-date"><p className="event-detail-label">Date</p><p className="event-detail-value">Saturday, 12 September</p></div>
          <div data-testid="event-reporting-time"><p className="event-detail-label">Reporting</p><p className="event-detail-value">6:00 PM <span className="event-detail-note">(tentative)</span></p></div>
          <div data-testid="event-venue"><p className="event-detail-label">Venue</p><p className="event-detail-value">SAC Gym</p></div>
          <div data-testid="event-organizers"><p className="event-detail-label">Connect</p><div className="flex flex-wrap gap-x-3 gap-y-1"><a href="https://www.instagram.com/power_aaloo/" target="_blank" rel="noreferrer" className="event-social-link" data-testid="organizer-instagram-power-aaloo">@power_aaloo <ExternalLink className="size-3" /></a><a href="https://www.instagram.com/thee_nightowll/" target="_blank" rel="noreferrer" className="event-social-link" data-testid="organizer-instagram-nightowll">@thee_nightowll <ExternalLink className="size-3" /></a></div></div>
        </div>
      </div>
    </header>
  );
}