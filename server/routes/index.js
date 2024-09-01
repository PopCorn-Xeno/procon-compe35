var express = require('express');
var router = express.Router();
const { spawn } = require("child_process");
const fs = require("fs");

router.get('/', (req, res) => {
  res.render('index');
});

router.get("/start", (req, res) => {
  // exec("node base/main.js", (err, stdout, stderr) => {
  //   if (err) {
  //     console.error(`stderr: ${stderr}`);
  //     return;
  //   }
  //   log = stdout;
  //   console.log(log);
  //   res.redirect("../");
  // })
  const child = spawn("node", ["--max-old-space-size=16000", "process/sub.js", req.query?.width, req.query?.height]);

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

router.post("/", (req, res) => {
  // console.log(req.body.array);
  // datas.push(req.body);
  // res.redirect("/");
})

router.get("/result", (req, res) => {
  let json = (fs.readFileSync(`./process/log/${req.query.name}`, "utf-8"));
  res.render("result", {
    name: req.query.name,
    orders: json
  })
});

module.exports = router;
