import "./style.less"

const LAYOUT_HOME = 0;
const LAYOUT_ARTICLE = 1;
const LAYOUT_ARCHIVES = 2;
const LAYOUT_ABOUT = 3;

window.layout = LAYOUT_HOME;

function cloneTemplate(templateSelector, targetSelector) {
    const homeTemplate = document.querySelector(templateSelector);
    const target = document.querySelector(targetSelector);
    const content = homeTemplate.content.cloneNode(true);
    target.appendChild(content);
    return target;
}

function loadPage() {
    if (window.layout == LAYOUT_HOME) {
        cloneTemplate("#home-view", ".view");
        loadPosts();
    }
}

function loadPosts() {
    console.log(1);
    if (window.layout == LAYOUT_HOME) {
        if (window.posts) {
            for (const post of window.posts) {
                const target = cloneTemplate("#post", ".main");
                const last = target.querySelector(".post:last-child");
                last.innerHTML = last.innerHTML.replace("%title%", post.title);
            }
        } else {
            setTimeout(loadPosts, 50);
        }
    }
}

function main() {
    loadPage();
}

main();
