import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface QuestionSeed {
  topicSlug: string
  difficulty: number
  question: string
  options: string[]
  correctAnswer: string
  shortExplanation: string
  fullExplanation: string
  whyCorrect?: string
  whyWrong?: string
  concept?: string
  formula?: string
  calculation?: string
  commonMistake?: string
}

const categories = [
  {
    name: 'Brevet Pajak A',
    slug: 'brevet-a',
    icon: 'BookOpen',
    description: 'Ketentuan perpajakan Orang Pribadi, KUP, dan pemotongan/pemungutan PPh dasar',
    order: 1,
    topics: [
      { name: 'Ketentuan Umum & Tata Cara Perpajakan (KUP)', slug: 'kup-dasar', order: 1 },
      { name: 'PPh Orang Pribadi (PPh OP)', slug: 'pph-op', order: 2 },
      { name: 'PPh Pasal 21 (TER & Tarif Umum)', slug: 'pph-21', order: 3 },
      { name: 'PBB, BPHTB & Bea Meterai', slug: 'pbb-bphtb-meterai', order: 4 },
    ],
  },
  {
    name: 'Brevet Pajak B',
    slug: 'brevet-b',
    icon: 'Receipt',
    description: 'Pajak Badan, PPN & PPnBM, Akuntansi Pajak, dan Pemeriksaan/Sengketa Pajak',
    order: 2,
    topics: [
      { name: 'PPh Badan & Fasilitas Fiskal', slug: 'pph-badan', order: 1 },
      { name: 'PPh PotPut (Pasal 22, 23, 4 ayat 2, 26)', slug: 'pph-potput', order: 2 },
      { name: 'PPN & PPnBM', slug: 'ppn-ppnbm', order: 3 },
      { name: 'Akuntansi Pajak & Rekonsiliasi Fiskal', slug: 'akuntansi-pajak', order: 4 },
      { name: 'Pemeriksaan & Keberatan/Banding', slug: 'pemeriksaan-sengketa', order: 5 },
    ],
  },
]

