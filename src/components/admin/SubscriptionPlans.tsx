
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  max_rooms: number;
  features: string[];
  active: boolean;
}

interface SubscriptionInfo {
  has_subscription: boolean;
  is_active?: boolean;
  can_create_rooms: boolean;
  rooms_count: number;
  max_rooms: number;
  rooms_remaining?: number;
  subscription?: {
    status: string;
    current_period_end: string;
    plan: {
      name: string;
      price: number;
      features: string[];
    };
  };
}

interface SubscriptionPlansProps {
  orgId: string;
  onSubscriptionChange?: () => void;
}

const MOCK_PLANS: Plan[] = [
  {
    id: '1',
    name: 'Basic Plan',
    description: 'For small businesses',
    price: 999,
    max_rooms: 5,
    features: ['5 QR rooms', 'Basic cleaning checklists', 'Email support'],
    active: true
  },
  {
    id: '2',
    name: 'Standard Plan',
    description: 'For growing businesses',
    price: 2999,
    max_rooms: 15,
    features: ['15 QR rooms', 'Custom cleaning checklists', 'Priority support', 'Room analytics'],
    active: true
  },
  {
    id: '3',
    name: 'Premium Plan',
    description: 'For large businesses',
    price: 4999,
    max_rooms: 50,
    features: ['50 QR rooms', 'Advanced analytics', '24/7 support', 'Custom branding'],
    active: true
  }
];

// Mock subscription data for demo
const MOCK_SUBSCRIPTION: SubscriptionInfo = {
  has_subscription: true,
  is_active: true,
  can_create_rooms: true,
  rooms_count: 3,
  max_rooms: 999, // Demo has high limit
  rooms_remaining: 996,
  subscription: {
    status: 'active',
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    plan: {
      name: 'Demo Plan',
      price: 0,
      features: ['Unlimited QR rooms in demo mode', 'Basic cleaning checklists', 'Email support']
    }
  }
};

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ orgId, onSubscriptionChange }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Use hardcoded plans data
        setPlans(MOCK_PLANS);
      } catch (error) {
        console.error('Error loading plans:', error);
        toast.error('Failed to load subscription plans');
      } finally {
        setLoading(false);
      }
    };

    const checkSubscription = async () => {
      try {
        // Use the mock subscription data
        setCurrentSubscription(MOCK_SUBSCRIPTION);
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    fetchPlans();
    if (orgId) {
      checkSubscription();
    }
  }, [orgId]);

  const handleSubscribe = async (planId: string) => {
    try {
      setSubscribing(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock checkout URL for demo
      const mockCheckoutUrl = '#/mock-checkout';
      
      // Show success toast
      toast.success('Redirecting to checkout...');
      
      // Simulate redirect
      console.log(`Would redirect to checkout for plan ${planId}`);
      
      // For demo, we'll just update the subscription locally
      const selectedPlan = plans.find(p => p.id === planId);
      if (selectedPlan) {
        setCurrentSubscription({
          ...MOCK_SUBSCRIPTION,
          subscription: {
            ...MOCK_SUBSCRIPTION.subscription!,
            plan: {
              name: selectedPlan.name,
              price: selectedPlan.price,
              features: selectedPlan.features
            }
          }
        });
        toast.success(`Subscribed to ${selectedPlan.name}`);
        if (onSubscriptionChange) onSubscriptionChange();
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start subscription process');
    } finally {
      setSubscribing(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setSubscribing(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Show success toast
      toast.success('Subscription management initiated');
      
      // For demo purposes, we'll just log this
      console.log('Managing subscription for org:', orgId);
      
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open subscription management portal');
    } finally {
      setSubscribing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price / 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        {currentSubscription && currentSubscription.has_subscription && currentSubscription.subscription && (
          <Card className="border-2 border-primary bg-primary/5 mb-4">
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Plan:</span> {currentSubscription.subscription.plan.name}
              </div>
              <div>
                <span className="font-medium">Status:</span>{' '}
                <span className={currentSubscription.is_active ? 'text-green-600' : 'text-amber-600'}>
                  {currentSubscription.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span className="font-medium">Next billing date:</span>{' '}
                {new Date(currentSubscription.subscription.current_period_end).toLocaleDateString()}
              </div>
              <div className="mt-4">
                <span className="font-medium">Room Usage:</span>{' '}
                <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                  <div 
                    className={`h-2.5 rounded-full ${
                      currentSubscription.rooms_count / currentSubscription.max_rooms > 0.8 
                      ? 'bg-red-500' 
                      : 'bg-green-500'
                    }`} 
                    style={{ width: `${(currentSubscription.rooms_count / currentSubscription.max_rooms) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-right mt-1">
                  {currentSubscription.rooms_count} / {currentSubscription.max_rooms} rooms used
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleManageSubscription} disabled={subscribing}>
                {subscribing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Manage Subscription
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentSubscription?.subscription?.plan?.name === plan.name;
          
          return (
            <Card 
              key={plan.id} 
              className={`flex flex-col ${isCurrentPlan ? 'border-2 border-primary' : ''}`}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <h3 className="font-medium mb-2">Features:</h3>
                <ul className="space-y-2">
                  {plan.features && Array.isArray(plan.features) && plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start font-medium">
                    <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                    <span>{plan.max_rooms} QR Room{plan.max_rooms !== 1 ? 's' : ''}</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrentPlan ? (
                  <Button variant="outline" className="w-full" onClick={handleManageSubscription}>
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribing}
                  >
                    {subscribing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Subscribe
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
