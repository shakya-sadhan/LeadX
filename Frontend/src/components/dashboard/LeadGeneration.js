import React from 'react';

export function LeadGeneration({ 
  onLeadsGenerated, 
  stagedLeads, 
  onStageLeads, 
  onMoveStagedLeadsToDatabase, 
  onStartNewChat 
}) {
  return (
    <div className="p-6 w-full h-full">
      <h1 className="text-2xl font-bold mb-4">AI Lead Generation</h1>
      <p className="text-muted-foreground mb-6">
        Generate high-quality leads using AI-powered tools.
      </p>
      
      <div className="bg-card p-6 rounded-lg border w-full">
        <h2 className="text-lg font-semibold mb-4">Lead Generation Tools</h2>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">AI Chat Assistant</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Chat with our AI to generate targeted leads based on your criteria.
            </p>
            <button 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
              onClick={() => {
                // Simulate generating leads
                const mockLeads = [
                  {
                    name: "John Doe",
                    title: "VP of Sales",
                    company: "TechCorp",
                    email: "john.doe@techcorp.com",
                    industry: "Technology",
                    location: "San Francisco, CA",
                    description: "Experienced sales leader with 10+ years in tech",
                    score: 85,
                    tags: ["VP", "Sales", "Tech"]
                  }
                ];
                onLeadsGenerated(mockLeads, "AI Generated Leads");
              }}
            >
              Start AI Chat
            </button>
          </div>
          
          {stagedLeads.length > 0 && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-medium mb-2">Staged Leads ({stagedLeads.length})</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Review and save your generated leads.
              </p>
              <div className="flex gap-2">
                <button 
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  onClick={onMoveStagedLeadsToDatabase}
                >
                  Save to Database
                </button>
                <button 
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  onClick={onStartNewChat}
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
