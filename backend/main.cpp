
#include "crow.h"
#include "huffman.h"
#include "delta.h"
#include <string>

int main() {
    crow::SimpleApp app;

    // Enable CORS
    auto& cors = app.get_middleware<crow::CORSHandler>();
    cors
        .global()
        .headers("Content-Type")
        .methods("POST", "GET")
        .origin("*");

    CROW_ROUTE(app, "/")
    ([]() {
        return "IoT Data Compression API is running";
    });

    // Endpoint for Huffman compression
    CROW_ROUTE(app, "/api/compress/huffman")
    .methods("POST"_method)
    ([](const crow::request& req) {
        auto data = req.body;
        if (data.empty()) {
            crow::json::wvalue response;
            response["error"] = "Empty data provided";
            return crow::response(400, response);
        }
        
        HuffmanCompression huffman;
        auto result = huffman.compress(data);
        
        crow::json::wvalue response;
        response["originalSize"] = data.size();
        response["compressedSize"] = result.size;
        response["compressionRatio"] = result.ratio;
        
        return crow::response(response);
    });

    // Endpoint for Delta compression
    CROW_ROUTE(app, "/api/compress/delta")
    .methods("POST"_method)
    ([](const crow::request& req) {
        auto data = req.body;
        if (data.empty()) {
            crow::json::wvalue response;
            response["error"] = "Empty data provided";
            return crow::response(400, response);
        }
        
        DeltaCompression delta;
        auto result = delta.compress(data);
        
        crow::json::wvalue response;
        response["originalSize"] = data.size();
        response["compressedSize"] = result.size;
        response["compressionRatio"] = result.ratio;
        
        return crow::response(response);
    });

    // Run the server on port 8080
    app.port(8080).multithreaded().run();
    return 0;
}
