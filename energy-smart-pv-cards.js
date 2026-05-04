/**
 * Energy Smart PV Cards
 * Contiene:
 * 1. energy-smart-pv-card (Singola)
 * 2. energy-smart-pv-unified-card (Multipla unificata)
 */

// =========================================================================
// CARD SINGOLA (EnergySmartPVCard)
// =========================================================================

class EnergySmartPVCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("energy-smart-pv-card-editor");
  }
  static getStubConfig() {
    return { entities: [] };
  }

  setConfig(config) { this.config = config; }

  set hass(hass) {
    this._hass = hass;
    if (!this.content) {
      const card = document.createElement("ha-card");
      card.className = "espv-single-root";
      this.content = document.createElement("div");
      card.appendChild(this.content);
      this.appendChild(card);
    }
    this.updateContent();
  }

  getCardSize() { return 4; }

  _ensureStyle() {
    if (this._styleInjected) return;
    const style = document.createElement("style");
    style.textContent = `
      .espv-single-root {
        position: relative; overflow: hidden; border-radius: 18px;
        background: linear-gradient(135deg, rgba(30,30,47,0.95) 0%, rgba(42,42,64,0.95) 100%);
        box-shadow: 0 8px 32px 0 rgba(0,0,0,0.37);
      }
      .header { display:flex; align-items:center; justify-content:space-between; padding: 14px 16px; color:#fff; }
      .icon-circle { width: 36px; height: 36px; border-radius: 999px; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.45); }
      .title-section { flex: 1; margin-left: 10px; }
      .card-title { font-size: 16px; font-weight: 600; }
      .card-subtitle { font-size: 11px; opacity: 0.8; }
      .mode-toggle { cursor: pointer; text-decoration: underline; }
      .efficiency-badge { display:inline-flex; align-items:center; padding: 4px 9px; border-radius:999px; background: rgba(12,12,24,0.75); font-size:11px; font-weight:600; }
      .device-grid { display:grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 8px 12px 10px 12px; }
      .device-card { display:flex; align-items:center; gap:10px; padding:10px; border-radius:14px; background: rgba(10,10,20,0.8); color:#fff; }
      .device-card.active { background: radial-gradient(circle at top left, rgba(76,175,80,0.38), rgba(10,10,20,0.9)); }
      .device-info { flex:1; display:flex; flex-direction:column; gap:3px; }
      .device-name { font-size: 13px; font-weight: 600; }
      .device-status { font-size: 11px; opacity: 0.8; }
      .device-temp { font-size: 14px; font-weight: 600; text-align:right; }
      .device-temp .current { font-size: 11px; opacity: 0.8; }
      .dehum-pill { display:inline-block; margin-left:6px; padding:1px 5px; border-radius:999px; background: rgba(76,175,80,0.25); font-size:9px; }
      .stats-footer { display:grid; grid-template-columns: 1.1fr 1fr 1.1fr; align-items:center; padding:10px 14px 12px 14px; border-top: 1px solid rgba(255,255,255,0.08); color:#fff; font-size:11px; }
      .stat { display:flex; flex-direction:column; gap:4px; }
      .stat .label { opacity:0.7; }
      .stat .val, .humidity-val { display:flex; align-items:center; gap:4px; font-weight:500; }
      .stat-divider { width:1px; height:26px; background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.22), transparent); margin:0 6px; }
      .clickable-stat { cursor: pointer; }
      .mini-btn {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 6px;
        color: #fff;
        font-size: 10px;
        padding: 2px 6px;
        cursor: pointer;
      }
    `;
    this.appendChild(style);
    this._styleInjected = true;
  }

  _fireEvent(node, type, detail, options) {
    options = options || {};
    const event = new Event(type, { bubbles: options?.bubbles ?? true, cancelable: options?.cancelable ?? true, composed: options?.composed ?? true });
    event.detail = detail; node.dispatchEvent(event); return event;
  }
  _handleMoreInfo(entityId) { if (!entityId) return; this._fireEvent(this, "hass-more-info", { entityId }); }
  _handleToggle(entityId) { if (!entityId || !this._hass) return; this._hass.callService("switch", "toggle", { entity_id: entityId }); }

  updateContent() {
    if (!this.config || !this._hass) return;
    this._ensureStyle();
    let entities = this.config.entities || [];
    if (entities.length === 0 && this.config.entity) entities = [this.config.entity];
    if (!Array.isArray(entities) || entities.length === 0) {
      this.content.innerHTML = `<ha-card style="padding:16px; background: rgba(20,20,30,0.9); color:white;"><div style="font-weight:bold; margin-bottom:4px;">Configurazione necessaria</div><div>Modifica la card e seleziona il sensore di stato zona.</div></ha-card>`;
      return;
    }
    this.content.innerHTML = "";

    entities.forEach((entityId) => {
      const statusEntity = this._hass.states[entityId];
      if (!statusEntity) return;
      const attrs = statusEntity.attributes || {};
      const acEntityId = attrs.ac_entity;
      const heaterEntityId = attrs.heater_entity;
      const mode = attrs.mode;
      const isActive = attrs.is_active;
      const acPower = attrs.ac_power;
      const currentHumidity = attrs.current_humidity;
      const humidityThreshold = attrs.humidity_threshold;
      const isDehumidifying = attrs.is_dehumidifying;
      const outdoorSensorId = attrs.outdoor_sensor;
      const outdoorHumiditySensorId = attrs.outdoor_humidity_sensor;
      const switchEntityId = attrs.switch_entity;
      const selectEntityId = attrs.select_entity;
      const isEcoMode = attrs.is_eco_mode === true;
      const ecoRemaining = Number(attrs.eco_remaining_min ?? NaN);
      const lockRemaining = Number(attrs.manual_lock_remaining_min ?? NaN);
      const currentTempAc = attrs.current_temp_ac;
      const currentTempHeater = attrs.current_temp_heater;
      const acState = acEntityId ? this._hass.states[acEntityId] : null;
      const heaterState = heaterEntityId ? this._hass.states[heaterEntityId] : null;

      let cardGradient = "linear-gradient(135deg, rgba(30,30,47,0.9) 0%, rgba(42,42,64,0.9) 100%)";
      let iconColor = "#00d2ff";
      let statusText = statusEntity.state;
      let efficiency = 0;
      let glowColor = "rgba(0,210,255,0.2)";
      
      if (isEcoMode) {
         statusText = "Eco Mode (Attesa)";
         efficiency = 90;
         iconColor = "#4CAF50"; 
         glowColor = "rgba(76, 175, 80, 0.4)";
      }

      if (!isActive) {
        cardGradient = "linear-gradient(135deg, rgba(67,30,30,0.9) 0%, rgba(64,42,42,0.9) 100%)";
        iconColor = "#FF5252";
        glowColor = "rgba(255, 82, 82, 0.4)";
        statusText = "Disabilitata";
      } else if (statusEntity.state === "Boosting (Using Excess)") {
        cardGradient = "linear-gradient(135deg, rgba(15,52,67,0.95) 0%, rgba(52,232,158,0.95) 100%)";
        iconColor = "#fff"; glowColor = "rgba(52,232,158,0.4)"; efficiency = 100; statusText = "In Uso (Esubero)";
        if (isEcoMode) {
            statusText = "Eco Mode (Attesa)";
            cardGradient = "linear-gradient(135deg, rgba(20,40,30,0.95) 0%, rgba(30,60,40,0.95) 100%)"; 
            efficiency = 90;
        }
      } else if (statusEntity.state === "Charging Battery") {
        cardGradient = "linear-gradient(135deg, rgba(240,152,25,0.9) 0%, rgba(237,222,93,0.9) 100%)";
        iconColor = "#fff"; glowColor = "rgba(237,222,93,0.4)"; efficiency = 80; statusText = "Ricarica Batteria";
      } else if (statusEntity.state === "Idle (Monitoring)") {
        statusText = "In Attesa (Monitoraggio)";
      }

      const acTemp = acState ? acState.attributes.temperature : "--";
      const acCurrent = currentTempAc !== undefined && currentTempAc !== null ? currentTempAc : (acState ? acState.attributes.current_temperature : "--");
      const heaterTemp = heaterState ? heaterState.attributes.temperature : "--";
      const heaterCurrent = currentTempHeater !== undefined && currentTempHeater !== null ? currentTempHeater : (heaterState ? heaterState.attributes.current_temperature : "--");
      
      let humidityText = "--", humidityColor = "inherit";
      if (currentHumidity !== undefined && currentHumidity !== null) {
        const humNum = Number(currentHumidity);
        const thrNum = humidityThreshold !== undefined && humidityThreshold !== null ? Number(humidityThreshold) : NaN;
        if (!Number.isNaN(humNum)) {
          humidityText = `${humNum.toFixed(0)}%`;
          if (!Number.isNaN(thrNum)) humidityText += ` / ${thrNum.toFixed(0)}%`;
          if (isDehumidifying) { humidityText += " DEUM"; humidityColor = "#4CAF50"; }
          else if (!Number.isNaN(thrNum) && humNum > thrNum) { humidityColor = "#FF5252"; }
        }
      }
      const sharedDehum = attrs.shared_dehumidification === true;
      let outdoorTemp = null, outdoorHumidity = null;
      if (outdoorSensorId) {
        const o = this._hass.states[outdoorSensorId];
        if (o) {
          const t = Number(o.state); if (!Number.isNaN(t)) outdoorTemp = t;
          const oh = o.attributes?.humidity ?? o.attributes?.current_humidity;
          if (oh !== undefined && oh !== null) { const hv = Number(oh); if (!Number.isNaN(hv)) outdoorHumidity = hv; }
        }
      }
      if (outdoorHumiditySensorId) {
        const ohs = this._hass.states[outdoorHumiditySensorId];
        if (ohs) { const hv = Number(ohs.state); if (!Number.isNaN(hv)) outdoorHumidity = hv; }
      }
      let externalText = "--";
      if (outdoorTemp !== null || outdoorHumidity !== null) {
        externalText = `${outdoorTemp !== null ? outdoorTemp.toFixed(1) + '°C' : '--'}${outdoorHumidity !== null ? ' / ' + outdoorHumidity.toFixed(0) + '%' : ''}`;
      }

      const card = document.createElement("div");
      card.className = "espv-single-inner";
      card.style.background = cardGradient;
      card.innerHTML = `
        <div class="header">
          <div class="icon-circle" style="box-shadow: 0 0 15px ${glowColor}; border: 1px solid ${iconColor};">
            <ha-icon icon="mdi:solar-power" style="color:${iconColor};"></ha-icon>
          </div>
          <div class="title-section">
            <div class="card-title">${attrs.friendly_name || "Energy Smart Zone"}</div>
            <div class="card-subtitle"> ${statusText} • <span class="mode-toggle">${isActive ? "Automatica" : "Disabilitata"}</span></div>
          </div>
          <div class="efficiency-badge">
            ${isEcoMode 
              ? `<ha-icon icon="mdi:leaf" style="width:14px; margin-right:4px; color:#4CAF50;"></ha-icon>ECO ${!Number.isNaN(ecoRemaining) ? ecoRemaining+'m' : ''}`
              : `<ha-icon icon="mdi:lightning-bolt" style="width:14px; margin-right:4px; color:#FFD700;"></ha-icon>${efficiency}%`
            }
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:11px;">
          ${sharedDehum ? `<div style="color:#ffeb3b;">Deumidificazione condivisa attiva</div>` : `<div></div>`}
          ${!Number.isNaN(lockRemaining) && lockRemaining>0 ? `<div style="color:#ff9800;">LOCK ${lockRemaining}m</div>` : ``}
        </div>
        <div class="device-grid">
          <div class="device-card ${acState && acState.state !== "off" ? "active" : ""}" data-role="ac-card">
            <div class="device-icon"><ha-icon icon="mdi:air-conditioner"></ha-icon></div>
            <div class="device-info">
              <div class="device-name">Condizionatore${isDehumidifying ? '<span class="dehum-pill">DEUM</span>' : ''}</div>
              <div class="device-status">${acState ? String(acState.state || "").toUpperCase() : "Non Configurato"}</div>
            </div>
            <div class="device-temp">
              ${acTemp}° <span class="current">(${acCurrent}°)</span>
              ${acPower !== undefined && acPower !== null ? `<div style="font-size:12px; font-weight:700; margin-top:4px;"><ha-icon icon="mdi:flash" style="width:14px; margin-right:4px;"></ha-icon>${Math.round(Number(acPower))} W</div>` : ''}
            </div>
          </div>
          <div class="device-card ${heaterState && heaterState.state !== "off" ? "active" : ""}" data-role="heater-card">
            <div class="device-icon"><ha-icon icon="mdi:radiator"></ha-icon></div>
            <div class="device-info">
              <div class="device-name">Termostato</div>
              <div class="device-status">${heaterState ? String(heaterState.state || "").toUpperCase() : "Non Configurato"}</div>
            </div>
            <div class="device-temp">${heaterTemp}° <span class="current">(${heaterCurrent}°)</span></div>
          </div>
        </div>
        <div class="stats-footer">
          <div class="stat clickable-stat" data-role="mode-stat">
            <div class="label">MODALITÀ</div>
            <div class="val"><ha-icon icon="mdi:format-list-bulleted" style="width:14px; margin-right:4px;"></ha-icon>${this._formatMode(mode)}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <div class="label">UMIDITÀ</div>
            <div class="humidity-val" style="color:${humidityColor};"><ha-icon icon="mdi:water-percent" style="width:14px; margin-right:4px;"></ha-icon>${humidityText}</div>
            <div class="val" style="gap:6px;">
              <button class="mini-btn" data-role="hum-dec">-</button>
              <button class="mini-btn" data-role="hum-inc">+</button>
            </div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <div class="label">BATTERIA MIN</div>
            <div class="val"><ha-icon icon="mdi:battery-medium" style="width:14px; margin-right:4px;"></ha-icon>${attrs.min_battery_level ?? '--'}%</div>
            <div class="val" style="gap:6px;">
              <button class="mini-btn" data-role="bat-dec">-</button>
              <button class="mini-btn" data-role="bat-inc">+</button>
            </div>
          </div>
        </div>
        <div class="stats-footer">
          <div class="stat">
            <div class="label">SOGLIA W</div>
            <div class="val"><ha-icon icon="mdi:flash" style="width:14px; margin-right:4px;"></ha-icon>${attrs.export_threshold ?? '--'} W</div>
            <div class="val" style="gap:6px;">
              <button class="mini-btn" data-role="thr-dec">-</button>
              <button class="mini-btn" data-role="thr-inc">+</button>
            </div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <div class="label">TEMP. ESTATE</div>
            <div class="val"><ha-icon icon="mdi:thermometer-low" style="width:14px; margin-right:4px;"></ha-icon>${attrs.summer_temp ?? '--'}°C</div>
            <div class="val" style="gap:6px;">
              <button class="mini-btn" data-role="sum-dec">-</button>
              <button class="mini-btn" data-role="sum-inc">+</button>
            </div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <div class="label">TEMP. INVERNO</div>
            <div class="val"><ha-icon icon="mdi:thermometer-high" style="width:14px; margin-right:4px;"></ha-icon>${attrs.winter_temp ?? '--'}°C</div>
            <div class="val" style="gap:6px;">
              <button class="mini-btn" data-role="win-dec">-</button>
              <button class="mini-btn" data-role="win-inc">+</button>
            </div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <div class="label">ESTERNO</div>
            <div class="val"><ha-icon icon="mdi:thermometer" style="width:14px; margin-right:4px;"></ha-icon>${externalText}</div>
          </div>
        </div>
        <div class="stats-footer">
          <div class="stat">
            <div class="label">Deumidificazione condivisa</div>
            <div class="val" style="gap:6px;">
              <input type="checkbox" data-role="shared-dehum-toggle" ${attrs.shared_dehumidification ? "checked" : ""} style="width:16px;height:16px;">
            </div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <div class="label">Deumidificazione in inverno</div>
            <div class="val" style="gap:6px;">
              <input type="checkbox" data-role="winter-dehum-toggle" ${attrs.winter_dehumidification ? "checked" : ""} style="width:16px;height:16px;">
            </div>
          </div>
        </div>
      `;
      const subtitleMode = card.querySelector(".mode-toggle");
      if (subtitleMode && switchEntityId) subtitleMode.addEventListener("click", (ev) => { ev.stopPropagation(); this._handleToggle(switchEntityId); });
      const acCard = card.querySelector('[data-role="ac-card"]');
      if (acCard && acEntityId) { acCard.style.cursor = "pointer"; acCard.addEventListener("click", () => this._handleMoreInfo(acEntityId)); }
      const heaterCard = card.querySelector('[data-role="heater-card"]');
      if (heaterCard && heaterEntityId) { heaterCard.style.cursor = "pointer"; heaterCard.addEventListener("click", () => this._handleMoreInfo(heaterEntityId)); }
      const modeStat = card.querySelector('[data-role="mode-stat"]');
      if (modeStat && selectEntityId) { modeStat.style.cursor = "pointer"; modeStat.addEventListener("click", () => this._handleMoreInfo(selectEntityId)); }
      this.content.appendChild(card);
      
      const entryId = attrs.entry_id;
      const humThr = Number(humidityThreshold || 60);
      const batMin = Number(attrs.min_battery_level || 80);
      const expThr = Number(attrs.export_threshold || 2000);
      const sumTemp = Number(attrs.summer_temp || 24);
      const winTemp = Number(attrs.winter_temp || 21);
      const humDec = card.querySelector('[data-role="hum-dec"]');
      const humInc = card.querySelector('[data-role="hum-inc"]');
      const batDec = card.querySelector('[data-role="bat-dec"]');
      const batInc = card.querySelector('[data-role="bat-inc"]');
      const thrDec = card.querySelector('[data-role="thr-dec"]');
      const thrInc = card.querySelector('[data-role="thr-inc"]');
      const sumDec = card.querySelector('[data-role="sum-dec"]');
      const sumInc = card.querySelector('[data-role="sum-inc"]');
      const winDec = card.querySelector('[data-role="win-dec"]');
      const winInc = card.querySelector('[data-role="win-inc"]');
      const sharedToggle = card.querySelector('[data-role="shared-dehum-toggle"]');
      const winterToggle = card.querySelector('[data-role="winter-dehum-toggle"]');
      const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
      
      const callSetHum = (val) => { if (!entryId || !this._hass) return; this._hass.callService("energy_smart_pv", "set_humidity_threshold", { entry_id: entryId, value: val }); };
      const callSetBat = (val) => { if (!entryId || !this._hass) return; this._hass.callService("energy_smart_pv", "set_min_battery_level", { entry_id: entryId, value: val }); };
      const callSetThr = (val) => { if (!entryId || !this._hass) return; this._hass.callService("energy_smart_pv", "set_export_threshold", { entry_id: entryId, value: val }); };
      const callSetSum = (val) => { if (!entryId || !this._hass) return; this._hass.callService("energy_smart_pv", "set_summer_temp", { entry_id: entryId, value: val }); };
      const callSetWin = (val) => { if (!entryId || !this._hass) return; this._hass.callService("energy_smart_pv", "set_winter_temp", { entry_id: entryId, value: val }); };
      
      if (humDec) humDec.addEventListener("click", () => callSetHum(clamp(humThr - 1, 30, 90)));
      if (humInc) humInc.addEventListener("click", () => callSetHum(clamp(humThr + 1, 30, 90)));
      if (batDec) batDec.addEventListener("click", () => callSetBat(clamp(batMin - 1, 10, 100)));
      if (batInc) batInc.addEventListener("click", () => callSetBat(clamp(batMin + 1, 10, 100)));
      if (thrDec) thrDec.addEventListener("click", () => callSetThr(clamp(expThr - 50, 100, 10000)));
      if (thrInc) thrInc.addEventListener("click", () => callSetThr(clamp(expThr + 50, 100, 10000)));
      if (sumDec) sumDec.addEventListener("click", () => callSetSum(clamp(sumTemp - 0.5, 16, 30)));
      if (sumInc) sumInc.addEventListener("click", () => callSetSum(clamp(sumTemp + 0.5, 16, 30)));
      if (winDec) winDec.addEventListener("click", () => callSetWin(clamp(winTemp - 0.5, 16, 25)));
      if (winInc) winInc.addEventListener("click", () => callSetWin(clamp(winTemp + 0.5, 16, 25)));
      if (sharedToggle) sharedToggle.addEventListener("change", (ev) => { if (!entryId || !this._hass) return; this._hass.callService("energy_smart_pv", "set_shared_dehumidification", { entry_id: entryId, value: !!ev.target.checked }); });
      if (winterToggle) winterToggle.addEventListener("change", (ev) => { if (!entryId || !this._hass) return; this._hass.callService("energy_smart_pv", "set_winter_dehumidification", { entry_id: entryId, value: !!ev.target.checked }); });
    });
  }

  _formatMode(mode) {
    if (!mode) return "--";
    const m = String(mode);
    if (m.includes("Summer")) return "❄️ Estate";
    if (m.includes("Winter")) return "🔥 Inverno";
    return "📋 Auto";
  }
}

