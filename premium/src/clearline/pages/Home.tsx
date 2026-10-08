import { motion, useScroll, useTransform } from "framer-motion";
import { Suspense, lazy, useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CountUp } from "../../shared/CountUp";
import { useReducedMotion } from "../../shared/useReducedMotion";
import { ROOMS, ROOM_TIMES, SPACES } from "../data";

const FloorScene = lazy(() => import("../scene/FloorScene").then((m) => ({ default: m.FloorScene })));

const STEPS = [
  { title: "Walkthrough", body: "A supervisor measures your space and notes the rooms that matter most. Twenty minutes, usually." },
  { title: "Fixed scope and price", body: "Within 48 hours: every task, how often, one monthly price. No surprise add-ons." },
  { title: "First clean, supervised", body: "Your assigned crew does night one with their supervisor on site. Photo report by morning." },
  { title: "Monthly quality audit", body: "Every room scored against your scope. Anything under 95 gets fixed that week." },
];

const Checklist = ({ current }: { current: number }) => (
  <div className="checklist" aria-label="Tonight's progress at Harbor Medical, Suite 400">
    <div className="checklist-head">
      <div>
        <p className="checklist-site">Harbor Medical, Suite 400</p>
        <p className="checklist-meta">{current >= ROOMS.length ? "All rooms signed off" : `Cleaning ${ROOMS[current]?.name.toLowerCase()}`}</p>
      </div>
      <span className="checklist-count">{Math.min(current, ROOMS.length)}/{ROOMS.length}</span>
    </div>
    <ol className="checklist-list">
      {ROOMS.map((room, i) => {
        const state = i < current ? "done" : i === current ? "active" : "todo";
        return (
          <li key={room.id} className={`is-${state}`}>
            <span className="tick" aria-hidden="true" />
            <span className="room">{room.name}</span>
            <span className="time">{state === "done" ? `${ROOM_TIMES[i]} AM` : state === "active" ? "In progress" : ""}</span>
          </li>
        );
      })}
    </ol>
  </div>
);

const Process = () => {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <section className="section section-slate" aria-labelledby="process-title">
      <div className="wrap">
        <div className="section-head">
          <h2 id="process-title">From first call to first clean in 10 days</h2>
          <p>Four steps, and you know who is on your floor at each one.</p>
        </div>
        <ol className="steps" ref={ref}>
          <motion.span className="steps-fill" style={{ scaleX }} aria-hidden="true" />
          {STEPS.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export const Home = () => {
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState(reduced ? ROOMS.length : 0);
  const onRoom = useCallback((room: number) => setCurrent(room), []);

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1>Spotless spaces. Serious business.</h1>
            <p className="lede">We show up. We clean. You notice. Nightly cleaning for offices, clinics, and retail floors, signed off room by room before your first person walks in.</p>
            <div className="hero-actions">
              <Link to="/quote" className="btn btn-primary">Build a quote</Link>
              <Link to="/portal" className="btn btn-ghost">Open the client portal</Link>
            </div>
            <Checklist current={current} />
          </div>
          <figure className="hero-stage">
            <div className="stage-canvas">
              <Suspense fallback={<div className="stage-loading">Loading floor plan</div>}>
                <FloorScene reduced={reduced} onRoom={onRoom} />
              </Suspense>
            </div>
            <figcaption>Live model of a nightly clean. The sparkle is your crew; rooms turn white as they’re signed off.</figcaption>
          </figure>
        </div>
      </section>

      <section className="proof" aria-label="Clearline by the numbers">
        <div className="wrap proof-grid">
          <div><b><CountUp to={1.2} decimals={1} suffix="M" /></b><span>square feet cleaned every night</span></div>
          <div><b><CountUp to={98.6} decimals={1} /></b><span>average monthly audit score</span></div>
          <div><b><CountUp to={24} suffix=" hr" /></b><span>re-clean guarantee on anything missed</span></div>
          <div><b><CountUp to={92} suffix="%" /></b><span>Green Seal or Safer Choice products</span></div>
        </div>
      </section>

      <section className="section" aria-labelledby="spaces-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="spaces-title">Built around the space you run</h2>
            <p>A clinic is not an office, and a sales floor is not a clinic. Each plan starts from what your space needs.</p>
          </div>
          <div className="space-grid">
            {SPACES.map((s) => (
              <Link key={s.id} to={`/services/${s.id}`} className="space-card">
                <h3>{s.name}</h3>
                <p>{s.blurb}</p>
                <ul>
                  {s.cadence[0]!.tasks.slice(0, 3).map((t) => <li key={t}>{t}</li>)}
                </ul>
                <span className="space-link">See the full {s.short.toLowerCase()} plan</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Process />

      <section className="section" aria-labelledby="portal-title">
        <div className="wrap portal-teaser">
          <div>
            <h2 id="portal-title">Every clean, on the record</h2>
            <p>Your client portal shows last night’s sign-offs, photo reports, monthly audit scores, and any issue you’ve logged, with who fixed it and when.</p>
            <Link to="/portal" className="btn btn-primary">Try the demo portal</Link>
          </div>
          <div className="teaser-card" aria-hidden="true">
            <div className="teaser-row"><span>Last night</span><b>8 of 8 rooms</b></div>
            <div className="teaser-row"><span>Audit score, Sept</span><b>97.4</b></div>
            <div className="teaser-row"><span>Open issues</span><b>1</b></div>
            <svg viewBox="0 0 300 80" className="teaser-spark">
              <path d="M0 60 L25 52 L50 56 L75 40 L100 44 L125 30 L150 34 L175 22 L200 26 L225 18 L250 20 L275 12 L300 14" fill="none" stroke="#00B8A9" strokeWidth="3" />
            </svg>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap cta-inner">
          <h2>Know your monthly price in two minutes</h2>
          <Link to="/quote" className="btn btn-primary">Start the quote builder</Link>
        </div>
      </section>
    </>
  );
};
