#!/bin/bash

# Start the network
echo "🔧 Starting blockchain network..."
./network.sh up


# Start NID Server
cd ..
echo "🧠 Activating virtual environment and starting fingerprint script..."
cd asset-transfer-basic/NIDServer || exit
source virtual/bin/activate
python3 fingerprint.py &
FINGERPRINT_PID=$!

# Start IPFS Daemon
echo "📡 Starting IPFS daemon..."
ipfs daemon &
IPFS_PID=$!



echo ""
echo "✅ All systems started successfully!"
# echo ""
# echo "🔚 To stop everything, use:"
# echo "   kill $BACKEND_PID $FINGERPRINT_PID $IPFS_PID $FRONTEND_PID"
