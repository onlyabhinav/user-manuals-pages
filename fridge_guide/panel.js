/* Fridge guide — control panel simulator.
   Behaviour follows the manual's "Main panel" section:
   - Freezer (tap): -15 → -17 → -19 → -21 → -23 → -15 (default -19)
   - Fridge (tap): 7 → 4 → 3 → 2 → 1 → Vacation → 7 (default 3)
   - Fridge (hold 3 s): Power Cool on/off
   - Fridge (hold 10 s): Wi-Fi on/off
   - Freezer Convert (hold 3 s): selection mode, tap to choose, applies after 10 s */
(function () {
  const { $, $$ } = Guide;
  const root = $('#panelSim');
  if (!root) return;

  const FZ_SHOW = [-23, -21, -19, -17, -15];
  const FZ_CYCLE = [-15, -17, -19, -21, -23];
  const FR_SHOW = [1, 2, 3, 4, 7];
  const FR_CYCLE = [7, 4, 3, 2, 1, 'vac'];
  const APPLY_MS = 5000;                 // real panel: 10 s (shortened for the demo)
  const DEFAULTS = { fz: -19, fr: 3, powerCool: false, wifi: false, convert: 'freezer', selecting: false, pending: null };
  let st = { ...DEFAULTS };
  let applyTimer = null, wifiBlinkTimer = null, wifiBlink = false;

  const fzCol = $('#fzCol', root), frCol = $('#frCol', root), midCol = $('#midCol', root);
  FZ_SHOW.forEach(t => fzCol.insertAdjacentHTML('beforeend', `<span class="seg" data-fz="${t}">${t}°C</span>`));
  frCol.insertAdjacentHTML('beforeend', `<span class="seg" data-fr="vac" title="Vacation">✈ Vac</span>`);
  FR_SHOW.forEach(t => frCol.insertAdjacentHTML('beforeend', `<span class="seg" data-fr="${t}">${t}°C</span>`));
  midCol.insertAdjacentHTML('beforeend', `
    <span class="seg" data-m="cvFridge" title="Freezer working as a fridge">💧 Fridge</span>
    <span class="seg" data-m="cvOff" title="Freezer Convert off">Off</span>
    <span class="seg" data-m="pc" title="Power Cool">❄ Cool</span>
    <span class="seg" data-m="ai" title="AI Energy (set in app)">🍃 AI</span>
    <span class="seg" data-m="wifi" title="Wi-Fi">📶 Wi-Fi</span>`);

  function render() {
    const converted = st.convert === 'fridge';
    $$('[data-fz]', root).forEach(s => s.classList.toggle('on', !converted && !st.selecting && +s.dataset.fz === st.fz));
    $$('[data-fr]', root).forEach(s => s.classList.toggle('on', s.dataset.fr === String(st.fr)));
    const mode = st.selecting ? st.pending : st.convert;
    const cvF = $('[data-m="cvFridge"]', root), cvO = $('[data-m="cvOff"]', root);
    cvF.classList.toggle('on', mode === 'fridge'); cvO.classList.toggle('on', mode === 'freezer');
    cvF.classList.toggle('blink', st.selecting && mode === 'fridge');
    cvO.classList.toggle('blink', st.selecting && mode === 'freezer');
    $('[data-m="pc"]', root).classList.toggle('on', st.powerCool);
    const w = $('[data-m="wifi"]', root);
    w.classList.toggle('on', st.wifi || wifiBlink); w.classList.toggle('blink', wifiBlink);
  }

  const icons = { note: 'ℹ', caution: '⚠', warning: '⛔', tip: '✓' };
  function explain(title, text, callouts = [], logLine) {
    $('#nowTitle').textContent = title;
    $('#nowText').textContent = text;
    $('#nowCallouts').innerHTML = callouts.map(([k, h, b]) =>
      `<div class="callout ${k}"><span aria-hidden="true">${icons[k]}</span><span><strong>${h}</strong>${b}</span></div>`).join('');
    const li = document.createElement('li'); li.textContent = logLine || title;
    const log = $('#simLog'); log.appendChild(li); log.scrollTop = log.scrollHeight;
    $('#nowCard').animate([{ background: 'var(--accent-soft)' }, { background: 'var(--surface)' }], 600);
  }
  const hint = t => { $('#simHint').textContent = t; };

  /* ----- Button behaviours ----- */
  const actions = {
    freezer: {
      holds: [],
      tap() {
        if (st.convert === 'fridge') {
          return explain('Freezer is working as a fridge',
            'You can’t set a freezer temperature while Freezer Convert is on. Hold Freezer Convert for 3 seconds to switch back.', [], 'Freezer (ignored: converted)');
        }
        if (st.selecting) return;
        st.fz = FZ_CYCLE[(FZ_CYCLE.indexOf(st.fz) + 1) % FZ_CYCLE.length];
        explain(`Freezer set to ${st.fz}°C`, 'Each press makes it one step colder, then it wraps back to -15 °C. The default is -19 °C.',
          st.fz === -15 ? [['caution', 'Hot weather?', 'Don’t use -15 °C in summer (above 35 °C). Food may spoil.']] : [], `Freezer → ${st.fz}°C`);
        hint('Next: hold Fridge for 3 seconds');
      }
    },
    fridge: {
      holds: [{ ms: 3000, label: 'Release for Power Cool · keep holding for Wi-Fi' }, { ms: 10000, label: 'Release to switch Wi-Fi' }],
      tap() {
        st.fr = FR_CYCLE[(FR_CYCLE.indexOf(st.fr) + 1) % FR_CYCLE.length];
        if (st.fr === 'vac') {
          explain('Vacation mode on',
            'The fridge temperature bar turns off and the fridge is kept under 17 °C. The freezer keeps working as set. Press Fridge again to leave Vacation (it goes back to 7 °C).',
            [['note', 'Before you leave', 'Empty the fridge compartment and make sure the door is closed.']], 'Fridge → Vacation');
        } else {
          const c = st.fr === 1 ? [['caution', 'Winter tip', 'Don’t keep 1 °C in winter. It can hurt cooling performance.']]
                  : st.fr >= 5 ? [['caution', 'Summer tip', 'Avoid 5–7 °C in summer. It can hurt cooling performance.']] : [];
          explain(`Fridge set to ${st.fr}°C`, 'Each press makes it one step colder. After 1 °C comes Vacation mode. The default is 3 °C.', c, `Fridge → ${st.fr}°C`);
        }
      },
      hold(stage) {
        if (stage === 0) {
          st.powerCool = !st.powerCool;
          explain(st.powerCool ? 'Power Cool on' : 'Power Cool off',
            st.powerCool ? 'The fan runs at full speed for several hours to chill new groceries fast, then the fridge goes back to your setting.'
                         : 'The fridge goes back to your previous temperature.',
            st.powerCool ? [['note', 'Uses more electricity', 'Turn it off if you don’t need it.']] : [],
            st.powerCool ? 'Hold Fridge 3 s → Power Cool on' : 'Hold Fridge 3 s → Power Cool off');
          hint('Next: hold Freezer Convert for 3 seconds');
        } else {
          const turningOn = !st.wifi;
          clearTimeout(wifiBlinkTimer); wifiBlink = true; render();
          wifiBlinkTimer = setTimeout(() => { wifiBlink = false; st.wifi = turningOn; render(); }, 2500);
          explain(turningOn ? 'Wi-Fi turning on' : 'Wi-Fi turning off',
            turningOn ? 'The Wi-Fi icon blinks for 5 seconds, then stays on. Next, connect the fridge in the SmartThings app.'
                      : 'The Wi-Fi icon blinks for 5 seconds, then turns off.',
            [], turningOn ? 'Hold Fridge 10 s → Wi-Fi on' : 'Hold Fridge 10 s → Wi-Fi off');
        }
      }
    },
    convert: {
      holds: [{ ms: 3000, label: 'Release to enter selection mode' }],
      tap() {
        if (!st.selecting) {
          return explain('Hold, don’t tap', 'Freezer Convert needs a 3-second hold to start selection mode.', [], 'Freezer Convert tap (needs a hold)');
        }
        st.pending = st.pending === 'fridge' ? 'freezer' : 'fridge';
        armApply();
        explain(`Selected: ${st.pending === 'fridge' ? 'Fridge' : 'Freezer'}`,
          'Tap again to change your choice. It is applied automatically 10 seconds after your last press.', [], `Freezer Convert → ${st.pending}`);
      },
      hold() {
        st.selecting = true;
        st.pending = st.convert === 'fridge' ? 'freezer' : 'fridge';
        armApply();
        explain('Selection mode', 'The indicator blinks. Tap Freezer Convert to choose Fridge or Freezer. Your choice applies after 10 seconds (5 seconds in this demo).',
          st.convert === 'freezer'
            ? [['warning', 'Before switching to Fridge', 'Take out frozen food (it will thaw), and never leave glass bottles of liquid in the freezer.']]
            : [['warning', 'Before switching back to Freezer', 'Take out chilled food. It will freeze as the temperature drops.']],
          'Hold Freezer Convert 3 s → selection mode');
        hint('Tap Freezer Convert to change the choice');
      }
    }
  };

  function armApply() {
    clearTimeout(applyTimer);
    applyTimer = setTimeout(() => {
      st.selecting = false; st.convert = st.pending;
      if (st.convert === 'freezer') st.fz = -19;
      explain(st.convert === 'fridge' ? 'Freezer now works as a fridge' : 'Back to Freezer at -19 °C',
        st.convert === 'fridge'
          ? 'As it warms up, dew may form on the inner walls. That’s normal. Use plastic containers, especially for vegetables.'
          : 'The freezer starts at the default -19 °C. Tap Freezer to change it.',
        [], `Freezer Convert applied → ${st.convert}`);
      hint('Try tapping Fridge until Vacation shows');
      render();
    }, APPLY_MS);
  }

  /* ----- Press handling: tap vs. timed holds, with progress bar ----- */
  $$('.pbtn', root).forEach(btn => {
    const a = actions[btn.dataset.btn], fill = $('.fill', btn);
    let t0 = 0, raf = 0, pressing = false;
    const reached = () => { const ms = performance.now() - t0; let s = -1; a.holds.forEach((h, i) => { if (ms >= h.ms) s = i; }); return s; };
    const tick = () => {
      const ms = performance.now() - t0, h = a.holds;
      if (h.length) {
        const s = reached();
        const from = s < 0 ? 0 : h[s].ms, to = h[s + 1] ? h[s + 1].ms : null;
        fill.style.width = to ? Math.min((ms - from) / (to - from), 1) * 100 + '%' : '100%';
        fill.classList.toggle('stage2', s >= 0);
        if (s >= 0) hint(h[s].label); else if (ms > 300) hint(`Keep holding… ${((h[0].ms - ms) / 1000).toFixed(1)} s`);
      }
      raf = requestAnimationFrame(tick);
    };
    const reset = () => { pressing = false; cancelAnimationFrame(raf); fill.style.width = '0'; fill.classList.remove('stage2'); };
    btn.addEventListener('pointerdown', e => {
      e.preventDefault(); btn.setPointerCapture?.(e.pointerId);
      pressing = true; t0 = performance.now(); raf = requestAnimationFrame(tick);
    });
    btn.addEventListener('pointerup', () => {
      if (!pressing) return;
      const s = reached(); reset();
      s < 0 ? a.tap() : a.hold(s);
      render();
    });
    btn.addEventListener('pointercancel', reset);
    btn.addEventListener('contextmenu', e => e.preventDefault());
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); a.tap(); render(); }
    });
  });

  /* ----- Door alarm demo ----- */
  let doorTimer = null;
  $('#doorBtn').addEventListener('click', e => {
    const b = e.currentTarget;
    if (doorTimer) {
      clearTimeout(doorTimer); doorTimer = null; b.textContent = '🚪 Leave the door open';
      return explain('Door closed', 'The alarm stops when the door is closed. You can also press any button to silence it.', [], 'Door closed');
    }
    b.textContent = '🚪 Close the door';
    explain('Door is open…', 'In real life the alarm waits 2 minutes. Here it takes 3 seconds.', [], 'Door opened');
    doorTimer = setTimeout(() => {
      explain('🔔 Door alarm', 'The door has been open for more than 2 minutes, so the alarm sounds. If the door stays open for 5 minutes, the inside light also blinks to alert people who are deaf or hard of hearing.',
        [['note', 'Still beeping after closing?', 'Press any button. If it sounds again after 12 hours, contact service.']], 'Door alarm');
    }, 3000);
  });

  $('#resetSim').addEventListener('click', () => {
    clearTimeout(applyTimer); clearTimeout(wifiBlinkTimer); wifiBlink = false;
    st = { ...DEFAULTS }; render();
    explain('Factory defaults', 'Freezer -19 °C, Fridge 3 °C.', [], 'Reset');
    hint('Try: tap Freezer a few times');
  });

  render();
})();
