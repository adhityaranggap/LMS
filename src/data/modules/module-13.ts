import type { ModuleData, CaseStudyVariant } from '../module-types';

export const module13: ModuleData & { caseStudyPool: CaseStudyVariant[] } = {
  id: 13,
  title: "Security Tech & Data",
  description: "Teknologi Keamanan dan Data Keamanan Jaringan (Network Security Data)",
  iconName: "Database",
  theory: [
    {
      title: "Tipe Data Keamanan: Alert, Session, Transaction, Full Packet, Statistical",
      content: "SOC analyst bekerja dengan berbagai tipe data keamanan yang masing-masing memberikan visibilitas berbeda terhadap aktivitas jaringan. Memahami kekuatan dan keterbatasan setiap tipe data sangat penting untuk investigasi yang efektif. Data yang lebih kaya detailnya (seperti full packet capture) membutuhkan lebih banyak storage dan komputasi, sedangkan data yang lebih ringkas (seperti statistical/flow) lebih efisien namun kurang informatif untuk forensik mendalam. Tim keamanan harus memilih kombinasi tipe data yang tepat berdasarkan tujuan monitoring, kapasitas storage, dan persyaratan regulasi.",
      table: {
        caption: "Perbandingan Tipe Data Keamanan Jaringan",
        headers: ["Tipe Data", "Deskripsi", "Contoh", "Volume", "Kegunaan Utama", "Retensi Umum"],
        rows: [
          ["Alert Data", "Notifikasi kejadian keamanan spesifik yang dipicu oleh aturan atau anomali", "IDS/IPS alerts, AV detections, SIEM correlations", "Rendah", "Incident response cepat, prioritisasi", "90 hari - 1 tahun"],
          ["Session/Flow Data", "Metadata komunikasi: IP, port, durasi, volume bytes tanpa konten payload", "NetFlow, IPFIX, sFlow, ARGUS records", "Rendah-Sedang", "Network profiling, anomali traffic, hunting", "30-90 hari"],
          ["Transaction Data", "Data transaksi aplikasi layer: HTTP requests, DNS queries, email headers", "Web proxy logs, DNS logs, email metadata", "Sedang", "Analisis perilaku pengguna, data exfil detection", "30-180 hari"],
          ["Full Packet Capture", "Seluruh konten paket termasuk payload, header, dan data aplikasi", "PCAP files dari tcpdump, Wireshark, Security Onion", "Sangat Tinggi", "Deep forensics, malware analysis, rekonstruksi sesi", "7-30 hari (mahal)"],
          ["Statistical Data", "Ringkasan agregat traffic: bandwidth, top talkers, protocol distribution", "SNMP counters, RMON statistics, bandwidth graphs", "Sangat Rendah", "Capacity planning, baseline, high-level anomali", "1-2 tahun"]
        ]
      },
      note: "Strategi tiered storage: full packet capture hanya untuk segmen kritis (DMZ, server farm) selama 7 hari, flow data untuk seluruh jaringan selama 90 hari, dan alert data selama 1 tahun untuk memenuhi persyaratan audit dan compliance.",
      noteType: "info"
    },
    {
      title: "Syslog: Format, Severity Levels, dan Centralized Logging",
      content: "Syslog adalah protokol standar (RFC 5424) untuk pengiriman pesan log dari device jaringan dan sistem ke log collector terpusat. Format pesan Syslog terdiri dari: Priority (facility code + severity level), Header (timestamp dan hostname), dan Message (konten log aktual). Severity level menggunakan skala 0-7 di mana 0 adalah paling kritis. Centralized logging dengan syslog-ng, rsyslog, atau solusi modern seperti Fluentd/Fluent Bit sangat penting untuk korelasi log lintas-sistem dan forensik insiden.",
      table: {
        caption: "Syslog Severity Levels (RFC 5424)",
        headers: ["Level", "Nama", "Kode Angka", "Deskripsi", "Contoh Penggunaan"],
        rows: [
          ["Emergency", "emerg", "0", "Sistem tidak dapat digunakan", "Kernel panic, hardware failure kritis"],
          ["Alert", "alert", "1", "Tindakan segera diperlukan", "Database korup, buffer overflow kritis"],
          ["Critical", "crit", "2", "Kondisi kritis", "Hard drive failure, service crash kritis"],
          ["Error", "err", "3", "Kondisi error", "Service gagal start, permission denied kritis"],
          ["Warning", "warn", "4", "Kondisi peringatan", "Disk hampir penuh, konfigurasi salah"],
          ["Notice", "notice", "5", "Kondisi normal tapi signifikan", "Service restart, konfigurasi reload"],
          ["Informational", "info", "6", "Pesan informasional", "User login sukses, proses normal"],
          ["Debug", "debug", "7", "Pesan debug level", "Detail troubleshooting, trace logs"]
        ]
      },
      codeSnippet: `# Format Syslog RFC 5424:
# <Priority>Version Timestamp Hostname AppName ProcID MsgID [StructuredData] Message

# Contoh Syslog Message (Raw):
<34>1 2024-01-15T10:22:14.003Z webserver01 sshd 1234 - - Failed password for root from 192.168.1.100 port 22345 ssh2

# Breakdown:
# <34> = Priority: Facility 4 (auth) * 8 + Severity 2 (critical) = 34
# 1     = Syslog version
# 2024-01-15T10:22:14.003Z = Timestamp (ISO 8601)
# webserver01 = Hostname pengirim
# sshd        = Nama aplikasi
# 1234        = Process ID (PID)
# -           = Message ID (tidak diset)
# -           = Structured Data (tidak ada)
# Failed password for root... = Pesan log aktual

# Konfigurasi rsyslog untuk centralized logging (rsyslog.conf):
# Kirim semua log ke server terpusat via TCP:
*.* @@192.168.1.50:514

# Server penerima — simpan berdasarkan hostname:
$template RemoteLogs,"/var/log/remote/%HOSTNAME%/%PROGRAMNAME%.log"
*.* ?RemoteLogs

# Filter: tampilkan hanya severity error ke atas:
sudo journalctl --priority=err..emerg --since "1 hour ago"`,
      note: "Pastikan log dikirim via TCP (bukan UDP) dengan enkripsi TLS untuk mencegah kehilangan log dan penyadapan. Log yang tidak terproteksi mudah dimanipulasi oleh penyerang untuk menghapus jejak.",
      noteType: "warning"
    },
    {
      title: "NetFlow dan IPFIX: Flow-based Network Monitoring",
      content: "NetFlow adalah protokol Cisco yang mengumpulkan metadata lalu lintas jaringan dalam bentuk 'flow' — kumpulan paket yang berbagi atribut yang sama (source/destination IP, port, protocol). Setiap flow dicatat dengan informasi: IP sumber dan tujuan, port sumber dan tujuan, protokol, jumlah bytes, jumlah paket, timestamp, dan flags TCP. IPFIX (IP Flow Information Export) adalah standar IETF berbasis NetFlow v9 yang mendukung field yang dapat dikustomisasi dan bersifat vendor-agnostic. Flow data sangat efisien untuk penyimpanan (sekitar 1.5% dari ukuran full packet capture) namun tetap memberikan visibilitas yang baik untuk mendeteksi anomali traffic, port scanning, lateral movement, dan data exfiltration.",
      codeSnippet: `# Analisis NetFlow menggunakan nfdump (NetFlow dump tool)

# Lihat statistik flow dari file NetFlow:
nfdump -r /var/netflow/nfcapd.current -s ip/bytes -n 10

# Output contoh (top 10 IP berdasarkan volume bytes):
Date flow start         Duration Proto Src IP Addr:Port    Dst IP Addr:Port
2024-01-15 10:00:00.000    3600 TCP 10.0.1.5:52341 -> 93.184.216.34:443
                                                Bytes: 1.2 GB Packets: 890234

# Filter: lihat semua koneksi ke port 443 dari network internal:
nfdump -r /var/netflow/ -R nfcapd.202401150000:nfcapd.202401152300 \
  'src net 10.0.0.0/8 and dst port 443'

# Deteksi port scanning (banyak dst port dari satu src IP dalam waktu singkat):
nfdump -r /var/netflow/nfcapd.current \
  'src ip 192.168.1.100' -s dstport/flows

# Konfigurasi nfcapd (NetFlow collector) di Linux:
nfcapd -w -D -l /var/netflow -p 2055 -n router1,192.168.0.1,/var/netflow/router1

# Contoh output flow summary:
Summary: Total flows: 245678, Total bytes: 45.2 GB, Total packets: 12345678
Top 5 Source IPs by flows:
1. 10.0.1.5    - 45234 flows (18.4%)   <- anomali: terlalu banyak flow
2. 10.0.1.10   - 12345 flows (5.0%)
3. 10.0.1.25   -  8901 flows (3.6%)`,
      keyPoints: [
        "NetFlow v5: Fixed field format, hanya IPv4, field terbatas",
        "NetFlow v9: Template-based, mendukung IPv6, MPLS, BGP attributes",
        "IPFIX (RFC 7011): Standar IETF, field dapat dikustomisasi, mendukung variable-length fields",
        "sFlow: Sampling-based (1 dari N paket), lebih efisien untuk high-speed networks",
        "Tools analisis: nfdump/nfsen, Ntopng, Elastiflow, SolarWinds NTA"
      ]
    },
    {
      title: "SIEM: Arsitektur, Komponen, dan Use Cases",
      content: "Security Information and Event Management (SIEM) adalah platform yang mengintegrasikan dua fungsi utama: Security Information Management (SIM) untuk pengumpulan dan analisis log historis, dan Security Event Management (SEM) untuk korelasi event dan alerting real-time. SIEM mengumpulkan log dari berbagai sumber (endpoint, jaringan, aplikasi, cloud), menormalisasi format yang berbeda, mengkorelasikan event terkait, dan menghasilkan alert yang dapat ditindaklanjuti. SIEM modern juga mengintegrasikan Threat Intelligence, UEBA (User and Entity Behavior Analytics), dan kemampuan SOAR.",
      table: {
        caption: "Komponen Arsitektur SIEM",
        headers: ["Komponen", "Fungsi", "Contoh Teknologi"],
        rows: [
          ["Log Collectors/Forwarders", "Mengumpulkan log dari berbagai sumber dan mengirim ke SIEM", "Beats (Filebeat, Winlogbeat), Fluentd, NXLog, rsyslog"],
          ["Data Normalization", "Mengubah format log beragam menjadi format standar untuk analisis", "CEF (Common Event Format), LEEF, ECS (Elastic Common Schema)"],
          ["Correlation Engine", "Mencocokkan multiple event berdasarkan aturan untuk menghasilkan alert", "Splunk Correlation Search, IBM QRadar Rules, Microsoft Sentinel Analytics"],
          ["Storage & Indexing", "Menyimpan dan mengindeks data log untuk pencarian cepat", "Elasticsearch, Apache Kafka, ClickHouse, Cassandra"],
          ["Search & Query", "Interface untuk investigasi dan hunting pada data historis", "Splunk SPL, KQL (Kusto Query Language), Elasticsearch DSL"],
          ["Dashboard & Reporting", "Visualisasi status keamanan dan laporan untuk manajemen", "Kibana, Grafana, Power BI integration"],
          ["Alert Management", "Mengelola, memprioritaskan, dan mendistribusikan alert ke tim SOC", "PagerDuty integration, Jira tickets, TheHive"],
          ["Threat Intelligence", "Mengintegrasikan IOC eksternal untuk kontekstual enrichment", "MISP, VirusTotal, IBM X-Force Exchange, AlienVault OTX"]
        ]
      },
      note: "SIEM modern seperti Microsoft Sentinel dan Chronicle (Google) bermigrasi ke cloud-native architecture yang memberikan skalabilitas hampir tak terbatas, integrasi threat intelligence otomatis, dan biaya yang lebih prediktif berdasarkan volume data.",
      noteType: "info"
    },
    {
      title: "IDS Rules: Format Snort dan Suricata",
      content: "Intrusion Detection System (IDS) menggunakan aturan (rules) untuk mencocokkan pola dalam lalu lintas jaringan dan menghasilkan alert. Snort dan Suricata adalah dua IDS/IPS open-source paling populer yang menggunakan format rule yang sangat mirip. Setiap rule terdiri dari dua bagian utama: Rule Header (mendefinisikan action, protokol, IP, port) dan Rule Options (mendefinisikan kondisi pencocokan dan metadata). Pemahaman mendalam tentang format rule memungkinkan SOC analyst membuat deteksi kustom untuk ancaman spesifik yang relevan dengan lingkungan mereka.",
      codeSnippet: `# FORMAT DASAR SNORT/SURICATA RULE:
# action protocol src_ip src_port direction dst_ip dst_port (options)

# Contoh 1: Deteksi SQL Injection pada HTTP request
alert tcp $EXTERNAL_NET any -> $HTTP_SERVERS $HTTP_PORTS (
  msg:"SQL Injection Attempt - UNION SELECT";
  flow:established,to_server;
  content:"UNION"; nocase; http_uri;
  content:"SELECT"; nocase; distance:0; http_uri;
  pcre:"/UNION.+SELECT/Ui";
  classtype:web-application-attack;
  sid:1000001;
  rev:1;
)

# Contoh 2: Deteksi Port Scanning (SYN scan)
alert tcp $EXTERNAL_NET any -> $HOME_NET any (
  msg:"Possible TCP SYN Scan Detected";
  flags:S;
  threshold:type both, track by_src, count 20, seconds 5;
  classtype:attempted-recon;
  sid:1000002;
  rev:1;
)

# Contoh 3: Deteksi DNS Query untuk domain mencurigakan (DGA-like)
alert dns any any -> any any (
  msg:"Long DNS query - possible DGA C2";
  dns.query;
  content:!".google.com";
  pcre:"/^[a-z0-9]{20,}\.(com|net|org)$/";
  classtype:trojan-activity;
  sid:1000003;
  rev:1;
)

# Contoh 4: Deteksi Command & Control callback
alert http $HOME_NET any -> $EXTERNAL_NET any (
  msg:"Possible C2 Beacon - Periodic HTTP GET";
  flow:established,to_server;
  content:"GET"; http_method;
  content:"User-Agent: Mozilla/4.0 (compatible; MSIE 6.0)";
  threshold:type both, track by_src, count 10, seconds 60;
  classtype:trojan-activity;
  sid:1000004;
  rev:1;
)

# Opsi Rule yang Penting:
# msg       - Pesan deskriptif yang muncul di alert
# flow      - Arah traffic: to_server, to_client, established
# content   - String literal yang dicari dalam payload
# pcre      - Perl Compatible Regular Expression
# nocase    - Case-insensitive matching
# http_uri  - Terapkan pada URI bagian HTTP request
# threshold - Batasi frekuensi alert (type: limit, threshold, both)
# classtype - Kategorisasi jenis serangan
# sid       - Signature ID unik (rule ID)
# rev       - Nomor revisi rule`,
      note: "Menulis rule yang terlalu umum akan menghasilkan false positive yang tinggi dan 'alert fatigue' pada SOC analyst. Rule yang baik harus spesifik, memiliki false positive rate rendah, dan selalu disertai runbook untuk respons.",
      noteType: "warning"
    },
    {
      title: "End Device Logs: Windows Event Log dan Linux Syslog/Auditd",
      content: "Log dari end device (workstation, server) adalah sumber data terpenting untuk investigasi insiden keamanan karena memberikan visibilitas langsung ke aktivitas pengguna, proses, dan perubahan sistem. Windows menggunakan Event Log dengan Event ID yang terstruktur, sedangkan Linux menggunakan kombinasi Syslog tradisional dan Auditd untuk audit keamanan yang lebih detail. Pemahaman tentang Event ID kritis dan format log Linux adalah keterampilan dasar setiap SOC analyst.",
      table: {
        caption: "Windows Security Event IDs yang Kritis untuk SOC",
        headers: ["Event ID", "Kategori", "Deskripsi", "Relevansi Keamanan"],
        rows: [
          ["4624", "Logon", "Successful account logon", "Pantau logon dari IP asing atau di luar jam kerja"],
          ["4625", "Logon", "Failed account logon", "Banyak 4625 berturut = brute force attempt"],
          ["4648", "Logon", "Logon using explicit credentials", "Indikator credential misuse atau Pass-the-Hash"],
          ["4672", "Logon", "Special privileges assigned to new logon", "Admin-level access — pantau penyalahgunaan"],
          ["4688", "Process", "New process creation", "Pantau proses mencurigakan: powershell, cmd, wscript"],
          ["4698", "Task Scheduler", "Scheduled task created", "Persistensi malware via scheduled task"],
          ["4702", "Task Scheduler", "Scheduled task updated", "Modifikasi scheduled task yang ada"],
          ["4720", "Account", "User account created", "Pembuatan akun backdoor oleh penyerang"],
          ["4740", "Account", "User account locked out", "Indikator brute force yang berhasil mengunci akun"],
          ["4776", "Authentication", "Validate credentials via NTLM", "Pass-the-Hash atau NTLM relay attack"],
          ["7045", "Service", "New service installed", "Persistensi malware via Windows service"],
          ["4663", "Object Access", "Attempt to access object", "Akses file sensitif yang tidak biasa"]
        ]
      },
      codeSnippet: `# Linux Auditd - Konfigurasi audit rules untuk keamanan:
# File: /etc/audit/rules.d/security.rules

# Monitor semua eksekusi perintah (execve syscall):
-a always,exit -F arch=b64 -S execve -k process_execution

# Monitor perubahan file password kritis:
-w /etc/passwd -p wa -k identity_modification
-w /etc/shadow -p wa -k identity_modification
-w /etc/sudoers -p wa -k sudoers_modification

# Monitor login ke sistem:
-w /var/log/lastlog -p wa -k login_events
-w /var/run/faillock -p wa -k login_events

# Monitor network configuration changes:
-a always,exit -F arch=b64 -S sethostname -S setdomainname -k system_info_modification

# Query audit log - cari semua eksekusi perintah oleh user 'root':
ausearch -k process_execution --uid 0 --start today

# Format log Auditd:
# type=SYSCALL msg=audit(1705312934.123:456): arch=c000003e syscall=59
# success=yes exit=0 a0=55a1b2c3 items=2 ppid=1234 pid=5678
# auid=1000 uid=0 gid=0 euid=0 egid=0 tty=pts0 ses=12
# comm="bash" exe="/usr/bin/bash" subj=unconfined key="process_execution"

# Analisis failed SSH login di Linux:
grep 'Failed password' /var/log/auth.log | \
  awk '{print $11}' | sort | uniq -c | sort -rn | head -20`,
      note: "Auditd memberikan audit trail yang sangat detail dan tahan terhadap manipulasi (jika dikonfigurasi dengan benar menggunakan mode immutable). Ini sangat penting untuk compliance PCI-DSS, HIPAA, dan investigasi forensik.",
      noteType: "success"
    },
    {
      title: "Network Logs: Firewall, Proxy, DNS Logs dan Log Correlation",
      content: "Log jaringan dari berbagai sumber memberikan perspektif berbeda tentang aktivitas yang terjadi di jaringan. Firewall logs mencatat allowed/denied connections; Proxy logs mencatat semua HTTP/HTTPS request yang melewati proxy; DNS logs mencatat semua query resolusi nama domain. Korelasi log dari multiple sumber (multi-source correlation) adalah teknik kunci untuk mendeteksi serangan yang tidak terlihat dari satu sumber log saja — penyerang canggih sering menyebarkan aktivitas mereka agar tidak terdeteksi oleh satu sensor.",
      example: {
        title: "Contoh Log Correlation: Deteksi Data Exfiltration",
        steps: [
          "LANGKAH 1 — DNS Log menunjukkan anomali: workstation ws-finance-01 (10.0.2.50) membuat 500+ DNS queries ke subdomain acak dari domain 'data-sync-api.xyz' dalam 10 menit terakhir. Domain baru terdaftar 2 hari lalu (WHOIS).",
          "LANGKAH 2 — Firewall Log menunjukkan: ws-finance-01 berhasil membuka koneksi TCP:443 ke IP 185.220.101.45 (diketahui sebagai Tor exit node berdasarkan threat intel feed). Total data terkirim: 450 MB dalam 15 menit.",
          "LANGKAH 3 — Proxy Log menunjukkan: ws-finance-01 mengakses URL 'https://data-sync-api.xyz/upload' dengan metode POST berulang kali. Tidak ada User-Agent browser standar — menggunakan 'Python-urllib/3.9'.",
          "LANGKAH 4 — Windows Event Log pada ws-finance-01 menunjukkan: proses 'python3.exe' diluncurkan oleh user 'joko.susanto' pada pukul 02:17 WIB (di luar jam kerja). Parent process: 'cmd.exe' yang diluncurkan via scheduled task (Event ID 4698 seminggu lalu).",
          "LANGKAH 5 — KORELASI: Semua 4 sumber log menunjuk pada insiden yang sama — user 'joko.susanto' (atau penyerang yang menggunakan akunnya) menjalankan script Python untuk mengekstrak data besar ke server eksternal menggunakan DNS tunneling dan HTTPS, dengan persistence via scheduled task.",
          "KESIMPULAN: Data exfiltration menggunakan DNS tunneling + HTTPS exfil ke C2 infrastructure. Timeline: scheduled task dipasang minggu lalu → eksekusi dini hari → 450MB data keluar."
        ],
        result: "Insiden dikonfirmasi sebagai True Positive — data exfiltration aktif. Tindakan: isolasi ws-finance-01, block domain di DNS/firewall, escalate ke IR team, preserve forensic evidence."
      },
      note: "Kunci keberhasilan log correlation adalah normalisasi timestamp (pastikan semua device menggunakan NTP yang sinkron) dan normalisasi format (gunakan common schema seperti ECS/CEF). Perbedaan waktu 1 detik saja dapat membuat korelasi otomatis gagal.",
      noteType: "warning"
    }
  ],
  lab: {
    title: "Lab 13: Log Analysis, Snort Rules, dan SIEM Query Simulation",
    downloads: [
      {
        name: "CyberOps Workstation VM",
        url: "https://www.netacad.com/",
        description: "VM Linux dengan pre-installed Snort, rsyslog, dan sample log files untuk praktik."
      },
      {
        name: "Sample Log Files (auth.log, syslog, access.log)",
        url: "https://github.com/logpai/loghub",
        description: "Kumpulan sample log dari berbagai sistem untuk latihan analisis."
      },
      {
        name: "Snort Rules Reference",
        url: "https://snort.org/rule_docs",
        description: "Dokumentasi resmi format rule Snort untuk referensi praktik."
      }
    ],
    steps: [
      {
        title: "Langkah 1: Syslog Analysis — Critical Events",
        description: "Gunakan journalctl untuk menganalisis log sistem Linux secara terpusat. Fokus pada severity level error hingga emergency untuk menemukan kejadian kritis. Journalctl memberikan akses terpadu ke semua log yang dikelola oleh systemd-journald, menggantikan pembacaan manual file log individual.",
        command: "sudo journalctl --priority=err..emerg --since '24 hours ago' --no-pager | head -50",
        expectedOutput: "Jan 15 08:22:14 server01 kernel: [  123.456789] EXT4-fs error (device sda1): ext4_find_entry\nJan 15 09:15:33 server01 sshd[1234]: error: Could not get shadow information for NOUSER\nJan 15 10:45:22 server01 sudo[5678]: pam_unix(sudo:auth): authentication failure; logname=user1 uid=1001\nJan 15 11:30:15 server01 systemd[1]: nginx.service: Failed with result 'exit-code'.",
        hint: "Priority levels: 0=emerg, 1=alert, 2=crit, 3=err, 4=warning, 5=notice, 6=info, 7=debug. Format: --priority=err..emerg menampilkan level 0-3. Gunakan --since dan --until untuk rentang waktu. Tambahkan -u ssh untuk filter unit tertentu.",
        screenshotNote: "Screenshot output journalctl yang menampilkan error/critical events. Beri annotation pada entry yang dianggap mencurigakan dari perspektif keamanan."
      },
      {
        title: "Langkah 2: Authentication Log Analysis",
        description: "Analisis log autentikasi Linux (/var/log/auth.log) untuk mendeteksi pola login yang mencurigakan seperti brute force attack. Perintah ini mengekstrak IP address yang paling sering gagal login dan menghitung frekuensinya untuk mengidentifikasi sumber serangan brute force.",
        command: "grep 'Failed password' /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -rn | head -20",
        expectedOutput: "   1523 192.168.1.100\n    847 10.0.0.55\n    312 203.0.113.45\n     89 172.16.0.200\n     43 192.168.1.105",
        hint: "IP dengan count sangat tinggi (ratusan hingga ribuan dalam waktu singkat) adalah indikator kuat brute force. Untuk verifikasi, periksa timestamp pertama dan terakhir: grep 'Failed password.*192.168.1.100' /var/log/auth.log | head -1 && tail -1. Buat visualisasi timeline menggunakan: grep 'Failed password' auth.log | awk '{print $1,$2,$3}' | uniq -c",
        screenshotNote: "Screenshot menampilkan daftar IP dengan gagal login terbanyak. Buat kesimpulan: apakah ini brute force? Dari IP mana?"
      },
      {
        title: "Langkah 3: Windows Event Log Analysis dengan PowerShell",
        description: "Pada sistem Windows, gunakan PowerShell untuk query Event Log secara terprogram. Perintah ini mencari Event ID 4625 (gagal login) dalam 24 jam terakhir dan mengekstrak informasi penting seperti username dan IP sumber. Pendekatan ini jauh lebih efisien dari membuka Event Viewer secara manual.",
        command: "Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625; StartTime=(Get-Date).AddHours(-24)} | Select-Object TimeCreated, @{N='User';E={$_.Properties[5].Value}}, @{N='IP';E={$_.Properties[19].Value}} | Sort-Object TimeCreated | Export-Csv failed_logins.csv -NoTypeInformation",
        hint: "Pada CyberOps VM (Linux), simulasikan dengan: grep '4625\\|Failed' /var/log/syslog. Untuk Windows nyata, jalankan PowerShell sebagai Administrator. Hasil akan disimpan ke CSV untuk analisis lebih lanjut. Tambahkan: | Where-Object { $_.IP -ne '-' } untuk filter entri kosong.",
        screenshotNote: "Screenshot PowerShell output atau CSV hasil export yang menampilkan daftar gagal login dengan username dan IP sumber.",
        warningNote: "Pada lingkungan lab Linux, gunakan: grep 'authentication failure\\|Failed password' /var/log/auth.log | grep -oP 'from \\K\\S+' | sort | uniq -c | sort -rn sebagai pengganti PowerShell."
      },
      {
        title: "Langkah 4: Snort Rule Basics — Membuat Custom Rules",
        description: "Buat file custom rules untuk Snort/Suricata yang mendeteksi aktivitas jaringan mencurigakan. Dimulai dengan aturan sederhana untuk mendeteksi ICMP ping, kemudian tingkatkan kompleksitasnya. Memahami struktur rule adalah fundamental untuk tuning IDS di lingkungan produksi.",
        command: `sudo mkdir -p /etc/snort/rules
cat > /etc/snort/rules/custom.rules << 'EOF'
# Rule 1: Deteksi ICMP ping dari jaringan eksternal
alert icmp $EXTERNAL_NET any -> $HOME_NET any (msg:"ICMP Ping from External"; itype:8; sid:9000001; rev:1;)

# Rule 2: Deteksi SSH brute force (>5 koneksi dalam 60 detik)
alert tcp $EXTERNAL_NET any -> $HOME_NET 22 (msg:"SSH Brute Force Attempt"; flow:to_server; flags:S; threshold:type both,track by_src,count 5,seconds 60; sid:9000002; rev:1;)

# Rule 3: Deteksi Nmap SYN scan
alert tcp $EXTERNAL_NET any -> $HOME_NET any (msg:"Possible Nmap SYN Scan"; flags:S; threshold:type both,track by_src,count 20,seconds 5; sid:9000003; rev:1;)
EOF
echo "Rules created successfully"
cat /etc/snort/rules/custom.rules`,
        expectedOutput: "Rules created successfully\n# Rule 1: Deteksi ICMP ping...\nalert icmp $EXTERNAL_NET any -> $HOME_NET any (msg:\"ICMP Ping from External\"; itype:8; sid:9000001; rev:1;)\n...",
        hint: "Setiap rule memerlukan sid (Signature ID) yang unik. Rule custom biasanya menggunakan range 1000000 ke atas. Verifikasi syntax rule: snort -T -c /etc/snort/snort.conf. Jika Snort tidak terinstall, instal dengan: sudo apt-get install snort",
        screenshotNote: "Screenshot file custom.rules yang telah dibuat, tampilkan ketiga aturan dengan jelas."
      },
      {
        title: "Langkah 5: Rule untuk Deteksi SQL Injection",
        description: "Buat Snort rule yang lebih kompleks untuk mendeteksi percobaan SQL injection pada HTTP traffic. Rule ini menggunakan multiple content options dan PCRE (Perl Compatible Regular Expression) untuk deteksi yang lebih akurat dan mengurangi false positive.",
        command: `cat >> /etc/snort/rules/custom.rules << 'EOF'

# Rule 4: SQL Injection - UNION SELECT
alert tcp $EXTERNAL_NET any -> $HTTP_SERVERS $HTTP_PORTS (
  msg:"SQL Injection - UNION SELECT Detected";
  flow:established,to_server;
  content:"UNION"; nocase; http_uri;
  content:"SELECT"; nocase; distance:0; http_uri;
  pcre:"/UNION\\s+SELECT/Ui";
  classtype:web-application-attack;
  sid:9000004;
  rev:1;
)

# Rule 5: SQL Injection - OR 1=1
alert tcp $EXTERNAL_NET any -> $HTTP_SERVERS $HTTP_PORTS (
  msg:"SQL Injection - Boolean-based Detected";
  flow:established,to_server;
  content:"OR"; nocase; http_uri;
  pcre:"/OR\\s+['\\"\\d]+=\\s*['\\"\\d]+/i";
  classtype:web-application-attack;
  sid:9000005;
  rev:1;
)
EOF
echo "SQL Injection rules added"`,
        hint: "Opsi 'http_uri' membuat Snort hanya mencocokkan pada bagian URI dari HTTP request, mengurangi false positive secara signifikan. PCRE dengan modifier 'U' berarti match terhadap decoded URI, 'i' untuk case-insensitive. Test rule dengan: echo 'GET /search?q=UNION+SELECT+1,2,3' | snort -r - -c /etc/snort/snort.conf",
        screenshotNote: "Screenshot file custom.rules yang diperbarui dengan SQL injection rules. Tampilkan seluruh konten file."
      },
      {
        title: "Langkah 6: SIEM Query Simulation dengan grep dan awk",
        description: "Simulasikan query SIEM menggunakan tools Linux standar (grep, awk, sort) untuk mengkorelasikan log dari berbagai sumber. Latihan ini mensimulasikan proses yang dilakukan SIEM secara otomatis: mengekstrak field tertentu, menghitung frekuensi, dan mengkorelasikan berdasarkan atribut bersama (IP address).",
        command: `# Simulasi SIEM correlation: korelasikan IP yang muncul di auth.log DAN firewall log
# Step 1: Ekstrak IP gagal login dari auth.log
grep 'Failed password' /var/log/auth.log | \
  grep -oP 'from \\K[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+' | sort -u > /tmp/failed_ips.txt

# Step 2: Cari IP yang sama di firewall log (jika ada)
grep -F -f /tmp/failed_ips.txt /var/log/syslog 2>/dev/null | \
  grep -i 'DROP\\|REJECT\\|BLOCK' | \
  awk '{print $1, $2, $3, $8, $9, $10}' | sort -u

# Step 3: Hitung statistik per jam (timeline analysis)
grep 'Failed password' /var/log/auth.log | \
  awk '{print $1, $2, substr($3,1,2)}' | sort | uniq -c | sort -rn | head -24`,
        expectedOutput: "# Hasil korelasi IP:\nJan 15 10:00 - 14 failed attempts from 192.168.1.100 (also seen in firewall DROP)\nJan 15 10:00 - 8 failed attempts from 10.0.0.55\n\n# Timeline analysis:\n  1523 Jan 15 02 (02:00-03:00 WIB) <- spike di tengah malam!",
        hint: "Korelasi IP lintas sumber log ini adalah teknik dasar threat hunting. Jika IP yang sama muncul di auth.log (gagal login) DAN di firewall log (blocked traffic) DAN di web access log, ini menguatkan hipotesis bahwa IP tersebut adalah penyerang aktif.",
        screenshotNote: "Screenshot hasil korelasi yang menunjukkan IP mencurigakan yang ditemukan di multiple log sources. Beri penjelasan mengapa IP tersebut mencurigakan."
      },
      {
        title: "Langkah 7: Log Correlation Exercise — Timeline Reconstruction",
        description: "Rekonstruksi timeline insiden dari multiple log sources untuk memahami urutan kejadian secara lengkap. Ini adalah keterampilan kritis dalam incident response — membuat timeline yang akurat sangat penting untuk memahami scope insiden, menentukan patient zero, dan mengidentifikasi seluruh jejak penyerang.",
        command: `# Gabungkan multiple log sources dan sort berdasarkan timestamp untuk rekonstruksi timeline
# Ekstrak events relevan dari auth.log, syslog, dan web access log:
(
  grep 'Failed password\\|Accepted password\\|session opened\\|session closed' /var/log/auth.log | \
    awk '{print $1, $2, $3, "[AUTH]", $0}';
  grep 'ERROR\\|WARNING\\|CRITICAL' /var/log/syslog | \
    awk '{print $1, $2, $3, "[SYSLOG]", $0}';
  if [ -f /var/log/apache2/access.log ]; then
    awk '{print $4, "[WEBACCESS]", $1, $7, $9}' /var/log/apache2/access.log | \
      tr -d '[' | sort;
  fi
) | sort -k1,3 | tail -100`,
        hint: "Timeline yang disusun dari multiple log sources ini memungkinkan kita melihat: 'Pada 02:15, terjadi banyak gagal login SSH → pada 02:23, ada login sukses → pada 02:25, session dibuka → pada 02:30, ada akses web ke /admin → pada 02:35, ada error kritis di syslog'. Pola ini menunjukkan compromise yang berhasil.",
        screenshotNote: "Screenshot timeline gabungan yang telah disortir. Tandai minimal 3 event kritis pada timeline dan tuliskan narasi insiden berdasarkan timeline tersebut.",
        warningNote: "Pastikan semua log sources menggunakan timezone yang sama. Perbedaan timezone dapat membuat rekonstruksi timeline tidak akurat."
      }
    ],
    deliverable: "Laporan Lab 13 berisi: (1) Hasil analisis syslog dengan identifikasi minimal 3 event mencurigakan, (2) Hasil auth.log analysis dengan daftar IP brute force dan statistik timeline, (3) File custom.rules Snort dengan 5 aturan yang dibuat (screenshot + konten file), (4) Hasil SIEM correlation query dengan penjelasan, (5) Timeline insiden yang direkonstruksi dari minimal 2 log sources, (6) Kesimpulan analisis: identifikasi apakah ada insiden nyata berdasarkan bukti log."
  },
  caseStudy: {
    title: "Deteksi APT melalui Korelasi Log Multi-Sumber",
    scenario: "Tim SOC Bank Nusantara menerima alert dari SIEM tentang anomali DNS query yang tidak biasa dari workstation departemen keuangan. Analisis awal menunjukkan pola DGA (Domain Generation Algorithm) di mana workstation mengquery ratusan domain acak yang baru terdaftar. Bersamaan, firewall log menunjukkan koneksi ke IP yang masuk dalam daftar threat intelligence sebagai C2 server kelompok APT.",
    questions: [
      "Jelaskan teknik DGA (Domain Generation Algorithm) yang digunakan malware APT dan bagaimana pola DNS query ini dapat dideteksi melalui analisis log DNS di SIEM.",
      "Bagaimana korelasi antara DNS logs, firewall logs, dan Windows Event Logs dapat memberikan gambaran lengkap tentang scope kompromi dan tahap Kill Chain yang telah dicapai penyerang?",
      "Snort/Suricata rule seperti apa yang dapat dibuat untuk mendeteksi traffic C2 APT ini, termasuk parameter threshold yang tepat untuk mengurangi false positive?",
      "Rancang prosedur response team untuk mengkonfirmasi, mengkontain, dan eradikasi ancaman APT ini sambil mempreservasi bukti forensik untuk investigasi lebih lanjut."
    ]
  },
  caseStudyPool: [
    {
      title: "Deteksi APT via DGA pada Sistem Bank",
      scenario: "Tim SOC Bank Nusantara Mandiri menerima alert SIEM tentang anomali DNS query dari workstation departemen keuangan — ratusan query ke domain acak menggunakan pola DGA dalam 10 menit. Bersamaan, NetFlow menunjukkan data transfer 800MB ke IP eksternal yang tidak dikenal, dan Windows Event Log menunjukkan proses python.exe berjalan di luar jam kerja pada workstation tersebut.",
      questions: [
        "Bagaimana SIEM mendeteksi pola DGA dari DNS logs, dan aturan korelasi seperti apa yang dapat membedakan DGA dari penggunaan DNS normal yang tinggi?",
        "Korelasikan tiga sumber log (DNS, NetFlow, Windows Event) untuk rekonstruksi timeline lengkap serangan APT ini sejak initial compromise hingga data exfiltration.",
        "Snort rule apa yang dapat dibuat untuk mendeteksi traffic C2 berbasis DGA secara real-time berdasarkan karakteristik unik komunikasi ini?",
        "Bagaimana prosedur isolasi workstation bank yang terinfeksi APT tanpa menginterupsi transaksi perbankan yang sedang berjalan?"
      ]
    },
    {
      title: "Log Tampering pada Sistem Rumah Sakit",
      scenario: "Forensik digital pada Rumah Sakit Bina Sehat menemukan bahwa log akses ke rekam medis elektronik telah dimanipulasi — entry tertentu dihapus pada periode antara tanggal 10-15 Januari. Anomali pertama kali terdeteksi ketika audit trail SIEM menunjukkan inkonsistensi antara timestamp event di database dan log yang tercatat di server. Seorang insider dengan akses admin dicurigai.",
      questions: [
        "Bagaimana inkonsistensi log yang terdeteksi SIEM dapat membuktikan adanya log tampering, dan teknik forensik apa yang digunakan untuk memvalidasi keaslian log?",
        "Mekanisme keamanan log apa (immutable logging, WORM storage, log signing dengan digital signature) yang seharusnya diimplementasikan untuk mencegah manipulasi log oleh insider?",
        "Dari Windows Event Log dan Linux Auditd, Event ID atau audit rule mana yang dapat merekam tindakan penghapusan atau modifikasi file log?",
        "Bagaimana kebijakan centralized logging dan log retention seharusnya dirancang untuk memenuhi regulasi HIPAA dan standar ISO 27001 di lingkungan rumah sakit?"
      ]
    },
    {
      title: "SIEM Correlation Menemukan Serangan Tersembunyi di Pemerintahan",
      scenario: "BSSN melalui SOC nasional menemukan serangan multi-stage yang menargetkan beberapa kementerian secara bersamaan. Serangan tidak terdeteksi oleh monitoring individual di masing-masing kementerian, tetapi baru terlihat ketika SIEM terpusat mengkorelasikan log dari seluruh instansi dan menemukan pola gerakan lateral yang identik menggunakan teknik yang sama di multiple target.",
      questions: [
        "Jelaskan keuntungan SIEM terpusat lintas instansi dibandingkan SIEM individual, dan bagaimana korelasi lintas organisasi memungkinkan deteksi serangan yang tersebar?",
        "Apa jenis aturan korelasi SIEM yang dapat mendeteksi lateral movement (gerakan menyamping dalam jaringan) menggunakan kombinasi Windows Event Log dan NetFlow data?",
        "Bagaimana data keamanan dari berbagai tipe (alert, session, transaction, full packet) digunakan secara bersama dalam investigasi insiden multi-organisasi ini?",
        "Rancang arsitektur Security Data Platform terpusat untuk sharing intelligence antar instansi pemerintah Indonesia dengan tetap memperhatikan kedaulatan data masing-masing instansi."
      ]
    },
    {
      title: "Log Gap Analysis pada Sistem Universitas",
      scenario: "Universitas Teknologi Nusantara menemukan bahwa selama weekend tanggal 20-21 Januari, log dari server Active Directory tidak tersedia di SIEM — gap selama 48 jam. Investigasi menemukan bahwa log forwarding agent pada server AD dimatikan oleh seseorang dengan akses admin. Dalam periode gap tersebut, beberapa akun mahasiswa yang telah lulus mendapat tambahan privilege secara tidak wajar.",
      questions: [
        "Bagaimana monitoring kesehatan log pipeline (log source health monitoring) di SIEM seharusnya mendeteksi penghentian log forwarding dalam hitungan menit, bukan 48 jam kemudian?",
        "Teknik forensik apa yang digunakan untuk merekonstruksi aktivitas yang terjadi selama 48 jam gap log, menggunakan sumber-sumber alternatif seperti firewall logs, NetFlow, atau backup snapshot?",
        "Windows Event ID mana yang merekam penghentian/modifikasi Windows Event Log service, dan bagaimana event ini seharusnya menghasilkan alert prioritas tinggi di SIEM?",
        "Rancang arsitektur redundant logging untuk Active Directory yang memastikan tidak ada single point of failure dalam rantai pengiriman log ke SIEM."
      ]
    },
    {
      title: "Proxy Log Mengungkap Data Exfiltration di E-Commerce",
      scenario: "Proxy log pada platform e-commerce BelanjaMudah.id menunjukkan anomali: seorang developer melakukan upload 15GB data melalui HTTPS ke layanan cloud storage pribadi menggunakan koneksi dari dalam jaringan perusahaan selama 3 hari berturut-turut. Data berkorelasi dengan ukuran database produk dan data pelanggan yang dikuasai developer tersebut dalam perannya.",
      questions: [
        "Bagaimana analisis proxy log dapat membedakan antara penggunaan cloud storage yang legitim untuk keperluan kerja versus exfiltration data yang tidak sah, menggunakan threshold dan baseline?",
        "Aturan DLP (Data Loss Prevention) dan SIEM correlation apa yang dapat mendeteksi pola upload besar yang berulang ke layanan eksternal sebagai indikasi data theft?",
        "Rekonstruksi timeline insiden menggunakan proxy logs, firewall logs, dan endpoint logs untuk membuktikan kronologi dan scope data yang dicuri.",
        "Dari perspektif hukum dan forensik digital, bagaimana log dari proxy server dapat dijadikan barang bukti yang sah dalam proses hukum insider data theft di Indonesia?"
      ]
    },
    {
      title: "Deteksi Serangan via Analisis Syslog Manufaktur",
      scenario: "PT Maju Bersama Manufacturing mengalami gangguan pada sistem ERP yang menyebabkan penundaan produksi. Analisis syslog dari server ERP menunjukkan pola akses database yang tidak normal: query yang sangat besar dan lambat berulang kali dari IP internal yang tidak biasa mengakses modul ERP, diikuti crash service pada jam sibuk produksi. Investigasi awal mengarah pada kemungkinan SQL injection oleh insider.",
      questions: [
        "Bagaimana syslog dari aplikasi ERP dan database server dianalisis secara bersamaan untuk membedakan anomali performa normal versus indikasi SQL injection aktif?",
        "Snort/Suricata rule apa yang dapat mendeteksi SQL injection pada traffic ke database port (3306 MySQL, 5432 PostgreSQL) dalam jaringan internal perusahaan manufaktur?",
        "Jelaskan bagaimana SIEM dapat mengkorelasikan peningkatan load database, error pada application log, dan akses dari IP internal yang tidak lazim untuk mengkonfirmasi serangan SQL injection.",
        "Kontrol keamanan database (DAM — Database Activity Monitoring) apa yang seharusnya melengkapi SIEM untuk perlindungan optimal data ERP manufaktur?"
      ]
    },
    {
      title: "Network Log Analysis pada Operator Telekomunikasi",
      scenario: "Operator telekomunikasi PT Nusa Koneksi mengalami penggunaan bandwidth yang tidak normal pada segmen jaringan backbone — 300% di atas baseline selama 2 jam pada dini hari. NetFlow analysis menunjukkan bahwa traffic berasal dari puluhan server internal yang secara bersamaan melakukan koneksi ke target IP eksternal yang sama. SIEM mengkorelasikan ini dengan alert endpoint mengenai proses yang tidak dikenal yang berjalan di server-server tersebut.",
      questions: [
        "Bagaimana NetFlow dan IPFIX analysis digunakan untuk mendeteksi dan mengkonfirmasi bahwa server-server internal telah menjadi bagian dari botnet dan digunakan untuk serangan DDoS?",
        "Syslog dari network devices (router, switch) menampilkan data apa yang berguna untuk investigasi, dan bagaimana mengkorelasikannya dengan data endpoint logs dari server yang terinfeksi?",
        "Rancang Snort rule set untuk mendeteksi traffic C2 botnet yang menggunakan protocol HTTP dengan karakteristik beacon (reguler, ukuran kecil, ke IP/domain yang sama).",
        "Bagaimana prosedur incident response untuk botnet infection pada infrastruktur kritis operator telekomunikasi, termasuk kewajiban pelaporan ke BSSN dan penanganan dampak layanan?"
      ]
    },
    {
      title: "Log Correlation dalam Investigasi Insider Threat Startup",
      scenario: "Startup fintech BayarMudah.io mencurigai kebocoran informasi produk ke kompetitor. Investigasi HR mengarah pada seorang engineer senior yang resign 2 bulan lalu. SIEM log menunjukkan bahwa seminggu sebelum resign, engineer tersebut mengakses ribuan file di repository code yang tidak berhubungan dengan tugasnya, dan melakukan copy besar-besaran melalui git clone ke laptop pribadinya.",
      questions: [
        "Event log apa dari Git server, LDAP/Active Directory, dan endpoint yang harus dikorelasikan untuk membuktikan aktivitas mass data collection oleh insider threat?",
        "Bagaimana UEBA (User and Entity Behavior Analytics) dalam SIEM modern dapat mendeteksi anomali perilaku pengguna yang mengindikasikan insider threat, dibandingkan rule-based detection tradisional?",
        "Jelaskan proses digital forensics untuk mengumpulkan dan mempreservasi bukti dari log SIEM yang dapat digunakan dalam proses hukum pembuktian insider threat.",
        "Kontrol keamanan proaktif apa (DLP, CASB, privileged access monitoring) yang dapat mencegah insider data theft pada lingkungan startup dengan budaya open access yang kuat?"
      ]
    },
    {
      title: "Syslog Analysis Deteksi Intrusi pada Sistem Logistik",
      scenario: "Perusahaan logistik NusaKargo Ekspres menemukan melalui analisis syslog rutin bahwa server pelacakan paket mereka melakukan koneksi SSH outbound ke server di negara asing pada pukul 03.00-04.00 setiap malam selama 3 minggu. Investigasi menunjukkan bahwa penyerang telah memasang reverse shell backdoor pada server dan menggunakannya untuk perlahan mengekstrak data pelacakan dan rute pengiriman.",
      questions: [
        "Bagaimana analisis syslog dan netflow secara bersamaan dapat mengkonfirmasi keberadaan reverse shell backdoor yang beroperasi secara reguler pada jam tertentu?",
        "Snort rule seperti apa yang mendeteksi SSH outbound pada port non-standar atau koneksi SSH ke IP di luar baseline network yang diketahui?",
        "Jelaskan bagaimana threat intelligence feed diintegrasikan ke SIEM untuk secara otomatis menandai koneksi ke IP/domain yang diketahui sebagai C2 infrastructure.",
        "Rancang prosedur incident response dan forensic preservation untuk kasus server compromise dengan reverse shell, termasuk langkah mempreservasi bukti sebelum melakukan eradikasi."
      ]
    },
    {
      title: "DNS Log Analysis Mengungkap C2 di PLTU",
      scenario: "PLTU Nusantara Power mengimplementasikan centralized DNS logging setelah insiden sebelumnya dan menemukan pola mencurigakan: workstation control room mengquery domain yang menggunakan teknik DNS over HTTPS (DoH) untuk berkomunikasi dengan server C2, berhasil melewati inspeksi DNS tradisional. Pola tersebut terdeteksi melalui anomali traffic volume ke resolver DoH yang tidak umum.",
      questions: [
        "Bagaimana DNS logging konvensional dapat gagal mendeteksi DNS over HTTPS (DoH) sebagai vektor C2, dan apa pendekatan monitoring yang tepat untuk menangani tantangan ini?",
        "Analisis log apa yang dapat membedakan penggunaan DoH yang legitim (untuk privasi) versus DoH yang digunakan sebagai covert channel oleh malware?",
        "Dalam konteks SIEM, bagaimana membuat detection rule yang mengidentifikasi anomali traffic ke DoH resolvers pada jaringan ICS/OT yang tidak seharusnya mengakses internet?",
        "Jelaskan strategi DNS security (RPZ — Response Policy Zones, DNS sinkholes) yang dapat mencegah resolusi domain C2 bahkan ketika teknik enkripsi DNS digunakan."
      ]
    },
    {
      title: "SIEM Alert Mengungkap Serangan pada TV Nasional",
      scenario: "Stasiun TV Nasional Cakrawala menerima serangkaian SIEM alerts dalam satu malam: anomali akses ke edit suite server, upaya akses ke broadcast control system dari workstation yang tidak biasa, dan upload besar ke storage eksternal. Setelah korelasi, SOC menyimpulkan serangan terkoordinasi yang bertujuan menginterupsi siaran langsung acara nasional keesokan harinya.",
      questions: [
        "Bagaimana SIEM correlation rule dapat menghubungkan tiga alert yang secara individual tampak seperti false positive menjadi satu insiden terkoordinasi yang kritis?",
        "Tipe data keamanan mana (alert, session, transaction, full packet) yang paling relevan untuk investigasi serangan pada sistem broadcast dalam situasi time-sensitive?",
        "Buat contoh SIEM correlation query yang mengidentifikasi pola 'akses sistem kritis dari sumber baru + upload data besar + waktu tengah malam' sebagai insiden berprioritas tinggi.",
        "Bagaimana SOC harus memprioritaskan respons ketika berhadapan dengan potensi gangguan siaran langsung acara nasional yang memiliki deadline sangat ketat?"
      ]
    },
    {
      title: "Log Analysis Mengungkap Ancaman pada Firma Hukum",
      scenario: "Firma hukum Citra & Partners mengimplementasikan SIEM baru dan langsung menemukan bahwa selama 3 bulan terakhir, dokumen kasus rahasia telah diakses secara tidak normal — berulang kali dari akun aktif namun pada jam tengah malam dan dari IP yang berbeda dari biasanya. Analisis lebih lanjut menemukan kemungkinan credential stuffing yang berhasil menggunakan password lama yang bocor dari breach eksternal.",
      questions: [
        "Bagaimana SIEM mendeteksi credential stuffing attack yang menggunakan akun valid tapi dari lokasi/waktu yang anomali, menggunakan kombinasi authentication logs dan geolocation data?",
        "User and Entity Behavior Analytics (UEBA) rule seperti apa yang mendeteksi 'impossible travel' (login dari kota berbeda dalam 30 menit) dan akses di luar jam kerja?",
        "Rekonstruksi timeline menggunakan authentication logs untuk menentukan berapa lama credential compromise berlangsung dan dokumen apa yang mungkin telah diakses.",
        "Kontrol teknis dan prosedural apa yang harus diimplementasikan firma hukum untuk mencegah credential stuffing dan membatasi dampak jika credential bocor?"
      ]
    },
    {
      title: "Security Data Analysis pada Perusahaan Asuransi",
      scenario: "Perusahaan asuransi PT Jaga Lindungi mengimplementasikan full packet capture (PCAP) pada segmen jaringan server klaim selama 30 hari. Analisis PCAP mengungkap bahwa data klaim nasabah dikirim dalam format yang tidak terenkripsi pada komunikasi internal antar server aplikasi, memungkinkan siapapun dengan akses jaringan internal untuk mencegat dan membaca data sensitif.",
      questions: [
        "Bagaimana analisis full packet capture dapat mengidentifikasi komunikasi tidak terenkripsi pada traffic internal, dan tools apa yang digunakan untuk parsing PCAP pada skala besar?",
        "Apa perbedaan antara menggunakan session/flow data versus full packet capture untuk investigasi keamanan, dan kapan masing-masing pendekatan lebih sesuai?",
        "Snort rule apa yang dapat mendeteksi transmisi data sensitif (seperti nomor polis, nama, NIK) dalam format unencrypted pada jaringan internal?",
        "Bagaimana temuan dari analisis network security data ini diterjemahkan menjadi rekomendasi keamanan yang konkret untuk arsitektur komunikasi internal perusahaan asuransi?"
      ]
    },
    {
      title: "Log Forensics pada Insiden Properti",
      scenario: "Pengembang properti Graha Nusantara Group mendapati bahwa data harga dan strategi penawaran untuk tender proyek besar telah bocor ke kompetitor. Investigasi log menunjukkan bahwa file presentasi rahasia dibuka, diprint-screen menggunakan aplikasi screen capture, dan kemudian file tersebut dihapus dari recycle bin oleh pengguna yang sama dalam sesi yang sama.",
      questions: [
        "Windows Event Log dan Audit Policy mana yang harus diaktifkan untuk merekam akses file (open, read, print), penggunaan clipboard, dan eksekusi screen capture tool?",
        "Bagaimana analisis log dari DLP solution, endpoint detection, dan Windows File System Audit dapat bersama-sama membuktikan tindakan exfiltration data melalui screen capture?",
        "Jelaskan teknik anti-forensics yang mungkin digunakan oleh insider (menghapus file, membersihkan event log) dan bagaimana log retention di SIEM dapat menggagalkan teknik ini.",
        "Rancang kebijakan audit logging yang komprehensif untuk sistem dokumen rahasia di perusahaan properti yang memenuhi persyaratan forensic evidence preservation."
      ]
    },
    {
      title: "Network Security Data Analisis pada Lembaga Zakat",
      scenario: "Lembaga Amil Zakat Nasional Berkah mengimplementasikan IDS sederhana berbasis Snort pada infrastruktur jaringannya dan dalam minggu pertama langsung menerima lebih dari 10.000 alert per hari yang sebagian besar adalah false positive. Tim IT yang kecil kewalahan dan tidak dapat memproses alert, sementara beberapa alert yang sebenarnya kritis terlewat.",
      questions: [
        "Jelaskan konsep 'alert fatigue' dan bagaimana organisasi dengan resource terbatas seperti lembaga zakat dapat mengelola volume alert tinggi dari IDS dengan efektif.",
        "Strategi tuning IDS apa yang dapat mengurangi false positive rate secara signifikan tanpa meningkatkan false negative rate pada jaringan lembaga zakat?",
        "Bagaimana prioritisasi alert berdasarkan kritikalitas aset (server donasi vs workstation admin vs infrastruktur non-kritis) membantu SOC kecil mengelola sumber daya terbatas?",
        "Untuk lembaga zakat dengan anggaran IT minimal, jelaskan arsitektur security monitoring yang efisien menggunakan kombinasi open-source SIEM (Wazuh), IDS (Suricata), dan log aggregation (ELK Stack)."
      ]
    }
  ],
  quiz: [
    {
      id: 1,
      question: "Tim SOC membutuhkan data yang paling detail untuk melakukan rekonstruksi forensik lengkap terhadap sebuah insiden serangan. Tipe data keamanan mana yang memberikan informasi paling lengkap termasuk konten payload?",
      type: "multiple-choice",
      options: [
        "NetFlow/IPFIX session data",
        "SIEM alert data",
        "Full Packet Capture (PCAP)",
        "Statistical traffic data dari SNMP"
      ],
      answer: "Full Packet Capture (PCAP)"
    },
    {
      id: 2,
      question: "Sebuah Syslog message memiliki Priority value <34>. Jika Facility code untuk 'auth' adalah 4, berapakah Severity level dari pesan ini?",
      type: "multiple-choice",
      options: [
        "Severity 0 (Emergency)",
        "Severity 2 (Critical)",
        "Severity 4 (Warning)",
        "Severity 6 (Informational)"
      ],
      answer: "Severity 2 (Critical)"
    },
    {
      id: 3,
      question: "Dalam Snort rule berikut: 'threshold:type both, track by_src, count 20, seconds 5' — apa yang dilakukan opsi threshold ini?",
      type: "multiple-choice",
      options: [
        "Mengirim alert setiap kali 20 event terjadi dari sumber yang sama",
        "Menghasilkan satu alert jika source IP yang sama memicu rule ini 20 kali atau lebih dalam 5 detik",
        "Memblokir source IP setelah 20 koneksi dalam 5 detik",
        "Merekam 20 paket terakhir selama 5 detik untuk analisis forensik"
      ],
      answer: "Menghasilkan satu alert jika source IP yang sama memicu rule ini 20 kali atau lebih dalam 5 detik"
    },
    {
      id: 4,
      question: "Windows Event ID 4624 memiliki Logon Type 3. Apa arti Logon Type 3 dalam konteks analisis keamanan?",
      type: "multiple-choice",
      options: [
        "Interactive Logon — pengguna login langsung di console",
        "Network Logon — akses jaringan seperti file sharing atau akses printer",
        "Remote Interactive Logon — login via RDP",
        "Service Logon — proses berjalan sebagai akun service"
      ],
      answer: "Network Logon — akses jaringan seperti file sharing atau akses printer"
    },
    {
      id: 5,
      question: "Apa keunggulan utama NetFlow/IPFIX dibandingkan Full Packet Capture untuk monitoring jaringan skala besar?",
      type: "multiple-choice",
      options: [
        "NetFlow memberikan detail payload yang lebih lengkap untuk analisis malware",
        "NetFlow hanya membutuhkan sekitar 1.5% storage dari full packet capture namun tetap memberikan visibilitas koneksi yang baik",
        "NetFlow dapat mendeteksi enkripsi SSL/TLS lebih efektif",
        "NetFlow mendukung lebih banyak protokol jaringan dibandingkan packet capture"
      ],
      answer: "NetFlow hanya membutuhkan sekitar 1.5% storage dari full packet capture namun tetap memberikan visibilitas koneksi yang baik"
    },
    {
      id: 6,
      question: "Komponen SIEM yang bertanggung jawab untuk mengubah format log yang beragam (Windows Event, Syslog, CEF) menjadi format standar yang dapat dianalisis adalah:",
      type: "multiple-choice",
      options: [
        "Log Collectors/Forwarders",
        "Data Normalization Engine",
        "Correlation Engine",
        "Alert Management Module"
      ],
      answer: "Data Normalization Engine"
    },
    {
      id: 7,
      question: "Seorang analyst menemukan bahwa sebuah workstation membuat 500 DNS query ke subdomain yang berbeda-beda dalam 10 menit, semua menuju domain yang baru terdaftar 3 hari lalu. Ini adalah indikator teknik malware apa?",
      type: "multiple-choice",
      options: [
        "DNS Cache Poisoning — penyerang memanipulasi cache DNS lokal",
        "DNS Amplification Attack — memanfaatkan DNS untuk DDoS",
        "Domain Generation Algorithm (DGA) — malware membuat domain C2 secara algoritmik",
        "DNS Hijacking — mengalihkan query DNS ke server jahat"
      ],
      answer: "Domain Generation Algorithm (DGA) — malware membuat domain C2 secara algoritmik"
    },
    {
      id: 8,
      question: "Jelaskan perbedaan antara IDS (Intrusion Detection System) dan SIEM dalam ekosistem keamanan jaringan. Bagaimana keduanya bekerja sama untuk meningkatkan kemampuan deteksi ancaman di SOC?",
      type: "essay",
      answer: "IDS adalah sistem yang secara aktif memantau lalu lintas jaringan atau aktivitas host secara real-time dan menghasilkan alert berdasarkan rule signature atau anomali — IDS adalah sensor yang menghasilkan data mentah. SIEM adalah platform agregasi dan analisis yang mengumpulkan, menormalisasi, dan mengkorelasikan log dari IDS dan puluhan sumber lainnya (firewall, endpoint, aplikasi) untuk menemukan pola serangan yang tidak terlihat dari satu sumber saja. Kolaborasi: IDS menghasilkan alert spesifik tentang pola berbahaya dalam traffic jaringan → SIEM menerima alert ini bersama log dari sumber lain → SIEM correlation engine menemukan bahwa alert IDS berkorelasi dengan anomali login dari Windows Event Log dan anomali DNS dari DNS server → SIEM menghasilkan insiden prioritas tinggi yang mencakup konteks penuh → SOC analyst menginvestigasi insiden terkompilasi, bukan ribuan alert individual. SIEM mengurangi alert fatigue dengan menggabungkan multiple low-severity events menjadi satu high-fidelity incident."
    },
    {
      id: 9,
      question: "Anda diminta menulis Snort rule untuk mendeteksi percobaan SQL injection menggunakan teknik 'UNION SELECT' pada aplikasi web. Tuliskan rule tersebut dengan syntax yang benar dan jelaskan setiap komponen pentingnya.",
      type: "essay",
      answer: "Rule Snort untuk SQL Injection UNION SELECT:\n\nalert tcp $EXTERNAL_NET any -> $HTTP_SERVERS $HTTP_PORTS (\n  msg:\"SQL Injection UNION SELECT Detected\";\n  flow:established,to_server;\n  content:\"UNION\"; nocase; http_uri;\n  content:\"SELECT\"; nocase; distance:0; http_uri;\n  pcre:\"/UNION\\s+SELECT/Ui\";\n  classtype:web-application-attack;\n  sid:1000100;\n  rev:1;\n)\n\nPenjelasan komponen:\n- 'alert': action yang diambil (generate alert, tidak blokir)\n- 'tcp': protokol yang dimonitor\n- '$EXTERNAL_NET any -> $HTTP_SERVERS $HTTP_PORTS': traffic dari jaringan eksternal ke web server\n- 'msg': deskripsi alert yang muncul di log\n- 'flow:established,to_server': hanya traffic dalam koneksi established yang menuju server\n- 'content:\"UNION\"; nocase; http_uri': cari string UNION (case-insensitive) di HTTP URI\n- 'content:\"SELECT\"; nocase; distance:0; http_uri': SELECT harus ada setelah UNION (distance:0 = berurutan)\n- 'pcre:\"/UNION\\s+SELECT/Ui\"': verifikasi dengan regex — UNION diikuti whitespace diikuti SELECT\n- 'classtype:web-application-attack': kategorisasi untuk reporting\n- 'sid': ID unik rule\n- 'rev': nomor revisi untuk version control rule"
    },
    {
      id: 10,
      question: "Jelaskan konsep Log Correlation dan bagaimana teknik ini digunakan dalam investigasi insiden data exfiltration. Berikan contoh konkret menggunakan minimal tiga sumber log yang berbeda.",
      type: "essay",
      answer: "Log Correlation adalah proses menggabungkan dan menganalisis log dari multiple sumber yang berbeda untuk membangun gambaran lengkap tentang sebuah insiden keamanan yang tidak terlihat dari satu sumber log saja. Contoh investigasi data exfiltration: (1) DNS Logs: workstation 10.0.1.50 membuat 300 DNS query ke subdomain domain-baru.xyz dalam 10 menit (anomali DGA). (2) Firewall Logs: workstation 10.0.1.50 berhasil membuka koneksi TCP:443 ke IP 185.220.0.1 dengan total transfer 2.5GB outbound (anomali volume). (3) Windows Event Logs: proses 'python3.exe' diluncurkan oleh user 'user.name' jam 02.30 WIB (anomali waktu + proses tidak biasa), Event ID 4688. (4) KORELASI: ketiga anomali terjadi dalam timeframe yang sama (02.30-02.45 WIB), dari entitas yang sama (workstation + user yang sama), membentuk narasi: user tertentu menjalankan script Python dini hari yang menggunakan DGA untuk resolusi C2 server dan mengekstrak 2.5GB data via HTTPS. Tanpa korelasi, setiap log mungkin tidak terlihat cukup mencurigakan secara individual."
    },
    {
      id: 11,
      question: "Apa yang dimaksud dengan 'Alert Fatigue' dalam konteks SOC, dan bagaimana SIEM dapat dikonfigurasi untuk mengurangi masalah ini tanpa meningkatkan risiko terlewatnya insiden nyata?",
      type: "essay",
      answer: "Alert Fatigue adalah kondisi di mana SOC analyst kewalahan dengan volume alert yang sangat tinggi — sebagian besar adalah false positive — sehingga mulai mengabaikan atau memproses alert secara serampangan, meningkatkan risiko terlewatnya insiden nyata. Penyebab: IDS/SIEM rules yang terlalu broad, tidak adanya tuning rule berdasarkan konteks lingkungan, tidak ada prioritisasi berdasarkan kritikalitas aset. Solusi konfigurasi SIEM: (1) Rule Tuning — suppress alert dari sumber yang diketahui legitimate (IP scanner internal, backup system, monitoring tools); (2) Risk Scoring — tambahkan skor risiko berdasarkan kritikalitas aset target, bukan hanya rule severity; (3) Correlation — gabungkan multiple low-severity alert menjadi satu high-fidelity incident sebelum ditampilkan ke analyst; (4) Whitelisting — buat exception list untuk perilaku normal yang diketahui; (5) Threshold adjustment — naikkan threshold untuk rule yang menghasilkan banyak false positive sambil memantau false negative; (6) Machine Learning/UEBA — gunakan behavior baseline untuk mendeteksi deviasi nyata, bukan hanya rule-based matching."
    },
    {
      id: 12,
      question: "Dalam analisis Syslog, sebuah pesan memiliki priority value <165>. Tentukan Facility dan Severity dari pesan ini, dan interpretasikan artinya dalam konteks monitoring keamanan.",
      type: "multiple-choice",
      options: [
        "Facility 20 (local4), Severity 5 (Notice) — log dari aplikasi lokal dengan severity informational",
        "Facility 20 (local4), Severity 5 (Notice) — log dari daemon lokal yang perlu diperhatikan tapi tidak kritis",
        "Facility 21 (local5), Severity 5 (Notice) — log aplikasi internal dengan prioritas sedang",
        "Facility 20 (local4), Severity 4 (Warning) — log dari daemon lokal dengan peringatan yang perlu ditindaklanjuti"
      ],
      answer: "Facility 20 (local4), Severity 5 (Notice) — log dari daemon lokal yang perlu diperhatikan tapi tidak kritis"
    },
    {
      id: 13,
      question: "Jelaskan perbedaan antara Snort content matching dan PCRE matching dalam context IDS rules. Kapan sebaiknya menggunakan PCRE dan apa risiko penggunaan PCRE yang berlebihan?",
      type: "essay",
      answer: "Content matching dalam Snort mencari string literal yang tepat dalam payload — cepat karena menggunakan algoritma Boyer-Moore yang dioptimasi, tidak ambigu, dan mudah dipahami. PCRE (Perl Compatible Regular Expression) memungkinkan pencocokan pola yang jauh lebih fleksibel menggunakan ekspresi reguler — dapat mencocokkan variasi string, karakter wildcard, quantifier, dan lookahead/lookbehind. Kapan menggunakan PCRE: ketika serangan memiliki variasi yang tidak dapat ditangkap oleh string literal saja (contoh: SQL injection dapat menggunakan spasi, tab, atau URL encoding antara UNION dan SELECT); ketika perlu mencocokkan format data tertentu (contoh: nomor kartu kredit dengan pattern). Risiko PCRE berlebihan: (1) Performance degradation — PCRE jauh lebih lambat dari content matching, terutama pada high-traffic networks; (2) Regex complexity — ekspresi yang kompleks dapat memiliki backtracking exponential (ReDoS vulnerability); (3) False positive — regex yang terlalu broad menangkap traffic legitimate; Praktik terbaik: gunakan content matching dulu untuk filtering awal (pre-filter), kemudian PCRE hanya sebagai verifikasi tambahan pada subset traffic yang sudah di-filter."
    }
  ],
  videoResources: [
    {
      title: "SIEM Explained — How Security Information and Event Management Works",
      youtubeId: "b8yJuYFqMlo",
      description: "Penjelasan mendalam tentang arsitektur SIEM, komponen utama, dan cara kerja korelasi log.",
      language: "en",
      duration: "19:45"
    },
    {
      title: "Snort IDS Tutorial — Writing Custom Rules",
      youtubeId: "iVhPOG4tEaU",
      description: "Tutorial praktis penulisan Snort rules dari dasar hingga rule kompleks dengan PCRE.",
      language: "en",
      duration: "22:10"
    },
    {
      title: "NetFlow Analysis for Network Security Monitoring",
      youtubeId: "TMNVQNKyRDA",
      description: "Cara menggunakan NetFlow data untuk mendeteksi ancaman jaringan dan melakukan threat hunting.",
      language: "en",
      duration: "16:33"
    },
    {
      title: "Windows Event Log Analysis — Essential Event IDs for SOC Analysts",
      youtubeId: "JTK6Rh7hEpo",
      description: "Panduan komprehensif tentang Windows Event IDs yang paling penting untuk analyst SOC.",
      language: "en",
      duration: "24:18"
    }
  ]
};
