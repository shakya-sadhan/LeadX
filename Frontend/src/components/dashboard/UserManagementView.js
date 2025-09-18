import React from 'react';

export function UserManagementView({ users, currentUser, onCreateUser, onUpdateUser, onDeleteUser, systemActivities }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <p className="text-muted-foreground mb-6">Manage team members and permissions.</p>
      
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">All Users ({users.length})</h2>
          <button 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            onClick={onCreateUser}
          >
            Add User
          </button>
        </div>
        
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="p-4 border rounded-lg hover:bg-muted/50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">{user.role} • {user.department}</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-primary hover:text-primary/80">Edit</button>
                  <button className="text-red-600 hover:text-red-700">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
