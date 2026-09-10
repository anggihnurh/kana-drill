import { isRomajiMatch, katakanaToHiragana, hiraganaToKatakana } from './romajiValidator';

/**
 * Kamus Pemetaan Kanji & Homofon Bahasa Jepang yang Sering Dihasilkan Web Speech API (ja-JP)
 * Saat pengguna melafalkan kana tunggal atau kosakata umum, Speech Recognition
 * di peramban sering mengonversinya menjadi Kanji atau variasi tulisan tertentu.
 */
const RAW_KANJI_MAPPINGS: Record<string, string[]> = {
  // ==================== GOJUUON (VOKAL & KONSONAN) ====================
  あ: ['亜', '阿', '吾', '安', '愛', 'あ', 'ア'],
  い: ['胃', '伊', '意', '医', '井', '異', '以', '移', '衣', 'い', 'イ'],
  う: ['鵜', '宇', '有', '羽', '雨', '初', 'う', 'ウ'],
  え: ['絵', '重', '江', '柄', '会', '得', 'え', 'エ'],
  お: ['尾', '小', '御', '雄', '緒', '麻', 'お', 'オ'],

  か: ['下', '何', '日', '化', '加', '可', '果', '課', '香', '華', '科', '蚊', '花', '夏', '歌', '架', 'か', 'カ'],
  き: ['木', '気', '期', '機', '基', '生', '来', '着', '黄', '利', '樹', '記', '貴', '規', 'き', 'キ'],
  く: ['九', '区', '苦', '句', '来る', '苦', '組', 'く', 'ク'],
  け: ['毛', '気', '家', '怪', '卦', 'け', 'ケ'],
  こ: ['子', '小', '個', '湖', '粉', '古', '弧', '戸', 'こ', 'コ'],

  さ: ['差', '佐', '左', '査', '砂', '鎖', 'さ', 'サ'],
  し: ['四', '市', '死', '詩', '氏', '紙', '仕', '歯', '師', '視', '志', '私', '紫', '支', '至', 'し', 'シ'],
  す: ['巣', '酢', '図', '素', '州', 'す', 'ス'],
  せ: ['背', '瀬', '世', '畝', '施', 'せ', 'セ'],
  そ: ['素', '粗', '組', 'そ', 'ソ'],

  た: ['他', '田', '多', '太', '手', 'た', 'タ'],
  ち: ['血', '地', '知', '千', '乳', '遅', 'ち', 'チ'],
  つ: ['津', '都', '対', 'つ', 'ツ'],
  て: ['手', '照', '天', 'て', 'テ'],
  と: ['戸', '都', '途', '鳥', '外', '図', 'と', 'ト'],

  な: ['名', '菜', '南', '魚', 'な', 'ナ'],
  に: ['二', '荷', '似', '丹', '煮', 'に', 'ニ'],
  ぬ: ['ぬ', 'ヌ'],
  ね: ['根', '子', '音', '値', '子', 'ね', 'ネ'],
  の: ['野', '之', 'の', 'ノ'],

  は: ['歯', '葉', '派', '羽', '波', '刃', '端', '場', 'は', 'ハ'],
  ひ: ['日', '火', '非', '比', '避', '陽', '灯', '費', '秘', 'ひ', 'ヒ'],
  ふ: ['歩', '府', '夫', '婦', '負', '布', '符', '風', 'ふ', 'フ'],
  へ: ['経', '辺', '戸', 'へ', 'ヘ'],
  ほ: ['保', '穂', '歩', '帆', '火', '捕', 'ほ', 'ホ'],

  ま: ['間', '魔', '真', '麻', '目', '摩', 'ま', 'マ'],
  み: ['見', '三', '身', '実', '美', '味', '未', '巳', '箕', 'み', 'ミ'],
  む: ['無', '六', '牟', '夢', 'む', 'ム'],
  め: ['目', '女', '芽', 'め', 'メ'],
  も: ['藻', '百', '毛', '茂', 'も', 'モ'],

  や: ['矢', '夜', '屋', '野', '八', 'や', 'ヤ'],
  ゆ: ['湯', '油', '弓', 'ゆ', 'ユ'],
  よ: ['世', '夜', '余', '代', '四', '与', 'よ', 'ヨ'],

  ら: ['等', '羅', 'ら', 'ラ'],
  り: ['利', '理', '里', '梨', '李', 'り', 'リ'],
  る: ['留', '流', 'る', 'ル'],
  れ: ['礼', '例', '零', 'れ', 'レ'],
  ろ: ['路', '炉', 'ろ', 'ロ'],

  わ: ['和', '輪', '話', '羽', '環', 'わ', 'ワ'],
  を: ['を', 'ヲ'],
  ん: ['ん', 'ン'],

  // ==================== DAKUON & HANDAKUON ====================
  が: ['画', '蛾', '賀', '我', '雅', '牙', 'が', 'ガ'],
  ぎ: ['義', '儀', '議', '技', 'ぎ', 'ギ'],
  ぐ: ['具', '愚', 'ぐ', 'グ'],
  げ: ['下', '解', 'げ', 'ゲ'],
  ご: ['五', '語', '後', '誤', '碁', '御', '互', 'ご', 'ゴ'],

  ざ: ['座', 'ざ', 'ザ'],
  じ: ['時', '字', '事', '地', '自', '寺', '磁', '次', '児', '治', '路', '耳', 'じ', 'ジ'],
  ず: ['図', '頭', 'ず', 'ズ'],
  ぜ: ['是', 'ぜ', 'ゼ'],
  ぞ: ['ぞ', 'ゾ'],

  だ: ['打', 'だ', 'ダ'],
  ぢ: ['ぢ', 'ヂ'],
  づ: ['づ', 'ヅ'],
  で: ['出', '手', 'で', 'デ'],
  ど: ['度', '土', '怒', '戸', 'ど', 'ド'],

  ば: ['場', '馬', '把', '葉', '羽', 'ば', 'バ'],
  び: ['美', '微', '尾', '日', '鼻', 'び', 'ビ'],
  ぶ: ['部', '分', '歩', '武', 'ぶ', 'ブ'],
  べ: ['部', 'べ', 'ベ'],
  ぼ: ['坊', '棒', '母', '墓', 'ぼ', 'ボ'],

  ぱ: ['ぱ', 'パ'],
  ぴ: ['ぴ', 'ピ'],
  ぷ: ['ぷ', 'プ'],
  ぺ: ['ぺ', 'ペ'],
  ぽ: ['ぽ', 'ポ'],

  // ==================== YOUON (KOMBINASI) ====================
  きゃ: ['客', 'きゃ', 'キャ'],
  きゅ: ['急', '旧', '九', '球', '級', 'きゅ', 'キュ'],
  きょ: ['巨', '去', '居', '許', '虚', 'きょ', 'キョ'],

  しゃ: ['車', '社', '者', '写', '謝', 'しゃ', 'シャ'],
  しゅ: ['種', '主', '手', '酒', '守', '朱', '首', 'しゅ', 'シュ'],
  しょ: ['書', '所', '初', '諸', '署', '緒', 'しょ', 'ショ'],

  ちゃ: ['茶', 'ちゃ', 'チャ'],
  ちゅ: ['中', 'ちゅ', 'チュ'],
  ちょ: ['超', '長', '丁', '町', '朝', 'ちょ', 'チョ'],

  にゃ: ['にゃ', 'ニャ'],
  にゅ: ['入', '乳', 'にゅ', 'ニュ'],
  にょ: ['如', 'にょ', 'ニョ'],

  ひゃ: ['百', 'ひゃ', 'ヒャ'],
  ひゅ: ['ひゅ', 'ヒュ'],
  ひょ: ['表', 'ひょ', 'ヒョ'],

  みゃ: ['みゃ', 'ミャ'],
  みゅ: ['みゅ', 'ミュ'],
  みょ: ['妙', 'みょ', 'ミョ'],

  りゃ: ['略', 'りゃ', 'リャ'],
  りゅ: ['流', '竜', 'りゅ', 'リュ'],
  りょ: ['旅', '令', '療', '両', 'りょ', 'リョ'],

  ぎゃ: ['ぎゃ', 'ギャ'],
  ぎゅ: ['ぎゅ', 'ギュ'],
  ぎょ: ['魚', '漁', '御', 'ぎょ', 'ギョ'],

  じゃ: ['蛇', '邪', 'じゃ', 'ジャ'],
  じゅ: ['十', '重', '寿', '銃', '受', 'じゅ', 'ジュ'],
  じょ: ['女', '助', '除', '序', 'じょ', 'ジョ'],

  びゃ: ['びゃ', 'ビャ'],
  びゅ: ['びゅ', 'ビュ'],
  びょ: ['秒', '病', 'びょ', 'ビョ'],

  ぴゃ: ['ぴゃ', 'ピャ'],
  ぴゅ: ['ぴゅ', 'ピュ'],
  ぴょ: ['ぴょ', 'ピョ'],

  // ==================== KOSAKATA UMUM (JLPT N5 & MINNA NO NIHONGO) ====================
  ねこ: ['猫', 'ネコ', '子猫'],
  いぬ: ['犬', 'イヌ', '子犬'],
  とり: ['鳥', 'トリ'],
  うま: ['馬'],
  うし: ['牛'],
  さかな: ['魚'],
  やま: ['山'],
  かわ: ['川', '河'],
  うみ: ['海'],
  そら: ['空'],
  みず: ['水'],
  おちゃ: ['お茶', '御茶', '茶'],
  ごはん: ['ご飯', '御飯'],
  あさ: ['朝'],
  ひる: ['昼'],
  よる: ['夜'],
  ばん: ['晩'],
  あした: ['明日'],
  きょう: ['今日'],
  きのう: ['昨日'],
  いま: ['今'],
  ひと: ['人'],
  おとこ: ['男'],
  おんな: ['女'],
  こども: ['子供', '子ども'],
  ともだち: ['友達'],
  せんせい: ['先生'],
  がくせい: ['学生'],
  かいしゃいん: ['会社員'],
  ぎんこういん: ['銀行員'],
  いしゃ: ['医者'],
  ほん: ['本'],
  じしょ: ['辞書'],
  てちょう: ['手帳'],
  とけい: ['時計'],
  かさ: ['傘'],
  かばん: ['鞄', 'カバン'],
  くるま: ['車'],
  じどうしゃ: ['自動車'],
  じてんしゃ: ['自転車'],
  でんしゃ: ['電車'],
  ちかてつ: ['地下鉄'],
  しんかんせん: ['新幹線'],
  ひこうき: ['飛行機'],
  ふね: ['船'],
  えき: ['駅'],
  ぎんこう: ['銀行'],
  ゆうびんきょく: ['郵便局'],
  としょかん: ['図書館'],
  びじゅつかん: ['美術館'],
  びょういん: ['病院'],
  がっこう: ['学校'],
  だいがく: ['大学'],
  きょうしつ: ['教室'],
  しょくどう: ['食堂'],
  じむしょ: ['事務所'],
  かいぎしつ: ['会議室'],
  へや: ['部屋'],
  いえ: ['家'],
  うち: ['家', '内'],
  くに: ['国'],
  にほん: ['日本'],
  かいしゃ: ['会社'],
  うけつけ: ['受付'],
  かいだん: ['階段'],
  てがみ: ['手紙'],
  しゃしん: ['写真'],
  みせ: ['店'],
  にわ: ['庭'],
  はな: ['花'],
  さくら: ['桜'],
  あめ: ['雨', '飴'],
  ゆき: ['雪'],
  てんき: ['天気'],
  きっぷ: ['切符'],
  にもつ: ['荷物'],
  おかね: ['お金'],
  にく: ['肉'],
  たまご: ['卵'],
  やさい: ['野菜'],
  くだもの: ['果物'],
  さけ: ['酒', 'お酒'],
  おさけ: ['お酒', '御酒'],
  こうちゃ: ['紅茶'],
  ぎゅうにゅう: ['牛乳'],
  えいが: ['映画'],
  おんがく: ['音楽'],
  うた: ['歌'],
  やきゅう: ['野球'],
  りょこう: ['旅行'],
  おみやげ: ['お土産', 'おみやげ'],
  しごと: ['仕事'],
  べんきょう: ['勉強'],
  かいもの: ['買い物'],
  さんぽ: ['散歩'],
  けんがく: ['見学'],
  たんじょうび: ['誕生日'],
  とし: ['年'],
  つき: ['月'],
  じかん: ['時間'],
  ふん: ['分'],
  なん: ['何'],
  なに: ['何'],
  どこ: ['何処', 'どこ'],
  だれ: ['誰', 'だれ'],
  どなた: ['何方', 'どなた'],
  いつ: ['何時', 'いつ'],
  いくら: ['幾ら', 'いくら'],
  いくつ: ['幾つ', 'いくつ'],
  おはよう: ['お早う', 'おはよう'],
  おはようございます: ['お早うございます', 'おはようございます'],
  こんにちは: ['今日は', 'こんにちは'],
  こんばんは: ['今晩は', 'こんばんは'],
  ありがとう: ['有難う', 'ありがとう'],
  ありがとうございます: ['有難うございます', 'ありがとうございます'],
  すみません: ['済みません', 'すみません', 'すいません'],
  ごめんなさい: ['御免なさい', 'ごめんなさい'],
  おねがいします: ['お願いします', 'おねがいします'],
  いただきます: ['頂きます', '戴きます', 'いただきます'],
  ごちそうさまでした: ['ご馳走様でした', 'ごちそう様でした', 'ごちそうさまでした'],
  しつれいします: ['失礼します', 'しつれいします'],
  いってきます: ['行ってきます', 'いってきます'],
  いってらっしゃい: ['行ってらっしゃい', 'いってらっしゃい'],
  ただいま: ['只今', 'ただいま'],
  おかえりなさい: ['お帰りなさい', 'おかえりなさい'],
  おやすみなさい: ['お休みなさい', 'おやすみなさい'],
  どういたしまして: ['どう致しまして', 'どういたしまして'],
  はじめまして: ['初めまして', 'はじめまして'],
  どうぞよろしく: ['どうぞ宜しく', 'どうぞよろしく'],

  // ==================== KATAKANA PINJAMAN ====================
  コーヒー: ['珈琲', 'コーヒー', 'coffee'],
  ビール: ['麦酒', 'ビール', 'beer'],
  テレビ: ['テレビ', 'TV'],
  カメラ: ['カメラ', 'camera'],
  タクシー: ['タクシー', 'taxi'],
  ホテル: ['ホテル', 'hotel'],
  レストラン: ['レストラン', 'restaurant'],
  トイレ: ['トイレ', 'toilet'],
  ベッド: ['ベッド', 'bed'],
  シャツ: ['シャツ', 'shirt'],
  ペン: ['ペン', 'pen'],
  ノート: ['ノート', 'note'],
  パン: ['パン', 'pan'],
  バス: ['バス', 'bus'],
  スーパー: ['スーパー', 'super'],
};

