// Mask
let maskDisplay = false;
window.maskOnclickEvents = [];
window.toggleMask = () => {
    console.log(1)
    if (maskDisplay)
    {
        document.getElementById("ground-mask").className = "";
        maskDisplay = false;
    } else {
        document.getElementById("ground-mask").className += " display";
        maskDisplay = true;
    }
}

// app
const ABOUT = 0;
const ARCHIVES = 1;
const HOME = 2;
const POST = 3;
const SEARCH = 4;

const MAIN_ABOUT_TEMPLATE = document.getElementById("main-about");
const ASIDE_ABOUT_TEMPLATE = document.getElementById("main-about");
const MAIN_ARCHIVES_TEMPLATE = document.getElementById("main-archives");
const ASIDE_ARCHIVES_TEMPLATE = document.getElementById("aside-archives");
const MAIN_HOME_TEMPLATE = document.getElementById("main-home");
const ASIDE_HOME_TEMPLATE = document.getElementById("aside-home");
const MAIN_POST_TEMPLATE = document.getElementById("main-post");
const ASIDE_POST_TEMPLATE = document.getElementById("aside-post");
const MAIN_SEARCH_TEMPLATE = document.getElementById("main-search");
const ASIDE_SEARCH_TEMPLATE = document.getElementById("aside-search");

let layout = HOME;

function changeLayout() {
    if (layout === HOME) {
        document.querySelector("main").appendChild(MAIN_HOME_TEMPLATE.content.cloneNode(true));
        document.querySelector("aside").appendChild(ASIDE_HOME_TEMPLATE.content.cloneNode(true));
    }
}

changeLayout();
