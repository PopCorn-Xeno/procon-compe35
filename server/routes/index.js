const router = require('express').Router();
const { spawn, fork } = require("child_process");
const fs = require("fs");

router.get('/', (req, res) => {
  res.render('index');
});

//#region sub.js 実行エンドポイント
/** `sub.js`を起動する`ChildProcess */
let sub = null;
router.get("/start/:debug", async (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  // デバッグモードがONの場合
  if (req.params.debug === "on") {
    // 子プロセスを起動する --max-old-space-sizeは現状消してみている
    sub = fork("process/sub.js");
    // 子プロセス生成時、パラメータを送信する
    sub.on("spawn", () => sub.send({
      width: req.query.width,
      height: req.query.height,
      isGenQuestion: req.query.isGenQuestion,
      isSavedLog: req.query.isSavedLog,
      isDrawnBoard: req.query.isDrawnBoard
    }));
    // 子プロセスからのメッセージを受信後、レスポンスする
    sub.on("message", data => {
      console.log(data);
      res.write(data.toString() + "\n");
      res.flushHeaders();
    });
    // エラーハンドリング
    sub.on("error", error => {
      console.error(error);
      res.write(error.toString());
    })
    // プロセスが終了した後、レスポンスを終了させる
    sub.on("exit", () => res.end());
  }
  // デバッグモードがOFFの場合
  else if (req.params.debug === "off") {
    // サーバーにFetchする（本番もLANならこれで通じる）
    await fetch(`http://localhost:${req.query.port}/problem`, {
      method: "GET",
      headers: { "Procon-Token": "kure3037997297c7e6e840bb98658ca5175aa607a40d7f59a343ff7ecf182c45" }
    }).then(response => {
      switch (response.status) {
        // 正常に通信できた場合
        case 200:
          // レスポンスのJSONデータをパースする
          response.json().then(data => {
            // 手始めにボードサイズを送信する
            res.write(`board: ${data.board.width}, ${data.board.height}\n`);
            // 子プロセスを起動する
            sub = fork("process/sub.js");
            // 子プロセス生成時、パラメータを送信する
            sub.on("spawn", () => sub.send({
              problem: data,
              isSavedLog: req.query.isSavedLog,
              isDrawnBoard: req.query.isDrawnBoard
            }));
            // 子プロセスからのメッセージを受信後、レスポンスする
            sub.on("message", data => {
              console.log(data);
              res.write(data.toString() + "\n");
              res.flushHeaders();
            });
            // エラーハンドリング
            sub.on("error", error => {
              console.error(error);
              res.write(error.toString());
            })
            // 子プロセスが終了した後、レスポンスを終了させる
            sub.on("exit", () => res.end());
          });
          break;
        // 403 Forbidden: サーバーは起動しているが試合がまだ開かれていない
        case 403:
          res.status(403).send("The match isn't holding now.");
          return;
        // 401 Unauthorized: トークンが違う
        case 401:
          res.status(401).send("The token can be wrong.");
          return;
        // その他予期しないエラーは500として送信する
        default:
          res.status(500).send("Unexpected error occured.");
          return;
      }
    }).catch(error => res.status(500).send("Failed to connect server. Confirm runnnig status of server."));
  }
})
//#endregion

//#region 簡易サーバー起動エンドポイント
/** `procon-server_win.exe`を起動するChildProcess */
let proconServer = null;
// サーバーを起動させる
router.get("/run-server/:port", (req, res) => {
  // 受け取ったポート番号で起動後、確認メッセージを送信する
  proconServer = spawn("../simple-server/procon-server_win", ["-c", "../simple-server/input.json", "-l", `:${req.params.port}`, "-start", "0s"]);
  proconServer.on("spawn", () => res.send(`Procon simple server starts running at localhost:${req.params.port}.`));
});
// サーバーを停止させる
router.get("/stop-server", (req, res) => {
  // プロセスをキルする
  proconServer.on("exit", () => res.send("Procon simple server stopped running."));
  proconServer.kill();
})
//#endregion

//#region 処理結果表示ページエンドポイント
router.get("/result", (req, res) => {
  let name = {
    question: `question_${req.query.id}.json`,
    result: `result_${req.query.id}.json`
  };
  let data = {
    question: JSON.parse(fs.readFileSync(`./process/log/question/${name.question}`, "utf-8")),
    result: JSON.parse(fs.readFileSync(`./process/log/result/${name.result}`, "utf-8"))
  };
  res.render("result", {
    name: name.result,
    orderCount: data.result?.n,
    orders: data.result?.ops
  })
});
//#endregion

module.exports = router;
