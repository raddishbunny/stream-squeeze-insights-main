
#ifndef DELTA_H
#define DELTA_H

#include <string>
#include <vector>

// Shared structure for compression results
struct CompressionResult {
    size_t size;
    double ratio;
    std::vector<unsigned char> data;
};

class DeltaCompression {
public:
    // Compress data using Delta encoding
    CompressionResult compress(const std::string& data);
};

#endif // DELTA_H
