import { typeChecker } from './typeChecker';

export const video = {
    getVideoElements: (cacheDOM) => {
        cacheDOM = typeChecker('object', {}, 'cacheDOM')(cacheDOM)
        cacheDOM.filter(el => el.tagName === 'VIDEO' ? true : false)
    },
    getVideoHTMLelementByID: ({ id, cacheDOM }) => {
        id = typeChecker('string', '', 'id')(id)
        cacheDOM = typeChecker('object', {}, 'cacheDOM')(cacheDOM)

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