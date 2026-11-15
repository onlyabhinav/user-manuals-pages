/* Fridge guide — content data + component wiring.
   Source: owner's manual DA68-03374J-05 (top-freezer, RT**D* family). */
(function () {
  const { $, store } = Guide;
  Guide.init({ id: 'fridge' });

  /* ---------- Parts map (Home) ---------- */
  Guide.partsMap([
    { n: 1,  name: 'Freezer shelf',       x: 80,  y: 50,  desc: 'Removable. Lift it off the rear hook, tilt and pull out.', go: 'care', anchor: 'care-shelves' },
    { n: 2,  name: 'Ice maker',           x: 56,  y: 80,  desc: 'Twist ice maker (some models). Fill to the line, twist the handle to drop cubes.', go: 'controls', anchor: 'ice' },
    { n: 3,  name: 'Fresh room',          x: 80,  y: 166, desc: 'Top area of the fridge compartment.' },
    { n: 4,  name: 'Glass shelf',         x: 80,  y: 196, desc: 'Heavy: use both hands. Never insert it upside down.', go: 'care', anchor: 'care-shelves' },
    { n: 5,  name: 'Active Fresh filter*', x: 50, y: 258, desc: 'Applicable models only.' },
    { n: 6,  name: 'Vegetable shelf',     x: 80,  y: 300, desc: 'Cover over the vegetable drawer. Lift off the rear hook, tilt and pull out.', go: 'care', anchor: 'care-veg' },
    { n: 7,  name: 'Vegetable drawer',    x: 80,  y: 344, desc: 'Gently lift the front and slide it out.', go: 'care', anchor: 'care-veg' },
    { n: 8,  name: 'Freezer door bin',    x: 182, y: 99,  desc: 'Press gently on the sides and lift up to remove. Empty it first.', go: 'care', anchor: 'care-bins' },
    { n: 9,  name: 'Egg tray',            x: 182, y: 188, desc: 'Sits in the upper fridge door bin.' },
    { n: 10, name: 'Variety door bin',    x: 182, y: 241, desc: 'For sauces, butter and small jars.', go: 'care', anchor: 'care-bins' },
    { n: 11, name: 'Bottle door bin',     x: 182, y: 319, desc: 'For tall bottles. Empty it before lifting out.', go: 'care', anchor: 'care-bins' },
  ], { svgGroup: $('#hots'), list: $('#partsList'), title: $('#partTitle'), desc: $('#partDesc') });

  /* ---------- Troubleshooter (Fix it) ---------- */
  Guide.troubleshooter($('#ts'), [
    { id: 'warm', icon: '🌡️', title: 'Not cold enough', summary: 'Warm, or not running at all', keywords: 'warm not cooling not working dead off',
      checks: [
        { cause: 'Power cord isn’t plugged in properly', fix: 'Push the plug firmly into the wall socket.' },
        { cause: 'Temperature is set too warm', fix: 'Set a colder temperature. <a href="#controls" data-go="controls">How →</a>' },
        { cause: 'It’s near heat or direct sunlight', fix: 'Move it away from the stove, heaters and sunny windows.' },
        { cause: 'Not enough space around it', fix: 'Leave more than 50 mm between the fridge and walls or cabinets.' },
        { cause: 'Vacation mode is on', fix: 'Press <b>Fridge</b> to turn Vacation off.' },
        { cause: 'It’s overloaded or food blocks the vents', fix: 'Don’t overfill it. Keep food away from the air vents.' } ] },
    { id: 'cold', icon: '🥶', title: 'Too cold', summary: 'Food freezing in the fridge', keywords: 'over cooling freezing frozen',
      checks: [ { cause: 'Temperature is set too cold', fix: 'Set a warmer temperature.' } ] },
    { id: 'hot', icon: '🔥', title: 'Wall feels hot', summary: 'Front corners or sides are warm', keywords: 'heat hot sides',
      checks: [ { cause: 'This is normal: anti-condensation pipes', fix: 'Heat-proof pipes in the front corners stop water forming. They can feel hot in a warm room. Not a fault.' } ] },
    { id: 'smell', icon: '👃', title: 'Bad smell', summary: 'Odours inside', keywords: 'odour odor smell stink',
      checks: [
        { cause: 'Spoiled food', fix: 'Throw it out and clean the inside.' },
        { cause: 'Strong-smelling food', fix: 'Wrap strong food airtight.' } ] },
    { id: 'wet', icon: '💧', title: 'Water on walls', summary: 'Condensation inside', keywords: 'condensation dew moisture wet',
      checks: [
        { cause: 'Door was left open', fix: 'Wipe away the moisture and don’t keep the door open for long.' },
        { cause: 'Food with lots of moisture', fix: 'Wrap food airtight.' },
        { cause: 'Freezer was just switched to Fridge mode', fix: 'Normal after Freezer Convert. Wipe with a dry cloth.' } ] },
    { id: 'frost', icon: '❄️', title: 'Frost build-up', summary: 'Ice around vents or walls', keywords: 'ice frost',
      checks: [
        { cause: 'Food is blocking the vents', fix: 'Move food so nothing blocks the vents.' },
        { cause: 'Door isn’t closing properly', fix: 'Make sure food doesn’t block the door, and clean the door seal (gasket).' } ] },
    { id: 'alarm', icon: '🔔', title: 'Alarm beeping', summary: 'Door alarm sounds', keywords: 'beep sound alarm',
      checks: [ { cause: 'A door was open for more than 2 minutes', fix: 'Close the door or press any button. If it sounds again after 12 hours, contact service.' } ] },
    { id: 'wifi', icon: '📶', title: 'Wi-Fi icon blinking', summary: 'Not connected to the app', keywords: 'wifi wireless blinking smartthings network',
      checks: [
        { cause: 'The fridge isn’t connected to SmartThings yet', fix: 'Connect it in the app. The icon stops blinking once connected. <a href="#controls/smartthings" data-go="controls" data-anchor="smartthings">Setup →</a>' },
        { cause: 'You don’t want to use the app', fix: 'Hold <b>Fridge</b> for 10 seconds to turn Wi-Fi off. The icon stops blinking.' } ] },
    { id: 'app', icon: '📱', title: 'App won’t connect', summary: 'SmartThings problems', keywords: 'smartthings app login account register error',
      checks: [
        { cause: 'Not logged in', fix: 'Log in to your Samsung account in the app (or create one for free).' },
        { cause: 'Router problem', fix: 'Check your router works. Wi-Fi icon off on the fridge means no connection yet: register the fridge in the app.' },
        { cause: 'Error while registering', fix: 'Distance from the router or interference can cause this. Wait a moment and try again.' },
        { cause: 'Connected but the app won’t run', fix: 'Restart the app, or disconnect and reconnect the router. Or switch the fridge off, wait 1 minute, switch it on.' },
        { cause: 'Can’t find SmartThings in the app store', fix: 'App support depends on your phone’s OS version. Only some models support the app.' } ] },
  ], { escalate: '<strong>Checked everything and still a problem?</strong>Call the helpline: <a href="tel:180057267864">1800 5 7267864</a>. Note: visits for normal situations (no defect) may be charged.' });

  /* ---------- Setup checklist ---------- */
  const models = {
    'RT41D*':   { d: 755, w: 700, h: 1720, open: 1026, deep: 1363 },
    'RT45D*':   { d: 755, w: 700, h: 1790, open: 1026, deep: 1363 },
    'RT34D*':   { d: 732, w: 630, h: 1715, open: 913,  deep: 1294 },
    'RT38D*':   { d: 732, w: 630, h: 1785, open: 913,  deep: 1294 },
    'RT80F51*': { d: 787, w: 700, h: 1825, open: 1026, deep: 1403 },
  };
  const opts = Object.keys(models).map(m => `<option>${m}</option>`).join('');
  const cl = Guide.checklist($('#setupChecklist'), [
    { title: 'Pick a good spot', html: `
      <ul class="do"><li>Solid, level floor without carpet that could block ventilation</li><li>Out of direct sunlight</li><li>Room to open and close the door</li><li>Away from heat sources (stove, heater)</li><li>Room for maintenance and servicing</li><li>Room temperature between 16 °C and 43 °C</li></ul>
      <ul class="dont"><li>Damp places or anywhere it could get wet</li></ul>` },
    { title: 'Check the space it needs', html: `
      <label class="field">Your model (on the rating label inside the fridge)<select id="modelPick">${opts}</select></label>
      <div class="table-wrap"><table><tbody id="modelDims"></tbody></table></div>
      <p class="small muted">Some models come with 2 spacers: find them inside, then attach them to the back. They help air flow and save power.</p>` },
    { title: 'Check the floor', html: `
      <ul><li>The floor must hold a fully loaded fridge (about 90 kg).</li><li>Put a large piece of cardboard under each leg to protect the floor.</li><li>Once it’s in place, avoid moving it. If you must, lay thick paper or old carpet along the path.</li></ul>` },
    { title: 'Level the fridge', html: `
      <ol class="steps-list"><li>Make sure it’s empty.</li><li>Use a flat-head screwdriver on the front feet: <b>clockwise lowers</b>, <b>anticlockwise raises</b>.</li><li>Set the front slightly higher than the back, so the door swings closed.</li><li>Leave the feet about 41 mm above the floor.</li></ol>
      <div class="callout caution"><span aria-hidden="true">⚠</span><span>A fridge that isn’t level can be damaged or cause injury.</span></div>` },
    { title: 'Switch on and cool down', html: `
      <ol class="steps-list"><li>Plug the power cord into its own wall socket.</li><li>Open the door: the inside light should come on.</li><li>Set the coldest temperature and wait about an hour.</li><li>Wait until it reaches the set temperature. Now it’s ready.</li></ol>` },
    { title: 'Final check', html: `
      <ul class="do"><li>Plugged in and earthed (grounded)</li><li>On a flat, level surface with space from walls</li><li>Sits firmly on the floor</li><li>Door opens and closes freely, light turns on</li></ul>` },
  ]);
  let currentModel = store.get('model', 'RT41D*');
  if (!models[currentModel]) currentModel = 'RT41D*';
  function fillDims() {
    const pick = $('#modelPick'); if (!pick) return;
    pick.value = currentModel;
    const m = models[currentModel];
    $('#modelDims').innerHTML = `
      <tr><th>Fridge size (D × W × H)</th><td class="num">${m.d} × ${m.w} × ${m.h} mm</td></tr>
      <tr><th>Gap above</th><td class="num">50 mm or more</td></tr>
      <tr><th>Gap at each side</th><td class="num">at least 50 mm</td></tr>
      <tr><th>Door opening angle</th><td class="num">110° freezer · 115° fridge</td></tr>
      <tr><th>Width needed, door open</th><td class="num">${m.open} mm</td></tr>
      <tr><th>Depth needed, door open</th><td class="num">${m.deep} mm</td></tr>`;
  }
  document.addEventListener('change', e => {
    if (e.target.id === 'modelPick') { currentModel = e.target.value; store.set('model', currentModel); fillDims(); }
  });
  cl.onRender(fillDims);
})();
