
#include "huffman.h"
#include <bitset>
#include <iostream>

std::unordered_map<unsigned char, int> HuffmanCompression::calculateFrequency(const std::string& data) {
    std::unordered_map<unsigned char, int> freqMap;
    for (unsigned char c : data) {
        freqMap[c]++;
    }
    return freqMap;
}

HuffmanNode* HuffmanCompression::buildHuffmanTree(const std::unordered_map<unsigned char, int>& freqMap) {
    std::priority_queue<HuffmanNode*, std::vector<HuffmanNode*>, CompareNodes> minHeap;
    
    // Create leaf nodes for all characters and add them to min heap
    for (const auto& pair : freqMap) {
        minHeap.push(new HuffmanNode(pair.first, pair.second));
    }
    
    // If there's only one distinct character
    if (minHeap.size() == 1) {
        HuffmanNode* single = minHeap.top();
        HuffmanNode* root = new HuffmanNode('\0', single->frequency);
        root->left = single;
        return root;
    }

    // Build the Huffman tree
    while (minHeap.size() > 1) {
        HuffmanNode* left = minHeap.top(); minHeap.pop();
        HuffmanNode* right = minHeap.top(); minHeap.pop();
        
        HuffmanNode* internal = new HuffmanNode('\0', left->frequency + right->frequency);
        internal->left = left;
        internal->right = right;
        
        minHeap.push(internal);
    }
    
    return minHeap.top();
}

void HuffmanCompression::generateCodes(HuffmanNode* root, std::string code, std::unordered_map<unsigned char, std::string>& codeTable) {
    if (!root)
        return;
    
    // If this is a leaf node, add its code to the code table
    if (!root->left && !root->right) {
        codeTable[root->data] = code;
    }
    
    // Traverse left (add '0')
    generateCodes(root->left, code + "0", codeTable);
    
    // Traverse right (add '1')
    generateCodes(root->right, code + "1", codeTable);
}

void HuffmanCompression::destroyTree(HuffmanNode* root) {
    if (root) {
        destroyTree(root->left);
        destroyTree(root->right);
        delete root;
    }
}

CompressionResult HuffmanCompression::compress(const std::string& data) {
    CompressionResult result;
    
    // Handle empty input
    if (data.empty()) {
        result.size = 0;
        result.ratio = 0.0;
        return result;
    }
    
    // Calculate frequency of each character
    auto freqMap = calculateFrequency(data);
    
    // Build Huffman tree
    HuffmanNode* root = buildHuffmanTree(freqMap);
    
    // Generate codes for each character
    std::unordered_map<unsigned char, std::string> codeTable;
    generateCodes(root, "", codeTable);
    
    // Encode the data
    std::string encodedString = "";
    for (unsigned char c : data) {
        encodedString += codeTable[c];
    }
    
    // Convert bit string to actual bytes
    std::vector<unsigned char> compressedData;
    for (size_t i = 0; i < encodedString.length(); i += 8) {
        std::string byte = encodedString.substr(i, std::min(size_t(8), encodedString.length() - i));
        while (byte.length() < 8) {
            byte += '0'; // Pad with zeros
        }
        compressedData.push_back(static_cast<unsigned char>(std::bitset<8>(byte).to_ulong()));
    }
    
    // Add header (frequency table) - simplified for demonstration
    // A real implementation would include the frequency table for decompression
    
    // Calculate compression ratio
    size_t originalSize = data.length();
    size_t compressedSize = compressedData.size();
    double ratio = originalSize > 0 ? ((double)(originalSize - compressedSize) / originalSize) * 100.0 : 0.0;
    
    // Clean up memory
    destroyTree(root);
    
    result.size = compressedSize;
    result.ratio = ratio;
    result.data = compressedData;
    
    return result;
}
