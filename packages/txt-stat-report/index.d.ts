/**
 * Created by user on 2019/2/23.
 */
export declare type ITxtReport = ReturnType<typeof txtReport>;
export declare function txtReport(input: string): {
    /**
     * buffer
     */
    buf_length: number;
    /**
     * js string (轉換分行為 LF 之後的長度)
     */
    js_length: number;
    /**
     * uni-string 一般狀況下會等於 js string
     * 但如果有特殊字元或者 emoji 之類 就會產生差異
     */
    uni_length: number;
    /**
     * line 斷行
     */
    line_length: number;
    /**
     * line 斷行 (不包含空白行)
     */
    no_blank_line_length: number;
    /**
     * 漢字 (包含中文以外的漢字)
     */
    hanzi_length: number;
    /**
     * hiragana (平假名) + katakana (片假名)
     */
    ja_length: number;
    /**
     * punctuation 標點符號 與 其他符號
     */
    punctuation_length: number;
    /**
     * 非斷行以外的空白
     */
    space_length: number;
};
/**
 * 將多個報告總和起來
 */
export declare function txtReportSum<T extends ITxtReport>(arr: T[]): T;
