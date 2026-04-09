import type { ModuleData } from '../module-types';

export const module07: ModuleData = {
  id: 7,
  title: "Formatif (Quiz)",
  description: "Evaluasi Pembelajaran Pertemuan 1-6",
  iconName: "FileText",
  theory: [
    {
      title: "Review Materi Pertemuan 1-6",
      content: "Formatif ini mencakup semua materi dari pertemuan 1 hingga 6. Pastikan Anda telah memahami: CIA Triad, SOC tiers, Cyber Kill Chain, MITRE ATT&CK, Windows & Linux Security, OSI/TCP-IP model, ICMP/ARP, Transport Layer, Network Services, dan Network Threats.",
      keyPoints: [
        "Pertemuan 1: CIA Triad, SOC, Kill Chain, MITRE ATT&CK",
        "Pertemuan 2: Windows Architecture, Event Logs (ID 4624/4625/4672), PowerShell",
        "Pertemuan 3: Linux permissions, OSI 7 layer, TCP/IP 4 layer, IP addressing",
        "Pertemuan 4: ICMP types, Ping/Traceroute, ARP process, ARP Spoofing & DAI",
        "Pertemuan 5: TCP 3-way handshake, UDP, DHCP DORA, DNS, NAT, HTTP/HTTPS",
        "Pertemuan 6: Network topologies, Firewall/IDS/IPS, Threat actors, Malware types, DoS/DDoS"
      ]
    }
  ],
  lab: {
    title: "Review Lab Skills Pertemuan 1-6",
    downloads: [],
    steps: [
      {
        title: "Review Tools",
        description: "Pastikan Anda familiar dengan: Wireshark (filtering, packet analysis), Nmap (host discovery, port scan), Linux CLI (grep, find, chmod), Windows CMD/PowerShell (netstat, tasklist, Get-WinEvent).",
        hint: "Coba kembali lab sebelumnya dan pastikan Anda bisa menjalankan setiap perintah tanpa melihat catatan."
      }
    ],
    deliverable: "Hasil Quiz Formatif Pertemuan 1-6"
  },
  caseStudy: {
    title: "Comprehensive Review: Insiden Multi-Layer",
    scenario: "Review seluruh studi kasus dari pertemuan 1-6 untuk persiapan evaluasi formatif.",
    questions: [
      "Jelaskan bagaimana CIA Triad terkait dengan berbagai jenis serangan yang telah dipelajari (ransomware, MITM, DoS). Berikan contoh spesifik untuk setiap aspek (C, I, A).",
      "Bagaimana seorang SOC Analyst menggunakan pengetahuan tentang OSI Layer, Event Logs, dan Network Traffic untuk mendeteksi dan merespons serangan ARP Spoofing?"
    ]
  },
  caseStudyPool: [],
  quiz: [
    {
      id: 1,
      question: "Layer OSI mana yang bertanggung jawab untuk enkripsi dan format data?",
      answer: "Presentation Layer (Layer 6)",
      type: "multiple-choice",
      options: ["Transport Layer (Layer 4)", "Session Layer (Layer 5)", "Presentation Layer (Layer 6)", "Application Layer (Layer 7)"]
    },
    {
      id: 2,
      question: "Protokol mana yang bersifat connection-oriented dan reliable?",
      answer: "TCP",
      type: "multiple-choice",
      options: ["UDP", "ICMP", "TCP", "ARP"]
    },
    {
      id: 3,
      question: "Event ID 4625 di Windows menandakan apa?",
      answer: "Failed Logon Attempt",
      type: "multiple-choice",
      options: ["Successful Logon", "Account Locked Out", "Failed Logon Attempt", "Special Privileges Assigned"]
    },
    {
      id: 4,
      question: "Apa kepanjangan dari DORA dalam konteks DHCP?",
      answer: "Discover, Offer, Request, Acknowledge",
      type: "multiple-choice",
      options: [
        "Detect, Offer, Relay, Assign",
        "Discover, Offer, Request, Acknowledge",
        "Distribute, Open, Route, Assign",
        "Detect, Operate, Register, Authenticate"
      ]
    },
    {
      id: 5,
      question: "Apa mitigasi utama untuk serangan ARP Spoofing pada switch enterprise?",
      answer: "Dynamic ARP Inspection (DAI)",
      type: "multiple-choice",
      options: [
        "Port Security",
        "Dynamic ARP Inspection (DAI)",
        "VLAN Segmentation",
        "MAC Address Filtering"
      ]
    },
    {
      id: 6,
      question: "Jelaskan perbedaan antara IDS dan IPS beserta contoh produk masing-masing!",
      answer: "IDS (Intrusion Detection System) hanya mendeteksi dan memberi alert tanpa memblokir (contoh: Snort dalam mode alert, Suricata IDS mode). IPS (Intrusion Prevention System) mendeteksi dan secara aktif memblokir traffic berbahaya secara inline (contoh: Snort inline mode, Cisco NGIPS). IPS dipasang secara inline di jalur traffic, sementara IDS biasanya dipasang di port mirror/SPAN.",
      type: "essay"
    },
    {
      id: 7,
      question: "Sebutkan dan jelaskan 7 tahap Cyber Kill Chain!",
      answer: "1. Reconnaissance: Pengumpulan informasi target. 2. Weaponization: Membuat payload/exploit. 3. Delivery: Pengiriman ke target (email, USB, web). 4. Exploitation: Eksekusi exploit di sistem target. 5. Installation: Instalasi malware/backdoor. 6. Command & Control (C2): Membangun komunikasi dengan attacker. 7. Actions on Objectives: Mencapai tujuan (data theft, destruction, etc.).",
      type: "essay"
    }
  ],
  videoResources: []
};
