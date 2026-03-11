#!/bin/bash
# Module 6: Network Reconnaissance
# Enable multiple services with version banners for port scanning

echo "[module-6] Setting up Network Recon lab..."

# Configure and start Apache
echo "ServerTokens Full" >> /etc/apache2/apache2.conf
echo "<h1>Welcome to Internal Portal v2.4.1</h1><p>Authorized access only.</p>" > /var/www/html/index.html
mkdir -p /var/www/html/admin /var/www/html/backup
echo "Admin panel - restricted" > /var/www/html/admin/index.html
echo "db_backup_2025.sql.gz" > /var/www/html/backup/index.html
service apache2 start 2>/dev/null || apachectl start 2>/dev/null || true

# Configure and start SSH with banner
cat > /etc/ssh/sshd_config.d/lab.conf << 'SSHCONF'
PermitRootLogin yes
PasswordAuthentication yes
Banner /etc/ssh/banner
SSHCONF
echo "*** INTERNAL SERVER - InfoSec Lab Target ***" > /etc/ssh/banner
echo "root:toor" | chpasswd
service ssh start 2>/dev/null || /usr/sbin/sshd 2>/dev/null || true

# Configure and start FTP
mkdir -p /srv/ftp/pub
echo "FTP Server - Internal File Share" > /srv/ftp/pub/welcome.txt
echo "password_list.txt" > /srv/ftp/pub/password_list.txt
cat > /etc/vsftpd.conf << 'FTPCONF'
listen=YES
anonymous_enable=YES
anon_root=/srv/ftp
local_enable=YES
write_enable=NO
ftpd_banner=InfoSec Lab FTP Server v3.0.5
FTPCONF
vsftpd &>/dev/null &

# Start Samba
cat > /etc/samba/smb.conf << 'SMBCONF'
[global]
workgroup = LABNET
server string = InfoSec Lab File Server
security = user
map to guest = bad user

[public]
path = /srv/ftp/pub
browseable = yes
read only = yes
guest ok = yes
SMBCONF
smbd --no-process-group &>/dev/null &

# Create a Python HTTP server on high port
mkdir -p /opt/webapi
echo '{"status":"ok","version":"1.0.3","debug":true}' > /opt/webapi/status.json
cd /opt/webapi && python3 -m http.server 8080 &>/dev/null &

echo "[module-6] Network Recon lab ready. Services: SSH(22), HTTP(80), FTP(21), SMB(445), API(8080)"
