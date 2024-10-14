const router = require("express").Router();
const fs = require("fs");

/**
 * ログを保存しているディレクトリをスキャンしてその情報を返す
 * @returns ログの情報
 */
function scanLogs() {
    return fs.readdirSync("./process/log/result")
             .filter((filename) => filename !== "result.json")
             .map((filename) => ({
                 date: /((([0-9-]{2,4}){2,3}-*){2})/g.exec(filename)[1],
                 time: /([0-9]+\.[0-9]{0,3})/g.exec(filename)[1],
                 count: /_([0-9]+)_/.exec(filename)[1],
                 size: /([0-9]+x[0-9]+)/.exec(filename)[1],
                 isDrawingBoard: fs.existsSync(`./process/log/swapHistory/swapHistory_${/((([0-9-]{2,4}){2,3}-*){2})/g.exec(filename)[1]}.json`),
                 filename: filename
             }));
}

router.get("/", (req, res) => {
    res.render("log", { logs: scanLogs() });
});

router.get("/delete", (req, res) => {
    if (Array.isArray(req.query.id)) {
        // 削除するログを複数選択した場合の処理
        // 余裕があったら実装
    }
    else {
        const targets = {
            problem: fs.readdirSync("./process/log/problem").find((filename) => new RegExp(req.query.id).test(filename)),
            result: fs.readdirSync("./process/log/result").find((filename) => new RegExp(req.query.id).test(filename)),
            swapHistory: fs.readdirSync("./process/log/swapHistory").find((filename) => new RegExp(req.query.id).test(filename))
        };
        if (targets.problem) fs.rmSync(`./process/log/problem/${targets.problem}`);
        if (targets.result) fs.rmSync(`./process/log/result/${targets.result}`);
        if (targets.swapHistory) fs.rmSync(`./process/log/swapHistory/${targets.swapHistory}`);
    }

    res.send({ logs: scanLogs() });
})

module.exports = router;