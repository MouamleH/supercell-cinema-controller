const clearHistory = async () => {
    chrome.storage.sync.get(["watchHistory"]).then(result => {
        watchHistory = result.watchHistory;
    })
    chrome.storage.sync.set({ "watchHistory": {} })

    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    await chrome.tabs.sendMessage(tab.id, { command: "history-cleared" });
}

const handleDisableHistory = async (value) => {
    chrome.storage.sync.set({ "disableHistoryValue": value })
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    await chrome.tabs.sendMessage(tab.id, { command: "disable-history", value });
}


const handleDisableCaptions = async (value) => {
    chrome.storage.sync.set({ "disableCaptionsValue": value })
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    await chrome.tabs.sendMessage(tab.id, { command: "disable-captions", value });
}

window.onload = () => {
    document.getElementById("clearHistory").onclick = clearHistory;

    const disableHistory = document.getElementById("disableHistory");
    disableHistory.onclick = () => {
        handleDisableHistory(disableHistory.checked);
    }

    const disableCaptions = document.getElementById("disableCaptions");
    disableCaptions.onclick = () => {
        handleDisableCaptions(disableCaptions.checked);
    }

    chrome.storage.sync.get(["disableHistoryValue", "disableCaptionsValue"]).then(result => {
        const { disableHistoryValue, disableCaptionsValue } = result;
        if (disableHistoryValue) {
            disableHistory.checked = true;
        }

        if (disableCaptionsValue) {
            disableCaptions.checked = true;
        }
    })

}