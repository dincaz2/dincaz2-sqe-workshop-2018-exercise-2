function line(exp){
    return exp.loc.start.line;
}

const handlers = {
    'Program': block,
    'BlockStatement': block,
    'AssignmentExpression': assignmentExpression,
    'ExpressionStatement': expressionStatement,
    'FunctionDeclaration': functionDeclaration,
    'IfStatement': ifStatement,
    'WhileStatement': whileStatement,
    'VariableDeclaration' : variableDeclaration,
};

function paint(exp, params, coloredLines) {
    if (exp.type in handlers)
        handlers[exp.type](exp, params, coloredLines);
}

function block(exp, params, coloredLines) {
    exp.body.forEach(e => paint(e, params, coloredLines));
}

function assignmentExpression() {
}

function expressionStatement(exp, params, coloredLines) {
    paint(exp.expression, params, coloredLines);
}

function functionDeclaration(exp, params, coloredLines) {
    exp.params.forEach((p, i) => {params[p.name] = params[i]; delete params[i];});
    paint(exp.body, params, coloredLines);
}

function variableDeclaration(exp, params) {
    exp.declarations.forEach(e => params[e.id.name] = evalExp(e.init, params));
}

function ifStatement(exp, params, coloredLines) {
    let colorIndex = evalExp(exp.test, params) ? 0 : 1;
    coloredLines[colorIndex].push(line(exp));
    paint(exp.consequent, params, coloredLines);
    if (exp.alternate !== null)
        paint(exp.alternate, params, coloredLines);
}

function whileStatement(exp, params, coloredLines) {
    paint(exp.body, params, coloredLines);
}

const atomicHandlers = {
    'BinaryExpression': binaryExpression,
    'LogicalExpression': binaryExpression,
    'Identifier': identifier,
    'Literal': literal,
    'MemberExpression': memberExpression,
    'ArrayExpression': arrayExpression,
};

function evalExp(exp, params) {
    return atomicHandlers[exp.type](exp, params);
}

function binaryExpression(exp, params) {
    let left = evalExp(exp.left, params);
    let right = evalExp(exp.right, params);
    return eval(left + exp.operator + right);
}

function identifier(exp, params) {
    return params[exp.name];
}

function literal(exp) {
    return exp.raw;
}

function memberExpression(exp, params) {
    let object = evalExp(exp.object, params);
    let property = evalExp(exp.property, params);
    return eval(object + '[' + property + ']');
}

function arrayExpression(exp, params){
    return '[' + exp.elements.map(e => evalExp(e, params)).join(',') + ']';
}


function paintWrapper (parsedCode, params) {
    let coloredLines = [[],[]];
    paint(parsedCode, extractFunctionParams(params), coloredLines);
    return {'g' : coloredLines[0], 'r' : coloredLines[1]};
}

function pushUntil(paramArr, i, terminator){
    var s = paramArr[i];
    while (!paramArr[i].endsWith(terminator)){
        s += ',' + paramArr[++i];
    }
    return [s, i];
}

function extractFunctionParams(paramString) {
    let paramStringArr = paramString.split(',');
    var params = {};
    var index = 0;
    for (var i = 0; i < paramStringArr.length; i++) {
        if (paramStringArr[i].startsWith('[')) {
            let res = pushUntil(paramStringArr, i, ']');
            params[index++] = res[0];
            i = res[1];
        } else if (paramStringArr[i].startsWith('\'')) {
            let res = pushUntil(paramStringArr, i, '\'');
            params[index++] = res[0];
            i = res[1];
        } else
            params[index++] = paramStringArr[i];
    }
    return params;
}

export {paintWrapper, binaryExpression, extractFunctionParams};