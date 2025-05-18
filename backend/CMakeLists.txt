
cmake_minimum_required(VERSION 3.10)
project(IoTCompression)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_package(Boost REQUIRED)
include_directories(${Boost_INCLUDE_DIRS})

# Crow is header-only, so we just need to include its directory
include_directories(/usr/local/include)  # Adjust path if needed

# Add executable
add_executable(iot_compression
    main.cpp
    huffman.cpp
    delta.cpp
)

# Link libraries
target_link_libraries(iot_compression ${Boost_LIBRARIES} pthread)

# Installation rules
install(TARGETS iot_compression DESTINATION bin)
