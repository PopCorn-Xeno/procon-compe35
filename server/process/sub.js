const { BoardData } = require("./functions/class");
const yargs = require("yargs");

process.on("message", m => {
    console.log(m);
})

const boardData = new BoardData(null, null, yargs.argv?.width, yargs.argv?.height);

boardData.answer.completeSort((match) => process.send(match));

boardData.writeReceptionData().writeSendData(true, (id, count) => process.send(`${id} ${count}`));

process.exit();
/* コマンドライン引数のシグネチャ
 * node --max-old-space-size={RAM_SIZE[MB]} sub.js {params}
 * params: --width, --height, --isGenQuestion, --isSavedLog, --isDrawnBoard
 */