
# Real-Time Data Compression for IoT Networks

This project demonstrates real-time data compression techniques to optimize data transmission in IoT networks, comparing Huffman Encoding with Delta Encoding algorithms.

## Project Overview

This web application simulates how compression algorithms can reduce data load in IoT environments. Users can input data through the web interface, which is processed in real-time using both Huffman and Delta encoding methods. The application displays original vs. compressed sizes, compression ratios, and a real-time graph showing algorithm performance.

## Features

- Input area for custom data compression
- Real-time data simulation for IoT sensor networks
- Comparison of Huffman and Delta encoding algorithms
- Visualization of compression ratios over time
- Statistics on data size reduction

## Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)
- Chart.js for data visualization

### Backend (To Be Implemented)
- C++ with Crow web framework
- Huffman encoding algorithm
- Delta encoding algorithm

## Usage

1. Open `index.html` in a web browser
2. Enter data in the input textarea or use the simulation feature
3. Click "Compress Data" to see compression results
4. Use "Start Simulation" to see continuous data generation and compression

## Implementation Notes

### Current Status
- Frontend is fully implemented with mock compression algorithms
- Real-time chart visualization is functional
- Random IoT data simulation is implemented

### To Be Implemented
- C++ backend with Crow framework
- Actual Huffman and Delta encoding algorithms
- API endpoints for compression processing

## How to Implement the C++ Backend

1. Create a C++ project with the Crow framework
2. Implement the Huffman and Delta encoding algorithms
3. Create API endpoints for compression processing
4. Replace the JavaScript mock functions with actual API calls

### Example Backend Structure

```cpp
// C++ with Crow framework
#include "crow.h"
#include "huffman.h" // Your Huffman implementation
#include "delta.h"   // Your Delta encoding implementation

int main() {
    crow::SimpleApp app;

    // Endpoint for Huffman compression
    CROW_ROUTE(app, "/api/compress/huffman")
        .methods("POST"_method)
        ([](const crow::request& req) {
            auto data = req.body;
            // Implement Huffman compression
            auto result = huffman_compress(data);
            
            crow::json::wvalue response;
            response["originalSize"] = data.size();
            response["compressedSize"] = result.size;
            response["compressionRatio"] = result.ratio;
            
            return response;
        });

    // Endpoint for Delta compression
    CROW_ROUTE(app, "/api/compress/delta")
        .methods("POST"_method)
        ([](const crow::request& req) {
            auto data = req.body;
            // Implement Delta compression
            auto result = delta_compress(data);
            
            crow::json::wvalue response;
            response["originalSize"] = data.size();
            response["compressedSize"] = result.size;
            response["compressionRatio"] = result.ratio;
            
            return response;
        });

    app.port(8080).multithreaded().run();
    return 0;
}
```