/**
 * Pre-computed Reverse Map: Kanji / Variasi Katakana -> Set of Kana
 * O(1) Lookup untuk mencocokkan ucapan dalam aksara Kanji langsung ke Hiragana target
 */
const KANJI_TO_KANA_MAP = new Map<string, Set<string>>();

for (const [kanaKey, kanjiList] of Object.entries(RAW_KANJI_MAPPINGS)) {
  for (const kanji of kanjiList) {
    if (!KANJI_TO_KANA_MAP.has(kanji)) {
      KANJI_TO_KANA_MAP.set(kanji, new Set());
    }
    KANJI_TO_KANA_MAP.get(kanji)!.add(kanaKey);
  }
}

/**
 * Pemetaan perkiraan fonetik bahasa Inggris/Latin untuk aksara tunggal
 * Membantu jika Web Speech API menginterpretasikan ucapan pengguna ke huruf Latin
 */
const ENGLISH_PHONETIC_VARIANTS: Record<string, string[]> = {
  a: ['ah', 'uh'],
  i: ['ee'],
  u: ['oo'],
  e: ['eh'],
  o: ['oh'],
  ka: ['ca', 'car', 'kah'],
  ki: ['key'],
  ku: ['koo', 'coo'],
  ke: ['keh'],
  ko: ['co', 'koh'],
  sa: ['sah'],
  shi: ['she', 'sea', 'see'],
  su: ['soo', 'sue'],
  se: ['say'],
  so: ['soh', 'sew'],
  ta: ['tah'],
  chi: ['chee', 'qi'],
  tsu: ['two', 'too'],
  te: ['tay'],
  to: ['toe', 'toh'],
  na: ['nah'],
  ni: ['knee', 'nee'],
  nu: ['new', 'noo'],
  ne: ['nay'],
  no: ['noh'],
  ha: ['hah'],
  hi: ['hee'],
  fu: ['who', 'foo'],
  he: ['hay'],
  ho: ['hoe', 'hoh'],
  ma: ['mah'],
  mi: ['me'],
  mu: ['moo'],
  me: ['may'],
  mo: ['moh'],
  ya: ['yah'],
  yu: ['you'],
  yo: ['yoh'],
  ra: ['rah'],
  ri: ['ree'],
  ru: ['roo'],
  re: ['ray'],
  ro: ['row'],
  wa: ['wah'],
  wo: ['woh'],
};

