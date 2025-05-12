
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
    const { orgId } = await req.json();
    
    if (!orgId) {
      throw new Error("Organization ID is required");
    }
    
    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Get the organization data including subscription info
    const { data, error } = await supabaseAdmin
      .from("organizations")
      .select(`
        name, 
        rooms_count,
        subscription_id,
        client_subscriptions (
          id,
          status, 
          current_period_end,
          stripe_subscription_id,
          subscription_plans (
            id,
            name,
            max_rooms,
            price,
            features
          )
        )
      `)
      .eq("id", orgId)
      .single();
      
    if (error || !data) {
      throw new Error(`Organization not found: ${error?.message || "Unknown error"}`);
    }
    
    const subscription = data.client_subscriptions;
    
    // If no subscription, return appropriate response
    if (!subscription) {
      return new Response(JSON.stringify({ 
        has_subscription: false,
        can_create_rooms: false,
        rooms_count: data.rooms_count || 0,
        max_rooms: 0,
        subscription: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Check if subscription is active
    const isActive = subscription.status === "active";
    const currentPeriodEnd = new Date(subscription.current_period_end);
    const isExpired = currentPeriodEnd < new Date();
    const plan = subscription.subscription_plans;
    
    // Check if organization can create more rooms
    const roomsCount = data.rooms_count || 0;
    const maxRooms = plan.max_rooms;
    const canCreateRooms = isActive && !isExpired && roomsCount < maxRooms;
    
    return new Response(JSON.stringify({ 
      has_subscription: true,
      is_active: isActive && !isExpired,
      can_create_rooms: canCreateRooms,
      rooms_count: roomsCount,
      max_rooms: maxRooms,
      rooms_remaining: maxRooms - roomsCount,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        plan: {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          features: plan.features
        }
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error checking subscription: ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
