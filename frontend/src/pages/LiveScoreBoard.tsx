import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowDownUp, ArrowUp, Radio, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/api";
import MeetNav from "@/components/MeetNav";
import type { LiveScoreResponse, LiveScoreRow } from "@/lib/types";

const fetchLiveScores = () => apiGet<LiveScoreResponse>("/live-scores");

function numericValue(raw: string | undefined) {
  if (!raw?.trim()) return null;
  const match = raw.replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function labelForHeader(header: string) {
  return header.replace(/\s+/g, " ").trim();
}

function displayValue(value: string | undefined) {
  return value?.trim() || "—";
}

function ScoreCard({ row, headers }: { row: LiveScoreRow; headers: string[] }) {
  return (
    <article className="relative border border-[#1E305B] bg-[#101B35] p-4" data-testid={`live-score-card-${row.id}`}>
      <div className="absolute inset-y-0 left-0 w-1 bg-[#E63946]" />
      <h3 className="pl-2 font-heading text-xl font-bold uppercase">{displayValue(row.values[headers[0]])}</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#1E305B] pt-3">{headers.slice(1).map((header) => <div key={header}><p className="metric-label">{labelForHeader(header)}</p><p className="font-mono text-sm text-[#E0E1DD]">{displayValue(row.values[header])}</p></div>)}</div>
    </article>
  );
}

export default function LiveScoreBoard() {
  const [sortHeader, setSortHeader] = useState("");
  const [descending, setDescending] = useState(true);
  const [search, setSearch] = useState("");
  const liveScoresQuery = useQuery({ queryKey: ["live-scores"], queryFn: fetchLiveScores, retry: false, staleTime: 15_000 });
  const data = liveScoresQuery.data;
  const defaultSortHeader = data?.headers.find((header) => /total|dots/i.test(header)) ?? data?.headers[0] ?? "";
  const selectedSortHeader = sortHeader || defaultSortHeader;
  const rows = useMemo(() => {
    const filtered = (data?.rows ?? []).filter((row) => Object.values(row.values).join(" ").toLowerCase().includes(search.trim().toLowerCase()));
    return [...filtered].sort((a, b) => {
      const leftRaw = a.values[selectedSortHeader] ?? "";
      const rightRaw = b.values[selectedSortHeader] ?? "";
      const leftNumber = numericValue(leftRaw);
      const rightNumber = numericValue(rightRaw);
      if (leftNumber !== null && rightNumber !== null) return (rightNumber - leftNumber) * (descending ? 1 : -1);
      return leftRaw.localeCompare(rightRaw) * (descending ? -1 : 1);
    });
  }, [data?.rows, descending, search, selectedSortHeader]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#080F20] text-[#F8FAFC]" data-testid="live-scoreboard-page">
      <div className="pointer-events-none fixed inset-0 opacity-20 [background-image:linear-gradient(rgba(30,48,91,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,48,91,0.3)_1px,transparent_1px)] [background-size:56px_56px]" />
      <MeetNav />
      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-10 lg:px-8 lg:pt-16">
        <section className="grid gap-10 border-b border-[#1E305B] pb-12 lg:grid-cols-[1fr_300px] lg:items-end" data-testid="live-scoreboard-hero">
          <div><p className="section-kicker">04 / Platform in progress</p><h1 className="mt-4 font-heading text-5xl font-black uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-8xl">Live<br /><span className="text-[#E63946]">Score</span> Board</h1><p className="mt-6 max-w-xl text-sm leading-7 text-[#94A3B8] sm:text-base">Follow every attempt as it lands. Search a lifter, sort by any score column, and keep the platform numbers in view.</p></div>
          <div className="border-l-2 border-[#E63946] pl-5" data-testid="live-scoreboard-stat"><div className="flex items-center gap-2"><span className="size-2 animate-pulse rounded-full bg-[#E63946]" /><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B]">Live entries</p></div><p className="mt-1 font-heading text-4xl font-black">{data?.total_rows ?? "—"}</p><p className="mt-1 text-xs text-[#94A3B8]">lifters on platform</p></div>
        </section>

        <section className="pt-8" data-testid="live-scoreboard-content">
          <div className="flex flex-col gap-6 border-b border-[#1E305B] pb-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="section-kicker">Attempt by attempt</p><h2 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">Current scores</h2></div><div className="flex items-center gap-2 text-xs text-[#94A3B8]" data-testid="live-score-visible-count"><Radio className="size-4 text-[#E63946]" /> Showing <span className="font-mono font-bold text-white">{rows.length}</span> of {data?.total_rows ?? 0}</div></div>
          <div className="mt-6 grid gap-3 border border-[#1E305B] bg-[#101B35]/70 p-3 md:grid-cols-[minmax(220px,1fr)_auto_auto] md:items-center" data-testid="live-score-filters">
            <label className="relative block"><span className="sr-only">Search live scores</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search any live score field..." className="h-11 rounded-none border-[#1E305B] bg-[#080F20] pl-10 text-sm text-white placeholder:text-[#64748B] focus-visible:border-[#E63946]" data-testid="live-score-search-input" /></label>
            <label className="flex items-center gap-2 whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]"><ArrowDownUp className="size-3" /><span>Sort by</span><select value={selectedSortHeader} onChange={(event) => setSortHeader(event.target.value)} className="h-10 max-w-44 border border-[#1E305B] bg-[#080F20] px-2 text-[10px] text-[#E0E1DD] outline-none focus:border-[#E63946]" data-testid="live-score-sort-select">{(data?.headers ?? []).map((header) => <option key={header} value={header}>{labelForHeader(header)}</option>)}</select></label>
            <Button variant="outline" size="sm" className="h-10 rounded-none border-[#1E305B] bg-[#080F20] text-[#E0E1DD] hover:border-[#E63946] hover:bg-[#17264A]" onClick={() => setDescending((current) => !current)} data-testid="live-score-sort-direction">{descending ? <ArrowDown className="size-4" /> : <ArrowUp className="size-4" />} {descending ? "Descending" : "Ascending"}</Button>
          </div>

          {liveScoresQuery.isError && <div className="mt-5 border border-[#E63946]/50 bg-[#E63946]/10 p-4" data-testid="live-score-error"><p className="font-heading font-bold uppercase">Live scores unavailable</p><p className="mt-1 text-sm text-[#FFB7BB]">The live score board could not be loaded right now. Please try again shortly.</p></div>}
          {liveScoresQuery.isPending && <div className="mt-5 grid gap-2" data-testid="live-score-loading">{[1, 2].map((item) => <div key={item} className="h-16 animate-pulse border border-[#1E305B] bg-[#101B35]" />)}</div>}
          {!liveScoresQuery.isPending && !liveScoresQuery.isError && rows.length === 0 && <div className="mt-5 border border-dashed border-[#1E305B] p-10 text-center" data-testid="live-score-empty"><p className="font-heading text-xl font-bold uppercase">Waiting for platform scores</p><p className="mt-2 text-sm text-[#94A3B8]">Live attempts will appear here as the score board is filled.</p></div>}
          {rows.length > 0 && data && <><div className="mt-5 hidden overflow-x-auto border border-[#1E305B] md:block" data-testid="live-score-table"><table className="w-full min-w-[1100px] border-collapse text-left"><thead className="bg-[#17264A]"><tr className="border-b border-[#1E305B]">{data.headers.map((header) => <th key={header} className="px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#94A3B8]">{labelForHeader(header)}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="group border-b border-[#1E305B]/70 bg-[#101B35] hover:bg-[#17264A]" data-testid={`live-score-row-${row.id}`}>{data.headers.map((header) => <td key={header} className="px-4 py-4 font-mono text-sm text-[#E0E1DD]">{displayValue(row.values[header])}</td>)}</tr>)}</tbody></table></div><div className="mt-5 grid gap-3 md:hidden" data-testid="live-score-cards">{rows.map((row) => <ScoreCard key={row.id} row={row} headers={data.headers} />)}</div></>}
        </section>
      </div>
    </main>
  );
}