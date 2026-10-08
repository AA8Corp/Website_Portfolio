import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { AnimatedNumber } from "../../shared/AnimatedNumber";
import { formatUsd } from "../../shared/money";
import { SPACES } from "../data";
import { ADD_ONS, priceQuote } from "../pricing";
import { useQuote } from "../store";

const STEP_NAMES = ["Space", "Size", "Schedule", "Contact"];
const VISIT_OPTIONS = [1, 3, 5, 7];

const SpaceStep = () => {
  const space = useQuote((s) => s.space);
  const setSpace = useQuote((s) => s.setSpace);
  return (
    <fieldset className="wizard-field">
      <legend>What kind of space is it?</legend>
      <div className="choice-grid">
        {SPACES.map((s) => (
          <label key={s.id} className={`choice${space === s.id ? " is-checked" : ""}`}>
            <input type="radio" name="space" value={s.id} checked={space === s.id} onChange={() => setSpace(s.id)} />
            <span className="choice-title">{s.name}</span>
            <span className="choice-body">{s.blurb}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};

const SizeStep = () => {
  const sqft = useQuote((s) => s.sqft);
  const restrooms = useQuote((s) => s.restrooms);
  const setNumber = useQuote((s) => s.setNumber);
  return (
    <div className="wizard-field">
      <div className="range-field">
        <label htmlFor="sqft">Floor area <output htmlFor="sqft">{sqft.toLocaleString("en-US")} sq ft</output></label>
        <input id="sqft" type="range" min={1000} max={60000} step={500} value={sqft} onChange={(e) => setNumber("sqft", Number(e.target.value))} />
        <div className="range-scale" aria-hidden="true"><span>1,000</span><span>60,000</span></div>
      </div>
      <div className="stepper-field">
        <span id="restrooms-label">Restrooms</span>
        <div className="stepper" role="group" aria-labelledby="restrooms-label">
          <button type="button" onClick={() => setNumber("restrooms", Math.max(0, restrooms - 1))} aria-label="Remove a restroom" disabled={restrooms === 0}>−</button>
          <output aria-live="polite">{restrooms}</output>
          <button type="button" onClick={() => setNumber("restrooms", Math.min(30, restrooms + 1))} aria-label="Add a restroom">+</button>
        </div>
      </div>
    </div>
  );
};

const ScheduleStep = () => {
  const visits = useQuote((s) => s.visits);
  const addOns = useQuote((s) => s.addOns);
  const setNumber = useQuote((s) => s.setNumber);
  const toggleAddOn = useQuote((s) => s.toggleAddOn);
  return (
    <div className="wizard-field">
      <fieldset>
        <legend>Visits per week</legend>
        <div className="segmented">
          {VISIT_OPTIONS.map((v) => (
            <label key={v}>
              <input type="radio" name="visits" checked={visits === v} onChange={() => setNumber("visits", v)} />
              <span>{v}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Add-ons</legend>
        <div className="addon-list">
          {ADD_ONS.map((a) => (
            <label key={a.id} className={`addon${addOns.includes(a.id) ? " is-checked" : ""}`}>
              <input type="checkbox" checked={addOns.includes(a.id)} onChange={() => toggleAddOn(a.id)} />
              <span className="addon-text"><b>{a.name}</b><span>{a.detail}</span></span>
              <span className="addon-price">+{formatUsd(a.monthly)}/mo</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
};

type Errors = Partial<Record<"name" | "email", string>>;

const validate = (name: string, email: string): Errors => {
  const errors: Errors = {};
  if (name.trim().length < 2) errors.name = "Enter your name so we know who to ask for.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Enter an email like name@company.com.";
  return errors;
};

const ContactStep = ({ errors, onBlurField }: { errors: Errors; onBlurField: (field: "name" | "email") => void }) => {
  const contact = useQuote((s) => s.contact);
  const setContact = useQuote((s) => s.setContact);
  return (
    <div className="wizard-field contact-fields">
      <div className="field">
        <label htmlFor="q-name">Your name</label>
        <input id="q-name" autoComplete="name" value={contact.name} onChange={(e) => setContact({ name: e.target.value })} onBlur={() => onBlurField("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "q-name-err" : undefined} />
        {errors.name && <p className="error" id="q-name-err">{errors.name}</p>}
      </div>
      <div className="field">
        <label htmlFor="q-company">Company or site <span className="optional">optional</span></label>
        <input id="q-company" autoComplete="organization" value={contact.company} onChange={(e) => setContact({ company: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="q-email">Work email</label>
        <input id="q-email" type="email" autoComplete="email" value={contact.email} onChange={(e) => setContact({ email: e.target.value })} onBlur={() => onBlurField("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "q-email-err" : undefined} />
        {errors.email && <p className="error" id="q-email-err">{errors.email}</p>}
      </div>
    </div>
  );
};

const Summary = () => {
  const { space, sqft, restrooms, visits, addOns } = useQuote();
  const q = useMemo(() => priceQuote({ space, sqft, restrooms, visits, addOns }), [space, sqft, restrooms, visits, addOns]);
  const spaceName = SPACES.find((s) => s.id === space)?.short ?? "";
  return (
    <aside className="summary" aria-live="polite">
      <p className="summary-label">Estimated monthly</p>
      <p className="summary-price">
        <AnimatedNumber value={q.low} format={formatUsd} /> – <AnimatedNumber value={q.high} format={formatUsd} />
      </p>
      <dl className="summary-lines">
        <div><dt>{spaceName}, {sqft.toLocaleString("en-US")} sq ft</dt><dd>{formatUsd(q.base)}</dd></div>
        <div><dt>{restrooms} restroom{restrooms === 1 ? "" : "s"}</dt><dd>{formatUsd(q.restrooms)}</dd></div>
        <div><dt>Add-ons</dt><dd>{formatUsd(q.addOns)}</dd></div>
        <div><dt>Per visit, about</dt><dd>{formatUsd(q.perVisit)}</dd></div>
      </dl>
      <p className="summary-note">{visits} visits a week. Final price is fixed after a free walkthrough.</p>
    </aside>
  );
};

export const Quote = () => {
  const step = useQuote((s) => s.step);
  const goTo = useQuote((s) => s.goTo);
  const submitted = useQuote((s) => s.submitted);
  const submit = useQuote((s) => s.submit);
  const reset = useQuote((s) => s.reset);
  const contact = useQuote((s) => s.contact);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [direction, setDirection] = useState(1);

  const allErrors = validate(contact.name, contact.email);
  const shownErrors: Errors = {
    name: touched.name ? allErrors.name : undefined,
    email: touched.email ? allErrors.email : undefined,
  };

  const move = (to: number) => { setDirection(to > step ? 1 : -1); goTo(to); };
  const last = step === STEP_NAMES.length - 1;

  const onNext = () => {
    if (!last) return move(step + 1);
    setTouched({ name: true, email: true });
    if (Object.keys(allErrors).length === 0) submit();
    else document.getElementById(allErrors.name ? "q-name" : "q-email")?.focus();
  };

  if (submitted) {
    return (
      <section className="section quote">
        <div className="wrap quote-done">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="done-mark" aria-hidden="true" />
          <h1>Walkthrough requested</h1>
          <p>Thanks, {contact.name.split(" ")[0]}. A supervisor will call within one business day to pick a time. This is a demo, so nothing was sent.</p>
          <div className="done-summary"><Summary /></div>
          <button className="btn btn-ghost" onClick={() => { reset(); setTouched({}); }}>Start a new quote</button>
        </div>
      </section>
    );
  }

  const steps = [<SpaceStep key="space" />, <SizeStep key="size" />, <ScheduleStep key="schedule" />, <ContactStep key="contact" errors={shownErrors} onBlurField={(f) => setTouched((t) => ({ ...t, [f]: true }))} />];

  return (
    <section className="section quote">
      <div className="wrap">
        <div className="section-head">
          <h1>Quote builder</h1>
          <p>Four quick steps. Your answers are saved on this device if you leave and come back.</p>
        </div>
        <div className="quote-grid">
          <form className="wizard" onSubmit={(e) => { e.preventDefault(); onNext(); }} noValidate>
            <ol className="wizard-steps">
              {STEP_NAMES.map((name, i) => (
                <li key={name} className={i === step ? "is-current" : i < step ? "is-done" : undefined}>
                  <button type="button" onClick={() => move(i)} disabled={i > step} aria-current={i === step ? "step" : undefined}>
                    <span className="step-num">{i + 1}</span>{name}
                  </button>
                </li>
              ))}
            </ol>
            <div className="wizard-body">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={step}
                  custom={direction}
                  initial={{ opacity: 0, x: 24 * direction }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 * direction }}
                  transition={{ duration: 0.22 }}
                >
                  {steps[step]}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="wizard-nav">
              {step > 0 ? <button type="button" className="btn btn-ghost" onClick={() => move(step - 1)}>Back</button> : <span />}
              <button type="submit" className="btn btn-primary">{last ? "Request walkthrough" : `Continue to ${STEP_NAMES[step + 1]!.toLowerCase()}`}</button>
            </div>
          </form>
          <Summary />
        </div>
      </div>
    </section>
  );
};
