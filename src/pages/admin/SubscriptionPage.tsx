
import React from 'react';
import SubscriptionPlans from '@/components/admin/SubscriptionPlans';

const SubscriptionPage = () => {
  // Hardcode an organization ID for demo purposes
  const orgId = "demo-org-123";
  
  return (
    <div className="container mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-6">Subscription Plans</h1>
      <SubscriptionPlans orgId={orgId} />
    </div>
  );
};

export default SubscriptionPage;
