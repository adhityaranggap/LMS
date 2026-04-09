import type { ModuleData, CaseStudyVariant } from '../module-types';

export const module14: ModuleData & { caseStudyPool: CaseStudyVariant[] } = {
  id: 14,
  title: "Alert Evaluation",
  description: "Evaluasi Alert dan Bekerja dengan Data Keamanan Jaringan di SOC",
  iconName: "FileCode",
  theory: [
    {
      title: "Alert Classification: True Positive, False Positive, True Negative, False Negative",
      content: "Setiap alert yang dihasilkan oleh sistem keamanan (IDS, SIEM, AV) harus diklasifikasikan oleh SOC analyst untuk menentukan apakah alert tersebut mencerminkan kejadian nyata atau tidak. Empat klasifikasi dasar membentuk 'confusion matrix' deteksi keamanan: True Positive (TP), False Positive (FP), True Negative (TN), dan False Negative (FN). Memahami keempat klasifikasi ini dan dampaknya sangat krusial karena error dalam klasifikasi memiliki konsekuensi yang berbeda — FP membuang waktu analyst dan menyebabkan alert fatigue, sedangkan FN jauh lebih berbahaya karena insiden nyata terlewat dan penyerang dapat beroperasi tanpa terdeteksi.",
      table: {
        caption: "Confusion Matrix Klasifikasi Alert Keamanan",
        headers: ["Klasifikasi", "Kondisi Nyata", "Alert Dihasilkan?", "Deskripsi", "Dampak", "Contoh Skenario"],
        rows: [
          ["True Positive (TP)", "Serangan NYATA terjadi", "YA", "Sistem mendeteksi serangan yang memang terjadi — ideal, deteksi yang benar", "BAIK — insiden dapat ditangani", "IDS alert XSS → investigasi mengonfirmasi serangan XSS aktif"],
          ["False Positive (FP)", "TIDAK ada serangan", "YA", "Sistem menghasilkan alert padahal tidak ada serangan nyata", "Alert Fatigue, produktivitas analyst turun", "IDS alert port scan → ternyata IT team sedang monitoring rutin"],
          ["True Negative (TN)", "TIDAK ada serangan", "TIDAK", "Sistem tidak menghasilkan alert dan memang tidak ada serangan", "BAIK — operasi normal berjalan efisien", "Traffic normal antara server tidak menghasilkan alert"],
          ["False Negative (FN)", "Serangan NYATA terjadi", "TIDAK", "Sistem gagal mendeteksi serangan yang benar-benar terjadi — miss detection", "SANGAT BERBAHAYA — penyerang tidak terdeteksi", "APT menggunakan HTTPS terenkripsi, IDS tidak dapat inspeksi payload"]
        ]
      },
      note: "False Negative (FN) adalah worst-case scenario dalam keamanan siber karena penyerang dapat beroperasi bebas. Namun, terlalu banyak mengurangi FN (meningkatkan sensitivity) biasanya meningkatkan FP. Keseimbangan antara sensitivity (recall) dan precision adalah tuning yang terus-menerus dalam SOC.",
      noteType: "danger"
    },
    {
      title: "Alert Triage Process: Langkah-Langkah SOC Tier 1",
      content: "Alert Triage adalah proses rapid assessment yang dilakukan Tier 1 SOC Analyst untuk menentukan apakah sebuah alert memerlukan investigasi lebih lanjut atau dapat di-dismiss. Triage yang efektif sangat penting dalam SOC karena volume alert yang tinggi membuat tidak mungkin setiap alert dianalisis secara mendalam. Tujuan triage adalah memisahkan signal (ancaman nyata) dari noise (false positive) secepat mungkin sehingga insiden kritis dapat dieskalasi ke Tier 2 tanpa penundaan.",
      example: {
        title: "Contoh Alur Triage: Alert Brute Force SSH dari IP Asing",
        steps: [
          "STEP 1 — Initial Alert Review (2 menit): Baca alert dari SIEM: 'SSH Brute Force — 500 failed attempts dari IP 45.152.66.119 ke server db-prod-01 dalam 5 menit'. Catat: source IP, destination, waktu, severity.",
          "STEP 2 — Context Enrichment (3 menit): Query threat intel untuk IP 45.152.66.119 → VirusTotal/AbuseIPDB: IP ini dilaporkan 847 kali sebagai scanner/bruteforcer. Geolocation: Rusia. Tidak ada bisnis relationship dengan Rusia.",
          "STEP 3 — Asset Criticality Check (1 menit): 'db-prod-01' adalah production database server (kategori CRITICAL dalam CMDB). Bukan server test/dev.",
          "STEP 4 — Verify Attack Success (2 menit): Cek log auth server — apakah ada Event ID 4624 (login success) dari IP tersebut? Hasil: tidak ada login sukses. SSH rate limiting aktif.",
          "STEP 5 — Correlation Check (2 menit): Apakah IP ini muncul di log lain? → Cek firewall, proxy, DNS. Tidak ditemukan koneksi lain dari IP ini.",
          "STEP 6 — Classification Decision (1 menit): TP (True Positive) — brute force SSH nyata terjadi. Namun IMPACT rendah karena tidak berhasil login dan IP sudah di-block oleh firewall setelah threshold.",
          "STEP 7 — Action & Documentation (5 menit): Block IP di firewall (jika belum). Tambahkan ke blacklist. Dokumentasikan di ticketing system. DISMISS (tidak perlu eskalasi ke Tier 2 karena attack gagal).",
          "TOTAL WAKTU TRIAGE: ~16 menit — alert selesai diproses dengan keputusan terdokumentasi"
        ],
        result: "Alert diklasifikasikan sebagai TP-Low Impact. Tindakan: IP diblokir, ticket dibuat, tidak perlu eskalasi. SOC dapat melanjutkan ke alert berikutnya."
      },
      keyPoints: [
        "Target waktu triage Tier 1: 15-30 menit per alert untuk alert standar",
        "Gunakan CMDB (Configuration Management Database) untuk memeriksa kritikalitas aset target",
        "Enrichment tools: VirusTotal, AbuseIPDB, Shodan, WHOIS, Geolocation API",
        "Keputusan triage: Dismiss, Monitor, Remediate, atau Escalate ke Tier 2",
        "Dokumentasikan SEMUA keputusan — termasuk dismiss — dengan alasan yang jelas",
        "Prioritas eskalasi: berdasarkan kritikalitas aset × severity × confidence level"
      ]
    },
    {
      title: "Sumber Alert: Network-based vs Host-based",
      content: "Alert keamanan dapat berasal dari berbagai sumber yang memberikan perspektif berbeda tentang aktivitas ancaman. Secara umum, sumber alert dibagi menjadi dua kategori besar: Network-based (menghasilkan alert berdasarkan analisis lalu lintas jaringan) dan Host-based (menghasilkan alert berdasarkan aktivitas pada endpoint/server individu). Masing-masing kategori memiliki kelebihan dan keterbatasan, dan penggunaan kombinasi keduanya memberikan visibilitas yang paling komprehensif — dikenal sebagai 'defense-in-depth monitoring'.",
      table: {
        caption: "Perbandingan Sumber Alert Network-based vs Host-based",
        headers: ["Aspek", "Network-based", "Host-based"],
        rows: [
          ["Contoh Tools", "NIDS (Snort, Suricata), NIPS, NetFlow Analyzer, NDR", "HIDS (OSSEC, Wazuh), EDR (CrowdStrike, Defender), AV, Auditd"],
          ["Posisi Deployment", "Inline atau span/mirror port di network choke point", "Agent di-install langsung pada setiap endpoint/server"],
          ["Visibilitas", "Seluruh traffic yang melewati sensor (lintas host)", "Hanya aktivitas pada host tempat agent terpasang"],
          ["Blind Spot", "Encrypted traffic (HTTPS/TLS tanpa decryption)", "Tidak dapat melihat traffic antar host lain"],
          ["Kelebihan", "Single sensor monitor banyak host, deteksi lateral movement", "Deteksi malware fileless, dalam-proses, modifikasi file"],
          ["Kekurangan", "Tidak melihat aktivitas dalam host (in-process)", "Tidak dapat melihat network-wide attack patterns"],
          ["Alert Types", "Port scan, DoS, network exploit, C2 beacon patterns", "Malware execution, privilege escalation, file modification"],
          ["Resource Impact", "Minimal pada host (beban di sensor terpisah)", "Konsumsi CPU/RAM pada setiap endpoint"],
          ["Scalability", "Mudah — satu sensor per network segment", "Perlu deploy agent ke ribuan endpoint"]
        ]
      },
      note: "Pendekatan terbaik adalah kombinasi NIDS + HIDS/EDR + SIEM. Network-based untuk deteksi serangan yang melewati jaringan, Host-based untuk deteksi aktivitas yang terjadi dalam endpoint, SIEM untuk korelasi dan enrichment dari semua sumber.",
      noteType: "success"
    },
    {
      title: "Alert Fatigue: Penyebab, Dampak, dan Solusi",
      content: "Alert Fatigue adalah kondisi psikologis dan operasional yang terjadi ketika SOC analyst menerima volume alert yang terlalu tinggi, menyebabkan desensitisasi — analyst mulai menganggap semua alert tidak penting atau secara otomatis men-dismiss alert tanpa analisis memadai. Alert fatigue adalah salah satu tantangan terbesar yang dihadapi SOC modern dan berkontribusi langsung pada terlewatnya insiden keamanan nyata. Studi industri menunjukkan bahwa rata-rata SOC menerima lebih dari 10.000 alert per hari, namun kurang dari 5% yang benar-benar memerlukan tindakan.",
      keyPoints: [
        "PENYEBAB 1 — Volume tinggi: IDS/SIEM dikonfigurasi dengan terlalu banyak rules yang belum dituning",
        "PENYEBAB 2 — False Positive rate tinggi: Rules tidak dikalibrasi dengan baseline lingkungan spesifik",
        "PENYEBAB 3 — Kurang konteks: Alert tidak dilengkapi informasi yang cukup untuk keputusan cepat",
        "PENYEBAB 4 — Prioritas tidak jelas: Semua alert terlihat sama pentingnya tanpa risk scoring",
        "DAMPAK 1 — Miss detection: Analyst melewatkan True Positive yang terbenam di antara False Positive",
        "DAMPAK 2 — Burnout: Analis mengalami stress tinggi dan turnover rate SOC yang tinggi (industri: 2-3 tahun average tenure)",
        "DAMPAK 3 — Mechanical dismissal: Alert di-close tanpa investigasi memadai karena tekanan volume",
        "SOLUSI 1 — Alert Tuning: Review dan suppress rules yang menghasilkan false positive secara rutin (bulanan)",
        "SOLUSI 2 — Risk-based prioritization: Kombinasikan severity alert × kritikalitas aset × threat intel context",
        "SOLUSI 3 — SOAR automation: Otomatiskan respons dan enrichment untuk alert berkepercayaan tinggi",
        "SOLUSI 4 — Alert grouping: Cluster alert terkait menjadi satu insiden/kasus daripada ribuan alert terpisah",
        "SOLUSI 5 — Shift rotation: Jadwal shift yang baik mencegah analyst kelelahan — pola 8 jam sangat disarankan"
      ]
    },
    {
      title: "Incident Response Lifecycle: 6 Tahap NIST SP 800-61",
      content: "NIST Special Publication 800-61 (Computer Security Incident Handling Guide) mendefinisikan siklus hidup incident response dalam 4 fase utama yang mencakup 6 tahap praktis. Framework ini menjadi standar industri yang diadopsi oleh sebagian besar organisasi dan SOC di seluruh dunia. Setiap tahap memiliki tujuan, aktivitas, dan output yang spesifik. Pemahaman mendalam tentang lifecycle ini memungkinkan SOC untuk merespons insiden secara sistematis, terdokumentasi, dan reproducible.",
      example: {
        title: "Contoh Timeline Insiden: Respons terhadap Ransomware yang Terdeteksi",
        steps: [
          "TAHAP 1 — PREPARATION (ongoing): Tim IR memiliki playbook ransomware, backup terverifikasi, network segmentation, EDR terpasang di semua endpoint. Latihan tabletop dilakukan 2x setahun.",
          "TAHAP 2 — IDENTIFICATION (T+0 hingga T+30 menit): SIEM alert 02:15 WIB — EDR melaporkan enkripsi massal file di workstation acctg-01. Analyst Tier 1 konfirmasi TP dalam 15 menit. Eskalasi ke IR Lead (T+20 menit). Scope awal: 1 workstation terdampak.",
          "TAHAP 3 — CONTAINMENT (T+30 menit hingga T+2 jam): Isolasi jaringan workstation acctg-01 (EDR network isolation command). Identifikasi workstation lain yang terkena dampak via lateral spread check. Total 5 workstation diisolasi. Backup server diverifikasi aman dan offline.",
          "TAHAP 4 — ERADICATION (T+2 jam hingga T+8 jam): Forensic image diambil dari semua 5 workstation yang terinfeksi. Malware sample dikirim ke sandbox analisis. Identifikasi patient zero dan vektor infeksi awal (phishing email dengan lampiran Excel). Bersihkan malware dari workstation menggunakan EDR remediation.",
          "TAHAP 5 — RECOVERY (T+8 jam hingga T+24 jam): Restore workstation dari golden image yang bersih. Restore data dari backup kemarin malam. Verifikasi integritas data. Monitoring intensif selama 72 jam pasca-recovery. Workstation kembali online secara bertahap.",
          "TAHAP 6 — LESSONS LEARNED (T+7 hari): Post-incident review meeting. Temuan: patch Excel vulnerability belum diaplikasikan (CVE dengan CVSS 7.8). Rekomendasi: emergency patching, enhanced email filtering, phishing simulation training. Laporan final disiapkan untuk manajemen dan regulator."
        ],
        result: "Total waktu dari deteksi hingga recovery: 24 jam. Dampak: 5 workstation terkena, data recovered 100% dari backup, tidak ada data yang bocor. Penyebab root: unpatched vulnerability + kurangnya email attachment scanning."
      }
    },
    {
      title: "Working with Network Security Data: Platform dan Tools",
      content: "SOC analyst modern bekerja dengan berbagai platform dan tools khusus untuk menganalisis data keamanan jaringan. Setiap tool memiliki keunggulan dalam aspek tertentu — Wireshark untuk deep packet analysis, Zeek untuk protocol analysis dan log generation, Suricata untuk real-time signature detection, dan Security Onion sebagai platform terintegrasi yang menggabungkan semua kemampuan tersebut. Memahami kapan dan bagaimana menggunakan masing-masing tool adalah keterampilan esensial SOC analyst.",
      table: {
        caption: "Platform dan Tools Analisis Data Keamanan Jaringan",
        headers: ["Tool/Platform", "Tipe", "Fungsi Utama", "Output", "Keunggulan", "Keterbatasan"],
        rows: [
          ["Wireshark", "Packet Analyzer", "Analisis paket secara interaktif pada level byte", "PCAP file, protocol dissection", "GUI intuitif, mendukung 3000+ protokol, filter BPF yang powerful", "Tidak cocok untuk high-speed networks, memerlukan PCAP file"],
          ["Zeek (Bro)", "Network Analysis Framework", "Menghasilkan structured logs dari traffic jaringan", "TSV/JSON logs: conn, dns, http, ssl, files, notice", "Analisis protocol detail, log terstruktur untuk SIEM integration, scripting", "Bukan real-time IDS, perlu skill Zeek scripting untuk kustomisasi"],
          ["Suricata", "IDS/IPS/NSM", "Signature-based detection + file extraction + protocol logging", "Alert (EVE JSON), PCAP, file extraction", "Multi-threaded performance, kompatibel rule Snort, output JSON untuk SIEM", "False positive memerlukan tuning intensif, rule management kompleks"],
          ["Security Onion", "NSM Platform", "Platform terintegrasi: NIDS + PCAP + SIEM + hunting", "Unified dashboard (Kibana/Grafana), alert queue, PCAP access", "All-in-one untuk SOC, gratis dan open-source, komunitas besar", "Resource intensif, kompleks untuk di-setup, perlu dedicated hardware"],
          ["Elastic Stack (ELK)", "Log Analytics Platform", "Ingest, index, search, visualize log dari semua sumber", "Kibana dashboards, Elasticsearch queries, Logstash pipelines", "Sangat skalabel, fleksibel, ekosistem plugin besar", "Perlu tuning performa untuk volume besar, lisensi fitur tertentu berbayar"],
          ["Arkime (Moloch)", "Full Packet Capture", "Capture, index, dan search full PCAP pada skala besar", "PCAP files dengan indexing untuk pencarian cepat", "Skalabel untuk jaringan enterprise, integrasi dengan Elasticsearch", "Storage sangat besar, perlu hardware dedicated"]
        ]
      }
    },
    {
      title: "Enhancing Analyst Work: SOAR, Playbooks, dan Automation",
      content: "Security Orchestration, Automation and Response (SOAR) adalah evolusi dari SIEM yang memungkinkan respons terhadap alert dilakukan secara otomatis atau semi-otomatis berdasarkan playbook yang telah didefinisikan. SOAR menghubungkan berbagai tools keamanan (SIEM, firewall, EDR, threat intel, ticketing) dan mengotomatiskan alur kerja respons yang repetitif, memungkinkan analyst untuk fokus pada investigasi yang memerlukan kreativitas dan keahlian manusia. Menurut Gartner, organisasi yang mengimplementasikan SOAR dapat mengurangi waktu respons insiden hingga 60% dan meningkatkan kapasitas handling analyst hingga 3x lipat.",
      keyPoints: [
        "SOAR Core Capability 1 — Orchestration: Menghubungkan dan mengkoordinasikan tools keamanan yang berbeda via API integration",
        "SOAR Core Capability 2 — Automation: Menjalankan respons otomatis berdasarkan trigger dari SIEM (isolasi host, block IP, reset password)",
        "SOAR Core Capability 3 — Response: Mengelola alur kerja investigasi dengan case management, kolaborasi tim, dan tracking",
        "Playbook: Dokumen prosedur yang mendefinisikan langkah-langkah spesifik respons untuk jenis insiden tertentu (ransomware playbook, phishing playbook, DDoS playbook)",
        "MTTD (Mean Time to Detect): Rata-rata waktu dari insiden terjadi hingga terdeteksi — SOAR membantu mengurangi ini",
        "MTTR (Mean Time to Respond): Rata-rata waktu dari deteksi hingga insiden terkontain — SOAR dapat mengurangi dari jam menjadi menit",
        "Automation tiers: Level 1 (enrichment otomatis), Level 2 (respons semi-otomatis dengan approval), Level 3 (respons fully automated untuk insiden rendah risiko)",
        "Platform SOAR populer: Splunk SOAR (Phantom), Palo Alto XSOAR (Demisto), IBM Resilient, Microsoft Sentinel + Logic Apps",
        "Risiko automation: Over-automation dapat isolasi sistem yang salah — human oversight tetap diperlukan untuk keputusan high-impact"
      ],
      note: "SOAR bukan pengganti analyst manusia, melainkan force multiplier. Keputusan yang berdampak tinggi (isolasi server produksi, komunikasi kepada pelanggan, pelaporan kepada regulator) harus selalu melibatkan human judgment.",
      noteType: "info"
    }
  ],
  lab: {
    title: "Lab 14: Alert Triage, Evaluasi, dan Incident Report",
    downloads: [
      {
        name: "CyberOps Workstation VM",
        url: "https://www.netacad.com/",
        description: "VM Linux dengan Snort, Wireshark, dan sample alert files untuk praktik triage."
      },
      {
        name: "Sample Snort Alert File",
        url: "https://github.com/security-onion-solutions/security-onion",
        description: "File alert.log Snort yang mengandung berbagai jenis alert untuk latihan evaluasi."
      },
      {
        name: "Incident Report Template",
        url: "https://www.sans.org/score/incident-forms/",
        description: "Template laporan insiden standar industri SANS untuk penulisan laporan akhir."
      }
    ],
    steps: [
      {
        title: "Langkah 1: Alert Triage — Initial Assessment",
        description: "Lakukan initial assessment terhadap alert yang masuk dari sistem IDS. Baca setiap alert dengan seksama: identifikasi source IP, destination IP, port, protocol, timestamp, dan nama signature yang dipicu. Isi Alert Triage Form untuk setiap alert dengan informasi dasar. Tentukan severity awal berdasarkan kritikalitas aset tujuan (destination) yang ada dalam CMDB simulasi yang disediakan.",
        hint: "Gunakan framework prioritisasi: Severity = Alert Severity × Asset Criticality × Confidence Level. Asset criticality: Critical (database, auth server) = 3, High (web server, email) = 2, Medium (workstation) = 1, Low (test/dev) = 0.5. Buat spreadsheet triage form dengan kolom: Alert ID, Timestamp, Src IP, Dst IP, Signature, Initial Severity (1-5), Asset Criticality, Calculated Priority.",
        screenshotNote: "Screenshot triage form yang telah diisi untuk minimal 5 alert dari sample Snort alert file. Tampilkan jelas kolom prioritas yang sudah dihitung."
      },
      {
        title: "Langkah 2: Alert Validation — Cek Snort Alerts",
        description: "Validasi alert yang diprioritaskan dari langkah sebelumnya dengan memeriksa file alert Snort secara langsung menggunakan command line. Periksa apakah alert menunjukkan pola yang konsisten dengan serangan nyata atau kemungkinan false positive. Ambil 3 alert dengan prioritas tertinggi untuk dianalisis lebih mendalam.",
        command: "# Lihat alert Snort terbaru:\ntail -50 /var/log/snort/alert | grep -A 5 'Priority: 1\\|Priority: 2'\n\n# Hitung frekuensi alert per signature:\ngrep '\\[\\*\\*\\]' /var/log/snort/alert | sort | uniq -c | sort -rn | head -20\n\n# Lihat detail alert tertentu berdasarkan SID:\ngrep -A 10 'SID:1000001' /var/log/snort/alert",
        expectedOutput: "[**] [1:1000002:1] SSH Brute Force Attempt [**]\n[Priority: 1]\n01/15-02:17:45.123456 45.152.66.119:45123 -> 10.0.1.50:22\nTCP TTL:112 TOS:0x0 ID:54321 IpLen:20 DgmLen:60 DF\n******S* Seq: 0x12345678  Ack: 0x0  Win: 0xFAF0  TcpLen: 40",
        hint: "Alert Snort format: [**] menunjukkan baris header alert, [Priority: N] menunjukkan severity, baris ketiga adalah detail paket (src -> dst). Evaluasi setiap alert: apakah IP sumber dikenal? Apakah ini pattern serangan nyata atau dapat dijelaskan sebagai aktivitas normal?",
        screenshotNote: "Screenshot output grep yang menampilkan minimal 3 alert prioritas tinggi dengan detail paket. Annotation: identifikasi mana yang menurut Anda TP dan mana FP, beserta alasannya."
      },
      {
        title: "Langkah 3: Source Investigation — WHOIS dan Geolocation",
        description: "Investigasi source IP address dari alert prioritas tinggi menggunakan tools WHOIS dan geolocation. Informasi tentang siapa yang memiliki IP tersebut, dari negara mana, dan apakah ada reputasi negatif sangat membantu dalam menentukan apakah alert adalah True Positive atau False Positive. Lakukan enrichment untuk minimal 3 IP dari alert yang telah ditriage.",
        command: "# WHOIS lookup — informasi pemilik IP:\nwhois 45.152.66.119\n\n# Geolocation menggunakan geoiplookup (install jika belum ada):\nsudo apt-get install geoip-bin -y\ngeoiplookup 45.152.66.119\n\n# Cek reputasi IP di database online:\ncurl -s 'https://api.abuseipdb.com/api/v2/check?ipAddress=45.152.66.119&maxAgeInDays=90' \\\n  -H 'Key: YOUR_API_KEY' \\\n  -H 'Accept: application/json' | python3 -m json.tool\n\n# Alternatif gratis — cek di multiple threat intel:\ncurl -s 'https://ipinfo.io/45.152.66.119/json' | python3 -m json.tool",
        expectedOutput: "# WHOIS Output:\nNetRange: 45.152.64.0 - 45.152.67.255\nOrganization: Hosting Provider XYZ\nOrgName: AS Company Inc.\nCountry: RU\n\n# GeoIP:\nGeoIP Country Edition: RU, Russia\n\n# ipinfo.io:\n{\n  \"ip\": \"45.152.66.119\",\n  \"country\": \"RU\",\n  \"org\": \"AS12345 Bad Actor Hosting\",\n  \"abuse\": { \"score\": 100, \"reports\": 847 }\n}",
        hint: "Informasi yang relevan: negara asal (apakah ada bisnis relationship?), nama organisasi (hosting provider reputasi buruk?), abuse confidence score (semakin tinggi semakin mencurigakan). Kombinasikan dengan VirusTotal (https://virustotal.com) dan Shodan (https://shodan.io) untuk profile lengkap.",
        screenshotNote: "Screenshot hasil WHOIS dan geolocation untuk setiap IP yang diinvestigasi. Buat tabel summary: IP, Negara, Organisasi, Abuse Score, Kesimpulan (Malicious/Benign/Unknown)."
      },
      {
        title: "Langkah 4: Payload Analysis dengan tcpdump",
        description: "Analisis payload dari paket yang terkait dengan alert menggunakan tcpdump untuk melihat konten sebenarnya dari serangan. Analisis payload memberikan bukti konkret tentang niat penyerang dan membantu mengonfirmasi apakah alert adalah True Positive. Dalam latihan ini, gunakan sample PCAP file yang disediakan.",
        command: "# Baca PCAP file dan tampilkan dengan ASCII readable:\ntcpdump -r /home/analyst/lab14_sample.pcap -A -n | head -100\n\n# Filter berdasarkan IP sumber mencurigakan:\ntcpdump -r /home/analyst/lab14_sample.pcap -A src host 45.152.66.119\n\n# Tampilkan konten HTTP request:\ntcpdump -r /home/analyst/lab14_sample.pcap -A tcp port 80 | grep -A 20 'GET\\|POST'\n\n# Capture live traffic pada interface eth0 (untuk simulasi):\nsudo tcpdump -i eth0 -n -A -s 0 'tcp port 22 or tcp port 80' 2>/dev/null | head -50",
        expectedOutput: "reading from file lab14_sample.pcap, link-type EN10MB (Ethernet)\n02:17:45.123456 IP 45.152.66.119.45123 > 10.0.1.50.22: Flags [S]\n...\nGET /wp-admin/admin-ajax.php?action=UNION%20SELECT%201,2,user(),4,5--+ HTTP/1.1\nHost: 10.0.1.100\nUser-Agent: sqlmap/1.7.2#stable\nAccept: */*",
        hint: "Flag -A menampilkan payload dalam ASCII. Flag -n mencegah resolusi nama (lebih cepat). Flag -s 0 capture full packet size. Perhatikan konten payload: apakah ada SQL injection strings, shell commands, encoded payloads, atau indicators lain dari serangan?",
        screenshotNote: "Screenshot output tcpdump yang menampilkan payload mencurigakan. Highlight atau annotation pada bagian payload yang mengkonfirmasi serangan (contoh: SQL injection string, malicious command)."
      },
      {
        title: "Langkah 5: Related Events Correlation",
        description: "Cari event lain yang terkait dengan insiden yang sedang diinvestigasi untuk memahami scope penuh serangan. Korelasi event memungkinkan analyst membangun gambar lengkap: dari mana serangan dimulai, host mana yang terdampak, dan apa yang dilakukan penyerang. Gunakan IP attacker yang ditemukan di langkah sebelumnya untuk mencari jejak di semua log yang tersedia.",
        command: "# Cari semua event dari IP attacker di berbagai log:\nATTACKER_IP=\"45.152.66.119\"\n\n# 1. Cari di auth log:\ngrep $ATTACKER_IP /var/log/auth.log | tail -20\n\n# 2. Cari di Snort alerts:\ngrep $ATTACKER_IP /var/log/snort/alert | grep -v '^$' | tail -20\n\n# 3. Cari di syslog:\ngrep $ATTACKER_IP /var/log/syslog | tail -10\n\n# 4. Cari di web access log (jika ada):\ngrep $ATTACKER_IP /var/log/apache2/access.log 2>/dev/null | wc -l\n\n# 5. Tampilkan semua events sorted by time:\n(grep $ATTACKER_IP /var/log/auth.log; grep $ATTACKER_IP /var/log/snort/alert) | sort -k1,3",
        hint: "Perhatikan: apakah attacker IP sama menyerang port atau service lain? Apakah ada IP lain yang berperilaku serupa (mungkin bagian dari botnet yang sama)? Apakah ada indikasi serangan berhasil (login success setelah banyak failure)?",
        screenshotNote: "Screenshot hasil korelasi dari multiple log sources. Buat tabel: Log Source, Jumlah Event dari Attacker IP, Event Paling Mencurigakan, Waktu Pertama/Terakhir Aktivitas."
      },
      {
        title: "Langkah 6: Timeline Construction",
        description: "Susun timeline kronologis insiden berdasarkan semua evidence yang telah dikumpulkan. Timeline yang akurat sangat penting untuk incident response — membantu memahami urutan kejadian, menentukan titik awal kompromi (patient zero), dan mengidentifikasi apa yang harus diperbaiki. Format timeline: Timestamp | Event | Source Log | Significance.",
        command: "# Gabungkan semua log yang relevan dan sort berdasarkan waktu untuk membuat timeline:\nATTACKER_IP=\"45.152.66.119\"\nTARGET_IP=\"10.0.1.50\"\n\n# Buat timeline gabungan:\n(\n  grep -E \"$ATTACKER_IP|$TARGET_IP\" /var/log/auth.log | \\\n    awk '{print $1, $2, $3, \"[AUTH]\", $0}' | head -20;\n  grep -E \"$ATTACKER_IP|$TARGET_IP\" /var/log/snort/alert | \\\n    grep -v '^$' | awk '{print \"[IDS]\", $0}' | head -20;\n) | sort | column -t -s ' ' | head -40\n\n# Simpan timeline ke file:\necho \"=== INCIDENT TIMELINE ==\" > /tmp/incident_timeline.txt\necho \"Generated: $(date)\" >> /tmp/incident_timeline.txt\necho \"\" >> /tmp/incident_timeline.txt",
        hint: "Timeline harus mencakup: T-0 (awal serangan pertama terdeteksi), T+N (setiap event signifikan), dan catatan apakah penyerang berhasil atau tidak di setiap tahap. Gunakan spreadsheet Excel/Google Sheets untuk timeline yang lebih rapi dengan kolom terstruktur.",
        screenshotNote: "Screenshot atau file timeline yang telah disusun, menampilkan minimal 8-10 event dalam urutan kronologis. Timeline harus dengan jelas menunjukkan progression serangan."
      },
      {
        title: "Langkah 7: Classification & Severity Assignment",
        description: "Berdasarkan semua analisis yang telah dilakukan (triage, payload analysis, correlation, timeline), lakukan klasifikasi final insiden dan tetapkan severity level. Klasifikasi insiden yang tepat menentukan prioritas respons, eskalasi yang diperlukan, dan compliance reporting. Gunakan framework klasifikasi NIST atau VERIS (Vocabulary for Event Recording and Incident Sharing).",
        hint: "Klasifikasi NIST: Category (CAT) 1 = Unauthorized Access, CAT 2 = Denial of Service, CAT 3 = Malicious Code, CAT 4 = Improper Usage, CAT 5 = Scans/Probes/Attempted Access, CAT 6 = Investigation. Severity: Critical (aktif breach data sensitif), High (kompromi berhasil tanpa data loss), Medium (percobaan gagal pada sistem kritis), Low (percobaan gagal pada sistem non-kritis). Dokumentasikan justifikasi untuk setiap keputusan klasifikasi.",
        screenshotNote: "Screenshot dokumen classification decision yang mencakup: NIST Category, Severity Level, Justifikasi (referensi ke evidence), Apakah perlu eskalasi, Apakah ada compliance reporting requirement.",
        warningNote: "Hindari under-classification (merendahkan severity) karena tekanan waktu. Setiap keputusan harus didasarkan pada evidence. Jika ragu, konsultasikan dengan Tier 2 atau ikuti prinsip 'when in doubt, escalate'."
      },
      {
        title: "Langkah 8: Incident Report Writing",
        description: "Tulis laporan insiden lengkap menggunakan template standar. Laporan insiden yang baik adalah dokumen yang dapat dipahami oleh dua audiens yang berbeda: manajemen non-teknis (Executive Summary) dan tim teknis untuk tindak lanjut (Technical Details). Laporan juga berfungsi sebagai rekaman historis untuk lessons learned dan bukti forensik jika diperlukan untuk proses hukum.",
        hint: "Template Incident Report mencakup: (1) Header: Nomor Insiden, Tanggal/Jam, Reporter, Status. (2) Executive Summary (max 1 halaman): Deskripsi insiden dalam bahasa bisnis, dampak bisnis, tindakan yang telah diambil, status saat ini. (3) Timeline: Tabel kronologis event. (4) Technical Analysis: Temuan teknis detail (IoC, attack vector, scope). (5) Impact Assessment: Sistem terdampak, data terekspos?, estimasi kerugian. (6) Response Actions: Langkah yang sudah diambil. (7) Recommendations: Tindakan jangka pendek dan panjang untuk mencegah recurrence. (8) Appendix: Evidence (screenshot, log excerpts, PCAP references).",
        screenshotNote: "Screenshot halaman Executive Summary dari laporan insiden yang telah ditulis. Laporan final harus minimal 5 halaman dan dikirim dalam format PDF.",
        warningNote: "Laporan insiden adalah dokumen legal yang mungkin digunakan dalam proses hukum atau audit regulasi. Pastikan semua fakta akurat, tidak ada spekulasi yang disajikan sebagai fakta, dan semua tindakan yang diambil terdokumentasi dengan timestamp yang tepat."
      }
    ],
    deliverable: "Laporan Insiden Lengkap dalam format PDF mencakup: (1) Alert Triage Form untuk 5 alert (spreadsheet/tabel), (2) Hasil WHOIS/Geolocation untuk 3 IP source, (3) Screenshot payload analysis dari tcpdump, (4) Tabel korelasi event multi-source, (5) Timeline insiden kronologis (minimal 8 event), (6) Dokumen klasifikasi & severity assignment dengan justifikasi, (7) Incident Report lengkap menggunakan template (min. 5 halaman). Semua dikumpulkan via LMS dalam 1 minggu setelah praktikum."
  },
  caseStudy: {
    title: "Investigasi Alert Triage pada Insiden Multi-Vector Bank",
    scenario: "SOC Bank Nusantara Mandiri menerima 47 alert dalam satu jam pada dini hari yang melibatkan sumber berbeda: anomali login dari IP asing, traffic HTTPS besar ke server yang tidak dikenal, dan modifikasi scheduled task pada beberapa workstation. Tim Tier 1 SOC harus melakukan triage, menentukan mana yang merupakan insiden nyata, dan memutuskan eskalasi.",
    questions: [
      "Bagaimana proses triage 47 alert secara cepat dan efisien untuk mengidentifikasi prioritas tertinggi? Buat framework penilaian prioritas yang dapat digunakan tim Tier 1.",
      "Dari tiga jenis alert yang diterima (login anomali, HTTPS traffic anomali, scheduled task modification), bagaimana korelasi ketiga sumber ini membantu mengkonfirmasi apakah ini serangan terkoordinasi atau kejadian terpisah?",
      "Jelaskan keputusan eskalasi: kapan Tier 1 harus menghandle sendiri versus mengdelegasikan ke Tier 2, dan informasi apa yang harus disiapkan sebelum eskalasi?",
      "Rancang template laporan insiden yang cocok untuk insiden perbankan ini, termasuk informasi yang wajib dilaporkan kepada manajemen, OJK, dan BSSN dalam batas waktu yang dipersyaratkan regulasi."
    ]
  },
  caseStudyPool: [
    {
      title: "Multi-Alert Triage Insiden Perbankan",
      scenario: "SOC Bank Nusantara Mandiri menerima 47 alert dalam satu jam pada dini hari — anomali login dari IP Rusia, traffic HTTPS besar ke server tidak dikenal, dan modifikasi scheduled task pada beberapa workstation. SIEM mengelompokkan alert ini menjadi satu insiden potensial dengan severity HIGH. Tier 1 analyst bertugas melakukan triage dan menentukan apakah ini insiden nyata yang memerlukan eskalasi.",
      questions: [
        "Buat framework triage 47 alert secara sistematis dalam waktu maksimal 30 menit, termasuk kriteria prioritisasi dan threshold eskalasi ke Tier 2.",
        "Bagaimana korelasi tiga jenis alert (login anomali, HTTPS traffic, scheduled task) menggunakan teknik multi-source correlation membantu membuktikan atau menyangkal hipotesis serangan terkoordinasi?",
        "Tentukan klasifikasi insiden (TP/FP, NIST Category, Severity) dan justifikasi eskalasi kepada IR Lead dengan informasi apa yang harus sudah disiapkan sebelum escalation call?",
        "Rancang laporan insiden awal (first notification) untuk manajemen bank yang harus dikirim dalam 1 jam pertama, sesuai regulasi OJK tentang pelaporan insiden siber."
      ]
    },
    {
      title: "False Positive Investigation pada Sistem Rumah Sakit",
      scenario: "SOC Rumah Sakit Bina Sehat menerima alert CRITICAL dari IDS yang mendeteksi 'SQL Injection attack' terhadap sistem informasi rumah sakit. Analyst awal mengklasifikasikan sebagai True Positive dan mengisolasi database server, menyebabkan gangguan pada akses rekam medis pasien selama 45 menit. Investigasi mendalam kemudian menemukan bahwa alert adalah False Positive — query legitimate dari aplikasi backup yang menggunakan format query menyerupai SQL injection.",
      questions: [
        "Langkah validasi tambahan apa yang seharusnya dilakukan sebelum mengambil tindakan isolasi yang mengganggu operasional, untuk membedakan True Positive dari False Positive SQL injection?",
        "Bagaimana proses post-mortem harus dilakukan setelah false positive menyebabkan gangguan layanan, dan siapa yang harus terlibat dalam review ini?",
        "Prosedur apa yang harus direvisi untuk mencegah tindakan impulsif yang menyebabkan downtime pelayanan pasien, termasuk approval workflow sebelum isolasi sistem kritis?",
        "Bagaimana IDS rule harus di-tune untuk mengurangi false positive dari aplikasi backup internal tanpa meningkatkan false negative rate untuk serangan SQL injection nyata?"
      ]
    },
    {
      title: "Eskalasi Alert pada Sistem Pemerintahan",
      scenario: "Seorang Tier 1 analyst di SOC Kementerian Keuangan menerima serangkaian alert yang menunjukkan possible exfiltration data anggaran negara yang belum dipublikasi. Alert menunjukkan transfer data 2.3GB dari server data warehouse ke IP eksternal yang tidak dikenal. Analyst baru berusia 6 bulan dan tidak yakin apakah ini rutin atau insiden kritis yang memerlukan eskalasi segera.",
      questions: [
        "Jelaskan proses pengambilan keputusan eskalasi: faktor apa (kritikalitas data, volume transfer, IP reputation, waktu kejadian) yang menjadi trigger eskalasi mandatory kepada Tier 2 tanpa perlu konfirmasi lebih lanjut?",
        "Informasi apa yang harus dikumpulkan analyst Tier 1 selama 15 menit pertama untuk mempersiapkan handover ke Tier 2 yang efektif, termasuk evidence preservation?",
        "Bagaimana mengelola tekanan psikologis analyst baru yang menghadapi potensi insiden kritis — prosedur apa yang membantu analyst mengikuti proses secara tenang tanpa membuat keputusan buruk karena panik?",
        "Jika insiden dikonfirmasi sebagai exfiltration data anggaran negara, jelaskan jalur eskalasi dan pelaporan yang harus diikuti sesuai regulasi (UU ITE, BSSN, BPK) dalam batas waktu yang ditetapkan."
      ]
    },
    {
      title: "SOC Alert Triage pada Serangan Universitas",
      scenario: "SOC Universitas Teknologi Nusantara menerima sekaligus 200 alert setelah musim exam berakhir — berbagai jenis dari brute force WiFi, downloading konten ilegal dari IP mahasiswa, hingga beberapa alert yang terlihat seperti reconnaissance scan dari dalam jaringan kampus. Tim IT kampus yang kecil hanya memiliki 2 analyst dan harus memilah mana yang memerlukan tindakan segera.",
      questions: [
        "Bagaimana 200 alert diprioritaskan dengan efektif oleh 2 analyst dalam shift 8 jam, menggunakan metode triage yang meminimalkan waktu per alert sambil memastikan alert kritis tidak terlewat?",
        "Dari tiga kategori alert (brute force WiFi, illegal download, internal reconnaissance), mana yang memiliki prioritas tertinggi dan mengapa, merujuk pada framework NIST dan kritikalitas aset kampus?",
        "Bagaimana kebijakan triage yang berbeda harus diterapkan untuk mahasiswa (pengguna eksternal, dapat terkoneksi dari BYOD) versus staf IT dan dosen yang menggunakan aset kampus?",
        "Rancang runbook (playbook) triage untuk jenis alert yang paling sering muncul di lingkungan kampus agar analyst baru dapat menangani secara konsisten dan efisien."
      ]
    },
    {
      title: "Investigasi Alert E-Commerce Multi-Stage",
      scenario: "Platform e-commerce TokoBelanja.id menerima alert dari tiga sistem berbeda secara bersamaan: WAF mendeteksi XSS pada form checkout, EDR mendeteksi proses javascript tidak dikenal pada server aplikasi, dan monitoring database menunjukkan query SELECT besar yang tidak normal dari akun aplikasi. SOC harus memutuskan apakah ini insiden terkoordinasi atau tiga kejadian terpisah.",
      questions: [
        "Bagaimana metodologi triage membantu memutuskan dalam waktu 10 menit apakah tiga alert dari sumber berbeda ini berkaitan atau terpisah, dan hipotesis serangan apa yang paling mungkin?",
        "Payload analysis seperti apa yang dilakukan terhadap XSS alert WAF dan proses tidak dikenal pada EDR untuk mengkonfirmasi apakah ini serangan Stored XSS yang berhasil menanam malware?",
        "Jika dikonfirmasi sebagai True Positive dengan malware aktif di server produksi, langkah containment apa yang harus dilakukan tanpa menyebabkan downtime platform e-commerce yang sedang melayani transaksi?",
        "Rancang incident report untuk insiden ini yang mencakup dampak terhadap data pelanggan, kewajiban pelaporan kepada OJK (platform pembayaran) dan pemberitahuan kepada pelanggan sesuai regulasi."
      ]
    },
    {
      title: "Alert Evaluation Insiden Manufaktur",
      scenario: "SOC PT Maju Bersama Manufacturing menerima alert dari sistem OT monitoring bahwa nilai sensor suhu pada lini produksi menunjukkan anomali yang tidak sesuai dengan program normal mesin. Bersamaan, IT network monitoring mendeteksi koneksi tidak sah dari segment IT ke segment OT yang seharusnya terisolasi. Engineer OT menyatakan tidak ada perubahan program yang mereka lakukan.",
      questions: [
        "Bagaimana SOC analyst harus mendekati alert yang melibatkan konvergensi IT-OT dengan risiko dampak fisik (kerusakan mesin, kecelakaan kerja), dan keputusan berbeda apa yang diperlukan dibandingkan insiden IT murni?",
        "Proses triage dan investigasi seperti apa yang harus dilakukan terhadap 'network crossing dari IT ke OT' alert, mengingat ini adalah indikator serangan yang sangat serius pada infrastruktur kritis?",
        "Siapa yang harus dilibatkan dalam respons insiden OT-IT convergence attack selain tim IT Security — dan bagaimana koordinasi dengan engineer OT, manajemen produksi, dan tim safety dilakukan?",
        "Jelaskan bagaimana incident report untuk insiden pada infrastruktur OT manufaktur berbeda dari incident report IT standar, termasuk aspek safety impact assessment dan regulatory reporting ke BSSN dan Kementerian Perindustrian."
      ]
    },
    {
      title: "SOC Triage Alert Telekomunikasi",
      scenario: "SOC operator telekomunikasi PT Nusa Koneksi menerima alert dari NIDS bahwa traffic signaling SS7 dari mitra roaming asing menunjukkan pola query yang tidak normal — ratusan subscriber location request untuk nomor pelanggan Indonesia dalam waktu singkat. Ini adalah tanda-tanda SS7 tracking attack yang dapat melacak lokasi pelanggan. Alert ini jarang muncul dan SOP belum ada.",
      questions: [
        "Bagaimana Tier 1 analyst yang tidak familiar dengan protokol SS7 harus mendekati triage alert ini — prosedur eskalasi darurat seperti apa yang harus ada untuk jenis alert specialized yang jarang terjadi?",
        "Apa indikator-indikator yang membedakan SS7 subscriber location query yang legitimate (oleh mitra roaming untuk routing) versus yang malicious (untuk surveillance/tracking pelanggan)?",
        "Jelaskan dampak bisnis dan hukum dari SS7 tracking attack pada pelanggan telekomunikasi Indonesia, dan kewajiban operator dalam melaporkan dan menghentikan serangan ini kepada KOMINFO dan BSSN.",
        "Rancang playbook triage untuk SS7 anomaly alerts yang dapat digunakan analyst Tier 1 meskipun tanpa keahlian SS7 mendalam, termasuk decision tree dan threshold eskalasi."
      ]
    },
    {
      title: "Incident Escalation pada Startup Fintech",
      scenario: "SOC startup fintech BayarMudah.io yang baru beroperasi menerima alert pertama yang serius: sistem anti-fraud mendeteksi pola transaksi yang sangat tidak normal pada 500 rekening secara bersamaan pada akhir pekan. Analyst satu-satunya yang bertugas (on-call) baru bekerja 3 bulan dan harus memutuskan sendiri apakah ini bug sistem, serangan fraud, atau insiden keamanan yang memerlukan eskalasi emergency ke CTO.",
      questions: [
        "Bagaimana analyst on-call tunggal harus mendekati situasi ini secara sistematis dalam 30 menit pertama untuk menentukan apakah ini insiden keamanan atau false alarm teknis?",
        "Threshold dan kriteria apa yang seharusnya sudah terdokumentasi dalam playbook on-call untuk memandu keputusan 'eskalasi emergency ke CTO di tengah malam' versus 'tangani sendiri dan laporkan besok pagi'?",
        "Jika dikonfirmasi sebagai serangan fraud aktif, langkah containment apa yang dapat dilakukan analyst junior sendiri untuk menghentikan kerugian sementara menunggu eskalasi direspons?",
        "Setelah insiden selesai, incident report seperti apa yang diharapkan oleh investor dan OJK untuk startup fintech yang mengalami insiden fraud pertamanya?"
      ]
    },
    {
      title: "Alert Investigation Sistem Logistik",
      scenario: "SOC NusaKargo Ekspres menerima alert bahwa sistem API tracking paket mengalami peningkatan request yang sangat drastis — dari 1.000 request/menit normal menjadi 150.000 request/menit selama 20 menit. Alert awalnya dikira DDoS biasa namun analisis lebih lanjut menunjukkan request memiliki pattern yang sangat teratur (bukan random seperti DDoS biasa) dan berasal dari 50.000 IP yang berbeda namun semuanya memiliki parameter tracking number yang valid.",
      questions: [
        "Bagaimana analyst membedakan antara DDoS attack, credential stuffing, dan API abuse (scraping data tracking) berdasarkan pattern traffic dan payload analysis?",
        "Jelaskan proses investigasi untuk mengkonfirmasi hipotesis bahwa ini adalah automated scraping seluruh database tracking paket, termasuk evidence apa yang harus dikumpulkan.",
        "Langkah rate-limiting dan defensive countermeasure apa yang dapat diterapkan secara cepat untuk menghentikan scraping tanpa memblokir pengguna legitimate yang mengecek status paket mereka?",
        "Bagaimana incident report insiden API abuse ini berbeda dari incident report serangan intrusi biasa, dan siapa stakeholder internal dan eksternal yang harus dinotifikasi?"
      ]
    },
    {
      title: "False Positive Management di PLTU",
      scenario: "SOC PLTU Nusantara Power mengalami masalah serius: sistem monitoring ICS menghasilkan ratusan false positive alert per hari karena sensor suhu dan tekanan secara normal berfluktuasi dalam range yang ditandai sebagai anomali. Analyst menjadi terbiasa men-dismiss semua alert otomatis, dan suatu hari alert nyata tentang malfungsi pada sistem pendingin generator terlewat selama 3 jam, hampir menyebabkan overheating kritis.",
      questions: [
        "Analisis root cause dari alert fatigue yang terjadi pada SOC PLTU ini — faktor teknis dan prosedurial apa yang berkontribusi, dan siapa yang bertanggung jawab?",
        "Bagaimana baseline dan threshold alert untuk sensor OT harus dikalibrasi ulang untuk membedakan fluktuasi normal operasional versus anomali yang memerlukan tindakan?",
        "Prosedur apa yang harus diimplementasikan untuk mencegah 'dismiss otomatis' pada alert sistem kritis seperti pendingin generator, termasuk mandatory human review dan escalation path?",
        "Jelaskan konsekuensi regulasi dan hukum jika kelalaian alert monitoring pada PLTU menyebabkan insiden yang berdampak pada ketersediaan listrik regional — dan bagaimana incident report harus disusun untuk otoritas regulasi?"
      ]
    },
    {
      title: "SOC Alert Triage pada Media Broadcaster",
      scenario: "Menjelang siaran langsung Pilkada nasional, SOC Stasiun TV Cakrawala menerima serangkaian alert 4 jam sebelum siaran: anomali akses ke sistem broadcast control, modifikasi template siaran yang tidak terjadwal, dan koneksi dari IP asing ke workstation editing. Insiden ini berpotensi mempengaruhi siaran langsung hasil pemilihan yang ditonton jutaan pemirsa.",
      questions: [
        "Bagaimana faktor 'time pressure' (4 jam sebelum siaran kritis) mempengaruhi keputusan triage — apakah analyst harus mengambil tindakan containment lebih cepat dari biasanya, dan apa risikonya?",
        "Dari ketiga alert (akses anomali, modifikasi template, IP asing), buat urutan investigasi yang memaksimalkan coverage dalam waktu terbatas, dengan justifikasi prioritas masing-masing.",
        "Langkah-langkah apa yang dapat dilakukan untuk mengamankan integritas siaran langsung sambil investigasi insiden sedang berlangsung, tanpa membatalkan siaran yang sudah terjadwal?",
        "Rancang incident report untuk insiden ini yang mencakup dampak terhadap integritas jurnalistik dan demokrasi, serta kewajiban pelaporan kepada KPI (Komisi Penyiaran Indonesia) dan BSSN."
      ]
    },
    {
      title: "Alert Evaluation Firma Hukum",
      scenario: "SOC Firma Hukum Citra & Partners menerima alert dari DLP (Data Loss Prevention) bahwa dokumen legal rahasia klien korporat sedang di-upload ke layanan cloud storage personal melalui browser di jam kerja. Alert mengidentifikasi pengguna sebagai associate attorney yang memiliki akses sah ke dokumen tersebut. Situasi ini sensitif karena melibatkan kemungkinan insider threat pada orang dengan akses legitimate.",
      questions: [
        "Bagaimana triage alert insider threat berbeda dari triage serangan eksternal — pertimbangan etis, hukum, dan prosedural apa yang harus diperhatikan analyst sebelum mengambil tindakan?",
        "Evidence apa yang harus dikumpulkan dari DLP log, proxy log, dan Windows Event Log untuk memvalidasi apakah upload ini merupakan pelanggaran kebijakan atau memiliki justifikasi bisnis yang sah?",
        "Siapa yang harus dilibatkan dalam keputusan eskalasi insider threat di firma hukum — analyst, IT manager, Managing Partner, HR, atau Legal Counsel — dan dalam urutan apa?",
        "Jelaskan perbedaan antara incident report insider threat yang digunakan untuk tindakan disiplin internal versus yang disiapkan sebagai bukti forensik untuk proses hukum, termasuk persyaratan chain of custody."
      ]
    },
    {
      title: "Incident Response Asuransi Multi-System",
      scenario: "SOC PT Jaga Lindungi menerima serangkaian alert yang mempengaruhi tiga sistem berbeda secara bersamaan: sistem klaim (anomali query database), portal nasabah (banyak gagal login), dan sistem email (bounce message massal). Analyst curiga ini adalah serangan terkoordinasi namun bisa juga merupakan masalah teknis yang tidak terkait. CEO meminta update dalam 30 menit.",
      questions: [
        "Bagaimana analyst membuat keputusan berdasarkan bukti terbatas dalam 30 menit untuk memberikan executive briefing yang akurat tanpa over- atau under-estimasi situasi kepada CEO?",
        "Framework correlation apa yang digunakan untuk menentukan apakah tiga sistem yang terkena dampak secara bersamaan berkaitan (serangan terkoordinasi) atau kebetulan (insiden terpisah)?",
        "Template executive briefing seperti apa yang efektif untuk melaporkan situasi insiden keamanan yang masih dalam investigasi kepada CEO non-teknis yang memerlukan informasi untuk membuat keputusan bisnis?",
        "Jika dikonfirmasi sebagai serangan, jelaskan kewajiban perusahaan asuransi kepada OJK terkait pelaporan insiden siber beserta timeline dan format laporan yang dipersyaratkan regulasi."
      ]
    },
    {
      title: "SOC Investigation Properti Terkena Ransomware",
      scenario: "SOC Graha Nusantara Group menerima alert dari EDR bahwa proses enkripsi massal sedang terjadi di 12 workstation departemen keuangan pada saat jam kerja aktif. Alert menunjukkan ransomware LockBit dengan ransom note yang sudah muncul di desktop. Workstation yang terinfeksi sedang digunakan aktif oleh karyawan yang panik dan mencoba mematikan komputer atau memindahkan file.",
      questions: [
        "Langkah komunikasi pertama apa yang harus dilakukan analyst kepada pengguna yang panik di komputer yang terinfeksi, dan mengapa tindakan pengguna yang impulsif (matikan komputer, copy file) justru dapat memperburuk situasi?",
        "Proses triage 12 workstation yang terinfeksi secara bersamaan: bagaimana memprioritaskan mana yang harus di-isolasi duluan menggunakan kemampuan EDR remote isolation?",
        "Dalam situasi ransomware aktif, bagaimana analyst harus menyeimbangkan kecepatan containment (untuk menghentikan enkripsi) dengan kebutuhan evidence preservation (untuk forensik)?",
        "Rancang checklist respons ransomware untuk 2 jam pertama yang dapat diikuti oleh SOC yang menghadapi insiden ini untuk pertama kalinya, termasuk escalation chain dan komunikasi ke manajemen."
      ]
    },
    {
      title: "Alert Triage dan Incident Report Lembaga Zakat",
      scenario: "Lembaga Amil Zakat Nasional Berkah mengalami insiden di mana portal donasi online menampilkan halaman yang berbeda dari biasanya (defacement) selama 2 jam pada hari Jumat jelang waktu sholat — waktu donasi tertinggi. Alert pertama kali masuk melalui laporan donatur di media sosial, bukan dari sistem monitoring. IT person satu-satunya sedang tidak bertugas.",
      questions: [
        "Bagaimana prosedur respons insiden darurat harus dirancang untuk organisasi non-profit dengan hanya satu orang IT yang tidak selalu on-call, termasuk prosedur eskalasi ke vendor hosting dan BSSN?",
        "Proses triage dan investigasi apa yang harus dilakukan untuk defacement attack — bagaimana memastikan bahwa defacement tidak disertai compromise lebih dalam (backdoor, data theft)?",
        "Komunikasi krisis seperti apa yang harus dilakukan kepada donatur, pengurus, dan publik saat portal donasi menampilkan konten tidak semestinya, untuk menjaga kepercayaan dan transparansi?",
        "Rancang incident report pasca-insiden yang mencakup dampak terhadap reputasi lembaga zakat, kerugian donasi yang mungkin terlewat, dan rekomendasi jangka panjang untuk meningkatkan postur keamanan dengan anggaran minimal."
      ]
    }
  ],
  quiz: [
    {
      id: 1,
      question: "IDS menghasilkan alert tentang SQL injection, namun setelah investigasi analyst menemukan bahwa traffic tersebut adalah aplikasi backup internal yang menggunakan format query yang menyerupai SQL injection. Ini adalah contoh dari:",
      type: "multiple-choice",
      options: [
        "True Positive (TP) — IDS mendeteksi ancaman nyata yang ada",
        "False Negative (FN) — IDS gagal mendeteksi serangan yang terjadi",
        "False Positive (FP) — IDS menghasilkan alert padahal tidak ada serangan nyata",
        "True Negative (TN) — tidak ada serangan dan tidak ada alert"
      ],
      answer: "False Positive (FP) — IDS menghasilkan alert padahal tidak ada serangan nyata"
    },
    {
      id: 2,
      question: "Dalam konteks SOC, 'False Negative' adalah kondisi yang paling berbahaya. Mengapa?",
      type: "multiple-choice",
      options: [
        "Karena False Negative menghabiskan waktu analyst dengan pemeriksaan yang tidak perlu",
        "Karena False Negative berarti serangan nyata terjadi namun tidak terdeteksi, memungkinkan penyerang beroperasi bebas",
        "Karena False Negative menyebabkan alert fatigue pada tim SOC",
        "Karena False Negative meningkatkan biaya operasional SOC secara signifikan"
      ],
      answer: "Karena False Negative berarti serangan nyata terjadi namun tidak terdeteksi, memungkinkan penyerang beroperasi bebas"
    },
    {
      id: 3,
      question: "Seorang Tier 1 analyst baru menerima alert dengan priority HIGH tentang data exfiltration potensial dari server keuangan. Setelah enrichment awal, data yang dilihat adalah transfer 2GB ke IP asing. Apa keputusan triage yang PALING TEPAT?",
      type: "multiple-choice",
      options: [
        "Immediately dismiss alert karena transfer 2GB mungkin adalah backup otomatis",
        "Block IP secara otomatis tanpa investigasi lebih lanjut untuk menghentikan exfiltration",
        "Lakukan enrichment tambahan (WHOIS, threat intel, cek koneksi historis), validasi timeline, dan jika tidak dapat dijelaskan dalam 15 menit eskalasi ke Tier 2",
        "Menunggu 24 jam untuk melihat apakah insiden berulang sebelum mengambil tindakan"
      ],
      answer: "Lakukan enrichment tambahan (WHOIS, threat intel, cek koneksi historis), validasi timeline, dan jika tidak dapat dijelaskan dalam 15 menit eskalasi ke Tier 2"
    },
    {
      id: 4,
      question: "SOAR (Security Orchestration, Automation and Response) paling tepat digunakan untuk:",
      type: "multiple-choice",
      options: [
        "Menggantikan sepenuhnya analyst manusia dalam semua keputusan incident response",
        "Mengotomatiskan respons dan enrichment untuk alert berkepercayaan tinggi yang repetitif, sehingga analyst dapat fokus pada investigasi kompleks",
        "Melakukan penetration testing otomatis terhadap infrastruktur perusahaan",
        "Mengumpulkan threat intelligence dari dark web secara otomatis"
      ],
      answer: "Mengotomatiskan respons dan enrichment untuk alert berkepercayaan tinggi yang repetitif, sehingga analyst dapat fokus pada investigasi kompleks"
    },
    {
      id: 5,
      question: "Menurut NIST SP 800-61, fase Incident Response yang bertujuan untuk menghapus malware, menutup kerentanan yang dieksploitasi, dan memastikan sistem bebas dari ancaman sebelum diaktifkan kembali adalah:",
      type: "multiple-choice",
      options: [
        "Identification — mengidentifikasi scope dan tipe insiden",
        "Containment — menghentikan penyebaran insiden lebih lanjut",
        "Eradication — menghilangkan penyebab root insiden dari lingkungan",
        "Recovery — mengembalikan sistem ke operasi normal"
      ],
      answer: "Eradication — menghilangkan penyebab root insiden dari lingkungan"
    },
    {
      id: 6,
      question: "Zeek (Bro) menghasilkan berbagai jenis log file dari traffic jaringan. Log Zeek yang mencatat semua koneksi jaringan (IP sumber, tujuan, port, durasi, bytes) adalah:",
      type: "multiple-choice",
      options: [
        "dns.log — semua DNS queries dan responses",
        "conn.log — summary semua koneksi jaringan TCP/UDP/ICMP",
        "notice.log — alert dari Zeek detection scripts",
        "http.log — semua transaksi HTTP request dan response"
      ],
      answer: "conn.log — summary semua koneksi jaringan TCP/UDP/ICMP"
    },
    {
      id: 7,
      question: "Saat melakukan source investigation terhadap alert, analyst menemukan bahwa IP sumber memiliki AbuseIPDB confidence score 95/100 dan tercatat melakukan port scanning ke ribuan IP dalam 24 jam terakhir. Kesimpulan yang paling tepat adalah:",
      type: "multiple-choice",
      options: [
        "IP tersebut kemungkinan adalah server keamanan yang melakukan authorized scanning",
        "IP tersebut hampir pasti merupakan malicious actor dan alert harus diperlakukan sebagai True Positive dengan confidence tinggi",
        "Informasi dari AbuseIPDB tidak dapat dipercaya dan harus dikonfirmasi dari sumber lain dulu",
        "IP tersebut adalah false positive yang umum karena scanner sering dilaporkan secara berlebihan"
      ],
      answer: "IP tersebut hampir pasti merupakan malicious actor dan alert harus diperlakukan sebagai True Positive dengan confidence tinggi"
    },
    {
      id: 8,
      question: "Jelaskan konsep 'Alert Triage' dalam SOC dan mengapa keterampilan ini sangat penting bagi Tier 1 analyst. Deskripsikan langkah-langkah utama dalam proses triage dan faktor apa yang mempengaruhi keputusan eskalasi.",
      type: "essay",
      answer: "Alert Triage adalah proses rapid assessment yang dilakukan Tier 1 SOC Analyst untuk menentukan apakah sebuah alert memerlukan investigasi mendalam, penanganan segera, atau dapat di-dismiss. Keterampilan ini krusial karena SOC modern dapat menerima ribuan alert per hari dan tidak mungkin semuanya dianalisis mendalam — triage yang efektif memisahkan signal nyata dari noise. Langkah-langkah utama: (1) Initial Alert Review — baca metadata alert: source/dest IP, port, waktu, signature, severity; (2) Context Enrichment — query WHOIS, geolocation, threat intelligence (VirusTotal, AbuseIPDB) untuk membangun konteks; (3) Asset Criticality Check — periksa CMDB untuk menentukan nilai bisnis aset yang menjadi target; (4) Verify Attack Success — apakah serangan berhasil? Ada indikasi compromise? (5) Correlation Check — apakah ada event lain yang terkait dari sumber log berbeda?; (6) Classification Decision — TP/FP, NIST Category, Severity level; (7) Action — dismiss/monitor/remediate/escalate dengan dokumentasi. Faktor eskalasi: kritikalitas aset tinggi, confidence TP tinggi, scope luas, keterlibatan data sensitif, tidak dapat dijelaskan dalam waktu triage."
    },
    {
      id: 9,
      question: "Sebuah SOC mengalami situasi di mana rata-rata analyst men-dismiss lebih dari 80% alert tanpa investigasi memadai karena volume yang sangat tinggi. Jelaskan root cause dari situasi ini dan rancang program perbaikan komprehensif yang realistis untuk mengatasi masalah tersebut.",
      type: "essay",
      answer: "Situasi ini adalah manifestasi 'Alert Fatigue' yang parah. Root cause: (1) Technical — SIEM/IDS rules tidak dituning untuk lingkungan spesifik, menghasilkan false positive tinggi; tidak ada risk-based prioritization; alert tidak dilengkapi context yang memadai; (2) Process — tidak ada SLA triage yang jelas; tidak ada feedback loop antara outcome investigasi dengan tuning rules; (3) Human — understaffing, shift panjang menyebabkan kelelahan; kurang training untuk investigasi efisien. Program perbaikan: FASE 1 (bulan 1-2): Audit semua active rules dan matikan rules yang menghasilkan >90% false positive tanpa nilai deteksi; pasang risk scoring pada alert berdasarkan asset criticality × severity. FASE 2 (bulan 2-3): Implementasi SOAR untuk enrichment otomatis (VirusTotal, WHOIS) — analyst langsung mendapat context tanpa manual lookup; grouping alert terkait menjadi satu incident. FASE 3 (bulan 3-6): Implementasi UEBA untuk deteksi berbasis anomali yang lebih presisi; buat feedback mechanism — analyst wajib tag setiap dismissed alert sebagai FP dengan alasan untuk dataset tuning. ONGOING: Monthly rule review meeting; KPI tracking: FP rate, MTTD, MTTR, analyst satisfaction score."
    },
    {
      id: 10,
      question: "Apa perbedaan antara Network-based IDS dan Host-based IDS dalam menghasilkan alert? Berikan contoh serangan yang lebih mudah dideteksi oleh NIDS dan contoh serangan yang lebih mudah dideteksi oleh HIDS, beserta alasannya.",
      type: "essay",
      answer: "NIDS (Network-based IDS) ditempatkan pada choke point jaringan dan menganalisis semua traffic yang melewati sensor — memberikan visibilitas terhadap serangan yang melibatkan komunikasi jaringan. HIDS (Host-based IDS) berjalan sebagai agent di endpoint dan memantau aktivitas lokal: syscalls, file access, registry changes, process execution. Lebih mudah dideteksi NIDS: (1) Port scanning — penyerang melakukan scan dari luar, traffic scan terlihat jelas di network sensor; HIDS tidak dapat melihat ini karena berjalan di host target; (2) Network-based exploit — eksploitasi service yang mendengarkan di network (contoh: EternalBlue exploit terhadap SMB) terlihat di traffic jaringan; (3) DDoS attack — traffic flood terlihat di network level. Lebih mudah dideteksi HIDS: (1) Fileless malware — malware yang berjalan sepenuhnya di memori tanpa file disk (PowerShell in-memory injection) tidak terlihat di traffic jaringan namun terlihat oleh HIDS melalui syscall monitoring; (2) Privilege escalation lokal — exploit kernel local privilege escalation tidak menghasilkan traffic jaringan; (3) Insider threat lokal — pengguna yang membuka file sensitif dan copy ke USB tidak menghasilkan network traffic yang abnormal; HIDS mendeteksi melalui file access audit."
    },
    {
      id: 11,
      question: "Dalam menulis Incident Report, apa yang dimaksud dengan 'Executive Summary' dan mengapa bagian ini sangat penting? Sebutkan informasi apa saja yang wajib ada di Executive Summary sebuah incident report untuk insiden ransomware.",
      type: "essay",
      answer: "Executive Summary adalah bagian pembuka incident report (maksimal 1 halaman) yang dirancang untuk pembaca non-teknis — manajemen senior, dewan direksi, atau regulator — yang perlu memahami insiden dan implikasinya untuk membuat keputusan bisnis tanpa harus memahami detail teknis. Pentingnya: manajemen senior tidak memiliki waktu atau background untuk membaca laporan teknis 20 halaman; mereka perlu tahu 'apa yang terjadi, seberapa parah, apa yang sudah dilakukan, dan apa konsekuensinya' dalam 5 menit. Informasi wajib Executive Summary untuk insiden ransomware: (1) Deskripsi insiden dalam bahasa bisnis: 'Pada tanggal X, sistem kami terinfeksi ransomware yang mengenkripsi data di N komputer'; (2) Scope dan dampak bisnis: sistem apa yang terdampak, berapa lama downtime, apakah ada data yang terekspos/dicuri; (3) Status saat ini: apakah insiden masih aktif atau sudah terkontain; (4) Tindakan yang telah diambil: sistem diisolasi, backup diverifikasi, forensic dimulai; (5) Rencana pemulihan: timeline estimasi recovery; (6) Rekomendasi keputusan yang diperlukan dari manajemen: apakah perlu notifikasi pelanggan, apakah perlu melibatkan penegak hukum; (7) Status kepatuhan regulasi: apakah ada kewajiban pelaporan ke OJK/BSSN."
    },
    {
      id: 12,
      question: "Apa yang dimaksud dengan MTTR (Mean Time to Respond) dan MTTD (Mean Time to Detect) dalam konteks SOC performance metrics? Bagaimana implementasi SOAR dan playbook yang baik dapat mengurangi kedua metrik ini?",
      type: "multiple-choice",
      options: [
        "MTTD = rata-rata waktu deploy patch, MTTR = rata-rata waktu recover sistem; SOAR mengotomatiskan keduanya",
        "MTTD = rata-rata waktu dari insiden terjadi hingga terdeteksi, MTTR = rata-rata waktu dari deteksi hingga insiden terkontain; SOAR mengurangi keduanya dengan enrichment otomatis dan automated containment actions",
        "MTTD = rata-rata waktu training analyst baru, MTTR = rata-rata waktu remediasi kerentanan; SOAR membantu scheduling keduanya",
        "MTTD = rata-rata waktu monitoring aktif per shift, MTTR = rata-rata jumlah alert per bulan; SOAR mengkonsolidasi metrik ini"
      ],
      answer: "MTTD = rata-rata waktu dari insiden terjadi hingga terdeteksi, MTTR = rata-rata waktu dari deteksi hingga insiden terkontain; SOAR mengurangi keduanya dengan enrichment otomatis dan automated containment actions"
    },
    {
      id: 13,
      question: "Security Onion adalah platform NSM (Network Security Monitoring) yang populer. Jelaskan komponen utamanya dan bagaimana platform ini mendukung workflow SOC analyst mulai dari deteksi alert hingga investigasi mendalam.",
      type: "essay",
      answer: "Security Onion adalah distribusi Linux open-source yang mengintegrasikan berbagai tools NSM menjadi platform terintegrasi untuk SOC. Komponen utama: (1) Suricata/Zeek — engine deteksi signature dan log generation dari traffic jaringan; (2) Wazuh — HIDS agent untuk monitoring endpoint dan log collection; (3) Elasticsearch — storage dan indexing semua log dan alert untuk pencarian cepat; (4) Kibana/Security Onion Console (SOC) — antarmuka utama analyst untuk melihat alert, menginvestigasi, dan hunting; (5) Grafana — dashboard monitoring status sensor dan kapasitas; (6) TheHive — case management untuk incident tracking dan kolaborasi tim; (7) Arkime (Moloch) — full packet capture dengan indexing untuk retrieval cepat berdasarkan IP/port/protokol. Workflow SOC analyst dengan Security Onion: Alert muncul di SOC console → analyst klik alert untuk melihat detail event → pivot ke Elasticsearch untuk melihat event lain dari IP yang sama → pivot ke Arkime untuk melihat full PCAP dari sesi yang terkait → jika dikonfirmasi TP, buat case di TheHive → assign ke analyst lain dan track progress → setelah selesai, close case dengan dokumentasi. Keunggulan: semua tools terintegrasi dengan pivot yang seamless, sehingga analyst tidak perlu login ke sistem terpisah untuk setiap langkah investigasi."
    }
  ],
  videoResources: [
    {
      title: "SOC Alert Triage Process — How to Handle Security Alerts",
      youtubeId: "k7_hMRkYJj4",
      description: "Panduan praktis proses triage alert di SOC dari perspektif Tier 1 analyst yang berpengalaman.",
      language: "en",
      duration: "20:14"
    },
    {
      title: "Incident Response Process — NIST SP 800-61 Explained",
      youtubeId: "3Ea5_JiHxkM",
      description: "Penjelasan komprehensif framework Incident Response NIST SP 800-61 dengan contoh kasus nyata.",
      language: "en",
      duration: "17:45"
    },
    {
      title: "Security Onion Tutorial — Network Security Monitoring",
      youtubeId: "5lXzQC3yGNk",
      description: "Tutorial penggunaan Security Onion sebagai platform NSM terintegrasi untuk SOC analyst.",
      language: "en",
      duration: "28:30"
    },
    {
      title: "SOAR — Security Orchestration Automation and Response Overview",
      youtubeId: "xpOsGHhZaH0",
      description: "Pengenalan SOAR, cara kerjanya, dan bagaimana platform ini meningkatkan efisiensi SOC.",
      language: "en",
      duration: "13:52"
    }
  ]
};
