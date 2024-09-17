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
    }
    // エラーハンドラーを設定、ソート開始
    boardData.answer.setErrorHandler((error) => {
        process.send(error.stack);
        process.exit(-1);
    }).completeSort((match) => process.send(match));
    // ファイル出力
    boardData.writeReceptionData().writeSendData(true, (id, count) => process.send(`${id} ${count}`));

    process.exit();
});



/* コマンドライン引数のシグネチャ
 * node --max-old-space-size={RAM_SIZE[MB]} sub.js {params}
 * params: --width, --height, --isGenQuestion, --isSavedLog, --isDrawnBoard
 */