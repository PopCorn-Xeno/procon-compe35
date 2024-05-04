const { setFormatPattern, patternTypes } = require("./functions/formatPattern");
const { makeQuestionBoard, partitionBoard, transpose, pullOut } = require("./functions/boardUtility");

let testArray = makeQuestionBoard(6, 6);
console.log(testArray);
let { die } = setFormatPattern(2, patternTypes.type1);
let pos = [1, 2];
testArray = pullOut(testArray, die, pos, 3);
console.log(testArray);