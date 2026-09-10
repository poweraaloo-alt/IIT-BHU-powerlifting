import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ArrowDownUp, BarChart3, Dumbbell, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import MeetNav from "@/components/MeetNav";
import type { LeaderboardEntry, LeaderboardResponse } from "@/lib/types";

type SortField = keyof Pick<LeaderboardEntry, "lifter" | "division" | "age" | "bodyweight" | "category" | "squat" | "bench" | "deadlift" | "total" | "dots">;

const sortOptions: { value: SortField; label: string }[] = [
  { value: "lifter", label: "Lifter" }, { value: "division", label: "Division" },
  { value: "age", label: "Age" }, { value: "bodyweight", label: "Bodyweight" }, { value: "category", label: "Category" },
  { value: "squat", label: "Squat" }, { value: "bench", label: "Bench" }, { value: "deadlift", label: "Deadlift" },
  { value: "total", label: "Total" }, { value: "dots", label: "DOTS" },
];

const fetchLeaderboard = () => apiGet<LeaderboardResponse>("/leaderboard");

function value(value: number | null) {
  return value === null ? "—" : Number.isInteger(value) ? `${value}` : value.toFixed(2);
}

function LeaderboardCard({ entry, position }: { entry: LeaderboardEntry; position: number }) {
  return (
    <article className="relative border border-[#1E305B] bg-[#101B35] p-4" data-testid={`leaderboard-card-${entry.id}`}>
      <div className="absolute inset-y-0 left-0 w-1 bg-[#E63946]" />
      <div className="flex items-start justify-between gap-4 pl-2">
        <div><p className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#64748B]">#{position} / {entry.category}</p><h3 className="mt-2 font-heading text-xl font-bold uppercase tracking-tight">{entry.lifter}</h3><p className="mt-1 font-mono text-[10px] uppercase text-[#94A3B8]">{entry.division} / {value(entry.bodyweight)} kg / AGE {value(entry.age)}</p></div>
        <BarChart3 className="mt-1 size-5 text-[#E63946]" aria-hidden="true" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[#1E305B] pt-3"><div><p className="metric-label">SQUAT</p><p className="font-mono text-sm">{value(entry.squat)}</p></div><div><p className="metric-label">BENCH</p><p className="font-mono text-sm">{value(entry.bench)}</p></div><div><p className="metric-label">DEADLIFT</p><p className="font-mono text-sm">{value(entry.deadlift)}</p></div><div><p className="metric-label text-[#E63946]">TOTAL</p><p className="font-mono text-sm font-bold">{value(entry.total)}</p></div><div><p className="metric-label text-[#E63946]">DOTS</p><p className="font-mono text-sm font-bold">{value(entry.dots)}</p></div></div>
    </article>
  );
}

export default function Leaderboard() {
  const [sortField, setSortField] = useState<SortField>("dots");
  const [descending, setDescending] = useState(true);
  const [search, setSearch] = useState("");
  const leaderboardQuery = useQuery({ queryKey: ["leaderboard"], queryFn: fetchLeaderboard, retry: false, staleTime: 30_000 });
  const data = leaderboardQuery.data;
  const entries = useMemo(() => {
    const filtered = (data?.entries ?? []).filter((entry) => `${entry.lifter} ${entry.division} ${entry.category}`.toLowerCase().includes(search.trim().toLowerCase()));
    return [...filtered].sort((a, b) => {
      const left = a[sortField];
      const right = b[sortField];
      if (typeof left === "string" || typeof right === "string") return (String(left ?? "").localeCompare(String(right ?? ""))) * (descending ? -1 : 1);
      return ((Number(right ?? -Infinity) - Number(left ?? -Infinity)) || 0) * (descending ? 1 : -1);
    });
  }, [data?.entries, descending, search, sortField]);

  const handleSearch = (term: string) => {
    setSearch(term);
    if (term.trim().length >= 2) trackEvent("leaderboard_search", { query_length: term.trim().length });
  };

  const handleSort = (field: SortField) => {
    setSortField(field);
    trackEvent("leaderboard_sort", { field, direction: descending ? "descending" : "ascending" });
  };

  const handleSortDirection = () => {
    setDescending((current) => !current);
    trackEvent("leaderboard_sort_direction", { direction: descending ? "ascending" : "descending" });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#080F20] text-[#F8FAFC]" data-testid="leaderboard-page">
      <div className="pointer-events-none fixed inset-0 opacity-20 [background-image:linear-gradient(rgba(30,48,91,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,48,91,0.3)_1px,transparent_1px)] [background-size:56px_56px]" />
      <MeetNav />
      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-10 lg:px-8 lg:pt-16">
        <section className="grid gap-10 border-b border-[#1E305B] pb-12 lg:grid-cols-[1fr_300px] lg:items-end" data-testid="leaderboard-hero">
          <div><p className="section-kicker">03 / Performance board</p><h1 className="mt-4 font-heading text-5xl font-black uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-8xl">IIT BHU<br /><span className="text-[#E63946]">Powerlifting</span><br />Leaderboard</h1><p className="mt-6 max-w-xl text-sm leading-7 text-[#94A3B8] sm:text-base">A clear view of every lifter, lift, total, and DOTS score. Sort the board by any field to find the numbers that matter.</p></div>
          <div className="border-l-2 border-[#E63946] pl-5" data-testid="leaderboard-stat"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B]">Entries</p><p className="mt-1 font-heading text-4xl font-black">{data?.total_entries ?? "—"}</p><p className="mt-1 text-xs text-[#94A3B8]">ranked lifters</p></div>
        </section>

        <section className="pt-8" data-testid="leaderboard-content">
          <div className="flex flex-col gap-6 border-b border-[#1E305B] pb-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="section-kicker">Sort the field</p><h2 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">Leaderboard</h2></div><div className="flex items-center gap-2 text-xs text-[#94A3B8]" data-testid="leaderboard-visible-count"><Dumbbell className="size-4 text-[#E63946]" /> Showing <span className="font-mono font-bold text-white">{entries.length}</span> of {data?.total_entries ?? 0}</div></div>
          <div className="mt-6 grid gap-3 border border-[#1E305B] bg-[#101B35]/70 p-3 md:grid-cols-[minmax(220px,1fr)_auto_auto] md:items-center" data-testid="leaderboard-filters">
            <label className="relative block"><span className="sr-only">Search leaderboard</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" /><Input value={search} onChange={(event) => handleSearch(event.target.value)} placeholder="Search lifter, division, or category..." className="h-11 rounded-none border-[#1E305B] bg-[#080F20] pl-10 text-sm text-white placeholder:text-[#64748B] focus-visible:border-[#E63946]" data-testid="leaderboard-search-input" /></label>
            <label className="flex items-center gap-2 whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]"><ArrowDownUp className="size-3" /><span>Sort by</span><select value={sortField} onChange={(event) => handleSort(event.target.value as SortField)} className="h-10 border border-[#1E305B] bg-[#080F20] px-2 text-[10px] text-[#E0E1DD] outline-none focus:border-[#E63946]" data-testid="leaderboard-sort-select">{sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <Button variant="outline" size="sm" className="h-10 rounded-none border-[#1E305B] bg-[#080F20] text-[#E0E1DD] hover:border-[#E63946] hover:bg-[#17264A]" onClick={handleSortDirection} data-testid="leaderboard-sort-direction">{descending ? <ArrowDown className="size-4" /> : <ArrowUp className="size-4" />} {descending ? "Descending" : "Ascending"}</Button>
          </div>

          {leaderboardQuery.isError && <div className="mt-5 border border-[#E63946]/50 bg-[#E63946]/10 p-4" data-testid="leaderboard-error"><p className="font-heading font-bold uppercase">Leaderboard unavailable</p><p className="mt-1 text-sm text-[#FFB7BB]">The leaderboard could not be loaded right now. Please try again shortly.</p></div>}
          {leaderboardQuery.isPending && <div className="mt-5 grid gap-2" data-testid="leaderboard-loading">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse border border-[#1E305B] bg-[#101B35]" />)}</div>}
          {!leaderboardQuery.isPending && !leaderboardQuery.isError && entries.length === 0 && <div className="mt-5 border border-dashed border-[#1E305B] p-10 text-center" data-testid="leaderboard-empty"><p className="font-heading text-xl font-bold uppercase">Leaderboard entries coming soon</p><p className="mt-2 text-sm text-[#94A3B8]">Once lifter rows are added, they will appear here with totals and DOTS scores.</p></div>}
          {entries.length > 0 && <><div className="mt-5 hidden overflow-x-auto border border-[#1E305B] md:block" data-testid="leaderboard-table"><table className="w-full min-w-[1100px] border-collapse text-left"><thead className="bg-[#17264A]"><tr className="border-b border-[#1E305B]">{["Rank", "Lifter", "Division", "Age", "Bodyweight", "Category", "Squat", "Bench", "Deadlift", "Total", "DOTS"].map((header) => <th key={header} className="px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#94A3B8]">{header}</th>)}</tr></thead><tbody>{entries.map((entry, index) => <tr key={entry.id} className="group border-b border-[#1E305B]/70 bg-[#101B35] hover:bg-[#17264A]" data-testid={`leaderboard-row-${entry.id}`}><td className="border-l-2 border-transparent px-4 py-4 font-mono text-sm text-[#64748B] group-hover:border-[#E63946]">{index + 1}</td><td className="px-4 py-4 font-heading text-base font-bold uppercase">{entry.lifter}</td><td className="px-4 py-4 text-sm text-[#E0E1DD]">{entry.division}</td><td className="px-4 py-4 font-mono text-sm">{value(entry.age)}</td><td className="px-4 py-4 font-mono text-sm">{value(entry.bodyweight)} kg</td><td className="px-4 py-4 font-mono text-xs text-[#FF6B73]">{entry.category}</td><td className="px-4 py-4 font-mono text-sm">{value(entry.squat)}</td><td className="px-4 py-4 font-mono text-sm">{value(entry.bench)}</td><td className="px-4 py-4 font-mono text-sm">{value(entry.deadlift)}</td><td className="px-4 py-4 font-mono text-sm font-bold">{value(entry.total)}</td><td className="px-4 py-4 font-mono text-sm font-bold text-[#FFB703]">{value(entry.dots)}</td></tr>)}</tbody></table></div><div className="mt-5 grid gap-3 md:hidden" data-testid="leaderboard-cards">{entries.map((entry, index) => <LeaderboardCard key={entry.id} entry={entry} position={index + 1} />)}</div></>}
        </section>
      </div>
    </main>
  );
}
