import React from 'react';

export function EmailSequenceCreationView({ leads, onBack, onCreateSequence, preselectedLeads }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Email Sequence</h1>
      <p className="text-muted-foreground mb-6">Create a new email outreach sequence.</p>
      
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Sequence Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sequence Name</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md"
              placeholder="Enter sequence name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea 
              className="w-full p-2 border rounded-md"
              placeholder="Enter sequence description"
              rows="3"
            />
          </div>
          <div className="flex gap-2">
            <button 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
              onClick={onCreateSequence}
            >
              Create Sequence
            </button>
            <button 
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              onClick={onBack}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
