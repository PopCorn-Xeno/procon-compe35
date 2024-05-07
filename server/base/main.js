const { setFormatPattern, patternTypes } = require("./functions/formatPattern");
const { makeQuestionBoard, partitionBoard, transpose, pullOut } = require("./functions/boardUtility");

const accuracy = 1000;
const start = performance.now();

let testArray = makeQuestionBoard(6, 6);
console.log(testArray);
let { die } = setFormatPattern(2, patternTypes.type1);
let pos = [1, 2];
testArray = pullOut(testArray, die, pos, 3);
console.log(testArray);

const end = performance.now();
console.log("計算時間=" + (Math.round((end - start) * accuracy) / (1000 * accuracy)) + "秒");