
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const SubscriptionSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const orgId = searchParams.get('org_id');
    const planId = searchParams.get('plan_id');

    if (!sessionId || !orgId || !planId) {
      setError('Missing required parameters');
      setLoading(false);
      return;
    }

    const verifySubscription = async () => {
      try {
        const response = await supabase.functions.invoke('verify-subscription', {
          body: { sessionId, orgId, planId }
        });

        if (response.error) throw response.error;
        
        setSuccess(true);
      } catch (error) {
        console.error('Error verifying subscription:', error);
        setError('Failed to verify subscription');
        toast.error('There was a problem verifying your subscription');
      } finally {
        setLoading(false);
      }
    };

    verifySubscription();
  }, [searchParams]);

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Subscription Status</CardTitle>
          <CardDescription className="text-center">
            Verifying your subscription payment
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center">
          {loading && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p>Processing your subscription...</p>
            </div>
          )}
          
          {!loading && success && (
            <div className="flex flex-col items-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-medium mb-1">Subscription Activated!</h3>
              <p className="text-muted-foreground mb-3">
                Your subscription has been successfully activated. You can now create and manage QR codes for your rooms.
              </p>
            </div>
          )}
          
          {!loading && error && (
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-2xl">!</span>
              </div>
              <h3 className="text-xl font-medium mb-1">Error</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate('/admin/qr-management')} disabled={loading}>
            Go to QR Management
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionSuccessPage;
