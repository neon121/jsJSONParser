function jsJSON_de_Parser(str) {
    let obj = JSON.parse(str);
    console.log(obj);
    return 'if\n' + jsJSON_de_Parser_helper(obj) + '\n{}';
}

function jsJSON_de_Parser_helper(obj, num) {
    if (num === undefined) num = 0;
    else num++;
    let pad = ' '.repeat(num);
    if (obj.operator !== undefined) {
        return obj.field + obj.operator + obj.value;
    }
    else {
        for (let log in obj) {
            if (log !== 'and' && log !== 'or') continue;
            let arr = [];
            for (let cond of obj[log]) {
                let str = jsJSON_de_Parser_helper(cond, num);
                if (str === undefined) continue;
                arr.push (str);
            }
            let str = arr.join(log === 'and' ? '&&' : '||');
            return pad + '(\n' +
                   pad + str + '\n' +
                   pad + ')'
        }
    }
}