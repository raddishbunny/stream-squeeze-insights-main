#include "delta.h"
#include <sstream>
#include "crow.h"

using namespace std;

vector<int> deltaEncode(const vector<int>& data) {
    if (data.empty()) return {};

    vector<int> encoded;
    encoded.push_back(data[0]);

    for (size_t i = 1; i < data.size(); ++i) {
        encoded.push_back(data[i] - data[i - 1]);
    }

    return encoded;
}

DeltaCompressionResult processDeltaCompression(const string& input) {
    vector<int> data;
    stringstream ss(input);
    string token;

    while (getline(ss, token, ',')) {
        try {
            float val = stof(token);
            data.push_back(static_cast<int>(val * 10)); // scale to preserve precision
        } catch (...) {
            continue;
        }
    }

    vector<int> encoded = deltaEncode(data);

    size_t originalSize = data.size() * sizeof(int);
    size_t compressedSize = encoded.size() * sizeof(int);

    double ratio = 0.0;
    if (originalSize != 0)
        ratio = (double)(originalSize - compressedSize) / originalSize * 100.0;

    return { originalSize, compressedSize, ratio };
}

template <typename App>
void registerDeltaRoute(App& app) {
    CROW_ROUTE(app, "/api/compress/delta").methods(crow::HTTPMethod::Post)
    ([&](const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body || !body.has("data")) {
            return crow::response(400, "Invalid request. Expecting JSON with 'data' field.");
        }

        string inputData = body["data"].s();

        DeltaCompressionResult result = processDeltaCompression(inputData);

        crow::json::wvalue response;
        response["originalSize"] = result.originalSize;
        response["compressedSize"] = result.compressedSize;
        response["compressionRatio"] = result.compressionRatio;

        return crow::response(response);
    });
}

// Explicitly instantiate for crow::App<>
template void registerDeltaRoute<crow::App<>>(crow::App<>&);
