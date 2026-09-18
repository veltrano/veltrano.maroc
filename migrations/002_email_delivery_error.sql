ALTER TABLE email_signups
  ADD COLUMN IF NOT EXISTS email_error text;
