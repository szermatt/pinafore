let currentScope = 'global'
let scopeStack = []
export function pushShortcutScope(scope) {
    scopeStack.push(currentScope)
    currentScope = scope
}

export function popShortcutScope(scope) {
    if (scope != currentScope) {
        return
    }
    currentScope = scopeStack.pop()
}

const scopeKeyMaps = new Map()
let prefixMap = null
let prefixMapScope = null
export function addToShortcutScope(scopeKey, keys, component) {
    if (scopeKeyMaps.size == 0) {
        window.addEventListener('keydown', onKeyDown)
    }
    let keyMap = scopeKeyMaps.get(scopeKey)
    if (!keyMap) {
        keyMap = new Map()
        scopeKeyMaps.set(scopeKey, keyMap)
    }
    mapKeys(keyMap, keys, component)
}

export function removeFromShortcutScope(scopeKey, keys, component) {
    let keyMap = scopeKeyMaps.get(scopeKey)
    if (!keyMap) {
        return
    }
    unmapKeys(keyMap, keys, component)
    if (keyMap.size == 0) {
        scopeKeyMaps.delete(scopeKey)
    }
    if (scopeKeyMaps.size == 0) {
        window.removeEventListener('keydown', onKeyDown)
    }
}

const FALLBACK_KEY = '__fallback__'
export function addShortcutFallback(scopeKey, component) {
    addToShortcutScope(scopeKey, FALLBACK_KEY, component)
}

export function removeShortcutFallback(scopeKey, component) {
    removeFromShortcutScope(scopeKey, FALLBACK_KEY, component)
}

export function onKeyDownInShortcutScope(scopeKey, event) {
    if (prefixMap) {
        let handled = false
        if (prefixMapScope == scopeKey) {
            handled = handleEvent(scopeKey, prefixMap, event)
        }
        prefixMap = null
        prefixMapScope = null
        if (handled) {
            return
        }
    }
    handleEvent(scopeKey, scopeKeyMaps.get(scopeKey), event)
}

function handleEvent(scopeKey, keyMap, event) {
    if (!keyMap) {
        return false
    }
    let value = keyMap.get(event.key) || keyMap.get(FALLBACK_KEY)
    if (!value) {
        return false
    }
    if (Map.prototype.isPrototypeOf(value)) {
        prefixMap = value
        prefixMapScope = scopeKey
    } else {
        value.onKeyDown(event)
    }
    return true
}

function onKeyDown(event) {
    if (!acceptShortcutEvent(event)) {
        return
    }
    onKeyDownInShortcutScope(currentScope, event)
}

function mapKeys(keyMap, keys, component) {
    keys.split('|').forEach(
        (seq) => {
            let seqArray = seq.split(' ')
            let prefixLen = seqArray.length - 1
            let currentMap = keyMap;
            let i = -1
            while (++i < prefixLen) {
                let prefixMap = currentMap.get(seqArray[i])
                if (!prefixMap) {
                    prefixMap = new Map()
                    currentMap.set(seqArray[i], prefixMap)
                }
                currentMap = prefixMap
            }
            currentMap.set(seqArray[prefixLen], component)
        })
}

function unmapKeys(keyMap, keys, component) {
    keys.split('|').forEach(
        (seq) => {
            let seqArray = seq.split(' ')
            let prefixLen = seqArray.length - 1
            let currentMap = keyMap;
            let i = -1
            while (++i < prefixLen) {
                let prefixMap = currentMap.get(seqArray[i])
                if (!prefixMap) {
                    return
                }
                currentMap = prefixMap
            }
            let lastKey = seqArray[prefixLen]
            if (currentMap.get(lastKey) == component) {
                currentMap.delete(lastKey)
            }
        })
}

function acceptShortcutEvent(event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey) {
        return
    }
    
    let target = event.target;
    if (target && (target.isContentEditable ||
                   target.tagName == 'INPUT' ||
                   target.tagName == 'TEXTAREA' ||
                   target.tagName == 'SELECT')) {
        return false
    }
    return true
}

