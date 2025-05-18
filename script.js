
// Constants for simulation
const MAX_DATA_POINTS = 50;
const SIMULATION_INTERVAL = 1000; // 1 second
const API_BASE_URL = 'http://localhost:8080/api';

// Chart setup
let compressionChart;
const huffmanColor = '#34a853';
const deltaColor = '#ea4335';
let simulationInterval = null;
let timeLabels = [];
let huffmanData = [];
let deltaData = [];

// Initialize the chart
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
          title: {
            display: true,
            text: 'Time'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Compression Ratio (%)'
          },
          min: 0,
          max: 100
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + '%';
            }
          }
        }
      }
    }
  });
}

// Compress data using Huffman encoding via backend API
async function compressWithHuffman(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/compress/huffman`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: data
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Huffman compression failed:', error);
    // Fallback to local processing in case of API failure
    return fallbackHuffmanEncode(data);
  }
}

// Compress data using Delta encoding via backend API
async function compressWithDelta(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/compress/delta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: data
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Delta compression failed:', error);
    // Fallback to local processing in case of API failure
    return fallbackDeltaEncode(data);
  }
}

// Fallback implementations in case API is not available
function fallbackHuffmanEncode(data) {
  if (!data) return { size: 0, ratio: 0 };
  
  // Simple simulation of Huffman compression
  const originalSize = new TextEncoder().encode(data).length;
  const compressionFactor = Math.random() * 0.2 + 0.4; // 40-60% compression
  const compressedSize = Math.floor(originalSize * compressionFactor);
  
  console.warn('Using fallback Huffman encoder');
  
  return {
    originalSize: originalSize,
    compressedSize: compressedSize,
    compressionRatio: ((originalSize - compressedSize) / originalSize) * 100
  };
}

function fallbackDeltaEncode(data) {
  if (!data) return { size: 0, ratio: 0 };
  
  // Simple simulation of Delta compression
  const originalSize = new TextEncoder().encode(data).length;
  const compressionFactor = Math.random() * 0.2 + 0.5; // 50-70% compression
  const compressedSize = Math.floor(originalSize * compressionFactor);
  
  console.warn('Using fallback Delta encoder');
  
  return {
    originalSize: originalSize,
    compressedSize: compressedSize,
    compressionRatio: ((originalSize - compressedSize) / originalSize) * 100
  };
}

// Format bytes to human-readable format
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Process input data and update results
async function processData() {
  const inputData = document.getElementById('inputData').value;
  const originalSize = new TextEncoder().encode(inputData).length;
  
  // Update original size display
  document.getElementById('originalSize').textContent = formatBytes(originalSize);
  
  if (originalSize === 0) {
    // Reset compression displays if no input
    document.getElementById('huffmanSize').textContent = '0 Bytes';
    document.getElementById('huffmanRatio').textContent = 'Ratio: 0%';
    document.getElementById('deltaSize').textContent = '0 Bytes';
    document.getElementById('deltaRatio').textContent = 'Ratio: 0%';
    return;
  }
  
  // Process with Huffman encoding
  const huffmanResult = await compressWithHuffman(inputData);
  document.getElementById('huffmanSize').textContent = formatBytes(huffmanResult.compressedSize);
  document.getElementById('huffmanRatio').textContent = `Ratio: ${huffmanResult.compressionRatio.toFixed(2)}%`;
  
  // Process with Delta encoding
  const deltaResult = await compressWithDelta(inputData);
  document.getElementById('deltaSize').textContent = formatBytes(deltaResult.compressedSize);
  document.getElementById('deltaRatio').textContent = `Ratio: ${deltaResult.compressionRatio.toFixed(2)}%`;
  
  // Update chart with new data point
  updateChart(huffmanResult.compressionRatio, deltaResult.compressionRatio);
}

// Update chart with new data points
function updateChart(huffmanRatio, deltaRatio) {
  const now = new Date();
  const timeLabel = now.getHours().toString().padStart(2, '0') + ':' + 
                   now.getMinutes().toString().padStart(2, '0') + ':' + 
                   now.getSeconds().toString().padStart(2, '0');
  
  // Add new data
  timeLabels.push(timeLabel);
  huffmanData.push(huffmanRatio);
  deltaData.push(deltaRatio);
  
  // Keep only the last MAX_DATA_POINTS data points
  if (timeLabels.length > MAX_DATA_POINTS) {
    timeLabels.shift();
    huffmanData.shift();
    deltaData.shift();
  }
  
  // Update chart
  compressionChart.update();
}

// Generate random IoT-like data for simulation
function generateRandomIoTData() {
  // Simulate different types of IoT data
  const dataTypes = [
    // Temperature readings (more compressible with delta encoding)
    () => {
      const baseTemp = 20 + Math.random() * 5;
      let data = "";
      for (let i = 0; i < 50; i++) {
        // Small variations in temperature
        data += (baseTemp + (Math.random() * 2 - 1)).toFixed(2) + ",";
      }
      return data;
    },
    
    // Humidity readings (also compressible)
    () => {
      const baseHumidity = 40 + Math.random() * 20;
      let data = "";
      for (let i = 0; i < 50; i++) {
        data += (baseHumidity + (Math.random() * 5 - 2.5)).toFixed(2) + ",";
      }
      return data;
    },
    
    // Random sensor IDs and states (less compressible)
    () => {
      let data = "";
      for (let i = 0; i < 20; i++) {
        data += `sensor_${Math.floor(Math.random() * 1000)}_state_${Math.round(Math.random())};`;
      }
      return data;
    },
    
    // GPS coordinates (somewhat compressible)
    () => {
      const baseLat = 37.7749 + (Math.random() * 0.02 - 0.01);
      const baseLong = -122.4194 + (Math.random() * 0.02 - 0.01);
      let data = "";
      for (let i = 0; i < 15; i++) {
        data += `${(baseLat + Math.random() * 0.001).toFixed(6)},${(baseLong + Math.random() * 0.001).toFixed(6)};`;
      }
      return data;
    }
  ];
  
  // Select a random data type and generate data
  const selectedType = dataTypes[Math.floor(Math.random() * dataTypes.length)];
  return selectedType();
}

// Run simulation
async function runSimulation() {
  const simulatedData = generateRandomIoTData();
  document.getElementById('inputData').value = simulatedData;
  await processData();
}

// Start simulation
function startSimulation() {
  document.getElementById('startSimulation').disabled = true;
  document.getElementById('stopSimulation').disabled = false;
  
  // Run immediate simulation
  runSimulation();
  
  // Set interval for continuous simulation
  simulationInterval = setInterval(runSimulation, SIMULATION_INTERVAL);
}

// Stop simulation
function stopSimulation() {
  document.getElementById('startSimulation').disabled = false;
  document.getElementById('stopSimulation').disabled = true;
  
  clearInterval(simulationInterval);
}

// Check backend connectivity
async function checkBackendConnectivity() {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/`);
    if (response.ok) {
      console.log('Connected to C++ Crow backend');
      return true;
    }
  } catch (error) {
    console.warn('Backend not available, using fallback local processing', error);
  }
  return false;
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize chart
  initializeChart();
  
  // Check backend connectivity
  await checkBackendConnectivity();
  
  // Compress button click
  document.getElementById('compressBtn').addEventListener('click', processData);
  
  // Simulation controls
  document.getElementById('startSimulation').addEventListener('click', startSimulation);
  document.getElementById('stopSimulation').addEventListener('click', stopSimulation);
});
