
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
    // Generate frequency map
    std::unordered_map<unsigned char, int> calculateFrequency(const std::string& data);
    
    // Build Huffman tree
    HuffmanNode* buildHuffmanTree(const std::unordered_map<unsigned char, int>& freqMap);
    
    // Generate code table from Huffman tree
    void generateCodes(HuffmanNode* root, std::string code, std::unordered_map<unsigned char, std::string>& codeTable);
    
    // Free memory of Huffman tree
    void destroyTree(HuffmanNode* root);

public:
    // Compress data using Huffman coding
    CompressionResult compress(const std::string& data);
};

#endif // HUFFMAN_H
