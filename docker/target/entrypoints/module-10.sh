#!/bin/bash
# Module 10: Access Control
# Misconfigure PAM, sudoers, SSH for students to audit and fix

echo "[module-10] Setting up Access Control lab..."

# Create users with various privilege levels
useradd -m -s /bin/bash developer 2>/dev/null || true
useradd -m -s /bin/bash dbadmin 2>/dev/null || true
useradd -m -s /bin/bash intern 2>/dev/null || true
echo "developer:dev123" | chpasswd
echo "dbadmin:dbpass" | chpasswd
echo "intern:intern" | chpasswd

# Overly permissive sudoers (vulnerability)
cat > /etc/sudoers.d/lab-vuln << 'SUDOERS'
# BAD: Overly permissive sudo rules
developer ALL=(ALL) NOPASSWD: ALL
dbadmin ALL=(ALL) NOPASSWD: /usr/bin/mysql, /usr/bin/vim, /bin/bash
intern ALL=(root) NOPASSWD: /usr/bin/find, /usr/bin/less
SUDOERS
chmod 440 /etc/sudoers.d/lab-vuln

# Weak SSH configuration (vulnerability)
cat > /etc/ssh/sshd_config.d/lab.conf << 'SSHCONF'
PermitRootLogin yes
PasswordAuthentication yes
PermitEmptyPasswords yes
MaxAuthTries 100
X11Forwarding yes
SSHCONF
echo "root:root" | chpasswd
service ssh start 2>/dev/null || /usr/sbin/sshd 2>/dev/null || true

# Weak PAM configuration — no password complexity
# (Keep default PAM which has no cracklib enforcement)

# Create sensitive files with bad permissions
mkdir -p /etc/app-config
echo "DB_PASSWORD=plaintext_password_123" > /etc/app-config/database.conf
chmod 644 /etc/app-config/database.conf  # world-readable (vulnerability)
echo "API_KEY=sk-1234567890abcdef" > /etc/app-config/api.conf
chmod 666 /etc/app-config/api.conf  # world-writable (vulnerability)

# No audit rules configured (students should set these up)
mkdir -p /var/log/audit

# Create README
cat > /home/student/README.txt << 'EOF'
Access Control Audit Lab
==========================
Tasks:
1. Review /etc/sudoers.d/ for overly permissive rules
2. Check SSH configuration in /etc/ssh/sshd_config.d/
3. Audit file permissions on /etc/app-config/
4. Verify PAM password complexity requirements
5. Set up auditd rules for sensitive file access
6. Test privilege escalation paths
EOF
chown student:student /home/student/README.txt 2>/dev/null || true

echo "[module-10] Access Control lab ready."
