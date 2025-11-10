// console.log 自訂格式
/**
 * 🧩 Custom Console Logger
 * ------------------------------------------------------------
 * 輕量級前端/Node.js 共用日誌工具，支援 emoji、時間戳與函數追蹤。
 *
 * ✅ 主要方法：
 *   Log.msg(...args)      一般訊息
 *   Log.warn(...args)     警告訊息
 *   Log.error(...args)    錯誤訊息
 *   Log.debug(...args)    除錯訊息
 *
 *   Log.func.start(fn, [params])   函數開始
 *   Log.func.success(fn, [params]) 函數成功
 *   Log.func.error(fn, [params])   函數錯誤
 *
 * 🧾 範例輸出：
 *   14:25:10.3 🔵 [Start] fetchData(42)
 *   14:25:10.8 🟢 [Success] fetchData({"id":42})
 *
 * 🚫 關閉所有輸出：
 *   LOG_ENABLED = false;
 *
 * 📦 匯入：
 *   須先於 main.js 引入此檔案
 *   直接使用全域 Log.msg("Hello");
 * ------------------------------------------------------------
 */

// Logger 開關
let LOG_ENABLED = true;

// 格式化時間 (HH:mm:ss.SSS)
function formatTime(date = new Date()) {
    const ms = Math.floor(date.getMilliseconds() / 100); // 取 0~9
    return date.toLocaleTimeString("zh-TW", { hour12: false }) + "." + ms;
}

// 定義 log 類型
const LOG_TYPES = {
    start: { icon: "🔵", tag: "Start" },
    success: { icon: "🟢", tag: "Success" },
    error: { icon: "🔴", tag: "Error" },
    log: { icon: "⚪", tag: "Log" },
    warn: { icon: "🟡", tag: "Warn" },
    fatal: { icon: "🔴", tag: "Error" },
    debug: { icon: "🟣", tag: "Debug" },
};

// 核心函數
function _log(type, fn, params = []) {
    if (!LOG_ENABLED) return;
    const { icon, tag } = LOG_TYPES[type] || LOG_TYPES.log;

    const fnName = typeof fn === "function" ? fn.name : fn;
    const paramStr = params.map(p => JSON.stringify(p)).join(", ");

    console.log(`${formatTime()} ${icon} [${tag}] ${fnName}(${paramStr})`);
}

// 建立 logger
/**
 * 主要方法：
 * Log.msg(...args)      一般訊息
 * Log.warn(...args)     警告訊息
 * Log.error(...args)    錯誤訊息
 * Log.debug(...args)    除錯訊息
*/
export const Log = {
    func: {},

    msg: (...args) => {
        if (!LOG_ENABLED) return;
        const { icon, tag } = LOG_TYPES.log;
        console.log(`${formatTime()} ${icon} [${tag}]`, ...args);
    },

    warn: (...args) => {
        if (!LOG_ENABLED) return;
        const { icon, tag } = LOG_TYPES.warn;
        console.warn(`${formatTime()} ${icon} [${tag}]`, ...args);
    },

    error: (...args) => {
        if (!LOG_ENABLED) return;
        const { icon, tag } = LOG_TYPES.fatal;
        console.error(`${formatTime()} ${icon} [${tag}]`, ...args);
    },

    debug: (...args) => {
        if (!LOG_ENABLED) return;
        const { icon, tag } = LOG_TYPES.debug;
        console.log(`${formatTime()} ${icon} [${tag}]`, ...args);
    },
};

// 動態產生 Log.func 的方法
Object.keys(LOG_TYPES).forEach(type => {
    Log.func[type] = (fn, params = []) => _log(type, fn, params);
});

// 掛到全域
window.Log = Log;
