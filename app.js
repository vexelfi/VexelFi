/* ==============================
   VEXELFI — APP SCRIPT
   ============================== */

/* ---- MODAL OPEN / CLOSE ---- */
function openModal() {
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  showStep('step1');
}

function openModalWithRole(role) {
  openModal();
  // Pre-fill the position dropdown after modal opens
  requestAnimationFrame(() => {
    const sel = document.getElementById('position');
    if (sel) {
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === role) {
          sel.selectedIndex = i;
          sel.style.borderColor = '';
          break;
        }
      }
    }
  });
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  resetForm();
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

function showStep(id) {
  document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ---- FORM VALIDATION ---- */
function getVal(id) {
  return document.getElementById(id).value.trim();
}

function highlightField(id, valid) {
  const el = document.getElementById(id);
  if (el) el.style.borderColor = valid ? '' : 'var(--red)';
}

/* ---- STEP 1 → STEP 2 ---- */
function goToStep2() {
  const name     = getVal('fullName');
  const email    = getVal('email');
  const phone    = getVal('phone');
  const position = getVal('position');

  let ok = true;
  if (!name)                         { highlightField('fullName', false); ok = false; } else highlightField('fullName', true);
  if (!email || !email.includes('@')) { highlightField('email',    false); ok = false; } else highlightField('email',    true);
  if (!phone)                         { highlightField('phone',    false); ok = false; } else highlightField('phone',    true);
  if (!position)                      { highlightField('position', false); ok = false; } else highlightField('position', true);

  if (!ok) { shakeModal(); return; }

  showStep('step2');
  scrollModalTop();
}

/* ---- STEP 2 BACK ---- */
function goToStep1() {
  showStep('step1');
  scrollModalTop();
}

/* ---- SHOW NETWORK (when radio chosen) ---- */
function showNetworkSelect() {
  document.getElementById('networkSection').classList.add('visible');
  hideNetworkError();
}

/* ---- STEP 2 → STEP 3 ---- */
function goToStep3() {
  const payPref  = document.querySelector('input[name="cryptoPay"]:checked');
  const networks = Array.from(document.querySelectorAll('input[name="network"]:checked'));

  if (!payPref) { shakeModal(); return; }

  if (networks.length === 0) {
    showNetworkError();
    shakeModal();
    return;
  }

  hideNetworkError();

  document.getElementById('walletDefault').style.display   = 'block';
  document.getElementById('walletConnected').style.display = 'none';
  document.getElementById('walletSkipped').style.display   = 'none';

  showStep('step3');
  scrollModalTop();
}

/* ---- NETWORK ERROR ---- */
function showNetworkError() {
  document.getElementById('networkError').classList.add('show');
}
function hideNetworkError() {
  document.getElementById('networkError').classList.remove('show');
}
function onNetworkChange() {
  if (document.querySelectorAll('input[name="network"]:checked').length > 0) {
    hideNetworkError();
  }
}

/* ---- WALLET ---- */
async function connectWallet(walletName) {
  const btn = event.currentTarget;
  const origContent = btn.innerHTML;

  btn.innerHTML = '<span class="w-icon">⏳</span><div><strong>Connecting...</strong><small>Confirm in your wallet</small></div>';
  btn.disabled = true;

  await sleep(1800);

  const address = generateFakeAddress();
  btn.innerHTML = origContent;
  btn.disabled  = false;

  window._walletName    = walletName;
  window._walletAddress = address;

  document.getElementById('walletAddressDisplay').textContent = address;
  document.getElementById('walletDefault').style.display   = 'none';
  document.getElementById('walletConnected').style.display = 'block';

  scrollModalTop();
}

function skipWallet() {
  window._walletName    = null;
  window._walletAddress = null;
  document.getElementById('walletDefault').style.display  = 'none';
  document.getElementById('walletSkipped').style.display  = 'block';
}

/* ---- SUBMIT ---- */
function submitForm() {
  const name     = getVal('fullName');
  const email    = getVal('email');
  const position = getVal('position');
  const payPref  = document.querySelector('input[name="cryptoPay"]:checked');
  const networks = Array.from(document.querySelectorAll('input[name="network"]:checked')).map(n => n.value);

  document.getElementById('successName').textContent = name;

  let html = `
    <div><strong>Name:</strong> ${name}</div>
    <div><strong>Email:</strong> ${email}</div>
    <div><strong>Position:</strong> ${position || '—'}</div>
    <div><strong>Payment:</strong> ${payLabel(payPref?.value)}</div>
  `;
  if (networks.length)      html += `<div><strong>Networks:</strong> ${networks.join(', ')}</div>`;
  if (window._walletAddress) html += `<div><strong>Wallet (${window._walletName}):</strong> ${shortAddress(window._walletAddress)}</div>`;

  document.getElementById('successDetails').innerHTML = html;
  showStep('step4');
  scrollModalTop();
}

/* ---- RESET ---- */
function resetForm() {
  ['fullName','email','phone','portfolio','bio'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.style.borderColor = ''; }
  });
  const pos = document.getElementById('position');
  if (pos) { pos.value = ''; pos.style.borderColor = ''; }

  document.querySelectorAll('input[name="cryptoPay"]').forEach(r => r.checked = false);
  document.querySelectorAll('input[name="network"]').forEach(c => c.checked = false);
  document.getElementById('networkSection').classList.remove('visible');
  hideNetworkError();
  window._walletName = null;
  window._walletAddress = null;
}

