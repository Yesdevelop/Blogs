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

const pairs = {
    ABOUT: [MAIN_ABOUT_TEMPLATE, ASIDE_ABOUT_TEMPLATE],
    ARCHIVES: [MAIN_ARCHIVES_TEMPLATE, ASIDE_ARCHIVES_TEMPLATE],
    HOME: [MAIN_HOME_TEMPLATE, ASIDE_HOME_TEMPLATE],
    POST: [MAIN_POST_TEMPLATE, ASIDE_POST_TEMPLATE],
    SEARCH: [MAIN_SEARCH_TEMPLATE, ASIDE_SEARCH_TEMPLATE],
}

let layout = POST;

function changeLayout() {
    const main = document.querySelector("main");
    const aside = document.querySelector("aside");
    main.appendChild(pairs[Object.keys(pairs)[layout]][0].content.cloneNode(true));
    aside.appendChild(pairs[Object.keys(pairs)[layout]][1].content.cloneNode(true));
}

changeLayout();
