class CVInterpreter {
    constructor() {
        this.variables = {};
        this.ifExec = false;
    }

    parseLine(line) {
        line = line.trim();
        if (/^[a-zA-Z_]\w* is \d+$/.test(line)) {
            let [varName, value] = line.split(" is ");
            this.variables[varName.trim()] = parseInt(value.trim(), 10);
        } else if (line.startsWith("if ") && line.includes(" then")) {
            let condition = line.slice(3, line.indexOf(" then")).trim();
            return ["if", condition];
        } else if (line === "otherwise then") {
            return ["else", null];
        } else if (line === "thats all") {
            return ["end_block", null];
        } else if (line.startsWith("can you say")) {
            let match = line.match(/can you say "(.*)"\?/);
            if (match) {
                return ["print", match[1]];
            }
        }
        return null;
    }

    evaluateCondition(condition) {
        if (condition.includes(" is ")) {
            let [varName, value] = condition.split(" is ");
            varName = varName.trim();
            value = parseInt(value.trim(), 10);
            return this.variables[varName] === value;
        }
        return false;
    }

    run(code) {
        let lines = code.split('\n');
        let output = [];
        let i = 0;

        while (i < lines.length) {
            let line = lines[i];
            let parsedLine = this.parseLine(line);
            if (parsedLine) {
                let [cmd, arg] = parsedLine;
                if (cmd === "if") {
                    this.ifExec = false;
                    let condition = arg;
                    if (this.evaluateCondition(condition)) {
                        this.ifExec = true;
                        i++;
                        while (i < lines.length && lines[i].trim() !== "thats all") {
                            if (lines[i].trim() === "otherwise then") {
                                while (i < lines.length && lines[i].trim() !== "thats all") {
                                    i++;
                                }
                                break;
                            }
                            output.push(this.runLine(lines[i]));
                            i++;
                        }
                    } else {
                        while (i < lines.length && lines[i].trim() !== "otherwise then") {
                            i++;
                        }
                        if (i < lines.length && lines[i].trim() === "otherwise then") {
                            i++;
                            while (i < lines.length && lines[i].trim() !== "thats all") {
                                output.push(this.runLine(lines[i]));
                                i++;
                            }
                        }
                    }
                } else if (cmd === "else") {
                    if (!this.ifExec) {
                        i++;
                        while (i < lines.length && lines[i].trim() !== "thats all") {
                            output.push(this.runLine(lines[i]));
                            i++;
                        }
                    } else {
                        while (i < lines.length && lines[i].trim() !== "thats all") {
                            i++;
                        }
                    }
                } else if (cmd === "print") {
                    output.push(arg);
                }
            }
            i++;
        }
        return output.filter(Boolean).join('\n');
    }

    runLine(line) {
        let parsedLine = this.parseLine(line);
        if (parsedLine) {
            let [cmd, arg] = parsedLine;
            if (cmd === "print") {
                return arg;
            }
        }
        return '';
    }
}

document.getElementById('runButton').addEventListener('click', () => {
    const code = document.getElementById('codeEditor').value;
    const interpreter = new CVInterpreter();
    const output = interpreter.run(code);
    document.getElementById('output').textContent = output;
});
