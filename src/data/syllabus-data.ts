// Pure data file — no React/icon imports so the server can import it via tsx.
// syllabus.tsx re-exports this with icon mappings.

export interface QuizQuestion {
  id: number;
  question: string;
  options?: string[];
  answer: string;
  type: 'multiple-choice' | 'essay';
}

export interface LabDownload {
  name: string;
  url: string;
  description: string;
}

export interface LabStep {
  title: string;
  description: string;
  command?: string;
  expectedOutput?: string;
  hint?: string;
  screenshotNote?: string;
  warningNote?: string;
}

export interface TheoryItem {
  title: string;
  content: string;
  // Rich content — used by crypto modules only
  formula?: string;           // e.g. "E(x) = (ax + b) mod 26"
  formulaLabel?: string;      // label shown above the formula box
  keyPoints?: string[];       // bullet points with checkmark icons
  example?: {
    title: string;            // e.g. "Contoh: Caesar dengan k=3"
    steps: string[];          // step-by-step rows
    result?: string;          // highlighted final answer
  };
  table?: {
    caption?: string;
    headers: string[];
    rows: string[][];
  };
  codeSnippet?: string;       // dark-background code block
  note?: string;              // callout box text
  noteType?: 'info' | 'warning' | 'success' | 'danger';
}

export interface VideoResource {
  title: string;
  youtubeId: string;
  description?: string;
  language?: 'id' | 'en';
  duration?: string;
}

export interface ModuleData {
  id: number;
  title: string;
  description: string;
  iconName: string;          // lucide icon name for server-side reference
  theory: TheoryItem[];
  lab: {
    title: string;
    downloads: LabDownload[];
    steps: LabStep[];
    deliverable: string;
  };
  caseStudy: {
    title: string;
    scenario: string;
    questions: string[];
  };
  quiz: QuizQuestion[];
  videoResources: VideoResource[];
}

