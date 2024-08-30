import { readdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const load = async (dir: string, fn: (ex: any) => void) => {
    const files = await readdir(join(__dirname, dir));

    const modules = files.map(async (file) => {
        const { default: module } = await import(join(__dirname, dir, file));
        fn(module);
    });

    return Promise.all(modules);
}