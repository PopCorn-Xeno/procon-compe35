var express = require('express');
var router = express.Router();
const { exec, spawn } = require("child_process");

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get("/start", (req, res, next) => {
  // exec("node base/main.js", (err, stdout, stderr) => {
  //   if (err) {
  //     console.error(`stderr: ${stderr}`);
  //     return;
  //   }
  //   log = stdout;
  //   console.log(log);
  //   res.redirect("../");
  // })
  const child = spawn("node", ["--max-old-space-size=16000", "base/sub.js", req.query?.width, req.query?.height]);

  child.stdout.on("data", data => {
    console.log(data.toString());
    res.write(data.toString());
  });

  child.stderr.on("data", data => {
    console.error(data.toString());
    res.write(data.toString());
  });

  child.on("close", () => { res.end() })

  // res.redirect("../");
})

router.post("/", (req, res, next) => {
  // console.log(req.body.array);
  // datas.push(req.body);
  // res.redirect("/");
})

module.exports = router;
