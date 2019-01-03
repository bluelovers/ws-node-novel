"use strict";
/**
 * Created by user on 2018/3/24/024.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("./core");
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
const self = require("./index");
exports.default = self;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsaUNBQWtEO0FBQ3pDLGlCQURGLGNBQU0sQ0FDRTtBQUFFLGdCQURBLFlBQUssQ0FDQTtBQUFFLG9CQURBLGdCQUFTLENBQ0E7QUFFakMsK0JBQWdJO0FBQXZILGlDQUFBLGVBQWUsQ0FBQTtBQUFFLGtDQUFBLGdCQUFnQixDQUFBO0FBQWlCLHFDQUFBLG1CQUFtQixDQUFBO0FBQWdCLDJCQUFBLFNBQVMsQ0FBQTtBQUV2RywrQkFBMEQ7QUFBakQsK0JBQUEsYUFBYSxDQUFBO0FBQUUsd0JBQUEsTUFBTSxDQUFBO0FBQUUsMkJBQUEsU0FBUyxDQUFBO0FBQ3pDLCtCQUE0QztBQUFuQyxzQkFBQSxJQUFJLENBQUE7QUFBRSxvQkFBQSxFQUFFLENBQUE7QUFBRSxzQkFBQSxJQUFJLENBQUE7QUFBRSxvQkFBQSxFQUFFLENBQUE7QUFFM0IsZ0NBQWlDO0FBQ2pDLGtCQUFlLElBQUksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8yNC8wMjQuXG4gKi9cblxuaW1wb3J0IG1kY29uZiwgeyBwYXJzZSwgc3RyaW5naWZ5IH0gZnJvbSAnLi9jb3JlJztcbmV4cG9ydCB7IG1kY29uZiwgcGFyc2UsIHN0cmluZ2lmeSB9XG5cbmV4cG9ydCB7IFNZTUJPTF9SQVdfREFUQSwgU1lNQk9MX1JBV19WQUxVRSwgSU9wdGlvbnNQYXJzZSwgZGVmYXVsdE9wdGlvbnNQYXJzZSwgSU9iamVjdFBhcnNlLCBSYXdPYmplY3QsIElUYWJsZSB9IGZyb20gJy4vY29yZSc7XG5cbmV4cG9ydCB7IGlzUGxhaW5PYmplY3QsIG1vbWVudCwgZGVlcG1lcmdlIH0gZnJvbSAnLi9jb3JlJztcbmV4cG9ydCB7IGNybGYsIExGLCBDUkxGLCBDUiB9IGZyb20gJy4vY29yZSc7XG5cbmltcG9ydCBzZWxmID0gcmVxdWlyZSgnLi9pbmRleCcpO1xuZXhwb3J0IGRlZmF1bHQgc2VsZjtcbiJdfQ==