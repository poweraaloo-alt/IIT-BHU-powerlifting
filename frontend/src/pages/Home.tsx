import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, ArrowDownUp, Dumbbell, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/api";
import type { Nomination, NominationGender, NominationsResponse } from "@/lib/types";
import MeetNav from "@/components/MeetNav";

const CATEGORY_ORDER = [
  "43 kg", "47 kg", "52 kg", "53 kg", "57 kg", "59 kg", "63 kg", "66 kg", "69 kg",
  "74 kg", "76 kg", "83 kg", "84 kg", "84+ kg", "93 kg", "105 kg", "120 kg", "120+ kg",
];

type SexFilter = "all" | NominationGender;
type SortField = "category" | "total" | "bodyweight";

const fetchNominations = () => apiGet<NominationsResponse>("/nominations");

function formatLift(value: number | null) {
  return value === null ? "—" : `${value} kg`;
}

function StatBlock({ label, value, detail, testId }: { label: string; value: string | number; detail: string; testId: string }) {
  return (
    <div className="border-l border-[#1E305B] pl-4" data-testid={testId}>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B]">{label}</p>
      <p className="mt-1 font-heading text-3xl font-black tracking-tight text-[#F8FAFC]">{value}</p>
      <p className="mt-1 text-xs text-[#94A3B8]">{detail}</p>
    </div>
  );
}

function LiftValue({ value }: { value: number | null }) {
  return <span className="font-mono text-sm font-medium text-[#E0E1DD]">{formatLift(value)}</span>;
}

function NominationCard({ nomination, rank }: { nomination: Nomination; rank: number }) {
  return (
    <article className="relative border border-[#1E305B] bg-[#101B35] p-4" data-testid={`nomination-card-${nomination.id}`}>
      <div className="absolute inset-y-0 left-0 w-1 bg-[#E63946]" />
      <div className="flex items-start justify-between gap-4 pl-2">
        <div>
          <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#64748B]">#{String(rank).padStart(2, "0")} / {nomination.category}</p>
          <h3 className="mt-2 font-heading text-xl font-bold uppercase tracking-tight text-[#F8FAFC]">{nomination.name}</h3>
          <p className="mt-1 font-mono text-[10px] uppercase text-[#FFB703]">{nomination.team || "—"}</p>
          <p className="mt-1 font-mono text-xs text-[#94A3B8]">{nomination.gender} / BODYWEIGHT {nomination.bodyweight} KG</p>
        </div>
        <Dumbbell className="mt-1 size-5 text-[#E63946]" aria-hidden="true" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#1E305B] pt-3">
        <div><p className="metric-label">SQUAT</p><LiftValue value={nomination.squat} /></div>
        <div><p className="metric-label">BENCH</p><LiftValue value={nomination.bench} /></div>
        <div><p className="metric-label">DEADLIFT</p><LiftValue value={nomination.deadlift} /></div>
        <div><p className="metric-label text-[#E63946]">TOTAL</p><LiftValue value={nomination.total} /></div>
      </div>
    </article>
  );
}

