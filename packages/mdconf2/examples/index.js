#!/usr/bin/env node
"use strict";
// $ node examples simple
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const __1 = require("..");
let file = path_1.default.resolve(process.argv[2] + '.md');
let str = fs_1.default.readFileSync(file, 'utf8');
console.log(JSON.stringify(__1.parse(str), null, 2));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLHlCQUF5Qjs7Ozs7QUFFekIsNENBQW9CO0FBQ3BCLGdEQUF3QjtBQUN4QiwwQkFBMkI7QUFFM0IsSUFBSSxJQUFJLEdBQUcsY0FBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBRWpELElBQUksR0FBRyxHQUFHLFlBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBRXhDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbi8vICQgbm9kZSBleGFtcGxlcyBzaW1wbGVcblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgcGFyc2UgfSBmcm9tICcuLic7XG5cbmxldCBmaWxlID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuYXJndlsyXSArICcubWQnKTtcblxubGV0IHN0ciA9IGZzLnJlYWRGaWxlU3luYyhmaWxlLCAndXRmOCcpO1xuXG5jb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShwYXJzZShzdHIpLCBudWxsLCAyKSk7XG4iXX0=