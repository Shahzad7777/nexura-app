let nexuraProjects = [];
let nexuraBlogs = [];
let nexuraInquiries = [];
let nexuraSettings = { brandName: "NEXURA", tagline: "Tech & Business Acceleration", priceLaunchpad: 400, priceDtc: 500, privacyText: "" };

function initHypnoticIntro() {
  const overlay = document.getElementById('hypnotic-intro');
  const skipBtn = document.getElementById('skip-intro-btn');
  if (!overlay) return;
  if (sessionStorage.getItem('nexura_intro_seen') === 'true') {
    overlay.style.display = 'none';
    return;
  }
  function dismissIntro() {
    sessionStorage.setItem('nexura_intro_seen', 'true');
    overlay.classList.add('fade-out');
    setTimeout(() => { overlay.style.display = 'none'; }, 800);
  }
  const timer = setTimeout(dismissIntro, 2300);
  skipBtn?.addEventListener('click', () => { clearTimeout(timer); dismissIntro(); });
}

function initMobileNavigation() {
  const navContainer = document.querySelector('.nav-container');
  if (!navContainer) return;
  let trigger = document.querySelector('.mobile-menu-trigger');
  if (!trigger) {
    trigger = document.createElement('button');
    trigger.className = 'mobile-menu-trigger';
    trigger.innerHTML = '<i class="fa-solid fa-bars"></i>';
    navContainer.appendChild(trigger);
  }
  let drawer = document.getElementById('mobile-nav-drawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'mobile-nav-drawer';
    drawer.className = 'mobile-nav-drawer';
    drawer.innerHTML = `
      <a href="index.html" class="nav-item">Home</a>
      <a href="webapps.html" class="nav-item">01. Web Apps & Software</a>
      <a href="marketing.html" class="nav-item">02. Conversion Marketing</a>
      <a href="graphics.html" class="nav-item">03. Graphic Design</a>
      <a href="ai-automation.html" class="nav-item">04. AI Automation</a>
      <a href="portfolio.html" class="nav-item">Case Studies</a>
      <a href="pricing.html" class="nav-item">Pricing ($400 - $500)</a>
      <a href="blogs.html" class="nav-item">Blogs & Insights</a>
      <a href="privacy.html" class="nav-item">Privacy Policy & NDA</a>
      <a href="admin.html" class="nav-item">Admin Command Center</a>
    `;
    document.body.appendChild(drawer);
  }
  trigger.addEventListener('click', () => {
    drawer.classList.toggle('open');
    trigger.innerHTML = drawer.classList.contains('open') ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });
}

function initAmbientCanvas() {
  let canvas = document.getElementById('ambient-network-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'ambient-network-canvas';
    document.body.prepend(canvas);
  }
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  window.addEventListener('resize', () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; });
  const count = window.innerWidth < 768 ? 22 : 44;
  const particles = Array.from({ length: count }, () => ({
    x: Math.random() * width, y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
    radius: Math.random() * 2 + 1, alpha: Math.random() * 0.35 + 0.15
  }));
  let mouseX = -1000, mouseY = -1000;
  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
  function render() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x = (p.x + p.vx + width) % width;
      p.y = (p.y + p.vy + height) % height;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(58, 82, 69, ${p.alpha})`; ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 120) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(58, 82, 69, ${0.1 * (1 - dist / 120)})`; ctx.stroke();
        }
      }
      const mdist = Math.hypot(p.x - mouseX, p.y - mouseY);
      if (mdist < 130) {
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = `rgba(0, 212, 126, ${0.22 * (1 - mdist / 130)})`; ctx.stroke();
      }
    }
    requestAnimationFrame(render);
  }
  render();
}

async function fetchNexuraData() {
  try {
    const [pRes, bRes, iRes, sRes] = await Promise.all([
      fetch('/api/projects'), fetch('/api/blogs'), fetch('/api/inquiries'), fetch('/api/settings')
    ]);
    if (pRes.ok) nexuraProjects = (await pRes.json()).projects || [];
    if (bRes.ok) nexuraBlogs = (await bRes.json()).blogs || [];
    if (iRes.ok) nexuraInquiries = (await iRes.json()).inquiries || [];
    if (sRes.ok) { nexuraSettings = (await sRes.json()).settings || nexuraSettings; applySettingsToUI(); }
  } catch (e) {}
  renderProjects(); renderBlogs(); renderInquiries(); initInteractiveCalculator();
}

