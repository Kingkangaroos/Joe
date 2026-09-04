-- Gamenfy push cron -> Supabase Vault desired state
-- Database-side Vault migration applied live 2026-09-04 by ChatGPT (OpenAI).
--
-- IMPORTANT: this file NEVER creates or contains the secret value.
-- `gamenfy_push_cron_secret` must already exist in Supabase Vault. Re-running
-- this file is safe and only rewrites the two pg_cron commands to resolve that
-- value at execution time.

do $$
declare
  morning_id bigint;
  evening_id bigint;
begin
  if not exists (
    select 1 from vault.decrypted_secrets where name='gamenfy_push_cron_secret'
  ) then
    raise exception 'Required Vault secret gamenfy_push_cron_secret is missing';
  end if;

  select jobid into morning_id
  from cron.job
  where jobname='gamenfy-morning-push-poll';

  select jobid into evening_id
  from cron.job
  where jobname='gamenfy-evening-push-poll';

  if morning_id is null or evening_id is null then
    raise exception 'Expected Gamenfy morning/evening push cron jobs were not found';
  end if;

  perform cron.alter_job(
    morning_id,
    command := $cmd$
      select net.http_post(
        url := 'https://ttxjsoahmtennnufgeqx.supabase.co/functions/v1/send-daily-push',
        headers := jsonb_build_object(
          'x-push-secret', (select decrypted_secret from vault.decrypted_secrets where name='gamenfy_push_cron_secret'),
          'Content-Type', 'application/json'
        ),
        body := '{"mode":"morning"}'::jsonb,
        timeout_milliseconds := 20000
      )
    $cmd$
  );

  perform cron.alter_job(
    evening_id,
    command := $cmd$
      select net.http_post(
        url := 'https://ttxjsoahmtennnufgeqx.supabase.co/functions/v1/send-daily-push',
        headers := jsonb_build_object(
          'x-push-secret', (select decrypted_secret from vault.decrypted_secrets where name='gamenfy_push_cron_secret'),
          'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 20000
      )
    $cmd$
  );
end $$;
