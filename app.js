// Application data and configuration
const appData = {
  controlPoints: [
    { code: "HYW", name: "Heung Yuen Wai", type: "Road", hours: "7:00 AM - 10:00 PM", description: "Newest control point, opened in 2023", status: "operational" },
    { code: "HZM", name: "Hong Kong-Zhuhai-Macao Bridge", type: "Road", hours: "24 hours", description: "Connects to western Pearl River Delta", status: "operational" },
    { code: "LMC", name: "Lok Ma Chau", type: "Road", hours: "24 hours", description: "For vehicles and buses", status: "operational" },
    { code: "LSC", name: "Lok Ma Chau Spur Line", type: "Rail", hours: "6:30 AM - 10:30 PM", description: "High passenger volume rail crossing", status: "operational" },
    { code: "LWS", name: "Lo Wu", type: "Rail", hours: "6:30 AM - 12:00 AM", description: "Major rail crossing, most popular border point", status: "operational" },
    { code: "MKT", name: "Man Kam To", type: "Road", hours: "7:00 AM - 10:00 PM", description: "Shorter waiting times typically", status: "operational" },
    { code: "SBC", name: "Shenzhen Bay", type: "Road", hours: "6:30 AM - 12:00 AM (passenger), 24 hours (goods)", description: "One of the busiest control points", status: "operational" },
    { code: "STK", name: "Sha Tau Kok", type: "Road", hours: "Suspended", description: "Currently suspended until further notice", status: "suspended" }
  ],
  statusCodes: {
    "0": { resident: "Normal (Generally less than 15 mins)", visitor: "Normal (Generally less than 30 mins)", color: "green", level: "Normal" },
    "1": { resident: "Busy (Generally less than 30 mins)", visitor: "Busy (Generally less than 45 mins)", color: "yellow", level: "Busy" },
    "2": { resident: "Very Busy (Generally 30 mins or above)", visitor: "Very Busy (Generally 45 mins or above)", color: "red", level: "Very Busy" },
    "4": { resident: "System Under Maintenance", visitor: "System Under Maintenance", color: "gray", level: "Maintenance" },
    "99": { resident: "Non Service Hours", visitor: "Non Service Hours", color: "gray", level: "Closed" }
  },
  apiEndpoints: {
    resident: "https://secure1.info.gov.hk/immd/mobileapps/2bb9ae17/data/CPQueueTimeR.json",
    visitor: "https://secure1.info.gov.hk/immd/mobileapps/2bb9ae17/data/CPQueueTimeV.json"
  },
  popularCrossings: ["LWS", "LSC", "SBC"]
};

// Application state
let currentView = 'resident';
let currentTypeFilter = 'all';
let currentSort = 'name';
let currentData = null;
let refreshInterval = null;
let countdownInterval = null;
let secondsUntilRefresh = 900; // 15 minutes in seconds

// DOM elements
const elements = {
  lastUpdateTime: document.getElementById('last-update-time'),
  refreshBtn: document.getElementById('refresh-btn'),
  refreshIcon: document.getElementById('refresh-icon'),
  countdown: document.getElementById('countdown'),
  themeToggle: document.getElementById('theme-toggle'),
  themeIcon: document.getElementById('theme-icon'),
  viewSelect: document.getElementById('view-select'),
  typeFilter: document.getElementById('type-filter'),
  sortSelect: document.getElementById('sort-select'),
  controlPointsGrid: document.getElementById('control-points-grid'),
  loadingIndicator: document.getElementById('loading-indicator'),
  totalOpen: document.getElementById('total-open'),
  normalCount: document.getElementById('normal-count'),
  busyCount: document.getElementById('busy-count'),
  veryBusyCount: document.getElementById('very-busy-count')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  setupEventListeners();
  setupTheme();
  fetchData();
  startAutoRefresh();
}

function setupEventListeners() {
  elements.refreshBtn.addEventListener('click', handleRefresh);
  elements.themeToggle.addEventListener('click', toggleTheme);
  elements.viewSelect.addEventListener('change', handleViewChange);
  elements.typeFilter.addEventListener('change', handleTypeFilterChange);
  elements.sortSelect.addEventListener('change', handleSortChange);
}

