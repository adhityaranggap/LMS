import type { ModuleData } from '../module-types';

export const module08: ModuleData = {
  id: 8,
  title: "Ujian Tengah Semester (UTS)",
  description: "Evaluasi Tengah Semester",
  iconName: "Award",
  theory: [
    {
      title: "Materi Ujian Tengah Semester",
      content: "UTS mencakup seluruh materi dari Pertemuan 1 sampai 6. Bersiaplah untuk menjawab soal-soal tentang konsep keamanan informasi dasar, sistem operasi, protokol jaringan, dan ancaman siber.",
      keyPoints: [
        "Pastikan memahami konsep CIA Triad dan penerapannya",
        "Hafalkan Event ID Windows yang penting (4624, 4625, 4672)",
        "Pahami proses TCP 3-way handshake dan DHCP DORA",
        "Kuasai konsep ARP spoofing dan mitigasinya",
        "Pahami perbedaan jenis-jenis malware",
        "Ketahui cara kerja Cyber Kill Chain dan MITRE ATT&CK"
      ]
    }
  ],
  lab: {
    title: "Ujian Praktik Tengah Semester",
    downloads: [],
    steps: [
      { title: "Persiapan Ujian", description: "Ikuti instruksi pengawas. Pastikan laptop dan tools yang diperlukan siap. Tidak diperbolehkan membuka materi selama ujian kecuali diizinkan pengawas." }
    ],
    deliverable: "Jawaban Ujian Tengah Semester"
  },
  caseStudy: {
    title: "Ujian Analisis Kasus",
    scenario: "Sesuai soal ujian yang diberikan oleh dosen.",
    questions: ["Sesuai soal ujian."]
  },
  caseStudyPool: [],
  quiz: [],
  videoResources: []
};
