let maskDisplay = false;
window.maskOnclickEvents = [];
window.toggleMask = () => {
    console.log(1)
    if (maskDisplay)
    {
        document.getElementById("ground-mask").style.opacity = "0"
        document.getElementById("ground-mask").style.pointerEvents = "none"
        maskDisplay = false;
    }
    else {
        document.getElementById("ground-mask").style.opacity = "1"
        document.getElementById("ground-mask").style.pointerEvents = "auto"
        maskDisplay = true;
    }
}