function setupTheme() {
  // Check for saved theme preference or default to 'light'
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-color-scheme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-color-scheme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-color-scheme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  elements.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

async function fetchData() {
  showLoading(true);
  try {
    // Try to fetch from both endpoints
    const [residentResponse, visitorResponse] = await Promise.allSettled([
      fetch(appData.apiEndpoints.resident),
      fetch(appData.apiEndpoints.visitor)
    ]);
    let residentData = null;
    let visitorData = null;

    // Handle resident data
    if (residentResponse.status === 'fulfilled' && residentResponse.value.ok) {
      residentData = await residentResponse.value.json();
    }
    // Handle visitor data
    if (visitorResponse.status === 'fulfilled' && visitorResponse.value.ok) {
      visitorData = await visitorResponse.value.json();
    }

    // If both failed, show error and stop
    if (!residentData && !visitorData) {
      showError('Unable to load real-time data. Please try again later.');
      currentData = null;
      updateUI();
      return;
    }

    // Use whatever data is available
    currentData = { resident: residentData, visitor: visitorData };
    updateLastUpdateTime();
    updateUI();
  } catch (error) {
    showError('Unable to load real-time data. Please try again later.');
    currentData = null;
    updateUI();
  } finally {
    showLoading(false);
  }
}

function showLoading(isLoading) {
  if (elements.loadingIndicator) {
    elements.loadingIndicator.style.display = isLoading ? 'block' : 'none';
  }
}

function showError(message) {
  if (elements.controlPointsGrid) {
    elements.controlPointsGrid.innerHTML = `<div class="error-state"><h3>Error</h3><p>${message}</p></div>`;
  }
}

function updateLastUpdateTime() {
  if (!currentData) return;
  const data = currentData[currentView];
  if (!data || !data.LastUpdateTime) return;
  const updateTime = new Date(data.LastUpdateTime);
  elements.lastUpdateTime.textContent = updateTime.toLocaleString();
}

function updateUI() {
  if (!currentData) return;
  updateStats();
  renderControlPoints();
}

function updateStats() {
  const data = currentData[currentView];
  if (!data || !data.ControlPointInfo) return;
  let totalOpen = 0;
  let normalCount = 0;
  let busyCount = 0;
  let veryBusyCount = 0;
  data.ControlPointInfo.forEach(cp => {
    const controlPoint = appData.controlPoints.find(p => p.code === cp.ControlPointCode);
    if (controlPoint && controlPoint.status !== 'suspended') {
      totalOpen++;
      const status = cp.ArrivalStatus || cp.DepartureStatus;
      switch (status) {
        case '0': normalCount++; break;
        case '1': busyCount++; break;
        case '2': veryBusyCount++; break;
      }
    }
  });
  elements.totalOpen.textContent = totalOpen;
  elements.normalCount.textContent = normalCount;
  elements.busyCount.textContent = busyCount;
  elements.veryBusyCount.textContent = veryBusyCount;
}

function renderControlPoints() {
  const data = currentData[currentView];
  if (!data || !data.ControlPointInfo) return;
  let filteredPoints = data.ControlPointInfo.map(cp => {
    const controlPoint = appData.controlPoints.find(p => p.code === cp.ControlPointCode);
    return { ...cp, ...controlPoint };
  });

  // Apply type filter
  if (currentTypeFilter !== 'all') {
    filteredPoints = filteredPoints.filter(cp => cp.type === currentTypeFilter);
  }

  // Apply sorting
  filteredPoints.sort((a, b) => {
    switch (currentSort) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'waiting-time':
        return parseInt(a.ArrivalStatus || '0') - parseInt(b.ArrivalStatus || '0');
      case 'popularity':
        const aPopular = appData.popularCrossings.includes(a.code);
        const bPopular = appData.popularCrossings.includes(b.code);
        return bPopular - aPopular;
      default:
        return 0;
    }
  });

  const html = filteredPoints.map(cp => createControlPointCard(cp)).join('');
  elements.controlPointsGrid.innerHTML = html;
}

function createControlPointCard(controlPoint) {
  const arrivalStatus = controlPoint.ArrivalStatus || '0';
  const departureStatus = controlPoint.DepartureStatus || '0';
  const statusInfo = appData.statusCodes[arrivalStatus] || appData.statusCodes['0'];
  const typeIcon = controlPoint.type === 'Rail' ? '🚇' : '🚗';
  const isPopular = appData.popularCrossings.includes(controlPoint.code);
  const isSuspended = controlPoint.status === 'suspended';
  const statusClass = isSuspended
    ? 'closed'
    : arrivalStatus === '0'
    ? 'normal'
    : arrivalStatus === '1'
    ? 'busy'
    : arrivalStatus === '2'
    ? 'very-busy'
    : 'closed';
  const statusText = isSuspended ? 'Suspended' : statusInfo.level;
  const statusDescription = isSuspended ? 'Currently suspended' : statusInfo[currentView];

  return `
    <div class="control-point-card${isSuspended ? ' suspended' : ''}">
      <div class="control-point-header">
        <div>
          <span class="type-icon">${typeIcon}</span>
          <span class="control-point-name">${controlPoint.name}</span>
          ${isPopular ? '<span title="Popular" class="popular-badge">★</span>' : ''}
        </div>
        <span class="status-indicator ${statusClass}" title="${statusText}"></span>
      </div>
      <div class="control-point-info">
        <div class="hours-info"><strong>Hours:</strong> ${controlPoint.hours}</div>
        <div class="description">${controlPoint.description}</div>
      </div>
      <div class="waiting-times">
        <div class="waiting-time">
          <div class="waiting-time-label">Arrival</div>
          <div class="waiting-time-value">${appData.statusCodes[arrivalStatus][currentView]}</div>
        </div>
        <div class="waiting-time">
          <div class="waiting-time-label">Departure</div>
          <div class="waiting-time-value">${appData.statusCodes[departureStatus][currentView]}</div>
        </div>
      </div>
      <div class="status-text ${statusClass}">${statusDescription}</div>
    </div>
  `;
}

// Refresh and UI controls
function handleRefresh() {
  fetchData();
  resetCountdown();
}

function handleViewChange(e) {
  currentView = e.target.value;
  updateLastUpdateTime();
  updateUI();
}

function handleTypeFilterChange(e) {
  currentTypeFilter = e.target.value;
  updateUI();
}

function handleSortChange(e) {
  currentSort = e.target.value;
  updateUI();
}

// Auto-refresh logic
function startAutoRefresh() {
  if (refreshInterval) clearInterval(refreshInterval);
  if (countdownInterval) clearInterval(countdownInterval);
  secondsUntilRefresh = 900;
  refreshInterval = setInterval(() => {
    fetchData();
    resetCountdown();
  }, 900000); // 15 minutes
  countdownInterval = setInterval(updateCountdown, 1000);
  updateCountdown();
}

function resetCountdown() {
  secondsUntilRefresh = 900;
}

function updateCountdown() {
  if (secondsUntilRefresh > 0) {
    secondsUntilRefresh--;
    elements.countdown.textContent = formatCountdown(secondsUntilRefresh);
  } else {
    elements.countdown.textContent = "Refreshing...";
  }
}

function formatCountdown(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}
