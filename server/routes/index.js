const router = require('express').Router();
const { spawn, fork } = require("child_process");
const fs = require("fs");

router.get('/', (req, res) => {
  res.render('index');
});

let sub = null;
router.get("/start/:debug", async (req, res) => {
  if (req.params.debug === "on") {
    // sub = spawn("node", ["--max-old-space-size=16000", "process/sub.js", `--width=${req.query.width}`, `--height=${req.query.height}`]);
    sub = fork("process/sub.js", [`--width=${req.query.width}`, `--height=${req.query.height}`]);
    sub.send({test: "test"});
    // sub.stdout.on("data", data => {
    //   console.log(data.toString());
    //   res.write(data.toString());
    // });

    // sub.stderr.on("data", data => {
    //   console.error(data.toString());
    //   res.write(data.toString());
    // });
    sub.on("message", data => {
      console.log(data.toString());
      res.write(data.toString() + "\n");
    });
    sub.on("error", error => {
      console.error(error);
      res.write(error.toString());
    })

    sub.on("exit", () => res.end());
  }
  else if (req.params.debug === "off") {
    const headers = new Headers();
    headers.append("Procon-Token", "kure3037997297c7e6e840bb98658ca5175aa607a40d7f59a343ff7ecf182c45");
    await fetch(`http://localhost:${req.query.port}/problem`, {
      method: "GET",
      headers: { "Procon-Token": "kure3037997297c7e6e840bb98658ca5175aa607a40d7f59a343ff7ecf182c45" }
    }).then(response => {
      switch (response.status) {
        case 200:
          response.json().then(obj => {
            console.log(obj);
            res.json(obj);
          });
          return;
        case 403:
          res.status(403).send("The match isn't holding now.");
          return;
        case 401:
          res.status(401).send("The token can be wrong.");
          return;
        default:
          res.status(500).send("Unexpected error occured.");
          return;
      }
    }).catch(error => res.status(500).send("Failed to connect server. Confirm runnnig status of server."));
  }
})

router.post("/", (req, res) => {
  // console.log(req.body.array);
  // datas.push(req.body);
  // res.redirect("/");
})

let proconServer = null;
// router.get("/run-server/:flag", async (req, res) => {
//   if (req.params.flag) {
//     console.log(req.params.flag)
//     proconServer = spawn("../simple-server/procon-server_win", ["-c", "../simple-server/input.json", "-l", ":8001", "-start", "0s"]);
//     proconServer.stdout.on("data", data => {
//       console.log(data.toString());
//     })
//     proconServer.stderr.on("data", data => {
//       console.error("error", data.toString());
//     })
//   }
//   else {
//     console.log("dousite")
//     proconServer?.kill();
//   }

// })

router.get("/run-server/:port", (req, res) => {
  proconServer = spawn("../simple-server/procon-server_win", ["-c", "../simple-server/input.json", "-l", `:${req.params.port}`, "-start", "0s"]);
  proconServer.on("spawn", () => res.send(`Procon simple server starts running at localhost:${req.params.port}.`));
});

router.get("/stop-server", (req, res) => {
  proconServer.on("exit", () => res.send("Procon simple server stopped running."));
  proconServer?.kill();
})

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

module.exports = router;
