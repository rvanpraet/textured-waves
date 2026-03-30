function buildUI() {
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = `
    <h2>Textured Waves</h2>

    <div class="section">
      <h3>Seed</h3>
      <div class="seed-display" id="seed-value">${params.seed}</div>
      <div class="seed-nav">
        <button class="btn small" onclick="seedPrev()">Prev</button>
        <button class="btn small" onclick="seedNext()">Next</button>
        <button class="btn small" onclick="seedRandom()">Random</button>
      </div>
      <div class="seed-jump">
        <input type="number" id="seed-input" value="${params.seed}" min="0" max="99999"
          onkeydown="if(event.key==='Enter') seedJump()">
        <button class="btn small" onclick="seedJump()">Go</button>
      </div>
    </div>

    <div class="section">
      <h3>Canvas</h3>
      ${buildSelect('printPreset', 'Size Preset', PRINT_PRESETS)}
      <div class="dimensions" id="dimensions">${getDimensionsText()}</div>
    </div>

    <div class="section">
      <h3>Style</h3>
      ${buildSelect('palette', 'Palette', PALETTES)}
      ${buildSelect('particleTexture', 'Texture', {
        circle: { label: 'Plain Circle' },
        particle1: { label: 'Particle 1' },
        particle2: { label: 'Particle 2' },
        particle3: { label: 'Particle 3' },
      })}
    </div>

    <div class="section">
      <h3>Algorithm</h3>
      ${buildSlider('stepAmount', 'Band Thickness', 0.005, 0.06, 0.001)}
      ${buildSlider('gapAmount', 'Band Gap', 0.001, 0.03, 0.001)}
      ${buildSlider('bandIrregularity', 'Band Irregularity', 0.0, 1.0, 0.01)}
      ${buildSlider('noiseOffsetStrength', 'Noise Displacement', 0.0, 5.0, 0.1)}
      ${buildSlider('noiseX', 'Noise X Scale', 0.001, 0.05, 0.001)}
      ${buildSlider('noiseY', 'Noise Y Scale', 0.0001, 0.01, 0.0001)}
      ${buildSlider('noiseDecayBands', 'Noise Decay Bands', 1, 100, 1)}
      ${buildSlider('probability', 'Fill Density', 0.1, 1.0, 0.05)}
      ${buildSlider('densityCurve', 'Density Curve (Falloff)', 0.1, 4.0, 0.1)}
      ${buildSlider('particleSizeMin', 'Particle Size Min', 0.05, 2.0, 0.05)}
      ${buildSlider('particleSizeMax', 'Particle Size Max', 0.1, 3.0, 0.05)}
      ${buildSlider('alphaMin', 'Particle Alpha Min', 0.01, 1.0, 0.01)}
      ${buildSlider('alphaMax', 'Particle Alpha Max', 0.01, 1.0, 0.01)}
      ${buildSlider('waveSlant', 'Wave Slant Diagonal', -1.0, 1.0, 0.01)}
    </div>

    <div class="section">
      <h3>Region</h3>
      ${buildSlider('regionStartY', 'Start Y', -0.5, 0.0, 0.01)}
      ${buildSlider('regionEndY', 'End Y', 0.0, 0.5, 0.01)}
    </div>

    <div class="section">
      <h3>Actions</h3>
      <div class="action-buttons">
        <button class="btn primary" onclick="regenerate()">Regenerate</button>
        <button class="btn" onclick="resetAndSync()">Reset Defaults</button>
        <button class="btn" onclick="exportImage()">Export PNG</button>
      </div>
    </div>

    <div class="section">
      <div id="progress-container">
        <div id="progress-bar"></div>
      </div>
      <div id="progress-text">Ready</div>
    </div>
  `;
}

function buildSlider(key, label, min, max, step) {
  const precision = step < 0.001 ? 4 : step < 0.01 ? 3 : step < 1 ? 2 : 0;
  const displayVal = Number(params[key]).toFixed(precision);
  return `
    <div class="control-group">
      <div class="control-label">
        <label>${label}</label>
        <span class="value-display" id="${key}-val">${displayVal}</span>
      </div>
      <input type="range" id="${key}" min="${min}" max="${max}" step="${step}"
        value="${params[key]}" oninput="updateParam('${key}', this)">
    </div>
  `;
}

function buildSelect(key, label, options) {
  const optionsHTML = Object.keys(options).map(k => {
    const optLabel = (typeof options[k] === 'object' && options[k].label) ? options[k].label : k;
    const selected = params[key] === k ? 'selected' : '';
    return `<option value="${k}" ${selected}>${optLabel}</option>`;
  }).join('');

  return `
    <div class="control-group">
      <label>${label}</label>
      <select id="${key}" onchange="updateParam('${key}', this); if('${key}'==='printPreset') updateDimensions();">
        ${optionsHTML}
      </select>
    </div>
  `;
}

function updateParam(key, el) {
  params[key] = (el.type === 'range' || el.type === 'number') ? parseFloat(el.value) : el.value;
  const valEl = document.getElementById(key + '-val');
  if (valEl) {
    const step = el.step ? parseFloat(el.step) : 1;
    const precision = step < 0.001 ? 4 : step < 0.01 ? 3 : step < 1 ? 2 : 0;
    valEl.textContent = (el.type === 'range') ? Number(el.value).toFixed(precision) : el.value;
  }
}

function getDimensionsText() {
  const p = PRINT_PRESETS[params.printPreset];
  return `${p.w} x ${p.h} px`;
}

function updateDimensions() {
  const el = document.getElementById('dimensions');
  if (el) el.textContent = getDimensionsText();
}

function updateProgress(pct) {
  const bar = document.getElementById('progress-bar');
  const text = document.getElementById('progress-text');
  if (bar) bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
  if (text) text.textContent = pct >= 100 ? 'Done' : Math.round(pct) + '%';
}

function syncUI() {
  Object.keys(params).forEach(key => {
    const el = document.getElementById(key);
    if (el) {
      el.value = params[key];
      const valEl = document.getElementById(key + '-val');
      if (valEl) {
        const step = el.step ? parseFloat(el.step) : 1;
        const precision = step < 0.001 ? 4 : step < 0.01 ? 3 : step < 1 ? 2 : 0;
        valEl.textContent = (el.type === 'range') ? Number(params[key]).toFixed(precision) : params[key];
      }
    }
  });
  document.getElementById('seed-value').textContent = params.seed;
  document.getElementById('seed-input').value = params.seed;
  updateDimensions();
}

// Seed navigation
function seedPrev() {
  params.seed = Math.max(0, params.seed - 1);
  syncUI();
}

function seedNext() {
  params.seed++;
  syncUI();
}

function seedRandom() {
  params.seed = Math.floor(Math.random() * 100000);
  syncUI();
}

function seedJump() {
  const val = parseInt(document.getElementById('seed-input').value);
  if (!isNaN(val) && val >= 0) {
    params.seed = val;
    syncUI();
  }
}

function resetAndSync() {
  resetParams();
  syncUI();
}
