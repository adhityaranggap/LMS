import type { ModuleData, CaseStudyVariant } from '../module-types';

export const module12: ModuleData & { caseStudyPool: CaseStudyVariant[] } = {
  id: 12,
  title: "Endpoint Protection & VA",
  description: "Perlindungan Endpoint dan Penilaian Kerentanan (Vulnerability Assessment)",
  iconName: "Cpu",
  theory: [
    {
      title: "Endpoint Security: Konsep dan Lapisan Perlindungan",
      content: "Endpoint security adalah pendekatan keamanan yang berfokus pada perlindungan perangkat akhir (endpoint) seperti laptop, desktop, server, dan perangkat mobile dari ancaman siber. Endpoint menjadi target utama penyerang karena merupakan titik masuk ke jaringan perusahaan. Pendekatan modern menggunakan model pertahanan berlapis (defense-in-depth) yang menggabungkan beberapa mekanisme keamanan secara bersamaan. Setiap lapisan dirancang untuk menangkap ancaman yang mungkin lolos dari lapisan sebelumnya, sehingga tidak ada satu titik kegagalan tunggal.",
      keyPoints: [
        "Lapisan 1 - Perimeter: Firewall, IPS, WAF untuk memblokir ancaman sebelum mencapai endpoint",
        "Lapisan 2 - Antimalware: Deteksi dan penghapusan malware menggunakan signature, heuristik, dan behavioral analysis",
        "Lapisan 3 - HIPS/EDR: Host-based Intrusion Prevention System dan Endpoint Detection & Response",
        "Lapisan 4 - Application Control: Whitelisting, sandboxing, dan kontrol eksekusi aplikasi",
        "Lapisan 5 - Data Protection: Enkripsi data at-rest dan in-transit, DLP (Data Loss Prevention)",
        "Lapisan 6 - Patch Management: Pembaruan sistem operasi dan aplikasi secara berkala",
        "Prinsip Least Privilege: Pengguna hanya mendapatkan hak akses minimum yang diperlukan",
        "Zero Trust: Tidak ada entitas yang dipercaya secara default, verifikasi selalu diperlukan"
      ],
      note: "Menurut laporan Verizon DBIR 2023, lebih dari 74% pelanggaran data melibatkan elemen manusia dan endpoint yang tidak terlindungi. Investasi dalam endpoint security adalah prioritas utama keamanan siber modern.",
      noteType: "info"
    },
    {
      title: "Antimalware: Signature vs Behavioral vs Heuristic Detection",
      content: "Antimalware modern menggunakan tiga pendekatan deteksi yang saling melengkapi. Signature-based detection bekerja dengan mencocokkan file terhadap database pola malware yang diketahui — sangat akurat untuk malware lama tetapi tidak efektif terhadap ancaman baru (zero-day). Behavioral detection memantau perilaku program saat runtime dan memblokir aktivitas mencurigakan seperti modifikasi registry sistem, enkripsi file massal, atau komunikasi ke server C2. Heuristic detection menganalisis struktur dan karakteristik kode untuk menemukan malware yang belum pernah terlihat sebelumnya tanpa memerlukan signature yang tepat.",
      table: {
        caption: "Perbandingan Metode Deteksi Antimalware",
        headers: ["Aspek", "Signature-Based", "Behavioral", "Heuristic"],
        rows: [
          ["Cara Kerja", "Mencocokkan hash/pola dengan database", "Memantau perilaku saat runtime", "Menganalisis struktur kode statik"],
          ["Keunggulan", "Akurasi tinggi, false positive rendah", "Mendeteksi zero-day & malware baru", "Mendeteksi varian malware baru"],
          ["Kelemahan", "Tidak efektif untuk zero-day", "False positive lebih tinggi", "Dapat tertipu obfuscation"],
          ["Kecepatan", "Sangat cepat", "Sedikit lebih lambat", "Moderat"],
          ["Resource", "Ringan", "Menengah-Berat", "Menengah"],
          ["Contoh Tools", "ClamAV, traditional AV", "Carbon Black, Cylance", "Bitdefender, ESET"]
        ]
      },
      note: "Solusi antimalware enterprise modern (seperti CrowdStrike Falcon, SentinelOne, Microsoft Defender for Endpoint) menggabungkan ketiga metode ini dengan machine learning untuk deteksi yang komprehensif.",
      noteType: "success"
    },
    {
      title: "HIPS (Host-based Intrusion Prevention System)",
      content: "Host-based Intrusion Prevention System (HIPS) adalah komponen keamanan yang berjalan langsung di endpoint untuk memantau dan memblokir aktivitas berbahaya di tingkat sistem operasi. Berbeda dengan NIPS (Network IPS) yang memantau lalu lintas jaringan, HIPS memiliki visibilitas penuh terhadap panggilan sistem (syscall), akses file, modifikasi registry, dan perilaku proses. HIPS modern sering diintegrasikan ke dalam solusi EDR (Endpoint Detection and Response) yang memberikan kemampuan deteksi, investigasi, dan remediasi insiden secara terpadu. HIPS menggunakan aturan berbasis kebijakan dan analisis anomali untuk memblokir serangan seperti privilege escalation, code injection, dan lateral movement.",
      example: {
        title: "Contoh Skenario: HIPS Memblokir Serangan Fileless Malware",
        steps: [
          "Langkah 1: Penyerang mengirimkan email phishing dengan lampiran Word bermacro berbahaya",
          "Langkah 2: Korban membuka dokumen dan mengaktifkan macro (VBA code)",
          "Langkah 3: Macro memanggil PowerShell dengan perintah: powershell -EncodedCommand <base64_payload>",
          "Langkah 4: HIPS mendeteksi bahwa Word.exe sedang meluncurkan PowerShell dengan argumen encoded — perilaku anomali",
          "Langkah 5: HIPS memblokir eksekusi PowerShell dan menghasilkan alert dengan detail proses induk/anak",
          "Langkah 6: SOC analyst menerima alert, menginvestigasi, dan mengkarantina workstation korban",
          "Langkah 7: Insiden tercatat sebagai TP (True Positive) — spear phishing dengan teknik Living-off-the-Land"
        ],
        result: "HIPS berhasil mencegah eksekusi payload dan membatasi dampak serangan sebelum malware dapat menyebar"
      },
      keyPoints: [
        "HIPS memantau syscall, file I/O, network connections, dan perubahan registry",
        "Dapat memblokir teknik Living-off-the-Land (LOtL) yang memanfaatkan tools bawaan OS",
        "EDR = HIPS + forensic recording + remote remediation capability",
        "Penting: HIPS perlu dikonfigurasi dengan tepat agar tidak memblokir aplikasi legitimate (false positive)"
      ]
    },
    {
      title: "Application Security: Whitelisting, Sandboxing, Patching",
      content: "Application security di endpoint mencakup tiga mekanisme utama yang bekerja secara komplementer. Application Whitelisting (daftar putih aplikasi) hanya mengizinkan program yang telah disetujui sebelumnya untuk dieksekusi, memblokir semua aplikasi lain — termasuk malware baru. Sandboxing mengisolasi aplikasi dalam lingkungan virtual terbatas sehingga kode berbahaya tidak dapat mempengaruhi sistem host. Patch Management memastikan semua software selalu diperbarui untuk menutup kerentanan keamanan yang diketahui.",
      table: {
        caption: "Perbandingan Mekanisme Application Security",
        headers: ["Mekanisme", "Cara Kerja", "Keunggulan", "Tantangan", "Tools/Contoh"],
        rows: [
          ["Whitelisting", "Hanya aplikasi yang disetujui dapat berjalan", "Sangat efektif blokir malware baru", "Overhead administrasi tinggi", "AppLocker, Carbon Black App Control, SELinux"],
          ["Blacklisting", "Memblokir aplikasi yang diketahui berbahaya", "Mudah dikelola, low overhead", "Tidak efektif untuk zero-day", "Antivirus tradisional, Windows Defender"],
          ["Sandboxing", "Eksekusi aplikasi dalam lingkungan terisolasi", "Mendeteksi malware saat runtime", "Malware canggih dapat mendeteksi sandbox", "Cuckoo, Any.run, FireEye NX, Bromium"],
          ["Patch Management", "Memperbarui software secara berkala", "Menutup kerentanan yang diketahui", "Waktu patching, kompatibilitas", "WSUS, SCCM, Ansible, Puppet"],
          ["Code Signing", "Verifikasi integritas dan keaslian aplikasi", "Mencegah software tidak resmi", "Sertifikat dapat dicuri/disalahgunakan", "Authenticode, GnuPG, Apple Notarization"]
        ]
      },
      note: "NSA dan CISA merekomendasikan Application Whitelisting sebagai salah satu kontrol keamanan paling efektif (Top 10 Mitigations). Organisasi yang mengimplementasikan whitelisting dapat mencegah lebih dari 85% serangan berbasis malware.",
      noteType: "warning"
    },
    {
      title: "Vulnerability Assessment vs Penetration Testing",
      content: "Vulnerability Assessment (VA) dan Penetration Testing (Pentest) adalah dua pendekatan berbeda namun saling melengkapi dalam mengidentifikasi kelemahan keamanan. VA adalah proses sistematis untuk mengidentifikasi, mengklasifikasikan, dan memprioritaskan kerentanan dalam sistem, jaringan, atau aplikasi — tanpa mengeksploitasinya. Pentest melangkah lebih jauh dengan secara aktif mengeksploitasi kerentanan yang ditemukan untuk membuktikan dampak nyata. Kedua pendekatan memiliki tujuan, metodologi, dan output yang berbeda, dan idealnya digunakan secara bersamaan dalam program keamanan yang matang.",
      table: {
        caption: "Perbandingan Vulnerability Assessment vs Penetration Testing",
        headers: ["Aspek", "Vulnerability Assessment", "Penetration Testing"],
        rows: [
          ["Tujuan", "Identifikasi & inventarisasi kerentanan", "Membuktikan dampak eksploitasi nyata"],
          ["Pendekatan", "Non-eksploitatif, pemindaian otomatis", "Eksploitatif, simulasi penyerang nyata"],
          ["Kedalaman", "Luas, mencakup seluruh permukaan serangan", "Mendalam pada target spesifik"],
          ["Skill", "Moderat — dapat otomatis dengan scanner", "Tinggi — memerlukan kreativitas manual"],
          ["Durasi", "Beberapa jam hingga beberapa hari", "Beberapa hari hingga beberapa minggu"],
          ["Output", "Daftar kerentanan dengan skor risiko", "Laporan eksploitasi dengan bukti (PoC)"],
          ["Frekuensi", "Kontinu / bulanan / kuartalan", "Tahunan / setelah perubahan besar"],
          ["Tools Umum", "Nessus, OpenVAS, Qualys, Nexpose", "Metasploit, Burp Suite, Cobalt Strike"],
          ["Risiko Gangguan", "Rendah — jarang menyebabkan downtime", "Tinggi — dapat merusak sistem jika tidak hati-hati"],
          ["Regulasi", "Wajib di PCI-DSS, ISO 27001, HIPAA", "Wajib di beberapa standar seperti PCI-DSS"]
        ]
      }
    },
    {
      title: "CVSS v3.1: Cara Menghitung Score Kerentanan",
      content: "Common Vulnerability Scoring System (CVSS) versi 3.1 adalah standar industri untuk menilai tingkat keparahan kerentanan keamanan secara kuantitatif. Skor CVSS berkisar antara 0.0 hingga 10.0 dan terdiri dari tiga metrik grup: Base Score (karakteristik intrinsik kerentanan), Temporal Score (faktor yang berubah seiring waktu), dan Environmental Score (penyesuaian berdasarkan konteks organisasi). Base Score adalah yang paling sering digunakan dan terdiri dari dua sub-grup: Exploitability Metrics dan Impact Metrics.",
      example: {
        title: "Contoh Perhitungan CVSS v3.1: CVE-2021-44228 (Log4Shell)",
        steps: [
          "Attack Vector (AV): Network (N) — dapat dieksploitasi dari jarak jauh melalui jaringan",
          "Attack Complexity (AC): Low (L) — tidak memerlukan kondisi khusus untuk eksploitasi",
          "Privileges Required (PR): None (N) — tidak memerlukan autentikasi apapun",
          "User Interaction (UI): None (N) — eksploitasi tidak memerlukan interaksi pengguna",
          "Scope (S): Changed (C) — eksploitasi mempengaruhi komponen di luar scope yang rentan",
          "Confidentiality Impact (C): High (H) — seluruh data sensitif dapat terekspos",
          "Integrity Impact (I): High (H) — penyerang dapat memodifikasi data apapun",
          "Availability Impact (A): High (H) — penyerang dapat menyebabkan denial of service penuh",
          "Formula: CVSS Base Score = f(AV, AC, PR, UI, S, C, I, A)"
        ],
        result: "CVSS Base Score: 10.0 (CRITICAL) — Log4Shell adalah salah satu kerentanan dengan skor maksimum, menunjukkan risiko eksploitasi yang sangat tinggi dengan dampak penuh pada CIA triad"
      },
      table: {
        caption: "Rating Keparahan CVSS v3.1",
        headers: ["Skor", "Rating", "Deskripsi", "Prioritas Respons"],
        rows: [
          ["0.0", "None", "Tidak ada risiko", "Tidak perlu tindakan"],
          ["0.1 - 3.9", "Low", "Risiko rendah, eksploitasi sulit", "Patch dalam 90 hari"],
          ["4.0 - 6.9", "Medium", "Risiko sedang, memerlukan kondisi tertentu", "Patch dalam 30 hari"],
          ["7.0 - 8.9", "High", "Risiko tinggi, eksploitasi relatif mudah", "Patch dalam 7 hari"],
          ["9.0 - 10.0", "Critical", "Risiko kritis, eksploitasi sangat mudah", "Patch segera (24-48 jam)"]
        ]
      },
      note: "Kalkulator CVSS resmi tersedia di: https://www.first.org/cvss/calculator/3.1. Organisasi harus menggunakan Environmental Score untuk menyesuaikan prioritas berdasarkan nilai aset dan konteks bisnis mereka.",
      noteType: "info"
    },
    {
      title: "ISMS dan ISO/IEC 27001: Kerangka Manajemen Keamanan Informasi",
      content: "Information Security Management System (ISMS) adalah kerangka kebijakan, prosedur, proses, dan sistem yang digunakan untuk mengelola risiko keamanan informasi secara sistematis. ISO/IEC 27001 adalah standar internasional yang menetapkan persyaratan untuk membangun, mengimplementasikan, memelihara, dan terus meningkatkan ISMS. Standar ini menggunakan pendekatan Plan-Do-Check-Act (PDCA) yang memastikan keamanan informasi adalah proses yang berkelanjutan, bukan proyek sekali jalan. ISO 27001 terdiri dari 11 klausul utama dan 114 kontrol keamanan yang diorganisasikan dalam Annex A.",
      keyPoints: [
        "PDCA Cycle: Plan (rencanakan), Do (terapkan), Check (evaluasi), Act (tingkatkan) — siklus berkelanjutan",
        "Risk Assessment: Identifikasi aset, ancaman, kerentanan, dan dampak untuk menentukan risiko",
        "Risk Treatment: Mitigasi, transfer (asuransi), acceptance, atau penghindaran risiko",
        "Statement of Applicability (SoA): Dokumen yang menjelaskan kontrol mana yang diterapkan dan alasannya",
        "114 Kontrol Keamanan dalam 14 domain: Kebijakan, Organisasi, SDM, Aset, Akses, Kriptografi, Fisik, Operasi, Komunikasi, Akuisisi, Hubungan Pemasok, Insiden, Business Continuity, Kepatuhan",
        "Sertifikasi ISO 27001: Organisasi dapat disertifikasi oleh badan sertifikasi terakreditasi (BSI, SGS, dll.)",
        "ISO 27002: Panduan implementasi kontrol keamanan (companion standard dari ISO 27001)",
        "Manfaat: Kepercayaan pelanggan, kepatuhan regulasi, reduksi insiden, peningkatan kesadaran keamanan",
        "Hubungan dengan VA: ISO 27001 klausul A.12.6 mewajibkan manajemen kerentanan teknis yang sistematis"
      ],
      note: "Per 2023, lebih dari 70.000 organisasi di seluruh dunia telah tersertifikasi ISO 27001, menjadikannya salah satu standar keamanan informasi paling banyak diadopsi secara global.",
      noteType: "success"
    }
  ],
  lab: {
    title: "Lab 12: Endpoint Vulnerability Assessment dengan Nmap dan CVSS",
    downloads: [
      {
        name: "CyberOps Workstation VM",
        url: "https://www.netacad.com/",
        description: "VM Linux untuk praktik scanning dan vulnerability assessment."
      },
      {
        name: "CVSS Calculator Reference Sheet",
        url: "https://www.first.org/cvss/calculator/3.1",
        description: "Panduan perhitungan CVSS v3.1 untuk exercise prioritisasi kerentanan."
      },
      {
        name: "Vulnerability Report Template",
        url: "https://owasp.org/",
        description: "Template laporan kerentanan standar industri berbasis OWASP."
      }
    ],
    steps: [
      {
        title: "Langkah 1: Service Profiling — Listening Ports",
        description: "Lakukan profiling layanan pada sistem target dengan memeriksa port yang sedang dalam kondisi listening. Perintah ss (Socket Statistics) menampilkan informasi socket jaringan secara detail termasuk nama proses yang membuka port. Identifikasi semua port TCP dan UDP yang terbuka dan catat nama proses yang memilikinya.",
        command: "sudo ss -tulnp",
        expectedOutput: "Netid State Recv-Q Send-Q Local Address:Port  Peer Address:Port Process\ntcp   LISTEN 0      128    0.0.0.0:22         0.0.0.0:*     users:((\"sshd\",pid=1234,fd=3))\ntcp   LISTEN 0      80     0.0.0.0:80         0.0.0.0:*     users:((\"apache2\",pid=5678,fd=4))\ntcp   LISTEN 0      5      127.0.0.1:5432     0.0.0.0:*     users:((\"postgres\",pid=9012,fd=5))",
        hint: "Flag -t=TCP, -u=UDP, -l=Listening only, -n=Numeric ports, -p=Show process. Port 22 (SSH), 80/443 (HTTP/S), 5432 (PostgreSQL) adalah port umum. Port yang tidak dikenal perlu diteliti lebih lanjut.",
        screenshotNote: "Screenshot output ss -tulnp, soroti port yang tidak umum atau tidak diharapkan ada di sistem ini."
      },
      {
        title: "Langkah 2: Service Profiling — Running Services",
        description: "Inventarisasi semua service/unit yang berjalan pada systemd. Ini memberikan gambaran lengkap tentang attack surface sistem — setiap service yang berjalan adalah potensi titik masuk penyerang. Identifikasi service yang tidak perlu dan catat versinya untuk vulnerability assessment.",
        command: "systemctl list-units --type=service --state=running",
        expectedOutput: "UNIT                   LOAD   ACTIVE SUB     DESCRIPTION\napache2.service        loaded active running The Apache HTTP Server\npostgresql.service     loaded active running PostgreSQL Database\nssh.service            loaded active running OpenBSD Secure Shell server\ncron.service           loaded active running Regular background program processing daemon",
        hint: "Bandingkan daftar service yang berjalan dengan baseline yang seharusnya. Service seperti telnet, rsh, finger, atau rexec adalah layanan tidak aman yang seharusnya tidak berjalan. Gunakan 'systemctl disable <service>' untuk menonaktifkan service yang tidak diperlukan.",
        screenshotNote: "Screenshot output systemctl list-units dengan annotation tentang service mana yang diperlukan dan mana yang sebaiknya dinonaktifkan."
      },
      {
        title: "Langkah 3: Nmap Vulnerability Scan",
        description: "Lakukan pemindaian kerentanan menggunakan Nmap dengan NSE (Nmap Scripting Engine) vuln scripts. Script ini akan memeriksa kerentanan yang diketahui pada service yang ditemukan. Ganti TARGET_IP dengan IP address sistem yang akan dipindai (gunakan VM target, bukan sistem produksi).",
        command: "nmap -sV --script=vuln -oN vuln_scan_result.txt TARGET_IP",
        expectedOutput: "Starting Nmap 7.93\nNmap scan report for 192.168.1.100\nHost is up (0.00089s latency).\n\nPORT   STATE SERVICE VERSION\n22/tcp open  ssh     OpenSSH 7.9 (Debian)\n80/tcp open  http    Apache httpd 2.4.38\n| http-vuln-cve2017-5638:\n|   VULNERABLE: Apache Struts Remote Code Execution\n|   CVE: CVE-2017-5638  CVSS: 10.0\n|   Description: Remote code execution via content-type header\n|_  References: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-5638",
        hint: "Script vuln membutuhkan waktu lebih lama karena memeriksa banyak kerentanan. Tambahkan -T4 untuk mempercepat scan. Gunakan flag -oN untuk menyimpan output ke file teks, -oX untuk format XML.",
        warningNote: "PERINGATAN: Hanya lakukan scan ini pada sistem yang Anda miliki izin eksplisit! Scanning tanpa izin adalah tindakan ilegal di Indonesia berdasarkan UU ITE Pasal 30.",
        screenshotNote: "Screenshot output Nmap yang menunjukkan kerentanan yang ditemukan beserta CVE ID-nya."
      },
      {
        title: "Langkah 4: Service Version Detection",
        description: "Lakukan pemindaian versi yang lebih detail untuk mengidentifikasi versi spesifik setiap service. Informasi versi yang tepat diperlukan untuk mencari CVE yang relevan. Gunakan intensity 5 (skala 0-9) untuk keseimbangan antara akurasi dan kecepatan.",
        command: "nmap -sV -sC --version-intensity 5 -oN service_versions.txt TARGET_IP",
        expectedOutput: "PORT     STATE SERVICE     VERSION\n22/tcp   open  ssh         OpenSSH 7.9p1 Debian 10+deb10u2\n| ssh-hostkey: \n|   2048 aa:99:a8:16:68:cd:41:cc:f9:6c:84:01:c7:59:09:5c (RSA)\n80/tcp   open  http        Apache httpd 2.4.38 ((Debian))\n|_http-server-header: Apache/2.4.38 (Debian)\n5432/tcp open  postgresql  PostgreSQL DB 9.6.0 - 11.7",
        hint: "Flag -sC menjalankan default scripts, -sV mendeteksi versi, --version-intensity 5 adalah nilai tengah yang baik. Catat semua versi yang ditemukan untuk dicocokkan dengan database CVE di langkah berikutnya.",
        screenshotNote: "Screenshot output yang menampilkan versi spesifik setiap service yang terdeteksi."
      },
      {
        title: "Langkah 5: CVSS Score Calculation",
        description: "Untuk setiap kerentanan yang ditemukan di langkah 3 dan 4, hitung CVSS Base Score menggunakan kalkulator resmi FIRST. Buka browser dan navigasikan ke https://www.first.org/cvss/calculator/3.1. Pilih nilai yang tepat untuk setiap metrik: Attack Vector, Attack Complexity, Privileges Required, User Interaction, Scope, serta tiga komponen Impact (C, I, A). Lakukan perhitungan untuk minimal 3 CVE yang ditemukan.",
        hint: "Untuk CVE yang ditemukan, cek detail metriknya di NVD (National Vulnerability Database): https://nvd.nist.gov/. Informasi CVSS vector string biasanya tersedia di sana, contoh: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
        screenshotNote: "Screenshot kalkulator CVSS untuk setiap CVE yang dianalisis, tampilkan nilai akhir dan rating (Low/Medium/High/Critical).",
        warningNote: "Pastikan menggunakan CVSS v3.1, bukan v2.0. Beberapa vulnerability database masih menampilkan skor CVSS v2 yang berbeda skala interpretasinya."
      },
      {
        title: "Langkah 6: Vulnerability Prioritization Matrix",
        description: "Buat matriks prioritisasi kerentanan menggunakan kombinasi CVSS Score dan kemudahan eksploitasi di lingkungan Anda. Prioritisasi yang efektif mempertimbangkan tidak hanya skor CVSS, tetapi juga ketersediaan exploit publik, apakah sistem terekspos internet, dan nilai bisnis aset. Isi tabel di bawah ini untuk semua kerentanan yang ditemukan.",
        hint: "Gunakan framework CVSS Environmental Score untuk menyesuaikan prioritas. Pertimbangkan: apakah ada exploit publik di Exploit-DB atau Metasploit? Apakah sistem menghadap internet? Apakah ada data sensitif yang terpengaruh? Faktor-faktor ini dapat meningkatkan atau menurunkan prioritas.",
        screenshotNote: "Buat tabel prioritisasi dalam spreadsheet (Excel/Google Sheets) atau dokumen Word/PDF dengan kolom: CVE-ID, Service, CVSS Base Score, CVSS Environmental Score, Exploit Tersedia?, Prioritas (Critical/High/Medium/Low), Rekomendasi Remediasi, Deadline Patch."
      },
      {
        title: "Langkah 7: Generate Vulnerability Report",
        description: "Susun laporan vulnerability assessment komprehensif menggunakan template yang disediakan. Laporan harus mencakup ringkasan eksekutif, metodologi, temuan kerentanan yang diprioritaskan, dan rekomendasi remediasi yang dapat ditindaklanjuti. Laporan adalah output utama VA yang akan disampaikan kepada manajemen dan tim teknis.",
        hint: "Struktur laporan VA yang baik: (1) Executive Summary — ringkasan risiko keseluruhan dalam 1 halaman, (2) Scope & Methodology — sistem yang dinilai dan tools yang digunakan, (3) Findings Summary — tabel semua temuan dengan prioritas, (4) Detailed Findings — untuk setiap CVE: deskripsi, bukti, dampak, remediasi, (5) Appendix — output raw scanner. Gunakan bahasa bisnis di Executive Summary, bahasa teknis di Detailed Findings.",
        screenshotNote: "Screenshot halaman cover dan Executive Summary laporan yang telah selesai. Laporan final harus dikirim sebagai file PDF.",
        warningNote: "Laporan VA mengandung informasi sensitif tentang kerentanan sistem. Pastikan laporan disimpan dan ditransmisikan secara aman, hanya kepada pihak yang berwenang."
      }
    ],
    deliverable: "Laporan Vulnerability Assessment lengkap dalam format PDF mencakup: (1) Executive Summary, (2) Daftar service yang ditemukan, (3) Daftar kerentanan dengan CVE ID dan CVSS Score, (4) Matriks prioritisasi, (5) Rekomendasi remediasi, dan (6) Appendix dengan output raw scanner. Dikumpulkan via LMS dalam 1 minggu."
  },
  caseStudy: {
    title: "Eksploitasi Zero-Day pada Endpoint Rumah Sakit",
    scenario: "Rumah Sakit Bina Sehat mengalami insiden keamanan di mana workstation departemen radiologi terinfeksi malware yang berhasil melewati antivirus berbasis signature. Investigasi awal menunjukkan bahwa malware memanfaatkan zero-day vulnerability pada software DICOM viewer yang belum memiliki patch tersedia. Data rekam medis 15.000 pasien terancam kebocoran.",
    questions: [
      "Mengapa antivirus berbasis signature gagal mendeteksi ancaman ini, dan solusi endpoint security apa yang seharusnya ada untuk mendeteksi zero-day malware?",
      "Langkah-langkah apa yang harus segera diambil tim IT security untuk mengisolasi dan menangani insiden ini sambil memastikan operasional rumah sakit tetap berjalan?",
      "Bagaimana proses vulnerability assessment seharusnya dilakukan pada sistem DICOM viewer secara reguler, dan metrik apa yang digunakan untuk memprioritaskan patch?",
      "Jelaskan kontrol keamanan berlapis (defense-in-depth) yang idealnya harus ada di rumah sakit untuk mencegah insiden serupa, merujuk pada standar ISO 27001 yang relevan."
    ]
  },
  caseStudyPool: [
    {
      title: "Zero-Day Exploit pada Endpoint Rumah Sakit",
      scenario: "Rumah Sakit Bina Sehat mengalami insiden di mana workstation departemen radiologi terinfeksi malware yang melewati antivirus berbasis signature melalui zero-day vulnerability pada software DICOM viewer. Investigasi menunjukkan malware aktif selama 3 minggu sebelum terdeteksi melalui anomali perilaku pada HIPS alert, dengan potensi eksposur data rekam medis 15.000 pasien.",
      questions: [
        "Mengapa solusi antivirus signature-based gagal mendeteksi ancaman ini, dan teknologi endpoint security apa yang seharusnya melengkapinya?",
        "Bagaimana tim IR harus mengisolasi endpoint yang terinfeksi tanpa mengganggu operasional radiologi yang kritis untuk pasien?",
        "Rancang proses vulnerability assessment reguler untuk sistem medis terspesialisasi seperti DICOM viewer yang sering memiliki siklus patch lambat.",
        "Kontrol ISO 27001 mana yang paling relevan untuk mencegah insiden ini, dan bagaimana seharusnya diimplementasikan di lingkungan rumah sakit?"
      ]
    },
    {
      title: "Ransomware Melewati Kontrol Endpoint Bank",
      scenario: "Bank Nusantara Mandiri mengalami serangan ransomware yang berhasil mengenkripsi 230 workstation di cabang-cabang utama meskipun memiliki solusi antivirus enterprise. Penyerang masuk melalui exploit pada VPN client yang belum dipatch (CVE dengan CVSS 9.8) dan menggunakan teknik lateral movement selama 2 minggu sebelum mengaktifkan enkripsi massal pada pukul 03.00 WIB.",
      questions: [
        "Bagaimana CVSS score 9.8 pada CVE VPN client ini seharusnya memicu respons patch darurat, dan apa proses SLA patching yang seharusnya ada?",
        "Teknik endpoint protection apa (EDR, application whitelisting, HIPS) yang dapat mencegah fase lateral movement selama 2 minggu tersebut?",
        "Jelaskan vulnerability assessment yang seharusnya dilakukan secara rutin untuk infrastruktur perbankan agar kerentanan kritis tidak terlewat.",
        "Dari perspektif ISMS dan ISO 27001, kegagalan kontrol mana yang menyebabkan insiden ini dan bagaimana program perbaikannya?"
      ]
    },
    {
      title: "Eksploitasi CVE pada Sistem E-Government",
      scenario: "Dinas Kependudukan dan Catatan Sipil Kota Mandiri mengalami kebocoran data 2 juta rekam kependudukan melalui eksploitasi CVE-2021-26855 (CVSS 9.8) pada Microsoft Exchange Server yang belum dipatch selama 4 bulan. Penyerang menggunakan webshell untuk melakukan persistent access dan secara bertahap mengekstrak data selama 6 minggu tanpa terdeteksi.",
      questions: [
        "Jelaskan mengapa patch yang memiliki CVSS 9.8 tidak diaplikasikan selama 4 bulan dan bagaimana kebijakan patch management pemerintah seharusnya dirancang.",
        "Bagaimana solusi endpoint security (EDR) seharusnya dapat mendeteksi webshell yang dipasang oleh penyerang pada server Exchange?",
        "Lakukan vulnerability assessment framework sederhana untuk infrastruktur e-government dengan memprioritaskan sistem yang mengolah data kependudukan.",
        "Implikasi hukum dan regulasi apa (UU ITE, PP PSTE) yang berlaku atas kebocoran data kependudukan ini dan bagaimana ISMS membantu kepatuhan?"
      ]
    },
    {
      title: "Malware pada Endpoint Universitas",
      scenario: "Universitas Teknologi Nusantara menemukan bahwa 47 komputer laboratorium terinfeksi cryptominer yang memanfaatkan resource CPU mahasiswa untuk mining cryptocurrency. Malware masuk melalui software bajakan yang diunduh mahasiswa dan menggunakan teknik process hollowing untuk menyembunyikan diri dari Task Manager. Infeksi berdampak pada kinerja jaringan kampus dan potensi akses ke data akademik.",
      questions: [
        "Jelaskan teknik process hollowing dan mengapa teknik ini sulit dideteksi oleh antivirus tradisional namun dapat dideteksi oleh HIPS atau EDR.",
        "Rancang kebijakan application whitelisting untuk laboratorium komputer universitas yang menyeimbangkan keamanan dengan kebutuhan akademik yang beragam.",
        "Bagaimana melakukan vulnerability assessment pada 500 workstation laboratorium secara efisien dengan resource IT terbatas?",
        "Kontrol endpoint security apa yang tepat untuk lingkungan universitas di mana mahasiswa memiliki akses fisik ke perangkat?"
      ]
    },
    {
      title: "Supply Chain Attack pada Platform E-Commerce",
      scenario: "Platform e-commerce TokoBelanja.id mengalami kompromi pada library NPM pihak ketiga yang menyuntikkan kode berbahaya ke dalam aplikasi web. Kode berbahaya mencuri data kartu kredit dari sisi klien (formjacking) dan telah aktif selama 3 minggu, mempengaruhi transaksi lebih dari 50.000 pelanggan. Insiden baru terdeteksi setelah laporan kecurangan kartu kredit massal.",
      questions: [
        "Jelaskan bagaimana serangan supply chain via library NPM terjadi dan mengapa mekanisme endpoint security tradisional sulit mendeteksinya.",
        "Bagaimana vulnerability assessment untuk komponen third-party (library, API) seharusnya diintegrasikan ke dalam pipeline CI/CD e-commerce?",
        "Kontrol keamanan aplikasi apa (SRI — Subresource Integrity, CSP — Content Security Policy) yang dapat mencegah eksekusi kode formjacking?",
        "Dari perspektif ISMS, bagaimana manajemen risiko vendor dan supply chain seharusnya diatur dalam kebijakan keamanan perusahaan e-commerce?"
      ]
    },
    {
      title: "Endpoint Exploitation pada Pabrik Manufaktur",
      scenario: "PT Maju Bersama Manufacturing mengalami serangan pada workstation engineering yang menjalankan software SCADA untuk mengontrol lini produksi. Penyerang mengeksploitasi kerentanan pada Siemens WinCC (CVE dengan CVSS 8.1) dan berhasil mengakses sistem OT (Operational Technology), menyebabkan penghentian lini produksi selama 18 jam dan kerugian Rp 2,3 miliar.",
      questions: [
        "Apa tantangan unik dalam menerapkan endpoint security pada lingkungan OT/ICS dibandingkan lingkungan IT konvensional, terutama terkait patch management?",
        "Bagaimana vulnerability assessment pada sistem SCADA harus dilakukan dengan hati-hati untuk menghindari gangguan pada operasi produksi?",
        "Jelaskan pendekatan network segmentation (air gap, DMZ) untuk melindungi jaringan OT dari ancaman yang berasal dari jaringan IT.",
        "Standar keamanan ICS apa (IEC 62443, NIST SP 800-82) yang relevan dan bagaimana hubungannya dengan ISO 27001 untuk lingkungan manufaktur?"
      ]
    },
    {
      title: "Unauthorized Application pada Operator Telekomunikasi",
      scenario: "Operator telekomunikasi PT Nusa Koneksi menemukan bahwa seorang engineer jaringan menginstal software remote access tool (RAT) yang tidak diizinkan pada server konfigurasi jaringan inti. Software tersebut digunakan untuk memfasilitasi akses jarak jauh dari pihak eksternal tanpa sepengetahuan manajemen, membahayakan konfigurasi infrastruktur yang melayani 5 juta pelanggan.",
      questions: [
        "Bagaimana solusi Application Whitelisting dapat mencegah instalasi unauthorized software pada server kritis, dan apa trade-off administrasinya?",
        "Jelaskan proses vulnerability assessment yang harus mencakup deteksi unauthorized software (rogue software inventory) sebagai bagian dari pemeriksaan keamanan rutin.",
        "Dari perspektif HIPS/EDR, perilaku apa yang seharusnya memicu alert saat RAT terhubung ke server eksternal yang tidak dikenal?",
        "Kontrol ISMS (ISO 27001 Annex A) mana yang secara spesifik mengatur penggunaan software dan akses remote oleh karyawan internal?"
      ]
    },
    {
      title: "Ransomware via Endpoint pada Startup Teknologi",
      scenario: "Startup fintech BayarMudah.io mengalami serangan ransomware LockBit 3.0 yang mengenkripsi seluruh data developer termasuk source code aplikasi, database pelanggan, dan dokumentasi internal. Vektor masuk adalah melalui endpoint developer yang menggunakan laptop pribadi (BYOD) untuk terhubung ke VPN perusahaan tanpa MDM (Mobile Device Management) atau EDR yang terpasang.",
      questions: [
        "Apa risiko keamanan khusus dari kebijakan BYOD tanpa kontrol endpoint management, dan bagaimana MDM/EMM membantu memitigasinya?",
        "Bagaimana startup dengan resource terbatas dapat mengimplementasikan endpoint protection yang efektif dan cost-efficient menggunakan solusi cloud-native?",
        "Jelaskan bagaimana vulnerability assessment pada lingkungan BYOD berbeda dari aset yang dimiliki perusahaan dan tantangan teknisnya.",
        "Rancang kebijakan backup dan business continuity yang dapat meminimalkan dampak ransomware terhadap startup yang sangat bergantung pada data digital."
      ]
    },
    {
      title: "CVE Exploitation pada Sistem Logistik",
      scenario: "Perusahaan logistik NusaKargo Ekspres mengalami kebocoran data tracking pengiriman 800.000 paket melalui eksploitasi SQL injection (CVE dengan CVSS 9.3) pada portal pelanggan berbasis web. Selain data tracking, penyerang juga berhasil mengakses data personal pengirim dan penerima. Kerentanan telah ada selama 2 tahun tanpa pernah dilakukan vulnerability assessment.",
      questions: [
        "Jelaskan mengapa kerentanan SQL injection dengan CVSS 9.3 pada aplikasi web publik memiliki prioritas patching tertinggi dan dampak bisnis yang signifikan.",
        "Rancang program vulnerability assessment komprehensif untuk perusahaan logistik yang mencakup web application, API, mobile app, dan infrastruktur backend.",
        "Bagaimana implementasi WAF (Web Application Firewall) sebagai kontrol kompensasi dapat mengurangi risiko sebelum patch tersedia?",
        "Apa kewajiban pelaporan insiden berdasarkan UU Perlindungan Data Pribadi Indonesia untuk kasus kebocoran data pelanggan dalam skala ini?"
      ]
    },
    {
      title: "Malware pada Endpoint PLTU",
      scenario: "PLTU Nusantara Power mengalami insiden keamanan di mana workstation control room terinfeksi malware Industroyer-variant yang mencoba memanipulasi sistem kontrol generator. Malware masuk melalui USB drive yang terkontaminasi yang digunakan oleh teknisi lapangan dan bertahan selama 10 hari sebelum terdeteksi oleh anomali pada sistem kontrol. Insiden hampir menyebabkan blackout regional.",
      questions: [
        "Bagaimana kebijakan penggunaan removable media (USB policy) dan endpoint DLP dapat mencegah vektor serangan melalui USB drive terkontaminasi?",
        "Jelaskan tantangan menerapkan vulnerability assessment pada sistem kontrol industri (ICS/SCADA) di pembangkit listrik yang tidak boleh dimatikan untuk patching.",
        "Endpoint protection control apa yang tepat untuk air-gapped OT network di lingkungan PLTU, di mana solusi cloud-based tidak dapat digunakan?",
        "Bagaimana rencana incident response untuk serangan malware pada infrastruktur kritis energi harus dirancang, merujuk pada regulasi BSSN untuk sektor energi?"
      ]
    },
    {
      title: "Data Exfiltration via Endpoint TV Nasional",
      scenario: "Stasiun TV Nasional Cakrawala mengalami kebocoran naskah siaran dan data kontrak eksklusif melalui endpoint komputer produksi yang terinfeksi spyware. Spyware menggunakan teknik steganografi untuk menyembunyikan data yang dikirim dalam file gambar biasa yang diunggah ke layanan cloud storage. Kebocoran baru diketahui setelah kompetitor menayangkan konten serupa 48 jam sebelum jadwal tayang.",
      questions: [
        "Jelaskan teknik steganografi dalam konteks data exfiltration dan bagaimana solusi DLP (Data Loss Prevention) dapat mendeteksi teknik ini.",
        "Bagaimana endpoint security policy harus mengatur penggunaan layanan cloud storage personal pada komputer kerja untuk mencegah exfiltration tidak sah?",
        "Rancang proses vulnerability assessment dan security hardening untuk workstation produksi yang menyeimbangkan produktivitas kreatif dengan keamanan informasi.",
        "Kontrol teknis dan administratif apa yang dapat diimplementasikan untuk melindungi intellectual property (IP) di lingkungan media dan broadcasting?"
      ]
    },
    {
      title: "Endpoint Attack pada Firma Hukum",
      scenario: "Firma hukum Citra & Partners mengalami kebocoran dokumen legal rahasia termasuk strategi litigasi dan informasi klien korporat melalui serangan spear phishing yang menargetkan partner senior. Email phishing yang sangat meyakinkan menginstal keylogger dan RAT pada laptop partner, memberikan penyerang akses penuh selama 3 minggu termasuk akses ke sistem manajemen kasus.",
      questions: [
        "Jelaskan mengapa eksekutif senior (C-level, partner) sering menjadi target spear phishing yang lebih sulit dilindungi dibandingkan karyawan biasa.",
        "Bagaimana kontrol endpoint yang berbeda (EDR, email gateway, MFA, privileged access workstation) dapat bekerja bersama untuk melindungi akun high-value target?",
        "Vulnerability assessment seperti apa yang harus dilakukan firma hukum secara berkala, mengingat sensitivitas data klien dan regulasi kerahasiaan profesi?",
        "Rancang kebijakan endpoint security yang sesuai untuk firma hukum dengan mempertimbangkan kebutuhan mobilitas (work-from-anywhere) para attorney."
      ]
    },
    {
      title: "Ransomware pada Sistem Asuransi",
      scenario: "Perusahaan asuransi PT Jaga Lindungi mengalami serangan ransomware BlackCat yang mengenkripsi sistem pemrosesan klaim dan database polis 2 juta nasabah. Penyerang menggunakan teknik 'double extortion' — mengancam memublikasikan data nasabah sensitif jika tebusan tidak dibayar. Operasional pembayaran klaim terhenti selama 5 hari, menyebabkan tekanan regulasi dari OJK.",
      questions: [
        "Bagaimana CVSS environmental score dapat digunakan untuk memprioritaskan patching pada sistem pemrosesan klaim yang menyimpan data nasabah sensitif?",
        "Jelaskan strategi backup 3-2-1 yang immutable untuk melindungi data perusahaan asuransi dari dampak ransomware double extortion.",
        "Kontrol endpoint dan network security apa yang dapat mendeteksi dan memblokir tahap lateral movement dan pre-encryption reconnaissance dari ransomware modern?",
        "Apa kewajiban perusahaan asuransi kepada OJK dan nasabah terkait insiden ransomware ini, dan bagaimana ISMS mendukung kepatuhan regulasi sektor keuangan?"
      ]
    },
    {
      title: "Malware pada Endpoint Perusahaan Properti",
      scenario: "Pengembang properti besar Graha Nusantara Group mengalami kebocoran data calon pembeli properti melalui malware infostealerque yang menginfeksi komputer agen penjualan. Malware mencuri kredensial login, data KTP, NPWP, dan informasi keuangan dari sistem CRM properti. Penyerang menjual data 25.000 prospek pembeli di dark web, menyebabkan kerugian reputasi dan hukum yang signifikan.",
      questions: [
        "Jelaskan cara kerja malware infostealer modern dan bagaimana behavioral detection pada EDR dapat mengidentifikasi aktivitas credential harvesting.",
        "Bagaimana vulnerability assessment pada sistem CRM yang menyimpan data properti sensitif harus mencakup penilaian keamanan aplikasi web dan database?",
        "Rancang program endpoint hardening untuk komputer agen penjualan yang sering bekerja mobile dan menggunakan jaringan WiFi publik.",
        "Bagaimana implementasi Zero Trust Architecture dapat mengurangi risiko akibat compromise endpoint agen penjualan terhadap seluruh sistem CRM perusahaan?"
      ]
    },
    {
      title: "Endpoint Attack pada Lembaga Zakat",
      scenario: "Lembaga Amil Zakat Nasional Berkah mengalami insiden di mana server pembayaran zakat online dieksploitasi melalui kerentanan pada plugin WordPress (CVE dengan CVSS 8.8) yang memungkinkan remote code execution. Penyerang memasang cryptominer di server dan mengalihkan sebagian dana donasi ke rekening tidak resmi. Insiden berlangsung selama 2 minggu sebelum terdeteksi melalui anomali beban server.",
      questions: [
        "Bagaimana proses vulnerability assessment pada platform donasi online berbasis WordPress harus dijalankan secara rutin termasuk pemeriksaan plugin dan tema pihak ketiga?",
        "Jelaskan mengapa CVSS 8.8 pada plugin WordPress merupakan prioritas patching kritis untuk situs yang mengelola transaksi keuangan langsung.",
        "Kontrol keamanan aplikasi web apa (WAF, CSP, file integrity monitoring) yang harus diterapkan pada server lembaga zakat untuk mencegah modifikasi tidak sah?",
        "Bagaimana program security awareness dan vulnerability disclosure policy dapat membantu lembaga non-profit dengan anggaran IT terbatas meningkatkan postur keamanannya?"
      ]
    }
  ],
  quiz: [
    {
      id: 1,
      question: "Sebuah workstation di perusahaan Anda terinfeksi malware yang tidak dapat dideteksi oleh antivirus berbasis signature. Teknologi deteksi apa yang paling tepat untuk mendeteksi jenis ancaman ini?",
      type: "multiple-choice",
      options: [
        "Memperbarui database signature antivirus ke versi terbaru",
        "Menggunakan behavioral detection yang memantau aktivitas abnormal saat runtime",
        "Memasang firewall tambahan di perimeter jaringan",
        "Melakukan scanning manual menggunakan command line tools"
      ],
      answer: "Menggunakan behavioral detection yang memantau aktivitas abnormal saat runtime"
    },
    {
      id: 2,
      question: "Apa perbedaan utama antara Vulnerability Assessment (VA) dan Penetration Testing (Pentest)?",
      type: "multiple-choice",
      options: [
        "VA menggunakan tools otomatis sedangkan Pentest dilakukan manual sepenuhnya",
        "VA mengidentifikasi kerentanan tanpa mengeksploitasi, Pentest secara aktif mengeksploitasi untuk membuktikan dampak",
        "VA dilakukan oleh tim internal sedangkan Pentest selalu oleh pihak eksternal",
        "VA lebih mahal dan membutuhkan lebih banyak waktu dibandingkan Pentest"
      ],
      answer: "VA mengidentifikasi kerentanan tanpa mengeksploitasi, Pentest secara aktif mengeksploitasi untuk membuktikan dampak"
    },
    {
      id: 3,
      question: "Sebuah kerentanan memiliki CVSS v3.1 Base Score 9.8 dengan Attack Vector: Network, Attack Complexity: Low, dan Privileges Required: None. Berapa lama maksimum waktu yang direkomendasikan untuk menerapkan patch?",
      type: "multiple-choice",
      options: [
        "Dalam 90 hari sesuai SLA standar",
        "Dalam 30 hari karena termasuk kategori High",
        "Dalam 24-48 jam karena termasuk kategori Critical",
        "Dalam 7 hari karena memerlukan pengujian patch terlebih dahulu"
      ],
      answer: "Dalam 24-48 jam karena termasuk kategori Critical"
    },
    {
      id: 4,
      question: "HIPS (Host-based Intrusion Prevention System) mendeteksi bahwa Microsoft Word.exe sedang meluncurkan PowerShell dengan argumen terenkripsi Base64. Ini adalah indikator dari teknik serangan apa?",
      type: "multiple-choice",
      options: [
        "Brute force attack pada password akun local",
        "Living-off-the-Land (LOtL) — memanfaatkan tools bawaan OS untuk menjalankan payload berbahaya",
        "SQL Injection pada aplikasi database",
        "DDoS attack dari botnet eksternal"
      ],
      answer: "Living-off-the-Land (LOtL) — memanfaatkan tools bawaan OS untuk menjalankan payload berbahaya"
    },
    {
      id: 5,
      question: "Perintah Linux apa yang digunakan untuk melihat semua port yang sedang dalam kondisi listening beserta nama proses yang memilikinya?",
      type: "multiple-choice",
      options: [
        "netstat -ano",
        "sudo ss -tulnp",
        "nmap -sV localhost",
        "ps aux | grep LISTEN"
      ],
      answer: "sudo ss -tulnp"
    },
    {
      id: 6,
      question: "Dalam framework ISO/IEC 27001, pendekatan PDCA digunakan untuk ISMS. Apa yang dimaksud dengan fase 'Check' dalam siklus ini?",
      type: "multiple-choice",
      options: [
        "Merencanakan kontrol keamanan yang akan diimplementasikan",
        "Menerapkan kebijakan dan prosedur keamanan yang telah direncanakan",
        "Memantau, mengukur, menganalisis, dan mengevaluasi efektivitas ISMS",
        "Mengambil tindakan korektif dan perbaikan berkelanjutan"
      ],
      answer: "Memantau, mengukur, menganalisis, dan mengevaluasi efektivitas ISMS"
    },
    {
      id: 7,
      question: "Application Whitelisting adalah salah satu kontrol endpoint yang paling efektif. Apa kelemahan utama penerapannya dalam praktik?",
      type: "multiple-choice",
      options: [
        "Tidak dapat memblokir malware yang menggunakan teknik injection",
        "Overhead administrasi tinggi karena setiap aplikasi baru harus disetujui dan ditambahkan ke whitelist",
        "Memerlukan koneksi internet yang stabil untuk memverifikasi aplikasi",
        "Hanya tersedia untuk sistem operasi Windows"
      ],
      answer: "Overhead administrasi tinggi karena setiap aplikasi baru harus disetujui dan ditambahkan ke whitelist"
    },
    {
      id: 8,
      question: "Apa perbedaan antara metrik CVSS Base Score, Temporal Score, dan Environmental Score? Jelaskan kapan dan mengapa Environmental Score penting bagi tim keamanan sebuah organisasi.",
      type: "essay",
      answer: "CVSS Base Score mengukur karakteristik intrinsik dan tetap dari kerentanan (seberapa mudah dieksploitasi dan dampaknya) yang tidak berubah seiring waktu atau konteks. Temporal Score menyesuaikan Base Score berdasarkan faktor yang dapat berubah seperti ketersediaan exploit publik, tingkat kepastian kerentanan, dan status remediasi. Environmental Score menyesuaikan lebih lanjut berdasarkan konteks spesifik organisasi: nilai bisnis aset yang rentan, kontrol keamanan yang sudah ada (mitigating factors), dan persyaratan CIA khusus organisasi. Environmental Score penting karena sebuah CVE dengan Base Score 9.8 pada sistem yang tidak terhubung internet dan dilindungi kontrol tambahan mungkin memiliki prioritas lebih rendah dibandingkan CVE dengan Base Score 7.0 pada sistem kritis yang terekspos publik."
    },
    {
      id: 9,
      question: "Jelaskan konsep defense-in-depth pada endpoint security. Mengapa satu lapisan perlindungan saja tidak cukup, dan bagaimana minimal tiga lapisan yang berbeda dapat bekerja secara sinergis untuk melindungi sebuah workstation perusahaan?",
      type: "essay",
      answer: "Defense-in-depth adalah strategi keamanan berlapis di mana multiple kontrol keamanan yang berbeda digunakan secara bersamaan sehingga tidak ada single point of failure. Pada endpoint: Lapisan 1 (Perimeter) — firewall host-based memblokir koneksi masuk yang tidak diizinkan; Lapisan 2 (Antimalware) — kombinasi signature+behavioral+heuristic detection memblokir malware diketahui dan tidak diketahui; Lapisan 3 (HIPS/EDR) — memantau perilaku runtime dan memblokir aktivitas mencurigakan bahkan dari software yang dianggap 'bersih'; Lapisan 4 (Application Control) — whitelisting memastikan hanya aplikasi terotorisasi yang berjalan; Lapisan 5 (Patching) — kerentanan yang diketahui ditutup sebelum dapat dieksploitasi. Sinergi terjadi ketika malware yang lolos dari signature-based AV masih dapat ditangkap oleh HIPS karena perilaku mencurigakannya, sementara aplikasi whitelisting mencegah eksekusi payload bahkan jika penyerang mendapatkan code execution."
    },
    {
      id: 10,
      question: "Sebuah perusahaan manufaktur ingin melakukan Vulnerability Assessment pada sistem OT/SCADA mereka. Apa tantangan khusus yang membedakannya dari VA pada sistem IT konvensional?",
      type: "essay",
      answer: "Tantangan VA pada OT/SCADA: (1) Downtime tidak dapat diterima — sistem kontrol produksi tidak dapat dimatikan untuk maintenance, berbeda dengan server IT; (2) Sistem legacy — banyak komponen OT menggunakan OS yang sudah end-of-life (Windows XP, dll) yang tidak mendapat patch; (3) Scanner dapat merusak sistem — aktif scanning Nmap pada PLC atau RTU dapat menyebabkan crash atau perilaku tak terduga; (4) Protokol proprietary — sistem SCADA menggunakan protokol khusus (Modbus, DNP3, OPC) yang tidak dipahami scanner standar; (5) Waktu respons real-time — OT memiliki persyaratan deterministic response yang bisa terganggu oleh traffic scanning; (6) Isolasi fisik — air-gapped systems tidak dapat dipindai dari jarak jauh. Pendekatan yang tepat: passive monitoring/sniffing, vendor assessment, scheduled maintenance window scanning, dan penggunaan scanner khusus OT seperti Claroty, Dragos, atau Tenable.OT."
    },
    {
      id: 11,
      question: "Apa yang dimaksud dengan sandboxing dalam konteks endpoint security, dan bagaimana malware canggih dapat mendeteksi bahwa dirinya sedang berjalan dalam sandbox?",
      type: "essay",
      answer: "Sandboxing adalah teknik yang mengisolasi eksekusi aplikasi dalam lingkungan virtual terkontrol yang terpisah dari sistem host, memungkinkan analisis perilaku malware yang aman. Sandbox mencatat semua aktivitas: panggilan API, modifikasi file/registry, koneksi jaringan, dan proses anak. Malware canggih menggunakan teknik sandbox evasion: (1) Time delay — menunggu beberapa menit/jam sebelum aktivasi, karena sandbox biasanya hanya monitor 2-5 menit; (2) Human interaction check — menunggu klik mouse, pergerakan kursor, atau ketikan keyboard; (3) Environment checks — memeriksa jumlah core CPU (sandbox biasanya 1-2 core), RAM (sandbox biasanya < 4GB), resolusi layar, nama hostname, atau proses yang berjalan (VMware tools, VirtualBox Guest Additions); (4) Sleep API calls — menggunakan NtDelayExecution dengan waktu sangat panjang; (5) Geolocation check — hanya aktif di IP dari negara target."
    },
    {
      id: 12,
      question: "Sebuah administrator menerima laporan dari Nmap bahwa sebuah server menjalankan OpenSSH versi 7.2 yang memiliki CVE-2016-3115 dengan CVSS Base Score 5.5 (Medium) dan CVE-2023-38408 dengan CVSS Base Score 9.8 (Critical). Jelaskan strategi prioritisasi dan langkah-langkah remediasi yang harus diambil.",
      type: "essay",
      answer: "Strategi prioritisasi: CVE-2023-38408 dengan CVSS 9.8 (Critical) harus ditangani dalam 24-48 jam karena Attack Vector Network, Attack Complexity Low, Privileges Required None menunjukkan risiko eksploitasi langsung dari internet tanpa autentikasi. CVE-2016-3115 dengan CVSS 5.5 (Medium) dapat ditangani dalam 30 hari. Langkah remediasi: (1) Isolasi sementara jika server tidak kritis — tambahkan firewall rule untuk membatasi akses SSH hanya dari IP manajemen tertentu; (2) Identifikasi versi OpenSSH yang tersedia: apt-cache policy openssh-server; (3) Update OpenSSH: apt-get update && apt-get upgrade openssh-server; (4) Verifikasi versi baru: ssh -V; (5) Restart service: systemctl restart ssh; (6) Test fungsionalitas; (7) Dokumentasikan patch dalam vulnerability tracker; (8) Laporkan ke manajemen bahwa Critical CVE telah diremediasi. Kontrol kompensasi selama menunggu patch: nonaktifkan fitur yang rentan jika memungkinkan, monitor log SSH untuk indikator eksploitasi."
    },
    {
      id: 13,
      question: "Dalam konteks ISO 27001, apa yang dimaksud dengan 'Statement of Applicability (SoA)' dan mengapa dokumen ini penting dalam audit sertifikasi ISMS?",
      type: "multiple-choice",
      options: [
        "Laporan audit internal yang mencatat semua temuan ketidaksesuaian dalam sistem keamanan",
        "Dokumen yang menjelaskan kontrol keamanan Annex A mana yang diterapkan, mana yang dikecualikan, dan alasan setiap keputusan tersebut",
        "Pernyataan tertulis dari top management tentang komitmen terhadap keamanan informasi",
        "Daftar semua aset informasi yang harus dilindungi sesuai hasil risk assessment"
      ],
      answer: "Dokumen yang menjelaskan kontrol keamanan Annex A mana yang diterapkan, mana yang dikecualikan, dan alasan setiap keputusan tersebut"
    }
  ],
  videoResources: [
    {
      title: "Endpoint Security: Defense in Depth Explained",
      youtubeId: "dH_SjCsZtWw",
      description: "Penjelasan komprehensif tentang strategi pertahanan berlapis untuk perlindungan endpoint modern.",
      language: "en",
      duration: "14:22"
    },
    {
      title: "CVSS Score Explained — How to Calculate Vulnerability Severity",
      youtubeId: "vzWzQhGewb8",
      description: "Panduan langkah demi langkah cara menghitung CVSS v3.1 score untuk setiap kerentanan.",
      language: "en",
      duration: "11:45"
    },
    {
      title: "Nmap Vulnerability Scanning Tutorial",
      youtubeId: "4t4kBkMsDbQ",
      description: "Tutorial praktis penggunaan Nmap dan NSE scripts untuk vulnerability assessment.",
      language: "en",
      duration: "18:30"
    },
    {
      title: "ISO 27001 ISMS Overview — What You Need to Know",
      youtubeId: "FLKfkZoB9wY",
      description: "Pengenalan framework ISO 27001 dan cara membangun ISMS yang efektif di organisasi.",
      language: "en",
      duration: "16:05"
    }
  ]
};
