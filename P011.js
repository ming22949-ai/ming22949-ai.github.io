// =================================================================
// 状態管理変数
// =================================================================
let levelListData = [];       // JSONファイルから読み込んだ全データ
let currentLevelId = 1;       // 現在のレベルID
let currentSubId = 1;         // 現在の質問番号（subId1からスタート）
let currentQuestionData = null; // 現在表示中の問題オブジェクト

// HTML要素の取得
const levelTitle = document.getElementById('levelTitle');
const questionText = document.getElementById('questionText');
const resultPanel = document.getElementById('resultPanel');
const fanhuiBtn = document.getElementById('fanhuiBtn');

const choiceButtons = [
  document.getElementById('choice1'),
  document.getElementById('choice2'),
  document.getElementById('choice3'),
  document.getElementById('choice4')
];

// =================================================================
// ■ 初期処理
// =================================================================
async function init() {
  // 1. 前画面(P010)からURLパラメータで渡された selectedLevelId を取得
  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get('selectedLevelId');
  if (paramId) {
    currentLevelId = parseInt(paramId, 10);
  } else {
    currentLevelId = 1;
  }
  
  // 最初は該当レベルの subId 1 からスタート
  currentSubId = 1;

  // 2. JSONファイル読込処理（指定された外部ファイルを読み込みます）
  let loadedData = null;
  const pathsToTry = [
    './N2日本語学習.JSON'
  ];

  for (const path of pathsToTry) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        loadedData = await response.json();
        break; // 読み込みに成功したらループを抜ける
      }
    } catch (e) {
      console.error(`${path} の読み込みに失敗しました:`, e);
    }
  }

  // 読み込んだデータをグローバル変数に格納
  if (loadedData && loadedData.length > 0) {
    levelListData = loadedData;
  } else {
    showFinishedScreen("JSONファイルの読み込みに失敗したか、ファイルが空です。パスを確認してください。");
    return;
  }

  // 3. 問題の描画とイベント設定
  renderQuestion();
  setupEvents();
}

/**
 * 現在の levelId と subId に応じたデータを取得して画面を再刷新
 */
function renderQuestion() {
  // 判定表示エリアを一度非表示にする
  resultPanel.style.visibility = "hidden";
  resultPanel.classList.remove('result-correct', 'result-wrong');

  // JSONデータ内から、P010から受け取った currentLevelId に完全に一致するレベルを探索
  const matchedLevel = levelListData.find(item => parseInt(item.levelId, 10) === currentLevelId);

  // 該当するレベルデータが見つからない場合の処理
  if (!matchedLevel || !matchedLevel.questions || matchedLevel.questions.length === 0) {
    showFinishedScreen("選択されたレベルのデータが見つからないか、すべてのレベルが終了しました。");
    return;
  }

  // 該当レベルの中から、現在の subId に合致する質問を探す
  currentQuestionData = matchedLevel.questions.find(q => parseInt(q.subId, 10) === currentSubId);

  // もし現在のレベル内で次の subId が存在しない場合は、次のレベルの subId 1 に進む
  if (!currentQuestionData) {
    currentLevelId++;
    currentSubId = 1;
    renderQuestion();
    return;
  }

  // 画面のタイトルと問題テキストを更新
  levelTitle.innerText = `${matchedLevel.levelName || "Level " + currentLevelId} (${currentSubId})`;
  questionText.innerText = currentQuestionData.question || "問題データがありません";
  
  // 選択肢1～4を各ボタンへマッピング
  choiceButtons[0].innerText = currentQuestionData.choices["1"] || "-";
  choiceButtons[1].innerText = currentQuestionData.choices["2"] || "-";
  choiceButtons[2].innerText = currentQuestionData.choices["3"] || "-";
  choiceButtons[3].innerText = currentQuestionData.choices["4"] || "-";
  choiceButtons.forEach(btn => btn.style.display = 'block');
}

/**
 * エラー時または全問終了時の画面表示
 */
function showFinishedScreen(message) {
  levelTitle.innerText = "終了";
  questionText.innerHTML = `${message}<br>お疲れ様でした！`;
  choiceButtons.forEach(btn => btn.style.display = 'none');
}

// =================================================================
// ■ ボタン押下時処理
// =================================================================
function setupEvents() {
  // 戻るボタン（FANHUI）
  if (fanhuiBtn) {
    fanhuiBtn.addEventListener('click', () => {
      window.location.href = 'index.html'; // INDEX画面へ戻る
    });
  }

  // 選択肢ボタンのイベント設定
  choiceButtons.forEach((button, index) => {
    button.addEventListener('click', (e) => {
      if (!currentQuestionData) return;

      // 押されたボタンの番号（1〜4）を取得
      const selectedChoiceNumber = index + 1;

      // JSONデータ内の「answer」を取得して数値化（「選択肢の番号」同士で比較）
      const correctChoiceNumber = parseInt(currentQuestionData.answer, 10);

      // 正誤判定
      if (selectedChoiceNumber === correctChoiceNumber) {
        // 【合致した場合】正解を表示
        resultPanel.innerText = "HUIDAZHENGQUE (正解)";
        resultPanel.classList.remove('result-wrong');
        resultPanel.classList.add('result-correct');
        resultPanel.style.visibility = "visible";

        // 正解したら 1.2秒後に次の問題（subId++）へ進む
        setTimeout(() => {
          currentSubId++;
          renderQuestion();
        }, 1200);

      } else {
        // 【間違った場合】間違いを表示
        resultPanel.innerText = "huidacuowo (間違い)";
        resultPanel.classList.remove('result-correct');
        resultPanel.classList.add('result-wrong');
        resultPanel.style.visibility = "visible";
      }
    });
  });
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', init);
