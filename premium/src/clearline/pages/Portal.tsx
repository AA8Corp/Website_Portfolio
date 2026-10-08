import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, type FormEvent } from "react";
import { ROOMS, ROOM_TIMES } from "../data";

const SCORES = [94.1, 95.6, 95.2, 96.8, 96.1, 97.0, 96.4, 97.9, 97.2, 98.1, 97.6, 97.4];
const WEEKS = ["Jul 7", "Jul 14", "Jul 21", "Jul 28", "Aug 4", "Aug 11", "Aug 18", "Aug 25", "Sep 1", "Sep 8", "Sep 15", "Sep 22"];

type Issue = { id: number; room: string; note: string; status: "Logged" | "Scheduled" | "Fixed"; when: string };

const SEED_ISSUES: Issue[] = [
  { id: 3, room: "Break room", note: "Coffee ring on counter by sink", status: "Scheduled", when: "Today 9:14 AM" },
  { id: 2, room: "Exam room 2", note: "Paper towel dispenser empty", status: "Fixed", when: "Mon 8:02 AM" },
  { id: 1, room: "Reception", note: "Streaks on entry glass", status: "Fixed", when: "Sep 18" },
];

const CREW = [
  { name: "R. Alvarez", role: "Crew lead" },
  { name: "T. Nguyen", role: "Disinfection" },
  { name: "M. Osei", role: "Floors" },
];

