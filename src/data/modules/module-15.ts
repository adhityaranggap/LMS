import type { ModuleData } from '../module-types';

export const module15: ModuleData = {
  id: 15,
  title: "Formatif (Quiz)",
  description: "Evaluasi Pembelajaran Pertemuan 9-14",
  iconName: "FileText",
  theory: [
    {
      title: "Review Materi Pertemuan 9-14",
      content: "Formatif ini mencakup semua materi dari pertemuan 9 hingga 14. Pastikan Anda memahami: Traffic Monitoring, TCP/IP Vulnerabilities, Defense-in-Depth, Access Control, Threat Intelligence, Cryptography, Endpoint Protection, CVSS, Security Data, SIEM, Log Analysis, Alert Evaluation, dan Incident Response.",
      keyPoints: [
        "Pertemuan 9: Passive/Active monitoring, IP/TCP/UDP vulnerabilities, SYN flood, DNS amplification",
        "Pertemuan 10: Defense-in-Depth layers, DAC/MAC/RBAC/ABAC, AAA (RADIUS/TACACS+), Zero Trust",
        "Pertemuan 11: Threat Intel sources, IoC types, Hashing (MD5/SHA), PKI, Digital signatures",
        "Pertemuan 12: Antimalware detection methods, HIPS, CVSS scoring, Vulnerability Assessment vs Pentest",
        "Pertemuan 13: Security data types, Syslog, SIEM components, Snort rule syntax",
        "Pertemuan 14: TP/FP/TN/FN, Alert triage process, Incident Response lifecycle (NIST 6 phases)"
      ]
    }
  ],
  lab: {
    title: "Review Lab Skills Pertemuan 9-14",
    downloads: [],
    steps: [
      {
        title: "Review Tools dan Konsep",
        description: "Pastikan Anda familiar dengan: tshark/Wireshark filters untuk anomali traffic, auditctl/ausearch untuk Linux audit, GPG encryption, SSL certificate analysis, Snort rule writing, log correlation techniques, dan incident report format.",
        hint: "Fokus pada pemahaman konseptual: bisa jelaskan KAPAN dan MENGAPA menggunakan setiap tool."
      }
    ],
    deliverable: "Hasil Quiz Formatif Pertemuan 9-14"
  },
  caseStudy: {
    title: "Comprehensive Review: Siklus Hidup Insiden Lengkap",
    scenario: "Review seluruh studi kasus dari pertemuan 9-14 untuk persiapan evaluasi formatif.",
    questions: [
      "Bagaimana mengintegrasikan berbagai tool keamanan (Wireshark, SIEM, IDS, Endpoint Security) untuk membentuk pertahanan berlapis yang efektif? Jelaskan dengan contoh skenario serangan nyata.",
      "Jelaskan siklus hidup penanganan insiden (NIST IR Lifecycle) lengkap dengan langkah konkret yang diambil SOC analyst pada setiap fase."
    ]
  },
  caseStudyPool: [],
  quiz: [],
  videoResources: []
};
