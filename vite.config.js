import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import { viteSingleFile } from "vite-plugin-singlefile";
import vitePluginRestart from "vite-plugin-restart"

function components() {
    const PLUGIN_NAME = "components";
    
    const header = fs.readFileSync("src/components/header.html");
    const footer = fs.readFileSync("src/components/footer.html");
    const homeaside = fs.readFileSync("src/components/homeaside.html");
    const homeview = fs.readFileSync("src/components/homeview.html");

    return {
        name: PLUGIN_NAME,
        transformIndexHtml(html) {
            return html
                .replace("!header", header)
                .replace("!footer", footer)
                .replace("!homeaside", homeaside)
                .replace("!homeview", homeview)
        }
    };
}

// 获取文章的预览内容
function getPosts() {
    const POSTS_DIR = "posts";
    const LENGTH = 150;

    const postsDir = path.resolve(__dirname, POSTS_DIR);
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith(".md"));
    const ret = files.map((file) => {
        const fileContent = fs.readFileSync(path.join(postsDir, file), "utf-8");
        const { data, content } = matter(fileContent);

        const preview = data.description || content.replaceAll(/\r|\n/g, "").substring(0, LENGTH) + "...";
        data.preview = preview;
        return data;
    });
    return ret;
}

// 注入posts参数到js里
function injectPosts() {
    const PLUGIN_NAME = "injectPosts";
    const PLACEHOLDER = "/* INJECT_POSTS */";
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

// 注入announce
function injectAnnounce() {
    const PLUGIN_NAME = "injectAnnounce";
    const PLACEHOLDER = "/* INJECT_ANNOUNCE */";
    const CONTENT = `
        <p>This blog is still under development so the content is not able to view</p>
        <p>In this blog I'd like to share something about my own and some tech articles as well</p>
        <p>By the way I decided to write it directly without any frameworks thus it takes some time</p>
    `

    return {
        name: PLUGIN_NAME,
        transformIndexHtml(html) {
            return html.replace(PLACEHOLDER, CONTENT);
        }
    };
}

// 导出配置
export default defineConfig({
    plugins: [
        // 注入
        components(),
        injectPosts(),
        injectAnnounce(),
        // 压缩html
        createHtmlPlugin({ minify: true, }),
        // 合并单文件
        viteSingleFile(),
        vitePluginRestart({ restart: ["posts/**/*.md", "src/components/*.html"] })
    ],
    build: {
        cssCodeSplit: false,
        outDir: 'docs',
    }
});
