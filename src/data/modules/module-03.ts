import type { ModuleData, CaseStudyVariant } from '../module-types';

export const module03: ModuleData & { caseStudyPool: CaseStudyVariant[] } = {
  id: 3,
  title: 'Linux Security & Networking',
  description:
    'Keamanan Sistem Linux, Linux Shell & CLI, Keamanan Jaringan, Model OSI & TCP/IP, IP Addressing, dan Analisis Paket dengan Wireshark',
  iconName: 'Terminal',

  // ──────────────────────────────────────────────
  // THEORY (7 items)
  // ──────────────────────────────────────────────
  theory: [
    {
      title: 'Linux File Permissions & Ownership — Model DAC',
      content:
        'Linux menggunakan model keamanan Discretionary Access Control (DAC) berbasis permission bit dan ownership. Setiap file dan direktori memiliki tiga entitas owner: User (pemilik file), Group (kelompok), dan Others (semua pengguna lain). Setiap entitas memiliki tiga bit permission: Read (r=4), Write (w=2), Execute (x=1). Memahami dan mengelola permission dengan benar adalah fondasi keamanan sistem Linux.',
      table: {
        caption: 'Interpretasi permission bit Linux dan efeknya pada file vs direktori',
        headers: ['Permission', 'Simbol', 'Nilai Oktal', 'Efek pada File', 'Efek pada Direktori'],
        rows: [
          ['Read', 'r', '4', 'Bisa membaca isi file (cat, less, head)', 'Bisa melihat daftar isi (ls), tapi tidak detailnya'],
          ['Write', 'w', '2', 'Bisa memodifikasi/menghapus isi file', 'Bisa membuat/menghapus/rename file dalam direktori'],
          ['Execute', 'x', '1', 'Bisa menjalankan file sebagai program', 'Bisa memasuki direktori (cd) dan akses file di dalamnya'],
          ['SUID', 's (pada user)', '4000', 'Program berjalan dengan privilege OWNER file, bukan user yang menjalankan', 'Tidak berlaku (diabaikan)'],
          ['SGID', 's (pada group)', '2000', 'Program berjalan dengan GID file, bukan GID user penjalannya', 'File baru inherit group dari direktori (bukan user)'],
          ['Sticky Bit', 't', '1000', 'Tidak berlaku (diabaikan)', 'Hanya owner file yang bisa menghapus file dalam direktori (contoh: /tmp)'],
        ],
      },
      example: {
        title: 'Analisis Permission: -rwsr-xr-x 1 root root /usr/bin/passwd',
        steps: [
          'Karakter pertama "-" = file biasa (d=direktori, l=symlink, c=char device, b=block device)',
          '"rws" (bits 1-3) = User permission: Read + Write + SUID (s menggantikan x) → file berjalan sebagai root meskipun dijalankan user biasa',
          '"r-x" (bits 4-6) = Group permission: Read + Execute (no write)',
          '"r-x" (bits 7-9) = Others permission: Read + Execute (no write)',
          'Notasi oktal: SUID(4) + rwx(7) + r-x(5) + r-x(5) = 4755',
          'Mengapa passwd butuh SUID root? Karena harus menulis ke /etc/shadow yang dimiliki root. Ini adalah desain yang disengaja dan aman karena passwd memvalidasi user.',
          'Red flag: file SUID yang tidak dikenal → periksa dengan: find / -perm -4000 -type f 2>/dev/null',
        ],
        result:
          'Perintah: find / -perm /6000 -type f 2>/dev/null akan menemukan semua file SUID dan SGID — ini adalah langkah penting dalam privilege escalation assessment dan hardening.',
      },
      keyPoints: [
        'Prinsip Least Privilege: selalu berikan permission seminimal mungkin yang cukup untuk fungsi yang diperlukan.',
        'File sensitif yang seharusnya hanya bisa dibaca root: /etc/shadow (755→640), /etc/sudoers (440), SSH private keys (600 atau lebih ketat).',
        'World-writable files (/etc/passwd dengan w untuk others) adalah kerentanan serius yang memungkinkan siapa saja memodifikasi database user.',
        'umask menentukan default permission saat file baru dibuat. umask 022 → file baru: 644 (rw-r--r--), direktori baru: 755. umask 027 lebih ketat → 640/750.',
        'chown user:group file — mengubah kepemilikan. chgrp group file — mengubah group. Hanya root yang bisa chown file orang lain.',
        'ACL (Access Control List) via setfacl/getfacl memberikan permission granular lebih dari 3 entitas standard — penting untuk environment multi-user kompleks.',
      ],
      codeSnippet: `# ============================================================
# FILE PERMISSION COMMANDS — Security Analysis
# ============================================================

# Lihat permission detail (long format)
ls -la /etc/passwd /etc/shadow /etc/sudoers

# Temukan semua file SUID (kerentanan potensial)
find / -perm -4000 -type f 2>/dev/null | sort

# Temukan file world-writable (berbahaya)
find / -perm -o+w -not -path "/proc/*" -not -path "/sys/*" 2>/dev/null

# Temukan file yang dimiliki user tidak ada (orphaned files — sisa attacker account)
find / -nouser -o -nogroup 2>/dev/null

# Ubah permission secara rekursif (HATI-HATI!)
chmod -R 750 /opt/app
chown -R appuser:appgroup /opt/app

# Set ACL untuk akses spesifik
setfacl -m u:analyst:r-- /var/log/syslog  # analyst bisa baca syslog
getfacl /var/log/syslog                    # lihat ACL

# Periksa file .ssh/ (kritis untuk remote access security)
ls -la ~/.ssh/
# authorized_keys harus 600 atau 644, TIDAK 777!
# Private key (id_rsa) harus 600

# Cek file /etc/shadow (harus hanya root yang bisa baca)
stat /etc/shadow
# Harus: Mode: 0640  Uid: 0  Gid: 42 (shadow group)`,
      noteType: 'warning',
      note: 'SUID bit pada file yang tidak semestinya adalah vektor privilege escalation favorit. Setelah instalasi sistem baru, dokumentasikan semua file SUID sebagai baseline. Setiap SUID file baru yang muncul di luar update resmi harus segera diinvestigasi.',
    },
    {
      title: 'Linux Security Architecture: SELinux & AppArmor',
      content:
        'Model DAC standar Linux (permission bits) memiliki kelemahan: jika proses root atau SUID dikompromikan, tidak ada pembatasan lebih lanjut. Mandatory Access Control (MAC) memberikan lapisan keamanan tambahan yang tidak dapat di-bypass bahkan oleh root. SELinux (dikembangkan NSA) dan AppArmor (dikembangkan Canonical/SUSE) adalah dua implementasi MAC utama di Linux. Keduanya bekerja dengan prinsip "default deny" — apa yang tidak diizinkan secara eksplisit diblokir.',
      codeSnippet: `# ============================================================
# SELinux — Security Enhanced Linux (RHEL, CentOS, Fedora)
# ============================================================

# Cek status SELinux
getenforce          # Enforcing / Permissive / Disabled
sestatus            # detail lengkap termasuk policy type dan context

# SELinux Modes:
# Enforcing  = policy diterapkan, violations diblokir dan di-log
# Permissive = policy tidak diterapkan, violations hanya di-log (testing)
# Disabled   = SELinux non-aktif sepenuhnya (tidak direkomendasikan)

# Lihat SELinux context sebuah file/proses
ls -Z /etc/passwd          # context file
ps -eZ | grep httpd        # context proses httpd
id -Z                      # context user saat ini

# Contoh context: system_u:object_r:passwd_file_t:s0
# Format: user:role:type:sensitivity_level
# "type" adalah yang paling penting untuk policy rules

# Cek apakah SELinux memblokir sesuatu
audit2why < /var/log/audit/audit.log   # analisis audit log
ausearch -m avc -ts recent             # cari AVC (Access Vector Cache) denials terbaru
sealert -a /var/log/audit/audit.log    # analisis dengan penjelasan human-readable

# Ubah context file (jika diperlukan setelah pindah file)
chcon -t httpd_sys_content_t /var/www/html/newfile.html
restorecon -Rv /var/www/html/         # restore ke default context

# Booleans SELinux (on/off switch untuk policy)
getsebool -a | grep httpd             # lihat semua boolean terkait httpd
setsebool -P httpd_can_network_connect on  # izinkan httpd buat koneksi jaringan (-P = persist)

# ============================================================
# AppArmor — Application Armor (Ubuntu, Debian, SUSE)
# ============================================================

# Cek status AppArmor
systemctl status apparmor
aa-status            # tampilkan semua profile dan status

# AppArmor Modes per-profile:
# enforce  = policy diterapkan, violations diblokir dan di-log
# complain = violations hanya di-log (untuk tuning policy baru)
# disabled = profile tidak aktif

# Lihat profile yang tersedia dan statusnya
aa-status
ls /etc/apparmor.d/             # direktori profile

# Log AppArmor (Ubuntu)
grep apparmor /var/log/syslog   # violations dan events
journalctl -t audit | grep apparmor

# Set mode profil
aa-enforce /etc/apparmor.d/usr.sbin.nginx    # set nginx ke enforce mode
aa-complain /etc/apparmor.d/usr.sbin.nginx   # set ke complain mode untuk tuning

# ============================================================
# Perbandingan cepat SELinux vs AppArmor
# ============================================================
# SELinux:
# - Policy berbasis Type Enforcement (TE) + role + user + MLS/MCS
# - Lebih granular dan powerful, tapi lebih kompleks untuk dikonfigurasi
# - Berbasis inode (label pada filesystem) — robust
# - Default di RHEL/CentOS/Fedora ecosystem

# AppArmor:
# - Policy berbasis path (nama file/direktori) — lebih mudah dipahami
# - Lebih user-friendly, profil bisa dibuat dengan aa-genprof
# - Tidak seaman SELinux untuk lingkungan multi-level security
# - Default di Ubuntu/Debian ecosystem`,
      note: 'JANGAN menonaktifkan SELinux atau AppArmor untuk "mempermudah konfigurasi". Ini adalah kesalahan yang sangat umum dan berbahaya. Jika ada masalah, gunakan mode Permissive/Complain untuk diagnosa, bukan disable penuh. Tool audit2allow dan aa-genprof membantu membuat policy yang tepat.',
      noteType: 'danger',
    },
    {
      title: 'Linux CLI Tools untuk Security Analysis',
      content:
        'Seorang security analyst Linux yang handal harus menguasai koleksi tools CLI yang tersedia secara built-in maupun dari package manager. Tools ini mencakup pemantauan sistem, analisis jaringan, manajemen user, analisis log, dan packet capture. Kemampuan menggabungkan tools menggunakan pipe (|), redirect (>, >>), dan grep adalah keterampilan fundamental.',
      table: {
        caption: 'Linux CLI Security Tools — Kategori, Fungsi, dan Contoh Penggunaan',
        headers: ['Kategori', 'Tool', 'Fungsi Utama', 'Contoh Command Penting'],
        rows: [
          ['User & Process', 'id, whoami', 'Identifikasi user dan grup', 'id; id username; whoami'],
          ['User & Process', 'w, who, last', 'Siapa yang login sekarang/historis', 'who; last | head -20; lastb (failed logins)'],
          ['User & Process', 'ps', 'Daftar proses yang berjalan', 'ps aux; ps -eo pid,user,cmd --sort=-%cpu'],
          ['User & Process', 'top/htop', 'Monitor proses real-time', 'top; htop (interaktif, lebih visual)'],
          ['User & Process', 'lsof', 'List open files (termasuk network sockets)', 'lsof -p PID; lsof -i :80; lsof -u username'],
          ['Jaringan', 'ss / netstat', 'Koneksi jaringan dan port listening', 'ss -tuln; ss -tpn | grep ESTABLISHED'],
          ['Jaringan', 'tcpdump', 'Capture dan analisis paket jaringan', 'tcpdump -i eth0 -n host 1.2.3.4 -w output.pcap'],
          ['Jaringan', 'nmap', 'Network discovery dan port scanning', 'nmap -sV -sC -p 1-1000 target; nmap -sn 192.168.1.0/24'],
          ['Jaringan', 'ip / ifconfig', 'Konfigurasi dan monitoring interface', 'ip addr show; ip route; ip neigh (ARP table)'],
          ['Jaringan', 'iptables / nftables', 'Firewall dan packet filtering', 'iptables -L -n -v; iptables -A INPUT -p tcp --dport 22 -j ACCEPT'],
          ['File & Log', 'find', 'Cari file berdasarkan kriteria', 'find / -perm -4000; find /tmp -newer /etc/passwd; find / -name "*.py" -mtime -1'],
          ['File & Log', 'grep', 'Cari pola dalam file/output', 'grep -r "password" /etc/; grep "Failed password" /var/log/auth.log'],
          ['File & Log', 'awk', 'Pemrosesan teks dan ekstraksi field', "awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn"],
          ['File & Log', 'journalctl', 'Query systemd journal log', 'journalctl -u ssh -n 50; journalctl --since "1 hour ago"'],
          ['Kriptografi', 'openssl', 'Swiss-army knife kriptografi', 'openssl x509 -in cert.pem -text; openssl s_client -connect host:443'],
          ['Hash & Integrity', 'sha256sum/md5sum', 'Hitung hash file untuk verifikasi integritas', 'sha256sum /bin/bash; sha256sum -c hashes.txt'],
        ],
      },
      codeSnippet: `# ============================================================
# SECURITY INVESTIGATION WORKFLOW — Linux
# ============================================================

# 1. Identifikasi sistem dengan cepat (live response triage)
uname -a && cat /etc/os-release && hostname && id && date
uptime    # berapa lama sistem hidup? Bila baru reboot → suspicious

# 2. Pengguna yang sedang login dan aktivitasnya
who && w && last | head -20
lastb | head -20    # failed login attempts (needs root)

# 3. Proses mencurigakan (berjalan dari path aneh, hidden, atau berintensitas CPU tinggi)
ps aux --sort=-%cpu | head -20
# Cari proses dengan nama aneh atau path di /tmp, /dev/shm
ps aux | awk '{print $11}' | grep -E "^(/tmp|/dev/shm|/var/tmp)"

# 4. Koneksi jaringan aktif dengan proses
ss -tupn
# Atau lebih detail:
lsof -i -n -P | grep ESTABLISHED

# 5. Login gagal (brute force detection) — Debian/Ubuntu
grep "Failed password" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -rn | head -20
# RHEL/CentOS:
grep "Failed password" /var/log/secure | awk '{print $11}' | sort | uniq -c | sort -rn | head -20

# 6. Persistence locations di Linux
ls -la /etc/cron.* /var/spool/cron/crontabs/
cat /etc/rc.local
ls -la /etc/init.d/ /etc/systemd/system/
find /tmp /var/tmp /dev/shm -type f -executable 2>/dev/null

# 7. File yang dimodifikasi baru-baru ini (indikator kompromi)
find /etc /bin /sbin /usr -newer /etc/passwd -type f 2>/dev/null | head -30
find / -mtime -1 -type f -not -path "/proc/*" 2>/dev/null | head -50

# 8. Cek rootkit (sederhana — tanda-tanda umum)
ls /tmp /var/tmp /dev/shm         # direktori writeable sering digunakan malware
cat /etc/passwd | grep "uid=0"    # selain root, siapa yang punya UID 0?
find / -name ".bash_history" 2>/dev/null | xargs grep -l "wget\|curl\|chmod 777"

# 9. Analisis log SSH — siapa yang berhasil login?
grep "Accepted" /var/log/auth.log | awk '{print $1,$2,$3,$9,$11}' | tail -30

# 10. Hash semua binary sistem untuk integrity baseline
sha256sum /bin/* /sbin/* /usr/bin/* > /root/system_hashes_$(date +%Y%m%d).txt`,
      note: 'Untuk investigasi live response yang lebih komprehensif, gunakan toolkit seperti Volatility (memory forensics), SANS SIFT Workstation, atau Kali Linux dengan tools lengkap. Untuk deteksi anomali otomatis, pertimbangkan Wazuh atau OSSEC sebagai host-based IDS untuk Linux.',
      noteType: 'info',
    },
    {
      title: 'Model OSI: 7 Layer dan Fungsinya dalam Konteks Keamanan',
      content:
        'Model OSI (Open Systems Interconnection) dikembangkan ISO pada 1984 sebagai framework konseptual yang menjelaskan bagaimana berbagai komponen jaringan berinteraksi. Meskipun TCP/IP yang lebih digunakan dalam praktik, OSI tetap penting sebagai bahasa universal untuk memahami dan mengkomunikasikan masalah jaringan dan serangan. Setiap layer memiliki ancaman keamanan dan mekanisme perlindungannya sendiri.',
      table: {
        caption: 'Model OSI: 7 Layer, fungsi, protokol, ancaman keamanan, dan kontrol',
        headers: ['Layer', 'Nama', 'Fungsi Utama', 'Protokol/Teknologi', 'Unit Data (PDU)', 'Ancaman Keamanan', 'Kontrol Keamanan'],
        rows: [
          [
            '7',
            'Application',
            'Interface antara aplikasi dan jaringan; menyediakan layanan jaringan ke aplikasi pengguna',
            'HTTP, HTTPS, DNS, SMTP, FTP, SSH, Telnet, SNMP',
            'Data (Message)',
            'SQL Injection, XSS, Command Injection, Phishing, DNS Spoofing',
            'WAF, Input validation, HTTPS/TLS, DNSSEC, Application firewall',
          ],
          [
            '6',
            'Presentation',
            'Format data, enkripsi/dekripsi, kompresi; memastikan data dapat dipahami receiver',
            'TLS/SSL, MIME, XDR, JPEG, MPEG, ASCII/Unicode',
            'Data',
            'SSL Stripping, Cipher downgrade attack, Malicious encoding',
            'Konfigurasi TLS yang kuat (TLS 1.2+), certificate pinning, HSTS',
          ],
          [
            '5',
            'Session',
            'Membuat, mengelola, dan mengakhiri sesi komunikasi antara aplikasi',
            'NetBIOS, RPC, SMB (session management), SQL sessions',
            'Data',
            'Session hijacking, Session fixation, MITM pada session establishment',
            'Session timeout, Secure session tokens, Mutual authentication',
          ],
          [
            '4',
            'Transport',
            'Komunikasi end-to-end, segmentasi, flow control, error correction',
            'TCP, UDP, SCTP, QUIC',
            'Segment (TCP) / Datagram (UDP)',
            'SYN Flood, UDP Flood, Port scanning, TCP session hijacking',
            'Stateful firewall, SYN cookies, Rate limiting, Connection tracking',
          ],
          [
            '3',
            'Network',
            'Logical addressing, routing paket antar jaringan berbeda',
            'IPv4, IPv6, ICMP, IPsec, BGP, OSPF, RIP',
            'Packet',
            'IP Spoofing, ICMP Flood, Route hijacking (BGP), Smurf attack',
            'ACL di router, uRPF (anti-spoofing), BGP security, IPsec',
          ],
          [
            '2',
            'Data Link',
            'Physical addressing, frame delivery dalam satu jaringan (LAN)',
            'Ethernet, Wi-Fi (802.11), ARP, STP, VLAN (802.1Q), MAC',
            'Frame',
            'ARP Spoofing, MAC Flooding, VLAN hopping, Rogue AP',
            'Dynamic ARP Inspection (DAI), Port Security, 802.1X, STP guard',
          ],
          [
            '1',
            'Physical',
            'Transmisi bit raw melalui media fisik (kabel, gelombang radio)',
            'Ethernet cable, Wi-Fi radio, Fiber optic, USB, Bluetooth',
            'Bit',
            'Physical tapping, Signal jamming, Hardware implant, Shoulder surfing',
            'Physical security, Cable shielding, Electromagnetic shielding, CCTV',
          ],
        ],
      },
      note: 'Mnemonic untuk urutan layer OSI dari atas ke bawah (7→1): "All People Seem To Need Data Processing" (Application, Presentation, Session, Transport, Network, Data Link, Physical). Dari bawah ke atas (1→7): "Please Do Not Throw Sausage Pizza Away".',
      noteType: 'info',
    },
    {
      title: 'Model TCP/IP vs OSI: Perbandingan dan Implementasi Praktis',
      content:
        'Sementara OSI adalah model referensi konseptual dengan 7 layer, TCP/IP adalah model implementasi yang benar-benar digunakan di internet. TCP/IP dikembangkan DARPA dan lebih pragmatis: 4 layer yang memetakan ke 7 layer OSI. Dalam security analysis sehari-hari, pemahaman TCP/IP lebih langsung diterapkan karena tools seperti Wireshark, Nmap, dan tcpdump beroperasi pada level protokol TCP/IP.',
      table: {
        caption: 'Pemetaan Model TCP/IP ke OSI dan protokol di setiap layer',
        headers: ['Layer TCP/IP', 'Layer OSI Equivalen', 'Protokol Utama', 'Tool Analisis', 'Attack di Layer Ini'],
        rows: [
          [
            'Application (Layer 4)',
            'OSI Layer 5+6+7',
            'HTTP/HTTPS, DNS, SMTP, FTP, SSH, Telnet, SNMP, DHCP',
            'Wireshark (filter protocol name), curl, nslookup, Burp Suite',
            'XSS, SQLi, CSRF, DNS poisoning, Email phishing',
          ],
          [
            'Transport (Layer 3)',
            'OSI Layer 4',
            'TCP (reliable, connection-oriented), UDP (fast, connectionless)',
            'Wireshark (tcp/udp filter), netcat, nmap (port scan)',
            'SYN flood, UDP flood, port scanning, TCP hijacking',
          ],
          [
            'Internet (Layer 2)',
            'OSI Layer 3',
            'IPv4, IPv6, ICMP, IPsec, IGMP (multicast)',
            'Wireshark (ip filter), ping, traceroute, ip command',
            'IP spoofing, ICMP flood (ping of death), smurf, route hijack',
          ],
          [
            'Network Access (Layer 1)',
            'OSI Layer 1+2',
            'Ethernet, Wi-Fi (802.11), ARP, PPP, VLAN',
            'Wireshark (eth/arp filter), arp command, tcpdump',
            'ARP spoofing, MAC flooding, VLAN hopping, Evil twin AP',
          ],
        ],
      },
      keyPoints: [
        'TCP 3-Way Handshake: SYN → SYN-ACK → ACK. Setelah handshake, koneksi ESTABLISHED. Penting untuk memahami: SYN Flood mengeksploitasi half-open connections ini.',
        'TCP flags: SYN (S), ACK (A), FIN (F), RST (R), PSH (P), URG (U). Nmap menggunakan manipulasi flag ini untuk port scanning: -sS (SYN scan), -sF (FIN scan), -sX (Xmas scan).',
        'UDP stateless: tidak ada handshake, tidak ada acknowledgment. DNS, DHCP, VoIP, NTP menggunakan UDP karena lebih cepat dan toleran terhadap packet loss.',
        'ICMP bukan Transport layer protocol — berada di layer Network (Internet). Digunakan untuk: echo request/reply (ping), destination unreachable, time exceeded (TTL).',
        'Enkapsulasi: setiap layer menambahkan header saat mengirim (encapsulation) dan melepas header saat menerima (decapsulation). Wireshark menampilkan semua layer sekaligus.',
        'Port numbers: Well-known (0-1023) — memerlukan root untuk bind; Registered (1024-49151) — aplikasi; Ephemeral (49152-65535) — dinamis untuk koneksi keluar.',
        'TCP vs UDP untuk keamanan: TCP menjamin delivery tapi bisa dieksploitasi untuk state table exhaustion (DDoS); UDP lebih efisien tapi vulnerable terhadap amplification attack (DNS/NTP reflection).',
      ],
    },
    {
      title: 'IP Addressing: IPv4, Subnetting, dan IPv6',
      content:
        'IP addressing adalah fondasi komunikasi jaringan modern. IPv4 menggunakan alamat 32-bit yang hampir habis, mendorong transisi ke IPv6 128-bit. Subnetting adalah teknik membagi ruang IP menjadi segmen-segmen lebih kecil untuk efisiensi dan keamanan — network segmentation berbasis VLAN dan subnet adalah praktik keamanan fundamental untuk membatasi blast radius serangan.',
      example: {
        title: 'Contoh Kalkulasi Subnetting: Membagi 192.168.10.0/24 untuk Jaringan Perusahaan',
        steps: [
          'REQUIREMENT: Bagi 192.168.10.0/24 menjadi 4 subnet sama besar untuk: DMZ, Internal Network, Management, Guest WiFi.',
          '/24 memiliki 254 host. Untuk 4 subnet sama besar, butuh 2 bit tambahan: /26 (2² = 4 subnet).',
          'SUBNET 1 — DMZ: 192.168.10.0/26. Network: .0, Broadcast: .63, Usable: .1–.62 (62 host). Tempatkan: web server, mail server.',
          'SUBNET 2 — Internal: 192.168.10.64/26. Network: .64, Broadcast: .127, Usable: .65–.126 (62 host). Tempatkan: workstation karyawan.',
          'SUBNET 3 — Management: 192.168.10.128/26. Network: .128, Broadcast: .191, Usable: .129–.190 (62 host). Tempatkan: server, infrastruktur (akses terbatas!)',
          'SUBNET 4 — Guest WiFi: 192.168.10.192/26. Network: .192, Broadcast: .255, Usable: .193–.254 (62 host). Isolasi total dari subnet lain.',
          'Subnet mask /26 = 255.255.255.192 (biner: 11111111.11111111.11111111.11000000)',
          'Verifikasi: 4 subnet × 64 alamat/subnet = 256 alamat total = sesuai /24 yang tersedia.',
        ],
        result:
          'Segmentasi ini memastikan: komputer guest tidak bisa akses server internal, server DMZ tidak bisa akses langsung ke subnet management, dan breach di DMZ tidak otomatis mempengaruhi internal network. Ini adalah implementasi nyata dari defense in depth menggunakan subnetting.',
      },
      table: {
        caption: 'Perbandingan IPv4 dan IPv6 dari perspektif keamanan',
        headers: ['Aspek', 'IPv4', 'IPv6'],
        rows: [
          ['Panjang Alamat', '32-bit (4 oktet desimal)', '128-bit (8 grup heksadesimal, dipisah ":"'],
          ['Jumlah Alamat', '~4,3 miliar (hampir habis)', '~340 undecillion (praktis tidak terbatas)'],
          ['Notasi', '192.168.1.1', '2001:0db8:85a3:0000:0000:8a2e:0370:7334'],
          ['Private Range', '10.x.x.x, 172.16-31.x.x, 192.168.x.x', 'fc00::/7 (Unique Local Address)'],
          ['NAT', 'Wajib untuk efisiensi IPv4', 'Tidak diperlukan (setiap device punya IP publik global)'],
          ['Security (IPsec)', 'Opsional (tapi tidak umum)', 'Dirancang wajib (mandatory), tapi praktiknya masih opsional'],
          ['Header', 'Variable length, lebih kompleks', 'Fixed 40 byte, lebih efisien'],
          ['Autoconfiguration', 'DHCP (terpisah)', 'SLAAC built-in (Stateless Address Autoconfiguration)'],
          ['Keamanan Tambahan', 'Tidak ada by default', 'Link-local address, privacy extensions, CGA'],
          ['Ancaman Unik', 'ARP spoofing, DHCP starvation', 'NDP spoofing (pengganti ARP), Router Advertisement flood'],
        ],
      },
      codeSnippet: `# Kalkulasi subnetting cepat di Linux
ipcalc 192.168.10.0/26          # detail subnet
ipcalc 10.0.0.0/8 --split 4    # bagi /8 menjadi 4 subnet

# IPv6 di Linux
ip -6 addr show                 # tampilkan IPv6 addresses
ping6 ::1                       # ping IPv6 loopback
ip -6 route                     # routing table IPv6

# Identifikasi IP address dari berbagai kelas
# Class A: 1.0.0.0 - 126.0.0.0  /8
# Class B: 128.0.0.0 - 191.255.0.0  /16
# Class C: 192.0.0.0 - 223.255.255.0  /24
# Private: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16

# Cek CIDR dan subnet dari sebuah IP
python3 -c "import ipaddress; n=ipaddress.ip_network('192.168.10.0/26'); print(f'Network:{n.network_address} Broadcast:{n.broadcast_address} Hosts:{n.num_addresses-2}')"`,
    },
    {
      title: 'Wireshark dan Packet Analysis untuk Security Investigation',
      content:
        'Wireshark adalah network protocol analyzer open-source yang paling populer di dunia. Memungkinkan capture dan analisis packet secara real-time atau dari file pcap yang sudah direkam sebelumnya. Bagi security analyst, Wireshark adalah tool investigasi jaringan utama untuk: mendeteksi serangan jaringan, menganalisis malware traffic, membuktikan data exfiltration, dan memahami perilaku protokol.',
      codeSnippet: `# ============================================================
# WIRESHARK DISPLAY FILTERS — Security Investigation
# ============================================================

# --- FILTER DASAR ---
ip.addr == 192.168.1.100          # semua traffic dari/ke IP ini
ip.src == 192.168.1.100           # hanya traffic DARI IP ini
ip.dst == 10.0.0.1                # hanya traffic KE IP ini
tcp.port == 443                   # traffic port 443 (HTTPS)
tcp.dstport == 80                 # traffic ke port 80 (HTTP)
eth.addr == aa:bb:cc:dd:ee:ff     # filter berdasarkan MAC address
not arp and not icmp              # exclude ARP dan ICMP (kurangi noise)

# --- FILTER PROTOCOL ---
http                              # HTTP traffic (unencrypted)
https or ssl or tls               # encrypted web traffic
dns                               # DNS query dan response
dhcp or bootp                     # DHCP traffic
smtp or pop or imap               # email protocols
ftp or ftp-data                   # FTP (transfer file — biasanya cleartext!)
ssh                               # SSH traffic
smb or smb2                       # SMB (Windows file sharing — lateral movement)

# --- FILTER SECURITY INVESTIGATION ---
# Deteksi scanning (banyak SYN tanpa response)
tcp.flags == 0x002 and not tcp.flags.ack   # SYN packet tanpa ACK = stealth scan

# Deteksi ARP Spoofing (banyak ARP reply dari satu MAC ke banyak IP)
arp.opcode == 2 and not arp.isgratuitous   # ARP reply

# Cari kredensial cleartext di HTTP
http.request.method == "POST" and http contains "password"
http.authbasic                              # HTTP Basic Auth (cleartext credentials!)

# DNS anomali (query yang panjang = DNS tunneling)
dns.qry.name.len > 50             # DNS query name sangat panjang
dns.count.answers > 10            # DNS response dengan banyak jawaban (anomali)

# Data exfiltration via large upload
http.request.method == "POST" and http.content_length > 1000000  # POST > 1MB

# Cari ICMP anomali (ping sweep atau covert channel)
icmp.type == 8 and icmp.data.len > 100    # ICMP Echo dengan payload besar

# Lateral movement via SMB
smb2.cmd == 3 and smb2.filename contains ".exe"  # SMB file copy executable

# Koneksi ke port tidak biasa (bisa C2)
tcp.dstport > 1024 and not tcp.dstport in {8080,8443,3000,8888}

# ============================================================
# TSHARK (Wireshark CLI) — untuk automasi dan scripting
# ============================================================

# Capture 100 paket dari interface eth0
tshark -i eth0 -c 100 -w capture.pcap

# Ekstrak semua HTTP request dari capture
tshark -r capture.pcap -Y "http.request" -T fields -e frame.time -e ip.src -e http.host -e http.request.uri

# Statistik conversation (siapa bicara dengan siapa)
tshark -r capture.pcap -q -z conv,ip

# Ekstrak semua file dari HTTP traffic (carving)
tshark -r capture.pcap --export-objects http,/tmp/extracted_files/

# Cari DNS query yang aneh (TXT records = sering digunakan tunneling)
tshark -r capture.pcap -Y "dns.qry.type == 16" -T fields -e dns.qry.name

# Top talkers (IP mana paling banyak kirim data)
tshark -r capture.pcap -q -z endpoints,ip | sort -k5 -rn | head -20`,
      keyPoints: [
        'BPF (Berkeley Packet Filter) untuk capture filter (sebelum capture, lebih efisien): "host 1.2.3.4", "port 80", "net 192.168.0.0/16" — berbeda dari display filter Wireshark.',
        'Follow TCP/UDP Stream: klik kanan paket > Follow > TCP Stream untuk melihat seluruh conversation dalam satu view — sangat berguna untuk melihat HTTP request/response atau chat protocol.',
        'Export Objects: File > Export Objects > HTTP untuk mengekstrak semua file yang ditransfer via HTTP (termasuk malware yang didownload).',
        'Protocol Statistics: Statistics > Protocol Hierarchy — menunjukkan breakdown traffic berdasarkan protokol. Anomali seperti TXT DNS records berlebihan atau rasio ICMP yang tinggi langsung terlihat.',
        'Coloring Rules: Wireshark menggunakan warna untuk highlight traffic (merah = RST/ICMP error, hitam = TCP error, hijau = HTTP). Bisa dikustom untuk highlight IOC spesifik.',
        'GeoIP Integration: Wireshark bisa menampilkan negara asal IP jika database GeoIP dikonfigurasi — berguna untuk identifikasi koneksi ke negara yang mencurigakan.',
      ],
    },
  ],

  // ──────────────────────────────────────────────
  // LAB
  // ──────────────────────────────────────────────
  lab: {
    title: 'Lab 3: Linux Security & Wireshark Packet Analysis',
    downloads: [
      {
        name: 'Wireshark',
        url: 'https://www.wireshark.org/download.html',
        description: 'Network protocol analyzer terkemuka. Download versi stable sesuai OS (Windows/Linux/macOS).',
      },
      {
        name: 'CyberOps Workstation VM (Linux)',
        url: 'https://www.netacad.com/',
        description: 'VM Linux untuk praktik file permissions, user management, dan network tools. Dari portal NetAcad.',
      },
    ],
    steps: [
      {
        title: 'Analisis File Permissions Linux',
        description:
          'Praktikkan pembuatan file, pengaturan permission, dan pemahaman notasi simbolik vs oktal. Pahami bagaimana permission mempengaruhi akses.',
        command: 'touch testfile.txt && ls -la testfile.txt && chmod 750 testfile.txt && ls -la testfile.txt && echo "---Oktal---" && stat -c "%a %n" testfile.txt',
        expectedOutput:
          '-rw-rw-r-- 1 analyst analyst 0 Apr  9 14:30 testfile.txt\n-rwxr-x--- 1 analyst analyst 0 Apr  9 14:30 testfile.txt\n---Oktal---\n750 testfile.txt',
        hint: 'Coba akses file sebagai user berbeda: su - otheruser && cat /path/to/testfile.txt. Perhatikan error "Permission denied" vs sukses.',
        screenshotNote: 'Screenshot 1: Tampilkan perubahan permission sebelum dan sesudah chmod, termasuk output stat dengan notasi oktal.',
        warningNote: 'Jangan jalankan chmod 777 pada file atau direktori sistem! Ini membuka akses ke semua pengguna dan merupakan kesalahan keamanan fatal.',
      },
      {
        title: 'Manajemen User dan Grup',
        description:
          'Buat user baru, kelola grup, dan verifikasi konfigurasi menggunakan tools standar. Ini mensimulasikan tugas sysadmin sehari-hari yang kritis dari perspektif keamanan.',
        command: 'sudo useradd -m -s /bin/bash -c "Test Security User" testuser && sudo passwd testuser && sudo usermod -aG sudo testuser && id testuser && cat /etc/passwd | grep testuser',
        expectedOutput:
          'uid=1001(testuser) gid=1001(testuser) groups=1001(testuser),27(sudo)\ntestuser:x:1001:1001:Test Security User:/home/testuser:/bin/bash',
        hint: 'Setelah membuat user, coba "su - testuser" untuk login sebagai user tersebut dan verifikasi privilege dengan "sudo whoami". Pastikan sudo berhasil karena testuser ada di grup sudo.',
        screenshotNote: 'Screenshot 2: Output id, /etc/passwd entry, dan /etc/group entry untuk testuser. Verifikasi group membership.',
      },
      {
        title: 'Konfigurasi dan Analisis Firewall (iptables)',
        description:
          'Periksa aturan firewall yang berlaku, tambahkan aturan baru, dan pahami chain INPUT, OUTPUT, FORWARD. Ini adalah kontrol keamanan jaringan paling dasar di Linux.',
        command: 'sudo iptables -L -n -v --line-numbers && echo "---Stats---" && sudo iptables -L -n -v -t filter',
        expectedOutput:
          'Chain INPUT (policy ACCEPT 0 packets, 0 bytes)\nnum  pkts bytes target  prot opt  in   out  source     destination\n...\nChain FORWARD (policy DROP 0 packets, 0 bytes)\n...\nChain OUTPUT (policy ACCEPT 0 packets, 0 bytes)',
        hint: 'Policy "ACCEPT" berarti semua traffic diterima by default (firewall terbuka). Policy "DROP" lebih aman. Untuk tambah rule: sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT',
        screenshotNote: 'Screenshot 3: Output iptables -L lengkap dengan line numbers. Identifikasi dan jelaskan setiap chain dan policy-nya.',
        warningNote: 'Hati-hati saat mengubah aturan firewall di server remote — salah aturan bisa membuat Anda terkunci dari server! Selalu test di VM lokal terlebih dahulu.',
      },
      {
        title: 'Capture Paket dengan Wireshark',
        description:
          'Buka Wireshark, pilih interface aktif, mulai capture. Gunakan display filter untuk memfokuskan analisis. Generate traffic (browsing, ping) untuk mendapatkan paket yang bervariasi.',
        command: 'tcpdump -i eth0 -n -c 50 -w /tmp/lab_capture.pcap && echo "Capture selesai, buka di Wireshark"',
        expectedOutput: 'tcpdump: listening on eth0, link-type EN10MB (Ethernet), snapshot length 262144 bytes\n50 packets captured\n50 packets received by filter\n0 packets dropped by kernel',
        hint: 'Jika Wireshark GUI tersedia, gunakan langsung. Jika hanya CLI tersedia (server), gunakan tcpdump dan transfer file .pcap ke mesin yang ada Wireshark. Gunakan "scp user@server:/tmp/lab_capture.pcap ."',
        screenshotNote: 'Screenshot 4: Tampilan Wireshark (atau output tcpdump) dengan capture aktif. Tunjukkan minimal 3 protokol berbeda yang terlihat.',
      },
      {
        title: 'Analisis Paket — Identifikasi Protokol dan Anomali',
        description:
          'Analisis capture yang sudah dilakukan. Gunakan display filter untuk mengidentifikasi DNS queries, HTTP/HTTPS connections, dan cari apakah ada traffic yang mencurigakan (cleartext credentials, anomali ARP, dll.).',
        command: 'tshark -r /tmp/lab_capture.pcap -q -z protocol,tree 2>/dev/null | head -30',
        expectedOutput: 'Protocol Breakdown:\n===================================================================\nETH    100.0%   50\nIP     95.0%    47\nTCP    70.0%    35\nDNS    20.0%    10\nHTTP   15.0%    7',
        hint: 'Di Wireshark, gunakan Statistics > Protocol Hierarchy untuk visualisasi ini. Coba filter "http" dan cari apakah ada POST request yang bisa mengandung data sensitif. Filter "dns" untuk melihat domain apa yang di-query.',
        screenshotNote: 'Screenshot 5: Protocol statistics dari capture, dan minimal satu packet yang di-expand untuk melihat semua layer (Ethernet, IP, TCP, Application).',
      },
    ],
    deliverable:
      'Laporan lab (format PDF, minimal 6 halaman) berisi: (1) 5 screenshot berlabel dari setiap langkah, (2) jawaban pertanyaan: Apa perbedaan notasi simbolik dan oktal untuk permission Linux? Mengapa packet capture membutuhkan privilege root? Apa informasi yang tersedia di setiap layer OSI dari satu packet yang dianalisis di Wireshark? (3) Identifikasi dan jelaskan semua protokol yang ditemukan dalam capture Anda, (4) Temuan anomali (jika ada) dan rekomendasi mitigasi, (5) Refleksi: bagaimana Wireshark dapat membantu SOC dalam mendeteksi ARP spoofing?',
  },

  // ──────────────────────────────────────────────
  // DEFAULT CASE STUDY (fallback)
  // ──────────────────────────────────────────────
  caseStudy: {
    title: 'Serangan Man-in-the-Middle pada Jaringan Kampus',
    scenario:
      'Di jaringan kampus universitas, seorang mahasiswa teknik informatika melakukan ARP spoofing menggunakan tools Ettercap di Linux untuk menyadap kredensial login portal akademik (SIAKAD) yang masih menggunakan HTTP cleartext. Dalam 45 menit, mahasiswa tersebut berhasil mengumpulkan username dan password 37 mahasiswa lain yang sedang login dari lab komputer. Serangan terdeteksi oleh staf IT setelah beberapa mahasiswa melaporkan login gagal meskipun password sudah benar.',
    questions: [
      'Jelaskan secara teknis bagaimana serangan ARP spoofing bekerja di Layer 2 (Data Link Layer) OSI. Buat diagram sederhana yang menunjukkan perbedaan kondisi ARP table sebelum dan sesudah serangan.',
      'Bagaimana analisis Wireshark pada traffic yang melewati jaringan kampus dapat membantu mendeteksi serangan ARP spoofing? Filter Wireshark apa yang digunakan dan anomali apa yang terlihat?',
      'Protokol dan konfigurasi keamanan apa yang dapat mencegah serangan MITM ini? Diskusikan: migrasi ke HTTPS (HSTS), Dynamic ARP Inspection (DAI) pada switch, dan 802.1X authentication.',
      'Buat prosedur respons insiden langkah demi langkah untuk menangani laporan MITM attack di jaringan kampus: dari deteksi hingga eradication dan pelaporan ke pihak berwajib (karena ini pelanggaran UU ITE).',
    ],
  },

  // ──────────────────────────────────────────────
  // CASE STUDY POOL (15 variants)
  // ──────────────────────────────────────────────
  caseStudyPool: [
    {
      title: 'ARP Spoofing pada Jaringan Internal RS Regional Sehat Jaya',
      scenario:
        'Administrator jaringan RS Regional Sehat Jaya menemukan anomali setelah menerima laporan bahwa koneksi ke sistem RIS (Radiology Information System) berbasis Linux terasa sangat lambat. Analisis Wireshark pada switch menunjukkan ARP reply yang tidak diminta (gratuitous ARP) dalam volume tinggi dari satu MAC address yang tidak dikenal, mengasosiasikan IP gateway (192.168.100.1) dengan MAC address mesin tidak dikenal. Investigasi menemukan sebuah Raspberry Pi yang tersembunyi di balik rak server yang terhubung ke jaringan internal selama estimasi 6 hari.',
      questions: [
        'Jelaskan secara teknis bagaimana penyerang menggunakan Raspberry Pi dan tools seperti arpspoof atau Ettercap untuk melakukan ARP poisoning di jaringan rumah sakit. Bagaimana teknik "man-in-the-middle" terjadi setelah ARP table terpoisoning?',
        'Analisis Wireshark display filter apa yang dapat mendeteksi ARP spoofing? Jelaskan anomali spesifik yang terlihat dalam packet capture (jumlah ARP reply vs request, MAC-IP mapping yang berubah, gratuitous ARP yang mencurigakan).',
        'Data radiologi pasien yang mungkin tersadap memiliki implikasi privasi medis yang serius. Identifikasi protokol apa di atas ARP yang masih rentan (HL7 cleartext, DICOM tanpa enkripsi) dan apa yang sudah aman. Rancang enkripsi end-to-end untuk RIS.',
        'Rancang pengamanan fisik dan jaringan berlapis untuk mencegah rogue device seperti Raspberry Pi: port security berbasis MAC di switch, 802.1X network access control, dan monitoring fisik (CCTV + asset tagging di setiap port switch).',
      ],
    },
    {
      title: 'Unauthorized SSH Access via Weak Key di BPR Kredit Maju',
      scenario:
        'BPR Kredit Maju menjalankan server Linux Ubuntu 22.04 untuk sistem core banking mereka. Tim SOC mendeteksi login SSH berhasil dari IP address di luar negeri pada pukul 03.00 WIB. Investigasi /var/log/auth.log menunjukkan user "dbadmin" login menggunakan SSH key authentication (bukan password), padahal dbadmin seharusnya hanya bisa login dari jaringan internal. Forensik menemukan file ~/.ssh/authorized_keys berisi public key asing. Lebih lanjut, ditemukan SSH private key dbadmin tersimpan di repository GitLab publik yang dibuat developer 3 bulan lalu.',
      questions: [
        'Bagaimana SSH key authentication bekerja secara teknis (public-private key pair, authorized_keys file, handshake)? Mengapa kebocoran private key ke repository publik adalah bencana keamanan, dan bagaimana penyerang menemukannya (GitHub Dorks, GitLeaks tool)?',
        'Analisis auth.log untuk rekonstruksi timeline serangan: event apa yang dicatat saat SSH login berhasil vs gagal? Bagaimana membedakan login legitimate dari login penyerang dalam log (source IP, time, command yang dijalankan setelah login)?',
        'Rancang SSH hardening policy untuk server Linux di BPR: disable root login, disable password auth, restrict user access (AllowUsers), change default port, implement fail2ban, dan SSH key management procedure (rotation, revocation).',
        'Pengembang yang secara tidak sengaja upload private key harus bertanggung jawab tanpa membuat budaya blame yang kontraproduktif. Rancang program secure coding culture: secret scanning di CI/CD pipeline (GitLeaks, truffleHog), pre-commit hooks, dan cara mengedukasi developer.',
      ],
    },
    {
      title: 'Eksploitasi File Permission untuk Privilege Escalation di Server Pemerintah Disdukcapil',
      scenario:
        'Penetration tester yang dikontrak Dinas Kependudukan dan Catatan Sipil (Disdukcapil) berhasil mendapatkan shell sebagai user "webserver" melalui kerentanan web application. Dari sana, tester melakukan privilege escalation ke root dalam 15 menit menggunakan teknik: (1) menemukan file SUID milik root di /opt/legacy_app/backup_util yang bisa dieksploitasi, (2) menemukan file /etc/cron.d/cleanup.sh yang world-writable namun dieksekusi sebagai root setiap 5 menit, (3) menemukan password root tersimpan di file /var/www/config.php yang readable oleh webserver.',
      questions: [
        'Jelaskan masing-masing vektor privilege escalation yang ditemukan: (a) SUID binary exploitation, (b) writable cron script sebagai root, (c) credential exposure di config file. Untuk masing-masing, jelaskan teknis eksploitasi dan perintah yang digunakan.',
        'Bagaimana security auditor menemukan kerentanan ini secara sistematis? Buat checklist privilege escalation audit untuk Linux server: perintah find/grep apa yang dijalankan, output apa yang dicari, dan bagaimana memprioritaskan temuan.',
        'Rancang perbaikan spesifik untuk masing-masing kerentanan yang ditemukan: bagaimana menghapus SUID bit yang tidak perlu, cara mengamankan cron script, dan best practice penyimpanan credential di aplikasi web (environment variables, vault, encrypted config).',
        'Server Disdukcapil menyimpan data KTP dan KK seluruh warga. Jika penyerang nyata berhasil privilege escalation, data apa yang bisa dicuri dan apa dampaknya terhadap warga? Kaitkan dengan kewajiban melindungi data dalam UU PDP Indonesia.',
      ],
    },
    {
      title: 'Serangan DNS Poisoning pada Jaringan Universitas Archipelago Raya',
      scenario:
        'Mahasiswa di Universitas Archipelago Raya melaporkan bahwa saat mengakses portal SIAKAD (yang seharusnya di IP 103.x.x.x), browser mengarahkan mereka ke halaman login palsu yang identik tetapi di IP berbeda. Investigasi menunjukkan DNS resolver internal kampus (dnsmasq) telah dikonfigurasi ulang — entri DNS untuk siakad.archipelago.ac.id ditambahkan oleh entitas tidak sah yang mengarahkan ke server phishing. Router DNS server ternyata menggunakan default credential (admin/admin) yang tidak pernah diganti. Sebanyak 280 mahasiswa memasukkan kredensial ke halaman palsu.',
      questions: [
        'Jelaskan perbedaan antara DNS Cache Poisoning (menyerang resolver cache) dan DNS Hijacking via router compromise (seperti dalam kasus ini). Jelaskan teknis bagaimana query DNS diproses dari client hingga authoritative server.',
        'Bagaimana DNSSEC (DNS Security Extensions) bisa mencegah DNS poisoning? Jelaskan mekanisme signing, chain of trust dari root server hingga domain, dan mengapa belum semua domain menggunakannya.',
        'Analisis dari Wireshark: bagaimana membedakan DNS response legitimate dari DNS response palsu dalam packet capture? Field apa yang harus dibandingkan (answer section, TTL yang mencurigakan, response dari IP tidak dikenal)?',
        'Rancang prosedur emergency untuk menangani 280 mahasiswa yang telah memasukkan kredensial ke halaman phishing: reset massal password, monitoring aktivitas akun yang mungkin sudah dikompromikan, dan komunikasi krisis ke mahasiswa.',
      ],
    },
    {
      title: 'Portscan dan Network Reconnaissance pada Infrastruktur E-Commerce BelanjaCepat',
      scenario:
        'SOC BelanjaCepat.id mendeteksi dari SIEM bahwa satu IP address eksternal melakukan TCP SYN scan terhadap seluruh server farm (200+ IP) dalam rentang 192.168.0.0/16 selama 3 jam. Scan teridentifikasi melalui volume SYN packet anomali dan pola ke semua port 1-65535. Setelah scan selesai, aktivitas beralih ke port specific (22, 80, 443, 3306, 5432) dengan koneksi penuh ke beberapa target. Log nginx menunjukkan beberapa request ke path yang mengindikasikan directory enumeration (/admin, /phpinfo.php, /wp-login.php).',
      questions: [
        'Jelaskan perbedaan teknis antara TCP SYN scan (-sS Nmap), TCP Connect scan (-sT), dan UDP scan (-sU). Mengapa SYN scan disebut "half-open scan" dan mengapa lebih sulit dideteksi dari TCP Connect scan?',
        'Buat SIEM correlation rule untuk mendeteksi port scanning: parameter apa (jumlah port berbeda per waktu, SYN tanpa ACK, dst port distribution), threshold berapa yang digunakan, dan bagaimana menghindari false positive dari legitimate network management tools?',
        'Directory enumeration pada /admin, /phpinfo.php, /wp-login.php adalah reconnaissance untuk mengetahui teknologi yang digunakan. Rancang response: bagaimana menghapus atau menyembunyikan informasi sensitif (phpinfo.php, error messages, server headers), dan bagaimana memblokir enumerasi tools.',
        'Dari perspektif threat intelligence, port scan dari IP eksternal adalah early warning indicator. Jelaskan tindakan proaktif yang bisa dilakukan SOC setelah mendeteksi scan ini: IP reputation check, geo-blocking, honeyport deployment untuk menjebak dan mengidentifikasi penyerang.',
      ],
    },
    {
      title: 'Malware Linux via Cron Persistence di Server OT Pabrik Semen Nusantara',
      scenario:
        'Teknisi keamanan PT Semen Nusantara menemukan anomali pada server Linux yang mengontrol sistem produksi: setiap 10 menit, proses tidak dikenal "kworker2" (bukan kernel worker asli) muncul sebentar dan mengirim data ke IP eksternal. Investigasi crontab root menunjukkan entri tersembunyi: "*/10 * * * * /tmp/.hidden_dir/kworker2 > /dev/null 2>&1". Direktori /tmp/.hidden_dir dibuat dengan nama diawali titik untuk menyembunyikan dari ls biasa. Binary kworker2 adalah malware ELF x86_64 yang terdeteksi sebagai cryptominer Monero.',
      questions: [
        'Jelaskan teknik persistence malware menggunakan cron di Linux: di mana saja cron job bisa tersimpan (user crontab, /etc/cron.d/, /etc/crontab, /var/spool/cron/), dan bagaimana penyerang menyembunyikan proses menggunakan nama yang menyerupai kernel process.',
        'Buat incident response playbook untuk menemukan dan eradicate malware Linux: dari mana memulai investigasi (ps aux, lsof, crontab -l, find / -mtime -7), bagaimana memastikan eradication complete (tidak ada persistence tersisa), dan kapan aman untuk restart sistem.',
        'Kryptominer menggunakan resource CPU server OT yang semestinya untuk proses industri. Selain dampak finansial (listrik), apa risiko operasional dari crypto mining yang berjalan di server OT/ICS? Diskusikan dalam konteks safety di pabrik semen.',
        'Rancang hardening server Linux untuk lingkungan OT: noexec mount option untuk /tmp, cron monitoring otomatis via inotify/auditd, application whitelist menggunakan AppArmor, dan network egress filtering untuk memblokir koneksi ke mining pool.',
      ],
    },
    {
      title: 'BGP Route Hijacking yang Mempengaruhi Operator Telekomunikasi NusaNet',
      scenario:
        'NusaNet (ISP regional) melaporkan bahwa selama 45 menit, sebagian traffic internet dari pelanggan mereka (khususnya menuju prefix IP milik beberapa bank besar) secara tidak sengaja di-route melalui AS di luar negeri sebelum sampai ke tujuan. Insiden terdeteksi ketika beberapa pelanggan melaporkan latency tinggi ke layanan banking online dan tools monitoring BGP (BGPmon, RIPE RIS) menunjukkan prefix yang sebelumnya diumumkan NusaNet tiba-tiba diumumkan oleh AS lain dengan AS-path lebih pendek. NusaNet tidak pernah memberikan otorisasi.',
      questions: [
        'Jelaskan bagaimana BGP (Border Gateway Protocol) bekerja dan mengapa BGP route hijacking mungkin terjadi: konsep prefix advertisement, AS-path selection, dan mengapa internet secara historis "mempercayai" semua BGP announcement tanpa verifikasi.',
        'BGP Hijacking bisa disengaja (serangan) atau tidak sengaja (misconfiguration). Jelaskan teknologi mitigasi: RPKI (Resource Public Key Infrastructure) yang memvalidasi prefix ownership, BGP Route Filtering berdasarkan IRR (Internet Routing Registry), dan peran MANRS (Mutually Agreed Norms for Routing Security).',
        'Dari perspektif packet analysis: bagaimana membuktikan bahwa traffic ter-reroute melalui AS asing menggunakan traceroute dan Wireshark? Apa yang berubah dalam TTL values dan hop sequence yang mengindikasikan detour tidak normal?',
        'Dampak routing anomali ke layanan perbankan: traffic yang melewati AS tidak terpercaya berpotensi disadap meskipun HTTPS. Jelaskan mengapa HTTPS masih memberikan proteksi bahkan jika routing dikompromikan, dan apa skenario di mana proteksi ini bisa gagal (SSL stripping, fake certificate jika CA dikompromikan).',
      ],
    },
    {
      title: 'Cryptojacking via Docker Container yang Salah Konfigurasi di Startup Fintech CloudPay',
      scenario:
        'CloudPay (platform payment berbasis cloud) mengalami tagihan cloud (AWS EC2) yang melonjak 400% tanpa penambahan fitur baru. Investigasi menemukan bahwa Docker daemon API (port 2375) pada beberapa VM production terekspos ke internet tanpa autentikasi karena misconfiguration deployment script yang menggunakan "-H tcp://0.0.0.0:2375" tanpa TLS. Penyerang membuat container baru yang menjalankan cryptominer XMRig, serta membuat backdoor container yang memberikan shell akses ke host via volume mount /:/host.',
      questions: [
        'Jelaskan bagaimana Docker API yang terekspos tanpa autentikasi memungkinkan penyerang mendapatkan akses penuh ke host sistem (bukan hanya container). Teknis: bagaimana volume mount / ke container bisa mengakibatkan container escape ke host?',
        'Lakukan forensik: dari mana Anda mulai investigasi Docker security incident? Perintah apa yang dijalankan untuk mengidentifikasi container mencurigakan, image tidak dikenal, volume yang di-mount, network yang dibuat, dan command yang dieksekusi di dalam container.',
        'Rancang Docker security hardening: disable API tanpa TLS, implementasi TLS mutual authentication untuk Docker API, penggunaan Docker Content Trust (image signing), rootless Docker, dan network policy untuk container isolation.',
        'Tagihan cloud yang melonjak adalah financial impact yang langsung terasa. Rancang cloud cost anomaly detection: AWS Cost Explorer alert, budget alarm, dan bagaimana SOC dapat menghubungkan cost anomaly dengan security incident untuk deteksi dini cryptojacking.',
      ],
    },
    {
      title: 'Log Tampering dan Penghapusan Jejak di Server Linux Logistik Garuda Cargo',
      scenario:
        'Investigasi di perusahaan logistik Garuda Cargo menemukan bahwa setelah insiden unauthorized access ke server Linux berbasis CentOS, penyerang mencoba menghapus jejak dengan: menghapus baris tertentu dari /var/log/auth.log menggunakan sed, memodifikasi timestamp file yang dibuat menggunakan touch -t, dan mencoba menghapus bash_history dengan "cat /dev/null > ~/.bash_history". Namun, forensik menemukan bahwa auditd masih mencatat semua operasi file dan perintah, termasuk upaya penghapusan log itu sendiri.',
      questions: [
        'Jelaskan teknik anti-forensik yang digunakan penyerang: bagaimana sed bisa menghapus baris spesifik dari log, apa yang dilakukan "touch -t" pada timestamp file, dan mengapa menghapus bash_history tidak cukup jika sistem menggunakan auditd.',
        'Linux Audit Daemon (auditd) dengan konfigurasi yang benar adalah mekanisme tamper-resistant logging. Jelaskan arsitektur auditd: kernel audit subsystem, auditd daemon, ausearch/aureport tools, dan bagaimana membuat rule audit yang memonitor penulisan ke file log kritis.',
        'Dari perspektif forensik digital, jelaskan sumber artefak alternatif yang dapat merekonstruksi aktivitas penyerang meskipun bash_history dan syslog sudah dimanipulasi: /proc filesystem, systemd journal, SIEM yang sudah menerima log sebelumnya, dan filesystem timestamps yang sulit dimanipulasi.',
        'Rancang immutable logging architecture untuk Garuda Cargo: centralized log shipping ke SIEM terpusat (sebelum bisa dihapus di sumber), log integrity via hash chaining, write-once storage untuk log retention, dan alerting untuk setiap attempt modifikasi log.',
      ],
    },
    {
      title: 'Eksploitasi Kerentanan Apache Web Server di PLTU Energi Timur',
      scenario:
        'PLTU Energi Timur menjalankan web interface monitoring SCADA berbasis Apache 2.4.49 di Linux CentOS 7. Tim Red Team menemukan bahwa versi ini rentan terhadap CVE-2021-41773 (Path Traversal dan Remote Code Execution). Dengan exploit sederhana, Red Team berhasil membaca file /etc/passwd dan kemudian mengeksekusi perintah sistem melalui mod_cgi. Dari akses web, mereka melakukan pivot ke jaringan OT internal yang terhubung ke web server via VLAN yang tidak tersegmentasi. Server web tidak pernah di-patch karena "tidak ada window maintenance yang cocok".',
      questions: [
        'Jelaskan CVE-2021-41773 secara teknis: apa yang dimaksud Path Traversal, bagaimana Apache 2.4.49 gagal memvalidasi input path, dan bagaimana kondisi mod_cgi memungkinkan RCE. Sertakan contoh HTTP request yang mengeksploitasi kerentanan ini.',
        'Vulnerability management di lingkungan OT/SCADA menghadapi tantangan unik: tidak bisa sembarangan patch karena ketersediaan 24/7 critical infrastructure adalah prioritas. Rancang vulnerability management process yang menyeimbangkan security (patch ASAP) dan availability (minimal downtime).',
        'Pivoting dari web server ke jaringan OT terjadi karena tidak ada segmentasi yang memadai. Rancang arsitektur jaringan yang benar untuk web interface SCADA: DMZ untuk web server, industrial DMZ sebagai buffer, dan unidirectional security gateway (data diode) antara IT dan OT network.',
        'Apache CVE-2021-41773 memiliki CVSS 7.5 (HIGH) namun jika mod_cgi aktif menjadi 9.8 (CRITICAL). Jelaskan framework CVSS (Base Score, Temporal Score, Environmental Score) dan bagaimana Environmental Score bisa meningkatkan prioritas patch untuk infrastruktur kritis seperti PLTU.',
      ],
    },
    {
      title: 'Serangan MITM via Rogue Access Point di Studio Stasiun TV MediaVision',
      scenario:
        'Teknisi IT MediaVision menemukan sebuah Wi-Fi access point tidak dikenal ("MediaVision_Staff_Free") dengan sinyal sangat kuat di dalam gedung. Beberapa kru produksi sudah terhubung ke AP ini dan traffic mereka ter-intercept. Analisis Wireshark dari AP capture menunjukkan: script login portal internal ter-capture dalam cleartext (HTTP), beberapa koneksi SSL/TLS menunjukkan sertifikat self-signed yang berbeda dari biasanya (kemungkinan SSL stripping), dan DNS response dimanipulasi untuk mengarahkan ke server phishing.',
      questions: [
        'Jelaskan teknis "Evil Twin" attack: bagaimana rogue AP dibuat untuk menyerupai jaringan legitimate, mekanisme "de-authentication attack" untuk memaksa client disconnect dari AP asli, dan bagaimana MITM terjadi setelah client terhubung ke Evil Twin.',
        'Dari capture Wireshark rogue AP, analisis apa yang bisa dilakukan: bagaimana mengidentifikasi cleartext credentials, mendeteksi SSL stripping (port 80 vs 443 anomali, HTTPS redirect yang hilang), dan membuktikan DNS manipulation dari packet trace.',
        'Rancang wireless security architecture untuk MediaVision: 802.1X/WPA3-Enterprise dengan EAP-TLS, WIDS (Wireless Intrusion Detection System) untuk deteksi rogue AP, client-side certificate untuk mutual authentication, dan segmentasi jaringan tamu vs produksi.',
        'Wi-Fi security audit checklist untuk gedung kantor: bagaimana melakukan survey dengan tools seperti Airodump-ng untuk inventarisasi AP, identifikasi AP tanpa enkripsi atau dengan enkripsi lemah (WEP/WPA1), deteksi channel overlap yang mencurigakan, dan prosedur response jika rogue AP ditemukan.',
      ],
    },
    {
      title: 'SQL Injection dan File Traversal di Portal Firma Hukum Solusi Digital Pratama',
      scenario:
        'Firma hukum Solidi Digital Pratama menjalankan portal dokumen berbasis PHP di Linux Ubuntu. Penetration tester menemukan bahwa parameter pencarian dokumen rentan terhadap SQL Injection (UNION-based), memungkinkan dump tabel database berisi nama klien, nomor perkara, dan isi dokumen hukum sensitif. Selain itu, parameter file download (?file=../../../etc/passwd) rentan terhadap Path Traversal, memungkinkan membaca file system sembarang. Keduanya adalah top OWASP vulns yang seharusnya dicegah dengan validasi input dasar.',
      questions: [
        'Demonstrasikan secara konseptual bagaimana UNION-based SQL Injection bekerja pada query pencarian: mulai dari penentuan jumlah kolom, jenis data, hingga query untuk dump nama tabel dan isinya. Apa yang membuat SQL Injection masih menjadi kerentanan paling umum meskipun solusinya sudah lama diketahui?',
        'Jelaskan Path Traversal attack: bagaimana ../ (directory traversal) memungkinkan keluar dari web root, file sensitif apa yang bisa diakses di Linux (/etc/passwd, /etc/shadow, SSH keys, config file), dan mengapa URL encoding (%2e%2e%2f) sering digunakan untuk bypass filter.',
        'Dari perspektif blue team: bagaimana menganalisis Nginx/Apache access log untuk mendeteksi SQL Injection dan Path Traversal yang sudah terjadi? Pola regex apa dalam log yang mengindikasikan kedua serangan ini?',
        'Rancang secure coding standard untuk aplikasi PHP: prepared statements (PDO) untuk mencegah SQLi, path normalization dan whitelist untuk file access, Content Security Policy header, dan bagaimana implementasi WAF (ModSecurity) sebagai defense-in-depth.',
      ],
    },
    {
      title: 'Serangan SYN Flood terhadap Portal Klaim Online Asuransi Proteksi Prima',
      scenario:
        'Portal klaim online PT Proteksi Prima (asuransi jiwa) mengalami downtime total selama 4 jam pada tanggal jatuh tempo klaim besar. Log server Linux menunjukkan antrian half-open TCP connection (SYN_RECV state) yang membanjiri memory kernel — server menerima 50.000 SYN packet per detik dari ribuan IP berbeda (SYN Flood dengan IP spoofing). Semua CPU core di 100%, dan server tidak bisa menerima koneksi baru dari nasabah yang legitimate. `ss -s` menampilkan jutaan socket dalam state SYN_RECV.',
      questions: [
        'Jelaskan secara teknis bagaimana SYN Flood bekerja untuk menghabiskan state table server: proses 3-way handshake yang tidak selesai, half-open connections di state SYN_RECV, dan mengapa IP spoofing membuat mitigasi sederhana (blokir IP) tidak efektif.',
        'Cara mitigasi SYN Flood di Linux tanpa hardware dedicated DDoS protection: SYN Cookies (sysctl net.ipv4.tcp_syncookies=1), pengurangan tcp_synack_retries, iptables rate limiting, dan kapan masing-masing efektif vs tidak efektif.',
        'Dari perspektif packet analysis di Wireshark: bagaimana membedakan traffic SYN Flood dari traffic legitimate yang tinggi (misalnya saat flash sale)? Karakteristik traffic SYN Flood apa yang terlihat di protocol statistics, conversation statistics, dan per-packet inspection?',
        'Rancang arsitektur DDoS protection berlapis untuk portal klaim asuransi: upstream ISP nullrouting untuk volume attack, CDN dengan DDoS scrubbing (Cloudflare/Akamai), on-premise iptables/nftables rate limiting sebagai last resort, dan prosedur eskalasi ke ISP dan BSSN untuk serangan di atas kapasitas.',
      ],
    },
    {
      title: 'Unauthorized Network Scan dan Lateral Movement di Jaringan Developer Properti Griya Nusa',
      scenario:
        'Tim IT PT Griya Nusa menemukan bahwa komputer seorang arsitek senior terinfeksi malware yang kemudian secara otomatis melakukan Nmap scan terhadap seluruh jaringan internal (subnet 10.10.0.0/16 yang berisi 200+ server properti dan BIM/CAD servers) untuk menemukan target lateral movement. Tool tersebut menggunakan teknik "living off the land" di Linux: memanfaatkan nc (netcat), bash, dan /dev/tcp untuk scanning tanpa memerlukan Nmap terinstall. Temuan SOC: 47 server sudah diakses menggunakan credential yang dicuri dari workstation arsitek.',
      questions: [
        'Jelaskan teknik port scanning menggunakan /dev/tcp bash built-in yang tidak memerlukan tools eksternal (living off the land di Linux). Mengapa teknik ini sulit dideteksi oleh sistem yang hanya memonitor execution dari binary yang dikenal?',
        'Bagaimana membedakan aktivitas network scanning dari traffic legitimate di lingkungan engineering (di mana traffic ke banyak host/port memang normal untuk deployment dan testing)? Metrik apa di SIEM yang membedakan scan dari aktivitas normal?',
        'Dengan 47 server sudah diakses, buat strategi containment yang menyeimbangkan kebutuhan investigasi (jangan sampai penyerang aware) dengan perlindungan (jangan biarkan lateral movement berlanjut). Kapan melakukan full network isolation dan kapan melakukan silent monitoring?',
        'Rancang network access control untuk lingkungan desain properti: micro-segmentation antara workstation desainer, server BIM, dan server keuangan; authentication ke server menggunakan SSH certificate (bukan password); dan SIEM rule untuk mendeteksi akses server dalam jumlah tidak normal dari satu source.',
      ],
    },
    {
      title: 'Insiden Network Monitoring yang Mengungkap Exfiltrasi Data di Server Lembaga Zakat Amanah',
      scenario:
        'Tim IT Lembaga Zakat Amanah melakukan rutinitas monitoring jaringan bulanan menggunakan Wireshark pada gateway dan menemukan traffic yang tidak biasa: setiap malam pukul 01.00-02.00, server database donatur mengirimkan data ke IP eksternal (203.x.x.x, GeoIP: luar negeri) via port 443 HTTPS. Volume transfer: 200-400 MB per malam selama 3 minggu terakhir. Investigasi menunjukkan server database menjalankan Python script tersembunyi yang mengenkripsi data dengan AES dan menguploadnya ke layanan cloud storage menggunakan API key.',
      questions: [
        'Bagaimana Wireshark dan tshark membantu mengidentifikasi exfiltrasi data meskipun traffic dienkripsi (HTTPS)? Teknik apa yang digunakan (metadata analysis, connection timing, volume anomaly, JA3 TLS fingerprinting) tanpa perlu mendekripsi traffic?',
        'Python script yang mengenkripsi dan mengupload data adalah teknik data exfiltration yang canggih. Jelaskan bagaimana script ini mungkin tersembunyi di sistem (path, nama file menyerupai system file, cron job), dan bagaimana menemukannya dalam investigasi forensik.',
        'API key yang ditemukan di script memberikan akses ke akun cloud storage penyerang. Prosedur apa yang harus diikuti untuk: (a) mempreservasi bukti dari cloud storage sebelum penyerang menyadari dan menghapusnya, (b) mengidentifikasi seluruh data yang sudah ter-exfiltrasi, dan (c) koordinasi dengan penyedia cloud untuk investigasi?',
        'Lembaga zakat mengelola data donatur yang sangat sensitif (riwayat donasi, nominal, data personal). Rancang Data Loss Prevention (DLP) yang realistis dengan budget terbatas: network DLP berbasis Open Source (Zeek/Security Onion untuk traffic analysis), host DLP (auditd rules untuk monitor file access massal), dan prosedur response jika DLP alert terpicu.',
      ],
    },
  ],

  // ──────────────────────────────────────────────
  // QUIZ (13 questions: 8 MC + 5 essay)
  // ──────────────────────────────────────────────
  quiz: [
    {
      id: 1,
      question: 'Sebutkan 7 layer Model OSI secara berurutan dari bawah (Layer 1) ke atas (Layer 7):',
      type: 'multiple-choice',
      options: [
        'Application, Presentation, Session, Transport, Network, Data Link, Physical',
        'Physical, Data Link, Network, Transport, Session, Presentation, Application',
        'Network, Transport, Application, Physical, Data Link, Session, Presentation',
        'Physical, Network, Data Link, Transport, Application, Session, Presentation',
      ],
      answer: 'Physical, Data Link, Network, Transport, Session, Presentation, Application',
    },
    {
      id: 2,
      question: 'Sebuah file Linux memiliki permission "rwxr-x---". Apa yang berarti dalam notasi oktal dan siapa saja yang bisa mengeksekusi file ini?',
      type: 'multiple-choice',
      options: [
        'Oktal 777 — semua pengguna (user, group, dan others) bisa mengeksekusi file',
        'Oktal 750 — hanya owner (user) dan anggota group yang bisa mengeksekusi, others tidak bisa sama sekali',
        'Oktal 654 — owner bisa baca tulis, group hanya baca, others hanya eksekusi',
        'Oktal 640 — owner bisa baca tulis, group hanya baca, others tidak punya akses',
      ],
      answer: 'Oktal 750 — hanya owner (user) dan anggota group yang bisa mengeksekusi, others tidak bisa sama sekali',
    },
    {
      id: 3,
      question: 'Perbedaan utama antara MAC address dan IP address dalam konteks jaringan adalah:',
      type: 'multiple-choice',
      options: [
        'MAC address digunakan di internet (WAN), IP address digunakan di jaringan lokal (LAN) saja',
        'MAC address adalah alamat fisik unik di Layer 2 (Data Link) yang tidak berubah, sedangkan IP address adalah alamat logis di Layer 3 (Network) yang dapat dikonfigurasi ulang',
        'MAC address dapat diubah dengan mudah melalui DHCP, sedangkan IP address bersifat permanen di chip NIC',
        'Tidak ada perbedaan; keduanya digunakan di Layer 3 untuk routing antar jaringan',
      ],
      answer:
        'MAC address adalah alamat fisik unik di Layer 2 (Data Link) yang tidak berubah, sedangkan IP address adalah alamat logis di Layer 3 (Network) yang dapat dikonfigurasi ulang',
    },
    {
      id: 4,
      question: 'Proses enkapsulasi data dari Application Layer ke Physical Layer menghasilkan PDU (Protocol Data Unit) dalam urutan:',
      type: 'multiple-choice',
      options: [
        'Bits → Frame → Packet → Segment → Data',
        'Data → Packet → Segment → Frame → Bits',
        'Data → Segment → Packet → Frame → Bits',
        'Frame → Packet → Segment → Data → Bits',
      ],
      answer: 'Data → Segment → Packet → Frame → Bits',
    },
    {
      id: 5,
      question: 'Keunggulan utama IPv6 dibandingkan IPv4 dalam konteks keamanan jaringan adalah:',
      type: 'multiple-choice',
      options: [
        'IPv6 menggunakan 32-bit address yang lebih mudah diingat dan dikonfigurasi manual',
        'IPv6 memiliki built-in IPsec support dalam desain protokolnya, ruang alamat 128-bit yang hampir tak terbatas, dan fitur Stateless Address Autoconfiguration (SLAAC)',
        'IPv6 sepenuhnya menghilangkan kebutuhan NAT yang dianggap meningkatkan keamanan dengan menyembunyikan IP internal',
        'IPv6 hanya digunakan untuk jaringan internal (LAN) dan tidak bisa digunakan di internet publik',
      ],
      answer:
        'IPv6 memiliki built-in IPsec support dalam desain protokolnya, ruang alamat 128-bit yang hampir tak terbatas, dan fitur Stateless Address Autoconfiguration (SLAAC)',
    },
    {
      id: 6,
      question: 'Perintah Linux mana yang digunakan untuk menampilkan semua koneksi jaringan aktif beserta PID proses yang memilikinya (pengganti netstat modern)?',
      type: 'multiple-choice',
      options: [
        'nmap -sT localhost — scan semua port di localhost',
        'ifconfig -a — tampilkan semua network interface',
        'ss -tupn — tampilkan semua TCP/UDP connections dengan PID dan nama proses',
        'ip route show — tampilkan routing table jaringan',
      ],
      answer: 'ss -tupn — tampilkan semua TCP/UDP connections dengan PID dan nama proses',
    },
    {
      id: 7,
      question: 'Dalam Wireshark, display filter mana yang paling tepat untuk mendeteksi kemungkinan ARP Spoofing (ARP poisoning)?',
      type: 'multiple-choice',
      options: [
        'tcp.flags.syn == 1 and not tcp.flags.ack — mendeteksi half-open TCP connections',
        'arp.opcode == 2 — menampilkan semua ARP reply (gratuitous ARP dari penyerang akan muncul di sini)',
        'http.request.method == POST — mendeteksi data yang dikirim via HTTP',
        'ip.ttl < 10 — mendeteksi paket dengan TTL rendah yang sudah melewati banyak hop',
      ],
      answer: 'arp.opcode == 2 — menampilkan semua ARP reply (gratuitous ARP dari penyerang akan muncul di sini)',
    },
    {
      id: 8,
      question: 'Default gateway dalam sebuah jaringan berfungsi sebagai:',
      type: 'multiple-choice',
      options: [
        'Server DNS yang menerjemahkan nama domain menjadi IP address untuk semua perangkat di jaringan',
        'Firewall yang memblokir semua koneksi dari internet ke jaringan lokal secara otomatis',
        'Router atau perangkat Layer 3 yang menerima dan meneruskan paket ke jaringan di luar subnet lokal',
        'Switch yang menghubungkan semua perangkat dalam satu gedung melalui kabel Ethernet',
      ],
      answer: 'Router atau perangkat Layer 3 yang menerima dan meneruskan paket ke jaringan di luar subnet lokal',
    },
    {
      id: 9,
      question: 'Jelaskan perbedaan antara SELinux dan AppArmor sebagai implementasi Mandatory Access Control (MAC) di Linux! Kapan menggunakan masing-masing dan apa trade-off antara keduanya?',
      type: 'essay',
      answer:
        'SELinux (Security-Enhanced Linux): dikembangkan NSA, menggunakan model Type Enforcement (TE) berbasis label/context yang melekat pada inode filesystem. Setiap proses, file, port jaringan memiliki SELinux context (format user:role:type:level). Policy mengontrol "proses dengan type X boleh akses objek dengan type Y dalam operasi Z". Keunggulan: sangat granular dan powerful, mendukung Multi-Level Security (MLS) untuk lingkungan classified, berbasis inode sehingga tidak bisa di-bypass dengan rename file. Kelemahan: sangat kompleks untuk dikonfigurasi dan troubleshoot, kurva belajar tinggi, sering dinonaktifkan admin karena frustrasi. Default di RHEL/CentOS/Fedora. AppArmor: dikembangkan Canonical/SUSE, menggunakan model path-based — policy mendefinisikan file path apa dan capability apa yang boleh diakses oleh aplikasi tertentu. Format profil lebih mudah dibaca manusia. Keunggulan: jauh lebih mudah dikonfigurasi, tool aa-genprof membantu membuat profil dari log complain mode, lebih user-friendly. Kelemahan: path-based berarti hardlink atau bind mount bisa potensial bypass, tidak semendukung SELinux untuk MLS. Default di Ubuntu/Debian. Kapan menggunakan: SELinux untuk environment enterprise regulated (perbankan, pemerintah, militer) yang butuh keamanan maksimal dan tim yang capable. AppArmor untuk environment dimana usability dan kemudahan manajemen lebih diprioritaskan atau tim IT kurang familiar dengan SELinux. Keduanya lebih baik dari tidak ada MAC sama sekali.',
    },
    {
      id: 10,
      question: 'Jelaskan bagaimana serangan ARP Spoofing bekerja secara teknis di Layer 2 OSI! Mengapa protokol ARP rentan terhadap serangan ini dan apa mekanisme mitigasi yang tersedia di switch manageable?',
      type: 'essay',
      answer:
        'ARP (Address Resolution Protocol) bekerja di Layer 2 untuk memetakan IP address (Layer 3) ke MAC address (Layer 2). Saat device A ingin berkomunikasi dengan IP 192.168.1.1 (gateway), A mengirim broadcast "Who has 192.168.1.1? Tell 192.168.1.100". Gateway merespons unicast "192.168.1.1 is at aa:bb:cc:dd:ee:ff". A menyimpan mapping ini di ARP cache dan menggunakannya untuk semua komunikasi ke gateway. Kelemahan fatal ARP: protokol stateless dan tidak memiliki autentikasi sama sekali. Siapapun yang menerima ARP broadcast atau menerima ARP reply akan mempercayai dan memperbarui cache tanpa verifikasi. Cara kerja ARP Spoofing: Penyerang (attacker) mengirim ARP Reply palsu secara periodik ke semua host di subnet: "192.168.1.1 is at [MAC penyerang]". ARP cache semua host ter-poison — mereka mengirim traffic ke gateway melalui mesin penyerang. Penyerang meneruskan traffic ke gateway asli (IP forwarding aktif) sehingga komunikasi tetap berjalan tapi semua traffic melewati mesin penyerang (Man-in-the-Middle). Tools yang digunakan: arpspoof, Ettercap, Bettercap. Mitigasi di switch manageable: (1) Dynamic ARP Inspection (DAI): switch memvalidasi ARP packet dengan membandingkan terhadap DHCP snooping binding table (IP-MAC mapping yang diketahui valid dari proses DHCP). ARP reply yang IP-MAC-nya tidak cocok dengan binding table langsung di-drop. (2) Port Security: membatasi jumlah MAC address per port switch dan memblokir MAC yang tidak dikenal. (3) Static ARP entries: untuk gateway dan server kritis, configure static ARP entries di semua host (tidak menerima ARP update dinamis). Kurang scalable tapi efektif. (4) VLAN segmentation: membatasi blast radius ARP spoofing hanya dalam satu VLAN. (5) IPv6: NDProxy Inspection untuk menggantikan DAI di environment IPv6 (NDP menggantikan ARP).',
    },
    {
      id: 11,
      question: 'Anda menemukan proses Linux mencurigakan berjalan dari path /tmp/.x/sysupd. Jelaskan langkah investigasi forensik yang Anda lakukan secara berurutan menggunakan Linux CLI tools!',
      type: 'essay',
      answer:
        'Langkah investigasi: 1) JANGAN kill proses segera — live forensics dulu. Catat PID: ps aux | grep sysupd. 2) Dapatkan informasi proses lengkap: ls -la /proc/[PID]/ (symlink exe menunjukkan binary asli meskipun sudah dihapus dari disk), cat /proc/[PID]/cmdline (command line), cat /proc/[PID]/environ (environment variables). 3) Cek file binary: ls -la /tmp/.x/sysupd, file /tmp/.x/sysupd (jenis file: ELF executable?), sha256sum /tmp/.x/sysupd (hash untuk submit ke VirusTotal). 4) Periksa koneksi jaringan dari proses ini: ss -tupn | grep [PID], lsof -p [PID] -i (koneksi jaringan dari proses ini saja). 5) Periksa file yang dibuka proses: lsof -p [PID] (semua file yang sedang dibuka). 6) Cek kapan file dibuat: stat /tmp/.x/sysupd (shows atime, mtime, ctime), find /tmp -newer /etc/passwd (file yang lebih baru dari /etc/passwd). 7) Cek persistence: crontab -l dan cat /etc/cron.* untuk semua user, systemctl list-units --type=service (apakah ada service yang menjalankannya?), ls -la /etc/systemd/system/ (service file baru?). 8) Cek parent process: cat /proc/[PID]/status | grep PPid, kemudian ps -p [PPID] (siapa yang menjalankan proses ini?). 9) Dump memori proses (jika tools tersedia): gcore -o /tmp/forensic/sysupd_mem [PID]. 10) Submit hash ke VirusTotal: curl --silent "https://www.virustotal.com/vtapi/v2/file/report?apikey=KEY&resource=HASH". 11) Setelah live forensics, isolasi sistem dari jaringan, kemudian matikan dan lakukan disk forensics offline.',
    },
    {
      id: 12,
      question: 'Hitunglah subnet yang dihasilkan dari pembagian 10.100.0.0/21 menjadi subnet /24. Berapa jumlah subnet, jumlah host per subnet, dan tuliskan 3 subnet pertama beserta range host usable-nya!',
      type: 'essay',
      answer:
        '/21 ke /24: perbedaan 3 bit, maka 2³ = 8 subnet. /21 memiliki 2048 IP total (2^11 host bits). /24 memiliki 256 IP per subnet (254 host usable per subnet setelah dikurangi network dan broadcast). Jumlah subnet: 8. Jumlah host usable per subnet: 254. Subnet 1: Network 10.100.0.0/24, Broadcast 10.100.0.255, Host range 10.100.0.1 - 10.100.0.254. Subnet 2: Network 10.100.1.0/24, Broadcast 10.100.1.255, Host range 10.100.1.1 - 10.100.1.254. Subnet 3: Network 10.100.2.0/24, Broadcast 10.100.2.255, Host range 10.100.2.1 - 10.100.2.254. (Lanjutan: 10.100.3.0/24, 10.100.4.0/24, 10.100.5.0/24, 10.100.6.0/24, 10.100.7.0/24). Subnet mask /21 = 255.255.248.0. Subnet mask /24 = 255.255.255.0. Cara cepat di Linux: ipcalc 10.100.0.0/21 --split 8 untuk verifikasi. Relevansi keamanan: pembagian /21 menjadi 8 /24 subnet memungkinkan segmentasi jaringan (setiap departemen atau zona keamanan mendapat subnet terpisah), mempermudah network access control berbasis subnet, dan membatasi blast radius serangan (ransomware yang menyebar di satu /24 tidak otomatis menjangkau /24 lainnya).',
    },
    {
      id: 13,
      question: 'Jelaskan bagaimana Wireshark dapat digunakan untuk mendeteksi serangan DNS Tunneling! Filter apa yang digunakan, anomali apa yang terlihat dalam packet capture, dan bagaimana membedakannya dari traffic DNS yang normal?',
      type: 'essay',
      answer:
        'DNS Tunneling menyalahgunakan protokol DNS sebagai covert channel untuk exfiltrasi data atau C2 communication. Data diencode (biasanya base32/base64) ke dalam subdomain dari query DNS, dan response mengandung data dari server C2. Ini memanfaatkan fakta bahwa kebanyakan firewall mengizinkan DNS traffic keluar. Cara mendeteksi dengan Wireshark: 1) Filter dasar: "dns" untuk menampilkan semua traffic DNS. 2) Anomali yang terlihat: (a) Panjang query name tidak normal: dns.qry.name.len > 50 — nama domain legitimate jarang lebih dari 50 karakter, tapi subdomain yang diencode base64 bisa sangat panjang (misal: "aGVsbG8gd29ybGQ.evil.com"). (b) Volume TXT records tinggi: dns.qry.type == 16 (TXT) — DNS tunneling sering menggunakan TXT records karena bisa mengandung data arbitrari. (c) Volume query sangat tinggi ke satu domain: Statistics > DNS > Query Name menunjukkan satu domain dengan ribuan unique subdomain (setiap query berbeda = setiap query membawa data berbeda). (d) Query ke domain yang baru terdaftar atau dengan low reputation score. (e) Tidak ada response cache (setiap query berbeda tidak bisa di-cache — menyebabkan load tinggi ke resolver). 3) Pembanding traffic DNS normal: domain legitimate memiliki query yang berulang untuk nama yang sama (karena caching), panjang subdomain pendek dan bermakna, TXT records jarang digunakan (hanya SPF, DKIM, domain verification). 4) Tools tambahan: tshark -r capture.pcap -Y "dns" -T fields -e dns.qry.name | awk -F. \'{print length($1), $0}\' | sort -rn | head (sort berdasarkan panjang subdomain pertama). Iodine, dns2tcp, dnscat2 adalah tools tunneling umum yang bisa dideteksi dengan fingerprinting ini.',
    },
  ],

  // ──────────────────────────────────────────────
  // VIDEO RESOURCES
  // ──────────────────────────────────────────────
  videoResources: [
    {
      title: 'Linux Security Essentials for Beginners',
      youtubeId: 'Sa0KqbpLye4',
      description:
        'Dasar keamanan Linux: file permissions, user management, firewall (iptables), dan SSH hardening untuk pemula keamanan.',
      language: 'en',
      duration: '20:10',
    },
    {
      title: 'Wireshark Tutorial for Beginners — Complete Guide',
      youtubeId: 'lb1Dw0elj0Q',
      description:
        'Tutorial lengkap Wireshark dari instalasi hingga analisis packet tingkat lanjut: filter, statistics, dan investigasi protokol.',
      language: 'en',
      duration: '25:30',
    },
    {
      title: 'OSI Model Explained — Networking Fundamentals',
      youtubeId: 'vv4y_uOneC0',
      description:
        'Penjelasan mendalam Model OSI 7 layer dengan animasi visual: fungsi setiap layer, protokol, dan bagaimana data berpindah antar layer.',
      language: 'en',
      duration: '13:48',
    },
    {
      title: 'ARP Spoofing Attack and Prevention Explained',
      youtubeId: 'A7nih6SANdE',
      description:
        'Demonstrasi serangan ARP Spoofing dalam lab environment, cara kerja MITM, dan teknik pencegahan (DAI, static ARP, HTTPS).',
      language: 'en',
      duration: '14:55',
    },
    {
      title: 'Subnetting Made Easy — IPv4 Addressing',
      youtubeId: 'ecCuyq-Wprc',
      description:
        'Tutorial subnetting IPv4 yang mudah dipahami: CIDR notation, kalkulasi subnet mask, host range, dan contoh kasus nyata segmentasi jaringan.',
      language: 'en',
      duration: '18:22',
    },
  ],
};
