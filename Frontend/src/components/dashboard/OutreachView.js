import React from 'react';

export function OutreachView({ sequences, activities, leads, onCreateSequence, onUpdateSequence, onDeleteSequence, onNavigateToSequenceCreation, onNavigateToLegacyCreation }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Email Sequences</h1>
      <p className="text-muted-foreground mb-6">Manage your email outreach sequences.</p>
      
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">All Sequences</h2>
          <button 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            onClick={onNavigateToSequenceCreation}
          >
            Create Sequence
          </button>
        </div>
        
        <div className="space-y-2">
          {sequences.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No sequences created yet.</p>
          ) : (
            sequences.map((sequence) => (
              <div key={sequence.id} className="p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{sequence.name}</h3>
                    <p className="text-sm text-muted-foreground">{sequence.description}</p>
                    <p className="text-xs text-muted-foreground">{sequence.leads.length} leads, {sequence.emails.length} emails</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-primary hover:text-primary/80">Edit</button>
                    <button className="text-red-600 hover:text-red-700">Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
