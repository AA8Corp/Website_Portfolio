import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, type FormEvent } from "react";
import { GarmentArt } from "../components/GarmentArt";
import { pad, useCountdown } from "../components/useCountdown";
import { nextDrop } from "../data";

/** Each digit drops in like a stamped block when it changes. */
const Digits = ({ value, label }: { value: number; label: string }) => (
  <div className="cd-cell">
    <div className="cd-digits" aria-hidden="true">
      {pad(value).split("").map((ch, i) => (
        <span key={i} className="cd-digit">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={ch} initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>{ch}</motion.span>
          </AnimatePresence>
        </span>
      ))}
    </div>
    <span className="cd-label">{label}</span>
  </div>
);

const TEASERS = [
  { type: "hoodie" as const, name: "Curb Hoodie", note: "Asphalt black, 520 GSM" },
  { type: "pants" as const, name: "Gutter Cargo", note: "Faded concrete wash" },
  { type: "tee" as const, name: "Hazard Tee", note: "Reflective print" },
];

export const Drop = () => {
  const target = useMemo(nextDrop, []);
  const left = useCountdown(target);
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("Demo form. No texts are sent.");
  const [error, setError] = useState(false);
  const [joined, setJoined] = useState(false);
  const when = target.toLocaleString("en-US", { weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) {
      setError(true);
      setMsg("Enter a 10-digit phone number, like (555) 555-0123.");
      return;
    }
    setError(false);
    setJoined(true);
    setMsg("You’re on the list. Demo only, so no text is coming.");
  };

  return (
    <section className="drop">
      <div className="drop-head">
        <p className="drop-kicker">Drop 07</p>
        <h1>Curb Series</h1>
        <p className="drop-when">{when} ET. Three pieces. Under 300 each.</p>
      </div>

      <div className="cd-big" role="timer" aria-label={`${left.d} days, ${left.h} hours, ${left.m} minutes until Drop 07`}>
        <Digits value={left.d} label="Days" />
        <Digits value={left.h} label="Hours" />
        <Digits value={left.m} label="Minutes" />
        <Digits value={left.s} label="Seconds" />
      </div>

      <div className="teasers">
        {TEASERS.map((t) => (
          <div key={t.name} className="teaser">
            <div className="teaser-art"><GarmentArt type={t.type} fill="#2b2b2b" ink="#2b2b2b" /></div>
            <b>{t.name}</b>
            <span>{t.note}</span>
          </div>
        ))}
      </div>

      <form className="signup-form" onSubmit={submit} noValidate>
        <h2>Get the drop text</h2>
        <p>One text, 15 minutes before it goes live. Nothing else.</p>
        <label htmlFor="phone">Phone number</label>
        <div className="signup-row">
          <input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(555) 555-0123" value={phone} onChange={(e) => { setPhone(e.target.value); if (error && e.target.value.replace(/\D/g, "").length >= 10) { setError(false); setMsg("Demo form. No texts are sent."); } }} aria-invalid={error} aria-describedby="phone-msg" />
          <button className="btn btn-black" type="submit">{joined ? "On the list" : "Join the list"}</button>
        </div>
        <p id="phone-msg" className="signup-msg">{msg}</p>
      </form>
    </section>
  );
};
