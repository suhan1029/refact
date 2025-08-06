// 리팩터링 첫번째 예시 중 5: 임시 변수 제거(format) 및 함수 이름 변경(usd)
// 임시 변수는 나중에 문제를 일으킬 수 있기 때문에 제거해줘야 한다.
// 자신이 속한 루틴에서만 의미가 있어서 루틴이 길고 복잡해지기 쉽기 때문이다.
// 변경하는 함수의 이름이 좋으면 본문을 읽지 않아도 무슨일을 하는지 알 수 있다.

function statement(invoice, plays) {
    let totalAmount = 0;
    let volumeCredits = 0;
    let result = `청구 내역 (고객명: ${invoice.customer})\n`;
    // const format = ...   // 2. 함수로 추출했으므로 임시 변수 선언 제거

    for (let perf of invoice.performances) {
        volumeCredits += volumeCreditsFor(perf); // 추출한 함수를 이용해 값을 누적
                    
        // 청구 내역을 출력
        result += ` ${playFor(perf).name}: ${usd(amountFor(perf)/100)} (${perf.audience}석)\n`;
                                             // 4. 함수 이름 변경
        totalAmount += amountFor(perf);
    }
    // 결과값 계산      // 4. 함수 이름 변경
    result += `총액: ${usd(totalAmount)}\n`; // 3. 임시 변수였던 format을 함수 호출로 대체(하지만 이 부분은 코드가 바뀌진 않음)
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

function volumeCreditsFor(aPerformance) {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    if ("comedy" === playFor(aPerformance).type)
        result += Math.floor(aPerformance.audience / 5);
    return result;
}

// 1. 임시 변수를 제거하기 위해 함수로 추출
function usd(aNumber) { // 4. 함수 이름 변경
    return new Intl.NumberFormat("en-US",
        {
            style: "currency", currency: "USD",
            minimumFractionDigits: 2
        }
    ).format(aNumber/100); // 5. 단위 변환 로직도 함수 안으로 이동
}


// 함수 실행을 위해 추가한 부분 (보기 편하기 위해 밑으로 이동)
const fs = require('fs');

// JSON 파일 불러오기
const invoiceData = JSON.parse(fs.readFileSync('invoices.json', 'utf8'));
const invoice = invoiceData[0]; // 첫 번째 요소 선택
const plays = JSON.parse(fs.readFileSync('plays.json', 'utf8'));

// statement 함수 실행 후 결과 출력
console.log(statement(invoice, plays));

