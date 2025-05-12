
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
    const { planId, orgId } = await req.json();
    
    if (!planId || !orgId) {
      throw new Error("Plan ID and Organization ID are required");
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
    
    // Get the organization data and plan details
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from("organizations")
      .select("name, subscription_id")
      .eq("id", orgId)
      .single();
      
    if (orgError || !orgData) {
      throw new Error(`Organization not found: ${orgError?.message || "Unknown error"}`);
    }
    
    const { data: planData, error: planError } = await supabaseAdmin
      .from("subscription_plans")
      .select("name, price, max_rooms")
      .eq("id", planId)
      .single();
      
    if (planError || !planData) {
      throw new Error(`Subscription plan not found: ${planError?.message || "Unknown error"}`);
    }
    
    // Check if organization already has a Stripe customer ID
    let customerId = null;
    let existingSubscriptionId = null;
    
    if (orgData.subscription_id) {
      const { data: subData } = await supabaseAdmin
        .from("client_subscriptions")
        .select("stripe_customer_id, stripe_subscription_id")
        .eq("id", orgData.subscription_id)
        .single();
        
      if (subData) {
        customerId = subData.stripe_customer_id;
        existingSubscriptionId = subData.stripe_subscription_id;
      }
    }
    
    // If there's an existing subscription, we should handle it differently
    if (existingSubscriptionId) {
      // Redirect to customer portal to manage existing subscription
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${req.headers.get("origin")}/admin/qr-management`,
      });
      
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Create a new checkout session for first-time subscribers
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${planData.name} Plan`,
              description: `${planData.max_rooms} QR Room Management`,
            },
            unit_amount: planData.price,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/admin/subscription-success?session_id={CHECKOUT_SESSION_ID}&org_id=${orgId}&plan_id=${planId}`,
      cancel_url: `${req.headers.get("origin")}/admin/qr-management`,
      client_reference_id: orgId,
      metadata: {
        organization_id: orgId,
        plan_id: planId,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error creating checkout session: ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