class EnergySmartPVCardEditor extends HTMLElement {
  setConfig(config) { this._config = config; this.render(); }
  configChanged(newConfig) {
    const event = new CustomEvent("config-changed", { detail: { config: newConfig }, bubbles: true, composed: true });
    this.dispatchEvent(event);
  }
  set hass(hass) { this._hass = hass; const pickers = this.querySelectorAll("ha-entity-picker"); pickers.forEach((p) => p.hass = hass); }
  render() {
    if (!this._config) return;
    this.innerHTML = "";
    const entities = this._config.entities || [];
    const container = document.createElement("div"); container.className = "card-config";
    const optionDiv = document.createElement("div"); optionDiv.className = "option";
    const label = document.createElement("label"); label.className = "label"; label.innerText = "Sensori di stato zona";
    const desc = document.createElement("div"); desc.className = "description"; desc.innerText = "Seleziona uno o più sensori di stato generati dall'integrazione Energy Smart PV.";
    const pickersContainer = document.createElement("div");
    const hasPicker = !!customElements.get("ha-entity-picker");
    entities.forEach((entity, index) => {
      const row = document.createElement("div");
      row.style.cssText = "margin-bottom:8px; display:flex; gap:8px; align-items:center;";
      let field;
      
      const picker = document.createElement("ha-entity-picker");
      picker.style.flex = "1";
      picker.hass = this._hass;
      picker.value = entity;
      picker.includeDomains = ["sensor"];
      picker.addEventListener("value-changed", (ev) => {
        this._valueChanged(ev.detail.value, index);
      });
      field = picker;

      const removeBtn = document.createElement("div");
      removeBtn.innerText = "X";
      removeBtn.style.cssText = "color:red; cursor:pointer; font-weight:bold; padding:0 8px;";
      removeBtn.onclick = () => this._removeEntity(index);
      row.appendChild(field); row.appendChild(removeBtn); pickersContainer.appendChild(row);
    });
    const addBtn = document.createElement("button"); addBtn.innerText = "+ Aggiungi Zona";
    addBtn.style.cssText = "margin-top:8px; padding:8px 16px; background:#2196F3; color:white; border:none; border-radius:4px; cursor:pointer;";
    addBtn.onclick = () => this._addEntity();
    optionDiv.appendChild(label); optionDiv.appendChild(desc); optionDiv.appendChild(pickersContainer); optionDiv.appendChild(addBtn);
    container.appendChild(optionDiv);
    const style = document.createElement("style"); style.textContent = `.card-config{padding:16px}.option{margin-bottom:16px}.label{display:block;font-weight:500;margin-bottom:4px}.description{font-size:12px;opacity:.7;margin-bottom:8px}`;
    container.appendChild(style);
    this.appendChild(container);
  }
  _valueChanged(newValue, index) {
    if (!this._config) return;
    const current = [...(this._config.entities || [])]; current[index] = newValue;
    this.configChanged({ ...this._config, entities: current });
  }
  _addEntity() {
    const current = [...(this._config.entities || [])]; current.push("");
    this.configChanged({ ...this._config, entities: current });
  }
  _removeEntity(index) {
    const current = [...(this._config.entities || [])]; current.splice(index, 1);
    this.configChanged({ ...this._config, entities: current });
  }
}

