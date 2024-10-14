const router = require('express').Router();
const { spawn, fork, ChildProcess } = require("child_process");
const fs = require("fs");

/** チームのトークン */
const token = "kure3037997297c7e6e840bb98658ca5175aa607a40d7f59a343ff7ecf182c45";

router.get('/', (req, res) => {
  res.render('index');
});

//#region sub.js 実行エンドポイント
/** 
 * `sub.js`を起動する`ChildProcess`
 * @type {ChildProcess | null}
 */
let sub = null;
router.get("/start/:debug", async (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  // デバッグモードがONの場合
  if (req.params.debug === "on") {
    // 子プロセスを起動する --max-old-space-sizeは現状消してみている
    sub = fork("process/sub.js", ["--max-old-space-size=32000"]);
    // 子プロセス生成時、パラメータを送信する
    sub.on("spawn", () => sub.send({
      width: Number.parseInt(req.query.width),
      height: Number.parseInt(req.query.height),
      isGeneratingQuestion: req.query.isGeneratingQuestion === "true",
      isSavingLog: req.query.isSavingLog === "true",
      isDrawingBoard: req.query.isDrawingBoard === "true"
    }));
    // 子プロセスからのメッセージを受信後、レスポンスする
    sub.on("message", data => {
      console.log(data);
      // オブジェクト形式ではないメッセージは問題の回答情報ではなく全てクライアントにレスポンスするもの
      if (typeof data !== "object") {
        res.write(data.toString() + "\n");
        res.flushHeaders();
      }
			// オブジェクト形式のメッセージはプロセスから送信された生成した問題の情報
      else {
				const inputData = {
					teams: [token],
					duration: 300,
					problem: data
				};
				// 簡易サーバーのinput.jsonを保存する
				fs.writeFileSync("../simple-server/input.json", JSON.stringify(inputData));
				res.send("input.json was updated.\nRestart simple server to reset problem data.");
			}
    });
    // エラーハンドリング
    sub.on("error", error => {
      console.error(error);
      res.write(error.toString());
    });
    // プロセスが終了した後、レスポンスを終了させる
    sub.on("exit", () => res.end());
  }
  // デバッグモードがOFFの場合
  else if (req.params.debug === "off") {
    // サーバーにFetchする（本番もLANならこれで通じる）
    fetch(`http://localhost:${req.query.port}/problem`, {
      method: "GET",
      headers: { "Procon-Token": token }
    }).then(response => {
      // 正常に通信できた場合
      if (response.ok) {
        // レスポンスのJSONデータをパースする
        response.json().then((data) => {
          // 手始めにボードサイズを送信する
          res.write(`${data.board.width} x ${data.board.height}\n`);
          // 子プロセスを起動する
          sub = fork("process/sub.js");
          // 子プロセス生成時、パラメータを送信する
          sub.on("spawn", () => sub.send({
            problem: data,
            isSavingLog: req.query.isSavingLog === "true",
            isDrawingBoard: req.query.isDrawingBoard === "true"
          }));
          // 子プロセスからのメッセージを受信後、レスポンスする
          sub.on("message", data => {
            console.log(data);
            // オブジェクト形式ではないメッセージは問題の回答情報ではなく全てクライアントにレスポンスするもの
            if (typeof data !== "object") {
              res.write(data.toString() + "\n");
              res.flushHeaders();
            }
            // オブジェクト形式のメッセージはプロセスから送信された問題の回答情報
            else {
              // 指定されたポート番号のローカルサーバーにPOSTする
              fetch(`http://localhost:${req.query.port}/answer`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                  "Content-Type": "application/json",
                  "Procon-Token": "kure3037997297c7e6e840bb98658ca5175aa607a40d7f59a343ff7ecf182c45"
                }
              }).then((response) => {
                if (response.ok) {
                  response.json().then((data) => {
                    res.write(`Send successed.\nrevision: ${data.revision}\n`);
                    res.end();
                  });
                }
                else {
                  switch (response.status) {
                    case 400:
                      res.write("Send failed.\nJSON format can be wrong.\n");
                      break;
                    default:
                      res.write("Send failed.\nUnexpected error occured.\n");
                      break;
                  }
                  res.end();
                }
              });
            }
          });
          // エラーハンドリング
          sub.on("error", error => {
            console.error(error);
            res.write(error.toString());
          })
          // 子プロセスが終了した後、レスポンスを終了させる
          sub.on("exit", () => res.write("Process finished. Sending answer now...\n"));
        });
      }
      else {
        switch (response.status) {
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

module.exports = router;
