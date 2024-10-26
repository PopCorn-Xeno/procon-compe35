const router = require('express').Router();
const fs = require("fs");

//#region 処理結果表示ページエンドポイント
router.get("/", (req, res) => {
    /**
     * 取得するJSONファイルの名前
     * @type {{ problem: string, result: string, swapHistory: string | null }}
     */
    const name = {
        problem: req.query.id
                    ? fs.readdirSync("./process/log/problem").find((filename) => new RegExp(req.query.id).test(filename))
                    : "problem.json",
        result: req.query.id
                    ? fs.readdirSync("./process/log/result").find((filename) => new RegExp(req.query.id).test(filename))
                    : "result.json",
        swapHistory: req.query.isDrawingBoard.toString() === "true"
                    ? req.query.id
                        ? fs.readdirSync("./process/log/swapHistory").find((filename) => new RegExp(req.query.id).test(filename))
                        : "swapHistory.json"
                    : null
    };

    const data = {
        problem: JSON.parse(fs.readFileSync(`./process/log/problem/${name.problem}`, "utf-8")),
        result: JSON.parse(fs.readFileSync(`./process/log/result/${name.result}`, "utf-8")),
        swapHistory: name.swapHistory
                    ? JSON.parse(fs.readFileSync(`./process/log/swapHistory/${name.swapHistory}`, "utf-8"))
                    : null
    };
    
    res.render("result", {
        id: req.query.id,
        name: name.result,
        date: /((([0-9-]{2,4}){2,3}-*){2})/g.exec(name.result)?.at(1),
        time: /([0-9]+\.[0-9]{0,3})/g.exec(name.result)?.at(1),
        count: data.result.n,
        orders: data.result.ops,
        board: data.problem.board,
        swapHistory: data.swapHistory
    })
});
//#endregion

module.exports = router;