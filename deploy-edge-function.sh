#!/bin/bash

# Deploy Supabase Edge Function
echo "Deploying WhatsApp sender edge function..."

# Make sure you have Supabase CLI installed
# npm install -g supabase

# Login to Supabase (if not already logged in)
# supabase login

# Link to your project
supabase link --project-ref zzobouiuwqpjmlvcsjld

# Deploy the edge function
supabase functions deploy send-whatsapp

# Set environment variables for the edge function
supabase secrets set GUPSHUP_API_KEY=sk_d3d630b3f8104e13a318025949fb210d
supabase secrets set GUPSHUP_SOURCE_NUMBER=917834811114
supabase secrets set GUPSHUP_BASE_URL=https://api.gupshup.io/wa/api/v1/msg

echo "Edge function deployed successfully!"
echo "Function URL: https://zzobouiuwqpjmlvcsjld.supabase.co/functions/v1/send-whatsapp"