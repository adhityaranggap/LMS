import type { ModuleData, CaseStudyVariant } from '../module-types';

export interface Module10Data extends ModuleData {
  caseStudyPool: CaseStudyVariant[];
}

export const module10: Module10Data = {
  id: 10,
  title: "Defense & Access Control",
  description: "Pertahanan Keamanan Jaringan dan Access Control",
  iconName: "Lock",

  // ─── THEORY ──────────────────────────────────────────────────────────────────
  theory: [
    {
      title: "Defense-in-Depth: Strategi Keamanan Berlapis",
      content:
        "Defense-in-Depth (DiD) adalah strategi keamanan informasi yang mengimplementasikan beberapa lapisan pertahanan independen sehingga jika satu lapisan ditembus, lapisan berikutnya masih memberikan perlindungan. Konsep ini diambil dari strategi militer: pertahanan berlapis memaksa penyerang mengatasi setiap lapisan secara berurutan, meningkatkan waktu, usaha, dan keahlian yang dibutuhkan. Dalam konteks keamanan informasi, NIST dan ISO 27001 merekomendasikan pendekatan ini sebagai praktik terbaik. Model DiD yang paling umum terdiri dari 5 lapisan: Physical, Network, Host, Application, dan Data — setiap lapisan menggunakan kombinasi preventive, detective, dan corrective controls.",
      table: {
        caption: "Model Defense-in-Depth: Lima Lapisan Keamanan",
        headers: ["Lapisan", "Tujuan", "Contoh Kontrol Preventif", "Contoh Kontrol Detektif", "Tools/Teknologi"],
        rows: [
          [
            "Physical (Fisik)",
            "Mencegah akses fisik tidak sah ke infrastruktur",
            "Kunci pintu server room, badge access, CCTV, mantraps",
            "Motion sensor, alarm intrusi, audit log badge entry",
            "Biometric scanner, IP camera, UPS, cage rack",
          ],
          [
            "Network (Jaringan)",
            "Mengontrol aliran traffic antar segmen dan ke internet",
            "Firewall, DMZ, VLAN segmentation, VPN",
            "IDS/IPS, NetFlow analysis, SIEM correlation",
            "Next-Gen Firewall, Cisco IDS, Snort, Zeek",
          ],
          [
            "Host (Endpoint)",
            "Melindungi sistem operasi dan layanan di host",
            "OS hardening, patch management, host firewall, antimalware",
            "HIDS, EDR, Windows Event Log monitoring",
            "CrowdStrike, Carbon Black, OSSEC, Sysmon",
          ],
          [
            "Application (Aplikasi)",
            "Mencegah eksploitasi kerentanan di layer aplikasi",
            "Input validation, WAF, secure coding, least privilege",
            "DAST/SAST scanning, application log monitoring",
            "OWASP ZAP, Burp Suite, ModSecurity WAF",
          ],
          [
            "Data",
            "Melindungi data sensitif dari akses/modifikasi tidak sah",
            "Enkripsi at-rest dan in-transit, DLP, data classification",
            "Database Activity Monitoring (DAM), DLP alerts",
            "BitLocker, VeraCrypt, McAfee DLP, Varonis",
          ],
        ],
      },
      keyPoints: [
        "DiD bukan tentang memiliki banyak produk keamanan — tapi tentang kontrol yang saling melengkapi dan independen",
        "Prinsip 'breadth and depth': beragam vendor (breadth) dan beragam teknik (depth) mengurangi single point of failure",
        "People dan Process sama pentingnya dengan Technology — kontrol teknis terbaik gagal tanpa prosedur dan kesadaran pengguna",
        "Setiap lapisan harus mengasumsikan bahwa lapisan di atasnya sudah ditembus — strategi 'assume breach'",
      ],
    },

    {
      title: "Security Policies, Regulations & Standards: ISO 27001, NIST, PCI-DSS",
      content:
        "Kebijakan keamanan informasi adalah dokumen resmi yang menetapkan aturan, tanggung jawab, dan prosedur untuk melindungi aset informasi organisasi. Kebijakan ini harus sejalan dengan regulasi dan standar yang berlaku — baik yang bersifat mandatory (wajib) maupun voluntary (sukarela). Di Indonesia, UU ITE dan UU PDP adalah regulasi wajib. Standar internasional seperti ISO 27001 dan NIST Cybersecurity Framework memberikan panduan best practice. Untuk industri tertentu seperti perbankan, PCI-DSS untuk kartu pembayaran dan POJK untuk fintech juga berlaku. Kerangka kerja ini membantu organisasi membangun, mengoperasikan, dan meningkatkan sistem manajemen keamanan informasi (ISMS) secara sistematis.",
      table: {
        caption: "Perbandingan Framework dan Standar Keamanan Informasi",
        headers: ["Framework/Standar", "Tipe", "Fokus Utama", "Sertifikasi", "Berlaku Untuk"],
        rows: [
          ["ISO/IEC 27001:2022", "Standar International (Voluntary)", "ISMS: Information Security Management System. 93 kontrol dalam 4 tema", "Ya — audit pihak ketiga", "Semua organisasi, semua industri"],
          ["NIST Cybersecurity Framework (CSF) 2.0", "Framework (Voluntary)", "5 fungsi: Identify, Protect, Detect, Respond, Recover", "Tidak — self-assessment", "Infrastruktur kritikal AS, adopsi global"],
          ["PCI-DSS v4.0", "Standar Industri (Mandatory untuk kartu)", "12 requirement keamanan untuk lingkungan kartu pembayaran", "Ya — QSA audit tahunan", "Merchant, payment processor, card brand"],
          ["UU PDP (UU No. 27/2022)", "Regulasi Indonesia (Mandatory)", "Perlindungan data pribadi warga negara Indonesia", "Tidak — compliance otoritas", "Semua entitas yang proses data WNI"],
          ["POJK No. 11/2022", "Regulasi OJK (Mandatory)", "Keamanan teknologi informasi sektor jasa keuangan", "Tidak — audit OJK", "Bank, fintech, asuransi di Indonesia"],
          ["SOC 2 Type II", "Standar Audit (Voluntary)", "Trust Service Criteria: Security, Availability, Confidentiality, Privacy, Processing Integrity", "Ya — audit CPA", "SaaS provider, cloud service"],
          ["HIPAA", "Regulasi AS (Mandatory)", "Perlindungan data kesehatan (PHI)", "Ya — self-attestation", "Healthcare provider, asuransi kesehatan di AS"],
        ],
      },
      note: "Banyak organisasi perlu comply dengan MULTIPLE standar secara bersamaan. Gunakan pendekatan 'unified control framework' — petakan kontrol ISO 27001 ke NIST CSF dan PCI-DSS untuk mengurangi duplikasi usaha compliance.",
      noteType: "info",
    },

    {
      title: "Access Control Models: DAC, MAC, RBAC, ABAC",
      content:
        "Model access control mendefinisikan bagaimana keputusan 'siapa boleh mengakses apa' dibuat dan dikelola dalam sistem. Pemilihan model yang tepat bergantung pada kebutuhan keamanan, kompleksitas organisasi, dan sensitivitas data. DAC (Discretionary Access Control) memberikan kebebasan kepada pemilik resource untuk menentukan siapa yang boleh mengakses — fleksibel tapi kurang aman. MAC (Mandatory Access Control) menggunakan label klasifikasi (Top Secret, Secret, Confidential, Unclassified) dan aturan yang ditetapkan sistem — sangat ketat, digunakan di lingkungan militer/pemerintah. RBAC (Role-Based Access Control) memberikan akses berdasarkan peran kerja — paling banyak digunakan di enterprise. ABAC (Attribute-Based Access Control) paling fleksibel: keputusan berdasarkan kombinasi atribut user, resource, dan environment.",
      table: {
        caption: "Perbandingan Model Access Control",
        headers: ["Model", "Prinsip Dasar", "Siapa Menentukan Akses?", "Kelebihan", "Kekurangan", "Use Case"],
        rows: [
          ["DAC", "Owner resource menentukan hak akses", "Pemilik file/resource", "Fleksibel, mudah diimplementasi", "Rentan Trojan Horse (program jahat berjalan sebagai user legitimate)", "File system Linux/Windows, shared drives"],
          ["MAC", "Sistem menentukan akses berdasarkan label keamanan (classification)", "Administrator/Sistem", "Sangat ketat, tidak bisa bypass oleh user biasa", "Kompleks, kaku, sulit dipelihara untuk organisasi komersial", "Militer, intelijen, pemerintah klasifikasi tinggi"],
          ["RBAC", "Akses berdasarkan peran kerja dalam organisasi", "Administrator (melalui role assignment)", "Mudah dikelola, principle of least privilege, audit friendly", "Role explosion (terlalu banyak role), tidak granular untuk kasus khusus", "Enterprise IT, ERP, cloud IAM (AWS, Azure)"],
          ["ABAC", "Akses berdasarkan kombinasi atribut: user, resource, environment (waktu, lokasi)", "Policy engine (kebijakan berbasis atribut)", "Sangat granular dan fleksibel, context-aware (boleh akses jam kerja saja)", "Kompleks untuk dirancang dan di-debug, overhead komputasi", "Zero Trust, cloud-native app, API security, zero trust network"],
        ],
      },
      example: {
        title: "Contoh Penerapan RBAC di Sistem Rumah Sakit",
        steps: [
          "Role: DOKTER — dapat read/write rekam medis pasien yang ditangani",
          "Role: PERAWAT — dapat read rekam medis, write catatan keperawatan",
          "Role: APOTEKER — dapat read resep, write konfirmasi pemberian obat",
          "Role: ADMIN_KEUANGAN — dapat read data tagihan, tidak boleh lihat rekam medis klinis",
          "Role: IT_SUPPORT — dapat akses sistem, tidak boleh akses data pasien sama sekali",
          "Principle of Least Privilege: setiap role hanya mendapat akses minimum yang dibutuhkan untuk tugasnya",
          "Separation of Duties: tidak ada satu role yang dapat melakukan keseluruhan transaksi kritis (prescribe + dispense obat)",
        ],
        result: "RBAC memudahkan onboarding karyawan baru (assign role), offboarding (remove role), dan audit (log aktivitas per role). Dibandingkan DAC yang harus set permission per file per user.",
      },
    },

    {
      title: "AAA Framework: Authentication, Authorization, Accounting",
      content:
        "AAA (Authentication, Authorization, Accounting) adalah framework keamanan fundamental yang menyediakan tiga layanan kritis untuk mengelola akses ke sumber daya jaringan dan sistem. Authentication (Autentikasi) memverifikasi identitas entitas yang mencoba mengakses — menjawab pertanyaan 'Siapa Anda?'. Authorization (Otorisasi) menentukan hak akses entitas yang sudah terautentikasi — menjawab 'Apa yang boleh Anda lakukan?'. Accounting (Akuntansi/Logging) mencatat semua aktivitas entitas selama sesi — menjawab 'Apa yang Anda lakukan?'. AAA diimplementasikan melalui protokol RADIUS atau TACACS+ yang menghubungkan Network Access Server (NAS) — seperti router, switch, atau VPN concentrator — ke server autentikasi terpusat.",
      example: {
        title: "Alur AAA pada Akses VPN Korporat",
        steps: [
          "1. AUTHENTICATION: Karyawan membuka VPN client, memasukkan username + password + OTP (MFA)",
          "2. NAS (VPN Gateway) meneruskan kredensial ke AAA Server (RADIUS/TACACS+)",
          "3. AAA Server memverifikasi: cek username/password di Active Directory, validasi OTP",
          "4. AAA Server merespons: ACCESS-ACCEPT (jika valid) atau ACCESS-REJECT (jika gagal)",
          "5. AUTHORIZATION: AAA Server mengirimkan atribut kepada NAS: VLAN yang diizinkan (Finance VLAN), ACL yang berlaku, bandwidth policy",
          "6. NAS menerapkan policy: karyawan Finance ditempatkan di Finance VLAN, dapat akses server HR dan Finance saja",
          "7. ACCOUNTING: NAS mengirimkan Accounting-Start ke AAA Server: username, IP yang diberikan, timestamp login",
          "8. Selama sesi: NAS periodik mengirim Accounting-Interim-Update (bytes in/out)",
          "9. Setelah logout: NAS mengirim Accounting-Stop: durasi sesi, total data, reason disconnect",
        ],
        result: "Log accounting memungkinkan audit trail lengkap: siapa (Authentication) mengakses apa (Authorization) dan kapan/berapa lama (Accounting). Penting untuk compliance dan investigasi insiden.",
      },
      keyPoints: [
        "Multi-Factor Authentication (MFA) menggabungkan sesuatu yang Anda tahu (password), miliki (token/HP), dan biometrik (sidik jari) — meningkatkan keamanan authentication secara drastis",
        "Principle of Least Privilege: Authorization harus memberikan hak minimum yang diperlukan untuk pekerjaan — tidak lebih",
        "Separation of Duties: pisahkan tugas kritis (pembuat permintaan ≠ approver ≠ executor) untuk mencegah fraud",
        "Accounting log harus disimpan di sistem terpisah yang tidak dapat dimodifikasi oleh pengguna yang dimonitor — immutable logging",
        "RADIUS menggabungkan Authentication dan Authorization dalam satu paket respons; TACACS+ memisahkannya — memberikan fleksibilitas lebih",
      ],
    },

    {
      title: "RADIUS vs TACACS+: Protokol AAA untuk Infrastruktur Jaringan",
      content:
        "RADIUS (Remote Authentication Dial-In User Service) dan TACACS+ (Terminal Access Controller Access Control System Plus) adalah dua protokol AAA yang paling banyak digunakan di lingkungan jaringan enterprise. RADIUS dikembangkan oleh Livingston Enterprises (1991) dan distandarisasi dalam RFC 2865 — awalnya untuk dial-up access, kini digunakan luas untuk Wi-Fi 802.1X, VPN, dan NAC. TACACS+ dikembangkan oleh Cisco sebagai perbaikan dari TACACS orisinal — proprietary tapi didokumentasikan dalam RFC 8907. Perbedaan fundamental: RADIUS menggabungkan authentication dan authorization; TACACS+ memisahkan ketiganya (separation of AAA services) memberikan granularitas lebih dalam policy authorization.",
      table: {
        caption: "Perbandingan RADIUS vs TACACS+",
        headers: ["Aspek", "RADIUS", "TACACS+"],
        rows: [
          ["Transport Protocol", "UDP port 1812 (auth) / 1813 (accounting)", "TCP port 49"],
          ["Enkripsi", "Hanya password yang dienkripsi (MD5); payload lain cleartext", "Seluruh payload dienkripsi (lebih aman)"],
          ["Pemisahan AAA", "Authentication & Authorization digabung dalam satu respons", "Authentication, Authorization, Accounting dipisah sepenuhnya"],
          ["Granularitas Otorisasi", "Per-user attribute (VLAN, ACL, bandwidth policy)", "Per-command authorization (kontrol perintah mana yang boleh dijalankan admin)"],
          ["Standar", "Open standard (RFC 2865, 2866, 3579)", "Proprietary Cisco (RFC 8907 — informational)"],
          ["Use Case Utama", "Network Access: Wi-Fi 802.1X, VPN, NAC, broadband", "Device Management: akses CLI router/switch, command authorization"],
          ["Dukungan Vendor", "Universal — semua vendor mendukung", "Terutama Cisco; vendor lain ada tapi lebih terbatas"],
          ["Fail-open vs Fail-closed", "Configurable; default biasanya fail-closed", "Configurable; Cisco default fail-closed untuk keamanan"],
        ],
      },
      note: "Best practice: gunakan RADIUS untuk network access control (Wi-Fi, VPN, NAC) dan TACACS+ untuk device management (console/SSH ke router dan switch). Kombinasi keduanya memberikan coverage AAA yang komprehensif.",
      noteType: "success",
    },

    {
      title: "Zero Trust Architecture: Prinsip dan Implementasi",
      content:
        "Zero Trust Architecture (ZTA) adalah paradigma keamanan yang membuang asumsi kepercayaan implisit berdasarkan lokasi jaringan. Model keamanan tradisional ('castle and moat') mengasumsikan semua traffic di dalam jaringan internal dapat dipercaya — ini menjadi obsolete di era cloud, remote work, dan insider threats. Zero Trust didasarkan pada prinsip 'Never Trust, Always Verify': setiap request akses harus diautentikasi, diotorisasi, dan diverifikasi setiap saat, terlepas dari apakah requestor berada di dalam atau di luar perimeter jaringan. Konsep ini dipopulerkan oleh John Kindervag (Forrester Research, 2010) dan kini menjadi rekomendasi NIST SP 800-207.",
      keyPoints: [
        "Verify Explicitly: autentikasi dan otorisasi berdasarkan semua data yang tersedia — identitas, lokasi, device health, service/workload, data classification, dan anomali perilaku",
        "Use Least Privileged Access: batasi akses user dengan just-in-time (JIT) dan just-enough-access (JEA), risk-based adaptive policies, dan perlindungan data",
        "Assume Breach: minimalkan blast radius (dampak jika terjadi breach), segmentasi akses end-to-end, enkripsi semua sesi, gunakan analytics untuk mendapatkan visibility",
        "Micro-segmentation: bagi jaringan menjadi zona-zona kecil dengan akses yang dikontrol ketat antar zona — pergerakan lateral (lateral movement) dibatasi",
        "Continuous Verification: re-autentikasi dan re-evaluasi policy secara terus-menerus, bukan hanya saat login awal — session token dengan TTL pendek",
        "Identity adalah perimeter baru: IAM (Identity and Access Management) menjadi inti dari Zero Trust — MFA, PAM (Privileged Access Management), dan Identity Provider (IdP)",
        "Device Trust: perangkat yang tidak managed/tidak compliant (missing patches, no AV, jailbroken) tidak boleh mendapat akses ke resource sensitif",
      ],
      codeSnippet: `# Contoh implementasi Zero Trust principle di level network
# menggunakan iptables micro-segmentation

# Default DENY semua traffic (Zero Trust default posture)
iptables -P FORWARD DROP
iptables -P INPUT DROP

# Izinkan hanya traffic yang explicitly diizinkan
# Web server (ZONA-WEB) hanya boleh berbicara ke App server (ZONA-APP)
# port 8080 — tidak boleh langsung ke DB
iptables -A FORWARD -s 10.10.1.0/24 -d 10.10.2.0/24 -p tcp --dport 8080 -j ACCEPT

# App server (ZONA-APP) hanya boleh ke DB server (ZONA-DB) port 5432 (PostgreSQL)
iptables -A FORWARD -s 10.10.2.0/24 -d 10.10.3.0/24 -p tcp --dport 5432 -j ACCEPT

# Admin workstation hanya boleh SSH ke server dari IP tertentu saja
iptables -A FORWARD -s 10.10.10.100/32 -d 10.10.2.0/24 -p tcp --dport 22 -j ACCEPT

# Log semua traffic yang di-DROP untuk audit (visibility)
iptables -A FORWARD -j LOG --log-prefix "ZT-BLOCKED: " --log-level 4
iptables -A INPUT -j LOG --log-prefix "ZT-BLOCKED: " --log-level 4`,
    },

    {
      title: "Hardening Sistem: Checklist Keamanan Linux dan Windows",
      content:
        "System Hardening adalah proses mengurangi attack surface sistem operasi dengan menghilangkan atau menonaktifkan komponen yang tidak diperlukan, mengkonfigurasi keamanan yang lebih ketat dari default, dan menerapkan patches terbaru. Default konfigurasi OS dirancang untuk kemudahan penggunaan, bukan keamanan — oleh karena itu hardening sangat penting sebelum sistem di-deploy ke production. Benchmark hardening standar industri: CIS (Center for Internet Security) Benchmarks memberikan panduan spesifik untuk setiap OS dan versi. DISA STIG (Security Technical Implementation Guide) digunakan di lingkungan US Government dan militer. NIST SP 800-123 memberikan panduan umum server hardening.",
      codeSnippet: `# ═══════════════════════════════════════════════════════════
# LINUX HARDENING CHECKLIST — Berbasis CIS Benchmark Level 1
# ═══════════════════════════════════════════════════════════

# 1. Update sistem dan patch
sudo apt update && sudo apt upgrade -y && sudo apt autoremove -y

# 2. Konfigurasi password policy (PAM)
sudo apt install libpam-pwquality -y
# Edit /etc/security/pwquality.conf:
# minlen = 14         # Panjang minimum password
# dcredit = -1        # Minimal 1 digit
# ucredit = -1        # Minimal 1 huruf besar
# ocredit = -1        # Minimal 1 karakter spesial
# lcredit = -1        # Minimal 1 huruf kecil
# maxrepeat = 3       # Maksimal 3 karakter berulang

# 3. Set password aging
sudo chage --maxdays 90 --mindays 7 --warndays 14 username

# 4. Disable root login via SSH
sudo sed -i 's/#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/#MaxAuthTries.*/MaxAuthTries 3/' /etc/ssh/sshd_config

# 5. Aktifkan dan konfigurasi UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw enable

# 6. Disable layanan yang tidak diperlukan
sudo systemctl disable --now cups avahi-daemon bluetooth

# 7. Konfigurasi kernel hardening (sysctl)
cat >> /etc/sysctl.conf << 'EOF'
net.ipv4.ip_forward = 0                  # Disable IP forwarding
net.ipv4.conf.all.send_redirects = 0     # Disable ICMP redirects
net.ipv4.conf.all.accept_redirects = 0   # Reject ICMP redirects
net.ipv4.tcp_syncookies = 1              # Enable SYN cookies
net.ipv4.conf.all.rp_filter = 1         # Enable reverse path filtering (anti-spoof)
kernel.randomize_va_space = 2            # Enable ASLR
EOF
sudo sysctl -p

# 8. Aktifkan audit framework
sudo apt install auditd -y
sudo systemctl enable --now auditd

# ═══════════════════════════════════════════════════════════
# WINDOWS HARDENING — PowerShell (CIS Benchmark)
# ═══════════════════════════════════════════════════════════

# Set Password Policy via Group Policy
net accounts /minpwlen:14 /maxpwage:90 /minpwage:7 /uniquepw:24

# Disable Guest Account
net user Guest /active:no

# Enable Windows Defender Firewall untuk semua profil
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True

# Disable SMBv1 (rentan terhadap EternalBlue/WannaCry)
Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol

# Enable BitLocker encryption
Enable-BitLocker -MountPoint "C:" -EncryptionMethod XtsAes256

# Audit policy — aktifkan logging untuk event penting
auditpol /set /subcategory:"Logon" /success:enable /failure:enable
auditpol /set /subcategory:"Account Lockout" /success:enable /failure:enable`,
      note: "Hardening adalah proses berkelanjutan, bukan sekali jadi. Gunakan configuration management tools (Ansible, Puppet, Chef) untuk memastikan hardening diterapkan konsisten di semua server dan di-remediate jika ada drift dari baseline.",
      noteType: "info",
    },
  ],

  // ─── LAB ─────────────────────────────────────────────────────────────────────
  lab: {
    title: "Lab 10: Access Control Implementation di Linux",
    downloads: [
      {
        name: "CyberOps Workstation VM",
        url: "https://www.netacad.com/",
        description: "VM Linux untuk praktik implementasi access control.",
      },
      {
        name: "CIS Benchmarks (Free Registration)",
        url: "https://www.cisecurity.org/cis-benchmarks",
        description: "Panduan hardening standar industri untuk berbagai OS dan aplikasi.",
      },
    ],
    steps: [
      {
        title: "Inspeksi Konfigurasi Password Policy (PAM)",
        description:
          "Lihat konfigurasi PAM (Pluggable Authentication Modules) saat ini untuk memahami aturan password yang berlaku. PAM adalah framework modular yang mengelola autentikasi di Linux. File common-password mengandung konfigurasi untuk pembuatan dan perubahan password.",
        command: "sudo cat /etc/pam.d/common-password",
        expectedOutput:
          "password  requisite   pam_pwquality.so retry=3\npassword  [success=1 default=ignore]  pam_unix.so obscure yescrypt",
        hint: "Perhatikan modul pam_pwquality.so — modul ini mengenforce kompleksitas password. Parameter seperti 'retry=3' menentukan berapa kali user boleh mencoba membuat password baru sebelum gagal.",
        screenshotNote: "Screenshot isi file common-password yang menunjukkan konfigurasi PAM saat ini.",
      },
      {
        title: "Konfigurasi Password Quality Policy",
        description:
          "Edit file konfigurasi pwquality.conf untuk mengatur aturan kompleksitas password sesuai standar keamanan. Parameter ini memastikan setiap password memenuhi persyaratan minimum sebelum diterima sistem. Setelah mengedit, verifikasi perubahan dengan membuat user baru dan mencoba set password lemah.",
        command: "sudo nano /etc/security/pwquality.conf",
        screenshotNote:
          "Screenshot file pwquality.conf setelah diedit, menunjukkan konfigurasi: minlen=14, dcredit=-1, ucredit=-1, ocredit=-1, lcredit=-1, maxrepeat=3, dictcheck=1.",
        hint: "Parameter penting: minlen=14 (panjang minimum), ucredit=-1 (minimal 1 uppercase), lcredit=-1 (minimal 1 lowercase), dcredit=-1 (minimal 1 digit), ocredit=-1 (minimal 1 special character). Nilai negatif berarti 'minimal N karakter dari jenis ini'.",
        warningNote:
          "Pastikan Anda mengingat password root/admin sebelum mengaktifkan kebijakan ini! Jika terkunci, Anda perlu recovery mode.",
      },
      {
        title: "Implementasi RBAC dengan Linux Groups",
        description:
          "Buat struktur grup dan user yang mencerminkan model RBAC untuk tim SOC. Setiap role (soc_admin, soc_operator, soc_viewer) akan memiliki hak akses berbeda terhadap direktori kerja. Ini merepresentasikan prinsip least privilege — setiap user hanya mendapat akses minimum yang dibutuhkan.",
        command: "sudo groupadd soc_admin && sudo groupadd soc_operator && sudo groupadd soc_viewer && sudo useradd -m -G soc_admin admin1 && sudo useradd -m -G soc_operator op1 && sudo useradd -m -G soc_viewer viewer1 && getent group soc_admin soc_operator soc_viewer",
        expectedOutput:
          "soc_admin:x:1001:admin1\nsoc_operator:x:1002:op1\nsoc_viewer:x:1003:viewer1",
        hint: "Perintah 'getent group <groupname>' memverifikasi grup berhasil dibuat dan menampilkan anggotanya. Gunakan 'id admin1' untuk melihat semua grup yang dimiliki user.",
        screenshotNote: "Screenshot output getent group dan perintah 'id admin1' yang menunjukkan keanggotaan grup.",
      },
      {
        title: "Set Directory Permissions per Role",
        description:
          "Buat direktori kerja dengan permission yang berbeda untuk setiap role SOC. Direktori admin hanya dapat diakses oleh soc_admin (770), direktori shared dapat dibaca semua tapi hanya dimodifikasi operator ke atas (775), dan reports dapat dibaca semua (755). Ini mengimplementasikan prinsip need-to-know berbasis role.",
        command: "sudo mkdir -p /opt/soc/{admin,shared,reports,logs} && sudo chgrp soc_admin /opt/soc/admin && sudo chmod 770 /opt/soc/admin && sudo chgrp soc_operator /opt/soc/shared && sudo chmod 775 /opt/soc/shared && sudo chmod 755 /opt/soc/reports && sudo chgrp soc_admin /opt/soc/logs && sudo chmod 750 /opt/soc/logs && ls -la /opt/soc/",
        expectedOutput:
          "drwx------ soc_admin  admin/\ndrwxrwxr-x soc_operator shared/\ndrwxr-xr-x root       reports/\ndrwxr-x--- soc_admin  logs/",
        screenshotNote: "Screenshot output 'ls -la /opt/soc/' yang menunjukkan permission bits dan grup owner masing-masing direktori.",
        hint: "Baca permission dengan format 'rwxrwxrwx' = owner/group/others. chmod 770 = owner rwx, group rwx, others ---. Uji dengan: 'sudo -u viewer1 ls /opt/soc/admin' — harus mendapat 'Permission denied'.",
      },
      {
        title: "SSH Key-Based Authentication",
        description:
          "Generate SSH key pair menggunakan algoritma Ed25519 (lebih modern dan aman dari RSA 2048). SSH key-based auth menggantikan password dengan kriptografi asimetris — private key tetap di client, public key di-deploy ke server. Ini jauh lebih aman karena kunci tidak pernah dikirim melalui jaringan.",
        command: "ssh-keygen -t ed25519 -C 'lab10@infosec.local' -f ~/.ssh/lab_key -N '' && cat ~/.ssh/lab_key.pub",
        expectedOutput:
          "Generating public/private ed25519 key pair.\nYour identification has been saved in /home/user/.ssh/lab_key\nYour public key has been saved in /home/user/.ssh/lab_key.pub\nThe key fingerprint is: SHA256:xxx...xxx lab10@infosec.local\nssh-ed25519 AAAA...xxx lab10@infosec.local",
        hint: "Flag -N '' membuat key tanpa passphrase untuk kemudahan lab. Di production, SELALU gunakan passphrase untuk melindungi private key. Algoritma Ed25519 lebih pendek, lebih cepat, dan lebih aman dari RSA-2048.",
        screenshotNote: "Screenshot output ssh-keygen dan isi public key (cat ~/.ssh/lab_key.pub).",
      },
      {
        title: "Hardening Konfigurasi SSHD",
        description:
          "Verifikasi dan tinjau konfigurasi SSH server untuk mengidentifikasi parameter yang perlu di-hardening. Best practice: disable password authentication (gunakan key saja), disable root login, batasi jumlah percobaan auth, dan set timeout yang wajar. Catat parameter mana yang sudah sesuai dan mana yang perlu diubah.",
        command: "sudo grep -n 'PasswordAuthentication\\|PermitRootLogin\\|MaxAuthTries\\|PubkeyAuthentication\\|LoginGraceTime\\|AllowUsers\\|Protocol' /etc/ssh/sshd_config",
        hint: "Nilai yang direkomendasikan: PasswordAuthentication no | PermitRootLogin no | MaxAuthTries 3 | PubkeyAuthentication yes | LoginGraceTime 60. PENTING: Pastikan authorized_keys sudah terpasang SEBELUM disable PasswordAuthentication, atau Anda terkunci dari server!",
        warningNote:
          "Jangan disable PasswordAuthentication tanpa terlebih dahulu memverifikasi bahwa SSH key Anda berhasil di-deploy dan dapat digunakan untuk login! Test di session baru sebelum menutup session saat ini.",
        screenshotNote: "Screenshot output grep menunjukkan konfigurasi SSH saat ini. Beri anotasi parameter mana yang sudah hardened dan mana yang perlu diperbaiki.",
      },
      {
        title: "Konfigurasi Audit Rules dengan auditctl",
        description:
          "Konfigurasi Linux Audit Framework untuk memantau akses ke file sensitif secara real-time. Audit rules mendefinisikan event apa yang harus dicatat — perubahan pada /etc/passwd, /etc/shadow, dan direktori log adalah indikasi aktivitas mencurigakan yang harus selalu dimonitor.",
        command: "sudo auditctl -w /etc/passwd -p wa -k passwd_changes && sudo auditctl -w /etc/shadow -p wa -k shadow_changes && sudo auditctl -w /etc/sudoers -p wa -k sudoers_changes && sudo auditctl -w /var/log/ -p wa -k log_changes && sudo auditctl -l",
        expectedOutput:
          "-w /etc/passwd -p wa -k passwd_changes\n-w /etc/shadow -p wa -k shadow_changes\n-w /etc/sudoers -p wa -k sudoers_changes\n-w /var/log/ -p wa -k log_changes",
        hint: "Parameter audit rule: -w (watch path), -p (permissions: r=read, w=write, x=execute, a=attribute change), -k (key/tag untuk filter log). Key memudahkan pencarian log: 'ausearch -k passwd_changes' hanya menampilkan event terkait perubahan /etc/passwd.",
        screenshotNote: "Screenshot output 'auditctl -l' yang menunjukkan semua audit rules aktif.",
      },
      {
        title: "Verifikasi Audit Logs",
        description:
          "Trigger sebuah event yang dimonitor (misalnya modifikasi /etc/passwd dengan adduser) kemudian periksa audit log untuk memverifikasi bahwa event ter-catat dengan lengkap. Audit log yang baik mencatat: siapa yang melakukan aksi, dari proses apa, pada file apa, kapan, dan dengan hak akses apa.",
        command: "sudo ausearch -k passwd_changes --interpret | tail -30",
        expectedOutput:
          "----\ntype=SYSCALL ...\ntime->Wed Apr  9 10:15:23 2025\nuid=0(root) gid=0(root) comm=\"adduser\"\nobjtype=NORMAL\nname=\"/etc/passwd\"\ntype=PATH name=/etc/passwd nametype=NORMAL",
        hint: "Flag --interpret mengonversi UID/GID numerik ke nama yang dapat dibaca. Gunakan 'ausearch -k passwd_changes -ts recent' untuk hanya melihat event terbaru. Log juga tersimpan di /var/log/audit/audit.log.",
        screenshotNote: "Screenshot output ausearch yang menampilkan audit event lengkap setelah memicu perubahan pada /etc/passwd, menunjukkan: user, program, timestamp, dan file yang diakses.",
      },
    ],
    deliverable:
      "Laporan lab (PDF/Word) berisi: (1) Screenshot konfigurasi PAM dan pwquality.conf dengan penjelasan setiap parameter; (2) Screenshot struktur grup RBAC dan permission direktori; (3) Screenshot SSH key pair yang dibuat dan file public key; (4) Screenshot analisis konfigurasi sshd_config dengan rekomendasi hardening; (5) Screenshot audit rules aktif; (6) Screenshot audit log setelah memicu event; (7) Tabel ringkasan: kontrol keamanan yang diimplementasikan, tujuannya, dan nilai keamanannya.",
  },

  // ─── CASE STUDY (default) ────────────────────────────────────────────────────
  caseStudy: {
    title: "Data Breach Akibat Lemahnya Access Control di Layanan Streaming",
    scenario:
      "Platform streaming hiburan terbesar di Indonesia mengalami kebocoran data 2 juta akun pengguna termasuk informasi kartu kredit. Investigasi forensik mengungkap bahwa kebocoran disebabkan oleh kombinasi kelemahan access control: seorang karyawan outsource IT support memiliki akses admin ke database produksi tanpa MFA, password yang digunakan adalah 'Password123!', tidak ada audit logging, dan hak akses tidak pernah di-review sejak onboarding 18 bulan lalu.",
    questions: [
      "Identifikasi semua pelanggaran access control dan prinsip keamanan yang terjadi dalam kasus ini, serta jelaskan dampak spesifik dari masing-masing pelanggaran.",
      "Rancang kebijakan access control yang komprehensif untuk perusahaan ini, mencakup: model access control yang tepat, kebijakan password/MFA, manajemen akses privileged, dan periodic access review.",
      "Jelaskan bagaimana implementasi Zero Trust Architecture dapat mencegah insiden ini, termasuk micro-segmentation, identity verification, dan continuous monitoring.",
      "Apa kewajiban hukum perusahaan ini berdasarkan UU PDP Indonesia? Jelaskan langkah notifikasi yang wajib dilakukan dan sanksi yang mungkin diterima.",
    ],
  },

  // ─── CASE STUDY POOL (15 variants) ──────────────────────────────────────────
  caseStudyPool: [
    // 1. Rumah Sakit
    {
      title: "Privilege Escalation oleh Teknisi IT Rumah Sakit",
      scenario:
        "Seorang teknisi IT junior di Rumah Sakit Pusat Nasional berhasil melakukan privilege escalation dengan memanfaatkan misconfiguration sudo yang memberikan akses tanpa password ke beberapa perintah. Teknisi tersebut kemudian menggunakan akses root untuk melihat rekam medis selebriti yang dirawat di rumah sakit dan menjualnya ke tabloid. Insiden terdeteksi tiga minggu kemudian dari anomali akses di database EHR.",
      questions: [
        "Jelaskan bagaimana misconfiguration sudo dapat menyebabkan privilege escalation. Apa isi konfigurasi sudoers yang aman dan bagaimana cara mengauditnya?",
        "Bagaimana prinsip Least Privilege seharusnya diterapkan untuk role teknisi IT junior di lingkungan rumah sakit — akses apa yang diperlukan dan mana yang harus diblokir?",
        "Bagaimana audit logging yang tepat dapat mendeteksi aktivitas ini lebih awal? Jelaskan event-event Linux apa yang harus dimonitor untuk mendeteksi privilege escalation.",
        "Apa implikasi hukum dari kebocoran rekam medis ini? Selain UU PDP, regulasi kesehatan apa (misalnya Permenkes) yang dilanggar dan apa konsekuensinya?",
      ],
    },

    // 2. Bank
    {
      title: "Insider Threat: Karyawan Bank dengan Akses Over-Privileged",
      scenario:
        "Seorang relationship manager di sebuah bank swasta nasional ditemukan telah melakukan transaksi transfer tidak sah senilai Rp 3,7 miliar ke rekening terafiliasi selama 4 bulan. Investigasi menunjukkan bahwa karyawan tersebut memiliki akses ke sistem transfer yang seharusnya hanya untuk manajer senior — akses ini diberikan secara temporary saat backup untuk rekannya yang cuti, namun tidak pernah dicabut. Tidak ada mekanisme four-eyes principle yang berjalan.",
      questions: [
        "Jelaskan konsep 'access creep' dan 'orphaned accounts' — bagaimana keduanya berkontribusi pada insiden ini dan bagaimana mekanisme automated access review dapat mencegahnya?",
        "Apa itu Four-Eyes Principle (Dual Control) dalam konteks perbankan? Jelaskan bagaimana implementasinya dapat mencegah fraud transfer tidak sah bahkan oleh karyawan dengan akses sah.",
        "Rancang proses Joiners-Movers-Leavers (JML) yang komprehensif untuk bank — bagaimana akses harus dikelola saat karyawan bergabung, pindah departemen, atau keluar?",
        "Bagaimana SIEM dapat dikonfigurasi untuk mendeteksi pola aktivitas mencurigakan seperti ini? Sebutkan minimal 3 use case detection rule yang relevan untuk lingkungan perbankan.",
      ],
    },

    // 3. Pemerintah
    {
      title: "Weak Password Menyebabkan Kompromi Sistem Kependudukan",
      scenario:
        "Database kependudukan nasional (mengandung data 200 juta warga) diakses secara tidak sah oleh peretas asing. Investigasi digital forensik menemukan bahwa akses diperoleh melalui akun administrator dengan password 'admin123' yang tidak pernah diubah sejak deployment 5 tahun lalu. Tidak ada MFA, tidak ada pembatasan IP untuk akses admin, dan sistem terekspos langsung ke internet tanpa VPN.",
      questions: [
        "Jelaskan mengapa password 'admin123' sangat mudah ditembus — berapa lama yang dibutuhkan untuk brute force atau dictionary attack terhadap password seperti ini dengan hardware modern?",
        "Rancang kebijakan password komprehensif untuk sistem pemerintah yang mengelola data sensitif warga negara, sesuai dengan standar NIST SP 800-63B (password guidance terbaru).",
        "Jelaskan perbedaan antara VPN-based access dan Zero Trust Network Access (ZTNA) untuk mengamankan akses admin ke sistem pemerintah — mana yang lebih direkomendasikan dan mengapa?",
        "Berdasarkan PERBAN 8/2021 (BSSN) tentang keamanan SPBE, apa saja kewajiban keamanan yang harus dipenuhi instansi pemerintah untuk sistem yang mengelola data kependudukan?",
      ],
    },

    // 4. Universitas
    {
      title: "Mahasiswa Mengeksploitasi Misconfigured ACL untuk Mengubah Nilai",
      scenario:
        "Seorang mahasiswa semester akhir di sebuah universitas negeri terkemuka berhasil mengakses dan mengubah nilai akademiknya sendiri di sistem informasi akademik (SIAKAD). Eksploitasi dimungkinkan karena ACL (Access Control List) pada API endpoint nilai dikonfigurasi dengan kelalaian — endpoint yang seharusnya hanya dapat diakses oleh dosen juga menerima request dari token mahasiswa jika parameter 'role=dosen' ditambahkan dalam request body.",
      questions: [
        "Jelaskan jenis kerentanan access control ini — apa yang dimaksud dengan Broken Access Control (OWASP Top 10 #1 tahun 2021) dan mengapa ini adalah kerentanan paling umum di aplikasi web?",
        "Bagaimana seharusnya otorisasi diimplementasikan di sisi server (server-side authorization) untuk mencegah manipulasi role seperti ini? Jelaskan perbedaan antara input validation dan server-side authorization.",
        "Rancang skema permission yang tepat untuk SIAKAD yang memisahkan dengan jelas hak akses mahasiswa, dosen, wali studi, dan admin akademik terhadap data nilai.",
        "Apa sanksi akademik dan hukum yang dapat diterapkan kepada mahasiswa tersebut? Apakah UU ITE Pasal 30 atau 32 berlaku dalam kasus ini?",
      ],
    },

    // 5. E-Commerce
    {
      title: "Kurangnya MFA pada Akun Admin E-Commerce Menyebabkan Account Takeover",
      scenario:
        "Platform marketplace terkemuka mengalami account takeover massal pada 500 akun seller premium. Penyerang menggunakan credential stuffing (menggunakan database username/password dari breach e-commerce lain) untuk mengidentifikasi seller yang menggunakan password yang sama di multiple platform. Tanpa MFA, akses langsung berhasil. Penyerang kemudian mengalihkan payout ke rekening yang berbeda, merugikan seller total Rp 2,1 miliar.",
      questions: [
        "Jelaskan teknik Credential Stuffing — bagaimana penyerang mendapatkan credential dan bagaimana membedakan serangan credential stuffing dari brute force biasa dalam log?",
        "Mengapa implementasi MFA sangat efektif terhadap credential stuffing meskipun penyerang memiliki password yang benar? Jelaskan berbagai jenis MFA (TOTP, SMS, hardware key) dan perbandingan keamanannya.",
        "Bagaimana platform e-commerce dapat mendeteksi credential stuffing secara real-time dan mengimplementasikan mitigasi adaptif (rate limiting berbasis perilaku, device fingerprinting, CAPTCHA adaptif)?",
        "Rancang program perlindungan akun yang komprehensif untuk platform marketplace, mencakup: forced MFA, anomaly detection, password breach monitoring (Have I Been Pwned API), dan emergency account freeze.",
      ],
    },

    // 6. Manufaktur
    {
      title: "Kontraktor Eksternal Mempertahankan Akses Setelah Proyek Selesai",
      scenario:
        "Perusahaan manufaktur otomotif menemukan bahwa sistem desain CAD/CAM-nya diakses oleh IP address asing. Investigasi mengungkap bahwa akun VPN milik kontraktor IT yang menyelesaikan proyek upgrade sistem 8 bulan lalu belum dinonaktifkan. Kontraktor (atau pihak yang memperoleh akses ke akun tersebut) menggunakan akses ini untuk mengeksfiltrasi desain komponen eksklusif bernilai tinggi yang kemudian muncul di pasar sebagai produk kompetitor.",
      questions: [
        "Jelaskan konsep 'third-party risk management' dalam konteks keamanan informasi — mengapa akun dan akses pihak ketiga merupakan risiko keamanan yang sering diabaikan?",
        "Rancang proses offboarding yang komprehensif untuk kontraktor dan vendor — mencakup inventori akses, timeline pencabutan, dan verifikasi yang diperlukan.",
        "Bagaimana Privileged Access Management (PAM) solution seperti CyberArk atau BeyondTrust dapat membantu mengelola akses privileged dari pihak ketiga dengan lebih aman?",
        "Apa kewajiban kontraktual dan hukum yang seharusnya dicantumkan dalam perjanjian dengan kontraktor IT terkait keamanan informasi dan akses sistem? Sebutkan klausul-klausul penting.",
      ],
    },

    // 7. Telekomunikasi
    {
      title: "Pelanggaran Least Privilege pada Sistem Billing Telecom",
      scenario:
        "Operator telekomunikasi nasional mengalami kebocoran data tagihan dan data pribadi 1,3 juta pelanggan. Root cause-nya adalah bahwa semua agen customer service diberi akses read/write penuh ke seluruh database pelanggan, padahal mereka hanya membutuhkan akses ke data pelanggan yang sedang ditangani. Seorang agen yang tidak puas melakukan bulk export seluruh database sebelum mengundurkan diri.",
      questions: [
        "Jelaskan prinsip Least Privilege secara mendalam — bagaimana prinsip ini seharusnya diterapkan untuk mendesain akses database bagi agen customer service yang perlu akses data pelanggan?",
        "Rancang model akses berbasis ABAC untuk agen customer service yang membatasi akses hanya ke data pelanggan yang sedang aktif ditangani (context-aware access control).",
        "Bagaimana Database Activity Monitoring (DAM) dapat mendeteksi bulk export yang mencurigakan? Sebutkan threshold dan indikator anomali yang harus dikonfigurasi sebagai alert.",
        "Dari perspektif UU PDP Indonesia, apa kewajiban operator telekomunikasi sebagai 'Pengendali Data Pribadi' dalam kasus ini? Jelaskan timeline notifikasi dan sanksi yang berlaku.",
      ],
    },

    // 8. Startup
    {
      title: "Shared Credential di Startup Fintech Menyebabkan Breach",
      scenario:
        "Startup fintech dengan 30 karyawan mengalami kebocoran data transaksi nasabah. Investigasi menemukan bahwa seluruh tim engineering menggunakan satu akun admin bersama ('admin@company.com' dengan password yang ditulis di Post-it di papan tulis kantor) untuk mengakses sistem produksi. Ketika seorang karyawan resign dan bergabung dengan kompetitor, ia menggunakan akses tersebut untuk mengunduh data nasabah selama 2 minggu.",
      questions: [
        "Jelaskan mengapa shared credentials adalah praktik keamanan yang sangat berbahaya — apa yang hilang dari perspektif accountability, auditability, dan kontrol akses?",
        "Rancang sistem manajemen identitas dan akses (IAM) yang tepat untuk startup fintech dengan anggaran terbatas, memanfaatkan layanan cloud IAM (Okta free tier, AWS IAM, Google Workspace).",
        "Bagaimana proses offboarding yang tepat seharusnya dijalankan ketika seorang karyawan resign dari startup yang memegang akses ke sistem produksi?",
        "OJK mengharuskan fintech yang terdaftar memenuhi standar keamanan tertentu. Identifikasi pelanggaran spesifik terhadap POJK No. 11/2022 dalam kasus ini dan konsekuensi regulatorinya.",
      ],
    },

    // 9. Logistik
    {
      title: "Driver Aplikasi Mengakses Data Pengiriman di Luar Wilayahnya",
      scenario:
        "Platform logistik pengiriman menemukan bahwa beberapa driver telah mengakses data pengiriman milik driver lain di kota berbeda, termasuk alamat lengkap penerima. Data tersebut dijual kepada pihak ketiga yang menggunakannya untuk penipuan. Investigasi menunjukkan bahwa aplikasi driver tidak mengimplementasikan access control berbasis wilayah — semua driver dapat mengakses seluruh database pengiriman melalui API yang under-secured.",
      questions: [
        "Jelaskan bagaimana ABAC (Attribute-Based Access Control) dapat diimplementasikan untuk kasus ini — atribut apa yang harus digunakan untuk membatasi akses driver hanya ke pengiriman di wilayahnya?",
        "Rancang skema authorization API yang aman untuk aplikasi driver — mencakup JWT token claims, middleware authorization, dan query-level filtering berdasarkan identitas driver.",
        "Bagaimana mobile application security harus dirancang untuk mencegah driver mengakses API di luar konteks aplikasi resmi (misalnya menggunakan Postman atau tools lain)?",
        "Apa tanggung jawab platform logistik sebagai Pengendali Data Pribadi berdasarkan UU PDP terhadap data penerima paket yang disimpan di sistemnya?",
      ],
    },

    // 10. PLTU
    {
      title: "Default Credential pada Sistem SCADA PLTU Membuka Celah Berbahaya",
      scenario:
        "Audit keamanan siber pada Pembangkit Listrik Tenaga Uap (PLTU) mengungkap bahwa Human Machine Interface (HMI) sistem SCADA yang mengendalikan turbin masih menggunakan default credentials dari vendor (admin/admin). Sistem ini dapat diakses dari jaringan IT internal karena tidak ada segmentasi yang tepat antara jaringan IT dan OT. Dalam simulasi red team, auditor berhasil mengakses dan memodifikasi setpoint sensor suhu dalam hitungan menit.",
      questions: [
        "Mengapa default credentials pada sistem OT/ICS jauh lebih berbahaya dibandingkan pada sistem IT biasa? Jelaskan konsekuensi potensial dari akses tidak sah ke HMI sistem SCADA pembangkit listrik.",
        "Jelaskan Purdue Enterprise Reference Architecture (PERA) untuk segmentasi jaringan ICS dan bagaimana data diode (unidirectional gateway) dapat digunakan untuk memisahkan jaringan IT dan OT secara aman.",
        "Rancang program change management untuk credentials di lingkungan OT/ICS, mempertimbangkan keterbatasan unik sistem OT: tidak bisa di-patch sembarangan, availabilitas 24/7, dan dampak safety.",
        "Identifikasi standar keamanan ICS yang relevan untuk PLTU di Indonesia — mencakup IEC 62443 (standar ICS security) dan regulasi ESDM/PLN yang berlaku.",
      ],
    },

    // 11. TV Nasional
    {
      title: "Akun Media Sosial Resmi TV Nasional Dibajak karena No MFA",
      scenario:
        "Akun media sosial resmi stasiun TV nasional (Twitter/X, Instagram, YouTube) dengan total 15 juta followers dibajak secara bersamaan dan digunakan untuk menyebarkan disinformasi politik selama 6 jam sebelum berhasil direcovery. Investigasi menemukan bahwa semua akun media sosial dikelola menggunakan satu email bersama tanpa MFA, dan password yang sama digunakan di semua platform. Email pengelola terkena phishing campaign.",
      questions: [
        "Jelaskan attack chain yang memungkinkan pembajakan akun: dari phishing email, credential theft, hingga account takeover di multiple platform menggunakan password yang sama.",
        "Rancang kebijakan keamanan untuk pengelolaan akun media sosial korporasi, mencakup: dedicated email per platform, MFA enforcement, password manager enterprise, dan monitoring aktivitas akun.",
        "Bagaimana sebuah organisasi dapat memulihkan akun media sosial yang dibajak dengan cepat (rapid recovery) untuk meminimalkan penyebaran konten berbahaya?",
        "Apa tanggung jawab hukum stasiun TV terhadap disinformasi yang disebarkan dari akun resminya (meskipun oleh pihak tidak sah)? Bagaimana komunikasi krisis harus dikelola dalam situasi ini?",
      ],
    },

    // 12. Firma Hukum
    {
      title: "Paralegal Mengakses Berkas Klien di Luar Penugasannya",
      scenario:
        "Sebuah firma hukum terkemuka yang menangani kasus korporasi bernilai triliunan rupiah menemukan bahwa seorang paralegal senior mengakses berkas rahasia klien yang sedang bersengketa dengan klien lain yang juga ditangani firma yang sama — menciptakan konflik kepentingan serius. Sistem manajemen dokumen firma tidak mengimplementasikan kontrol akses berbasis 'ethical wall' (Chinese Wall), sehingga semua paralegal dapat mengakses semua berkas.",
      questions: [
        "Jelaskan konsep 'Ethical Wall' (Chinese Wall) dalam konteks firma hukum dan bagaimana sistem DMS (Document Management System) seharusnya mengimplementasikannya secara teknis.",
        "Rancang model akses berbasis matter/case untuk firma hukum — bagaimana setiap berkas hanya dapat diakses oleh tim yang ditugaskan, dengan pengecualian yang di-approve secara explicit?",
        "Bagaimana audit trail yang komprehensif untuk akses dokumen dapat melindungi firma hukum secara hukum dalam kasus konflik kepentingan dan breach of privilege?",
        "Apa konsekuensi profesional bagi firma hukum yang terbukti melanggar attorney-client privilege dan konflik kepentingan? Bagaimana hal ini berdampak pada lisensi advokat dan reputasi firma?",
      ],
    },

    // 13. Asuransi
    {
      title: "Agen Asuransi Memiliki Akses Berlebihan ke Data Polis Seluruh Indonesia",
      scenario:
        "Perusahaan asuransi jiwa nasional dengan 50.000 agen aktif menemukan bahwa sistem core asuransinya memberikan akses kepada semua agen untuk melihat data polis nasabah dari seluruh Indonesia, bukan hanya nasabah dalam portfolio mereka sendiri. Situasi ini terdeteksi ketika seorang agen di Surabaya secara tidak sengaja mengakses data polis VIP nasabah yang dikelola kantor pusat Jakarta dan menghubungi nasabah tersebut untuk cross-selling.",
      questions: [
        "Rancang model access control berbasis territory/portfolio untuk sistem core asuransi yang memastikan setiap agen hanya dapat melihat data nasabah dalam portfolio-nya sendiri.",
        "Bagaimana data masking dan data obfuscation dapat diterapkan sebagai lapisan perlindungan tambahan untuk data sensitif nasabah (nomor KTP, rekening bank, kondisi kesehatan) bahkan ketika agen memiliki akses sah?",
        "Jelaskan bagaimana periodic access review (User Access Review/UAR) seharusnya dilakukan untuk 50.000 agen aktif secara scalable — berapa frekuensinya, siapa yang menyetujui, dan bagaimana anomali dideteksi?",
        "OJK memiliki aturan ketat tentang perlindungan data nasabah di industri perasuransian (POJK). Apa kewajiban spesifik perusahaan asuransi dan konsekuensi jika melanggar regulasi tersebut?",
      ],
    },

    // 14. Properti
    {
      title: "Agen Properti Tidak Aktif Mempertahankan Akses ke Database Listing Premium",
      scenario:
        "Platform properti digital menemukan bahwa 237 akun agen properti yang telah berhenti berlangganan (inactive/cancelled subscription) masih memiliki akses penuh ke database listing premium termasuk data kontak eksklusif pemilik properti. Beberapa akun ini digunakan secara aktif, terbukti dari access log. Pemilik properti mulai mengeluhkan panggilan telepon dari agen tidak dikenal yang menawarkan jasa, mengindikasikan data telah bocor.",
      questions: [
        "Jelaskan kategori 'orphaned accounts' dan 'zombie accounts' dalam konteks manajemen identitas — mengapa ini adalah salah satu risiko terbesar dalam access management?",
        "Rancang proses automated deprovisioning untuk platform SaaS yang memastikan akses langsung dicabut saat subscription berakhir, termasuk grace period, offboarding checklist, dan audit verification.",
        "Bagaimana platform dapat mendeteksi akses dari akun yang seharusnya sudah tidak aktif menggunakan anomaly detection berbasis perilaku (waktu akses, volume download, pattern browsing)?",
        "Dari perspektif bisnis dan legal, apa tanggung jawab platform properti terhadap kebocoran data kontak pemilik properti kepada agen yang sudah tidak berwenang?",
      ],
    },

    // 15. Lembaga Zakat
    {
      title: "Amil Zakat dengan Akses Admin Berlebihan Memungkinkan Fraud Internal",
      scenario:
        "Lembaga Amil Zakat Nasional (LAZNAS) menemukan bahwa seorang amil (pengelola zakat) di kantor cabang berhasil mengalihkan dana zakat fitrah senilai Rp 800 juta ke rekening pribadi melalui 47 transaksi kecil selama 6 bulan. Pemeriksaan menunjukkan bahwa amil tersebut memiliki akses penuh ke sistem pengelolaan dana — bisa membuat, menyetujui, dan mengeksekusi transfer sekaligus, tanpa mekanisme dual approval atau pemisahan tugas.",
      questions: [
        "Jelaskan prinsip Separation of Duties (SoD) dan bagaimana seharusnya proses transfer dana di lembaga zakat didesain untuk mencegah satu orang dapat melakukan fraud secara mandiri.",
        "Rancang sistem manajemen keuangan berbasis four-eyes principle untuk LAZNAS — siapa yang membuat request transfer, siapa yang menyetujui, siapa yang mengeksekusi, dan bagaimana setiap langkah di-audit?",
        "Bagaimana teknologi blockchain atau sistem pencatatan immutable dapat meningkatkan transparansi dan akuntabilitas pengelolaan dana zakat, mencegah manipulasi retroaktif?",
        "Dari perspektif hukum dan syariah, apa konsekuensi yang dihadapi lembaga zakat dan amil yang terlibat? Bagaimana pemulihan kepercayaan muzakki (pemberi zakat) harus dilakukan pasca insiden?",
      ],
    },
  ],

  // ─── QUIZ ────────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 1,
      question: "Model access control yang digunakan oleh sistem militer dan pemerintah berklasifikasi tinggi, di mana label keamanan (Top Secret, Secret, Confidential) menentukan akses dan pengguna tidak dapat mengubah hak akses secara mandiri, disebut?",
      options: [
        "DAC (Discretionary Access Control) — pemilik resource menentukan akses",
        "MAC (Mandatory Access Control) — sistem menentukan akses berdasarkan label keamanan",
        "RBAC (Role-Based Access Control) — akses berdasarkan peran dalam organisasi",
        "ABAC (Attribute-Based Access Control) — akses berdasarkan kombinasi atribut",
      ],
      answer: "MAC (Mandatory Access Control) — sistem menentukan akses berdasarkan label keamanan",
      type: "multiple-choice",
    },
    {
      id: 2,
      question: "Sebuah bank ingin mengimplementasikan AAA framework untuk akses VPN karyawan. Protokol AAA mana yang paling tepat digunakan, mengingat kebutuhan untuk memisahkan proses authentication, authorization, dan accounting secara independen dengan enkripsi payload penuh?",
      options: [
        "RADIUS — protocol standard, UDP, enkripsi hanya pada password",
        "TACACS+ — protocol Cisco, TCP, seluruh payload terenkripsi, AAA dipisah",
        "LDAP — directory service protocol untuk autentikasi terpusat",
        "Kerberos — protokol autentikasi berbasis ticket untuk domain internal",
      ],
      answer: "TACACS+ — protocol Cisco, TCP, seluruh payload terenkripsi, AAA dipisah",
      type: "multiple-choice",
    },
    {
      id: 3,
      question: "Dalam model Defense-in-Depth, lapisan mana yang bertanggung jawab untuk kontrol seperti enkripsi at-rest, DLP (Data Loss Prevention), dan klasifikasi data?",
      options: [
        "Network Layer — mengontrol aliran traffic menggunakan firewall dan IDS/IPS",
        "Host Layer — melindungi sistem operasi dengan antimalware dan OS hardening",
        "Application Layer — mencegah eksploitasi dengan WAF dan input validation",
        "Data Layer — melindungi data sensitif dengan enkripsi, DLP, dan klasifikasi",
      ],
      answer: "Data Layer — melindungi data sensitif dengan enkripsi, DLP, dan klasifikasi",
      type: "multiple-choice",
    },
    {
      id: 4,
      question: "Prinsip Zero Trust yang menyatakan 'minimalkan dampak jika terjadi breach dengan membatasi pergerakan lateral antara segmen jaringan' paling tepat diimplementasikan melalui?",
      options: [
        "MFA (Multi-Factor Authentication) — memverifikasi identitas dengan multiple faktor",
        "Micro-segmentation — membagi jaringan menjadi zona kecil dengan kontrol akses ketat antar zona",
        "Endpoint Detection and Response (EDR) — mendeteksi ancaman di endpoint secara real-time",
        "Security Information and Event Management (SIEM) — korelasi log dari berbagai sumber",
      ],
      answer: "Micro-segmentation — membagi jaringan menjadi zona kecil dengan kontrol akses ketat antar zona",
      type: "multiple-choice",
    },
    {
      id: 5,
      question: "Seorang karyawan IT support memiliki akses admin ke 50 server karena 'mungkin dibutuhkan suatu saat', padahal hanya 5 server yang menjadi tanggung jawabnya. Prinsip keamanan mana yang dilanggar?",
      options: [
        "Defense-in-Depth — tidak ada keamanan berlapis yang memadai",
        "Least Privilege — akses diberikan melebihi kebutuhan minimum untuk menjalankan tugas",
        "Separation of Duties — tidak ada pemisahan tanggung jawab yang jelas",
        "Need to Know — informasi sensitif tidak dibatasi berdasarkan kebutuhan",
      ],
      answer: "Least Privilege — akses diberikan melebihi kebutuhan minimum untuk menjalankan tugas",
      type: "multiple-choice",
    },
    {
      id: 6,
      question: "Standar keamanan manakah yang WAJIB (mandatory) dipatuhi oleh semua perusahaan di Indonesia yang memproses, menyimpan, atau mentransmisi data kartu kredit/debit pelanggan?",
      options: [
        "ISO/IEC 27001 — standar sukarela untuk sistem manajemen keamanan informasi",
        "NIST Cybersecurity Framework — framework sukarela untuk manajemen risiko siber",
        "PCI-DSS (Payment Card Industry Data Security Standard) — wajib untuk lingkungan kartu pembayaran",
        "SOC 2 Type II — standar audit untuk cloud service provider",
      ],
      answer: "PCI-DSS (Payment Card Industry Data Security Standard) — wajib untuk lingkungan kartu pembayaran",
      type: "multiple-choice",
    },
    {
      id: 7,
      question: "Dalam framework AAA, komponen manakah yang bertanggung jawab untuk mencatat berapa lama sesi koneksi berlangsung, berapa banyak data yang ditransfer, dan resource apa yang diakses — untuk keperluan audit dan billing?",
      options: [
        "Authentication — memverifikasi identitas pengguna sebelum memberikan akses",
        "Authorization — menentukan resource dan tindakan apa yang diizinkan",
        "Accounting — mencatat dan melaporkan semua aktivitas selama sesi koneksi",
        "Auditing — proses review independen terhadap aktivitas keamanan",
      ],
      answer: "Accounting — mencatat dan melaporkan semua aktivitas selama sesi koneksi",
      type: "multiple-choice",
    },
    {
      id: 8,
      question: "Manakah parameter konfigurasi Linux PAM yang benar untuk mewajibkan password memiliki panjang minimum 14 karakter, setidaknya 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter spesial?",
      options: [
        "minlen=14, uppercase=1, lowercase=1, number=1, special=1",
        "minlen=14, ucredit=-1, lcredit=-1, dcredit=-1, ocredit=-1",
        "minpasswd=14, require-upper=true, require-lower=true, require-digit=true",
        "password-min-length=14, complexity=high",
      ],
      answer: "minlen=14, ucredit=-1, lcredit=-1, dcredit=-1, ocredit=-1",
      type: "multiple-choice",
    },
    {
      id: 9,
      question: "Jelaskan konsep Defense-in-Depth dan berikan contoh konkret bagaimana kelima lapisan (Physical, Network, Host, Application, Data) bekerja bersama untuk melindungi data nasabah di sebuah bank. Berikan minimal satu kontrol untuk setiap lapisan.",
      answer: "Defense-in-Depth adalah strategi keamanan berlapis di mana setiap lapisan memberikan perlindungan independen, sehingga kegagalan satu lapisan tidak langsung mengakibatkan kompromi data. Berbeda dengan 'single point of protection', DiD mengharuskan penyerang mengatasi setiap lapisan secara berurutan. Contoh untuk bank: (1) Physical — server room dengan akses biometrik + badge, CCTV 24/7, pintu anti-temper, UPS dan genset. Kontrol: jika penyerang masuk secara fisik, data masih dilindungi lapisan berikutnya. (2) Network — perimeter firewall dengan DMZ, segmentasi VLAN (banking network terpisah dari guest WiFi), IDS/IPS untuk deteksi serangan. Kontrol: jika firewall bypass, masih ada IPS yang mendeteksi. (3) Host — OS hardening berbasis CIS Benchmark, EDR/antimalware, patch management otomatis, minimal installed software. Kontrol: jika jaringan dikompromis, endpoint masih terlindungi. (4) Application — WAF untuk proteksi SQL injection/XSS, input validation, OWASP SAMM secure coding, periodic VAPT. Kontrol: jika host dikompromis, aplikasi masih memvalidasi input. (5) Data — enkripsi database (TDE), enkripsi backup, DLP mencegah exfiltration, data masking untuk non-production, tokenisasi nomor kartu. Kontrol: jika semua lapisan lain gagal, data tetap tidak terbaca tanpa kunci enkripsi.",
      type: "essay",
    },
    {
      id: 10,
      question: "Seorang System Administrator ditugaskan untuk mengimplementasikan RBAC di sistem Linux untuk tiga tim: Developer (perlu akses deploy), QA (perlu akses log), dan Ops (perlu akses penuh). Jelaskan langkah-langkah teknis yang diperlukan, termasuk perintah Linux yang digunakan dan cara memverifikasi implementasinya.",
      answer: "Implementasi RBAC di Linux menggunakan Groups dan File Permissions: Langkah 1 — Buat grup untuk setiap role: 'sudo groupadd developers; sudo groupadd qa_team; sudo groupadd ops_team'. Langkah 2 — Buat user dan assign ke grup: 'sudo useradd -m -G developers dev1; sudo useradd -m -G qa_team qa1; sudo useradd -m -G ops_team ops1'. Untuk ops user perlu sudo access: tambahkan ke file sudoers dengan 'sudo visudo' dan tambahkan 'ops1 ALL=(ALL:ALL) ALL'. Langkah 3 — Buat direktori struktur: 'sudo mkdir -p /app/{deploy,logs,config}'. Assign permission: '/app/deploy — chgrp developers, chmod 775 (developers bisa write); /app/logs — chgrp qa_team, chmod 750 (qa bisa read); /app/config — chgrp ops_team, chmod 770 (ops bisa read/write)'. Langkah 4 — Set sticky bit pada direktori shared: 'chmod +t /app/deploy' mencegah user menghapus file milik user lain. Langkah 5 — Verifikasi: 'sudo -u dev1 ls /app/config' harus menghasilkan Permission Denied. 'sudo -u qa1 cat /app/logs/app.log' harus berhasil. 'sudo -u ops1 echo test > /app/config/setting.conf' harus berhasil. Gunakan 'getfacl /app/deploy' untuk melihat ACL detail jika menggunakan extended ACL. Langkah 6 — Audit: konfigurasi auditd untuk monitor akses ke direktori sensitive: 'sudo auditctl -w /app/config -p wa -k config_access'.",
      type: "essay",
    },
    {
      id: 11,
      question: "Jelaskan perbedaan mendasar antara RBAC dan ABAC. Berikan skenario konkret di mana ABAC lebih tepat digunakan dibandingkan RBAC, dan jelaskan atribut apa yang akan digunakan dalam pengambilan keputusan akses.",
      answer: "RBAC (Role-Based Access Control) memberikan akses berdasarkan peran kerja pengguna dalam organisasi. Keputusan akses sederhana: user punya role X → role X punya permission Y → user mendapat permission Y. Kelebihannya adalah sederhana, mudah dipahami, dan mudah diaudit. Kelemahannya adalah tidak bisa mempertimbangkan konteks (waktu, lokasi, kondisi), memerlukan banyak role untuk kasus khusus ('role explosion'), dan tidak granular untuk kebutuhan access control yang dinamis. ABAC (Attribute-Based Access Control) mengambil keputusan berdasarkan evaluasi kebijakan (policy) terhadap atribut dari: Subject (user — departemen, clearance level, lokasi), Resource (file — klasifikasi, pemilik, jenis), Action (read, write, delete), dan Environment (waktu, lokasi IP, device health). Skenario konkret: Sistem EHR rumah sakit yang menggunakan ABAC — Policy: 'dokter BOLEH mengakses rekam medis pasien JIKA dokter tersebut adalah DPJP pasien ini DAN waktu akses adalah jam kerja (08:00-20:00) DAN perangkat yang digunakan adalah managed device rumah sakit DAN pasien sedang aktif dirawat'. Atribut yang digunakan: Subject attributes — role=dokter, employee_id=D001, unit=kardiologi; Resource attributes — document_type=rekam_medis, patient_id=P123, dpjp_id=D001; Environment attributes — current_time=14:30, device_status=managed, access_location=hospital_ip. RBAC murni tidak bisa mengekspresikan kebijakan sekompleks ini tanpa membuat ratusan role spesifik.",
      type: "essay",
    },
    {
      id: 12,
      question: "Apa itu 'Zero Trust Architecture' dan mengapa model keamanan perimeter tradisional ('castle and moat') tidak lagi memadai di era cloud computing dan remote work? Jelaskan minimal 4 prinsip inti Zero Trust.",
      answer: "Model perimeter tradisional ('castle and moat') mengasumsikan: semua yang di dalam jaringan internal dapat dipercaya, semua yang di luar adalah tidak dipercaya. Firewall adalah 'parit' yang melindungi 'kastil' jaringan internal. Model ini tidak lagi memadai karena: (1) Perimeter sudah tidak ada — cloud apps (SaaS), work from home, dan BYOD berarti data dan pengguna ada di mana-mana; tidak ada 'dalam' dan 'luar' yang jelas; (2) Insider threats — sekali penyerang ada di dalam (atau karyawan jahat), tidak ada hambatan lateral movement; (3) Advanced threats — APT dan ransomware modern bergerak lateral dengan mudah di dalam jaringan flat yang 'dipercaya'; (4) SaaS adoption — data sensitif ada di Office 365, Salesforce, AWS — di 'luar' perimeter tapi harus diakses karyawan. Zero Trust Architecture (NIST SP 800-207) didasarkan pada prinsip: (1) Verify Explicitly — autentikasi dan otorisasi setiap request berdasarkan semua data yang tersedia: identitas, device health, lokasi, service, klasifikasi data, dan anomali perilaku — bukan hanya lokasi jaringan; (2) Use Least Privileged Access — berikan akses just-in-time (JIT) dan just-enough-access (JEA) dengan time-bound access; (3) Assume Breach — operasikan seolah-olah jaringan sudah dikompromis: enkripsi semua traffic, micro-segmentasi, logging penuh, minimal blast radius; (4) Micro-segmentation — bagi jaringan menjadi zona kecil dengan kontrol akses ketat antar zona, sehingga lateral movement dibatasi; (5) Continuous Verification — jangan hanya verifikasi saat login, tapi terus-menerus re-evaluasi kondisi dan perilaku selama sesi berlangsung.",
      type: "essay",
    },
    {
      id: 13,
      question: "Sebuah rumah sakit sedang mengevaluasi apakah harus mengimplementasikan ISO 27001, NIST CSF, atau keduanya. Jelaskan perbedaan fundamental antara kedua framework tersebut dalam hal tujuan, struktur, sertifikasi, dan cocok untuk organisasi seperti apa.",
      answer: "ISO/IEC 27001:2022 adalah standar internasional untuk Information Security Management System (ISMS). Karakteristik: (1) Tujuan: membangun, menerapkan, memelihara, dan meningkatkan ISMS secara sistematis; (2) Struktur: berbasis Plan-Do-Check-Act (PDCA) dengan 4 tema kontrol: Organizational, People, Physical, Technological — total 93 kontrol di Annex A; (3) Sertifikasi: Ya — bisa disertifikasi oleh auditor pihak ketiga yang terakreditasi, menghasilkan sertifikat formal yang diakui internasional; (4) Orientasi: compliance-based, prescriptive — menentukan APA yang harus dilakukan; (5) Cocok untuk: organisasi yang membutuhkan sertifikasi formal untuk kontrak atau regulasi, organisasi yang ingin framework lengkap dan terstruktur. NIST Cybersecurity Framework (CSF) 2.0 adalah framework manajemen risiko siber. Karakteristik: (1) Tujuan: membantu organisasi mengelola dan mengurangi risiko siber, meningkatkan komunikasi risiko antar stakeholder; (2) Struktur: 6 fungsi inti — Govern, Identify, Protect, Detect, Respond, Recover — dengan Categories dan Subcategories di setiap fungsi; (3) Sertifikasi: Tidak — NIST CSF adalah self-assessment tool, tidak ada sertifikasi resmi; (4) Orientasi: risk-based, outcome-based — menentukan APA YANG INGIN DICAPAI, bukan BAGAIMANA mencapainya; (5) Cocok untuk: organisasi yang baru memulai program keamanan, komunikasi risiko ke manajemen non-teknis, dan sebagai roadmap improvement. Rekomendasi untuk rumah sakit: Mulai dengan NIST CSF untuk menilai postur keamanan saat ini dan memprioritaskan perbaikan (tidak butuh anggaran besar). Kemudian implementasikan ISO 27001 untuk mendapatkan sertifikasi yang mungkin dipersyaratkan oleh BPJS Kesehatan atau mitra bisnis. Keduanya saling melengkapi — NIST CSF bisa dipetakan ke kontrol ISO 27001.",
      type: "essay",
    },
  ],

  // ─── VIDEO RESOURCES ─────────────────────────────────────────────────────────
  videoResources: [
    {
      title: "Defense in Depth Explained — Layered Security Strategy",
      youtubeId: "1NsGVfLWH3k",
      description: "Penjelasan komprehensif strategi pertahanan berlapis dalam keamanan siber modern.",
      language: "en",
      duration: "10:15",
    },
    {
      title: "Access Control Models — DAC, MAC, RBAC, ABAC",
      youtubeId: "LD0P4v-Kx1U",
      description: "Penjelasan mendalam model-model access control dengan contoh implementasi nyata.",
      language: "en",
      duration: "14:20",
    },
    {
      title: "Zero Trust Security Model — Never Trust, Always Verify",
      youtubeId: "yn6CPQ0bCHA",
      description: "Konsep Zero Trust Architecture, prinsip-prinsipnya, dan cara implementasinya di enterprise.",
      language: "en",
      duration: "11:45",
    },
    {
      title: "AAA Security Framework — Authentication, Authorization, Accounting",
      youtubeId: "vRCuWGMJjCM",
      description: "Penjelasan framework AAA dan perbedaan RADIUS vs TACACS+ untuk network security.",
      language: "en",
      duration: "13:20",
    },
    {
      title: "Linux System Hardening — CIS Benchmark",
      youtubeId: "ZHuXg9fj4gU",
      description: "Panduan praktis hardening sistem Linux berdasarkan CIS Benchmark untuk environment produksi.",
      language: "en",
      duration: "20:30",
    },
  ],
};
