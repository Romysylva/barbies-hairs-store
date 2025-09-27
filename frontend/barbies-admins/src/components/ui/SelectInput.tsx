"use client";

import { useState } from "react";
import Label from "./Label"; // adjust path

export default function UserRoleSelect() {
  const [role, setRole] = useState("");

  return (
    <div className="bhs:grid bhs:gap-2">
      <Label required={true}>User Roles</Label>
      <select
        className="custom-select appearance-none cursor-pointer"
        name="roles"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">Select User Roles</option>
        <option value="Super Admin">Super Admin</option>
        <option value="admin">admin</option>
        <option value="manager">manager</option>
        <option value="user">user</option>
      </select>

      {/* 👇 Optional: Show current value */}
      {/* {role && (
        <p className="bhs:text-sm bhs:text-gray-500">
          Selected Role: <span className="bhs:font-semibold">{role}</span>
        </p>
      )} */}
    </div>
  );
}