customElements.define("energy-smart-pv-card", EnergySmartPVCard);
customElements.define("energy-smart-pv-card-editor", EnergySmartPVCardEditor);

// =========================================================================
// CARD UNIFICATA (EnergySmartPVUnifiedCard)
// =========================================================================

class EnergySmartPVUnifiedCard extends HTMLElement {
  constructor() {
    super();
    this._openSettings = new Set();
  }
  static getConfigElement() {
    return document.createElement("energy-smart-pv-unified-card-editor");
  }
  static getStubConfig() {
    return { entities: [] };
  }

  setConfig(config) {
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.content) {
      const card = document.createElement("ha-card");
      card.className = "espv-unified-root";
      this.content = document.createElement("div");
      card.appendChild(this.content);
      this.appendChild(card);
    }
    this.updateContent();
  }

  getCardSize() {
    return 4;
  }

  _ensureStyle() {
    if (this._styleInjected) return;
    const style = document.createElement("style");
    style.textContent = `
      .espv-unified-root {
        position: relative;
        overflow: hidden;
        border-radius: 18px;
        background: linear-gradient(135deg, rgba(30,30,47,0.95) 0%, rgba(42,42,64,0.95) 100%);
        box-shadow: 0 8px 32px 0 rgba(0,0,0,0.37);
      }
      .main-header {
        display: flex;
        justify-content: flex-start;
        padding: 12px 16px 8px 16px;
        color: #fff;
      }
      .main-stats {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        width: 100%;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(12,12,24,0.6);
        color: #fff;
        font-size: 11px;
        font-weight: 500;
      }
      .rows-container {
        padding: 8px 12px 12px 12px;
      }
      .separator {
        height: 1px;
        margin: 6px 4px;
        background: linear-gradient(to right, transparent, rgba(255,255,255,0.18), transparent);
      }
      .zone-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 10px;
        border-radius: 14px;
        background: rgba(255,255,255,0.04);
      }
      .zone-header {
        display: flex;
        align-items: center;
        gap: 10px;
        justify-content: space-between;
      }
      .zone-header-main {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .zone-settings-btn {
        width: 26px;
        height: 26px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(12,12,24,0.7);
        border: 1px solid rgba(255,255,255,0.18);
        cursor: pointer;
      }
      .zone-icon-box {
        width: 30px;
        height: 30px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #00d2ff;
        box-shadow: 0 0 10px rgba(0,210,255,0.4);
        background: rgba(0,0,0,0.35);
      }
      .zone-name {
        color: #fff;
        font-weight: 600;
        font-size: 14px;
      }
      .zone-status { color: rgba(255,255,255,0.75); font-size: 11px; }
      .zone-status .mode-toggle { text-decoration: underline; cursor: pointer; }
      .zone-devices {
        display: grid;
        grid-template-columns: 1.3fr 1.3fr 0.9fr;
        gap: 6px;
      }
      .mini-device {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 8px;
        border-radius: 12px;
        background: rgba(10,10,20,0.8);
        color: #fff;
      }
      .mini-device.active {
        background: radial-gradient(circle at top left, rgba(76,175,80,0.38), rgba(10,10,20,0.9));
      }
      .mini-icon { width: 18px; height: 18px; color: #fff; }
      .mini-details { display: flex; flex-direction: column; flex: 1; font-size: 11px; }
      .mini-label { text-transform: uppercase; opacity: 0.7; }
      .mini-val { font-weight: 600; }
      .mini-temp { font-size: 12px; font-weight: 600; }
      .mini-humidity { font-size: 10px; opacity: 0.8; }
      .mini-dehum {
        display: inline-block; margin-left: 4px; padding: 1px 4px;
        border-radius: 999px; background: rgba(76,175,80,0.25); font-size: 9px;
      }
      .mini-badge {
        display: flex; align-items: center; justify-content: center;
        border-radius: 12px; background: rgba(12,12,24,0.8); color: #fff; font-size: 16px;
      }
      .zone-settings {
        margin-top: 6px;
        padding: 6px 8px;
        border-radius: 10px;
        background: rgba(5,5,15,0.9);
        display: none;
        flex-direction: column;
        gap: 4px;
        font-size: 11px;
      }
      .zone-settings-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }
      .zone-settings-label {
        opacity: 0.8;
      }
      .zone-settings-value {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .zone-mini-btn {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 6px;
        color: #fff;
        font-size: 10px;
        padding: 2px 6px;
        cursor: pointer;
      }
      .clickable { cursor: pointer; }
    `;
    this.appendChild(style);
    this._styleInjected = true;
  }

  _fireEvent(node, type, detail, options) {
    options = options || {};
    const event = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: options.cancelable === undefined ? true : options.cancelable,
      composed: options.composed === undefined ? true : options.composed,
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
  }
  _handleMoreInfo(entityId) {
    if (!entityId) return;
    this._fireEvent(this, "hass-more-info", { entityId });
  }
  _handleToggle(entityId) {
    if (!entityId || !this._hass) return;
    this._hass.callService("switch", "toggle", { entity_id: entityId });
  }

  updateContent() {
    if (!this.config || !this._hass) return;
    this._ensureStyle();

    let entities = this.config.entities || [];
    if (entities.length === 0 && this.config.entity) entities = [this.config.entity];
    if (!Array.isArray(entities) || entities.length === 0) {
      this.content.innerHTML = `
        <ha-card style="padding:16px; background: rgba(20,20,30,0.9); color: white;">
          <div style="font-weight:bold; margin-bottom:4px;">Configurazione necessaria</div>
          <div>Modifica la card e aggiungi i sensori di stato delle tue zone.</div>
        </ha-card>`;
      return;
    }

    this.content.innerHTML = "";

    let zones = 0;
    let zonesBoosting = 0;
    let humiditySum = 0;
    let humidityCount = 0;
    let globalSurplus = null;
    let batterySum = 0;
    let batteryCount = 0;
    let ecoScore = 0;
    let outdoorTemp = null;
    let outdoorHumidity = null;
    let globalAcPower = null;

    entities.forEach((entityId) => {
      const e = this._hass.states[entityId];
      if (!e) return;
      zones += 1;
      const s = Number(e.attributes?.surplus_power);
      if (!Number.isNaN(s) && globalSurplus === null) globalSurplus = s;
      if (e.state === "Boosting (Using Excess)") {
        zonesBoosting += 1; ecoScore = 100;
      } else if (e.state === "Charging Battery" && ecoScore < 80) {
        ecoScore = 80;
      }
      const h = e.attributes?.current_humidity;
      if (h !== undefined && h !== null) {
        const hv = Number(h);
        if (!Number.isNaN(hv)) { humiditySum += hv; humidityCount += 1; }
      }
      const battery = e.attributes?.battery_level;
      if (battery !== undefined && battery !== null) {
        const bv = Number(battery);
        if (!Number.isNaN(bv)) { batterySum += bv; batteryCount += 1; }
      }
      const acp = e.attributes?.ac_power;
      if (acp !== undefined && acp !== null && globalAcPower === null) {
        const ap = Number(acp);
        if (!Number.isNaN(ap)) globalAcPower = ap;
      }
      const outdoorId = e.attributes?.outdoor_sensor;
      const outdoorHumId = e.attributes?.outdoor_humidity_sensor;
      if (outdoorId && outdoorTemp === null) {
        const o = this._hass.states[outdoorId];
        if (o) {
          const t = Number(o.state); if (!Number.isNaN(t)) outdoorTemp = t;
          if (!outdoorHumId && outdoorHumidity === null) {
            const oh = o.attributes?.humidity ?? o.attributes?.current_humidity;
            if (oh !== undefined && oh !== null) {
              const ohv = Number(oh); if (!Number.isNaN(ohv)) outdoorHumidity = ohv;
            }
          }
        }
      }
      if (outdoorHumId && outdoorHumidity === null) {
        const ohs = this._hass.states[outdoorHumId];
        if (ohs) { const hv = Number(ohs.state); if (!Number.isNaN(hv)) outdoorHumidity = hv; }
      }
    });

    const avgHumidity = humidityCount > 0 ? humiditySum / humidityCount : null;
    const avgBattery = batteryCount > 0 ? batterySum / batteryCount : null;
    const displaySurplus = globalSurplus;

    const header = document.createElement("div");
    header.className = "main-header";
    header.innerHTML = `
      <div class="main-stats">
        <div class="chip">
          <ha-icon icon="mdi:leaf" style="color:#4CAF50;"></ha-icon>
          ${ecoScore}% Eco
        </div>
        <div class="chip">
          <ha-icon icon="mdi:flash"></ha-icon>
          ${this._formatPower(displaySurplus)}
        </div>
        ${globalAcPower !== null ? `<div class="chip">
            <ha-icon icon="mdi:air-conditioner"></ha-icon>
            ${this._formatPower(globalAcPower)}
          </div>` : ''}
        ${avgBattery !== null ? `<div class="chip">
            <ha-icon icon="mdi:battery"></ha-icon>
            ${avgBattery.toFixed(0)}%
          </div>` : ''}
        ${avgHumidity !== null ? `<div class="chip">
            <ha-icon icon="mdi:water-percent"></ha-icon>
            ${avgHumidity.toFixed(0)}%
          </div>` : ''}
        ${outdoorTemp !== null || outdoorHumidity !== null ? `<div class="chip">
            <ha-icon icon="mdi:thermometer"></ha-icon>
            ${outdoorTemp !== null ? outdoorTemp.toFixed(1) + '°C' : '--'}${outdoorHumidity !== null ? ' / ' + outdoorHumidity.toFixed(0) + '%' : ''}
          </div>` : ''}
        <div class="chip">
          <ha-icon icon="mdi:home-group"></ha-icon>
          ${zonesBoosting}/${zones}
        </div>
      </div>
    `;

    const rowsContainer = document.createElement("div");
    rowsContainer.className = "rows-container";

    entities.forEach((entityId, index) => {
      const statusEntity = this._hass.states[entityId];
      if (!statusEntity) return;
      const attrs = statusEntity.attributes || {};
      const acEntityId = attrs.ac_entity;
      const heaterEntityId = attrs.heater_entity;
      const mode = attrs.mode;
      const isActive = attrs.is_active;
      const currentHumidity = attrs.current_humidity;
      const humidityThreshold = attrs.humidity_threshold;
      const isDehumidifying = attrs.is_dehumidifying;
      const switchEntityId = attrs.switch_entity;
      const selectEntityId = attrs.select_entity;
      const entryId = attrs.entry_id;
      const minBattery = Number(attrs.min_battery_level ?? 80);
      const exportThreshold = Number(attrs.export_threshold ?? 2000);
      const summerTemp = Number(attrs.summer_temp ?? 24);
      const winterTemp = Number(attrs.winter_temp ?? 21);
      const adaptiveOffset = Number(attrs.adaptive_offset ?? 7);
      const boostOffset = Number(attrs.boost_offset ?? 2);
      const acState = acEntityId ? this._hass.states[acEntityId] : null;
      const heaterState = heaterEntityId ? this._hass.states[heaterEntityId] : null;
      const sharedDehum = attrs.shared_dehumidification === true;
      const isEcoMode = attrs.is_eco_mode === true;
      const currentTempAc = attrs.current_temp_ac;
      const currentTempHeater = attrs.current_temp_heater;
      const ecoRemaining = Number(attrs.eco_remaining_min ?? NaN);
      const lockRemaining = Number(attrs.manual_lock_remaining_min ?? NaN);

      let statusColor = "#00d2ff";
      let statusIcon = "mdi:solar-power";
      let statusText = statusEntity.state;
      let rowBg = "rgba(255,255,255,0.03)";
      
      if (isEcoMode) {
          statusText = "Eco Mode";
          statusColor = "#4CAF50";
          statusIcon = "mdi:leaf";
          rowBg = "rgba(76,175,80,0.12)";
      }

      if (!isActive) {
        statusColor = "#FF5252";
        rowBg = "rgba(180, 40, 40, 0.25)";
        statusText = "Disabilitata";
      } else if (statusEntity.state === "Boosting (Using Excess)") {
        statusColor = "#4CAF50"; statusIcon = "mdi:flash"; rowBg = "rgba(76,175,80,0.12)"; statusText = "In Uso";
        if (isEcoMode) {
            statusText = "Eco Mode";
            statusColor = "#2E7D32"; 
            rowBg = "rgba(46,125,50,0.15)";
        }
      } else if (statusEntity.state === "Charging Battery") {
        statusColor = "#FFC107"; statusIcon = "mdi:battery-charging"; rowBg = "rgba(255,193,7,0.12)"; statusText = "Ricarica";
      } else if (statusEntity.state === "Idle (Monitoring)") {
        statusText = "In Attesa";
      }

      const acTemp = acState ? acState.attributes.temperature : "--";
      const acCurrent = currentTempAc !== undefined && currentTempAc !== null ? currentTempAc : (acState ? acState.attributes.current_temperature : "--");
      const heaterTemp = heaterState ? heaterState.attributes.temperature : "--";
      const heaterCurrent = currentTempHeater !== undefined && currentTempHeater !== null ? currentTempHeater : (heaterState ? heaterState.attributes.current_temperature : "--");
      
      let humidityText = "--";
      if (currentHumidity !== undefined && currentHumidity !== null) {
        const humNum = Number(currentHumidity);
        const thrNum = humidityThreshold !== undefined && humidityThreshold !== null ? Number(humidityThreshold) : NaN;
        if (!Number.isNaN(humNum)) {
          humidityText = `${humNum.toFixed(0)}%`;
          if (!Number.isNaN(thrNum)) humidityText += ` / ${thrNum.toFixed(0)}%`;
          if (isDehumidifying) humidityText += " DEUM";
        }
      }

      if (index > 0) {
        const sep = document.createElement("div"); sep.className = "separator"; rowsContainer.appendChild(sep);
      }
      const row = document.createElement("div");
      row.className = "zone-row"; row.style.background = rowBg;
      row.innerHTML = `
        <div class="zone-header">
          <div class="zone-header-main clickable" data-role="zone-header">
            <div class="zone-icon-box" style="border-color:${statusColor}; box-shadow:0 0 10px ${statusColor}66;">
              <ha-icon icon="${statusIcon}" style="color:${statusColor};"></ha-icon>
            </div>
            <div>
              <div class="zone-name">${(attrs.friendly_name || "").replace(" Status", "")}</div>
              <div class="zone-status">${statusText}${isEcoMode && !Number.isNaN(ecoRemaining) ? ` • ECO ${ecoRemaining}m` : ``} • <span class="mode-toggle">${isActive ? "Automatica" : "Disabilitata"}</span></div>
              ${sharedDehum ? `<div style="font-size:10px; color:#ffeb3b;">Deumidificazione condivisa</div>` : ``}
              ${!Number.isNaN(lockRemaining) && lockRemaining>0 ? `<div style="font-size:10px; color:#ff9800;">Lock ${lockRemaining}m</div>` : ``}
            </div>
          </div>
          <div class="zone-settings-btn" data-role="settings-btn">
            <ha-icon icon="mdi:tune"></ha-icon>
          </div>
        </div>
        <div class="zone-devices">
          <div class="mini-device ${acState && acState.state !== "off" ? "active" : ""} clickable" data-role="ac-card">
            <ha-icon icon="mdi:air-conditioner" class="mini-icon"></ha-icon>
            <div class="mini-details">
              <span class="mini-label">AC</span>
              <span class="mini-val">${acState ? String(acState.state || "").toUpperCase() : "--"}${isDehumidifying ? '<span class="mini-dehum">DEUM</span>' : ''}</span>
              <div class="mini-humidity">${humidityText}</div>
            </div>
            <div class="mini-temp">${acTemp}° <span style="font-size:10px; opacity:0.7;">(${acCurrent}°)</span></div>
          </div>
          <div class="mini-device ${heaterState && heaterState.state !== "off" ? "active" : ""} clickable" data-role="heater-card">
            <ha-icon icon="mdi:radiator" class="mini-icon"></ha-icon>
            <div class="mini-details">
              <span class="mini-label">Term</span>
              <span class="mini-val">${heaterState ? String(heaterState.state || "").toUpperCase() : "--"}</span>
            </div>
            <div class="mini-temp">${heaterTemp}° <span style="font-size:10px; opacity:0.7;">(${heaterCurrent}°)</span></div>
          </div>
          <div class="mini-badge clickable" data-role="mode-badge">${this._formatMode(mode)}</div>
        </div>
        <div class="zone-settings" data-role="zone-settings">
          <div class="zone-settings-row">
            <div class="zone-settings-label">Umidità</div>
            <div class="zone-settings-value">
              <span>${humidityThreshold ? humidityThreshold.toFixed(0) : '--'}%</span>
              <button class="zone-mini-btn" data-role="hum-dec">-</button>
              <button class="zone-mini-btn" data-role="hum-inc">+</button>
            </div>
          </div>
          <div class="zone-settings-row">
            <div class="zone-settings-label">Batteria min</div>
            <div class="zone-settings-value">
              <span>${Number.isNaN(minBattery) ? '--' : minBattery.toFixed(0)}%</span>
              <button class="zone-mini-btn" data-role="bat-dec">-</button>
              <button class="zone-mini-btn" data-role="bat-inc">+</button>
            </div>
          </div>
          <div class="zone-settings-row">
            <div class="zone-settings-label">Soglia W</div>
            <div class="zone-settings-value">
              <span>${Number.isNaN(exportThreshold) ? '--' : exportThreshold.toFixed(0)} W</span>
              <button class="zone-mini-btn" data-role="thr-dec">-</button>
              <button class="zone-mini-btn" data-role="thr-inc">+</button>
            </div>
          </div>
          <div class="zone-settings-row">
            <div class="zone-settings-label">Temp. Estate</div>
            <div class="zone-settings-value">
              <span>${Number.isNaN(summerTemp) ? '--' : summerTemp.toFixed(1)}°C</span>
              <button class="zone-mini-btn" data-role="sum-dec">-</button>
              <button class="zone-mini-btn" data-role="sum-inc">+</button>
            </div>
          </div>
          <div class="zone-settings-row">
            <div class="zone-settings-label">Temp. Inverno</div>
            <div class="zone-settings-value">
              <span>${Number.isNaN(winterTemp) ? '--' : winterTemp.toFixed(1)}°C</span>
              <button class="zone-mini-btn" data-role="win-dec">-</button>
              <button class="zone-mini-btn" data-role="win-inc">+</button>
            </div>
          </div>
          <div class="zone-settings-row">
            <div class="zone-settings-label">Offset adattivo</div>
            <div class="zone-settings-value">
              <span>${Number.isNaN(adaptiveOffset) ? '--' : adaptiveOffset.toFixed(0)}°C</span>
              <button class="zone-mini-btn" data-role="adoff-dec">-</button>
              <button class="zone-mini-btn" data-role="adoff-inc">+</button>
            </div>
          </div>
          <div class="zone-settings-row">
            <div class="zone-settings-label">Offset boost</div>
            <div class="zone-settings-value">
              <span>${Number.isNaN(boostOffset) ? '--' : boostOffset.toFixed(0)}°C</span>
              <button class="zone-mini-btn" data-role="booff-dec">-</button>
              <button class="zone-mini-btn" data-role="booff-inc">+</button>
            </div>
          </div>
          <div class="zone-settings-row">
            <div class="zone-settings-label">Deumidificazione condivisa</div>
            <div class="zone-settings-value">
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" data-role="shared-dehum-toggle" ${sharedDehum ? "checked" : ""} style="width:14px;height:14px;">
              </label>
            </div>
          </div>
          <div class="zone-settings-row">
            <div class="zone-settings-label">Deumidificazione in inverno</div>
            <div class="zone-settings-value">
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" data-role="winter-dehum-toggle" ${attrs.winter_dehumidification ? "checked" : ""} style="width:14px;height:14px;">
              </label>
            </div>
          </div>
        </div>
      `;

      const zoneHeader = row.querySelector('[data-role="zone-header"]');
      if (zoneHeader) zoneHeader.addEventListener("click", () => this._handleMoreInfo(entityId));
      const toggle = row.querySelector(".mode-toggle");
      if (toggle && switchEntityId) {
        toggle.addEventListener("click", (ev) => { ev.stopPropagation(); this._handleToggle(switchEntityId); });
      }
      const acCard = row.querySelector('[data-role="ac-card"]');
      if (acCard && acEntityId) acCard.addEventListener("click", () => this._handleMoreInfo(acEntityId));
      const heaterCard = row.querySelector('[data-role="heater-card"]');
      if (heaterCard && heaterEntityId) heaterCard.addEventListener("click", () => this._handleMoreInfo(heaterEntityId));
      const modeBadge = row.querySelector('[data-role="mode-badge"]');
      if (modeBadge && selectEntityId) modeBadge.addEventListener("click", () => this._handleMoreInfo(selectEntityId));

      const settingsBtn = row.querySelector('[data-role="settings-btn"]');
      const settingsPane = row.querySelector('[data-role="zone-settings"]');
      if (settingsBtn && settingsPane) {
        if (entryId && this._openSettings.has(entryId)) {
          settingsPane.style.display = "flex";
        }
        settingsBtn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const visible = settingsPane.style.display === "flex";
          settingsPane.style.display = visible ? "none" : "flex";
          if (entryId) {
            if (visible) this._openSettings.delete(entryId);
            else this._openSettings.add(entryId);
          }
        });
      }

      const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
      const callService = (service, value) => {
        if (!entryId || !this._hass) return;
        this._hass.callService("energy_smart_pv", service, { entry_id: entryId, value });
      };
      const humDec = row.querySelector('[data-role="hum-dec"]');
      const humInc = row.querySelector('[data-role="hum-inc"]');
      const batDec = row.querySelector('[data-role="bat-dec"]');
      const batInc = row.querySelector('[data-role="bat-inc"]');
      const thrDec = row.querySelector('[data-role="thr-dec"]');
      const thrInc = row.querySelector('[data-role="thr-inc"]');
      const sumDec = row.querySelector('[data-role="sum-dec"]');
      const sumInc = row.querySelector('[data-role="sum-inc"]');
      const winDec = row.querySelector('[data-role="win-dec"]');
      const winInc = row.querySelector('[data-role="win-inc"]');
      const adoffDec = row.querySelector('[data-role="adoff-dec"]');
      const adoffInc = row.querySelector('[data-role="adoff-inc"]');
      const booffDec = row.querySelector('[data-role="booff-dec"]');
      const booffInc = row.querySelector('[data-role="booff-inc"]');
      const sharedToggle = row.querySelector('[data-role="shared-dehum-toggle"]');
      const winterToggle = row.querySelector('[data-role="winter-dehum-toggle"]');

      if (humDec) humDec.addEventListener("click", (ev) => { ev.stopPropagation(); callService("set_humidity_threshold", clamp((humidityThreshold || 60) - 1, 30, 90)); this._openSettings.add(entryId); });
      if (humInc) humInc.addEventListener("click", (ev) => { ev.stopPropagation(); callService("set_humidity_threshold", clamp((humidityThreshold || 60) + 1, 30, 90)); this._openSettings.add(entryId); });
      if (batDec) batDec.addEventListener("click", (ev) => { ev.stopPropagation(); callService("set_min_battery_level", clamp(minBattery - 1, 10, 100)); this._openSettings.add(entryId); });
      if (batInc) batInc.addEventListener("click", (ev) => { ev.stopPropagation(); callService("set_min_battery_level", clamp(minBattery + 1, 10, 100)); this._openSettings.add(entryId); });
      if (thrDec) thrDec.addEventListener("click", (ev) => { ev.stopPropagation(); callService("set_export_threshold", clamp(exportThreshold - 50, 100, 10000)); this._openSettings.add(entryId); });
      if (thrInc) thrInc.addEventListener("click", (ev) => { ev.stopPropagation(); callService("set_export_threshold", clamp(exportThreshold + 50, 100, 10000)); this._openSettings.add(entryId); });
      if (sumDec) sumDec.addEventListener("click", (ev) => { ev.stopPropagation(); callService("set_summer_temp", clamp(summerTemp - 0.5, 16, 30)); this._openSettings.add(entryId); });
      if (sumInc) sumInc.addEventListener("click", (ev) => { ev.stopPropagation(); callService("set_summer_temp", clamp(summerTemp + 0.5, 16, 30)); this._openSettings.add(entryId); });
      if (winDec) winDec.addEventListener("click", (ev) => { ev.stopPropagation(); callService("set_winter_temp", clamp(winterTemp - 0.5, 16, 25)); this._openSettings.add(entryId); });
      if (winInc) winInc.addEventListener("click", (ev) => { ev.stopPropagation(); callService("set_winter_temp", clamp(winterTemp + 0.5, 16, 25)); this._openSettings.add(entryId); });
      if (adoffDec) adoffDec.addEventListener("click", (ev) => { ev.stopPropagation(); callService("set_adaptive_offset", clamp(adaptiveOffset - 1, 0, 15)); this._openSettings.add(entryId); });
      if (adoffInc) adoffInc.addEventListener("click", (ev) => { ev.stopPropagation(); callService("set_adaptive_offset", clamp(adaptiveOffset + 1, 0, 15)); this._openSettings.add(entryId); });
      if (booffDec) booffDec.addEventListener("click", (ev) => { ev.stopPropagation(); callService("set_boost_offset", clamp(boostOffset - 1, 0, 10)); this._openSettings.add(entryId); });
      if (booffInc) booffInc.addEventListener("click", (ev) => { ev.stopPropagation(); callService("set_boost_offset", clamp(boostOffset + 1, 0, 10)); this._openSettings.add(entryId); });
      if (sharedToggle) sharedToggle.addEventListener("change", (ev) => { ev.stopPropagation(); callService("set_shared_dehumidification", !!ev.target.checked); this._openSettings.add(entryId); });
      if (winterToggle) winterToggle.addEventListener("change", (ev) => { ev.stopPropagation(); callService("set_winter_dehumidification", !!ev.target.checked); this._openSettings.add(entryId); });

      rowsContainer.appendChild(row);
    });

    this.content.appendChild(header);
    this.content.appendChild(rowsContainer);
  }

  _formatPower(watts) {
    const value = Number(watts);
    if (Number.isNaN(value)) return "--";
    return `${Math.round(value)} W`;
  }
  _formatMode(mode) {
    if (!mode) return "📋";
    const m = String(mode);
    if (m.includes("Summer")) return "❄️";
    if (m.includes("Winter")) return "🔥";
    return "📋";
  }
}

