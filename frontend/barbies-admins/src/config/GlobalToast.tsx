import { useState } from "react";
import Toast from "../components/utilities/Toast";
import Button from "../components/utilities/Button";

const GlobalToast = () => {
  const [showToast, setShowToast] = useState(false);

  const handleClick = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleClick}>Show Toast</Button>
      {showToast && (
        <Toast message="Action completed successfully!" type="success" />
      )}
    </div>
  );
};

export default GlobalToast;
