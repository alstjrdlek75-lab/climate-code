/* ==========================================================================
   ANTI-GRAVITY CLIMATE CODE JAVASCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. TAB NAVIGATION SYSTEM
  // ==========================================
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all buttons
      tabBtns.forEach(b => b.classList.remove('active'));
      // Add active to clicked button
      btn.classList.add('active');

      // Hide all contents
      tabContents.forEach(content => {
        content.classList.remove('active-content');
      });

      // Show target content
      const targetId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active-content');
        // Handle canvas resize or re-draw if tab becomes visible
        if (targetId === 'tab-mechanism') {
          initSpecificHeatGraph();
        }
      }
    });
  });


  // ==========================================
  // 2. PART 2 - INTERACTIVE CAUSAL MAP
  // ==========================================
  const factorNodes = document.querySelectorAll('.factor-node');
  const elementNodes = {
    temp: document.getElementById('elem-temp'),
    precip: document.getElementById('elem-precip'),
    wind: document.getElementById('elem-wind'),
    humidity: document.getElementById('elem-humidity'),
    pressure: document.getElementById('elem-pressure')
  };
  const causalExplanation = document.getElementById('causal-explanation');

  const causalData = {
    latitude: {
      title: "🌍 위도 (Latitude) ➔ 기온, 기압, 강수량",
      desc: "위도는 지구상에서 받는 <strong>태양고도(태양 에너지 입사각)</strong>를 결정하여 적도에서 극지로 갈수록 기온을 낮추는 가장 지배적인 요인입니다. 또한 적도의 저압대, 30도의 고압대 등 지구 대기 대순환의 <strong>위도별 기압대 패턴</strong>을 형성하고, 이에 따라 상승기류(적도 다우지대)와 하강기류(아열대 건조지대)를 유도하여 강수량 분포를 결정합니다.",
      highlights: ['temp', 'pressure', 'precip']
    },
    landsea: {
      title: "🌊 수륙 분포 (Land/Sea) ➔ 기온, 습도",
      desc: "대륙(땅)과 해양(물)은 <strong>비열(Specific Heat)</strong> 차이가 큽니다. 땅은 비열이 작아 빨리 데워지고 빨리 식으므로 내륙은 연교차가 크고 기온 변화가 극단적인 <strong>대륙성 기후</strong>를 띱니다. 반면 바다는 비열이 커 온도 변화가 서서히 나타나며 습도가 높고 연교차가 작은 온화한 <strong>해양성 기후</strong>를 형성합니다.",
      highlights: ['temp', 'humidity']
    },
    circulation: {
      title: "🌀 대기 대순환 (Circulation) ➔ 바람, 기압, 강수량, 습도",
      desc: "적도저압대, 아열대고압대, 고위도저압대 등의 기압 배치에 따라 지구 규모의 항상풍(무역풍, 편서풍, 극동풍)이 발생합니다. 이 대순환은 열과 수분을 수송하며, 고압대 영역(위도 30도 부근)에는 하강기류가 발달하여 맑고 건조한 하계 수분 부족 환경을 유발해 세계적인 사막 벨트를 형성합니다.",
      highlights: ['wind', 'pressure', 'precip', 'humidity']
    },
    terrain: {
      title: "⛰️ 지형 (Terrain) ➔ 강수량, 바람",
      desc: "산맥을 향해 습한 바람이 불어올 때, 산맥의 바람받이(Windward) 사면은 강제 상승 기류가 형성되어 단열 냉각을 통해 구름이 만들어지고 많은 비(지형성 강수)를 내립니다. 반면 산맥을 넘어 하강하는 바람고개 뒷사면(비그늘, Leeward)은 고온 건조해져 강수량이 급격히 줄어드는 <strong>우음 효과(Rain Shadow)</strong>를 보입니다.",
      highlights: ['precip', 'wind']
    },
    currents: {
      title: "🚢 해류 (Currents) ➔ 기온, 강수량, 습도",
      desc: "저위도의 따뜻한 바닷물인 <strong>난류(Warm Current)</strong>는 연안 대기를 온난습윤하게 만들어 강수량을 늘려줍니다(예: 서유럽의 서안해양성 기후). 반면 고위도의 차가운 바닷물인 <strong>한류(Cold Current)</strong>는 하층 대기를 냉각시켜 안개를 자주 유발하고, 대기가 극도로 안정되어 상승기류를 억제하므로 비가 오지 않는 <strong>연안 사막</strong>(아타카마, 나미브 사막 등)을 발달시킵니다.",
      highlights: ['temp', 'precip', 'humidity']
    },
    altitude: {
      title: "🏔️ 고도 (Altitude) ➔ 기온",
      desc: "지표면에서 방출되는 지구 복사 에너지는 고도가 높아질수록 도달률이 떨어지고 공기가 희박해져 <strong>해발고도가 100m 올라갈 때마다 약 0.6℃씩 기온이 하강</strong>합니다(기온 감률). 이 때문에 저위도 열대 지방이라 하더라도 고산 지대(해발 2,000m 이상)는 일 년 내내 서늘한 봄날 같은 독특한 <strong>상춘(常春) 고산 기후(H)</strong>가 나타납니다.",
      highlights: ['temp']
    }
  };

  factorNodes.forEach(node => {
    node.addEventListener('click', () => {
      // Toggle active states
      factorNodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');

      // Clear element highlights
      Object.values(elementNodes).forEach(el => el.classList.remove('highlight-effect'));

      // Active Factor Data
      const factorKey = node.getAttribute('data-factor');
      const data = causalData[factorKey];

      if (data) {
        // Highlight elements
        data.highlights.forEach(id => {
          if (elementNodes[id]) {
            elementNodes[id].classList.add('highlight-effect');
          }
        });

        // Set explanation content
        causalExplanation.classList.add('active');
        causalExplanation.innerHTML = `
          <div class="exp-title">${data.title}</div>
          <div class="exp-desc">${data.desc}</div>
        `;
      }
    });
  });


  // ==========================================
  // 3. PART 2 - SPECIFIC HEAT SIMULATOR
  // ==========================================
  const btnToggleTime = document.getElementById('btn-toggle-time');
  const btnResetSandbox = document.getElementById('btn-reset-sandbox');
  const liveLandTemp = document.getElementById('live-land-temp');
  const liveWaterTemp = document.getElementById('live-water-temp');
  const visualLand = document.getElementById('visual-land');
  const visualWater = document.getElementById('visual-water');
  const canvas = document.getElementById('temp-graph');
  const ctx = canvas.getContext('2d');

  let landTemp = 20.0;
  let waterTemp = 20.0;
  let isHeating = false; // false = night/cooling, true = day/heating
  let timeStep = 0;
  let tempHistory = []; // array of {time, land, water}
  let simTimer = null;
  const maxHistoryPoints = 120; // 2 full cycles roughly

  function initSpecificHeatGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw initial empty graph grid
    drawGraph();
  }

  function drawGraph() {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(13, 17, 23, 0.06)';
    ctx.lineWidth = 1;
    for (let y = 20; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(canvas.width - 10, y);
      ctx.stroke();
    }

    // Y Axis labels (Temp)
    ctx.fillStyle = '#5d6b82';
    ctx.font = '9px Outfit';
    ctx.textAlign = 'right';
    ctx.fillText("40°C", 25, 25);
    ctx.fillText("25°C", 25, 75);
    ctx.fillText("10°C", 25, 125);

    // Draw Land Curve (Orange)
    if (tempHistory.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#f57c00';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < tempHistory.length; i++) {
        const x = 30 + (i * (canvas.width - 40) / maxHistoryPoints);
        // Map 5°C to 45°C onto canvas height (135px to 15px)
        const y = canvas.height - 15 - ((tempHistory[i].land - 5) * (canvas.height - 30) / 40);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw Water Curve (Blue)
      ctx.beginPath();
      ctx.strokeStyle = '#1b6bff';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < tempHistory.length; i++) {
        const x = 30 + (i * (canvas.width - 40) / maxHistoryPoints);
        const y = canvas.height - 15 - ((tempHistory[i].water - 5) * (canvas.height - 30) / 40);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Legend
    ctx.fillStyle = '#f57c00';
    ctx.fillRect(40, 10, 8, 4);
    ctx.fillStyle = '#5d6b82';
    ctx.textAlign = 'left';
    ctx.fillText("대륙", 52, 14);

    ctx.fillStyle = '#1b6bff';
    ctx.fillRect(80, 10, 8, 4);
    ctx.fillStyle = '#5d6b82';
    ctx.fillText("해양", 92, 14);
  }

  function updateSandbox() {
    timeStep++;
    
    // Simulate physics: Land changes 4x faster than Ocean due to specific heat
    const targetLand = isHeating ? 42.0 : 10.0;
    const targetWater = isHeating ? 24.5 : 15.5;

    // Land update
    landTemp += (targetLand - landTemp) * 0.08;
    // Ocean update
    waterTemp += (targetWater - waterTemp) * 0.02;

    // Update DOM
    liveLandTemp.textContent = landTemp.toFixed(1);
    liveWaterTemp.textContent = waterTemp.toFixed(1);

    // Heat maps styling overlay based on actual temp
    // Interpolate Land background: 10C (dark brown) to 42C (heated red)
    const landRedRatio = (landTemp - 10) / 32; // 0 to 1
    visualLand.style.backgroundColor = `rgb(${Math.floor(39 + landRedRatio * 100)}, ${Math.floor(33 - landRedRatio * 15)}, ${Math.floor(26 - landRedRatio * 20)})`;
    
    // Interpolate Water background: 15C (deep indigo) to 25C (cyan marine)
    const waterBlueRatio = (waterTemp - 15) / 10; // 0 to 1
    visualWater.style.backgroundColor = `rgb(${Math.floor(12 + waterBlueRatio * 20)}, ${Math.floor(35 + waterBlueRatio * 70)}, ${Math.floor(60 + waterBlueRatio * 90)})`;

    // Save history
    tempHistory.push({ time: timeStep, land: landTemp, water: waterTemp });
    if (tempHistory.length > maxHistoryPoints) {
      tempHistory.shift();
    }

    drawGraph();
  }

  // Set up background ticker loop for specific heat
  function startSandboxInterval() {
    if (simTimer === null) {
      simTimer = setInterval(updateSandbox, 100);
    }
  }

  btnToggleTime.addEventListener('click', () => {
    isHeating = !isHeating;
    if (isHeating) {
      btnToggleTime.textContent = "🌙 밤/겨울 냉각 시작";
      btnToggleTime.className = "btn btn--primary";
      btnToggleTime.style.background = "#1b6bff";
      btnToggleTime.style.boxShadow = "0 4px 15px rgba(27, 107, 255, 0.3)";
    } else {
      btnToggleTime.textContent = "🌞 낮/여름 가열 시작";
      btnToggleTime.className = "btn btn--primary";
      btnToggleTime.style.background = "var(--accent-temp)";
      btnToggleTime.style.boxShadow = "0 4px 15px var(--accent-temp-glow)";
    }
    startSandboxInterval();
  });

  btnResetSandbox.addEventListener('click', () => {
    if (simTimer) {
      clearInterval(simTimer);
      simTimer = null;
    }
    landTemp = 20.0;
    waterTemp = 20.0;
    isHeating = false;
    tempHistory = [];
    timeStep = 0;
    
    btnToggleTime.textContent = "🌞 낮/여름 가열 시작";
    btnToggleTime.className = "btn btn--primary";
    btnToggleTime.style.background = "var(--accent-temp)";
    btnToggleTime.style.boxShadow = "0 4px 15px var(--accent-temp-glow)";
    
    liveLandTemp.textContent = "20.0";
    liveWaterTemp.textContent = "20.0";
    visualLand.style.backgroundColor = "#27211a";
    visualWater.style.backgroundColor = "#0c233c";
    
    initSpecificHeatGraph();
  });

  // Init once on load
  initSpecificHeatGraph();


  // ==========================================
  // 4. PART 2 - ATMOSPHERIC CIRCULATION SLIDER
  // ==========================================
  const latSlider = document.getElementById('lat-slider');
  const latDisplay = document.getElementById('lat-display');
  const circPressureBelt = document.getElementById('circ-pressure-belt');
  const circAirFlow = document.getElementById('circ-air-flow');
  const circWind = document.getElementById('circ-wind');
  const circWaterStatus = document.getElementById('circ-water-status');
  const gaugePrecip = document.getElementById('gauge-precip');
  const gaugeEvap = document.getElementById('gauge-evap');
  const circBiomeSvg = document.getElementById('circ-biome-svg');
  const circBiomeDesc = document.getElementById('circ-biome-desc');

  // Draw Biome SVGs for slider
  const microBiomeSvgs = {
    rainforest: `<svg width="70" height="70" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#091f16" rx="8"/>
      <!-- Cloud -->
      <path d="M25,35 Q30,25 40,30 Q50,20 60,30 Q70,30 70,40 Q50,45 25,35 Z" fill="#4b5563" opacity="0.8"/>
      <line x1="30" y1="45" x2="25" y2="60" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="2,2"/>
      <line x1="45" y1="48" x2="40" y2="63" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="2,2"/>
      <line x1="60" y1="46" x2="55" y2="61" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="2,2"/>
      <!-- Forest Trees -->
      <path d="M15,90 L25,55 L35,90 Z" fill="#059669"/>
      <path d="M30,90 L45,45 L60,90 Z" fill="#10b981"/>
      <path d="M50,90 L65,50 L80,90 Z" fill="#047857"/>
      <path d="M70,90 L80,60 L90,90 Z" fill="#059669"/>
    </svg>`,
    savanna: `<svg width="70" height="70" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#2d2206" rx="8"/>
      <!-- Sun -->
      <circle cx="75" cy="25" r="10" fill="#f59e0b" filter="drop-shadow(0 0 4px #d97706)"/>
      <!-- Flat Acacia tree -->
      <line x1="45" y1="90" x2="45" y2="60" stroke="#78350f" stroke-width="4"/>
      <line x1="45" y1="70" x2="30" y2="55" stroke="#78350f" stroke-width="2.5"/>
      <line x1="45" y1="65" x2="60" y2="52" stroke="#78350f" stroke-width="2.5"/>
      <ellipse cx="45" cy="50" rx="30" ry="8" fill="#15803d"/>
      <ellipse cx="25" cy="52" rx="12" ry="5" fill="#166534"/>
      <ellipse cx="60" cy="49" rx="14" ry="6" fill="#166534"/>
      <!-- Grass stubble -->
      <path d="M10,90 L12,80 L15,90 M20,90 L25,75 L28,90 M80,90 L83,78 L87,90" stroke="#a3e635" stroke-width="2"/>
    </svg>`,
    desert: `<svg width="70" height="70" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#2e1a05" rx="8"/>
      <!-- Scorching Sun -->
      <circle cx="50" cy="25" r="12" fill="#ef4444"/>
      <circle cx="50" cy="25" r="16" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="4,4"/>
      <!-- Dunes -->
      <path d="M0,90 Q30,75 60,88 T100,75 L100,100 L0,100 Z" fill="#d97706"/>
      <path d="M0,95 Q40,85 100,98 L100,100 L0,100 Z" fill="#b45309"/>
      <!-- Cactus -->
      <rect x="25" y="60" width="6" height="25" rx="3" fill="#15803d"/>
      <path d="M20,68 H26 V74 H20 Z M28,64 H34 V70 H28 Z" fill="#15803d"/>
      <rect x="18" y="63" width="4" height="8" rx="2" fill="#15803d"/>
      <rect x="32" y="59" width="4" height="8" rx="2" fill="#15803d"/>
    </svg>`,
    temperate: `<svg width="70" height="70" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#0d1b2a" rx="8"/>
      <!-- Small Cloud -->
      <path d="M60,30 Q65,22 75,25 Q82,20 88,27 Q93,28 92,35 Z" fill="#9ca3af" opacity="0.6"/>
      <!-- Deciduous & Pine tree -->
      <rect x="30" y="80" width="4" height="10" fill="#78350f"/>
      <circle cx="32" cy="65" r="18" fill="#16a34a"/>
      <circle cx="25" cy="58" r="12" fill="#15803d"/>
      
      <rect x="65" y="80" width="4" height="10" fill="#78350f"/>
      <path d="M50,80 L67,40 L84,80 Z" fill="#065f46"/>
      <path d="M55,65 L67,30 L79,65 Z" fill="#047857"/>
    </svg>`,
    taiga: `<svg width="70" height="70" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#071317" rx="8"/>
      <!-- Snow peaks far -->
      <path d="M0,90 L20,65 L40,90 Z" fill="#1e293b"/>
      <path d="M20,90 L50,55 L80,90 Z" fill="#334155"/>
      <path d="M45,60 L50,55 L55,60 Z" fill="#ffffff"/> <!-- Snow top -->
      <!-- Conifers -->
      <path d="M15,90 L25,65 L35,90 Z" fill="#0f4c3a"/>
      <path d="M30,90 L42,50 L54,90 Z" fill="#064e3b"/>
      <path d="M48,90 L58,70 L68,90 Z" fill="#0f4c3a"/>
      <path d="M62,90 L75,55 L88,90 Z" fill="#0f4c3a"/>
    </svg>`,
    tundra: `<svg width="70" height="70" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#0f172a" rx="8"/>
      <!-- Glaciers / Ice background -->
      <path d="M0,90 Q40,80 80,92 T100,85 L100,100 L0,100 Z" fill="#e2e8f0"/>
      <!-- Small moss patches -->
      <ellipse cx="25" cy="92" rx="10" ry="3" fill="#78350f"/>
      <ellipse cx="25" cy="92" rx="8" ry="2.2" fill="#588157"/>
      <ellipse cx="70" cy="95" rx="15" ry="3.5" fill="#475569"/>
      <ellipse cx="70" cy="95" rx="12" ry="2.5" fill="#854d0e"/>
      <!-- Aurora glow -->
      <path d="M10,20 Q30,5 60,25 T90,10" fill="none" stroke="#22c55e" stroke-width="3" opacity="0.4" filter="blur(2px)"/>
    </svg>`,
    icecap: `<svg width="70" height="70" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#030712" rx="8"/>
      <!-- Massive Ice Sheet -->
      <path d="M0,80 L30,70 L70,82 L100,75 L100,100 L0,100 Z" fill="#f1f5f9"/>
      <path d="M30,70 L35,60 L45,73 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.5"/>
      <path d="M65,80 L70,68 L78,81 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.5"/>
      <!-- Falling snowflakes -->
      <circle cx="20" cy="20" r="1.5" fill="#ffffff" opacity="0.8"/>
      <circle cx="45" cy="15" r="1.2" fill="#ffffff" opacity="0.6"/>
      <circle cx="75" cy="25" r="1.5" fill="#ffffff" opacity="0.7"/>
      <circle cx="60" cy="40" r="1" fill="#ffffff" opacity="0.5"/>
      <circle cx="30" cy="45" r="1.8" fill="#ffffff" opacity="0.8"/>
    </svg>`
  };

  function updateCirculation() {
    const lat = parseInt(latSlider.value);
    latDisplay.textContent = `${lat}° (${getLatitudeZoneName(lat)})`;

    let belt = "";
    let flow = "";
    let wind = "";
    let status = "";
    let precip = 0;
    let evap = 0;
    let biomeKey = "rainforest";
    let desc = "";

    if (lat >= 0 && lat < 10) {
      belt = "적도 저압대 (ITCZ / Equatorial Low)";
      flow = "강렬한 상승 기류 발달 (일사 집중)";
      wind = "무역풍 수렴 지대 (Doldrums)";
      status = "강수량 >>> 증발량 (극단적 과습)";
      precip = 90;
      evap = 35;
      biomeKey = "rainforest";
      desc = "<strong>열대 우림 형성 (Af):</strong> 일사량이 많아 일년 내내 무덥고 상승기류가 상시 발달합니다. 매일 대류성 강수(스콜)가 내려 수분이 극도로 과잉되어 상록활엽수가 울창한 밀림을 이룹니다.";
    } 
    else if (lat >= 10 && lat < 20) {
      belt = "적도 저압대 ↔ 아열대 고압대 과도기";
      flow = "상승 기류(여름) 및 하강 기류(겨울)의 계절 교차";
      wind = "북동 무역풍 및 계절풍 영향";
      status = "강수량 > 증발량 (우기/건기 명확)";
      precip = 65;
      evap = 55;
      biomeKey = "savanna";
      desc = "<strong>사바나 초원 형성 (Aw):</strong> 적도 저압대(여름 우기)와 아열대 고압대(겨울 건기)가 교대로 지배합니다. 건조기를 버티기 위한 긴 풀 초원(사바나)과 바오밥나무 등 소림이 발달합니다.";
    }
    else if (lat >= 20 && lat < 35) {
      belt = "아열대 고압대 (Subtropical High Pressure Belt)";
      flow = "대기 대순환에 의한 상시 하강 기류 형성";
      wind = "고압대 중심부 (무역풍/편서풍 발원지)";
      status = "증발량 >>> 강수량 (★물 부족 지역)";
      precip = 12;
      evap = 88;
      biomeKey = "desert";
      desc = "<strong>세계적 사막 지대 발달 (BW/BS):</strong> 대기 순환에 의해 상층 공기가 압축 하강하는 고압대가 형성되어 연중 맑고 건조합니다. 연 강수량이 250mm 이하로 극도로 적어 식생이 자라기 어렵습니다.";
    }
    else if (lat >= 35 && lat < 55) {
      belt = "온대 고위도 저압대 이동성 기압계 영향";
      flow = "온난 습윤 전선 및 이동성 고기압 교차";
      wind = "상시 편서풍 (Westerlies) 지배 지대";
      status = "강수량 > 증발량 (습윤 양호)";
      precip = 60;
      evap = 45;
      biomeKey = "temperate";
      desc = "<strong>온대 혼합림 발달 (C 기후군):</strong> 온난하고 사계절이 뚜렷합니다. 해양과 대륙의 경계 및 편서풍 영향으로 연중 습윤하거나 여름/겨울 건조 형태를 띠며 낙엽송과 상록엽수가 섞여 자랍니다.";
    }
    else if (lat >= 55 && lat < 70) {
      belt = "한대 전선대 / 고위도 저압대 (Subpolar Low)";
      flow = "극동풍과 편서풍 수렴으로 상승 기류 형성";
      wind = "편서풍 및 극동풍의 수렴 (전선성 강수)";
      status = "강수량 > 증발량 (저온으로 인한 과습)";
      precip = 50;
      evap = 18;
      biomeKey = "taiga";
      desc = "<strong>타이가 침엽수림 (D 기후군):</strong> 저온으로 증발량이 매우 적어 적은 비로도 대지가 습윤합니다. 길고 혹독한 겨울을 견딜 수 있는 바늘잎 나무(침엽수림대)가 거대한 띠를 이룹니다.";
    }
    else if (lat >= 70 && lat < 82) {
      belt = "극 고압대 (Polar High)";
      flow = "차가운 공기 수축으로 인한 상시 하강 기류";
      wind = "극동풍 (Polar Easterlies)";
      status = "강수량 > 증발량 (저온 건조, 식생 제한)";
      precip = 22;
      evap = 8;
      biomeKey = "tundra";
      desc = "<strong>툰드라 이끼류 발달 (ET):</strong> 평균기온이 너무 낮아 큰 나무가 생장할 수 없습니다. 짧은 여름철(최난월 0~10℃) 동안 표층 빙판이 녹으며 녹색 이끼류와 지의류가 얇게 지표면을 덮습니다.";
    }
    else {
      belt = "극 고압대 중심부 (Polar Ice Dome)";
      flow = "차가운 빙판 위 강력한 하강 기류";
      wind = "활강풍 및 불규칙 극풍";
      status = "강수량 극소, 증발량 0에 수렴 (빙설 환경)";
      precip = 8;
      evap = 2;
      biomeKey = "icecap";
      desc = "<strong>만년설 빙설 사막 (EF):</strong> 연중 가장 따뜻한 달의 평균기온마저 0℃ 미만으로, 온통 눈과 대륙 빙하로 덮여 어떤 식물도 자라지 못하는 영구 동토의 무수목 극지 기후입니다.";
    }

    // Set texts
    circPressureBelt.textContent = belt;
    circAirFlow.textContent = flow;
    circWind.textContent = wind;
    circWaterStatus.textContent = status;
    circBiomeDesc.innerHTML = desc;

    // Set gauges
    gaugePrecip.style.width = `${precip}%`;
    gaugeEvap.style.width = `${evap}%`;

    // Set biome SVG
    circBiomeSvg.innerHTML = microBiomeSvgs[biomeKey];
  }

  function getLatitudeZoneName(lat) {
    if (lat < 10) return "적도";
    if (lat < 23.5) return "열대 회귀선대";
    if (lat < 35) return "아열대 중위도";
    if (lat < 60) return "온대 중위도";
    if (lat < 70) return "한대 고위도";
    return "극지대";
  }

  latSlider.addEventListener('input', updateCirculation);
  // Trigger once initially
  updateCirculation();


  // ==========================================
  // 5. PART 3 - KÖPPEN CLIMATE CLASSIFIER
  // ==========================================
  const valTempColdest = document.getElementById('val-temp-coldest');
  const valTempWarmest = document.getElementById('val-temp-warmest');
  const valPrecipAnn = document.getElementById('val-precip-ann');
  const valPrecipDry = document.getElementById('val-precip-dry');
  const valAltitude = document.getElementById('val-altitude');
  const dispTempColdest = document.getElementById('disp-temp-coldest');
  const dispTempWarmest = document.getElementById('disp-temp-warmest');
  const dispPrecipAnn = document.getElementById('disp-precip-ann');
  const dispPrecipDry = document.getElementById('disp-precip-dry');
  const dispAltitude = document.getElementById('disp-altitude');
  
  const resultCode = document.getElementById('result-code');
  const resultName = document.getElementById('result-name');
  const resultGroupTag = document.getElementById('result-group-tag');
  const diagnosisSteps = document.getElementById('diagnosis-steps');
  const biomeSvg = document.getElementById('biome-svg');

  // Interactive Reference Card Logic
  const flipCards = document.querySelectorAll('.flip-card');
  flipCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Toggle flipped state on click
      card.classList.toggle('flipped');
    });
  });

  // Biome Renderers in SVG
  const biomeRenderers = {
    Af: () => `
      <rect width="100%" height="100%" fill="#0a1a15"/>
      <!-- Background trees -->
      <path d="M-10,200 L40,100 L90,200 Z" fill="#044e39" opacity="0.6"/>
      <path d="M30,200 L90,80 L150,200 Z" fill="#055e45" opacity="0.6"/>
      <path d="M110,200 L180,90 L250,200 Z" fill="#044e39" opacity="0.5"/>
      <path d="M220,200 L290,70 L360,200 Z" fill="#055e45" opacity="0.6"/>
      
      <!-- Foreground Rain -->
      <line x1="20" y1="20" x2="10" y2="60" stroke="#00f0ff" stroke-width="1.5" opacity="0.4"/>
      <line x1="120" y1="30" x2="110" y2="70" stroke="#00f0ff" stroke-width="1.5" opacity="0.4"/>
      <line x1="240" y1="15" x2="230" y2="55" stroke="#00f0ff" stroke-width="1.5" opacity="0.4"/>
      <line x1="330" y1="40" x2="320" y2="80" stroke="#00f0ff" stroke-width="1.5" opacity="0.4"/>
      <line x1="80" y1="10" x2="70" y2="50" stroke="#00f0ff" stroke-width="1.5" opacity="0.3"/>
      
      <!-- Lush broad leaves -->
      <path d="M380,200 C320,130 250,150 200,200 Z" fill="#059669"/>
      <path d="M20,200 C70,120 120,140 180,200 Z" fill="#10b981"/>
      <path d="M100,200 C150,110 230,120 280,200 Z" fill="#047857"/>

      <circle cx="210" cy="160" r="3" fill="#fb7185"/> <!-- Orchid flower -->
      <path d="M207,160 Q210,152 213,160" stroke="#fb7185" stroke-width="2" fill="none"/>
      <circle cx="80" cy="170" r="3.5" fill="#facc15"/>
    `,
    Am: () => `
      <rect width="100%" height="100%" fill="#0a1a1c"/>
      <!-- Monsoon rainclouds -->
      <path d="M20,30 Q40,15 70,25 Q100,10 130,28 Q180,15 220,35 Q270,20 320,38 Q360,25 390,45 L400,200 L0,200 Z" fill="#1e293b" opacity="0.6"/>
      <!-- Monsoon heavy rain -->
      <line x1="50" y1="50" x2="30" y2="130" stroke="#00f0ff" stroke-width="2" opacity="0.6"/>
      <line x1="160" y1="60" x2="140" y2="140" stroke="#00f0ff" stroke-width="2" opacity="0.6"/>
      <line x1="280" y1="55" x2="260" y2="135" stroke="#00f0ff" stroke-width="2" opacity="0.6"/>
      <!-- Monsoon deciduous trees -->
      <rect x="90" y="130" width="8" height="70" fill="#451a03"/>
      <path d="M60,130 Q94,80 128,130 Z" fill="#065f46"/>
      
      <rect x="280" y="120" width="10" height="80" fill="#451a03"/>
      <path d="M240,120 Q285,60 330,120 Z" fill="#15803d"/>
      <!-- Deciduous falling leaf -->
      <path d="M190,140 C185,150 195,155 190,165" stroke="#a3e635" stroke-width="1.5" fill="none"/>
    `,
    Aw: () => `
      <rect width="100%" height="100%" fill="#1f1505"/>
      <!-- Glowing Savanna Sun -->
      <circle cx="300" cy="50" r="24" fill="#ea580c" opacity="0.8"/>
      <circle cx="300" cy="50" r="18" fill="#f59e0b"/>
      
      <!-- Distant flat mountains -->
      <path d="M0,160 L80,130 L160,160 Z" fill="#451a03" opacity="0.4"/>
      <path d="M120,160 L200,125 L280,160 Z" fill="#451a03" opacity="0.4"/>

      <!-- Flat-topped Acacia tree -->
      <path d="M80,160 L80,105 Q70,95 60,95 L60,90 Q80,90 80,100 L84,100 Q88,88 100,90 L100,95 Q90,95 84,105 L84,160 Z" fill="#78350f"/>
      <ellipse cx="80" cy="85" rx="35" ry="7" fill="#1e3a1e"/>
      <ellipse cx="60" cy="90" rx="15" ry="4.5" fill="#14532d"/>
      <ellipse cx="100" cy="88" rx="18" ry="5" fill="#14532d"/>

      <!-- Baobab Tree outline -->
      <path d="M240,160 L242,110 Q235,90 220,80 L225,75 Q240,88 245,100 L248,100 Q252,85 270,75 L273,80 Q258,92 250,110 L252,160 Z" fill="#5c2e0b"/>
      <circle cx="225" cy="72" r="12" fill="#14532d"/>
      <circle cx="270" cy="75" r="14" fill="#1e3a1e"/>
      <circle cx="248" cy="92" r="8" fill="#14532d"/>

      <!-- Tall yellow grass -->
      <path d="M10,160 L14,120 L18,160 M25,160 L32,110 L38,160 M150,160 L158,115 L164,160 M340,160 L345,125 L352,160" stroke="#ca8a04" stroke-width="2"/>
      <rect y="160" width="100%" height="40" fill="#2d1a04"/>
    `,
    BW: () => `
      <rect width="100%" height="100%" fill="#2c1404"/>
      <!-- Scorching Sun -->
      <circle cx="200" cy="50" r="30" fill="#ff3300" opacity="0.3" filter="blur(4px)"/>
      <circle cx="200" cy="50" r="16" fill="#facc15"/>
      
      <!-- Sand Dunes -->
      <path d="M0,140 Q100,110 220,150 T400,120 L400,200 L0,200 Z" fill="#d97706"/>
      <path d="M0,170 Q140,145 280,175 T400,160 L400,200 L0,200 Z" fill="#b45309"/>
      
      <!-- Cacti -->
      <rect x="70" y="100" width="10" height="60" rx="5" fill="#166534"/>
      <path d="M55,115 H72 V125 H55 Z" fill="#166534"/>
      <rect x="52" y="105" width="6" height="15" rx="3" fill="#166534"/>
      <path d="M78,110 H73 V120 H78 Z" fill="#166534"/>
      <rect x="76" y="98" width="6" height="15" rx="3" fill="#166534"/>

      <!-- Small desert stone -->
      <path d="M290,175 Q305,160 320,175 Z" fill="#451a03"/>
    `,
    BS: () => `
      <rect width="100%" height="100%" fill="#1a1c12"/>
      <!-- Flat steppe horizon -->
      <path d="M0,150 Q200,140 400,150 L400,200 L0,200 Z" fill="#585123"/>
      
      <!-- Short sparse grass clusters -->
      <path d="M30,150 L32,135 L35,150 M45,150 L48,138 L51,150 M120,148 L125,130 L130,148 M250,152 L254,135 L258,152" stroke="#a3e635" stroke-width="2"/>
      <path d="M80,170 L83,150 L87,170 M180,175 L184,152 L189,175 M310,168 L314,146 L320,168" stroke="#854d0e" stroke-width="1.8"/>

      <!-- Steppe Dry bush -->
      <circle cx="210" cy="145" r="8" fill="none" stroke="#78350f" stroke-width="1.5" stroke-dasharray="2,2"/>
      <circle cx="340" cy="148" r="7" fill="none" stroke="#78350f" stroke-width="1.5" stroke-dasharray="2,2"/>
    `,
    Cfa: () => `
      <rect width="100%" height="100%" fill="#0a1a2e"/>
      <!-- Mild glowing sun -->
      <circle cx="80" cy="40" r="16" fill="#fef08a" opacity="0.6"/>
      
      <!-- Soft hills -->
      <path d="M0,140 Q130,105 250,145 T400,130 L400,200 L0,200 Z" fill="#065f46"/>
      
      <!-- Dense mixed trees -->
      <rect x="60" y="110" width="6" height="50" fill="#451a03"/>
      <circle cx="63" cy="95" r="22" fill="#15803d"/>
      
      <rect x="220" y="100" width="7" height="60" fill="#451a03"/>
      <circle cx="223" cy="85" r="26" fill="#166534"/>
      
      <rect x="310" y="115" width="5" height="40" fill="#451a03"/>
      <circle cx="312" cy="102" r="18" fill="#15803d"/>

      <!-- Camellia flowers (red dots) -->
      <circle cx="50" cy="95" r="2" fill="#ef4444"/>
      <circle cx="70" cy="85" r="2" fill="#ef4444"/>
      <circle cx="210" cy="80" r="2.5" fill="#ef4444"/>
      <circle cx="235" cy="72" r="2.5" fill="#ef4444"/>
    `,
    Cfb: () => `
      <rect width="100%" height="100%" fill="#0f1b29"/>
      <!-- Mist / clouds -->
      <path d="M0,40 Q100,20 200,35 T400,30 L400,100 L0,100 Z" fill="#334155" opacity="0.3"/>
      
      <!-- Green rolling hills of UK/Europe -->
      <path d="M0,130 Q100,110 230,145 T400,120 L400,200 L0,200 Z" fill="#047857"/>
      <path d="M0,155 Q150,135 300,165 T400,150 L400,200 L0,200 Z" fill="#065f46"/>
      
      <!-- Broadleaf oak trees -->
      <rect x="140" y="110" width="8" height="50" fill="#451a03"/>
      <ellipse cx="144" cy="88" rx="25" ry="18" fill="#166534"/>
      
      <rect x="280" y="120" width="6" height="50" fill="#451a03"/>
      <ellipse cx="283" cy="100" rx="20" ry="15" fill="#15803d"/>

      <!-- Sheep silhouettes -->
      <ellipse cx="80" cy="140" rx="7" ry="5" fill="#e2e8f0"/>
      <circle cx="74" cy="138" r="3.5" fill="#cbd5e1"/>
      
      <ellipse cx="340" cy="145" rx="6" ry="4" fill="#e2e8f0"/>
      <circle cx="335" cy="143" r="3" fill="#cbd5e1"/>
    `,
    Cs: () => `
      <rect width="100%" height="100%" fill="#20160a"/>
      <!-- Golden Mediterranean Sky -->
      <circle cx="320" cy="45" r="22" fill="#eab308" opacity="0.8"/>
      
      <!-- Olive tree and dry ground -->
      <path d="M0,150 Q200,138 400,150 L400,200 L0,200 Z" fill="#653b08"/>
      
      <!-- Olive tree (gnarled trunk, silver-green leaves) -->
      <path d="M120,150 L121,120 Q112,112 105,115 L108,110 Q118,110 123,118 L124,150 Z" fill="#451a03"/>
      <ellipse cx="105" cy="100" rx="16" ry="10" fill="#3f6212"/>
      <ellipse cx="125" cy="98" rx="20" ry="12" fill="#4d7c0f"/>
      <ellipse cx="140" cy="106" rx="14" ry="9" fill="#3f6212"/>
      
      <!-- Cypress Trees (tall, thin) -->
      <path d="M260,150 L270,75 L280,150 Z" fill="#14532d"/>
      <path d="M295,150 L303,85 L311,150 Z" fill="#166534"/>
    `,
    Cw: () => `
      <rect width="100%" height="100%" fill="#1a1610"/>
      <!-- Dry winter sun -->
      <circle cx="100" cy="50" r="14" fill="#ea580c" opacity="0.4"/>
      
      <!-- Brown hills -->
      <path d="M0,145 Q150,120 280,150 T400,140 L400,200 L0,200 Z" fill="#5c3d0b"/>
      
      <!-- Autumn-colored or drying trees -->
      <rect x="180" y="110" width="7" height="50" fill="#451a03"/>
      <circle cx="183" cy="92" r="22" fill="#a16207"/>
      
      <rect x="270" y="115" width="5" height="45" fill="#451a03"/>
      <circle cx="272" cy="100" r="18" fill="#854d0e"/>

      <!-- Dry reeds -->
      <path d="M40,150 L44,115 M48,150 L53,120 M56,150 L60,118" stroke="#a16207" stroke-width="1.5"/>
    `,
    Df: () => `
      <rect width="100%" height="100%" fill="#06121e"/>
      <!-- Soft auroral glow in night sky -->
      <path d="M50,40 Q150,10 250,30 T380,20" fill="none" stroke="#10b981" stroke-width="6" opacity="0.15" filter="blur(6px)"/>
      
      <!-- Taiga Coniferous forest -->
      <path d="M-10,200 L30,100 L70,200 Z" fill="#064e3b"/>
      <path d="M40,200 L95,80 L150,200 Z" fill="#0f4c3a"/>
      <path d="M120,200 L180,95 L240,200 Z" fill="#064e3b"/>
      <path d="M210,200 L275,75 L340,200 Z" fill="#0f4c3a"/>
      <path d="M300,200 L360,110 L420,200 Z" fill="#064e3b"/>
      
      <!-- Snow on ground patches -->
      <path d="M0,185 Q100,175 220,188 T400,180 L400,200 L0,200 Z" fill="#f8fafc" opacity="0.75"/>
    `,
    Dw: () => `
      <rect width="100%" height="100%" fill="#090f19"/>
      <!-- Cold winter moon -->
      <circle cx="320" cy="40" r="12" fill="#cbd5e1" opacity="0.8"/>
      
      <!-- Frozen ground -->
      <path d="M0,155 L400,155 L400,200 L0,200 Z" fill="#334155"/>
      <path d="M0,170 Q150,150 400,175 L400,200 L0,200 Z" fill="#e2e8f0" opacity="0.9"/>
      
      <!-- Bare trees / dry pines (frozen winter) -->
      <!-- Pine trunks with no leaves -->
      <line x1="80" y1="155" x2="80" y2="80" stroke="#1e293b" stroke-width="3"/>
      <line x1="80" y1="120" x2="65" y2="105" stroke="#1e293b" stroke-width="2"/>
      <line x1="80" y1="110" x2="95" y2="95" stroke="#1e293b" stroke-width="2"/>
      
      <line x1="220" y1="155" x2="220" y2="70" stroke="#1e293b" stroke-width="4"/>
      <line x1="220" y1="105" x2="195" y2="85" stroke="#1e293b" stroke-width="2.5"/>
      <line x1="220" y1="115" x2="245" y2="95" stroke="#1e293b" stroke-width="2.5"/>
      
      <!-- Larch / Pine silhouettes -->
      <path d="M120,155 L145,100 L170,155 Z" fill="#1e293b" opacity="0.5"/>
      <path d="M280,155 L310,95 L340,155 Z" fill="#1e293b" opacity="0.6"/>
    `,
    ET: () => `
      <rect width="100%" height="100%" fill="#070c14"/>
      <!-- Icy water & tundra ground -->
      <path d="M0,150 Q130,135 260,155 T400,145 L400,200 L0,200 Z" fill="#334155"/>
      <!-- Glacial snow fields -->
      <path d="M0,170 Q100,150 220,175 T400,165 L400,200 L0,200 Z" fill="#cbd5e1" opacity="0.7"/>
      
      <!-- Moss patches (red/green flat ellipses) -->
      <ellipse cx="70" cy="165" rx="20" ry="4" fill="#854d0e"/>
      <ellipse cx="70" cy="165" rx="14" ry="2.5" fill="#3f6212"/>
      
      <ellipse cx="290" cy="178" rx="35" ry="6" fill="#78350f"/>
      <ellipse cx="290" cy="178" rx="24" ry="4" fill="#4d7c0f"/>

      <!-- Low-lying cold rocks -->
      <path d="M150,170 Q162,158 175,170 Z" fill="#475569"/>
      <path d="M168,172 Q175,165 182,172 Z" fill="#64748b"/>
    `,
    EF: () => `
      <rect width="100%" height="100%" fill="#02050b"/>
      <!-- Polar Stars -->
      <circle cx="80" cy="20" r="1" fill="#ffffff" opacity="0.8"/>
      <circle cx="170" cy="35" r="1" fill="#ffffff" opacity="0.9"/>
      <circle cx="280" cy="15" r="1" fill="#ffffff" opacity="0.7"/>
      <circle cx="340" cy="45" r="1.2" fill="#ffffff" opacity="0.8"/>

      <!-- Massive white glaciers / icecap -->
      <path d="M0,140 L120,110 L280,135 L400,120 L400,200 L0,200 Z" fill="#f1f5f9"/>
      <path d="M80,120 L150,150 L0,150 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.5"/>
      <path d="M220,130 L290,160 L180,160 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.5"/>
      
      <!-- Snow falling -->
      <circle cx="60" cy="50" r="1.5" fill="#ffffff" opacity="0.8"/>
      <circle cx="190" cy="70" r="2" fill="#ffffff" opacity="0.9"/>
      <circle cx="250" cy="40" r="1.5" fill="#ffffff" opacity="0.7"/>
      <circle cx="310" cy="80" r="1" fill="#ffffff" opacity="0.5"/>
      <circle cx="120" cy="90" r="2.2" fill="#ffffff" opacity="0.8"/>
    `,
    H: () => `
      <rect width="100%" height="100%" fill="#0b172a"/>
      <!-- High Mountains with vertical zones -->
      <path d="M50,200 L180,50 L310,200 Z" fill="#1e293b"/>
      <path d="M180,200 L280,30 L380,200 Z" fill="#0f172a"/>
      <path d="M-20,200 L80,70 L180,200 Z" fill="#0f172a"/>

      <!-- Snow capped peaks (White tops) -->
      <path d="M163,70 L180,50 L197,70 L188,65 L180,72 L172,65 Z" fill="#ffffff"/>
      <path d="M263,55 L280,30 L297,55 L288,50 L280,57 L272,50 Z" fill="#ffffff"/>
      <path d="M67,90 L80,70 L93,90 L87,85 L80,92 L73,85 Z" fill="#ffffff"/>

      <!-- Clouds wrapping mountains -->
      <ellipse cx="140" cy="110" rx="35" ry="8" fill="#e2e8f0" opacity="0.4"/>
      <ellipse cx="240" cy="90" rx="45" ry="10" fill="#e2e8f0" opacity="0.3"/>

      <!-- Forest at the mountain base -->
      <path d="M10,200 L25,160 L40,200 Z" fill="#064e3b"/>
      <path d="M30,200 L42,165 L54,200 Z" fill="#0f4c3a"/>
      <path d="M340,200 L355,160 L370,200 Z" fill="#064e3b"/>
    `
  };

  function updateKoppenClassifier() {
    // 1. Gather slider inputs
    const tMin = parseFloat(valTempColdest.value);
    const tMax = parseFloat(valTempWarmest.value);
    const pAnn = parseInt(valPrecipAnn.value);
    const pDry = parseInt(valPrecipDry.value);
    const alt = parseInt(valAltitude.value);
    const seasonality = document.querySelector('input[name="val-seasonality"]:checked').value;

    // Update DOM labels
    dispTempColdest.textContent = `${tMin.toFixed(1)} °C`;
    dispTempWarmest.textContent = `${tMax.toFixed(1)} °C`;
    dispPrecipAnn.textContent = `${pAnn} mm`;
    dispPrecipDry.textContent = `${pDry} mm`;
    dispAltitude.textContent = `${alt} m`;

    // 2. Logic Steps list tracker
    let steps = [];
    let activeNodes = ['node-root'];
    let activeLines = [];

    let code = "";
    let name = "";
    let group = "";
    let desc = "";

    // Math/Logical derivation:
    // H Climate check first
    if (alt >= 2000) {
      code = "H";
      name = "고산 기후 (Highland)";
      group = "특수 기후 / 고산 지대";
      steps.push(`고도 검출: ${alt}m ➔ 해발 2,000m 이상의 고산 지대로 분류`);
      steps.push(`기온 하강 매커니즘: 고도 상승으로 기온 감률 작동, 상춘 기후대 형성`);
      activeNodes.push('node-group-H');
      activeLines.push('line-root-H');
      // Show H line connection
      document.getElementById('line-root-H').style.display = 'block';
    } 
    else {
      // Hide H connection line if not H
      document.getElementById('line-root-H').style.display = 'none';

      // Estimate average temperature
      const tAvg = (tMin + tMax) / 2;

      // Calculate Dryness Threshold (R_th)
      let rTh = 0;
      if (seasonality === 'w') {
        rTh = 20 * tAvg + 280;
        steps.push(`강수 형태: 겨울 건조형 (w) ➔ 건조 한계값 공식: 20 × T_avg + 280`);
      } else if (seasonality === 's') {
        rTh = 20 * tAvg;
        steps.push(`강수 형태: 여름 건조형 (s) ➔ 건조 한계값 공식: 20 × T_avg`);
      } else {
        rTh = 20 * tAvg + 140;
        steps.push(`강수 형태: 연중 균등형 (f) ➔ 건조 한계값 공식: 20 × T_avg + 140`);
      }
      rTh = Math.max(0, rTh); // Clamp to positive
      steps.push(`평균 기온: ${tAvg.toFixed(1)}℃ ➔ 산출 건조 한계치: ${rTh.toFixed(1)}mm`);

      // Check classification
      
      // E (Polar) check
      if (tMax < 10) {
        steps.push(`식생 여부: 최난월 기온 ${tMax.toFixed(1)}℃ < 10℃ ➔ 무수목 기후 판정 (한대)`);
        activeNodes.push('node-notree', 'node-group-E');
        activeLines.push('line-root-notree', 'line-notree-E');

        if (tMax < 0) {
          code = "EF";
          name = "빙설 기후 (Ice Cap)";
          group = "무수목 기후 / 한대 기후";
          steps.push(`상세 구분: 최난월 기온 ${tMax.toFixed(1)}℃ < 0℃ ➔ 연중 만년설 피복`);
        } else {
          code = "ET";
          name = "툰드라 기후 (Tundra)";
          group = "무수목 기후 / 한대 기후";
          steps.push(`상세 구분: 최난월 기온 0℃ ~ 10℃ ➔ 이끼/지의류 생장 툰드라`);
        }
      }
      // B (Arid) check
      else if (pAnn < rTh) {
        steps.push(`식생 여부: 연간 강수량 ${pAnn}mm < 건조 한계값 ${rTh.toFixed(1)}mm ➔ 무수목 기후 판정 (건조)`);
        activeNodes.push('node-notree', 'node-group-B');
        activeLines.push('line-root-notree', 'line-notree-B');

        if (pAnn < rTh / 2) {
          code = "BW";
          name = "사막 기후 (Desert)";
          group = "무수목 기후 / 건조 기후";
          steps.push(`상세 구분: 강수량 ${pAnn}mm < 한계 반값 ${(rTh/2).toFixed(1)}mm ➔ 극대 사막화`);
        } else {
          code = "BS";
          name = "스텝 기후 (Steppe)";
          group = "무수목 기후 / 건조 기후";
          steps.push(`상세 구분: 강수량 ${pAnn}mm ≥ 한계 반값 ${(rTh/2).toFixed(1)}mm ➔ 초원 형성`);
        }
      }
      // Tree Climates (A, C, D)
      else {
        steps.push(`식생 여부: 최난월 기온 ${tMax.toFixed(1)}℃ ≥ 10℃ 및 강수량 충분 ➔ 수목 기후 판정`);
        activeNodes.push('node-tree');
        activeLines.push('line-root-tree');

        // A (Tropical)
        if (tMin >= 18) {
          steps.push(`기후대 구분: 최한월 기온 ${tMin.toFixed(1)}℃ ≥ 18℃ ➔ 열대 기후대 [A]`);
          activeNodes.push('node-group-A');
          activeLines.push('line-tree-A');

          if (pDry >= 60) {
            code = "Af";
            name = "열대 우림 기후 (Tropical Rainforest)";
            group = "수목 기후 / 열대 기후";
            steps.push(`상세 분류: 최건월 강수량 ${pDry}mm ≥ 60mm ➔ 연중 다우 열대우림`);
          } else {
            // Check monsoonal constraint
            const amThreshold = 100 - (pAnn / 25);
            steps.push(`몬순 판정식: 100 - (연강수량 / 25) = ${amThreshold.toFixed(1)}mm`);
            
            if (pDry >= amThreshold) {
              code = "Am";
              name = "열대 계절풍 기후 (Tropical Monsoon)";
              group = "수목 기후 / 열대 기후";
              steps.push(`상세 분류: 최건월 강수량 ${pDry}mm ≥ 몬순 판정선 ➔ 열대 몬순 수목 형성`);
            } else {
              code = "Aw";
              name = "사바나 기후 (Tropical Savanna)";
              group = "수목 기후 / 열대 기후";
              steps.push(`상세 분류: 최건월 강수량 ${pDry}mm < 몬순 판정선 ➔ 겨울 건기 사바나 초원`);
            }
          }
        }
        // C (Temperate)
        else if (tMin >= -3 && tMin < 18) {
          steps.push(`기후대 구분: 최한월 기온 -3℃ ~ 18℃ ➔ 온대 기후대 [C]`);
          activeNodes.push('node-group-C');
          activeLines.push('line-tree-C');

          if (seasonality === 's') {
            code = "Cs";
            name = "지중해성 기후 (Mediterranean)";
            group = "수목 기후 / 온대 기후";
            steps.push(`상세 분류: 여름철 건조 우세 ➔ 지중해성(Cs) 올리브 등 경엽수림`);
          } else if (seasonality === 'w') {
            code = "Cw";
            name = "온대 겨울 건조 기후 (Dry Winter Temperate)";
            group = "수목 기후 / 온대 기후";
            steps.push(`상세 분류: 겨울철 건조 우세 ➔ 온대 겨울건조(Cw) 벼농사 특화`);
          } else {
            // f: cf. check warmest month temp for cfa/cfb
            if (tMax >= 22) {
              code = "Cfa";
              name = "온난 습윤 기후 (Humid Subtropical)";
              group = "수목 기후 / 온대 기후";
              steps.push(`상세 분류: 연중 습윤(f) 및 최난월 기온 ${tMax.toFixed(1)}℃ ≥ 22℃ ➔ 온난습윤(Cfa)`);
            } else {
              code = "Cfb";
              name = "서안 해양성 기후 (Marine West Coast)";
              group = "수목 기후 / 온대 기후";
              steps.push(`상세 분류: 연중 습윤(f) 및 최난월 기온 ${tMax.toFixed(1)}℃ < 22℃ ➔ 서안해양성(Cfb)`);
            }
          }
        }
        // D (Cold / Continental)
        else {
          steps.push(`기후대 구분: 최한월 기온 ${tMin.toFixed(1)}℃ < -3℃ ➔ 냉대 기후대 [D]`);
          activeNodes.push('node-group-D');
          activeLines.push('line-tree-D');

          if (seasonality === 'w') {
            code = "Dw";
            name = "냉대 겨울 건조 기후 (Dry Winter Continental)";
            group = "수목 기후 / 냉대 기후";
            steps.push(`상세 분류: 시베리아 고기압 영향 겨울 건조(Dw) ➔ 대륙성 혹한 타이가`);
          } else {
            code = "Df";
            name = "냉대 습윤 기후 (Humid Continental)";
            group = "수목 기후 / 냉대 기후";
            steps.push(`상세 분류: 연중 습윤(Df) ➔ 연중 습윤한 침엽수림 타이가 발달`);
          }
        }
      }
    }

    // 3. Update Result Card DOM
    resultCode.textContent = code;
    resultName.textContent = name;
    resultGroupTag.textContent = group;

    // Update diagnosis steps HTML
    diagnosisSteps.innerHTML = steps.map(step => `<li>${step}</li>`).join('');

    // 4. Update Decision Tree Visualizer Highlights
    updateTreeVisualization(activeNodes, activeLines);

    // 5. Draw Biome SVG
    if (biomeRenderers[code]) {
      biomeSvg.innerHTML = biomeRenderers[code]();
    }
  }

  function updateTreeVisualization(activeNodes, activeLines) {
    // Clear previous active highlights
    const rects = document.querySelectorAll('.tree-node-rect');
    const texts = document.querySelectorAll('.tree-node-text');
    const lines = document.querySelectorAll('.tree-line');

    rects.forEach(rect => rect.classList.remove('active-node'));
    texts.forEach(text => text.classList.remove('active-node-text'));
    lines.forEach(line => line.classList.remove('active-line'));

    // Highlight active nodes
    activeNodes.forEach(id => {
      const nodeRect = document.getElementById(id);
      if (nodeRect) {
        nodeRect.classList.add('active-node');
        // Find text sibling
        const textElement = nodeRect.nextElementSibling;
        if (textElement && textElement.tagName === 'text') {
          textElement.classList.add('active-node-text');
        }
      }
    });

    // Highlight active lines
    activeLines.forEach(id => {
      const lineElement = document.getElementById(id);
      if (lineElement) {
        lineElement.classList.add('active-line');
      }
    });
  }

  // Hook up event listeners for inputs
  [valTempColdest, valTempWarmest, valPrecipAnn, valPrecipDry, valAltitude].forEach(slider => {
    slider.addEventListener('input', () => {
      // Warmest temp cannot be lower than coldest temp
      if (slider === valTempColdest) {
        const cVal = parseFloat(valTempColdest.value);
        const wVal = parseFloat(valTempWarmest.value);
        if (cVal > wVal) {
          valTempWarmest.value = cVal;
        }
      }
      if (slider === valTempWarmest) {
        const cVal = parseFloat(valTempColdest.value);
        const wVal = parseFloat(valTempWarmest.value);
        if (wVal < cVal) {
          valTempColdest.value = wVal;
        }
      }
      // Driest month precip cannot be higher than annual precip divided by 12 (approx) or let's clamp it reasonably
      const maxDriest = Math.min(300, parseInt(valPrecipAnn.value) / 4);
      valPrecipDry.max = Math.ceil(maxDriest);
      if (parseInt(valPrecipDry.value) > maxDriest) {
        valPrecipDry.value = Math.floor(maxDriest);
      }

      updateKoppenClassifier();
    });
  });

  // Radio button change listener
  document.querySelectorAll('input[name="val-seasonality"]').forEach(radio => {
    radio.addEventListener('change', updateKoppenClassifier);
  });

  // Run once initially to populate classifier
  updateKoppenClassifier();

});
