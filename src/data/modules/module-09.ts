import type { ModuleData, CaseStudyVariant } from '../module-types';

export interface Module09Data extends ModuleData {
  caseStudyPool: CaseStudyVariant[];
}

export const module09: Module09Data = {
  id: 9,
  title: "Traffic Monitoring & Vulnerabilities",
  description: "Network Traffic Monitoring dan Kerentanan TCP/IP",
  iconName: "Eye",

  // ─── THEORY ──────────────────────────────────────────────────────────────────
  theory: [
    {
      title: "Network Traffic Monitoring: Passive vs Active",
      content:
        "Monitoring jaringan adalah proses mengamati, menangkap, dan menganalisis traffic data yang melewati infrastruktur jaringan. Terdapat dua pendekatan utama: Passive Monitoring dan Active Monitoring. Passive Monitoring mengamati traffic tanpa menyuntikkan paket tambahan ke jaringan — teknik ini tidak mengganggu performa jaringan dan tidak terdeteksi oleh penyerang. Active Monitoring sebaliknya mengirimkan paket probe (ping, traceroute, SNMP polling) ke perangkat target untuk mengukur ketersediaan dan latensi secara aktif. Selain kedua pendekatan itu, Flow Analysis (NetFlow/sFlow/IPFIX) memberikan metadata traffic (alamat sumber/tujuan, port, durasi, byte) tanpa menyimpan payload, sehingga jauh lebih ringan dari Full Packet Capture (FPC). Tiga teknologi utama pengumpulan traffic pasif adalah: SPAN Port (Switch Port Analyzer) yang menduplikasi traffic dari port lain; Network TAP (Test Access Point) yang merupakan perangkat hardware inline khusus; dan NetFlow yang merupakan metadata summary dari router/switch.",
      table: {
        caption: "Perbandingan Metode Network Traffic Monitoring",
        headers: ["Metode", "Cara Kerja", "Kelebihan", "Kekurangan", "Use Case"],
        rows: [
          ["SPAN Port", "Mirror traffic ke port monitoring di switch", "Murah, tidak perlu hardware tambahan", "Bisa drop paket saat beban tinggi, jumlah SPAN terbatas", "Lab, monitoring single switch"],
          ["Network TAP", "Hardware inline yang menyalin semua paket secara fisik", "Tidak drop paket, tidak terpengaruh beban switch", "Biaya hardware, perlu pemasangan fisik", "Full packet capture production"],
          ["NetFlow/IPFIX", "Router/switch ekspor metadata aliran per 5-tuple", "Volume data kecil, skalabel untuk jaringan besar", "Tidak ada payload (tidak untuk forensik isi data)", "Anomaly detection, kapasitas planning"],
          ["Full Packet Capture", "Tangkap seluruh paket termasuk payload", "Data terlengkap untuk forensik", "Volume data sangat besar, butuh storage besar", "Incident response, forensik mendalam"],
          ["Agent-based", "Software di endpoint kirim data ke collector", "Visibilitas endpoint, termasuk traffic terenkripsi", "Resource endpoint, perlu manajemen agent", "EDR, endpoint monitoring"],
        ],
      },
      note: "Gunakan kombinasi NetFlow untuk deteksi anomali dan Full Packet Capture untuk investigasi forensik. Jangan hanya mengandalkan satu metode monitoring.",
      noteType: "info",
    },

    {
      title: "Analisis IP Header: Field-Field Penting untuk Keamanan",
      content:
        "IP (Internet Protocol) header versi 4 memiliki panjang minimum 20 byte dan mengandung berbagai field yang penting untuk keamanan jaringan. Pemahaman mendalam tentang field-field ini membantu analis keamanan mendeteksi anomali dan serangan berbasis IP. Wireshark dan tshark dapat mendecode setiap field ini secara visual. Analis SOC harus memperhatikan field seperti TTL (untuk TTL-based attack detection), Protocol (untuk mendeteksi tunneling), Flags & Fragment Offset (untuk fragmentation attack), dan Source/Destination Address (untuk IP spoofing).",
      table: {
        caption: "Field IP Header IPv4 dan Relevansinya untuk Keamanan",
        headers: ["Field", "Ukuran (bit)", "Nilai Normal", "Indikasi Anomali"],
        rows: [
          ["Version", "4", "4 (IPv4)", "Nilai selain 4 atau 6 mencurigakan"],
          ["IHL (Header Length)", "4", "5 (20 byte)", "Nilai > 5 menandakan IP Options — mungkin digunakan untuk record route atau source routing yang rentan"],
          ["DSCP/ToS", "8", "0 (Best Effort)", "Nilai tidak biasa bisa menandakan traffic tunneling atau QoS manipulation"],
          ["Total Length", "16", "Sesuai payload", "Paket sangat kecil atau sangat besar bisa menandakan anomali"],
          ["Identification", "16", "Acak per paket", "ID yang berurutan dapat dieksploitasi untuk OS fingerprinting"],
          ["Flags (DF, MF)", "3", "DF=1 (jangan fragment)", "MF=1 tanpa DF menandakan fragmentation; DF=0 pada UDP mencurigakan"],
          ["Fragment Offset", "13", "0 (tidak terfragmentasi)", "Offset > 0 berarti paket terfragmentasi; Offset = 1 = Teardrop attack"],
          ["TTL", "8", "64 (Linux), 128 (Windows)", "TTL sangat rendah = traceroute/scan; TTL sangat tinggi = ICMP redirect"],
          ["Protocol", "8", "6=TCP, 17=UDP, 1=ICMP", "Protocol 41=IPv6-in-IPv4 tunnel; Protocol 47=GRE tunnel yang mungkin menyembunyikan C2"],
          ["Source Address", "32", "IP pengirim asli", "IP privat sebagai source di internet = spoofing; IP sama dgn destination = land attack"],
          ["Destination Address", "32", "IP penerima", "Broadcast/multicast destination dalam jumlah besar = scanning atau amplification"],
        ],
      },
    },

    {
      title: "IP Vulnerabilities: IP Spoofing dan Fragmentation Attacks",
      content:
        "Protokol IP dirancang tanpa mekanisme autentikasi sumber, menciptakan berbagai kerentanan fundamental. IP Spoofing adalah teknik memalsukan alamat IP sumber dalam header paket. Penyerang menggunakan ini untuk menyembunyikan identitas, melewati ACL berbasis IP, atau sebagai bagian dari serangan amplifikasi (paket dikirim dengan IP korban sebagai source, sehingga respons membanjiri korban). Fragmentation Attack mengeksploitasi cara IP membagi paket besar dan cara target merakitnya kembali. Paket yang sangat kecil atau overlapping fragments dapat membingungkan firewall dan IDS, atau bahkan menyebabkan crash pada sistem target.",
      example: {
        title: "Alur Serangan Fragmentation — Tiny Fragment & Overlapping Fragment",
        steps: [
          "Penyerang membuat paket IP dengan Fragment Offset = 0, More Fragments = 1",
          "Fragment pertama terlalu kecil untuk memuat header TCP/UDP lengkap (hanya 8 byte) — firewall tidak bisa inspect port/flag",
          "Fragment kedua dikirim dengan Fragment Offset = 1 (8 byte) — menimpa bagian header TCP di fragment pertama",
          "Firewall mengizinkan fragment pertama karena tidak terlihat berbahaya",
          "Target OS merakit ulang kedua fragment → menghasilkan paket TCP dengan flag berbahaya yang melewati firewall",
          "Teardrop Attack: Fragment Offset fragment kedua overlapping lebih dari ukuran fragment pertama → target crash saat re-assembly",
        ],
        result: "Mitigasi: Blokir semua paket terfragmentasi di perimeter firewall. Modern OS sudah patch Teardrop, tapi fragmentation-based IDS evasion masih relevan.",
      },
      keyPoints: [
        "IP Spoofing dimungkinkan karena IP tidak memverifikasi identitas sumber — gunakan BCP38/uRPF untuk filter IP spoofing di router",
        "Smurf Attack: ICMP echo ke broadcast address dengan source IP = korban → semua host di subnet balas ke korban",
        "Tiny Fragment Attack: fragment pertama terlalu kecil untuk memuat header TCP lengkap, sehingga mengecoh packet filter",
        "Overlapping Fragment: Fragment kedua menimpa (overlap) isi fragment pertama, mengubah isi paket setelah melewati firewall",
        "IP Options seperti Loose/Strict Source Routing memungkinkan penyerang menentukan jalur routing — harus diblokir di perimeter",
      ],
    },

    {
      title: "TCP Vulnerabilities: SYN Flood, Session Hijacking, RST Attack",
      content:
        "TCP (Transmission Control Protocol) menyediakan komunikasi yang andal melalui mekanisme 3-way handshake, sequencing, dan acknowledgment. Namun mekanisme ini justru menciptakan celah keamanan. SYN Flood mengeksploitasi incomplete 3-way handshake: penyerang mengirim ribuan SYN dengan IP source palsu, server mengalokasikan half-open connection state, dan karena SYN-ACK tidak pernah dijawab ACK, slot koneksi habis (SYN backlog overflow). TCP Session Hijacking memanfaatkan fakta bahwa TCP sequence number bisa diprediksi — penyerang yang mampu sniff atau memprediksi sequence number dapat menyuntikkan data ke dalam sesi TCP yang sedang berjalan. RST Attack memaksa terminasi koneksi TCP dengan mengirimkan paket RST dengan sequence number yang valid.",
      codeSnippet: `# Wireshark/tshark display filters untuk deteksi TCP vulnerabilities

# 1. SYN Flood Detection — banyak SYN tanpa ACK
tcp.flags.syn==1 && tcp.flags.ack==0

# 2. Retransmission Anomaly — indikasi congestion atau paket loss (DoS?)
tcp.analysis.retransmission || tcp.analysis.fast_retransmission

# 3. Zero Window — receiver kewalahan, bisa indikasi DoS pada endpoint
tcp.analysis.zero_window

# 4. Duplicate ACK — paket out-of-order, bisa indikasi packet injection
tcp.analysis.duplicate_ack

# 5. RST Storm Detection — banyak RST packet ke target yang sama
tcp.flags.reset==1

# 6. Filter kombinasi: SYN dari satu IP ke banyak port (port scan)
tcp.flags.syn==1 && tcp.flags.ack==0 && ip.src==192.168.1.100

# 7. Deteksi Session Hijacking (SEQ number anomali)
tcp.analysis.out_of_order || tcp.analysis.lost_segment

# Analisis volume SYN menggunakan tshark
tshark -r capture.pcap -q -z io,stat,1,"COUNT(tcp.flags.syn)tcp.flags.syn==1&&tcp.flags.ack==0"`,
      note: "SYN Cookie adalah mitigasi utama SYN Flood: server tidak mengalokasikan state hingga 3-way handshake selesai. Aktifkan dengan: echo 1 > /proc/sys/net/ipv4/tcp_syncookies",
      noteType: "warning",
    },

    {
      title: "UDP Vulnerabilities dan Amplification Attacks",
      content:
        "UDP (User Datagram Protocol) tidak memiliki mekanisme handshake atau state, sehingga rentan terhadap serangan berbasis volume. UDP Flood membanjiri target dengan paket UDP ke port acak — target harus memproses setiap paket dan membalas dengan ICMP Port Unreachable jika tidak ada service di port tersebut. Yang lebih berbahaya adalah UDP Amplification Attack: penyerang mengirim query kecil dengan source IP = korban ke server publik yang rentan, server merespons dengan paket jauh lebih besar ke korban. Amplification Factor (faktor penguatan) adalah rasio ukuran respons terhadap ukuran query — semakin besar faktor ini, semakin efisien serangan DDoS tersebut.",
      table: {
        caption: "Faktor Amplifikasi Berbagai Protokol UDP",
        headers: ["Protokol", "Port", "Amplification Factor", "Mitigasi"],
        rows: [
          ["DNS", "53/UDP", "2–28x (EDNS0 bisa sampai 100x)", "Disable open resolver, rate limit DNS response, Response Rate Limiting (RRL)"],
          ["NTP (monlist)", "123/UDP", "556x", "Disable monlist, upgrade NTP, firewall ingress filter"],
          ["SSDP", "1900/UDP", "30x", "Blokir SSDP di perimeter, nonaktifkan UPnP pada router"],
          ["Memcached", "11211/UDP", "10.000–51.000x", "Nonaktifkan UDP pada Memcached, firewall port 11211"],
          ["CLDAP", "389/UDP", "56–70x", "Blokir port 389/UDP di perimeter firewall"],
          ["CHARGEN", "19/UDP", "358x", "Nonaktifkan CHARGEN service (tidak diperlukan)"],
          ["QOTD", "17/UDP", "140x", "Nonaktifkan QOTD service"],
          ["mDNS/Bonjour", "5353/UDP", "2–10x", "Blokir mDNS di perimeter, hanya izinkan untuk link-local"],
        ],
      },
      keyPoints: [
        "Amplification attack = bandwidth amplification + IP spoofing; tanpa spoofing, traffic balik ke penyerang sendiri",
        "Memcached amplification (2018) menghasilkan serangan DDoS terbesar saat itu: 1,7 Tbps ke GitHub",
        "BCP38 (Ingress Filtering) di ISP adalah pertahanan terbaik: blokir paket dengan source IP yang tidak sesuai prefix pelanggan",
        "Rate limiting dan blackholing BGP (RTBH) digunakan ISP untuk mitigasi DDoS skala besar",
        "anycast routing digunakan CDN/DNS provider untuk menyebarkan beban traffic DDoS ke banyak PoP",
      ],
    },

    {
      title: "IP Services Vulnerabilities: ICMP, DNS, DHCP, ARP",
      content:
        "Layanan-layanan fundamental jaringan seperti ICMP, DNS, DHCP, dan ARP memiliki kerentanan yang sering dieksploitasi karena merupakan bagian dari traffic 'normal' yang sulit diblokir sepenuhnya. ICMP dirancang untuk diagnostik jaringan, namun sering disalahgunakan untuk scanning, tunneling data (ICMP Tunnel), atau serangan (ICMP Redirect yang memaksa perubahan routing table). DNS adalah layanan translasi nama domain yang kritis — kerentanannya mencakup Cache Poisoning (memasukkan record palsu ke cache resolver), DNS Tunneling (exfiltration data melalui subdomain query), dan amplifikasi. DHCP rentan terhadap Starvation (menghabiskan pool IP dengan banyak request), Rogue DHCP Server (memberikan gateway/DNS palsu), dan DHCP Spoofing. ARP yang beroperasi di Layer 2 rentan terhadap ARP Poisoning (Spoofing) — mengirim ARP reply palsu untuk mengasosiasikan MAC penyerang dengan IP gateway, memungkinkan Man-in-the-Middle attack.",
      keyPoints: [
        "ICMP Redirect (Type 5): pesan sah untuk optimasi routing, tapi penyerang bisa kirim ICMP Redirect palsu untuk mengalihkan traffic melalui host mereka",
        "ICMP Tunnel: tools seperti 'ptunnel' memungkinkan tunneling TCP/data melalui ICMP echo request/reply — sulit diblokir tanpa inspeksi mendalam",
        "DNS Cache Poisoning (Kaminsky Attack, 2008): mengeksploitasi source port tidak acak untuk injeksi record palsu ke cache DNS resolver",
        "DHCP Starvation menggunakan MAC address acak (tools: Gobbler, Yersinia) untuk menghabiskan seluruh pool DHCP dalam hitungan detik",
        "ARP Poisoning menggunakan Gratuitous ARP atau ARP Reply palsu — tools: arpspoof, ettercap, bettercap",
        "Mitigasi ARP Poisoning: Dynamic ARP Inspection (DAI) di switch, Static ARP entries untuk gateway, 802.1X port authentication",
        "DNS over HTTPS (DoH) dan DNSSEC memberikan enkripsi dan validasi untuk DNS — mitigasi terhadap berbagai serangan DNS",
      ],
      note: "ARP tidak memiliki mekanisme autentikasi sama sekali. Setiap host di segmen yang sama dapat mengirim ARP reply palsu. Dynamic ARP Inspection (DAI) di switch layer 2 adalah pertahanan paling efektif.",
      noteType: "danger",
    },

    {
      title: "Network Baseline dan Anomaly Detection",
      content:
        "Baseline jaringan adalah rekaman kondisi 'normal' dari traffic jaringan pada periode waktu tertentu — mencakup volume traffic, distribusi protokol, top talkers, pola koneksi, dan timing. Dengan memiliki baseline yang baik, analis SOC dapat mendeteksi penyimpangan (anomali) yang mengindikasikan serangan, malware activity, atau misconfiguration. Proses baseline yang baik memerlukan data dari minimal 2 minggu (mencakup variasi weekday/weekend dan jam sibuk/sepi), menggunakan statistik deskriptif (mean, standar deviasi, persentil ke-95), dan diperbarui secara periodik. Anomaly Detection dapat dilakukan secara manual menggunakan tools seperti Wireshark Statistics, atau secara otomatis menggunakan SIEM (threshold alerting, ML-based behavioral analytics).",
      example: {
        title: "Contoh: Baseline Normal vs Traffic Attack",
        steps: [
          "BASELINE NORMAL (kondisi kerja reguler, 09:00–17:00):",
          "  • Volume: 150 Mbps average, 400 Mbps peak",
          "  • Protokol: HTTP/HTTPS 70%, DNS 5%, Email 10%, VoIP 5%, lainnya 10%",
          "  • DNS: ~200 query/menit, rata-rata TTL 300s, mayoritas A record",
          "  • Top talker: tidak ada single IP > 5% total traffic",
          "  • New connections: ~500/menit",
          "",
          "TRAFFIC ANOMALI — SYN Flood Attack:",
          "  • Volume: spike 2,5 Gbps dalam < 30 detik (6x normal peak)",
          "  • TCP SYN packets: 100.000/detik (baseline: ~500/menit)",
          "  • SYN/ACK ratio: mendekati 1:0 (SYN tidak pernah dibalas ACK)",
          "  • Source IP: berasal dari ribuan IP berbeda (botnet) — IP spoofed",
          "  • Destination: semua ke satu IP server web (port 80/443)",
          "",
          "TRAFFIC ANOMALI — DNS Amplification:",
          "  • UDP traffic ke port 53 naik 1000% dari baseline",
          "  • DNS response size rata-rata 3000 byte (baseline: 150 byte)",
          "  • Source: ribuan open resolver publik",
          "  • Destination: IP korban (port acak)",
          "  • DNS query type: ANY record atau TXT record (payload besar)",
        ],
        result: "Deteksi dini: Wireshark Statistics > I/O Graphs dengan overlay SYN count. Alert SIEM: 'SYN rate > 10x baseline selama 60 detik' atau 'DNS response size > 1500 byte'.",
      },
    },
  ],

  // ─── LAB ─────────────────────────────────────────────────────────────────────
  lab: {
    title: "Lab 9: TCP/IP Vulnerability Analysis dengan Wireshark & tshark",
    downloads: [
      {
        name: "Wireshark",
        url: "https://www.wireshark.org/download.html",
        description: "Network protocol analyzer untuk capture dan analisis traffic secara visual.",
      },
      {
        name: "Sample PCAP Files (Malware Traffic Analysis)",
        url: "https://www.malware-traffic-analysis.net/training-exercises.html",
        description: "Koleksi file PCAP untuk latihan analisis traffic berbahaya.",
      },
      {
        name: "CyberOps Workstation VM",
        url: "https://www.netacad.com/",
        description: "VM Linux untuk praktik analisis jaringan (dari Cisco NetAcad).",
      },
    ],
    steps: [
      {
        title: "Baseline Traffic Capture",
        description:
          "Capture traffic normal selama 2 menit sebagai baseline menggunakan tshark. Simpan ke file pcap untuk perbandingan di langkah berikutnya. Pastikan selama capture Anda melakukan aktivitas normal: browsing web, ping ke gateway, dan akses DNS — ini membentuk baseline yang representatif.",
        command: "sudo tshark -i eth0 -a duration:120 -w baseline.pcap",
        expectedOutput:
          "Capturing on 'eth0'\n[...paket ter-capture...]\n120 packets captured",
        hint: "Jalankan aktivitas normal selama capture: buka browser ke beberapa situs, lakukan ping ke gateway (ping -c 10 192.168.1.1). Ini memastikan baseline mencerminkan traffic nyata.",
        screenshotNote: "Screenshot terminal saat tshark berjalan, menunjukkan paket yang ter-capture.",
      },
      {
        title: "Analisis Statistik Baseline",
        description:
          "Gunakan tshark untuk melihat hierarki protokol dari baseline capture. Output menunjukkan distribusi protokol dalam traffic normal — ini adalah komponen kunci dari baseline Anda. Catat persentase masing-masing protokol.",
        command: "tshark -r baseline.pcap -q -z io,phs",
        expectedOutput:
          "===================================================================\nProtocol Hierarchy Statistics\nFilter: \n\neth                                      frames:xxx bytes:xxx\n  ip                                     frames:xxx bytes:xxx\n    tcp                                  frames:xxx bytes:xxx\n      http                               frames:xxx bytes:xxx\n    udp                                  frames:xxx bytes:xxx\n      dns                                frames:xxx bytes:xxx",
        hint: "Perhatikan persentase TCP vs UDP. Baseline normal biasanya 60-80% TCP (HTTP/HTTPS). Jika UDP sangat tinggi tanpa alasan, bisa menandakan anomali.",
        screenshotNote: "Screenshot output hierarki protokol, highlight persentase masing-masing protokol.",
      },
      {
        title: "TCP Stream Analysis",
        description:
          "Buka file baseline.pcap di Wireshark GUI. Temukan paket TCP yang merupakan bagian dari sesi HTTP. Klik kanan pada paket tersebut, pilih 'Follow > TCP Stream'. Amati percakapan HTTP lengkap antara client dan server, termasuk request header dan response body.",
        screenshotNote:
          "Screenshot jendela TCP Stream di Wireshark yang menunjukkan HTTP request (merah) dan HTTP response (biru) lengkap dengan header dan body.",
        hint: "Untuk menemukan HTTP traffic, gunakan display filter 'http' di Wireshark. Klik paket pertama HTTP GET, kemudian klik kanan > Follow > TCP Stream.",
      },
      {
        title: "Display Filter Anomali TCP",
        description:
          "Terapkan display filter berikut di Wireshark untuk mengidentifikasi anomali TCP dalam capture. Filter ini mendeteksi retransmission (paket hilang/drop), duplicate ACK (paket out-of-order), dan zero window (receiver kewalahan). Catat berapa banyak paket yang terdeteksi di baseline.",
        command: "tcp.analysis.retransmission || tcp.analysis.duplicate_ack || tcp.analysis.zero_window",
        expectedOutput:
          "Di baseline normal, jumlah paket anomali sangat sedikit (< 1% total traffic). Jika banyak, ada masalah jaringan atau potensi serangan.",
        hint: "Filter ini adalah display filter Wireshark, bukan perintah terminal. Ketik langsung di kotak filter display di bagian atas Wireshark.",
        screenshotNote: "Screenshot Wireshark dengan filter aktif dan jumlah paket yang terdeteksi di status bar.",
      },
      {
        title: "SYN Flood Detection",
        description:
          "Terapkan display filter berikut untuk mendeteksi paket SYN tanpa ACK. Di traffic normal, SYN diikuti SYN-ACK, kemudian ACK (3-way handshake). Jika ada banyak SYN tanpa completion, ini mengindikasikan SYN Flood. Gunakan Wireshark Statistics > I/O Graphs untuk memvisualisasikan rate SYN packet dari waktu ke waktu.",
        command: "tcp.flags.syn==1 && tcp.flags.ack==0",
        expectedOutput:
          "Di baseline normal, SYN packets ada tapi diikuti dengan SYN-ACK dan ACK. SYN flood: ratusan/ribuan SYN dalam hitungan detik dari satu atau banyak IP tanpa ACK balasan.",
        warningNote:
          "JANGAN melakukan SYN flood di jaringan production atau jaringan publik! Ini ilegal dan dapat menyebabkan gangguan layanan. Gunakan hanya di lab environment yang terisolasi dengan izin eksplisit.",
        hint: "Untuk analisis yang lebih baik, aktifkan Wireshark Statistics > I/O Graphs, tambahkan graph dengan filter 'tcp.flags.syn==1 && tcp.flags.ack==0' dan unit 'Packets/s'.",
        screenshotNote: "Screenshot I/O Graph yang menunjukkan rate SYN packet per detik.",
      },
      {
        title: "Conversation Analysis",
        description:
          "Buka Wireshark Statistics > Conversations. Tab 'IPv4' menunjukkan top talker berdasarkan volume byte. Tab 'TCP' menunjukkan sesi TCP paling aktif. Identifikasi apakah ada IP atau pasangan IP-port yang mendominasi traffic secara tidak wajar. Bandingkan dengan ekspektasi baseline Anda.",
        screenshotNote:
          "Screenshot tab Conversations menunjukkan top 10 IP addresses berdasarkan total bytes, dan top 10 TCP streams. Highlight IP atau stream yang anomali jika ada.",
        hint: "Klik header kolom 'Bytes' untuk sort dari terbesar ke terkecil. Alamat IP yang muncul dalam ribuan stream berbeda dalam waktu singkat adalah tanda scanning atau DDoS.",
      },
      {
        title: "IP Fragmentation Check",
        description:
          "Terapkan display filter berikut untuk menemukan paket IP terfragmentasi. Fragmentation normal terjadi ketika paket melebihi MTU (Maximum Transmission Unit, umumnya 1500 byte di Ethernet). Namun fragmentation berlebihan atau dengan fragment offset yang aneh bisa mengindikasikan fragmentation attack atau upaya IDS evasion.",
        command: "ip.flags.mf==1 || ip.frag_offset > 0",
        expectedOutput:
          "Sedikit paket terfragmentasi di baseline normal (jika ada, biasanya karena paket besar dari video streaming). Banyak paket terfragmentasi ke satu tujuan = potensi fragmentation attack.",
        hint: "Perhatikan field 'Fragment Offset' — nilai 1 (yaitu 8 byte) pada fragment kedua yang overlap dengan fragment pertama adalah tanda Tiny Fragment Attack. Cek juga nilai 'Identification' yang sama pada fragment-fragment dari satu paket.",
        screenshotNote: "Screenshot paket terfragmentasi di Wireshark dengan detail header IP yang menunjukkan flags MF dan fragment offset.",
      },
      {
        title: "Export Findings dan Buat Laporan",
        description:
          "Export paket-paket relevan yang ditemukan selama analisis untuk dokumentasi laporan. Gunakan File > Export Specified Packets, pilih 'Displayed' untuk export hanya paket yang cocok dengan filter aktif. Untuk meng-extract file yang ditransfer melalui HTTP, gunakan File > Export Objects > HTTP.",
        hint: "Gunakan File > Export Objects > HTTP untuk extract gambar, dokumen, atau file yang ditransfer melalui HTTP cleartext — ini berguna untuk memahami data apa yang dapat dilihat penyerang dengan kemampuan sniffing.",
        screenshotNote:
          "Screenshot dialog Export Specified Packets dan hasil export file. Sertakan juga Export Objects jika ada HTTP object yang bisa di-extract.",
        warningNote:
          "File yang di-export mungkin mengandung konten sensitif dari sesi yang ter-capture. Simpan di direktori lab yang aman dan jangan upload ke cloud storage publik.",
      },
    ],
    deliverable:
      "Laporan lab (PDF/Word) berisi: (1) Screenshot baseline traffic dengan statistik protokol; (2) Analisis TCP stream dari percakapan HTTP; (3) Screenshot filter anomali dengan jumlah paket terdeteksi; (4) Analisis SYN packets (normal vs potensi flood); (5) Screenshot Conversation Analysis dengan identifikasi top talker; (6) Analisis paket terfragmentasi; (7) Kesimpulan tentang kondisi keamanan jaringan berdasarkan traffic yang dianalisis.",
  },

  // ─── CASE STUDY (default — primary) ─────────────────────────────────────────
  caseStudy: {
    title: "DDoS Attack pada Layanan Internet Banking",
    scenario:
      "Sebuah bank nasional mengalami serangan DDoS yang melumpuhkan layanan internet banking selama 6 jam pada hari kerja. Serangan menggunakan kombinasi SYN Flood, DNS Amplification, dan UDP Flood yang berasal dari botnet IoT yang terdiri dari lebih dari 50.000 perangkat di seluruh dunia. Tim SOC bank kewalahan dengan alert yang masuk dan sulit membedakan traffic serangan dari traffic pelanggan yang sah.",
    questions: [
      "Jelaskan mekanisme teknis masing-masing vektor serangan (SYN Flood, DNS Amplification, UDP Flood) dan mengapa kombinasi ketiganya sangat efektif dalam melumpuhkan layanan bank.",
      "Mengapa perangkat IoT sering menjadi target rekrutmen botnet DDoS? Sebutkan minimal 5 karakteristik IoT yang membuatnya rentan dan mudah dikompromikan.",
      "Rancang strategi mitigasi berlapis (multi-layer defense) untuk menghadapi serangan DDoS berskala besar — meliputi tindakan di level ISP, perimeter jaringan, dan aplikasi.",
      "Bagaimana tim SOC harus mengelola alert overload selama serangan berlangsung? Jelaskan proses triage dan prioritisasi incident yang tepat.",
    ],
  },

  // ─── CASE STUDY POOL (15 variants) ──────────────────────────────────────────
  caseStudyPool: [
    // 1. Rumah Sakit
    {
      title: "SYN Flood Melumpuhkan Sistem Rekam Medis Rumah Sakit",
      scenario:
        "Rumah Sakit Jantung Nasional mengalami serangan SYN Flood yang melumpuhkan sistem Electronic Health Record (EHR) selama 4 jam di hari Senin pagi. Server EHR menerima 200.000 paket SYN per detik dari ribuan IP yang ter-spoof, menyebabkan SYN backlog overflow dan layanan tidak responsif. Dokter tidak dapat mengakses riwayat medis pasien, dan operasi elektif terpaksa ditunda.",
      questions: [
        "Jelaskan secara teknis mengapa SYN Flood menyebabkan server EHR tidak responsif, kaitkan dengan konsep TCP state machine dan SYN backlog queue.",
        "Bagaimana tim jaringan dapat mendeteksi serangan SYN Flood menggunakan Wireshark filter dan mana metrik yang paling menunjukkan kondisi serangan?",
        "Sebutkan dan jelaskan minimal 3 mekanisme mitigasi SYN Flood yang dapat diimplementasikan di level OS dan level jaringan, termasuk SYN Cookie.",
        "Implikasi apa yang ditimbulkan terhadap keselamatan pasien dan bagaimana BCP (Business Continuity Plan) rumah sakit seharusnya mengantisipasi serangan ini?",
      ],
    },

    // 2. Bank
    {
      title: "DNS Amplification Attack Mengganggu Layanan Transfer Bank",
      scenario:
        "Bank Central Asia mengalami serangan DNS Amplification yang mencapai volume 320 Gbps, mematikan semua layanan internet-facing termasuk mobile banking dan ATM network selama 3 jam. Penyerang menggunakan 15.000 open DNS resolver publik dan mengirim query ANY untuk domain dengan zone file besar, menghasilkan amplification factor rata-rata 60x. Tim NOC bank pertama kali mendeteksi anomali melalui lonjakan traffic UDP ke port 53.",
      questions: [
        "Jelaskan alur teknis serangan DNS Amplification dari perspektif packet flow: dari penyerang, ke open resolver, hingga membanjiri korban.",
        "Mengapa DNS query type ANY dan TXT record menghasilkan amplification factor yang jauh lebih besar dibandingkan query A record biasa?",
        "Bagaimana cara mengidentifikasi bahwa server DNS milik perusahaan tidak menjadi open resolver yang bisa disalahgunakan? Tuliskan perintah pengujian yang tepat.",
        "Rancang arsitektur DNS yang resilient dan aman untuk bank, mencakup anycast routing, Response Rate Limiting (RRL), dan monitoring berbasis anomali.",
      ],
    },

    // 3. Pemerintah
    {
      title: "UDP Flood Menarget Portal Layanan Publik Kementerian",
      scenario:
        "Portal layanan publik Kementerian Dalam Negeri mengalami serangan UDP Flood bertepatan dengan masa pengajuan dokumen kependudukan online. Penyerang mengirimkan 5 juta paket UDP per detik ke port acak server web pemerintah, menyebabkan sistem tidak responsif dan memaksa warga antre secara fisik di kantor kecamatan. Analisis menunjukkan traffic berasal dari IoT botnet yang dikendalikan dari server C2 di luar negeri.",
      questions: [
        "Jelaskan perbedaan mekanisme UDP Flood dibandingkan SYN Flood dari perspektif protokol dan dampaknya terhadap resource server yang diserang.",
        "Bagaimana cara melacak sumber C2 (Command and Control) dari botnet IoT melalui analisis traffic? Sebutkan tool dan teknik yang digunakan.",
        "Apa peran BSSN (Badan Siber dan Sandi Negara) dalam merespons insiden DDoS yang menarget infrastruktur pemerintah? Jelaskan prosedur eskalasi yang tepat.",
        "Rancang strategi pertahanan berlapis untuk portal pemerintah yang mempertimbangkan keterbatasan anggaran dan kompetensi SDM yang khas pada institusi pemerintah.",
      ],
    },

    // 4. Universitas
    {
      title: "TCP Session Hijacking pada Sistem Ujian Online Universitas",
      scenario:
        "Saat pelaksanaan Ujian Akhir Semester online di Universitas Indonesia, seorang mahasiswa berhasil melakukan TCP session hijacking terhadap sesi ujian mahasiswa lain di segmen jaringan Wi-Fi kampus yang sama. Dengan menggunakan tools sniffing dan memprediksi sequence number TCP, pelaku berhasil menyuntikkan jawaban ke sesi korban. Insiden terdeteksi dari anomali pada server log yang menunjukkan dua paket ACK berbeda untuk satu sequence number.",
      questions: [
        "Jelaskan bagaimana TCP session hijacking dapat terjadi secara teknis, termasuk peran sequence number prediction dan kondisi jaringan yang memungkinkan serangan ini.",
        "Filter Wireshark apa yang dapat digunakan untuk mendeteksi indikasi session hijacking dalam capture jaringan? Berikan penjelasan untuk setiap filter.",
        "Mengapa jaringan Wi-Fi open (tanpa enkripsi per-client) jauh lebih rentan terhadap TCP session hijacking dibandingkan jaringan kabel? Apa solusi teknisnya?",
        "Bagaimana platform ujian online seharusnya dirancang untuk mencegah session hijacking? Sebutkan minimal 4 mekanisme keamanan yang harus diimplementasikan.",
      ],
    },

    // 5. E-Commerce
    {
      title: "HTTP Flood dan Layer 7 DDoS pada Platform Belanja Online",
      scenario:
        "Platform e-commerce terbesar di Indonesia mengalami serangan HTTP Flood (Layer 7 DDoS) yang canggih selama Harbolnas 12.12. Penyerang menggunakan botnet yang masing-masing bot mengirimkan GET request HTTP yang tampak legitimate ke halaman produk secara bergantian, sehingga sulit dibedakan dari traffic pelanggan asli. Serangan mencapai 2 juta request per menit dan menyebabkan response time meningkat dari 200ms menjadi 30 detik.",
      questions: [
        "Jelaskan perbedaan antara volumetric DDoS (layer 3/4) dengan application-layer DDoS (layer 7) — mengapa HTTP Flood lebih sulit dimitigasi dengan filter sederhana?",
        "Teknik apa yang dapat digunakan untuk membedakan bot traffic dari legitimate human traffic dalam analisis traffic? Sebutkan minimal 5 sinyal/indikator yang berbeda.",
        "Bagaimana CDN (Content Delivery Network) dan WAF (Web Application Firewall) dapat dikombinasikan untuk mitigasi HTTP Flood? Jelaskan flow traffic protection-nya.",
        "Hitung kerugian potensial dari downtime 3 jam selama Harbolnas (estimasi GMV Rp 500 miliar/hari) dan jadikan dasar argumen ROI untuk investasi anti-DDoS.",
      ],
    },

    // 6. Manufaktur
    {
      title: "IP Spoofing dan Serangan terhadap ICS/SCADA Pabrik",
      scenario:
        "Pabrik otomotif terbesar di Jawa Barat mendeteksi traffic anomali yang mencurigakan di jaringan ICS/SCADA yang mengendalikan lini produksi robot. Analisis Wireshark menunjukkan paket dengan source IP yang tidak valid (IP dalam range 10.0.0.0/8 muncul sebagai source dari interface WAN) mengindikasikan IP spoofing. Selain itu, terdapat scan terhadap port Modbus (502) dan OPC-UA (4840) yang digunakan oleh sistem kontrol industri.",
      questions: [
        "Jelaskan bagaimana IP spoofing dapat dideteksi menggunakan teknik uRPF (Unicast Reverse Path Forwarding) dan mengapa teknik ini sangat efektif untuk memfilter paket ter-spoof.",
        "Mengapa sistem ICS/SCADA sangat kritis dan rentan dibandingkan sistem IT biasa? Sebutkan perbedaan karakteristik keamanan antara IT security dan OT (Operational Technology) security.",
        "Jelaskan Purdue Model untuk network segmentation di lingkungan industri. Bagaimana model ini dapat mencegah penyerang dari jaringan IT mencapai sistem kontrol OT?",
        "Buat incident response plan khusus untuk serangan siber terhadap lingkungan industri manufaktur, dengan mempertimbangkan prioritas keselamatan (safety) di atas keamanan (security).",
      ],
    },

    // 7. Telekomunikasi
    {
      title: "Botnet IoT Digunakan untuk Serangan DDoS dari Infrastruktur Telco",
      scenario:
        "Sebuah perusahaan telekomunikasi besar di Indonesia menemukan bahwa sebagian perangkat IoT pelanggan (router rumahan, IP camera, smart TV) yang terhubung ke jaringan mereka telah diinfeksi malware Mirai-variant dan menjadi bagian dari botnet yang digunakan untuk menyerang target lain. ISP menerima abuse report dari beberapa AS (Autonomous System) internasional tentang traffic mencurigakan berasal dari prefix IP milik ISP tersebut.",
      questions: [
        "Jelaskan bagaimana malware Mirai menginfeksi perangkat IoT dan mengubahnya menjadi bot DDoS — apa kerentanan fundamental yang dieksploitasi Mirai?",
        "Bagaimana ISP dapat mendeteksi bahwa pelanggannya menjadi bagian dari botnet menggunakan analisis NetFlow dan teknik traffic monitoring lainnya?",
        "Apa tanggung jawab hukum dan etika ISP dalam kasus ini? Apakah ISP berkewajiban memutus koneksi pelanggan yang perangkatnya terinfeksi? Jelaskan dengan mengacu pada regulasi Indonesia.",
        "Rancang program 'Clean Pipe' untuk ISP — strategi komprehensif untuk mendeteksi, mengisolasi, dan meremedasi perangkat pelanggan yang terinfeksi botnet.",
      ],
    },

    // 8. Startup
    {
      title: "ICMP Tunnel untuk Data Exfiltration di Startup Fintech",
      scenario:
        "Startup fintech dengan 50 karyawan mendeteksi traffic ICMP yang tidak biasa: volume ICMP echo request jauh melebihi baseline (dari rata-rata 10 request/menit menjadi 5.000 request/menit), dengan payload yang berukuran tidak standar (1400 byte padahal ICMP ping normal hanya 64 byte). Investigasi forensik mengungkap bahwa seorang developer yang tidak puas menggunakan tools ICMP tunneling untuk mengekstrak data nasabah dari jaringan perusahaan selama 2 minggu.",
      questions: [
        "Jelaskan secara teknis bagaimana ICMP tunneling bekerja. Mengapa teknik ini bisa melewati banyak firewall yang tidak dikonfigurasi dengan baik?",
        "Filter Wireshark apa yang paling efektif untuk mendeteksi ICMP tunneling? Jelaskan indikator-indikator anomali yang harus dicari dalam ICMP traffic.",
        "Bagaimana Deep Packet Inspection (DPI) berbeda dari traditional packet filtering dalam konteks deteksi ICMP tunneling dan covert channel lainnya?",
        "Rancang kebijakan keamanan jaringan untuk startup fintech yang memiliki resource terbatas, mencakup monitoring traffic, access control, dan prosedur response terhadap anomali.",
      ],
    },

    // 9. Logistik
    {
      title: "ARP Poisoning untuk Man-in-the-Middle di Jaringan Gudang",
      scenario:
        "Perusahaan logistik besar mengalami kebocoran data pelacakan pengiriman pelanggan. Investigasi forensik menemukan bahwa seorang teknisi jaringan yang tidak jujur di salah satu gudang telah melakukan ARP poisoning di segmen LAN gudang selama sebulan, mencegat komunikasi antara terminal barcode scanner dan server tracking. Akibatnya, data 200.000 pengiriman termasuk alamat penerima berhasil dieksfiltrasi.",
      questions: [
        "Jelaskan alur teknis serangan ARP Poisoning: bagaimana penyerang mengasosiasikan MAC address-nya dengan IP gateway, dan mengapa host lain di segmen percaya ARP reply palsu tersebut?",
        "Bagaimana serangan ARP Poisoning dapat dideteksi menggunakan Wireshark? Tunjukkan filter dan tampilan yang menunjukkan adanya konflik ARP entry.",
        "Jelaskan mekanisme Dynamic ARP Inspection (DAI) di managed switch dan bagaimana DAI mencegah ARP poisoning. Apa prasyarat infrastruktur yang diperlukan?",
        "Apa perbedaan dampak ARP Poisoning di jaringan yang menggunakan protokol terenkripsi (HTTPS, SSH) dibandingkan yang menggunakan protokol cleartext (HTTP, Telnet, FTP)?",
      ],
    },

    // 10. PLTU
    {
      title: "Fragmentation Attack untuk IDS Evasion di PLTU",
      scenario:
        "Tim keamanan siber Pembangkit Listrik Tenaga Uap (PLTU) menemukan pola traffic mencurigakan di jaringan antara IT dan OT yang seharusnya dipisahkan secara ketat. Analisis traffic menunjukkan fragmented IP packets dalam jumlah besar yang mengarah ke PLC (Programmable Logic Controller) sistem kontrol turbin. IDS berbasis signature gagal mendeteksi payload berbahaya karena penyerang sengaja memfragmentasi paket untuk membagi signature malware ke beberapa fragment.",
      questions: [
        "Jelaskan bagaimana Fragmentation-based IDS evasion bekerja secara teknis. Mengapa IDS berbasis signature dapat 'tertipu' oleh teknik fragmentasi yang direkayasa?",
        "Bagaimana cara konfigurasi Wireshark atau tshark untuk merekonstruksi paket terfragmentasi menjadi stream lengkap untuk analisis? Jelaskan prosesnya.",
        "Apa itu 'IP Fragment Reassembly Timeout' dan bagaimana penyerang dapat memanfaatkan perbedaan timeout antara firewall dan end host untuk bypass filtering?",
        "Mengapa infrastruktur kritikal seperti PLTU memerlukan pendekatan keamanan berlapis (defense-in-depth) yang jauh melampaui sekadar IDS? Rancang arsitektur keamanan yang sesuai.",
      ],
    },

    // 11. TV Nasional
    {
      title: "UDP Flood Mengganggu Siaran Live Streaming TV Nasional",
      scenario:
        "Stasiun TV nasional mengalami serangan UDP Flood yang menarget server streaming CDN selama siaran langsung Final Piala Dunia. Volume serangan mencapai 400 Gbps dari 80.000 IP yang ter-spoof, menyebabkan jutaan penonton tidak dapat mengakses siaran live streaming selama 45 menit. Penyerang diduga menarget persis pada momen kick-off untuk memaksimalkan dampak dan perhatian media.",
      questions: [
        "Jelaskan mengapa UDP streaming protocol (seperti RTP/RTSP) lebih sensitif terhadap UDP Flood dibandingkan protokol berbasis TCP — kaitkan dengan karakteristik real-time media streaming.",
        "Bagaimana teknik IP Anycast routing dapat membantu mendistribusikan beban DDoS traffic untuk melindungi layanan streaming berskala nasional?",
        "Apa perbedaan pendekatan mitigasi DDoS untuk content delivery (streaming) dibandingkan transaksi finansial (banking) dari perspektif prioritas latensi vs ketersediaan?",
        "Rancang SLA (Service Level Agreement) dan incident response plan untuk stasiun TV yang menjamin uptime minimum 99,95% untuk layanan live streaming selama event penting.",
      ],
    },

    // 12. Firma Hukum
    {
      title: "Traffic Sniffing dan Pencurian Dokumen Rahasia di Firma Hukum",
      scenario:
        "Sebuah firma hukum terkemuka menemukan bahwa berkas-berkas kasus perdata senilai miliaran rupiah telah bocor kepada pihak lawan. Investigasi digital forensik mengungkap bahwa salah satu paralegal memasang software sniffer pada switch jaringan kantor selama 3 minggu, menangkap traffic cleartext dari printer, file server, dan email internal yang tidak menggunakan enkripsi.",
      questions: [
        "Jelaskan teknik passive sniffing vs active sniffing (MITM) dalam konteks jaringan switched (menggunakan switch, bukan hub). Mengapa passive sniffing sulit dilakukan di jaringan switched modern?",
        "Traffic data sensitif apa yang dapat ditangkap melalui sniffing jika protokol tidak menggunakan enkripsi? Berikan contoh spesifik untuk setiap protokol cleartext yang umum.",
        "Bagaimana firma hukum dapat mendeteksi adanya sniffer yang dipasang di jaringannya? Sebutkan minimal 4 teknik deteksi yang bisa digunakan.",
        "Rancang kebijakan keamanan jaringan komprehensif untuk firma hukum yang menangani informasi klien yang sangat sensitif — fokus pada enkripsi, monitoring, dan kontrol akses fisik.",
      ],
    },

    // 13. Asuransi
    {
      title: "DHCP Starvation dan Rogue DHCP Server di Jaringan Kantor Asuransi",
      scenario:
        "Perusahaan asuransi jiwa dengan 500 karyawan mengalami gangguan jaringan masif selama 2 hari. Investigasi menemukan bahwa seorang karyawan magang yang tidak puas memasang laptop dengan Rogue DHCP Server di jaringan kantor. Laptop tersebut pertama melakukan DHCP Starvation (menghabiskan pool IP legitimate DHCP server), kemudian server DHCP roguenya memberikan konfigurasi gateway palsu ke semua karyawan — mengarahkan seluruh traffic melalui laptopnya untuk di-intercept.",
      questions: [
        "Jelaskan tahapan serangan dua langkah ini: pertama DHCP Starvation menggunakan MAC address acak, kemudian Rogue DHCP Server mengambil alih. Mengapa urutan ini penting?",
        "Bagaimana filter Wireshark dapat digunakan untuk mendeteksi DHCP Starvation (request dari ratusan MAC berbeda) dan keberadaan Rogue DHCP Server?",
        "Jelaskan mekanisme DHCP Snooping di managed switch dan bagaimana ia membedakan 'trusted port' (terhubung ke DHCP server legitimate) dari 'untrusted port' (terhubung ke client).",
        "Apa implikasi hukum bagi karyawan magang yang melakukan serangan ini? Pasal apa dalam UU ITE yang dapat diterapkan dan apa ancaman hukumannya?",
      ],
    },

    // 14. Properti
    {
      title: "SYN Flood dari Kompetitor Menarget Platform Properti Digital",
      scenario:
        "Platform listing properti digital terbesar di Indonesia dicurigai menjadi target serangan SYN Flood yang dilakukan oleh kompetitor tidak etis, bertepatan dengan peluncuran kampanye iklan besar. Serangan berlangsung selama 8 jam menyebabkan situs tidak dapat diakses oleh calon pembeli dan agen properti. Traffic engineer menemukan pola anomali: 500.000 SYN/detik dari IP tersebar, namun dengan TTL yang sangat konsisten (64), mengindikasikan botnet yang menggunakan single OS (Linux).",
      questions: [
        "Bagaimana nilai TTL yang konsisten dapat membantu profiling botnet? Jelaskan proses fingerprinting OS berdasarkan initial TTL dan teknik investigasi menggunakan data ini.",
        "Jelaskan bagaimana SYN Cookie bekerja secara matematis untuk mencegah SYN backlog overflow tanpa mengorbankan kemampuan menerima koneksi legitimate.",
        "Diskusikan tantangan atribusi (attribution) dalam serangan siber — mengapa sangat sulit membuktikan bahwa kompetitor adalah dalang serangan, meski secara circumstantial mencurigakan?",
        "Hitung kebutuhan bandwidth mitigasi untuk menghadapi serangan 500.000 SYN/detik. Bandingkan biaya berlangganan anti-DDoS cloud service vs dampak finansial downtime 8 jam.",
      ],
    },

    // 15. Lembaga Zakat
    {
      title: "DNS Amplification Menarget Portal Donasi Lembaga Zakat Saat Ramadan",
      scenario:
        "Lembaga Amil Zakat Nasional (LAZNAS) mengalami serangan DNS Amplification yang menarget portal donasi online tepat pada malam Lailatul Qadar, saat donasi diperkirakan mencapai puncaknya. Volume serangan 180 Gbps membuat server donasi tidak dapat diakses selama 4 jam. Kerugian diperkirakan mencapai Rp 15 miliar dari donasi yang gagal diproses. Investigasi menemukan 8.000 open DNS resolver yang dieksploitasi, sebagian besar adalah router ISP Indonesia yang tidak dikonfigurasi dengan baik.",
      questions: [
        "Jelaskan mengapa pilihan waktu serangan (malam Lailatul Qadar) menunjukkan bahwa penyerang memiliki pengetahuan mendalam tentang target — apa implikasinya dalam konteks intelligence gathering?",
        "Dari 8.000 open resolver yang dieksploitasi, berapa banyak berasal dari Indonesia? Bagaimana cara memverifikasi apakah server DNS milik organisasi Anda menjadi open resolver yang rentan?",
        "Jelaskan prinsip BCP38 (ingress filtering) dan bagaimana jika semua ISP Indonesia mengimplementasikannya, serangan DNS Amplification (yang bergantung pada IP spoofing) menjadi tidak efektif.",
        "Bagaimana LAZNAS dapat membangun redundansi dan ketahanan sistem donasi online dengan anggaran terbatas? Sebutkan layanan cloud gratis/murah yang dapat membantu meningkatkan resiliensi.",
      ],
    },
  ],

  // ─── QUIZ ────────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 1,
      question: "Sebuah tim SOC menemukan bahwa server DNS mereka mengalami lonjakan traffic UDP masuk dari ribuan IP berbeda. Analisis menunjukkan response packet jauh lebih besar (rata-rata 3.000 byte) dibandingkan query yang diterima (rata-rata 50 byte). Serangan apa yang paling mungkin sedang terjadi?",
      options: [
        "SYN Flood — penyerang membanjiri server dengan paket SYN tanpa menyelesaikan handshake",
        "DNS Amplification — penyerang menggunakan server DNS sebagai amplifier dengan mengirim query dengan source IP palsu",
        "UDP Flood — penyerang langsung membanjiri server dengan paket UDP berukuran besar",
        "DNS Cache Poisoning — penyerang menyuntikkan record palsu ke cache DNS server",
      ],
      answer: "DNS Amplification — penyerang menggunakan server DNS sebagai amplifier dengan mengirim query dengan source IP palsu",
      type: "multiple-choice",
    },
    {
      id: 2,
      question: "Filter Wireshark mana yang paling tepat untuk mendeteksi indikasi SYN Flood attack dalam sebuah file pcap?",
      options: [
        "tcp.flags == 0x002 — menampilkan semua paket TCP dengan flag SYN aktif",
        "tcp.flags.syn==1 && tcp.flags.ack==0 — menampilkan SYN packets tanpa ACK yang mengindikasikan handshake tidak selesai",
        "tcp.analysis.retransmission — menampilkan paket yang di-retransmit karena tidak ada respons",
        "ip.flags.mf==1 — menampilkan paket terfragmentasi yang mencurigakan",
      ],
      answer: "tcp.flags.syn==1 && tcp.flags.ack==0 — menampilkan SYN packets tanpa ACK yang mengindikasikan handshake tidak selesai",
      type: "multiple-choice",
    },
    {
      id: 3,
      question: "Teknik monitoring jaringan mana yang memberikan data PALING LENGKAP untuk investigasi forensik setelah insiden, namun membutuhkan kapasitas penyimpanan yang paling besar?",
      options: [
        "NetFlow/IPFIX — metadata aliran traffic tanpa payload",
        "SNMP Polling — statistik perangkat jaringan",
        "Full Packet Capture (FPC) — menangkap seluruh paket termasuk payload",
        "SPAN Port mirroring — duplikasi traffic ke port monitoring",
      ],
      answer: "Full Packet Capture (FPC) — menangkap seluruh paket termasuk payload",
      type: "multiple-choice",
    },
    {
      id: 4,
      question: "IP header field mana yang sering dimanipulasi dalam serangan IP Spoofing untuk menyembunyikan identitas penyerang dan mengarahkan response traffic ke korban?",
      options: [
        "Destination IP Address — mengubah tujuan paket ke IP korban",
        "TTL (Time to Live) — mengurangi TTL untuk memperpendek jalur paket",
        "Source IP Address — memalsukan alamat pengirim dengan IP korban sebagai source",
        "Protocol Field — mengubah protokol transport yang digunakan",
      ],
      answer: "Source IP Address — memalsukan alamat pengirim dengan IP korban sebagai source",
      type: "multiple-choice",
    },
    {
      id: 5,
      question: "Sebuah analis melihat banyak paket IP dengan field 'More Fragments = 1' dan fragment offset yang sangat kecil (8 byte) dalam capture. Apa interpretasi yang paling tepat?",
      options: [
        "Traffic video streaming normal yang membutuhkan paket kecil untuk buffering",
        "Tiny Fragment Attack — fragment pertama terlalu kecil untuk memuat header TCP lengkap, upaya bypass firewall",
        "Path MTU Discovery — proses normal untuk menemukan MTU minimum di jalur jaringan",
        "TCP segmentation — proses normal TCP membagi data besar menjadi segmen kecil",
      ],
      answer: "Tiny Fragment Attack — fragment pertama terlalu kecil untuk memuat header TCP lengkap, upaya bypass firewall",
      type: "multiple-choice",
    },
    {
      id: 6,
      question: "Protokol UDP manakah yang memiliki amplification factor TERTINGGI dan pernah digunakan dalam salah satu serangan DDoS terbesar dalam sejarah internet (1,7 Tbps)?",
      options: [
        "DNS (port 53) — amplification factor 2–100x",
        "NTP dengan perintah monlist (port 123) — amplification factor hingga 556x",
        "Memcached (port 11211) — amplification factor hingga 51.000x",
        "SSDP (port 1900) — amplification factor hingga 30x",
      ],
      answer: "Memcached (port 11211) — amplification factor hingga 51.000x",
      type: "multiple-choice",
    },
    {
      id: 7,
      question: "Mekanisme mitigasi SYN Flood yang bekerja dengan cara server mengodekan informasi state koneksi ke dalam sequence number yang dikirim kembali (tanpa menyimpan state di server) disebut?",
      options: [
        "SYN Backlog Increase — memperbesar buffer antrian SYN",
        "TCP Reset — mengirim RST untuk menutup koneksi setengah terbuka",
        "SYN Cookie — mengodekan state ke sequence number tanpa alokasi memori di server",
        "Rate Limiting — membatasi jumlah SYN per detik dari satu IP",
      ],
      answer: "SYN Cookie — mengodekan state ke sequence number tanpa alokasi memori di server",
      type: "multiple-choice",
    },
    {
      id: 8,
      question: "Fitur keamanan layer 2 di managed switch yang mencegah ARP Poisoning dengan memvalidasi paket ARP berdasarkan tabel DHCP Snooping Binding disebut?",
      options: [
        "Port Security — membatasi MAC address yang diizinkan per port",
        "Dynamic ARP Inspection (DAI) — memvalidasi ARP berdasarkan DHCP binding table",
        "Storm Control — membatasi broadcast/multicast traffic berlebihan",
        "802.1X — autentikasi port berbasis RADIUS sebelum mengizinkan akses jaringan",
      ],
      answer: "Dynamic ARP Inspection (DAI) — memvalidasi ARP berdasarkan DHCP binding table",
      type: "multiple-choice",
    },
    {
      id: 9,
      question: "Jelaskan perbedaan antara SPAN Port dan Network TAP sebagai metode pengumpulan traffic untuk monitoring, serta sebutkan kelebihan dan kekurangan masing-masing. Dalam situasi apa Anda akan memilih Network TAP dibandingkan SPAN Port?",
      answer: "SPAN Port (Switch Port Analyzer) adalah fitur perangkat lunak di managed switch yang menduplikasi traffic dari satu atau beberapa port ke port monitoring. Kelebihan: tidak memerlukan hardware tambahan, murah, mudah dikonfigurasi. Kekurangan: dapat drop paket saat beban switch tinggi karena duplikasi adalah low-priority task, jumlah SPAN session terbatas per switch, bisa mempengaruhi performa switch. Network TAP (Test Access Point) adalah perangkat hardware fisik yang ditempatkan secara inline di kabel jaringan, yang secara pasif menyalin semua traffic optik atau elektrik. Kelebihan: tidak pernah drop paket (hardware dedicated), tidak mempengaruhi performa jaringan, tidak terdeteksi oleh perangkat jaringan. Kekurangan: biaya hardware lebih tinggi, perlu pemasangan fisik (downtime saat instalasi), tidak fleksibel. Network TAP dipilih untuk: high-availability environment seperti data center yang tidak boleh ada packet loss, kondisi forensik yang memerlukan capture 100% paket, dan lingkungan produksi di mana akurasi data monitoring adalah kritis.",
      type: "essay",
    },
    {
      id: 10,
      question: "Seorang analis SOC melihat lonjakan traffic UDP ke port 53 yang tidak biasa. Paket-paket response DNS memiliki ukuran rata-rata 2.800 byte, padahal baseline normal hanya 150 byte. Source IP response tersebut adalah ribuan IP berbeda dari seluruh dunia. Jelaskan: (a) Serangan apa yang sedang terjadi? (b) Mengapa server DNS milik organisasi bisa menjadi korban tanpa disadari? (c) Bagaimana cara menghentikan serangan ini dengan cepat?",
      answer: "(a) Ini adalah DNS Amplification Attack. Penyerang mengirim query DNS kecil (ANY/TXT) dengan source IP palsu = IP server korban ke ribuan open DNS resolver. Resolver mengirimkan response besar langsung ke server korban (bukan ke penyerang), membanjiri korban dengan traffic yang tidak diminta. (b) Server DNS korban menjadi 'korban' bukan 'pelaku' — ribuan resolver yang dieksploitasi mengirimkan response ke IP korban. Korban tidak mengirim query apapun; IP-nya digunakan sebagai spoofed source oleh penyerang. Korban menerima traffic yang sangat besar dari ribuan IP legitimate (resolver), sehingga sulit diblokir dengan IP blacklist sederhana. (c) Penghentian cepat: (1) Hubungi upstream ISP untuk null-routing atau blackholing traffic ke IP yang diserang (BGP RTBH); (2) Implementasikan rate limiting agresif untuk UDP traffic di perimeter; (3) Gunakan CDN/scrubbing center yang memiliki kapasitas besar untuk menyerap traffic; (4) Aktifkan BCP38 filter di router untuk memblokir IP spoofed. Jangka panjang: pastikan resolver DNS sendiri tidak bisa dieksploitasi (disable recursion untuk IP eksternal, implementasikan RRL).",
      type: "essay",
    },
    {
      id: 11,
      question: "Jelaskan konsep TCP Session Hijacking secara teknis. Mengapa mengetahui TCP sequence number sangat penting bagi penyerang? Dalam kondisi jaringan modern seperti apa teknik ini masih relevan?",
      answer: "TCP Session Hijacking adalah serangan di mana penyerang mengambil alih sesi TCP yang sudah terjalin antara dua pihak legitimate. Secara teknis, TCP menggunakan sequence number 32-bit untuk memastikan urutan dan integritas data. Setiap paket data yang dikirim harus memiliki sequence number yang diharapkan oleh penerima — jika sequence number tidak sesuai, paket akan ditolak atau diabaikan. Penyerang perlu mengetahui sequence number yang tepat karena: hanya paket dengan sequence number yang valid (dalam window akzeptable) yang akan diterima dan diproses oleh target; dengan mengetahui sequence number, penyerang dapat menyuntikkan perintah atau data ke dalam sesi seolah-olah berasal dari salah satu pihak legitimate. Proses hijacking: (1) Penyerang mensniff traffic untuk mendapatkan sequence number saat ini; (2) Mengirim RST ke salah satu pihak untuk memutus koneksi mereka; (3) Mengirim data dengan sequence number yang tepat ke pihak lain untuk mengambil alih sesi. Relevansi modern: teknik ini paling efektif di jaringan yang tidak menggunakan enkripsi (HTTP, Telnet, FTP), di segmen jaringan yang bisa disniff (Wi-Fi open, switched LAN dengan ARP poisoning). Di jaringan modern dengan TLS/SSL, session hijacking pada layer transport menjadi sangat sulit — namun hijacking pada layer session/aplikasi (cookie theft, session token theft) masih sangat relevan.",
      type: "essay",
    },
    {
      id: 12,
      question: "Apa itu 'Network Baseline' dalam konteks keamanan jaringan, dan mengapa memiliki baseline yang akurat sangat penting untuk anomaly detection? Jelaskan minimal 5 parameter yang harus dicatat sebagai bagian dari baseline yang komprehensif.",
      answer: "Network Baseline adalah rekaman sistematis kondisi 'normal' jaringan pada periode representatif, yang mencakup karakteristik traffic, volume, pola, dan perilaku yang diharapkan. Baseline yang akurat adalah fondasi dari anomaly-based detection — tanpa tahu kondisi normal, mustahil menentukan apa yang 'tidak normal'. Baseline mengurangi false positive (alert palsu karena traffic normal) dan membantu prioritisasi investigasi. 5 parameter baseline yang harus dicatat: (1) Volume Traffic per Waktu — bandwidth (Mbps/Gbps) per jam, hari, minggu; pola peak vs off-peak; seasonal variations (hari Senin lebih tinggi, jam makan siang lebih rendah); (2) Distribusi Protokol — persentase TCP vs UDP vs ICMP; persentase aplikasi (HTTP/S, DNS, email, VoIP); protocol yang tidak biasa yang seharusnya tidak ada; (3) Conversation Patterns — top N IP pairs yang berkomunikasi; koneksi tipikal ke internet vs internal; ekspektasi koneksi cross-subnet; (4) DNS Query Patterns — jumlah query per menit; top domains yang di-query; TTL distribution; query type distribution (A, AAAA, MX, TXT); (5) Port dan Service Usage — port yang biasa terbuka; new/ephemeral port yang digunakan; koneksi ke port non-standar; geographic distribution sumber traffic eksternal. Baseline harus dikumpulkan minimal 2 minggu untuk mencakup siklus weekday/weekend, dan diperbarui secara periodik (bulanan) untuk mengakomodasi perubahan infrastruktur yang legitimate.",
      type: "essay",
    },
    {
      id: 13,
      question: "Mengapa IP Spoofing tetap menjadi teknik yang efektif meskipun sudah lama diketahui? Jelaskan bagaimana BCP38 (Ingress Filtering) bekerja dan mengapa implementasinya masih belum universal meskipun sangat efektif.",
      answer: "IP Spoofing tetap efektif karena: (1) Protokol IP dirancang tanpa autentikasi sumber — tidak ada mekanisme native untuk memverifikasi apakah source IP benar-benar milik pengirim; (2) Banyak ISP belum mengimplementasikan BCP38; (3) IP Spoofing memungkinkan anonimisasi dan amplifikasi serangan sekaligus. BCP38 (Best Current Practice 38, atau ingress filtering) bekerja dengan cara: ISP mengkonfigurasi router border mereka untuk hanya melewatkan paket keluar dari pelanggan jika source IP paket tersebut sesuai dengan prefix IP yang dialokasikan ke pelanggan tersebut. Contoh: pelanggan dengan alokasi 203.0.113.0/24 hanya boleh mengirimkan paket dengan source IP dalam range tersebut. Paket dengan source IP selain itu akan di-drop oleh router ISP sebelum masuk ke internet. Mengapa implementasi tidak universal: (1) Tragedi Commons — ISP individu mendapat sedikit manfaat langsung dari mengimplementasikan BCP38 (serangan spoof dari jaringan mereka merusak orang lain, bukan mereka); biayanya ditanggung ISP sendiri, manfaatnya dinikmati semua; (2) Kompleksitas teknis — asymmetric routing membuat ingress filtering sulit di beberapa topologi; (3) Kurangnya insentif regulasi — tidak ada kewajiban hukum universal untuk mengimplementasikan BCP38; (4) Legacy infrastructure — router lama mungkin tidak mendukung fitur ini dengan performa yang baik. Jika semua ISP mengimplementasikan BCP38, seluruh kelas serangan amplifikasi (DNS, NTP, Memcached) menjadi tidak efektif karena traffic tidak bisa dikembalikan ke korban.",
      type: "essay",
    },
  ],

  // ─── VIDEO RESOURCES ──────────────────────────────────────────────────────────
  videoResources: [
    {
      title: "Network Traffic Analysis with Wireshark — Full Tutorial",
      youtubeId: "ZO46H_kI1bc",
      description: "Tutorial lengkap analisis traffic jaringan menggunakan Wireshark: filter, statistik, dan forensik.",
      language: "en",
      duration: "28:15",
    },
    {
      title: "DDoS Attack Explained — SYN Flood, DNS Amplification, UDP Flood",
      youtubeId: "ilhGh9CEIwM",
      description: "Penjelasan mendalam cara kerja tiga jenis utama serangan DDoS dan strategi mitigasinya.",
      language: "en",
      duration: "10:20",
    },
    {
      title: "TCP/IP Vulnerabilities — IP Spoofing, Fragmentation, Hijacking",
      youtubeId: "AYdF7b3nMto",
      description: "Overview komprehensif kerentanan pada protokol TCP/IP fundamental.",
      language: "en",
      duration: "15:40",
    },
    {
      title: "ARP Poisoning dan Man-in-the-Middle Attack Explained",
      youtubeId: "A7nih6SANYs",
      description: "Demonstrasi teknis ARP poisoning dan cara mencegahnya dengan Dynamic ARP Inspection.",
      language: "en",
      duration: "12:30",
    },
    {
      title: "How Botnet Works — IoT Botnet dan DDoS",
      youtubeId: "um_-8O9RNCE",
      description: "Penjelasan cara kerja botnet IoT seperti Mirai dan bagaimana digunakan untuk serangan DDoS.",
      language: "en",
      duration: "9:45",
    },
  ],
};
