const { BoardData } = require("./functions/class");

process.once("message", ({ problem, width, height, isGeneratingQuestion, isSavingLog, isDrawingBoard}) => {
    /**
     * @type {BoardData}
     */
    let boardData;
    
    if (isSavingLog !== undefined && isDrawingBoard !== undefined) {
        // 受信データを使用しない場合
        if (width && height && isGeneratingQuestion !== undefined) {
            boardData = new BoardData(null, null, width, height);
            if (isGeneratingQuestion) {
                boardData.writeReceptionData(undefined, undefined, (id, data) => {
                    process.send(data);
                    process.exit();
                }, false);
            }
        }
        // 受信データを使用する場合
        else if (problem) {
            boardData = new BoardData(problem.board, problem.general.patterns)
        }
        boardData.useSwapHistory(isDrawingBoard, !isSavingLog);
    }
    // エラーハンドラーを設定、ソート開始
    boardData.answer.setErrorHandler((error) => {
        process.send(error.stack);
        process.exit(-1);
    }).completeSort((match) => process.send(match), () => process.send("sort starts"), (sec) => process.send("sort ended"));

    /* isSavingLogの値を反転させることによって、
     * 元々`true`=>`false`:「上書きしないで固有IDとともに保存
     * 元々`false`=>`true`:「上書き保存」
     */
    boardData.writeSwapHistory(() => {
        boardData.writeReceptionData(problem, !isSavingLog)
                 .writeSendData(!isSavingLog, (id, answer) => {
                    process.send(`${id} ${answer.n}`);
                    if (problem) process.send(answer);
                 });
        process.exit();
    })
});

/* 必勝祈願: サモトラケのニケ
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