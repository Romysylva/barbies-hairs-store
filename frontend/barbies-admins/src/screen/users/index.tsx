"use client";

import { useEffect, useState } from "react";
import { getUsers } from "@/services/services";
import Link from "next/link";

interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string;
  location: string;
}

export default function UserScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        console.log(data);
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p className="p-4">Loading users...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="bhs:p-4">
      {/* Header */}
      <div className="bhs:flex bhs:justify-between bhs:items-center">
        <h1 className="bhs:font-semibold bhs:text-2xl">User Management</h1>
        <Link href="/users/add" className="custom-primary-btn">
          Add User
        </Link>
      </div>

      <hr className="bhs:my-5" />

      {/* Table */}
      <div className="bhs:overflow-x-auto">
        <table className="custom-table bhs:w-full bhs:border-collapse">
          <thead className="bhs:border-y-2 bhs:border-pink-400">
            <tr>
              <th className="bhs:p-2 bhs:text-left">Name</th>
              <th className="bhs:p-2 bhs:text-left">Email</th>
              <th className="bhs:p-2 bhs:text-left">Role</th>
              <th className="bhs:p-2 bhs:text-left">Joined</th>
              <th className="bhs:p-2 bhs:text-left">Location</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} className="hover:bhs:bg-gray-50">
                  <td className="bhs:p-2">{user.name}</td>
                  <td className="bhs:p-2">{user.email}</td>
                  <td className="bhs:p-2">{user.roles.join(", ")}</td>
                  <td className="bhs:p-2">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="bhs:p-2">{user.location ?? "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="bhs:p-4 bhs:text-center">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
