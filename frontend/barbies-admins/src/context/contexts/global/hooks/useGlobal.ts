import { useContext } from "react";
import { GlobalContext } from "../config/globalContext";
import type { GlobalContextType } from "../types/globaltypes";

export const useGlobal = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
