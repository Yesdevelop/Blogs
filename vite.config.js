import { defineConfig } from "vite";
import { ViteEjsPlugin as createEjsPlugin } from "vite-plugin-ejs";
import { resolve } from "path";

export default defineConfig({
    plugins: [
        createEjsPlugin({
        }),
    ],
    build: {
        outDir: "./docs"
    },
});
