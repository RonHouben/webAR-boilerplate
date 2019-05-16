import { getState } from './store'
import { typeChecker } from './typeChecker';

export const video = {
    getVideoElements: () => cacheDOM.filter(el => el.tagName === 'VIDEO' ? true : false),
    getVideoHTMLelementByID: id => {
        id = typeChecker('string', '', 'id')(id)

        const { cacheDOM } = getState()

        return cacheDOM.reduce((result, el) => {
            if (el.id === id && el.tagName === 'VIDEO') {
                result = el.html
            }
            return result
        }, {})
    },
    playPause: video => {
        video = typeChecker('object', {}, 'video')(video)

        video.paused ? video.play() : video.pause()
    }

}