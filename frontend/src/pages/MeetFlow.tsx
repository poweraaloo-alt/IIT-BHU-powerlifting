import { ArrowRight, CheckCircle2, ClipboardCheck, Flag, Scale, Timer } from "lucide-react";

import { Link } from "react-router-dom";
import MeetNav from "@/components/MeetNav";

const flowSteps = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Check-in",
    copy: "Arrive early, confirm your name and division, and listen for announcements from the officials.",
    note: "Bring your student ID and competition essentials.",
  },
  {
    number: "02",
    icon: Scale,
    title: "Weigh-in",
    copy: "Your official bodyweight confirms your IPF weight category. Officials will also check your equipment and record your opening attempts.",
    note: "Ask the desk to confirm your class and rack heights.",
  },
  {
    number: "03",
    icon: Timer,
    title: "Lifting order",
    copy: "Lifters are placed into flights. One person lifts at a time, and your name will be called when the platform is ready for you.",
    note: "Stay near the warm-up area and watch your flight.",
  },
  {
    number: "04",
    icon: Flag,
    title: "Three attempts",
    copy: "Every lifter gets three attempts in each lift: squat, bench press, then deadlift. Your best successful attempt in each lift matters.",
    note: "Tell the officials your next attempt after each lift.",
  },
];

const lifts = [
  { title: "Squat", command: "Stand tall with the weight, then wait for the rack command.", color: "#E63946" },
  { title: "Bench press", command: "Follow the start, press, and rack commands from the head referee.", color: "#FFB703" },
  { title: "Deadlift", command: "Finish tall and hold the bar until the down command is given.", color: "#56C596" },
];

export default function MeetFlow() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080F20] text-[#F8FAFC]" data-testid="meet-flow-page">
      <div className="pointer-events-none fixed inset-0 opacity-20 [background-image:linear-gradient(rgba(30,48,91,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,48,91,0.3)_1px,transparent_1px)] [background-size:56px_56px]" />
      <MeetNav />
      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-10 lg:px-8 lg:pt-16">
        <section className="grid gap-10 border-b border-[#1E305B] pb-12 lg:grid-cols-[1fr_300px] lg:items-end" data-testid="flow-hero">
          <div className="max-w-3xl">
            <p className="section-kicker">02 / Your first platform day</p>
            <h1 className="mt-4 font-heading text-5xl font-black uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-8xl">Meet flow<br /><span className="text-[#E63946]">made simple.</span></h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[#94A3B8] sm:text-base">New to powerlifting? Here is what happens from the moment you arrive until the final results are announced.</p>
          </div>
          <div className="border-l-2 border-[#E63946] pl-5" data-testid="flow-intro-note">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B]">The short version</p>
            <p className="mt-3 font-heading text-2xl font-bold uppercase leading-tight text-[#F8FAFC]">Check in.<br />Lift three times.<br /><span className="text-[#E63946]">Build your total.</span></p>
          </div>
        </section>

        <section className="pt-10" data-testid="flow-steps-section">
          <div className="mb-6">
            <p className="section-kicker">What happens next</p>
            <h2 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">From arrival to platform</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {flowSteps.map(({ number, icon: Icon, title, copy, note }) => (
              <article key={number} className="relative border border-[#1E305B] bg-[#101B35] p-5 sm:p-6" data-testid={`flow-step-${number}`}>
                <div className="mb-8 flex items-start justify-between"><span className="font-mono text-xs font-bold tracking-[0.2em] text-[#E63946]">{number}</span><Icon className="size-5 text-[#94A3B8]" aria-hidden="true" /></div>
                <h3 className="font-heading text-2xl font-bold uppercase text-[#F8FAFC]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#94A3B8]">{copy}</p>
                <p className="mt-5 border-t border-[#1E305B] pt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-[#E0E1DD]">{note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 border-y border-[#1E305B] py-10" data-testid="three-lifts-section">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
            <div>
              <p className="section-kicker">The competition order</p>
              <h2 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight">Three lifts.<br /><span className="text-[#E63946]">Nine chances.</span></h2>
              <p className="mt-4 text-sm leading-6 text-[#94A3B8]">You have three attempts in each lift. A missed attempt does not add to your total, so stay calm and listen to the referee.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {lifts.map(({ title, command, color }, index) => (
                <article key={title} className="border border-[#1E305B] bg-[#101B35] p-5" data-testid={`lift-card-${title.toLowerCase().replace(" ", "-")}`}>
                  <div className="flex items-center justify-between"><span className="font-mono text-xs font-bold text-[#64748B]">0{index + 1}</span><span className="size-2" style={{ backgroundColor: color }} /></div>
                  <h3 className="mt-8 font-heading text-xl font-bold uppercase">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#94A3B8]">{command}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 pt-10 md:grid-cols-2" data-testid="scoring-results-section">
          <article className="border border-[#1E305B] bg-[#101B35] p-6" data-testid="scoring-card">
            <div className="flex items-center gap-3"><CheckCircle2 className="size-5 text-[#56C596]" /><p className="section-kicker">How scoring works</p></div>
            <h2 className="mt-4 font-heading text-2xl font-bold uppercase">Best lifts make your total</h2>
            <p className="mt-3 text-sm leading-6 text-[#94A3B8]">Your best successful squat, best successful bench press, and best successful deadlift are added together. That sum is your competition total.</p>
          </article>
          <article className="border border-[#E63946]/40 bg-[#E63946]/10 p-6" data-testid="results-card">
            <div className="flex items-center gap-3"><ArrowRight className="size-5 text-[#FF6B73]" /><p className="section-kicker">After your last lift</p></div>
            <h2 className="mt-4 font-heading text-2xl font-bold uppercase">Wait for results</h2>
            <p className="mt-3 text-sm leading-6 text-[#FFB7BB]">Officials confirm the final totals and rankings by division and weight category. Stay for the announcement and celebrate the whole team.</p>
          </article>
        </section>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-[#1E305B] pt-6 sm:flex-row sm:items-center" data-testid="flow-footer-cta">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#64748B]">Ready to see the field?</p>
          <Link to="/" className="group flex items-center gap-3 bg-[#E63946] px-5 py-3 font-heading text-sm font-bold uppercase text-white hover:bg-[#FF4D5A]" data-testid="view-nominations-link">View nominations <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link>
        </div>
      </div>
    </main>
  );
}