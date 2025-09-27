import { useNavigate } from "react-router-dom";
import Rating from "./Rating";
import type { Products } from "../../types/products";
import { baseUrl } from "../../lib/baseUrl";

export type ProductCardProps = {
  product: Products;
  onRate: (id: string, newRating: number) => void;
  children: React.ReactNode;
};

const ProductCard = ({ product, children, onRate }: ProductCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="bhs:relative bhs:cursor-pointer bhs:border bhs:rounded-xl bhs:overflow-hidden bhs:shadow-md bhs:bg-white bhs:hover:shadow-lg bhs:transition">
      {/* Cover image as background */}
      <div
        className="bhs:h-64 bhs:bg-cover bhs:bg-center bhs:relative"
        style={{
          backgroundImage: `url(${baseUrl}/uploads/${
            product.imageCover ?? "fallback.jpg"
          })`,
        }}
      >
        {/* Scrollable photo overlay */}
        <div className="bhs:absolute bhs:bottom-2 bhs:left-0 bhs:right-0 bhs:px-2 bhs:overflow-x-auto bhs:flex bhs:gap-2 bhs:scrollbar-hide">
          {product.photos?.map((photo, index) => (
            <img
              key={index}
              src={`${baseUrl}/uploads/${photo}`}
              alt={`photo-${index}`}
              className="bhs:h-14 bhs:w-20 bhs:object-cover bhs:rounded bhs:transition-transform bhs:duration-300 hover:bhs:scale-[4] hover:bhs:z-50 hover:bhs:absolute hover:bhs:top-0 hover:bhs:left-0"
            />
          ))}
        </div>
      </div>

      <div className="bhs:p-4">
        <h3 className="bhs:text-lg bhs:font-semibold bhs:truncate">
          {product.name}
          <span className="bhs:pl-3 bhs:text-barbiesPink">
            {product.hairLenght}
          </span>
        </h3>
        <h3 className="bhs:text-base bhs:font-normal bhs:truncate">
          {product.description}
        </h3>
        <p className="bhs:text-barbiePurple bhs:font-bold bhs:text-sm">
          <span className="bhs:text-barbiesPink">Price: </span>₦
          {product.price.toLocaleString()}
        </p>
        <p>
          <span className="bhs:text-barbiesPink">Category: </span>
          {product.category}
        </p>
        <p>
          <span className="bhs:text-barbiesPink">Quantity: </span>
          {product.quantity} available
        </p>
        <p>
          <span className="bhs:text-barbiesPink">Status: </span>
          {product.inStock ? "✅ In Stock" : "❌ Out of Stock"}
        </p>
      </div>

      <div className="bhs:flex bhs:justify-between bhs:items-center bhs:px-4 bhs:py-2">
        <Rating
          value={product.rating}
          onRate={(newRating) => onRate?.(product.id, newRating)}
        />
        <button
          onClick={() => navigate(`/products/${product.id}`)}
          className="bhs:bg-pink-500 bhs:text-white bhs:py-1 bhs:px-3 bhs:rounded"
        >
          View Details
        </button>
      </div>

      {children}
    </div>
  );
};

export default ProductCard;

// // Great! Since you said yes, you want the Rating stars to be interactive — meaning a user can click to rate a product (e.g., in a review or feedback flow). Here's how we can handle it:

// import { useNavigate } from "react-router-dom";
// import Rating from "./Rating";
// import type { Products } from "../../types/products";
// import { baseUrl } from "../../lib/baseUrl";

// export type ProductCardProps = {
//   product: Products;
//   onRate: (id: string, newRating: number) => void;
//   children: React.ReactNode;
// };

// const ProductCard = ({ product, children, onRate }: ProductCardProps) => {
//   const navigate = useNavigate();

//   const coverImage = `${baseUrl}/uploads/${
//     product.imageCover ?? "fallback.jpg"
//   }`;
//   const photoImages = product.photos?.map(
//     (photo) => `${baseUrl}/uploads/${photo}`
//   );

//   return (
//     <div className="bhs:relative bhs:cursor-pointer bhs:border bhs:rounded-xl bhs:overflow-hidden bhs:shadow-md bhs:bg-white bhs:hover:shadow-lg bhs:transition">
//       {/* Cover image as background */}
//       <div
//         className="bhs:h-56 bhs:bg-cover bhs:bg-center bhs:relative"
//         style={{
//           backgroundImage: `url(${coverImage})`,
//         }}
//       >
//         {/* Scrollable overlay of photos */}
//         {photoImages && photoImages.length > 0 && (
//           <div className="bhs:absolute bhs:bottom-0 bhs:left-0 bhs:right-0 bhs:bg-black/40 bhs:overflow-x-auto bhs:flex bhs:space-x-2 bhs:p-2 scrollbar-hide">
//             {photoImages.map((photo, index) => (
//               <img
//                 key={index}
//                 src={photo}
//                 alt={`Photo ${index + 1}`}
//                 className="bhs:h-16 bhs:w-16 bhs:object-cover bhs:rounded-md bhs:border bhs:border-white bhs:shrink-0"
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       <div className="bhs:p-4">
//         <h3 className="bhs:text-lg bhs:font-semibold bhs:truncate">
//           {product.name}
//           <span className="bhs:pl-3 bhs:text-barbiesPink">
//             {product.hairLenght}
//           </span>
//         </h3>
//         <p className="bhs:text-sm bhs:text-gray-700">{product.description}</p>
//         <p className="bhs:text-barbiePurple bhs:font-bold bhs:text-sm">
//           <span className="bhs:text-barbiesPink">Price: </span>₦
//           {product.price.toLocaleString()}
//         </p>
//         <p>
//           <span className="bhs:text-barbiesPink">Category: </span>{" "}
//           {product.category}
//         </p>
//         <p>
//           <span className="bhs:text-barbiesPink">Quantity: </span>{" "}
//           {product.quantity} available
//         </p>
//         <p className="bhs:text-sm">
//           <span className="bhs:text-barbiesPink">Status: </span>{" "}
//           {product.inStock ? "✅ In Stock" : "❌ Out of Stock"}
//         </p>
//       </div>

//       <div className="bhs:flex bhs:justify-between bhs:items-center bhs:px-4 bhs:py-2">
//         <Rating
//           value={product.rating}
//           onRate={(newRating) => onRate?.(product.id, newRating)}
//         />
//         <button
//           onClick={() => navigate(`/products/${product.id}`)}
//           className="bhs:bg-pink-500 bhs:text-white bhs:py-0.5 bhs:px-2 bhs:rounded"
//         >
//           View Details
//         </button>
//       </div>

//       {children}
//     </div>
//   );
// };

// export default ProductCard;
