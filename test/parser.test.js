import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import {parseAndView, parse} from '../src/js/parser';

describe('The AST to rows parser', () => {
    it('is parsing with headers an empty program', () => {
        let code = '';
        let actual = parseAndView(parseCode(code));
        let expected = [
            ['Line', 'Type', 'Name', 'Condition', 'Value']
        ];
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is parsing an assignment expression', () => {
        let code = 'a=0';
        let actual = parse(parseCode(code));
        let expected = [
            [1, 'assignment expression', 'a', '', '0']
        ];
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is parsing an assignment expression with += and -=', () => {
        let code = 'a+=1;a-=1;';
        let actual = parse(parseCode(code));
        let expected = [
            [1, 'assignment expression', 'a', '', 'a + 1'],
            [1, 'assignment expression', 'a', '', 'a - 1']
        ];
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is parsing a for statement', () => {
        let code = 'for (let i = 0; i < 100; i++)\n' +
            '{a = 1;}';
        let actual = parse(parseCode(code));
        let expected = [
            [1, 'for statement', '', 'let i = 0; (i < 100); i++', ''],
            [2, 'assignment expression', 'a', '', '1']
        ];
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is parsing a function declaration', () => {
        let code = 'function binarySearch(){}';
        let actual = parse(parseCode(code));
        let expected = [
            [1, 'function declaration', 'binarySearch', '', '']
        ];
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is parsing a simple if statement', () => {
        let code = 'if (X < V[mid])\n' +
            '            high = (mid - 1);';
        let actual = parse(parseCode(code));
        let expected = [
            [1, 'if statement', '', '(X < V[mid])', ''],
            [2, 'assignment expression', 'high', '', '(mid - 1)']
        ];
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is parsing a compound if statement', () => {
        let code = 'if (X < V[mid])\n' +
            '            high = mid - 1;\n' +
            '        else if (X > V[mid])\n' +
            '            low = mid + 1;\n' +
            '        else\n' +
            '            mid = 0;';
        let actual = parse(parseCode(code));
        let expected = [
            [1, 'if statement', '', '(X < V[mid])', ''],
            [2, 'assignment expression', 'high', '', '(mid - 1)'],
            [3, 'else if statement', '', '(X > V[mid])', ''],
            [4, 'assignment expression', 'low', '', '(mid + 1)'],
            [6, 'assignment expression', 'mid', '', '0']
        ];
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is parsing a single variable declaration without init', () => {
        let code = 'let low;';
        let actual = parse(parseCode(code));
        let expected = [
            [1, 'variable declaration', 'low', '', '']
        ];
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is parsing multiple variable declarations without init', () => {
        let code = 'let low, high, mid;';
        let actual = parse(parseCode(code));
        let expected = [
            [1, 'variable declaration', 'low', '', ''],
            [1, 'variable declaration', 'high', '', ''],
            [1, 'variable declaration', 'mid', '', '']
        ];
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is parsing a single variable declaration with init', () => {
        let code = 'let low = 0;';
        let actual = parse(parseCode(code));
        let expected = [
            [1, 'variable declaration', 'low', '', '0']
        ];
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is parsing multiple variable declarations with init', () => {
        let code = 'let low, high = 0, mid;';
        let actual = parse(parseCode(code));
        let expected = [
            [1, 'variable declaration', 'low', '', ''],
            [1, 'variable declaration', 'high', '', '0'],
            [1, 'variable declaration', 'mid', '', '']
        ];
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is parsing multiple variable declarations as function parameters', () => {
        let code = 'function binarySearch(X, V, n){}';
        let actual = parse(parseCode(code));
        let expected = [
            [1, 'function declaration', 'binarySearch', '', ''],
            [1, 'variable declaration', 'X', '', ''],
            [1, 'variable declaration', 'V', '', ''],
            [1, 'variable declaration', 'n', '', '']
        ];
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is parsing an update expression', () => {
        let code = 'i++; a = i++; b = ++i;';
        let actual = parse(parseCode(code));
        let expected = [
            [1, 'update expression', 'i', '', '++'],
            [1, 'assignment expression', 'a', '', 'i++'],
            [1, 'assignment expression', 'b', '', '++i']
        ];
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is parsing a while statement', () => {
        let code = 'while (low <= high) {\n' +
            '        mid = (low + high)/2;\n' +
            '       }';
        let actual = parse(parseCode(code));
        let expected = [
            [1, 'while statement', '', '(low <= high)', ''],
            [2, 'assignment expression', 'mid', '', '((low + high) / 2)']
        ];
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is parsing a do while statement', () => {
        let code = 'do {\n' +
            '    mid = (low + high) / 2;\n' +
            '} while (low <= high);';
        let actual = parse(parseCode(code));
        let expected = [
            [1, 'do while statement', '', '(low <= high)', ''],
            [2, 'assignment expression', 'mid', '', '((low + high) / 2)']
        ];
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is parsing function declaration with parameters and return statement', () => {
        let code = 'function foo(x){\n' +
            '    return x;\n' +
            '}';
        let actual = parse(parseCode(code));
        let expected = [
            [1, 'function declaration', 'foo', '', ''],
            [1, 'variable declaration', 'x', '', ''],
            [2, 'return statement', '', '', 'x']
        ];
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('is parsing a full program', () => {
        let code = 'function binarySearch(X, V, n){\n' +
            '    let low, high, mid;\n' +
            '    low = high = 0;\n' +
            '    high = n - 1;\n' +
            '    while (low <= high) {\n' +
            '        mid = (low + high)/2;\n' +
            '        if (X < V[mid])\n' +
            '            high = mid - 1;\n' +
            '        else if (X > V[mid])\n' +
            '            low = mid + 1;\n' +
            '        else\n' +
            '            return mid;\n' +
            '    }\n' +
            '    return -1;\n' +
            '}';
        let actual = parseAndView(parseCode(code));
        let expected = [
            ['Line', 'Type', 'Name', 'Condition', 'Value'],
            [1, 'function declaration', 'binarySearch', '', ''],
            [1, 'variable declaration', 'X', '', ''],
            [1, 'variable declaration', 'V', '', ''],
            [1, 'variable declaration', 'n', '', ''],
            [2, 'variable declaration', 'low', '', ''],
            [2, 'variable declaration', 'high', '', ''],
            [2, 'variable declaration', 'mid', '', ''],
            [3, 'assignment expression', 'low', '', 'high = 0'],
            [4, 'assignment expression', 'high', '', '(n - 1)'],
            [5, 'while statement', '', '(low <= high)', ''],
            [6, 'assignment expression', 'mid', '', '((low + high) / 2)'],
            [7, 'if statement', '', '(X < V[mid])', ''],
            [8, 'assignment expression', 'high', '', '(mid - 1)'],
            [9, 'else if statement', '', '(X > V[mid])', ''],
            [10, 'assignment expression', 'low', '', '(mid + 1)'],
            [12, 'return statement', '', '', 'mid'],
            [14, 'return statement', '', '', '-1'],
        ];
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

});