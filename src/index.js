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
