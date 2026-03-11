#!/bin/bash
# Module 13: Log Analysis
# Pre-populate logs with brute force patterns, anomalies, Snort rules

echo "[module-13] Setting up Log Analysis lab..."

mkdir -p /var/log /opt/logs /opt/rules

# Generate auth.log with brute force patterns
cat > /var/log/auth.log << 'AUTHLOG'
Mar  1 02:14:01 target sshd[1234]: Failed password for root from 10.10.0.50 port 44521 ssh2
Mar  1 02:14:02 target sshd[1234]: Failed password for root from 10.10.0.50 port 44522 ssh2
Mar  1 02:14:03 target sshd[1234]: Failed password for root from 10.10.0.50 port 44523 ssh2
Mar  1 02:14:04 target sshd[1234]: Failed password for root from 10.10.0.50 port 44524 ssh2
Mar  1 02:14:05 target sshd[1234]: Failed password for root from 10.10.0.50 port 44525 ssh2
Mar  1 02:14:06 target sshd[1234]: Failed password for root from 10.10.0.50 port 44526 ssh2
Mar  1 02:14:07 target sshd[1234]: Failed password for root from 10.10.0.50 port 44527 ssh2
Mar  1 02:14:08 target sshd[1234]: Failed password for root from 10.10.0.50 port 44528 ssh2
Mar  1 02:14:10 target sshd[1234]: Accepted password for root from 10.10.0.50 port 44529 ssh2
Mar  1 02:14:11 target sshd[1234]: pam_unix(sshd:session): session opened for user root
Mar  1 03:00:00 target sshd[2345]: Failed password for admin from 192.168.1.100 port 55001 ssh2
Mar  1 03:00:01 target sshd[2345]: Failed password for admin from 192.168.1.100 port 55002 ssh2
Mar  1 03:00:02 target sshd[2345]: Failed password for admin from 192.168.1.100 port 55003 ssh2
Mar  1 04:30:00 target sshd[3456]: Accepted publickey for developer from 10.10.0.5 port 33001 ssh2
Mar  1 04:30:01 target sshd[3456]: pam_unix(sshd:session): session opened for user developer
Mar  1 05:00:00 target sudo: developer : TTY=pts/0 ; PWD=/home/developer ; USER=root ; COMMAND=/bin/bash
AUTHLOG

# Generate syslog with anomalies
cat > /var/log/syslog << 'SYSLOG'
Mar  1 02:00:00 target kernel: [UFW BLOCK] IN=eth0 OUT= SRC=10.10.0.50 DST=10.10.0.3 PROTO=TCP SPT=44500 DPT=22
Mar  1 02:13:59 target kernel: [UFW BLOCK] IN=eth0 OUT= SRC=10.10.0.50 DST=10.10.0.3 PROTO=TCP SPT=44520 DPT=22
Mar  1 02:30:00 target cron[5678]: (root) CMD (/opt/scripts/backup.sh)
Mar  1 02:30:01 target kernel: TCP: out of memory -- consider increasing memory
Mar  1 03:00:00 target kernel: possible SYN flooding on port 80. Sending cookies.
Mar  1 04:00:00 target rsyslogd: action 'action-3-builtin:omfile' resumed
Mar  1 05:15:00 target kernel: [UFW BLOCK] IN=eth0 OUT= SRC=172.16.0.99 DST=10.10.0.3 PROTO=TCP SPT=12345 DPT=4444
Mar  1 05:15:01 target kernel: [UFW BLOCK] IN=eth0 OUT= SRC=172.16.0.99 DST=10.10.0.3 PROTO=TCP SPT=12346 DPT=4444
SYSLOG

# Generate Apache access log with suspicious patterns
cat > /var/log/apache2/access.log << 'ACCESSLOG'
10.10.0.50 - - [01/Mar/2025:02:20:00 +0000] "GET / HTTP/1.1" 200 1234
10.10.0.50 - - [01/Mar/2025:02:20:01 +0000] "GET /admin HTTP/1.1" 403 567
10.10.0.50 - - [01/Mar/2025:02:20:02 +0000] "GET /admin/login HTTP/1.1" 200 890
10.10.0.50 - - [01/Mar/2025:02:20:03 +0000] "POST /admin/login HTTP/1.1" 401 123
10.10.0.50 - - [01/Mar/2025:02:20:04 +0000] "GET /../../../etc/passwd HTTP/1.1" 400 0
10.10.0.50 - - [01/Mar/2025:02:20:05 +0000] "GET /wp-admin HTTP/1.1" 404 0
10.10.0.50 - - [01/Mar/2025:02:20:06 +0000] "GET /phpmyadmin HTTP/1.1" 404 0
10.10.0.5 - - [01/Mar/2025:04:30:05 +0000] "GET /api/status HTTP/1.1" 200 45
ACCESSLOG

mkdir -p /var/log/apache2

# Create basic Snort-style rules
cat > /opt/rules/local.rules << 'SNORT'
# Detect SSH brute force (>5 attempts in 60s)
alert tcp any any -> $HOME_NET 22 (msg:"SSH Brute Force Attempt"; flow:to_server; threshold:type both, track by_src, count 5, seconds 60; sid:1000001; rev:1;)

# Detect directory traversal
alert tcp any any -> $HOME_NET 80 (msg:"Directory Traversal Attempt"; content:"../"; sid:1000002; rev:1;)

# Detect reverse shell on port 4444
alert tcp $HOME_NET any -> any 4444 (msg:"Possible Reverse Shell"; flow:established; sid:1000003; rev:1;)
SNORT

cat > /home/student/README.txt << 'EOF'
Log Analysis Lab
==================
Tasks:
1. Analyze /var/log/auth.log for brute force patterns
2. Count failed login attempts per source IP
3. Check /var/log/syslog for network anomalies (SYN flood, UFW blocks)
4. Review /var/log/apache2/access.log for suspicious requests
5. Review Snort rules in /opt/rules/local.rules
6. Create a timeline of the attack sequence
EOF
chown student:student /home/student/README.txt 2>/dev/null || true

echo "[module-13] Log Analysis lab ready."
