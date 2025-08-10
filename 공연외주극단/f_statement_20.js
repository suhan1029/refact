// 리팩터링 첫번째 예시 중 15: HTML 버전 코드 추가

import createStatementData from './createStatementData.js';

import fs from 'fs';
const invoiceData = JSON.parse(fs.readFileSync('./invoices.json', 'utf8'));
const plays = JSON.parse(fs.readFileSync('./plays.json', 'utf8'));

function statement(invoice, plays) {
    return renderPlainText(createStatementData(invoice, plays));
}

function renderPlainText(data, plays) {
    let result = `청구 내역 (고객명: ${data.customer})\n`;

    for (let perf of data.performances) {
        result += ` ${perf.play.name}: ${usd(perf.amount)} (${perf.audience}석)\n`;
    }
    
    // 결과값 계산
    result += `총액: ${usd(data.totalAmount)}\n`;           // 바꾸기
    result += `적립 포인트: ${data.totalVolumeCredits}점\n`; // 바꾸기
    return result;
}

function htmlStatement(invoice, plays) {
    return renderHtml(createStatementData(invoice, plays));
}

function renderHtml(data) {
    let result = `<h1>청구 내역 (고객명: ${data.customer})</h1>\n`;
    result += "<table>\n";
    result += "<tr><th>연극</th><th>좌석 수</th><th>금액</th></tr>"

    for (let perf of data.performances) {
        result += ` <tr><td>${perf.play.name}</td><td>(${perf.audience}석)</td>`;
        result += `<td>${usd(perf.amount)}</td></tr>\n`;
    }
    
    // 결과값 계산
    result += "</table>\n";
    result += `<p>총액: <em>${usd(data.totalAmount)}</em></p>\n`;           // 바꾸기
    result += `<p>적립 포인트: <em>${data.totalVolumeCredits}</em>점</p>\n`; // 바꾸기
    return result;
}

function usd(aNumber) {
    return new Intl.NumberFormat("en-US",
        {
            style: "currency", currency: "USD",
            minimumFractionDigits: 2
        }
    ).format(aNumber/100);
}

// 실행
const invoice = invoiceData[0];
console.log(statement(invoice, plays));
const html = htmlStatement(invoice, plays);

// HTML 파일로 저장
fs.writeFileSync('statement.html', html, 'utf8');

// 이 코드를 실행하면 HTML 파일이 하나 생기는데 이것을 보면 HTML 결과를 볼 수 있음
