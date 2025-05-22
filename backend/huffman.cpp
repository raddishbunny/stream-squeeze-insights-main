#include "huffman.h"
#include "crow.h"
#include <bitset>
#include <iostream>
#include <algorithm>

// Calculate frequency of each character in the input string
std::unordered_map<unsigned char, int> HuffmanCompression::calculateFrequency(const std::string& data) {
    std::unordered_map<unsigned char, int> freqMap;
    for (unsigned char c : data) {
        freqMap[c]++;
    }
    return freqMap;
}

// Build Huffman tree from frequency map
HuffmanNode* HuffmanCompression::buildHuffmanTree(const std::unordered_map<unsigned char, int>& freqMap) {
    std::priority_queue<HuffmanNode*, std::vector<HuffmanNode*>, CompareNodes> minHeap;

    for (const auto& pair : freqMap) {
        minHeap.push(new HuffmanNode(pair.first, pair.second));
    }

    // Handle edge case with one character only
    if (minHeap.size() == 1) {
        HuffmanNode* single = minHeap.top();
        HuffmanNode* root = new HuffmanNode('\0', single->frequency);
        root->left = single;
        return root;
    }

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

// Recursively generate Huffman codes from the tree
void HuffmanCompression::generateCodes(HuffmanNode* root, std::string code, std::unordered_map<unsigned char, std::string>& codeTable) {
    if (!root) return;

    if (!root->left && !root->right) {
        codeTable[root->data] = code;
    } else {
        generateCodes(root->left, code + "0", codeTable);
        generateCodes(root->right, code + "1", codeTable);
    }
}

// Recursively delete Huffman tree nodes to avoid memory leaks
void HuffmanCompression::destroyTree(HuffmanNode* root) {
    if (root) {
        destroyTree(root->left);
        destroyTree(root->right);
        delete root;
    }
}

// Compress input string using Huffman coding
CompressionResult HuffmanCompression::compress(const std::string& data) {
    CompressionResult result;

    if (data.empty()) {
        result.size = 0;
        result.ratio = 0.0;
        return result;
    }

    auto freqMap = calculateFrequency(data);
    HuffmanNode* root = buildHuffmanTree(freqMap);

    std::unordered_map<unsigned char, std::string> codeTable;
    generateCodes(root, "", codeTable);

    // Encode the input string into a binary string of 0s and 1s
    std::string encodedString;
    for (unsigned char c : data) {
        encodedString += codeTable[c];
    }

    // Pack bits into bytes (unsigned char vector)
    std::vector<unsigned char> compressedData;
    for (size_t i = 0; i < encodedString.length(); i += 8) {
        std::string byte = encodedString.substr(i, std::min(size_t(8), encodedString.length() - i));
        while (byte.length() < 8) byte += '0';  // Pad last byte with zeros if needed
        compressedData.push_back(static_cast<unsigned char>(std::bitset<8>(byte).to_ulong()));
    }

    size_t originalSize = data.length();
    size_t compressedSize = compressedData.size();

    double ratio = originalSize > 0 ? ((double)(originalSize - compressedSize) / originalSize) * 100.0 : 0.0;

    destroyTree(root);

    result.size = compressedSize;
    result.ratio = ratio;
    result.data = std::move(compressedData);

    return result;
}

// Template function to register the Huffman compression route with Crow app
template <typename App>
void registerHuffmanRoute(App& app) {
    CROW_ROUTE(app, "/api/compress/huffman").methods(crow::HTTPMethod::Post)
    ([](const crow::request& req) {
        auto json = crow::json::load(req.body);
        if (!json || !json.has("text")) {
            return crow::response(400, "Missing 'text' field");
        }

        std::string text = json["text"].s();

        HuffmanCompression compressor;
        CompressionResult result = compressor.compress(text);

        crow::json::wvalue responseJson;
        responseJson["original_size"] = text.size();
        responseJson["compressed_size"] = result.size;
        responseJson["compression_ratio"] = result.ratio;

        return crow::response{responseJson};
    });
}

// Explicitly instantiate template for crow::App with CORSHandler (adjust if you use different handler)
// template void registerHuffmanRoute<crow::App<crow::CORSHandler>>(crow::App<crow::CORSHandler>&);
template void registerHuffmanRoute<crow::App<>>(crow::App<>&);

