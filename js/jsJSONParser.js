function jsJSONParser(str) {
    let S = str.replace(/\r|\n|\$/g,'').replace(/\s+([^\w])/g,'$1').replace(/([^\w])\s+/g,'$1')
        .replace(/else if/g, 'elseif');
    let start = 0;
    let ret = [];
    ret.sublvl = [];
    ret.sublvl.parent = ret;
    let link = ret.sublvl;
    while(true) {
        S = S.substr(start);
        let inst = /(if|elseif)(\(.+?\)){|(else)|(})/.exec(S);
        if (inst == null) break;
        if (inst[0] === '}') link = link.parent;
        else {
            let data = {tag: inst[1]};
            data.sublvl = [];
            data.sublvl.parent = link;
            if (inst[1] === 'if' || inst[1] === 'elseif') {
                let subS = inst[2].replace(/\(([\w\s]+[=<>!]+[\w\s]+)\)/g, '$1').replace(/(^\(|\)$)/g, '');
                data.condition = parseBrackets(subS).result;
                /*let subparts;
                subparts = inst[2].split(/(\|\||&&|[=!<>]+)/);
                data.push(subparts);*/
            }
            else if (inst[0] === 'else') {//for else
                data.tag = 'else';
            }
            link.push(data);
            link = data.sublvl;
        }
        start = inst.index + inst[0].length;
    }
    ret = ret.sublvl;
    deleteParentLink(ret);
    let obj = formObj(ret);
    let strJSON = JSON.stringify(obj, null, '  ');
    
    return strJSON;
}

function formObj(ret) {
    let log = {};
    let link = {};
    let ifs = 0;
    for (let i = 0; i < ret.length; i++) if (ret[i].tag === 'if') ifs++;
    if (ifs > 1) {
        log.and = [];
        link = log.and;
        //let retCopy = JSON.parse(JSON.stringify(ret));
        //for (let i = 0; i < retCopy.length; i++) retCopy[i].sublvl = ret[i].sublvl;
        //ret = [];
        let retLinks = [];
        for (let i = 0, ifNum = -1; i < ret.length; i++) {
            if (ret[i].tag === 'if') {
                retLinks.push([]);
                ifNum++;
                retLinks[ifNum].push(ret[i]);
            }
            else retLinks[ifNum].push(ret[i]);
        }
        for (let subret of retLinks) {
            log.and.push(formObj(subret));
        }
        return log;
    }
    else if (ret.length === 1) {
        log.and = [];
        link = log.and;
    }
    else {
        log.or = [];
        link = log.or;
    }
    
    for (let i in ret) {
        //if (i === 'parent') continue;
        let subret = ret[i];
        let arr;
        if (subret.tag === 'else')
            arr = {};
        else { //if and elseif
            let cond = subret.condition;
            arr = formObjCondition(cond);
        }
        if (subret.sublvl === undefined || subret.sublvl.length === 0) {
            link.push(arr);
        }
        else {
            link.push({and: [arr, formObj(subret.sublvl)]});
        }
    }
    return log;
}

function formObjCondition(cond) {
    let arr = {};
    if (cond[0] == '&&' || cond[0] == '||') {
        arr[cond[0] == '&&' ? 'and' : 'or'] = [
            formObjCondition(cond[1]),
            formObjCondition(cond[2])
        ];
    }
    else if (cond.length === 3)
        arr = {field: cond[0], operator: cond[1], value: cond[2]};
    else {//multiple condition (with && or ||)
        let block = [];
        let link = block;
        for (let j = cond.length - 4; j >= 3; j -= 4) {
            if (cond[j] === '&&') {
                link.unshift({and:[]});
                link = link[0].and;
            }
            else {
                link.unshift({or:[]});
                link = link[0].or;
            }
            link.unshift({field: cond[j+1], operator: cond[j+2], value: cond[j+3]});
            if (j === 3)
                link.unshift({field: cond[j-3], operator: cond[j-2], value: cond[j-1]});
        }
        arr = block[0];
    }
    return arr;
}

function parseBrackets(S) {
    let start = 0;
    let sumStart = 0;
    let ret = [];
    let link = ret;
    while(S = S.substr(start)) {
        sumStart += start;
        let inst = S[0];
        if (inst[0] === '(') {
            S = S.substr(1);
            sumStart++;
            let subret = parseBrackets(S);
            link.push(subret.result);
            start = subret.start;
        }
        else if (inst[0] === ')') {
            return {result: ret.length > 1 ? ret: ret[0] , start: sumStart + 1};
        }
        else if (inst[0] === '&' || inst[0] === '|') {
            let obj = [];
            link = ret;
            link.push(obj);
            obj.push(inst[0] + inst[0]);
            let prevId = link.length - 2;
            let copy = link[prevId];
            let prev = JSON.parse(JSON.stringify(copy));
            link.splice(prevId, 1);
            obj.push(prev);
            link = obj;
            start = 2;
        }
        else {
            let condition = /[^()]+/.exec(S)[0];
            condition = /(.+?)(&&|\|\|)?$/.exec(condition)[1];
            let subparts = condition.split(/(\|\||&&|[=!<>]+)/);
            link.push(subparts);
            start = condition.length;
        }
    }
    return {result: ret.length > 1 ? ret: ret[0], start: sumStart + 1};
}

function deleteParentLink(arr) {
    if (typeof arr == 'object') {
        if (arr.parent != undefined) delete (arr.parent);
        for (i in arr) if (arr.hasOwnProperty(i)) deleteParentLink(arr[i]);
    }
}