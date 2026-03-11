#!/bin/bash
# Module 12: Endpoint Profiling
# Run old service versions, open unnecessary ports, disable firewall

echo "[module-12] Setting up Endpoint Profiling lab..."

# Start multiple services (some unnecessary)
service apache2 start 2>/dev/null || apachectl start 2>/dev/null || true
service ssh start 2>/dev/null || /usr/sbin/sshd 2>/dev/null || true

# FTP with old-style config
cat > /etc/vsftpd.conf << 'FTPCONF'
listen=YES
anonymous_enable=YES
anon_root=/srv/ftp
local_enable=YES
write_enable=YES
anon_upload_enable=YES
ftpd_banner=vsFTPd 2.3.4 (Ubuntu)
FTPCONF
mkdir -p /srv/ftp/pub
echo "Anonymous FTP enabled" > /srv/ftp/pub/readme.txt
vsftpd &>/dev/null &

# Start extra listeners on uncommon ports (simulating unnecessary services)
python3 -c "
import socket, threading
def serve(port, banner):
    s = socket.socket()
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(('0.0.0.0', port))
    s.listen(1)
    while True:
        c, _ = s.accept()
        c.send(banner.encode())
        c.close()
for port, banner in [(8888, 'Debug Console v1.0\n'), (9090, 'Management API\n'), (5000, 'Dev Server\n')]:
    threading.Thread(target=serve, args=(port, banner), daemon=True).start()
import time
while True: time.sleep(3600)
" &>/dev/null &

# Disable firewall (vulnerability)
iptables -F 2>/dev/null || true
iptables -P INPUT ACCEPT 2>/dev/null || true
iptables -P FORWARD ACCEPT 2>/dev/null || true
iptables -P OUTPUT ACCEPT 2>/dev/null || true

# Create outdated software version markers
mkdir -p /opt/versions
echo "apache2: 2.4.29 (known CVE)" > /opt/versions/installed.txt
echo "openssh: 7.6p1 (known CVE)" >> /opt/versions/installed.txt
echo "vsftpd: 2.3.4 (backdoor CVE)" >> /opt/versions/installed.txt
echo "python3: 3.6.9 (EOL)" >> /opt/versions/installed.txt

cat > /home/student/README.txt << 'EOF'
Endpoint Profiling Lab
========================
Tasks:
1. Scan all open ports on this machine
2. Identify service versions and check for known CVEs
3. List unnecessary services that should be disabled
4. Check firewall rules (or lack thereof)
5. Review /opt/versions/installed.txt for vulnerable software
6. Create a hardening report with recommendations
EOF
chown student:student /home/student/README.txt 2>/dev/null || true

echo "[module-12] Endpoint Profiling lab ready. Services on ports: 21,22,80,5000,8888,9090"
