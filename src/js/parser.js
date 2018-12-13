function line(exp){
    return exp.loc.start.line;
}

const handlers = {
    'Program': block,
    'BlockStatement': block,
    'AssignmentExpression': assignmentExpression,
    'ExpressionStatement': expressionStatement,
    'ForStatement': forStatement,
    'FunctionDeclaration': functionDeclaration,
    'IfStatement': ifStatement,
    'VariableDeclaration': variableDeclaration,
    'UpdateExpression': updateExpression,
    'WhileStatement': whileStatement,
    'DoWhileStatement': doWhileStatement,
    'ReturnStatement': returnStatement
};

function parse(exp) {
    return handlers[exp.type](exp);
}

function block(exp) {
    return exp.body.reduce((arr, e) => arr.concat(parse(e)), []);
}

function assignmentExpression(exp) {
    let name = parseAtomic(exp.left);
    let operator = exp.operator === '=' ? '' : name + ' ' + exp.operator[0] + ' ';
    return [newRow(line(exp), 'assignment expression', name, '', operator + parseAtomic(exp.right))];
}

function expressionStatement(exp) {
    return parse(exp.expression);
}

function forStatement(exp) {
    let condition = parseAtomic(exp.init) + '; ' + parseAtomic(exp.test) + '; ' + parseAtomic(exp.update);
    let forLine = [newRow(line(exp), 'for statement', '', condition, '')];
    return forLine.concat(parse(exp.body));
}

function param(param) {
    return newRow(line(param), 'variable declaration', param.name, '', '');
}

function functionDeclaration(exp) {
    let fdRow = [newRow(line(exp), 'function declaration', parseAtomic(exp.id), '', '')];
    fdRow = exp.params.reduce((arr, e) => {arr.push(param(e)); return arr;}, fdRow);
    return fdRow.concat(parse(exp.body));
}

function ifStatement(exp) {
    return ifStatementRec(exp, true);
}

function ifStatementRec(exp, first) {
    let ifRows = [newRow(line(exp), (first ? '' : 'else ') + 'if statement', '', parseAtomic(exp.test), '')];
    ifRows = ifRows.concat(parse(exp.consequent));
    if (exp.alternate === null)
        return ifRows;
    if (exp.alternate.type === 'IfStatement')
        return ifRows.concat(ifStatementRec(exp.alternate,false));
    return ifRows.concat(parse(exp.alternate));
}

function variableDeclaration(exp) {
    return exp.declarations.reduce((arr, e) => arr.concat(variableDeclarator(e)), []);
}

function variableDeclarator(exp) {
    let init = exp.init === null ? '' : parseAtomic(exp.init);
    return [newRow(line(exp), 'variable declaration', parseAtomic(exp.id), '', init)];
}

function updateExpression(exp) {
    return [newRow(line(exp), 'update expression', parseAtomic(exp.argument), '', exp.operator)];
}

function whileStatement(exp) {
    let whileLine = [newRow(line(exp), 'while statement', '', parseAtomic(exp.test), '')];
    return whileLine.concat(parse(exp.body));
}

function doWhileStatement(exp) {
    let doWhileLine = [newRow(line(exp), 'do while statement', '', parseAtomic(exp.test), '')];
    return doWhileLine.concat(parse(exp.body));
}

function returnStatement(exp) {
    return [newRow(line(exp), 'return statement', '', '', parseAtomic(exp.argument))];
}

const atomicHandlers = {
    'BinaryExpression': binaryExpression,
    'LogicalExpression': binaryExpression,
    'Identifier': identifier,
    'Literal': literal,
    'MemberExpression': memberExpression,
    'UnaryExpression': unaryExpression,
    'UpdateExpression': atomicUpdateExpression,
    'VariableDeclaration': atomicVariableDeclaration,
    'AssignmentExpression': atomicAssignmentExpression
};

function parseAtomic(exp) {
    return atomicHandlers[exp.type](exp);
}

function binaryExpression(exp) {
    return '(' + parseAtomic(exp.left) + ' ' + exp.operator + ' ' + parseAtomic(exp.right) + ')';
}

function identifier(exp) {
    return exp.name;
}

function literal(exp) {
    return exp.raw;
}

function memberExpression(exp) {
    return parseAtomic(exp.object) + '[' + parseAtomic(exp.property) + ']';
}

function unaryExpression(exp) {
    return exp.operator + parseAtomic(exp.argument);
}

function atomicUpdateExpression(exp) {
    if (exp.prefix)
        return exp.operator + parseAtomic(exp.argument);
    else
        return parseAtomic(exp.argument) + exp.operator;
}

function atomicVariableDeclaration(exp) {
    return exp.declarations.reduce((str, e) => str + atomicVariableDeclarator(e), '');
}

function atomicVariableDeclarator(exp) {
    return 'let ' + parseAtomic(exp.id) + ' = ' + parseAtomic(exp.init);
}

function atomicAssignmentExpression(exp) {
    return parseAtomic(exp.left)+ ' = ' + parseAtomic(exp.right);
}

function newRow(line, type, name, condition, value) {
    return [line, type, name, condition, value];
    // return {'line': line, 'type': type, 'name': name, 'condition': condition, 'value': value};
}

function parseAndView(parsedCode) {
    let rows = [newRow('Line', 'Type', 'Name', 'Condition', 'Value')];
    return rows.concat(parse(parsedCode));
    // populateTable(rows);
    // return rows;
}

export {parseAndView, parse};