const questions: QuestionSeed[] = [
  // 1. PPh Pasal 21
  {
    topicSlug: 'pph-21',
    difficulty: 2,
    question: 'Berapakah batas Penghasilan Tidak Kena Pajak (PTKP) setahun untuk Wajib Pajak Orang Pribadi berstatus Tidak Kawin tanpa tanggungan (TK/0) sesuai ketentuan UU HPP?',
    options: ['Rp 36.000.000', 'Rp 48.000.000', 'Rp 54.000.000', 'Rp 58.500.000'],
    correctAnswer: 'Rp 54.000.000',
    shortExplanation: 'Berdasarkan UU Harmonisasi Peraturan Perpajakan (HPP), besaran PTKP untuk diri WP Orang Pribadi adalah Rp 54.000.000 per tahun.',
    fullExplanation: 'Berdasarkan Pasal 7 UU PPh stdd UU HPP No. 7/2021:\n- Wajib Pajak Sendiri: Rp 54.000.000\n- Tambahan WP Kawin: Rp 4.500.000\n- Tambahan tanggungan sedarah/semenda garis lurus (maks 3 orang): Rp 4.500.000/orang.\nUntuk status TK/0, PTKP adalah Rp 54.000.000 per tahun (atau Rp 4.500.000 per bulan).',
    whyCorrect: 'Sesuai Pasal 7 ayat (1) huruf a UU PPh, PTKP WP sendiri adalah Rp 54.000.000.',
    concept: 'Dasar Pengenaan Pajak PPh 21 dan PTKP Orang Pribadi',
    formula: 'PTKP TK/0 = Rp 54.000.000 / tahun',
    commonMistake: 'Tertukar dengan aturan lama sebelum PMK 101/2016 atau salah menambahkan tanggungan.',
  },
  {
    topicSlug: 'pph-21',
    difficulty: 3,
    question: 'Tuan Andi (TK/0) menerima gaji bruto bulanan Rp 10.000.000. Sesuai PP No. 58/2023 dan PMK 168/2023, kategori TER apa yang digunakan untuk Tuan Andi pada masa pajak selain masa pajak terakhir?',
    options: ['TER Kategori A', 'TER Kategori B', 'TER Kategori C', 'Tarif Pasal 17 ayat (1)'],
    correctAnswer: 'TER Kategori A',
    shortExplanation: 'Status TK/0 masuk ke dalam TER Kategori A sesuai PP 58/2023.',
    fullExplanation: 'Ketentuan kategori Tarif Efektif Rata-rata (TER) Bulanan PP 58/2023:\n- TER Kategori A: TK/0 (54 jt), TK/1 (58,5 jt), K/0 (58,5 jt)\n- TER Kategori B: TK/2 (63 jt), TK/3 (67,5 jt), K/1 (63 jt), K/2 (67,5 jt)\n- TER Kategori C: K/3 (72 jt).\nOleh karena itu, Tuan Andi dengan status TK/0 dipotong menggunakan TER Kategori A.',
    whyCorrect: 'TK/0 termasuk dalam pengelompokan TER A.',
    concept: 'Tarif Efektif Rata-Rata (TER) PPh 21 PP 58/2023',
    formula: 'PPh 21 Bulanan = Penghasilan Bruto Bulanan × Tarif TER Kategori A',
    commonMistake: 'Mengira semua pegawai langsung dihitung pakai tarif Pasal 17 setiap bulan.',
  },
  {
    topicSlug: 'pph-21',
    difficulty: 3,
    question: 'Berapakah batas maksimal pengurangan Biaya Jabatan per bulan dan per tahun bagi Pegawai Tetap sesuai peraturan PPh 21?',
    options: [
      '5% dari bruto, maksimal Rp 500.000/bulan (Rp 6.000.000/tahun)',
      '5% dari bruto, maksimal Rp 200.000/bulan (Rp 2.400.000/tahun)',
      '10% dari bruto, maksimal Rp 500.000/bulan (Rp 6.000.000/tahun)',
      '5% dari bruto, tanpa batasan nominal',
    ],
    correctAnswer: '5% dari bruto, maksimal Rp 500.000/bulan (Rp 6.000.000/tahun)',
    shortExplanation: 'Biaya jabatan untuk pegawai tetap adalah 5% dari penghasilan bruto dengan plafon setinggi-tingginya Rp 500.000 per bulan atau Rp 6.000.000 per tahun.',
    fullExplanation: 'Sesuai Pasal 21 ayat (3) UU PPh dan PMK terkait, biaya jabatan diperhitungkan sebesar 5% dari penghasilan bruto, dengan batas maksimum sebesar Rp 500.000 sebulan atau Rp 6.000.000 setahun.',
    whyCorrect: 'Sesuai PMK 250/PMK.03/2008 yang masih berlaku, biaya jabatan adalah 5% maksimal Rp 500.000/bulan.',
    concept: 'Pengurang Penghasilan Bruto Pegawai Tetap',
    formula: 'Biaya Jabatan = Min(5% × Penghasilan Bruto, Rp 500.000/bulan)',
  },

  // 2. PPh Orang Pribadi
  {
    topicSlug: 'pph-op',
    difficulty: 2,
    question: 'Berdasarkan UU Harmonisasi Peraturan Perpajakan (UU HPP), lapisan tarif pertama (5%) berlaku untuk Penghasilan Kena Pajak (PKP) Orang Pribadi sampai dengan...',
    options: ['Rp 50.000.000', 'Rp 60.000.000', 'Rp 100.000.000', 'Rp 250.000.000'],
    correctAnswer: 'Rp 60.000.000',
    shortExplanation: 'UU HPP memperlebar bracket tarif 5% dari sebelumnya Rp 50 juta menjadi Rp 60 juta.',
    fullExplanation: 'Lapisan tarif PPh Orang Pribadi Pasal 17 UU HPP:\n1. 0 s.d. Rp 60.000.000 : 5%\n2. Di atas Rp 60.000.000 s.d. Rp 250.000.000 : 15%\n3. Di atas Rp 250.000.000 s.d. Rp 500.000.000 : 25%\n4. Di atas Rp 500.000.000 s.d. Rp 5.000.000.000 : 30%\n5. Di atas Rp 5.000.000.000 : 35%',
    whyCorrect: 'Lapisan pertama dinaikkan dari Rp 50 juta menjadi Rp 60 juta pada UU HPP No. 7/2021.',
    concept: 'Tarif Progresif Pasal 17 ayat (1) huruf a UU PPh',
  },
  {
    topicSlug: 'pph-op',
    difficulty: 3,
    question: 'Berapakah batasan peredaran bruto (omzet) tidak dikenai pajak bagi Wajib Pajak Orang Pribadi UMKM yang menggunakan skema PPh Final PP 55/2022 (0,5%)?',
    options: ['Rp 200.000.000 per tahun', 'Rp 300.000.000 per tahun', 'Rp 500.000.000 per tahun', 'Rp 4.800.000.000 per tahun'],
    correctAnswer: 'Rp 500.000.000 per tahun',
    shortExplanation: 'Berdasarkan UU HPP dan PP 55/2022, peredaran bruto s.d. Rp 500 juta dalam 1 tahun pajak tidak dikenai PPh bagi WP OP UMKM.',
    fullExplanation: 'Wajib Pajak Orang Pribadi yang memiliki peredaran bruto tertentu (UMKM) tidak dikenai PPh Final 0,5% atas bagian peredaran bruto sampai dengan Rp 500.000.000 dalam 1 (satu) Tahun Pajak. PPh Final 0,5% hanya dihitung atas kelebihan omzet di atas Rp 500 juta.',
    whyCorrect: 'Pasal 7 ayat (2a) UU HPP memberikan fasilitas threshold Rp 500 juta bebas pajak untuk WP OP UMKM.',
    concept: 'Fasilitas Omzet Bebas Pajak WP OP UMKM',
    formula: 'DPP PPh Final UMKM = Max(0, Total Omzet Kumulatif - Rp 500.000.000)',
  },

  // 3. PPh Badan
  {
    topicSlug: 'pph-badan',
    difficulty: 2,
    question: 'Berapakah tarif umum Pajak Penghasilan (PPh) Badan yang berlaku di Indonesia sejak Tahun Pajak 2022?',
    options: ['20%', '22%', '25%', '19%'],
    correctAnswer: '22%',
    shortExplanation: 'Sesuai UU No. 7/2021 (UU HPP), tarif umum PPh Badan ditetapkan sebesar 22%.',
    fullExplanation: 'Berdasarkan ketentuan Pasal 17 ayat (1) huruf b UU PPh yang diubah dengan UU HPP, tarif PPh Badan yang berlaku untuk Tahun Pajak 2022 dan seterusnya adalah 22%. Rencana penurunan ke 20% dibatalkan oleh UU HPP.',
    whyCorrect: 'UU HPP menetapkan tarif PPh Badan tetap 22%.',
    concept: 'Tarif PPh Wajib Pajak Badan Dalam Negeri',
  },
  {
    topicSlug: 'pph-badan',
    difficulty: 4,
    question: 'PT Maju Makmur memiliki peredaran bruto Rp 30.000.000.000 (30 Miliar) dengan Penghasilan Kena Pajak Rp 3.000.000.000 (3 Miliar). Berapakah porsi PKP yang berhak mendapat fasilitas pengurangan tarif 50% (Pasal 31E UU PPh)?',
    options: ['Rp 480.000.000', 'Rp 1.500.000.000', 'Rp 3.000.000.000', 'Rp 0 (Tidak berhak fasilitas)'],
    correctAnswer: 'Rp 480.000.000',
    shortExplanation: 'Porsi PKP berfasilitas dihitung dengan rumus: (Rp 4,8 M / Peredaran Bruto) × PKP.',
    fullExplanation: 'Untuk peredaran bruto di atas Rp 4,8 M s.d. Rp 50 M, fasilitas Pasal 31E dihitung secara proporsional:\nPKP Berfasilitas = (Rp 4.800.000.000 / Rp 30.000.000.000) × Rp 3.000.000.000 = Rp 480.000.000.\nSisa PKP Tanpa Fasilitas = Rp 3.000.000.000 - Rp 480.000.000 = Rp 2.520.000.000.',
    whyCorrect: 'Rumus proporsi Pasal 31E: (4,8 M / 30 M) × 3 M = 480 Juta.',
    concept: 'Fasilitas Pasal 31E UU PPh untuk WP Badan Menengah',
    formula: 'PKP Fasilitas = (4,8 M / Omzet) × Total PKP',
    calculation: '(4.800.000.000 / 30.000.000.000) × 3.000.000.000 = 480.000.000',
  },
  {
    topicSlug: 'pph-badan',
    difficulty: 3,
    question: 'Biaya manakah di bawah ini yang harus dikoreksi positif (Non-Deductible Expense) dalam laporan rekonsiliasi fiskal PPh Badan?',
    options: [
      'Biaya gaji dan tunjangan karyawan operasional',
      'Biaya sumbangan perayaan HUT RI di lingkungan kantor',
      'Biaya penyusutan mesin pabrik metode garis lurus',
      'Biaya sewa gedung kantor operasional',
    ],
    correctAnswer: 'Biaya sumbangan perayaan HUT RI di lingkungan kantor',
    shortExplanation: 'Sumbangan perayaan HUT RI tidak termasuk sumbangan yang dikecualikan/diperbolehkan menurut Pasal 6 dan 9 UU PPh.',
    fullExplanation: 'Berdasarkan Pasal 9 ayat (1) UU PPh, sumbangan perayaan/acara kemasyarakatan yang tidak termasuk sumbangan bencana nasional, litbang, fasilitas pendidikan, pembinaan olahraga, dan infrastruktur sosial merupakan Non-Deductible Expense (harus dikoreksi fiskal positif).',
    whyCorrect: 'Sumbangan non-bencana nasional tidak dapat menjadi pengurang penghasilan bruto.',
    concept: 'Koreksi Fiskal Positif dan Biaya 3M',
  },

  // 4. PPh PotPut (22, 23, 4(2))
  {
    topicSlug: 'pph-potput',
    difficulty: 2,
    question: 'Berapakah tarif pemotongan PPh Pasal 23 atas imbalan jasa manajemen, jasa konsultan, dan jasa teknik yang dibayarkan kepada Wajib Pajak Dalam Negeri ber-NPWP?',
    options: ['1%', '2%', '5%', '10%'],
    correctAnswer: '2%',
    shortExplanation: 'Tarif PPh Pasal 23 atas imbalan jasa teknik, jasa manajemen, jasa konstruksi, jasa konsultan, dan jasa lain adalah 2% dari jumlah bruto tidak termasuk PPN.',
    fullExplanation: 'Sesuai Pasal 23 ayat (1) huruf c UU PPh:\n- Atas sewa dan penghasilan lain sehubungan dengan penggunaan harta (selain tanah/bangunan): 2%\n- Atas imbalan sehubungan dengan jasa teknik, jasa manajemen, jasa konstruksi, jasa konsultan, dan jasa lain selain yang telah dipotong PPh Pasal 21: 2% dari jumlah bruto tidak termasuk PPN.\nBagi WP yang tidak memiliki NPWP, tarif menjadi 100% lebih tinggi (4%).',
    whyCorrect: 'Sesuai Pasal 23 ayat (1) huruf c UU PPh, tarif jasa teknik/manajemen/konsultan adalah 2%.',
    concept: 'Pemotongan PPh Pasal 23 atas Jasa',
    formula: 'PPh 23 = 2% × DPP (Bruto tidak termasuk PPN)',
  },
  {
    topicSlug: 'pph-potput',
    difficulty: 3,
    question: 'PT Sejahtera menyewa ruang kantor dari PT Properti Utama dengan nilai sewa Rp 100.000.000 (belum termasuk PPN). Berapakah PPh yang harus dipotong dan disetorkan oleh PT Sejahtera serta jenis pajaknya?',
    options: [
      'PPh Pasal 23 sebesar Rp 2.000.000 (2%)',
      'PPh Pasal 4 ayat (2) Final sebesar Rp 10.000.000 (10%)',
      'PPh Pasal 4 ayat (2) Final sebesar Rp 5.000.000 (5%)',
      'PPh Pasal 21 sebesar Rp 5.000.000 (5%)',
    ],
    correctAnswer: 'PPh Pasal 4 ayat (2) Final sebesar Rp 10.000.000 (10%)',
    shortExplanation: 'Sewa tanah dan/atau bangunan dikenakan PPh Pasal 4 ayat (2) bersifat Final dengan tarif 10% dari jumlah bruto nilai persewaan.',
    fullExplanation: 'Berdasarkan PP 34 Tahun 2017 / PP 29 Tahun 1996 stdd PP 5 Tahun 2002:\nPenghasilan dari persewaan tanah dan/atau bangunan dikenai PPh yang bersifat Final sebesar 10% dari jumlah bruto nilai persewaan tanah dan/atau bangunan.\nPerhitungan: 10% × Rp 100.000.000 = Rp 10.000.000.',
    whyCorrect: 'Sewa tanah/bangunan tunduk pada PPh Pasal 4 ayat 2 Final dengan tarif 10%, bukan PPh 23.',
    concept: 'PPh Final Pasal 4 ayat (2) Sewa Tanah dan/atau Bangunan',
    formula: 'PPh 4(2) = 10% × Nilai Sewa Bruto',
    calculation: '10% × Rp 100.000.000 = Rp 10.000.000',
    commonMistake: 'Salah mengkategorikan sewa gedung ke PPh 23 (2%).',
  },
  {
    topicSlug: 'pph-potput',
    difficulty: 3,
    question: 'Berapakah tarif PPh Pasal 22 yang dipungut oleh Bendaharawan Pemerintah atas pembelian barang yang dananya bersumber dari APBN/APBD dengan nilai transaksi di atas Rp 2.000.000?',
    options: ['0,5%', '1,5%', '2,0%', '11%'],
    correctAnswer: '1,5%',
    shortExplanation: 'Pemungutan PPh Pasal 22 oleh Bendaharawan Pemerintah atas pembelian barang adalah sebesar 1,5% dari harga pembelian tidak termasuk PPN.',
    fullExplanation: 'Berdasarkan PMK 34/PMK.010/2017 stdd PMK 41/PMK.010/2022, pemungutan PPh Pasal 22 oleh bendahara pemerintah atas pembelian barang adalah 1,5% dari harga beli (DPP tidak termasuk PPN). Batas transaksi yang tidak dipungut PPh 22 adalah paling banyak Rp 2.000.000 tidak termasuk PPN dan bukan merupakan pembayaran yang dipecah-pecah.',
    whyCorrect: 'Tarif PPh 22 Bendaharawan adalah 1,5% dari harga jual sebelum PPN.',
    concept: 'PPh Pasal 22 Bendaharawan Pemerintah',
    formula: 'PPh 22 = 1,5% × Harga Beli (DPP)',
  },

  // 5. PPN & PPnBM
  {
    topicSlug: 'ppn-ppnbm',
    difficulty: 2,
    question: 'Berdasarkan UU Harmonisasi Peraturan Perpajakan (UU HPP), tarif Pajak Pertambahan Nilai (PPN) yang mulai berlaku sejak 1 April 2022 adalah sebesar...',
    options: ['10%', '11%', '12%', '15%'],
    correctAnswer: '11%',
    shortExplanation: 'UU HPP menetapkan kenaikan tarif PPN menjadi 11% per 1 April 2022 dan 12% paling lambat 1 Januari 2025.',
    fullExplanation: 'Pasal 7 ayat (1) UU PPN sebagaimana diubah dengan UU HPP mengatur tarif PPN:\n- Sebesar 11% yang mulai berlaku pada tanggal 1 April 2022\n- Sebesar 12% yang mulai berlaku paling lambat pada tanggal 1 Januari 2025\n- Tarif PPN 0% diterapkan atas ekspor BKP Berwujud, BKP Tidak Berwujud, dan JKP.',
    whyCorrect: 'Per 1 April 2022 tarif resmi PPN adalah 11%.',
    concept: 'Tarif Pajak Pertambahan Nilai (PPN) UU HPP',
  },
  {
    topicSlug: 'ppn-ppnbm',
    difficulty: 3,
    question: 'PKP PT Sentosa pada masa pajak Mei 2024 memiliki PPN Keluaran sebesar Rp 150.000.000 dan PPN Masukan yang dapat dikreditkan sebesar Rp 90.000.000. Bagaimanakah status SPT Masa PPN PT Sentosa?',
    options: [
      'PPN Kurang Bayar sebesar Rp 60.000.000',
      'PPN Lebih Bayar sebesar Rp 60.000.000',
      'PPN Nihil',
      'PPN Kurang Bayar sebesar Rp 150.000.000',
    ],
    correctAnswer: 'PPN Kurang Bayar sebesar Rp 60.000.000',
    shortExplanation: 'PPN Keluaran (150 jt) lebih besar dari PPN Masukan (90 jt), sehingga terjadi PPN Kurang Bayar sebesar Rp 60.000.000.',
    fullExplanation: 'Mekanisme pengkreditan PPN:\nJika Pajak Keluaran > Pajak Masukan = Kurang Bayar (wajib disetor ke kas negara sebelum SPT Masa PPN disampaikan).\nPerhitungan: Rp 150.000.000 - Rp 90.000.000 = Rp 60.000.000 (Kurang Bayar).',
    whyCorrect: 'Pajak Keluaran (150 Jt) - Pajak Masukan (90 Jt) = Kurang Bayar 60 Jt.',
    concept: 'Mekanisme Pengkreditan Pajak Masukan terhadap Pajak Keluaran',
    formula: 'PPN Terutang = Pajak Keluaran - Pajak Masukan',
    calculation: '150.000.000 - 90.000.000 = 60.000.000 (Kurang Bayar)',
  },

  // 6. KUP (Ketentuan Umum & Tata Cara Perpajakan)
  {
    topicSlug: 'kup-dasar',
    difficulty: 2,
    question: 'Kapan batas akhir penyampaian Surat Pemberitahuan (SPT) Tahunan PPh Wajib Pajak Orang Pribadi?',
    options: [
      'Paling lambat 3 (tiga) bulan setelah akhir Tahun Pajak (31 Maret)',
      'Paling lambat 4 (empat) bulan setelah akhir Tahun Pajak (30 April)',
      'Paling lambat 20 hari setelah akhir Masa Pajak',
      'Paling lambat akhir bulan berikutnya',
    ],
    correctAnswer: 'Paling lambat 3 (tiga) bulan setelah akhir Tahun Pajak (31 Maret)',
    shortExplanation: 'Batas akhir pelaporan SPT Tahunan PPh Orang Pribadi adalah paling lama 3 bulan setelah akhir Tahun Pajak (31 Maret untuk tahun kalender).',
    fullExplanation: 'Berdasarkan Pasal 3 ayat (3) UU KUP:\n- SPT Tahunan PPh Orang Pribadi: paling lambat 3 bulan setelah akhir Tahun Pajak (biasanya 31 Maret)\n- SPT Tahunan PPh Badan: paling lambat 4 bulan setelah akhir Tahun Pajak (biasanya 30 April)\n- SPT Masa: paling lambat 20 hari setelah akhir Masa Pajak.',
    whyCorrect: 'Sesuai Pasal 3 ayat (3) huruf b UU KUP, batas lapor SPT Tahunan OP adalah 3 bulan setelah akhir tahun pajak.',
    concept: 'Batas Waktu Penyampaian SPT Menurut UU KUP',
  },
  {
    topicSlug: 'kup-dasar',
    difficulty: 3,
    question: 'Berapakah sanksi administrasi denda karena terlambat menyampaikan SPT Tahunan PPh Wajib Pajak Badan sesuai Pasal 7 UU KUP?',
    options: ['Rp 100.000', 'Rp 500.000', 'Rp 1.000.000', 'Rp 10.000.000'],
    correctAnswer: 'Rp 1.000.000',
    shortExplanation: 'Sanksi denda keterlambatan penyampaian SPT Tahunan PPh Badan adalah sebesar Rp 1.000.000.',
    fullExplanation: 'Berdasarkan Pasal 7 ayat (1) UU KUP, sanksi administrasi berupa denda keterlambatan penyampaian SPT:\n1. SPT Masa PPN: Rp 500.000\n2. SPT Masa Lainnya: Rp 100.000\n3. SPT Tahunan PPh Orang Pribadi: Rp 100.000\n4. SPT Tahunan PPh Badan: Rp 1.000.000.',
    whyCorrect: 'Denda keterlambatan SPT Tahunan Badan adalah Rp 1.000.000.',
    concept: 'Sanksi Administrasi Keterlambatan Pelaporan SPT (Pasal 7 UU KUP)',
  },

  // 7. Akuntansi Pajak & Rekonsiliasi Fiskal
  {
    topicSlug: 'akuntansi-pajak',
    difficulty: 3,
    question: 'Bagaimanakah pencatatan jurnal akuntansi yang dibuat oleh pihak pembeli (PKP) saat membeli barang dagangan secara tunai sebesar Rp 10.000.000 ditambah PPN 11%?',
    options: [
      '(D) Pembelian Rp 10.000.000, (D) PPN Masukan Rp 1.100.000 | (K) Kas Rp 11.100.000',
      '(D) Pembelian Rp 10.000.000, (D) PPN Keluaran Rp 1.100.000 | (K) Kas Rp 11.100.000',
      '(D) Pembelian Rp 11.100.000 | (K) Kas Rp 11.100.000',
      '(D) Kas Rp 11.100.000 | (K) Pembelian Rp 10.000.000, (K) PPN Masukan Rp 1.100.000',
    ],
    correctAnswer: '(D) Pembelian Rp 10.000.000, (D) PPN Masukan Rp 1.100.000 | (K) Kas Rp 11.100.000',
    shortExplanation: 'PPN yang dibayar saat pembelian dicatat pada akun PPN Masukan di sisi Debit.',
    fullExplanation: 'Bagi pembeli yang merupakan PKP, PPN yang dibayar merupakan Pajak Masukan (Aset Lancar / Piutang Pajak) yang dapat dikreditkan, sehingga dicatat di sisi Debit:\n- (D) Pembelian / Persediaan Rp 10.000.000\n- (D) PPN Masukan Rp 1.100.000\n- (K) Kas / Bank Rp 11.100.000.',
    whyCorrect: 'PPN Masukan merupakan hak kredit pajak di sisi Debit.',
    concept: 'Jurnal Akuntansi PPN Masukan',
    formula: 'PPN Masukan = 11% × Rp 10.000.000 = Rp 1.100.000',
  },
  {
    topicSlug: 'akuntansi-pajak',
    difficulty: 4,
    question: 'Perbedaan temporer (beda waktu) antara akuntansi komersial dan akuntansi fiskal timbul akibat hal-hal berikut, KECUALI...',
    options: [
      'Perbedaan metode penyusutan aktiva tetap',
      'Perbedaan masa manfaat amortisasi harta tak berwujud',
      'Biaya jamuan representasi tanpa daftar nominatif',
      'Pengakuan pendapatan sewa diterima di muka',
    ],
    correctAnswer: 'Biaya jamuan representasi tanpa daftar nominatif',
    shortExplanation: 'Biaya entertainment/jamuan tanpa daftar nominatif merupakan perbedaan permanen (beda tetap), bukan beda waktu.',
    fullExplanation: 'Perbedaan Permanen (Beda Tetap) timbul karena pengeluaran tersebut selamanya tidak diakui secara fiskal (Pasal 9 UU PPh), contohnya biaya jamuan tanpa daftar nominatif (PMK 02/2010).\nSedangkan metode penyusutan, amortisasi, dan pendapatan sewa diterima di muka merupakan Beda Waktu (Temporary Difference) yang di masa depan akan terpulihkan.',
    whyCorrect: 'Jamuan tanpa daftar nominatif selamanya tidak diakui (Beda Tetap / Beda Permanen).',
    concept: 'Rekonsiliasi Fiskal: Beda Tetap vs Beda Waktu',
  },
  // 8. PBB, BPHTB & Bea Meterai
  {
    topicSlug: 'pbb-bphtb-meterai',
    difficulty: 2,
    question: 'Berdasarkan UU No. 10 Tahun 2020 tentang Bea Meterai, tarif tunggal Bea Meterai yang berlaku saat ini adalah...',
    options: ['Rp 3.000', 'Rp 6.000', 'Rp 10.000', 'Rp 12.000'],
    correctAnswer: 'Rp 10.000',
    shortExplanation: 'UU No. 10/2020 menetapkan tarif tunggal Bea Meterai sebesar Rp 10.000.',
    fullExplanation: 'Berdasarkan UU No. 10 Tahun 2020, sejak 1 Januari 2021 tarif Bea Meterai disederhanakan menjadi tarif tunggal tetap Rp 10.000 untuk dokumen yang menyatakan jumlah uang dengan nilai nominal lebih dari Rp 5.000.000.',
    whyCorrect: 'Tarif tunggal UU Bea Meterai No. 10/2020 adalah Rp 10.000.',
    concept: 'Ketentuan Tarif Bea Meterai UU 10/2020',
  },
  {
    topicSlug: 'pbb-bphtb-meterai',
    difficulty: 3,
    question: 'Tuan Budi membeli sebidang tanah dengan Nilai Perolehan Objek Pajak (NPOP) Rp 500.000.000. Jika NPOPTKP daerah setempat ditetapkan Rp 80.000.000 dan tarif BPHTB 5%, berapakah BPHTB terutang?',
    options: ['Rp 21.000.000', 'Rp 25.000.000', 'Rp 15.000.000', 'Rp 42.000.000'],
    correctAnswer: 'Rp 21.000.000',
    shortExplanation: 'BPHTB dihitung: 5% × (NPOP - NPOPTKP) = 5% × (500 Jt - 80 Jt) = Rp 21.000.000.',
    fullExplanation: 'Dasar Pengenaan Pajak BPHTB adalah NPOP Kena Pajak (NPOPKP) = NPOP - NPOPTKP.\nNPOPKP = Rp 500.000.000 - Rp 80.000.000 = Rp 420.000.000.\nBPHTB Terutang = 5% × Rp 420.000.000 = Rp 21.000.000.',
    whyCorrect: 'Rumus BPHTB: 5% × (NPOP - NPOPTKP).',
    concept: 'Perhitungan BPHTB',
    formula: 'BPHTB = 5% × (NPOP - NPOPTKP)',
    calculation: '5% × (500.000.000 - 80.000.000) = 5% × 420.000.000 = 21.000.000',
  },

  // 9. Pemeriksaan & Sengketa Pajak
  {
    topicSlug: 'pemeriksaan-sengketa',
    difficulty: 3,
    question: 'Berapakah jangka waktu yang dimiliki Wajib Pajak untuk mengajukan Surat Keberatan atas suatu Surat Ketetapan Pajak (SKP) sejak tanggal dikirim/ditetapkan?',
    options: [
      'Paling lama 1 (satu) bulan',
      'Paling lama 3 (tiga) bulan',
      'Paling lama 6 (enam) bulan',
      'Paling lama 12 (dua belas) bulan',
    ],
    correctAnswer: 'Paling lama 3 (tiga) bulan',
    shortExplanation: 'Sesuai Pasal 25 ayat (3) UU KUP, keberatan harus diajukan dalam jangka waktu 3 (tiga) bulan sejak tanggal dikirim surat ketetapan pajak.',
    fullExplanation: 'Pasal 25 ayat (3) UU KUP menyatakan bahwa keberatan harus diajukan dalam jangka waktu 3 (tiga) bulan sejak tanggal dikirim surat ketetapan pajak atau sejak tanggal pemotongan/pemungutan pajak oleh pihak ketiga, kecuali apabila Wajib Pajak dapat menunjukkan bahwa jangka waktu tersebut tidak dapat dipenuhi karena keadaan di luar kekuasaannya (force majeure).',
    whyCorrect: 'Pasal 25 ayat (3) UU KUP menetapkan batas waktu 3 bulan untuk mengajukan keberatan.',
    concept: 'Prosedur dan Jangka Waktu Pengajuan Keberatan Pajak',
  },
  {
    topicSlug: 'pemeriksaan-sengketa',
    difficulty: 4,
    question: 'Apabila permohonan Banding Wajib Pajak ditolak atau dikabulkan sebagian oleh Pengadilan Pajak, berapakah sanksi denda yang dikenakan kepada Wajib Pajak sesuai UU HPP?',
    options: ['30%', '50%', '60%', '100%'],
    correctAnswer: '60%',
    shortExplanation: 'UU HPP menurunkan sanksi denda jika banding ditolak dari semula 100% menjadi 60%.',
    fullExplanation: 'Berdasarkan Pasal 27 ayat (5d) UU KUP stdd UU HPP No. 7/2021, dalam hal permohonan banding ditolak atau dikabulkan sebagian, Wajib Pajak dikenai sanksi administratif berupa denda sebesar 60% dari jumlah pajak berdasarkan Putusan Banding dikurangi dengan pembayaran pajak yang telah dibayar sebelum mengajukan keberatan.',
    whyCorrect: 'Sanksi denda putusan banding ditolak adalah 60% berdasarkan UU HPP (sebelumnya 100%).',
    concept: 'Sanksi Administratif Putusan Banding Pengadilan Pajak',
  },
]

