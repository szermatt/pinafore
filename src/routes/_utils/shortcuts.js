
const shortcuts = new Map()
const GLOBAL = '__global__'
const ANY_KEY = '__any__'

export function dispatchShortcut(destinationKey, key, timeStamp) {
    let m = shortcuts[destinationKey]
    if (!m) {
        return false
    }
    let handler = m[key]
    if (!handler) {
        handler = m[ANY_KEY]
        if (!handler) {
            return false
        }
    }
    return handler(key, timeStamp) != false
}

export function addGlobalShortcut(key, handler) {
    addShortcut(GLOBAL, key, handler)
}

export function removeGlobalShortcut(key) {
    removeShortcut(GLOBAL, key)
}

export function addShortcutDispatcher(handler) {
    addShortcut(GLOBAL, ANY_KEY, handler)
}

export function removeShortcutDispatcher() {
    removeShortcut(GLOBAL, ANY_KEY)
}

export function addShortcut(destinationKey, key, handler) {
    let m = shortcuts[destinationKey]
    if (!m) {
        m = new Map()
        shortcuts[destinationKey] = m
    }
    m[key] = handler
}

export function removeShortcut(destinationKey, key) {
    let m = shortcuts[destinationKey]
    if (!m) {
        return
    }
    m.delete(key)
    if (m.length == 0) {
        shortcuts.delete(destinationKey)
    }
}

export function onKeyDown(e) {
    if (dispatchShortcut(GLOBAL, e.key, e.timeStamp)) {
        event.stopPropagation()
    }
}