const ScoreChart = () => {
  const [hover, setHover] = useState<number | null>(null);
  const w = 640, h = 220, padL = 36, padR = 12, padT = 16, padB = 28;
  const min = 92, max = 100;
  const x = (i: number) => padL + (i * (w - padL - padR)) / (SCORES.length - 1);
  const y = (v: number) => padT + ((max - v) * (h - padT - padB)) / (max - min);
  const line = SCORES.map((v, i) => `${i ? "L" : "M"}${x(i)} ${y(v)}`).join(" ");
  const area = `${line} L${x(SCORES.length - 1)} ${h - padB} L${x(0)} ${h - padB} Z`;
  const shown = hover ?? SCORES.length - 1;

  return (
    <div className="chart">
      <div className="chart-head">
        <h2>Audit score, last 12 weeks</h2>
        <p className="chart-readout"><b>{SCORES[shown]!.toFixed(1)}</b> week of {WEEKS[shown]}</p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Weekly audit scores rising from ${SCORES[0]} to ${SCORES.at(-1)}`} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#00B8A9" stopOpacity=".28" />
            <stop offset="1" stopColor="#00B8A9" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[92, 94, 96, 98, 100].map((v) => (
          <g key={v}>
            <line x1={padL} x2={w - padR} y1={y(v)} y2={y(v)} className="grid" />
            <text x={padL - 8} y={y(v) + 4} textAnchor="end" className="axis">{v}</text>
          </g>
        ))}
        <line x1={padL} x2={w - padR} y1={y(95)} y2={y(95)} className="threshold" />
        <text x={w - padR} y={y(95) - 6} textAnchor="end" className="axis threshold-label">Re-clean below 95</text>
        <motion.path d={area} fill="url(#area)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} />
        <motion.path d={line} fill="none" stroke="#00B8A9" strokeWidth={3} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: "easeOut" }} />
        {SCORES.map((v, i) => (
          <g key={i}>
            <rect x={x(i) - 22} y={padT} width={44} height={h - padT - padB} fill="transparent" onMouseEnter={() => setHover(i)} />
            <circle cx={x(i)} cy={y(v)} r={i === shown ? 6 : 3} className={i === shown ? "dot is-on" : "dot"} />
          </g>
        ))}
        {WEEKS.map((wk, i) => (i % 2 === 1 ? <text key={wk} x={x(i)} y={h - 8} textAnchor="middle" className="axis">{wk}</text> : null))}
      </svg>
    </div>
  );
};

export const Portal = () => {
  const [issues, setIssues] = useState<Issue[]>(SEED_ISSUES);
  const [room, setRoom] = useState(ROOMS[0]!.name);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const open = useMemo(() => issues.filter((i) => i.status !== "Fixed").length, [issues]);

  const logIssue = (e: FormEvent) => {
    e.preventDefault();
    if (note.trim().length < 4) { setError("Describe what you noticed, like “trash not emptied in exam room 3”."); return; }
    setIssues((list) => [{ id: Date.now(), room, note: note.trim(), status: "Logged", when: "Just now" }, ...list]);
    setNote("");
    setError("");
  };

  const markFixed = (id: number) => setIssues((list) => list.map((i) => (i.id === id ? { ...i, status: "Fixed" } : i)));

  return (
    <section className="portal">
      <div className="wrap">
        <div className="portal-top">
          <div>
            <p className="portal-org">Harbor Medical Group, Suite 400 <span className="demo-chip">Demo account</span></p>
            <h1>Good morning, Dana</h1>
          </div>
          <p className="portal-date">Tuesday, signed off 5:42 AM by R. Alvarez</p>
        </div>

        <div className="kpis">
          <div className="kpi"><span>Last night</span><b>8 of 8</b><em className="ok">All rooms signed off</em></div>
          <div className="kpi"><span>September audit</span><b>97.4</b><em className="ok">Above 95 target</em></div>
          <div className="kpi"><span>Open issues</span><b>{open}</b><em className={open ? "warn" : "ok"}>{open ? "Crew notified" : "Nothing open"}</em></div>
          <div className="kpi"><span>Next visit</span><b>Tonight</b><em>Arrives 11:30 PM</em></div>
        </div>

        <div className="portal-grid">
          <div className="panel"><ScoreChart /></div>

          <div className="panel">
            <h2>Last night’s sign-off</h2>
            <ul className="signoff">
              {ROOMS.map((r, i) => (
                <li key={r.id}><span className="tick" aria-hidden="true" /><span>{r.name}</span><time>{ROOM_TIMES[i]} AM</time></li>
              ))}
            </ul>
          </div>

          <div className="panel panel-wide">
            <div className="panel-head">
              <h2>Issues</h2>
              <p>Log anything we missed. The crew lead sees it before tonight’s shift.</p>
            </div>
            <form className="issue-form" onSubmit={logIssue} noValidate>
              <div className="field">
                <label htmlFor="issue-room">Room</label>
                <select id="issue-room" value={room} onChange={(e) => setRoom(e.target.value)}>
                  {ROOMS.map((r) => <option key={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="field field-grow">
                <label htmlFor="issue-note">What did you notice?</label>
                <input id="issue-note" value={note} onChange={(e) => { setNote(e.target.value); if (error) setError(""); }} aria-invalid={!!error} aria-describedby={error ? "issue-err" : undefined} />
                {error && <p className="error" id="issue-err">{error}</p>}
              </div>
              <button className="btn btn-primary" type="submit">Log issue</button>
            </form>
            <ul className="issues">
              <AnimatePresence initial={false}>
                {issues.map((i) => (
                  <motion.li key={i.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }}>
                    <div className="issue-main"><b>{i.room}</b><span>{i.note}</span></div>
                    <span className={`status status-${i.status.toLowerCase()}`}>{i.status}</span>
                    <time>{i.when}</time>
                    {i.status !== "Fixed" ? <button className="link-btn" onClick={() => markFixed(i.id)}>Mark fixed</button> : <span />}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>

          <div className="panel">
            <h2>Tonight’s crew</h2>
            <ul className="crew">
              {CREW.map((c) => (
                <li key={c.name}><span className="avatar" aria-hidden="true">{c.name.split(" ").map((p) => p[0]).join("").replace(".", "")}</span><b>{c.name}</b><span>{c.role}</span></li>
              ))}
            </ul>
            <p className="crew-note">Same crew as the last 41 visits. Background checks renewed in June.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
