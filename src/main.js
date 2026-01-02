import "./style.css"

const LAYOUT_HOME = 0;
const LAYOUT_ARTICLE = 1;
const LAYOUT_ARCHIVES = 2;
const LAYOUT_ABOUT = 3;

function cloneTemplate(templateSelector, targetSelector) {
    const HOME_TEMPLATE = document.querySelector(templateSelector);
    const CONTENT = HOME_TEMPLATE.content.cloneNode(true);
    document.querySelector(targetSelector).appendChild(CONTENT);
}

class Blogs {
    layout = LAYOUT_HOME;
    url = "/";

    refresh() {
        if (this.layout == LAYOUT_HOME) {
            cloneTemplate("#home-view", ".view");
        }
    }
}

function main() {
    let blogs = new Blogs();
    blogs.refresh();
}

main();
