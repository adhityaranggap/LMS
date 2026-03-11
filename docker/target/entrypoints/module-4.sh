#!/bin/bash
# Module 4: ICMP & ARP
# Configure network interfaces and plant ARP entries

echo "[module-4] Setting up ICMP & ARP lab..."

# Enable ICMP responses
echo 0 > /proc/sys/net/ipv4/icmp_echo_ignore_all 2>/dev/null || true

# Create sample ARP entries for inspection
ip neigh add 10.10.0.100 lladdr 00:11:22:33:44:55 dev eth0 nud permanent 2>/dev/null || true
ip neigh add 10.10.0.101 lladdr 00:11:22:33:44:66 dev eth0 nud permanent 2>/dev/null || true

# Create pcap samples for analysis
mkdir -p /opt/pcaps
cat > /opt/pcaps/README.txt << 'EOF'
ARP and ICMP Packet Captures
=============================
Use tcpdump or tshark to capture and analyze traffic.
Try: tcpdump -i eth0 -w /tmp/capture.pcap arp
     tcpdump -i eth0 icmp
EOF

# Create a script that generates ARP traffic for students to capture
cat > /opt/lab-setup/generate-arp.sh << 'SCRIPT'
#!/bin/bash
# Generates ARP requests for analysis
while true; do
  arping -c 1 -I eth0 10.10.0.100 2>/dev/null || true
  sleep 5
done
SCRIPT
chmod +x /opt/lab-setup/generate-arp.sh

echo "[module-4] ICMP & ARP lab ready."
