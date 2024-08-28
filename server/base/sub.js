//ファイルインポート
const { BoardData } = require("./functions/class");
const { inspect } = require("util");

function fullLog(data) {
    console.log(inspect(data, { maxArrayLength: null }));
}

const boardData = new BoardData(null, null, 256, 256);

console.log("一致数:" + boardData.answer.countMatchValue());

boardData.answer.allSort();

console.log("一致数:" + boardData.answer.countMatchValue());

console.log("合計手数:" + boardData.answer.turn);

//測定結果表示
console.log("計算時間=" + result + "秒");

// fullLog(boardData.answer.current.array);