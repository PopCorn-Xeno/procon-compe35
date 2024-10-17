//ファイルインポート
const { BoardData, Board } = require("./functions/class");
const fs = require('fs');
const { inspect } = require("util");

let accuracy = 0, start = 0, result = 0;

//計算時間測定関数の定義
const measureStart = (value = 10000) => {
    accuracy = value;
    start = performance.now();
}

const measureFinish = () => {
    let end = performance.now();
    result = (Math.round((end - start) * accuracy) / (1000 * accuracy));
}

//allSort関数の計算速度の計測
const measurePerformance = () => {
    let measureResult = [];
    let measureOrderLength = [];
    for (let i = 32; i <= 256; i++) {
        console.log(i);
        let boardData = new BoardData(null, 0, i, i);

        measureStart();

        boardData.answer.completeSort();

        measureFinish();
        measureResult.push(result);
        measureOrderLength.push(boardData.answer.turn);
    }
    fs.writeFile('./log/performance.txt', JSON.stringify(measureResult, undefined, ' '), 'utf-8', (err) => { });
    fs.writeFile('./log/orderLength.txt', JSON.stringify(measureOrderLength, undefined, ' '), 'utf-8', (err) => { });
}

function fullLog(data) {
    console.log(inspect(data, { maxArrayLength: null }));
}

/* メモリ強化版
 * node --max-old-space-size=32000 main.js
 */

/*コピペでファイル実行
cd ./server/process
node main.js
*/

//実行内容

//measurePerformance();

const boardData = new BoardData(null, null, 256, 256);

console.log("一致数:" + boardData.answer.countMatchValue());

measureStart();

boardData.answer.completeSort();

measureFinish();

console.log("一致数:" + boardData.answer.countMatchValue());

console.log("合計手数:" + boardData.answer.turn);

//測定結果表示
console.log("計算時間=" + result + "秒");

// fullLog(boardData.answer.current.array);

