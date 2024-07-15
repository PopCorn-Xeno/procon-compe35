var express = require('express');
var router = express.Router();

let datas = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', contents: datas.length > 0 ? datas : "" });
});

router.post("/", (req, res, next) => {
  console.log(req.body);
  datas.push(JSON.stringify(req.body));
  res.redirect("/");
})

module.exports = router;
