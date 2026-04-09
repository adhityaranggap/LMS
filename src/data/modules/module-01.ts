import type { ModuleData, CaseStudyVariant } from '../module-types';

export const module01: ModuleData & { caseStudyPool: CaseStudyVariant[] } = {
  id: 1,
  title: 'Pengenalan & SOC',
  description:
    'Pengantar Pengujian Keamanan Informasi, Bahaya & Dampak Ancaman Siber, dan Security Operations Center (SOC)',
  iconName: 'Shield',

  // ──────────────────────────────────────────────
  // THEORY (7 items)
  // ──────────────────────────────────────────────
  theory: [
    {
      title: 'CIA Triad — Model Fundamental Keamanan Informasi',
      content:
        'CIA Triad adalah fondasi dari setiap program keamanan informasi modern. Model ini terdiri dari tiga pilar utama: Confidentiality (Kerahasiaan), Integrity (Integritas), dan Availability (Ketersediaan). Setiap kebijakan, kontrol, dan teknologi keamanan dapat dievaluasi berdasarkan seberapa baik ia melindungi satu atau lebih dari ketiga properti ini. Pelanggaran terhadap salah satu pilar dapat mengakibatkan kerugian finansial, reputasi, hingga hukum bagi organisasi.',
      keyPoints: [
        'Confidentiality: Memastikan informasi hanya dapat diakses oleh individu, entitas, atau proses yang berwenang. Contoh kontrol: enkripsi data (AES-256), autentikasi multi-faktor (MFA), Access Control List (ACL).',
        'Integrity: Menjamin bahwa data akurat, lengkap, dan tidak dimodifikasi tanpa otorisasi baik saat penyimpanan maupun transmisi. Contoh kontrol: hash cryptographic (SHA-256), digital signature, version control.',
        'Availability: Memastikan sistem, jaringan, dan data dapat diakses oleh pengguna yang berwenang kapan pun dibutuhkan. Contoh kontrol: redundansi, backup, disaster recovery plan (DRP), DDoS mitigation.',
        'Tambahan: Non-repudiation (tidak dapat menyangkal) sering disebut sebagai pilar ke-4 dalam beberapa framework, dijamin melalui audit log dan digital signature.',
        'Keseimbangan CIA bersifat trade-off: sistem yang sangat confidential mungkin mengorbankan availability; sistem yang sangat available mungkin kurang confidential.',
      ],
      table: {
        caption: 'Ancaman terhadap CIA Triad beserta contoh dan countermeasure-nya',
        headers: ['Pilar', 'Contoh Ancaman', 'Dampak Bisnis', 'Contoh Countermeasure'],
        rows: [
          [
            'Confidentiality',
            'Data breach, Eavesdropping, SQL Injection',
            'Bocornya data pelanggan, denda GDPR/UU PDP',
            'Enkripsi TLS/AES, MFA, RBAC, DLP',
          ],
          [
            'Integrity',
            'Man-in-the-Middle, Malware, Insider Tampering',
            'Keputusan bisnis salah karena data palsu',
            'Digital signature, HMAC, File Integrity Monitoring (FIM)',
          ],
          [
            'Availability',
            'DDoS, Ransomware, Hardware Failure',
            'Downtime layanan, kehilangan pendapatan',
            'Load balancer, CDN, Off-site backup, UPS',
          ],
          [
            'Non-repudiation',
            'Penolakan transaksi, Pemalsuan identitas',
            'Sengketa hukum, fraud tidak dapat dibuktikan',
            'Audit log tamper-proof, PKI, Timestamp Authority',
          ],
        ],
      },
      note: 'Dalam konteks regulasi Indonesia, UU ITE dan POJK tentang Keamanan Siber mewajibkan organisasi menjaga ketiga properti CIA. Pelanggaran dapat mengakibatkan sanksi administratif hingga pidana.',
      noteType: 'info',
    },
    {
      title: 'Bahaya dan Dampak Ancaman Siber',
      content:
        'Ancaman siber terus berkembang dalam skala, kecanggihan, dan dampaknya. IBM Cost of Data Breach Report 2023 melaporkan rata-rata biaya insiden data breach sebesar USD 4,45 juta per kejadian. Di Indonesia, BSSN mencatat lebih dari 1,6 miliar anomali traffic pada tahun 2022. Memahami kategori ancaman adalah langkah pertama untuk membangun pertahanan yang efektif.',
      keyPoints: [
        'Ancaman Teknis: Malware (virus, worm, trojan, ransomware, spyware), Exploits (zero-day, CVE), dan serangan protokol jaringan.',
        'Ancaman Non-Teknis: Social engineering (phishing, vishing, smishing), insider threat (karyawan jahat/ceroboh), dan physical security breach.',
        'Advanced Persistent Threat (APT): Aktor negara atau kelompok terorganisir yang melakukan serangan jangka panjang dan tersembunyi untuk tujuan spionase atau sabotase.',
        'Supply Chain Attack: Kompromi dilakukan melalui vendor atau perangkat lunak pihak ketiga (contoh: kasus SolarWinds 2020).',
        'Dampak insiden: finansial (kerugian langsung + denda regulasi), reputasi (hilangnya kepercayaan pelanggan), operasional (downtime), dan hukum (tuntutan pidana/perdata).',
      ],
      table: {
        caption: 'Kategori ancaman siber, contoh nyata, dan tingkat risikonya',
        headers: ['Kategori', 'Contoh Serangan', 'Target Utama', 'Tingkat Risiko', 'Dampak Rata-rata'],
        rows: [
          ['Ransomware', 'WannaCry, LockBit, Conti', 'Rumah sakit, Pemerintah, Enterprise', 'KRITIS', 'USD 4,5M + downtime'],
          ['Phishing', 'Spear phishing, BEC (Business Email Compromise)', 'Karyawan, Eksekutif', 'TINGGI', 'USD 1,8M per insiden'],
          ['DDoS', 'Volumetric, Application layer, Protocol', 'E-commerce, Bank, DNS', 'TINGGI', 'USD 50K/jam downtime'],
          ['Insider Threat', 'Data exfiltration, Sabotase sistem', 'Organisasi dengan data sensitif', 'SEDANG-TINGGI', 'USD 11M/tahun'],
          ['Zero-Day Exploit', 'Log4Shell, ProxyLogon', 'Semua sistem yang rentan', 'KRITIS', 'Sangat bervariasi'],
          ['Supply Chain', 'SolarWinds SUNBURST, Kaseya VSA', 'Enterprise, Pemerintah', 'KRITIS', 'Ribuan organisasi terdampak'],
        ],
      },
      note: 'Perhatian khusus untuk sektor kesehatan dan keuangan: keduanya adalah target favorit ransomware dan APT karena menyimpan data sensitif tinggi dan cenderung membayar tebusan untuk memulihkan layanan kritis.',
      noteType: 'warning',
    },
    {
      title: 'Security Operations Center (SOC) — Struktur dan Peran',
      content:
        'Security Operations Center (SOC) adalah unit terpusat yang bertanggung jawab untuk memantau, mendeteksi, menganalisis, merespons, dan melaporkan insiden keamanan siber secara kontinyu (24/7/365). SOC menggabungkan manusia, proses, dan teknologi untuk menjaga postur keamanan organisasi. Terdapat beberapa model operasi SOC: Internal SOC (dibangun sendiri), Co-managed SOC (dengan vendor MSSP), Virtual SOC (remote/distributed), dan Command SOC (mengkoordinasikan beberapa SOC).',
      keyPoints: [
        'SOC Tier 1 (Alert Triage Analyst): Memantau dashboard SIEM, melakukan triage alert pertama, mengklasifikasikan false positive/true positive, dan mengeskalasi ke Tier 2. Shift kerja 24/7.',
        'SOC Tier 2 (Incident Responder): Investigasi mendalam insiden yang dieskalasi Tier 1, melakukan containment dan eradication, menulis laporan insiden, dan berkoordinasi dengan tim IT.',
        'SOC Tier 3 (Threat Hunter / Senior Analyst): Proaktif mencari ancaman tersembunyi (threat hunting), melakukan forensik digital, reverse engineering malware, dan mengembangkan use case deteksi baru.',
        'SOC Manager: Mengawasi operasional SOC, menetapkan KPI (MTTD/MTTR), berkoordinasi dengan CISO, dan membuat laporan eksekutif.',
        'Key Metrics: MTTD (Mean Time to Detect), MTTR (Mean Time to Respond/Remediate), False Positive Rate, Incidents per Analyst.',
        'Kolaborasi dengan CERT/CSIRT nasional (ID-CERT, BSSN) untuk insiden berdampak besar.',
      ],
      table: {
        caption: 'Perbandingan tier SOC berdasarkan tugas, tools, dan keterampilan',
        headers: ['Tier', 'Nama Peran', 'Tugas Utama', 'Tools yang Digunakan', 'Skill yang Dibutuhkan'],
        rows: [
          [
            'Tier 1',
            'Alert Triage Analyst',
            'Monitor SIEM, triage alert, eskalasi',
            'SIEM (Splunk/QRadar), Ticketing (ServiceNow)',
            'Dasar jaringan, OS, analisis log',
          ],
          [
            'Tier 2',
            'Incident Responder',
            'Investigasi mendalam, containment, eradication',
            'EDR (CrowdStrike), Sandbox, Volatility',
            'Forensik digital, analisis malware, scripting',
          ],
          [
            'Tier 3',
            'Threat Hunter / Forensik',
            'Threat hunting proaktif, reverse engineering',
            'IDA Pro, Ghidra, ELK Stack, Threat Intel Platform',
            'Reverse engineering, APT knowledge, OSINT',
          ],
          [
            'SOC Manager',
            'Operations Manager',
            'Koordinasi tim, KPI, laporan eksekutif',
            'GRC Platform, Dashboard, Reporting Tools',
            'Leadership, komunikasi, pemahaman bisnis',
          ],
        ],
      },
      note: 'SOC modern bergerak menuju model "Fusion Center" yang mengintegrasikan cybersecurity dengan physical security dan business intelligence untuk respons insiden yang lebih holistik.',
      noteType: 'info',
    },
    {
      title: 'Cyber Kill Chain — 7 Tahap Serangan',
      content:
        'Cyber Kill Chain dikembangkan oleh Lockheed Martin pada 2011 sebagai adaptasi dari konsep militer "kill chain". Model ini mendeskripsikan 7 tahap yang umumnya dilalui penyerang untuk menyelesaikan serangan siber. Memahami setiap tahap memungkinkan defender untuk menginterupsi serangan sedini mungkin sebelum penyerang mencapai tujuannya. Prinsip utama: semakin awal interupsi dilakukan, semakin kecil kerusakannya.',
      example: {
        title: 'Studi Kasus: Serangan APT melalui Spear Phishing ke Perusahaan Energi',
        steps: [
          'RECONNAISSANCE — Penyerang meneliti target: karyawan LinkedIn, struktur organisasi, teknologi yang digunakan (LinkedIn, OSINT tools). Durasi: 2-4 minggu.',
          'WEAPONIZATION — Penyerang membuat dokumen Word berbahaya dengan macro VBA yang mengunduh payload Cobalt Strike dari server C2. Dikombinasikan dengan email spear phishing.',
          'DELIVERY — Email dikirim ke 3 manajer senior dengan subjek "Undangan Workshop Keamanan Industri 2024" dan attachment "Agenda.docx".',
          'EXPLOITATION — Salah satu manajer membuka dokumen dan mengaktifkan macro. CVE-2022-30190 (Follina) dieksploitasi untuk eksekusi kode tanpa macro.',
          'INSTALLATION — Beacon Cobalt Strike diinstal di memori (fileless). Persistence dibuat via Registry Run Key: HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run.',
          'COMMAND & CONTROL (C2) — Komunikasi encrypted HTTPS ke domain lookalike (energi-corp-update[.]com). Beacon check-in setiap 60 detik dengan jitter 30%.',
          'ACTIONS ON OBJECTIVES — Lateral movement menggunakan Pass-the-Hash, eksfiltrasi 15GB data SCADA via DNS tunneling ke server di luar negeri.',
        ],
        result:
          'Dengan memotong Kill Chain di fase Delivery (email filtering, sandboxing attachment) atau Exploitation (patch management, disabling macros), serangan dapat digagalkan sebelum terjadi kerusakan.',
      },
      keyPoints: [
        'Reconnaissance: OSINT, active scanning. Mitigasi: monitoring brand/email, limit public info exposure.',
        'Weaponization: Pembuatan exploit + payload. Mitigasi: threat intel feed, signature-based detection.',
        'Delivery: Phishing, USB drop, watering hole. Mitigasi: email security gateway, user training.',
        'Exploitation: Eksekusi exploit. Mitigasi: patch management, application whitelisting.',
        'Installation: Persistence mechanism. Mitigasi: EDR, file integrity monitoring.',
        'C2: Komunikasi dengan attacker. Mitigasi: DNS sinkhole, proxy inspection, network segmentation.',
        'Actions on Objectives: Exfil, sabotase. Mitigasi: DLP, network monitoring, UEBA.',
      ],
    },
    {
      title: 'MITRE ATT&CK Framework — Taksonomi Teknik Serangan',
      content:
        'MITRE ATT&CK (Adversarial Tactics, Techniques, and Common Knowledge) adalah knowledge base komprehensif tentang perilaku penyerang yang dikembangkan MITRE Corporation berdasarkan observasi serangan nyata. Berbeda dengan Kill Chain yang bersifat linear, ATT&CK mencakup 14 taktik dengan ratusan teknik dan sub-teknik spesifik. Framework ini tersedia untuk Enterprise (Windows, macOS, Linux, Cloud), Mobile, dan ICS/OT.',
      table: {
        caption: 'MITRE ATT&CK Enterprise Tactics (14 taktik utama)',
        headers: ['ID', 'Taktik', 'Tujuan Penyerang', 'Contoh Teknik'],
        rows: [
          ['TA0043', 'Reconnaissance', 'Mengumpulkan informasi target sebelum serangan', 'T1595 Active Scanning, T1589 Gather Victim Identity Info'],
          ['TA0042', 'Resource Development', 'Mempersiapkan infrastruktur & tools serangan', 'T1583 Acquire Infrastructure, T1588 Obtain Capabilities'],
          ['TA0001', 'Initial Access', 'Mendapatkan akses pertama ke target', 'T1566 Phishing, T1190 Exploit Public-Facing Application'],
          ['TA0002', 'Execution', 'Menjalankan kode berbahaya di target', 'T1059 Command & Scripting Interpreter, T1204 User Execution'],
          ['TA0003', 'Persistence', 'Mempertahankan akses setelah reboot', 'T1547 Boot Autostart, T1053 Scheduled Task/Job'],
          ['TA0004', 'Privilege Escalation', 'Mendapatkan hak akses lebih tinggi', 'T1068 Exploitation for Privilege Escalation, T1548 Abuse Elevation Control'],
          ['TA0005', 'Defense Evasion', 'Menghindari deteksi', 'T1055 Process Injection, T1070 Indicator Removal'],
          ['TA0006', 'Credential Access', 'Mencuri kredensial', 'T1003 OS Credential Dumping, T1110 Brute Force'],
          ['TA0007', 'Discovery', 'Mempelajari lingkungan target', 'T1082 System Info Discovery, T1046 Network Service Scanning'],
          ['TA0008', 'Lateral Movement', 'Bergerak ke sistem lain', 'T1021 Remote Services, T1550 Use Alternate Auth Material'],
          ['TA0009', 'Collection', 'Mengumpulkan data target', 'T1005 Data from Local System, T1056 Input Capture'],
          ['TA0011', 'Command & Control', 'Komunikasi dengan sistem yang dikompromikan', 'T1071 Application Layer Protocol, T1095 Non-App Layer Protocol'],
          ['TA0010', 'Exfiltration', 'Mencuri data keluar', 'T1048 Exfiltration Over Alternative Protocol, T1041 Exfil over C2'],
          ['TA0040', 'Impact', 'Merusak, mengganggu, atau menghancurkan', 'T1486 Data Encrypted for Impact, T1498 Network DoS'],
        ],
      },
      note: 'MITRE ATT&CK Navigator (https://mitre-attack.github.io/attack-navigator/) adalah tool visual untuk memetakan coverage deteksi SOC terhadap teknik ATT&CK. Ini adalah standar de facto dalam threat intelligence dan SOC maturity assessment.',
      noteType: 'info',
    },
    {
      title: 'SOC Tools dan Teknologi',
      content:
        'Efektivitas SOC sangat bergantung pada ekosistem tools yang tepat. Setiap tool memiliki fungsi spesifik dan saling melengkapi dalam siklus deteksi-respons-pemulihan. SOC modern mengintegrasikan berbagai platform melalui API dan SOAR (Security Orchestration, Automation, and Response) untuk mempercepat respons dan mengurangi beban analis.',
      table: {
        caption: 'Perbandingan tools utama SOC beserta fungsi dan contoh produk',
        headers: ['Kategori Tool', 'Fungsi Utama', 'Cara Kerja', 'Contoh Produk (Open Source & Komersial)'],
        rows: [
          [
            'SIEM',
            'Korelasi log & alert terpusat',
            'Mengumpulkan log dari semua sumber, menerapkan correlation rules, menghasilkan alert',
            'Splunk, IBM QRadar, Microsoft Sentinel, Elastic SIEM (Open Source)',
          ],
          [
            'IDS (Network)',
            'Deteksi intrusi berbasis signature/anomali',
            'Menganalisis traffic jaringan terhadap signature database atau baseline normal',
            'Snort, Suricata (Open Source), Cisco IDS',
          ],
          [
            'IPS (Network)',
            'Deteksi + blokir intrusi secara inline',
            'Seperti IDS tapi dipasang inline di jaringan dan dapat drop packet berbahaya',
            'Suricata (IPS mode), Palo Alto NGFW, Fortinet FortiGate',
          ],
          [
            'EDR',
            'Deteksi & respons di endpoint',
            'Agen di endpoint merekam semua aktivitas proses, file, jaringan untuk deteksi dan forensik',
            'CrowdStrike Falcon, Microsoft Defender for Endpoint, SentinelOne, Wazuh (Open Source)',
          ],
          [
            'SOAR',
            'Otomasi respons insiden',
            'Playbook otomatis yang dipicu alert SIEM untuk tindakan containment, enrichment, notification',
            'Splunk SOAR (Phantom), Palo Alto XSOAR, TheHive + Cortex (Open Source)',
          ],
          [
            'Threat Intelligence Platform',
            'Manajemen & analisis threat intel',
            'Mengumpulkan, menormalisasi, dan mengkorelasikan IOC dari berbagai feed eksternal',
            'MISP (Open Source), ThreatConnect, Recorded Future',
          ],
          [
            'Vulnerability Scanner',
            'Identifikasi kerentanan sistem',
            'Scan aktif terhadap target untuk menemukan CVE dan misconfigurations',
            'OpenVAS (Open Source), Nessus, Qualys, Rapid7 Nexpose',
          ],
        ],
      },
      codeSnippet: `# Contoh query Splunk SPL untuk mendeteksi brute force login
index=windows EventCode=4625
| stats count by src_ip, dest_host, user
| where count > 20
| sort -count
| eval risk_level=if(count>100, "CRITICAL", if(count>50, "HIGH", "MEDIUM"))
| table src_ip, dest_host, user, count, risk_level

# Contoh Suricata rule untuk mendeteksi Cobalt Strike beacon
alert http $HOME_NET any -> $EXTERNAL_NET any (
  msg:"ET CobaltStrike Beacon Activity";
  flow:established,to_server;
  content:"Accept: */*"; http_header;
  content:!"|0d 0a|Referer:"; http_header;
  threshold:type limit, track by_src, count 1, seconds 60;
  classtype:trojan-activity; sid:9001001; rev:1;
)`,
      note: 'Untuk lab environment dengan biaya minimal, gunakan kombinasi Wazuh (EDR/SIEM) + Suricata (IDS/IPS) + MISP (Threat Intel) + TheHive (Case Management). Stack ini digunakan oleh banyak SOC skala menengah di Indonesia.',
      noteType: 'success',
    },
    {
      title: 'Persiapan Karir di Cybersecurity Operations',
      content:
        'Industri keamanan siber menghadapi kekurangan tenaga ahli secara global. ISC2 Cybersecurity Workforce Study 2023 mencatat kekurangan 4 juta profesional keamanan siber di seluruh dunia. Di Indonesia, BSSN dan Kemkominfo secara aktif mendorong pengembangan talenta siber nasional. Jalur karir di SOC menawarkan peluang pertumbuhan yang jelas dari posisi junior hingga manajemen.',
      keyPoints: [
        'Entry Level (0-2 tahun): SOC Analyst Tier 1, IT Support with Security, Junior Penetration Tester. Gaji Indonesia: Rp 6-12 juta/bulan.',
        'Mid Level (2-5 tahun): SOC Analyst Tier 2/3, Incident Responder, Security Engineer. Gaji Indonesia: Rp 12-25 juta/bulan.',
        'Senior Level (5+ tahun): Threat Hunter, Security Architect, CISO, Red Team Lead. Gaji Indonesia: Rp 25-80 juta/bulan.',
        'Sertifikasi untuk SOC Analyst: CompTIA Security+ (entry), CompTIA CySA+ (intermediate), Cisco CyberOps Associate, GIAC GCIH (incident handling), GIAC GCIA (intrusion analysis).',
        'Sertifikasi Advanced: CEH, OSCP (pentest), CISSP (manajemen), CISM (manajemen), GREM (malware analysis).',
        'Sertifikasi Lokal/Regional: Certified Ethical Hacker (CEH) versi Bahasa Indonesia, sertifikasi BSSN, Certified Security Analyst dari BNSP.',
        'Tools yang perlu dikuasai pemula: Linux CLI, Wireshark, Splunk/ELK, Nmap, Metasploit Framework, Python scripting dasar.',
        'Platform belajar gratis: TryHackMe (SOC Level 1 path), Hack The Box, LetsDefend (SOC simulator), MITRE ATT&CK website.',
      ],
      note: 'Ikut komunitas: ID-CERT (Computer Emergency Response Team Indonesia), OWASP Indonesia Chapter, Forum CISSPIndo, dan grup Telegram/Discord cybersecurity Indonesia. Networking sangat penting untuk perkembangan karir di bidang ini.',
      noteType: 'info',
    },
  ],

  // ──────────────────────────────────────────────
  // LAB
  // ──────────────────────────────────────────────
  lab: {
    title: 'Lab 1: Pengenalan CyberOps Workstation & SOC Tools',
    downloads: [
      {
        name: 'CyberOps Workstation VM',
        url: 'https://www.netacad.com/',
        description: 'VM untuk praktik keamanan siber berbasis Cisco CyberOps (dari NetAcad). Daftar akun gratis.',
      },
      {
        name: 'VirtualBox',
        url: 'https://www.virtualbox.org/wiki/Downloads',
        description: 'Hypervisor gratis untuk menjalankan VM. Pilih versi sesuai OS host.',
      },
    ],
    steps: [
      {
        title: 'Download & Import VM',
        description:
          'Download file OVA CyberOps Workstation dari portal NetAcad (atau gunakan VM alternatif: Ubuntu Server 22.04). Import ke VirtualBox menggunakan perintah CLI atau GUI: File > Import Appliance.',
        command: 'VBoxManage import CyberOps_Workstation.ova --vsys 0 --memory 2048 --cpus 2',
        expectedOutput: '0%...10%...20%...30%...40%...50%...60%...70%...80%...90%...100%\nSuccessfully imported the appliance.',
        hint: 'Jika memori terbatas, atur ke 1024 MB. VM ini membutuhkan minimal 2GB RAM. Aktifkan VT-x/AMD-V di BIOS jika VM gagal start.',
        screenshotNote: 'Screenshot 1: Tampilkan VirtualBox Manager dengan VM CyberOps yang sudah berhasil diimport.',
      },
      {
        title: 'Login & Identifikasi Sistem',
        description:
          'Login ke VM (kredensial default: analyst/cyberops atau root/cyberops tergantung distribusi). Jalankan perintah untuk mengidentifikasi informasi sistem dasar.',
        command: 'whoami && id && hostname && uname -a && cat /etc/os-release | head -5',
        expectedOutput:
          'analyst\nuid=1000(analyst) gid=1000(analyst) groups=1000(analyst),4(adm),24(cdrom)\ncyberops\nLinux cyberops 5.15.0-xx-generic #xx-Ubuntu SMP ...\nNAME="Ubuntu"\nVERSION="22.04.x LTS (Jammy Jellyfish)"',
        hint: 'Jika login gagal, coba kombinasi: admin/admin, student/student, atau root/toor.',
        screenshotNote: 'Screenshot 2: Output lengkap identifikasi sistem di terminal.',
      },
      {
        title: 'Pemeriksaan Jaringan',
        description:
          'Identifikasi semua interface jaringan, IP address, subnet mask, gateway, dan DNS yang dikonfigurasi. Ini adalah langkah pertama saat menganalisis sistem yang tidak dikenal.',
        command: 'ip addr show && echo "---ROUTES---" && ip route && echo "---DNS---" && cat /etc/resolv.conf',
        expectedOutput:
          'lo: <LOOPBACK,...> inet 127.0.0.1/8\neth0: <BROADCAST,...> inet 192.168.x.x/24\n---ROUTES---\ndefault via 192.168.x.1 dev eth0\n192.168.x.0/24 dev eth0 ...',
        screenshotNote: 'Screenshot 3: Konfigurasi jaringan lengkap termasuk IP, gateway, dan DNS.',
        hint: 'Perintah lama: ifconfig (deprecated). Di sistem modern gunakan "ip" commands. "ss -tuln" lebih baik dari "netstat -tuln".',
      },
      {
        title: 'Analisis Proses dan Port',
        description:
          'Identifikasi proses yang berjalan dan port yang sedang listening. Ini simulasikan pekerjaan Tier 1 SOC saat merespons alert di endpoint.',
        command: 'ps aux --sort=-%cpu | head -15 && echo "---LISTENING PORTS---" && ss -tuln',
        expectedOutput:
          'USER       PID %CPU %MEM    VSZ   RSS COMMAND\nroot         1  0.0  0.5  ...\n---LISTENING PORTS---\nNetid  State   Recv-Q  Send-Q  Local Address:Port\ntcp    LISTEN  0       128     0.0.0.0:22',
        hint: 'Perhatikan proses dengan nama aneh atau menggunakan CPU/memori berlebihan. Port 22 (SSH) normalnya listening di server.',
        screenshotNote: 'Screenshot 4: Daftar proses top dan port yang listening.',
      },
      {
        title: 'Review Log Sistem',
        description:
          'Analisis log sistem menggunakan journalctl dan file log tradisional. SOC Analyst menghabiskan banyak waktu menganalisis log untuk menemukan aktivitas mencurigakan.',
        command:
          'sudo journalctl -n 50 --no-pager | grep -i -E "error|warn|fail|refused" && echo "---AUTH LOG---" && sudo tail -20 /var/log/auth.log',
        expectedOutput: 'Baris-baris log dengan timestamp, hostname, service name, dan pesan. Cari entry dengan kata "Failed" atau "Invalid".',
        warningNote:
          'Log adalah bukti forensik. Jangan pernah menghapus atau memodifikasi log di sistem yang sedang diinvestigasi. Selalu buat salinan log sebelum analisis.',
        screenshotNote: 'Screenshot 5: Output log sistem, terutama jika ada pesan error atau authentication failure.',
        hint: 'Gunakan "sudo journalctl -u ssh -n 30" untuk melihat log khusus SSH. "grep -v" untuk exclude baris yang tidak relevan.',
      },
    ],
    deliverable:
      'Laporan lab (format PDF, minimal 5 halaman) berisi: (1) 5 screenshot dari setiap langkah lab, (2) tabel ringkasan informasi sistem yang ditemukan, (3) jawaban pertanyaan: Apa perbedaan antara proses dengan UID=0 dan UID=1000? Port apa saja yang listening dan apa fungsinya? Temuan apa yang mencurigakan (jika ada)? (4) Refleksi: bagaimana langkah-langkah ini relevan dengan tugas SOC Tier 1?',
  },

  // ──────────────────────────────────────────────
  // DEFAULT CASE STUDY (fallback)
  // ──────────────────────────────────────────────
  caseStudy: {
    title: 'Analisis Insiden Ransomware WannaCry — Perspektif SOC',
    scenario:
      'Pada 12 Mei 2017, ransomware WannaCry menginfeksi lebih dari 200.000 komputer di 150 negara dalam 24 jam. Serangan ini mengeksploitasi kerentanan EternalBlue (MS17-010) pada SMBv1 Windows yang telah dipatch oleh Microsoft dua bulan sebelumnya (MS17-010, Maret 2017). Rumah sakit NHS di Inggris terpaksa membatalkan 19.000 janji temu dan menolak pasien darurat karena sistem down. Kerugian global diperkirakan USD 4-8 miliar.',
    questions: [
      'Petakan serangan WannaCry secara lengkap ke 7 tahap Cyber Kill Chain. Untuk setiap tahap, jelaskan apa yang dilakukan WannaCry dan kontrol keamanan apa yang bisa menghentikannya di tahap tersebut.',
      'Sebagai SOC Tier 1 Analyst yang mendapat alert "Unusual SMB traffic detected on multiple hosts", jelaskan langkah triage Anda: informasi apa yang dikumpulkan, bagaimana mengklasifikasikan severity, dan kepada siapa Anda mengeskalasi?',
      'Mengapa patch MS17-010 tidak diinstal oleh banyak organisasi padahal sudah tersedia 2 bulan sebelum serangan? Hubungkan dengan konsep vulnerability management dan CIA triad.',
      'Identifikasi minimal 5 teknik WannaCry dalam framework MITRE ATT&CK (sebutkan ID teknik). Jelaskan bagaimana SOC dapat mendeteksi masing-masing teknik tersebut menggunakan SIEM rules.',
    ],
  },

  // ──────────────────────────────────────────────
  // CASE STUDY POOL (15 variants)
  // ──────────────────────────────────────────────
  caseStudyPool: [
    {
      title: 'Insiden Ransomware di Rumah Sakit Regional Medika Nusantara',
      scenario:
        'RS Medika Nusantara (450 tempat tidur) mengalami serangan ransomware LockBit 3.0 pada pukul 02.30 dini hari. Semua sistem rekam medis elektronik (RME), jadwal operasi, dan sistem farmasi terenkripsi. Ransom note muncul di setiap monitor: "500 BTC dalam 72 jam atau data 120.000 pasien kami publikasikan." Tim IT mendeteksi anomali ketika NAS backup storage tiba-tiba offline. Investigasi awal menunjukkan initial access melalui akun VPN seorang radiologis yang passwordnya ditemukan di dark web (credential stuffing).',
      questions: [
        'Sebagai SOC Manager yang dipanggil darurat pada pukul 03.00, buat Incident Response Plan 24 jam pertama: siapa yang dihubungi, sistem mana yang diprioritaskan, dan bagaimana mengkomunikasikan insiden ke manajemen rumah sakit tanpa memicu kepanikan publik?',
        'Petakan serangan ini ke MITRE ATT&CK: dari initial access (credential stuffing) hingga impact (data encrypted). Sebutkan minimal 6 taktik dan teknik spesifik beserta ID-nya.',
        'Diskusikan dilema etis dan hukum: haruskah rumah sakit membayar tebusan demi memulihkan akses ke data pasien kritis? Kaitkan dengan regulasi HIPAA/UU Kesehatan Indonesia dan posisi BSSN tentang pembayaran ransom.',
        'Rancang arsitektur backup 3-2-1 yang seharusnya ada untuk mencegah kerugian data. Jelaskan mengapa backup juga harus dilindungi dari ransomware (offline/immutable backup).',
      ],
    },
    {
      title: 'Serangan APT pada Bank Perkreditan Rakyat Sejahtera Mandiri',
      scenario:
        'BPR Sejahtera Mandiri (aset Rp 200 miliar) melaporkan ke SOC internal bahwa terjadi transfer dana tidak wajar sebesar Rp 4,7 miliar ke rekening-rekening luar negeri selama 3 hari terakhir. Analisis SIEM menunjukkan ada sesi admin core banking yang aktif di luar jam kerja (02.00-04.00 WITA) dari IP yang sebelumnya tidak pernah tercatat. Log autentikasi menunjukkan login berhasil menggunakan token OTP yang valid. CCTV menunjukkan tidak ada orang di ruang server saat itu. Forensik awal menemukan keylogger di laptop seorang teller yang pernah mengakses internet banking demo melalui tautan dari email.',
      questions: [
        'Identifikasi teknik spionase siber yang digunakan dalam skenario ini. Bagaimana penyerang mungkin memperoleh kredensial OTP yang valid meskipun OTP bersifat satu kali pakai?',
        'Bangun timeline investigasi forensik digital dari bukti yang tersedia (log SIEM, CCTV, forensik laptop teller). Apa urutan kejadian yang paling mungkin berdasarkan bukti tersebut?',
        'Sebagai Tier 3 SOC Analyst, teknik threat hunting apa yang akan Anda gunakan untuk memastikan tidak ada persistence lain yang tersisa di jaringan setelah insiden ini ditangani?',
        'Rancang kontrol keamanan berlapis untuk mencegah insiden serupa: gabungkan kontrol teknis (MFA yang lebih kuat, network segmentation), prosedural (dual approval untuk transfer besar), dan detektif (anomaly detection berbasis behavior).',
      ],
    },
    {
      title: 'Insiden Data Breach di Instansi Pemerintah Daerah Provinsi Nusatimur',
      scenario:
        'SOC Dinas Kominfo Provinsi Nusatimur menerima alert dari sistem monitoring pada Senin pagi: database kependudukan dengan data 3,2 juta warga (NIK, nama, alamat, foto KTP, data keluarga) sedang diakses oleh proses yang tidak dikenal sejak Jumat malam. Dugaan exfiltration berlangsung selama 60+ jam tanpa terdeteksi. Postingan di forum darkweb sudah menawarkan "Nusatimur Province Population Database" seharga USD 15.000. Investigasi menemukan server database menggunakan MySQL versi lama dengan port 3306 terekspos ke internet tanpa autentikasi karena "sudah dikonfigurasi sebelum saya bertugas" menurut admin.',
      questions: [
        'Lakukan analisis root cause: identifikasi semua kelemahan keamanan yang memungkinkan insiden ini terjadi (teknis, prosedural, dan governance). Urutkan dari yang paling kritis.',
        'Berdasarkan UU PDP (Perlindungan Data Pribadi) Indonesia yang berlaku, apa kewajiban Pemerintah Daerah dalam 24 jam pertama setelah mengetahui data breach ini? Kepada siapa harus melapor dan apa konten laporan minimal?',
        'Data yang bocor bersifat permanen di internet. Buat rencana mitigasi dampak jangka panjang untuk warga yang datanya bocor: langkah apa yang bisa diambil Pemda untuk meminimalkan risiko penyalahgunaan data (identity fraud, phishing targeted)?',
        'Rancang security hardening checklist untuk server database pemerintah: minimal 10 kontrol spesifik yang harus diimplementasikan segera untuk mencegah eksploitasi serupa.',
      ],
    },
    {
      title: 'Serangan DDoS Terhadap Portal SIAKAD Universitas Negeri Archipelago',
      scenario:
        'Pada hari pertama pengisian KRS (Kartu Rencana Studi) semester baru, portal SIAKAD Universitas Negeri Archipelago (38.000 mahasiswa) mengalami downtime total selama 6 jam. SOC kampus mendeteksi traffic 40 Gbps dari 15.000 IP berbeda ke server web — jauh melampaui kapasitas uplink 1 Gbps. Analisis log menunjukkan request bersifat HTTP GET flood ke halaman login. Di waktu yang sama, akun media sosial "Anonymous_UNA" mengklaim bertanggung jawab dan menyebut serangan sebagai protes atas kenaikan UKT. Petugas pendaftaran harus melayani manual 5.000 mahasiswa dalam antrian fisik.',
      questions: [
        'Kategorikan jenis serangan DDoS ini (volumetric, protocol, atau application layer) dan jelaskan secara teknis cara kerjanya. Bagaimana karakteristik HTTP GET flood berbeda dari UDP flood atau SYN flood?',
        'Sebagai SOC Analyst, bagaimana Anda membedakan traffic DDoS dari traffic legitimate yang sangat tinggi pada hari KRS? Parameter apa di SIEM yang digunakan untuk membuat keputusan ini?',
        'Rancang arsitektur DDoS mitigation yang realistis untuk universitas negeri dengan anggaran terbatas: kombinasi layanan CDN gratis/murah, rate limiting, geoblocking, dan prosedur eskalasi ke upstream ISP atau BSSN.',
        'Klaim hacktivist "Anonymous_UNA" menimbulkan pertanyaan hukum: apakah serangan DDoS sebagai bentuk protes dilindungi kebebasan berekspresi? Analisis dari perspektif UU ITE Indonesia dan bandingkan dengan pandangan internasional.',
      ],
    },
    {
      title: 'Insider Threat pada Platform E-Commerce BelanjaDulu.id',
      scenario:
        'BelanjaDulu.id (2 juta pengguna aktif) menemukan bahwa data kartu kredit 45.000 pelanggan premium telah dijual di forum carding. Analisis menunjukkan data hanya bisa diakses dari sistem payment gateway internal. SIEM mencatat akses tidak wajar ke tabel database payment_cards oleh akun "dbadmin_backup" pada tanggal-tanggal tertentu selama 3 bulan terakhir, selalu antara pukul 23.00-01.00, dan data selalu di-export ke file CSV lokal. HR mengkonfirmasi bahwa akun tersebut adalah akun shared yang digunakan oleh 3 DBA yang bekerja shift malam secara bergantian.',
      questions: [
        'Dalam konteks insider threat, bagaimana Anda menentukan apakah ini kasus rogue insider (niat jahat), negligent insider (kecerobohan), atau compromised insider (akun dibajak pihak luar)? Bukti apa yang dibutuhkan untuk masing-masing skenario?',
        'Identifikasi kegagalan kontrol keamanan yang memungkinkan insiden ini: mengapa shared account berbahaya? Apa prinsip keamanan yang dilanggar (least privilege, separation of duties, dll)?',
        'Sebagai Tier 2 Incident Responder yang memimpin investigasi, buat rencana pengumpulan bukti digital yang forensically sound: dari mana saja bukti dikumpulkan, bagaimana chain of custody dijaga, dan siapa saja yang perlu diwawancara?',
        'Rancang program User and Entity Behavior Analytics (UEBA) untuk mendeteksi insider threat serupa di masa depan: fitur perilaku apa yang dijadikan baseline, alert apa yang dibuat, dan bagaimana menghindari false positive berlebihan?',
      ],
    },
    {
      title: 'Serangan Supply Chain pada Sistem SCADA Pabrik Manufaktur Baja Nusa',
      scenario:
        'PT Baja Nusa (produsen baja konstruksi) melaporkan gangguan produksi setelah menemukan bahwa software update resmi dari vendor SCADA mereka ternyata mengandung backdoor. Update tersebut diunduh oleh 12 pabrik di seluruh Indonesia secara otomatis melalui mekanisme auto-update. Backdoor membuka RDP ke IP eksternal dan memungkinkan penyerang memanipulasi parameter tungku pembakaran. Tim SOC menemukan komunikasi C2 tersembunyi dalam traffic HTTPS normal ke domain vendor yang legitimate. Investigasi menunjukkan server update vendor telah dikompromikan 3 bulan sebelumnya.',
      questions: [
        'Jelaskan mengapa supply chain attack terhadap vendor SCADA sangat berbahaya dibandingkan serangan langsung ke pabrik. Apa yang membuat serangan ini sulit dideteksi oleh SOC pabrik menggunakan metode konvensional?',
        'Buat program vendor security assessment untuk PT Baja Nusa: kriteria apa yang digunakan untuk mengevaluasi keamanan vendor software OT/SCADA? Kontrak klausul keamanan apa yang seharusnya ada?',
        'Bagaimana SOC dapat mendeteksi software update yang telah dikompromikan (trojanized update)? Teknik apa (code signing verification, hash comparison, sandboxing) yang efektif dan bagaimana mengimplementasikannya di environment OT?',
        'Insiden ini melibatkan konvergensi IT dan OT (Operational Technology). Jelaskan tantangan unik keamanan lingkungan OT/ICS dibandingkan IT tradisional, dan bagaimana framework IEC 62443 atau NIST SP 800-82 dapat membantu.',
      ],
    },
    {
      title: 'Kebocoran Data Pelanggan Operator Telekomunikasi Nusantara Cellular',
      scenario:
        'Operator telekomunikasi Nusantara Cellular (18 juta pelanggan) menerima notifikasi dari BSSN bahwa data pelanggan mereka beredar di forum hacker. Dataset berisi nama, nomor telepon, alamat, data IMEI, dan lokasi cell tower dari 5 juta pelanggan. Analisis tim SOC menunjukkan data tersebut berasal dari sistem OSS (Operations Support System) untuk manajemen jaringan. Log API menunjukkan ada akun developer yang mengakses endpoint manajemen pelanggan dengan volume sangat tinggi (10.000 request/jam vs normal 50 request/jam) dari IP VPN berbeda setiap harinya selama 2 minggu.',
      questions: [
        'Analisis pola serangan berdasarkan log API: teknik apa yang digunakan penyerang untuk menghindari deteksi rate limiting? Bagaimana desain API security yang seharusnya bisa mendeteksi atau mencegah scraping masif ini?',
        'Data lokasi cell tower yang bocor dapat digunakan untuk tracking pergerakan seseorang secara historis. Diskusikan implikasi privasi dan keamanan nasional dari bocornya data ini, terutama jika target adalah pejabat pemerintah atau aparat keamanan.',
        'Sebagai SOC Tier 2 yang menulis laporan Incident Response, bagian apa saja yang harus ada dalam laporan? Buat outline laporan lengkap untuk insiden ini termasuk Executive Summary, Timeline, Root Cause Analysis, Impact Assessment, dan Recommendation.',
        'Rancang program API Security Monitoring untuk sistem OSS: anomaly detection berbasis baseline apa yang diimplementasikan, alert threshold apa yang ditetapkan, dan bagaimana mengintegrasikan dengan SIEM yang sudah ada?',
      ],
    },
    {
      title: 'Serangan Phishing Bertarget pada Startup Fintech PayCepat',
      scenario:
        'PayCepat (platform pembayaran digital, 800.000 pengguna) melaporkan bahwa CFO dan dua manajer keuangan menjadi korban Business Email Compromise (BEC). Penyerang mendaftarkan domain "payce-pat.com" (typosquatting) dan mengirim email palsu yang tampak seperti dari CEO, meminta transfer darurat Rp 2,1 miliar ke rekening "supplier baru" untuk pembayaran server di luar negeri. Dua transfer sudah dilakukan sebelum tim keuangan curiga. Analisis header email menunjukkan email berasal dari server di Romania dengan SPF record yang valid untuk domain lookalike.',
      questions: [
        'Lakukan analisis teknis email phishing ini: jelaskan cara memeriksa header email untuk mengidentifikasi sumber sebenarnya. Apa yang dimaksud dengan SPF, DKIM, dan DMARC, dan bagaimana masing-masing seharusnya mencegah serangan BEC ini?',
        'Identifikasi teknik social engineering dalam skenario BEC ini: urgency, authority, pretexting. Rancang program security awareness training yang efektif untuk tim keuangan PayCepat agar tidak terulang.',
        'Setelah transfer terjadi, dalam hitungan jam apa yang harus dilakukan? Buat prosedur emergency response untuk BEC: siapa yang dihubungi di bank (SWIFT/BI-FAST), kepolisian (Bareskrim Siber), dan OJK dalam kerangka waktu tertentu.',
        'Rancang kontrol teknis berlapis untuk mencegah BEC: email gateway configuration, domain monitoring, dual approval workflow untuk transfer di atas threshold tertentu, dan MFA untuk approval keuangan.',
      ],
    },
    {
      title: 'Serangan Ransomware pada Sistem Logistik Perusahaan Ekspedisi NusaKargo',
      scenario:
        'NusaKargo (jaringan ekspedisi nasional, 120 kantor cabang) mengalami serangan ransomware yang mengenkripsi sistem tracking paket, manajemen armada, dan database pelanggan pada hari puncak belanja online. Lebih dari 500.000 paket tidak dapat dilacak. Penyerang masuk melalui celah di sistem manajemen armada berbasis web yang belum dipatch selama 14 bulan (CVE score: 9.8). Ransomware menyebar secara lateral menggunakan WMI dan PsExec ke seluruh cabang yang terhubung via VPN. Backup terakhir adalah 3 minggu lalu karena sistem backup gagal diam-diam.',
      questions: [
        'Lakukan risk assessment terhadap keputusan menunda patch selama 14 bulan pada sistem dengan CVE score 9.8. Gunakan framework CVSS untuk menilai risiko dan jelaskan mengapa patch management harus menjadi prioritas tertinggi.',
        'Jelaskan teknik lateral movement via WMI dan PsExec dalam konteks MITRE ATT&CK. Bagaimana network segmentation dan least privilege yang tepat dapat membatasi penyebaran ransomware antar cabang?',
        'NusaKargo berhadapan dengan dilema bisnis: membayar ransom untuk memulihkan operasi di tengah puncak bisnis, atau bertahan tanpa backup yang memadai. Buat analisis cost-benefit yang mencakup: estimasi kerugian per jam downtime, risiko membayar ransom, dan timeline pemulihan alternatif.',
        'Backup yang gagal diam-diam adalah kegagalan kritikal. Rancang backup monitoring dan validation strategy: bagaimana memastikan backup benar-benar berfungsi, seberapa sering ditest, dan bagaimana mendapat alert jika backup gagal?',
      ],
    },
    {
      title: 'Insiden Keamanan Siber pada Sistem SCADA Pembangkit PLTU Energi Nusa',
      scenario:
        'PLTU Energi Nusa (kapasitas 2x660 MW, mensuplai listrik untuk 3 provinsi) melaporkan anomali pada sistem DCS (Distributed Control System) pembangkit Unit 2. Engineer menemukan parameter setpoint turbin berubah sendiri tanpa perintah manual. Sistem SOC OT mendeteksi koneksi tidak sah dari engineering workstation ke internet melalui modem 4G yang dipasang diam-diam oleh kontraktor pemeliharaan. Koneksi ini menjadi jembatan masuk ke jaringan OT yang seharusnya air-gapped. Analisis malware menemukan tools yang mirip dengan Industroyer/CRASHOVERRIDE yang digunakan dalam serangan jaringan listrik Ukraina 2016.',
      questions: [
        'Serangan pada infrastruktur kritis energi memiliki konsekuensi fisik nyata (pemadaman massal). Jelaskan perbedaan fundamental antara insiden keamanan di IT biasa vs OT/ICS dalam hal impact, recovery, dan pendekatan investigasi forensik.',
        'Modem 4G yang dipasang kontraktor adalah contoh "rogue device" yang menembus air-gap. Rancang prosedur vendor management dan physical security untuk mencegah ini: bagaimana mendeteksi perangkat tidak sah di jaringan OT?',
        'Analisis malware yang ditemukan memiliki kemiripan dengan Industroyer. Jelaskan cara kerja Industroyer terhadap protokol IEC-104 dan apa langkah immediate containment yang harus dilakukan tanpa menghentikan operasi pembangkit.',
        'Koordinasikan respons multi-stakeholder: PLTU harus melibatkan PLN, Kementerian ESDM, BSSN, Bareskrim, dan mungkin vendor DCS internasional. Buat matriks komunikasi krisis: siapa dihubungi kapan, informasi apa yang dishare, dan apa yang dirahasiakan untuk menjaga keamanan operasional.',
      ],
    },
    {
      title: 'Kebocoran Data Penonton dan Serangan Deface pada Stasiun TV Nasional Nusavision',
      scenario:
        'Stasiun TV Nusavision (nasional, 15 juta penonton unik per bulan via streaming) mengalami dua insiden bersamaan: website streaming di-deface dengan pesan politik dari kelompok hacktivist, dan database akun penonton (email, password hash bcrypt, data langganan 2 juta user) ditemukan dijual di darkweb. Investigasi menunjukkan keduanya adalah serangan terpisah: deface melalui RFI (Remote File Inclusion) pada plugin CMS yang rentan, sementara database breach melalui SQL injection di API endpoint search yang tidak disanitasi. Keduanya terjadi dalam periode yang sama secara kebetulan.',
      questions: [
        'Jelaskan secara teknis bagaimana RFI (Remote File Inclusion) dan SQL Injection bekerja. Mengapa keduanya diklasifikasikan sebagai OWASP Top 10 dan apa kontrol preventif spesifik untuk masing-masing kerentanan ini?',
        'Meskipun password di-hash dengan bcrypt, data tersebut tetap dijual di darkweb. Apa risiko nyata untuk pengguna? Jelaskan konsep password cracking (hashcat, rainbow table) dan mengapa password policy yang kuat tetap penting meskipun ada hashing.',
        'Dua insiden berbeda terjadi bersamaan — bagaimana SOC memprioritaskan respons? Buat decision matrix untuk triage multi-insiden: faktor apa yang menentukan mana yang didahulukan (severity, impact, attacker sophistication, regulatory obligation)?',
        'Nusavision harus mengumumkan breach ke publik karena regulasi. Rancang crisis communication strategy: pesan apa yang dikomunikasikan ke penonton, timing pengumuman (segera vs setelah investigasi?), saluran komunikasi, dan bagaimana mengelola respons media massa.',
      ],
    },
    {
      title: 'Serangan Ransomware dan Pencurian Data Klien pada Firma Hukum Hakim & Associates',
      scenario:
        'Firma hukum Hakim & Associates (spesialisasi hukum korporat dan M&A) menjadi korban serangan ransomware BlackCat/ALPHV yang mengenkripsi semua file dokumen hukum, termasuk kontrak merger senilai triliunan rupiah yang sedang dalam negosiasi. Penyerang mengklaim memiliki salinan dokumen rahasia dan mengancam akan membocorkan kepada pihak lawan dalam negosiasi jika tebusan USD 2 juta tidak dibayar dalam 48 jam. Partner senior firma menghubungi SOC consultant darurat karena firma tidak memiliki SOC internal. Backup server ditemukan ikut terenkripsi karena berada di network share yang sama.',
      questions: [
        'Kebocoran dokumen M&A ke pihak lawan memiliki implikasi hukum dan finansial yang sangat spesifik (insider trading, breach of confidentiality). Identifikasi semua pihak yang dirugikan dan potensi gugatan hukum yang bisa dihadapi firma jika data bocor.',
        'Sebagai SOC consultant yang dipanggil 6 jam setelah serangan, apa 10 langkah pertama yang Anda lakukan? Bedakan antara tindakan yang harus dilakukan SEGERA (dalam 1 jam) vs JANGKA PENDEK (dalam 24 jam).',
        'Firma hukum menyimpan privilege-protected communications antara attorney dan client. Bagaimana cara menangani bukti digital dari insiden ini secara legal? Siapa yang boleh mengakses bukti tersebut dan apa risiko jika prosedur tidak diikuti?',
        'Rancang security program minimal untuk firma hukum yang tidak memiliki tim IT: prioritaskan 5 kontrol keamanan paling cost-effective yang harus diimplementasikan berdasarkan analisis risk vs cost. Sertakan estimasi biaya dan manfaat masing-masing.',
      ],
    },
    {
      title: 'Pencurian Data Klaim Nasabah Perusahaan Asuransi Proteksi Prima',
      scenario:
        'PT Proteksi Prima (asuransi jiwa dan kesehatan, 500.000 nasabah) mendeteksi bahwa agen asuransi independen menggunakan aplikasi mobile resmi Proteksi Prima yang telah dimodifikasi (repackaged APK). Aplikasi palsu ini mengumpulkan data nasabah (nama, NIK, data medis, rekening bank) saat agen melakukan input klaim dan mengirimkannya ke server eksternal. 85.000 data nasabah telah terekspos selama 4 bulan. Salah satu nasabah yang datanya bocor kemudian menjadi korban penipuan klaim asuransi fiktif senilai Rp 850 juta menggunakan data medis palsunya.',
      questions: [
        'Jelaskan teknis bagaimana APK repackaging dilakukan dan bagaimana aplikasi berbahaya bisa menyerupai aplikasi asli. Apa mekanisme keamanan (code signing, certificate pinning, runtime protection) yang seharusnya ada di aplikasi Proteksi Prima untuk mencegah ini?',
        'Data medis adalah kategori data sensitif tertinggi dalam UU PDP Indonesia. Bandingkan kewajiban hukum Proteksi Prima berdasarkan UU PDP, UU Perasuransian, dan regulasi OJK terkait perlindungan data nasabah asuransi.',
        'Investigasi menunjukkan agen mengetahui aplikasi yang mereka gunakan adalah palsu karena di-download dari link WhatsApp, bukan App Store resmi. Bagaimana program vetting dan monitoring agen yang seharusnya mencegah distribusi aplikasi palsu?',
        'Korban penipuan klaim fiktif mengalami kerugian nyata. Buat prosedur remediation untuk nasabah yang terdampak: notifikasi, kompensasi, credit monitoring, dan langkah hukum yang bisa diambil Proteksi Prima untuk mengejar pelaku.',
      ],
    },
    {
      title: 'Serangan Social Engineering pada Pengembang Properti Griya Nusantara',
      scenario:
        'PT Griya Nusantara (pengembang properti, proyek senilai Rp 3,5 triliun) menjadi korban serangan social engineering berlapis selama 6 minggu. Penyerang berpura-pura sebagai notaris rekanan dan berhasil mengakses email resmi notaris asli melalui SIM swapping. Dengan email notaris yang dikompromikan, penyerang mengirim dokumen AJB (Akta Jual Beli) palsu ke bagian keuangan Griya Nusantara, yang kemudian mentransfer uang muka pembelian lahan sebesar Rp 15 miliar ke rekening yang dikendalikan penyerang. Seluruh komunikasi email tampak legitimate karena menggunakan domain asli notaris.',
      questions: [
        'Rekonstruksi rantai serangan: dari SIM swapping hingga transfer Rp 15 miliar. Identifikasi setiap tahap serangan menggunakan Cyber Kill Chain. Di tahap mana setiap langkah pencegahan bisa memotong serangan ini?',
        'SIM swapping adalah serangan yang mengeksploitasi kelemahan di proses bisnis operator seluler, bukan kelemahan teknis murni. Jelaskan bagaimana SIM swapping dilakukan dan apa yang seharusnya dilakukan operator, bank, dan perusahaan untuk mencegahnya.',
        'Verifikasi "out-of-band" adalah solusi kunci untuk BEC/social engineering. Rancang prosedur verifikasi untuk transaksi keuangan besar di Griya Nusantara: bagaimana memastikan setiap instruksi transfer di atas Rp 500 juta diverifikasi melalui saluran komunikasi yang independen dari email?',
        'Sebagai konsultan keamanan yang diminta menulis post-incident review untuk Dewan Direksi Griya Nusantara, sajikan analisis: apa yang salah, berapa kerugian total (langsung + tidak langsung), dan roadmap 90 hari untuk memperkuat pertahanan.',
      ],
    },
    {
      title: 'Insiden Ransomware pada Sistem Manajemen Donasi Lembaga Zakat Nasional Berkah',
      scenario:
        'Lembaga Zakat Nasional Berkah (LZNB, mengelola dana zakat Rp 480 miliar/tahun) mengalami serangan ransomware Hive yang mengenkripsi database donatur (1,2 juta record), sistem penyaluran dana, dan laporan keuangan 5 tahun terakhir. Waktu serangan tepat di bulan Ramadhan, saat transaksi donasi meningkat 400%. Penyerang masuk melalui akun email volunteer yang passwordnya sama dengan akun media sosial yang pernah bocor di breach sebelumnya (credential stuffing). LZNB tidak memiliki IT Security team khusus, hanya 1 admin IT merangkap helpdesk.',
      questions: [
        'LZNB adalah organisasi nirlaba dengan sumber daya IT sangat terbatas. Buat Minimum Viable Security Program (MVSP) yang realistis: 10 kontrol keamanan esensial yang bisa diimplementasikan dengan biaya minimal (di bawah Rp 50 juta/tahun) namun memberikan proteksi maksimal.',
        'Credential stuffing berhasil karena password reuse. Bagaimana LZNB bisa mendeteksi dan mencegah credential stuffing secara proaktif? Jelaskan teknis penggunaan HaveIBeenPwned API, password spray detection, dan kebijakan password yang efektif.',
        'Kepercayaan publik adalah aset utama lembaga zakat. Bocornya data donatur (termasuk nominal donasi yang bersifat ibadah pribadi) berpotensi merusak kepercayaan. Rancang crisis communication strategy yang mempertimbangkan sensitivitas nilai-nilai keagamaan dan tuntutan transparansi publik.',
        'Insiden di bulan Ramadhan menyebabkan terganggunya penyaluran zakat fitrah dan fidyah yang bersifat time-sensitive (harus sebelum Idul Fitri). Buat Business Continuity Plan (BCP) khusus untuk periode high-volume seperti Ramadhan: bagaimana LZNB bisa beroperasi manual sementara sistem dipulihkan?',
      ],
    },
  ],

  // ──────────────────────────────────────────────
  // QUIZ (13 questions: 8 MC + 5 essay)
  // ──────────────────────────────────────────────
  quiz: [
    {
      id: 1,
      question: 'Apa kepanjangan dari CIA dalam konteks keamanan informasi dan apa makna dari masing-masing komponen?',
      type: 'multiple-choice',
      options: [
        'Central Intelligence Agency — lembaga intelijen yang mengawasi keamanan siber nasional',
        'Confidentiality, Integrity, Availability — tiga properti fundamental yang harus dijaga dalam keamanan informasi',
        'Control, Inspect, Audit — tiga langkah utama dalam proses security assessment',
        'Cyber, Intelligence, Analysis — tiga domain utama dalam cybersecurity operations',
      ],
      answer:
        'Confidentiality, Integrity, Availability — tiga properti fundamental yang harus dijaga dalam keamanan informasi',
    },
    {
      id: 2,
      question:
        'SOC Tier 1 Analyst menerima alert dari SIEM: "Brute force login attempt: 150 failed logins dari IP 203.0.113.55 dalam 5 menit ke server keuangan". Apa tindakan PERTAMA yang harus dilakukan?',
      type: 'multiple-choice',
      options: [
        'Langsung blokir IP 203.0.113.55 di firewall tanpa investigasi lebih lanjut',
        'Eskalasi langsung ke Tier 3 dan minta mereka melakukan reverse engineering malware',
        'Verifikasi alert dengan memeriksa log server keuangan, cek apakah ada login sukses, kategorikan severity, lalu dokumentasikan di ticketing system',
        'Hubungi karyawan yang menggunakan server tersebut dan tanya apakah mereka lupa password',
      ],
      answer:
        'Verifikasi alert dengan memeriksa log server keuangan, cek apakah ada login sukses, kategorikan severity, lalu dokumentasikan di ticketing system',
    },
    {
      id: 3,
      question:
        'Ransomware WannaCry menyebar dengan mengeksploitasi kerentanan pada protokol apa dan di sistem operasi apa?',
      type: 'multiple-choice',
      options: [
        'HTTP/HTTPS pada semua versi Windows menggunakan kerentanan EternalBlue',
        'SMBv1 pada Windows XP hingga Windows 7/8/2008 menggunakan exploit EternalBlue (MS17-010)',
        'RDP (Remote Desktop Protocol) pada Windows Server 2012/2016 menggunakan BlueKeep exploit',
        'DNS Protocol pada Windows Server 2008 menggunakan kerentanan SIGRed',
      ],
      answer:
        'SMBv1 pada Windows XP hingga Windows 7/8/2008 menggunakan exploit EternalBlue (MS17-010)',
    },
    {
      id: 4,
      question: 'Dalam MITRE ATT&CK Framework, taktik "Privilege Escalation" bertujuan untuk:',
      type: 'multiple-choice',
      options: [
        'Mendapatkan akses pertama ke sistem target melalui berbagai vektor serangan',
        'Mendapatkan hak akses atau izin yang lebih tinggi dari yang seharusnya dimiliki',
        'Menghapus jejak serangan dan menghindari deteksi oleh sistem keamanan',
        'Mengumpulkan informasi tentang infrastruktur dan karyawan organisasi target sebelum menyerang',
      ],
      answer: 'Mendapatkan hak akses atau izin yang lebih tinggi dari yang seharusnya dimiliki',
    },
    {
      id: 5,
      question:
        'Manakah kombinasi tools yang paling tepat untuk SOC Tier 1 Analyst dalam melakukan monitoring dan triage alert?',
      type: 'multiple-choice',
      options: [
        'IDA Pro + Ghidra + Binary Ninja (reverse engineering tools)',
        'SIEM + Ticketing System + EDR Dashboard + Threat Intelligence Feed',
        'Metasploit + Burp Suite + Nmap (penetration testing tools)',
        'AutoCAD + Microsoft Project + Visio (diagramming tools)',
      ],
      answer: 'SIEM + Ticketing System + EDR Dashboard + Threat Intelligence Feed',
    },
    {
      id: 6,
      question:
        'Serangan yang mengeksploitasi kepercayaan pengguna dengan menyamar sebagai entitas tepercaya melalui email disebut:',
      type: 'multiple-choice',
      options: [
        'SQL Injection — menyisipkan perintah SQL berbahaya ke database',
        'Cross-Site Scripting (XSS) — menyisipkan skrip berbahaya ke halaman web',
        'Phishing — email palsu yang meniru entitas tepercaya untuk mencuri kredensial atau menginstal malware',
        'Man-in-the-Middle — menyadap komunikasi antara dua pihak yang saling berkomunikasi',
      ],
      answer:
        'Phishing — email palsu yang meniru entitas tepercaya untuk mencuri kredensial atau menginstal malware',
    },
    {
      id: 7,
      question:
        'MTTD (Mean Time to Detect) adalah salah satu KPI kritis SOC. Berdasarkan IBM Security Report 2023, rata-rata MTTD untuk data breach adalah:',
      type: 'multiple-choice',
      options: [
        'Kurang dari 1 hari — sistem modern sangat cepat mendeteksi breach',
        'Sekitar 3-5 hari — deteksi terjadi saat monitoring mingguan dilakukan',
        '204 hari (sekitar 7 bulan) — penyerang rata-rata tersembunyi sangat lama sebelum terdeteksi',
        'Tepat 30 hari — sesuai standar regulasi yang mewajibkan laporan bulanan',
      ],
      answer:
        '204 hari (sekitar 7 bulan) — penyerang rata-rata tersembunyi sangat lama sebelum terdeteksi',
    },
    {
      id: 8,
      question:
        'Sebuah perusahaan mengalami DDoS selama 4 jam sehingga website e-commerce-nya tidak dapat diakses. Pilar CIA Triad mana yang paling terdampak?',
      type: 'multiple-choice',
      options: [
        'Confidentiality — karena data pelanggan mungkin bocor selama serangan',
        'Integrity — karena data di database mungkin dimanipulasi selama downtime',
        'Availability — karena layanan tidak dapat diakses oleh pengguna yang berwenang',
        'Non-repudiation — karena log transaksi mungkin hilang selama serangan',
      ],
      answer: 'Availability — karena layanan tidak dapat diakses oleh pengguna yang berwenang',
    },
    {
      id: 9,
      question:
        'Jelaskan perbedaan mendasar antara Cyber Kill Chain dan MITRE ATT&CK Framework! Kapan sebaiknya menggunakan masing-masing framework, dan apa keterbatasan Kill Chain dalam konteks ancaman modern?',
      type: 'essay',
      answer:
        'Cyber Kill Chain (Lockheed Martin, 2011) adalah model linear 7-tahap yang menggambarkan serangan dari awal hingga akhir secara berurutan. Kill Chain lebih mudah dipahami dan cocok untuk komunikasi ke manajemen. Keterbatasan: terlalu linear (penyerang modern tidak selalu mengikuti urutan ini), tidak mencakup insider threat yang dimulai dari dalam, dan tidak granular (tidak menjelaskan teknik spesifik). MITRE ATT&CK adalah knowledge base komprehensif dengan 14 taktik, ratusan teknik, dan sub-teknik berdasarkan observasi nyata. ATT&CK lebih cocok untuk: membangun use case deteksi SIEM, melakukan threat hunting proaktif, mengevaluasi coverage deteksi SOC (gap analysis), dan berkomunikasi dengan komunitas threat intelligence. Kill Chain lebih cocok untuk: menjelaskan konsep serangan ke audience non-teknis, merencanakan defense-in-depth, dan memahami fase serangan secara keseluruhan. Framework terbaik adalah menggunakan keduanya secara komplementer: Kill Chain untuk narasi keseluruhan, ATT&CK untuk detail teknis dan deteksi.',
    },
    {
      id: 10,
      question:
        'Anda adalah SOC Tier 2 Analyst yang menginvestigasi alert: malware ditemukan di komputer seorang akuntan. Malware menggunakan teknik process injection untuk menyembunyikan diri di dalam proses svchost.exe yang legitimate. Jelaskan langkah investigasi forensik yang Anda lakukan secara berurutan!',
      type: 'essay',
      answer:
        'Langkah investigasi: 1) CONTAINMENT: Isolasi endpoint dari jaringan secara logis (disable NIC atau pindahkan ke VLAN karantina) untuk mencegah lateral movement, sambil tetap menjaga sistem hidup untuk live forensics. 2) LIVE FORENSICS: Dump memori RAM menggunakan Volatility atau WinPmem — process injection meninggalkan artefak di memori yang hilang saat shutdown. Analisis dengan "malfind", "pstree", "netscan" untuk identifikasi proses mencurigakan. 3) LOG REVIEW: Periksa Windows Event Log (Event ID 4688 process creation, 4663 file access, 7045 new service) dan EDR telemetry untuk timeline aktivitas malware. 4) INDICATOR COLLECTION: Ekstrak IOC (hash MD5/SHA256 malware, IP C2, domain, registry key, mutex) menggunakan tools seperti Process Monitor, Autoruns, atau EDR. 5) THREAT INTEL: Cek IOC di VirusTotal, MalwareBazaar, dan platform threat intel internal. Identifikasi keluarga malware dan aktor ancaman yang terkait. 6) SCOPE ASSESSMENT: Cari IOC yang sama di seluruh jaringan melalui SIEM untuk menentukan apakah komputer lain sudah terinfeksi (blast radius). 7) ERADICATION: Hapus malware menggunakan EDR, restore dari clean backup jika diperlukan. 8) DOKUMENTASI: Tulis laporan insiden lengkap dengan timeline, IOC, dan rekomendasi.',
    },
    {
      id: 11,
      question:
        'Mengapa patch management yang buruk menjadi penyebab utama banyak insiden keamanan besar (termasuk WannaCry)? Jelaskan tantangan implementasi patch management di organisasi besar dan bagaimana SOC dapat membantu proses ini!',
      type: 'essay',
      answer:
        'Patch management yang buruk terjadi karena beberapa tantangan: 1) Kompleksitas: organisasi besar bisa memiliki ribuan server, workstation, dan perangkat jaringan dengan berbagai OS dan versi — mengidentifikasi semua aset (asset inventory) sudah sulit, apalagi memastikan semuanya dipatch. 2) Uji kompatibilitas: patch baru bisa mempengaruhi aplikasi bisnis kritis — testing diperlukan sebelum deployment ke production, membutuhkan waktu dan environment testing yang tersedia. 3) Window maintenance terbatas: sistem production (terutama manufaktur, rumah sakit, atau perbankan) sering beroperasi 24/7 dan hanya bisa di-restart pada jadwal tertentu. 4) Resistensi bisnis: business unit sering menolak downtime untuk patching karena mengganggu operasional. 5) Legacy systems: beberapa sistem lama tidak mendapat patch dari vendor (end-of-life) dan sulit diganti. Peran SOC dalam patch management: mengoperasikan vulnerability scanner (Nessus, OpenVAS) untuk identifikasi CVE aktif di jaringan, memprioritaskan patch berdasarkan CVSS score dan exploitation in the wild (apakah ada exploit aktif?), memberikan threat intelligence ke tim IT tentang CVE yang sedang dieksploitasi di industri yang sama, dan memantau apakah patch sudah diterapkan melalui compliance dashboard. Solusi: automated patch management tools (WSUS, SCCM, Ansible), penetration testing untuk verifikasi patch, dan kebijakan SLA patching berdasarkan severity (critical CVE: 7 hari, high: 30 hari, medium: 90 hari).',
    },
    {
      id: 12,
      question:
        'Jelaskan konsep "Defense in Depth" dan bagaimana konsep ini berhubungan dengan SOC! Berikan contoh implementasi berlapis untuk melindungi server database yang menyimpan data keuangan sensitif.',
      type: 'essay',
      answer:
        'Defense in Depth adalah strategi keamanan berlapis yang berasumsi bahwa setiap lapisan pertahanan tunggal pasti bisa ditembus — oleh karena itu diperlukan multiple layers sehingga penyerang harus menembus semua lapisan untuk mencapai target. Konsep ini berasal dari strategi militer. Hubungan dengan SOC: SOC adalah lapisan detektif (detective control) dalam Defense in Depth — SOC mendeteksi ketika lapisan preventif sudah berhasil ditembus. Semakin banyak lapisan, semakin banyak sinyal yang tersedia untuk SOC mendeteksi intrusi lebih awal. Implementasi berlapis untuk server database keuangan: LAYER 1 - Perimeter: Firewall membatasi akses hanya dari server aplikasi tertentu; IPS mendeteksi SQL injection di traffic jaringan. LAYER 2 - Network: VLAN terpisah untuk database; Network Access Control (NAC) memvalidasi endpoint sebelum terhubung. LAYER 3 - Host: OS hardened (CIS Benchmark); Patch terbaru; Antivirus/EDR aktif; Logging semua akses. LAYER 4 - Application: Prepared statements untuk mencegah SQL injection; Application-level firewall; API authentication OAuth 2.0. LAYER 5 - Database: Autentikasi kuat (sertifikat); Database Activity Monitoring (DAM) alert query anomali; Kolom sensitif terenkripsi (TDE); Minimal privilege per akun aplikasi. LAYER 6 - Data: Enkripsi at-rest (AES-256); Backup terenkripsi offline; Data Loss Prevention (DLP). LAYER 7 - Human: Security awareness training; Segregation of duties (DBA tidak bisa approve perubahan sendiri); Periodic access review. SOC memantau log dari semua layer ini melalui SIEM untuk mendeteksi serangan yang menembus satu atau lebih lapisan.',
    },
    {
      id: 13,
      question:
        'Seorang analis menemukan bahwa sebuah proses di server mencoba koneksi keluar ke IP address di luar negeri setiap 60 detik. Proses ini memiliki nama "svchost.exe" namun berjalan dari path C:\\Temp\\svchost.exe. Apa yang dapat disimpulkan dan langkah apa yang diambil?',
      type: 'essay',
      answer:
        'Kesimpulan analisis: Ini sangat mencurigakan dan hampir dipastikan adalah malware. Indikator: 1) Path tidak wajar — svchost.exe legitimate selalu berada di C:\\Windows\\System32\\, bukan C:\\Temp\\. Path Temp adalah teknik penyerang untuk meniru nama proses sistem (masquerading, MITRE T1036). 2) Koneksi periodik ke luar negeri setiap 60 detik menunjukkan C2 beacon — komunikasi reguler ke Command & Control server untuk menerima perintah. Beacon jitter (variasi interval) sering digunakan untuk menghindari deteksi. 3) Penggunaan nama svchost.exe adalah teknik defense evasion klasik. Langkah yang diambil: 1) JANGAN restart atau shutdown dulu — live forensics lebih dahulu. 2) Isolasi jaringan endpoint secara logis. 3) Capture memori RAM segera (Volatility/Magnet RAM Capture). 4) Rekam koneksi jaringan aktif: netstat -ano | findstr [PID proses]. 5) Hash file: Get-FileHash C:\\Temp\\svchost.exe dan submit ke VirusTotal. 6) Periksa parent process — proses apa yang men-spawn svchost.exe palsu ini? 7) Cek persistence: Autoruns, Task Scheduler, Registry Run Keys, Services. 8) Catat IP tujuan sebagai IOC dan blokir di firewall. 9) Cari IOC yang sama di endpoint lain via SIEM. 10) Eskalasi ke Tier 3 jika ada indikasi APT atau lateral movement. 11) Dokumentasikan semua temuan dengan timestamp untuk laporan dan potensi tindakan hukum.',
    },
  ],

  // ──────────────────────────────────────────────
  // VIDEO RESOURCES
  // ──────────────────────────────────────────────
  videoResources: [
    {
      title: 'Apa itu SOC? Security Operations Center Explained',
      youtubeId: 'nkUtGy-hr1I',
      description:
        'Penjelasan komprehensif tentang SOC: struktur tier, tools yang digunakan, dan bagaimana SOC bekerja dalam merespons insiden keamanan siber.',
      language: 'en',
      duration: '12:34',
    },
    {
      title: 'CIA Triad - Pengenalan Keamanan Informasi',
      youtubeId: '6vMmB2LBtwQ',
      description:
        'Penjelasan tentang CIA Triad (Confidentiality, Integrity, Availability) sebagai fondasi keamanan informasi, dengan contoh-contoh nyata.',
      language: 'en',
      duration: '8:15',
    },
    {
      title: 'Cyber Kill Chain Explained',
      youtubeId: 'II91fiUax2g',
      description:
        'Memahami 7 tahapan serangan siber menggunakan Cyber Kill Chain Lockheed Martin dan cara menghentikan serangan di setiap tahap.',
      language: 'en',
      duration: '10:42',
    },
    {
      title: 'MITRE ATT&CK Framework Complete Guide',
      youtubeId: 'DFdBHFEWgCk',
      description:
        'Panduan lengkap MITRE ATT&CK: cara menggunakan Navigator, memahami taktik dan teknik, dan menerapkannya untuk threat hunting di SOC.',
      language: 'en',
      duration: '22:18',
    },
    {
      title: 'Pengenalan Keamanan Siber untuk Pemula (Bahasa Indonesia)',
      youtubeId: 'inWWhr5tnEA',
      description:
        'Pengenalan keamanan siber dalam Bahasa Indonesia: ancaman, profesi, dan karir di bidang keamanan informasi untuk mahasiswa baru.',
      language: 'id',
      duration: '15:50',
    },
  ],
};
