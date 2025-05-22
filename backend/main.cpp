#define CROW_MAIN
#include "crow.h"
#include "huffman.h"
#include "delta.h"

using namespace crow;

int main() {
    SimpleApp app;

    // Root route with CORS headers
    CROW_ROUTE(app, "/").methods(HTTPMethod::Get, HTTPMethod::Options)
    ([](const request& req) {
        if (req.method == HTTPMethod::Options) {
            response res;
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Access-Control-Allow-Methods", "GET, OPTIONS");
            res.add_header("Access-Control-Allow-Headers", "Content-Type");
            return res;
        }
        response res("IoT Data Compression API is running");
        res.add_header("Access-Control-Allow-Origin", "*");
        return res;
    });

    // Huffman compression API route with CORS support
    CROW_ROUTE(app, "/api/compress/huffman").methods(HTTPMethod::Post, HTTPMethod::Options)
    ([](const request& req) {
        if (req.method == HTTPMethod::Options) {
            response res;
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Access-Control-Allow-Methods", "POST, OPTIONS");
            res.add_header("Access-Control-Allow-Headers", "Content-Type");
            return res;
        }

        auto json = json::load(req.body);
        if (!json || !json.has("text")) {
            json::wvalue res;
            res["error"] = "Missing 'text' field";
            return response(400, res);
        }

        std::string data = json["text"].s();
        HuffmanCompression huffman;
        auto result = huffman.compress(data);

        json::wvalue res;
        res["originalSize"] = data.size();
        res["compressedSize"] = result.size;
        res["compressionRatio"] = result.ratio;

        response r(res);
        r.add_header("Access-Control-Allow-Origin", "*");
        return r;
    });

    // Delta compression API route with CORS support
    CROW_ROUTE(app, "/api/compress/delta").methods(HTTPMethod::Post, HTTPMethod::Options)
    ([](const request& req) {
        if (req.method == HTTPMethod::Options) {
            response res;
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Access-Control-Allow-Methods", "POST, OPTIONS");
            res.add_header("Access-Control-Allow-Headers", "Content-Type");
            return res;
        }

        auto json = json::load(req.body);
        if (!json || !json.has("data")) {
            json::wvalue res;
            res["error"] = "Missing 'data' field";
            return response(400, res);
        }

        std::string data = json["data"].s();
        auto result = processDeltaCompression(data);

        json::wvalue res;
        res["originalSize"] = result.originalSize;
        res["compressedSize"] = result.compressedSize;
        res["compressionRatio"] = result.compressionRatio;

        response r(res);
        r.add_header("Access-Control-Allow-Origin", "*");
        return r;
    });

    app.port(8080).multithreaded().run();
}