function applySettingsToUI() {
  document.querySelectorAll('#price-val-launchpad').forEach(el => { if (nexuraSettings.priceLaunchpad) el.textContent = '$' + nexuraSettings.priceLaunchpad; });
  document.querySelectorAll('#price-val-dtc').forEach(el => { if (nexuraSettings.priceDtc) el.textContent = '$' + nexuraSettings.priceDtc; });
  if (nexuraSettings.tagline) document.querySelectorAll('.brand-sub').forEach(el => { el.textContent = nexuraSettings.tagline; });
  const priv = document.getElementById('dynamic-privacy-summary');
  if (priv && nexuraSettings.privacyText) priv.textContent = nexuraSettings.privacyText;
}

function initInteractiveCalculator() {
  const calc = document.getElementById('interactive-price-calculator');
  if (!calc) return;
  const baseSelect = document.getElementById('calc-base-tier');
  const addons = document.querySelectorAll('.calc-addon-check');
  const totalDisplay = document.getElementById('calc-total-val');
  const lockBtn = document.getElementById('btn-lock-estimate');
  if (baseSelect && nexuraSettings.priceLaunchpad && nexuraSettings.priceDtc) {
    baseSelect.options[0].value = nexuraSettings.priceLaunchpad;
    baseSelect.options[0].textContent = `Service Launchpad ($${nexuraSettings.priceLaunchpad} Base)`;
    baseSelect.options[1].value = nexuraSettings.priceDtc;
    baseSelect.options[1].textContent = `DTC eCommerce Engine ($${nexuraSettings.priceDtc} Base)`;
  }
  function updateCalc() {
    let total = parseInt(baseSelect?.value || 400, 10);
    const items = [baseSelect?.options[baseSelect.selectedIndex]?.text || 'Service Launchpad'];
    addons.forEach(a => { if (a.checked) { total += parseInt(a.value, 10); items.push(a.getAttribute('data-name')); } });
    if (totalDisplay) totalDisplay.textContent = '$' + total;
    if (lockBtn) lockBtn.setAttribute('data-computed', `Custom Estimate ($${total}): ${items.join(' + ')}`);
  }
  baseSelect?.addEventListener('change', updateCalc);
  addons.forEach(a => a.addEventListener('change', updateCalc));
  updateCalc();
  lockBtn?.addEventListener('click', () => {
    const scope = lockBtn.getAttribute('data-computed');
    const msg = document.getElementById('inq-message');
    const form = document.getElementById('inquiry-form');
    if (msg && form) {
      msg.value = `[CALCULATOR ESTIMATE]: ${scope}\n\nProject Brief: `;
      form.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('inq-name')?.focus();
    }
  });
}

let currentFilter = 'all';
function renderProjects() {
  const container = document.getElementById('portfolio-container');
  if (!container) return;
  const list = currentFilter === 'all' ? nexuraProjects : nexuraProjects.filter(p => p.category === currentFilter);
  container.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'case-card';
    card.innerHTML = `
      <div>
        <div class="case-top">
          <span class="case-category-badge"><i class="fa-solid ${p.icon || 'fa-code'}"></i> ${escapeHTML(p.categoryLabel || p.category)}</span>
          <span class="case-badge-pill">${escapeHTML(p.badge || 'Case Study')}</span>
        </div>
        <h3 class="case-title">${escapeHTML(p.title)}</h3>
        <div class="case-tagline">${escapeHTML(p.tagline)}</div>
        <p class="case-desc">${escapeHTML(p.solution)}</p>
      </div>
      <div class="case-foot">
        <span><i class="fa-solid fa-location-dot"></i> ${escapeHTML(p.location)}</span>
        <button class="btn-open-case">View Blueprint <i class="fa-solid fa-arrow-right"></i></button>
      </div>
    `;
    card.addEventListener('click', () => openProjectModal(p));
    container.appendChild(card);
  });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.getAttribute('data-filter') || 'all';
    renderProjects();
  });
});

