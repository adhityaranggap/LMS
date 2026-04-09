import type { ModuleData, CaseStudyVariant } from '../module-types';

export const module06: ModuleData & { caseStudyPool: CaseStudyVariant[] } = {
  id: 6,
  title: 'Network Security & Threats',
  description: 'Infrastruktur Keamanan Jaringan, Klasifikasi Threat Actor, Jenis Ancaman & Serangan',
  iconName: 'AlertTriangle',

  // ─────────────────────────────────────────────────────────────────────────────
  // THEORY
  // ─────────────────────────────────────────────────────────────────────────────
  theory: [
    {
      title: 'Topologi Jaringan dan Implikasi Keamanannya',
      content:
        'Topologi jaringan adalah susunan fisik atau logis bagaimana perangkat jaringan saling terhubung. Pemilihan topologi berdampak langsung pada ketersediaan, skalabilitas, dan postur keamanan jaringan. Tidak ada topologi yang sempurna — setiap desain memiliki trade-off antara biaya, performa, dan keamanan. Analis keamanan harus memahami topologi jaringan yang mereka amankan untuk dapat menentukan di mana menempatkan kontrol keamanan (firewall, IDS/IPS, segmentasi) secara efektif.',
      table: {
        caption: 'Perbandingan Topologi Jaringan dan Implikasi Keamanan',
        headers: ['Topologi', 'Cara Kerja', 'Kelebihan Keamanan', 'Kelemahan Keamanan', 'Contoh Penggunaan'],
        rows: [
          [
            'Bus',
            'Semua node terhubung ke satu kabel backbone tunggal',
            'Sederhana, murah untuk jaringan kecil',
            'Sniffing mudah — semua traffic di satu medium; single point of failure',
            'Jaringan lama (10Base2 Ethernet coaxial)',
          ],
          [
            'Ring',
            'Setiap node terhubung ke dua node tetangga membentuk lingkaran',
            'Traffic terstruktur — hanya melewati node tertentu',
            'Satu node down dapat mematikan seluruh ring; traffic dapat di-intercept di node manapun',
            'Token Ring, FDDI legacy',
          ],
          [
            'Star',
            'Semua node terhubung ke central hub/switch',
            'Isolasi traffic per port (switch); kegagalan satu node tidak mempengaruhi lain',
            'Switch sebagai single point of failure; attacker di switch dapat sniff semua traffic',
            'Jaringan kantor/kampus modern (paling umum)',
          ],
          [
            'Mesh',
            'Setiap node terhubung ke semua atau beberapa node lain',
            'Redundansi tinggi; tidak ada single point of failure; path alternatif saat serangan',
            'Kompleksitas tinggi; sulit diaudit; lebih banyak surface attack',
            'Internet backbone, jaringan ISP, data center tier-1',
          ],
          [
            'Tree/Hierarchical',
            'Hierarki core-distribution-access layer',
            'Segmentasi alami; mudah menerapkan kebijakan per layer',
            'Jika core node diserang, seluruh hierarki di bawahnya terdampak',
            'Enterprise campus network (Cisco 3-tier model)',
          ],
        ],
      },
      keyPoints: [
        'Defense-in-depth membutuhkan network segmentation — jangan biarkan semua device dalam flat network tunggal.',
        'VLAN (Virtual LAN) memungkinkan segmentasi logis tanpa perubahan fisik topologi.',
        'DMZ (Demilitarized Zone): segmen jaringan khusus untuk layanan yang diakses publik (web, email server), terpisah dari jaringan internal.',
        'Zero Trust Architecture: tidak ada kepercayaan implisit berdasarkan lokasi jaringan — verifikasi setiap akses.',
        'Network topology map adalah dokumen penting untuk incident response dan threat modeling.',
      ],
    },

    {
      title: 'Perangkat Keamanan Jaringan: Firewall, IDS, IPS, dan WAF',
      content:
        'Infrastruktur keamanan jaringan terdiri dari berbagai perangkat yang bekerja secara berlapis (defense-in-depth) untuk memproteksi jaringan dari ancaman. Setiap perangkat memiliki fungsi, cara kerja, dan keterbatasan yang berbeda. Memahami perangkat-perangkat ini penting untuk merancang arsitektur keamanan yang efektif dan untuk memahami alert yang dihasilkan dalam tugas sehari-hari analis SOC.',
      table: {
        caption: 'Perbandingan Perangkat Keamanan Jaringan',
        headers: ['Perangkat', 'Fungsi Utama', 'Cara Kerja', 'Mode', 'Keterbatasan'],
        rows: [
          [
            'Packet Filter Firewall',
            'Filter traffic berdasarkan IP, port, protokol',
            'Inspeksi header paket (Layer 3-4)',
            'Inline (blokir/izinkan)',
            'Tidak memahami konten aplikasi; rentan IP spoofing',
          ],
          [
            'Stateful Firewall',
            'Filter traffic berdasarkan state koneksi',
            'Tracking status TCP connection (SYN table)',
            'Inline',
            'Tidak menginspeksi payload aplikasi; tidak cegah application-layer attack',
          ],
          [
            'Next-Gen Firewall (NGFW)',
            'Deep packet inspection, app identification, user-based policy',
            'Layer 7 inspection, SSL decryption, threat intelligence',
            'Inline',
            'Performa terdegradasi saat SSL inspection; false positive',
          ],
          [
            'IDS (Intrusion Detection System)',
            'Mendeteksi dan melaporkan aktivitas mencurigakan',
            'Signature-based + anomaly-based detection; passive',
            'Passive (out-of-band)',
            'Hanya deteksi, tidak blokir; false positive banyak; blind terhadap encrypted traffic',
          ],
          [
            'IPS (Intrusion Prevention System)',
            'Mendeteksi DAN memblokir serangan secara real-time',
            'Signature + anomaly; inline blocking',
            'Inline (aktif blokir)',
            'False positive dapat blokir traffic legitimate; latency tambahan',
          ],
          [
            'WAF (Web Application Firewall)',
            'Proteksi aplikasi web dari OWASP Top 10',
            'Inspeksi HTTP/HTTPS request: SQLi, XSS, CSRF detection',
            'Reverse proxy / transparent',
            'Hanya untuk HTTP/HTTPS; tidak proteksi protokol lain',
          ],
          [
            'Proxy Server',
            'Mediasi koneksi client-server; content filtering',
            'Client → Proxy → Internet; dapat inspect traffic',
            'Forward/Reverse proxy',
            'Privacy concern; bottleneck jika tidak diskalakan',
          ],
        ],
      },
      keyPoints: [
        'IDS bersifat pasif (detect only) sedangkan IPS bersifat aktif (detect + block) — IPS selalu inline di jalur traffic.',
        'SNORT dan Suricata adalah IDS/IPS open-source yang paling banyak digunakan.',
        'WAF berbeda dari firewall biasa — WAF memahami protokol HTTP dan dapat mendeteksi SQL Injection, XSS di dalam request body.',
        'UTM (Unified Threat Management) mengintegrasikan firewall, IDS/IPS, antivirus, VPN, dan web filtering dalam satu perangkat.',
        'SIEM (Security Information and Event Management) mengagregasi dan mengkorelasikan log dari semua perangkat keamanan tersebut.',
      ],
      note: 'Tidak ada satu perangkat yang dapat menggantikan semua yang lain. Keamanan berlapis (defense-in-depth) dengan kombinasi NGFW + IPS + WAF + SIEM adalah praktik industri terbaik.',
      noteType: 'info',
    },

    {
      title: 'Klasifikasi Threat Actors: Dari Script Kiddie hingga Nation-State',
      content:
        'Threat Actor (pelaku ancaman) adalah individu atau kelompok yang melakukan serangan siber. Memahami klasifikasi threat actor penting karena menentukan motivasi serangan, tingkat kecanggihan teknis (sophistication), sumber daya yang tersedia, dan target yang dipilih. Analisis threat actor digunakan dalam threat intelligence untuk memprediksi vektor serangan dan membantu prioritisasi kontrol keamanan.',
      table: {
        caption: 'Klasifikasi Threat Actors berdasarkan Motivasi dan Kemampuan',
        headers: ['Tipe Threat Actor', 'Motivasi', 'Kemampuan Teknis', 'Sumber Daya', 'Contoh Serangan'],
        rows: [
          [
            'Script Kiddie',
            'Ketenaran, iseng, rasa ingin tahu',
            'Rendah — hanya gunakan tools yang sudah ada',
            'Minimal (tools gratis)',
            'Defacement, DDoS menggunakan tool jadi, exploit kit',
          ],
          [
            'Hacktivist',
            'Ideologi politik/sosial, protes',
            'Sedang — bisa develop tools sederhana',
            'Kolaboratif, komunitas (Anonymous)',
            'DDoS ke situs pemerintah, data leak, defacement',
          ],
          [
            'Cybercriminal',
            'Keuntungan finansial',
            'Sedang-Tinggi — operasi terorganisir',
            'Ekosistem kriminal (ransomware-as-a-service)',
            'Ransomware, banking trojan, BEC fraud, card skimming',
          ],
          [
            'Insider Threat',
            'Finansial, ketidakpuasan, pemaksaan',
            'Tinggi — akses legitimate ke sistem',
            'Akses internal (paling berbahaya)',
            'Data theft, sabotase, credential selling',
          ],
          [
            'Cyber Espionage / APT',
            'Spionase negara/korporat, keunggulan strategis',
            'Sangat Tinggi — zero-day, custom malware',
            'Besar (state-sponsored)',
            'Supply chain attack, long-term persistence, data exfil',
          ],
          [
            'Nation-State Actor',
            'Kepentingan nasional, perang siber, sabotase',
            'Elite — operasi militer siber',
            'Tidak terbatas (pemerintah)',
            'Stuxnet, NotPetya, SolarWinds supply chain attack',
          ],
          [
            'Terrorist / Extremist',
            'Teror, propaganda, gangguan infrastruktur kritis',
            'Rendah-Sedang (bergantung sponsorship)',
            'Bervariasi',
            'Propaganda cyber, DDoS infrastruktur kritis',
          ],
        ],
      },
      keyPoints: [
        'APT (Advanced Persistent Threat): karakteristik serangan jangka panjang, tersembunyi, bertarget, dan terorganisir — biasanya nation-state backed.',
        'Insider threat adalah salah satu ancaman paling berbahaya karena memiliki akses legitimate dan susah dideteksi.',
        'Kill chain berbeda per threat actor: script kiddie hanya sampai tahap exploitation, APT mencapai Action on Objectives berbulan-bulan kemudian.',
        'Threat Intelligence Feed memberikan informasi tentang TTPs (Tactics, Techniques, Procedures) spesifik per kelompok threat actor.',
        'Attribution (menentukan siapa pelaku) sangat sulit di dunia siber — IP yang digunakan bisa proxy/VPN milik pihak ketiga.',
      ],
    },

    {
      title: 'Jenis-Jenis Malware dan Karakteristiknya',
      content:
        'Malware (Malicious Software) adalah perangkat lunak yang dirancang untuk merusak, mengganggu, mencuri data, atau mendapatkan akses tidak sah ke sistem komputer. Malware adalah salah satu ancaman siber paling umum dan terus berkembang dalam kompleksitasnya. Pemahaman tentang jenis-jenis malware penting untuk: (1) mengenali tanda-tanda infeksi, (2) memilih metode deteksi dan remediasi yang tepat, dan (3) memahami teknik yang digunakan attacker dalam attack chain.',
      table: {
        caption: 'Klasifikasi Malware, Karakteristik, dan Metode Deteksi',
        headers: ['Jenis Malware', 'Cara Menyebar', 'Payload/Aksi', 'Persistensi', 'Contoh Nyata'],
        rows: [
          [
            'Virus',
            'Menginfeksi file executable yang ada; menyebar saat file dijalankan',
            'Merusak/memodifikasi file, konsumsi resource',
            'Menempel pada file host',
            'Melissa (1999), ILOVEYOU (2000)',
          ],
          [
            'Worm',
            'Menyebar otomatis lewat jaringan TANPA membutuhkan host file',
            'Konsumsi bandwidth, install backdoor, DoS',
            'Mandiri — tidak butuh file host',
            'WannaCry (2017), Conficker, Slammer',
          ],
          [
            'Trojan',
            'Bersembunyi di dalam software yang tampak legitimate',
            'Backdoor, keylogging, download malware lain',
            'Bergantung pada program host yang diinstal user',
            'Zeus banking trojan, Emotet, RATs (Remote Access Trojans)',
          ],
          [
            'Ransomware',
            'Email phishing, exploit kit, trojan dropper',
            'Enkripsi file korban → minta tebusan (crypto)',
            'Sering ada lateral movement sebelum enkripsi',
            'WannaCry, REvil, LockBit, CryptoLocker',
          ],
          [
            'Spyware',
            'Bundled dengan software gratis, drive-by download',
            'Keylogging, screenshot, monitoring aktivitas user',
            'Registry persistence, scheduled task',
            'FinFisher, Pegasus (iOS/Android), stalkerware',
          ],
          [
            'Rootkit',
            'Exploit privilege escalation → install di ring-0',
            'Sembunyikan proses/file/koneksi dari OS dan AV',
            'Boot-level atau kernel-level (sangat persistent)',
            'Necurs, TDL4 (Alureon), Sony BMG rootkit (2005)',
          ],
          [
            'Botnet/Bot',
            'Worm + trojan, exploit kit',
            'DDoS, spam, mining crypto, clickfraud',
            'C2 channel (IRC, HTTP, DNS, P2P)',
            'Mirai, Emotet, ZeroAccess',
          ],
          [
            'Adware',
            'Bundled software, malvertising',
            'Tampilkan iklan berlebihan, track browsing',
            'Browser extension, registry',
            'Gator, Conduit, berbagai browser hijacker',
          ],
        ],
      },
      keyPoints: [
        'Fileless Malware: tidak menyimpan file ke disk — hidup di memory RAM dan menggunakan tools legitimate (PowerShell, WMI) untuk execute payload.',
        'Polymorphic Malware: mengubah signature-nya setiap kali menyebar — menghindari deteksi antivirus berbasis signature.',
        'Dropper vs Loader: Dropper menginstal malware lain; Loader memuat payload langsung ke memori tanpa menyimpan ke disk.',
        'C2 (Command and Control) infrastructure memungkinkan attacker mengirimkan instruksi ke malware yang sudah terinstal.',
        'Indikator Infeksi (IoC): unusual process, outbound connections ke IP asing, registry persistence keys, high CPU saat idle.',
      ],
      note: 'Ransomware adalah ancaman paling merugikan secara finansial saat ini. Backup yang teratur, terpisah, dan teruji adalah satu-satunya mitigasi yang benar-benar efektif tanpa membayar tebusan.',
      noteType: 'danger',
    },

    {
      title: 'Reconnaissance Attacks: Passive dan Active',
      content:
        'Reconnaissance (pengintaian) adalah fase pertama dalam Cyber Kill Chain di mana attacker mengumpulkan informasi tentang target sebelum melancarkan serangan. Tujuannya adalah memahami topologi jaringan target, layanan yang berjalan, versi software, kerentanan yang mungkin ada, dan personil organisasi. Reconnaissance dibagi menjadi dua kategori utama: Passive Reconnaissance (tidak ada interaksi langsung dengan target) dan Active Reconnaissance (berinteraksi langsung, meninggalkan jejak).',
      codeSnippet: `# ──────────────────────────────────────────────────
# PASSIVE RECONNAISSANCE (tidak menyentuh target langsung)
# ──────────────────────────────────────────────────

# Informasi WHOIS domain dan registrar
whois target-company.com

# DNS lookup — temukan A, MX, NS, TXT records
dig target-company.com ANY
nslookup -type=ANY target-company.com

# Zone Transfer (jika dikonfigurasi buruk)
dig axfr @ns1.target-company.com target-company.com

# Cari subdomain yang terekspos
# (menggunakan database Certificate Transparency Logs)
# https://crt.sh/?q=%.target-company.com

# Google Dorks — informasi tersembunyi di Google
site:target-company.com filetype:pdf
site:target-company.com "confidential"

# Shodan — cari perangkat internet dari target
# https://www.shodan.io/search?query=org:"Target Company"

# ──────────────────────────────────────────────────
# ACTIVE RECONNAISSANCE (berinteraksi dengan target)
# ──────────────────────────────────────────────────

# Host Discovery — cari host aktif di subnet
nmap -sn 192.168.1.0/24
# -sn = ping scan only (tidak scan port)

# Port Scanning — identifikasi port terbuka
nmap -sS -p 1-65535 192.168.1.100
# -sS = SYN scan (stealth, tidak selesaikan handshake)

# Service & Version Detection
nmap -sV -sC -p 22,80,443,3389 192.168.1.100
# -sV = version detection, -sC = default scripts

# OS Fingerprinting
nmap -O 192.168.1.100

# Vulnerability Scanning dengan NSE Scripts
nmap --script vuln 192.168.1.100

# Aggressive Scan (semua di atas sekaligus) — SANGAT NOISY
nmap -A 192.168.1.100`,
      keyPoints: [
        'Passive Reconnaissance tidak meninggalkan jejak langsung di log target — sulit dideteksi.',
        'Active Reconnaissance dapat dideteksi melalui IDS/IPS jika ada signature untuk port scan.',
        'OSINT (Open Source Intelligence): pengumpulan informasi dari sumber publik — LinkedIn, GitHub, job postings, Shodan.',
        'Footprinting: pengumpulan informasi tentang organisasi target (domain, IP range, teknologi, personil).',
        'Nmap adalah tool reconnaissance wajib yang harus dipahami setiap praktisi keamanan — untuk defensive dan offensive.',
        'Penggunaan Nmap tanpa izin pada sistem yang bukan milik Anda adalah tindakan ilegal di banyak yurisdiksi.',
      ],
      note: 'Semua teknik reconnaissance di atas hanya boleh digunakan pada sistem yang Anda miliki atau dengan izin tertulis eksplisit. Dalam konteks lab ini, gunakan hanya pada mesin virtual yang Anda kendalikan sendiri.',
      noteType: 'warning',
    },

    {
      title: 'Denial of Service (DoS/DDoS): Jenis dan Cara Kerja',
      content:
        'Serangan Denial of Service (DoS) bertujuan membuat layanan tidak tersedia bagi pengguna yang sah dengan cara menghabiskan resource (bandwidth, CPU, memory, connection table) sistem target. DDoS (Distributed DoS) menggunakan banyak sumber serangan secara bersamaan, biasanya botnet, sehingga jauh lebih sulit diatasi. DoS/DDoS adalah salah satu serangan paling umum dan paling merusak secara finansial, dengan kerugian rata-rata per jam downtime mencapai jutaan dolar untuk platform e-commerce atau perbankan.',
      table: {
        caption: 'Klasifikasi Serangan DoS/DDoS berdasarkan Vektor',
        headers: ['Kategori', 'Tipe Serangan', 'Cara Kerja', 'Target Resource', 'Mitigasi'],
        rows: [
          [
            'Volumetric',
            'UDP Flood',
            'Banjir UDP packet ke random port → server balas ICMP Unreachable → habiskan bandwidth',
            'Bandwidth jaringan',
            'Rate limiting, upstream scrubbing center',
          ],
          [
            'Volumetric',
            'DNS Amplification',
            'Query kecil (60 byte) → response besar (3000+ byte) dari DNS open resolver ke IP korban',
            'Bandwidth (amplifikasi 50-100x)',
            'Blokir open resolver, BCP38 anti-spoofing',
          ],
          [
            'Volumetric',
            'NTP Amplification',
            'MONList command ke NTP server → list 600 client dikirim ke IP korban (amplifikasi 700x)',
            'Bandwidth (amplifikasi ekstrem)',
            'Disable MONList, update NTP server',
          ],
          [
            'Protocol',
            'SYN Flood',
            'Banjir SYN packet → server alokasikan half-open connection → habiskan connection table',
            'CPU, connection table',
            'SYN Cookies, firewall rate limit SYN',
          ],
          [
            'Protocol',
            'Ping of Death',
            'ICMP packet > 65535 byte → overflow buffer saat reassembly',
            'CPU, memori (buffer overflow)',
            'OS modern sudah kebal, firewall filter ICMP fragmen',
          ],
          [
            'Application',
            'HTTP Flood (Layer 7)',
            'Banjir HTTP GET/POST request yang tampak legitimate → habiskan resource web server',
            'CPU, memori web server',
            'WAF, CAPTCHA, rate limiting per IP/sesi',
          ],
          [
            'Application',
            'Slowloris',
            'Buka banyak koneksi HTTP parsial → tidak pernah selesaikan → habiskan connection pool',
            'Connection pool web server',
            'Timeout konfigurasi, reverse proxy, ModSecurity',
          ],
          [
            'Application',
            'ReDoS (Regex DoS)',
            'Input yang menyebabkan regex engine backtrack secara eksponensial',
            'CPU aplikasi',
            'Input validation, timeout pada regex engine',
          ],
        ],
      },
      keyPoints: [
        'DDoS menggunakan botnet (ribuan perangkat terinfeksi) sebagai sumber serangan terdistribusi — serangan dari satu IP mudah diblokir, dari jutaan IP sangat sulit.',
        'Amplification attacks memanfaatkan protokol dengan response jauh lebih besar dari request (DNS, NTP, Memcached, SSDP).',
        'BGP Blackholing: ISP me-route traffic ke IP target ke "null" (dibuang) — menghentikan DDoS tapi juga membuat target offline.',
        'Cloudflare, Akamai, AWS Shield adalah layanan DDoS mitigation komersial yang menggunakan anycast + scrubbing center.',
        'Indikator DDoS: sudden spike traffic, high CPU/bandwidth pada satu IP, ribuan koneksi dari berbagai sumber.',
      ],
    },

    {
      title: 'Social Engineering Attacks: Phishing, Vishing, dan Baiting',
      content:
        'Social Engineering adalah teknik manipulasi psikologis yang mengeksploitasi kepercayaan, rasa takut, urgensi, atau kelengahan manusia untuk mendapatkan informasi rahasia atau akses tidak sah — tanpa perlu mengeksploitasi kerentanan teknis. Social engineering sering disebut sebagai "hacking humans" dan merupakan salah satu vektor serangan paling efektif karena manusia adalah "the weakest link" dalam rantai keamanan. Mayoritas breach sukses dimulai dengan social engineering, terutama phishing.',
      example: {
        title: 'Contoh Skenario Phishing Email yang Canggih (Spear Phishing)',
        steps: [
          'Target: Manajer Keuangan Bank Citra Mandiri (nama diperoleh dari LinkedIn)',
          '',
          'Email dikirim dari: noreply@bank-citramandiri-secure.com (domain look-alike)',
          'Subject: [URGENT] Verifikasi Transaksi Mencurigakan - Aksi Diperlukan Sebelum 14.00 WIB',
          '',
          'Isi email:',
          'Yth. Bapak Ahmad Fauzi (nama asli — diperoleh dari OSINT LinkedIn),',
          '',
          'Tim Security Bank Citra Mandiri mendeteksi percobaan transfer tidak sah',
          'sebesar Rp 2.345.678.000 dari rekening korporat Anda ke rekening asing.',
          '',
          'Untuk memblokir transaksi ini, Anda HARUS memverifikasi identitas Anda',
          'dalam 30 menit melalui portal secure kami:',
          '',
          '[Klik di sini untuk Verifikasi Darurat] → http://bank-citramandiri-secure.com/verify',
          '(tampil identik dengan website asli bank)',
          '',
          'Elemen manipulasi psikologis dalam email ini:',
          '→ Urgency (30 menit) — mencegah korban berpikir jernih',
          '→ Authority (dari "Tim Security Bank") — memanfaatkan kepercayaan otoritas',
          '→ Fear (ancaman kehilangan uang besar) — memotivasi aksi segera',
          '→ Specificity (nama asli, jumlah spesifik) — meningkatkan kredibilitas',
        ],
        result:
          'Korban mengklik link dan memasukkan credential di halaman login palsu. Attacker mendapatkan username + password + OTP (jika ada real-time phishing proxy seperti Evilginx2).',
      },
      keyPoints: [
        'Spear Phishing: ditargetkan ke individu spesifik dengan informasi personal yang relevan (berbeda dari mass phishing generik).',
        'Whaling: spear phishing yang menargetkan eksekutif tingkat C-level (CEO, CFO, CTO).',
        'Vishing (Voice Phishing): serangan social engineering via telepon — penyerang berpura-pura sebagai bank, IT support, atau regulator.',
        'Smishing (SMS Phishing): phishing via SMS — biasanya berisi link shortener yang mengarah ke halaman credential harvest.',
        'Baiting: menawarkan sesuatu yang menggiurkan (USB drive "ditemukan", download software gratis) yang berisi malware.',
        'Pretexting: menciptakan skenario/cerita palsu yang meyakinkan untuk mendapatkan informasi dari target.',
        'Countermeasure terbaik: security awareness training berkelanjutan + simulasi phishing + technical controls (email filtering, MFA).',
      ],
    },

    {
      title: 'Evasion Techniques: Bagaimana Attacker Menghindari Deteksi',
      content:
        'Evasion Techniques adalah metode yang digunakan attacker untuk menghindari deteksi oleh sistem keamanan seperti antivirus, IDS/IPS, firewall, dan SIEM. Memahami teknik evasion penting bagi defender untuk merancang deteksi yang lebih robust dan untuk memahami mengapa serangan dapat lolos dari kontrol keamanan yang ada. Teknik evasion terus berkembang seiring dengan peningkatan kemampuan sistem deteksi.',
      keyPoints: [
        'Obfuscation: menyembunyikan kode malware dengan encoding (base64, XOR), packing (UPX), atau encryption sehingga antivirus tidak mengenali signature.',
        'Polymorphism: malware mengubah kode/signature-nya secara otomatis setiap kali menyebar, menghasilkan variant baru yang tidak dikenali oleh signature-based AV.',
        'Metamorphism: malware me-rewrite seluruh kode-nya (bukan hanya enkripsi) setiap kali replikasi — lebih canggih dari polymorphism.',
        'Living off the Land (LotL): attacker menggunakan tools yang sudah ada di sistem (PowerShell, WMI, cmd, certutil, regsvr32) untuk menjalankan payload — tidak perlu drop file baru ke disk.',
        'Traffic Encryption: malware C2 menggunakan HTTPS atau komunikasi terenkripsi sehingga IDS tidak dapat membaca konten traffic.',
        'Fragmentation: membagi exploit payload menjadi fragmen IP kecil-kecil sehingga IDS tidak dapat merekonstruksi signature serangan dari satu paket.',
        'Timing-based Evasion: malware beroperasi hanya pada jam kerja normal atau setelah periode "sleep" panjang untuk menghindari sandbox analysis berbasis waktu.',
        'Anti-Sandbox Techniques: malware mendeteksi apakah ia sedang dijalankan di VM/sandbox (check MAC vendor, jumlah CPU core, aktivitas mouse) dan tidak mengeksekusi payload.',
        'DNS over HTTPS (DoH): mengenkripsi DNS query sehingga DNS-based C2 detection menjadi lebih sulit.',
        'Steganography: menyembunyikan data atau instruksi malware di dalam file gambar, audio, atau video yang tampak normal.',
        'Process Injection: malware menyuntikkan kode berbahaya ke dalam proses legitimate (mis. explorer.exe, svchost.exe) untuk bersembunyi.',
        'Timestomping: memodifikasi timestamp file malware agar cocok dengan file sistem yang legitimate — menghindari deteksi forensik berbasis waktu.',
      ],
      note: 'Next-Generation Antivirus (NGAV) dan Endpoint Detection & Response (EDR) menggunakan behavioral analysis (anomaly detection berbasis perilaku) daripada signature-based detection untuk menghadapi teknik evasion modern. Solusi seperti CrowdStrike Falcon, SentinelOne, atau Microsoft Defender for Endpoint menggunakan AI/ML untuk mendeteksi perilaku malicious meskipun signature tidak dikenali.',
      noteType: 'info',
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // LAB
  // ─────────────────────────────────────────────────────────────────────────────
  lab: {
    title: 'Lab 6: Network Scanning dan Threat Analysis dengan Nmap',
    downloads: [
      {
        name: 'Nmap (Network Mapper)',
        url: 'https://nmap.org/download.html',
        description: 'Tool scanning jaringan dan keamanan yang paling banyak digunakan — tersedia untuk Linux, Windows, macOS.',
      },
      {
        name: 'Metasploitable 2 VM',
        url: 'https://sourceforge.net/projects/metasploitable/',
        description: 'Target VM yang sengaja dibuat rentan untuk latihan — JANGAN pernah expose ke internet.',
      },
    ],
    steps: [
      {
        title: 'Host Discovery dengan Nmap Ping Scan',
        description:
          'Lakukan host discovery terhadap subnet lab Anda (biasanya 192.168.1.0/24 atau range VM Anda) menggunakan Nmap ping scan. Identifikasi semua host yang aktif tanpa melakukan port scanning. Catat IP address dan MAC address setiap host yang ditemukan.',
        command: 'nmap -sn 192.168.1.0/24',
        expectedOutput:
          'Nmap scan report for 192.168.1.x\nHost is up (0.00xxs latency).\nMAC Address: XX:XX:XX:XX:XX:XX (Vendor Name)\n...\nNmap done: 256 IP addresses (N hosts up) scanned in X.XX seconds',
        hint: 'Ganti 192.168.1.0/24 dengan subnet jaringan VM Anda yang sebenarnya. Gunakan "ip addr show" atau "ipconfig" untuk menemukan IP Anda, kemudian sesuaikan range subnet. Nmap -sn tidak membutuhkan hak root untuk ICMP ping, namun ARP discovery membutuhkan root/administrator.',
        screenshotNote: 'Screenshot output nmap -sn lengkap dengan daftar semua host yang ditemukan. Tandai IP target (Metasploitable) yang akan digunakan pada langkah berikutnya.',
        warningNote: 'HANYA lakukan scanning pada jaringan dan target yang Anda miliki atau yang telah mendapat izin eksplisit. Scanning tanpa izin adalah tindakan ilegal di Indonesia (UU ITE Pasal 30).',
      },
      {
        title: 'Service dan Version Scanning',
        description:
          'Lakukan port scanning dan service detection terhadap target VM (Metasploitable atau VM lab Anda) pada port 1-1000. Identifikasi service apa yang berjalan, versi software-nya, dan OS yang digunakan. Informasi ini sangat berguna untuk menemukan kerentanan spesifik.',
        command: 'nmap -sV -sC -p 1-1000 [Target_IP]',
        expectedOutput:
          'PORT   STATE SERVICE VERSION\n21/tcp open  ftp     vsftpd 2.3.4\n22/tcp open  ssh     OpenSSH 4.7p1\n80/tcp open  http    Apache httpd 2.2.8\n...\nOS details: Linux 2.6.X',
        hint: 'Ganti [Target_IP] dengan IP Metasploitable yang ditemukan pada langkah sebelumnya. Flag -sV mendeteksi versi service; -sC menjalankan default NSE scripts (banner grabbing, basic vuln check). Tambahkan -O untuk OS detection (membutuhkan root).',
        screenshotNote: 'Screenshot output Nmap yang lengkap menampilkan semua port terbuka beserta nama service dan versinya. Identifikasi minimal 3 service yang berpotensi rentan berdasarkan versinya.',
        warningNote: 'vsftpd 2.3.4 yang terdeteksi di Metasploitable memiliki backdoor yang terkenal — ini adalah fitur intentional dari lab VM. JANGAN jalankan Metasploitable di jaringan yang terhubung ke internet.',
      },
      {
        title: 'Vulnerability Script Scanning dengan Nmap NSE',
        description:
          'Gunakan Nmap Scripting Engine (NSE) dengan kategori script "vuln" untuk secara otomatis mengidentifikasi kerentanan yang diketahui pada target. NSE akan menjalankan puluhan script keamanan yang memeriksa CVE dan misconfiguration umum.',
        command: 'nmap --script vuln [Target_IP]',
        expectedOutput:
          'Host script results:\n| smb-vuln-ms17-010:\n|   VULNERABLE: Remote Code Execution...\n|   CVE: CVE-2017-0143...\n| ftp-vsftpd-backdoor:\n|   VULNERABLE: vsFTPd version 2.3.4 backdoor...',
        hint: 'Script vuln akan memakan waktu lebih lama (5-15 menit). Jika terlalu lambat, gunakan script spesifik: "nmap --script=ftp-vsftpd-backdoor,smb-vuln-ms17-010 [Target_IP]". Gunakan "-v" untuk melihat progress real-time.',
        screenshotNote: 'Screenshot output seluruh NSE vulnerability scan. Untuk setiap kerentanan yang ditemukan: catat nama CVE, tingkat keparahan, dan service yang terdampak. Jelaskan mengapa kerentanan tersebut berbahaya.',
        warningNote: 'Script "vuln" bersifat aktif dan dapat menyebabkan crash pada sistem yang rentan. HANYA jalankan terhadap target lab yang terkontrol, BUKAN terhadap sistem produksi atau sistem milik orang lain.',
      },
      {
        title: 'Analisis Hash Malware di VirusTotal',
        description:
          'VirusTotal adalah platform analisis malware online yang memeriksa file atau hash terhadap 70+ antivirus engine secara bersamaan. Pada langkah ini, Anda akan menganalisis hash SHA-256 dari sample malware yang diketahui (daftar hash disediakan instruktur) menggunakan VirusTotal API atau web interface. JANGAN pernah mengupload file malware asli kecuali Anda memahami risikonya.',
        command: 'curl "https://www.virustotal.com/api/v3/files/[SHA256_HASH]" -H "x-apikey: [YOUR_API_KEY]"',
        expectedOutput:
          '{"data": {"attributes": {"last_analysis_stats": {"malicious": 68, "suspicious": 2, "undetected": 2}, "meaningful_name": "wannacry.exe", "type_description": "PE32 executable"}}}',
        hint: 'Gunakan web interface VirusTotal (virustotal.com) jika tidak memiliki API key. Hash MD5/SHA1/SHA256 dapat di-search langsung. Instruktur akan memberikan beberapa hash sample malware terkenal (WannaCry, Mirai, Emotet) untuk dianalisis.',
        screenshotNote: 'Screenshot hasil VirusTotal untuk setiap hash yang dianalisis, menampilkan: detection ratio (N/72 engines), nama malware yang terdeteksi, dan detail behavior (jika tersedia di sandbox section).',
        warningNote: 'Ketika mengupload file ke VirusTotal, file tersebut menjadi publik dan dapat diunduh oleh member VirusTotal lain. JANGAN upload file yang mengandung data sensitif atau proprietary, hanya malware sample yang diketahui publik.',
      },
    ],
    deliverable:
      'Laporan lab berisi: (1) Screenshot host discovery dengan identifikasi semua host dan analisis MAC vendor, (2) Screenshot service scanning dengan tabel port terbuka, service, versi, dan penilaian risiko masing-masing, (3) Screenshot vulnerability scan dengan analisis minimal 3 CVE yang ditemukan: deskripsi, CVSS score, dan rekomendasi remediasi, (4) Screenshot dan analisis VirusTotal untuk minimal 3 malware hash yang diberikan: detection rate, jenis malware, dan teknik evasion yang digunakan (jika terdeteksi), (5) Jawaban pertanyaan: Mengapa -sS (SYN scan) lebih "stealth" dibanding -sT (Connect scan)? Apa perbedaan Nmap NSE category "safe" vs "intrusive"?',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CASE STUDY (default)
  // ─────────────────────────────────────────────────────────────────────────────
  caseStudy: {
    title: 'Investigasi Multi-Stage Attack: Reconnaissance hingga Ransomware',
    scenario:
      'Tim SOC perusahaan manufaktur mendapatkan alert pukul 03.00 dini hari: sistem enkripsi massal terdeteksi di seluruh jaringan. Investigasi forensik menemukan bahwa serangan dimulai 3 minggu sebelumnya dengan spear phishing email yang membawa trojan, diikuti lateral movement menggunakan Mimikatz, dan diakhiri dengan deployment ransomware LockBit yang mengenkripsi 2TB data produksi.',
    questions: [
      'Petakan seluruh tahapan serangan ini ke dalam Cyber Kill Chain dan MITRE ATT&CK framework — identifikasi teknik spesifik (ATT&CK ID) yang digunakan di setiap fase.',
      'Identifikasi setidaknya 5 titik di mana serangan ini seharusnya dapat dideteksi dan dihentikan — kontrol keamanan apa yang tidak ada atau gagal berfungsi pada setiap titik tersebut?',
      'Analisis mengapa ransomware baru aktif 3 minggu setelah infeksi awal — apa keuntungan bagi attacker dari menunggu, dan teknik evasion apa yang mungkin digunakan selama periode "diam" tersebut?',
      'Susun rencana respons insiden darurat untuk 72 jam pertama setelah ransomware terdeteksi: prioritas tindakan, komunikasi stakeholder, keputusan membayar/tidak membayar tebusan, dan rencana pemulihan.',
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CASE STUDY POOL (15 variants)
  // ─────────────────────────────────────────────────────────────────────────────
  caseStudyPool: [
    // 1 — Rumah Sakit
    {
      title: 'Ransomware Attack pada Sistem Informasi Rumah Sakit',
      scenario:
        'Rumah Sakit Umum Pusat Nasional mengalami serangan ransomware Ryuk yang mengenkripsi seluruh sistem informasi manajemen rumah sakit (SIMRS) termasuk rekam medis digital, jadwal operasi, dan sistem farmasi. Serangan dimulai dari karyawan administrasi yang membuka attachment Word document phishing yang mengandung macro berbahaya, berlanjut ke lateral movement menggunakan credential yang dicuri, dan deployment ransomware dilakukan pada dini hari Sabtu ketika staf IT minimal.',
      questions: [
        'Identifikasi 5 titik di jalur serangan (phishing → macro → credential theft → lateral movement → deployment) di mana kontrol keamanan yang tepat dapat menghentikan serangan — sebutkan kontrol spesifik untuk setiap titik.',
        'Apa dampak klinis dan keselamatan pasien yang terjadi ketika SIMRS, sistem farmasi, dan jadwal operasi tidak dapat diakses selama 72+ jam, dan bagaimana rumah sakit harus mempersiapkan Business Continuity Plan (BCP) untuk skenario ini?',
        'Evaluasi dilema etis dan praktis dari keputusan membayar tebusan ransomware dalam konteks rumah sakit: argumen untuk dan melawan pembayaran tebusan, dan apa rekomendasi dari CISA/BSSN terkait hal ini?',
        'Rancang program penguatan keamanan pasca-insiden yang mencakup: technical hardening (disable macro, MFA, EDR), proses (patch management, backup testing), dan manusia (security awareness training untuk staf klinis non-teknis).',
      ],
    },
    // 2 — Bank
    {
      title: 'APT Campaign Menargetkan Sistem SWIFT Perbankan',
      scenario:
        'Bank Internasional Nusantara menjadi target serangan APT (Advanced Persistent Threat) yang diatribusikan ke kelompok Lazarus Group. Attacker melakukan spear phishing ke staf IT, berhasil mendapatkan akses ke workstation yang terhubung ke jaringan SWIFT, menginstal custom malware untuk memanipulasi pesan transfer SWIFT, dan berhasil mengirimkan instruksi transfer fraudulent senilai $15 juta sebelum bank mitra mendeteksi anomali dan memblokir sebagian transaksi.',
      questions: [
        'Jelaskan bagaimana serangan SWIFT banking fraud bekerja secara teknis: bagaimana attacker dapat memanipulasi pesan SWIFT tanpa terdeteksi sistem validasi bank sendiri, mengacu pada kasus Bank Bangladesh 2016.',
        'Apa characteristic teknis yang membedakan serangan APT (seperti Lazarus Group) dari cybercriminal biasa, dalam hal persistensi, tools yang digunakan, dan metodologi operasi?',
        'Jelaskan kontrol keamanan yang direkomendasikan SWIFT Customer Security Programme (CSP) yang seharusnya mencegah atau meminimalkan kerugian dari serangan ini.',
        'Bagaimana proses investigasi forensik digital harus dilakukan pada kasus ini, termasuk bagaimana membangun timeline serangan, mengidentifikasi semua sistem yang ter-compromise, dan berkoordinasi dengan penegak hukum internasional?',
      ],
    },
    // 3 — Pemerintah
    {
      title: 'Supply Chain Attack dan Backdoor pada Software Pemerintah',
      scenario:
        'Badan Pemeriksa Keuangan (BPK) menemukan bahwa software audit yang digunakan di 34 kementerian mengandung backdoor yang disisipkan selama proses update software resmi. Attacker telah berhasil mengkompromisi server update vendor software tersebut dan menyisipkan backdoor ke dalam installer yang ditandatangani secara digital, sehingga antivirus tidak mendeteksinya. Backdoor aktif selama 8 bulan sebelum terdeteksi oleh threat hunting team.',
      questions: [
        'Jelaskan konsep supply chain attack: mengapa mengkompromise vendor software lebih menguntungkan bagi attacker dibandingkan menyerang organisasi target secara langsung, dan seberapa sulit serangan ini dideteksi?',
        'Bagaimana digital signature pada software installer dapat dimanipulasi atau dielusi dalam supply chain attack seperti yang terjadi pada kasus SolarWinds (2020) — apa pelajaran yang dapat diambil untuk pemerintah Indonesia?',
        'Rancang proses software supply chain security yang mencakup: vendor assessment, code signing verification, integrity checking, dan monitoring untuk software yang digunakan di lingkungan kritis pemerintah.',
        'Apa tindakan investigasi dan remediasi yang harus dilakukan ketika backdoor ditemukan di software yang sudah terinstal di 34 kementerian — bagaimana memprioritaskan cleaning dan memastikan tidak ada persistence lain yang tersisa?',
      ],
    },
    // 4 — Universitas
    {
      title: 'DDoS dan Data Breach pada Portal Akademik Universitas',
      scenario:
        'Universitas Bina Nusantara mengalami dua insiden berurutan selama masa ujian: pertama, portal akademik diserang DDoS HTTP Flood selama 4 jam yang menyebabkan mahasiswa tidak dapat mengakses soal ujian online. Dua hari kemudian, tim IT menemukan bahwa database mahasiswa (150.000 record) terekspos akibat SQL Injection yang dieksploitasi selama chaos penanganan DDoS, ketika patch security tertunda karena fokus ke pemulihan layanan.',
      questions: [
        'Jelaskan bagaimana attacker dapat menggunakan DDoS sebagai "smoke screen" (pengalih perhatian) untuk menutupi serangan utama yang lebih berbahaya — apa taktik SOC yang seharusnya tetap waspada pada ancaman lain selama respons DDoS?',
        'Analisis teknis SQL Injection yang mungkin terjadi pada portal akademik: jenis SQL Injection apa (in-band, blind, out-of-band) yang cocok dengan skenario ini, dan bagaimana WAF dapat mencegahnya?',
        'Apa kewajiban hukum universitas terhadap mahasiswa yang datanya bocor berdasarkan UU Perlindungan Data Pribadi (UU PDP No. 27/2022), termasuk timeline notifikasi dan langkah-langkah yang harus dilakukan?',
        'Rancang kebijakan pengungkapan kerentanan yang bertanggung jawab (Responsible Disclosure Policy) untuk universitas yang memungkinkan mahasiswa dan peneliti melaporkan kerentanan secara legal dan mendapat penghargaan.',
      ],
    },
    // 5 — E-Commerce
    {
      title: 'Magecart Attack dan Credit Card Skimming di Platform E-Commerce',
      scenario:
        'Platform e-commerce FashionMall.id menemukan bahwa selama 3 bulan, data kartu kredit pelanggan dicuri secara diam-diam. Investigasi mengungkap serangan Magecart: attacker menyisipkan 23 baris JavaScript berbahaya ke dalam halaman checkout dengan mengkompromise salah satu library JavaScript pihak ketiga yang digunakan platform. Script tersebut secara real-time mengirim nomor kartu kredit, CVV, dan expiry date ke server attacker di Ukraina setiap kali pelanggan menyelesaikan transaksi.',
      questions: [
        'Jelaskan teknis serangan Magecart: bagaimana menyisipkan script berbahaya ke dalam library JavaScript pihak ketiga dapat mempengaruhi ribuan website yang menggunakan library yang sama, dan mengapa ini disebut supply chain attack.',
        'Mengapa Magecart attack sangat susah dideteksi selama 3 bulan — tools monitoring apa yang seharusnya dapat mendeteksi JavaScript injection, dan bagaimana Content Security Policy (CSP) dapat mencegah eksfiltrasi data?',
        'Apa kewajiban PCI DSS yang dilanggar oleh FashionMall.id akibat insiden ini, dan apa konsekuensi yang mungkin dihadapi: denda, peningkatan biaya processing, atau kehilangan kemampuan menerima pembayaran kartu?',
        'Rancang prosedur Subresource Integrity (SRI) dan third-party script monitoring yang harus diterapkan untuk mencegah serangan serupa, beserta proses validasi library pihak ketiga sebelum integrasi.',
      ],
    },
    // 6 — Manufaktur
    {
      title: 'Spear Phishing dan Industrial Espionage di Perusahaan Manufaktur',
      scenario:
        'Perusahaan manufaktur semikonduktor PT MicroChip Indonesia menjadi korban spionase industri: seorang karyawan R&D level senior menerima email spear phishing yang sangat meyakinkan, berpura-pura dari konferensi internasional dengan tawaran paper review fee. Attachment PDF yang dibuka mengeksploitasi zero-day Adobe Reader, menginstal custom RAT (Remote Access Trojan). Selama 4 bulan, attacker secara diam-diam mengeksfiltrasi 40GB dokumen desain chip proprietary.',
      questions: [
        'Jelaskan mengapa spear phishing ke peneliti/engineer senior berbeda dari phishing generik dalam hal tingkat personalisasi, teknik OSINT yang digunakan, dan mengapa korban yang berpengalaman pun dapat tertipu.',
        'Apa karakteristik zero-day exploit yang membuat serangan ini tidak dapat dicegah oleh patch management konvensional, dan bagaimana virtual patching via WAF/IPS dapat memberikan proteksi sementara?',
        'Jelaskan metode exfiltrasi data yang mungkin digunakan selama 4 bulan tanpa terdeteksi: teknik evasion apa yang memungkinkan transfer 40GB data keluar dari jaringan yang dilindungi DLP (Data Loss Prevention)?',
        'Dari perspektif intelijen bisnis dan hukum internasional, bagaimana PT MicroChip Indonesia dapat menuntut pelaku jika attacker beroperasi dari negara lain, dan apa mekanisme hukum internasional yang tersedia?',
      ],
    },
    // 7 — Telekomunikasi
    {
      title: 'BGP Hijacking dan DDoS Massive pada Infrastruktur ISP',
      scenario:
        'Operator telekomunikasi NusaNet mengalami gangguan layanan nasional selama 6 jam akibat BGP hijacking: router BGP ISP menerima route announcement palsu yang mengklaim memiliki path lebih pendek ke berbagai prefix IP populer (Google, Netflix, YouTube), menyebabkan jutaan paket pengguna dirouting ke infrastruktur attacker. Bersamaan dengan itu, attacker memanfaatkan traffic tersebut untuk meluncurkan DDoS terhadap target di luar negeri menggunakan IP pengguna NusaNet sebagai amplifier.',
      questions: [
        'Jelaskan bagaimana BGP (Border Gateway Protocol) hijacking bekerja: mengapa router BGP mempercayai route announcement dari peer tanpa verifikasi, dan apa kelemahan fundamental protokol BGP yang memungkinkan serangan ini?',
        'Apa dampak bagi pengguna akhir NusaNet selama 6 jam BGP hijacking: jenis layanan apa yang terdampak, data apa yang potensial ter-intercept, dan bagaimana pengguna dapat mendeteksi bahwa traffic mereka sedang di-hijack?',
        'Jelaskan bagaimana RPKI (Resource Public Key Infrastructure) dan Route Origin Validation (ROV) dapat mencegah BGP hijacking, dan apa hambatan adopsinya di Indonesia saat ini.',
        'Apa kewajiban regulasi NusaNet sebagai ISP kepada pengguna dan kepada BSSN setelah insiden ini, dan bagaimana ISP seharusnya mengimplementasikan BGP security policy untuk mencegah penggunaan infrastrukturnya sebagai amplifier serangan?',
      ],
    },
    // 8 — Startup
    {
      title: 'Social Engineering dan Credential Stuffing di Startup Fintech',
      scenario:
        'Startup pinjaman online KreditCepat.id mengalami serangkaian pengambilalihan akun nasabah (Account Takeover/ATO) secara masif: dalam satu malam, 3.000 akun nasabah diakses dari berbagai IP berbeda secara bersamaan. Investigasi menemukan attacker menggunakan teknik credential stuffing (menggunakan database username/password dari breach platform lain) dikombinasikan dengan teknik bypass CAPTCHA menggunakan layanan solving CAPTCHA manusia berbayar murah.',
      questions: [
        'Jelaskan teknis credential stuffing: bagaimana attacker mendapatkan username/password dari breach lain, mengapa teknik ini sangat efektif, dan mengapa pengguna yang menggunakan password yang sama di banyak layanan sangat rentan.',
        'Bagaimana bypass CAPTCHA menggunakan manusia (human CAPTCHA solving farms) bekerja, dan mengapa teknik ini membuat proteksi CAPTCHA tradisional tidak efektif — apa alternatif yang lebih robust?',
        'Jelaskan cara mendeteksi credential stuffing menggunakan analisis traffic: indikator anomali apa (user agent distribution, login failure rate, geographic anomaly, velocity) yang dapat membedakan stuffing dari login legitimate?',
        'Rancang strategi Account Takeover Prevention yang berlapis untuk platform fintech, mencakup: rate limiting, device fingerprinting, behavioral biometrics, risk-based MFA, dan notifikasi real-time.',
      ],
    },
    // 9 — Logistik
    {
      title: 'Ransomware pada Sistem TMS Perusahaan Logistik',
      scenario:
        'Perusahaan logistik JetKargo mengalami serangan ransomware yang mengenkripsi seluruh Transportation Management System (TMS), manifest digital, dan database tracking pengiriman. Serangan bermula dari attacker yang mengeksploitasi kerentanan RDP yang terekspos di internet (port 3389 dengan password lemah), melakukan brute force selama 3 hari sebelum berhasil masuk, kemudian menginstal Conti ransomware yang mengenkripsi data dan mencuri 200GB manifest pelanggan sebagai leverage tambahan.',
      questions: [
        'Jelaskan mengapa RDP yang terekspos ke internet adalah salah satu vektor serangan ransomware paling umum, dan statistik apa dari threat intelligence yang mendukung klaim ini.',
        'Jelaskan teknik double extortion yang digunakan ransomware Conti: selain enkripsi data, bagaimana ancaman publikasi data dicuri membuat korban lebih mungkin membayar tebusan, dan apa implikasinya bagi data pelanggan JetKargo?',
        'Rancang checklist hardening untuk remote access yang mencakup: penonaktifan RDP di internet (gunakan VPN), Network Level Authentication (NLA), MFA untuk RDP, account lockout policy, dan monitoring login failure.',
        'Bagaimana JetKargo dapat memulihkan operasional dengan cepat tanpa membayar tebusan jika memiliki backup yang baik — apa karakteristik backup yang efektif (3-2-1 rule, immutable backup, backup testing)?',
      ],
    },
    // 10 — PLTU
    {
      title: 'Nation-State Attack pada Sistem Kontrol PLTU',
      scenario:
        'PLTU Suralaya mengalami insiden siber yang diduga merupakan operasi nation-state: sistem SCADA dan DCS (Distributed Control System) yang mengontrol turbin uap menerima perintah anomali yang menyebabkan trip (shutdown mendadak) 4 unit pembangkit secara bersamaan, mengakibatkan pemadaman listrik yang mempengaruhi 5 juta pelanggan. Investigasi menemukan malware Industroyer2 — versi terbaru malware yang sama yang menyerang grid listrik Ukraina 2022 — tertanam di HMI engineering workstation.',
      questions: [
        'Jelaskan apa itu malware Industroyer/CRASHOVERRIDE dan mengapa malware ini sangat spesifik berbahaya terhadap infrastruktur listrik: protokol ICS apa yang dieksploitasi (IEC 61850, IEC 60870-5-104) dan bagaimana cara kerjanya?',
        'Mengapa serangan pada infrastruktur kritis seperti PLTU dikategorikan sebagai tindakan perang siber (cyber warfare), dan apa implikasi hukum internasional (Tallinn Manual) bagi negara yang melakukan serangan ini?',
        'Rancang arsitektur keamanan berlapis yang sesuai untuk PLTU berdasarkan standar IEC 62443: zone dan conduit model, security level (SL-1 hingga SL-4), dan kontrol spesifik untuk setiap level.',
        'Apa protokol koordinasi yang harus dilakukan antara PLTU, PLN, BSSN, dan Kementerian ESDM dalam menghadapi insiden siber pada infrastruktur kritis, berdasarkan Perpres 82/2022 tentang Pelindungan Infrastruktur Informasi Kritis (PIIK)?',
      ],
    },
    // 11 — TV Nasional
    {
      title: 'Hacktivism dan Defacement Siaran TV Nasional',
      scenario:
        'Stasiun TV nasional IndonesiaTV mengalami insiden hacktivist: selama siaran langsung upacara nasional yang ditonton 50 juta penonton, konten siaran tiba-tiba digantikan selama 7 menit oleh video propaganda kelompok ekstremis. Investigasi menemukan attacker mengeksploitasi CMS (Content Management System) playout server yang belum di-patch (kerentanan RCE 3 bulan sebelumnya), mendapatkan akses ke sistem broadcast automation, dan menjadwalkan konten berbahaya mereka untuk diputar pada slot siaran live tersebut.',
      questions: [
        'Jelaskan dampak insiden ini dari tiga dimensi: dampak teknis (sistem yang terkompromis), dampak sosial/politik (konten yang disiarkan ke 50 juta penonton), dan dampak hukum (tanggung jawab broadcaster).',
        'Bagaimana patch management yang buruk — kerentanan yang diketahui tapi belum di-patch 3 bulan — menjadi enabling factor dalam serangan ini, dan bagaimana vulnerability management lifecycle yang baik seharusnya mencegah situasi ini?',
        'Rancang kontrol teknis untuk broadcast system yang memisahkan air-time control dari konten CMS: network segmentation, approval workflow untuk perubahan jadwal siaran, dan real-time monitoring konten yang sedang disiarkan.',
        'Apa langkah legal yang harus diambil IndonesiaTV terhadap attacker yang teridentifikasi sebagai kelompok domestik, dan bagaimana kerangka hukum UU ITE dan regulasi KPI berlaku dalam kasus ini?',
      ],
    },
    // 12 — Firma Hukum
    {
      title: 'Insider Threat dan Exfiltrasi Dokumen Rahasia Klien di Firma Hukum',
      scenario:
        'Firma hukum internasional Jakarta & Partners menemukan bahwa partner senior yang akan bergabung ke firma kompetitor telah mengeksfiltrasi 15.000 dokumen rahasia klien selama 6 minggu terakhir. Investigasi digital forensik menemukan pola akses tidak normal: akses ke file di luar jam kerja, penggunaan akun lain yang memiliki akses lebih luas, dan transfer file dalam jumlah besar ke USB drive pribadi yang tidak terdeteksi karena kebijakan DLP tidak mencakup USB offline transfer.',
      questions: [
        'Identifikasi indikator perilaku dan teknis (behavioral indicators) yang seharusnya memicu alert pada UEBA (User Entity and Behavior Analytics) system untuk kasus insider threat seperti ini, sebelum kerusakan mencapai 15.000 dokumen.',
        'Jelaskan mengapa insider threat lebih sulit dideteksi dibandingkan serangan eksternal, dan bagaimana implementasi Least Privilege Access, Need-to-Know principle, dan monitoring aktivitas privileged user dapat mengurangi risiko.',
        'Apa chain of custody (rantai bukti) yang harus diikuti dalam forensik digital kasus ini agar bukti dapat digunakan dalam proses hukum, dan tools forensik apa (EnCase, FTK, Autopsy) yang digunakan untuk menganalisis USB transfer history?',
        'Rancang program Insider Threat Prevention yang mencakup aspek teknis (DLP yang mencakup semua channel termasuk USB/print/email), proses (off-boarding checklist yang ketat), dan HR (program employee monitoring yang etis dan legal).',
      ],
    },
    // 13 — Asuransi
    {
      title: 'Serangan Sosial Engineering dan Fraud Klaim Asuransi Digital',
      scenario:
        'Perusahaan asuransi digital QuickInsure mengalami serangkaian fraud klaim yang terkoordinasi: dalam satu bulan, 500 klaim asuransi jiwa fiktif diajukan dengan dokumen medis palsu yang sangat meyakinkan. Investigasi menemukan bahwa attacker menggunakan deepfake dokumen yang dihasilkan AI, data nasabah nyata yang bocor dari breach sebelumnya, dan mengeksploitasi proses verifikasi yang sepenuhnya digital tanpa pemeriksaan fisik. Kerugian total mencapai Rp 12 miliar.',
      questions: [
        'Jelaskan bagaimana kombinasi data breach + AI deepfake + kelemahan proses verifikasi digital menciptakan serangan fraud yang lebih canggih dan sulit dideteksi dibandingkan fraud konvensional.',
        'Teknis apa yang dapat digunakan untuk mendeteksi dokumen medis deepfake atau yang dihasilkan AI dalam proses klaim asuransi, mengingat kemampuan AI generatif yang terus meningkat?',
        'Rancang proses verifikasi klaim yang resistant terhadap AI-generated fraud: kombinasi kontrol manual (untuk klaim bernilai tinggi), teknis (document authenticity verification, liveness detection), dan data intelligence (cross-reference dengan sumber eksternal).',
        'Apa implikasi etis dan hukum dari penggunaan AI counter-measures (AI untuk mendeteksi AI fraud) dalam industri asuransi, dan bagaimana keseimbangan antara efisiensi proses digital dengan akurasi deteksi fraud?',
      ],
    },
    // 14 — Properti
    {
      title: 'Serangan Ransomware pada Sistem Manajemen Properti',
      scenario:
        'Perusahaan properti MegaCity Group yang mengelola 50 gedung perkantoran dan 10.000 unit apartemen mengalami ransomware REvil yang mengenkripsi seluruh sistem manajemen properti: sistem pembayaran sewa online, kontrak digital, database tenant, dan sistem akses gedung pintar. Serangan terjadi melalui phishing email ke staf accounting yang membawa macro Excel berbahaya, diikuti 2 minggu lateral movement, dan deployment ransomware yang diatur agar aktif tepat pada tanggal jatuh tempo pembayaran sewa.',
      questions: [
        'Jelaskan bagaimana timing serangan ransomware pada tanggal jatuh tempo pembayaran sewa mencerminkan pemahaman attacker tentang operasional bisnis target, dan bagaimana threat intelligence dapat mengidentifikasi pola serangan seperti ini.',
        'Apa dampak bisnis konkret dari enkripsi sistem pembayaran sewa pada 10.000 unit: bagaimana perusahaan memproses pembayaran sewa manual, mengelola kontrak, dan mempertahankan operasional selama sistem offline?',
        'Analisis apakah macro Excel masih menjadi vektor serangan yang relevan di tahun 2026, dan kebijakan Microsoft apa (disable macro by default untuk file dari internet) yang seharusnya telah diterapkan untuk mencegah serangan ini.',
        'Rancang Business Continuity Plan (BCP) khusus untuk perusahaan manajemen properti yang mencakup: prosedur pembayaran sewa manual, komunikasi tenant, prosedur akses gedung tanpa sistem digital, dan target waktu pemulihan (RTO/RPO).',
      ],
    },
    // 15 — Lembaga Zakat
    {
      title: 'Phishing Campaign Berkedok Lembaga Zakat di Bulan Ramadan',
      scenario:
        'Selama bulan Ramadan, lembaga zakat NurZakat menjadi korban serangan brand impersonation: kelompok attacker membuat 12 website phishing dan kampanye email masif yang meniru tampilan dan identitas NurZakat secara identik, termasuk nomor rekening yang sekilas terlihat mirip (berbeda 1 digit). Kampanye tersebut menyebabkan donatur mentransfer total Rp 3,2 miliar ke rekening attacker selama 2 minggu. NurZakat menemukan insiden ini saat donatur mulai menghubungi customer service menanyakan konfirmasi donasi yang tidak kunjung datang.',
      questions: [
        'Jelaskan teknis brand impersonation attack yang digunakan: bagaimana attacker membuat domain look-alike yang lolos dari inspeksi cepat pengguna, dan bagaimana email kampanye dapat lolos dari filter spam jika attacker menggunakan infrastruktur email yang baru dan bersih.',
        'Apa langkah-langkah proaktif monitoring yang harus dilakukan NurZakat untuk mendeteksi website phishing yang meniru brand mereka lebih cepat: brand monitoring service, Certificate Transparency monitoring, dan koordinasi dengan BSSN/KOMINFO untuk takedown.',
        'Bagaimana NurZakat harus mengelola komunikasi krisis kepada 3.000+ donatur yang mungkin mentransfer ke rekening palsu: transparansi informasi, mekanisme kompensasi yang realistis untuk lembaga nirlaba, dan pemulihan kepercayaan publik.',
        'Rancang program Digital Literacy untuk donatur lembaga zakat yang efektif dalam mencegah social engineering dan phishing, mengingat target demografis yang mungkin tidak melek teknologi — apa saluran komunikasi dan format pesan yang paling efektif?',
      ],
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // QUIZ
  // ─────────────────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 1,
      question: 'Apa perbedaan utama antara IDS dan IPS dalam arsitektur keamanan jaringan?',
      options: [
        'IDS lebih mahal dan lebih efektif dibandingkan IPS',
        'IDS mendeteksi dan melaporkan; IPS mendeteksi dan secara aktif memblokir serangan',
        'IDS hanya untuk jaringan kabel sedangkan IPS untuk wireless',
        'IDS menggunakan signature-based; IPS hanya menggunakan anomaly-based detection',
      ],
      answer: 'IDS mendeteksi dan melaporkan; IPS mendeteksi dan secara aktif memblokir serangan',
      type: 'multiple-choice',
    },
    {
      id: 2,
      question: 'Ransomware menggunakan mekanisme apa untuk mencegah korban mengakses file mereka sendiri?',
      options: [
        'Menghapus file asli dan menggantinya dengan file dummy',
        'Mengenkripsi file menggunakan kriptografi asimetris/simetris dan menahan kunci',
        'Mengubah permission file sehingga hanya administrator yang dapat mengakses',
        'Mengunci akun pengguna menggunakan Windows Group Policy',
      ],
      answer: 'Mengenkripsi file menggunakan kriptografi asimetris/simetris dan menahan kunci',
      type: 'multiple-choice',
    },
    {
      id: 3,
      question: 'Teknik serangan Social Engineering apa yang paling tepat menggambarkan: "attacker mengirim email yang mengandung attachment berbahaya kepada CFO perusahaan dengan nama dan jabatan yang tepat, berpura-pura dari auditor eksternal yang sedang mengaudit laporan keuangan"?',
      options: [
        'Mass Phishing',
        'Baiting',
        'Spear Phishing (atau Whaling karena targetnya C-level)',
        'Vishing',
      ],
      answer: 'Spear Phishing (atau Whaling karena targetnya C-level)',
      type: 'multiple-choice',
    },
    {
      id: 4,
      question: 'Seorang analis Nmap menjalankan "nmap -sS 192.168.1.100". Apa yang dimaksud dengan SYN scan (-sS) dan mengapa disebut "stealth scan"?',
      options: [
        'Scan yang menggunakan UDP daripada TCP sehingga tidak terdeteksi firewall',
        'Scan yang mengirim SYN tanpa menyelesaikan 3-way handshake (tidak mengirim ACK ketiga), sehingga tidak membuat entri di log koneksi OS target',
        'Scan yang menggunakan IP address palsu sehingga target tidak tahu siapa yang melakukan scanning',
        'Scan yang berjalan di background tanpa output ke terminal',
      ],
      answer: 'Scan yang mengirim SYN tanpa menyelesaikan 3-way handshake (tidak mengirim ACK ketiga), sehingga tidak membuat entri di log koneksi OS target',
      type: 'multiple-choice',
    },
    {
      id: 5,
      question: 'Threat actor mana yang paling mungkin menggunakan zero-day exploit, custom malware, dan beroperasi secara tersembunyi selama berbulan-bulan untuk tujuan spionase?',
      options: [
        'Script Kiddie',
        'Hacktivist',
        'Cybercriminal / Ransomware Gang',
        'Nation-State APT (Advanced Persistent Threat)',
      ],
      answer: 'Nation-State APT (Advanced Persistent Threat)',
      type: 'multiple-choice',
    },
    {
      id: 6,
      question: 'Apa yang dimaksud dengan "Living off the Land" (LotL) sebagai teknik evasion malware?',
      options: [
        'Malware yang hidup hanya di dalam RAM tanpa menyimpan file ke disk',
        'Malware yang menggunakan tools legitimate yang sudah ada di sistem (PowerShell, WMI, cmd) untuk menjalankan aktivitas berbahaya',
        'Malware yang berkomunikasi hanya melalui jaringan lokal tanpa koneksi internet',
        'Malware yang secara otomatis berpindah dari satu host ke host lain di jaringan',
      ],
      answer: 'Malware yang menggunakan tools legitimate yang sudah ada di sistem (PowerShell, WMI, cmd) untuk menjalankan aktivitas berbahaya',
      type: 'multiple-choice',
    },
    {
      id: 7,
      question: 'Topologi jaringan mana yang memberikan ketahanan tertinggi terhadap serangan yang menargetkan single point of failure?',
      options: [
        'Bus topology karena semua node di satu kabel',
        'Star topology karena semuanya terpusat di satu switch',
        'Ring topology karena memiliki redundansi dua arah',
        'Full Mesh topology karena setiap node memiliki koneksi langsung ke semua node lain',
      ],
      answer: 'Full Mesh topology karena setiap node memiliki koneksi langsung ke semua node lain',
      type: 'multiple-choice',
    },
    {
      id: 8,
      question: 'Seorang analis menemukan traffic keluar dari jaringan berupa ribuan paket UDP kecil (60 byte) ke IP publik yang sama, diikuti traffic masuk yang sangat besar (3000+ byte per paket) dari berbagai DNS resolver publik ke satu IP internal. Serangan apa yang sedang terjadi?',
      options: [
        'DNS Tunneling — data dieksfiltrasi melalui DNS query',
        'DNS Amplification DDoS — attacker menggunakan IP internal sebagai korban dengan amplifikasi DNS',
        'UDP Flood langsung ke IP internal',
        'DHCP Starvation menggunakan UDP broadcast',
      ],
      answer: 'DNS Amplification DDoS — attacker menggunakan IP internal sebagai korban dengan amplifikasi DNS',
      type: 'multiple-choice',
    },
    {
      id: 9,
      question:
        'Jelaskan perbedaan antara Virus, Worm, dan Trojan dalam hal metode penyebaran dan ketergantungan pada file host!',
      answer:
        'Virus: membutuhkan file host (executable, dokumen) untuk menyebar — menyisipkan kode berbahaya ke dalam file legitimate yang ada. Virus aktif ketika file host dieksekusi oleh pengguna. Contoh: Melissa macro virus menyebar melalui dokumen Word. Worm: mandiri dan menyebar otomatis melalui jaringan TANPA membutuhkan file host atau interaksi pengguna — mengeksploitasi kerentanan jaringan atau layanan untuk mereplikasi diri ke sistem lain. Contoh: WannaCry menyebar melalui exploit EternalBlue di SMBv1. Trojan: bersembunyi di dalam software yang tampak legitimate dan berguna — tidak menyebar sendiri, bergantung pada pengguna yang secara sukarela menginstal. Setelah diinstal, membuka backdoor atau melakukan aktivitas berbahaya. Contoh: Emotet banking trojan tersembunyi dalam email invoice. Perbedaan kunci: Virus=butuh host file; Worm=mandiri network propagation; Trojan=deception + user execution.',
      type: 'essay',
    },
    {
      id: 10,
      question:
        'Jelaskan bagaimana DDoS Amplification Attack bekerja dan mengapa jauh lebih efektif dari flood biasa!',
      answer:
        'DDoS Amplification bekerja dalam 3 langkah: (1) Attacker mengirim query kecil dengan source IP yang di-spoof sebagai IP korban ke banyak server publik yang rentan (DNS open resolver, NTP server, Memcached). (2) Server yang ditanya merespons dengan paket yang jauh lebih besar ke IP korban (bukan ke attacker). (3) Korban dibanjiri oleh banyak server yang merespons. Mengapa lebih efektif dari flood biasa: (a) Amplification Factor: DNS ANY query 60 byte → response 3000 byte = amplifikasi 50x. NTP MONList = hingga 700x. (b) Attacker hanya perlu bandwidth kecil untuk mengirim trigger, tapi korban menerima traffic amplified yang jauh lebih besar. (c) Lebih sulit untuk memblokir karena traffic datang dari ribuan server legitimate (DNS resolver, NTP server) bukan dari satu sumber. Mitigasi: BCP38 anti-spoofing di ISP (mencegah IP spoofed dari customer), menonaktifkan open resolver dan open NTP server.',
      type: 'essay',
    },
    {
      id: 11,
      question:
        'Apa itu DMZ (Demilitarized Zone) dalam konteks keamanan jaringan, dan mengapa server web perusahaan sebaiknya ditempatkan di DMZ daripada di jaringan internal?',
      answer:
        'DMZ adalah segmen jaringan terpisah yang berada di antara jaringan internal (trusted) dan internet (untrusted), biasanya dibuat menggunakan dua firewall atau satu firewall dengan tiga interface. Server yang perlu diakses dari internet (web server, email server, DNS server) ditempatkan di DMZ. Alasan menempatkan web server di DMZ: (1) Isolasi: jika web server dikompromis, attacker hanya mendapat akses ke DMZ — untuk menjangkau jaringan internal mereka harus menembus firewall kedua. (2) Traffic segregation: traffic internet menuju DMZ tidak pernah mencapai jaringan internal secara langsung. (3) Kontrol granular: firewall dapat dikonfigurasi dengan rules berbeda: internet → DMZ (diizinkan HTTP/HTTPS ke web server), DMZ → internal (sangat terbatas, hanya ke database server yang diperlukan), DMZ → internet (terbatas, hanya untuk update/NTP). Sebaliknya jika web server di jaringan internal, kompromi web server = akses langsung ke semua resource internal.',
      type: 'essay',
    },
    {
      id: 12,
      question:
        'Seorang karyawan baru menerima telepon yang mengaku dari IT Helpdesk, meminta password email untuk "verifikasi akun yang akan dinonaktifkan". Identifikasi teknik social engineering yang digunakan dan bagaimana seharusnya karyawan merespons!',
      answer:
        'Teknik Social Engineering yang digunakan: (1) Vishing (Voice Phishing) — serangan social engineering melalui telepon. (2) Pretexting — menciptakan skenario palsu ("akun akan dinonaktifkan") untuk membenarkan permintaan. (3) Authority — mengklaim sebagai IT Helpdesk untuk membangun kepercayaan. (4) Urgency/Fear — ancaman nonaktifasi akun memotivasi tindakan cepat tanpa berpikir kritis. Red Flags: IT Helpdesk yang legitimate TIDAK PERNAH meminta password melalui telepon — ini adalah prinsip keamanan fundamental. Cara Merespons yang Benar: (1) Tolak memberikan password — jelaskan bahwa kebijakan perusahaan melarang berbagi password melalui telepon. (2) Verifikasi identitas — minta nama dan nomor karyawan penelepon, lalu tutup telepon dan hubungi IT Helpdesk melalui saluran resmi (nomor internal yang terverifikasi). (3) Laporkan insiden ke tim keamanan — bahkan percobaan phishing yang gagal harus dilaporkan sebagai intelligence. (4) Jangan ragu untuk menolak — social engineering mengandalkan kesopanan dan keengganan korban untuk terlihat tidak kooperatif.',
      type: 'essay',
    },
    {
      id: 13,
      question:
        'Jelaskan mengapa "fileless malware" sangat sulit dideteksi oleh antivirus konvensional dan tools apa yang dapat mendeteksinya!',
      answer:
        'Fileless Malware sulit dideteksi antivirus konvensional karena: (1) Tidak ada file yang perlu di-scan — payload berjalan langsung di memori RAM dan tidak pernah disimpan ke disk dalam bentuk file yang dapat diidentifikasi. (2) Memanfaatkan proses dan tools legitimate — PowerShell, WMI, cmd, mshta.exe dll yang sudah ada di sistem dan biasanya diizinkan antivirus. (3) Teknik reflective loading — DLL atau executable di-load langsung ke memori tanpa menyentuh filesystem. (4) Living off the Land — antivirus tidak bisa memblokir PowerShell karena PowerShell adalah tool legitimate yang dibutuhkan administrator. Metode Deteksi yang Efektif: (1) EDR (Endpoint Detection & Response) seperti CrowdStrike, SentinelOne — memantau perilaku proses dan memory injection patterns. (2) PowerShell logging dan AMSI (Antimalware Scan Interface) — mencatat semua eksekusi PowerShell termasuk yang di-decode dari base64. (3) Memory forensics tools: Volatility, Rekall — analisis snapshot RAM untuk menemukan injected code. (4) Behavioral detection — alert jika PowerShell melakukan koneksi jaringan ke IP asing, atau WMI membuat proses baru yang tidak normal.',
      type: 'essay',
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // VIDEO RESOURCES
  // ─────────────────────────────────────────────────────────────────────────────
  videoResources: [
    {
      title: 'Types of Network Attacks - Cybersecurity Fundamentals',
      youtubeId: 'rcDO8km6R6c',
      description: 'Penjelasan komprehensif jenis-jenis serangan jaringan: DoS, MITM, Spoofing, dan lainnya.',
      language: 'en',
      duration: '14:22',
    },
    {
      title: 'Malware Types Explained - Virus, Worm, Trojan, Ransomware',
      youtubeId: 'n8mbzU0X2nQ',
      description: 'Penjelasan perbedaan jenis-jenis malware dengan contoh nyata dan cara kerjanya.',
      language: 'en',
      duration: '11:45',
    },
    {
      title: 'Nmap Tutorial for Beginners - Complete Guide',
      youtubeId: 'v-jDY7QVMH8',
      description: 'Tutorial lengkap Nmap dari host discovery hingga vulnerability scanning dengan NSE.',
      language: 'en',
      duration: '18:30',
    },
    {
      title: 'Social Engineering Attack Explained - Phishing, Vishing, Baiting',
      youtubeId: 'lc7scxvKQOo',
      description: 'Penjelasan berbagai teknik Social Engineering dan cara melindungi diri dari serangan ini.',
      language: 'en',
      duration: '13:18',
    },
    {
      title: 'Keamanan Jaringan - Pengenalan Firewall, IDS, IPS',
      youtubeId: 'wlH8P2RKS4k',
      description: 'Penjelasan perangkat keamanan jaringan (Firewall, IDS, IPS) dalam Bahasa Indonesia.',
      language: 'id',
      duration: '9:55',
    },
  ],
};
