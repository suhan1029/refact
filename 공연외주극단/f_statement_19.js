// 리팩터링 첫번째 예시 중 14: 별도 함수로 빼낸 것을 별도 파일로 분리하기
// 이것으로 HTML 버전을 작성할 준비는 끝

// 분리된 파일 import
import createStatementData from './createStatementData.js';

// 실행 부분의 코드 변경으로 추가된 부분
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

function usd(aNumber) {
    return new Intl.NumberFormat("en-US",
        {
            style: "currency", currency: "USD",
            minimumFractionDigits: 2
        }
    ).format(aNumber/100);
}

// import와 충돌나므로 실행 부분의 코드를 바꿔주기
const invoice = invoiceData[0];
console.log(statement(invoice, plays));
