import * as escodegen from 'escodegen';

function copyEnv(env){
    return JSON.parse(JSON.stringify(env));
}

const handlers = {
    'Program': block,
    'BlockStatement': block,
    'AssignmentExpression': assignmentExpression,
    'ExpressionStatement': expressionStatement,
    'FunctionDeclaration': functionDeclaration,
    'IfStatement': ifStatement,
    'VariableDeclaration': variableDeclaration,
    'WhileStatement': whileStatement,
    'ReturnStatement': returnStatement
};

function substitute(exp, env, notLocals, isGlobal) {
    return handlers[exp.type](exp, env, notLocals, isGlobal);
}

function block(exp, env, notLocals, isGlobal) {
    env = copyEnv(env);
    for (let i = 0; i < exp.body.length; i++) {
        if (substitute(exp.body[i], env, notLocals, isGlobal)){
            exp.body.splice(i, 1);
            i--;
        }
    }
}

function assignmentExpression(exp, env, notLocals) {
    let right = substituteAtomic(exp.right, env);
    let left = exp.left;
    if (left.type === 'Identifier')
        env[exp.left.name] = right;
    else // array
        env[left.object.name + '[' + left.property.raw + ']'] = right;
    return !notLocals.includes(exp.left.name);
}

function expressionStatement(exp, env, notLocals, isGlobal) {
    return substitute(exp.expression, env, notLocals, isGlobal);
}

function functionDeclaration(exp, env, notLocals) {
    exp.params.forEach(p => {notLocals.push(p.name); env[p.name] = p;});
    substitute(exp.body, env, notLocals, false);
}

function ifStatement(exp, env, notLocals, isGlobal) {
    exp.test = substituteAtomic(exp.test, env);
    substitute(exp.consequent, env, notLocals, isGlobal);
    if (exp.alternate !== null)
        substitute(exp.alternate, env, notLocals, isGlobal);
}

function variableDeclaration(exp, env, notLocals, isGlobal) {
    if (isGlobal)
        exp.declarations.forEach(e => {notLocals.push(e.id.name); env[e.id.name] = e.id;});
    else
        exp.declarations.forEach(e => env[e.id.name] = e.init === null ? e.id : substituteAtomic(e.init, env));
    return !isGlobal;
}

function whileStatement(exp, env, notLocals, isGlobal) {
    exp.test = substituteAtomic(exp.test, env);
    substitute(exp.body, env, notLocals, isGlobal);
}

function returnStatement(exp, env) {
    exp.argument = substituteAtomic(exp.argument, env);
}

const atomicHandlers = {
    'BinaryExpression': binaryExpression,
    'LogicalExpression': binaryExpression,
    'Identifier': identifier,
    'Literal': literal,
    'MemberExpression': memberExpression,
    'ArrayExpression': arrayExpression,
};

function substituteAtomic(exp, env) {
    return atomicHandlers[exp.type](exp, env);
}

function binaryExpression(exp, env) {
    exp.left = substituteAtomic(exp.left, env);
    exp.right = substituteAtomic(exp.right, env);
    return exp;
}

function identifier(exp, env) {
    return env[exp.name];
}

function literal(exp) {
    return exp;
}

function arrayExpression(exp, env){
    exp.elements = exp.elements.map(e => substituteAtomic(e, env));
    return exp;
}

function memberExpression(exp, env) {
    let memberString = exp.object.name + '[' + exp.property.raw + ']';
    if (memberString in env)
        return env[memberString];
    exp.object = substituteAtomic(exp.object, env);
    exp.property = substituteAtomic(exp.property, env);
    return exp;
}

function substituteWrapper (parsedCode) {
    substitute(parsedCode, {}, [], true);
    let codeArr = escodegen.generate(parsedCode).split('\n');
    for (var i = 0; i < codeArr.length; i++){
        if (codeArr[i].endsWith('[')){
            while (!codeArr[i].includes(']')){
                codeArr[i] += codeArr[i+1].trim();
                codeArr.splice(i+1, 1);
            }
        }
    }
    return codeArr.join('\n');
}

export {substituteWrapper};