import React from 'react';

export function StepSequenceBuilder({ leads, onSave, onCancel, preselectedLeads }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sequence Builder</h1>
      <p className="text-muted-foreground mb-6">Build your email sequence step by step.</p>
      
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Sequence Steps</h2>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Step 1: Initial Email</h3>
            <div className="space-y-2">
              <input 
                type="text" 
                className="w-full p-2 border rounded-md"
                placeholder="Email subject"
              />
              <textarea 
                className="w-full p-2 border rounded-md"
                placeholder="Email content"
                rows="4"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
              onClick={onSave}
            >
              Save Sequence
            </button>
            <button 
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
