// 리팩터링 첫번째 예시 중 10: 두 단계 사이의 중간 데이터 구조 역할을 할 객체를 만들어서 renderPlainText()에 인수로 전달

function statement(invoice, plays) {
    const statementData = {};
    return renderPlainText(statementData, invoice, plays);
                           // 중간 데이터 구조를 인수로 전달
}

                         // 중간 데이터 구조를 인수로 전달
function renderPlainText(data, invoice, plays) {
    let result = `청구 내역 (고객명: ${invoice.customer})\n`;

    for (let perf of invoice.performances) {
        result += ` ${playFor(perf).name}: ${usd(amountFor(perf)/100)} (${perf.audience}석)\n`;
    }
    
    // 결과값 계산
    result += `총액: ${usd(totalAmount())}\n`;
    result += `적립 포인트: ${totalVolumeCredits()}점\n`;
    return result;
}



function totalAmount() {
    let result = 0;
    for (let perf of invoice.performances) {
        result += amountFor(perf);
    }
    return result;
}

function totalVolumeCredits() {
    let result = 0;
    for (let perf of invoice.performances) {
        result += volumeCreditsFor(perf);
    }
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

function volumeCreditsFor(aPerformance) {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    if ("comedy" === playFor(aPerformance).type)
        result += Math.floor(aPerformance.audience / 5);
    return result;
}

function playFor(aPerformance) {
    return plays[aPerformance.playID];
}

function amountFor(aPerformance) { 
    let result = 0;

    switch (playFor(aPerformance).type) {
        case "tragedy":
            result = 40000; // 비극
            if (aPerformance.audience > 30) {
                result += 1000 * (aPerformance.audience - 30);
            }
            break;
            // 비극은 400달러인데 30명이 넘어가면 추가 1명당 10달러
        case "comedy": // 희극
            result = 30000;
            if (aPerformance.audience > 20) {
                result += 10000 + 500 * (aPerformance.audience - 20);
            }
            result += 300 * aPerformance.audience;
            break;
            // 희극은 300달러인데 20명이 넘어가면 기본 100달러 추가 및 추가 1명당 5달러 추가
        default:
            throw new Error(`알 수 없는 장르: ${playFor(aPerformance).type}`);
    }                                         
    return result;
}



// 함수 실행을 위해 추가한 부분
const fs = require('fs');

// JSON 파일 불러오기
const invoiceData = JSON.parse(fs.readFileSync('invoices.json', 'utf8'));
const invoice = invoiceData[0]; // 첫 번째 요소 선택
const plays = JSON.parse(fs.readFileSync('plays.json', 'utf8'));

// statement 함수 실행 후 결과 출력
console.log(statement(invoice, plays));

