const router = require("express").Router();
const fs = require("fs");

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
                    : "result.json"
    };

    res.render("replay", {
        problem: JSON.parse(fs.readFileSync(`./process/log/problem/${name.problem}`, "utf-8")),
        result: JSON.parse(fs.readFileSync(`./process/log/result/${name.result}`, "utf-8"))
    });
});

module.exports = router;