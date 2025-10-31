-- Enable pg_cron extension
create extension if not exists pg_cron;

-- Create cron job to send WhatsApp messages every minute
select cron.schedule(
  'send-whatsapp-messages',
  '* * * * *', -- Every minute
  $$
  select
    net.http_post(
      url := 'https://zzobouiuwqpjmlvcsjld.supabase.co/functions/v1/send-whatsapp',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);