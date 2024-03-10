import { join } from "path";

export const __ROOT_WS = join(__dirname);

export const isWin = process.platform === "win32";

export const __ROOT_TEST_MDCONF = join(__ROOT_WS, 'test/fixture/mdconf');
