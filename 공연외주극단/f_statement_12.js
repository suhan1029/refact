// 리팩터링 첫번째 예시 중 11: invoice와 plays를 통해 전달되는 데이터를 중간 데이터 구조로 옮겨서 계산 관련 코드를 전부 statement() 함수로 모으고 renderPlainText()는 data 매개변수로 전달된 데이터만 처리하게 만들기
// 일단 invoice 원본 데이터에서 가져오는 것을 고쳐나가기

function statement(invoice, plays) {
    const statementData = {}; // 중간 데이터 구조 역할을 할 객체
    statementData.customer = invoice.customer;          // 1. 고객 데이터를 중간 데이터로 옮기기
    statementData.performances = invoice.performances;  // 1. 고객 데이터를 중간 데이터로 옮기기
    return renderPlainText(statementData, /*invoice,*/ plays);  // 3. 필요 없어진 invoice 인수 삭제
}

function renderPlainText(data, /*invoice,*/ plays) {  // 3. 필요 없어진 invoice 인수 삭제
    let result = `청구 내역 (고객명: ${data.customer})\n`;  // 2. 고객 데이터를 invoice 원본 데이터가 아닌 중간 데이터로부터 얻기

    for (let perf of invoice.performances) {
        result += ` ${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
    }
    
    // 결과값 계산
    result += `총액: ${usd(totalAmount())}\n`;
    result += `적립 포인트: ${totalVolumeCredits()}점\n`;
    return result;
}



function totalAmount() {
    let result = 0;
    for (let perf of data.performances) {  // 2. 고객 데이터를 invoice 원본 데이터가 아닌 중간 데이터로부터 얻기
        result += amountFor(perf);
    }
    return result;
}

function totalVolumeCredits() {
    let result = 0;
    for (let perf of data.performances) {  // 2. 고객 데이터를 invoice 원본 데이터가 아닌 중간 데이터로부터 얻기
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
// const invoice = invoiceData[0]; // 첫 번째 요소 선택
const plays = JSON.parse(fs.readFileSync('plays.json', 'utf8'));

// statement 함수 실행 후 결과 출력
console.log(statement(invoice, plays));

