import { readdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load all files in a directory and call a function with the exports
 */
export const load = async (dir: string, fn: (ex: any) => void) => {
    const files = await readdir(join(__dirname, dir));

    const modules = files.map(async (file) => {
        const { default: module } = await import(join(__dirname, dir, file));
        try {
            fn(module);
        } catch (e) {
            console.log("Error loading:", file);
        }
    });

    return Promise.all(modules);
}