/*必勝祈願:サモトラケのニケ
              ` . .` .
       .?1zz+-..`` ! __.`-                                                   `      .((JywXa.
   .-((+zU&G+zrI-_<~`. ._ _<-     `    `    `    `    `    `    `    `   `   `` -.(+QQkWWY3+Ci.
  uo&ZVC<~jVV99<>?71<___~` __.      `     `    `    `    `    `    `   `  .__.~<jdHHWW0OOI++++<<-
  uAkzvz<?I+?<?OVZzwRJ-~__   _. ``                                    ` .~~ .?1udWHsyi<zXX+>?<<(zz.
 .juIuZvT7T0?7<-?7=(zVAi+&---..__    `  `   `   `  `  `   `  `  `    ._!``.Jud9WXCzTWWmywAdkwwVXAUD
.zOwzwwUwXyI(<zz<1vzCTUWHWQA+-..-._                               `  . ._.(&dUH9WWywWkkk0Oz<1uXkzyA
.z1OdHXXXX&yWHHmZ1OV9T4V771?61+:-  ``` `  `  `     `    `     ` ` .`  `.<dWqHSw4A&d0OzOX&+++_jAAXHK`
 z0zOOwGvXHWQkw6+(?>_<<>(+++C1Zz+:~_   ..`````` ~-!<~(.. `  `  ._    <(+XAAdC+v7ICOtvIzzxzXHUUTHbHt
 .XXwWAkWBUWVTX--(+jsOOO+(((xjXWHXkuo-.-~`````  ` (c~ _~!_ .._~ ` ..(JJWkdS<<+-..~+?UA+(ZTVSrOzzZ}
  .HHWXXSX0++71X&--(+Jgx_.._JvT9wXXXRkws_``` `` ```````  -~(_ -`.(zjAWHWU3(7&_.?<!dmgmKXOJ<_?wkHH~
   CkSZXkD<&ZYTUwUYTY=1<(z?1<-<_(<+<(8WD__``` ````  ..._~((~_ _.dkXXkbHs<<(1<HMmgdAx1TCI111OUGXU$
     <mQdWQggX9SO6++OOvwGuggU$(I((<<+<<<<_`` _?<!`_~_.-~-(z!.._(XHHWXk?TMMWWf""T5T77v=~JWHHHHHW0\
       ```       ?TY9VYZ><z+xOUHTYIC1uz<_` .``--<?<<<(~```` .__JjWUnjJ1++vV7^            _??`
   `                    .v6+v1dC<(6dT9I<<_.`<.. ?T=?!`` `.`.((_dkWMkWQQqI(>                      `
             `              +O1z_Cjz1<1(z_+--?z4+--._.._! .~(IzJ3d0ylz1Ov1<_   `     `        `
  `   `   `    `  `       `-Jz1Z4MMhyzc<jn(CO-<OZuVYT7<_(<_(jIwVWz4jz-_+C!        `     `
                    `  `   .<JuxJZVXVMMO&VSJ1zJ&<1-zv>(Z1+ukWwdZWsUI+zv<      `           `  `  `
   `   `   `  `             ``(O6jw<jIv?Z7=1uxv?vXJJJyXudXHW9dX9UVZ1zzz>         `  `  `          `
     `    `     `  `    `      -7?z1IAOj<._:_~>(?Cj&+7SX8WXXHWWwO?+>       `               `
                                  ("7! j<~.~-~__-<-_<+7TQdUHkWMmc_?
                                       ,I<+__<(-1J/4J?T?C2?Y7`
                                       .z>(<-1<?&?w._<<zu+zO
                                        1v<111Z&xT&zZGc-<zOw:
                                      ` <~<1z?JvUwAxCzovw1OO;
                                       .~_~_<_?--<CO<__z<>1<1.
                                    `   ___-(--.__ .` __C((>_~
                                     ``.__~.-!<~__. .._~(_<(__~
                                  ``(<-...--_ _<<_+-__((zjv?~___`
                                    .TT<<-(uJ<?+>1+<zzO(j0<~((~:_
                                      117TTTTXa-._?zJ?V1I<JC<:<(l
                                     7=<.`___-`-?US+/T+>J=(v~_>(>
                                    `.7i.<.. _/_ _(<?CuJlZC1(z($<
                                     .<(ZT4Wa,_<- ..`~~?WnJwJiI(d
                                    .JdC__<!(O5J_1--1-_,?WMMMkuvC
                                   `JXk<_..__-<(Tx?<_?o(1_1Izz>~:
                                    (NHj<__.__-!-?4sI.<O(vcI1<l_!
                                     4Wz(__<__ -!.(TWe_<1JVz><>(!
                                      dS+_!_!~__.?((WHR(zwJzz+<+`
                                   `  dkI~~_`.-!_-<jVXUh(zw+Z=+<`
                                    `-wXZ<__J!._`_(IzIvVh<zIzrzz
                                     OXWm>(>...`.(>+(>1wzS+OdXI>
                                     JdXHI+___.(>~(:Jljzh?Jww0z!
                                     >dWIy<(+J^__(>(V>(zZk-?XS2
                                     gWC<(gY~__~_<(XC<(>zwWxJk\
                                    .UZ(d9C(C_.._(dZC<.+/XZWzW`
                                   ` (JWSzj6zc_(+d0z>~ +O(wZW>
                                     djC1z61zI<?zVI?>`(<wy(Xv:
                                    (10<zv++<~_(<<z<> vCjWy?k~
                                   `_J>(<z><~.~_((+<z(Iz(WWOd`
                                      (+<1<....~_<>1d1zj<zWfk
                                        (<<_...._(zjd2<1<(Wk+_
                                         &+--_.__<zdwVI1+<XWk<
                                      ` .X01__.._<?zzXv+<>zUWk;
                                   `  .JuNz<_1-._-(+1dk?yz(rZVI.`
                                   `.J+dWH$<_..?&(GJzzWk?0_jrw<~
                                    +1td0ZX<_.._(WHkZndHIzHJrOI~_
                                    -+0IzzOI_.~(1d@Vnx>dk+dWww&:
                                    WCz<<1jI_~_<zXNNvjzJk>1Wwd^
                                 ` `_~~(+vjO___(wWWdH<1_WR+d@`
                                    -.dXC~JO<._(uZvzZk_1(yOw.
                                     jC<>.Iv__.1dI?+1z:(_OZ+h.
                                      (<<1<:~.~_Xz<+v1>.>zzzjn
                                    `.<c(<<d1zT9O>~<>(<:_O<=<_
                                     1wI_<((_?Icj>~~<<!:(z<<<<.
                                 `   (TO&.~(:<_>(>~~(v _J+<<<z<. ` ``
                                   (zwWAfk+<! ~(<~~~?<.Uzi.z++O+(>(:_  `
                                 `(<OVHWkvX~?<<<~._J(1-?O0UwwV6<?C<<~
                                  ~````___~________?<?!____` _......_
                                   ............~~~~~~.~.~............
                              `  (_...................___....~.......(,
                               `.z<...................................k.`
                                -+~``````````.``````````````````````` Z:
                                _```` .  `````````````````.`          .
                               `-.~~~_...........~................~~~..
                               `......~........~..~~~~~~~....~.~.......
                               `_~___~~~~~~~~!!!~~~~????!!!~~~~~~~```_`
 */