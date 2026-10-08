import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { productById } from "../data";
import { useBag } from "../store";
import { GarmentArt } from "./GarmentArt";

/** Native <dialog> gives us the focus trap, Esc to close, and inert page behind it for free. */
export const BagDrawer = () => {
  const open = useBag((s) => s.open);
  const setOpen = useBag((s) => s.setOpen);
  const lines = useBag((s) => s.lines);
  const setQty = useBag((s) => s.setQty);
  const remove = useBag((s) => s.remove);
  const dialog = useRef<HTMLDialogElement>(null);
  const [checkedOut, setCheckedOut] = useState(false);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) { d.showModal(); setCheckedOut(false); }
    if (!open && d.open) d.close();
  }, [open]);

  const subtotal = lines.reduce((sum, l) => sum + (productById(l.productId)?.price ?? 0) * l.qty, 0);
  const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 8;

  return (
    <dialog ref={dialog} className="bag" aria-labelledby="bag-title" onClose={() => setOpen(false)} onClick={(e) => { if (e.target === dialog.current) setOpen(false); }}>
      <div className="bag-inner">
        <div className="bag-head">
          <h2 id="bag-title">Your bag</h2>
          <button className="bag-close" type="button" onClick={() => setOpen(false)} aria-label="Close bag">
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 3l14 14M17 3 3 17" stroke="currentColor" strokeWidth="2.5" /></svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="bag-empty">
            <p>Bag’s empty. Drop 06 won’t be here long.</p>
            <Link to="/shop" className="btn btn-bone" onClick={() => setOpen(false)}>Shop Drop 06</Link>
          </div>
        ) : (
          <>
            <ul className="bag-items">
              <AnimatePresence initial={false}>
                {lines.map((l) => {
                  const p = productById(l.productId);
                  if (!p) return null;
                  return (
                    <motion.li key={l.key} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
                      <div className="bag-thumb"><GarmentArt type={p.type} fill={p.fill} ink={p.ink} /></div>
                      <div className="bag-info">
                        <b>{p.name}</b>
                        <small>{p.color}, size {l.size}</small>
                        <div className="qty" role="group" aria-label={`Quantity of ${p.name}`}>
                          <button type="button" onClick={() => setQty(l.key, l.qty - 1)} disabled={l.qty <= 1} aria-label="One fewer">−</button>
                          <output>{l.qty}</output>
                          <button type="button" onClick={() => setQty(l.key, l.qty + 1)} disabled={l.qty >= 3} aria-label="One more">+</button>
                        </div>
                        <button className="bag-remove" type="button" onClick={() => remove(l.key)}>Remove</button>
                      </div>
                      <span className="bag-price">${p.price * l.qty}</span>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
            <div className="bag-foot">
              <p className="bag-limit">Limit 3 per size. It keeps the bots honest.</p>
              <div className="bag-row"><span>Subtotal</span><span>${subtotal}</span></div>
              <div className="bag-row"><span>Shipping</span><span>{shipping ? `$${shipping}` : "Free"}</span></div>
              <div className="bag-total"><span>Total</span><b>${subtotal + shipping}</b></div>
              <button className="btn btn-red btn-block" type="button" onClick={() => setCheckedOut(true)}>{checkedOut ? "Order not placed" : "Check out"}</button>
              <p className="bag-note" aria-live="polite">{checkedOut ? "Demo store. No order was placed and no payment taken." : subtotal < 150 ? `$${150 - subtotal} more for free shipping.` : "Free shipping unlocked."}</p>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
};
