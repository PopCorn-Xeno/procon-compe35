const { makeQuestionBoard, partitionBoard, transpose, pullOut, evaluate, swap } = require("./functions/boardUtility");
const { setFormatPattern, patternTypes } = require("./functions/formatPattern");
const { BoardData, Board } = require("./functions/class");

const accuracy = 1000;
const start = performance.now();

const questionBoard = new BoardData(null, 6, 6);
console.log(questionBoard.patterns[5]);

const end = performance.now();
console.log("計算時間=" + (Math.round((end - start) * accuracy) / (1000 * accuracy)) + "秒");