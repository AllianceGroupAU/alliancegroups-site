-- Alliance Command CRM V1. Run against a NEW Cloudflare D1 database.
-- No seed rows: leads only appear following genuine submissions.
CREATE TABLE IF NOT EXISTS leads (
 id TEXT PRIMARY KEY,
 fingerprint TEXT NOT NULL,
 received_ms INTEGER NOT NULL,
 updated_ms INTEGER NOT NULL,
 source TEXT NOT NULL DEFAULT 'website',
 name TEXT NOT NULL,
 email TEXT NOT NULL DEFAULT '',
 phone TEXT NOT NULL DEFAULT '',
 company TEXT NOT NULL DEFAULT '',
 service TEXT NOT NULL DEFAULT '',
 site_address TEXT NOT NULL DEFAULT '',
 urgency TEXT NOT NULL DEFAULT '',
 message TEXT NOT NULL,
 stage TEXT NOT NULL DEFAULT 'new' CHECK(stage IN ('new','contacted','qualified','quoted','won','lost')),
 route TEXT NOT NULL DEFAULT 'review' CHECK(route IN ('review','direct','managed','referral')),
 priority INTEGER NOT NULL DEFAULT 0 CHECK(priority BETWEEN 0 AND 100),
 next_action TEXT NOT NULL DEFAULT '',
 quote_cents INTEGER NOT NULL DEFAULT 0,
 notification_status TEXT NOT NULL DEFAULT 'pending' CHECK(notification_status IN ('pending','accepted','failed'))
);
CREATE INDEX IF NOT EXISTS idx_leads_received ON leads(received_ms DESC);
CREATE INDEX IF NOT EXISTS idx_leads_fingerprint ON leads(fingerprint,received_ms);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage,priority DESC);

CREATE TABLE IF NOT EXISTS lead_events (
 id TEXT PRIMARY KEY,
 lead_id TEXT NOT NULL REFERENCES leads(id),
 actor TEXT NOT NULL,
 kind TEXT NOT NULL,
 detail TEXT NOT NULL DEFAULT '',
 created_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lead_events ON lead_events(lead_id,created_ms DESC);

CREATE TABLE IF NOT EXISTS message_drafts (
 id TEXT PRIMARY KEY,
 lead_id TEXT NOT NULL REFERENCES leads(id),
 channel TEXT NOT NULL CHECK(channel IN ('email','sms')),
 recipient TEXT NOT NULL DEFAULT '',
 subject TEXT NOT NULL DEFAULT '',
 body TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status = 'draft'),
 created_by TEXT NOT NULL,
 created_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_draft_lead ON message_drafts(lead_id,created_ms DESC);

CREATE TABLE IF NOT EXISTS lead_documents (
 id TEXT PRIMARY KEY,
 lead_id TEXT NOT NULL REFERENCES leads(id),
 object_key TEXT NOT NULL UNIQUE,
 file_name TEXT NOT NULL,
 mime_type TEXT NOT NULL,
 byte_size INTEGER NOT NULL,
 uploaded_by TEXT NOT NULL,
 uploaded_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_document_lead ON lead_documents(lead_id,uploaded_ms DESC);
