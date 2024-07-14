//ファイルインポート
const { BoardData, Board } = require("./functions/class");

//計算時間測定関数の定義
const measureStart = (value = 1000) => {
    console.log("測定を開始します");
    accuracy = value;
    const start = performance.now();
}

const measureFinish = () => {
    const end = performance.now();
    result = (Math.round((end - start) * accuracy) / (1000 * accuracy));
}

let accuracy = 0, start = 0, result = null;

/*コピペでファイル実行
cd ./server/base
node main.js
*/

//実行内容
measureStart();


const boardData = new BoardData(null, 256, 256);
//console.log(boardData.answer.order[0].board.array);

let match = 0;
let boardFlag = new Array(256).fill(4).map(array => array = new Array(256).fill(4));
for (let i = 0; i < 256; i++) {
    for (let j = 0; j < 256; j++) {
        if (boardData.answer.order[0].board.array[i][j] != boardData.answer.goal.array[i][j]) {
            boardFlag[i][j]=boardData.answer.order[0].board.array[i][j];
        }
        else{
            match++;
        }
    }
}

console.log("一致数:"+match);

boardData.answer.allSort();
boardData.answer.allSort();

match = 0;
boardFlag = new Array(256).fill(4).map(array => array = new Array(256).fill(4));
for (let i = 0; i < 256; i++) {
    for (let j = 0; j < 256; j++) {
        if (boardData.answer.order[boardData.answer.order.length-1].board.array[i][j] != boardData.answer.goal.array[i][j]) {
            boardFlag[i][j]=boardData.answer.order[boardData.answer.order.length-1].board.array[i][j];
        }
        else{
            match++;
        }
    }
}

console.log("一致数:"+match);

measureFinish();

//測定結果表示
console.log("計算時間=" + result + "秒");