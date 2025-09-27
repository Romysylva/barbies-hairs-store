import { useContext } from "react";
import { UserContext } from "../config/userContext";

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UseProvider");
  }
  return context;
};
