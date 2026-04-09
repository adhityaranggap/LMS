import type { ModuleData, CaseStudyVariant } from '../module-types';

export const module05: ModuleData & { caseStudyPool: CaseStudyVariant[] } = {
  id: 5,
  title: 'Transport & Network Services',
  description: 'Transport Layer (TCP/UDP), dan Network Services: DHCP, DNS, NAT, HTTP/HTTPS, FTP, Email',
  iconName: 'Globe',

  // ─────────────────────────────────────────────────────────────────────────────
  // THEORY
  // ─────────────────────────────────────────────────────────────────────────────
  theory: [
    {
      title: 'TCP: Connection-Oriented Protocol dan 3-Way Handshake',
      content:
        'TCP (Transmission Control Protocol) adalah protokol Transport Layer (Layer 4) yang bersifat connection-oriented dan reliable. "Connection-oriented" berarti sebelum data dikirim, kedua pihak harus membangun koneksi terlebih dahulu melalui proses 3-Way Handshake. "Reliable" berarti TCP menjamin pengiriman data secara berurutan (in-order delivery), tanpa duplikasi, dan tanpa kehilangan data — dicapai melalui mekanisme sequence number, acknowledgment, dan retransmission. TCP juga melakukan flow control (sliding window) dan congestion control (TCP Reno/CUBIC). TCP Header memiliki 13 field penting termasuk Source Port, Destination Port, Sequence Number, Acknowledgment Number, Control Flags (SYN, ACK, FIN, RST, PSH, URG), dan Window Size.',
      example: {
        title: 'Proses 3-Way Handshake TCP (Client → Server HTTP port 80)',
        steps: [
          'Step 1 — SYN: Client → Server',
          '  TCP Flags: [SYN]',
          '  Seq=0 (ISN client, Initial Sequence Number dipilih secara acak)',
          '  Client: "Saya ingin membuka koneksi, sequence number saya dimulai dari X"',
          '',
          'Step 2 — SYN-ACK: Server → Client',
          '  TCP Flags: [SYN, ACK]',
          '  Seq=0 (ISN server), Ack=1 (ISN client + 1)',
          '  Server: "Saya setuju, sequence number saya dimulai dari Y, saya sudah terima X"',
          '',
          'Step 3 — ACK: Client → Server',
          '  TCP Flags: [ACK]',
          '  Seq=1, Ack=1 (ISN server + 1)',
          '  Client: "Saya sudah terima Y, koneksi siap digunakan"',
          '',
          'Koneksi ESTABLISHED → Data dapat dikirim',
          '',
          'Penutupan koneksi (4-Way Termination):',
          '  Client → Server: [FIN]',
          '  Server → Client: [ACK]',
          '  Server → Client: [FIN]',
          '  Client → Server: [ACK]',
        ],
        result:
          'Koneksi TCP ditandai dengan 3 paket handshake dan 4 paket termination. Wireshark menampilkan flag SYN, SYN-ACK, ACK secara berurutan. Total overhead TCP: ~20 byte header per paket + handshake latency.',
      },
      keyPoints: [
        'Initial Sequence Number (ISN) dipilih secara pseudorandom untuk mencegah TCP Sequence Prediction attacks.',
        'SYN Flood Attack: attacker mengirim banyak SYN tanpa menyelesaikan handshake, menghabiskan half-open connection table server.',
        'TCP RST (Reset): mengakhiri koneksi secara paksa — digunakan dalam TCP RST Attack atau firewall reject.',
        'Wireshark filter untuk handshake: tcp.flags.syn==1 || tcp.flags.ack==1',
        'Session Hijacking: attacker yang mengetahui Sequence Number aktif dapat menyisipkan paket ke dalam koneksi yang ada.',
      ],
      note: 'Dari perspektif keamanan, 3-Way Handshake tidak memiliki autentikasi — siapapun yang mengetahui IP dan port dapat menginisiasi koneksi. Firewall dan TLS diperlukan untuk melengkapi keamanan TCP.',
      noteType: 'info',
    },

    {
      title: 'UDP: Connectionless Protocol dan Use Cases',
      content:
        'UDP (User Datagram Protocol) adalah protokol Transport Layer yang bersifat connectionless dan unreliable. "Connectionless" berarti tidak ada handshake sebelum data dikirim. "Unreliable" berarti UDP tidak menjamin delivery, ordering, atau error correction — jika paket hilang, tidak ada retransmission. Kelebihan UDP: overhead rendah (header hanya 8 byte vs 20 byte TCP), latency sangat rendah karena tidak ada handshake, cocok untuk aplikasi real-time. UDP Header hanya memiliki 4 field: Source Port, Destination Port, Length, dan Checksum.',
      table: {
        caption: 'Perbandingan Komprehensif TCP vs UDP',
        headers: ['Aspek', 'TCP', 'UDP'],
        rows: [
          ['Koneksi', 'Connection-oriented (3-way handshake)', 'Connectionless (langsung kirim)'],
          ['Reliabilitas', 'Guaranteed delivery, in-order', 'Best-effort, tidak ada jaminan'],
          ['Header size', '20–60 byte (dengan options)', '8 byte (tetap)'],
          ['Flow Control', 'Ada (sliding window)', 'Tidak ada'],
          ['Congestion Control', 'Ada (Reno, CUBIC, BBR)', 'Tidak ada (tanggung jawab aplikasi)'],
          ['Error Recovery', 'Retransmission otomatis', 'Tidak ada (aplikasi harus handle)'],
          ['Kecepatan', 'Lebih lambat (overhead tinggi)', 'Lebih cepat (overhead rendah)'],
          ['Urutan paket', 'Dijamin berurutan', 'Tidak dijamin — bisa out-of-order'],
          ['Use case', 'HTTP, HTTPS, FTP, SSH, SMTP, database', 'DNS, DHCP, VoIP, streaming, gaming, TFTP'],
          ['Keamanan', 'Rentan SYN Flood, TCP Hijacking', 'Rentan UDP Flood, DNS Amplification'],
        ],
      },
      keyPoints: [
        'DNS menggunakan UDP port 53 untuk query cepat, beralih ke TCP port 53 untuk transfer zone atau response > 512 byte.',
        'QUIC (HTTP/3) mengimplementasikan reliability di atas UDP untuk menghindari TCP head-of-line blocking.',
        'UDP Flood: mengirim UDP packet dalam jumlah besar ke random port untuk menghabiskan bandwidth.',
        'UDP DNS Amplification Attack: query kecil menghasilkan response besar (amplification factor hingga 100x).',
        'VoIP dan video streaming memilih UDP karena satu frame yang hilang lebih baik daripada delay dari retransmission.',
      ],
    },

    {
      title: 'Port Numbers: Well-Known, Registered, dan Dynamic',
      content:
        'Port number adalah angka 16-bit (0–65535) yang digunakan TCP dan UDP untuk mengidentifikasi layanan (service) yang berjalan di sebuah host. Port memungkinkan multiplexing: satu host dapat menjalankan banyak layanan secara bersamaan menggunakan satu IP. IANA (Internet Assigned Numbers Authority) membagi port menjadi tiga kelompok: Well-Known Ports (0–1023) — untuk layanan standar, membutuhkan hak akses root untuk listen; Registered Ports (1024–49151) — untuk aplikasi terdaftar; Dynamic/Private Ports (49152–65535) — untuk koneksi client sementara (ephemeral ports).',
      table: {
        caption: 'Port Number Penting untuk Keamanan Jaringan',
        headers: ['Port', 'Protokol', 'Layanan', 'Catatan Keamanan'],
        rows: [
          ['20/21', 'TCP', 'FTP (Data/Control)', 'Cleartext — gunakan SFTP (22) atau FTPS (990)'],
          ['22', 'TCP', 'SSH / SFTP', 'Aman (encrypted) — ganti default port untuk hardening'],
          ['23', 'TCP', 'Telnet', 'TIDAK AMAN — semua data cleartext, jangan gunakan'],
          ['25', 'TCP', 'SMTP', 'Email sending — blokir outbound dari client untuk cegah spam'],
          ['53', 'UDP/TCP', 'DNS', 'UDP untuk query, TCP untuk zone transfer — waspadai DNS tunneling'],
          ['67/68', 'UDP', 'DHCP (Server/Client)', 'Waspadai DHCP Starvation dan Rogue DHCP Server'],
          ['80', 'TCP', 'HTTP', 'Cleartext web — data dapat di-intercept, gunakan HTTPS'],
          ['443', 'TCP', 'HTTPS (TLS)', 'Encrypted — periksa certificate validity dan cipher suite'],
          ['110', 'TCP', 'POP3', 'Email retrieval cleartext — gunakan POP3S (995)'],
          ['143', 'TCP', 'IMAP', 'Email retrieval cleartext — gunakan IMAPS (993)'],
          ['445', 'TCP', 'SMB/CIFS', 'File sharing Windows — rentan EternalBlue/WannaCry'],
          ['3306', 'TCP', 'MySQL', 'Database — jangan expose ke internet langsung'],
          ['3389', 'TCP', 'RDP', 'Remote Desktop Windows — sering menjadi target brute force'],
        ],
      },
      keyPoints: [
        'Port scanning (Nmap) adalah teknik reconnaissance penting untuk mengidentifikasi layanan yang berjalan pada target.',
        'Layanan pada port well-known di bawah 1024 membutuhkan hak akses root/administrator untuk dijalankan.',
        'Ephemeral port (49152–65535) digunakan sisi client untuk setiap koneksi keluar — berubah setiap koneksi baru.',
        'Firewall rules biasanya berdasarkan port: blokir semua kecuali yang diperlukan (principle of least privilege).',
        'Port knocking: teknik keamanan di mana port SSH tersembunyi sampai sequence port tertentu "diketuk" lebih dahulu.',
      ],
    },

    {
      title: 'DHCP: Proses DORA dan Keamanan DHCP',
      content:
        'DHCP (Dynamic Host Configuration Protocol, RFC 2131) memungkinkan host mendapatkan konfigurasi jaringan secara otomatis: IP address, subnet mask, default gateway, DNS server, dan lease time. DHCP menggunakan UDP port 67 (server) dan 68 (client). Proses pemberian IP dilakukan melalui 4 tahap yang dikenal sebagai proses DORA: Discover, Offer, Request, Acknowledge. DHCP sangat penting untuk manajemen IP yang efisien di jaringan besar, namun juga memiliki kelemahan keamanan signifikan karena tidak memiliki mekanisme autentikasi bawaan.',
      example: {
        title: 'Proses DHCP DORA: Laptop Baru Bergabung ke Jaringan Kantor',
        steps: [
          'Step 1 — DHCP Discover (Client → Broadcast):',
          '  Source IP: 0.0.0.0 (belum punya IP)',
          '  Destination IP: 255.255.255.255 (broadcast)',
          '  Client: "Ada DHCP server? Saya butuh IP address!"',
          '',
          'Step 2 — DHCP Offer (Server → Broadcast/Unicast):',
          '  Server menawarkan: IP 192.168.1.105, Mask /24, GW 192.168.1.1, DNS 8.8.8.8',
          '  Server: "Saya punya penawaran: gunakan IP ini selama 24 jam"',
          '',
          'Step 3 — DHCP Request (Client → Broadcast):',
          '  Client memilih penawaran dari server tadi',
          '  Client: "Saya menerima tawaran IP 192.168.1.105 dari server 192.168.1.10"',
          '  (Masih broadcast agar server lain tahu tawaran mereka ditolak)',
          '',
          'Step 4 — DHCP Acknowledge (Server → Client):',
          '  Server mengkonfirmasi dan mencatat di lease database',
          '  Server: "IP 192.168.1.105 adalah milikmu hingga [timestamp + lease time]"',
          '',
          'Client mengkonfigurasi network interface dengan parameter yang diterima.',
        ],
        result:
          'Proses DORA selesai. Client memiliki IP valid. Lease time biasanya 1–8 jam untuk Wi-Fi publik, 1–7 hari untuk jaringan korporat. Perpanjangan dilakukan otomatis pada 50% dan 87.5% dari lease time.',
      },
      keyPoints: [
        'DHCP Starvation Attack: attacker mengirim ribuan DHCP Discover dengan MAC address palsu untuk menghabiskan pool IP.',
        'Rogue DHCP Server: attacker menjalankan DHCP server tidak sah yang menawarkan gateway palsu (attacker) untuk MITM.',
        'DHCP Snooping: fitur switch yang membatasi port mana yang boleh mengirimkan DHCP Offer — hanya trusted port (ke router).',
        'DHCP Snooping juga membangun binding table (IP → MAC → Port → VLAN) yang digunakan DAI dan IP Source Guard.',
        'DHCP over IPv6: DHCPv6 (RFC 3315) atau SLAAC (Stateless Address Autoconfiguration) menggunakan ICMPv6.',
      ],
      note: 'DHCP Snooping adalah kontrol keamanan fundamental yang harus diaktifkan di semua switch access layer. Tanpa DHCP Snooping, setiap perangkat di jaringan dapat menjadi Rogue DHCP Server dan mengarahkan traffic seluruh subnet.',
      noteType: 'warning',
    },

    {
      title: 'DNS: Hierarchical System, Record Types, dan DNS Security',
      content:
        'DNS (Domain Name System, RFC 1034/1035) adalah sistem terdistribusi yang menerjemahkan nama domain yang mudah diingat (google.com) menjadi IP address (142.250.x.x). DNS bekerja secara hierarkis: Root Zone (.) → Top-Level Domain (TLD: .com, .id, .org) → Second-Level Domain (google, facebook) → Subdomain (mail.google.com). Proses resolusi DNS melibatkan beberapa jenis server: DNS Resolver (biasanya ISP atau 8.8.8.8), Root Name Server (13 server root global), TLD Name Server, dan Authoritative Name Server. DNS menggunakan UDP port 53 untuk query standar (<512 byte), dan TCP port 53 untuk zone transfer atau response besar.',
      table: {
        caption: 'Jenis-Jenis DNS Record yang Penting',
        headers: ['Tipe Record', 'Fungsi', 'Contoh', 'Relevansi Keamanan'],
        rows: [
          ['A', 'Domain → IPv4 address', 'google.com → 142.250.4.46', 'Target DNS Spoofing untuk redirect ke IP palsu'],
          ['AAAA', 'Domain → IPv6 address', 'google.com → 2404:6800::...', 'IPv6 harus diproteksi sama seperti IPv4'],
          ['CNAME', 'Domain alias → domain lain', 'www → google.com', 'Attacker menggunakan CNAME untuk domain generation'],
          ['MX', 'Mail server untuk domain', 'google.com → smtp.google.com', 'Digunakan untuk email phishing (MX poisoning)'],
          ['TXT', 'Teks bebas — SPF, DKIM, DMARC', '"v=spf1 include:..."', 'DNS Tunneling: data di-encode dalam TXT query'],
          ['NS', 'Name server untuk domain', 'google.com → ns1.google.com', 'NS hijacking untuk mengambil alih domain'],
          ['PTR', 'IP → nama domain (reverse)', '8.8.8.8 → dns.google', 'Digunakan verifikasi anti-spam'],
          ['SOA', 'Otoritas zona DNS', 'Serial, Refresh, Retry, Expire', 'Zone transfer (AXFR) dapat bocorkan seluruh DNS zone'],
          ['SRV', 'Lokasi layanan (host+port)', '_http._tcp → server:80', 'Reconnaissance layanan melalui DNS'],
        ],
      },
      keyPoints: [
        'DNS Cache Poisoning (DNS Spoofing): attacker memasukkan entri DNS palsu ke cache resolver, mengarahkan pengguna ke situs palsu.',
        'DNS Tunneling: attacker encode data dalam subdomain DNS query untuk exfiltrasi data melewati firewall yang hanya memblokir port.',
        'DNSSEC (DNS Security Extensions): menambahkan digital signature ke DNS record untuk verifikasi integritas, namun belum banyak diimplementasikan.',
        'DNS over HTTPS (DoH) dan DNS over TLS (DoT): mengenkripsi DNS query untuk privasi — mencegah ISP/attacker melihat query DNS.',
        'Zone Transfer (AXFR): harus dibatasi hanya ke secondary name server — jika terbuka, semua record DNS dapat diunduh attacker.',
        'Kaminsky Attack (2008): kelemahan fundamental DNS yang memungkinkan cache poisoning skala besar — diatasi dengan source port randomization.',
      ],
      note: 'DNS Tunneling adalah teknik exfiltrasi data yang sangat susah dideteksi firewall tradisional karena traffic DNS biasanya selalu diizinkan. Deteksi memerlukan analisis volume query, entropy subdomain, dan anomali query pattern.',
      noteType: 'warning',
    },

    {
      title: 'NAT: Static, Dynamic, dan PAT/Overloading',
      content:
        'NAT (Network Address Translation, RFC 3022) adalah teknik yang memungkinkan modifikasi IP address pada header paket saat melewati router/firewall. NAT dikembangkan untuk mengatasi kekurangan IPv4 address (hanya ~4,3 miliar alamat untuk seluruh internet). NAT memungkinkan banyak perangkat dengan IP privat (RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) berbagi satu atau beberapa IP publik. NAT juga memberikan lapisan keamanan implisit karena host internal tidak dapat diakses langsung dari internet tanpa konfigurasi eksplisit (port forwarding).',
      example: {
        title: 'Cara Kerja PAT (Port Address Translation / NAT Overloading)',
        steps: [
          'Laptop A (192.168.1.10:52341) → Request ke google.com (142.250.4.46:443)',
          'Laptop B (192.168.1.20:48291) → Request ke youtube.com (172.217.1.100:443)',
          '',
          'Router (IP publik: 203.0.113.1) membuat NAT Translation Table:',
          '┌─────────────────────────┬──────────────────────────┬──────────────────────────────┐',
          '│ Internal (src)          │ External (translated src) │ Destination                  │',
          '├─────────────────────────┼──────────────────────────┼──────────────────────────────┤',
          '│ 192.168.1.10:52341      │ 203.0.113.1:10001        │ 142.250.4.46:443             │',
          '│ 192.168.1.20:48291      │ 203.0.113.1:10002        │ 172.217.1.100:443            │',
          '└─────────────────────────┴──────────────────────────┴──────────────────────────────┘',
          '',
          'Response dari Google tiba ke 203.0.113.1:10001',
          '→ Router lookup tabel → forward ke 192.168.1.10:52341',
        ],
        result:
          'PAT memungkinkan ribuan host internal berbagi SATU IP publik dengan membedakan sesi menggunakan kombinasi IP+Port. Ini adalah tipe NAT paling umum di router rumah dan kantor.',
      },
      keyPoints: [
        'Static NAT: satu IP privat → satu IP publik permanen (untuk server yang harus diakses dari internet).',
        'Dynamic NAT: pool IP publik dibagi ke host internal berdasarkan ketersediaan (first-come-first-served).',
        'PAT/Overloading: satu IP publik untuk ribuan host internal — dibedakan dengan port number.',
        'NAT tidak menggantikan firewall — hanya memberikan security by obscurity (host tersembunyi, bukan terproteksi).',
        'NAT menyulitkan peer-to-peer komunikasi dan end-to-end connectivity — diatasi dengan NAT traversal (STUN/TURN) atau IPv6.',
        'Dari perspektif forensik: NAT menyulitkan investigasi karena IP publik dapat digunakan ribuan host internal secara bergantian.',
      ],
    },

    {
      title: 'Protokol Aplikasi: HTTP/HTTPS, FTP/SFTP, dan Email (SMTP/POP3/IMAP)',
      content:
        'Protokol layer aplikasi adalah interface antara aplikasi user dengan jaringan. Setiap protokol memiliki fungsi spesifik, port standar, dan karakteristik keamanan yang berbeda. Memahami protokol ini penting untuk: (1) Menganalisis traffic aplikasi di Wireshark, (2) Mengidentifikasi data sensitif yang dikirim dalam cleartext, (3) Merancang kebijakan firewall yang tepat, (4) Mendeteksi serangan yang memanfaatkan protokol ini.',
      table: {
        caption: 'Perbandingan Protokol Aplikasi: Fungsi dan Keamanan',
        headers: ['Protokol', 'Port', 'Fungsi', 'Keamanan', 'Versi Aman'],
        rows: [
          ['HTTP', '80/TCP', 'Transfer halaman web (cleartext)', 'TIDAK AMAN — semua data terekspos', 'HTTPS (443)'],
          ['HTTPS', '443/TCP', 'HTTP di atas TLS/SSL', 'AMAN — terenkripsi dan terautentikasi', 'Sudah aman'],
          ['FTP', '20,21/TCP', 'Transfer file (cleartext)', 'TIDAK AMAN — password dan data cleartext', 'SFTP (22), FTPS (990)'],
          ['SFTP', '22/TCP', 'File transfer via SSH tunnel', 'AMAN — terenkripsi dengan SSH', 'Sudah aman'],
          ['SMTP', '25/TCP', 'Kirim email (server-to-server)', 'Harus dikombinasi dengan STARTTLS', 'SMTPS (465)'],
          ['POP3', '110/TCP', 'Unduh email ke client (hapus dari server)', 'Cleartext — data email terekspos', 'POP3S (995)'],
          ['IMAP', '143/TCP', 'Akses email di server (sinkronisasi)', 'Cleartext — gunakan versi aman', 'IMAPS (993)'],
          ['Telnet', '23/TCP', 'Remote terminal (cleartext)', 'SANGAT TIDAK AMAN — gunakan SSH', 'SSH (22)'],
          ['SSH', '22/TCP', 'Remote terminal terenkripsi + tunneling', 'AMAN — gunakan key-based auth', 'Sudah aman'],
        ],
      },
      keyPoints: [
        'HTTP/1.1 mengirimkan header Cookie, Authorization, dan form POST dalam cleartext — credential theft trivial dengan Wireshark.',
        'HTTPS menggunakan TLS (Transport Layer Security) 1.2 atau 1.3 — verifikasi sertifikat X.509 mencegah MITM.',
        'SSL Stripping Attack: attacker melakukan downgrade HTTPS → HTTP dengan mengubah link secara on-the-fly selama MITM.',
        'SMTP Authentication (SMTP AUTH): diperlukan untuk mencegah server menjadi open relay yang dieksploitasi spammer.',
        'IMAP lebih disukai dari POP3 karena email tetap ada di server — berguna untuk forensik jika device user dicompromise.',
        'Email phishing memanfaatkan SMTP untuk mengirimkan email spoofed — DKIM, SPF, DMARC adalah mekanisme anti-spoofing.',
      ],
      note: 'Analisis cleartext HTTP di Wireshark adalah teknik dasar analis SOC. Jika website masih menggunakan HTTP tanpa HTTPS di tahun 2026, ini merupakan temuan keamanan kritis yang harus segera dilaporkan.',
      noteType: 'danger',
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // LAB
  // ─────────────────────────────────────────────────────────────────────────────
  lab: {
    title: 'Lab 5: Transport Layer dan Network Services Analysis',
    downloads: [
      {
        name: 'Wireshark (Versi Terbaru)',
        url: 'https://www.wireshark.org/download.html',
        description: 'Network protocol analyzer untuk analisis TCP handshake, DNS query, dan HTTP traffic.',
      },
      {
        name: 'tshark / Wireshark CLI',
        url: 'https://www.wireshark.org/docs/man-pages/tshark.html',
        description: 'Versi command-line Wireshark — biasanya sudah terinstal bersama Wireshark.',
      },
    ],
    steps: [
      {
        title: 'TCP Handshake Capture dengan tshark',
        description:
          'Gunakan tshark untuk capture 20 paket pertama pada interface eth0 yang melewati port 80. Identifikasi urutan paket SYN, SYN-ACK, dan ACK yang membentuk 3-Way Handshake. Catat nilai Sequence Number dan Acknowledgment Number pada setiap langkah.',
        command: 'tshark -i eth0 -f "tcp port 80" -c 20',
        expectedOutput:
          'Tampil daftar paket dengan kolom: waktu, src IP, dst IP, protokol, length, dan info\nTerlihat paket [SYN], [SYN, ACK], [ACK] secara berurutan dalam info column',
        hint: 'Jika tidak ada traffic HTTP aktif, buka browser dan kunjungi situs HTTP saat capture berjalan. Di Wireshark GUI gunakan filter: tcp.flags.syn==1 untuk melihat hanya paket SYN.',
        screenshotNote: 'Screenshot tshark output yang menampilkan setidaknya satu sesi 3-way handshake lengkap. Di Wireshark, sertakan juga screenshot panel detail paket yang menampilkan TCP flag fields.',
      },
      {
        title: 'DNS Query Analysis dengan nslookup dan dig',
        description:
          'Lakukan DNS query ke example.com menggunakan dua alat berbeda: nslookup (Windows/Linux) dan dig (Linux). Bandingkan output keduanya. Di Wireshark, filter "dns" dan amati paket DNS Query (QR=0) dan DNS Response (QR=1). Perhatikan TTL, record type, dan jumlah answer records.',
        command: 'nslookup example.com && dig example.com +short',
        expectedOutput:
          'nslookup: Server: 8.8.8.8, Address: 93.184.216.34\ndig: 93.184.216.34',
        hint: 'Gunakan "dig example.com ANY" untuk melihat semua jenis record. Gunakan "dig +trace google.com" untuk melihat proses resolusi DNS dari root hingga authoritative server.',
        screenshotNote: 'Screenshot output nslookup dan dig. Sertakan screenshot Wireshark yang menampilkan DNS Query dan DNS Response packet beserta detail fields (Transaction ID, Query Name, Answer section).',
      },
      {
        title: 'Analisis HTTP POST Cleartext',
        description:
          'Gunakan curl untuk mengirim POST request ke situs test (testphp.vulnweb.com). Amati di Wireshark bagaimana username dan password dikirim dalam cleartext tanpa enkripsi. Ini mendemonstrasikan mengapa HTTP tanpa HTTPS sangat berbahaya.',
        command: 'curl -X POST http://testphp.vulnweb.com/login.php -d "uname=testuser&pass=testpass123" -v',
        expectedOutput: 'HTTP response dari server (200 OK atau redirect). Di terminal: terlihat header HTTP request dan response.',
        hint: 'Di Wireshark, gunakan filter "http.request.method == POST" lalu klik kanan pada paket → Follow → TCP Stream untuk melihat seluruh percakapan HTTP termasuk kredensial dalam cleartext.',
        screenshotNote: 'Screenshot TCP Stream di Wireshark yang menampilkan POST body dengan parameter uname dan pass dalam cleartext. Ini adalah bukti utama kerentanan HTTP.',
        warningNote: 'JANGAN pernah menggunakan kredensial asli (username/password nyata) dalam exercise ini. Testphp.vulnweb.com adalah site yang sengaja dibuat untuk latihan keamanan. Hanya gunakan test credentials.',
      },
      {
        title: 'DHCP Traffic Analysis',
        description:
          'Lepaskan IP address saat ini dan minta IP baru menggunakan dhclient untuk memicu proses DORA. Di Wireshark, filter "bootp || dhcp" dan amati 4 paket: DHCP Discover, DHCP Offer, DHCP Request, dan DHCP Acknowledge. Perhatikan informasi yang dibawa setiap paket termasuk server IP, offered IP, dan lease time.',
        command: 'sudo dhclient -r && sudo dhclient eth0',
        expectedOutput: 'DHCPRELEASE sent. DHCPDISCOVER on eth0...\nDHCPOFFER from 192.168.x.x\nDHCPREQUEST on eth0...\nbound to 192.168.x.x -- renewal in XXXX seconds.',
        hint: 'Jika menggunakan NetworkManager, gunakan: "nmcli con down eth0 && nmcli con up eth0" sebagai alternatif. Filter Wireshark alternatif: "udp.port == 67 || udp.port == 68".',
        screenshotNote: 'Screenshot Wireshark yang menampilkan keempat paket DHCP DORA secara berurutan. Perluas paket DHCP Offer dan identifikasi field: Your IP Address, Subnet Mask, Router (gateway), DNS, dan Lease Time.',
        warningNote: 'Menjalankan "dhclient -r" akan memutuskan koneksi jaringan sementara. Pastikan tidak ada aktivitas penting yang bergantung pada koneksi tersebut.',
      },
    ],
    deliverable:
      'Laporan lab berisi: (1) Screenshot TCP 3-way handshake dengan analisis Sequence/Acknowledgment number dan flag pada setiap paket, (2) Screenshot DNS query dan response dengan identifikasi record type dan TTL, (3) Screenshot cleartext HTTP POST dengan redacted credentials (blur/censor bagian password) dan analisis mengapa ini berbahaya, (4) Screenshot 4 paket DHCP DORA dengan penjelasan isi setiap paket, (5) Jawaban pertanyaan: Bagaimana attacker dapat memanfaatkan cleartext HTTP untuk mencuri session cookie? Apa perbedaan keamanan antara POP3 dan IMAPS?',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CASE STUDY (default)
  // ─────────────────────────────────────────────────────────────────────────────
  caseStudy: {
    title: 'DNS Tunneling untuk Data Exfiltration di Perusahaan Fintech',
    scenario:
      'Tim SOC perusahaan fintech PayNow mendeteksi anomali traffic DNS: sistem SIEM mencatat lebih dari 15.000 DNS TXT query per jam ke domain external "*.transfer-data.xyz" dengan subdomain yang terlihat seperti string base64 acak panjang (mis. "aGVsbG8gd29ybGQ.transfer-data.xyz"). Volume ini 500x lebih tinggi dari baseline normal, dan domain tujuan baru terdaftar 3 hari yang lalu.',
    questions: [
      'Jelaskan teknik DNS Tunneling secara detail: bagaimana data dapat di-encode dalam DNS query dan bagaimana attacker mengekstrak data tersebut di sisi server mereka.',
      'Mengapa DNS Tunneling sangat efektif melewati firewall konvensional, dan indikator teknis apa yang membedakan DNS Tunneling dari DNS query normal (hint: analisis entropy, panjang subdomain, volume query)?',
      'Tulis aturan deteksi SIEM atau IDS yang dapat mengidentifikasi DNS Tunneling berdasarkan: frekuensi query, panjang subdomain, entropy karakter, dan domain yang baru terdaftar.',
      'Apa langkah investigasi dan remediasi yang harus dilakukan tim SOC, termasuk cara mengidentifikasi host yang terinfeksi dan memutus tunnel tanpa merusak layanan DNS yang legitimate?',
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CASE STUDY POOL (15 variants)
  // ─────────────────────────────────────────────────────────────────────────────
  caseStudyPool: [
    // 1 — Rumah Sakit
    {
      title: 'DHCP Starvation dan Rogue DHCP di Jaringan Rumah Sakit',
      scenario:
        'Rumah Sakit Bhakti Medika melaporkan bahwa sejak pukul 08.00 pagi, seluruh laptop klinis di bangsal rawat inap gagal mendapatkan IP address dan tidak dapat mengakses sistem informasi rumah sakit (SIMRS). Investigasi awal menemukan DHCP pool (192.168.50.1–254) sudah habis meskipun hanya ada 80 perangkat aktif, dan beberapa perangkat yang berhasil mendapat IP memiliki gateway yang mengarah ke IP 192.168.50.201 yang bukan milik router resmi.',
      questions: [
        'Jelaskan dua serangan yang terjadi secara bersamaan: DHCP Starvation (menghabiskan pool) dan Rogue DHCP Server (menawarkan gateway palsu), dan bagaimana keduanya saling mendukung untuk mencapai tujuan attacker.',
        'Apa dampak klinis konkret dari kegagalan akses SIMRS di bangsal rawat inap, dan mengapa ini dikategorikan sebagai insiden dengan risiko keselamatan pasien?',
        'Jelaskan konfigurasi DHCP Snooping yang harus diterapkan pada switch akses untuk mencegah kedua serangan ini, beserta konfigurasi lengkap pada Cisco IOS.',
        'Bagaimana tim IT dapat dengan cepat mengidentifikasi perangkat yang menjadi sumber DHCP Starvation (yang mengirim ribuan DHCP Discover), dan langkah isolasi apa yang dapat dilakukan tanpa mengganggu perangkat yang legitimate?',
      ],
    },
    // 2 — Bank
    {
      title: 'DNS Cache Poisoning pada Server Resolver Bank',
      scenario:
        'Bank Mandiri Sejahtera menerima laporan dari nasabah bahwa halaman login internet banking mereka menampilkan certificate warning dan URL yang sedikit berbeda. Investigasi tim IT menemukan bahwa DNS resolver internal bank (10.0.0.53) memiliki entri palsu untuk domain "bankmandirisejahtera.co.id" yang mengarah ke IP server di Belanda, bukan ke server produksi bank di Jakarta.',
      questions: [
        'Jelaskan mekanisme teknis serangan DNS Cache Poisoning: bagaimana attacker dapat memasukkan record DNS palsu ke cache resolver tanpa memiliki akses langsung ke server DNS?',
        'Apa yang seharusnya dialami nasabah jika mengakses internet banking melalui resolver yang ter-poison, dan bagaimana sertifikat HTTPS seharusnya melindungi mereka (atau mengapa tidak melindungi jika attacker juga memiliki sertifikat palsu)?',
        'Jelaskan bagaimana DNSSEC dapat mencegah DNS Cache Poisoning, dan apa hambatan implementasi DNSSEC yang membuat banyak organisasi belum mengadopsinya.',
        'Rancang proses incident response untuk insiden ini: bagaimana cara membersihkan cache resolver yang ter-poison, notifikasi nasabah yang terdampak, dan investigasi untuk menentukan berapa lama cache telah ter-poison.',
      ],
    },
    // 3 — Pemerintah
    {
      title: 'DNS Tunneling untuk Command and Control di Instansi Pemerintah',
      scenario:
        'Analis keamanan Badan Siber Pemerintah mendeteksi bahwa workstation di salah satu kementerian mengirimkan DNS query dengan pola tidak wajar: query ke subdomain sangat panjang (64+ karakter) ke domain "updates-cdn77.net" setiap 30 detik dengan interval yang sangat teratur, bahkan saat pengguna tidak aktif. Analisis sandbox menunjukkan domain tersebut terdaftar oleh grup APT yang dikenal menggunakan DNS sebagai C2 channel.',
      questions: [
        'Jelaskan bagaimana DNS Tunneling digunakan sebagai Command and Control (C2) channel: bagaimana instruksi dikirim ke malware dan bagaimana malware melaporkan hasil eksekusi melalui DNS.',
        'Mengapa metode C2 via DNS sangat susah diblokir dibandingkan C2 via HTTP/HTTPS langsung, terutama dalam konteks jaringan pemerintah yang memiliki whitelist traffic ketat?',
        'Rancang aturan deteksi DNS Tunneling yang komprehensif, mencakup: analisis panjang subdomain, frekuensi query, entropy Shannon, domain age, dan passive DNS reputation.',
        'Apa tindakan penanggulangan jangka panjang yang harus diimplementasikan termasuk DNS RPZ (Response Policy Zone), DNS sinkholes, dan kebijakan penggunaan DNS resolver yang terkontrol?',
      ],
    },
    // 4 — Universitas
    {
      title: 'DHCP Rogue Server di Jaringan Wi-Fi Mahasiswa',
      scenario:
        'Universitas Nusantara Jaya melaporkan bahwa ratusan mahasiswa di gedung fakultas teknik tiba-tiba tidak bisa mengakses internet meski perangkat mereka menunjukkan status "Connected". Investigasi menemukan bahwa mahasiswa mendapatkan IP dari DHCP server tidak sah yang berjalan dari laptop salah satu mahasiswa, dengan gateway disetel ke 0.0.0.0 (invalid), menyebabkan seluruh traffic drop.',
      questions: [
        'Jelaskan mengapa laptop mahasiswa menerima DHCP Offer dari Rogue DHCP Server alih-alih dari DHCP server resmi universitas, padahal keduanya merespons pada waktu yang hampir bersamaan.',
        'Apa perbedaan dampak antara Rogue DHCP Server yang menggunakan gateway invalid (0.0.0.0, menyebabkan DoS) versus yang menggunakan gateway attacker (menyebabkan MITM)?',
        'Jelaskan konfigurasi teknis DHCP Snooping pada switch Cisco yang dapat mencegah kejadian ini, beserta cara mengidentifikasi port mana yang harus ditandai sebagai "trusted" di lingkungan Wi-Fi kampus.',
        'Bagaimana universitas dapat mendeteksi keberadaan Rogue DHCP Server secara proaktif menggunakan tools seperti DHCP probe atau Nmap, sebelum menyebabkan gangguan layanan?',
      ],
    },
    // 5 — E-Commerce
    {
      title: 'HTTP Traffic Interception dan Session Hijacking di Platform E-Commerce',
      scenario:
        'Platform e-commerce OlshopMurah.id masih menggunakan HTTP (bukan HTTPS) untuk halaman checkout, dengan alasan biaya sertifikat SSL. Pada sebuah event flash sale, tim keamanan menemukan laporan pengguna yang saldo OlshopMurah Pointnya tiba-tiba terkuras. Analisis log server menunjukkan ribuan session cookie yang valid digunakan dari IP yang berbeda dari IP login awal pengguna.',
      questions: [
        'Jelaskan secara teknis bagaimana attacker dapat menggunakan Wireshark di jaringan Wi-Fi publik untuk mencuri session cookie dari traffic HTTP cleartext dan melakukan session hijacking.',
        'Hitung risiko bisnis dari insiden ini: jika 1.000 session cookie dicuri dan rata-rata saldo OlshopMurah Points per user adalah Rp 150.000, berapa total kerugian finansial dan reputasi yang mungkin terjadi?',
        'Jelaskan perbedaan antara SSL Stripping Attack dan HTTPS downgrade, dan bagaimana HTTP Strict Transport Security (HSTS) dapat mencegah kedua serangan tersebut.',
        'Rancang roadmap migrasi HTTP → HTTPS yang mencakup: prioritasi halaman kritis, implementasi HSTS, mixed content handling, dan testing sebelum go-live.',
      ],
    },
    // 6 — Manufaktur
    {
      title: 'DNS Poisoning untuk Redirect Update Server di Lingkungan Manufaktur',
      scenario:
        'Sistem SCADA pabrik kimia PT Syntex menggunakan software industrial yang secara otomatis mengunduh update firmware dari server vendor "updates.vendor-syntex.com". Tim keamanan menemukan bahwa pada suatu malam, resolver DNS internal men-cache record palsu yang mengarahkan domain tersebut ke server attacker, sehingga firmware berbahaya berhasil terdownload ke 3 workstation SCADA sebelum terdeteksi keesokan harinya.',
      questions: [
        'Jelaskan mengapa supply chain attack melalui DNS Poisoning (mengganti URL update firmware) sangat efektif dan berpotensi sangat destruktif di lingkungan industri manufaktur.',
        'Apa yang seharusnya dapat mencegah instalasi firmware berbahaya meskipun attacker berhasil men-redirect URL download: mekanisme verifikasi integritas apa yang seharusnya ada di software update tersebut?',
        'Rancang arsitektur update management yang aman untuk sistem SCADA: air-gapped update repository internal, code signing verification, dan approval workflow sebelum deployment ke production.',
        'Apa langkah forensik yang harus dilakukan pada 3 workstation SCADA yang ter-compromise: bagaimana memverifikasi apakah firmware berbahaya sudah aktif dieksekusi, dan apa risiko terhadap proses produksi?',
      ],
    },
    // 7 — Telekomunikasi
    {
      title: 'NAT Table Exhaustion dan UDP Flood pada ISP',
      scenario:
        'Operator telekomunikasi CyberNet Indonesia mendeteksi bahwa gateway NAT utama mereka (yang menangani 50.000 pelanggan) mengalami CPU 100% dan banyak koneksi pelanggan timeout. Analisis menunjukkan tabel NAT (NAT translation table) penuh akibat menerima jutaan paket UDP dengan port tujuan acak dari beberapa IP sumber di internet, memaksa gateway terus membuat dan menutup entri NAT baru.',
      questions: [
        'Jelaskan bagaimana serangan UDP Flood yang ditujukan ke IP publik gateway dapat menyebabkan NAT Table Exhaustion, dan mengapa serangan ini mempengaruhi semua 50.000 pelanggan meskipun hanya satu IP yang diserang.',
        'Apa perbedaan antara NAT table yang kehabisan kapasitas versus CPU overload pada gateway, dan bagaimana keduanya berinteraksi dalam membuat layanan terdegradasi?',
        'Jelaskan mekanisme teknis rate-limiting dan connection tracking yang dapat diterapkan pada gateway untuk mencegah NAT Table Exhaustion dari UDP Flood.',
        'Bagaimana ISP dapat mengimplementasikan BCP38 (Network Ingress Filtering) untuk mencegah pelanggan mereka menjadi sumber serangan UDP Flood ke target di internet?',
      ],
    },
    // 8 — Startup
    {
      title: 'Email SMTP Relay Abuse dan Phishing Campaign',
      scenario:
        'Startup teknologi pendidikan EduTech.id menemukan bahwa server email SMTP mereka (mail.edutech.id) tiba-tiba masuk ke dalam blacklist email global (Spamhaus, SURBL) karena terdeteksi mengirimkan 500.000 email phishing per jam ke seluruh dunia. Investigasi menemukan SMTP server dikonfigurasi sebagai open relay — menerima email dari siapapun untuk diteruskan ke tujuan manapun tanpa autentikasi.',
      questions: [
        'Jelaskan apa itu SMTP Open Relay dan bagaimana attacker dapat memanfaatkannya untuk mengirimkan email phishing dalam skala besar menggunakan infrastruktur server korban.',
        'Apa konsekuensi jangka pendek dan jangka panjang bagi EduTech.id akibat server email mereka masuk blacklist: dampak ke komunikasi internal, deliverability email ke pelanggan, dan reputasi domain.',
        'Jelaskan konfigurasi SMTP yang harus diterapkan untuk mencegah open relay: SMTP Authentication (SMTP AUTH), relay restrictions, dan implementasi SPF/DKIM/DMARC records.',
        'Rancang langkah-langkah untuk memulihkan reputasi domain EduTech.id dari blacklist: proses delisting, hardening konfigurasi email server, dan komunikasi ke penerima email yang terdampak.',
      ],
    },
    // 9 — Logistik
    {
      title: 'DNS Hijacking pada Sistem Pelacakan Armada Logistik',
      scenario:
        'Perusahaan logistik SwiftDeliver menggunakan aplikasi mobile untuk sopir yang berkomunikasi dengan server tracking via API REST. Tim IT menemukan bahwa selama dua hari, response API mengembalikan data lokasi yang tidak konsisten. Investigasi menemukan bahwa DNS resolver yang digunakan perangkat sopir (hotspot dari smartphone pribadi) mengembalikan IP palsu untuk domain API "api.swiftdeliver.co.id", mengarahkan traffic ke server proxy yang memodifikasi data lokasi.',
      questions: [
        'Jelaskan bagaimana penggunaan DNS resolver dari ISP/hotspot pribadi yang tidak terkontrol dapat menjadi celah keamanan, dan mengapa DNS resolver publik (8.8.8.8, 1.1.1.1) lebih aman dibanding resolver ISP lokal yang tidak terpercaya.',
        'Bagaimana implementasi DNS over HTTPS (DoH) atau DNS over TLS (DoT) pada aplikasi mobile dapat mencegah DNS Hijacking, dan apa trade-off performa vs keamanannya?',
        'Jelaskan bagaimana certificate pinning di aplikasi mobile dapat memberikan lapisan keamanan tambahan bahkan jika DNS telah di-hijack dan traffic melewati proxy attacker.',
        'Rancang prosedur audit keamanan untuk aplikasi mobile yang digunakan di lapangan (field application) yang mencakup: DNS security, certificate validation, dan deteksi proxy/MITM.',
      ],
    },
    // 10 — PLTU
    {
      title: 'NAT Traversal Attack pada Jaringan SCADA PLTU',
      scenario:
        'PLTU Jawa Barat menggunakan konfigurasi NAT untuk memisahkan jaringan kontrol (10.100.0.0/24) dari jaringan korporat (192.168.0.0/24), dengan asumsi NAT memberikan keamanan yang cukup. Tim keamanan menemukan bahwa attacker yang sudah berada di jaringan korporat berhasil mengakses antarmuka web HMI (Human Machine Interface) di jaringan kontrol melalui teknik NAT traversal menggunakan STUN protocol.',
      questions: [
        'Jelaskan mengapa NAT bukan merupakan pengganti firewall yang memadai untuk melindungi jaringan SCADA, dan bagaimana teknik NAT traversal dapat mengakali proteksi NAT.',
        'Apa risiko konkret dari akses tidak sah ke HMI PLTU: proses fisik apa yang dapat dimanipulasi, dan apa skenario worst-case dari perspektif keselamatan dan ketersediaan listrik?',
        'Rancang arsitektur keamanan yang tepat untuk memisahkan jaringan SCADA dari jaringan korporat: kombinasi firewall industri, data diode, dan DMZ untuk komunikasi yang aman.',
        'Jelaskan regulasi keamanan siber untuk infrastruktur kritis di Indonesia (Perpres 82/2022 tentang PSSK, regulasi BSSN) yang relevan untuk insiden ini dan kontrol wajib yang harus diimplementasikan.',
      ],
    },
    // 11 — TV Nasional
    {
      title: 'HTTP Interception dan Content Injection pada Sistem Distribusi Konten TV',
      scenario:
        'Stasiun TV VisionIndonesia menggunakan HTTP (bukan HTTPS) untuk mendistribusikan metadata program dan iklan dari server konten ke 50 monitor informasi yang tersebar di lobby dan studio. Tim produksi menemukan bahwa beberapa monitor menampilkan iklan yang tidak mereka pesan dan teks running ticker yang memuat informasi tidak akurat. Investigasi menemukan traffic HTTP antara server konten dan monitor di-intercept dan dimodifikasi.',
      questions: [
        'Jelaskan teknik HTTP content injection: bagaimana attacker yang berada di posisi MITM dapat memodifikasi response HTTP untuk menyisipkan konten berbahaya atau memodifikasi konten yang ada.',
        'Apa implikasi hukum dan reputasi bagi stasiun TV jika konten yang ditampilkan telah dimanipulasi pihak ketiga, terutama jika menyangkut informasi berita atau konten iklan yang salah?',
        'Jelaskan bagaimana migrasi dari HTTP ke HTTPS untuk sistem distribusi konten internal, termasuk penggunaan self-signed certificate atau internal CA, dapat mencegah serangan ini.',
        'Rancang monitoring dan alerting yang dapat mendeteksi content manipulation secara real-time: checksum verification, content integrity monitoring, dan anomaly detection untuk perubahan konten yang tidak terjadwal.',
      ],
    },
    // 12 — Firma Hukum
    {
      title: 'Email Spoofing dan Business Email Compromise di Firma Hukum',
      scenario:
        'Firma hukum Kusuma & Partners kehilangan Rp 2,5 miliar akibat Business Email Compromise (BEC): klien korporat mereka menerima email yang tampak dari managing partner firma (dari alamat yang sangat mirip: partner@kusumapartners.co vs partner@kusuma-partners.co) yang meminta transfer uang segera untuk biaya penyelesaian kasus ke rekening berbeda. Klien langsung mentransfer karena email terlihat sangat meyakinkan termasuk tanda tangan digital yang mirip.',
      questions: [
        'Jelaskan perbedaan teknis antara email spoofing (memalsukan header From) dan domain look-alike (mendaftarkan domain mirip): yang mana yang lebih mungkin digunakan dalam insiden ini berdasarkan deskripsi kasus?',
        'Bagaimana implementasi DMARC dengan policy "reject" dapat mencegah email spoofing, dan mengapa banyak organisasi memilih policy "quarantine" atau "none" terlebih dahulu?',
        'Apa prosedur verifikasi non-teknis yang seharusnya dilakukan klien sebelum melakukan transfer bank berdasarkan instruksi email, dan bagaimana firma hukum seharusnya mengedukasi klien tentang risiko BEC?',
        'Rancang investigasi forensik email untuk membuktikan bahwa email tersebut adalah palsu, mencakup: analisis header email, IP lookup, domain registration records, dan koordinasi dengan penyedia email.',
      ],
    },
    // 13 — Asuransi
    {
      title: 'DNS-based Data Exfiltration dari Sistem Klaim Asuransi',
      scenario:
        'Perusahaan asuransi Sentosa Life menemukan bahwa data nasabah (nama, nomor polis, riwayat klaim) telah bocor ke luar jaringan melalui mekanisme yang tidak diketahui. Firewall hanya mengizinkan HTTP/HTTPS dan DNS outbound. Analisis traffic menunjukkan peningkatan volume DNS query 10x dari baseline normal dengan subdomain yang mengandung string seperti "am9obi5kb2U6MzQ1NjcuMDo..." (base64 encoded) ke domain "cdn-analytics99.net".',
      questions: [
        'Decode string base64 "am9obi5kb2U6MzQ1NjcuMA==" dan jelaskan bagaimana format encoding seperti ini digunakan untuk menyisipkan data sensitif ke dalam DNS subdomain label.',
        'Jelaskan komponen teknis yang dibutuhkan untuk membangun DNS exfiltration channel: malware di client side, DNS server yang dikontrol attacker, dan mekanisme reassembly data di sisi attacker.',
        'Rancang strategi deteksi multi-layer untuk DNS exfiltration: analisis volume (baseline + threshold), analisis string (entropy, panjang, karakter set), dan network-level blocking menggunakan DNS RPZ.',
        'Apa kewajiban perusahaan asuransi setelah mendeteksi kebocoran data nasabah berdasarkan PP 71/2019 tentang Penyelenggaraan Sistem Elektronik, dan apa langkah notifikasi yang harus dilakukan?',
      ],
    },
    // 14 — Properti
    {
      title: 'DHCP Starvation dan NAT Bypass pada Sistem Properti Smart Building',
      scenario:
        'Perusahaan properti MegaCity Group mengoperasikan smart building management system di kompleks perkantoran premium mereka. Sistem ini menggunakan DHCP untuk perangkat IoT (termostat, access control, elevator controller) di subnet 10.200.0.0/24. Tim IT menemukan bahwa selama hari tertentu semua perangkat IoT gagal mendapat IP, sistem HVAC mati, dan lift tidak merespons. Log menunjukkan 50.000 DHCP Discover dalam 5 menit dari MAC address acak.',
      questions: [
        'Jelaskan dampak kaskadir (cascading effect) dari DHCP Starvation pada smart building system: mulai dari kegagalan DHCP, gagalnya perangkat IoT mendapat IP, hingga dampak fisik pada penghuni gedung.',
        'Mengapa DHCP Starvation pada jaringan IoT smart building lebih berbahaya dari pada jaringan IT kantor biasa, mengingat dampaknya terhadap sistem keselamatan (fire alarm, emergency access)?',
        'Rancang arsitektur jaringan untuk smart building yang memisahkan perangkat IoT keselamatan kritis (fire, emergency) dari IoT kenyamanan (HVAC, lift) menggunakan VLAN terpisah dengan pool DHCP terdedikasi.',
        'Jelaskan konfigurasi DHCP Snooping rate-limiting yang dapat mencegah serangan ini tanpa mengganggu perangkat IoT legitimate yang kadang-kadang melakukan renewal burst saat boot.',
      ],
    },
    // 15 — Lembaga Zakat
    {
      title: 'DNS Spoofing pada Portal Donasi Lembaga Zakat',
      scenario:
        'Selama bulan Ramadan — periode penerimaan donasi terbesar — portal donasi lembaga zakat NurZakat (nurzakat.or.id) mengalami insiden: sejumlah donatur yang mengetik alamat website di browser langsung diarahkan ke halaman phishing yang identik tampilan visualnya, bahkan dengan nama domain yang mirip (nurrзakat.or.id menggunakan karakter Cyrillic). Investigasi menemukan bahwa ISP yang digunakan mayoritas donatur memiliki DNS resolver yang ter-poisoned.',
      questions: [
        'Jelaskan bagaimana serangan IDN Homograph Attack (menggunakan karakter Unicode yang mirip dengan karakter Latin) digabungkan dengan DNS Poisoning untuk membuat phishing yang sangat meyakinkan.',
        'Mengapa donatur yang mengetikkan URL manual (bukan dari link) tetap bisa menjadi korban jika DNS resolver ISP mereka telah ter-poison, dan apa keterbatasan HTTPS dalam skenario ini jika attacker memiliki domain look-alike?',
        'Apa langkah-langkah yang harus dilakukan NurZakat untuk memproteksi donatur: kombinasi teknis (DNSSEC, HSTS, certificate transparency monitoring) dan non-teknis (edukasi donatur, nomor konfirmasi donasi)?',
        'Bagaimana NurZakat dapat berkoordinasi dengan BSSN, Kominfo, dan ISP yang terdampak untuk mempercepat pembersihan cache DNS yang ter-poison dan melaporkan domain phishing?',
      ],
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // QUIZ
  // ─────────────────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 1,
      question: 'Urutan langkah yang benar dalam TCP 3-Way Handshake adalah?',
      options: [
        'SYN → ACK → SYN-ACK',
        'SYN-ACK → SYN → ACK',
        'SYN → SYN-ACK → ACK',
        'ACK → SYN → SYN-ACK',
      ],
      answer: 'SYN → SYN-ACK → ACK',
      type: 'multiple-choice',
    },
    {
      id: 2,
      question: 'Protokol mana yang paling tepat digunakan untuk streaming video real-time dan mengapa?',
      options: [
        'TCP, karena menjamin semua frame video terkirim tanpa kehilangan',
        'UDP, karena latency rendah lebih penting daripada pengiriman sempurna tiap frame',
        'ICMP, karena overhead-nya paling rendah di antara semua protokol',
        'HTTP/2, karena multiplexing-nya cocok untuk streaming',
      ],
      answer: 'UDP, karena latency rendah lebih penting daripada pengiriman sempurna tiap frame',
      type: 'multiple-choice',
    },
    {
      id: 3,
      question: 'Proses DHCP DORA berlangsung dalam urutan paket apa?',
      options: [
        'Discover → Request → Offer → Acknowledge',
        'Discover → Offer → Request → Acknowledge',
        'Request → Offer → Discover → Acknowledge',
        'Offer → Discover → Acknowledge → Request',
      ],
      answer: 'Discover → Offer → Request → Acknowledge',
      type: 'multiple-choice',
    },
    {
      id: 4,
      question: 'Seorang analis melihat ratusan DHCP Discover per detik dari MAC address yang berbeda-beda dari satu port switch. Apa yang paling mungkin terjadi?',
      options: [
        'Banyak perangkat baru bergabung ke jaringan secara bersamaan',
        'DHCP Starvation Attack — attacker menghabiskan pool IP dengan MAC address palsu',
        'DHCP server mengalami kegagalan dan client melakukan retry',
        'Proses normal DHCP renewal yang terjadi secara bersamaan',
      ],
      answer: 'DHCP Starvation Attack — attacker menghabiskan pool IP dengan MAC address palsu',
      type: 'multiple-choice',
    },
    {
      id: 5,
      question: 'DNS record type apa yang digunakan untuk memetakan nama domain ke alamat IPv4?',
      options: [
        'AAAA record',
        'PTR record',
        'A record',
        'CNAME record',
      ],
      answer: 'A record',
      type: 'multiple-choice',
    },
    {
      id: 6,
      question: 'Pada serangan DNS Tunneling, mengapa data dapat dikirim melalui DNS meskipun firewall memblokir semua traffic selain port 80 dan 443?',
      options: [
        'Karena DNS menggunakan UDP yang tidak bisa diblokir firewall',
        'Karena DNS (port 53) biasanya selalu diizinkan oleh firewall sebagai layanan infrastruktur wajib',
        'Karena DNS menggunakan enkripsi yang tidak dapat diperiksa firewall',
        'Karena DNS berjalan di Layer 2 sehingga tidak terpengaruh aturan firewall Layer 3',
      ],
      answer: 'Karena DNS (port 53) biasanya selalu diizinkan oleh firewall sebagai layanan infrastruktur wajib',
      type: 'multiple-choice',
    },
    {
      id: 7,
      question: 'Mengapa implementasi NAT tidak dapat dianggap sebagai pengganti firewall yang lengkap?',
      options: [
        'NAT hanya bekerja untuk IPv4, tidak untuk IPv6',
        'NAT hanya menyembunyikan IP internal (security by obscurity) tanpa memfilter traffic berdasarkan aturan keamanan',
        'NAT membuat semua koneksi masuk ke jaringan internal diblokir secara permanen',
        'NAT tidak kompatibel dengan protokol TCP sehingga tidak dapat melindungi traffic web',
      ],
      answer: 'NAT hanya menyembunyikan IP internal (security by obscurity) tanpa memfilter traffic berdasarkan aturan keamanan',
      type: 'multiple-choice',
    },
    {
      id: 8,
      question: 'Seorang pengguna di Wi-Fi kafe mengakses situs e-commerce menggunakan HTTP (bukan HTTPS) dan melakukan login. Informasi sensitif apa yang dapat dicuri attacker di jaringan yang sama menggunakan Wireshark?',
      options: [
        'Hanya alamat IP server tujuan',
        'Username, password, dan session cookie dalam cleartext',
        'Hanya metadata koneksi (ukuran paket, waktu) karena data dienkripsi',
        'Tidak ada — Wi-Fi WPA2 sudah mengenkripsi semua traffic',
      ],
      answer: 'Username, password, dan session cookie dalam cleartext',
      type: 'multiple-choice',
    },
    {
      id: 9,
      question:
        'Jelaskan perbedaan antara DNS Cache Poisoning dan DNS Tunneling, termasuk tujuan attacker yang berbeda dalam setiap serangan!',
      answer:
        'DNS Cache Poisoning: attacker memasukkan record DNS palsu ke dalam cache resolver DNS (biasanya resolver ISP atau korporat) sehingga semua pengguna yang menggunakan resolver tersebut diarahkan ke server palsu attacker. Tujuan: redirect pengguna ke situs phishing, intercept credential, atau distributed DoS. Serangan ini memanipulasi data di resolver (bukan di end user). DNS Tunneling: attacker menyisipkan data dalam payload DNS query/response untuk membangun covert channel komunikasi — biasanya untuk exfiltrasi data (data sensitif di-encode dalam subdomain label) atau Command & Control (instruksi malware dikirim via DNS response). Tujuan: melewati firewall yang memblokir semua port kecuali DNS. Perbedaan utama: Cache Poisoning memanipulasi DNS infrastructure untuk redirect; Tunneling menggunakan DNS sebagai carrier protocol untuk data non-DNS.',
      type: 'essay',
    },
    {
      id: 10,
      question:
        'Mengapa SYN Flood Attack sangat efektif dalam menyebabkan Denial of Service? Jelaskan mekanisme teknis dan metode mitigasinya!',
      answer:
        'SYN Flood Attack mengeksploitasi mekanisme TCP 3-Way Handshake: attacker mengirimkan sejumlah besar paket SYN dengan source IP yang di-spoof (palsu), tanpa pernah menyelesaikan handshake dengan mengirim ACK ketiga. Server mengalokasikan resource (memori, entri di TCP connection table) untuk setiap half-open connection sambil menunggu ACK yang tidak pernah datang. Karena batas jumlah half-open connections terbatas, server cepat kehabisan resource dan menolak koneksi legitimate. Mitigasi: (1) SYN Cookies — server tidak mengalokasikan resource sampai handshake selesai, menggunakan hash kriptografis sebagai ISN; (2) SYN Proxy di firewall — firewall menghandle handshake untuk server; (3) Rate limiting SYN packet per sumber IP; (4) Increase half-open connection timeout agar lebih cepat expire; (5) Anti-spoofing (BCP38) untuk mencegah IP spoofing dari ISP.',
      type: 'essay',
    },
    {
      id: 11,
      question:
        'Apa yang dimaksud dengan "DHCP Snooping Binding Table" dan bagaimana tabel ini digunakan oleh Dynamic ARP Inspection (DAI) dan IP Source Guard?',
      answer:
        'DHCP Snooping Binding Table adalah database yang dibangun secara otomatis oleh fitur DHCP Snooping di switch. Tabel ini mencatat setiap IP address yang di-assign oleh DHCP server ke client, beserta: MAC address client, port switch yang digunakan, VLAN, dan lease time. Tabel ini hanya diperbarui melalui port yang ditandai "trusted" (port ke DHCP server resmi). Penggunaan oleh DAI: ketika ada ARP packet masuk melalui port "untrusted", switch memverifikasi apakah kombinasi Sender IP + Sender MAC dalam ARP packet cocok dengan entri di Binding Table. Jika tidak cocok, packet di-drop (ARP Spoofing terdeteksi). Penggunaan oleh IP Source Guard: memfilter IP packet di Layer 2 — hanya mengizinkan paket yang memiliki source IP yang terdaftar di Binding Table untuk port tersebut, mencegah IP spoofing.',
      type: 'essay',
    },
    {
      id: 12,
      question:
        'Jelaskan bagaimana attacker dapat melakukan SSL Stripping Attack, dan bagaimana HSTS (HTTP Strict Transport Security) mencegahnya!',
      answer:
        'SSL Stripping Attack: attacker yang berada di posisi MITM (mis. setelah ARP Poisoning) memodifikasi traffic antara client dan server — setiap link HTTPS dalam halaman HTTP diubah menjadi HTTP sebelum dikirim ke client. Client mengira website hanya mendukung HTTP dan mengirimkan data termasuk credential dalam cleartext. Attacker meneruskan traffic ke server asli via HTTPS, sehingga server tidak mengetahui ada serangan. Tool: sslstrip. HSTS mencegah SSL Stripping: HSTS adalah HTTP response header (Strict-Transport-Security: max-age=31536000; includeSubDomains) yang memberitahu browser untuk SELALU menggunakan HTTPS untuk domain tersebut, bahkan jika pengguna mengetik "http://". Browser menyimpan kebijakan HSTS di cache lokal. Sehingga meskipun attacker mencoba mengirimkan link HTTP, browser tetap memaksa upgrade ke HTTPS sebelum request dikirim. HSTS Preload: domain didaftarkan ke browser vendor (Chrome, Firefox) sehingga proteksi aktif bahkan pada kunjungan pertama.',
      type: 'essay',
    },
    {
      id: 13,
      question:
        'Seorang junior analyst melihat traffic DNS dengan subdomain sangat panjang (mis. "dGhpcyBpcyBzZWNyZXQgZGF0YQ==.evil.com") dalam frekuensi tinggi di log firewall. Jelaskan apa yang terjadi dan langkah investigasi yang harus dilakukan!',
      answer:
        'Subdomain panjang dengan karakter yang tampak seperti base64 encoding ("dGhpcyBpcyBzZWNyZXQgZGF0YQ==") ke domain yang tidak dikenal menunjukkan indikator kuat DNS Tunneling — kemungkinan data exfiltration atau malware C2 channel. Langkah investigasi: (1) Decode subdomain: base64 decode "dGhpcyBpcyBzZWNyZXQgZGF0YQ==" → "this is secret data" — konfirmasi data di-encode; (2) Identifikasi source host: cari IP host mana yang mengirimkan query tersebut dari log DNS/SIEM; (3) Analisis domain: cek age domain di whois (domain baru = suspicious), reputasi di VirusTotal/Shodan; (4) Hitung volume dan frekuensi: query setiap 30 detik secara teratur mengindikasikan heartbeat C2; (5) Isolasi host: blokir DNS query ke domain tersebut di DNS RPZ dan isolasi host dari jaringan; (6) Forensik host: analisis proses, koneksi jaringan, file yang diakses untuk menemukan malware yang menggunakan DNS tunneling; (7) Tentukan data apa yang ter-exfiltrasi berdasarkan konten yang di-decode.',
      type: 'essay',
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // VIDEO RESOURCES
  // ─────────────────────────────────────────────────────────────────────────────
  videoResources: [
    {
      title: 'TCP vs UDP - What\'s The Difference?',
      youtubeId: 'uwoD5YsGACg',
      description: 'Penjelasan perbedaan TCP dan UDP beserta use case dan implikasi keamanannya.',
      language: 'en',
      duration: '9:48',
    },
    {
      title: 'DNS Explained - How Domain Name System Works',
      youtubeId: 'mpQZVYPuDGU',
      description: 'Penjelasan lengkap tentang DNS hierarchy, record types, dan proses resolusi.',
      language: 'en',
      duration: '12:30',
    },
    {
      title: 'DHCP Explained - Step by Step',
      youtubeId: 'e6-TaH5bkjo',
      description: 'Penjelasan proses DORA DHCP dan keamanan DHCP dalam bahasa yang mudah dipahami.',
      language: 'en',
      duration: '8:22',
    },
    {
      title: 'HTTP vs HTTPS - Perbedaan dan Keamanan',
      youtubeId: 'hExRDVZHhig',
      description: 'Mengapa HTTPS penting dan bagaimana TLS melindungi komunikasi web.',
      language: 'en',
      duration: '7:54',
    },
    {
      title: 'DNS Tunneling Explained - Data Exfiltration via DNS',
      youtubeId: 'aJEfHPXZUKI',
      description: 'Demo teknis DNS Tunneling dan cara deteksinya.',
      language: 'en',
      duration: '15:18',
    },
  ],
};
