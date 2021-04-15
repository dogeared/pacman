function Key() {
    var KEY = { 'BACKSPACE': 8, 'TAB': 9, 'NUM_PAD_CLEAR': 12, 'ENTER': 13, 'SHIFT': 16, 'CTRL': 17, 'ALT': 18, 'PAUSE': 19, 'CAPS_LOCK': 20, 'ESCAPE': 27, 'SPACEBAR': 32, 'PAGE_UP': 33, 'PAGE_DOWN': 34, 'END': 35, 'HOME': 36, 'ARROW_LEFT': 37, 'ARROW_UP': 38, 'ARROW_RIGHT': 39, 'ARROW_DOWN': 40, 'PRINT_SCREEN': 44, 'INSERT': 45, 'DELETE': 46, 'SEMICOLON': 59, 'WINDOWS_LEFT': 91, 'WINDOWS_RIGHT': 92, 'SELECT': 93, 'NUM_PAD_ASTERISK': 106, 'NUM_PAD_PLUS_SIGN': 107, 'NUM_PAD_HYPHEN-MINUS': 109, 'NUM_PAD_FULL_STOP': 110, 'NUM_PAD_SOLIDUS': 111, 'NUM_LOCK': 144, 'SCROLL_LOCK': 145, 'SEMICOLON': 186, 'EQUALS_SIGN': 187, 'COMMA': 188, 'HYPHEN-MINUS': 189, 'FULL_STOP': 190, 'SOLIDUS': 191, 'GRAVE_ACCENT': 192, 'LEFT_SQUARE_BRACKET': 219, 'REVERSE_SOLIDUS': 220, 'RIGHT_SQUARE_BRACKET': 221, 'APOSTROPHE': 222 };

    (function () {
        /* 0 - 9 */
        for (let i = 48; i <= 57; i++) {
            KEY['' + (i - 48)] = i;
        }
        /* A - Z */
        for (let i = 65; i <= 90; i++) {
            KEY['' + String.fromCharCode(i)] = i;
        }
        /* NUM_PAD_0 - NUM_PAD_9 */
        for (let i = 96; i <= 105; i++) {
            KEY['NUM_PAD_' + (i - 96)] = i;
        }
        /* F1 - F12 */
        for (let i = 112; i <= 123; i++) {
            KEY['F' + (i - 112 + 1)] = i;
        }
    })();

    function getKeys() {
        return KEY;
    }

    return {
        getKeys: getKeys
    }
}

export { Key };