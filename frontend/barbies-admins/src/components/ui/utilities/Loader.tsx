// components/ui/Loader.tsx
const Loader = () => (
  <div className="bhs:flex bhs:justify-center bhs:items-center bhs:py-4">
    <div className="bhs:w-8 bhs:h-8 bhs:border-4 bhs:border-purple-400 bhs:border-t-transparent bhs:rounded-full bhs:animate-spin"></div>
  </div>
);

export default Loader;

// usage

// {isLoading ? <Loader/> : <ProductList/>}

// import Spinner from "@/components/ui/Spinner";

// const ProductLoader = () => {
//   const isLoading = true;

//   return (
//     <div className="min-h-[200px] flex items-center justify-center">
//       {isLoading && <Spinner />}
//     </div>
//   );
// };
