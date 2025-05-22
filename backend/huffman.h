#ifndef HUFFMAN_H
#define HUFFMAN_H

#include <string>
#include <queue>
#include <unordered_map>
#include <vector>

struct CompressionResult {
    size_t size;
    double ratio;
    std::vector<unsigned char> data;
};

// Node structure for Huffman tree
struct HuffmanNode {
    unsigned char data;
    int frequency;
    HuffmanNode *left, *right;
    
    HuffmanNode(unsigned char data, int frequency) : 
        data(data), frequency(frequency), left(nullptr), right(nullptr) {}
};

// Comparison class for priority queue
struct CompareNodes {
    bool operator()(HuffmanNode* left, HuffmanNode* right) {
        return left->frequency > right->frequency;
    }
};

class HuffmanCompression {
private:
    std::unordered_map<unsigned char, int> calculateFrequency(const std::string& data);
    HuffmanNode* buildHuffmanTree(const std::unordered_map<unsigned char, int>& freqMap);
    void generateCodes(HuffmanNode* root, std::string code, std::unordered_map<unsigned char, std::string>& codeTable);
    void destroyTree(HuffmanNode* root);

public:
    CompressionResult compress(const std::string& data);
};

// Template declaration for registering Huffman route with any Crow app type
#include "crow.h"
template <typename App>
void registerHuffmanRoute(App& app);

#endif // HUFFMAN_H
