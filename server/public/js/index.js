import { StopWatch, NumberField, InputDescription, ProgressBar, Result, Status, ConsoleWindow } from "./class.js"

//#region 変数・定数
/** 主に実行ボタン */
const buttons = {
    start: document.getElementById("start"),
    confirm: document.getElementById("confirm")
};

/** 入力系要素 */
const inputs = {
    debugMode: new InputDescription(
        document.getElementById("debugMode"),
        "ON: ランダムに問題を生成して処理します。<br>OFF:LAN内のサーバーと送受信を行います。"
    ),
    port: new InputDescription(
        new NumberField(document.getElementById("port")),
        "問題を送受信するサーバーのポート番号を設定します。簡易サーバー・本番環境どちらにも適用されます。"
    ),
    runSimpleServer: new InputDescription(
        document.getElementById("runSimpleServer"),
        "ON: 簡易サーバーを上記ポートで起動します。<br>OFF: 簡易サーバーを切断します。"
    ),
    width: new InputDescription(
        new NumberField(document.getElementById("width")),
        "生成するボードの横幅を入力してください (32~256)。"
    ),
    height: new InputDescription(
        new NumberField(document.getElementById("height")),
        "生成するボードの縦幅を入力してください (32~256)。"
    ),
    isGeneratingQuestion: new InputDescription(
        document.getElementById("isGeneratingQuestion"),
        "ON: 簡易サーバーの問題生成に用いる input.json をランダムに生成し、処理は実行しません。"
    ),
    isSavingLog: new InputDescription(
        document.getElementById("isSavingLog"),
        "ON: 結果・送信データのログを保存します。<br>OFF: ログを毎回上書きします。"
    ),
    isDrawingBoard: new InputDescription(
        document.getElementById("isDrawingBoard"),
        "ONにすると結果表示においてボードの変化を描画しますが、処理の遅延やGCが発生する可能性があります。"
    ),
    // スペシャルコンテンツ
    buddha: new InputDescription(document.getElementById("buddha"), ""),
    yamato: new InputDescription(document.getElementById("yamato"), ""),
    ICTicon: new InputDescription(document.getElementById("ICTicon"), ""),
    ejima: new InputDescription(document.getElementById("ejima"), ""),
    elon: new InputDescription(document.getElementById("elon"), ""),
    yaju: new InputDescription(document.getElementById("yaju"), ""),

    values() {
        return {
            debugMode: this.debugMode?.element?.checked,
            port: this.port?.element?.value,
            runSimpleServer: this.runSimpleServer?.element?.checked,
            width: this.width?.element?.value,
            height: this.height?.element?.value,
            isGeneratingQuestion: this.isGeneratingQuestion?.element?.checked,
            isSavingLog: this.isSavingLog?.element?.checked,
            isDrawingBoard: this.isDrawingBoard?.element?.checked,
            // スペシャルコンテンツ
            buddha: this.buddha?.element?.checked,
            yamato: this.yamato?.element?.checked,
            ICTicon: this.ICTicon?.element?.checked,
            ejima: this.ejima?.element?.checked,
            elon: this.elon?.element?.checked,
            yaju: this.yaju?.element?.checked,
        }
    },
    options: document.querySelectorAll(".options"),
}
// 入力系要素・ホバー時の説明表示設定
Object.values(inputs).filter((input) => input instanceof InputDescription).forEach((input) => {
    input?.setDefault("各項目のスイッチに触れると説明が表示されます。設定終了後に、STARTボタンを押して処理の実行を開始してください。")
         ?.setAction((text) => { if (document.getElementById("description")) document.getElementById("description").innerHTML = text });
})

/** 出力系要素 */
const outputs = {
    progressBar: new ProgressBar(document.getElementById("progressBar")),
    status: new Status(document.getElementById("status")),
    processedTime: new StopWatch(document.getElementById("processedTime")),
    expectedTime: new StopWatch(document.getElementById("expectedTime")),
    orderCount: document.getElementById("orderCount"),
    expectedCount: document.getElementById("expectedCount"),
    console: new ConsoleWindow(document.getElementById("console"))
}

const canvas = document.querySelector("canvas");

