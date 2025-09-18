import React from 'react';

export function CampaignView({ 
  campaigns, 
  campaignCategories, 
  onCreateCampaign, 
  onAddCategory, 
  onRemoveCategory, 
  onViewCampaign, 
  onBack, 
  isDetailView = false 
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Campaigns</h1>
      <p className="text-muted-foreground mb-6">
        Manage your lead campaigns ({campaigns.length} total).
      </p>
      
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">All Campaigns</h2>
          <button 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            onClick={onCreateCampaign}
          >
            Create Campaign
          </button>
        </div>
        
        <div className="space-y-2">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="p-4 border rounded-lg hover:bg-muted/50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{campaign.name}</h3>
                  <p className="text-sm text-muted-foreground">{campaign.description}</p>
                  <p className="text-xs text-muted-foreground">{campaign.leads.length} leads</p>
                </div>
                <button 
                  className="text-primary hover:text-primary/80"
                  onClick={() => onViewCampaign(campaign)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
