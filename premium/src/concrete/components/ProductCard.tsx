import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Product } from "../data";
import { GarmentArt } from "./GarmentArt";

export const ProductCard = ({ product }: { product: Product }) => {
  const sold = product.left === 0;
  return (
    <motion.article layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }} className={`card${sold ? " is-sold" : ""}`}>
      <Link to={`/product/${product.id}`} className="card-link">
        <div className="card-art">
          {!sold && <span className={`tag${product.left <= 6 ? " is-low" : ""}`}>{product.left} left</span>}
          <GarmentArt type={product.type} fill={product.fill} ink={product.ink} label={`${product.name} in ${product.color}`} />
          {sold && <div className="stamp"><span>Sold out</span></div>}
        </div>
        <div className="card-info">
          <h3>{product.name}</h3>
          <span className="card-price">${product.price}</span>
          <p>{product.color}</p>
        </div>
      </Link>
    </motion.article>
  );
};
