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
    isGenQuestion: new InputDescription(
        document.getElementById("isGenQuestion"),
        "ON: 簡易サーバーの問題生成に用いる input.json をランダムに生成し、処理は実行しません。"
    ),
    isSavedLog: new InputDescription(
        document.getElementById("isSavedLog"),
        "ON: 結果・送信データのログを保存します。<br>OFF: ログを毎回上書きします。"
    ),
    isDrawnBoard: new InputDescription(
        document.getElementById("isDrawnBoard"),
        "ONにすると処理結果表示においてボードの変化を描画しますが、処理が遅延する可能性があります。"
    ),
    values() {
        return {
            debugMode: this.debugMode.element.checked,
            port: this.port.element.value,
            runSimpleServer: this.runSimpleServer.element.checked,
            width: this.width.element.value,
            height: this.height.element.value,
            isGenQuestion: this.isGenQuestion.element.checked,
            isSavedLog: this.isSavedLog.element.checked,
            isDrawnBoard: this.isDrawnBoard.element.checked
        }
    }
}
// 入力系要素・ホバー時の説明表示設定
const defaultText = document.getElementById("description").innerHTML;
for (const key in inputs) {
    if (inputs[key] instanceof InputDescription) {
        inputs[key].setDefault(defaultText)
                   .setAction(text => document.getElementById("description").innerHTML = text);
    }
}

/** 設定項目の「オプション」 */
const options = document.querySelectorAll(".options");

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
    if (inputs.values().debugMode) {
        options.item(0).classList.remove("active");
        options.item(1).classList.add("active");
    }
    else {
        options.item(0).classList.add("active");
        options.item(1).classList.remove("active");
    }
    outputs.status.standBy();
    outputs.console.log(
        `Page was loaded at ${new Date().toTimeString().replace(/(日本標準時)/, "JST")}.`,
        "Process has been ready."
    )
})

inputs.debugMode.element.addEventListener("change", () => {
    options.forEach(element => element.classList.toggle("active"));
});

inputs.runSimpleServer.element.addEventListener("change", event => {
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
    result = new Result();
    outputs.processedTime.reset().start();
    outputs.progressBar.reset();
    outputs.orderCount.innerHTML = "0";
    outputs.status.process();
    outputs.console.log("Process start.");

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
    const debugOn = async ({ width, height, isGenQuestion, isSavedLog, isDrawnBoard }) => {
        // 初期化
        outputs.expectedTime.display(approximateProcess(width * height, formulas.time));
        outputs.expectedCount.innerHTML = toCommaDivision(approximateProcess(width * height, formulas.order));   
        // エンドポイントにアクセス
        return await fetch(`/start/on?width=${width}&height=${height}&isGenQuestion=${isGenQuestion}&isSavedLog=${isSavedLog}&isDrawnBoard=${isDrawnBoard}`)
        .then(async (response) => {
            await fetchProcess(response, (decoded) => {
                // デコードデータがこの正規表現にマッチすれば「一致数」の出力である
                result.matchValue = decoded.match(/^[0-9]+\n$/)?.at(0);
                // デコードデータがこの正規表現にマッチすれば「出力ファイルのクエリ」と「処理手数」の出力である
                let idAndCounts = /^((([0-9-]{2,4}){2,3}_*){2}) ([0-9]+)\n$/.exec(decoded);
                // デコードデータがこの正規表現にマッチすれば「エラー」の出力である
                let errorMessage = decoded.match(/error/i);
                // ファイル名、手数の分割代入
                if (idAndCounts) {
                    [result.id, result.orderCount] = [idAndCounts[1], idAndCounts.at(-1)];
                }
                // 取得できた値をそれぞれ反映する
                if (result.matchValue) {
                    outputs.progressBar.progress(result.matchValue / (width * height));
                }
                if (result.id != "" && result.orderCount != 0) {
                    outputs.orderCount.innerHTML = toCommaDivision(result.orderCount);
                }
                if (errorMessage?.input) {
                    outputs.console.error(errorMessage.input);
                    outputs.processedTime.stop();
                    outputs.status.error();
                    return;
                }
            });
            // 処理時間を表示する（通信によって多少の誤差はある）
            outputs.processedTime.stop();
            outputs.status.complete();
            outputs.console.log("Process finished.");
        })
        .catch((error) => {
            outputs.console.error(["Fetch failed.", error]);
            outputs.processedTime.stop();
            outputs.status.error();
        });
    }

    /**
     * デバッグモードOFFの時の処理\
     * 引数には `inputs.values()` を指定すると楽
     */
    const debugOff = async ({ port, runSimpleServer, isSavedLog, isDrawnBoard }) => {
        return await fetch(`/start/off?port=${port}&runSimpleServer=${runSimpleServer}&isSavedLog=${isSavedLog}&isDrawnBoard=${isDrawnBoard}`)
        .then(async (response) => {
            switch (response.status) {
                // 正常な通信の場合
                case 200:
                    await fetchProcess(response, (decoded) => {
                        let widthAndHeight = /^board: ([0-9]+), ([0-9]+)/.exec(decoded);
                        if (widthAndHeight) {
                            [result.width, result.height] = widthAndHeight.slice(1, 3)?.map(str => Number.parseInt(str));
                            outputs.expectedTime.display(approximateProcess(result.width * result.height, formulas.time));
                            outputs.expectedCount.innerHTML = toCommaDivision(approximateProcess(result.width * result.height, formulas.order));
                            outputs.console.log(["Connecting server successed.", `width: ${result.width}, height: ${result.height}`]);
                        }
                        // デコードデータがこの正規表現にマッチすれば「一致数」の出力である
                        result.matchValue = decoded.match(/^[0-9]+\n$/)?.at(0);
                        // デコードデータがこの正規表現にマッチすれば「出力ファイルのクエリ」と「処理手数」の出力である
                        let idAndCounts = /^((([0-9-]{2,4}){2,3}_*){2}) ([0-9]+)\n$/.exec(decoded);
                        // デコードデータがこの正規表現にマッチすれば「エラー」の出力である
                        let errorMessage = decoded.match(/error/i);
                        // ファイル名、手数の分割代入
                        if (idAndCounts) {
                            [result.id, result.orderCount] = [idAndCounts[1], idAndCounts.at(-1)];
                        }
                        // 取得できた値をそれぞれ反映する
                        if (result.matchValue) {
                            outputs.progressBar.progress(result.matchValue / (result.width * result.height));
                        }
                        if (result.id != "" && result.orderCount != 0) {
                            outputs.orderCount.innerHTML = toCommaDivision(result.orderCount);
                        }
                        if (errorMessage?.input) {
                            outputs.console.error(errorMessage.input);   
                        }
                    });
                    // 処理時間を表示する（通信によって多少の誤差はある）
                    outputs.processedTime.stop();
                    outputs.status.complete();
                    outputs.console.log("Process finished.");
                    break;
                // その他飛んでくるエラーステータスの処理をする
                case 403:
                case 401:
                case 500:
                    await fetchProcess(response, outputs.console.error);
                    outputs.processedTime.stop();
                    outputs.status.error();
                    break;
            }
        })
        .catch((error) => {
            outputs.console.error(["Fetch failed.", error]);
            outputs.processedTime.stop();
            outputs.status.error();
        });
    }

    // デバッグモードがONのとき
    if (inputs.values().debugMode) {
        debugOn(inputs.values());
    }
    // OFFのとき
    else {
        debugOff(inputs.values());
    }
});

buttons.confirm.addEventListener("click", () => {
    window.open(`/result?id=${result.id}`);
});
//#endregion