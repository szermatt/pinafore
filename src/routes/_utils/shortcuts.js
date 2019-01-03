
const scopes = new Map()
let inModal = false
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

export function acceptShortcutEvent(event) {
    let target = event.target;
    if (target && (target.isContentEditable ||
                   target.tagName == 'INPUT' ||
                   target.tagName == 'TEXTAREA' ||
                   target.tagName == 'SELECT')) {
        return false
    }

    return true
}

export function onKeyDownInShortcutScope(scopeKey, event) {
    let scope = scopes.get(scopeKey)
    if (!scope) {
        return
    }
    let len = scope.length
    let i = -1
    while (++i < len) {
        scope[i].onKeyDown(event)
    }
}

function onKeyDown(event) {
    if (!acceptShortcutEvent(event)) {
        return
    }
    onKeyDownInShortcutScope(currentScope, event)
}

export function addToShortcutScope(key, component) {
    if (scopes.size == 0) {
        window.addEventListener('keydown', onKeyDown)
    }
    let scope = scopes.get(key)
    if (!scope) {
        scope = new Array()
        scopes.set(key, scope)
    }
    scope.push(component)
}

export function removeFromShortcutScope(key, component) {
    let scope = scopes.get(key)
    if (!scope) {
        return
    }
    scope.splice(scope.indexOf(component), 1)
    if (scope.length == 0) {
        scopes.delete(key)
    }
    if (scopes.size == 0) {
        window.removeEventListener('keydown', onKeyDown)
    }
}
