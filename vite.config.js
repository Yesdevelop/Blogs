import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import { viteSingleFile } from "vite-plugin-singlefile";

// 获取文章的预览内容
function getPosts() {
    const POSTS_DIR = "posts";
    const LENGTH = 150;

    const postsDir = path.resolve(__dirname, POSTS_DIR);
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith(".md"));
    const ret = files.map((file) => {
        const fileContent = fs.readFileSync(path.join(postsDir, file), "utf-8");
        const { data, content } = matter(fileContent);

        const preview = content.replaceAll(/\r|\n/g, "").substring(0, LENGTH) + "...";
        const { title, lang, tags, date, updated } = data;
        return { title, lang, tags, date, updated, preview };
    });
    return ret;
}

// 注入posts参数到js里
function injectPosts() {
    const PLUGIN_NAME = "PostInjector";
    const PLACEHOLDER = "/* VITE_POSTS_INJECTOR */";
    const VARIABLE_NAME = "posts";

    return {
        name: PLUGIN_NAME,
        transformIndexHtml(html) {
            const posts = getPosts();
            const injectContent = `window.${VARIABLE_NAME} = ${JSON.stringify(posts)};`;
            return html.replace(PLACEHOLDER, injectContent);
        }
    };
}

// 导出配置
export default defineConfig({
    plugins: [
        // 把posts内的文章注入页面中
        injectPosts(),
        // 压缩html
        createHtmlPlugin({ minify: true, }),
        // 合并单文件
        viteSingleFile(),
    ],
    build: {
        cssCodeSplit: false,
        outDir: 'docs',
    }
});
