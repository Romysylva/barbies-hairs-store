import { useState } from "react";
import type { ReactNode } from "react";
import Toast from "../components/utilities/Toast";
import { ToastContext } from "../config/ToastContext";
import type { ToastType } from "../config/ToastContext";

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("success");

  const showToast = (msg: string, toastType: ToastType = "success") => {
    setMessage(msg);
    setType(toastType);
    setVisible(true);
    setTimeout(() => setVisible(false), 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && <Toast message={message} type={type} />}
    </ToastContext.Provider>
  );
};
