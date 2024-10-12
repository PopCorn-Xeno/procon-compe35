const { BoardData } = require("./functions/class");

process.once("message", ({ problem, width, height, isGenQuestion, isSavedLog, isDrawnBoard}) => {
    /**
     * @type {BoardData}
     */
    let boardData;
    
    if (isSavedLog !== undefined && isDrawnBoard !== undefined) {
        // 受信データを使用しない場合
        if (width && height && isGenQuestion !== undefined) {
            boardData = new BoardData(null, null, width, height);
        }
        // 受信データを使用する場合
        else if (problem) {
            boardData = new BoardData(problem.board, problem.general.patterns)
        }
        boardData.useSwapHistory(isDrawnBoard);
    }
    // エラーハンドラーを設定、ソート開始
    boardData.answer.setErrorHandler((error) => {
        process.send(error.stack);
        process.exit(-1);
    }).completeSort((match) => process.send(match), () => process.send("sort starts"), (sec) => process.send("sort ended"));

    /* isSavedLogの値を反転させることによって、
     * 元々`true`=>`false`:「上書きしないで固有IDとともに保存
     * 元々`false`=>`true`:「上書き保存」
     */
    boardData.writeSwapHistory(!isSavedLog).writeReceptionData(problem, !isSavedLog).writeSendData(!isSavedLog,
        (id, answer) => {
            process.send(`${id} ${answer.n}`);
            if (problem) process.send(answer);
        });

    process.exit();
});