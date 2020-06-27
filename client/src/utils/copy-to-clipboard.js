async function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        if (!successful) throw new Error("unsuccessful copy");
        return;
    } catch (err) {
        throw err;
    } finally {
        document.body.removeChild(textArea);
    }
}
export default async function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        return fallbackCopyTextToClipboard(text);
    }
    return navigator.clipboard.writeText(text);
}