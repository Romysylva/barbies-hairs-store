import { useGlobal } from "./hooks/useGlobal";

const GlobalLoading = () => {
  const { isLoading } = useGlobal();

  if (!isLoading) return null;

  return (
    <div className="bhs:fixed bhs:inset-0 bhs:bg-black bhs:bg-opacity-50 bhs:flex items-center justify-center z-50">
      <div className="bhs:loader bhs:border-t-4 bhs:border-blue-500 bhs:rounded-full bhs:w-12 bhs:h-12 bhs:animate-spin"></div>
    </div>
  );
};

export default GlobalLoading;
