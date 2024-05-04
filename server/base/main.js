const { setFormatPattern, patternTypes } = require("./functions/formatPattern");

let testArray = makeQuestionBoard(6, 6);
console.log(testArray);
let { die } = setFormatPattern(2, patternTypes.type1);
let pos = [1, 2];
testArray = cutBoard(testArray, die, pos, 3);
console.log(testArray);