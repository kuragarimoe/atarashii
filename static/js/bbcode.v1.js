var BBCode = function () {
    let self = {
        _regex: []
    };

    /// FUNCTIONS ///

    /**
     * Implements a BBCode parser by regex.
     * @param {RegExp} regex The regular expresion.
     * @param {Function} func The callback to run as a parser.
     * @param {boolean} [hasArgs=false] Whether or not the parser accepts an argument: [example=arg]data[/example]
     */
    self.implement = (regex, func, hasArgs = false) => {
        // push to regex
        self._regex.push({
            regex,
            func,
            hasArgs
        });

        return self;
    }

    self.add = (code, func) => {
        // create regexp
        let regex = new RegExp(`\\[\(${code}\)\\]\\s?\(.*\)\\s?\\[\\/\(${code}\)\\]`);

        // implement
        self.implement(regex, func, false);
        return self;
    }

    self.add_args = (code, func) => {
        let regex = new RegExp(`\\[\(${code}\)\=(.*)\\]\\s?\(.*\)\\s?\\[\\/\(${code}\)\\]`);

        self.implement(regex, func, true);
        return self;
    }

    self.parse = (code) => {
        let match = true;

        do {
            let reg = self._regex.find((rx) => rx.regex.test(code));
            if (reg) {
                if (reg.hasArgs) {
                    let matches = reg.regex.exec(code);
                    code = code.replace(reg.regex, reg.func(matches[3], matches[2], matches))
                } else {
                    let matches = reg.regex.exec(code);
                    code = code.replace(reg.regex, reg.func(matches[2], null, matches))
                }
            } else match = false;
        } while (match == true);

        return code;
    }

    /// CORE BBCODE ///
    self.add("b", (text) => {
        return "<strong style=\"color: white;\">"+text+"</strong>"
    })

    self.add("i", (text) => {
        return "<i style=\"color: white;\">"+text+"</i>"
    })

    self.add("center", (text) => {
        return "<center>"+text+"</center>"
    })

    self.add("user", (text) => {
        return `<a href="/user/${args}">${text}</a>`
    })

    self.add_args("link", (text, args) => {
        return `<a href="/user/${args}">${text}</a>`;
    })

    self.add_args("color", (text, args) => {
        return "<strong class=\""+args+"\">"+text+"</strong>";
    })

    return self;
};