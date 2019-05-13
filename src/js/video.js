export const video = {
    getVideoElements: cacheDOM => cacheDOM.filter(el => el.tagName === 'VIDEO' ? true : false),
    getVideoHTMLelementByID: (id, cacheDOM) => cacheDOM.reduce((_, el) => el.id === id && el.tagName === 'VIDEO' ? el.html : null, {}),
    playPauseVideo: video => video.paused ? video.play() : video.pause()

}