const caseModal = document.getElementById('case-study-modal');
document.getElementById('close-case-modal')?.addEventListener('click', () => caseModal?.classList.remove('open'));
caseModal?.addEventListener('click', e => { if (e.target === caseModal) caseModal.classList.remove('open'); });

function openProjectModal(p) {
  if (!caseModal) return;
  document.getElementById('modal-case-title').textContent = p.title;
  document.getElementById('modal-case-badge').textContent = p.categoryLabel || p.category;
  document.getElementById('modal-case-problem').textContent = p.clientProblem || "";
  document.getElementById('modal-case-solution').textContent = p.solution || "";
  document.getElementById('modal-case-stack').textContent = p.techStack || "Vanilla JS, CSS3, Node.js";
  const link = document.getElementById('modal-case-link');
  if (link) link.href = p.url || 'portfolio.html';
  caseModal.classList.add('open');
}

const aiChatFeed = document.getElementById('neural-chat-feed');
const aiChatForm = document.getElementById('neural-chat-form');
const aiChatInput = document.getElementById('neural-chat-input');
const aiKB = [
  { triggers: ["price", "cost", "400", "500", "package"], response: "Nexura offers flat turnkey sprints:\n• $400 Service Launchpad (Up to 5 pages, copy, graphics & quote calculator)\n• $500 DTC eCommerce Engine (Slide cart, order tracking, product copy & graphics)." },
  { triggers: ["gts", "dubai", "renovation"], response: "GTS Dubai is our luxury villa renovation platform featuring an interactive cost estimator and VIP WhatsApp routing." },
  { triggers: ["rawan", "footwear", "shoe", "dtc", "checkout"], response: "Rawan Elite Footwear is our custom DTC store with an asynchronous slide-out cart, live courier tracking, and zero-lag mobile checkout." },
  { triggers: ["copy", "graphic", "anti-agency"], response: "100% of direct-response copywriting and custom vector graphics are included in your flat sprint fee with zero extra charges." },
  { triggers: ["timeline", "days", "delivery"], response: "Our sprint delivery timeline is 14 to 28 business days with 100% source code ownership transferred to you." }
];

aiChatForm?.addEventListener('submit', e => {
  e.preventDefault();
  const q = aiChatInput.value.trim();
  if (!q) return;
  appendMsg(q, 'user');
  aiChatInput.value = '';
  setTimeout(() => {
    const match = aiKB.find(k => k.triggers.some(t => q.toLowerCase().includes(t)));
    appendMsg(match ? match.response : "We specialize in Web Apps, Marketing Funnels, Brand Graphics, and AI Chatbots ($400-$500 flat). Click the WhatsApp button to chat directly with our Project Director!", 'bot');
  }, 350);
});

function appendMsg(text, sender) {
  if (!aiChatFeed) return;
  const div = document.createElement('div');
  div.className = `chat-msg ${sender}-msg`;
  div.innerHTML = `<div class="msg-avatar"><i class="fa-solid ${sender === 'bot' ? 'fa-robot' : 'fa-user'}"></i></div><div class="msg-bubble">${escapeHTML(text).replace(/\n/g, '<br>')}</div>`;
  aiChatFeed.appendChild(div);
  aiChatFeed.scrollTop = aiChatFeed.scrollHeight;
}

document.querySelectorAll('.ai-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    if (aiChatInput) { aiChatInput.value = chip.getAttribute('data-q'); aiChatForm?.dispatchEvent(new Event('submit')); }
  });
});

function renderBlogs() {
  const container = document.getElementById('blogs-container');
  if (!container) return;
  container.innerHTML = '';
  nexuraBlogs.forEach(b => {
    const card = document.createElement('div');
    card.className = 'blog-card-item';
    card.innerHTML = `
      <div>
        <div class="blog-meta-tag"><span><i class="fa-regular fa-clock"></i> ${escapeHTML(b.readTime || '4 min')}</span><span>${escapeHTML(b.date || 'Recent')}</span></div>
        <h3 class="blog-card-title">${escapeHTML(b.title)}</h3>
        <p class="blog-card-excerpt">${escapeHTML(b.excerpt)}</p>
      </div>
      <div class="blog-card-foot"><span>${escapeHTML(b.author)}</span><span style="color:var(--mint-primary);">Read Article <i class="fa-solid fa-arrow-right"></i></span></div>
    `;
    card.addEventListener('click', () => openArticleModal(b));
    container.appendChild(card);
  });
}

