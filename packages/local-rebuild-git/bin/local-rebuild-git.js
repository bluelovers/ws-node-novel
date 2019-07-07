#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const path = require("upath2");
const yargs = require("yargs");
let argv = yargs
    .option('cwd', {
    demandOption: true,
    normalize: true,
    description: 'target path for handle',
    alias: ['c'],
})
    .help()
    .argv;
let git_repo = path.resolve(argv.cwd);
__1.runAllJob(path.join(git_repo))
    .tap(ret => {
    //console.log(ret)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWwtcmVidWlsZC1naXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2NhbC1yZWJ1aWxkLWdpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSwwQkFBd0M7QUFDeEMsK0JBQWdDO0FBQ2hDLCtCQUFnQztBQUdoQyxJQUFJLElBQUksR0FBRyxLQUFLO0tBQ2QsTUFBTSxDQUFDLEtBQUssRUFBRTtJQUNkLFlBQVksRUFBRSxJQUFJO0lBQ2xCLFNBQVMsRUFBRSxJQUFJO0lBQ2YsV0FBVyxFQUFFLHdCQUF3QjtJQUNyQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7Q0FDWixDQUFDO0tBQ0QsSUFBSSxFQUFFO0tBQ04sSUFBSSxDQUNMO0FBRUQsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFFdEMsYUFBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDNUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0lBRVYsa0JBQWtCO0FBQ25CLENBQUMsQ0FBQyxDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuXG5pbXBvcnQgeyBydW5BbGxKb2IsIGNvbnNvbGUgfSBmcm9tICcuLic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHlhcmdzID0gcmVxdWlyZSgneWFyZ3MnKTtcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5cbmxldCBhcmd2ID0geWFyZ3Ncblx0Lm9wdGlvbignY3dkJywge1xuXHRcdGRlbWFuZE9wdGlvbjogdHJ1ZSxcblx0XHRub3JtYWxpemU6IHRydWUsXG5cdFx0ZGVzY3JpcHRpb246ICd0YXJnZXQgcGF0aCBmb3IgaGFuZGxlJyxcblx0XHRhbGlhczogWydjJ10sXG5cdH0pXG5cdC5oZWxwKClcblx0LmFyZ3ZcbjtcblxubGV0IGdpdF9yZXBvID0gcGF0aC5yZXNvbHZlKGFyZ3YuY3dkKTtcblxucnVuQWxsSm9iKHBhdGguam9pbihnaXRfcmVwbykpXG5cdC50YXAocmV0ID0+XG5cdHtcblx0XHQvL2NvbnNvbGUubG9nKHJldClcblx0fSlcbjtcbiJdfQ==