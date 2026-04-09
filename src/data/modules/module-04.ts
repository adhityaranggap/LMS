import type { ModuleData, CaseStudyVariant } from '../module-types';

export const module04: ModuleData & { caseStudyPool: CaseStudyVariant[] } = {
  id: 4,
  title: 'ICMP & ARP',
  description: 'Prinsip Keamanan Jaringan: ICMP, Ping, Traceroute, dan Address Resolution Protocol (ARP)',
  iconName: 'Activity',

  // ─────────────────────────────────────────────────────────────────────────────
  // THEORY
  // ─────────────────────────────────────────────────────────────────────────────
  theory: [
    {
      title: 'ICMP: Fungsi, Tipe Pesan, dan Format Paket',
      content:
        'Internet Control Message Protocol (ICMP) adalah protokol pendukung pada Layer 3 (Network Layer) yang digunakan oleh perangkat jaringan untuk mengirimkan pesan kesalahan (error messages) dan informasi operasional. ICMP tidak membawa data aplikasi, melainkan memberikan umpan balik (feedback) kepada host pengirim tentang kondisi jaringan. RFC 792 mendefinisikan ICMPv4 untuk IPv4, sedangkan RFC 4443 mendefinisikan ICMPv6 untuk IPv6. Format paket ICMP terdiri dari: Type (1 byte), Code (1 byte), Checksum (2 byte), dan Data (variabel).',
      table: {
        caption: 'Tipe Pesan ICMP yang Paling Umum',
        headers: ['Type', 'Code', 'Nama Pesan', 'Keterangan'],
        rows: [
          ['0', '0', 'Echo Reply', 'Balasan dari ping (jawaban atas Type 8)'],
          ['3', '0–15', 'Destination Unreachable', 'Tujuan tidak dapat dijangkau (network/host/port unreachable)'],
          ['5', '0–3', 'Redirect', 'Router memberitahu host untuk menggunakan jalur yang lebih baik'],
          ['8', '0', 'Echo Request', 'Permintaan ping dari pengirim'],
          ['11', '0', 'Time Exceeded (TTL=0)', 'TTL habis di tengah perjalanan (digunakan traceroute)'],
          ['11', '1', 'Time Exceeded (Fragment)', 'Fragment reassembly timeout'],
          ['12', '0', 'Parameter Problem', 'Header IP mengandung kesalahan parameter'],
          ['17', '0', 'Address Mask Request', 'Permintaan subnet mask'],
          ['18', '0', 'Address Mask Reply', 'Balasan subnet mask'],
        ],
      },
      keyPoints: [
        'ICMP berada di atas IP (Network Layer) namun bukan protokol transport; tidak memiliki port.',
        'Setiap pesan ICMP dibawa di dalam paket IP dengan Protocol Number 1.',
        'ICMP Echo Request (Type 8) dan Echo Reply (Type 0) adalah fondasi dari perintah ping.',
        'ICMP dapat dieksploitasi untuk reconnaissance (ping sweep) dan serangan DoS (ping flood, Smurf attack).',
        'Firewall sering memblokir ICMP Type 8 ke perimeter jaringan untuk mencegah host discovery.',
      ],
      note: 'Dari perspektif keamanan, menonaktifkan ICMP sepenuhnya dapat mempersulit troubleshooting. Praktik terbaik adalah membatasi rate ICMP dan memblokir tipe tertentu (mis. Type 8 dari internet ke host internal) daripada memblokir semua ICMP.',
      noteType: 'info',
    },

    {
      title: 'Ping: Cara Kerja dan Analisis Output',
      content:
        'Perintah ping mengirimkan paket ICMP Echo Request (Type 8, Code 0) ke host tujuan dan menunggu ICMP Echo Reply (Type 0, Code 0). Ping digunakan untuk menguji konektivitas Layer 3, mengukur Round-Trip Time (RTT), dan mendeteksi packet loss. RTT yang tinggi (>100ms) mengindikasikan latency; packet loss > 0% mengindikasikan masalah jaringan atau filtering firewall.',
      example: {
        title: 'Interpretasi Output Ping ke 8.8.8.8',
        steps: [
          'Perintah: ping -c 4 8.8.8.8',
          'PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.',
          '64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=14.2 ms  ← Berhasil, TTL=117',
          '64 bytes from 8.8.8.8: icmp_seq=2 ttl=117 time=13.9 ms',
          '64 bytes from 8.8.8.8: icmp_seq=3 ttl=117 time=14.1 ms',
          '64 bytes from 8.8.8.8: icmp_seq=4 ttl=117 time=14.0 ms',
          '--- 8.8.8.8 ping statistics ---',
          '4 packets transmitted, 4 received, 0% packet loss  ← Tidak ada packet loss',
          'rtt min/avg/max/mdev = 13.9/14.05/14.2/0.11 ms  ← Latency sangat stabil',
        ],
        result:
          'Analisis: TTL=117 berarti paket melewati sekitar 8 hop (128−117=11 hop dari Windows default TTL 128, atau 64−117 → kemungkinan default TTL 128 Google). Packet loss 0% berarti koneksi sehat. Jitter (mdev) hanya 0.11ms berarti koneksi sangat stabil.',
      },
      keyPoints: [
        'Default payload ping: 56 byte data + 8 byte ICMP header = 64 byte total.',
        'TTL awal tergantung OS: Linux=64, Windows=128, Cisco IOS=255.',
        'TTL dapat digunakan untuk mengidentifikasi OS tujuan (OS fingerprinting).',
        'Ping sweep: mengirim ping ke seluruh subnet (mis. 192.168.1.1–254) untuk menemukan host aktif.',
        'Ping flood (ping -f) mengirim paket secepat mungkin — ini merupakan serangan DoS sederhana.',
      ],
      note: 'Di Linux, perintah ping -f (flood) membutuhkan hak akses root dan harus digunakan hanya di lingkungan lab terisolasi. Penggunaan di jaringan produksi merupakan pelanggaran etika dan hukum.',
      noteType: 'warning',
    },

    {
      title: 'Traceroute dan Mekanisme TTL',
      content:
        'Traceroute bekerja dengan memanfaatkan field Time-To-Live (TTL) pada IP header. TTL adalah angka maksimum hop yang diizinkan sebelum paket dibuang. Setiap router yang meneruskan paket mengurangi TTL sebanyak 1. Jika TTL mencapai 0, router membuang paket dan mengirimkan pesan ICMP Type 11 "Time Exceeded" kembali ke pengirim. Traceroute memanfaatkan ini secara berulang: pertama mengirim paket TTL=1 (mendapatkan respons dari hop 1), kemudian TTL=2 (hop 2), dan seterusnya hingga tujuan tercapai.',
      example: {
        title: 'Analisis Output Traceroute ke google.com',
        steps: [
          'Perintah: traceroute google.com',
          'traceroute to google.com (172.217.x.x), 30 hops max',
          ' 1  192.168.1.1     2.1 ms   1.9 ms   2.0 ms   ← Gateway lokal (router rumah/kantor)',
          ' 2  10.200.0.1      8.4 ms   8.2 ms   8.5 ms   ← Router ISP pertama',
          ' 3  103.2.x.x      10.1 ms  10.3 ms  10.0 ms   ← Core router ISP',
          ' 4  * * *                                        ← Router tidak merespons ICMP (filtered)',
          ' 5  72.14.x.x      12.5 ms  12.1 ms  12.3 ms   ← Masuk jaringan Google',
          ' 6  172.217.x.x    14.2 ms  14.0 ms  14.1 ms   ← Tujuan tercapai',
        ],
        result:
          'Analisis: Hop 4 (***) berarti router memiliki firewall yang memblokir ICMP Time Exceeded — ini normal pada ISP besar. Peningkatan latency dari hop 2 ke 3 (8ms → 10ms) mengindikasikan link WAN. Total 6 hop ke Google menunjukkan koneksi yang efisien.',
      },
      keyPoints: [
        'Linux menggunakan UDP probe (port 33434+) secara default; Windows menggunakan ICMP Echo Request.',
        'Tanda bintang (***) berarti router tidak merespons ICMP — bukan berarti koneksi terputus.',
        'Traceroute dapat digunakan untuk network mapping dan mengidentifikasi bottleneck.',
        'MTR (My Traceroute) menggabungkan ping dan traceroute secara real-time.',
        'Dari perspektif attacker, traceroute adalah alat reconnaissance pasif untuk memetakan topologi jaringan.',
      ],
    },

    {
      title: 'ARP: Address Resolution Protocol',
      content:
        'ARP (RFC 826) adalah protokol Layer 2/3 yang memetakan IP Address (Layer 3, 32-bit) ke MAC Address (Layer 2, 48-bit). Ketika sebuah host ingin berkomunikasi dengan IP di subnet yang sama, ia perlu mengetahui MAC address tujuan. ARP menggunakan dua pesan: ARP Request (broadcast) dan ARP Reply (unicast). Hasil pemetaan disimpan di ARP Cache untuk mengurangi traffic ARP yang berulang.',
      example: {
        title: 'Proses ARP Request/Reply: Host A (192.168.1.10) ingin menghubungi Host B (192.168.1.20)',
        steps: [
          'Step 1 — Host A cek ARP Cache: Apakah IP 192.168.1.20 sudah ada di tabel? TIDAK.',
          'Step 2 — ARP Request (Broadcast): Host A mengirim frame ke FF:FF:FF:FF:FF:FF.',
          '         Isi: "Who has 192.168.1.20? Tell 192.168.1.10 (MAC: AA:BB:CC:DD:EE:01)"',
          'Step 3 — Semua host di segment menerima broadcast ARP Request.',
          'Step 4 — Host B (192.168.1.20) mengenali IP-nya dan membalas.',
          'Step 5 — ARP Reply (Unicast): Host B → Host A',
          '         Isi: "192.168.1.20 is at MAC: AA:BB:CC:DD:EE:02"',
          'Step 6 — Host A menyimpan mapping 192.168.1.20 → AA:BB:CC:DD:EE:02 di ARP Cache.',
          'Step 7 — Host A mulai mengirim data langsung ke MAC AA:BB:CC:DD:EE:02.',
        ],
        result:
          'ARP Cache entry biasanya memiliki TTL 20 menit (Windows) atau 15 menit (Linux). Setelah expire, proses ARP diulang.',
      },
      table: {
        caption: 'Perbandingan ARP Request vs ARP Reply',
        headers: ['Aspek', 'ARP Request', 'ARP Reply'],
        rows: [
          ['Tujuan Ethernet', 'FF:FF:FF:FF:FF:FF (Broadcast)', 'MAC spesifik penanya (Unicast)'],
          ['Pengirim', 'Host yang membutuhkan informasi', 'Host yang memiliki IP yang ditanyakan'],
          ['Opcode', '1 (Request)', '2 (Reply)'],
          ['Berisi', 'IP target yang dicari', 'MAC address yang diminta'],
          ['Visibilitas', 'Semua host di segment menerima', 'Hanya host penanya yang menerima'],
        ],
      },
      keyPoints: [
        'ARP hanya bekerja dalam satu broadcast domain (subnet yang sama).',
        'ARP tidak memiliki mekanisme autentikasi — ini adalah kelemahan fundamental.',
        'ARP bersifat stateless: setiap host menerima dan menyimpan ARP Reply meskipun tidak memintanya.',
        'Untuk komunikasi lintas subnet, host berkomunikasi dengan MAC default gateway-nya.',
        'Perintah: arp -a (Windows/Linux) untuk melihat ARP cache saat ini.',
      ],
    },

    {
      title: 'ARP Cache, Gratuitous ARP, dan Proxy ARP',
      content:
        'Selain mekanisme ARP dasar, terdapat tiga variasi ARP penting yang perlu dipahami dari perspektif keamanan jaringan: (1) ARP Cache adalah tabel pemetaan IP-MAC yang disimpan sementara di memori host. (2) Gratuitous ARP adalah ARP Reply yang dikirim oleh host tanpa didahului ARP Request — digunakan untuk mengumumkan perubahan IP atau MAC. (3) Proxy ARP adalah teknik di mana router merespons ARP Request atas nama host di subnet lain.',
      table: {
        caption: 'Perbandingan Tiga Variasi ARP',
        headers: ['Tipe', 'Cara Kerja', 'Penggunaan Legitim', 'Potensi Penyalahgunaan'],
        rows: [
          [
            'ARP Cache',
            'Menyimpan mapping IP→MAC selama TTL berlaku',
            'Mengurangi traffic ARP berulang',
            'Dapat diracuni (poisoned) dengan entri palsu',
          ],
          [
            'Gratuitous ARP',
            'ARP Reply dikirim tanpa Request; Sender IP = Target IP',
            'Update cache setelah failover/IP change',
            'Digunakan attacker untuk mem-poison cache tanpa permintaan',
          ],
          [
            'Proxy ARP',
            'Router menjawab ARP Request untuk host di subnet lain',
            'Menghubungkan host tanpa default gateway dikonfigurasi',
            'Dapat dieksploitasi untuk traffic interception',
          ],
        ],
      },
      keyPoints: [
        'Gratuitous ARP dikirim dengan Sender IP = Target IP dalam pesan — semua host yang mendengar akan memperbarui cache-nya.',
        'Gratuitous ARP digunakan secara legitim pada High Availability (HA) failover dan NIC bonding.',
        'Penyerang menggunakan Gratuitous ARP untuk memicu cache update tanpa perlu menunggu ARP Request.',
        'Proxy ARP memungkinkan router menjawab "Who has 10.0.0.5?" meskipun 10.0.0.5 berada di subnet berbeda.',
        'Entri ARP Statis (manual) tidak dapat di-overwrite oleh ARP Reply — mitigasi efektif tapi tidak skalabel.',
      ],
      note: 'Gratuitous ARP adalah vektor utama serangan ARP Spoofing. Pastikan switch mengaktifkan Dynamic ARP Inspection (DAI) untuk memvalidasi ARP packet sebelum diteruskan ke port.',
      noteType: 'warning',
    },

    {
      title: 'ARP Spoofing & Poisoning: Serangan dan Mitigasi',
      content:
        'ARP Spoofing (atau ARP Poisoning) adalah serangan di mana penyerang mengirimkan pesan ARP palsu ke jaringan lokal dengan tujuan mengasosiasikan MAC address penyerang dengan IP address host lain (biasanya gateway). Akibatnya, traffic yang seharusnya dikirim ke gateway malah diarahkan ke penyerang — memungkinkan serangan Man-in-the-Middle (MITM), penyadapan data, session hijacking, hingga credential theft. Tools yang umum digunakan: arpspoof, Ettercap, Bettercap.',
      codeSnippet: `! Konfigurasi Dynamic ARP Inspection (DAI) di Cisco IOS Switch
! ─────────────────────────────────────────────────────────────
! Langkah 1: Aktifkan DHCP Snooping (prerequisite untuk DAI)
ip dhcp snooping
ip dhcp snooping vlan 10

! Langkah 2: Tandai port uplink sebagai trusted
interface GigabitEthernet0/1
 ip dhcp snooping trust
 ip arp inspection trust

! Langkah 3: Aktifkan DAI pada VLAN yang dilindungi
ip arp inspection vlan 10

! Langkah 4: (Opsional) Rate-limit ARP pada port untrusted
interface range GigabitEthernet0/2 - 48
 ip arp inspection limit rate 100

! Verifikasi konfigurasi
show ip arp inspection vlan 10
show ip dhcp snooping binding`,
      keyPoints: [
        'Attacker mengirim Gratuitous ARP palsu: "192.168.1.1 adalah di MAC: ATTACKER_MAC" kepada semua host.',
        'Korban memperbarui ARP cache mereka dan mengirimkan traffic ke attacker alih-alih gateway.',
        'Attacker dapat mem-forward traffic ke gateway asli (MITM invisible) atau membloknya (DoS).',
        'DAI (Dynamic ARP Inspection) memvalidasi ARP packet dengan membandingkannya terhadap DHCP Snooping Binding Table.',
        'Mitigasi lain: Static ARP entries, Port Security, VLAN segmentation, enkripsi end-to-end (TLS/HTTPS).',
        'Deteksi: Anomali di ARP cache (dua IP dengan MAC sama, atau gateway MAC berubah tiba-tiba).',
      ],
      note: 'ARP Spoofing adalah ILLEGAL jika dilakukan pada jaringan tanpa izin. Praktik di lab ini hanya boleh dilakukan pada jaringan yang terisolasi dan dengan izin eksplisit dari pemilik infrastruktur.',
      noteType: 'danger',
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // LAB
  // ─────────────────────────────────────────────────────────────────────────────
  lab: {
    title: 'Lab 4: ICMP Analysis dan ARP Investigation',
    downloads: [
      {
        name: 'Wireshark (Versi Terbaru)',
        url: 'https://www.wireshark.org/download.html',
        description: 'Network protocol analyzer untuk capture dan analisis paket ARP/ICMP secara real-time.',
      },
      {
        name: 'CyberOps Workstation VM',
        url: 'https://www.netacad.com/',
        description: 'Virtual machine Linux yang digunakan sebagai environment lab jaringan.',
      },
    ],
    steps: [
      {
        title: 'Ping Analysis',
        description:
          'Lakukan ping ke Google DNS (8.8.8.8) sebanyak 4 kali dan catat nilai TTL serta round-trip time (RTT). Bandingkan TTL dengan nilai default OS yang umum untuk mengestimasi jumlah hop.',
        command: 'ping -c 4 8.8.8.8',
        expectedOutput:
          '4 packets transmitted, 4 received, 0% packet loss\nrtt min/avg/max/mdev = 13.x/14.x/15.x/0.x ms',
        hint: 'Jika packet loss > 0%, kemungkinan ICMP Type 8 diblokir firewall tujuan. Coba ping ke gateway lokal (ping -c 4 192.168.1.1) untuk memastikan koneksi LAN berfungsi.',
        screenshotNote: 'Screenshot seluruh output ping termasuk statistik packet loss dan RTT.',
      },
      {
        title: 'Traceroute ke Server Publik',
        description:
          'Jalankan traceroute ke google.com dan identifikasi setiap hop: alamat IP router, latency per hop, dan apakah ada hop yang tidak merespons (***). Bandingkan jalur traceroute dengan topologi ISP yang Anda ketahui.',
        command: 'traceroute google.com',
        expectedOutput: 'Daftar hop dengan IP router dan latency (ms), berakhir di 172.217.x.x atau 142.250.x.x',
        hint: 'Di Windows gunakan: tracert google.com. Untuk mendapatkan nama host setiap hop: traceroute -I google.com (Linux) menggunakan ICMP daripada UDP.',
        screenshotNote: 'Screenshot output traceroute lengkap. Tandai hop mana yang menunjukkan *** dan jelaskan kemungkinan penyebabnya.',
        warningNote: 'Beberapa ISP dan server memblokir ICMP/UDP probe sehingga *** bukan selalu indikasi masalah jaringan.',
      },
      {
        title: 'ARP Table Inspection',
        description:
          'Tampilkan ARP cache sistem Anda dan identifikasi setiap entri: IP address, MAC address, interface, dan tipe (dynamic/static). Perhatikan apakah ada IP yang memiliki MAC yang sama — ini bisa menjadi indikator ARP spoofing.',
        command: 'arp -a',
        expectedOutput:
          'Address                  HWtype  HWaddress           Flags Mask  Iface\n192.168.1.1              ether   aa:bb:cc:dd:ee:ff   C           eth0',
        hint: 'Gunakan "ip neigh show" di Linux modern sebagai alternatif yang lebih detail. Flag "C" berarti Complete (dynamic), "M" berarti Permanent (static).',
        screenshotNote: 'Screenshot output arp -a. Tandai dan jelaskan setiap kolom dalam laporan.',
      },
      {
        title: 'Capture ARP dengan Wireshark',
        description:
          'Buka Wireshark dan mulai capture pada interface jaringan Anda. Kosongkan ARP cache menggunakan perintah di bawah, kemudian ping ke gateway Anda (mis. 192.168.1.1). Amati ARP Request (broadcast) dan ARP Reply (unicast) yang muncul di Wireshark.',
        command: 'sudo ip neigh flush all',
        expectedOutput: 'Di Wireshark: terlihat frame ARP Request dengan Destination ff:ff:ff:ff:ff:ff diikuti ARP Reply unicast',
        hint: 'Di Wireshark, gunakan filter "arp" untuk hanya menampilkan paket ARP. Klik pada paket ARP Request dan perluas bagian "Address Resolution Protocol" untuk melihat detail Opcode, Sender MAC/IP, dan Target MAC/IP.',
        screenshotNote: 'Screenshot Wireshark dengan paket ARP Request dan Reply terlihat jelas. Sertakan juga panel detail paket yang menampilkan field ARP.',
        warningNote: 'Perintah "ip neigh flush all" memerlukan hak akses root dan akan menghapus seluruh ARP cache termasuk untuk gateway — koneksi internet akan terputus sesaat sampai ARP diperbarui.',
      },
    ],
    deliverable:
      'Laporan lab berisi: (1) Screenshot dan analisis output ping termasuk interpretasi TTL dan RTT, (2) Screenshot traceroute dengan penjelasan setiap hop dan identifikasi hop yang difilter, (3) Screenshot ARP cache dengan penjelasan setiap kolom, (4) Screenshot Wireshark menampilkan ARP Request dan Reply dengan analisis field-field penting, (5) Jawaban pertanyaan analisis: Mengapa ARP tidak memiliki autentikasi? Apa risiko Gratuitous ARP?',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CASE STUDY (default)
  // ─────────────────────────────────────────────────────────────────────────────
  caseStudy: {
    title: 'Investigasi ARP Spoofing di Jaringan Rumah Sakit',
    scenario:
      'Tim SOC Rumah Sakit Bina Insani mendeteksi anomali pada jam 02.15 WIB: sistem monitoring menunjukkan bahwa ARP cache pada workstation dokter di Lantai 3 tiba-tiba mengarahkan IP gateway (192.168.10.1) ke MAC address yang tidak dikenal. Bersamaan dengan itu, terdeteksi ribuan paket ICMP Echo Request dari satu IP internal ke seluruh subnet 192.168.10.0/24 dalam waktu kurang dari 30 detik.',
    questions: [
      'Identifikasi dua serangan yang sedang berlangsung secara bersamaan dan jelaskan tujuan dari masing-masing serangan tersebut dalam konteks jaringan rumah sakit.',
      'Bagaimana seorang attacker dapat memanfaatkan Gratuitous ARP untuk melakukan serangan MITM? Jelaskan langkah teknisnya secara detail.',
      'Tulis aturan IDS (dalam format Snort/Suricata) yang dapat mendeteksi: (a) ping sweep ke /24 subnet, dan (b) ARP Reply yang tidak diminta (Gratuitous ARP) dari IP bukan gateway.',
      'Sebagai analis SOC, susun langkah-langkah respons insiden yang harus dilakukan segera, termasuk bagaimana cara memulihkan integritas ARP cache di seluruh workstation yang terdampak.',
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CASE STUDY POOL (15 variants)
  // ─────────────────────────────────────────────────────────────────────────────
  caseStudyPool: [
    // 1 — Rumah Sakit
    {
      title: 'ARP Poisoning di Jaringan Rekam Medis Rumah Sakit',
      scenario:
        'Tim SOC Rumah Sakit Harapan Bangsa mendeteksi pada pukul 02.15 WIB bahwa ARP cache workstation dokter di ICU mengarahkan IP server rekam medis elektronik (192.168.20.50) ke MAC address yang tidak dikenal. Analisis lebih lanjut menunjukkan traffic rekam medis pasien melewati perangkat tak teridentifikasi sebelum sampai ke server, mengindikasikan serangan MITM aktif.',
      questions: [
        'Jelaskan bagaimana attacker berhasil mem-poison ARP cache workstation dokter tanpa terdeteksi lebih awal, dan teknik ARP apa yang kemungkinan digunakan (Gratuitous ARP vs. ARP Reply flooding).',
        'Data rekam medis apa yang berpotensi bocor selama serangan MITM ini berlangsung, dan apa implikasi hukumnya berdasarkan regulasi privasi data kesehatan di Indonesia?',
        'Rancang arsitektur mitigasi berlapis (defense-in-depth) untuk mencegah serangan serupa, mencakup konfigurasi switch (DAI), segmentasi VLAN, dan enkripsi aplikasi.',
        'Bagaimana tim forensik dapat membuktikan bahwa serangan ARP Poisoning telah terjadi menggunakan log yang tersedia di switch, firewall, dan host yang terinfeksi?',
      ],
    },
    // 2 — Bank
    {
      title: 'Deteksi ICMP Scanning dan ARP Spoofing di Jaringan Perbankan',
      scenario:
        'Bank Sentosa Digital mengalami insiden keamanan di mana sistem SIEM mendeteksi pola ping sweep terhadap seluruh subnet teller (192.168.5.0/24) sebanyak 254 ICMP Echo Request dalam 8 detik berasal dari IP 192.168.5.200 — sebuah workstation kasir yang seharusnya hanya mengakses core banking. Dua menit kemudian, sistem deteksi ARP menandai perubahan MAC address gateway (192.168.5.1) di 12 workstation teller secara bersamaan.',
      questions: [
        'Apa yang kemungkinan besar sedang dilakukan attacker dalam urutan serangan ini: mengapa ping sweep dilakukan terlebih dahulu sebelum ARP poisoning?',
        'Jelaskan dampak maksimal yang dapat dicapai attacker jika MITM berhasil dipertahankan selama sesi transaksi perbankan berlangsung, termasuk data apa yang dapat dicuri.',
        'Bagaimana Dynamic ARP Inspection (DAI) dan DHCP Snooping bekerja bersama-sama untuk mencegah serangan ini, dan mengapa keduanya harus dikonfigurasi secara bersamaan?',
        'Susun prosedur investigasi forensik digital untuk menentukan apakah ada data transaksi nasabah yang telah ter-eksfiltrasi, dan bukti apa yang harus dikumpulkan dari workstation 192.168.5.200.',
      ],
    },
    // 3 — Pemerintah
    {
      title: 'ICMP Covert Channel dan ARP-based Reconnaissance di Instansi Pemerintah',
      scenario:
        'Badan Siber dan Sandi Negara (BSSN) menerima laporan dari instansi pemerintah daerah bahwa sistem monitoring jaringan mendeteksi paket ICMP Echo Request berukuran tidak normal (payload 1200 byte, padahal standar adalah 56 byte) keluar dari jaringan internal menuju IP server di luar negeri. Bersamaan dengan itu, log switch menunjukkan ARP Request yang masif dari satu IP internal ke seluruh range jaringan DMZ pemerintah.',
      questions: [
        'Jelaskan konsep ICMP Covert Channel: bagaimana attacker dapat menyisipkan data dalam field payload ICMP untuk exfiltrasi data tanpa terdeteksi firewall konvensional?',
        'Apa yang diindikasikan oleh ARP Request masif ke seluruh range DMZ, dan bagaimana ini berhubungan dengan fase reconnaissance pada Cyber Kill Chain?',
        'Rancang aturan deteksi untuk: (a) ICMP packet dengan payload lebih besar dari 100 byte, dan (b) ARP Request rate lebih dari 20 per detik dari satu sumber.',
        'Apa rekomendasi kebijakan keamanan jaringan yang harus diterapkan instansi pemerintah untuk mencegah penggunaan ICMP sebagai covert channel?',
      ],
    },
    // 4 — Universitas
    {
      title: 'ARP Spoofing di Jaringan Wi-Fi Kampus',
      scenario:
        'Universitas Teknologi Nusantara melaporkan bahwa beberapa mahasiswa di Lab Komputer Gedung B mengeluhkan bahwa session login ke portal akademik mereka tiba-tiba kadaluarsa dan saat login ulang, muncul halaman login palsu yang sangat mirip aslinya. Analisis tim IT menunjukkan ARP cache pada seluruh komputer di lab tersebut mengarahkan IP server portal (10.10.10.50) ke satu MAC address yang bukan milik server.',
      questions: [
        'Jelaskan skenario serangan lengkap: bagaimana attacker (kemungkinan mahasiswa di lab yang sama) dapat melakukan ARP Poisoning dan menjalankan fake login portal secara bersamaan.',
        'Apa perbedaan antara serangan ARP Poisoning ini dengan DNS Spoofing, dan mengapa keduanya menghasilkan efek yang serupa (redirect ke halaman palsu) meskipun bekerja pada layer yang berbeda?',
        'Bagaimana penggunaan HTTPS dengan certificate pinning dapat melindungi pengguna bahkan jika ARP cache telah ter-poison, dan apa yang akan dilihat pengguna di browser mereka?',
        'Rancang kebijakan keamanan jaringan untuk lab komputer kampus yang mencegah mahasiswa melakukan ARP Spoofing, termasuk konfigurasi switch dan monitoring yang diperlukan.',
      ],
    },
    // 5 — E-Commerce
    {
      title: 'MITM via ARP Poisoning pada Jaringan Operasional E-Commerce',
      scenario:
        'Platform e-commerce BelanjaMudah.id mendeteksi anomali saat peak sale: sistem keamanan melaporkan bahwa traffic antara server payment gateway internal (172.16.1.100) dan server aplikasi (172.16.1.50) melewati hop tambahan yang tidak ada dalam topologi normal. Log switch menunjukkan IP payment gateway dipetakan ke dua MAC address berbeda di ARP cache server aplikasi, dengan MAC asing aktif selama 45 menit sebelum terdeteksi.',
      questions: [
        'Hitung berapa banyak transaksi pembayaran yang berpotensi ter-intercept selama 45 menit berdasarkan asumsi volume transaksi peak sale (rata-rata 500 transaksi/menit) dan apa data sensitif yang mungkin bocor.',
        'Mengapa serangan ARP Poisoning antara server-to-server (bukan hanya client-to-gateway) sangat berbahaya di lingkungan data center, dan bagaimana attacker bisa berada di posisi tersebut?',
        'Jelaskan bagaimana Transport Layer Security (TLS) mutual authentication dapat mencegah serangan MITM ini meskipun ARP cache telah di-poison.',
        'Apa langkah-langkah pemulihan (recovery) yang harus dilakukan tim IT setelah insiden ini, termasuk cara memvalidasi integritas data transaksi yang terjadi selama periode serangan?',
      ],
    },
    // 6 — Manufaktur
    {
      title: 'ARP Poisoning pada Jaringan Industrial Control System (ICS)',
      scenario:
        'Pabrik manufaktur otomotif PT Wahana Mandiri mengalami gangguan produksi akibat koneksi antara SCADA workstation (192.168.100.10) dan Programmable Logic Controller (PLC) mesin produksi (192.168.100.50) tiba-tiba terputus-putus. Investigasi menemukan bahwa ARP cache SCADA mengarahkan IP PLC ke MAC address tidak dikenal, dan selama gangguan tersebut, sensor mesin menerima perintah yang tidak sesuai prosedur operasi normal.',
      questions: [
        'Jelaskan mengapa serangan ARP Poisoning pada jaringan ICS/SCADA lebih berbahaya dibandingkan pada jaringan IT konvensional, dengan mempertimbangkan dampak pada safety dan proses produksi fisik.',
        'Bagaimana attacker yang berhasil melakukan MITM antara SCADA dan PLC dapat memodifikasi perintah kontrol tanpa langsung terdeteksi oleh operator, dan apa skenario terburuk yang mungkin terjadi?',
        'Rancang segmentasi jaringan ICS yang menggunakan prinsip Purdue Model untuk memisahkan traffic SCADA/PLC dari jaringan korporat dan mencegah serangan ARP Poisoning lintas zona.',
        'Apa standar keamanan ICS internasional (IEC 62443, NERC CIP) yang relevan dengan insiden ini, dan kontrol keamanan spesifik apa yang wajib diimplementasikan?',
      ],
    },
    // 7 — Telekomunikasi
    {
      title: 'ARP Flooding dan Ping Flood pada Infrastruktur ISP',
      scenario:
        'Operator telekomunikasi NusaNet mendeteksi degradasi layanan signifikan di salah satu POP (Point of Presence) mereka: router core mengalami CPU utilization 98% akibat menerima lebih dari 50.000 ARP Request per detik dari beberapa host pelanggan secara bersamaan. Investigasi awal menunjukkan ini terjadi bersamaan dengan ping flood dari subnet pelanggan ke alamat broadcast (directed broadcast attack).',
      questions: [
        'Jelaskan perbedaan antara ARP Flooding (yang menyerang ARP table capacity router) dan Smurf Attack (directed broadcast ping), dan mengapa keduanya dapat menyebabkan degradasi layanan pada infrastruktur ISP.',
        'Bagaimana router Cisco atau Juniper menghandle ARP table overflow, dan apa konsekuensinya bagi pelanggan yang legitimate ketika tabel ARP penuh?',
        'Konfigurasi rate-limiting ARP dan penonaktifan directed broadcast apa yang harus diterapkan pada perangkat jaringan ISP untuk mencegah serangan serupa?',
        'Dari perspektif ISP, bagaimana cara mengidentifikasi pelanggan mana yang menjadi sumber serangan, dan langkah hukum/teknis apa yang dapat diambil berdasarkan ketentuan SLA dan regulasi di Indonesia?',
      ],
    },
    // 8 — Startup
    {
      title: 'Insiden ARP Spoofing di Startup Fintech akibat Rogue Device',
      scenario:
        'Startup fintech KoinPintar mengalami insiden keamanan saat seorang karyawan baru yang belum menyelesaikan onboarding menghubungkan Raspberry Pi ke port switch ruang server dengan alasan "belajar jaringan". Perangkat tersebut ternyata menjalankan script bettercap yang secara otomatis melakukan ARP poisoning ke seluruh host di subnet 10.0.1.0/24, termasuk server backend API pembayaran.',
      questions: [
        'Identifikasi kelemahan kontrol keamanan fisik dan jaringan yang memungkinkan Raspberry Pi tidak diotorisasi dapat terhubung dan langsung melakukan ARP poisoning tanpa terdeteksi lebih awal.',
        'Jelaskan bagaimana 802.1X Network Access Control (NAC) dapat mencegah perangkat tidak diotorisasi mengakses jaringan, dan apa yang dibutuhkan untuk mengimplementasikannya di jaringan startup kecil.',
        'Apakah aktivitas karyawan tersebut dapat dikategorikan sebagai pelanggaran hukum di Indonesia berdasarkan UU ITE, meskipun dilakukan di dalam jaringan perusahaan sendiri? Jelaskan argumen Anda.',
        'Rancang kebijakan BYOD dan penggunaan perangkat di jaringan yang komprehensif untuk startup yang memiliki keterbatasan sumber daya keamanan.',
      ],
    },
    // 9 — Logistik
    {
      title: 'ARP-based MITM pada Sistem Tracking Logistik',
      scenario:
        'Perusahaan logistik ekspres GarudaKirim mendeteksi bahwa data koordinat GPS kendaraan pengiriman yang dikirim oleh unit IoT di armada ke server tracking (10.20.30.100) telah dimodifikasi selama transit. Investigasi menemukan bahwa hub jaringan di gudang distribusi Cikarang mengalami ARP poisoning, sehingga traffic dari unit IoT melewati laptop tidak dikenal sebelum sampai ke server tracking.',
      questions: [
        'Jelaskan mengapa perangkat IoT (seperti unit GPS tracker) sangat rentan terhadap serangan ARP Poisoning dibandingkan komputer konvensional, terkait dengan keterbatasan resource dan kemampuan update firmware.',
        'Apa dampak bisnis konkret dari manipulasi data koordinat GPS tracking terhadap operasional logistik: terhadap pelanggan, SLA pengiriman, dan kepercayaan mitra bisnis?',
        'Bagaimana implementasi certificate-based mutual TLS (mTLS) antara unit IoT dan server tracking dapat mencegah manipulasi data meskipun terjadi ARP Poisoning?',
        'Rancang arsitektur jaringan yang lebih aman untuk gudang distribusi yang memiliki campuran perangkat IoT, workstation operasional, dan akses internet publik.',
      ],
    },
    // 10 — PLTU
    {
      title: 'Insiden ICMP Reconnaissance di Jaringan PLTU',
      scenario:
        'Pembangkit Listrik Tenaga Uap (PLTU) Jawa Timur mendeteksi serangkaian aktivitas mencurigakan: sistem SIEM mencatat 1.247 ICMP Echo Request dalam 5 detik berasal dari IP 172.30.0.88 yang terdaftar sebagai workstation engineer mekanikal — workstation yang secara normal tidak pernah mengirim traffic jaringan dalam jumlah besar. Selanjutnya terdeteksi ARP Request terhadap seluruh host di subnet jaringan kontrol turbin (172.30.1.0/24).',
      questions: [
        'Dalam konteks serangan terhadap infrastruktur kritis (Critical Infrastructure), jelaskan tahap serangan yang sedang terjadi berdasarkan MITRE ATT&CK for ICS framework dan apa tujuan akhir yang mungkin dicapai attacker.',
        'Mengapa jaringan kontrol PLTU idealnya harus air-gapped dari jaringan korporat, dan bagaimana insiden ini menunjukkan kegagalan segmentasi tersebut?',
        'Rancang aturan SIEM correlation rule yang dapat mendeteksi kombinasi: (a) ICMP sweep > 100 host dalam < 10 detik dari IP yang tidak biasa, diikuti (b) ARP Request masif ke subnet berbeda dari IP yang sama.',
        'Apa protokol respons insiden yang harus diikuti ketika terjadi potensi serangan siber terhadap infrastruktur kritis seperti PLTU, mengacu pada regulasi BSSN dan standar IEC 62443?',
      ],
    },
    // 11 — TV Nasional
    {
      title: 'ARP Spoofing pada Jaringan Broadcast TV Nasional',
      scenario:
        'Stasiun TV nasional VisionMedia mengalami insiden siaran terganggu selama 8 menit pada prime time: server playout yang bertanggung jawab mengirimkan konten siaran ke transmitter tiba-tiba kehilangan koneksi ke storage server. Investigasi menemukan ARP cache server playout mengarahkan IP storage server ke MAC address laptop yang dibawa oleh kontraktor maintenance jaringan yang sedang bekerja di ruang server pada waktu kejadian.',
      questions: [
        'Identifikasi apakah insiden ini kemungkinan merupakan serangan yang disengaja (insider threat) atau kesalahan teknis dari kontraktor, dan bukti teknis apa yang dapat membedakannya dari analisis log?',
        'Apa dampak bisnis dan reputasi dari gangguan siaran selama 8 menit pada prime time, dan bagaimana insiden ini dapat mempengaruhi kepercayaan pengiklan dan penonton?',
        'Jelaskan prosedur vendor/kontraktor access management yang seharusnya mencegah laptop kontraktor tidak sah melakukan ARP Spoofing di jaringan produksi broadcast.',
        'Rancang network monitoring dan alerting yang dapat mendeteksi perubahan ARP cache pada server kritikal (playout, storage) dalam waktu kurang dari 30 detik sejak terjadi.',
      ],
    },
    // 12 — Firma Hukum
    {
      title: 'Penyadapan Komunikasi via ARP Poisoning di Firma Hukum',
      scenario:
        'Firma hukum Hartono & Partners mengalami kebocoran dokumen rahasia yang hanya dikirim melalui jaringan internal antara partner senior dan paralegal. Investigasi digital forensik menemukan bahwa selama 3 minggu, ARP cache pada komputer partner senior secara berkala diubah sehingga email internal dan transfer dokumen melewati komputer paralegal yang baru dipecat sebelum sampai ke mail server.',
      questions: [
        'Jelaskan bagaimana serangan ARP Poisoning yang berkelanjutan selama 3 minggu dapat tidak terdeteksi di lingkungan firma hukum yang tidak memiliki dedicated IT security staff.',
        'Apa implikasi hukum dari kebocoran dokumen rahasia klien terhadap firma hukum: kewajiban etika profesional pengacara, potensi gugatan dari klien, dan tanggung jawab pidana dari pelaku?',
        'Bagaimana kebijakan email encryption (seperti S/MIME atau PGP) dapat melindungi kerahasiaan komunikasi internal meskipun traffic telah di-intercept melalui ARP Poisoning?',
        'Rancang langkah-langkah digital forensik yang komprehensif untuk membuktikan bahwa paralegal yang dipecat adalah pelaku, termasuk bukti teknis apa yang harus dikumpulkan dan bagaimana chain of custody dijaga.',
      ],
    },
    // 13 — Asuransi
    {
      title: 'ICMP Ping Flood dan ARP Poisoning di Perusahaan Asuransi',
      scenario:
        'Perusahaan asuransi jiwa Sentosa Life mengalami gangguan layanan klaim online selama 2 jam: server aplikasi klaim (10.100.50.10) tidak dapat diakses karena bandwidth jaringan tersaturasi oleh flood ICMP Echo Request berukuran 65.507 byte (Ping of Death) dari berbagai IP sumber. Bersamaan dengan serangan DoS tersebut, sistem deteksi mencatat upaya ARP poisoning terhadap gateway VLAN klaim — kemungkinan untuk mencuri traffic klaim yang berhasil masuk.',
      questions: [
        'Jelaskan perbedaan antara Ping of Death (paket ICMP oversized) dan ICMP Flood biasa, dan mengapa keduanya digunakan secara bersamaan dalam insiden ini (serangan berlapis).',
        'Bagaimana attacker dapat mengorkestrasi serangan ICMP Flood dari berbagai IP sumber secara bersamaan, dan apa infrastruktur yang kemungkinan mereka gunakan?',
        'Konfigurasi firewall dan rate-limiting apa yang harus diterapkan untuk melindungi server dari Ping of Death dan ICMP Flood tanpa memblokir traffic ICMP yang legitimate untuk troubleshooting?',
        'Analisis apakah motif serangan ini kemungkinan adalah kompetitor bisnis, hacktivism, atau ransomware precursor, berdasarkan karakteristik teknis serangan yang terdeteksi.',
      ],
    },
    // 14 — Properti
    {
      title: 'ARP Spoofing pada Sistem Smart Building Perusahaan Properti',
      scenario:
        'Developer properti MegaCity Residence mengoperasikan smart building system di apartemen mewahnya yang mengintegrasikan sistem akses pintu (access control), lift, CCTV, dan HVAC dalam satu jaringan IP. Tim keamanan menemukan bahwa controller akses pintu di lantai eksekutif menerima ARP Reply palsu yang mengalihkan komunikasinya ke perangkat asing, bersamaan dengan terdeteksinya ICMP scan terhadap seluruh perangkat IoT smart building.',
      questions: [
        'Jelaskan bagaimana kompromi sistem akses pintu melalui ARP Poisoning dapat memiliki implikasi keamanan fisik yang serius bagi penghuni apartemen eksekutif.',
        'Mengapa perangkat smart building (IoT) biasanya lebih rentan terhadap ARP Poisoning dibandingkan server konvensional, dan apa keterbatasan teknis yang membuat mitigasi lebih sulit?',
        'Rancang segmentasi jaringan untuk smart building yang memisahkan traffic IoT keamanan fisik (akses, CCTV) dari traffic IoT kenyamanan (HVAC, lighting) dan dari jaringan internet penghuni.',
        'Apa skenario terburuk yang dapat terjadi jika attacker berhasil melakukan full MITM antara controller akses pintu dan server manajemen gedung, dan bagaimana mensimulasikan skenario ini di lingkungan lab?',
      ],
    },
    // 15 — Lembaga Zakat
    {
      title: 'Keamanan Transaksi Donasi dari ARP Spoofing di Lembaga Zakat',
      scenario:
        'Lembaga Amil Zakat Nasional NurZakat mendeteksi bahwa sistem pembayaran donasi online mereka mengalami anomali: beberapa donatur melaporkan bahwa setelah transfer, dana tidak tercatat di akun NurZakat meskipun rekening mereka sudah terdebet. Investigasi tim IT menemukan bahwa pada hari kejadian, ARP cache server payment confirmation (10.50.1.20) mengarahkan IP server bank aggregator ke MAC perangkat yang tidak dikenal di jaringan DMZ.',
      questions: [
        'Jelaskan bagaimana ARP Poisoning pada server payment confirmation dapat dimanfaatkan attacker untuk mengarahkan konfirmasi pembayaran sehingga dana donasi disalahgunakan, padahal rekening donatur sudah terdebet.',
        'Apa dampak kepercayaan publik dan reputasi lembaga zakat akibat insiden ini, dan bagaimana lembaga harus mengomunikasikan insiden ini kepada donatur secara transparan sesuai prinsip good governance?',
        'Bagaimana implementasi DKIM, SPF, dan TLS untuk email konfirmasi donasi, dikombinasikan dengan mutual TLS untuk API bank aggregator, dapat mencegah manipulasi konfirmasi pembayaran?',
        'Rancang prosedur audit keamanan rutin (security assessment) yang realistis untuk lembaga nonprofit dengan keterbatasan anggaran IT, yang tetap mencakup deteksi ARP anomali dan keamanan transaksi keuangan.',
      ],
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // QUIZ
  // ─────────────────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 1,
      question: 'Apa fungsi utama ICMP Type 11 Code 0 dalam jaringan?',
      options: [
        'Mengkonfirmasi bahwa paket telah diterima oleh tujuan',
        'Memberitahu pengirim bahwa TTL paket telah habis di router perantara',
        'Meminta informasi subnet mask dari router terdekat',
        'Menandai bahwa port tujuan tidak tersedia',
      ],
      answer: 'Memberitahu pengirim bahwa TTL paket telah habis di router perantara',
      type: 'multiple-choice',
    },
    {
      id: 2,
      question:
        'Seorang analis SOC melihat ribuan paket ICMP Echo Request (Type 8) dari IP 192.168.1.77 ke 192.168.1.1 hingga 192.168.1.254 dalam waktu 10 detik. Apa yang paling tepat menggambarkan aktivitas ini?',
      options: [
        'Normal monitoring traffic dari sistem manajemen jaringan',
        'Ping sweep — teknik reconnaissance untuk menemukan host aktif di subnet',
        'Serangan Ping of Death menggunakan paket ICMP oversized',
        'Proses ARP resolution yang normal untuk seluruh subnet',
      ],
      answer: 'Ping sweep — teknik reconnaissance untuk menemukan host aktif di subnet',
      type: 'multiple-choice',
    },
    {
      id: 3,
      question: 'Apa yang membedakan ARP Request dari ARP Reply dalam hal Ethernet destination address?',
      options: [
        'Keduanya menggunakan alamat unicast spesifik tujuan',
        'ARP Request menggunakan broadcast FF:FF:FF:FF:FF:FF; ARP Reply menggunakan unicast MAC penanya',
        'ARP Request menggunakan unicast; ARP Reply menggunakan multicast',
        'Keduanya menggunakan broadcast FF:FF:FF:FF:FF:FF karena ARP bekerja di Layer 2',
      ],
      answer: 'ARP Request menggunakan broadcast FF:FF:FF:FF:FF:FF; ARP Reply menggunakan unicast MAC penanya',
      type: 'multiple-choice',
    },
    {
      id: 4,
      question: 'Dalam serangan ARP Spoofing, apa yang dilakukan attacker untuk meracuni ARP cache korban?',
      options: [
        'Mengirimkan ARP Request palsu yang mengklaim memiliki IP gateway',
        'Mengirimkan Gratuitous ARP Reply yang mengasosiasikan IP gateway dengan MAC address attacker',
        'Memblokir semua ARP Request dari korban menggunakan firewall',
        'Memodifikasi entri DNS sehingga domain gateway mengarah ke IP attacker',
      ],
      answer: 'Mengirimkan Gratuitous ARP Reply yang mengasosiasikan IP gateway dengan MAC address attacker',
      type: 'multiple-choice',
    },
    {
      id: 5,
      question: 'Perintah "sudo ip neigh flush all" pada Linux digunakan untuk?',
      options: [
        'Menampilkan seluruh entri ARP cache secara detail',
        'Menambahkan entri ARP statis ke sistem',
        'Menghapus semua entri ARP cache dari memori kernel',
        'Memperbarui (refresh) semua entri ARP cache secara otomatis',
      ],
      answer: 'Menghapus semua entri ARP cache dari memori kernel',
      type: 'multiple-choice',
    },
    {
      id: 6,
      question:
        'Dynamic ARP Inspection (DAI) pada switch Cisco memerlukan fitur lain yang dikonfigurasi terlebih dahulu sebagai prerequisite. Fitur apakah itu?',
      options: [
        'Port Security dengan sticky MAC address',
        'DHCP Snooping yang telah aktif pada VLAN yang sama',
        'Spanning Tree Protocol (STP) dalam mode RSTP',
        '802.1X Network Access Control (NAC)',
      ],
      answer: 'DHCP Snooping yang telah aktif pada VLAN yang sama',
      type: 'multiple-choice',
    },
    {
      id: 7,
      question:
        'Nilai TTL = 117 pada output ping ke 8.8.8.8 mengindikasikan bahwa OS Google menggunakan TTL awal berapa, dan paket melewati berapa hop?',
      options: [
        'TTL awal 128; melewati 11 hop',
        'TTL awal 64; melewati 53 hop',
        'TTL awal 255; melewati 138 hop',
        'TTL awal 128; melewati 117 hop',
      ],
      answer: 'TTL awal 128; melewati 11 hop',
      type: 'multiple-choice',
    },
    {
      id: 8,
      question:
        'Seorang analis memeriksa ARP cache dan menemukan bahwa IP gateway (192.168.1.1) dan IP server DNS internal (192.168.1.10) keduanya memiliki MAC address yang sama: AA:BB:CC:DD:EE:FF. Apa yang paling mungkin terjadi?',
      options: [
        'Switch mengalami kegagalan hardware yang menyebabkan duplikasi MAC address',
        'Terjadi ARP Spoofing — attacker dengan MAC AA:BB:CC:DD:EE:FF sedang melakukan MITM',
        'Administator secara sengaja mengkonfigurasi static ARP untuk redundansi',
        'Firmware router mengirim Gratuitous ARP secara berkala sebagai keepalive',
      ],
      answer: 'Terjadi ARP Spoofing — attacker dengan MAC AA:BB:CC:DD:EE:FF sedang melakukan MITM',
      type: 'multiple-choice',
    },
    {
      id: 9,
      question:
        'Jelaskan perbedaan mendasar antara Gratuitous ARP dan ARP Reply biasa, serta mengapa Gratuitous ARP menjadi vektor utama serangan ARP Spoofing!',
      answer:
        'ARP Reply biasa dikirim sebagai respons atas ARP Request — ada mekanisme permintaan sebelum jawaban. Gratuitous ARP adalah ARP Reply yang dikirim tanpa didahului ARP Request, di mana Sender IP = Target IP. Gratuitous ARP digunakan secara legitim untuk: (1) mengumumkan perubahan MAC setelah NIC replacement, (2) update cache pada HA failover. Namun karena host secara otomatis memperbarui ARP cache mereka ketika menerima Gratuitous ARP — bahkan tanpa pernah memintanya — attacker dapat mengirim Gratuitous ARP palsu yang mengasosiasikan IP gateway dengan MAC attacker, mem-poison cache semua host yang mendengarnya tanpa perlu menunggu ada yang mengirim ARP Request.',
      type: 'essay',
    },
    {
      id: 10,
      question:
        'Seorang engineer jaringan melihat output traceroute berikut: hop 5 menunjukkan *** (tiga bintang). Apakah ini berarti koneksi terputus di hop tersebut? Jelaskan!',
      answer:
        'Tidak, *** tidak selalu berarti koneksi terputus. Tanda bintang berarti router di hop tersebut tidak mengirimkan ICMP Time Exceeded kembali ke pengirim — kemungkinan karena: (1) Firewall atau ACL di router tersebut memblokir outbound ICMP, (2) Router dikonfigurasi untuk tidak merespons ICMP (no ip unreachables pada Cisco IOS), (3) Rate limiting ICMP di router tersebut. Bukti bahwa koneksi tidak terputus adalah hop-hop berikutnya (hop 6, 7, dst.) masih menampilkan IP dan latency normal — artinya paket tetap melewati hop tersebut, hanya ICMP Time Exceeded-nya yang tidak dikirim balik.',
      type: 'essay',
    },
    {
      id: 11,
      question:
        'Mengapa ICMP tidak memiliki konsep "port" seperti TCP dan UDP, dan apa implikasi keamanan dari ketiadaan port pada ICMP?',
      answer:
        'ICMP adalah protokol Network Layer (Layer 3) yang beroperasi langsung di atas IP, sedangkan port adalah konsep Transport Layer (Layer 4) yang dimiliki TCP dan UDP. ICMP menggunakan "Type" dan "Code" sebagai pengganti port untuk mengidentifikasi jenis pesan. Implikasi keamanan: (1) Firewall tidak dapat mem-filter ICMP berdasarkan port — filtering harus berdasarkan Type dan Code, (2) ICMP dapat melewati firewall sederhana yang hanya mem-filter berdasarkan port, (3) ICMP dapat digunakan sebagai covert channel untuk exfiltrasi data karena menyembunyikan payload dalam field data ICMP (teknik ICMP tunneling), (4) Serangan DoS via ICMP (ping flood, Smurf) tidak dapat diblokir dengan port filtering.',
      type: 'essay',
    },
    {
      id: 12,
      question:
        'Jelaskan bagaimana Dynamic ARP Inspection (DAI) bekerja untuk mencegah ARP Spoofing, dan apa keterbatasannya!',
      answer:
        'DAI bekerja dengan memvalidasi setiap ARP packet yang masuk melalui port "untrusted" di switch: DAI membandingkan Sender IP dan Sender MAC pada ARP packet dengan DHCP Snooping Binding Table (yang mencatat IP mana yang di-assign ke port mana). Jika ada ARP packet yang mengklaim IP-MAC mapping yang tidak ada di binding table, packet tersebut di-drop. Port ke router/switch lain ditandai sebagai "trusted" dan tidak divalidasi. Keterbatasan DAI: (1) Tidak efektif untuk host dengan static IP — karena tidak terdaftar di DHCP Snooping table, (2) Membutuhkan DHCP Snooping sebagai prerequisite, (3) Attacker yang berada di port "trusted" tidak akan divalidasi, (4) Tidak melindungi dari ARP Poisoning yang berasal dari luar broadcast domain melalui vektor lain.',
      type: 'essay',
    },
    {
      id: 13,
      question:
        'Apa perbedaan antara Smurf Attack dan Ping Flood biasa, dan bagaimana keduanya memanfaatkan protokol ICMP untuk melakukan Denial of Service?',
      answer:
        'Ping Flood: attacker langsung mengirim sejumlah besar ICMP Echo Request ke target dari satu sumber — membutuhkan bandwidth attacker yang besar. Smurf Attack (RFC 2644): attacker mengirim ICMP Echo Request dengan source IP disamarkan (spoofed) sebagai IP korban, ke alamat broadcast jaringan (mis. 192.168.1.255). Semua host di jaringan tersebut membalas dengan ICMP Echo Reply — ke IP korban (bukan attacker). Dengan amplifikasi ini (1 request → N reply dari N host di jaringan), attacker mendapat efek amplifikasi traffic besar tanpa bandwidth besar. Mitigasi: (a) Router modern menolak paket ke directed broadcast (no ip directed-broadcast), (b) Ingress filtering mencegah IP spoofing (BCP38), (c) Rate-limiting ICMP di perimeter.',
      type: 'essay',
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // VIDEO RESOURCES
  // ─────────────────────────────────────────────────────────────────────────────
  videoResources: [
    {
      title: 'ICMP Protocol Explained - Network+ | CompTIA',
      youtubeId: 'kIbOBqILP5E',
      description: 'Penjelasan mendalam tentang ICMP, tipe pesan, dan penggunaannya dalam troubleshooting jaringan.',
      language: 'en',
      duration: '11:20',
    },
    {
      title: 'ARP Spoofing Attack Demo & Prevention',
      youtubeId: 'A7nih6SANdE',
      description: 'Demo serangan ARP Spoofing menggunakan arpspoof/Ettercap dan cara pencegahan dengan DAI.',
      language: 'en',
      duration: '14:55',
    },
    {
      title: 'How Traceroute Works - TTL Explained',
      youtubeId: 'Up4sE8laBnE',
      description: 'Visualisasi mekanisme TTL dan cara kerja traceroute hop-by-hop.',
      language: 'en',
      duration: '9:42',
    },
    {
      title: 'Cara Kerja ARP - Penjelasan Bahasa Indonesia',
      youtubeId: 'cn8Zxh9bPio',
      description: 'Penjelasan ARP Request, ARP Reply, dan ARP Cache dalam Bahasa Indonesia dengan animasi.',
      language: 'id',
      duration: '8:15',
    },
  ],
};
