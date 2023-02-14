let recordHistory = true;
let disableCaptions = false;

function queryElement(selector) {
    return new Promise((resolve, reject) => {
        let attempt = 0;
        const timer = setInterval(checkElement, 800);
        function checkElement() {
            if (attempt == 20) {
                console.error('Ran out of attempts, sorry 😅');
                clearInterval(timer);
            }
            const element = document.querySelectorAll(selector);
            if (element.length != 0) {
                clearInterval(timer);
                resolve(element);
            }
            attempt++;
        }
    });
}

const clearAllEpisodes = () => {
    const episodes = document.querySelectorAll('.episodes__item');
    episodes.forEach(episode => {
        episode.firstChild.style.background = 'black';
    })
}

const updateEpisodes = (episodes) => {
    chrome.storage.sync.get(['watchHistory']).then(result => {
        watchHistory = result.watchHistory;

        const season = document.querySelector('.seasons__item.active').innerText;
        episodes.forEach(episode => {
            const episodeNumber = episode.firstChild.innerText;
            if (watchHistory[season] && watchHistory[season].includes(episodeNumber)) {
                episode.firstChild.style.background = 'gray';
            } else {
                episode.firstChild.style.background = 'black';
            }
        });
    })
}

const handleEpisodesClick = (episodes) => {
    episodes.forEach(episode => {
        episode.onclick = async function () {
            const season = document.querySelector('.seasons__item.active').innerText;
            const episodeNumber = episode.firstChild.innerText;

            chrome.storage.sync.get(['watchHistory']).then(result => {
                watchHistory = result.watchHistory;
                if (!watchHistory) {
                    watchHistory = {};
                }

                if (!watchHistory[season]) {
                    watchHistory[season] = new Array();
                }

                watchHistory[season].push(episodeNumber);

                if (recordHistory) {
                    episode.firstChild.style.background = 'gray';
                    chrome.storage.sync.set({ 'watchHistory': watchHistory });
                }
            })

            const videos = await queryElement('#video');
            const video = videos[0];
            video.removeChild(video.firstChild);
        }
    });
}

window.onload = async () => {
    chrome.storage.sync.get(['disableHistoryValue', 'disableCaptionsValue']).then(result => {
        recordHistory = !result.disableHistoryValue;
        disableCaptions = result.disableCaptionsValue;
    })

    const episodes = await queryElement('.episodes__item');

    updateEpisodes(episodes);
    handleEpisodesClick(episodes);

    const seasons = document.querySelectorAll('.seasons__item');
    seasons.forEach(season => {
        season.onclick = async () => {
            clearAllEpisodes();
            const seasonEpisodes = await queryElement('.episodes__item');
            updateEpisodes(seasonEpisodes);
            handleEpisodesClick(seasonEpisodes);
        }
    });
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.command === 'history-cleared') {
        const episodes = await queryElement('.episodes__item');
        updateEpisodes(episodes);
        handleEpisodesClick(episodes);
    } else if (request.command === 'disable-history') {
        recordHistory = !request.value;
    } else if (request.command === 'disable-captions') {
        disableCaptions = request.value;
    }

    sendResponse({ message: 'ok' });
});