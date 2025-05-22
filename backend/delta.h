#ifndef DELTA_H
#define DELTA_H

#include <string>
#include <vector>

// Result struct for compression statistics
struct DeltaCompressionResult {
    size_t originalSize;
    size_t compressedSize;
    double compressionRatio;
};

// Encode the input data using delta encoding
std::vector<int> deltaEncode(const std::vector<int>& data);

// Process input string and perform delta compression, returning stats
DeltaCompressionResult processDeltaCompression(const std::string& input);

// Register the HTTP route for delta compression API
// Template so it works with any crow::App type
template <typename App>
void registerDeltaRoute(App& app);

#endif // DELTA_H
