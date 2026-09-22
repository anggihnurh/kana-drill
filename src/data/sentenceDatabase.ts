import { SentenceEntry } from '../types/drill';

/**
 * Database Kalimat Minna no Nihongo I & II
 * Mencakup kalimat-kalimat representatif dari Bab 1–25 (MNN I) & Bab 26–30 (MNN II).
 * Setiap entri adalah 1–3 kalimat pendek yang membentuk 1 soal Bun.
 *
 * Aturan validRomaji:
 * - Menggunakan spasi antar kata & partikel (Sistem Hepburn Standar)
 * - Semua lowercase, tanpa tanda baca (titik/koma)
 * - Partikel は → wa (alternatif 'ha'), を → wo (alternatif 'o'), へ → e (alternatif 'he')
 * - Panjang vokal: おう/おお → ou/oo, うう → uu
 * - Elemen pertama validRomaji[0] digunakan sebagai teks acuan utama (typing target)
 */
export const SENTENCE_DATABASE: SentenceEntry[] = [
  // =========================================================================
  // BAB 1: PERKENALAN & IDENTITAS
  // =========================================================================
  {
    id: 'sen_b1_001',
    kana: 'わたしはがくせいです。',
    meaning: 'Saya adalah pelajar.',
    validRomaji: ['watashi wa gakusei desu', 'watashi ha gakusei desu', 'watasi wa gakusei desu', 'watashihagakuseidesu'],
    chapter: 1,
  },
  {
    id: 'sen_b1_002',
    kana: 'あなたはせんせいですか。',
    meaning: 'Apakah Anda seorang guru?',
    validRomaji: ['anata wa sensei desu ka', 'anata ha sensei desu ka', 'anatawasenseidesuka'],
    chapter: 1,
  },
  {
    id: 'sen_b1_003',
    kana: 'わたしはかいしゃいんです。',
    meaning: 'Saya adalah karyawan perusahaan.',
    validRomaji: ['watashi wa kaishain desu', 'watashi ha kaishain desu', 'watasi wa kaisyain desu', 'watashihakaishaindesu'],
    chapter: 1,
  },
  {
    id: 'sen_b1_004',
    kana: 'あのひとはいしゃです。',
    meaning: 'Orang itu adalah dokter.',
    validRomaji: ['ano hito wa isha desu', 'ano hito ha isha desu', 'ano hito wa isya desu', 'anohitowaishadesu'],
    chapter: 1,
  },
  {
    id: 'sen_b1_005',
    kana: 'わたしはにほんごのがくせいです。',
    meaning: 'Saya adalah pelajar bahasa Jepang.',
    validRomaji: ['watashi wa nihongo no gakusei desu', 'watashi ha nihongo no gakusei desu', 'watasi wa nihongo no gakusei desu'],
    chapter: 1,
  },

  // =========================================================================
  // BAB 2: BENDA-BENDA MILIK
  // =========================================================================
  {
    id: 'sen_b2_001',
    kana: 'これはほんです。',
    meaning: 'Ini adalah buku.',
    validRomaji: ['kore wa hon desu', 'kore ha hon desu', 'korewahondesu'],
    chapter: 2,
  },
  {
    id: 'sen_b2_002',
    kana: 'あれはだれのかばんですか。',
    meaning: 'Tas itu punya siapa?',
    validRomaji: ['are wa dare no kaban desu ka', 'are ha dare no kaban desu ka', 'arewadarenokabandesuka'],
    chapter: 2,
  },
  {
    id: 'sen_b2_003',
    kana: 'これはわたしのじしょです。',
    meaning: 'Ini adalah kamus saya.',
    validRomaji: ['kore wa watashi no jisho desu', 'kore ha watashi no jisho desu', 'kore wa watasi no zisho desu'],
    chapter: 2,
  },
  {
    id: 'sen_b2_004',
    kana: 'それはざっしですか。いいえ、しんぶんです。',
    meaning: 'Itu majalah? Bukan, ini koran.',
    validRomaji: ['sore wa zasshi desu ka iie shinbun desu', 'sore ha zasshi desu ka iie shinbun desu', 'sorehazasshidesukaiieshinbundesu'],
    chapter: 2,
  },

  // =========================================================================
  // BAB 3: TEMPAT & KEBERADAAN
  // =========================================================================
  {
    id: 'sen_b3_001',
    kana: 'トイレはどこですか。',
    meaning: 'Di mana toilet?',
    validRomaji: ['toire wa doko desu ka', 'toire ha doko desu ka', 'toirehadokodesuka'],
    chapter: 3,
  },
  {
    id: 'sen_b3_002',
    kana: 'ぎんこうはあそこです。',
    meaning: 'Bank ada di sana.',
    validRomaji: ['ginkou wa asoko desu', 'ginkou ha asoko desu', 'ginko wa asoko desu', 'ginkouhaasokodesu'],
    chapter: 3,
  },
  {
    id: 'sen_b3_003',
    kana: 'ほんやはえきのまえです。',
    meaning: 'Toko buku ada di depan stasiun.',
    validRomaji: ['honya wa eki no mae desu', 'honya ha eki no mae desu', 'honyahaekinomaedesu'],
    chapter: 3,
  },
  {
    id: 'sen_b3_004',
    kana: 'デパートはびょういんのとなりです。',
    meaning: 'Department store ada di sebelah rumah sakit.',
    validRomaji: ['depaato wa byouin no tonari desu', 'depa-to wa byouin no tonari desu', 'depato wa byouin no tonari desu', 'depaato ha byouin no tonari desu'],
    chapter: 3,
  },

  // =========================================================================
  // BAB 4: WAKTU & JADWAL
  // =========================================================================
  {
    id: 'sen_b4_001',
    kana: 'いまなんじですか。',
    meaning: 'Sekarang jam berapa?',
    validRomaji: ['ima nan ji desu ka', 'ima nanji desu ka', 'imananjidesuka'],
    chapter: 4,
  },
  {
    id: 'sen_b4_002',
    kana: 'ぎんこうはくじからごじまでです。',
    meaning: 'Bank buka dari jam 9 sampai jam 5.',
    validRomaji: ['ginkou wa kuji kara goji made desu', 'ginkou ha kuji kara goji made desu', 'ginkouhakujikaragojimadedesu'],
    chapter: 4,
  },
  {
    id: 'sen_b4_003',
    kana: 'やすみはなんようびですか。',
    meaning: 'Hari liburnya hari apa?',
    validRomaji: ['yasumi wa nanyoubi desu ka', 'yasumi ha nanyoubi desu ka', 'yasumi wa nan youbi desu ka'],
    chapter: 4,
  },
  {
    id: 'sen_b4_004',
    kana: 'にちようびはやすみです。',
    meaning: 'Hari Minggu adalah hari libur.',
    validRomaji: ['nichiyoubi wa yasumi desu', 'nichiyoubi ha yasumi desu', 'nitiyoubi wa yasumi desu'],
    chapter: 4,
  },

  // =========================================================================
  // BAB 5: PERGI KE & TRANSPORTASI
  // =========================================================================
  {
    id: 'sen_b5_001',
    kana: 'わたしはまいにちでんしゃできます。',
    meaning: 'Saya pergi dengan kereta setiap hari.',
    validRomaji: ['watashi wa mainichi densha de kimasu', 'watashi ha mainichi densha de kimasu', 'watasi wa mainichi densha de kimasu'],
    chapter: 5,
  },
  {
    id: 'sen_b5_002',
    kana: 'かいしゃへなんできますか。',
    meaning: 'Pergi ke kantor naik apa?',
    validRomaji: ['kaisha e nan de kimasu ka', 'kaisha he nan de kimasu ka', 'kaisa e nan de kimasu ka'],
    chapter: 5,
  },
  {
    id: 'sen_b5_003',
    kana: 'おおさかからとうきょうまでしんかんせんできます。',
    meaning: 'Dari Osaka ke Tokyo naik shinkansen.',
    validRomaji: ['oosaka kara toukyou made shinkansen de kimasu', 'osaka kara tokyo made shinkansen de kimasu', 'oosakakaratoukyoumadeshinkansendekimasu'],
    chapter: 5,
  },

  // =========================================================================
  // BAB 6: BELANJA & HARGA
  // =========================================================================
  {
    id: 'sen_b6_001',
    kana: 'このりんごはいくらですか。',
    meaning: 'Berapa harga apel ini?',
    validRomaji: ['kono ringo wa ikura desu ka', 'kono ringo ha ikura desu ka', 'konoringowaikuradesuka'],
    chapter: 6,
  },
  {
    id: 'sen_b6_002',
    kana: 'このかばんをください。',
    meaning: 'Tolong berikan tas ini.',
    validRomaji: ['kono kaban wo kudasai', 'kono kaban o kudasai', 'konokabanwokudasai'],
    chapter: 6,
  },
  {
    id: 'sen_b6_003',
    kana: 'みかんをみっつください。',
    meaning: 'Tolong berikan tiga buah jeruk.',
    validRomaji: ['mikan wo mittsu kudasai', 'mikan o mittsu kudasai', 'mikanwomittsukudasai'],
    chapter: 6,
  },

  // =========================================================================
  // BAB 7: AKTIVITAS SEHARI-HARI
  // =========================================================================
  {
    id: 'sen_b7_001',
    kana: 'わたしはまいあさはちじにおきます。',
    meaning: 'Saya bangun setiap pagi jam 8.',
    validRomaji: ['watashi wa maiasa hachiji ni okimasu', 'watashi ha mai asa hachiji ni okimasu', 'watasi wa maiasa hatiji ni okimasu'],
    chapter: 7,
  },
  {
    id: 'sen_b7_002',
    kana: 'きのうなにをしましたか。',
    meaning: 'Kemarin Anda melakukan apa?',
    validRomaji: ['kinou nani wo shimashita ka', 'kinou nani o shimashita ka', 'kino nani wo simasita ka'],
    chapter: 7,
  },
  {
    id: 'sen_b7_003',
    kana: 'わたしはかいしゃでしごとをします。',
    meaning: 'Saya bekerja di kantor.',
    validRomaji: ['watashi wa kaisha de shigoto wo shimasu', 'watashi ha kaisha de shigoto o shimasu', 'watasihakaishadeshigotowoshimasu'],
    chapter: 7,
  },
  {
    id: 'sen_b7_004',
    kana: 'にちようびにどこへいきますか。',
    meaning: 'Hari Minggu Anda pergi ke mana?',
    validRomaji: ['nichiyoubi ni doko e ikimasu ka', 'nichiyoubi ni doko he ikimasu ka', 'nichiyoubini dokoe ikimasuka'],
    chapter: 7,
  },

  // =========================================================================
  // BAB 8: HOBBY & KESENANGAN
  // =========================================================================
  {
    id: 'sen_b8_001',
    kana: 'しゅみはなんですか。',
    meaning: 'Apa hobi Anda?',
    validRomaji: ['shumi wa nan desu ka', 'shumi ha nan desu ka', 'syumi wa nandesuka'],
    chapter: 8,
  },
  {
    id: 'sen_b8_002',
    kana: 'わたしはおんがくをきくのがすきです。',
    meaning: 'Saya suka mendengarkan musik.',
    validRomaji: ['watashi wa ongaku wo kiku no ga suki desu', 'watashi ha ongaku o kiku no ga suki desu'],
    chapter: 8,
  },
  {
    id: 'sen_b8_003',
    kana: 'スポーツはあまりすきじゃありません。',
    meaning: 'Saya tidak terlalu suka olahraga.',
    validRomaji: ['supootsu wa amari suki ja arimasen', 'supo-tsu ha amari suki ja arimasen', 'supootsu ha amari suki dewa arimasen'],
    chapter: 8,
  },
  {
    id: 'sen_b8_004',
    kana: 'どんなおんがくがすきですか。',
    meaning: 'Anda suka musik seperti apa?',
    validRomaji: ['donna ongaku ga suki desu ka', 'donnaongakugasukidesuka'],
    chapter: 8,
  },

  // =========================================================================
  // BAB 9: DESKRIPSI TEMPAT
  // =========================================================================
  {
    id: 'sen_b9_001',
    kana: 'このまちはとてもにぎやかです。',
    meaning: 'Kota ini sangat ramai.',
    validRomaji: ['kono machi wa totemo nigiyaka desu', 'kono machi ha totemo nigiyaka desu'],
    chapter: 9,
  },
  {
    id: 'sen_b9_002',
    kana: 'やまはしずかできれいです。',
    meaning: 'Gunung itu tenang dan indah.',
    validRomaji: ['yama wa shizuka de kirei desu', 'yama ha shizuka de kirei desu', 'yama wa sizuka de kirei desu'],
    chapter: 9,
  },
  {
    id: 'sen_b9_003',
    kana: 'このレストランはしずかでゆうめいです。',
    meaning: 'Restoran ini tenang dan terkenal.',
    validRomaji: ['kono resutoran wa shizuka de yuumei desu', 'kono resutoran ha shizuka de yuumei desu'],
    chapter: 9,
  },

  // =========================================================================
  // BAB 10: SIFAT & KATA SIFAT
  // =========================================================================
  {
    id: 'sen_b10_001',
    kana: 'このほんはおもしろいですか。',
    meaning: 'Apakah buku ini menarik?',
    validRomaji: ['kono hon wa omoshiroi desu ka', 'kono hon ha omoshiroi desu ka'],
    chapter: 10,
  },
  {
    id: 'sen_b10_002',
    kana: 'そのかばんはたかくてかるいです。',
    meaning: 'Tas itu mahal tapi ringan.',
    validRomaji: ['sono kaban wa takakute karui desu', 'sono kaban ha takakute karui desu'],
    chapter: 10,
  },
  {
    id: 'sen_b10_003',
    kana: 'にほんのふゆはさむいです。',
    meaning: 'Musim dingin di Jepang sangat dingin.',
    validRomaji: ['nihon no fuyu wa samui desu', 'nihon no fuyu ha samui desu'],
    chapter: 10,
  },
  {
    id: 'sen_b10_004',
    kana: 'きょうはあまりあつくないです。',
    meaning: 'Hari ini tidak terlalu panas.',
    validRomaji: ['kyou wa amari atsuku nai desu', 'kyou ha amari atsuku nai desu'],
    chapter: 10,
  },

  // =========================================================================
  // BAB 11: KEGIATAN YANG BISA DILAKUKAN
  // =========================================================================
  {
    id: 'sen_b11_001',
    kana: 'わたしはにほんごがはなせます。',
    meaning: 'Saya bisa berbicara bahasa Jepang.',
    validRomaji: ['watashi wa nihongo ga hanasemasu', 'watashi ha nihongo ga hanasemasu'],
    chapter: 11,
  },
  {
    id: 'sen_b11_002',
    kana: 'あなたはピアノがひけますか。',
    meaning: 'Bisakah Anda bermain piano?',
    validRomaji: ['anata wa piano ga hikemasu ka', 'anata ha piano ga hikemasu ka'],
    chapter: 11,
  },
  {
    id: 'sen_b11_003',
    kana: 'かんじはすこしかけます。',
    meaning: 'Saya bisa menulis sedikit kanji.',
    validRomaji: ['kanji wa sukoshi kakemasu', 'kanji ha sukoshi kakemasu'],
    chapter: 11,
  },

  // =========================================================================
  // BAB 12: RENCANA & KEINGINAN
  // =========================================================================
  {
    id: 'sen_b12_001',
    kana: 'らいねんにほんへいきたいです。',
    meaning: 'Tahun depan saya ingin pergi ke Jepang.',
    validRomaji: ['rainen nihon e ikitai desu', 'rainen nihon he ikitai desu'],
    chapter: 12,
  },
  {
    id: 'sen_b12_002',
    kana: 'なにかのみたいですか。',
    meaning: 'Apakah Anda ingin minum sesuatu?',
    validRomaji: ['nanika nomitai desu ka', 'nanika nomitaidesuka'],
    chapter: 12,
  },
  {
    id: 'sen_b12_003',
    kana: 'たなかさんはかいがいりょこうがしたいそうです。',
    meaning: 'Katanya Tanaka-san ingin berwisata ke luar negeri.',
    validRomaji: ['tanaka san wa kaigai ryokou ga shitai sou desu', 'tanaka san ha kaigai ryokou ga shitai sou desu'],
    chapter: 12,
  },

  // =========================================================================
  // BAB 13: PERMINTAAN & IZIN
  // =========================================================================
  {
    id: 'sen_b13_001',
    kana: 'まどをあけてもいいですか。',
    meaning: 'Bolehkah saya membuka jendela?',
    validRomaji: ['mado wo akete mo ii desu ka', 'mado o akete mo ii desu ka'],
    chapter: 13,
  },
  {
    id: 'sen_b13_002',
    kana: 'ここでたばこをすってはいけません。',
    meaning: 'Di sini tidak boleh merokok.',
    validRomaji: ['koko de tabako wo sutte wa ikemasen', 'koko de tabako o sutte ha ikemasen'],
    chapter: 13,
  },
  {
    id: 'sen_b13_003',
    kana: 'でんわをかけてもいいですか。',
    meaning: 'Bolehkah saya menggunakan telepon?',
    validRomaji: ['denwa wo kakete mo ii desu ka', 'denwa o kakete mo ii desu ka'],
    chapter: 13,
  },

  // =========================================================================
  // BAB 14: MEMBERIKAN & MENERIMA
  // =========================================================================
  {
    id: 'sen_b14_001',
    kana: 'たなかさんはわたしにほんをくれました。',
    meaning: 'Tanaka-san memberi saya buku.',
    validRomaji: ['tanaka san wa watashi ni hon wo kuremashita', 'tanaka san ha watashi ni hon o kuremashita'],
    chapter: 14,
  },
  {
    id: 'sen_b14_002',
    kana: 'わたしはともだちにプレゼントをあげました。',
    meaning: 'Saya memberi teman hadiah.',
    validRomaji: ['watashi wa tomodachi ni purezento wo agemashita', 'watashi ha tomodachi ni purezento o agemashita'],
    chapter: 14,
  },

  // =========================================================================
  // BAB 15: ALASAN & KONDISI
  // =========================================================================
  {
    id: 'sen_b15_001',
    kana: 'あたまがいたいので、かいしゃをやすみました。',
    meaning: 'Karena kepala sakit, saya tidak masuk kantor.',
    validRomaji: ['atama ga itai node kaisha wo yasumimashita', 'atama ga itai node kaisha o yasumimashita'],
    chapter: 15,
  },
  {
    id: 'sen_b15_002',
    kana: 'あめがふっているので、うちにいます。',
    meaning: 'Karena hujan, saya di rumah.',
    validRomaji: ['ame ga futte iru node uchi ni imasu', 'ame ga futteiru node uchi ni imasu'],
    chapter: 15,
  },

  // =========================================================================
  // BAB 16: PERASAAN & KONDISI FISIK
  // =========================================================================
  {
    id: 'sen_b16_001',
    kana: 'きょうはかぜをひいています。',
    meaning: 'Hari ini saya sedang masuk angin.',
    validRomaji: ['kyou wa kaze wo hiite imasu', 'kyou ha kaze o hiite imasu'],
    chapter: 16,
  },
  {
    id: 'sen_b16_002',
    kana: 'ねつがあるので、びょういんへいきます。',
    meaning: 'Karena demam, saya pergi ke rumah sakit.',
    validRomaji: ['netsu ga aru node byouin e ikimasu', 'netsu ga aru node byouin he ikimasu'],
    chapter: 16,
  },
  {
    id: 'sen_b16_003',
    kana: 'すこしつかれました。',
    meaning: 'Saya sedikit lelah.',
    validRomaji: ['sukoshi tsukaremashita', 'sukoshi tukaremashita'],
    chapter: 16,
  },

  // =========================================================================
  // BAB 17: PENGALAMAN
  // =========================================================================
  {
    id: 'sen_b17_001',
    kana: 'にほんへいったことがあります。',
    meaning: 'Saya pernah pergi ke Jepang.',
    validRomaji: ['nihon e itta koto ga arimasu', 'nihon he itta koto ga arimasu'],
    chapter: 17,
  },
  {
    id: 'sen_b17_002',
    kana: 'おすしをたべたことがありますか。',
    meaning: 'Pernahkah Anda makan sushi?',
    validRomaji: ['osushi wo tabeta koto ga arimasu ka', 'osushi o tabeta koto ga arimasu ka'],
    chapter: 17,
  },
  {
    id: 'sen_b17_003',
    kana: 'まだふじさんにのぼったことがありません。',
    meaning: 'Saya belum pernah mendaki Gunung Fuji.',
    validRomaji: ['mada fujisan ni nobotta koto ga arimasen'],
    chapter: 17,
  },

  // =========================================================================
  // BAB 18: INSTRUKSI & ARAH
  // =========================================================================
  {
    id: 'sen_b18_001',
    kana: 'このボタンをおしてください。',
    meaning: 'Tolong tekan tombol ini.',
    validRomaji: ['kono botan wo oshite kudasai', 'kono botan o oshite kudasai'],
    chapter: 18,
  },
  {
    id: 'sen_b18_002',
    kana: 'みぎにまがってください。',
    meaning: 'Tolong belok ke kanan.',
    validRomaji: ['migi ni magatte kudasai'],
    chapter: 18,
  },
  {
    id: 'sen_b18_003',
    kana: 'このかどをひだりにまがると、ゆうびんきょくがあります。',
    meaning: 'Belok kiri di pojok ini, ada kantor pos.',
    validRomaji: ['kono kado wo hidari ni magaru to yuubinkyoku ga arimasu', 'kono kado o hidari ni magaru to yuubinkyoku ga arimasu'],
    chapter: 18,
  },

  // =========================================================================
  // BAB 19: CUACA & MUSIM
  // =========================================================================
  {
    id: 'sen_b19_001',
    kana: 'きょうはいいてんきですね。',
    meaning: 'Hari ini cuacanya bagus ya.',
    validRomaji: ['kyou wa ii tenki desu ne', 'kyou ha ii tenki desu ne'],
    chapter: 19,
  },
  {
    id: 'sen_b19_002',
    kana: 'なつはあつくてきらいです。',
    meaning: 'Musim panas panas, saya tidak suka.',
    validRomaji: ['natsu wa atsukute kirai desu', 'natsu ha atsukute kirai desu'],
    chapter: 19,
  },
  {
    id: 'sen_b19_003',
    kana: 'はるはさくらがきれいです。',
    meaning: 'Di musim semi, bunga sakura indah.',
    validRomaji: ['haru wa sakura ga kirei desu', 'haru ha sakura ga kirei desu'],
    chapter: 19,
  },

  // =========================================================================
  // BAB 20: PERBANDINGAN
  // =========================================================================
  {
    id: 'sen_b20_001',
    kana: 'なつとふゆとどちらがすきですか。',
    meaning: 'Antara musim panas dan musim dingin, mana yang Anda suka?',
    validRomaji: ['natsu to fuyu to dochira ga suki desu ka'],
    chapter: 20,
  },
  {
    id: 'sen_b20_002',
    kana: 'このなかでいちばんやすいのはどれですか。',
    meaning: 'Yang paling murah di antara ini yang mana?',
    validRomaji: ['kono naka de ichiban yasui no wa dore desu ka', 'kono naka de ichiban yasui no ha dore desu ka'],
    chapter: 20,
  },
  {
    id: 'sen_b20_003',
    kana: 'バスよりでんしゃのほうがはやいです。',
    meaning: 'Kereta lebih cepat daripada bus.',
    validRomaji: ['basu yori densha no hou ga hayai desu'],
    chapter: 20,
  },

  // =========================================================================
  // BAB 21–25: GRAMMAR LANJUTAN MNN I
  // =========================================================================
  {
    id: 'sen_b21_001',
    kana: 'このしごとはかんたんですから、すぐできます。',
    meaning: 'Pekerjaan ini mudah, jadi bisa segera selesai.',
    validRomaji: ['kono shigoto wa kantan desu kara sugu dekimasu', 'kono shigoto ha kantan desu kara sugu dekimasu'],
    chapter: 21,
  },
  {
    id: 'sen_b22_001',
    kana: 'ともだちにあったとき、うれしかったです。',
    meaning: 'Ketika bertemu teman, saya sangat senang.',
    validRomaji: ['tomodachi ni atta toki ureshikatta desu'],
    chapter: 22,
  },
  {
    id: 'sen_b23_001',
    kana: 'このかばんはつかいやすいです。',
    meaning: 'Tas ini mudah digunakan.',
    validRomaji: ['kono kaban wa tsukai yasui desu', 'kono kaban ha tsukai yasui desu'],
    chapter: 23,
  },
  {
    id: 'sen_b24_001',
    kana: 'でんしゃがとまったとき、なにをしますか。',
    meaning: 'Apa yang Anda lakukan ketika kereta berhenti?',
    validRomaji: ['densha ga tomatta toki nani wo shimasu ka', 'densha ga tomatta toki nani o shimasu ka'],
    chapter: 24,
  },
  {
    id: 'sen_b25_001',
    kana: 'にほんごをべんきょうしているあいだに、ともだちができました。',
    meaning: 'Selama belajar bahasa Jepang, saya mendapat teman baru.',
    validRomaji: ['nihongo wo benkyou shite iru aida ni tomodachi ga dekimashita', 'nihongo o benkyou shite iru aida ni tomodachi ga dekimashita'],
    chapter: 25,
  },

  // =========================================================================
  // BAB 26–30: MNN II
  // =========================================================================
  {
    id: 'sen_b26_001',
    kana: 'かれはきっとくるとおもいます。',
    meaning: 'Saya pikir dia pasti akan datang.',
    validRomaji: ['kare wa kitto kuru to omoimasu', 'kare ha kitto kuru to omoimasu'],
    chapter: 26,
  },
  {
    id: 'sen_b27_001',
    kana: 'あしたあめがふるかもしれません。',
    meaning: 'Besok mungkin akan hujan.',
    validRomaji: ['ashita ame ga furu kamoshiremasen'],
    chapter: 27,
  },
  {
    id: 'sen_b28_001',
    kana: 'このでんしゃにのればよかったです。',
    meaning: 'Seandainya saya naik kereta ini tadi.',
    validRomaji: ['kono densha ni noreba yokatta desu'],
    chapter: 28,
  },
  {
    id: 'sen_b29_001',
    kana: 'せんせいにしつもんをするまえに、じぶんでかんがえなさい。',
    meaning: 'Sebelum bertanya kepada guru, pikirkan sendiri dulu.',
    validRomaji: ['sensei ni shitsumon wo suru mae ni jibun de kangaenasai', 'sensei ni shitsumon o suru mae ni jibun de kangaenasai'],
    chapter: 29,
  },
  {
    id: 'sen_b30_001',
    kana: 'このプロジェクトはせいこうしそうです。',
    meaning: 'Proyek ini tampaknya akan berhasil.',
    validRomaji: ['kono purojekuto wa seikou shisou desu', 'kono purojekuto ha seikou shisou desu'],
    chapter: 30,
  },
];
