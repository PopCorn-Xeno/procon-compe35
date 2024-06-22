const { makeQuestionBoard, partitionBoard, pullOut, evaluate, swap } = require("./functions/boardUtility");
const { BoardData, Board } = require("./functions/class");


const patternData = new BoardData(null, 6, 6);
const question = new Board(patternData.board.start);
console.log(question.array);
console.log(patternData.patterns[5]);

console.log("測定を開始します");
const accuracy = 1000;
const start = performance.now();

pullOut(question,patternData.patterns[5],[-15,-15],2);
console.log(question.array);

const end = performance.now();
console.log("計算時間=" + (Math.round((end - start) * accuracy) / (1000 * accuracy)) + "秒");