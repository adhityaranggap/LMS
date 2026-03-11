#!/bin/bash
# Module 9: TCP/IP Vulnerabilities
# Place pcap files and set up traffic analysis environment

echo "[module-9] Setting up TCP/IP Vulnerability lab..."

mkdir -p /opt/pcaps /opt/scripts

# Create sample pcap generation script (generates anomalous traffic)
cat > /opt/scripts/gen-traffic.sh << 'SCRIPT'
#!/bin/bash
# Generates sample traffic patterns for analysis
while true; do
  # Normal HTTP requests
  curl -s http://localhost/ > /dev/null 2>&1 || true
  sleep 2
  # Simulated SYN pattern (rapid connections)
  for i in $(seq 1 5); do
    curl -s --connect-timeout 1 http://localhost:$((RANDOM % 1000 + 8000)) > /dev/null 2>&1 || true
  done
  sleep 10
done
SCRIPT
chmod +x /opt/scripts/gen-traffic.sh

# SYN flood detector script
cat > /opt/scripts/syn-detector.sh << 'SCRIPT'
#!/bin/bash
# Simple SYN flood detector - monitors SYN_RECV connections
echo "Monitoring for SYN flood patterns..."
while true; do
  SYN_COUNT=$(ss -t state syn-recv | wc -l)
  if [ "$SYN_COUNT" -gt 10 ]; then
    echo "[ALERT] High SYN_RECV count: $SYN_COUNT at $(date)"
  fi
  sleep 5
done
SCRIPT
chmod +x /opt/scripts/syn-detector.sh

# Create README for students
cat > /opt/pcaps/README.txt << 'EOF'
TCP/IP Vulnerability Analysis Lab
===================================
1. Use tcpdump to capture traffic: tcpdump -i eth0 -w /tmp/capture.pcap
2. Analyze with tshark: tshark -r /tmp/capture.pcap -q -z io,stat,1
3. Look for SYN flood patterns: tshark -r /tmp/capture.pcap -Y "tcp.flags.syn==1 && tcp.flags.ack==0"
4. Run /opt/scripts/syn-detector.sh to monitor live traffic
5. Generate test traffic: /opt/scripts/gen-traffic.sh
EOF

# Start Apache for traffic generation
service apache2 start 2>/dev/null || apachectl start 2>/dev/null || true

# Start traffic generator in background
nohup /opt/scripts/gen-traffic.sh &>/dev/null &

echo "[module-9] TCP/IP Vulnerability lab ready."
