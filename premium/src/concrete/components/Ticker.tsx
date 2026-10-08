const ITEMS = ["Drop 07: Curb Series lands Friday 12 PM ET", "No restocks", "Heavyweight only", "Ships from the block"];

export const Ticker = () => (
  <div className="ticker" aria-label={ITEMS.join(". ")}>
    <div className="ticker-track" aria-hidden="true">
      {[...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS].map((t, i) => <span key={i}>{t}</span>)}
    </div>
  </div>
);
