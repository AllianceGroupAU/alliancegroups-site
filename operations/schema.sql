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

-- Referral operations remain owner-managed. These tables contain no seed data.
CREATE TABLE IF NOT EXISTS partners (
 id TEXT PRIMARY KEY,
 partner_code TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL,
 organisation TEXT NOT NULL DEFAULT '',
 contact_name TEXT NOT NULL DEFAULT '',
 category TEXT NOT NULL CHECK(category IN ('strata','commercial_pm','residential_pm','assessor','building_trade','builder','public_sector','other')),
 phone TEXT NOT NULL DEFAULT '',
 email TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'prospect' CHECK(status IN ('prospect','approved','signed','suspended')),
 referral_fee_eligible INTEGER NOT NULL DEFAULT 0 CHECK(referral_fee_eligible IN (0,1)),
 created_by TEXT NOT NULL,
 created_ms INTEGER NOT NULL,
 updated_ms INTEGER NOT NULL,
 CHECK(category NOT IN ('assessor','public_sector') OR referral_fee_eligible=0)
);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status,created_ms DESC);

CREATE TABLE IF NOT EXISTS partner_agreements (
 id TEXT PRIMARY KEY,
 partner_id TEXT NOT NULL REFERENCES partners(id),
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','pending_review','signed','expired','rejected')),
 document_ref TEXT NOT NULL DEFAULT '',
 signed_ms INTEGER,
 created_by TEXT NOT NULL,
 created_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_partner_agreements ON partner_agreements(partner_id,created_ms DESC);

CREATE TABLE IF NOT EXISTS partner_disclosures (
 id TEXT PRIMARY KEY,
 partner_id TEXT NOT NULL REFERENCES partners(id),
 benefit_type TEXT NOT NULL CHECK(benefit_type IN ('none','client_credit','cash')),
 evidence_ref TEXT NOT NULL DEFAULT '',
 evidence_status TEXT NOT NULL DEFAULT 'pending' CHECK(evidence_status IN ('pending','confirmed','rejected')),
 legal_reviewed INTEGER NOT NULL DEFAULT 0 CHECK(legal_reviewed IN (0,1)),
 reviewed_by TEXT NOT NULL DEFAULT '',
 reviewed_ms INTEGER,
 created_by TEXT NOT NULL,
 created_ms INTEGER NOT NULL,
 CHECK(benefit_type!='cash' OR evidence_status!='confirmed' OR length(evidence_ref)>0)
);
CREATE INDEX IF NOT EXISTS idx_partner_disclosures ON partner_disclosures(partner_id,created_ms DESC);

CREATE TABLE IF NOT EXISTS partner_referrals (
 id TEXT PRIMARY KEY,
 partner_id TEXT NOT NULL REFERENCES partners(id),
 lead_id TEXT NOT NULL UNIQUE REFERENCES leads(id),
 referred_ms INTEGER NOT NULL,
 consent_confirmed INTEGER NOT NULL DEFAULT 0 CHECK(consent_confirmed IN (0,1)),
 stage TEXT NOT NULL DEFAULT 'received' CHECK(stage IN ('received','qualified','won','paid','cancelled','refunded')),
 revenue_cents INTEGER NOT NULL DEFAULT 0 CHECK(revenue_cents>=0),
 proposed_fee_cents INTEGER NOT NULL DEFAULT 0 CHECK(proposed_fee_cents>=0),
 created_by TEXT NOT NULL,
 created_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_partner ON partner_referrals(partner_id,referred_ms DESC);

CREATE TABLE IF NOT EXISTS partner_campaigns (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','approved','paused','closed')),
 owner_approved INTEGER NOT NULL DEFAULT 0 CHECK(owner_approved IN (0,1)),
 legal_review_status TEXT NOT NULL DEFAULT 'pending' CHECK(legal_review_status IN ('pending','approved','rejected')),
 contact_list_verified INTEGER NOT NULL DEFAULT 0 CHECK(contact_list_verified IN (0,1)),
 dncr_checked INTEGER NOT NULL DEFAULT 0 CHECK(dncr_checked IN (0,1)),
 consent_basis TEXT NOT NULL DEFAULT '',
 calling_window_verified INTEGER NOT NULL DEFAULT 0 CHECK(calling_window_verified IN (0,1)),
 caller_id_verified INTEGER NOT NULL DEFAULT 0 CHECK(caller_id_verified IN (0,1)),
 budget_cap_cents INTEGER NOT NULL DEFAULT 0 CHECK(budget_cap_cents>=0),
 daily_contact_cap INTEGER NOT NULL DEFAULT 0 CHECK(daily_contact_cap BETWEEN 0 AND 15),
 created_by TEXT NOT NULL,
 created_ms INTEGER NOT NULL,
 approved_by TEXT NOT NULL DEFAULT '',
 approved_ms INTEGER,
 CHECK(status!='approved' OR (
   owner_approved=1 AND legal_review_status='approved' AND contact_list_verified=1
   AND dncr_checked=1 AND length(consent_basis)>0 AND calling_window_verified=1
   AND caller_id_verified=1 AND budget_cap_cents>0 AND daily_contact_cap BETWEEN 1 AND 15
   AND length(approved_by)>0 AND approved_ms IS NOT NULL
 ))
);

CREATE TABLE IF NOT EXISTS suppression_list (
 id TEXT PRIMARY KEY,
 phone TEXT NOT NULL UNIQUE,
 reason TEXT NOT NULL CHECK(reason IN ('stop_request','not_interested','dncr','owner_request','other')),
 source TEXT NOT NULL DEFAULT 'manual',
 created_by TEXT NOT NULL,
 created_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS call_attempts (
 id TEXT PRIMARY KEY,
 campaign_id TEXT REFERENCES partner_campaigns(id),
 partner_id TEXT REFERENCES partners(id),
 phone TEXT NOT NULL,
 idempotency_key TEXT NOT NULL UNIQUE,
 status TEXT NOT NULL DEFAULT 'blocked' CHECK(status IN ('blocked','queued','started','answered','completed','failed','cancelled')),
 gate_result TEXT NOT NULL,
 initiated_by TEXT NOT NULL,
 created_ms INTEGER NOT NULL,
 completed_ms INTEGER
);
CREATE INDEX IF NOT EXISTS idx_call_attempts_created ON call_attempts(created_ms DESC);

CREATE TABLE IF NOT EXISTS call_events (
 id TEXT PRIMARY KEY,
 call_attempt_id TEXT NOT NULL REFERENCES call_attempts(id),
 kind TEXT NOT NULL,
 detail TEXT NOT NULL DEFAULT '',
 created_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_call_events_attempt ON call_events(call_attempt_id,created_ms DESC);

CREATE TABLE IF NOT EXISTS appointments (
 id TEXT PRIMARY KEY,
 partner_id TEXT REFERENCES partners(id),
 lead_id TEXT REFERENCES leads(id),
 starts_ms INTEGER NOT NULL,
 ends_ms INTEGER NOT NULL,
 availability_verified INTEGER NOT NULL DEFAULT 0 CHECK(availability_verified IN (0,1)),
 status TEXT NOT NULL DEFAULT 'proposed' CHECK(status IN ('proposed','confirmed','cancelled','completed')),
 created_by TEXT NOT NULL,
 created_ms INTEGER NOT NULL,
 CHECK(ends_ms>starts_ms),
 CHECK(status!='confirmed' OR availability_verified=1)
);
CREATE INDEX IF NOT EXISTS idx_appointments_start ON appointments(starts_ms,status);

CREATE TABLE IF NOT EXISTS payout_approvals (
 id TEXT PRIMARY KEY,
 referral_id TEXT NOT NULL REFERENCES partner_referrals(id),
 amount_cents INTEGER NOT NULL CHECK(amount_cents>0),
 second_payment_cleared INTEGER NOT NULL DEFAULT 0 CHECK(second_payment_cleared IN (0,1)),
 disclosure_confirmed INTEGER NOT NULL DEFAULT 0 CHECK(disclosure_confirmed IN (0,1)),
 tax_invoice_received INTEGER NOT NULL DEFAULT 0 CHECK(tax_invoice_received IN (0,1)),
 disclosure_id TEXT REFERENCES partner_disclosures(id),
 clawback_until_ms INTEGER NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','clawed_back')),
 owner_approved_by TEXT NOT NULL DEFAULT '',
 approved_ms INTEGER,
 created_by TEXT NOT NULL,
 created_ms INTEGER NOT NULL,
 CHECK(status!='approved' OR (
   second_payment_cleared=1 AND disclosure_confirmed=1 AND tax_invoice_received=1
   AND disclosure_id IS NOT NULL AND length(owner_approved_by)>0
   AND approved_ms IS NOT NULL AND approved_ms>=clawback_until_ms
 ))
);
CREATE INDEX IF NOT EXISTS idx_payout_approvals_status ON payout_approvals(status,created_ms DESC);
CREATE TRIGGER IF NOT EXISTS payout_approval_eligibility_insert
BEFORE INSERT ON payout_approvals
WHEN NEW.status='approved'
BEGIN
 SELECT CASE WHEN NOT EXISTS (
   SELECT 1 FROM partner_referrals r
   JOIN partners p ON p.id=r.partner_id
   JOIN partner_disclosures d ON d.id=NEW.disclosure_id AND d.partner_id=p.id
   WHERE r.id=NEW.referral_id AND r.stage='paid' AND r.consent_confirmed=1
     AND p.status='signed' AND p.referral_fee_eligible=1
     AND p.category NOT IN ('assessor','public_sector')
     AND d.evidence_status='confirmed' AND length(d.evidence_ref)>0
     AND (p.category!='strata' OR d.benefit_type='client_credit' OR d.legal_reviewed=1)
     AND NEW.second_payment_cleared=1 AND NEW.disclosure_confirmed=1
     AND NEW.tax_invoice_received=1 AND length(NEW.owner_approved_by)>0
     AND NEW.approved_ms IS NOT NULL
     AND NEW.approved_ms>=NEW.clawback_until_ms
     AND NEW.approved_ms>=r.referred_ms+5184000000
 ) THEN RAISE(ABORT,'payout eligibility requirements are not met') END;
END;
CREATE TRIGGER IF NOT EXISTS payout_approval_eligibility_update
BEFORE UPDATE OF status ON payout_approvals
WHEN NEW.status='approved'
BEGIN
 SELECT CASE WHEN NOT EXISTS (
   SELECT 1 FROM partner_referrals r
   JOIN partners p ON p.id=r.partner_id
   JOIN partner_disclosures d ON d.id=NEW.disclosure_id AND d.partner_id=p.id
   WHERE r.id=NEW.referral_id AND r.stage='paid' AND r.consent_confirmed=1
     AND p.status='signed' AND p.referral_fee_eligible=1
     AND p.category NOT IN ('assessor','public_sector')
     AND d.evidence_status='confirmed' AND length(d.evidence_ref)>0
     AND (p.category!='strata' OR d.benefit_type='client_credit' OR d.legal_reviewed=1)
     AND NEW.second_payment_cleared=1 AND NEW.disclosure_confirmed=1
     AND NEW.tax_invoice_received=1 AND length(NEW.owner_approved_by)>0
     AND NEW.approved_ms IS NOT NULL
     AND NEW.approved_ms>=NEW.clawback_until_ms
     AND NEW.approved_ms>=r.referred_ms+5184000000
 ) THEN RAISE(ABORT,'payout eligibility requirements are not met') END;
END;

CREATE TABLE IF NOT EXISTS integration_outbox (
 id TEXT PRIMARY KEY,
 adapter TEXT NOT NULL,
 event_type TEXT NOT NULL,
 idempotency_key TEXT NOT NULL UNIQUE,
 payload TEXT NOT NULL DEFAULT '{}',
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','retry','delivered','failed','cancelled')),
 attempts INTEGER NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 5),
 next_attempt_ms INTEGER NOT NULL,
 last_error TEXT NOT NULL DEFAULT '',
 created_ms INTEGER NOT NULL,
 updated_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_integration_outbox_ready ON integration_outbox(status,next_attempt_ms);

CREATE TABLE IF NOT EXISTS agent_actions (
 id TEXT PRIMARY KEY,
 actor TEXT NOT NULL,
 action TEXT NOT NULL,
 target_type TEXT NOT NULL DEFAULT '',
 target_id TEXT NOT NULL DEFAULT '',
 idempotency_key TEXT NOT NULL UNIQUE,
 authorized INTEGER NOT NULL CHECK(authorized IN (0,1)),
 result TEXT NOT NULL,
 created_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agent_actions_created ON agent_actions(created_ms DESC);
