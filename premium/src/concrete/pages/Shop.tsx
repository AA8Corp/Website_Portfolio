import { AnimatePresence, LayoutGroup } from "framer-motion";
import { useMemo, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { PRODUCTS, type Category } from "../data";

type Filter = "all" | Category | "available";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "headwear", label: "Headwear" },
  { id: "available", label: "Still available" },
];
type Sort = "drop" | "low" | "high" | "scarce";

export const Shop = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("drop");

  const shown = useMemo(() => {
    const list = PRODUCTS.filter((p) => (filter === "all" ? true : filter === "available" ? p.left > 0 : p.category === filter));
    const sorted = [...list];
    if (sort === "low") sorted.sort((a, b) => a.price - b.price);
    if (sort === "high") sorted.sort((a, b) => b.price - a.price);
    if (sort === "scarce") sorted.sort((a, b) => (a.left || 999) - (b.left || 999));
    return sorted;
  }, [filter, sort]);

  return (
    <section className="shop">
      <div className="bar">
        <h1>Shop Drop 06</h1>
        <p>{PRODUCTS.filter((p) => p.left > 0).length} of {PRODUCTS.length} still in stock. When it’s gone, it’s gone.</p>
      </div>
      <div className="shop-tools">
        <div className="chips" role="group" aria-label="Filter">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className={`chip${filter === f.id ? " is-on" : ""}`} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>
          ))}
        </div>
        <label className="sort">
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="drop">Drop order</option>
            <option value="scarce">Fewest left</option>
            <option value="low">Price, low to high</option>
            <option value="high">Price, high to low</option>
          </select>
        </label>
      </div>
      <LayoutGroup>
        <div className="grid grid-4">
          <AnimatePresence mode="popLayout">
            {shown.map((p) => <ProductCard key={p.id} product={p} />)}
          </AnimatePresence>
        </div>
      </LayoutGroup>
      {shown.length === 0 && (
        <div className="shop-empty">
          <p>Nothing left in that category.</p>
          <button type="button" className="btn btn-bone" onClick={() => setFilter("all")}>Show everything</button>
        </div>
      )}
    </section>
  );
};