async function main() {
  console.log('🌱 Starting Brevet Quiz Database Seeder...')

  // 1. Seed Categories & Topics
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        order: cat.order,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        order: cat.order,
        isActive: true,
      },
    })

    console.log(`📁 Category: ${category.name}`)

    for (const t of cat.topics) {
      await prisma.topic.upsert({
        where: { slug: t.slug },
        update: {
          name: t.name,
          order: t.order,
          categoryId: category.id,
          isActive: true,
        },
        create: {
          name: t.name,
          slug: t.slug,
          order: t.order,
          categoryId: category.id,
          isActive: true,
        },
      })
      console.log(`  ↳ Topic: ${t.name}`)
    }
  }

  // 2. Seed Questions
  console.log('\n📝 Seeding Brevet Quiz Questions...')
  let questionCount = 0

  for (const q of questions) {
    const topic = await prisma.topic.findUnique({
      where: { slug: q.topicSlug },
    })

    if (!topic) {
      console.warn(`⚠️ Topic not found for slug: ${q.topicSlug}`)
      continue
    }

    // Check if question text already exists to avoid duplicates
    const existing = await prisma.question.findFirst({
      where: { question: q.question },
    })

    if (!existing) {
      await prisma.question.create({
        data: {
          topicId: topic.id,
          categoryId: topic.categoryId,
          difficulty: q.difficulty,
          questionType: 'multiple_choice',
          question: q.question,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          shortExplanation: q.shortExplanation,
          fullExplanation: q.fullExplanation,
          whyCorrect: q.whyCorrect,
          whyWrong: q.whyWrong,
          concept: q.concept,
          formula: q.formula,
          calculation: q.calculation,
          commonMistake: q.commonMistake,
          status: 'APPROVED',
        },
      })
      questionCount++
    }
  }

  // Deactivate categories and topics not in our active list
  const activeCategorySlugs = categories.map((c) => c.slug)
  await prisma.category.updateMany({
    where: { slug: { notIn: activeCategorySlugs } },
    data: { isActive: false },
  })

  const activeTopicSlugs = categories.flatMap((c) => c.topics.map((t) => t.slug))
  await prisma.topic.updateMany({
    where: { slug: { notIn: activeTopicSlugs } },
    data: { isActive: false },
  })

  // Update question counts on topics
  const allTopics = await prisma.topic.findMany({ where: { isActive: true } })
  for (const t of allTopics) {
    const count = await prisma.question.count({ where: { topicId: t.id, status: 'APPROVED' } })
    await prisma.topic.update({
      where: { id: t.id },
      data: { questionCount: count },
    })
  }

  console.log(`\n🎉 Seeding complete! Added ${questionCount} new questions. Total active topics updated.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
