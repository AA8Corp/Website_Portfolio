import { motion } from "framer-motion";
import { Suspense, lazy, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useReducedMotion } from "../../shared/useReducedMotion";
import { ProductCard } from "../components/ProductCard";
import { PRODUCTS, productById } from "../data";
import { useBag } from "../store";

const ClothViewer = lazy(() => import("../scene/ClothViewer").then((m) => ({ default: m.ClothViewer })));

export const ProductPage = () => {
  const { id } = useParams();
  const product = productById(id);
  const reduced = useReducedMotion();
  const add = useBag((s) => s.add);
  const setOpen = useBag((s) => s.setOpen);
  const [size, setSize] = useState<string | null>(null);
  const [hint, setHint] = useState("");

  if (!product) {
    return (
      <section className="not-found">
        <h1>That piece isn’t here</h1>
        <p>It may have been from an old drop. Everything live is in the shop.</p>
        <Link to="/shop" className="btn btn-bone">Go to the shop</Link>
      </section>
    );
  }

  const sold = product.left === 0;
  const pctLeft = product.left / product.made;
  const backdrop = product.fill === "#111111" || product.fill === "#1d1d1d" || product.fill === "#2a2a2a" ? "#2a2a2a" : "#1a1a1a";
  const onlySize = product.sizes.length === 1 ? product.sizes[0]! : null;
  const chosen = size ?? onlySize;

  const addToBag = () => {
    if (!chosen) { setHint("Pick a size first."); return; }
    add(product.id, chosen);
    setOpen(true);
  };

  return (
    <>
      <section className="pdp">
        <div className="pdp-stage">
          <Suspense fallback={<div className="stage-loading">Hanging it up</div>}>
            <ClothViewer type={product.type} fill={product.fill} ink={product.ink} backdrop={backdrop} reduced={reduced} />
          </Suspense>
          <p className="pdp-hint" aria-hidden="true">Drag to turn it. Move the cursor to stir it.</p>
          {sold && <div className="stamp stamp-lg"><span>Sold out</span></div>}
        </div>

        <div className="pdp-info">
          <p className="crumbs"><Link to="/shop">Shop</Link> / {product.category}</p>
          <h1>{product.name}</h1>
          <p className="pdp-price">${product.price} <span>{product.color}</span></p>
          <p className="pdp-blurb">{product.blurb}</p>

          <div className="stock">
            <div className="stock-top"><span>{sold ? "All gone" : `${product.left} of ${product.made} left`}</span><span>Drop 06</span></div>
            <div className="stock-bar"><motion.span initial={{ scaleX: 0 }} animate={{ scaleX: pctLeft }} transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }} /></div>
          </div>

          <fieldset className="sizes" disabled={sold}>
            <legend>Size</legend>
            <div className="size-row">
              {product.sizes.map((s) => {
                const out = product.out.includes(s);
                return (
                  <label key={s} className={out ? "is-out" : undefined}>
                    <input type="radio" name="size" value={s} disabled={out} checked={chosen === s} onChange={() => { setSize(s); setHint(""); }} />
                    <span>{s}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <p className="size-hint" role="status">{hint}</p>

          <button type="button" className="btn btn-red btn-block btn-xl" disabled={sold} onClick={addToBag}>{sold ? "Sold out, no restock" : "Add to bag"}</button>

          <div className="specs">
            <details open><summary>Fabric</summary><p>{product.fabric}</p></details>
            <details><summary>Fit</summary><p>{product.fit}</p></details>
            <details><summary>Shipping</summary><p>Ships in 2 business days from the block. Free over $150. Final sale on drop pieces.</p></details>
          </div>
        </div>
      </section>

      <section className="strip-section" aria-labelledby="more-title">
        <div className="bar"><h2 id="more-title">Also in Drop 06</h2></div>
        <div className="grid grid-4">
          {PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </>
  );
};
