import fs from "fs";
import { viteSingleFile as createSinglefilePlugin } from "vite-plugin-singlefile";
import { ViteEjsPlugin as createEjsPlugin } from "vite-plugin-ejs";
import matter from "gray-matter";
import { marked } from "marked";

const POSTS_DIR = "_posts/";

class Post {
    title;
    date;
    updated;
    tags;
    lang;
    excerpt;
    content;
    constructor(post) {
        const { data, content } = matter(post);
        this.title = data.title;
        this.date = data.date;
        this.updated = data.updated;
        this.tags = data.tags;
        this.lang = data.lang;
        this.excerpt = data.excerpt;
        this.content = content;
    };
};

function loadPosts() {
    let ret = [];
    const files = fs.readdirSync(POSTS_DIR);
    files.forEach(filename => {
        const filePath = POSTS_DIR + filename;
        const post = fs.readFileSync(filePath, "utf-8");
        ret.push(new Post(post));
    });
    return ret;
}

const posts = loadPosts();

export default {
    plugins: [
        createEjsPlugin({
            author: "ForYes",
            bio: "Make it Awesome",
            sitetitle: "ForYes",
            subtitle: "Years rolling by just like a dream",
            posts: posts,
            postNumber: posts.length,
            tagNumber: 2,
            dayNumber: 2,
            lastUpdateDate: "2026/1/1",
        }),
        createSinglefilePlugin(),
    ],
    build: {
        outDir: "./docs",
    },
};
