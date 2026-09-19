/* ================================================
   ALLIANCE GROUP — main.js
   Structure. Safety. Standards.
   ================================================ */

(function () {
  'use strict';

  /* ── Footer Year ── */
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Navbar Scroll Effect ── */
  const navbar = document.getElementById('navbar');
  function handleNavScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ── Active Nav Link ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  function setActiveNav() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', setActiveNav, { passive: true });

  /* ── Hamburger / Mobile Menu ── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open.toString());
  });
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ── Smooth scroll for all anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = navbar.offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── Scroll Reveal ── */
  const revealEls = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right, [data-animate]'
  );
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach(el => revealObserver.observe(el));

  /* ── Animated Counter ── */
  function animateCounter(el, target, duration = 2000) {
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
  const statEls = document.querySelectorAll('.stat-num[data-count]');
  let countersStarted = false;
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersStarted) {
          countersStarted = true;
          statEls.forEach(el => {
            animateCounter(el, parseInt(el.dataset.count, 10));
          });
        }
      });
    },
    { threshold: 0.5 }
  );
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) counterObserver.observe(heroStats);

  /* ── Testimonials Slider ── */
  const track = document.getElementById('testimonialsTrack');
  const cards = track ? Array.from(track.querySelectorAll('.testimonial-card')) : [];
  const dotsContainer = document.getElementById('sliderDots');
  let currentSlide = 0;
  let autoSlideTimer = null;

  function createDots() {
    cards.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      btn.setAttribute('role', 'tab');
      btn.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(btn);
    });
  }

  function updateDots(index) {
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  function goToSlide(index) {
    currentSlide = (index + cards.length) % cards.length;
    if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
    updateDots(currentSlide);
    resetAutoSlide();
  }

  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(() => goToSlide(currentSlide + 1), 6000);
  }

  if (cards.length > 0 && dotsContainer) {
    createDots();
    resetAutoSlide();

    document.getElementById('sliderPrev')?.addEventListener('click', () => goToSlide(currentSlide - 1));
    document.getElementById('sliderNext')?.addEventListener('click', () => goToSlide(currentSlide + 1));

    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) goToSlide(currentSlide + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ══════════════════════════════════════════════════════════
     FORM DELIVERY
     ══════════════════════════════════════════════════════════
     Form submission is intentionally centralized in js/form-handler.js.
     Do not add page-specific submit listeners here: duplicate handlers can
     create double submissions or false customer-facing success states.
  */

  /* ══════════════════════════════════════════════════════════
     RISK CHECKER WIDGET
     ══════════════════════════════════════════════════════════ */
  (function initRiskChecker() {
    const card = document.querySelector('.checker-steps-card');
    if (!card) return;

    let selections = { prop: 'residential', era: 'pre1980', scope: 'renovation' };

    const steps = card.querySelectorAll('.checker-step');
    const resultCard = document.getElementById('riskResultCard') || card.querySelector('.checker-result-card');
    const dots = card.querySelectorAll('.checker-progress-dot');
    const progressLabel = card.querySelector('.checker-progress-label');
    const resetBtn = card.querySelector('.reset-checker-btn');

    const riskMatrix = {
      residential: {
        'pre1980': {
          'renovation': {
            level: 'high', levelLabel: '🔴 CRITICAL RISK',
            title: 'Statutory Testing & Licensed Removal Mandatory',
            desc: 'Pre-1980 residential buildings undergoing renovation carry near-certain asbestos presence in wet areas, soffits, eaves, vinyl underlays, and roofing. Safe Work QLD prohibits disturbing these materials without prior NATA testing.',
            checks: [
              { icon: '🔬', text: 'NATA Certified Sample Testing ($195 AUD On-Site / $380 Full Audit)' },
              { icon: '🪪', text: 'Class A / Class B Licensed Removal Protocol' },
              { icon: '📋', text: 'Official Air Monitoring & Clearance Certificate ($295 AUD)' }
            ],
            cta: 'Book NATA Inspection & Removal Quote',
            service: 'asbestos-removal'
          },
          'purchase': {
            level: 'medium', levelLabel: '🟡 ELEVATED RISK',
            title: 'Pre-Purchase Hazard Audit Recommended',
            desc: 'Pre-1980 residential properties commonly conceal bonded asbestos in ceilings, internal linings, and insulation. A pre-purchase inspection protects your investment and family.',
            checks: [
              { icon: '🔍', text: 'Comprehensive Non-Destructive Asbestos Audit' },
              { icon: '📊', text: 'NATA Laboratory Microscopic Sample Verification' },
              { icon: '📁', text: 'Written Property Hazard Condition Report' }
            ],
            cta: 'Book Pre-Purchase Asbestos Audit',
            service: 'asbestos-testing'
          },
          'removal': {
            level: 'high', levelLabel: '🔴 HIGH PRIORITY',
            title: 'Immediate Hazardous Material Make-Safe',
            desc: 'Deteriorated, broken, or exposed pre-1980 asbestos presents an active inhalation risk. Alliance Group deploys 24/7 priority emergency containment and certified disposal.',
            checks: [
              { icon: '⚠️', text: 'Immediate Site Containment & HEPA H14 Air Filtration' },
              { icon: '🪪', text: 'Licensed Hazardous Waste Transport & EPA Manifest' },
              { icon: '✅', text: 'Formal Independent Clearance Sign-Off' }
            ],
            cta: 'Request Emergency Make-Safe / Removal',
            service: 'emergency'
          }
        },
        '1980-1990': {
          'renovation': {
            level: 'medium', levelLabel: '🟡 MODERATE RISK',
            title: 'Targeted Pre-Renovation Asbestos Screening',
            desc: 'Structures built between 1980 and 1990 may contain ACM in external eaves, wet area sheeting, and vinyl flooring. Testing prior to cutting or demolition is strongly advised.',
            checks: [
              { icon: '🔍', text: 'Targeted Sampling of High-Risk Renovation Zones' },
              { icon: '🔬', text: '24–48 Hr NATA Lab Analysis' },
              { icon: '📋', text: 'Written Clearance to Proceed with Renovation' }
            ],
            cta: 'Book Target Renovation Inspection',
            service: 'asbestos-testing'
          },
          'purchase': {
            level: 'low', levelLabel: '🟢 MODERATE / DUE DILIGENCE',
            title: 'Standard Pre-Purchase Safety Check',
            desc: 'Identify any lingering 1980s asbestos building boards or non-compliant alterations before finalizing contracts.',
            checks: [
              { icon: '📋', text: 'Visual Building Fabric Inspection' },
              { icon: '🔬', text: 'Selective Laboratory Sample Validation' },
              { icon: '✅', text: 'Written Pre-Purchase Compliance Certificate' }
            ],
            cta: 'Book Property Safety Inspection',
            service: 'asbestos-testing'
          },
          'removal': {
            level: 'medium', levelLabel: '🟡 CERTIFIED REMOVAL',
            title: 'Safe Extraction & Disposal Protocol',
            desc: 'Alliance Group removes bonded 1980s wall and eave sheeting under full WHS Queensland compliance.',
            checks: [
              { icon: '🪪', text: 'Licensed Building Practitioners & Class B Removalists' },
              { icon: '🚚', text: 'Tracked Waste Disposal Dockets' },
              { icon: '✅', text: 'Clean Air Handover Certificate' }
            ],
            cta: 'Get Fixed-Price Removal Quote',
            service: 'asbestos-removal'
          }
        },
        'post1990': {
          'renovation': {
            level: 'low', levelLabel: '🟢 LOW ASBESTOS RISK',
            title: 'Standard Architectural Renovation Scope',
            desc: 'Post-1990 residential properties carry minimal asbestos risk. Ready for architectural design, structural renovations, and modern extensions.',
            checks: [
              { icon: '📐', text: 'Architectural Design & Engineering Consult' },
              { icon: '🏗️', text: 'Licensed Building & Remediation Proposal' },
              { icon: '🛡️', text: 'Compliance Shield™ 4-Pillar Quality Guarantee' }
            ],
            cta: 'Request Renovation & Build Quote',
            service: 'renovation'
          },
          'purchase': {
            level: 'low', levelLabel: '🟢 STANDARD DILIGENCE',
            title: 'Building Defect & Structural Condition Review',
            desc: 'Evaluate structural integrity, moisture ingress, and National Construction Code compliant workmanship before buying.',
            checks: [
              { icon: '🔍', text: 'Comprehensive Structural & Defect Audit' },
              { icon: '📋', text: 'Detailed Property Condition Report' },
              { icon: '✅', text: 'Clearance & Valuations Advice' }
            ],
            cta: 'Book Building Condition Review',
            service: 'residential'
          },
          'removal': {
            level: 'low', levelLabel: '🟢 ROUTINE SCOPE',
            title: 'Minor Material Audit or Verification',
            desc: 'Verify questionable non-asbestos materials with our NATA laboratory partner for 100% peace of mind.',
            checks: [
              { icon: '🔬', text: 'NATA Lab Validation ($195 On-Site / $380 Full Audit)' },
              { icon: '📄', text: 'Official Negative Certificate of Analysis' },
              { icon: '📞', text: 'Direct Phone Advisory' }
            ],
            cta: 'Order Verification Test',
            service: 'asbestos-testing'
          }
        }
      },
      commercial: {
        'pre1980': {
          'renovation': {
            level: 'high', levelLabel: '🔴 CRITICAL PCBU LIABILITY',
            title: 'Mandatory Asbestos Management Plan & Audit (s425/s429)',
            desc: 'Commercial properties constructed pre-1980 require an active Asbestos Register and Management Plan under QLD WHS Regulation 2011 before any contractor can enter.',
            checks: [
              { icon: '⚖️', text: 'Statutory Asbestos Register & AMP Audit ($395 Document Review)' },
              { icon: '🔬', text: 'Full Hazardous Material Site Survey' },
              { icon: '🪪', text: 'Class A Friable / Class B Bonded Licensed Removal' }
            ],
            cta: 'Order $395 Compliance Review',
            service: 'compliance-audit'
          },
          'purchase': {
            level: 'high', levelLabel: '🔴 HIGH DUE DILIGENCE',
            title: 'Commercial Statutory Compliance Review',
            desc: 'Ensure the vendor has a valid 5-year Asbestos Register and AMP. Protect yourself from retrospective statutory penalties of up to $150,000.',
            checks: [
              { icon: '📁', text: 'Compliance Shield™ $395 Document Review' },
              { icon: '📊', text: 'Commercial Register & Management Plan (From $550 AUD)' },
              { icon: '🛡️', text: 'Full Legal Indemnity Certification' }
            ],
            cta: 'Order Commercial Audit ($395)',
            service: 'compliance-audit'
          },
          'removal': {
            level: 'high', levelLabel: '🔴 EMERGENCY / HIGH RISK',
            title: 'Commercial Hazardous Containment & Removal',
            desc: 'Full negative pressure containment, HEPA extraction, and independent hygienist air clearance for commercial facilities.',
            checks: [
              { icon: '⚠️', text: 'WorkSafe QLD Notification & Exclusion Zoning' },
              { icon: '🔬', text: 'Continuous Boundary Air Monitoring' },
              { icon: '📋', text: 'Independent NATA Air Clearance Certificate' }
            ],
            cta: 'Request Commercial Removal Proposal',
            service: 'asbestos-removal'
          }
        },
        '1980-1990': {
          'renovation': {
            level: 'medium', levelLabel: '🟡 PCBU DUE DILIGENCE',
            title: 'Pre-Works Commercial Asbestos Audit',
            desc: 'Commercial builds between 1980–1990 must have an on-site register before fitout contractors commence works.',
            checks: [
              { icon: '📋', text: 'Targeted Demolition & Refurbishment Survey' },
              { icon: '📁', text: 'Contractor Pre-Start Safety Induction Pack' },
              { icon: '✅', text: 'Clearance & Indemnity Documentation' }
            ],
            cta: 'Book Pre-Works Commercial Audit',
            service: 'compliance-audit'
          },
          'purchase': {
            level: 'medium', levelLabel: '🟡 STATUTORY CHECK',
            title: 'Commercial Register Verification',
            desc: 'Confirm the building register is current under WHS Regulation 2011 s425 before settlement.',
            checks: [
              { icon: '📁', text: 'Compliance Shield™ $395 Document Review' },
              { icon: '🔍', text: 'Site Sample Verification' },
              { icon: '📄', text: 'Written Gap Analysis & Report' }
            ],
            cta: 'Order Document Review ($395)',
            service: 'compliance-audit'
          },
          'removal': {
            level: 'medium', levelLabel: '🟡 LICENSED REMEDIATION',
            title: 'Commercial Fitout Asbestos Stripping',
            desc: 'Safe removal of vinyl flooring, ceiling tiles, and partition linings with zero facility disruption.',
            checks: [
              { icon: '🪪', text: 'Licensed Class B Removal Team' },
              { icon: '🕒', text: 'After-Hours / Weekend Execution Available' },
              { icon: '✅', text: 'Written Clearance Certificate' }
            ],
            cta: 'Request Commercial Quote',
            service: 'commercial'
          }
        },
        'post1990': {
          'renovation': {
            level: 'low', levelLabel: '🟢 COMMERCIAL BUILD SCOPE',
            title: 'Commercial Construction & Fitout Engineering',
            desc: 'Ready for full commercial fitout, corporate renovation, or facility development under licensed practitioner oversight.',
            checks: [
              { icon: '🏗️', text: 'Licensed Building Practitioner Oversight' },
              { icon: '📐', text: 'Acoustic, Electrical & Mechanical Coordination' },
              { icon: '🛡️', text: 'Compliance Shield™ Quality Certification' }
            ],
            cta: 'Request Commercial Fitout Proposal',
            service: 'commercial'
          },
          'purchase': {
            level: 'low', levelLabel: '🟢 STANDARD DILIGENCE',
            title: 'Commercial Property Condition Review',
            desc: 'Building integrity, fire safety alignment, and structural defect inspection.',
            checks: [
              { icon: '📋', text: 'Commercial Asset Condition Assessment' },
              { icon: '🛡️', text: 'WHS & Code Compliance Verification' },
              { icon: '📞', text: 'Senior Director Consultation' }
            ],
            cta: 'Enquire for Commercial Review',
            service: 'commercial'
          },
          'removal': {
            level: 'low', levelLabel: '🟢 GENERAL REMEDIATION',
            title: 'General Demolition & Stripout',
            desc: 'Non-hazardous commercial defit, structural demolition, and tenancy make-good.',
            checks: [
              { icon: '🔨', text: 'Complete Tenancy Stripout & Make-Good' },
              { icon: '🚚', text: 'Licensed Commercial Waste Disposal' },
              { icon: '✅', text: 'Handover Cleanliness Sign-off' }
            ],
            cta: 'Request Make-Good Proposal',
            service: 'commercial'
          }
        }
      },
      industrial: {
        'pre1980': {
          'renovation': {
            level: 'high', levelLabel: '🔴 CRITICAL INDUSTRIAL RISK',
            title: 'Specialist Industrial Hazard Management',
            desc: 'Pre-1980 industrial complexes carry high concentrations of friable lagging, gaskets, and super six roofing. Stop-work and specialist containment is mandatory.',
            checks: [
              { icon: '🚫', text: 'Stop-Work Protocol & Industrial HAZMAT Audit' },
              { icon: '🪪', text: 'Class A Friable Licensed Containment' },
              { icon: '📋', text: 'WorkSafe Queensland Mandatory Notifications' }
            ],
            cta: 'Request Emergency Industrial Response',
            service: 'emergency'
          },
          'purchase': {
            level: 'high', levelLabel: '🔴 CRITICAL RISK',
            title: 'Industrial Environmental & Asbestos Audit',
            desc: 'Assess extensive contamination risks, EPA liability, and remediation cost estimates before acquisition.',
            checks: [
              { icon: '🔬', text: 'Comprehensive Industrial HAZMAT Survey' },
              { icon: '📁', text: 'Commercial/Industrial Register & Management Plan' },
              { icon: '📊', text: 'Full Financial Remediation Liability Model' }
            ],
            cta: 'Book Industrial HAZMAT Audit',
            service: 'compliance-audit'
          },
          'removal': {
            level: 'high', levelLabel: '🔴 HIGH HAZARD',
            title: 'Heavy Industrial Asbestos Demolition',
            desc: 'Large-scale Super Six roof replacement, factory decontamination, and plant decommissioning.',
            checks: [
              { icon: '🏗️', text: 'Cranage, Scaffolding & Edge Protection Safety' },
              { icon: '🚚', text: 'Heavy Transport EPA Waste Manifesting' },
              { icon: '✅', text: 'Final Industrial NATA Clearance Log' }
            ],
            cta: 'Request Industrial Scope Proposal',
            service: 'asbestos-removal'
          }
        },
        '1980-1990': {
          'renovation': {
            level: 'medium', levelLabel: '🟡 ELEVATED INDUSTRIAL RISK',
            title: 'Industrial Pre-Demolition Survey',
            desc: 'Targeted audit of plant, insulation, switchboards, and warehouse roofing before modifications.',
            checks: [
              { icon: '🔍', text: 'Targeted Industrial Sampling' },
              { icon: '📋', text: 'Safety Management Plan Preparation' },
              { icon: '🪪', text: 'Licensed Industrial Remediation' }
            ],
            cta: 'Book Industrial Pre-Works Audit',
            service: 'asbestos-testing'
          },
          'purchase': {
            level: 'medium', levelLabel: '🟡 DUE DILIGENCE',
            title: 'Industrial Facility Compliance Review',
            desc: 'Review existing registers and site safety records to avoid unexpected capital expenditure.',
            checks: [
              { icon: '📁', text: 'Compliance Shield™ $395 Document Review' },
              { icon: '🔍', text: 'Visual Plant & Roof Inspection' },
              { icon: '📄', text: 'Written Executive Summary' }
            ],
            cta: 'Order Industrial Document Review',
            service: 'compliance-audit'
          },
          'removal': {
            level: 'medium', levelLabel: '🟡 CERTIFIED INDUSTRIAL',
            title: 'Warehouse & Industrial Cladding Removal',
            desc: 'Safe stripout and Colorbond replacement engineered for minimum production downtime.',
            checks: [
              { icon: '🪪', text: 'Licensed Removal & Safe Rigging' },
              { icon: '⏱️', text: 'Rapid Turnaround & Weekend Shutdowns' },
              { icon: '✅', text: 'Air Quality Clearance Sign-off' }
            ],
            cta: 'Request Industrial Quote',
            service: 'asbestos-removal'
          }
        },
        'post1990': {
          'renovation': {
            level: 'low', levelLabel: '🟢 INDUSTRIAL CIVIL SCOPE',
            title: 'Industrial Construction & Civil Expansion',
            desc: 'Warehouse construction, mezzanine additions, structural steel, and civil infrastructure.',
            checks: [
              { icon: '🏗️', text: 'Licensed Building & Industrial Project Management' },
              { icon: '📐', text: 'Heavy Load Engineering & Concrete Footings' },
              { icon: '🛡️', text: 'Compliance Shield™ Structural Certification' }
            ],
            cta: 'Request Industrial Build Quote',
            service: 'commercial'
          },
          'purchase': {
            level: 'low', levelLabel: '🟢 DUE DILIGENCE',
            title: 'Industrial Building Condition Survey',
            desc: 'Structural steel integrity, slab movement, and roof membrane assessment.',
            checks: [
              { icon: '🔍', text: 'Structural Engineering Review' },
              { icon: '📋', text: 'Asset Condition Report' },
              { icon: '📞', text: 'Technical Consultation' }
            ],
            cta: 'Book Industrial Condition Survey',
            service: 'commercial'
          },
          'removal': {
            level: 'low', levelLabel: '🟢 DEFIT / DEMOLITION',
            title: 'Industrial Defit & Civil Demolition',
            desc: 'Internal factory defits, structural shearing, and site clearance.',
            checks: [
              { icon: '🔨', text: 'Heavy Plant Mechanical Demolition' },
              { icon: '🚚', text: 'EPA Compliant Recycling & Transport' },
              { icon: '✅', text: 'Handover Certificate' }
            ],
            cta: 'Request Demolition Proposal',
            service: 'commercial'
          }
        }
      }
    };

    function updateProgressDots(activeStep) {
      dots.forEach((d, i) => {
        d.classList.remove('active', 'done');
        if (i < activeStep) d.classList.add('done');
        else if (i === activeStep) d.classList.add('active');
      });
      if (progressLabel) progressLabel.textContent = 'Step ' + (activeStep + 1) + ' of ' + (dots.length || 3);
    }

    function showStep(n) {
      steps.forEach((s, i) => s.classList.toggle('active', i === n));
      if (resultCard) resultCard.classList.remove('visible');
      updateProgressDots(n);
    }

    function showResult() {
      // Normalize era and scope for matrix lookup
      let propKey = selections.prop || 'residential';
      let eraKey  = selections.era  || 'pre1980';
      let scopeKey = selections.scope || 'renovation';

      // Fallback aliases if legacy keys are clicked
      if (eraKey === 'post1980') eraKey = '1980-1990';
      if (scopeKey === 'inspection') scopeKey = 'purchase';
      if (scopeKey === 'monitoring') scopeKey = 'removal';

      const propObj = riskMatrix[propKey] || riskMatrix.residential;
      const eraObj  = propObj[eraKey]     || propObj['pre1980'];
      const data    = eraObj[scopeKey]    || eraObj['renovation'];

      if (!data || !resultCard) return;

      const badge = resultCard.querySelector('.risk-badge') || resultCard.querySelector('#riskBadgeText');
      if (badge) {
        badge.className = 'risk-badge ' + data.level;
        badge.textContent = data.levelLabel;
      }

      const titleEl = resultCard.querySelector('#resultTitle');
      const descEl  = resultCard.querySelector('#resultDesc');
      if (titleEl) titleEl.textContent = data.title;
      if (descEl)  descEl.textContent  = data.desc;

      const listWrap = resultCard.querySelector('.result-checklist');
      if (listWrap) {
        listWrap.innerHTML = data.checks.map(c => 
          `<div class="check-row"><span class="check-icon">${c.icon}</span><span>${c.text}</span></div>`
        ).join('');
      }

      const ctaBtn = resultCard.querySelector('#claimAssessmentBtn') || resultCard.querySelector('.result-cta-btn');
      if (ctaBtn) {
        ctaBtn.textContent = data.cta || 'Lock In Assessment & Quote';
        const targetService = data.service || 'asbestos-testing';
        const notes = encodeURIComponent(`Risk Checker: ${propKey.toUpperCase()} property, Era: ${eraKey}, Planned Activity: ${scopeKey}. Outcome: ${data.title}`);
        ctaBtn.setAttribute('href', `contact.html?service=${targetService}&notes=${notes}`);
      }

      steps.forEach(s => s.classList.remove('active'));
      resultCard.classList.add('visible');
      dots.forEach(d => { d.classList.remove('active'); d.classList.add('done'); });
      if (progressLabel) progressLabel.textContent = 'Complete ✓';

      setTimeout(() => {
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 200);
    }

    card.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const step  = btn.closest('.checker-step');
        const prop  = btn.dataset.prop;
        const era   = btn.dataset.era;
        const scope = btn.dataset.scope;

        step.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('selected', 'active'));
        btn.classList.add('selected', 'active');

        if (prop)  selections.prop  = prop;
        if (era)   selections.era   = era;
        if (scope) selections.scope = scope;

        setTimeout(() => {
          if (scope) {
            showResult();
          } else if (era) {
            showStep(2);
          } else if (prop) {
            showStep(1);
          }
        }, 350);
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        selections = { prop: 'residential', era: 'pre1980', scope: 'renovation' };
        card.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('selected', 'active'));
        if (resultCard) resultCard.classList.remove('visible');
        showStep(0);
      });
    }

    showStep(0);
  })();

  /* ── Interactive Video Features & Chapter Navigation ── */
  (function () {
    // 1. Chapter jumping for interactive video players
    document.querySelectorAll('.video-chapter-item[data-seek]').forEach(item => {
      item.addEventListener('click', function () {
        const featureCard = this.closest('.interactive-video-feature');
        if (!featureCard) return;
        const video = featureCard.querySelector('video');
        const seekTime = parseFloat(this.dataset.seek);
        if (video && !isNaN(seekTime)) {
          video.currentTime = seekTime;
          video.play().catch(() => {});
        }
        featureCard.querySelectorAll('.video-chapter-item').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
      });
    });

    // 2. Video tab filtering on projects & portfolio pages
    const tabBtns = document.querySelectorAll('.video-tab-nav .vtab-btn');
    if (tabBtns.length > 0) {
      tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
          const filter = this.dataset.filter;
          tabBtns.forEach(b => b.classList.remove('active'));
          this.classList.add('active');

          const cards = document.querySelectorAll('.video-showcase-grid .video-card');
          cards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
              card.style.display = 'flex';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });
    }
  })();

})();

