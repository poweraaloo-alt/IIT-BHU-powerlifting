import { Dumbbell, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";

export default function MeetNav() {
  const trackNavigation = (destination: string) => {
    trackEvent("navigation_click", { destination });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[#1E305B]/80 bg-[#080F20]/90 backdrop-blur-md" data-testid="meet-header">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3" data-testid="home-nav-link" onClick={() => trackNavigation("home")}>
          <div className="flex size-9 shrink-0 items-center justify-center bg-[#E63946] text-[#080F20]" data-testid="meet-mark"><Dumbbell className="size-5" /></div>
          <div className="min-w-0"><p className="font-heading text-sm font-black uppercase tracking-[0.16em]">IIT BHU</p><p className="truncate font-mono text-[9px] uppercase tracking-[0.18em] text-[#64748B] sm:tracking-[0.22em]">Powerlifting team trials</p></div>
        </Link>

        <nav className="grid w-full grid-cols-2 gap-1 sm:flex sm:w-auto sm:flex-wrap sm:justify-end sm:gap-2" data-testid="top-navigation">
          <Link to="/leaderboard" onClick={() => trackNavigation("leaderboard")} className="px-2 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#94A3B8] hover:text-white sm:px-3 sm:tracking-[0.14em]" data-testid="leaderboard-nav-link">Leaderboard</Link>
          <Link to="/records" onClick={() => trackNavigation("records")} className="px-2 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#94A3B8] hover:text-white sm:px-3 sm:tracking-[0.14em]" data-testid="records-nav-link">Records</Link>
          <Link to="/live-scoreboard" onClick={() => trackNavigation("live_scores")} className="px-2 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#94A3B8] hover:text-white sm:px-3 sm:tracking-[0.14em]" data-testid="live-scoreboard-nav-link">Live Scores</Link>
          <Link to="/" onClick={() => trackNavigation("nominations")} className="px-2 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#94A3B8] hover:text-white sm:px-3 sm:tracking-[0.14em]" data-testid="nominations-nav-link">Nominations</Link>
          <Link to="/meet-flow" onClick={() => trackNavigation("meet_flow")} className="border border-[#E63946]/50 bg-[#E63946]/10 px-2 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#FF6B73] hover:border-[#E63946] hover:bg-[#E63946]/20 sm:px-3 sm:tracking-[0.14em]" data-testid="meet-flow-nav-link">Meet Flow</Link>
        </nav>
      </div>

      <div className="border-t border-[#1E305B]/70 bg-[#101B35]/70" data-testid="event-details-bar">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-3 px-4 py-3 sm:grid-cols-4 sm:px-5 lg:px-8">
          <div data-testid="event-date"><p className="event-detail-label">Date</p><p className="event-detail-value">Saturday, 12 September</p></div>
          <div data-testid="event-reporting-time"><p className="event-detail-label">Reporting</p><p className="event-detail-value">6:00 PM</p></div>
          <div data-testid="event-venue"><p className="event-detail-label">Venue</p><p className="event-detail-value">SAC Gym</p></div>
          <div data-testid="event-organizers"><p className="event-detail-label">Connect</p><div className="flex flex-wrap gap-x-3 gap-y-1"><a href="https://www.instagram.com/iitbhupowerlifting/" target="_blank" rel="noopener noreferrer" className="event-social-link" data-testid="organizer-instagram-iit-bhu-powerlifting" onClick={() => trackEvent("instagram_click", { account: "iitbhupowerlifting" })}>@iitbhupowerlifting <ExternalLink className="size-3" /></a><a href="https://www.instagram.com/power_aaloo/" target="_blank" rel="noopener noreferrer" className="event-social-link" data-testid="organizer-instagram-power-aaloo" onClick={() => trackEvent("instagram_click", { account: "power_aaloo" })}>@power_aaloo <ExternalLink className="size-3" /></a><a href="https://www.instagram.com/thee_nightowll/" target="_blank" rel="noopener noreferrer" className="event-social-link" data-testid="organizer-instagram-nightowll" onClick={() => trackEvent("instagram_click", { account: "thee_nightowll" })}>@thee_nightowll <ExternalLink className="size-3" /></a></div></div>
        </div>
      </div>
    </header>
  );
}
