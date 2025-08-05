// 리팩터링 첫번째 예시 중 1: 함수 쪼개기
// 긴 함수를 리팩터링할때는 전체 동작을 각각의 부분으로 나눌 수 있는 지점을 찾고, 여기서는 그 지점이 switch다.

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
        const play = plays[perf.playID];
        let thisAmount = amountFor(perf, play);
        // 포인트를 적립
        volumeCredits += Math.max(perf.audience - 30, 0);
        // 희극 관객 5명마다 추가 포인트를 제공
        if ("comedy" == play.type) volumeCredits += Math.floor(perf.audience / 5);

        // 청구 내역을 출력
        result += ` ${play.name}: ${format(thisAmount/100)} (${perf.audience}석)\n`;
        totalAmount += thisAmount;
    }
    // 결과값 계산
    result += `총액: ${format(totalAmount/100)}\n`;
    result += `적립 포인트: ${volumeCredits}점\n`;
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


// 리팩터링은 나중에 추가적인 요구사항이 생기면 그것을 편하게 추가하기 위해 필요한 것이다.
// 리팩터링에서 자가진단하는 테스트의 역할은 굉장히 중요하다


function amountFor(perf, play) { // 이 2개의 변수는 값이 바뀌지 않으므로 매개변수로 전달 
    let thisAmount = 0; // 이 변수는 함수 안에서 값이 바뀌므로 초기화

    switch (play.type) {
        case "tragedy":
            thisAmount = 40000; // 비극
            if (perf.audience > 30) {
                thisAmount += 1000 * (perf.audience - 30);
            }
            break;
            // 비극은 400달러인데 30명이 넘어가면 추가 1명당 10달러
        case "comedy": // 희극
            thisAmount = 30000;
            if (perf.audience > 20) {
                thisAmount += 10000 + 500 * (perf.audience - 20);
            }
            thisAmount += 300 * perf.audience;
            break;
            // 희극은 300달러인데 20명이 넘어가면 기본 100달러 추가 및 추가 1명당 5달러 추가
        default:
            throw new Error(`알 수 없는 장르: ${play.type}`);
    }
    return thisAmount;
}

// 리팩터링은 프로그램 수정을 작게 나눠서 진행한다. 이렇게 해야 문제가 생기면 빠르게 찾고 해결할 수 있다.