/** 処理の予想に用いる近似式 */
const formulas = {
    time: (x) => -8.145e-19 * x**4 - 1.106e-13 * x**3 + 4.685e-8 * x**2 + 5.737e-4 * x - 0.41,
    order: (x) => Math.floor(-1.294e-15 * x**4 + 1.982e-10 * x**3 - 1.161e-5 * x**2 + 1.507 * x + 420)
}

/** 処理結果を保存する */
let result = new Result();
//#endregion

//#region 関数
/**
 * @callback ApproximationFormula 近似式をラムダ式で計算式表記するためのコールバック
 * @param {number} x x軸のパラメータ
 * @returns {number} 式の解
 */
/**
 * 近似式を用いて処理時間または操作手数を予め計算する
 * @param {number} surface 面積・総マス数 (縦x横)
 * @param {ApproximationFormula} formula 
 * @returns 近似値
 */
function approximateProcess(surface, formula) {
    return formula(surface);
}

/**
 * 数値を3桁コンマ区切り (`1,000`) で表す
 * ※ `toLocaleString` が使えなかったので正規表現で
 * @param {number} value 数値
 * @returns 3桁コンマ区切り表記の数値文字列
 */
function toCommaDivision(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
//#endregion

//#region DOMイベントリスナー
document.addEventListener("DOMContentLoaded", () => {
    // デバッグモードのON、OFFで表示を変える
    if (inputs.values().debugMode) {
        inputs.options.item(0).classList.remove("active");
        inputs.options.item(1).classList.add("active");
    }
    else {
        inputs.options?.item(0)?.classList?.add("active");
        inputs.options?.item(1)?.classList?.remove("active");
    }

    outputs.status.standBy();
    outputs.console.log(
        `PROCONSOLE was loaded at ${new Date().toTimeString().replace(/(日本標準時)/, "JST")}. Welcome.`,
        "Process has been ready."
    )

    const ctx = canvas.getContext("2d");
    const space = canvas.width / 24;
    for (let x = 0; x <= canvas.width; x += space) {
        for (let y = 0; y <= canvas.height; y += space) {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2); // 円を描画
            ctx.fillStyle = 'lightgray'; // 色を設定
            ctx.fill();
        }
    }
})

inputs?.debugMode?.element?.addEventListener("change", () => {
    inputs.options.forEach(element => element.classList.toggle("active"));
});

inputs?.runSimpleServer?.element?.addEventListener("change", event => {
    if (event.target.checked) {
        fetch(`/run-server/${inputs.port.element.value}`).then(response => {
            response.text().then((message) => {
                outputs.console.log([message, "Start process within 5 minutes."]);
            });
        });
    }
    else {
        fetch("/stop-server").then(response => {
            response.text().then((message) => outputs.console.log(message));
        });
    }
})

