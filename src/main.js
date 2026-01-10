import "./style.less"

const LAYOUT_HOME = 0;
const LAYOUT_ARTICLE = 1;
const LAYOUT_ARCHIVES = 2;
const LAYOUT_ABOUT = 3;

function cloneTemplate(templateSelector, targetSelector) {
    const homeTemplate = document.querySelector(templateSelector);
    const content = homeTemplate.content.cloneNode(true);
    document.querySelector(targetSelector).appendChild(content);
}

class Blogs {
    layout = LAYOUT_HOME;
    loadPage() {
        if (this.layout == LAYOUT_HOME) {
            cloneTemplate("#home-view", ".view");
        }
    }
}

function main() {
    const blogs = new Blogs();
    blogs.loadPage();
}

main();
