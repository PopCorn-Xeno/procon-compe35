const { setFormatPattern, patternTypes } = require("./functions/formatPattern");
const { makeQuestionBoard, partitionBoard, transpose, pullOut, evaluate } = require("./functions/boardUtility");

const accuracy = 1000;
const start = performance.now();

let questionBoard = makeQuestionBoard(6, 6);
let currentBoard = makeQuestionBoard(6, 6);
questionBoard = partitionBoard(questionBoard, 3);
currentBoard = partitionBoard(currentBoard, 3);

for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
        console.log(questionBoard[i][j]);
        console.log(currentBoard[i][j]);
        console.log(evaluate(questionBoard[i][j], currentBoard[i][j]));
    }
}

const end = performance.now();
console.log("計算時間=" + (Math.round((end - start) * accuracy) / (1000 * accuracy)) + "秒");