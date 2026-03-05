import type { ModuleData } from './syllabus-data';

export const cryptoSyllabusData: ModuleData[] = [
  {
    id: 101,
    title: 'Pengantar Kriptografi',
    description: 'Sejarah, tujuan, dan konsep dasar kriptografi modern',
    iconName: 'Key',
    theory: [
      {
        title: 'Definisi dan Tujuan Kriptografi',
        content:
          'Kriptografi adalah ilmu dan seni menyembunyikan informasi agar hanya pihak yang berwenang yang dapat membacanya. Tujuan utama kriptografi meliputi empat prinsip: Confidentiality (kerahasiaan) — data hanya dapat dibaca oleh pihak yang berhak; Integrity (integritas) — data tidak dapat diubah tanpa terdeteksi; Authentication (autentikasi) — membuktikan identitas pengirim; dan Non-repudiation (anti-penyangkalan) — pengirim tidak dapat menyangkal telah mengirim pesan.',
        keyPoints: [
          'Confidentiality — hanya pihak berwenang yang dapat membaca data (contoh: enkripsi pesan)',
          'Integrity — data tidak dapat diubah tanpa terdeteksi (contoh: MAC / hash)',
          'Authentication — membuktikan identitas pengirim (contoh: digital signature)',
          'Non-repudiation — pengirim tidak dapat menyangkal telah mengirim pesan',
        ],
        table: {
          caption: 'Layanan Keamanan vs Mekanisme Kriptografi',
          headers: ['Layanan', 'Mekanisme', 'Contoh Algoritma'],
          rows: [
            ['Confidentiality', 'Enkripsi simetris / asimetris', 'AES, RSA'],
            ['Integrity', 'Hash + MAC', 'SHA-256, HMAC'],
            ['Authentication', 'Digital signature / sertifikat', 'RSA-SHA256, ECDSA'],
            ['Non-repudiation', 'Digital signature dengan PKI', 'RSA + X.509'],
          ],
        },
      },
      {
        title: 'Terminologi Dasar',
        content:
          'Plaintext adalah pesan asli yang belum terenkripsi. Ciphertext adalah pesan yang sudah dienkripsi. Enkripsi (Encryption) adalah proses mengubah plaintext menjadi ciphertext menggunakan kunci. Dekripsi (Decryption) adalah proses sebaliknya. Kunci (Key) adalah nilai rahasia yang mengendalikan proses enkripsi dan dekripsi. Cipher adalah algoritma atau metode enkripsi yang digunakan.',
        example: {
          title: 'Alur Enkripsi — Dekripsi',
          steps: [
            'Pengirim punya: Plaintext P = "RAHASIA"',
            'Enkripsi: C = Enc(K, P)  →  menggunakan kunci K',
            'Kirim ciphertext C melalui kanal tidak aman',
            'Penerima: P = Dec(K, C)  →  menggunakan kunci K yang sama (simetris)',
            'Penerima mendapat kembali Plaintext P = "RAHASIA"',
          ],
          result: 'Kunci K harus tetap rahasia — keamanan bergantung pada K, bukan algoritma',
        },
      },
      {
        title: 'Jenis Kriptografi',
        content:
          'Kriptografi Simetris menggunakan kunci yang sama untuk enkripsi dan dekripsi. Contohnya adalah AES, DES, dan 3DES. Keunggulannya adalah kecepatan; kelemahannya adalah distribusi kunci yang aman. Kriptografi Asimetris menggunakan sepasang kunci: kunci publik untuk enkripsi dan kunci privat untuk dekripsi. Contohnya RSA dan ECC. Kriptografi Hash menghasilkan ringkasan tetap (digest) dari data sembarang panjang, seperti MD5, SHA-1, dan SHA-256.',
        table: {
          headers: ['Jenis', 'Susunan Kunci', 'Kecepatan', 'Distribusi Kunci', 'Contoh'],
          rows: [
            ['Simetris', 'Satu kunci (enc = dec)', 'Cepat', 'Sulit (butuh kanal aman)', 'AES, DES, 3DES'],
            ['Asimetris', 'Kunci publik + privat', 'Lambat (10–1000×)', 'Mudah (publik bebas dibagi)', 'RSA, ECC, DH'],
            ['Hash', 'Tidak ada kunci', 'Sangat cepat', 'N/A (satu arah)', 'SHA-256, MD5, SHA-3'],
          ],
        },
      },
      {
        title: 'Sejarah Kriptografi',
        content:
          'Sejarah kriptografi dimulai ribuan tahun lalu. Sandi Scytale digunakan Sparta (abad ke-7 SM) untuk menggulung pita papirus. Sandi Caesar (abad ke-1 SM) menggeser alfabet sebanyak tiga posisi. Enigma Machine (Perang Dunia II) adalah mesin elektro-mekanik yang sangat kompleks. Era modern dimulai dengan publikasi DES (1977) dan RSA (1978), serta AES yang menjadi standar NIST tahun 2001.',
        table: {
          caption: 'Tonggak Sejarah Kriptografi',
          headers: ['Era', 'Nama', 'Tahun', 'Teknik', 'Status Keamanan'],
          rows: [
            ['Kuno', 'Scytale', '700 SM', 'Transposisi (gulungan pita)', 'Tidak aman'],
            ['Kuno', 'Caesar Cipher', '100 SM', 'Substitusi monoalfabetik, k=3', 'Tidak aman (25 kunci)'],
            ['Abad Pertengahan', 'Vigenère', '1553 M', 'Substitusi polialfabetik', 'Tidak aman (Kasiski)'],
            ['Perang Dunia II', 'Enigma', '1920–1945', 'Rotor elektro-mekanik', 'Dipecahkan Bletchley Park'],
            ['Modern', 'DES', '1977', 'Block cipher 56-bit', 'Tidak aman (brute force)'],
            ['Modern', 'RSA', '1978', 'Kriptografi asimetris', 'Aman (≥2048 bit)'],
            ['Modern', 'AES', '2001', 'Block cipher 128/192/256-bit', 'Standar saat ini ✓'],
          ],
        },
      },
      {
        title: 'Prinsip Kerckhoffs',
        content:
          'Prinsip Kerckhoffs (1883) menyatakan bahwa keamanan sebuah sistem kriptografi harus sepenuhnya bergantung pada kerahasiaan kunci, bukan kerahasiaan algoritma. Artinya, algoritma harus aman meskipun diketahui publik — hanya kunci yang harus dirahasiakan. Prinsip ini menjadi fondasi keamanan modern: algoritma seperti AES dan RSA dipublikasikan secara terbuka dan telah diuji oleh komunitas global.',
        note: 'Prinsip Kerckhoffs: "Sistem kriptografi harus aman meskipun semua detail sistem kecuali kunci diketahui publik." — Jangan mengandalkan Security through Obscurity! Algoritma yang tidak dipublikasikan belum tentu aman — justru banyak kelemahan tersembunyi yang tidak terdeteksi.',
        noteType: 'warning',
      },
    ],
    lab: {
      title: 'Eksplorasi Kriptografi Dasar dengan Python',
      downloads: [],
      steps: [
        {
          title: 'Buka Terminal / Python REPL',
          description: 'Buka terminal atau Python REPL di komputer Anda. Pastikan Python 3 sudah terinstal.',
          command: 'python3 --version',
          expectedOutput: 'Python 3.x.x',
        },
        {
          title: 'Import Library Kriptografi',
          description: 'Import library bawaan Python untuk kriptografi dasar.',
          command: 'python3 -c "import hashlib; print(hashlib.algorithms_guaranteed)"',
          expectedOutput: "{'blake2b', 'blake2s', 'md5', 'sha1', 'sha256', ...}",
        },
        {
          title: 'Hitung Hash SHA-256',
          description: 'Gunakan SHA-256 untuk menghash sebuah string dan amati outputnya.',
          command: "python3 -c \"import hashlib; print(hashlib.sha256('Bina Insani'.encode()).hexdigest())\"",
          expectedOutput: 'String hex 64 karakter (256 bit)',
          hint: 'SHA-256 selalu menghasilkan output 64 karakter hex, terlepas dari panjang input.',
        },
        {
          title: 'Uji Properti Avalanche Effect',
          description:
            'Ubah satu karakter pada input dan bandingkan hashnya. Perubahan kecil harus menghasilkan hash yang sangat berbeda.',
          command:
            "python3 -c \"import hashlib; a=hashlib.sha256('Bina Insani'.encode()).hexdigest(); b=hashlib.sha256('bina Insani'.encode()).hexdigest(); print(a); print(b)\"",
          screenshotNote: 'Screenshot kedua hash dan tunjukkan bahwa keduanya sangat berbeda meski input hanya beda satu karakter.',
        },
        {
          title: 'Hitung MD5 dan Bandingkan Panjang',
          description: 'MD5 menghasilkan hash 128 bit (32 karakter hex). Bandingkan dengan SHA-256.',
          command: "python3 -c \"import hashlib; print(len(hashlib.md5(b'test').hexdigest()), 'karakter MD5')\"",
          expectedOutput: '32 karakter MD5',
        },
        {
          title: 'Buat Kunci Acak (Random Key)',
          description: 'Gunakan modul secrets untuk menghasilkan kunci acak yang aman secara kriptografis.',
          command: "python3 -c \"import secrets; print(secrets.token_hex(32))\"",
          expectedOutput: 'String hex 64 karakter (kunci 256 bit)',
          hint: 'secrets.token_hex(n) menghasilkan n byte acak yang aman secara kriptografis.',
        },
        {
          title: 'Enkripsi Sederhana dengan XOR',
          description: 'Implementasikan enkripsi XOR sederhana untuk memahami konsep stream cipher.',
          command:
            "python3 -c \"msg=b'Hello'; key=b'\\xAB'; enc=bytes(a^b for a,b in zip(msg,key*len(msg))); print(enc.hex()); dec=bytes(a^b for a,b in zip(enc,key*len(enc))); print(dec)\"",
          expectedOutput: 'Ciphertext hex, kemudian b\'Hello\'',
        },
        {
          title: 'Buat Laporan Pengamatan',
          description:
            'Dokumentasikan setiap percobaan: input, output, dan kesimpulan Anda tentang sifat fungsi hash dan enkripsi.',
          screenshotNote: 'Screenshot semua output dari langkah 2–7.',
        },
      ],
      deliverable:
        'Laporan lab berisi screenshot setiap langkah, penjelasan tentang Avalanche Effect yang Anda amati, dan perbandingan MD5 vs SHA-256 dari sisi keamanan.',
    },
    caseStudy: {
      title: 'Kasus: Kebocoran Data Akibat Enkripsi yang Lemah',
      scenario:
        'Sebuah perusahaan fintech menyimpan PIN nasabah menggunakan MD5 tanpa salt. Ketika database bocor, penyerang berhasil memecahkan 80% PIN hanya dalam 2 jam menggunakan rainbow table. Perusahaan mengklaim bahwa data "terenkripsi" sehingga aman. Regulator kemudian mendenda perusahaan tersebut karena tidak menggunakan standar keamanan yang memadai.',
      questions: [
        'Mengapa penggunaan MD5 tanpa salt untuk menyimpan PIN dianggap tidak aman? Jelaskan konsep rainbow table dalam konteks ini.',
        'Apa perbedaan antara enkripsi dan hashing? Mengapa perusahaan salah menyebut MD5 sebagai "enkripsi"?',
        'Standar keamanan apa yang seharusnya digunakan untuk menyimpan password/PIN? Jelaskan minimal dua alternatif yang lebih aman.',
        'Selain masalah teknis, apa tanggung jawab etis dan hukum perusahaan dalam kasus ini? Kaitkan dengan prinsip Integrity dan Confidentiality.',
      ],
    },
    quiz: [
      {
        id: 10101,
        type: 'essay',
        question:
          'Jelaskan empat tujuan utama kriptografi (CIA + Non-repudiation) dan berikan contoh nyata penggunaan masing-masing dalam aplikasi perbankan digital.',
        answer:
          'Confidentiality: enkripsi data transaksi sehingga hanya nasabah dan bank yang bisa membaca. Integrity: HMAC/digital signature memastikan nominal transfer tidak diubah. Authentication: OTP/digital certificate membuktikan identitas pengguna. Non-repudiation: digital signature mencegah nasabah menyangkal telah menyetujui transaksi.',
      },
      {
        id: 10102,
        type: 'essay',
        question:
          'Apa yang dimaksud dengan Prinsip Kerckhoffs? Mengapa prinsip ini penting dalam desain sistem kriptografi modern? Berikan contoh nyata.',
        answer:
          'Prinsip Kerckhoffs menyatakan keamanan sistem harus bergantung pada kerahasiaan kunci, bukan algoritma. Contoh: algoritma AES dipublikasikan terbuka, tetapi aman karena kunci 128/256 bit yang dirahasiakan. Ini memungkinkan audit publik terhadap algoritma.',
      },
    ],
    videoResources: [
      {
        title: 'Pengantar Kriptografi - Konsep Dasar',
        youtubeId: 'jhXCTbFnK8o',
        description: 'Penjelasan visual tentang dasar-dasar kriptografi modern',
        language: 'en',
      },
    ],
  },
  {
    id: 102,
    title: 'Sandi Klasik I: Caesar & Vigenère',
    description: 'Memahami dan mengimplementasikan sandi substitusi klasik',
    iconName: 'Lock',
    theory: [
      {
        title: 'Sandi Caesar (Caesar Cipher)',
        content:
          'Sandi Caesar adalah substitusi monoalfabetik yang menggeser setiap huruf plaintext sebanyak k posisi dalam alfabet. Formula enkripsi: E(x) = (x + k) mod 26, dan dekripsi: D(x) = (x − k) mod 26, di mana x adalah posisi huruf (A=0, B=1, ..., Z=25) dan k adalah kunci (shift). Contoh: dengan k=3, huruf A → D, B → E, dan "HELLO" → "KHOOR". Kelemahannya sangat fatal: hanya ada 25 kemungkinan kunci, sehingga mudah dipecahkan dengan brute force.',
        formula: 'E(x) = (x + k) mod 26     |     D(x) = (x − k) mod 26',
        formulaLabel: 'Formula Caesar Cipher (k = kunci shift, A=0 … Z=25)',
        example: {
          title: 'Contoh: Enkripsi "HELLO" dengan k = 3',
          steps: [
            'H = posisi 7  →  (7 + 3) mod 26 = 10  →  K',
            'E = posisi 4  →  (4 + 3) mod 26 =  7  →  H',
            'L = posisi 11 →  (11 + 3) mod 26 = 14  →  O',
            'L = posisi 11 →  (11 + 3) mod 26 = 14  →  O',
            'O = posisi 14 →  (14 + 3) mod 26 = 17  →  R',
          ],
          result: 'HELLO  →  KHOOR  (dengan k = 3)',
        },
      },
      {
        title: 'Analisis Frekuensi',
        content:
          'Analisis frekuensi adalah teknik kriptanalisis yang mengeksploitasi distribusi frekuensi huruf dalam suatu bahasa. Dalam bahasa Inggris, huruf E (12,7%), T (9,1%), A (8,2%), dan O (7,5%) paling sering muncul. Pada sandi monoalfabetik (termasuk Caesar), distribusi frekuensi ciphertext mencerminkan plaintext. Dengan mencocokkan frekuensi ciphertext dengan distribusi normal, analis dapat menemukan kunci. Teknik ini pertama kali dijelaskan oleh Al-Kindi (abad ke-9 M).',
        table: {
          caption: 'Frekuensi 10 Huruf Teratas dalam Bahasa Inggris',
          headers: ['Huruf', 'Frekuensi (%)', 'Huruf', 'Frekuensi (%)'],
          rows: [
            ['E', '12.70', 'N', '6.75'],
            ['T', '9.06', 'S', '6.33'],
            ['A', '8.17', 'H', '6.09'],
            ['O', '7.51', 'R', '5.99'],
            ['I', '6.97', 'D', '4.25'],
          ],
        },
        note: 'Pada sandi Caesar, jika huruf paling sering dalam ciphertext adalah "H", maka kemungkinan besar "H" merepresentasikan "E" → kunci k = H − E = 7 − 4 = 3.',
        noteType: 'info',
      },
      {
        title: 'Sandi Vigenère',
        content:
          'Sandi Vigenère adalah sandi polialfabetik yang menggunakan kata kunci untuk menentukan besar pergeseran setiap huruf. Formula enkripsi: Ci = (Pi + Ki) mod 26, di mana Pi adalah posisi huruf plaintext dan Ki adalah posisi huruf kunci yang berulang. Contoh: plaintext "ATTACKATDAWN", kunci "LEMON" (diulang menjadi "LEMONLEMONLE"), menghasilkan ciphertext "LXFOPVEFRNHR". Karena setiap posisi menggunakan pergeseran berbeda, analisis frekuensi sederhana tidak cukup untuk memecahkannya.',
        formula: 'Cᵢ = (Pᵢ + Kᵢ) mod 26     |     Pᵢ = (Cᵢ − Kᵢ + 26) mod 26',
        formulaLabel: 'Formula Vigenère (Kᵢ = posisi huruf kunci ke-i)',
        example: {
          title: 'Contoh: "ATTACK" dengan kunci "LEMON"',
          steps: [
            'A(0) + L(11) = 11 mod 26 = 11  →  L',
            'T(19) + E(4)  = 23 mod 26 = 23  →  X',
            'T(19) + M(12) = 31 mod 26 =  5  →  F',
            'A(0)  + O(14) = 14 mod 26 = 14  →  O',
            'C(2)  + N(13) = 15 mod 26 = 15  →  P',
            'K(10) + L(11) = 21 mod 26 = 21  →  V',
          ],
          result: 'ATTACK + LEMON  →  LXFOPV  (kunci berulang)',
        },
      },
      {
        title: 'Kriptanalisis Vigenère: Metode Kasiski',
        content:
          'Metode Kasiski (1863) dapat memecahkan sandi Vigenère dengan menemukan panjang kunci. Caranya: cari pengulangan string dalam ciphertext; jarak antara pengulangan adalah kelipatan panjang kunci. Setelah panjang kunci diketahui, setiap posisi diperlakukan sebagai sandi Caesar terpisah dan diserang dengan analisis frekuensi. Indeks Koinsiden (IC) digunakan untuk mengkonfirmasi panjang kunci: teks bahasa Inggris memiliki IC ≈ 0,065, sedangkan teks acak ≈ 0,038.',
        example: {
          title: 'Langkah Metode Kasiski',
          steps: [
            'Cari substring berulang dalam ciphertext (panjang ≥ 3)',
            'Hitung jarak antara pengulangan: mis. posisi 4 dan 22 → jarak = 18',
            'Faktor dari 18: 1, 2, 3, 6, 9, 18 → kandidat panjang kunci',
            'Hitung IC untuk setiap kandidat panjang kunci — IC ≈ 0.065 berarti match',
            'Panjang kunci = 6: bagi ciphertext ke 6 kolom, serang tiap kolom sebagai Caesar',
            'Temukan shift tiap kolom → susun kunci → dekripsi seluruh teks',
          ],
          result: 'Hasil: Vigenère dapat dipecahkan secara sistematis jika panjang kunci diketahui',
        },
      },
      {
        title: 'Perbandingan Monoalfabetik vs Polialfabetik',
        content:
          'Sandi monoalfabetik menggunakan satu-satu pemetaan huruf (satu huruf plaintext selalu → satu huruf ciphertext yang sama). Ini membuatnya rentan terhadap analisis frekuensi. Sandi polialfabetik menggunakan beberapa pemetaan berbeda tergantung posisi, sehingga satu huruf plaintext dapat menghasilkan huruf ciphertext yang berbeda. Meski Vigenère lebih kuat dari Caesar, keduanya dianggap tidak aman untuk penggunaan modern karena dapat dipecahkan dengan teknik matematis.',
        table: {
          headers: ['Properti', 'Monoalfabetik (Caesar)', 'Polialfabetik (Vigenère)'],
          rows: [
            ['Pemetaan huruf', 'Satu-satu (A selalu → D)', 'Berubah tiap posisi'],
            ['Rentan frekuensi', 'Ya (langsung)', 'Lebih sulit (Kasiski diperlukan)'],
            ['Ruang kunci', '25 kemungkinan', '26ⁿ (n = panjang kunci)'],
            ['Keamanan modern', 'Tidak aman', 'Tidak aman (Kasiski + IC)'],
            ['Dipecahkan sejak', '~800 M (Al-Kindi)', '1863 (Kasiski)'],
          ],
        },
      },
    ],
    lab: {
      title: 'Implementasi Caesar dan Vigenère dalam Python',
      downloads: [],
      steps: [
        {
          title: 'Implementasi Caesar Cipher',
          description: 'Tulis fungsi Python untuk Caesar Cipher.',
          command:
            "python3 -c \"\ndef caesar_enc(text, shift):\n    result = ''\n    for c in text.upper():\n        if c.isalpha():\n            result += chr((ord(c) - 65 + shift) % 26 + 65)\n        else:\n            result += c\n    return result\nprint(caesar_enc('HELLO WORLD', 3))\n\"",
          expectedOutput: 'KHOOR ZRUOG',
        },
        {
          title: 'Dekripsi Caesar Cipher',
          description: 'Dekripsi ciphertext hasil langkah 1.',
          command:
            "python3 -c \"\ndef caesar_dec(text, shift):\n    return ''.join(chr((ord(c)-65-shift)%26+65) if c.isalpha() else c for c in text.upper())\nprint(caesar_dec('KHOOR ZRUOG', 3))\n\"",
          expectedOutput: 'HELLO WORLD',
        },
        {
          title: 'Brute Force Caesar Cipher',
          description: 'Coba semua 25 kemungkinan kunci untuk memecahkan ciphertext.',
          command:
            "python3 -c \"\nciphertext='KHOOR ZRUOG'\nfor k in range(1,26):\n    dec=''.join(chr((ord(c)-65-k)%26+65) if c.isalpha() else c for c in ciphertext)\n    print(f'Key {k:2d}: {dec}')\n\"",
          expectedOutput: 'Salah satu baris menampilkan HELLO WORLD (key=3)',
          hint: 'Perhatikan bahwa pada shift 3 menghasilkan kata yang bermakna.',
        },
        {
          title: 'Analisis Frekuensi Huruf',
          description: 'Hitung frekuensi huruf dalam ciphertext Caesar.',
          command:
            "python3 -c \"\nfrom collections import Counter\ntext='KHOOR ZRUOG'\nfreq=Counter(c for c in text if c.isalpha())\nfor ch, cnt in sorted(freq.items(), key=lambda x: -x[1]):\n    print(f'{ch}: {cnt}')\n\"",
          screenshotNote: 'Screenshot distribusi frekuensi dan jelaskan bagaimana ini membantu menemukan kunci.',
        },
        {
          title: 'Implementasi Vigenère Cipher',
          description: 'Tulis fungsi enkripsi Vigenère.',
          command:
            "python3 -c \"\ndef vigenere_enc(text, key):\n    text=text.upper(); key=key.upper()\n    result=''; ki=0\n    for c in text:\n        if c.isalpha():\n            shift=ord(key[ki%len(key)])-65\n            result+=chr((ord(c)-65+shift)%26+65); ki+=1\n        else: result+=c\n    return result\nprint(vigenere_enc('ATTACKATDAWN','LEMON'))\n\"",
          expectedOutput: 'LXFOPVEFRNHR',
        },
        {
          title: 'Dekripsi Vigenère Cipher',
          description: 'Implementasikan dekripsi Vigenère dengan kunci yang sama.',
          command:
            "python3 -c \"\ndef vigenere_dec(cipher, key):\n    cipher=cipher.upper(); key=key.upper()\n    result=''; ki=0\n    for c in cipher:\n        if c.isalpha():\n            shift=ord(key[ki%len(key)])-65\n            result+=chr((ord(c)-65-shift)%26+65); ki+=1\n        else: result+=c\n    return result\nprint(vigenere_dec('LXFOPVEFRNHR','LEMON'))\n\"",
          expectedOutput: 'ATTACKATDAWN',
        },
        {
          title: 'Uji Keamanan: Coba Brute Force Vigenère',
          description: 'Coba brute force Vigenère dengan kunci 1-3 huruf dan amati sulitnya.',
          command:
            "python3 -c \"\nimport string\nciphertext='LXFOPVEFRNHR'\ncount=0\nfor k1 in string.ascii_uppercase:\n    count+=1\nprint(f'Kemungkinan kunci 1 huruf: {count}')\nprint(f'Kemungkinan kunci 2 huruf: {count**2}')\nprint(f'Kemungkinan kunci 3 huruf: {count**3}')\n\"",
          hint: 'Perhatikan bagaimana panjang kunci secara eksponensial meningkatkan ruang kunci.',
        },
        {
          title: 'Dokumentasikan Perbandingan',
          description: 'Buat tabel perbandingan Caesar vs Vigenère dari sisi keamanan dan implementasi.',
          screenshotNote: 'Screenshot semua output dan sertakan tabel perbandingan dalam laporan.',
        },
      ],
      deliverable:
        'Laporan berisi kode Python yang berfungsi, screenshot semua output, dan analisis perbandingan keamanan Caesar vs Vigenère termasuk mengapa Vigenère lebih tahan terhadap analisis frekuensi sederhana.',
    },
    caseStudy: {
      title: 'Kasus: Penggunaan Sandi Klasik dalam Sistem Modern',
      scenario:
        'Sebuah startup mengembangkan aplikasi pesan instan untuk internal perusahaan. Developer junior memilih menggunakan Vigenère cipher dengan kunci tetap "COMPANY" untuk mengenkripsi semua pesan karena dianggap "cukup aman dan mudah diimplementasikan". Setahun kemudian, mantan karyawan yang tidak puas berhasil membaca seluruh arsip komunikasi rahasia perusahaan.',
      questions: [
        'Bagaimana mantan karyawan tersebut kemungkinan berhasil memecahkan enkripsi? Jelaskan langkah-langkah teknis yang mungkin dilakukan.',
        'Apa kesalahan fundamental dalam keputusan desain keamanan yang dibuat developer tersebut? Sebutkan minimal tiga masalah.',
        'Algoritma enkripsi modern apa yang seharusnya digunakan untuk aplikasi pesan instan? Jelaskan alasannya.',
        'Selain pemilihan algoritma, faktor keamanan apa lagi yang perlu dipertimbangkan dalam sistem pesan terenkripsi?',
      ],
    },
    quiz: [
      {
        id: 10201,
        type: 'essay',
        question:
          'Jelaskan formula matematis enkripsi dan dekripsi Caesar Cipher. Kemudian buktikan dengan contoh: enkripsi "KRIPTOGRAFI" dengan kunci k=7.',
        answer:
          'E(x)=(x+k) mod 26, D(x)=(x-k) mod 26. KRIPTOGRAFI dengan k=7: K(10)+7=17=R, R(17)+7=24=Y, dst. Hasil: RYYPAHNYPM.',
      },
      {
        id: 10202,
        type: 'essay',
        question:
          'Mengapa Vigenère Cipher dianggap lebih aman dari Caesar Cipher? Jelaskan konsep polialfabetik dan bagaimana Metode Kasiski dapat memecahkannya.',
        answer:
          'Vigenère polialfabetik: satu huruf plaintext menghasilkan ciphertext berbeda tergantung posisi kunci, sehingga distribusi frekuensi tersembunyi. Kasiski: temukan pengulangan ciphertext, hitung GCD jarak pengulangan = panjang kunci, lalu serang setiap kolom sebagai Caesar terpisah.',
      },
    ],
    videoResources: [
      {
        title: 'Caesar & Vigenère Cipher Explained',
        youtubeId: 'JtbAhE3E2oQ',
        description: 'Penjelasan visual sandi Caesar dan Vigenère beserta kriptanalisisnya',
        language: 'en',
      },
    ],
  },
  {
    id: 103,
    title: 'Sandi Klasik II: Affine, Hill, dan OTP',
    description: 'Sandi matematika lanjutan dan konsep perfect secrecy',
    iconName: 'FileCode',
    theory: [
      {
        title: 'Affine Cipher',
        content:
          'Affine Cipher adalah generalisasi dari Caesar Cipher yang menggunakan formula linear: E(x) = (ax + b) mod 26. Parameter a harus coprime dengan 26 (gcd(a, 26) = 1), yaitu a ∈ {1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25}. Parameter b adalah pergeseran (0–25). Dekripsi: D(x) = a⁻¹(x − b) mod 26, di mana a⁻¹ adalah invers modular dari a. Contoh dengan a=5, b=8: E(0) = (5×0+8) mod 26 = 8 (A→I), E(1) = (5×1+8) mod 26 = 13 (B→N). Total kunci: 12 × 26 = 312 kemungkinan.',
        formula: 'E(x) = (ax + b) mod 26     |     D(x) = a⁻¹(x − b) mod 26',
        formulaLabel: 'Formula Affine Cipher — syarat: gcd(a, 26) = 1',
        keyPoints: [
          'a harus coprime dengan 26: a ∈ {1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25} — 12 nilai valid',
          'b bisa nilai 0–25 → total ruang kunci: 12 × 26 = 312 kemungkinan',
          'Jika gcd(a, 26) ≠ 1, enkripsi tidak bisa dibalik (tidak bijektif)',
          'Caesar adalah kasus khusus Affine dengan a = 1',
        ],
        example: {
          title: 'Contoh: Enkripsi "HELLO" dengan a=5, b=8',
          steps: [
            'H = x=7  →  (5×7 + 8) mod 26 = 43 mod 26 = 17  →  R',
            'E = x=4  →  (5×4 + 8) mod 26 = 28 mod 26 =  2  →  C',
            'L = x=11 →  (5×11 + 8) mod 26 = 63 mod 26 = 11  →  L',
            'L = x=11 →  (5×11 + 8) mod 26 = 63 mod 26 = 11  →  L',
            'O = x=14 →  (5×14 + 8) mod 26 = 78 mod 26 =  0  →  A',
          ],
          result: 'HELLO  →  RCLLA  (a=5, b=8)',
        },
        table: {
          caption: 'Semua nilai a valid dan invers modulinya mod 26',
          headers: ['a', 'a⁻¹ mod 26', 'Verifikasi a × a⁻¹ mod 26'],
          rows: [
            ['1', '1', '1 × 1 = 1 ✓'],
            ['3', '9', '3 × 9 = 27 ≡ 1 ✓'],
            ['5', '21', '5 × 21 = 105 ≡ 1 ✓'],
            ['7', '15', '7 × 15 = 105 ≡ 1 ✓'],
            ['9', '3', '9 × 3 = 27 ≡ 1 ✓'],
            ['11', '19', '11 × 19 = 209 ≡ 1 ✓'],
            ['15', '7', '15 × 7 = 105 ≡ 1 ✓'],
            ['17', '23', '17 × 23 = 391 ≡ 1 ✓'],
            ['19', '11', '19 × 11 = 209 ≡ 1 ✓'],
            ['21', '5', '21 × 5 = 105 ≡ 1 ✓'],
            ['23', '17', '23 × 17 = 391 ≡ 1 ✓'],
            ['25', '25', '25 × 25 = 625 ≡ 1 ✓'],
          ],
        },
      },
      {
        title: 'Invers Modular dan Extended Euclidean Algorithm',
        content:
          'Invers modular a⁻¹ mod 26 adalah nilai x sehingga a×x ≡ 1 (mod 26). Algoritma Extended Euclidean digunakan untuk menghitungnya. Contoh: invers 5 mod 26 = 21, karena 5×21 = 105 = 4×26 + 1. Tabel invers: 3⁻¹=9, 5⁻¹=21, 7⁻¹=15, 9⁻¹=3, 11⁻¹=19, 15⁻¹=7, 17⁻¹=23, 19⁻¹=11, 21⁻¹=5, 23⁻¹=17, 25⁻¹=25. Pemahaman ini penting untuk kriptografi modern karena RSA juga menggunakan aritmetika modular.',
        formula: 'a × a⁻¹ ≡ 1 (mod m)     →     cari x: a × x mod m = 1',
        formulaLabel: 'Definisi Invers Modular',
        example: {
          title: 'Menghitung 5⁻¹ mod 26 secara manual',
          steps: [
            'Cari x sehingga (5 × x) mod 26 = 1',
            'Coba x=1: 5×1=5, 5 mod 26 = 5 ≠ 1',
            'Coba x=5: 5×5=25, 25 mod 26 = 25 ≠ 1',
            'Coba x=21: 5×21=105, 105 = 4×26 + 1, 105 mod 26 = 1  ✓',
            'Extended Euclidean: gcd(5,26): 26=5×5+1 → 1=26−5×5 → x=−5≡21 (mod 26)',
          ],
          result: '5⁻¹ mod 26 = 21  (verifikasi: 5 × 21 = 105 = 4 × 26 + 1 ✓)',
        },
        codeSnippet: `def mod_inverse(a: int, m: int) -> int | None:
    """Extended Euclidean Algorithm untuk invers modular."""
    def egcd(a, b):
        if a == 0:
            return b, 0, 1
        g, x, y = egcd(b % a, a)
        return g, y - (b // a) * x, x

    g, x, _ = egcd(a % m, m)
    if g != 1:
        return None  # invers tidak ada (gcd ≠ 1)
    return x % m

# Contoh penggunaan
print(mod_inverse(5, 26))   # → 21
print(mod_inverse(17, 26))  # → 23`,
        note: 'Jika gcd(a, m) ≠ 1, invers modular tidak ada. Ini mengapa hanya 12 nilai a yang valid untuk Affine Cipher mod 26.',
        noteType: 'warning',
      },
      {
        title: 'Hill Cipher',
        content:
          'Hill Cipher menggunakan aljabar matriks untuk mengenkripsi blok huruf. Untuk blok ukuran n, kunci adalah matriks n×n yang invertible mod 26. Enkripsi: C = KP mod 26, dekripsi: P = K⁻¹C mod 26, di mana K adalah matriks kunci dan P adalah vektor plaintext. Contoh dengan matriks 2×2 [[6,24],[1,13]] dan plaintext "ACT": vektor [0,2,19], diproses dua per dua. Hill Cipher tahan terhadap analisis frekuensi karena mengenkripsi beberapa huruf sekaligus, tetapi rentan terhadap known-plaintext attack.',
        formula: 'C = K × P (mod 26)     |     P = K⁻¹ × C (mod 26)',
        formulaLabel: 'Formula Hill Cipher — K adalah matriks kunci n×n',
        example: {
          title: 'Contoh: Hill 2×2 dengan K=[[3,3],[2,5]], P="AC"',
          steps: [
            'Plaintext "AC": vektor P = [0, 2]  (A=0, C=2)',
            'K × P = [[3,3],[2,5]] × [0,2]',
            'Baris 1: 3×0 + 3×2 = 6  →  6 mod 26 = 6  →  G',
            'Baris 2: 2×0 + 5×2 = 10  →  10 mod 26 = 10  →  K',
            'Ciphertext = [6, 10] = "GK"',
          ],
          result: '"AC" + K=[[3,3],[2,5]]  →  "GK"',
        },
        table: {
          caption: 'Perbandingan Kekuatan Sandi Klasik',
          headers: ['Sandi', 'Ruang Kunci', 'Tahan Frekuensi?', 'Tahan Known-PT?', 'Digunakan Sejak'],
          rows: [
            ['Caesar', '25', 'Tidak', 'Ya', '100 SM'],
            ['Affine', '312', 'Tidak', 'Ya', '~1800 M'],
            ['Vigenère', '26ⁿ', 'Sebagian', 'Sebagian', '1553 M'],
            ['Hill 2×2', '(26⁴ valid)', 'Ya', 'Tidak', '1929 M'],
          ],
        },
        note: 'Hill Cipher rentan terhadap known-plaintext attack: jika penyerang mengetahui n pasang plaintext-ciphertext, matriks kunci K dapat dihitung dari C = KP → K = C × P⁻¹ (mod 26).',
        noteType: 'warning',
      },
      {
        title: 'One-Time Pad (OTP)',
        content:
          'One-Time Pad adalah satu-satunya cipher yang terbukti secara matematis memberikan keamanan sempurna (perfect secrecy). Enkripsi: Ci = Pi XOR Ki, dekripsi: Pi = Ci XOR Ki. Syarat keamanan: kunci harus (1) benar-benar acak, (2) minimal sepanjang plaintext, (3) hanya digunakan sekali, (4) dijaga kerahasiaannya. Jika semua syarat terpenuhi, ciphertext tidak memberikan informasi apapun tentang plaintext. Kelemahannya adalah masalah distribusi kunci yang aman — untuk berbagi kunci sepanjang 1 GB, Anda perlu kanal aman yang mampu mentransmisikan 1 GB.',
        formula: 'Cᵢ = Pᵢ ⊕ Kᵢ     |     Pᵢ = Cᵢ ⊕ Kᵢ',
        formulaLabel: 'Formula OTP — operasi XOR (⊕) bit per bit',
        keyPoints: [
          'Kunci harus benar-benar acak (true random, bukan pseudo-random)',
          'Kunci harus minimal sepanjang plaintext',
          'Kunci harus digunakan hanya SATU KALI (One-Time)',
          'Kunci harus dijaga kerahasiaannya dan dihancurkan setelah digunakan',
        ],
        example: {
          title: 'Contoh: OTP XOR karakter per karakter',
          steps: [
            'P = "B" = 65 = 01000001  (ASCII)',
            'K = "\\xA3" = 163 = 10100011  (kunci acak)',
            'C = P ⊕ K = 01000001 ⊕ 10100011 = 11100010 = 226',
            'Dekripsi: P = C ⊕ K = 11100010 ⊕ 10100011 = 01000001 = "B" ✓',
          ],
          result: 'XOR bersifat self-inverse: P ⊕ K ⊕ K = P',
        },
        note: 'Paradoks OTP: untuk mengamankan 1 GB data, Anda perlu mendistribusikan 1 GB kunci secara aman. Jika Anda punya kanal aman untuk kunci, mengapa tidak kirim data melalui kanal itu langsung? Inilah mengapa OTP tidak praktis untuk sebagian besar kebutuhan.',
        noteType: 'info',
      },
      {
        title: 'Perfect Secrecy dan Teorema Shannon',
        content:
          'Claude Shannon (1949) membuktikan bahwa sebuah cipher memiliki perfect secrecy jika dan hanya jika: jumlah kunci ≥ jumlah plaintext, setiap kunci digunakan dengan probabilitas sama, dan setiap kunci digunakan hanya sekali. Untuk OTP: P(P|C) = P(P) — mengetahui ciphertext tidak menambah pengetahuan tentang plaintext. Shannon juga mengidentifikasi dua sifat cipher yang baik: Confusion (menyembunyikan hubungan kunci-ciphertext) dan Diffusion (menyebarkan pengaruh satu bit plaintext ke banyak bit ciphertext).',
        formula: 'P(P | C) = P(P)     untuk semua P dan C',
        formulaLabel: 'Definisi Perfect Secrecy Shannon — probabilitas plaintext tidak berubah setelah melihat ciphertext',
        keyPoints: [
          'Syarat 1: |Kunci| ≥ |Plaintext| — kunci harus sepanjang atau lebih panjang dari pesan',
          'Syarat 2: Setiap kunci dipilih dengan probabilitas seragam (truly random)',
          'Syarat 3: Setiap kunci digunakan hanya satu kali (one-time)',
        ],
        table: {
          caption: 'Sifat Cipher Ideal menurut Shannon',
          headers: ['Sifat', 'Definisi', 'Contoh dalam AES'],
          rows: [
            ['Confusion', 'Menyembunyikan hubungan kunci-ciphertext', 'S-Box (substitusi non-linear)'],
            ['Diffusion', '1 bit plaintext mempengaruhi banyak bit ciphertext', 'ShiftRows + MixColumns'],
            ['Completeness', 'Setiap bit output bergantung pada setiap bit input dan kunci', 'Semua round AES bersama'],
          ],
        },
        note: 'OTP adalah satu-satunya cipher yang terbukti secara matematis mencapai perfect secrecy. Cipher modern seperti AES bukan perfect secrecy, tetapi computationally secure — tidak ada algoritma yang efisien secara komputasi yang dapat memecahkannya.',
        noteType: 'success',
      },
    ],
    lab: {
      title: 'Implementasi Affine Cipher dan OTP dalam Python',
      downloads: [],
      steps: [
        {
          title: 'Implementasi Affine Cipher',
          description: 'Tulis fungsi Affine Cipher dengan a=5, b=8.',
          command:
            "python3 -c \"\ndef gcd(a, b):\n    while b: a, b = b, a%b\n    return a\ndef affine_enc(text, a, b):\n    assert gcd(a,26)==1, 'a harus coprime dengan 26'\n    return ''.join(chr((a*(ord(c)-65)+b)%26+65) if c.isalpha() else c for c in text.upper())\nprint(affine_enc('HELO', 5, 8))\n\"",
          expectedOutput: 'RCLLA (atau sesuai kalkulasi)',
        },
        {
          title: 'Hitung Invers Modular',
          description: 'Implementasikan Extended Euclidean Algorithm untuk mencari invers modular.',
          command:
            "python3 -c \"\ndef mod_inverse(a, m):\n    for x in range(1, m):\n        if (a*x)%m==1: return x\n    return None\nfor a in [3,5,7,9,11,15,17,19,21,23,25]:\n    print(f'Invers {a} mod 26 = {mod_inverse(a,26)}')\n\"",
          expectedOutput: 'Tabel invers semua nilai a yang valid',
          hint: 'Verifikasi: a × invers(a) mod 26 harus = 1',
        },
        {
          title: 'Dekripsi Affine Cipher',
          description: 'Implementasikan dekripsi Affine menggunakan invers modular.',
          command:
            "python3 -c \"\ndef mod_inv(a, m): return next(x for x in range(1,m) if (a*x)%m==1)\ndef affine_dec(cipher, a, b):\n    ai=mod_inv(a,26)\n    return ''.join(chr(ai*(ord(c)-65-b)%26+65) if c.isalpha() else c for c in cipher.upper())\nprint(affine_dec('RCLLA', 5, 8))\n\"",
          expectedOutput: 'HELO',
        },
        {
          title: 'Validasi Nilai a yang Tidak Valid',
          description: 'Coba a=2 (tidak coprime dengan 26) dan amati apa yang terjadi.',
          command:
            "python3 -c \"\ndef affine_enc_try(text, a, b):\n    return ''.join(chr((a*(ord(c)-65)+b)%26+65) if c.isalpha() else c for c in text.upper())\nresult=affine_enc_try('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 2, 0)\nprint(result)\nprint('Duplikat:', len(result)!=len(set(result)))\n\"",
          expectedOutput: 'Beberapa huruf muncul duplikat — cipher tidak bisa didekripsi!',
          screenshotNote: 'Screenshot hasilnya untuk menunjukkan mengapa gcd(a,26)=1 harus terpenuhi.',
        },
        {
          title: 'Implementasi One-Time Pad (OTP)',
          description: 'Implementasikan OTP dengan kunci acak.',
          command:
            "python3 -c \"\nimport secrets\nplaintext=b'BINA INSANI'\nkey=secrets.token_bytes(len(plaintext))\nciphertext=bytes(p^k for p,k in zip(plaintext,key))\ndecrypted=bytes(c^k for c,k in zip(ciphertext,key))\nprint('Kunci (hex):', key.hex())\nprint('Ciphertext (hex):', ciphertext.hex())\nprint('Dekripsi:', decrypted)\n\"",
          expectedOutput: 'Kunci random, ciphertext random, dekripsi = b\'BINA INSANI\'',
        },
        {
          title: 'Demonstrasi Two-Time Pad (Kelemahan OTP)',
          description: 'Tunjukkan bahwa menggunakan kunci yang sama dua kali merusak keamanan OTP.',
          command:
            "python3 -c \"\nimport secrets\nkey=secrets.token_bytes(10)\np1=b'HELLO BOB!'\np2=b'ATTACK NOW'\nc1=bytes(a^b for a,b in zip(p1,key))\nc2=bytes(a^b for a,b in zip(p2,key))\nxored=bytes(a^b for a,b in zip(c1,c2))\nalso=bytes(a^b for a,b in zip(p1,p2))\nprint('c1 XOR c2:', xored.hex())\nprint('p1 XOR p2:', also.hex())\nprint('Sama?', xored==also)\n\"",
          hint: 'Ketika menggunakan kunci yang sama: C1 XOR C2 = P1 XOR P2, sehingga informasi plaintext bocor.',
          screenshotNote: 'Screenshot hasil dan jelaskan mengapa ini merupakan kelemahan fatal OTP jika kunci digunakan ulang.',
        },
        {
          title: 'Buat Laporan Analisis',
          description: 'Dokumentasikan semua temuan dan buat tabel perbandingan Affine, Hill (konsep), dan OTP.',
          screenshotNote: 'Sertakan semua screenshot dan tabel perbandingan dalam laporan akhir.',
        },
      ],
      deliverable:
        'Laporan lab berisi implementasi Affine Cipher yang berfungsi, demonstrasi OTP dan kelemahan two-time pad, serta analisis perbandingan ketiga sandi berdasarkan keamanan, kompleksitas kunci, dan kasus penggunaan.',
    },
    caseStudy: {
      title: 'Kasus: Implementasi OTP yang Salah dalam Sistem Komunikasi',
      scenario:
        'Sebuah lembaga intelijen mengembangkan sistem komunikasi terenkripsi menggunakan One-Time Pad. Karena kesulitan distribusi kunci, tim teknis memutuskan untuk menggunakan kunci yang sama selama seminggu untuk semua pesan antara dua agen. Pihak lawan berhasil mengintersep beberapa pasang pesan dan kuncinya, kemudian berhasil memecahkan semua pesan lainnya yang dikirim minggu itu.',
      questions: [
        'Apa pelanggaran keamanan fundamental yang dilakukan lembaga tersebut? Jelaskan secara teknis bagaimana pihak lawan dapat memecahkan pesan lain.',
        'Mengapa Shannon membuktikan OTP memiliki perfect secrecy? Syarat apa yang HARUS terpenuhi?',
        'Dalam praktik modern, mengapa OTP jarang digunakan meskipun terbukti sempurna secara teoritis? Apa alternatif yang digunakan?',
        'Analisis dilema keamanan vs. kepraktisan dalam kasus ini. Bagaimana seharusnya sistem ini dirancang?',
      ],
    },
    quiz: [
      {
        id: 10301,
        type: 'essay',
        question:
          'Jelaskan formula enkripsi dan dekripsi Affine Cipher. Enkripsi "KUNCI" dengan a=7, b=3, kemudian verifikasi dengan dekripsi hasilnya.',
        answer:
          'E(x)=(7x+3) mod 26. K(10): 73 mod 26=21=V; U(20): 143 mod 26=13=N; N(13): 94 mod 26=16=Q; C(2): 17 mod 26=17=R; I(8): 59 mod 26=7=H. Hasil: VNQRH. Dekripsi: invers 7 mod 26=15. D(x)=15(x-3) mod 26.',
      },
      {
        id: 10302,
        type: 'essay',
        question:
          'Jelaskan konsep perfect secrecy pada One-Time Pad. Apa yang terjadi secara matematis jika kunci OTP digunakan dua kali (two-time pad)? Berikan penjelasan matematis.',
        answer:
          'Perfect secrecy: P(P|C)=P(P), mengetahui ciphertext tidak memberi informasi tentang plaintext. Two-time pad: jika C1=P1 XOR K dan C2=P2 XOR K, maka C1 XOR C2 = P1 XOR P2. Dengan XOR ini, penyerang mendapat informasi tentang kedua plaintext tanpa mengetahui K.',
      },
    ],
    videoResources: [
      {
        title: 'Affine Cipher and One-Time Pad',
        youtubeId: '7z1A8b15S_s',
        description: 'Penjelasan mendalam sandi Affine, Hill, dan konsep perfect secrecy OTP',
        language: 'en',
      },
    ],
  },
  {
    id: 104,
    title: 'Mode Operasi Block Cipher',
    description: 'ECB, CBC, CTR, GCM dan cara kerja cipher modern',
    iconName: 'Cpu',
    theory: [
      {
        title: 'Konsep Block Cipher',
        content:
          'Block cipher mengenkripsi data dalam blok tetap (biasanya 128 bit untuk AES). Jika plaintext lebih panjang dari satu blok, diperlukan mode operasi untuk mengaturnya. Mode operasi menentukan cara blok-blok dienkripsi dan bagaimana ketergantungan antar blok dibangun. AES (Advanced Encryption Standard) adalah block cipher standar modern yang dipilih NIST tahun 2001 melalui kompetisi terbuka, menggantikan DES. AES mendukung kunci 128, 192, atau 256 bit.',
        table: {
          caption: 'Perbandingan Mode Operasi Block Cipher',
          headers: ['Mode', 'Paralel?', 'IV/Nonce?', 'Padding?', 'Autentikasi?', 'Rekomendasi'],
          rows: [
            ['ECB', 'Enkripsi ✓ Dekripsi ✓', 'Tidak', 'Ya', 'Tidak', 'JANGAN DIGUNAKAN'],
            ['CBC', 'Hanya Dekripsi', 'IV acak', 'Ya', 'Tidak', 'Gunakan dengan HMAC'],
            ['CTR', 'Enkripsi ✓ Dekripsi ✓', 'Nonce+Counter', 'Tidak', 'Tidak', 'Gunakan dengan MAC'],
            ['GCM', 'Enkripsi ✓ Dekripsi ✓', 'Nonce 96-bit', 'Tidak', 'Ya (GHASH)', 'DIREKOMENDASIKAN ✓'],
          ],
        },
      },
      {
        title: 'Electronic Codebook (ECB)',
        content:
          'ECB (Electronic Codebook) adalah mode paling sederhana: setiap blok plaintext dienkripsi secara independen. E(P1)=C1, E(P2)=C2, dst. Masalah fatal ECB: blok plaintext yang identik menghasilkan blok ciphertext yang identik. Ini membuat pola dalam data terlihat dalam ciphertext — contoh klasik adalah gambar "ECB penguin" di mana siluet pinguin tetap terlihat setelah enkripsi ECB. ECB tidak boleh digunakan untuk data yang mengandung pola berulang. Contoh penggunaan buruk: mengenkripsi header paket jaringan yang strukturnya terprediksi.',
        formula: 'Cᵢ = E(Kunci, Pᵢ)',
        formulaLabel: 'ECB — setiap blok dienkripsi secara independen (TIDAK AMAN)',
        note: 'ECB TIDAK BOLEH digunakan untuk mengenkripsi lebih dari satu blok data terstruktur. Blok plaintext identik → ciphertext identik → pola data terlihat. "ECB Penguin" adalah contoh terkenal: gambar terenkripsi ECB masih memperlihatkan siluet penguin karena piksel berulang dienkripsi identik.',
        noteType: 'danger',
      },
      {
        title: 'Cipher Block Chaining (CBC)',
        content:
          'CBC mengatasi kelemahan ECB dengan XOR setiap blok plaintext dengan ciphertext sebelumnya sebelum dienkripsi. Formula: Ci = E(Pi XOR Ci-1), dengan C0 = IV (Initialization Vector). Dekripsi: Pi = D(Ci) XOR Ci-1. IV harus unik dan acak untuk setiap sesi, tetapi tidak perlu rahasia. Blok yang identik menghasilkan ciphertext berbeda karena chaining. Kelemahannya: enkripsi bersifat serial (tidak bisa diparalelkan), satu bit error dalam ciphertext merusak dua blok, dan CBC rentan terhadap Padding Oracle Attack.',
        formula: 'Cᵢ = E(Kunci, Pᵢ ⊕ Cᵢ₋₁)     |     Pᵢ = D(Kunci, Cᵢ) ⊕ Cᵢ₋₁',
        formulaLabel: 'CBC Enkripsi & Dekripsi — C₀ = IV (Initialization Vector)',
        note: 'IV harus unik dan acak untuk SETIAP SESI enkripsi CBC. Menggunakan IV yang sama dua kali dengan kunci yang sama membocorkan informasi tentang perbedaan plaintext pertama dari dua pesan (C1₁ ⊕ C1₂ = P1₁ ⊕ P1₂).',
        noteType: 'warning',
      },
      {
        title: 'Counter Mode (CTR) dan GCM',
        content:
          'CTR mengubah block cipher menjadi stream cipher dengan mengenkripsi penghitung (nonce + counter) untuk menghasilkan keystream, kemudian XOR dengan plaintext. Keunggulan: dapat diparalelkan sepenuhnya, tidak memerlukan padding. GCM (Galois/Counter Mode) = CTR + Galois Message Authentication Code. GCM adalah mode yang direkomendasikan untuk penggunaan modern karena menyediakan enkripsi SEKALIGUS autentikasi integritas. TLS 1.3 menggunakan AES-GCM atau ChaCha20-Poly1305.',
        table: {
          caption: 'Perbandingan CTR vs GCM',
          headers: ['Fitur', 'CTR', 'GCM'],
          rows: [
            ['Enkripsi', 'Ya (stream)', 'Ya (CTR internal)'],
            ['Autentikasi Integritas', 'Tidak', 'Ya (GHASH tag 128-bit)'],
            ['Paralelisasi', 'Ya', 'Ya'],
            ['Padding diperlukan', 'Tidak', 'Tidak'],
            ['Kategori', 'Enkripsi saja', 'AEAD (Authenticated Encryption with Associated Data)'],
            ['Digunakan di', 'Jarang sendiri', 'TLS 1.3, HTTPS, WPA3'],
          ],
        },
        note: 'GCM = AEAD (Authenticated Encryption with Associated Data). Satu operasi GCM menghasilkan ciphertext DAN authentication tag. Jika data dimodifikasi, tag verifikasi gagal — memberikan perlindungan terhadap tampering. Ini yang membuat GCM menjadi pilihan utama TLS 1.3.',
        noteType: 'success',
      },
      {
        title: 'Padding dan Keamanan Padding',
        content:
          'Block cipher memerlukan plaintext dengan panjang kelipatan ukuran blok. Padding menambahkan byte tambahan untuk memenuhi syarat ini. PKCS#7 padding: tambahkan N byte dengan nilai N, di mana N adalah jumlah byte yang dibutuhkan. Contoh: jika blok 16 byte dan data 13 byte, tambahkan 3 byte \\x03. Padding Oracle Attack mengeksploitasi informasi yang bocor dari error message untuk mendekripsi data tanpa kunci. POODLE attack (2014) mengeksploitasi kelemahan padding dalam SSL 3.0 menggunakan CBC.',
        example: {
          title: 'PKCS#7 Padding untuk data 13 byte (blok 16 byte)',
          steps: [
            'Data asli: "SERANGAN SIBER"  (13 byte)',
            'Blok size AES: 16 byte',
            'Kekurangan: 16 − 13 = 3 byte',
            'PKCS#7: tambahkan 3 byte dengan nilai \\x03',
            'Hasil: "SERANGAN SIBER\\x03\\x03\\x03"  (16 byte = 1 blok penuh)',
            'Jika data tepat 16 byte: tambahkan 1 blok padding \\x10 × 16 (standar PKCS#7)',
          ],
          result: 'Pada dekripsi, padding dilepas: baca byte terakhir N, hapus N byte terakhir',
        },
      },
    ],
    lab: {
      title: 'Demonstrasi Mode Operasi Block Cipher',
      downloads: [],
      steps: [
        {
          title: 'Install PyCryptodome',
          description: 'Install library kriptografi Python untuk bereksperimen dengan AES.',
          command: 'pip3 install pycryptodome',
          expectedOutput: 'Successfully installed pycryptodome-x.x.x',
          warningNote: 'Jika pip tidak tersedia, gunakan pip3 atau python3 -m pip install pycryptodome',
        },
        {
          title: 'Enkripsi AES-ECB',
          description: 'Demonstrasikan kelemahan ECB dengan mengenkripsi teks yang mengandung pola berulang.',
          command:
            "python3 -c \"\nfrom Crypto.Cipher import AES\nfrom Crypto.Util.Padding import pad\nkey=b'0123456789ABCDEF'\nplain=b'AAAAAAAAAAAAAAAA'*2  # dua blok identik\ncipher=AES.new(key,AES.MODE_ECB)\nct=cipher.encrypt(plain)\nprint('ECB:', ct.hex())\nprint('Blok 1 == Blok 2?', ct[:16]==ct[16:])\n\"",
          expectedOutput: 'True — blok identik menghasilkan ciphertext identik!',
          screenshotNote: 'Screenshot untuk menunjukkan kelemahan fatal ECB.',
        },
        {
          title: 'Enkripsi AES-CBC',
          description: 'Enkripsi data yang sama dengan CBC dan bandingkan hasilnya.',
          command:
            "python3 -c \"\nfrom Crypto.Cipher import AES\nfrom Crypto.Util.Padding import pad\nimport os\nkey=b'0123456789ABCDEF'\niv=os.urandom(16)\nplain=b'AAAAAAAAAAAAAAAA'*2\ncipher=AES.new(key,AES.MODE_CBC,iv)\nct=cipher.encrypt(plain)\nprint('CBC:', ct.hex())\nprint('Blok 1 == Blok 2?', ct[:16]==ct[16:])\n\"",
          expectedOutput: 'False — blok identik menghasilkan ciphertext berbeda',
          hint: 'Bandingkan output ECB vs CBC. CBC jauh lebih aman untuk data berstruktur.',
        },
        {
          title: 'Dekripsi AES-CBC',
          description: 'Dekripsi ciphertext CBC.',
          command:
            "python3 -c \"\nfrom Crypto.Cipher import AES\nfrom Crypto.Util.Padding import pad, unpad\nimport os\nkey=b'0123456789ABCDEF'\niv=os.urandom(16)\nplain=b'SERANGAN SIBER!'\nenc=AES.new(key,AES.MODE_CBC,iv)\nct=enc.encrypt(pad(plain,16))\ndec=AES.new(key,AES.MODE_CBC,iv)\npt=unpad(dec.decrypt(ct),16)\nprint('Plaintext:', pt)\n\"",
          expectedOutput: "b'SERANGAN SIBER!'",
        },
        {
          title: 'AES-CTR Mode',
          description: 'Gunakan CTR mode yang dapat diparalelkan.',
          command:
            "python3 -c \"\nfrom Crypto.Cipher import AES\nimport os\nkey=b'0123456789ABCDEF'\nnonce=os.urandom(8)\nplain=b'Mode CTR lebih modern'\ncipher=AES.new(key,AES.MODE_CTR,nonce=nonce)\nct=cipher.encrypt(plain)\ncipher2=AES.new(key,AES.MODE_CTR,nonce=nonce)\npt=cipher2.decrypt(ct)\nprint('Decrypted:', pt)\n\"",
          expectedOutput: "b'Mode CTR lebih modern'",
        },
        {
          title: 'AES-GCM (Authenticated Encryption)',
          description: 'GCM menyediakan enkripsi sekaligus autentikasi integritas.',
          command:
            "python3 -c \"\nfrom Crypto.Cipher import AES\nimport os\nkey=os.urandom(16)\nnonce=os.urandom(12)\nplain=b'Data rahasia penting'\ncipher=AES.new(key,AES.MODE_GCM,nonce=nonce)\nct,tag=cipher.encrypt_and_digest(plain)\nprint('Ciphertext:', ct.hex())\nprint('Auth tag:', tag.hex())\ncipher2=AES.new(key,AES.MODE_GCM,nonce=nonce)\npt=cipher2.decrypt_and_verify(ct,tag)\nprint('Verified plaintext:', pt)\n\"",
          screenshotNote: 'Screenshot dan jelaskan peran authentication tag dalam GCM.',
        },
        {
          title: 'Dokumentasi Perbandingan Mode',
          description: 'Buat tabel perbandingan ECB, CBC, CTR, dan GCM berdasarkan keamanan, kecepatan, dan use case.',
          screenshotNote: 'Sertakan semua screenshot dan tabel perbandingan dalam laporan.',
        },
      ],
      deliverable:
        'Laporan lab berisi demonstrasi kelemahan ECB vs keunggulan CBC dan GCM, perbandingan mode operasi block cipher, dan rekomendasi mode mana yang harus digunakan dalam konteks apa.',
    },
    caseStudy: {
      title: 'Kasus: Kebocoran Data Akibat Penggunaan ECB Mode',
      scenario:
        'Aplikasi mobile perbankan menggunakan AES-ECB untuk mengenkripsi data transaksi sebelum dikirim ke server. Peneliti keamanan menemukan bahwa dengan mengirimkan transaksi dengan jumlah yang sama berulang kali, ciphertext yang dihasilkan selalu identik. Dengan analisis pola ciphertext yang diintersep, peneliti berhasil mengidentifikasi nominal transfer tertentu tanpa mengetahui kunci enkripsi.',
      questions: [
        'Jelaskan secara teknis mengapa ECB menghasilkan ciphertext yang sama untuk plaintext yang sama. Mengapa ini menjadi masalah serius?',
        'Bagaimana peneliti dapat mengidentifikasi nominal transfer hanya dari pola ciphertext? Jelaskan serangan yang mungkin dilakukan.',
        'Mode enkripsi apa yang seharusnya digunakan? Jelaskan keunggulan mode tersebut dibandingkan ECB.',
        'Selain pemilihan mode enkripsi, langkah-langkah keamanan tambahan apa yang harus diterapkan dalam sistem komunikasi perbankan mobile?',
      ],
    },
    quiz: [
      {
        id: 10401,
        type: 'essay',
        question:
          'Jelaskan perbedaan mendasar antara ECB dan CBC mode. Mengapa ECB dianggap tidak aman untuk mengenkripsi data berstruktur? Berikan contoh konkret.',
        answer:
          'ECB: setiap blok dienkripsi independen, blok identik → ciphertext identik, pola terlihat. CBC: setiap blok di-XOR dengan ciphertext sebelumnya sebelum dienkripsi, sehingga blok identik menghasilkan ciphertext berbeda. Contoh: enkripsi gambar dengan ECB masih terlihat siluetnya.',
      },
      {
        id: 10402,
        type: 'essay',
        question:
          'Apa keunggulan GCM dibandingkan CBC untuk enkripsi data sensitif? Jelaskan konsep Authenticated Encryption dan mengapa TLS 1.3 memilih GCM.',
        answer:
          'GCM = CTR enkripsi + GHASH autentikasi. Menghasilkan authentication tag yang memverifikasi integritas DAN autentisitas data. CBC hanya menyediakan enkripsi tanpa autentikasi bawaan. TLS 1.3 memilih AES-GCM karena: paralel, authenticated encryption, dan tahan terhadap padding oracle attack.',
      },
    ],
    videoResources: [
      {
        title: 'Block Cipher Modes of Operation',
        youtubeId: 'O4xNJsjtN6E',
        description: 'Visual explanation of ECB, CBC, CTR, and GCM modes',
        language: 'en',
      },
    ],
  },
  {
    id: 105,
    title: 'Algoritma RSA',
    description: 'Kriptografi kunci publik, RSA, dan aplikasi digital signature',
    iconName: 'Key',
    theory: [
      {
        title: 'Kriptografi Kunci Publik (Asimetris)',
        content:
          'Kriptografi asimetris menggunakan sepasang kunci matematis yang terkait: kunci publik (public key) yang dapat dibagikan kepada siapapun, dan kunci privat (private key) yang harus dijaga kerahasiaannya. Data yang dienkripsi dengan kunci publik hanya bisa didekripsi dengan kunci privat yang berpasangan, dan sebaliknya. Masalah utama kriptografi simetris adalah distribusi kunci — dengan asimetris, masalah ini teratasi. Contoh algoritma: RSA, ECC (Elliptic Curve Cryptography), Diffie-Hellman.',
        table: {
          caption: 'Perbandingan Jenis Kriptografi',
          headers: ['Properti', 'Simetris (AES)', 'Asimetris (RSA)', 'Hash (SHA-256)'],
          rows: [
            ['Kunci', 'Satu kunci rahasia', 'Kunci publik + privat', 'Tidak ada kunci'],
            ['Kecepatan', 'Sangat cepat', 'Lambat (10–100×)', 'Sangat cepat'],
            ['Distribusi kunci', 'Sulit (butuh kanal aman)', 'Mudah (publik bebas dibagi)', 'N/A'],
            ['Kerahasiaan', 'Ya', 'Ya', 'Tidak (satu arah)'],
            ['Kasus penggunaan', 'Enkripsi data bulk', 'Key exchange, signature', 'Verifikasi integritas'],
            ['Contoh nyata', 'AES di TLS setelah handshake', 'RSA untuk tukar kunci TLS', 'SHA-256 dalam sertifikat'],
          ],
        },
      },
      {
        title: 'Algoritma RSA: Pembangkitan Kunci',
        content:
          'RSA (Rivest-Shamir-Adleman, 1977) berdasarkan kesulitan memfaktorkan bilangan bulat besar. Langkah pembangkitan kunci: (1) Pilih dua bilangan prima besar p dan q; (2) Hitung n = p × q (modulus); (3) Hitung φ(n) = (p-1)(q-1) (Euler\'s totient); (4) Pilih e coprime dengan φ(n), biasanya e = 65537; (5) Hitung d = e⁻¹ mod φ(n) (kunci privat). Kunci publik = (e, n), kunci privat = (d, n). Contoh kecil: p=61, q=53 → n=3233, φ=3120, e=17, d=2753.',
        table: {
          caption: 'Langkah Pembangkitan Kunci RSA (contoh p=61, q=53)',
          headers: ['Langkah', 'Formula', 'Contoh (p=61, q=53)', 'Hasil'],
          rows: [
            ['1. Pilih prima', 'p, q prima', 'p = 61, q = 53', 'Verifikasi: prima ✓'],
            ['2. Hitung modulus', 'n = p × q', 'n = 61 × 53', 'n = 3233'],
            ['3. Hitung totient', 'φ(n) = (p−1)(q−1)', 'φ = 60 × 52', 'φ(n) = 3120'],
            ['4. Pilih e', 'gcd(e, φ) = 1', 'gcd(17, 3120) = 1 ✓', 'e = 17'],
            ['5. Hitung d', 'd = e⁻¹ mod φ(n)', '17 × d ≡ 1 (mod 3120)', 'd = 2753'],
          ],
        },
        note: 'Kunci publik = (e=17, n=3233) — dapat dibagikan bebas. Kunci privat = (d=2753, n=3233) — HARUS dirahasiakan. Keamanan RSA bergantung pada kesulitan memfaktorkan n=3233 menjadi 61×53 — untuk n 2048-bit, ini tidak mungkin secara praktis.',
        noteType: 'info',
      },
      {
        title: 'Enkripsi dan Dekripsi RSA',
        content:
          'Enkripsi RSA: C = Mᵉ mod n, di mana M adalah pesan (integer), C adalah ciphertext. Dekripsi: M = Cᵈ mod n. Keamanan RSA bergantung pada kesulitan komputasional faktorisasi n = p × q — untuk n = 2048 bit, tidak ada algoritma klasik yang efisien untuk memfaktorkan n dalam waktu yang wajar. Contoh: M=65, e=17, n=3233: C = 65¹⁷ mod 3233 = 2790. Dekripsi: 2790²⁷⁵³ mod 3233 = 65.',
        formula: 'C = Mᵉ mod n     |     M = Cᵈ mod n',
        formulaLabel: 'RSA Enkripsi (kunci publik e, n) dan Dekripsi (kunci privat d, n)',
        example: {
          title: 'Contoh Lengkap: M=65, e=17, d=2753, n=3233',
          steps: [
            'Enkripsi: C = 65¹⁷ mod 3233',
            '65¹⁷ mod 3233 = 2790  (dihitung dengan fast modular exponentiation)',
            'Kirim C = 2790 melalui kanal publik',
            'Dekripsi: M = 2790²⁷⁵³ mod 3233',
            '2790²⁷⁵³ mod 3233 = 65  ✓',
          ],
          result: 'M = 65 berhasil dipulihkan — verifikasi RSA sukses ✓',
        },
      },
      {
        title: 'Digital Signature',
        content:
          'Digital Signature menggunakan RSA secara terbalik untuk autentikasi dan non-repudiation. Penandatanganan: S = Hash(M)ᵈ mod n (menggunakan kunci privat). Verifikasi: Hash(M) = Sᵉ mod n (menggunakan kunci publik). Jika hash yang dihitung dari pesan sama dengan hasil dekripsi tanda tangan, pesan valid dan pengirim terbukti. Proses ini menjamin: autentikasi pengirim, integritas pesan, dan non-repudiation. RSA dengan SHA-256 digunakan dalam sertifikat TLS/SSL, dokumen PDF bertanda tangan, dan code signing.',
        formula: 'Tanda Tangan: S = Hash(M)ᵈ mod n     |     Verifikasi: Hash(M) =? Sᵉ mod n',
        formulaLabel: 'RSA Digital Signature — kunci privat untuk signing, kunci publik untuk verifikasi',
        note: 'Logika Digital Signature: hanya pemilik kunci privat yang bisa membuat S = Hash(M)^d mod n yang valid. Siapapun dengan kunci publik bisa memverifikasi: S^e mod n = Hash(M). Ini menjamin non-repudiation — pengirim tidak bisa menyangkal karena hanya mereka yang punya kunci privat.',
        noteType: 'info',
      },
      {
        title: 'PKI dan Sertifikat Digital',
        content:
          'Public Key Infrastructure (PKI) adalah kerangka sistem untuk mengelola kunci publik dan sertifikat digital. Certificate Authority (CA) adalah pihak terpercaya yang menerbitkan sertifikat digital yang mengikat kunci publik dengan identitas. Rantai kepercayaan: Root CA → Intermediate CA → End Entity Certificate. Sertifikat X.509 berisi: nama pemilik, kunci publik, masa berlaku, nama CA penerbit, dan tanda tangan digital CA. Browser mempercayai CA root yang disimpan dalam certificate store OS. HTTPS menggunakan TLS yang memanfaatkan sertifikat X.509 untuk autentikasi server.',
        table: {
          caption: 'Hierarki PKI — Rantai Kepercayaan',
          headers: ['Level', 'Nama', 'Fungsi', 'Contoh'],
          rows: [
            ['Level 1 (Puncak)', 'Root CA', 'CA tertinggi, self-signed, disimpan di OS/browser', 'DigiCert Root, Comodo'],
            ['Level 2', 'Intermediate CA', 'Diterbitkan Root CA, mengeluarkan sertifikat end-entity', 'DigiCert SHA2 Extended'],
            ['Level 3 (Daun)', 'End Entity Certificate', 'Sertifikat website/server yang diverifikasi browser', 'www.binainasni.ac.id'],
          ],
        },
        note: 'Browser memiliki daftar Root CA yang dipercaya (Certificate Store). Ketika Anda mengunjungi HTTPS site, browser memverifikasi rantai: Sertifikat Website → ditandatangani Intermediate CA → ditandatangani Root CA yang ada di browser. Jika rantai putus atau kadaluwarsa, browser menampilkan peringatan.',
        noteType: 'info',
      },
    ],
    lab: {
      title: 'Implementasi RSA dari Awal dalam Python',
      downloads: [],
      steps: [
        {
          title: 'Implementasi RSA Key Generation',
          description: 'Implementasikan pembangkitan kunci RSA dengan p=61, q=53.',
          command:
            "python3 -c \"\nfrom math import gcd\ndef egcd(a, b):\n    if a==0: return b,0,1\n    g,x,y=egcd(b%a,a); return g,y-(b//a)*x,x\ndef mod_inv(a,m):\n    g,x,_=egcd(a%m,m)\n    if g!=1: raise ValueError('Tidak ada invers')\n    return x%m\np,q=61,53; n=p*q; phi=(p-1)*(q-1); e=17\nassert gcd(e,phi)==1\nd=mod_inv(e,phi)\nprint(f'n={n}, phi={phi}, e={e}, d={d}')\nprint(f'Kunci Publik: (e={e}, n={n})')\nprint(f'Kunci Privat: (d={d}, n={n})')\n\"",
          expectedOutput: 'n=3233, phi=3120, e=17, d=2753',
        },
        {
          title: 'Enkripsi RSA',
          description: 'Enkripsi pesan M=65 menggunakan kunci publik.',
          command:
            "python3 -c \"\ndef rsa_enc(M, e, n): return pow(M, e, n)\nM=65; e=17; n=3233\nC=rsa_enc(M,e,n)\nprint(f'Plaintext: {M}')\nprint(f'Ciphertext: {C}')\n\"",
          expectedOutput: 'Ciphertext: 2790',
        },
        {
          title: 'Dekripsi RSA',
          description: 'Dekripsi ciphertext menggunakan kunci privat.',
          command:
            "python3 -c \"\ndef rsa_dec(C, d, n): return pow(C, d, n)\nC=2790; d=2753; n=3233\nM=rsa_dec(C,d,n)\nprint(f'Ciphertext: {C}')\nprint(f'Decrypted: {M}')\n\"",
          expectedOutput: 'Decrypted: 65',
          screenshotNote: 'Screenshot untuk memverifikasi enkripsi dan dekripsi berfungsi.',
        },
        {
          title: 'Verifikasi RSA dengan Berbagai Pesan',
          description: 'Enkripsi dan dekripsi beberapa nilai M untuk memverifikasi implementasi.',
          command:
            "python3 -c \"\ne,d,n=17,2753,3233\nfor M in [10, 42, 100, 999, 3000]:\n    C=pow(M,e,n); decM=pow(C,d,n)\n    print(f'M={M}, C={C}, Dec={decM}, OK={M==decM}')\n\"",
          expectedOutput: 'Semua baris menampilkan OK=True (kecuali M≥n)',
          hint: 'Pesan M harus kurang dari n=3233. M=3000 harus berhasil, M=3233 akan gagal.',
        },
        {
          title: 'Simulasi Digital Signature',
          description: 'Implementasikan digital signature sederhana menggunakan RSA.',
          command:
            "python3 -c \"\nimport hashlib\ne,d,n=17,2753,3233\nmsg='Saya setuju dengan kontrak ini'\nhash_val=int(hashlib.sha256(msg.encode()).hexdigest(),16)%n\nsignature=pow(hash_val,d,n)\nprint(f'Pesan: {msg}')\nprint(f'Hash (mod n): {hash_val}')\nprint(f'Tanda tangan: {signature}')\nverified=pow(signature,e,n)\nprint(f'Verifikasi: {verified==hash_val}')\n\"",
          expectedOutput: 'Verifikasi: True',
        },
        {
          title: 'Demonstrasi Keamanan: Faktorisasi Kecil',
          description: 'Tunjukkan mengapa RSA dengan bilangan prima kecil tidak aman.',
          command:
            "python3 -c \"\nn=3233\nfor i in range(2,int(n**0.5)+1):\n    if n%i==0:\n        print(f'n={n} = {i} * {n//i}')\n        break\nprint('Dengan n kecil, faktorisasi mudah!')\nprint('RSA aman butuh n minimal 2048 bit (617 digit)')\n\"",
          screenshotNote: 'Screenshot untuk menunjukkan mengapa n kecil tidak aman.',
        },
        {
          title: 'RSA dengan Kunci Besar (PyCryptodome)',
          description: 'Gunakan library untuk RSA 2048-bit yang aman.',
          command:
            "python3 -c \"\nfrom Crypto.PublicKey import RSA\nkey=RSA.generate(2048)\nprint('Kunci publik (awal 50 char):', str(key.publickey().export_key())[:50])\nprint('n =', key.n)\nprint('e =', key.e)\nprint('Panjang n (bit):', key.n.bit_length())\n\"",
          expectedOutput: 'n dengan 617 digit, panjang 2048 bit',
          warningNote: 'Pembangkitan kunci 2048 bit memerlukan beberapa detik.',
        },
        {
          title: 'Dokumentasi dan Analisis',
          description: 'Buat laporan yang mencakup semua langkah dan analisis keamanan RSA.',
          screenshotNote: 'Sertakan semua screenshot, verifikasi RSA_enc(RSA_dec(M))=M, dan penjelasan mengapa RSA aman.',
        },
      ],
      deliverable:
        'Laporan lab berisi implementasi lengkap RSA key generation, enkripsi, dekripsi, dan digital signature; verifikasi dengan contoh p=61, q=53; dan analisis mengapa RSA dengan n kecil tidak aman serta minimum bit-length yang direkomendasikan.',
    },
    caseStudy: {
      title: 'Kasus: Implementasi RSA yang Salah dalam Sistem Autentikasi',
      scenario:
        'Sebuah vendor perangkat lunak keamanan mengimplementasikan RSA dengan kunci 512-bit untuk sistem autentikasi digital pada infrastruktur kritikal. Pada 2024, peneliti keamanan menemukan bahwa kunci tersebut dapat difaktorkan dalam 2 minggu menggunakan cloud computing biasa dengan biaya sekitar $500. Vendor mengklaim kunci masih "aman" karena belum pernah diserang.',
      questions: [
        'Mengapa RSA 512-bit dianggap tidak aman? Apa yang membuat RSA 2048-bit atau 4096-bit jauh lebih aman secara matematis?',
        'Jelaskan hubungan antara panjang kunci RSA dan kesulitan komputasional faktorisasi bilangan. Mengapa kelipatan dua bit-length tidak berarti dua kali lebih aman?',
        'Standar keamanan modern merekomendasikan bit-length berapa untuk RSA? Apa alternatif modern yang lebih efisien untuk tingkat keamanan yang sama?',
        'Analisis tanggung jawab vendor dalam kasus ini dari perspektif hukum (GDPR, ISO 27001) dan etika keamanan informasi.',
      ],
    },
    quiz: [
      {
        id: 10501,
        type: 'essay',
        question:
          'Jelaskan langkah-langkah pembangkitan kunci RSA secara lengkap. Kemudian enkripsi M=42 menggunakan p=61, q=53, e=17, dan verifikasi dengan dekripsi.',
        answer:
          'n=61×53=3233; φ=60×52=3120; e=17 (gcd(17,3120)=1); d=mod_inv(17,3120)=2753. Enkripsi: C=42^17 mod 3233=? Dekripsi: M=C^2753 mod 3233=42.',
      },
      {
        id: 10502,
        type: 'essay',
        question:
          'Jelaskan bagaimana Digital Signature menggunakan RSA bekerja. Mengapa penandatanganan menggunakan kunci privat dan verifikasi menggunakan kunci publik (bukan sebaliknya)?',
        answer:
          'Penandatanganan: S=Hash(M)^d mod n. Verifikasi: S^e mod n = Hash(M). Kunci privat digunakan untuk signing karena hanya pemilik yang bisa membuat tanda tangan yang valid. Kunci publik digunakan untuk verifikasi karena siapapun perlu bisa memverifikasi. Ini menjamin non-repudiation: hanya pemilik kunci privat yang bisa menandatangani.',
      },
    ],
    videoResources: [
      {
        title: 'RSA Algorithm Explained',
        youtubeId: 'wXB-V_Keiu8',
        description: 'Penjelasan mendalam algoritma RSA, key generation, dan digital signature',
        language: 'en',
      },
    ],
  },
];
