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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importStar(require("./core"));
exports.mdconf = core_1.default;
exports.parse = core_1.parse;
exports.stringify = core_1.stringify;
const is_plain_object_1 = __importDefault(require("is-plain-object"));
exports.isPlainObject = is_plain_object_1.default;
var core_2 = require("./core");
exports.defaultOptionsParse = core_2.defaultOptionsParse;
var RawObject_1 = require("./lib/RawObject");
exports.RawObject = RawObject_1.RawObject;
exports.SYMBOL_RAW_VALUE = RawObject_1.SYMBOL_RAW_VALUE;
exports.SYMBOL_RAW_DATA = RawObject_1.SYMBOL_RAW_DATA;
exports.default = exports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7Ozs7OztBQUVILCtDQUFrRDtBQUN6QyxpQkFERixjQUFNLENBQ0U7QUFBRSxnQkFEQSxZQUFLLENBQ0E7QUFBRSxvQkFEQSxnQkFBUyxDQUNBO0FBRWpDLHNFQUE0QztBQUluQyx3QkFKRix5QkFBYSxDQUlFO0FBRnRCLCtCQUEwRTtBQUFsRCxxQ0FBQSxtQkFBbUIsQ0FBQTtBQUkzQyw2Q0FBK0U7QUFBdEUsZ0NBQUEsU0FBUyxDQUFBO0FBQUUsdUNBQUEsZ0JBQWdCLENBQUE7QUFBRSxzQ0FBQSxlQUFlLENBQUE7QUFFckQsa0JBQWUsT0FBbUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8yNC8wMjQuXG4gKi9cblxuaW1wb3J0IG1kY29uZiwgeyBwYXJzZSwgc3RyaW5naWZ5IH0gZnJvbSAnLi9jb3JlJztcbmV4cG9ydCB7IG1kY29uZiwgcGFyc2UsIHN0cmluZ2lmeSB9XG5cbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gJ2lzLXBsYWluLW9iamVjdCc7XG5cbmV4cG9ydCB7IElPcHRpb25zUGFyc2UsIGRlZmF1bHRPcHRpb25zUGFyc2UsIElPYmplY3RQYXJzZSB9IGZyb20gJy4vY29yZSc7XG5cbmV4cG9ydCB7IGlzUGxhaW5PYmplY3QgfTtcblxuZXhwb3J0IHsgUmF3T2JqZWN0LCBTWU1CT0xfUkFXX1ZBTFVFLCBTWU1CT0xfUkFXX0RBVEEgfSBmcm9tICcuL2xpYi9SYXdPYmplY3QnO1xuXG5leHBvcnQgZGVmYXVsdCBleHBvcnRzIGFzIHR5cGVvZiBpbXBvcnQoJy4vaW5kZXgnKTtcbiJdfQ==