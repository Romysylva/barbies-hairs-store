"use client";
import React from "react";
import { Sidebar } from "../Navigation/Sidebar";

// Test component to verify sidebar functionality
const SidebarTest: React.FC = () => {
  const [testUser, setTestUser] = React.useState<any>(null);

  const mockUsers = {
    admin: {
      _id: 'admin_1',
      name: 'Test Admin',
      email: 'admin@test.com',
      role: 'admin' as const,
      photo: undefined,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    manager: {
      _id: 'manager_1',
      name: 'Test Manager',
      email: 'manager@test.com',
      role: 'manager' as const,
      photo: undefined,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    user: {
      _id: 'user_1',
      name: 'Test User',
      email: 'user@test.com',
      role: 'user' as const,
      photo: undefined,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  };

  const handleLogout = async () => {
    console.log('Test logout');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Sidebar Test Component</h1>
      
      {/* User Selection */}
      <div className="mb-6 space-y-2">
        <h2 className="text-lg font-semibold">Test with different user roles:</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setTestUser(mockUsers.admin)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test as Admin
          </button>
          <button 
            onClick={() => setTestUser(mockUsers.manager)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test as Manager
          </button>
          <button 
            onClick={() => setTestUser(mockUsers.user)}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Test as User
          </button>
          <button 
            onClick={() => setTestUser(null)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Test with No User
          </button>
        </div>
      </div>

      {/* Current User Info */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold">Current Test User:</h3>
        <pre className="text-sm mt-2">
          {testUser ? JSON.stringify(testUser, null, 2) : 'No user selected'}
        </pre>
      </div>

      {/* Sidebar Test */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-3 border-b">
          <h3 className="font-semibold">Sidebar Component Test</h3>
        </div>
        <div className="h-96 bg-white">
          <Sidebar 
            user={testUser}
            onLogout={handleLogout}
            isCollapsed={false}
          />
        </div>
      </div>

      {/* Console Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800">Debug Instructions:</h3>
        <ol className="list-decimal list-inside text-sm text-yellow-700 mt-2 space-y-1">
          <li>Open browser developer console</li>
          <li>Select different user roles above</li>
          <li>Watch console logs for "Sidebar Debug Info" and "Filtered nav items"</li>
          <li>Verify menu items appear/disappear based on role</li>
          <li>Check for any styling issues or errors</li>
        </ol>
      </div>
    </div>
  );
};

export default SidebarTest;
