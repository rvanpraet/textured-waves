function buildUI() {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = `
    <h2>Noise Layers</h2>

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
      ${buildSelect("printPreset", "Size Preset", PRINT_PRESETS)}
      <div class="dimensions" id="dimensions">${getDimensionsText()}</div>
    </div>

    <div class="section">
      <h3>Style</h3>
      ${buildSelect("palette", "Palette", PALETTES)}
    </div>

    <div class="section">
      <h3>Noise Field</h3>
      ${buildSlider("layerCount", "Layers", 2, 12, 1)}
      ${buildSlider("noiseScaleX", "Scale X", 0.0, 0.015, 0.0001)}
      ${buildSlider("noiseScaleY", "Scale Y", 0.0, 0.015, 0.0001)}
      ${buildSlider("noiseOctaves", "Detail", 1, 8, 1)}
      ${buildSlider("thresholdMin", "Threshold Min", 0.1, 0.5, 0.01)}
      ${buildSlider("thresholdMax", "Threshold Max", 0.5, 0.9, 0.01)}
    </div>

    <div class="section">
      <h3>Circle Rendering</h3>
      ${buildSlider("grainAmount", "Grain", 0.0, 0.3, 0.01)}
      ${buildSlider("circleSize", "Circle Size", 1, 150.0, 1)}
      ${buildSlider("circleProb", "Draw Prob", 0.0, 1.0, 0.001)}
      ${buildSlider("circleAlphaMin", "Alpha Min", 0, 255, 1)}
      ${buildSlider("circleAlphaMax", "Alpha Max", 0, 255, 1)}
      ${buildSlider("rowsPerFrame", "Render Speed", 1, 32, 1)}
      ${buildCheckbox("useCollision", "Use Collision")}
      ${buildSlider("collisionGap", "Collision Gap", 0.1, 10.0, 0.1)}
      ${buildSelect("blendMode", "Blend Mode", {
        BLEND: "Normal",
        ADD: "Add",
        DARKEST: "Darkest",
        LIGHTEST: "Lightest",
        DIFFERENCE: "Difference",
        EXCLUSION: "Exclusion",
        MULTIPLY: "Multiply",
        SCREEN: "Screen",
        OVERLAY: "Overlay",
        HARD_LIGHT: "Hard Light",
        SOFT_LIGHT: "Soft Light",
        DODGE: "Dodge",
        BURN: "Burn",
      })}
    </div>

    <div class="section">
      <h3>Actions</h3>
      <div class="action-buttons">
        <button class="btn primary" onclick="regenerate()">Regenerate</button>
        <button class="btn" onclick="clearCanvas()">Clear Canvas</button>
        <button class="btn" onclick="resetAndSync()">Reset Defaults</button>
        <button class="btn" onclick="saveCurrentAsDefault()">Save Defaults</button>
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

// --- Control builders ---

function buildCheckbox(key, label) {
  const checked = params[key] ? "checked" : "";
  return `
    <div class="control-group">
      <label>${label}</label>
      <input type="checkbox" id="${key}" ${checked} onchange="updateParam('${key}', this)">
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
  const optionsHTML = Object.keys(options)
    .map((k) => {
      const optLabel =
        typeof options[k] === "object" && options[k].label
          ? options[k].label
          : typeof options[k] === "string"
            ? options[k]
            : k;
      const selected = params[key] === k ? "selected" : "";
      return `<option value="${k}" ${selected}>${optLabel}</option>`;
    })
    .join("");

  return `
    <div class="control-group">
      <label>${label}</label>
      <select id="${key}" onchange="updateParam('${key}', this); if('${key}'==='printPreset') updateDimensions();">
        ${optionsHTML}
      </select>
    </div>
  `;
}

// --- Param updates ---

function updateParam(key, el) {
  if (el.type === "checkbox") {
    params[key] = el.checked;
  } else {
    params[key] = el.type === "range" || el.type === "number" ? parseFloat(el.value) : el.value;
  }
  const valEl = document.getElementById(key + "-val");
  if (valEl) {
    const step = el.step ? parseFloat(el.step) : 1;
    const precision = step < 0.001 ? 4 : step < 0.01 ? 3 : step < 1 ? 2 : 0;
    valEl.textContent = el.type === "range" ? Number(el.value).toFixed(precision) : el.value;
  }
}

function getDimensionsText() {
  const p = PRINT_PRESETS[params.printPreset];
  return `${p.w} × ${p.h} px`;
}

function updateDimensions() {
  const el = document.getElementById("dimensions");
  if (el) el.textContent = getDimensionsText();
}

function updateProgress(pct) {
  const bar = document.getElementById("progress-bar");
  const text = document.getElementById("progress-text");
  if (bar) bar.style.width = Math.min(100, Math.max(0, pct)) + "%";
  if (text) text.textContent = pct >= 100 ? "Done" : Math.round(pct) + "%";
}

function syncUI() {
  Object.keys(params).forEach((key) => {
    const el = document.getElementById(key);
    if (el) {
      el.value = params[key];
      const valEl = document.getElementById(key + "-val");
      if (valEl) {
        const step = el.step ? parseFloat(el.step) : 1;
        const precision = step < 0.001 ? 4 : step < 0.01 ? 3 : step < 1 ? 2 : 0;
        valEl.textContent = el.type === "range" ? Number(params[key]).toFixed(precision) : params[key];
      }
    }
  });
  document.getElementById("seed-value").textContent = params.seed;
  document.getElementById("seed-input").value = params.seed;
  updateDimensions();
}

// --- Seed navigation ---

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
  const val = parseInt(document.getElementById("seed-input").value);
  if (!isNaN(val) && val >= 0) {
    params.seed = val;
    syncUI();
  }
}

function resetAndSync() {
  resetParams();
  syncUI();
}