class EnergySmartPVUnifiedCardEditor extends HTMLElement {
  setConfig(config) { this._config = config; this.render(); }
  configChanged(newConfig) {
    const event = new CustomEvent("config-changed", { detail: { config: newConfig }, bubbles: true, composed: true });
    this.dispatchEvent(event);
  }
  set hass(hass) {
    this._hass = hass;
    const pickers = this.querySelectorAll("ha-entity-picker");
    pickers.forEach((p) => p.hass = hass);
  }
  render() {
    if (!this._config) return;
    this.innerHTML = "";
    const entities = this._config.entities || [];
    const container = document.createElement("div");
    container.className = "card-config";
    const optionDiv = document.createElement("div");
    optionDiv.className = "option";
    const label = document.createElement("label");
    label.className = "label"; label.innerText = "Zone da Integrare";
    const desc = document.createElement("div");
    desc.className = "description"; desc.innerText = "Aggiungi i sensori di stato zona da mostrare in questa card.";
    const pickersContainer = document.createElement("div");
    const hasPicker = !!customElements.get("ha-entity-picker");
    entities.forEach((entity, index) => {
      const row = document.createElement("div");
      row.style.cssText = "margin-bottom:8px; display:flex; gap:8px; align-items:center;";
      let field;
      
      // Utilizziamo l'entity-picker se disponibile (standard in HA moderno)
      const picker = document.createElement("ha-entity-picker");
      picker.style.flex = "1";
      picker.hass = this._hass;
      picker.value = entity;
      picker.includeDomains = ["sensor"];
      picker.addEventListener("value-changed", (ev) => {
        this._valueChanged(ev.detail.value, index);
      });
      field = picker;

      const removeBtn = document.createElement("div");
      removeBtn.innerText = "X";
      removeBtn.style.cssText = "color:red; cursor:pointer; font-weight:bold; padding:0 8px;";
      removeBtn.onclick = () => this._removeEntity(index);
      row.appendChild(field); row.appendChild(removeBtn); pickersContainer.appendChild(row);
    });
    const addBtn = document.createElement("button");
    addBtn.innerText = "+ Aggiungi Zona";
    addBtn.style.cssText = "margin-top:8px; padding:8px 16px; background:#2196F3; color:white; border:none; border-radius:4px; cursor:pointer;";
    addBtn.onclick = () => this._addEntity();
    optionDiv.appendChild(label); optionDiv.appendChild(desc); optionDiv.appendChild(pickersContainer); optionDiv.appendChild(addBtn);
    container.appendChild(optionDiv);
    const style = document.createElement("style");
    style.textContent = `.card-config{padding:16px}.option{margin-bottom:16px}.label{display:block;font-weight:500;margin-bottom:4px}.description{font-size:12px;opacity:.7;margin-bottom:8px}`;
    container.appendChild(style);
    this.appendChild(container);
  }
  _valueChanged(newValue, index) {
    if (!this._config) return;
    const current = [...(this._config.entities || [])];
    current[index] = newValue;
    this.configChanged({ ...this._config, entities: current });
  }
  _addEntity() {
    const current = [...(this._config.entities || [])];
    current.push("");
    this.configChanged({ ...this._config, entities: current });
  }
  _removeEntity(index) {
    const current = [...(this._config.entities || [])];
    current.splice(index, 1);
    this.configChanged({ ...this._config, entities: current });
  }
}

customElements.define("energy-smart-pv-unified-card", EnergySmartPVUnifiedCard);
customElements.define("energy-smart-pv-unified-card-editor", EnergySmartPVUnifiedCardEditor);

// =========================================================================
// REGISTRAZIONE DELLE CARD IN LOVELACE
// =========================================================================

window.customCards = window.customCards || [];
window.customCards.push(
  {
    type: "energy-smart-pv-card",
    name: "Energy Smart PV Card",
    preview: true,
    description: "Card singola per una singola zona Energy Smart PV",
  },
  {
    type: "energy-smart-pv-unified-card",
    name: "Energy Smart PV Unified Card",
    preview: true,
    description: "Una singola card che raggruppa e controlla tutte le zone",
  }
);
