const { transpose, setFormatCuttingTemplate, dieTypes } = require("./functions/CuttingTemplate");

let testArray = makeQuestionBoard(6, 6);
console.log(testArray);
let { die } = setFormatCuttingTemplate(2, dieTypes.type1);
let pos = [1, 2];
testArray = cutBoard(testArray, die, pos, 3);
console.log(testArray);