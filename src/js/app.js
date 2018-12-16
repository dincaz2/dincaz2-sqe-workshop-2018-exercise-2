import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {substituteWrapper} from './code-substitution';
import {paintWrapper} from './code-painter';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);

        let substitutedCode = substituteWrapper(parsedCode);
        let substitutedParseCode = parseCode(substitutedCode);
        let colors = paintWrapper(substitutedParseCode, $('#parametersPlaceholder').val());

        paintRows(substitutedCode, colors);
    });
});

function chooseColor(lineNum, colors) {
    if (colors['r'].includes(lineNum))
        return 'red';
    if (colors['g'].includes(lineNum))
        return 'green';
    return 'white';
}

function paintRows(substitutedCode, colors){
    let substitutedCodeArea = document.getElementById('substitutedCodeArea');
    substitutedCodeArea.innerHTML = '';
    substitutedCode.split('\n').forEach((lineCode, lineNum) => {
        substitutedCodeArea.innerHTML += '<span style="white-space: pre; background-color: ' + chooseColor(lineNum + 1, colors) + ';">'+ lineCode + '</span><br>\n';
    });
}