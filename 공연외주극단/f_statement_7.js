// 리팩터링 첫번째 예시 중 6: 반복문 쪼개기(volumeCredits), 문장 슬라이드하기, 함수 추출하기, 변수 인라인하기
// 완료된 코드를 보면 반복문이 2개로 쪼개졌으므로 성능에 영향을 미칠 수 있다고 생각할 수 있지만 실제로 그 영향은 미미하다.
// 리팩터링 이후 성능이 떨어져서 예전 코드로 되돌리는 경우도 있지만, 대체로 리팩터링 덕분에 성능 개선을 더 효과적으로 수행할 수 있다.
// 리팩터링 때문에 성능이 떨어진다면 하던 리팩터링을 마무리한 이후에 성능을 개선한다.
// 리팩터링할 때 상황이 복잡해지면 단계를 더 작게 나누는 일을 먼저 한다.
// 코드가 복잡할수록 단계를 작게 나누면 작업 속도가 더 빨라진다.
// 리팩터링한 이후 테스트에 실패하고나서 원인을 바로 찾지 못하면 가장 최근 커밋으로 돌아가서 리팩터링의 단계를 더 작게 나눠 다시 시도한다.


function statement(invoice, plays) {
    let totalAmount = 0;
    
    let result = `청구 내역 (고객명: ${invoice.customer})\n`;

    for (let perf of invoice.performances) {

        // 청구 내역을 출력
        result += ` ${playFor(perf).name}: ${usd(amountFor(perf)/100)} (${perf.audience}석)\n`;
        totalAmount += amountFor(perf);
    }
    // // 2. 문장 슬라이드하기를 적용해서 volumeCredits 변수를 선언하는 문장을 반복문 바로 앞으로 옮기기
    // let volumeCredits = 0;
    // // 1. 값 누적 로직을 별도 for문으로 분리
    // for (let perf of invoice.performances) {
    //     volumeCredits += volumeCreditsFor(perf);
    // }
    // 4. 함수로 추출 했으므로 원본 내용 제거
    // 5. 값 계산 로직을 함수로 추출
    // let volumeCredits = totalVolumeCredits();
    // 6. 변수 인라인으로 위 문장은 필요 없으므로 삭제

    // 결과값 계산
    result += `총액: ${usd(totalAmount)}\n`;
    result += `적립 포인트: ${totalVolumeCredits()}점\n`; // 6. 변수 인라인으로 volumeCredits 변수 제거
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

function usd(aNumber) {
    return new Intl.NumberFormat("en-US",
        {
            style: "currency", currency: "USD",
            minimumFractionDigits: 2
        }
    ).format(aNumber/100);
}

// 3. volumeCredits 값 계산 코드를 함수로 추출
function totalVolumeCredits() {
    let volumeCredits = 0;
    for (let perf of invoice.performances) {
        volumeCredits += volumeCreditsFor(perf);
    }
    return volumeCredits;
}


// 함수 실행을 위해 추가한 부분 (보기 편하기 위해 밑으로 이동)
const fs = require('fs');

// JSON 파일 불러오기
const invoiceData = JSON.parse(fs.readFileSync('invoices.json', 'utf8'));
const invoice = invoiceData[0]; // 첫 번째 요소 선택
const plays = JSON.parse(fs.readFileSync('plays.json', 'utf8'));

// statement 함수 실행 후 결과 출력
console.log(statement(invoice, plays));

