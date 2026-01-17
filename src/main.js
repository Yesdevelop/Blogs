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

window.toggleGroundMask = () => {
    if (document.querySelector("#ground-mask").style.opacity == "0") {
        document.querySelector("#ground-mask").style.opacity = "0.5"
        document.querySelector("#ground-mask").style.zIndex = "9"
    } else {
        document.querySelector("#ground-mask").style.opacity = "0"
        document.querySelector("#ground-mask").style.zIndex = "-1"
    }
}

function loadPage() {
    if (window.layout == LAYOUT_HOME) {
        cloneTemplate("#homeview", "main");
        loadPosts();
    }
}

function loadPosts() {
    if (window.layout == LAYOUT_HOME) {
        if (window.posts) {
            window.posts.reverse();
            for (const post of window.posts) {
                const target = cloneTemplate("#post", ".homeview");
                const last = target.querySelector(".post:last-child");
                last.innerHTML = last.innerHTML.replace("%title%", post.title);
                last.innerHTML = last.innerHTML.replace("%date%", post.date);
                last.innerHTML = last.innerHTML.replace("%tag%", post.tags[0]);
                last.innerHTML = last.innerHTML.replace("%preview%", post.preview);
                last.innerHTML = last.innerHTML.replace(" hidden", post.image ? `style="background: url('${post.image}')` : " hidden");
            }
        } else {
            setTimeout(loadPosts, 10);
        }
    }
}

function main() {
    loadPage();
}

main();
