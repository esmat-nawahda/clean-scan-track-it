
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, orgId, planId } = await req.json();
    
    if (!sessionId || !orgId || !planId) {
      throw new Error("Session ID, Organization ID, and Plan ID are required");
    }
    
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Retrieve checkout session to verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== "paid") {
      throw new Error(`Payment not completed. Status: ${session.payment_status}`);
    }
    
    // Get subscription from Stripe
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Calculate subscription end date
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    
    // Create a new client subscription record
    const { data: clientSubscription, error: subscriptionError } = await supabaseAdmin
      .from("client_subscriptions")
      .insert({
        organization_id: orgId,
        plan_id: planId,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: session.customer as string,
      })
      .select()
      .single();
      
    if (subscriptionError) {
      throw new Error(`Failed to create subscription record: ${subscriptionError.message}`);
    }
    
    // Update the organization with the new subscription ID
    const { error: updateError } = await supabaseAdmin
      .from("organizations")
      .update({ subscription_id: clientSubscription.id })
      .eq("id", orgId);
      
    if (updateError) {
      throw new Error(`Failed to update organization: ${updateError.message}`);
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      subscription: clientSubscription
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error verifying subscription: ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
