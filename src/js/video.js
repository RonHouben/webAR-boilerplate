import { getState } from './store'

export const video = {
    getVideoElements: () => cacheDOM.filter(el => el.tagName === 'VIDEO' ? true : false),
    getVideoHTMLelementByID: id => {
        const { cacheDOM } = getState()

        return cacheDOM.reduce((result, el) => {
            if (el.id === id && el.tagName === 'VIDEO') {
                result = el.html
            }
            return result
        }, {})
    },
    playPauseVideo: video => video.paused ? video.play() : video.pause()

}