const readerModal = document.getElementById('article-reader-modal');
document.getElementById('close-reader-btn')?.addEventListener('click', () => readerModal?.classList.remove('open'));
readerModal?.addEventListener('click', e => { if (e.target === readerModal) readerModal.classList.remove('open'); });

function openArticleModal(b) {
  if (!readerModal) return;
  document.getElementById('reader-category').textContent = b.category || "INSIGHT";
  document.getElementById('reader-title').textContent = b.title;
  document.getElementById('reader-author').textContent = 'By ' + (b.author || 'Nexura Board');
  document.getElementById('reader-time').textContent = b.readTime || '4 min read';
  document.getElementById('reader-content-body').innerHTML = (b.content || '').split('\n\n').map(p => `<p style="margin-bottom:14px;">${escapeHTML(p)}</p>`).join('');
  readerModal.classList.add('open');
}

document.querySelectorAll('.btn-choose-package').forEach(btn => {
  btn.addEventListener('click', () => {
    const pkg = btn.getAttribute('data-package');
    const sel = document.getElementById('inq-package');
    const form = document.getElementById('inquiry-form');
    if (sel && pkg) { sel.value = pkg; form?.scrollIntoView({ behavior: 'smooth' }); document.getElementById('inq-name')?.focus(); }
  });
});

function renderInquiries() {
  const container = document.getElementById('public-inquiries-feed');
  const badge = document.getElementById('feed-count-badge');
  if (!container) return;
  container.innerHTML = '';
  if (badge) badge.textContent = nexuraInquiries.length;
  nexuraInquiries.forEach(item => {
    const div = document.createElement('div');
    div.className = 'review-item';
    div.innerHTML = `
      <div class="rev-header">
        <span class="rev-client"><i class="fa-solid fa-circle-user" style="color:var(--mint-primary);"></i> ${escapeHTML(item.name)} <small>(${escapeHTML(item.company)})</small></span>
        <span class="rev-package">${escapeHTML(item.package)}</span>
      </div>
      <p class="rev-msg">"${escapeHTML(item.message)}"</p>
      ${item.reply ? `<div class="official-reply-box"><span class="badge"><i class="fa-solid fa-shield-check"></i> OFFICIAL NEXURA DISPATCH</span><p>${escapeHTML(item.reply.replace(/^Official Nexura Dispatch:\s*/, ''))}</p></div>` : ''}
    `;
    container.appendChild(div);
  });
}

document.getElementById('inquiry-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const payload = {
    name: document.getElementById('inq-name').value.trim(),
    email: document.getElementById('inq-email').value.trim(),
    company: document.getElementById('inq-company').value.trim(),
    package: document.getElementById('inq-package').value,
    message: document.getElementById('inq-message').value.trim()
  };
  const res = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (res.ok) {
    const data = await res.json();
    nexuraInquiries.unshift(data.inquiry);
    renderInquiries();
    e.target.reset();
    alert('Project Brief submitted! Our technical director will send your roadmap within 24 hours.');
  }
});

function initCookiesBanner() {
  const banner = document.getElementById('cookie-consent-bar');
  if (!banner) return;
  if (!localStorage.getItem('nexura_cookie_consent')) setTimeout(() => banner.classList.remove('hidden'), 1200);
  document.getElementById('btn-cookie-accept')?.addEventListener('click', () => { localStorage.setItem('nexura_cookie_consent', 'accepted'); banner.classList.add('hidden'); });
  document.getElementById('btn-cookie-decline')?.addEventListener('click', () => { localStorage.setItem('nexura_cookie_consent', 'essential_only'); banner.classList.add('hidden'); });
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
}

document.addEventListener('DOMContentLoaded', () => {
  initHypnoticIntro(); initMobileNavigation(); initAmbientCanvas(); fetchNexuraData(); initCookiesBanner();
});
