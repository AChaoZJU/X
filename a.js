const TYPES = {
    KEYWORD: 'keyword',
    IDENTIFIER: 'identifier',
    COMMENT: 'comment',
    STRING: 'string',
    OPERATOR: 'operator',
    PUNCTUATION: 'punctuation',
    INTEGER: 'integer',
}

const MESSAGES = {
    IS_MATCHED: 'is matched'
}


function analysis() {
    let str = `# this is a comment
println("Hello World!");

println(2 + 3 * 4);

# functions are introduced with lambda or λ
fib = lambda (n) if n < 2 then n else fib(n - 1) + fib(n - 2);

println(fib(15));

print-range = λ(a, b)             # λ is synonym to lambda
                if a <= b then {  # then here is optional as you can see below
                  print(a);
                  if a + 1 <= b {
                    print(", ");
                    print-range(a + 1, b);
                  } else println("");        # newline
                };
print-range(1, 5);
    `
    function is_id_start(ch) {
        return /[a-zA-Zλ_]/.test(ch)
    }
    function is_id(ch) {
        return is_id_start(ch) || /[!?\-<>=0-9]/.test(ch)
    }
    function is_comment_start(ch) {
        return ch === '#'
    }
    function is_digit(ch) {
        return /[0-9]/.test(ch)
    }
    function is_str_separator(ch) {
        return ch === '"'
    }
    function is_op(ch) {
        return '+-*/%=&|<>!'.indexOf(ch) >= 0
    }
    function is_keyword(str) {
        return " lambda println print print-range if then else λ ".indexOf(` ${str} `) >= 0
    }
    function is_punc(ch) {
        return ",;(){}[]".indexOf(ch) >= 0
    }
    let lines = str.split('\n')
    let row = 0, column = 0, curChar, curWord
    let res = []
    function read_next() {
        curWord = curWord + curChar
        next()
    }
    function genToken(type) {
        Log.genMsg(row, column, type)
        value = curWord ? curWord : curChar
        curWord = ''
        return {
            type,
            value,
        }
    }
    function is_whitespace(ch) {
        return ' \t\n'.indexOf(ch) >= 0
    }
    function skip_whitespace() {
        while(is_whitespace(curChar)) {
            next()
        }
    }
    function next() {
        column++;
        curChar = lines[row-1][column-1]
    }

    const Log = {
        genMsg: function (row, column, type) {
            const slot = curWord ? `, ${curWord}, ` : " "
            console.log(`row:${row},column:${column}, a ${type}${slot}${MESSAGES.IS_MATCHED}`)
        }
    }

    for (line of lines) {
        row++
        column = 1
        curWord = ''
        curChar = line[0]
        while (column <= line.length) {
            skip_whitespace()
            if(curChar == undefined) continue
            if (is_comment_start(curChar)) {
                msg = Log.genMsg(row, column, TYPES.COMMENT)
                break
            } else if (is_digit(curChar)) {
                while (is_digit(curChar)) {
                    read_next()
                }
                res.push(genToken(TYPES.INTEGER))
            } else if (is_str_separator(curChar)) {
                next()
                while (!is_str_separator(curChar)) {
                    read_next()
                }
                next()
                res.push(genToken(TYPES.STRING))
            } else if (is_id_start(curChar)) {
                while (is_id(curChar)) {
                    read_next()
                }
                if (is_keyword(curWord)) {
                    res.push(genToken(TYPES.KEYWORD))
                } else {
                    res.push(genToken(TYPES.IDENTIFIER))
                }
            } else if(is_op(curChar)) {
                res.push(genToken(TYPES.OPERATOR))
                next()
            } else if(is_punc(curChar)) {
                res.push(genToken(TYPES.PUNCTUATION))
                next()
            } else {
                next()
            }
        }
    }
    return res
}

analysis()