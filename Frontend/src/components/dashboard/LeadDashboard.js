import React from 'react';

export function LeadDashboard({ 
  leads, 
  leadCategories, 
  onToggleStar, 
  onCreateCampaign, 
  onCreateOutreach, 
  onStartOutreach, 
  onNavigateToCampaignCreation, 
  onNavigateToSequenceCreation, 
  onAddLead, 
  onAddCategory, 
  onRemoveCategory, 
  onEditCategory 
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lead Database</h1>
      <p className="text-muted-foreground mb-6">
        Manage and organize your leads ({leads.length} total).
      </p>
      
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">All Leads</h2>
          <button 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            onClick={onAddLead}
          >
            Add Lead
          </button>
        </div>
        
        <div className="space-y-2">
          {leads.map((lead) => (
            <div key={lead.id} className="p-4 border rounded-lg hover:bg-muted/50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{lead.name}</h3>
                  <p className="text-sm text-muted-foreground">{lead.title} at {lead.company}</p>
                  <p className="text-xs text-muted-foreground">{lead.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Score: {lead.score}</span>
                  <button 
                    className="text-yellow-500 hover:text-yellow-600"
                    onClick={() => onToggleStar(lead.id)}
                  >
                    {lead.isStarred ? '★' : '☆'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
