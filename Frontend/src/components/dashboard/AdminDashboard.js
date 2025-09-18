import React from 'react';

export function AdminDashboard({ users, leads, campaigns, sequences, activities, systemActivities, currentUser }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">System administration and monitoring.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Total Leads</h3>
          <p className="text-2xl font-bold">{leads.length}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Active Campaigns</h3>
          <p className="text-2xl font-bold">{campaigns.length}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">System Activities</h3>
          <p className="text-2xl font-bold">{systemActivities.length}</p>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">System Overview</h2>
        <p className="text-muted-foreground">Admin dashboard features coming soon...</p>
      </div>
    </div>
  );
}
