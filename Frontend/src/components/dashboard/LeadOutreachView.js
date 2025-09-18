import React from 'react';

export function LeadOutreachView({ lead, onBack, onCreateSequence }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lead Outreach</h1>
      <p className="text-muted-foreground mb-6">Create outreach for {lead?.name}.</p>
      
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Lead Details</h2>
        {lead && (
          <div className="space-y-2">
            <p><strong>Name:</strong> {lead.name}</p>
            <p><strong>Title:</strong> {lead.title}</p>
            <p><strong>Company:</strong> {lead.company}</p>
            <p><strong>Email:</strong> {lead.email}</p>
          </div>
        )}
        
        <div className="mt-6">
          <button 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            onClick={onCreateSequence}
          >
            Create Outreach Sequence
          </button>
          <button 
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 ml-2"
            onClick={onBack}
          >
            Back to Leads
          </button>
        </div>
      </div>
    </div>
  );
}
