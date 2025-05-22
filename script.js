// Constants
const MAX_DATA_POINTS = 50;
const SIMULATION_INTERVAL = 1000; // 1 second
const API_BASE_URL = 'http://localhost:8080/api';

// Chart globals
let compressionChart;
let timeLabels = [];
let huffmanData = [];
let deltaData = [];
let simulationInterval = null;

// Chart colors
const huffmanColor = '#34a853';
const deltaColor = '#ea4335';

// Initialize Chart.js chart
function initializeChart() {
  const ctx = document.getElementById('compressionChart').getContext('2d');

  compressionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeLabels,
      datasets: [
        {
          label: 'Huffman Compression Ratio',
          data: huffmanData,
          borderColor: huffmanColor,
          backgroundColor: 'rgba(52, 168, 83, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        },
        {
          label: 'Delta Compression Ratio',
          data: deltaData,
          borderColor: deltaColor,
          backgroundColor: 'rgba(234, 67, 53, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: 'Time' }
        },
        y: {
          title: { display: true, text: 'Compression Ratio (%)' },
          min: 0,
          max: 100
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}%`
          }
        }
      }
    }
  });
}

// Backend compression with fallback
async function compressWithHuffman(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/compress/huffman`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: data })
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json = await res.json();
    return {
      originalSize: json.originalSize,
      compressedSize: json.compressedSize,
      compressionRatio: json.compressionRatio
    };
  } catch (err) {
    console.error('Huffman API failed. Using fallback.', err);
    document.getElementById('statusMessage').textContent = 'Backend unavailable, using fallback compression.';
    return fallbackHuffmanEncode(data);
  }
}

async function compressWithDelta(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/compress/delta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: data }) // ✅ Corrected key from "text" to "data"
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json = await res.json();
    return {
      originalSize: json.originalSize,
      compressedSize: json.compressedSize,
      compressionRatio: json.compressionRatio
    };
  } catch (err) {
    console.error('Delta API failed. Using fallback.', err);
    document.getElementById('statusMessage').textContent = 'Backend unavailable, using fallback compression.';
    return fallbackDeltaEncode(data);
  }
}

// Local fallback encoders (randomized simulation)
let lastHuffmanRatio = 50;
let lastDeltaRatio = 60;

function fallbackHuffmanEncode(data) {
  const originalSize = new TextEncoder().encode(data).length;
  lastHuffmanRatio += (Math.random() - 0.5) * 5;
  lastHuffmanRatio = Math.min(60, Math.max(40, lastHuffmanRatio));
  const compressedSize = Math.floor(originalSize * (1 - lastHuffmanRatio / 100));
  return {
    originalSize,
    compressedSize,
    compressionRatio: lastHuffmanRatio
  };
}

function fallbackDeltaEncode(data) {
  const originalSize = new TextEncoder().encode(data).length;
  lastDeltaRatio += (Math.random() - 0.5) * 5;
  lastDeltaRatio = Math.min(70, Math.max(50, lastDeltaRatio));
  const compressedSize = Math.floor(originalSize * (1 - lastDeltaRatio / 100));
  return {
    originalSize,
    compressedSize,
    compressionRatio: lastDeltaRatio
  };
}

// Bytes formatter
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

// Process input data from textarea
async function processData() {
  document.getElementById('statusMessage').textContent = '';
  const input = document.getElementById('inputData').value;
  const originalSize = new TextEncoder().encode(input).length;

  document.getElementById('originalSize').textContent = formatBytes(originalSize);

  if (originalSize === 0) {
    ['huffmanSize', 'huffmanRatio', 'deltaSize', 'deltaRatio'].forEach(id =>
      document.getElementById(id).textContent = id.includes('Ratio') ? 'Ratio: 0%' : '0 Bytes'
    );
    return;
  }

  const huffmanResult = await compressWithHuffman(input);
  const deltaResult = await compressWithDelta(input);

  document.getElementById('huffmanSize').textContent = formatBytes(huffmanResult.compressedSize);
  document.getElementById('huffmanRatio').textContent = `Ratio: ${huffmanResult.compressionRatio.toFixed(2)}%`;

  document.getElementById('deltaSize').textContent = formatBytes(deltaResult.compressedSize);
  document.getElementById('deltaRatio').textContent = `Ratio: ${deltaResult.compressionRatio.toFixed(2)}%`;

  updateChart(huffmanResult.compressionRatio, deltaResult.compressionRatio);
}

// Chart data update
function updateChart(huffmanRatio, deltaRatio) {
  const now = new Date();
  const label = `${now.getHours().toString().padStart(2, '0')}:` +
                `${now.getMinutes().toString().padStart(2, '0')}:` +
                `${now.getSeconds().toString().padStart(2, '0')}`;

  timeLabels.push(label);
  huffmanData.push(huffmanRatio);
  deltaData.push(deltaRatio);

  if (timeLabels.length > MAX_DATA_POINTS) {
    timeLabels.shift();
    huffmanData.shift();
    deltaData.shift();
  }

  compressionChart.update();
}

// Generate random IoT-like data
function generateRandomIoTData() {
  const generators = [
    () => {
      const base = 20 + Math.random() * 5;
      return Array.from({ length: 50 }, () =>
        (base + (Math.random() * 2 - 1)).toFixed(2)).join(',');
    },
    () => {
      const base = 40 + Math.random() * 20;
      return Array.from({ length: 50 }, () =>
        (base + (Math.random() * 5 - 2.5)).toFixed(2)).join(',');
    },
    () => {
      return Array.from({ length: 20 }, () =>
        `sensor_${Math.floor(Math.random() * 1000)}_state_${Math.round(Math.random())};`).join('');
    },
    () => {
      const lat = 37.7749 + (Math.random() * 0.02 - 0.01);
      const lon = -122.4194 + (Math.random() * 0.02 - 0.01);
      return Array.from({ length: 15 }, () =>
        `${(lat + Math.random() * 0.001).toFixed(6)},${(lon + Math.random() * 0.001).toFixed(6)};`).join('');
    }
  ];
  return generators[Math.floor(Math.random() * generators.length)]();
}

// Simulation control
async function runSimulation() {
  const simulated = generateRandomIoTData();
  document.getElementById('inputData').value = simulated;
  await processData();
}

function startSimulation() {
  document.getElementById('startSimulation').disabled = true;
  document.getElementById('stopSimulation').disabled = false;
  runSimulation();
  simulationInterval = setInterval(runSimulation, SIMULATION_INTERVAL);
}

function stopSimulation() {
  document.getElementById('startSimulation').disabled = false;
  document.getElementById('stopSimulation').disabled = true;
  clearInterval(simulationInterval);
  document.getElementById('statusMessage').textContent = '';
}

// Check backend status
async function checkBackendConnectivity() {
  try {
    const res = await fetch(`${API_BASE_URL.replace('/api', '')}/`);
    if (res.ok) {
      console.log('Connected to C++ Crow backend');
      return true;
    }
  } catch (err) {
    console.warn('No backend, using fallback logic.', err);
  }
  document.getElementById('statusMessage').textContent = 'Backend not reachable, running fallback only.';
  return false;
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
  initializeChart();
  await checkBackendConnectivity();

  document.getElementById('compressBtn').addEventListener('click', processData);
  document.getElementById('startSimulation').addEventListener('click', startSimulation);
  document.getElementById('stopSimulation').addEventListener('click', stopSimulation);
});
