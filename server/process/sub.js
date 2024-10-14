const { BoardData } = require("./functions/class");

process.once("message", ({ problem, width, height, isGeneratingQuestion, isSavingLog, isDrawingBoard}) => {
    /**
     * @type {BoardData}
     */
    let boardData;
    
    if (isSavingLog !== undefined && isDrawingBoard !== undefined) {
        // 受信データを使用しない場合
        if (width && height && isGeneratingQuestion !== undefined) {
            boardData = new BoardData(null, null, width, height);
            if (isGeneratingQuestion) {
                boardData.writeReceptionData(undefined, undefined, (id, data) => {
                    process.send(data);
                    process.exit();
                }, false);
            }
        }
        // 受信データを使用する場合
        else if (problem) {
            boardData = new BoardData(problem.board, problem.general.patterns)
        }
        boardData.useSwapHistory(isDrawingBoard);
    }
    // エラーハンドラーを設定、ソート開始
    boardData.answer.setErrorHandler((error) => {
        process.send(error.stack);
        process.exit(-1);
    }).completeSort((match) => process.send(match), () => process.send("sort starts"), (sec) => process.send("sort ended"));

    /* isSavingLogの値を反転させることによって、
     * 元々`true`=>`false`:「上書きしないで固有IDとともに保存
     * 元々`false`=>`true`:「上書き保存」
     */
    boardData.writeSwapHistory(!isSavingLog).writeReceptionData(problem, !isSavingLog).writeSendData(!isSavingLog,
        (id, answer) => {
            process.send(`${id} ${answer.n}`);
            if (problem) process.send(answer);
        });

    process.exit();
});