/* ---- BURGER ---- */
document.getElementById('burger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('open');
});
function closeMobile() {
  document.getElementById('mobileMenu').classList.remove('open');
}

/* ---- NAVBAR SCROLL ---- */
window.addEventListener('scroll', () => {
  document.querySelector('.nav').style.borderBottomColor = window.scrollY > 20
    ? 'rgba(255,255,255,0.12)'
    : 'rgba(255,255,255,0.08)';
}, { passive: true });

/* ---- HELPERS ---- */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function generateFakeAddress() {
  const c = '0123456789abcdef';
  let a = '0x';
  for (let i = 0; i < 40; i++) a += c[Math.floor(Math.random() * c.length)];
  return a;
}

function shortAddress(a) { return a.slice(0,8) + '...' + a.slice(-6); }

function payLabel(v) {
  return { full: 'Fully in crypto', partial: 'Partially in crypto' }[v] || '—';
}

function shakeModal() {
  const m = document.getElementById('modal');
  m.classList.remove('shake');
  void m.offsetWidth;
  m.classList.add('shake');
  setTimeout(() => m.classList.remove('shake'), 400);
}

function scrollModalTop() {
  document.getElementById('modal').scrollTop = 0;
}

/* ---- SECTION FADE IN ---- */
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity   = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.06 });

document.querySelectorAll('.section').forEach(el => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  sectionObserver.observe(el);
});

/* ---- LIVE CRYPTO TICKER ---- */
const TICKER_COINS = [
  { id: 'bitcoin',      sym: 'BTC'  },
  { id: 'ethereum',     sym: 'ETH'  },
  { id: 'solana',       sym: 'SOL'  },
  { id: 'binancecoin',  sym: 'BNB'  },
  { id: 'avalanche-2',  sym: 'AVAX' },
  { id: 'arbitrum',     sym: 'ARB'  },
  { id: 'optimism',     sym: 'OP'   },
  { id: 'ripple',       sym: 'XRP' },
  { id: 'tron',         sym: 'TRON' },
  { id: 'solana',       sym: 'SOL' },
  { id: 'monero',       sym: 'XMR' },
  { id: 'the-open-network',    sym: 'TON' },
];
 
/* --- Infinite scroll via requestAnimationFrame --- */
(function startTicker() {
  const track = document.getElementById('tickerTrack');
  const listA = document.getElementById('tickerA');
  if (!track || !listA) return;
 
  const SPEED = 0.4; // px per frame at 60fps
  let x = 0;
  let listWidth = 0;
  let ready = false;
 
  function setup() {
    listWidth = listA.getBoundingClientRect().width;
    if (listWidth === 0) { setTimeout(setup, 50); return; }
 
    // fill screen: clone until total width > screen * 2
    const needed = Math.ceil((window.innerWidth * 2.5) / listWidth);
    // remove old clones first
    track.querySelectorAll('.ticker-clone').forEach(el => el.remove());
    for (let i = 0; i < needed; i++) {
      const clone = listA.cloneNode(true);
      clone.id = '';
      clone.classList.add('ticker-clone');
      track.appendChild(clone);
    }
 
    ready = true;
  }
 
  function loop() {
    if (ready) {
      x -= SPEED;
      if (x <= -listWidth) x += listWidth;
      track.style.transform = `translateX(${x}px)`;
    }
    requestAnimationFrame(loop);
  }
 
  setTimeout(setup, 120);
  requestAnimationFrame(loop);
 
  // re-setup on resize
  window.addEventListener('resize', () => { ready = false; setup(); }, { passive: true });
})();
 
/* --- Data updates: only patch textContent + color, never touch DOM structure --- */
async function fetchTickerPrices() {
  const ids = TICKER_COINS.map(c => c.id).join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
  try {
    const res  = await fetch(url);
    const data = await res.json();
 
    document.querySelectorAll('.t-coin').forEach(span => {
      const info = data[span.dataset.coin];
      if (!info || info.usd_24h_change === undefined) return;
      const change = info.usd_24h_change;
      const sign   = change >= 0 ? '+' : '';
      span.textContent = `${span.dataset.sym} ${sign}${change.toFixed(2)}%`;
      span.style.color = change >= 0 ? '#1aefb0' : '#ff5a5a';
    });
  } catch (err) {
    console.warn('Ticker fetch failed, keeping last values:', err);
  }
}
 
fetchTickerPrices();
setInterval(fetchTickerPrices, 30_000);

/* ---- SHAKE KEYFRAME (injected) ---- */
(function () {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-5px); }
      40%      { transform: translateX(5px); }
      60%      { transform: translateX(-3px); }
      80%      { transform: translateX(3px); }
    }
    .shake { animation: shake 0.38s ease !important; }
  `;
  document.head.appendChild(s);
})();
