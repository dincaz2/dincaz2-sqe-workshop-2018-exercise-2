import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {parseAndView} from './parser';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        populateTable(parseAndView(parsedCode));
    });
});

function populateTable(rows){
    let table = document.getElementById('parseTable');
    if (table === null) {
        table = document.createElement('table');
        table.id = 'parseTable';
    } else
        table.innerHTML = '';
    for (let row of rows) {
        let newRow = table.insertRow();
        for (let cell of row) {
            let newCell = newRow.insertCell();
            newCell.textContent = cell;
        }
    }
    document.body.appendChild(table);
}
