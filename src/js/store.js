import { typeChecker } from "./typeChecker"

let state = {}

export const getState = () => state
export const setState = nextState => {
    const _nextState = typeChecker('object', {}, nextState)(nextState)

    state = { ...state, ..._nextState }
}