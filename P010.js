// =================================================================
// 予備データ（フォールバック用内蔵データ）
// ※サーバーが起動していないローカル環境（file:///）でも100%動くように、
//   送っていただいた「IN.JSON / N2.JSON」と同じ構造のデータをJS内にも保持させます。
// =================================================================
const backupLevelData = [
  { "levelId": 1, "levelName": "Level 1: 開発フェーズ・要件定義" },
  { "levelId": 2, "levelName": "Level 2: システム設計・アーキテクチャ" },
  { "levelId": 3, "levelName": "Level 3: データ処理・ロジック実装" },
  { "levelId": 4, "levelName": "Level 4: ネットワーク・インフラ監視" },
  { "levelId": 5, "levelName": "Level 5: セキュリティ・アクセス権限" },
  { "levelId": 6, "levelName": "Level 6: テスト・品質管理・レビュー" },
  { "levelId": 7, "levelName": "Level 7: プロジェクト管理・進捗制御" },
  { "levelId": 8, "levelName": "Level 8: アジャイル・モダン開発運用" },
    { "levelId": 9, "levelName": "Level 7: プロジェクト管理・進捗制御" },
  { "levelId": 10, "levelName": "Level 8: アジャイル・モダン開発運用" }
];

// =================================================================
// 状態管理変数
// =================================================================
const ITEMS_PER_PAGE = 7; // 1ページあたりの最大表示ボタン数
let currentPage = 1;      // 現在のページ番号

let levelListData = [];   // 読み込まれたデータを格納する配列
let jsonMaxLevel = 0;     // 全体のlevelId最大値
let jsonMinLevel = 0;     // 全体のlevelId最小値

// HTML要素の取得
const backBtn = document.getElementById('backBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageDisplay = document.getElementById('pageDisplay');

const levelButtons = [
  document.getElementById('btn1'),
  document.getElementById('btn2'),
  document.getElementById('btn3'),
  document.getElementById('btn4'),
  document.getElementById('btn5'),
  document.getElementById('btn6'),
  document.getElementById('btn7')
];

// =================================================================
// ■ 初期処理（安全な読込ロジック）
// =================================================================
async function init() {
  let loadedData = null;

  // Windows特有の「\INJSON\」のようなバックスラッシュはWeb標準の「/」に置換して複数のパスを試します
  const pathsToTry = [
    './INJSON/N2日本語学習.JSON'
  ];

  // ① まずは非同期通信（fetch）でJSONファイルの読み込みを試行
  if (window.location.protocol !== 'file:') { 
    for (const path of pathsToTry) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          loadedData = await response.json();
          console.log(`JSONファイルの読込に成功しました: ${path}`);
          break;
        }
      } catch (e) {
        // 次のパスを試すためスルー
      }
    }
  }

  // ② 【エラー完全対策】通信エラーやfile://環境で読み込めなかった場合のフォールバック
  if (!loadedData || loadedData.length === 0) {
    console.warn("外部JSONの通信エラー、またはローカル(file:///)環境のため、内蔵バックアップデータを使用します。");
    loadedData = backupLevelData;
  }

  // ③ データのセット・最大最小値の計算
  levelListData = loadedData;
  
  // 仕様書の「guanka」「stem」「levelId」どれがあっても数値変換して認識できるようにします
  const levelIds = levelListData
    .map(item => parseInt(item.levelId || item.guanka || item.stem, 10))
    .filter(num => !isNaN(num));

  if (levelIds.length === 0) {
    console.error("有効なレベルIDがデータ内にありません。");
    if (pageDisplay) pageDisplay.innerText = "Data Error";
    return;
  }

  jsonMaxLevel = Math.max(...levelIds);
  jsonMinLevel = Math.min(...levelIds);

  // 画面の初期描画とイベント登録
  renderPage();
  setupEvents();
}

/**
 * ページングおよびボタンの状態を描画するメインロジック
 */
function renderPage() {
  // 画面に表示する基準の開始番号（例: 1ページ目=1, 2ページ目=8...）
  const startLevelNum = jsonMinLevel + ((currentPage - 1) * ITEMS_PER_PAGE);

  let currentVisibleMax = startLevelNum;
  let currentVisibleMin = startLevelNum;
  let hasVisibleButton = false;

  // 7つのレベルボタンを動的にセット
  for (let i = 0; i < ITEMS_PER_PAGE; i++) {
    const targetLevelNum = startLevelNum + i;
    const btn = levelButtons[i];

    if (!btn) continue;

    // データ内に該当するレベルが存在するかチェック
    const exists = levelListData.some(item => {
      const id = parseInt(item.levelId || item.guanka || item.stem, 10);
      return id === targetLevelNum;
    });

    if (exists) {
      btn.innerText = targetLevelNum;
      btn.classList.remove('hidden'); // 非表示クラスを解除

      if (!hasVisibleButton) {
        currentVisibleMin = targetLevelNum;
        hasVisibleButton = true;
      }
      currentVisibleMax = targetLevelNum;
    } else {
      // 存在しないレベルボタンは非表示（クラス hidden を付与）
      btn.innerText = "";
      btn.classList.add('hidden');
    }
  }

  // ページ番号表示（例: 1 / 2）
  const totalPages = Math.ceil(levelListData.length / ITEMS_PER_PAGE) || 1;
  if (pageDisplay) {
    pageDisplay.innerText = `${currentPage} / ${totalPages}`;
  }

  // 次へボタンの表示・非表示判定
  if (nextBtn) {
    if (jsonMaxLevel > currentVisibleMax) {
      nextBtn.classList.remove('hidden');
    } else {
      nextBtn.classList.add('hidden');
    }
  }

  // 前へボタンの表示・非表示判定
  if (prevBtn) {
    if (currentVisibleMin > jsonMinLevel) {
      prevBtn.classList.remove('hidden');
    } else {
      prevBtn.classList.add('hidden');
    }
  }
}

// =================================================================
// ■ ボタン押下時処理
// =================================================================
function setupEvents() {
  
  // 戻るボタン
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'index.html'; 
    });
  }

  // 次へボタン
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentPage++;
      renderPage();
    });
  }

  // 前へボタン
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentPage--;
      renderPage();
    });
  }

  // 数字のボタンを押したときのP3遷移処理
  levelButtons.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      if (e.target.classList.contains('hidden') || !e.target.innerText) return;

      const selectedLevelId = e.target.innerText;
      // URLにパラメータとして選択したlevelIdを付与して遷移
      window.location.href = `P011.html?levelId=${selectedLevelId}`;
    });
  });
}

// ドキュメント読み込み完了時に初期起動
document.addEventListener('DOMContentLoaded', init);
