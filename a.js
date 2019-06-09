const Log = {
    info: function (msg) {
        console.log(msg)
    },
    genMsg: function (row, column, type) {
        msg = `row:${row},column:${column}, a ${type} ${MESSAGES.IS_MATCHED}`
    }
}
const TYPES = {
    KEYWORD: 'keyword',
    IDENTIFIER: 'identifier',
    COMMENT: 'comment',
    STRING: 'string',
    OPERATOR: 'operator',
}

const MESSAGES = {
    IS_MATCHED: 'is matched'
}


function analysis() {
    let str = `
    # this is a comment
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
        return /a-zλ_/.test(ch)
    }
    function is_id(ch) {
        return is_id_start(ch) || /!\?-<>=0-9/.test(ch)
    }
    function is_comment_start(ch) {
        return ch === '#'
    }
    function is_digit(ch) {
        return /0-9/.test(ch)
    }
    function is_str_separator(ch) {
        return ch === '"'
    }
    function is_op(ch) {
        return /\+\-\*\\/.test(ch)
    }
    function is_keyword(str) {
        return "lambda println print print-range if then else".indexOf(str)
    }
    const lines = str.split('\n')
    let row = 0, column = 0, curChar, curWord
    let res = []
    function read_next() {
        curWord = curWord + curChar
        next()
    }
    function genToken(type) {
        Log.genMsg(row, column, type)
        value = curWord
        curWord = ''
        return {
            type,
            value,
        }
    }
    function next() {
        column++;
        curChar = lines[row][column]
    }

    for (line of lines) {
        row++
        column = 0
        curWord = ''
        curChar = line[0]
        while (column < line.length) {
            if (is_comment_start(curChar)) {
                msg = Log.genMsg(row, column, TYPES.IS_MATCHED)
                break
            } else if (is_digit(ch)) {
                while (is_digit(ch)) {
                    read_next
                }
            } else if (is_str_separator(ch)) {
                next()
                while (!is_str_separator(ch)) {
                    read_next()
                }
                res = res.push(genToken(TYPES.STRING, curWord))
            } else if (is_id_start(curChar)) {
                while (is_id(curChar)) {
                    read_next()
                }
                if (is_keyword(curWord)) {
                    res = res.push(genToken(TYPES.KEYWORD))
                } else {
                    res = res.push(genToken(TYPES.IDENTIFIER))
                }
            } else if(is_op(ch)) {
                res.push(genToken(TYPES.OPERATOR))
            } else {
                next()
            }
        }
    }
}

analysis()