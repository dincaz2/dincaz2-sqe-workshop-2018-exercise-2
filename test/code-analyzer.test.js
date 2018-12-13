import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            JSON.stringify(JSON.parse('{\n' +
            '  "type": "Program",\n' +
            '  "body": [],\n' +
            '  "sourceType": "script",\n' +
            '  "loc": {\n' +
            '    "start": {\n' +
            '      "line": 0,\n' +
            '      "column": 0\n' +
            '    },\n' +
            '    "end": {\n' +
            '      "line": 0,\n' +
            '      "column": 0\n' +
            '    }\n' +
            '  }\n' +
            '}'))
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            JSON.stringify(JSON.parse('{\n' +
                '  "type": "Program",\n' +
                '  "body": [\n' +
                '    {\n' +
                '      "type": "VariableDeclaration",\n' +
                '      "declarations": [\n' +
                '        {\n' +
                '          "type": "VariableDeclarator",\n' +
                '          "id": {\n' +
                '            "type": "Identifier",\n' +
                '            "name": "a",\n' +
                '            "loc": {\n' +
                '              "start": {\n' +
                '                "line": 1,\n' +
                '                "column": 4\n' +
                '              },\n' +
                '              "end": {\n' +
                '                "line": 1,\n' +
                '                "column": 5\n' +
                '              }\n' +
                '            }\n' +
                '          },\n' +
                '          "init": {\n' +
                '            "type": "Literal",\n' +
                '            "value": 1,\n' +
                '            "raw": "1",\n' +
                '            "loc": {\n' +
                '              "start": {\n' +
                '                "line": 1,\n' +
                '                "column": 8\n' +
                '              },\n' +
                '              "end": {\n' +
                '                "line": 1,\n' +
                '                "column": 9\n' +
                '              }\n' +
                '            }\n' +
                '          },\n' +
                '          "loc": {\n' +
                '            "start": {\n' +
                '              "line": 1,\n' +
                '              "column": 4\n' +
                '            },\n' +
                '            "end": {\n' +
                '              "line": 1,\n' +
                '              "column": 9\n' +
                '            }\n' +
                '          }\n' +
                '        }\n' +
                '      ],\n' +
                '      "kind": "let",\n' +
                '      "loc": {\n' +
                '        "start": {\n' +
                '          "line": 1,\n' +
                '          "column": 0\n' +
                '        },\n' +
                '        "end": {\n' +
                '          "line": 1,\n' +
                '          "column": 10\n' +
                '        }\n' +
                '      }\n' +
                '    }\n' +
                '  ],\n' +
                '  "sourceType": "script",\n' +
                '  "loc": {\n' +
                '    "start": {\n' +
                '      "line": 1,\n' +
                '      "column": 0\n' +
                '    },\n' +
                '    "end": {\n' +
                '      "line": 1,\n' +
                '      "column": 10\n' +
                '    }\n' +
                '  }\n' +
                '}'))
        );
    });
});
