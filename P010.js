// =================================================================
// テスト用・JSON問題集データ群 (先ほど作成したIT日本語N2データなどを想定)
// =================================================================
const quizData = [
  { "stem": "1", "word": "概要" }, { "stem": "2", "word": "定義" },
  { "stem": "3", "word": "構成" }, { "stem": "4", "word": "連携" },
  { "stem": "5", "word": "格納" }, { "stem": "6", "word": "抽出" },
  { "stem": "7", "word": "監視" }, { "stem": "8", "word": "負荷" },
  { "stem": "9", "word": "権限" }, { "stem": "10", "word": "侵害" },
  { "stem": "11", "word": "網羅" }, { "stem": "12", "word": "指摘" },
  { "stem": "13", "word": "復旧" }, { "stem": "14", "word": "回避" },
  { "stem": "15", "word": "進捗" }, { "stem": "16", "word": "把握" },
  { "stem": "17", "word": "反復" }, { "stem": "18", "word": "継続" },
  { "stem": "19", "word": "互換" }, { "stem": "20", "word": "移行" },
  { "stem": "21", "word": "適切" }
];

// =================================================================
// 状態管理変数
// =================================================================
const ITEMS_PER_PAGE = 7; // 1ページあたりの最大表示件数
let currentPage = 1;      // 現在のページ番号
let totalStemsCount = 0;  // JSONから取得した総stem数
let jsonMaxStem = 0;      // JSONデータ内の最大のstem番号
let jsonMinStem = 1;      // JSONデータ内の最小のstem番号

// DOM要素の取得
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const pageDisplay = document.getElementById('pageDisplay');

// 画面上の7つのstemボタン要素（配列管理：[0]がbtn1, [6]がbtn7になります）
const stemButtons = [
  document.getElementById('btn1'),
  document.getElementById('btn2'),
  document.getElementById('btn3'),
  document.getElementById('btn4'),
  document.getElementById('btn5'),
  document.getElementById('btn6'),
  document.getElementById('btn7')
];

// =================================================================
// 初期処理およびコアロジック
// =================================================================
function init() {
  // 【1. JSON読込処理】各データのstem番号を数値として最大値を取得
  totalStemsCount = quizData.length;
  if (totalStemsCount > 0) {
    jsonMaxStem = Math.max(...quizData.map(item => parseInt(item.stem, 10)));
    jsonMinStem = Math.min(...quizData.map(item => parseInt(item.stem, 10)));
  }

  // ページレンダリング実行
  renderPage();
  setupEventListeners();
}

/**
 * 現在のページ情報に基づいてボタ表示をリフレッシュする処理
 */
function renderPage() {
  // 表示開始インデックスの算出
  // 例：1ページ目=1〜7, 2ページ目=8〜14...
  const startStemNum = ((currentPage - 1) * ITEMS_PER_PAGE) + jsonMinStem;
  
  let currentVisibleMax = startStemNum;
  let currentVisibleMin = startStemNum;

  // 各ボタンのループ処理
  for (let i = 0; i < ITEMS_PER_PAGE; i++) {
    const targetStemNum = startStemNum + i;
    const btn = stemButtons[i];

    // 【2. stemポターの表示 / 非表示・クリア処理】
    // 算出されたstem番号が、JSONに存在するデータ範囲内かどうか
    const hasData = quizData.some(item => parseInt(item.stem, 10) === targetStemNum);

    if (hasData) {
      btn.innerText = targetStemNum;
      btn.classList.remove('hidden'); // 表示
      
      // 画面上の現在の最大値・最小値を保持
      if (targetStemNum > currentVisibleMax) currentVisibleMax = targetStemNum;
    } else {
      // 範囲外であれば画面上から非表示にする
      btn.classList.add('hidden');
    }
  }

  // 総ページ数の算出
  const totalPages = Math.ceil(totalStemsCount / ITEMS_PER_PAGE) || 1;
  pageDisplay.innerText = `${currentPage} / ${totalPages}`;

  // 【3, 8】 （次へ）ボタンの表示 / 非表示条件
  // JSON内の最大値 ＞ 画面上のstem表示最大値 の場合のみ表示
  if (jsonMaxStem > currentVisibleMax) {
    nextBtn.classList.remove('hidden');
  } else {
    nextBtn.classList.add('hidden');
  }

  // 【4, 9】 （前へ）ボタンの表示 / 非表示条件
  // 最初の初期画面（1ページ目など、画面の最小値が全体の最小値以下）では非表示
  if (currentVisibleMin <= jsonMinStem) {
    prevBtn.classList.add('hidden');
  } else {
    prevBtn.classList.remove('hidden');
  }
}

// =================================================================
// ボタン押下イベント処理設定
// =================================================================
function setupEventListeners() {
  
  // 【5. （もどる）ボタン押下時】INDEX画面へ戻る
  backBtn.addEventListener('click', () => {
    // 任意のINDEXページ（例: index.html）へ遷移します
    window.location.href = 'index.html'; 
  });

  // 【6. （次へ）ボタン押下時】
  nextBtn.addEventListener('click', () => {
    // 次ページに進めて再描画（自動的に現在の最大値 + 1 から開始されます）
    currentPage++;
    renderPage();
  });

  // 【7. （前へ）ボタン押下時】
  prevBtn.addEventListener('click', () => {
    // 前ページに戻して再描画（自動的に現在の最小値 - 1 側へ戻って表示されます）
    currentPage--;
    renderPage();
  });

  // 【10. stem数字ボタン押下時】 P3画面へ遷移 & 数値の引き渡し
  stemButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedStem = e.target.innerText;
      
      // P3画面にクエリパラメータ、もしくはセッションストレージ等で選択値を引き渡す
      window.location.href = `P030.html?stem=${selectedStem}`;
    });
  });
}

// 初期処理の実行
document.addEventListener('DOMContentLoaded', init);
