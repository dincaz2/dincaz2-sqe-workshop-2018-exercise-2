/* eslint-disable max-lines-per-function */
import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import {binaryExpression, paintWrapper, extractFunctionParams} from '../src/js/code-painter';

describe('The substitution module', () => {

    it('is extracting param values correctly', () => {
        let params = '[1,2],2,3,\'hello, world!\'';
        let actual = extractFunctionParams(params);
        let expected = {0 : '[1,2]', 1 : '2', 2 : '3', 3 : '\'hello, world!\''};
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is doing nothing when there is no if statement', () => {
        let code =
            'function foo(x, y, z){\n' +
            '    while (x < y) {\n' +
            '        x = y;\n' +
            '    }\n' +
            '}';
        let params = '1,2,3';
        let actual = paintWrapper(parseCode(code), params);
        let expected = {'g' : [], 'r' : []};
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is evaluating a binary expression', () => {
        let code =
            'x + 1 + y + z;';
        let params = {'x' : 1, 'y' : 2, 'z' : 3};
        let actual = binaryExpression(parseCode(code).body[0].expression, params);
        let expected = '7';
        assert.equal(actual, expected);
    });

    it('is coloring a simple true if statement', () => {
        let code =
            'function foo(x, y, z) {\n' +
            '    if (x + 1 + y < z) {\n' +
            '        return x + y + z + (0 + 5);\n' +
            '    }\n' +
            '}';
        let params = '1,2,3';
        let actual = paintWrapper(parseCode(code), params);
        let expected = {'g' : [], 'r' : [2]};
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is coloring a simple false if statement', () => {
        let code =
            'function foo(x, y, z) {\n' +
            '    if (x + 1 + y >= z) {\n' +
            '        return x + y + z + (0 + 5);\n' +
            '    }\n' +
            '}';
        let params = '1,2,3';
        let actual = paintWrapper(parseCode(code), params);
        let expected = {'g' : [2], 'r' : []};
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is coloring a compound if statement', () => {
        let code =
            'function foo(x, y, z) {\n' +
            '    if (x + 1 + y < z) {\n' +
            '        return x + y + z + (0 + 5);\n' +
            '    } else if (x + 1 + y < z * 2) {\n' +
            '        return x + y + z + (0 + x + 5);\n' +
            '    } else {\n' +
            '        return x + y + z + (0 + z + 5);\n' +
            '    }\n' +
            '}';
        let params = '1,2,3';
        let actual = paintWrapper(parseCode(code), params);
        let expected = {'g' : [4], 'r' : [2]};
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is handling arrays', () => {
        let code =
            'function foo(x, y, z) {\n' +
            '    if (x[0] < z) {\n' +
            '        y = z;\n' +
            '    }\n' +
            '    return y;\n' +
            '}';
        let params = '[1,2],2,3';
        let actual = paintWrapper(parseCode(code), params);
        let expected = {'g' : [2], 'r' : []};
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is handling arrays 2', () => {
        let code =
            'function foo(x, y, z) {\n' +
            '    y = [x,1];\n' +
            '    if (y[0] < z) {\n' +
            '        y = z;\n' +
            '    }\n' +
            '    return y;\n' +
            '}';
        let params = '1,2,3';
        let actual = paintWrapper(parseCode(code), params);
        let expected = {'g' : [3], 'r' : []};
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is handling arrays 3', () => {
        let code =
            'function foo(x, y, z) {\n' +
            '    y = [x,1];\n' +
            '    if (y[0] < z) {\n' +
            '        y = z;\n' +
            '    }\n' +
            '    return y;\n' +
            '}';
        let params = '3,2,1';
        let actual = paintWrapper(parseCode(code), params);
        let expected = {'g' : [], 'r' : [3]};
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is handling global variables', () => {
        let code =
            'let w = 1;\n' +
            'function foo(x, y, z) {\n' +
            '    if (x == w) {\n' +
            '        y = z;\n' +
            '    }\n' +
            '    return y;\n' +
            '}';
        let params = '1,2,1';
        let actual = paintWrapper(parseCode(code), params);
        let expected = {'g' : [3], 'r' : []};
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is handling global variables 2', () => {
        let code =
            'let w = 1;\n' +
            'function foo(x, y, z) {\n' +
            '    if (x == w) {\n' +
            '        y = z;\n' +
            '    }\n' +
            '    return y;\n' +
            '}';
        let params = '2,2,1';
        let actual = paintWrapper(parseCode(code), params);
        let expected = {'g' : [], 'r' : [3]};
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });
});