const { makeQuestionBoard, partitionBoard, pullOut, evaluate, swap } = require("./functions/boardUtility");
const { pullOutOld } = require("./functions/legacy");
const { BoardData, Board } = require("./functions/class");

console.log("測定を開始します");
const accuracy = 1000;
const start = performance.now();

const patternData = new BoardData(null, 256, 256);
const question = new Board(patternData.board.start);
console.log(question.array);
console.log(patternData.patterns[21]);
pullOutOld(question,patternData.patterns[21],[15,15],1);
console.log(question.array);

const end = performance.now();
console.log("計算時間=" + (Math.round((end - start) * accuracy) / (1000 * accuracy)) + "秒");