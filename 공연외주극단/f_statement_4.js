// 리팩터링 첫번째 예시 중 3: play 변수 제거하기, 변수 인라인하기 (순서를 사용한다.)
// 함수를 쪼갤 때 play 같은 임시 변수 때문에 로컬 범위에 존재하는 이름이 늘어나서 추출 작업이 복잡해진다.
// 이를 해결해주는 리팩터링은 '임시 변수를 질의 함수로 바꾸기'가 있다.
// 이 과정을 통해 루프 한 번에 공연을 조회하는 횟수가 늘어났지만, 성능에 큰 영향은 없으며, 제대로 리팩터링한 코드베이스는 그렇지 않은 코드보다 성능을 개선하기가 훨씬 수월하다.

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
        // const play = playFor(perf); // 2. 추출한 함수 사용, 3. 변수 인라인하기 적용 (더 이상 play 매개변수는 사용하지 않으므로 제거)
        // let thisAmount = amountFor(perf, playFor(perf)); // 3. 변수 인라인하기 적용
        // let thisAmount = amountFor(perf); // 5. 필요 없어진 매개변수 제거
                                             // 6. thisAmount에 설정된 값이 바뀌지는 않으므로 변수 인라인하기
        // 포인트를 적립
        volumeCredits += Math.max(perf.audience - 30, 0);
        // 희극 관객 5명마다 추가 포인트를 제공
        if ("comedy" == playFor(perf).type) volumeCredits += Math.floor(perf.audience / 5);
                        // 3. 변수 인라인하기 적용
        // 청구 내역을 출력
        result += ` ${playFor(perf).name}: ${format(amountFor(perf)/100)} (${perf.audience}석)\n`;
                      // 3. 변수 인라인하기 적용       // 6. thisAmount에 설정된 값이 바뀌지는 않으므로 변수 인라인하기
        totalAmount += amountFor(perf);  // 6. thisAmount에 설정된 값이 바뀌지는 않으므로 변수 인라인하기
    }
    // 결과값 계산
    result += `총액: ${format(totalAmount/100)}\n`;
    result += `적립 포인트: ${volumeCredits}점\n`;
    return result;
}
// function amountFor(aPerformance, play) {
function amountFor(aPerformance) { // 5. 필요 없어진 매개변수 제거
    let result = 0; // 이 변수는 함수 안에서 값이 바뀌므로 초기화

    switch (playFor(aPerformance).type) { // 4. play를 playFor() 호출로 변경
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
    }                                         // 4. play를 playFor() 호출로 변경
    return result;
}

// 1. for문에 있던 plays[perf.playID]를 함수로 추출한다. 그리고 for문에서 이 함수를 사용한다.
function playFor(aPerformance) {
    return plays[aPerformance.playID];
}




// 함수 실행을 위해 추가한 부분 (보기 편하기 위해 밑으로 이동)
const fs = require('fs');

// JSON 파일 불러오기
const invoiceData = JSON.parse(fs.readFileSync('invoices.json', 'utf8'));
const invoice = invoiceData[0]; // 첫 번째 요소 선택
const plays = JSON.parse(fs.readFileSync('plays.json', 'utf8'));

// statement 함수 실행 후 결과 출력
console.log(statement(invoice, plays));

