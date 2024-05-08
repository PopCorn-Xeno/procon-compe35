const { setFormatPattern, patternTypes } = require("./formatPattern");
const { makeQuestionBoard, partitionBoard, transpose, pullOut } = require("./boardUtility");

class order {
    constructor(pattern, position, direction) {
        this.pattern=pattern;
        this.position=position;
        this.direction=direction;
    }
}