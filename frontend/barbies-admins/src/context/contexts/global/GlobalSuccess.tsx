import { useGlobal } from "./hooks/useGlobal";

const GlobalSuccess = () => {
  const { success, clearSuccess } = useGlobal();

  if (!success) return null;

  return (
    <div className="bhs:fixed bhs:bottom-4 bhs:left-4 bhs:bg-green-500 bhs:text-white bhs:p-4 rounded shadow-lg z-50">
      <p>{success}</p>
      <button
        onClick={clearSuccess}
        className="bhs:mt-2 bhs:px-4 bhs:py-2 bhs:bg-white bhs:text-green-500 bhs:rounded"
      >
        Dismiss
      </button>
    </div>
  );
};

export default GlobalSuccess;
