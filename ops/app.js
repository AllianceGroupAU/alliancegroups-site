(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  let selectedId = null;
  let leads = [];
  const notice = (message) => { $('notice').textContent = message; };
  function setView(id) {
    for (const view of document.querySelectorAll('.page-view')) view.hidden = view.id !== id;
    for (const tab of document.querySelectorAll('[data-view]')) {
      const active = tab.dataset.view === id;
      tab.setAttribute('aria-selected',String(active));
      tab.tabIndex = active ? 0 : -1;
    }
  }
  for (const tab of document.querySelectorAll('[data-view]')) tab.addEventListener('click',() => setView(tab.dataset.view));
  for (const button of document.querySelectorAll('[data-open-view]')) button.addEventListener('click',() => {
    setView(button.dataset.openView);
    document.querySelector('[data-view="'+button.dataset.openView+'"]')?.focus();
  });
  function renderToday() {
    const target=$('today-items');
    if(!target) return;
    target.replaceChildren();
    const pending=leads.filter(lead=>['new','contacted'].includes(lead.stage))
      .sort((a,b)=>(b.received_ms||0)-(a.received_ms||0)).slice(0,5);
    if(!pending.length) {
      target.append(element('p','No new or contacted enquiries in the loaded records.','summary'));
      return;
    }
    for(const lead of pending) {
      const button=element('button',undefined,'lead');
      button.type='button';
      button.append(element('strong',(lead.name||'Name unavailable')+' · '+(lead.service||'Enquiry')));
      button.append(element('span',(lead.stage||'unknown').toUpperCase()+' · '+date(lead.received_ms)));
      button.addEventListener('click',()=>{setView('work-view');viewLead(lead.id);});
      target.append(button);
    }
  }
  function setCrmStatus(ok,message) {
    const badge=$('crm-status'),label=$('crm-status-text'),system=$('system-crm-status');
    if(badge){badge.textContent=ok?'Connected':'Unavailable';badge.classList.toggle('online',ok);badge.classList.toggle('offline',!ok);}
    if(label) label.textContent=message;
    if(system) system.textContent=message;
  }
  async function api(path, options = {}) {
    const result = await fetch('/api/internal/' + path, {credentials:'same-origin',cache:'no-store',...options});
    const data = await result.json().catch(() => ({}));
    if (!result.ok) throw new Error(data.error || 'Internal connection failed (' + result.status + ').');
    return data;
  }
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function labelValue(parent, label, value) {
    parent.append(element('p', label + ': ' + (value || 'Not supplied'), 'summary'));
  }
  function date(time) {
    return time ? new Date(time).toLocaleString('en-AU', {timeZone:'Australia/Brisbane'}) : 'Unknown time';
  }
  async function refresh() {
    notice('Loading private Alliance records…');
    try {
      const [pipeline, listing] = await Promise.all([api('summary'),api('leads' + ($('stage-filter').value ? '?stage=' + encodeURIComponent($('stage-filter').value) : ''))]);
      const stats = Object.fromEntries((pipeline.stages || []).map(row => [row.stage, row.count]));
      for (const stage of ['new','qualified','quoted','won']) $('count-' + stage).textContent = String(stats[stage] || 0);
      leads = listing.leads || [];
      for(const stage of ['new','qualified','quoted','won']) {
        const target=$('today-count-'+stage);
        if(target) target.textContent=String(stats[stage] || 0);
      }
      setCrmStatus(true,'Connected');
      renderToday();
      renderLeads();
      if (selectedId && leads.some(lead => lead.id === selectedId)) await viewLead(selectedId);
      notice(leads.length + ' submitted website enquiry record' + (leads.length === 1 ? '' : 's') + ' displayed. No sample leads.');
    } catch (error) {
      leads = [];
      setCrmStatus(false,'Unavailable');
      renderToday();
      renderLeads();
      notice('Private records unavailable: ' + error.message);
    }
  }
  function renderLeads() {
    const wrap = $('leads');
    wrap.replaceChildren();
    if (!leads.length) { wrap.append(element('p','No captured enquiries in this view.')); return; }
    for (const lead of leads) {
      const button = element('button',undefined,'lead' + (selectedId === lead.id ? ' active' : ''));
      button.type = 'button';
      button.append(element('strong',lead.name + ' · ' + (lead.service || 'General enquiry')));
      button.append(element('span',lead.stage.toUpperCase() + '  |  Priority ' + lead.priority + '/100  |  ' + date(lead.received_ms)));
      button.addEventListener('click',() => viewLead(lead.id));
      wrap.append(button);
    }
  }
  async function viewLead(id) {
    selectedId = id;
    renderLeads();
    try {
      const data = await api('leads/' + encodeURIComponent(id));
      const lead = data.lead;
      $('empty-detail').hidden = true;
      $('selected-detail').hidden = false;
      $('priority').textContent = 'Priority ' + lead.priority + '/100';
      const summary = $('lead-details');
      summary.replaceChildren();
      labelValue(summary,'Name',lead.name);
      labelValue(summary,'Phone',lead.phone);
      labelValue(summary,'Email',lead.email);
      labelValue(summary,'Company',lead.company);
      labelValue(summary,'Site',lead.site_address);
      labelValue(summary,'Service',lead.service);
      labelValue(summary,'Urgency',lead.urgency);
      labelValue(summary,'Issue',lead.message);
      const form = $('lead-update');
      form.elements.stage.value = lead.stage;
      form.elements.route.value = lead.route;
      form.elements.next_action.value = lead.next_action || '';
      form.elements.quote_dollars.value = (lead.quote_cents / 100).toFixed(2);
      const draft = $('draft-form');
      draft.elements.recipient.value = lead.email || lead.phone || '';
      draft.elements.body.value = '';
      draft.elements.subject.value = 'Alliance Group | Your property enquiry';
      const docs = $('documents');
      docs.replaceChildren();
      for (const file of data.documents || []) {
        const box = element('p',undefined,'item');
        const a = element('a',file.file_name + '  (' + (file.byte_size / 1048576).toFixed(1) + ' MB)');
        a.href = '/api/internal/documents/' + encodeURIComponent(file.id);
        box.append(a); docs.append(box);
      }
      if (!(data.documents || []).length) docs.append(element('p','No evidence attached yet.','item'));
      const events = $('events');
      events.replaceChildren();
      for (const row of data.events || []) {
        events.append(element('p',date(row.created_ms) + ' · ' + row.kind + ' · ' + row.actor,'item'));
      }
      if (!(data.events || []).length) events.append(element('p','No updates recorded.','item'));
      notice('Enquiry opened. Owner review is required before a client message is sent.');
    } catch (error) { notice(error.message); }
  }
  $('refresh').addEventListener('click',refresh);
  $('stage-filter').addEventListener('change',refresh);
  $('lead-update').addEventListener('submit',async event => {
    event.preventDefault();
    if(!selectedId) return;
    const f=event.currentTarget.elements;
    const body={stage:f.stage.value,route:f.route.value,next_action:f.next_action.value,quote_cents:Math.round(Number(f.quote_dollars.value || 0)*100)};
    try {
      await api('leads/' + encodeURIComponent(selectedId),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      await refresh();
      notice('Pipeline and next action saved to the private audit trail.');
    } catch(error) { notice('Save failed: ' + error.message); }
  });
  $('draft-form').addEventListener('submit',async event => {
    event.preventDefault();
    if(!selectedId) return;
    const f=event.currentTarget.elements;
    const draft={channel:f.channel.value,recipient:f.recipient.value,subject:f.subject.value,body:f.body.value};
    try {
      await api('leads/' + encodeURIComponent(selectedId) + '/drafts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(draft)});
      notice('Draft saved securely. Nothing was sent to the customer.');
      f.body.value = '';
    } catch(error) { notice('Draft failed: ' + error.message); }
  });
  $('document-form').addEventListener('submit',async event => {
    event.preventDefault();
    if(!selectedId) return;
    const file=event.currentTarget.elements.file.files[0];
    if(!file || file.size > 10485760) {notice('Select one document under 10 MB.');return;}
    try {
      await api('leads/' + encodeURIComponent(selectedId) + '/documents',{method:'POST',body:new FormData(event.currentTarget)});
      event.currentTarget.reset();
      await viewLead(selectedId);
      notice('Evidence attached to this private record.');
    } catch(error) { notice('Upload failed: ' + error.message); }
  });
  refresh();
})();