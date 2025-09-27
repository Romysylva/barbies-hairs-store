import { useGlobal } from "./hooks/useGlobal";

const GlobalError = () => {
  const { error, clearError } = useGlobal();

  if (!error) return null;

  return (
    <div className="bhs:fixed bhs:bottom-4 bhs:left-4 bhs:bg-red-500 bhs:text-white bhs:p-4 bhs:rounded bhs:shadow-lg bhs:z-50">
      <p>{error}</p>
      <button
        onClick={clearError}
        className="bhs:mt-2 bhs:px-4 bhs:py-2 bhs:bg-white bhs:text-red-500 bhs:rounded"
      >
        Dismiss
      </button>
    </div>
  );
};

export default GlobalError;
