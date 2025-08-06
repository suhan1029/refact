// 리팩터링 첫번째 예시 중 4: 다시 함수 추출(volumeCreditsFor) 및 변수명 변경(perf, volumeCredits)

function statement(invoice, plays) {
    let totalAmount = 0;
    let volumeCredits = 0;
    let result = `청구 내역 (고객명: ${invoice.customer})\n`;
    const format = new Intl.NumberFormat("en-US",
        {
            style: "currency", currency: "USD",
            minimumFractionDigits: 2
        }
    ).format;

    for (let perf of invoice.performances) {
        volumeCredits += volumeCreditsFor(perf); // 추출한 함수를 이용해 값을 누적
                    
        // 청구 내역을 출력
        result += ` ${playFor(perf).name}: ${format(amountFor(perf)/100)} (${perf.audience}석)\n`;
        totalAmount += amountFor(perf);
    }
    // 결과값 계산
    result += `총액: ${format(totalAmount/100)}\n`;
    result += `적립 포인트: ${volumeCredits}점\n`;
    return result;
}

function amountFor(aPerformance) { 
    let result = 0; // 이 변수는 함수 안에서 값이 바뀌므로 초기화

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

function playFor(aPerformance) {
    return plays[aPerformance.playID];
}

// 반복문을 돌 때마다 값을 누적해야 해서 더 까다로운 함수 추출
function volumeCreditsFor(aPerformance) { // 변수명 변경(perf, volumeCredits)
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    if ("comedy" === playFor(aPerformance).type)
        result += Math.floor(aPerformance.audience / 5);
    return result;
}


// 함수 실행을 위해 추가한 부분 (보기 편하기 위해 밑으로 이동)
const fs = require('fs');

// JSON 파일 불러오기
const invoiceData = JSON.parse(fs.readFileSync('invoices.json', 'utf8'));
const invoice = invoiceData[0]; // 첫 번째 요소 선택
const plays = JSON.parse(fs.readFileSync('plays.json', 'utf8'));

// statement 함수 실행 후 결과 출력
console.log(statement(invoice, plays));