buttons.start.addEventListener("click", async () => {
    // 共通初期化処理
    result = new Result().setActions({
        // function記法を使うことでthisのスコープを引き継ぐ。thisはResultとなるのでメンバーを参照できる
        onMatchValue: (value) => {
            outputs.progressBar.progress(value);
            if (value === 1) {
                // 100%になったら
                outputs.status.finalize();
            }
        },
        onIdAndCount: (id, count) => {
            outputs.orderCount.innerHTML = toCommaDivision(count);
            outputs.console.log(`Log "result${id ? "_" + result.id : ""}.json" was Output.`);
        },
        onError: (message) => {
            outputs.console.error(message);
            outputs.processedTime.stop();
            outputs.status.error();
        }
    });
    outputs.processedTime.reset();
    outputs.progressBar.reset();
    outputs.orderCount.innerHTML = "0";
    outputs.status.process();
    outputs.console.log("Process start.");

    /**
     * プロセスからのレスポンスを受けて、処理時間を計測する\
     * 通信のタイムラグは桁1つに満たないくらいなので大丈夫
     * @param {string} message 受信メッセージ
     */
    const mesureProcessTimeFromResponce = (message) => {
        if (/sort/i.test(message)) {
            if (/start/i.test(message)) outputs.processedTime.start();
            else if (/end/i.test(message)) outputs.processedTime.stop();
        }
    }

    /**
     * @callback OnDecode デコードされたときのアクション
     * @param {string} decoded デコード済み文字列
     */
    /**
     * フェッチしたリクエスト先から送信されるストリームを読んで様々な処理を行う
     * @param {Response} response `fetch` によるレスポンス
     * @param {OnDecode} onDecode バックエンドからのデータをデコードするときに行う処理
     */
    const fetchProcess = async (response, onDecode) => {
        // 送信されるストリームを読み込むリーダー
        const reader = response.body.getReader();
        // バイナリのテキストを変換するデコーダー
        const decoder = new TextDecoder();
        // 送信されたテキストを読み込む
        return reader.read().then(
            /**
             * 読み込んだストリームを再帰しながらデコードする
             * @param {ReadableStreamReadResult<Uint8Array>} text バイナリテキスト
             */
            function decodeStream(text) {
                // ストリームの読み取りが完了していれば終了する
                if (text.done) return;
                // 読み込んでいないデータチャンクがあればテキストデータをデコードして
                // コールバック処理を行わせる
                onDecode(decoder.decode(text.value));
                // 再帰してストリームが終了するまでデコードを続ける
                return reader.read().then(decodeStream);
            }
        );
    }
    
    /**
     * デバッグモードONの時の処理\
     * 引数には `inputs.values()` を指定すると楽
     */
    const debugOn = async ({ width, height, isGeneratingQuestion, isSavingLog, isDrawingBoard }) => {
        // 初期化
        result.width = width, result.height = height;
        if (!isGeneratingQuestion) {
            outputs.expectedTime.display(approximateProcess(width * height, formulas.time));
            outputs.expectedCount.innerHTML = toCommaDivision(approximateProcess(width * height, formulas.order));   
        }
        // エンドポイントにアクセス
        return await fetch(`/start/on?width=${width}&height=${height}&isGeneratingQuestion=${isGeneratingQuestion}&isSavingLog=${isSavingLog}&isDrawingBoard=${isDrawingBoard}`)
        .then(async (response) => {
            // 何か知らんけど関数オブジェクトじゃなくラムダ式で書かないとエラる
            await fetchProcess(response, (decoded) => {
                mesureProcessTimeFromResponce(decoded);
                result.obtain(decoded);
                // 問題の生成のみ行うときは、単なる文章の文字列しか送られてこないので全てコンソールに出力してよい
                if (isGeneratingQuestion) {
                    outputs.console.log(decoded);
                }
            });
            // エラーなく正常終了したときのみ
            if (!result.error) {
                // レスポンスのラグで進捗が100%になっていないとき、無理やり修正する
                if (result.matchValue !== 1) {
                    result.matchValue = 1;
                    outputs.progressBar.progress(1);
                }
                outputs.status.complete();
                outputs.console.log("Process finished.");
            }
        })
        .catch((error) => {
            outputs.console.error(["Fetch failed.", error?.stack]);
            outputs.processedTime.stop();
            outputs.status.error();
        });
    }

    /**
     * デバッグモードOFFの時の処理\
     * 引数には `inputs.values()` を指定すると楽
     */
    const debugOff = async ({ port, runSimpleServer, isSavingLog, isDrawingBoard }) => {
        return await fetch(`/start/off?port=${port}&runSimpleServer=${runSimpleServer}&isSavingLog=${isSavingLog}&isDrawingBoard=${isDrawingBoard}`)
        .then(async (response) => {
            switch (response.status) {
                // 正常な通信の場合
                case 200:
                    // let isSend = true;
                    await fetchProcess(response, (decoded) => {
                        mesureProcessTimeFromResponce(decoded);
                        result.setActions({
                            onWidthAndHeight: function(width, height) {
                                outputs.expectedTime.display(approximateProcess(width * height, formulas.time));
                                outputs.expectedCount.innerHTML = toCommaDivision(approximateProcess(width * height, formulas.order));
                                outputs.console.log(["Connecting server successed.", `width: ${width}, height: ${height}`]);
                            },
                            onSend: (isSend, message) => {
                                if (isSend) outputs.console.log(message);
                                else {
                                    outputs.console.error(message);
                                    outputs.status.error();
                                }
                            }
                        }).obtain(decoded);
                        // メインプロセスが終了したとき（まだ回答は送信されていない状態）
                        if (/Process finished\./.test(decoded)) outputs.console.log(decoded);
                    });
                    if (!result.error && result.isSend) {
                        // レスポンスのラグで進捗が100%になっていないとき、無理やり修正する
                        if (result.matchValue !== 1) {
                            result.matchValue = 1;
                            outputs.progressBar.progress(1);
                        }
                        outputs.status.complete();
                    }
                    break;
                // その他飛んでくるエラーステータスの処理をする
                case 403:
                case 401:
                case 400:
                case 500:
                    await fetchProcess(response, (decoded) => outputs.console.error(decoded));
                    outputs.processedTime.stop();
                    outputs.status.error();
                    break;
            }
        })
        .catch((error) => {
            outputs.console.error(["Fetch failed.", error?.stack]);
            outputs.processedTime.stop();
            outputs.status.error();
        });
    }

    const special = async ({ buddha, yamato, ICTicon, ejima, elon, yaju }) => {
        const url = buddha ? `/start/buddha` :
                    yamato ? `/start/yamato` :
                    ICTicon ? `/start/ICTicon` :
                    ejima ? `/start/ejima` :
                    elon ? `/start/elon` :
                    yaju ? `/start/yaju` : null;
        if (url) {
            // エンドポイントにアクセス
        return await fetch(url)
            .then(async (response) => {
                // 何か知らんけど関数オブジェクトじゃなくラムダ式で書かないとエラる
                await fetchProcess(response, (decoded) => {
                    mesureProcessTimeFromResponce(decoded);
                    result.setActions({
                        onWidthAndHeight: function(width, height) {
                            outputs.expectedTime.display(approximateProcess(width * height, formulas.time));
                            outputs.expectedCount.innerHTML = toCommaDivision(approximateProcess(width * height, formulas.order));
                            outputs.console.log([`width: ${width}, height: ${height}`]);
                        }
                    }).obtain(decoded);
                    // `Result`の`onWidthHeight`が反応しないので応急処置
                    if (/^[0-9]{2,3} x [0-9]{2,3}/.test(decoded)) {
                        console.log(/^([0-9]{2,3}) x ([0-9]{2,3})/.exec(decoded));
                        let [width, height] = /^([0-9]{2,3}) x ([0-9]{2,3})/.exec(decoded)
                                                                            .slice(1)
                                                                            .map(str => Number.parseInt(str));
                        outputs.expectedTime.display(approximateProcess(width * height, formulas.time));
                        outputs.expectedCount.innerHTML = toCommaDivision(approximateProcess(width * height, formulas.order));
                        outputs.console.log([`width: ${width}, height: ${height}`]);
                    }
                });
                // エラーなく正常終了したときのみ
                if (!result.error) {
                    // レスポンスのラグで進捗が100%になっていないとき、無理やり修正する
                    if (result.matchValue !== 1) {
                        result.matchValue = 1;
                        outputs.progressBar.progress(1);
                    }
                    outputs.status.complete();
                    outputs.console.log("Process finished.");
                }
            })
            .catch((error) => {
                outputs.console.error(["Fetch failed.", error?.stack]);
                outputs.processedTime.stop();
                outputs.status.error();
            });
        }
        else {
            window.alert("1つだけ試したいコンテンツのボタンをONにしてください");
        }
    }

    // デバッグモードがONのとき
    if (inputs.values().debugMode) {
        debugOn(inputs.values());
    }
    // OFFのとき
    else {
        if (window.location.pathname === "/special") special(inputs.values());
        else debugOff(inputs.values());
    }
});

buttons.confirm.addEventListener("click", () => {
    if (result.orderCount) {
        if (result.id) window.open(`/result?id=${result.id}&isDrawingBoard=${inputs.values().isDrawingBoard}`);
        else window.open(`/result?isDrawingBoard=${inputs.values().isDrawingBoard}`);
    }
    else window.alert("処理が実行されていません");
});
//#endregion