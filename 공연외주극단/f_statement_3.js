// 리팩터링 첫번째 예시 중 2: 변수, 인수명을 명확하게 바꾸기 (amountFor 함수내에서 thisAmount를 result로 변경 및 perf를 aPerformance로 바꾸기)
// 코드를 명확하게 표현하기 위함이다.

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


// aPerformance로 바꾸는 이유는 자바스크립트와 같은 동적 타입 언어를 사용할 때 타입이 드러나게 작성하면 도움이 되기 때문이다.
// 좋은 코드라면 하는 일이 명확히 드러나야한다. 이때 변수명이 커다란 역할을 한다.
function amountFor(aPerformance, play) { // 이 2개의 변수는 값이 바뀌지 않으므로 매개변수로 전달 
    let result = 0; // 이 변수는 함수 안에서 값이 바뀌므로 초기화

    switch (play.type) {
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
            throw new Error(`알 수 없는 장르: ${play.type}`);
    }
    return result;
}