/**
 * Membersihkan string ucapan dari simbol, tanda baca, dan spasi
 */
export function cleanSpokenString(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[。、・\s_.,!?/~〜～–—\-+=#*"'`]+/g, '');
}

/**
 * Menghilangkan pemanjangan suara (chouon / tilde) di akhir kata
 * Contoh: 'あー' -> 'あ', 'か〜' -> 'か'
 */
export function stripProlongation(text: string): string {
  return text.replace(/[ー〜～~–—\-]+$/g, '');
}

/**
 * Menghilangkan kata pengisi percakapan Jepang (fillers) di awal ucapan
 * Contoh: 'えーと、あ' -> 'あ', 'あのー、ねこ' -> 'ねこ'
 */
export function stripFillers(text: string): string {
  return text.replace(/^(えーと|あのー|あの|ええと|えっと|うーん|んー|はい|じゃあ)+/g, '');
}

/**
 * Menghilangkan akhiran kopula / sopan di akhir ucapan
 * Contoh: '猫です' -> '猫', '先生でした' -> '先生'
 */
export function stripPoliteSuffixes(text: string): string {
  return text.replace(/(です|でした|ます|ました|だ)+$/g, '');
}

/**
 * Evaluasi utama apakah transkrip ucapan cocok dengan token target.
 * Menganalisis multi-tier:
 * 1. Kecocokan langsung Romaji & Kana
 * 2. Kesetaraan Hiragana <-> Katakana
 * 3. Pemetaan Kanji homofon (misal '猫' -> 'ねこ', '下' -> 'か', '木' -> 'き')
 * 4. Pembersihan pemanjangan suara ('あー' -> 'あ')
 * 5. Pembersihan filler & sufiks ('えーと、か' -> 'か')
 * 6. Perkiraan fonetik alfabet Romaji ('kah' -> 'ka')
 * 7. Analisis segmen / akhiran ucapan berantai
 */
export function isVoiceMatch(
  spokenText: string,
  expectedList: string[],
  kanaText: string
): boolean {
  if (!spokenText || !spokenText.trim()) return false;

  const rawClean = cleanSpokenString(spokenText);
  const targetClean = cleanSpokenString(kanaText);
  if (!rawClean || !targetClean) return false;

  const targetHiragana = katakanaToHiragana(targetClean);
  const targetKatakana = hiraganaToKatakana(targetClean);

  // Buat set kandidat variasi dari teks yang diucapkan
  const candidatesToCheck = new Set<string>();

  // 1. Teks bersih asli
  candidatesToCheck.add(rawClean);

  // 2. Teks tanpa pemanjangan suara (あー -> あ)
  const noProlong = stripProlongation(rawClean);
  candidatesToCheck.add(noProlong);

  // 3. Teks tanpa kata pengisi (filler)
  const noFiller = stripFillers(rawClean);
  candidatesToCheck.add(noFiller);
  candidatesToCheck.add(stripProlongation(noFiller));

  // 4. Teks tanpa sufiks sopan (猫です -> 猫)
  const noSuffix = stripPoliteSuffixes(noFiller);
  candidatesToCheck.add(noSuffix);
  candidatesToCheck.add(stripProlongation(noSuffix));

  // 5. Potongan segmen terakhir jika ada jeda atau pemisah
  const rawSegments = spokenText
    .split(/[。、・\s_.,!?/~〜～–—\-]/)
    .map((s) => cleanSpokenString(s))
    .filter((s) => s.length > 0);

  if (rawSegments.length > 1) {
    const lastSeg = rawSegments[rawSegments.length - 1];
    candidatesToCheck.add(lastSeg);
    candidatesToCheck.add(stripProlongation(lastSeg));
  }

  // Evaluasi setiap kandidat
  for (const cand of candidatesToCheck) {
    if (!cand) continue;

    // A. Kecocokan langsung teks kana atau romaji
    if (isRomajiMatch(cand, expectedList, targetClean)) {
      return true;
    }

    // B. Kesetaraan Hiragana <-> Katakana
    const candHiragana = katakanaToHiragana(cand);
    const candKatakana = hiraganaToKatakana(cand);
    if (candHiragana === targetHiragana || candKatakana === targetKatakana) {
      return true;
    }

    // C. Cek Kamus Kanji -> Kana (Sangat krusial untuk Web Speech API 'ja-JP')
    const kanjiReadings = KANJI_TO_KANA_MAP.get(cand) || KANJI_TO_KANA_MAP.get(candHiragana);
    if (kanjiReadings) {
      if (
        kanjiReadings.has(targetClean) ||
        kanjiReadings.has(targetHiragana) ||
        kanjiReadings.has(targetKatakana)
      ) {
        return true;
      }
    }

    // D. Cek jika kandidat adalah karakter Kanji tunggal yang cocok dengan bacaan target
    for (let c = 0; c < cand.length; c++) {
      const singleChar = cand[c];
      const singleReadings = KANJI_TO_KANA_MAP.get(singleChar);
      if (
        singleReadings &&
        (singleReadings.has(targetClean) || singleReadings.has(targetHiragana))
      ) {
        return true;
      }
    }

    // E. Cek akhiran (untuk ucapan berantai '...あ' atau '...か')
    if (
      cand.endsWith(targetHiragana) ||
      cand.endsWith(targetKatakana) ||
      candHiragana.endsWith(targetHiragana)
    ) {
      return true;
    }

    // F. Cek varian fonetik bahasa Inggris (jika Web Speech menghasilkan alfabet Latin)
    for (const exp of expectedList) {
      const variants = ENGLISH_PHONETIC_VARIANTS[exp.toLowerCase()];
      if (variants && variants.includes(cand)) {
        return true;
      }
    }
  }

  return false;
}
