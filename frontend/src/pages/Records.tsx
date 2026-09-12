import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import MeetNav from "@/components/MeetNav";
import type { LeaderboardEntry, LeaderboardResponse } from "@/lib/types";

const BOYS_CATEGORIES = ["53 kg", "59 kg", "66 kg", "74 kg", "83 kg", "93 kg", "105 kg", "120 kg", "120+ kg"];
const GIRLS_CATEGORIES = ["43 kg", "47 kg", "52 kg", "57 kg", "63 kg", "69 kg", "76 kg", "84 kg", "84+ kg"];

type Sex = "boys" | "girls";
type Lift = "squat" | "bench" | "deadlift" | "total";

const fetchLeaderboard = () => apiGet<LeaderboardResponse>("/leaderboard");

function format(value: number | null) {
  return value === null ? "—" : Number.isInteger(value) ? `${value} kg` : `${value.toFixed(2)} kg`;
}

function sexMatches(entry: LeaderboardEntry, sex: Sex) {
  return entry.division.toLowerCase() === (sex === "boys" ? "boys" : "girls");
}

function RecordCell({ entries, category, lift }: { entries: LeaderboardEntry[]; category: string; lift: Lift }) {
  const best = entries
    .filter((entry) => entry.category === category && entry[lift] !== null)
    .sort((a, b) => Number(b[lift]) - Number(a[lift]))[0];

  return (
    <td className="px-4 py-4">
      {best ? (
        <div>
          <p className="font-mono text-base font-black text-[#F8FAFC]">{format(best[lift])}</p>
          <p className="mt-1 font-heading text-xs font-bold uppercase text-[#FFB703]">{best.lifter}</p>
          {best.team && <p className="mt-1 font-mono text-[9px] uppercase text-[#64748B]">{best.team}</p>}
          {best.event && <p className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">{best.event}</p>}
        </div>
      ) : <span className="font-mono text-sm text-[#64748B]">—</span>}
    </td>
  );
}

export default function Records() {
  const [sex, setSex] = useState<Sex>("boys");
  const query = useQuery({ queryKey: ["leaderboard"], queryFn: fetchLeaderboard, retry: false, staleTime: 30_000 });
  const data = query.data;

  const entries = useMemo(
    () => (data?.entries ?? []).filter((entry) => sexMatches(entry, sex)),
    [data?.entries, sex],
  );
  const categories = sex === "boys" ? BOYS_CATEGORIES : GIRLS_CATEGORIES;

  return (
    <main className="min-h-screen overflow-hidden bg-[#080F20] text-[#F8FAFC]" data-testid="records-page">
      <div className="pointer-events-none fixed inset-0 opacity-20 [background-image:linear-gradient(rgba(30,48,91,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,48,91,0.3)_1px,transparent_1px)] [background-size:56px_56px]" />
      <MeetNav />
      <div className="relative mx-auto max-w-[1600px] px-5 pb-16 pt-10 lg:px-8 lg:pt-16">
        <section className="border-b border-[#1E305B] pb-10">
          <p className="section-kicker">04 / Records</p>
          <h1 className="mt-4 font-heading text-5xl font-black uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
            IIT BHU<br /><span className="text-[#E63946]">Powerlifting</span><br />Records
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-[#94A3B8] sm:text-base">
            Best recorded squat, bench, deadlift, and total for every IPF weight category, based on the leaderboard data.
          </p>
        </section>

        <section className="pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E305B] pb-6">
            <div>
              <p className="section-kicker">Category records</p>
              <h2 className="mt-2 font-heading text-3xl font-black uppercase sm:text-4xl">Weight Classes</h2>
            </div>
            <div className="flex gap-2">
              {(["boys", "girls"] as Sex[]).map((item) => (
                <Button key={item} variant={sex === item ? "default" : "outline"} className={`h-11 min-w-28 rounded-none border-[#1E305B] px-4 font-heading font-bold uppercase ${sex === item ? "bg-[#E63946] text-white hover:bg-[#FF4D5A]" : "bg-[#101B35] text-[#94A3B8] hover:border-[#E63946] hover:bg-[#17264A] hover:text-white"}`} onClick={() => setSex(item)}>
                  {item}
                </Button>
              ))}
            </div>
          </div>

          {query.isError && <div className="mt-5 border border-[#E63946]/50 bg-[#E63946]/10 p-4"><p className="font-heading font-bold uppercase">Records unavailable</p><p className="mt-1 text-sm text-[#FFB7BB]">The leaderboard data could not be loaded right now.</p></div>}
          {query.isPending && <div className="mt-5 h-20 animate-pulse border border-[#1E305B] bg-[#101B35]" />}

          {!query.isPending && !query.isError && (
            <div className="mt-5 overflow-x-auto border border-[#1E305B]" data-testid="records-table">
              <table className="w-full min-w-[1200px] border-collapse text-left">
                <thead className="bg-[#17264A]">
                  <tr className="border-b border-[#1E305B]">
                    {["Weight Category", "Squat", "Bench", "Deadlift", "Total"].map((header) => <th key={header} className="px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#94A3B8]">{header}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category} className="border-b border-[#1E305B]/70 bg-[#101B35] hover:bg-[#17264A]">
                      <td className="px-4 py-4"><span className="border border-[#E63946]/40 bg-[#E63946]/10 px-2 py-1 font-mono text-xs font-bold text-[#FF6B73]">{category}</span></td>
                      <RecordCell entries={entries} category={category} lift="squat" />
                      <RecordCell entries={entries} category={category} lift="bench" />
                      <RecordCell entries={entries} category={category} lift="deadlift" />
                      <RecordCell entries={entries} category={category} lift="total" />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-5 flex items-center gap-2 text-xs text-[#64748B]"><Activity className="size-4 text-[#E63946]" /> Records are calculated from the current leaderboard feed; update the sheet to update the records.</p>
        </section>
      </div>
    </main>
  );
}
