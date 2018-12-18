/* eslint-disable max-lines-per-function */
import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import {substituteWrapper} from '../src/js/code-substitution';

describe('The substitution module', () => {

    it('is removing assignments variable declarations', () => {
        let code =
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '}';
        let actual = substituteWrapper(parseCode(code));
        let expected =
            'function foo(x, y, z) {\n' +
            '}';
        assert.equal(actual,expected);
    });

    it('is handling a simple if statement', () => {
        let code =
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    }\n' +
            '}';
        let actual = substituteWrapper(parseCode(code));
        let expected =
            'function foo(x, y, z) {\n' +
            '    if (x + 1 + y < z) {\n' +
            '        return x + y + z + (0 + 5);\n' +
            '    }\n' +
            '}';
        assert.equal(actual,expected);
    });

    it('is handling a compound if statement', () => {
        let code =
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0, d;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else if (b < z * 2) {\n' +
            '        c = c + x + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + c;\n' +
            '    }\n' +
            '}\n';
        let actual = substituteWrapper(parseCode(code));
        let expected =
            'function foo(x, y, z) {\n' +
            '    if (x + 1 + y < z) {\n' +
            '        return x + y + z + (0 + 5);\n' +
            '    } else if (x + 1 + y < z * 2) {\n' +
            '        return x + y + z + (0 + x + 5);\n' +
            '    } else {\n' +
            '        return x + y + z + (0 + z + 5);\n' +
            '    }\n' +
            '}';
        assert.equal(actual,expected);
    });

    it('is handling a while statement', () => {
        let code =
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    while (a < z) {\n' +
            '        c = a + b;\n' +
            '        z = c * 2;\n' +
            '    }\n' +
            '    \n' +
            '    return z;\n' +
            '}\n';
        let actual = substituteWrapper(parseCode(code));
        let expected =
            'function foo(x, y, z) {\n' +
            '    while (x + 1 < z) {\n' +
            '        z = (x + 1 + (x + 1 + y)) * 2;\n' +
            '    }\n' +
            '    return z;\n' +
            '}';
        assert.equal(actual,expected);
    });

    it('is handling arrays', () => {
        let code =
            'function foo(x, y, z){\n' +
            '    let a = x[0];\n' +
            '    \n' +
            '    if (a < z) {\n' +
            '        y = z;\n' +
            '    }\n' +
            '    return y;\n' +
            '}\n';
        let actual = substituteWrapper(parseCode(code));
        let expected =
            'function foo(x, y, z) {\n' +
            '    if (x[0] < z) {\n' +
            '        y = z;\n' +
            '    }\n' +
            '    return y;\n' +
            '}';
        assert.equal(actual,expected);
    });

    it('is handling arrays 2', () => {
        let code =
            'function foo(x, y, z){\n' +
            '    let a = [1,2,3];\n' +
            '    \n' +
            '    if (a[0] < z) {\n' +
            '        y = z;\n' +
            '    }\n' +
            '    return y;\n' +
            '}\n';
        let actual = substituteWrapper(parseCode(code));
        let expected =
            'function foo(x, y, z) {\n' +
            '    if ([1,2,3][0] < z) {\n' +
            '        y = z;\n' +
            '    }\n' +
            '    return y;\n' +
            '}';
        assert.equal(actual,expected);
    });

    it('is handling arrays 3', () => {
        let code =
            'function foo(x, y, z){\n' +
            '    let a = [1,2,3];\n' +
            '    a[0] = 5;\n' +
            '    \n' +
            '    if (a[0] < z) {\n' +
            '        y = z;\n' +
            '    }\n' +
            '    return y;\n' +
            '}\n';
        let actual = substituteWrapper(parseCode(code));
        let expected =
            'function foo(x, y, z) {\n' +
            '    if (5 < z) {\n' +
            '        y = z;\n' +
            '    }\n' +
            '    return y;\n' +
            '}';
        assert.equal(actual,expected);
    });

    it('is handling global variables', () => {
        let code =
            'let w = 1;\n' +
            'function foo(x, y, z){\n' +
            '    let a = w;\n' +
            '    \n' +
            '    if (a < z) {\n' +
            '        y = z;\n' +
            '    }\n' +
            '    return y;\n' +
            '}\n';
        let actual = substituteWrapper(parseCode(code));
        let expected =
            'let w = 1;\n' +
            'function foo(x, y, z) {\n' +
            '    if (w < z) {\n' +
            '        y = z;\n' +
            '    }\n' +
            '    return y;\n' +
            '}';
        assert.equal(actual,expected);
    });

    it('is handling parameter overriding', () => {
        let code =
            'function foo(x, y, z){\n' +
            '    x = 2;\n' +
            '    \n' +
            '    if (x < z) {\n' +
            '        y = z;\n' +
            '    }\n' +
            '    return y;\n' +
            '}\n';
        let actual = substituteWrapper(parseCode(code));
        let expected =
            'function foo(x, y, z) {\n' +
            '    x = 2;\n' +
            '    if (2 < z) {\n' +
            '        y = z;\n' +
            '    }\n' +
            '    return y;\n' +
            '}';
        assert.equal(actual,expected);
    });
});