export default function Home() {
  const [sex, setSex] = useState<SexFilter>("all");
  const [team, setTeam] = useState("All Teams");
  const [category, setCategory] = useState("All Weight Categories");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("category");
  const nominationsQuery = useQuery({ queryKey: ["nominations"], queryFn: fetchNominations, retry: false, staleTime: 30_000 });
  const data = nominationsQuery.data;

  const teamOptions = useMemo(() => {
    const teams = new Set((data?.nominations ?? []).map((nomination) => nomination.team.trim()).filter(Boolean));
    return ["All Teams", ...Array.from(teams).sort((a, b) => a.localeCompare(b))];
  }, [data?.nominations]);

  const categoryOptions = useMemo(() => {
    const categories = new Set((data?.nominations ?? []).map((nomination) => nomination.category).filter(Boolean));
    return ["All Weight Categories", ...Array.from(categories).sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi) || a.localeCompare(b, undefined, { numeric: true });
    })];
  }, [data?.nominations]);

  const nominations = useMemo(() => {
    const filtered = (data?.nominations ?? []).filter((nomination) => {
      const matchesSex = sex === "all" || nomination.gender === sex;
      const matchesTeam = team === "All Teams" || nomination.team === team;
      const matchesCategory = category === "All Weight Categories" || nomination.category === category;
      const matchesSearch = `${nomination.name} ${nomination.team} ${nomination.category}`.toLowerCase().includes(search.trim().toLowerCase());
      return matchesSex && matchesTeam && matchesCategory && matchesSearch;
    });
    return [...filtered].sort((a, b) => {
      if (sortField === "total") return (b.total ?? -1) - (a.total ?? -1);
      if (sortField === "bodyweight") return a.bodyweight - b.bodyweight;
      return a.category.localeCompare(b.category, undefined, { numeric: true }) || a.name.localeCompare(b.name);
    });
  }, [category, data?.nominations, search, sex, sortField, team]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#080F20] text-[#F8FAFC]" data-testid="nominations-page">
      <div className="pointer-events-none fixed inset-0 opacity-20 [background-image:linear-gradient(rgba(30,48,91,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,48,91,0.3)_1px,transparent_1px)] [background-size:56px_56px]" />
      <MeetNav />

      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-10 lg:px-8 lg:pt-16">
        <section className="relative grid gap-10 border-b border-[#1E305B] pb-12 lg:grid-cols-[1fr_300px] lg:items-end" data-testid="hero-section">
          <div className="max-w-3xl">
            <p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.28em] text-[#E63946]">Upcoming competition / team trials</p>
            <h1 className="font-heading text-5xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-[#F8FAFC] sm:text-6xl lg:text-8xl">IIT BHU<br /><span className="text-[#E63946]">Powerlifting</span><br />Team Trials</h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[#94A3B8] sm:text-base">Nominations sorted by IPF weight category. Track the field, scan the totals, and know who is stepping onto the platform.</p>
          </div>
          <div className="grid grid-cols-2 gap-6 border-l-2 border-[#E63946] pl-5 lg:mb-1 lg:grid-cols-1 lg:gap-5" data-testid="hero-stats">
            <StatBlock label="Boys" value={data?.boys_count ?? "—"} detail="nominated lifters" testId="boys-stat" />
            <StatBlock label="Girls" value={data?.girls_count ?? "—"} detail="nominated lifters" testId="girls-stat" />
          </div>
        </section>

        <section className="pt-8" data-testid="leaderboard-section">
          <div className="flex flex-col gap-6 border-b border-[#1E305B] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-kicker">01 / Field breakdown</p>
              <h2 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">Nominations</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]" data-testid="visible-count">
              <Activity className="size-4 text-[#E63946]" /> Showing <span className="font-mono font-bold text-[#F8FAFC]">{nominations.length}</span> of {data?.total_nominations ?? 0}
            </div>
          </div>

          <div className="mt-6 grid gap-3 border border-[#1E305B] bg-[#101B35]/70 p-3 md:grid-cols-2 xl:grid-cols-5" data-testid="search-filter-bar">
            <label className="relative block xl:col-span-2">
              <span className="sr-only">Search lifters</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search lifter, team, or category..." className="h-11 rounded-none border-[#1E305B] bg-[#080F20] pl-10 text-sm text-white placeholder:text-[#64748B] focus-visible:border-[#E63946] focus-visible:ring-[#E63946]/30" data-testid="search-input" />
            </label>
            <label className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Sex</span>
              <select value={sex} onChange={(event) => setSex(event.target.value as SexFilter)} className="h-11 min-w-0 flex-1 border border-[#1E305B] bg-[#080F20] px-2 text-[10px] uppercase text-[#E0E1DD] outline-none focus:border-[#E63946]" data-testid="sex-filter">
                <option value="all">All Sexes</option>
                <option value="boys">Boys ({data?.boys_count ?? 0})</option>
                <option value="girls">Girls ({data?.girls_count ?? 0})</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Team</span>
              <select value={teamOptions.includes(team) ? team : "All Teams"} onChange={(event) => setTeam(event.target.value)} className="h-11 min-w-0 flex-1 border border-[#1E305B] bg-[#080F20] px-2 text-[10px] uppercase text-[#E0E1DD] outline-none focus:border-[#E63946]" data-testid="team-filter">
                {teamOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Weight</span>
              <select value={categoryOptions.includes(category) ? category : "All Weight Categories"} onChange={(event) => setCategory(event.target.value)} className="h-11 min-w-0 flex-1 border border-[#1E305B] bg-[#080F20] px-2 text-[10px] uppercase text-[#E0E1DD] outline-none focus:border-[#E63946]" data-testid="category-filter">
                {categoryOptions.map((option) => <option key={option} value={option}>{option.replace("All Weight Categories", "All")}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <ArrowDownUp className="size-3 text-[#64748B]" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Sort</span>
              <select value={sortField} onChange={(event) => setSortField(event.target.value as SortField)} className="h-11 min-w-0 flex-1 border border-[#1E305B] bg-[#080F20] px-2 text-[10px] text-[#E0E1DD] outline-none focus:border-[#E63946]" data-testid="sort-select">
                <option value="category">Category</option>
                <option value="total">Total</option>
                <option value="bodyweight">Bodyweight</option>
              </select>
            </label>
          </div>

          {nominationsQuery.isError && (
            <div className="mt-5 flex items-start gap-3 border border-[#E63946]/50 bg-[#E63946]/10 p-4" data-testid="feed-error">
              <div><p className="font-heading text-base font-bold uppercase">Nominations unavailable</p><p className="mt-1 text-sm text-[#FFB7BB]">The nominations could not be loaded right now. Please try again shortly.</p></div>
            </div>
          )}

          {nominationsQuery.isPending && (
            <div className="mt-5 grid gap-2" data-testid="nominations-loading">
              {[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse border border-[#1E305B] bg-[#101B35]" />)}
            </div>
          )}

          {!nominationsQuery.isPending && !nominationsQuery.isError && nominations.length === 0 && (
            <div className="mt-5 border border-dashed border-[#1E305B] p-10 text-center" data-testid="nominations-empty">
              <p className="font-heading text-xl font-bold uppercase">No nominations match</p>
              <p className="mt-2 text-sm text-[#94A3B8]">Try another team, weight category, sex, or clear your search.</p>
            </div>
          )}

          {nominations.length > 0 && (
            <>
              <div className="mt-5 hidden overflow-x-auto border border-[#1E305B] md:block" data-testid="nominations-table">
                <table className="w-full min-w-[940px] border-collapse text-left">
                  <thead className="bg-[#17264A]"><tr className="border-b border-[#1E305B]">
                    {['Rank', 'Lifter', 'Team', 'Sex', 'Bodyweight', 'Category', 'Squat', 'Bench', 'Deadlift', 'Total'].map((header) => <th key={header} className="px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#94A3B8]">{header}</th>)}
                  </tr></thead>
                  <tbody>
                    {nominations.map((nomination, index) => (
                      <tr key={nomination.id} className="group border-b border-[#1E305B]/70 bg-[#101B35] hover:bg-[#17264A]" data-testid={`nomination-row-${nomination.id}`}>
                        <td className="w-16 border-l-2 border-transparent px-4 py-4 font-mono text-xs text-[#64748B] group-hover:border-[#E63946]">{String(index + 1).padStart(2, "0")}</td>
                        <td className="px-4 py-4"><p className="font-heading text-base font-bold uppercase text-[#F8FAFC]">{nomination.name}</p></td>
                        <td className="px-4 py-4 font-mono text-xs font-bold text-[#FFB703]">{nomination.team || "—"}</td>
                        <td className="px-4 py-4 font-mono text-xs uppercase text-[#94A3B8]">{nomination.gender}</td>
                        <td className="px-4 py-4 font-mono text-sm text-[#E0E1DD]">{nomination.bodyweight} kg</td>
                        <td className="px-4 py-4"><span className="border border-[#E63946]/40 bg-[#E63946]/10 px-2 py-1 font-mono text-xs font-bold text-[#FF6B73]">{nomination.category}</span></td>
                        <td className="px-4 py-4"><LiftValue value={nomination.squat} /></td>
                        <td className="px-4 py-4"><LiftValue value={nomination.bench} /></td>
                        <td className="px-4 py-4"><LiftValue value={nomination.deadlift} /></td>
                        <td className="px-4 py-4"><span className="font-mono text-sm font-bold text-[#F8FAFC]">{formatLift(nomination.total)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-5 grid gap-3 md:hidden" data-testid="nominations-cards">
                {nominations.map((nomination, index) => <NominationCard key={nomination.id} nomination={nomination} rank={index + 1} />)}
              </div>
            </>
          )}
        </section>

        <footer className="mt-12 flex flex-col gap-3 border-t border-[#1E305B] pt-5 text-[10px] font-mono uppercase tracking-[0.15em] text-[#64748B] sm:flex-row sm:items-center sm:justify-between" data-testid="page-footer">
          <span>IIT BHU / powerlifting team trials</span>
          <span>Boys + girls / IPF weight categories</span>
        </footer>
      </div>
    </main>
  );
}
