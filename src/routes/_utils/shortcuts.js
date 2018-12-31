
const scopes = new Map()

export function isShortcutEvent(event) {
    let target = event.target;
    return !target || !(target.isContentEditable ||
                        target.tagName == 'INPUT' ||
                        target.tagName == 'TEXTAREA' ||
                        target.tagName == 'SELECT')
}

export function onKeyDownInShortcutScope(scopeKey, event) {
    let scope = scopes[scopeKey]
    if (!scope) {
        return
    }
    let len = scope.length
    let i = -1
    while (++i < len) {
        scope[i].onKeyDown(event)
    }
}

export function addToShortcutScope(key, component) {
    let scope = scopes[key]
    if (!scope) {
        scope = new Array()
        scopes[key] = scope
    }
    scope.push(component)
}

export function removeFromShortcutScope(key, component) {
    let scope = scopes[key]
    if (!scope) {
        return
    }
    scope.splice(scope.indexOf(component), 1)
    if (scope.length == 0) {
        scopes.delete(key)
    }
}
