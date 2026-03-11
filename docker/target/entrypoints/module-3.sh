#!/bin/bash
# Module 3: Linux Security
# Sets up users, permissions, iptables for security practice

echo "[module-3] Setting up Linux Security lab..."

# Create test users with various security levels
useradd -m -s /bin/bash testuser 2>/dev/null || true
useradd -m -s /bin/bash admin 2>/dev/null || true
useradd -m -s /bin/bash guest -s /bin/rbash 2>/dev/null || true

echo "testuser:password123" | chpasswd
echo "admin:admin2024" | chpasswd
echo "guest:guest" | chpasswd

# Create data directory with intentionally weak permissions
mkdir -p /opt/data/confidential /opt/data/public /opt/data/shared
echo "SECRET: Database credentials - db_admin:S3cur3P@ss" > /opt/data/confidential/credentials.txt
echo "Company financial report Q4 2025" > /opt/data/confidential/finance.txt
echo "Public announcement - welcome!" > /opt/data/public/readme.txt
echo "Shared project notes" > /opt/data/shared/notes.txt

# Intentionally weak file permissions for students to discover
chmod 777 /opt/data/confidential/
chmod 666 /opt/data/confidential/credentials.txt
chmod 644 /opt/data/public/readme.txt
chmod 4755 /opt/data/shared/notes.txt  # SUID bit set (vulnerability)

# Create a world-writable script (vulnerability)
cat > /opt/data/shared/backup.sh << 'SCRIPT'
#!/bin/bash
# Backup script - runs as root via cron
tar -czf /tmp/backup.tar.gz /opt/data/
SCRIPT
chmod 777 /opt/data/shared/backup.sh

# Setup weak iptables with intentional gaps
iptables -F 2>/dev/null || true
iptables -A INPUT -p tcp --dport 22 -j ACCEPT 2>/dev/null || true
iptables -A INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || true
# No DROP default - students should notice this gap

# Add sudo with overly permissive config
echo "testuser ALL=(ALL) NOPASSWD: /usr/bin/vim, /usr/bin/find" > /etc/sudoers.d/lab-vuln
chmod 440 /etc/sudoers.d/lab-vuln

echo "[module-3] Linux Security lab ready."
