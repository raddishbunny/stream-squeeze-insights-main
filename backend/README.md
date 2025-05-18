
# IoT Data Compression Backend

This backend implements real-time data compression for IoT networks using Huffman and Delta encoding algorithms. It provides a RESTful API built with the Crow C++ microframework.

## Requirements

- C++17 or higher
- Crow framework (header-only)
- Boost libraries
- CMake 3.10 or higher

## Building

```bash
mkdir build && cd build
cmake ..
make
```

## API Endpoints

- `GET /` - Check if API is running
- `POST /api/compress/huffman` - Compress data using Huffman encoding
- `POST /api/compress/delta` - Compress data using Delta encoding

## Request Format

Send a POST request with the raw data to compress in the request body.

## Response Format

```json
{
  "originalSize": 123,
  "compressedSize": 50,
  "compressionRatio": 59.34
}
```

## Running the Server

```bash
./iot_compression
```

The server will run on port 8080 by default.
