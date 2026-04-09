import type { ModuleData } from '../module-types';

export const module16: ModuleData = {
  id: 16,
  title: "Ujian Akhir Semester (UAS)",
  description: "Evaluasi Akhir Semester",
  iconName: "Award",
  theory: [
    {
      title: "Materi Ujian Akhir Semester",
      content: "UAS mencakup seluruh materi semester dengan penekanan pada pertemuan 9-14. Bersiaplah untuk soal integratif yang menggabungkan konsep dari berbagai pertemuan.",
      keyPoints: [
        "Integrasi konsep: bagaimana CIA Triad terhubung dengan CVSS scoring",
        "Kuasai proses incident response end-to-end dari detection hingga lessons learned",
        "Pahami pipeline: Traffic capture → Log analysis → SIEM correlation → Alert triage → IR",
        "Ketahui hubungan antara Threat Intelligence dan penguatan pertahanan",
        "Pahami CVSS metric groups: Base, Temporal, Environmental",
        "Kuasai format Snort rule dan cara membaca log forensik"
      ]
    }
  ],
  lab: {
    title: "Ujian Praktik Akhir Semester",
    downloads: [],
    steps: [
      { title: "Persiapan Ujian", description: "Ikuti instruksi pengawas. Ujian praktik komprehensif mencakup materi seluruh semester." }
    ],
    deliverable: "Jawaban Ujian Akhir Semester"
  },
  caseStudy: {
    title: "Ujian Analisis Kasus Komprehensif",
    scenario: "Sesuai soal ujian yang diberikan oleh dosen.",
    questions: ["Sesuai soal ujian."]
  },
  caseStudyPool: [],
  quiz: [],
  videoResources: []
};
