"use strict";
/**
 * Created by user on 2018/3/24/024.
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importStar(require("./core"));
exports.mdconf = core_1.default;
exports.parse = core_1.parse;
exports.stringify = core_1.stringify;
var core_2 = require("./core");
exports.SYMBOL_RAW_DATA = core_2.SYMBOL_RAW_DATA;
exports.SYMBOL_RAW_VALUE = core_2.SYMBOL_RAW_VALUE;
exports.defaultOptionsParse = core_2.defaultOptionsParse;
exports.RawObject = core_2.RawObject;
var core_3 = require("./core");
exports.isPlainObject = core_3.isPlainObject;
exports.moment = core_3.moment;
exports.deepmerge = core_3.deepmerge;
var core_4 = require("./core");
exports.crlf = core_4.crlf;
exports.LF = core_4.LF;
exports.CRLF = core_4.CRLF;
exports.CR = core_4.CR;
exports.default = exports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7OztBQUVILCtDQUFrRDtBQUN6QyxpQkFERixjQUFNLENBQ0U7QUFBRSxnQkFEQSxZQUFLLENBQ0E7QUFBRSxvQkFEQSxnQkFBUyxDQUNBO0FBRWpDLCtCQUFnSTtBQUF2SCxpQ0FBQSxlQUFlLENBQUE7QUFBRSxrQ0FBQSxnQkFBZ0IsQ0FBQTtBQUFpQixxQ0FBQSxtQkFBbUIsQ0FBQTtBQUFnQiwyQkFBQSxTQUFTLENBQUE7QUFFdkcsK0JBQTBEO0FBQWpELCtCQUFBLGFBQWEsQ0FBQTtBQUFFLHdCQUFBLE1BQU0sQ0FBQTtBQUFFLDJCQUFBLFNBQVMsQ0FBQTtBQUN6QywrQkFBNEM7QUFBbkMsc0JBQUEsSUFBSSxDQUFBO0FBQUUsb0JBQUEsRUFBRSxDQUFBO0FBQUUsc0JBQUEsSUFBSSxDQUFBO0FBQUUsb0JBQUEsRUFBRSxDQUFBO0FBRTNCLGtCQUFlLE9BQW1DLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzMvMjQvMDI0LlxuICovXG5cbmltcG9ydCBtZGNvbmYsIHsgcGFyc2UsIHN0cmluZ2lmeSB9IGZyb20gJy4vY29yZSc7XG5leHBvcnQgeyBtZGNvbmYsIHBhcnNlLCBzdHJpbmdpZnkgfVxuXG5leHBvcnQgeyBTWU1CT0xfUkFXX0RBVEEsIFNZTUJPTF9SQVdfVkFMVUUsIElPcHRpb25zUGFyc2UsIGRlZmF1bHRPcHRpb25zUGFyc2UsIElPYmplY3RQYXJzZSwgUmF3T2JqZWN0LCBJVGFibGUgfSBmcm9tICcuL2NvcmUnO1xuXG5leHBvcnQgeyBpc1BsYWluT2JqZWN0LCBtb21lbnQsIGRlZXBtZXJnZSB9IGZyb20gJy4vY29yZSc7XG5leHBvcnQgeyBjcmxmLCBMRiwgQ1JMRiwgQ1IgfSBmcm9tICcuL2NvcmUnO1xuXG5leHBvcnQgZGVmYXVsdCBleHBvcnRzIGFzIHR5cGVvZiBpbXBvcnQoJy4vaW5kZXgnKTtcbiJdfQ==