export const syllabusData: ModuleData[] = [
  {
    id: 1,
    title: "Pengenalan & SOC",
    description: "Pengantar Pengujian Keamanan Informasi & Security Operations Center (SOC)",
    iconName: "Shield",
    theory: [
      {
        title: "Pengantar Keamanan Informasi: CIA Triad",
        content: "CIA Triad adalah model keamanan informasi yang terdiri dari Confidentiality (Kerahasiaan), Integrity (Integritas), dan Availability (Ketersediaan). Confidentiality memastikan data hanya dapat diakses oleh pihak yang berwenang. Integrity menjamin data akurat dan tidak dimodifikasi tanpa izin. Availability memastikan data dan layanan tersedia saat dibutuhkan."
      },
      {
        title: "Security Operations Center (SOC)",
        content: "SOC adalah fasilitas pusat yang bertugas memantau, mendeteksi, menganalisis, dan merespons insiden keamanan siber secara real-time. SOC memiliki 3 tier analis: Tier 1 (Alert Triage), Tier 2 (Deep Analysis), Tier 3 (Threat Hunting & Advanced Forensics). Tools utama: SIEM, IDS/IPS, EDR."
      },
      {
        title: "Kill Chain & MITRE ATT&CK",
        content: "Lockheed Martin Cyber Kill Chain menggambarkan 7 tahap serangan: Reconnaissance, Weaponization, Delivery, Exploitation, Installation, C2, Actions on Objectives. MITRE ATT&CK adalah knowledge base yang lebih detail tentang teknik serangan berdasarkan observasi dunia nyata."
      }
    ],
    lab: {
      title: "Lab 1: Pengenalan CyberOps Workstation & SOC Tools",
      downloads: [
        { name: "CyberOps Workstation VM", url: "https://www.netacad.com/", description: "VM untuk praktik keamanan (dari NetAcad)." }
      ],
      steps: [
        {
          title: "Download & Install VM",
          description: "Download CyberOps Workstation VM dari NetAcad dan buka di VirtualBox/VMware.",
          command: "VBoxManage import CyberOps_Workstation.ova",
          expectedOutput: "VM imported successfully"
        },
        {
          title: "Explore Linux CLI",
          description: "Login ke VM dan jalankan perintah dasar Linux untuk familiarisasi.",
          command: "whoami && hostname && uname -a && cat /etc/os-release"
        },
        {
          title: "Network Check",
          description: "Periksa koneksi jaringan dan identifikasi interface.",
          command: "ip addr show && ip route"
        },
        {
          title: "System Overview",
          description: "Lihat proses yang berjalan dan port yang terbuka.",
          command: "ps aux | head -20 && ss -tuln"
        }
      ],
      deliverable: "Laporan berisi screenshot VM yang berjalan, output CLI Linux, dan jawaban pertanyaan tentang arsitektur SOC."
    },
    caseStudy: {
      title: "Analisis Insiden Ransomware WannaCry",
      scenario: "Pada tahun 2017, ransomware WannaCry menginfeksi lebih dari 200.000 komputer di 150 negara. Rumah sakit NHS di Inggris terpaksa membatalkan operasi karena sistem down.",
      questions: [
        "Petakan serangan WannaCry ke Cyber Kill Chain (identifikasi setiap fase).",
        "Peran apa yang dimainkan SOC dalam merespons serangan ini?",
        "Mengapa patch management penting berdasarkan kasus ini?",
        "Jika Anda adalah Tier 1 Analyst, apa langkah pertama Anda saat alert WannaCry muncul?"
      ]
    },
    quiz: [
      {
        id: 1,
        question: "Apa kepanjangan dari CIA dalam konteks keamanan informasi?",
        answer: "Confidentiality, Integrity, Availability",
        type: "multiple-choice",
        options: [
          "Central Intelligence Agency",
          "Confidentiality, Integrity, Availability",
          "Computer, Internet, Application",
          "Control, Inspect, Audit"
        ]
      },
      {
        id: 2,
        question: "SOC Tier 1 Analyst memiliki tugas utama:",
        answer: "Alert Triage dan monitoring",
        type: "multiple-choice",
        options: [
          "Malware reverse engineering",
          "Alert Triage dan monitoring",
          "Threat hunting",
          "Penetration testing"
        ]
      },
      {
        id: 3,
        question: "Sebutkan 7 tahap Cyber Kill Chain secara berurutan!",
        answer: "Reconnaissance, Weaponization, Delivery, Exploitation, Installation, Command & Control, Actions on Objectives",
        type: "essay"
      },
      {
        id: 4,
        question: "Apa perbedaan antara IDS dan IPS?",
        answer: "IDS (Intrusion Detection System) hanya mendeteksi dan memberikan alert, sedangkan IPS (Intrusion Prevention System) mendeteksi dan secara aktif memblokir serangan.",
        type: "essay"
      },
      {
        id: 5,
        question: "Apa keuntungan menggunakan MITRE ATT&CK framework dibandingkan Cyber Kill Chain?",
        answer: "MITRE ATT&CK lebih granular dan mencakup teknik spesifik berdasarkan observasi nyata.",
        type: "multiple-choice",
        options: [
          "MITRE ATT&CK lebih sederhana dan mudah dipahami",
          "MITRE ATT&CK lebih granular dan mencakup teknik spesifik berdasarkan observasi nyata.",
          "MITRE ATT&CK hanya untuk malware analysis",
          "Tidak ada keuntungan, keduanya identik"
        ]
      }
    ],
    videoResources: [
      { title: "Apa itu SOC? Security Operations Center Explained", youtubeId: "nkUtGy-hr1I", description: "Penjelasan komprehensif tentang SOC dan perannya dalam keamanan siber.", language: "en", duration: "12:34" },
      { title: "Pengenalan Keamanan Informasi - CIA Triad", youtubeId: "6vMmB2LBtwQ", description: "Penjelasan tentang CIA Triad dalam bahasa yang mudah dipahami.", language: "en", duration: "8:15" },
      { title: "Cyber Kill Chain Explained", youtubeId: "II91fiUax2g", description: "Memahami tahapan serangan siber dengan Cyber Kill Chain.", language: "en", duration: "10:42" }
    ]
  },
  {
    id: 2,
    title: "Windows Security",
    description: "Sistem Operasi Windows untuk Keamanan Informasi",
    iconName: "Server",
    theory: [
      {
        title: "Windows Architecture & Security Features",
        content: "Windows menggunakan arsitektur Kernel Mode dan User Mode. Kernel Mode memiliki akses penuh ke hardware. Security features mencakup UAC (User Account Control), Windows Defender, BitLocker encryption, dan Windows Firewall. Registry menyimpan konfigurasi OS dan software."
      },
      {
        title: "Windows CLI & PowerShell",
        content: "Command Prompt (CMD) dan PowerShell adalah tools penting untuk security analysis. PowerShell lebih powerful dengan kemampuan scripting, akses .NET, dan remote management. Perintah penting: netstat, tasklist, systeminfo, icacls."
      },
      {
        title: "Windows Event Logs",
        content: "Windows Event Viewer mencatat aktivitas sistem: Security (logon/logoff), System (driver/service), Application (software errors). Event ID penting: 4624 (Logon Success), 4625 (Logon Failure), 4672 (Special Privileges Assigned)."
      }
    ],
    lab: {
      title: "Lab 2: Windows Security Analysis",
      downloads: [],
      steps: [
        {
          title: "System Info",
          description: "Kumpulkan informasi sistem lengkap menggunakan command prompt.",
          command: "systeminfo && hostname && whoami /all"
        },
        {
          title: "Network Connections",
          description: "Periksa koneksi jaringan aktif dan port yang terbuka.",
          command: "netstat -ano | findstr ESTABLISHED"
        },
        {
          title: "Process Analysis",
          description: "Lihat daftar proses yang berjalan dan cari proses mencurigakan.",
          command: "tasklist /v /fo table | more"
        },
        {
          title: "Event Log Review",
          description: "Buka Event Viewer (eventvwr.msc), navigasi ke Security Logs. Filter Event ID 4625 untuk melihat gagal login."
        }
      ],
      deliverable: "Laporan lab berisi screenshot analisis sistem Windows dan temuan keamanan."
    },
    caseStudy: {
      title: "Insider Threat di Perusahaan Manufaktur",
      scenario: "Seorang karyawan IT menggunakan akses admin-nya untuk mencuri data design produk. Terdeteksi setelah 6 bulan melalui anomali di Event Logs dan USB usage logs.",
      questions: [
        "Event ID apa saja yang bisa mendeteksi aktivitas mencurigakan?",
        "Bagaimana UAC bisa mencegah/mengurangi risiko insider threat?",
        "Apa langkah forensik yang tepat untuk kasus ini?",
        "Bagaimana Group Policy dapat meningkatkan keamanan?"
      ]
    },
    quiz: [
      {
        id: 1,
        question: "Event ID 4625 menunjukkan apa?",
        answer: "Percobaan login yang gagal (Failed Logon Attempt)",
        type: "multiple-choice",
        options: [
          "Successful Logon",
          "Percobaan login yang gagal (Failed Logon Attempt)",
          "Account Locked Out",
          "Password Changed"
        ]
      },
      {
        id: 2,
        question: "Apa perbedaan Kernel Mode dan User Mode di Windows?",
        answer: "Kernel Mode memiliki akses penuh ke hardware dan memori, sedangkan User Mode memiliki akses terbatas dan terisolasi.",
        type: "essay"
      },
      {
        id: 3,
        question: "Perintah apa yang digunakan untuk melihat koneksi jaringan aktif di Windows?",
        answer: "netstat -ano",
        type: "multiple-choice",
        options: ["ipconfig /all", "netstat -ano", "arp -a", "route print"]
      },
      {
        id: 4,
        question: "Apa fungsi UAC (User Account Control)?",
        answer: "Mencegah perubahan sistem tanpa izin dengan meminta konfirmasi elevasi hak akses",
        type: "essay"
      },
      {
        id: 5,
        question: "Mengapa PowerShell sering digunakan dalam serangan?",
        answer: "PowerShell memiliki akses ke .NET framework, dapat menjalankan skrip di memori (fileless), dan sering tidak diblokir oleh antivirus.",
        type: "essay"
      }
    ],
    videoResources: [
      { title: "Windows Security Fundamentals", youtubeId: "inWWhr5tnEA", description: "Dasar-dasar keamanan Windows untuk security analyst.", language: "en", duration: "15:20" },
      { title: "Windows Event Log Analysis for Security", youtubeId: "2ztx5A_x6TY", description: "Cara menganalisis Windows Event Logs untuk mendeteksi ancaman.", language: "en", duration: "18:45" }
    ]
  },
  {
    id: 3,
    title: "Linux Security & Networking",
    description: "Sistem Operasi Linux dan Dasar Jaringan Komputer",
    iconName: "Terminal",
    theory: [
      {
        title: "Linux Security Architecture",
        content: "Linux menggunakan model keamanan berbasis file permission (rwx), ownership (user, group, others), dan root (superuser). SELinux dan AppArmor memberikan Mandatory Access Control tambahan di atas model DAC standar."
      },
      {
        title: "Linux CLI untuk Security",
        content: "Tools penting: grep (cari teks), find (cari file), chmod/chown (kelola permission), iptables/nftables (firewall), tcpdump (packet capture), journalctl (log analysis). Pipa (|) dan redirect (>, >>) sangat penting untuk automation."
      },
      {
        title: "Model Jaringan: OSI & TCP/IP",
        content: "Model OSI memiliki 7 layer (Physical, Data Link, Network, Transport, Session, Presentation, Application). TCP/IP memiliki 4 layer (Network Access, Internet, Transport, Application). Setiap layer memiliki peran dan protokol spesifik."
      },
      {
        title: "IP Addressing & Subnetting",
        content: "IPv4 menggunakan 32-bit address (4 oktet desimal). Subnet mask membagi network dan host portion. IPv6 menggunakan 128-bit address (8 grup heksadesimal). Private IP: 10.x.x.x, 172.16-31.x.x, 192.168.x.x."
      }
    ],
    lab: {
      title: "Lab 3: Linux Security dan Wireshark Packet Analysis",
      downloads: [
        { name: "Wireshark", url: "https://www.wireshark.org/download.html", description: "Network protocol analyzer." }
      ],
      steps: [
        {
          title: "File Permissions",
          description: "Buat file dan ubah permission-nya. Pahami notasi oktal.",
          command: "touch testfile && chmod 750 testfile && ls -la testfile"
        },
        {
          title: "User Management",
          description: "Buat user baru dan kelola grup.",
          command: "sudo useradd -m testuser && sudo usermod -aG sudo testuser && id testuser"
        },
        {
          title: "Firewall Rules",
          description: "Lihat dan kelola aturan firewall menggunakan iptables.",
          command: "sudo iptables -L -n -v"
        },
        {
          title: "Wireshark Capture",
          description: "Buka Wireshark, pilih interface, mulai capture. Filter 'http || dns'. Browse beberapa website dan analisis paket."
        },
        {
          title: "Packet Analysis",
          description: "Analisis captured packets. Identifikasi source IP, destination IP, protocol, dan payload."
        }
      ],
      deliverable: "Laporan lab berisi screenshot analisis permission Linux dan capture Wireshark."
    },
    caseStudy: {
      title: "Serangan Man-in-the-Middle pada Jaringan Kampus",
      scenario: "Di jaringan kampus, seorang mahasiswa melakukan ARP spoofing untuk menyadap kredensial login portal akademik yang masih menggunakan HTTP.",
      questions: [
        "Bagaimana serangan ARP spoofing bekerja di Layer 2?",
        "Bagaimana analisis Wireshark dapat membantu mendeteksi serangan ini?",
        "Protokol keamanan apa yang dapat mencegah serangan MITM ini?",
        "Buatlah prosedur langkah demi langkah untuk respons insiden ini."
      ]
    },
    quiz: [
      {
        id: 1,
        question: "Sebutkan 7 layer model OSI secara berurutan dari bawah ke atas!",
        answer: "Physical, Data Link, Network, Transport, Session, Presentation, Application",
        type: "multiple-choice",
        options: [
          "Application, Presentation, Session, Transport, Network, Data Link, Physical",
          "Physical, Data Link, Network, Transport, Session, Presentation, Application",
          "Network, Transport, Application, Physical, Data Link, Session, Presentation",
          "Physical, Network, Data Link, Transport, Application, Session, Presentation"
        ]
      },
      {
        id: 2,
        question: "Apa perbedaan utama antara MAC address dan IP address?",
        answer: "MAC address adalah alamat fisik (Layer 2) yang unik untuk setiap NIC, sedangkan IP address adalah alamat logis (Layer 3) yang dapat berubah",
        type: "multiple-choice",
        options: [
          "MAC address digunakan di internet, IP address digunakan di LAN",
          "MAC address adalah alamat fisik (Layer 2) yang unik untuk setiap NIC, sedangkan IP address adalah alamat logis (Layer 3) yang dapat berubah",
          "MAC address dapat diubah dengan mudah, IP address bersifat permanen",
          "Tidak ada perbedaan, keduanya digunakan di Layer 3"
        ]
      },
      {
        id: 3,
        question: "Bagaimana urutan proses enkapsulasi data dari Application layer ke Physical layer?",
        answer: "Data > Segment > Packet > Frame > Bits",
        type: "multiple-choice",
        options: [
          "Bits > Frame > Packet > Segment > Data",
          "Data > Packet > Segment > Frame > Bits",
          "Data > Segment > Packet > Frame > Bits",
          "Frame > Packet > Segment > Data > Bits"
        ]
      },
      {
        id: 4,
        question: "Apa salah satu keunggulan utama IPv6 dibandingkan IPv4?",
        answer: "IPv6 menggunakan 128-bit address dan memiliki fitur keamanan bawaan (IPSec)",
        type: "multiple-choice",
        options: [
          "IPv6 menggunakan 32-bit address yang lebih mudah diingat",
          "IPv6 menggunakan 128-bit address dan memiliki fitur keamanan bawaan (IPSec)",
          "IPv6 tidak memerlukan router untuk berkomunikasi",
          "IPv6 hanya digunakan untuk jaringan lokal (LAN)"
        ]
      },
      {
        id: 5,
        question: "Apa fungsi utama dari default gateway dalam sebuah jaringan?",
        answer: "Sebagai router yang digunakan untuk mengirim paket ke jaringan di luar subnet lokal",
        type: "multiple-choice",
        options: [
          "Sebagai server DNS untuk menerjemahkan nama domain",
          "Sebagai firewall untuk memblokir serangan dari luar",
          "Sebagai router yang digunakan untuk mengirim paket ke jaringan di luar subnet lokal",
          "Sebagai switch untuk menghubungkan perangkat dalam satu ruangan"
        ]
      }
    ],
    videoResources: [
      { title: "Linux Security Essentials for Beginners", youtubeId: "Sa0KqbpLye4", description: "Dasar keamanan Linux: permissions, users, dan firewall.", language: "en", duration: "20:10" },
      { title: "Wireshark Tutorial for Beginners", youtubeId: "lb1Dw0elj0Q", description: "Tutorial lengkap penggunaan Wireshark untuk analisis jaringan.", language: "en", duration: "25:30" }
    ]
  },
  {
    id: 4,
    title: "ICMP & ARP",
    description: "Prinsip Keamanan Jaringan: ICMP, Ping, Traceroute, dan ARP",
    iconName: "Activity",
    theory: [
      {
        title: "ICMP (Internet Control Message Protocol)",
        content: "ICMP digunakan oleh perangkat jaringan untuk mengirim pesan kesalahan dan informasi operasional. Contoh: 'Destination Unreachable' atau 'Time Exceeded'. Ping menggunakan ICMP Echo Request dan Echo Reply untuk menguji konektivitas."
      },
      {
        title: "Traceroute & TTL",
        content: "Traceroute memetakan jalur paket ke tujuan dengan memanipulasi field Time-To-Live (TTL) pada IP header. Setiap router mengurangi TTL sebanyak 1. Jika TTL=0, router mengirim pesan ICMP Time Exceeded kembali ke pengirim."
      },
      {
        title: "ARP (Address Resolution Protocol)",
        content: "ARP memetakan IP Address (Layer 3) ke MAC Address (Layer 2). Perangkat menyimpan pemetaan ini di ARP Table (Cache). ARP bekerja dengan cara Broadcast 'Who has IP X?' dan Unicast 'I have IP X'."
      },
      {
        title: "ARP Spoofing/Poisoning",
        content: "Karena ARP tidak memiliki autentikasi, penyerang dapat mengirim pesan ARP palsu, mengasosiasikan MAC address mereka dengan IP gateway. Ini memungkinkan serangan Man-in-the-Middle (MITM). Mitigasi: Static ARP entries atau Dynamic ARP Inspection (DAI) pada switch."
      }
    ],
    lab: {
      title: "Lab 4: ICMP Analysis dan ARP Investigation",
      downloads: [],
      steps: [
        {
          title: "Ping Analysis",
          description: "Ping gateway, DNS (8.8.8.8), and a public site. Note the TTL values.",
          command: "ping -c 4 8.8.8.8"
        },
        {
          title: "Traceroute",
          description: "Trace the path to a remote server. Identify hops and potential bottlenecks.",
          command: "traceroute google.com (Linux) / tracert google.com (Windows)"
        },
        {
          title: "ARP Table Inspection",
          description: "View the current ARP table.",
          command: "arp -a"
        },
        {
          title: "Capture ARP",
          description: "Start Wireshark filter 'arp'. Clear your ARP cache (requires admin) and ping the gateway. Observe the ARP Request (Broadcast) and Reply (Unicast).",
          command: "sudo ip neigh flush all (Linux) / arp -d * (Windows Admin)"
        }
      ],
      deliverable: "Laporan lab berisi screenshot analisis ping/traceroute dan capture ARP Request/Reply."
    },
    caseStudy: {
      title: "Network Reconnaissance Menggunakan ICMP",
      scenario: "Tim SOC mendeteksi anomali traffic: ribuan ICMP Echo Request dari satu IP internal ke seluruh subnet dalam 30 detik, diikuti koneksi TCP ke port tertentu.",
      questions: [
        "Jenis serangan apa yang sedang dilakukan?",
        "Bagaimana ping sweep dan port scanning berhubungan?",
        "Tulis aturan firewall/IDS untuk mendeteksi ini.",
        "Bagaimana respons yang tepat dari tim SOC?"
      ]
    },
    quiz: [
      { id: 1, question: "Apa fungsi utama ICMP dalam jaringan?", answer: "Untuk mengirimkan pesan error dan informasi diagnostik tentang kondisi jaringan", type: "essay" },
      { id: 2, question: "Jelaskan perbedaan antara ping dan traceroute!", answer: "Ping mengecek keterjangkauan host, traceroute memetakan jalur paket menggunakan TTL", type: "essay" },
      { id: 3, question: "Apa yang dimaksud dengan ARP Spoofing/Poisoning?", answer: "Attacker mengirim ARP Reply palsu untuk mengasosiasikan MAC address attacker dengan IP target", type: "essay" },
      { id: 4, question: "Bagaimana Dynamic ARP Inspection (DAI) bekerja?", answer: "DAI memvalidasi ARP packets dengan membandingkannya terhadap DHCP snooping binding table", type: "essay" },
      { id: 5, question: "Mengapa ICMP sering digunakan dalam fase reconnaissance?", answer: "Untuk menemukan host aktif di jaringan tanpa membutuhkan autentikasi", type: "essay" }
    ],
    videoResources: [
      { title: "ICMP Protocol Explained", youtubeId: "kIbOBqILP5E", description: "Penjelasan mendalam tentang ICMP dan penggunaannya.", language: "en", duration: "11:20" },
      { title: "ARP Spoofing Attack Demo & Prevention", youtubeId: "A7nih6SANdE", description: "Demo serangan ARP spoofing dan cara pencegahannya.", language: "en", duration: "14:55" }
    ]
  },
  {
    id: 5,
    title: "Transport & Network Services",
    description: "Transport Layer dan Network Services",
    iconName: "Globe",
    theory: [
      { title: "TCP vs UDP", content: "TCP (Transmission Control Protocol) adalah connection-oriented dan reliable (menjamin pengiriman data urut dan tanpa error) menggunakan 3-way handshake. UDP (User Datagram Protocol) adalah connectionless dan unreliable tapi cepat, cocok untuk streaming/VoIP." },
      { title: "DHCP & DNS", content: "DHCP (Dynamic Host Configuration Protocol) memberikan IP otomatis melalui proses DORA (Discover, Offer, Request, Acknowledge). DNS (Domain Name System) menerjemahkan nama domain (google.com) menjadi IP address." },
      { title: "NAT (Network Address Translation)", content: "NAT memungkinkan banyak perangkat di jaringan lokal (IP privat) berbagi satu IP publik untuk akses internet. Ini menghemat IP publik dan menambah lapisan keamanan dengan menyembunyikan IP internal." },
      { title: "Protokol Aplikasi", content: "HTTP/HTTPS untuk web. HTTPS mengenkripsi data menggunakan TLS. Email menggunakan SMTP (kirim), POP3/IMAP (terima). FTP/SFTP untuk transfer file." }
    ],
    lab: {
      title: "Lab 5: Transport Layer dan Network Services Analysis",
      downloads: [],
      steps: [
        {
          title: "TCP Handshake Capture",
          description: "Buka Wireshark dan mulai capture. Buka browser ke situs HTTP. Filter 'tcp.flags.syn==1' untuk melihat paket SYN.",
          command: "tshark -i eth0 -f 'tcp port 80' -c 20",
          expectedOutput: "Terlihat paket SYN, SYN-ACK, dan ACK berurutan",
          hint: "Perhatikan kolom Info: [SYN], [SYN, ACK], [ACK] menandakan 3-way handshake berhasil."
        },
        {
          title: "DNS Query Analysis",
          description: "Filter 'dns' di Wireshark. Kunjungi website baru. Amati query A record dan responsnya.",
          command: "nslookup example.com && dig example.com +short",
          expectedOutput: "IP address dari domain yang di-query"
        },
        {
          title: "HTTP POST Cleartext Analysis",
          description: "Filter 'http.request.method == POST'. Coba login ke test site untuk melihat data POST dalam cleartext.",
          command: "curl -X POST http://testphp.vulnweb.com/login.php -d 'uname=test&pass=test' -v",
          warningNote: "Jangan pernah mengirim kredensial asli melalui HTTP! Gunakan hanya test credentials di lab environment.",
          hint: "Di Wireshark, klik kanan paket POST > Follow > TCP Stream untuk melihat seluruh percakapan HTTP."
        },
        {
          title: "DHCP Traffic Analysis",
          description: "Filter 'bootp' atau 'dhcp' di Wireshark. Renew IP address untuk melihat proses DORA.",
          command: "sudo dhclient -r && sudo dhclient eth0",
          expectedOutput: "Terlihat 4 paket: Discover, Offer, Request, Acknowledge"
        }
      ],
      deliverable: "Laporan lab berisi screenshot TCP handshake, DNS query, dan analisis HTTP POST cleartext."
    },
    caseStudy: {
      title: "DNS Tunneling untuk Data Exfiltration",
      scenario: "Perusahaan fintech mendeteksi traffic DNS tidak biasa: ribuan TXT query ke domain aneh dengan subdomain encoded base64. Volume traffic 50x normal.",
      questions: [
        "Jelaskan bagaimana DNS tunneling bekerja.",
        "Metrics apa yang digunakan SOC untuk mendeteksi ini?",
        "Bagaimana konfigurasi firewall/DNS security yang tepat?",
        "Buatlah timeline investigasi forensik."
      ]
    },
    quiz: [
      { id: 1, question: "Jelaskan proses TCP three-way handshake!", answer: "Client SYN -> Server SYN-ACK -> Client ACK -> Established", type: "essay" },
      { id: 2, question: "Apa perbedaan utama antara TCP dan UDP?", answer: "TCP reliable & connection-oriented; UDP unreliable & connectionless tapi cepat", type: "essay" },
      { id: 3, question: "Sebutkan proses DHCP DORA!", answer: "Discover, Offer, Request, Acknowledge", type: "essay" },
      { id: 4, question: "Apa perbedaan antara DNS record type A dan CNAME?", answer: "A memetakan domain ke IP; CNAME memetakan domain ke domain lain (alias)", type: "essay" },
      { id: 5, question: "Mengapa NAT penting untuk keamanan jaringan?", answer: "Menyembunyikan IP internal dari jaringan eksternal", type: "essay" }
    ],
    videoResources: [
      { title: "TCP vs UDP Comparison", youtubeId: "uwoD5YsGACg", description: "Perbandingan mendalam TCP dan UDP.", language: "en", duration: "9:45" },
      { title: "DNS Explained - How DNS Works", youtubeId: "72snZctFFtA", description: "Cara kerja DNS dari awal hingga akhir.", language: "en", duration: "6:10" },
      { title: "DHCP Explained", youtubeId: "e6-TaH5bkjo", description: "Proses DHCP DORA dijelaskan secara visual.", language: "en", duration: "7:30" }
    ]
  },
  {
    id: 6,
    title: "Network Security & Threats",
    description: "Network Security Infrastructure, Attackers, dan Common Threats",
    iconName: "AlertTriangle",
    theory: [
      { title: "Topologi & Perangkat Keamanan", content: "DMZ (Demilitarized Zone) menampung server publik, terpisah dari jaringan internal. Firewall memfilter paket. IDS/IPS mendeteksi intrusi. VPN (Virtual Private Network) mengenkripsi koneksi jarak jauh." },
      { title: "Threat Actors", content: "Script Kiddies (pemula pakai tool jadi), Hacktivists (motif ideologi), Nation-State (disponsori negara, canggih), Insider (orang dalam). Memahami motif lawan membantu pertahanan." },
      { title: "Jenis Malware", content: "Virus (menempel pada file), Worm (menyebar sendiri via jaringan), Trojan (menyamar jadi software sah), Ransomware (enkripsi data untuk tebusan), Spyware (mencuri data)." },
      { title: "Jenis Serangan Umum", content: "Reconnaissance (scanning), DoS/DDoS (membanjiri layanan), Social Engineering (memanipulasi manusia), Man-in-the-Middle (menyadap komunikasi)." }
    ],
    lab: {
      title: "Lab 6: Network Reconnaissance dan Threat Analysis",
      downloads: [
        { name: "Nmap", url: "https://nmap.org/download.html", description: "Network discovery and security auditing tool." }
      ],
      steps: [
        {
          title: "Host Discovery",
          description: "Gunakan Nmap untuk menemukan host aktif di lab network. Flag -sn melakukan ping sweep tanpa port scan.",
          command: "nmap -sn 192.168.1.0/24",
          expectedOutput: "Daftar host aktif dengan IP dan MAC address",
          hint: "Bandingkan hasil dengan ARP table (arp -a) untuk verifikasi."
        },
        {
          title: "Service & Version Scanning",
          description: "Scan target VM untuk identifikasi service dan versinya. Flag -sV untuk version detection, -sC untuk default scripts.",
          command: "nmap -sV -sC -p 1-1000 [Target_IP]",
          expectedOutput: "Daftar port terbuka, service name, dan versi",
          warningNote: "Hanya scan target yang sudah diizinkan! Scanning tanpa izin adalah illegal."
        },
        {
          title: "Vulnerability Script Scan",
          description: "Gunakan Nmap NSE scripts kategori vuln untuk mencari kerentanan.",
          command: "nmap --script vuln [Target_IP]",
          expectedOutput: "Laporan kerentanan yang ditemukan (jika ada)",
          hint: "Script vuln bisa memakan waktu lama. Gunakan -p untuk membatasi port yang di-scan."
        },
        {
          title: "Malware Hash Analysis",
          description: "Kunjungi VirusTotal.com. Search hash EICAR test file untuk memahami cara analisis hash malware.",
          screenshotNote: "Screenshot halaman hasil VirusTotal menunjukkan detection rate."
        }
      ],
      deliverable: "Laporan lab berisi output Nmap scan dan hasil analisis VirusTotal."
    },
    caseStudy: {
      title: "Serangan Multi-Stage pada E-Commerce",
      scenario: "E-commerce diserang bertahap: Reconnaissance, Social Engineering, Lateral Movement, Exfiltration, Ransomware. Berlangsung 3 bulan.",
      questions: [
        "Petakan serangan ke MITRE ATT&CK.",
        "Di fase mana serangan bisa dideteksi/dihentikan?",
        "Analisis dwell time (3 bulan).",
        "Rancang arsitektur keamanan yang lebih baik."
      ]
    },
    quiz: [
      { id: 1, question: "Apa perbedaan antara IDS dan IPS?", answer: "IDS mendeteksi/alert; IPS mendeteksi/blokir", type: "essay" },
      { id: 2, question: "Sebutkan 4 jenis threat actor!", answer: "Script kiddies, Hacktivists, Organized crime, Nation-state", type: "essay" },
      { id: 3, question: "Apa perbedaan virus, worm, dan trojan?", answer: "Virus butuh host; Worm menyebar sendiri; Trojan menyamar jadi software sah", type: "essay" },
      { id: 4, question: "Jelaskan SYN Flood attack!", answer: "Mengirim banyak SYN packets tanpa menyelesaikan handshake untuk menghabiskan resource server", type: "essay" },
      { id: 5, question: "Apa itu DMZ?", answer: "Zona demiliterisasi: segmen jaringan antara internal dan eksternal untuk public-facing servers", type: "essay" }
    ],
    videoResources: [
      { title: "Network Security Fundamentals", youtubeId: "E03gh1huvW4", description: "Konsep dasar keamanan jaringan: firewall, IDS/IPS, VPN.", language: "en", duration: "22:15" },
      { title: "Types of Cyber Attacks Explained", youtubeId: "Dk-ZqQ-bU6A", description: "Penjelasan jenis-jenis serangan siber yang umum.", language: "en", duration: "12:30" }
    ]
  },
  {
    id: 7,
    title: "Formatif (Quiz)",
    description: "Evaluasi Pembelajaran Pertemuan 1-6",
    iconName: "FileText",
    theory: [
      { title: "Review Materi", content: "Mencakup CIA Triad, SOC, Windows/Linux Security, OSI/TCP Layer, ICMP/ARP, dan Network Threats. Persiapkan diri dengan mereview lab dan studi kasus sebelumnya." }
    ],
    lab: {
      title: "Review Lab Skills",
      downloads: [],
      steps: [
        { title: "Review", description: "Review penggunaan Wireshark, command line Linux/Windows, dan analisis pcap." }
      ],
      deliverable: "Hasil quiz formatif"
    },
    caseStudy: {
      title: "Comprehensive Review",
      scenario: "Review seluruh studi kasus dari pertemuan 1-6 untuk persiapan ujian.",
      questions: [
        "Jelaskan hubungan antara berbagai layer OSI dalam konteks keamanan.",
        "Bagaimana serangan di satu layer dapat berdampak pada layer lain?"
      ]
    },
    quiz: [
      { id: 1, question: "Layer OSI mana yang bertanggung jawab untuk enkripsi data?", answer: "Presentation Layer", type: "multiple-choice", options: ["Transport", "Session", "Presentation", "Application"] },
      { id: 2, question: "Protokol mana yang connection-oriented?", answer: "TCP", type: "multiple-choice", options: ["UDP", "IP", "TCP", "ICMP"] }
    ],
    videoResources: []
  },
  {
    id: 8,
    title: "Ujian Tengah Semester (UTS)",
    description: "Evaluasi Tengah Semester",
    iconName: "Award",
    theory: [
      { title: "Materi Ujian", content: "Seluruh materi dari Pertemuan 1 sampai 6." }
    ],
    lab: {
      title: "Ujian Praktik",
      downloads: [],
      steps: [{ title: "Exam", description: "Mengerjakan soal praktik sesuai instruksi pengawas." }],
      deliverable: "Jawaban Ujian"
    },
    caseStudy: {
      title: "Ujian Analisis Kasus",
      scenario: "Sesuai soal ujian.",
      questions: ["Sesuai soal ujian."]
    },
    quiz: [],
    videoResources: []
  },
  {
    id: 9,
    title: "Traffic Monitoring & Vulnerabilities",
    description: "Network Traffic Monitoring dan Kerentanan TCP/IP",
    iconName: "Eye",
    theory: [
      { title: "Traffic Monitoring", content: "Passive Monitoring (Sniffing, TAP, SPAN) menyalin traffic tanpa mengganggu aliran data. Active Monitoring mengirim paket probe. Flow Analysis (NetFlow) melihat metadata traffic (siapa bicara dengan siapa, berapa lama) tanpa melihat isi payload, lebih ringan dari Full Packet Capture." },
      { title: "IP & TCP Vulnerabilities", content: "IP Spoofing memalsukan alamat pengirim. Fragmentation attack mengeksploitasi cara paket dipecah dan disatukan kembali. TCP SYN Flood memenuhi buffer koneksi server. TCP Session Hijacking mengambil alih sesi yang sudah terbentuk." },
      { title: "UDP & Application Vulnerabilities", content: "UDP Flood membanjiri port acak. DNS Amplification memanfaatkan server DNS open resolver untuk membanjiri korban dengan respons besar. DHCP Starvation menghabiskan pool IP address." }
    ],
    lab: {
      title: "Lab 9: TCP/IP Vulnerability Analysis",
      downloads: [],
      steps: [
        {
          title: "Baseline Traffic Capture",
          description: "Capture traffic normal selama 2 menit sebagai baseline menggunakan tshark. Simpan ke file pcap untuk perbandingan.",
          command: "sudo tshark -i eth0 -a duration:120 -w baseline.pcap",
          expectedOutput: "File baseline.pcap berisi traffic normal",
          hint: "Jalankan aktivitas normal (browsing, ping) selama capture untuk mendapatkan baseline yang representatif."
        },
        {
          title: "Analisis Statistik Baseline",
          description: "Gunakan tshark untuk melihat statistik protokol dari baseline capture.",
          command: "tshark -r baseline.pcap -q -z io,phs",
          expectedOutput: "Hierarki protokol dengan jumlah paket per protokol"
        },
        {
          title: "TCP Stream Analysis",
          description: "Buka file pcap di Wireshark. Klik kanan paket TCP > Follow > TCP Stream untuk melihat percakapan lengkap.",
          screenshotNote: "Screenshot TCP stream yang menunjukkan request dan response HTTP lengkap."
        },
        {
          title: "Display Filter untuk Anomali",
          description: "Gunakan display filter Wireshark untuk mendeteksi anomali traffic.",
          command: "tcp.analysis.retransmission || tcp.analysis.duplicate_ack || tcp.analysis.zero_window",
          hint: "Filter ini menunjukkan masalah koneksi TCP: retransmission = paket hilang, zero window = receiver kewalahan."
        },
        {
          title: "SYN Flood Detection",
          description: "Filter SYN packets tanpa ACK yang mengindikasikan SYN flood attack.",
          command: "tcp.flags.syn==1 && tcp.flags.ack==0",
          expectedOutput: "Jika ada SYN flood, akan terlihat banyak SYN tanpa SYN-ACK yang sesuai",
          warningNote: "Jangan melakukan SYN flood di jaringan production! Gunakan hanya di lab environment yang terisolasi."
        },
        {
          title: "Conversation Analysis",
          description: "Gunakan Wireshark Statistics > Conversations untuk melihat top talkers dan identifikasi anomali.",
          screenshotNote: "Screenshot Conversations window menunjukkan top 10 conversations berdasarkan bytes."
        },
        {
          title: "IP Fragmentation Check",
          description: "Filter fragmented packets yang bisa mengindikasikan fragmentation attack.",
          command: "ip.flags.mf==1 || ip.frag_offset > 0",
          expectedOutput: "Paket terfragmentasi (normal jika sedikit, anomali jika banyak)"
        },
        {
          title: "Export Findings",
          description: "Export paket yang relevan untuk dokumentasi. File > Export Specified Packets, pilih 'Displayed' untuk export hanya paket yang terfilter.",
          hint: "Gunakan File > Export Objects > HTTP untuk extract file yang ditransfer melalui HTTP."
        }
      ],
      deliverable: "Laporan lab berisi screenshot baseline vs anomali traffic, analisis TCP stream, dan identifikasi potensi serangan."
    },
    caseStudy: {
      title: "DDoS Attack pada Internet Banking",
      scenario: "Bank mengalami DDoS (SYN Flood, DNS Amplification, HTTP Flood) dari IoT botnet. Layanan down 6 jam.",
      questions: [
        "Jelaskan mekanisme teknis serangan.",
        "Mengapa IoT devices sering jadi botnet?",
        "Buat strategi mitigasi bertingkat.",
        "Bagaimana mengelola alert overload?"
      ]
    },
    quiz: [
      { id: 1, question: "Perbedaan passive vs active monitoring?", answer: "Passive mengamati tanpa kirim paket; Active kirim probe", type: "essay" },
      { id: 2, question: "Jelaskan DNS Amplification attack!", answer: "Query kecil dengan spoofed IP korban ke resolver, balasan besar membanjiri korban", type: "essay" },
      { id: 3, question: "Apa itu TCP Session Hijacking?", answer: "Mengambil alih sesi TCP established dengan prediksi sequence number", type: "essay" },
      { id: 4, question: "Sebutkan 3 kerentanan DHCP!", answer: "Starvation, Spoofing, Rogue Server", type: "essay" },
      { id: 5, question: "Fungsi SPAN port?", answer: "Duplikasi traffic switch port untuk monitoring", type: "essay" }
    ],
    videoResources: [
      { title: "Network Traffic Analysis with Wireshark", youtubeId: "ZO46H_kI1bc", description: "Teknik analisis traffic jaringan menggunakan Wireshark.", language: "en", duration: "28:15" },
      { title: "DDoS Attack Explained", youtubeId: "ilhGh9CEIwM", description: "Penjelasan cara kerja serangan DDoS dan mitigasinya.", language: "en", duration: "10:20" },
      { title: "TCP/IP Vulnerabilities Overview", youtubeId: "AYdF7b3nMto", description: "Overview kerentanan pada protokol TCP/IP.", language: "en", duration: "15:40" }
    ]
  },
  {
    id: 10,
    title: "Defense & Access Control",
    description: "Pertahanan Keamanan Jaringan dan Access Control",
    iconName: "Lock",
    theory: [
      { title: "Defense-in-Depth", content: "Strategi keamanan berlapis (Physical, Network, Host, Application, Data). Jika satu lapisan gagal, lapisan lain masih melindungi. Tidak mengandalkan satu solusi tunggal." },
      { title: "Access Control Models", content: "DAC (Discretionary): Owner menentukan akses. MAC (Mandatory): Sistem menentukan akses berdasarkan label keamanan (Top Secret, dll). RBAC (Role-Based): Akses berdasarkan peran kerja. ABAC (Attribute-Based): Akses berdasarkan atribut (waktu, lokasi, user)." },
      { title: "AAA Framework", content: "Authentication (Siapa Anda?), Authorization (Apa yang boleh Anda lakukan?), Accounting (Apa yang Anda lakukan/Log). Protokol RADIUS dan TACACS+ digunakan untuk mengelola AAA di perangkat jaringan." },
      { title: "Zero Trust Architecture", content: "Model keamanan yang berasumsi 'jangan pernah percaya, selalu verifikasi'. Tidak ada kepercayaan implisit bahkan untuk user di dalam jaringan internal. Memerlukan autentikasi dan otorisasi terus-menerus." }
    ],
    lab: {
      title: "Lab 10: Access Control Implementation",
      downloads: [],
      steps: [
        {
          title: "Password Policy dengan PAM",
          description: "Konfigurasi PAM (Pluggable Authentication Modules) untuk enforce kompleksitas password di Linux.",
          command: "sudo cat /etc/pam.d/common-password",
          expectedOutput: "Konfigurasi PAM yang menunjukkan modul pam_pwquality atau pam_cracklib",
          hint: "Tambahkan 'minlen=12 ucredit=-1 lcredit=-1 dcredit=-1 ocredit=-1' ke konfigurasi pam_pwquality."
        },
        {
          title: "Konfigurasi Password Quality",
          description: "Edit konfigurasi PAM untuk menambahkan aturan kompleksitas password.",
          command: "sudo nano /etc/security/pwquality.conf",
          screenshotNote: "Screenshot file pwquality.conf setelah diedit dengan parameter minlen, ucredit, lcredit, dcredit."
        },
        {
          title: "Implementasi RBAC dengan Groups",
          description: "Buat grup dan user sesuai peran. Implementasi access control berbasis grup.",
          command: "sudo groupadd soc_admin && sudo groupadd soc_operator && sudo groupadd soc_viewer && sudo useradd -m -G soc_admin admin1 && sudo useradd -m -G soc_operator op1 && sudo useradd -m -G soc_viewer viewer1",
          expectedOutput: "Grup dan user berhasil dibuat"
        },
        {
          title: "Set Directory Permissions per Role",
          description: "Buat direktori kerja dengan permission berbeda per grup.",
          command: "sudo mkdir -p /opt/soc/{admin,shared,reports} && sudo chgrp soc_admin /opt/soc/admin && sudo chmod 770 /opt/soc/admin && sudo chgrp soc_operator /opt/soc/shared && sudo chmod 775 /opt/soc/shared && sudo chmod 755 /opt/soc/reports",
          expectedOutput: "Direktori dengan permission berbeda per role"
        },
        {
          title: "SSH Key-Based Authentication",
          description: "Generate SSH key pair dan konfigurasi SSH server untuk key-based auth.",
          command: "ssh-keygen -t ed25519 -C 'lab10@infosec' -f ~/.ssh/lab_key -N ''",
          expectedOutput: "Key pair berhasil dibuat di ~/.ssh/lab_key dan ~/.ssh/lab_key.pub"
        },
        {
          title: "Hardening SSHD Configuration",
          description: "Edit sshd_config untuk meningkatkan keamanan SSH server.",
          command: "sudo grep -n 'PasswordAuthentication\\|PermitRootLogin\\|MaxAuthTries\\|PubkeyAuthentication' /etc/ssh/sshd_config",
          hint: "Set PasswordAuthentication no, PermitRootLogin no, MaxAuthTries 3, PubkeyAuthentication yes.",
          warningNote: "Pastikan SSH key sudah terpasang sebelum disable password authentication! Jika tidak, Anda bisa terkunci dari server."
        },
        {
          title: "Audit Rules dengan auditctl",
          description: "Konfigurasi Linux Audit Framework untuk memantau akses file sensitif.",
          command: "sudo auditctl -w /etc/passwd -p wa -k passwd_changes && sudo auditctl -w /etc/shadow -p wa -k shadow_changes && sudo auditctl -w /var/log/ -p wa -k log_changes && sudo auditctl -l",
          expectedOutput: "Daftar audit rules yang aktif"
        },
        {
          title: "Verifikasi Audit Logs",
          description: "Coba modifikasi file yang dimonitor dan periksa audit log.",
          command: "sudo ausearch -k passwd_changes --interpret | tail -20",
          expectedOutput: "Log entry menunjukkan siapa yang mengakses file, kapan, dan apa yang diubah"
        }
      ],
      deliverable: "Laporan lab berisi screenshot konfigurasi PAM, RBAC groups, SSH hardening, dan audit logs."
    },
    caseStudy: {
      title: "Data Breach Akibat Lemahnya Access Control",
      scenario: "Kebocoran data 2 juta pelanggan. Karyawan outsource punya akses admin, no MFA, password lemah, no audit log.",
      questions: [
        "Identifikasi pelanggaran access control.",
        "Rancang kebijakan access control komprehensif.",
        "Bagaimana Zero Trust mencegah ini?",
        "Implikasi UU PDP."
      ]
    },
    quiz: [
      { id: 1, question: "Jelaskan konsep Defense-in-Depth!", answer: "Keamanan berlapis (Physical, Network, Host, App, Data)", type: "essay" },
      { id: 2, question: "Perbedaan RBAC dan ABAC?", answer: "RBAC berdasarkan peran; ABAC berdasarkan atribut (user, resource, env)", type: "essay" },
      { id: 3, question: "3 Komponen AAA?", answer: "Authentication, Authorization, Accounting", type: "essay" },
      { id: 4, question: "Perbedaan RADIUS dan TACACS+?", answer: "RADIUS (UDP, gabung auth/authz); TACACS+ (TCP, pisah AAA)", type: "essay" },
      { id: 5, question: "Prinsip Zero Trust?", answer: "Never trust, always verify", type: "essay" }
    ],
    videoResources: [
      { title: "Defense in Depth Explained", youtubeId: "1NsGVfLWH3k", description: "Strategi pertahanan berlapis dalam keamanan siber.", language: "en", duration: "10:15" },
      { title: "Access Control Models (DAC, MAC, RBAC)", youtubeId: "LD0P4v-Kx1U", description: "Penjelasan model-model access control.", language: "en", duration: "14:20" },
      { title: "Zero Trust Security Model", youtubeId: "yn6CPQ0bCHA", description: "Konsep Zero Trust Architecture dan implementasinya.", language: "en", duration: "11:45" }
    ]
  },
  {
    id: 11,
    title: "Threat Intel & Cryptography",
    description: "Threat Intelligence dan Cryptography",
    iconName: "Key",
    theory: [
      { title: "Threat Intelligence", content: "Pengetahuan tentang ancaman (attacker, tools, TTPs). Sumber: OSINT, Commercial feeds. IoC (Indicators of Compromise) seperti IP buruk, hash malware, digunakan untuk deteksi." },
      { title: "Kriptografi Dasar", content: "Hashing (MD5, SHA) memastikan integritas (satu arah). Enkripsi Simetris (AES) menggunakan satu kunci untuk enkripsi/dekripsi (cepat). Enkripsi Asimetris (RSA) menggunakan Public/Private key pair (aman untuk pertukaran kunci)." },
      { title: "PKI (Public Key Infrastructure)", content: "Sistem untuk mengelola kunci digital dan sertifikat. Certificate Authority (CA) adalah pihak terpercaya yang menerbitkan sertifikat digital untuk memvalidasi identitas (misal: HTTPS website)." }
    ],
    lab: {
      title: "Lab 11: Threat Intelligence dan Cryptography Practice",
      downloads: [],
      steps: [
        {
          title: "CVE Database Lookup",
          description: "Gunakan API CVE untuk mencari kerentanan terbaru. Analisis detail CVE dan tingkat keparahannya.",
          command: "curl -s 'https://cveawg.mitre.org/api/cve/CVE-2021-44228' | python3 -m json.tool | head -30",
          expectedOutput: "Detail CVE-2021-44228 (Log4Shell) dalam format JSON",
          hint: "CVE-2021-44228 adalah kerentanan Log4Shell yang sangat kritis. Perhatikan CVSS score dan affected products."
        },
        {
          title: "File Integrity Hashing",
          description: "Praktik hashing file untuk verifikasi integritas. Bandingkan MD5 dan SHA-256.",
          command: "echo 'InfoSec Testing Lab' > testfile.txt && md5sum testfile.txt && sha256sum testfile.txt",
          expectedOutput: "Hash MD5 (32 karakter) dan SHA-256 (64 karakter) dari file"
        },
        {
          title: "Verifikasi Integritas",
          description: "Modifikasi file dan lihat bagaimana hash berubah total (avalanche effect).",
          command: "echo 'InfoSec Testing Lab!' > testfile2.txt && md5sum testfile.txt testfile2.txt && sha256sum testfile.txt testfile2.txt",
          expectedOutput: "Hash yang sama sekali berbeda meskipun perubahan file minimal",
          hint: "Ini menunjukkan avalanche effect: perubahan 1 bit input menghasilkan hash yang sangat berbeda."
        },
        {
          title: "GPG Key Generation",
          description: "Generate GPG key pair untuk enkripsi/dekripsi file.",
          command: "gpg --batch --gen-key <<EOF\nKey-Type: RSA\nKey-Length: 2048\nName-Real: Lab User\nName-Email: lab@infosec.local\nExpire-Date: 0\n%no-protection\n%commit\nEOF",
          expectedOutput: "GPG key pair berhasil dibuat"
        },
        {
          title: "GPG Encrypt & Decrypt",
          description: "Enkripsi file menggunakan GPG dan kemudian dekripsi untuk verifikasi.",
          command: "gpg -e -r 'lab@infosec.local' testfile.txt && ls -la testfile.txt.gpg && gpg -d testfile.txt.gpg",
          expectedOutput: "File terenkripsi (.gpg) dan hasil dekripsi yang sama dengan original"
        },
        {
          title: "SSL/TLS Certificate Analysis",
          description: "Gunakan openssl untuk memeriksa sertifikat SSL/TLS dari website.",
          command: "echo | openssl s_client -connect google.com:443 -servername google.com 2>/dev/null | openssl x509 -noout -subject -issuer -dates",
          expectedOutput: "Subject, Issuer, dan tanggal validitas sertifikat"
        },
        {
          title: "Certificate Chain Verification",
          description: "Lihat seluruh chain of trust dari sertifikat.",
          command: "echo | openssl s_client -connect google.com:443 -servername google.com -showcerts 2>/dev/null | grep -E 's:|i:'",
          expectedOutput: "Chain dari server cert ke intermediate CA ke root CA",
          hint: "Chain of trust: Server Cert -> Intermediate CA -> Root CA. Browser memverifikasi seluruh chain."
        }
      ],
      deliverable: "Laporan lab berisi screenshot CVE analysis, hash comparison, GPG encryption, dan SSL certificate analysis."
    },
    caseStudy: {
      title: "Serangan Supply Chain dengan Certificate Compromise",
      scenario: "Vendor software kena hack, sertifikat code signing dicuri untuk sign malware. Update resmi berisi backdoor.",
      questions: [
        "Bagaimana PKI trust system dieksploitasi?",
        "Peran threat intelligence?",
        "Buat YARA/Snort rule.",
        "Langkah certificate revocation."
      ]
    },
    quiz: [
      { id: 1, question: "Apa itu IoC? Berikan contoh.", answer: "Bukti forensik intrusi (IP, hash, domain)", type: "essay" },
      { id: 2, question: "Perbedaan Symmetric vs Asymmetric?", answer: "Symmetric 1 kunci; Asymmetric 2 kunci (public/private)", type: "essay" },
      { id: 3, question: "Fungsi Digital Signature?", answer: "Authenticity, Integrity, Non-repudiation", type: "essay" },
      { id: 4, question: "Peran CA dalam PKI?", answer: "Pihak ketiga terpercaya penerbit sertifikat", type: "essay" },
      { id: 5, question: "Mengapa MD5 tidak aman?", answer: "Rentan collision attacks", type: "essay" }
    ],
    videoResources: [
      { title: "Threat Intelligence Fundamentals", youtubeId: "lauPTkBMaJo", description: "Dasar-dasar threat intelligence dan cara menggunakannya.", language: "en", duration: "16:30" },
      { title: "Cryptography Explained Simply", youtubeId: "jhXCTbFnK8o", description: "Penjelasan kriptografi: hashing, symmetric, dan asymmetric encryption.", language: "en", duration: "12:15" },
      { title: "SSL/TLS Explained", youtubeId: "j9QmMEWmcfo", description: "Cara kerja SSL/TLS dan PKI.", language: "en", duration: "14:50" }
    ]
  },
  {
    id: 12,
    title: "Endpoint Protection",
    description: "Endpoint Protection dan Vulnerability Assessment",
    iconName: "Cpu",
    theory: [
      { title: "Endpoint Security", content: "Melindungi perangkat akhir (laptop, server). Antimalware modern menggunakan behavioral analysis, bukan hanya signature. HIPS (Host-based IPS) memantau aktivitas mencurigakan di OS. Application Whitelisting hanya mengizinkan aplikasi yang disetujui." },
      { title: "Vulnerability Assessment (VA)", content: "Proses mengidentifikasi, mengukur, dan memprioritaskan kerentanan sistem. Menggunakan scanner (Nessus, OpenVAS). Berbeda dengan Penetration Testing yang mencoba mengeksploitasi kerentanan." },
      { title: "CVSS (Common Vulnerability Scoring System)", content: "Standar industri untuk menilai keparahan kerentanan (Skor 0-10). Faktor: Attack Vector, Attack Complexity, Privileges Required, User Interaction, Scope, Confidentiality, Integrity, Availability." }
    ],
    lab: {
      title: "Lab 12: Endpoint Profiling dan Vulnerability Assessment",
      downloads: [],
      steps: [
        {
          title: "Service Profiling - Listening Ports",
          description: "Identifikasi semua service yang berjalan dan port yang terbuka pada endpoint.",
          command: "sudo ss -tulnp | sort -k 5",
          expectedOutput: "Daftar port terbuka dengan PID/nama proses yang listen",
          hint: "Setiap port terbuka adalah attack surface. Service yang tidak diperlukan harus dimatikan."
        },
        {
          title: "Service Profiling - Running Services",
          description: "Lihat daftar service yang aktif dan statusnya menggunakan systemctl.",
          command: "systemctl list-units --type=service --state=running --no-pager | head -30",
          expectedOutput: "Daftar service yang sedang berjalan"
        },
        {
          title: "Nmap Vulnerability Scan",
          description: "Gunakan Nmap NSE vulnerability scripts untuk scan kerentanan pada target.",
          command: "nmap -sV --script=vuln -p 22,80,443,3306,8080 [Target_IP]",
          expectedOutput: "Laporan kerentanan per port/service",
          warningNote: "Vulnerability scan bisa menyebabkan gangguan pada service target. Hanya jalankan pada target yang diizinkan!"
        },
        {
          title: "Nmap Service Version Detection",
          description: "Deteksi versi spesifik service untuk lookup CVE yang relevan.",
          command: "nmap -sV -sC --version-intensity 5 -p- [Target_IP] -oN scan_results.txt",
          expectedOutput: "Versi detail setiap service (e.g., Apache 2.4.41, OpenSSH 8.2)",
          hint: "Gunakan versi yang ditemukan untuk search di CVE database: cvedetails.com"
        },
        {
          title: "CVSS Score Calculation",
          description: "Kunjungi FIRST CVSS Calculator (first.org/cvss/calculator/3.1) dan hitung score untuk skenario kerentanan.",
          screenshotNote: "Screenshot CVSS calculator dengan score yang dihitung untuk kerentanan yang ditemukan."
        },
        {
          title: "Vulnerability Prioritization Matrix",
          description: "Buat matrix prioritas berdasarkan CVSS score dan business impact.",
          hint: "Kriteria: Critical (9.0-10.0) = patch dalam 24 jam, High (7.0-8.9) = patch dalam 1 minggu, Medium (4.0-6.9) = patch dalam 1 bulan, Low (0.1-3.9) = next maintenance window."
        },
        {
          title: "Generate Vulnerability Report",
          description: "Compile temuan ke dalam format laporan standar.",
          command: "echo '=== Vulnerability Assessment Report ===' > va_report.txt && echo 'Date:' $(date) >> va_report.txt && echo 'Target: [Target_IP]' >> va_report.txt && cat scan_results.txt >> va_report.txt && cat va_report.txt",
          expectedOutput: "File laporan VA lengkap"
        }
      ],
      deliverable: "Laporan lab berisi hasil vulnerability scan, CVSS scoring, dan prioritization matrix."
    },
    caseStudy: {
      title: "Exploit Zero-Day pada Endpoint",
      scenario: "200 workstation kena malware via zero-day PDF reader. Antivirus gagal deteksi.",
      questions: [
        "Mengapa signature-based gagal?",
        "Analisis CVSS 9.8.",
        "Buat incident response plan.",
        "Strategi endpoint protection robust."
      ]
    },
    quiz: [
      { id: 1, question: "Signature vs Behavioral detection?", answer: "Signature cocokin pola; Behavioral liat perilaku", type: "essay" },
      { id: 2, question: "Komponen CVSS Base Score?", answer: "AV, AC, PR, UI, S, C, I, A", type: "essay" },
      { id: 3, question: "Apa itu HIPS?", answer: "Host-based IPS, monitor system calls/files di endpoint", type: "essay" },
      { id: 4, question: "Proses Vulnerability Assessment?", answer: "Discover, Prioritize, Assess, Report, Remediate, Verify", type: "essay" },
      { id: 5, question: "VA vs Pentest?", answer: "VA identifikasi; Pentest eksploitasi", type: "essay" }
    ],
    videoResources: [
      { title: "Endpoint Security Explained", youtubeId: "yb2NMUL8i08", description: "Konsep endpoint security dan EDR.", language: "en", duration: "13:40" },
      { title: "Vulnerability Assessment Process", youtubeId: "wRHbirSMeDo", description: "Langkah-langkah melakukan vulnerability assessment.", language: "en", duration: "17:25" },
      { title: "CVSS Scoring Explained", youtubeId: "Fmy0mIR5Ggs", description: "Cara memahami dan menghitung CVSS score.", language: "en", duration: "10:30" }
    ]
  },
  {
    id: 13,
    title: "Security Tech & Data",
    description: "Security Technologies, Protocols, dan Network Security Data",
    iconName: "Database",
    theory: [
      { title: "Security Data Types", content: "Alert Data (dari IDS/IPS), Session Data (ringkasan percakapan), Transaction Data (detail request/response), Full Packet Capture (rekaman lengkap), Statistical Data (baseline). Memahami tipe data penting untuk visibilitas." },
      { title: "SIEM (Security Information and Event Management)", content: "Platform yang mengumpulkan log dari berbagai sumber, melakukan normalisasi, korelasi event untuk mendeteksi serangan kompleks, dan alerting. Membantu analis melihat 'big picture'." },
      { title: "Monitoring Protocols", content: "Syslog (standar logging), NTP (sinkronisasi waktu sangat krusial untuk forensik), SNMP (monitoring status perangkat). SSL Inspection diperlukan karena banyak malware bersembunyi di traffic terenkripsi." }
    ],
    lab: {
      title: "Lab 13: Security Data Analysis dan Log Investigation",
      downloads: [],
      steps: [
        {
          title: "Syslog Analysis (Linux)",
          description: "Periksa syslog untuk menemukan event keamanan. Gunakan journalctl untuk filtering.",
          command: "sudo journalctl --since '1 hour ago' --priority=err..emerg --no-pager | head -30",
          expectedOutput: "Log entries dengan priority error atau lebih tinggi",
          hint: "Priority levels: emerg (0), alert (1), crit (2), err (3), warning (4), notice (5), info (6), debug (7)."
        },
        {
          title: "Authentication Log Analysis",
          description: "Analisis log autentikasi untuk mendeteksi brute force atau login mencurigakan.",
          command: "sudo grep -E 'Failed password|Accepted password|Invalid user' /var/log/auth.log | tail -20",
          expectedOutput: "Log entries yang menunjukkan percobaan login sukses dan gagal"
        },
        {
          title: "Windows Event Log Query (PowerShell)",
          description: "Jika menggunakan Windows, query Event Log untuk security events.",
          command: "Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 10 | Format-List TimeCreated,Message",
          expectedOutput: "10 event terakhir dengan ID 4625 (Failed Logon)"
        },
        {
          title: "Snort/Suricata Rule Basics",
          description: "Pelajari format aturan IDS. Buat rule sederhana untuk mendeteksi aktivitas mencurigakan.",
          command: "echo 'alert tcp any any -> any 80 (msg:\"HTTP GET Request Detected\"; content:\"GET\"; http_method; sid:1000001; rev:1;)' > custom.rules && cat custom.rules",
          expectedOutput: "Rule Snort/Suricata yang valid",
          hint: "Format: action protocol src_ip src_port -> dst_ip dst_port (options;). Action bisa: alert, log, pass, drop."
        },
        {
          title: "Rule untuk Detect SQL Injection",
          description: "Buat IDS rule untuk mendeteksi percobaan SQL injection.",
          command: "echo 'alert tcp any any -> any 80 (msg:\"Possible SQL Injection\"; content:\"UNION\"; nocase; content:\"SELECT\"; nocase; sid:1000002; rev:1;)' >> custom.rules && cat custom.rules",
          expectedOutput: "Rule untuk deteksi SQL injection pattern"
        },
        {
          title: "SIEM Query Simulation",
          description: "Simulasikan query SIEM untuk menemukan pola serangan. Gunakan grep dan awk untuk korelasi log.",
          command: "sudo grep 'Failed password' /var/log/auth.log 2>/dev/null | awk '{print $1,$2,$3,$9,$11}' | sort | uniq -c | sort -rn | head -10",
          expectedOutput: "Top 10 IP/user dengan failed login attempts terbanyak",
          hint: "Ini mensimulasikan query SIEM: 'Show top sources of failed authentication in last 24 hours'."
        },
        {
          title: "Log Correlation Exercise",
          description: "Korelasikan log dari multiple sources untuk membangun timeline serangan.",
          screenshotNote: "Buat timeline berdasarkan timestamp dari auth.log, syslog, dan firewall log yang menunjukkan progression serangan."
        }
      ],
      deliverable: "Laporan lab berisi analisis syslog, IDS rules, dan SIEM query results."
    },
    caseStudy: {
      title: "APT Detection Melalui Log Analysis",
      scenario: "Anomali terdeteksi setelah 8 bulan via DNS logs (DGA), Proxy logs, Windows logs, Firewall logs.",
      questions: [
        "Kontribusi tiap log?",
        "Apa itu DGA?",
        "Buat correlation rules.",
        "Strategi log management."
      ]
    },
    quiz: [
      { id: 1, question: "5 jenis security data?", answer: "Alert, Session, Transaction, Statistical, Metadata", type: "essay" },
      { id: 2, question: "Dampak enkripsi pada monitoring?", answer: "Kurangi visibility; Solusi SSL inspection", type: "essay" },
      { id: 3, question: "Full Packet Capture vs Flow Data?", answer: "PCAP simpan payload (berat); Flow simpan metadata (ringan)", type: "essay" },
      { id: 4, question: "Fungsi SIEM?", answer: "Aggregasi, normalisasi, korelasi, alerting", type: "essay" },
      { id: 5, question: "Event ID 4625?", answer: "Failed logon attempt", type: "essay" }
    ],
    videoResources: [
      { title: "SIEM Explained - What is SIEM?", youtubeId: "2XLzMb9oZBI", description: "Penjelasan konsep SIEM dan cara kerjanya.", language: "en", duration: "11:20" },
      { title: "Snort IDS Tutorial", youtubeId: "8T9YPHG1ByQ", description: "Tutorial menulis rules Snort untuk intrusion detection.", language: "en", duration: "20:15" },
      { title: "Log Analysis for Security", youtubeId: "LWFz05NAMIN", description: "Teknik analisis log untuk menemukan ancaman keamanan.", language: "en", duration: "18:40" }
    ]
  },
  {
    id: 14,
    title: "Alert Evaluation",
    description: "Evaluasi Alert dan Working with Network Security Data",
    iconName: "FileCode",
    theory: [
      { title: "Alert Classification", content: "True Positive (Serangan nyata, terdeteksi), False Positive (Bukan serangan, terdeteksi - 'Alarm Palsu'), True Negative (Aman, tidak terdeteksi), False Negative (Serangan nyata, tidak terdeteksi - Berbahaya)." },
      { title: "Alert Triage", content: "Proses memilah alert. Langkah: Validasi (apakah ini serangan?), Klasifikasi (jenis serangan?), Prioritisasi (seberapa kritis?), Eskalasi (perlu Tier 2?). Tujuannya memfilter noise dan fokus pada ancaman nyata." },
      { title: "Incident Response Lifecycle", content: "Preparation (Persiapan), Detection & Analysis (Deteksi), Containment (Isolasi), Eradication (Pembersihan), Recovery (Pemulihan), Post-Incident Activity (Lessons Learned)." }
    ],
    lab: {
      title: "Lab 14: Alert Evaluation dan Incident Investigation",
      downloads: [],
      steps: [
        {
          title: "Alert Triage - Initial Assessment",
          description: "Buka Security Onion atau SIEM dashboard. Review alert queue dan lakukan initial triage berdasarkan severity.",
          hint: "Prioritaskan: Critical > High > Medium > Low. Perhatikan juga jumlah alerts dari source yang sama."
        },
        {
          title: "Alert Validation",
          description: "Untuk setiap alert, validasi apakah ini True Positive atau False Positive. Periksa source IP, destination, payload.",
          command: "sudo grep -A5 'Priority: 1' /var/log/snort/alert 2>/dev/null || echo 'Check Security Onion Alerts dashboard'",
          expectedOutput: "Detail alert dengan source, destination, dan rule yang trigger",
          screenshotNote: "Screenshot alert detail dari Security Onion/Snort showing full alert context."
        },
        {
          title: "Source Investigation",
          description: "Investigasi source IP dari alert. Cek reputasi dan geolocation.",
          command: "whois [Source_IP] | grep -E 'OrgName|Country|NetRange' && echo '---' && curl -s 'https://ipapi.co/[Source_IP]/json/' 2>/dev/null | python3 -m json.tool",
          expectedOutput: "Informasi organisasi, negara, dan geolocation dari source IP"
        },
        {
          title: "Payload Analysis",
          description: "Analisis payload dari alert untuk memahami jenis serangan.",
          command: "sudo tcpdump -r /path/to/capture.pcap -A 'host [Source_IP]' 2>/dev/null | head -50",
          expectedOutput: "Payload yang menunjukkan pola serangan (SQL injection, XSS, dll.)",
          hint: "Cari patterns: 'UNION SELECT' (SQLi), '<script>' (XSS), '../../../' (Path Traversal)."
        },
        {
          title: "Related Events Correlation",
          description: "Cari events lain yang terkait dengan alert ini dari source atau target yang sama.",
          command: "sudo grep '[Source_IP]' /var/log/snort/alert 2>/dev/null | wc -l && sudo grep '[Target_IP]' /var/log/auth.log 2>/dev/null | tail -5",
          expectedOutput: "Jumlah alerts dan related authentication events"
        },
        {
          title: "Timeline Construction",
          description: "Bangun timeline kronologis dari semua events yang terkait dengan insiden.",
          hint: "Gunakan format: [Timestamp] [Source] [Event Type] [Details]. Urutkan berdasarkan waktu untuk melihat progression serangan."
        },
        {
          title: "Classification & Severity Assignment",
          description: "Klasifikasikan insiden berdasarkan tipe dan assign severity level.",
          hint: "Tipe: Malware, Unauthorized Access, DoS, Data Exfiltration, Reconnaissance. Severity: Critical (data breach), High (active intrusion), Medium (attempted attack), Low (reconnaissance)."
        },
        {
          title: "Incident Report Writing",
          description: "Tulis incident report berdasarkan investigasi. Gunakan template standar.",
          command: "cat << 'TEMPLATE'\n=== INCIDENT REPORT ===\n1. Executive Summary: [Brief description]\n2. Timeline: [Chronological events]\n3. Technical Analysis: [Detailed findings]\n4. Impact Assessment: [What was affected]\n5. Containment Actions: [What was done]\n6. Indicators of Compromise:\n   - IP Addresses: [list]\n   - Domains: [list]\n   - File Hashes: [list]\n7. Recommendations: [Future prevention]\n8. Lessons Learned: [What to improve]\nTEMPLATE",
          expectedOutput: "Template incident report yang harus diisi berdasarkan investigasi"
        }
      ],
      deliverable: "Laporan lab berisi hasil triage, analisis alert, timeline insiden, dan incident report lengkap."
    },
    caseStudy: {
      title: "SOC Analyst Day - Multi-Incident Scenario",
      scenario: "Tier 1 Analyst hadapi SQL Injection, Brute Force SSH, Trojan, C2 connection, Phishing dalam 2 jam.",
      questions: [
        "Prioritaskan 5 alert.",
        "Hipotesis alert terkait.",
        "Tulis playbook.",
        "Draft incident report."
      ]
    },
    quiz: [
      { id: 1, question: "TP vs FP?", answer: "TP: Alert benar ada serangan; FP: Alert tapi tidak ada serangan", type: "essay" },
      { id: 2, question: "Langkah alert triage?", answer: "Receive, Verify, Classify, Prioritize, Escalate", type: "essay" },
      { id: 3, question: "Mengatasi alert fatigue?", answer: "Tuning, Automation, Reduce FP", type: "essay" },
      { id: 4, question: "6 fase IR Lifecycle?", answer: "Preparation, Detection, Containment, Eradication, Recovery, Lessons Learned", type: "essay" },
      { id: 5, question: "Isi security incident report?", answer: "Summary, Timeline, Analysis, Impact, Remediation, IoC", type: "essay" }
    ],
    videoResources: [
      { title: "SOC Analyst Alert Triage Process", youtubeId: "tLaq8OaBaoQ", description: "Proses triage alert dari perspektif SOC analyst.", language: "en", duration: "19:30" },
      { title: "Incident Response Steps", youtubeId: "Fmy0mIR5Ggs", description: "Langkah-langkah incident response dari preparation hingga lessons learned.", language: "en", duration: "14:15" },
      { title: "How to Write an Incident Report", youtubeId: "Y5v8FGH2OPg", description: "Panduan menulis incident report yang efektif.", language: "en", duration: "12:50" }
    ]
  },
  {
    id: 15,
    title: "Formatif (Quiz)",
    description: "Evaluasi Pembelajaran Pertemuan 9-14",
    iconName: "FileText",
    theory: [
      { title: "Review Materi", content: "Mencakup Traffic Monitoring, Defense-in-Depth, Access Control, Threat Intel, Endpoint Security, dan Alert Evaluation." }
    ],
    lab: {
      title: "Review Lab Skills",
      downloads: [],
      steps: [
        { title: "Review", description: "Review analisis log, penggunaan SIEM, dan vulnerability assessment." }
      ],
      deliverable: "Hasil quiz formatif"
    },
    caseStudy: {
      title: "Comprehensive Review",
      scenario: "Review seluruh studi kasus dari pertemuan 9-14 untuk persiapan ujian.",
      questions: [
        "Bagaimana mengintegrasikan berbagai tool keamanan untuk pertahanan menyeluruh?",
        "Jelaskan siklus hidup penanganan insiden."
      ]
    },
    quiz: [],
    videoResources: []
  },
  {
    id: 16,
    title: "Ujian Akhir Semester (UAS)",
    description: "Evaluasi Akhir Semester",
    iconName: "Award",
    theory: [
      { title: "Materi Ujian", content: "Seluruh materi semester, dengan fokus pada pertemuan 9-14." }
    ],
    lab: {
      title: "Ujian Praktik Akhir",
      downloads: [],
      steps: [{ title: "Exam", description: "Mengerjakan soal praktik komprehensif." }],
      deliverable: "Jawaban Ujian"
    },
    caseStudy: {
      title: "Ujian Analisis Kasus Akhir",
      scenario: "Sesuai soal ujian.",
      questions: ["Sesuai soal ujian."]
    },
    quiz: [],
    videoResources: []
  }
];
