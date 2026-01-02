import fs from "fs";
import path from "path";

// 获取文章的预览内容
function getPostsPreviews() {
    const postsDir = path.resolve(__dirname, 'posts');
    const files = fs.readdirSync(postsDir);

    return files
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
            return {
                slug: file.replace('.md', ''),
                title: "这是标题",
                preview: content.substring(0, 200) + '...'
            };
        });
}

export default {
    plugins: [{
        name: 'inject-posts',
        transformIndexHtml(html) {
            const posts = getPostsPreviews();
            return html.replace(
                '<!-- POSTS_PLACEHOLDER -->',
                JSON.stringify(posts)
            );
        }
    }]
};
