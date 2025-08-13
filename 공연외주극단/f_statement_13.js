// 리팩터링 첫번째 예시 중 11: invoice와 plays를 통해 전달되는 데이터를 중간 데이터 구조로 옮겨서 계산 관련 코드를 전부 statement() 함수로 모으고 renderPlainText()는 data 매개변수로 전달된 데이터만 처리하게 만들기
// 연극 제목도 중간 데이터 구조에서 가져오기(연극 정보를 담을 자리를 마련하기)

// 함수로 건넨 데이터를 수정하지 않기 위해 공연 객체를 복사
// 가변 데이터는 금방 상하기 때문에 데이터를 최대한 불변처럼 취급하기
function statement(invoice, plays) {
    const statementData = {}; 
    statementData.customer = invoice.customer;    
    
    console.log(invoice.performances);
    statementData.performances = invoice.performances.map(enrichPerformance);
    // 기존과 똑같은 내용의 새로운 배열 생성, 원본 배열(invoice.performances)은 변경되지 않음, 불변성 유지
    
    return renderPlainText(statementData, plays);

    function enrichPerformance(aPerformance) {
        console.log(aPerformance);
        console.log(' ');
        const result = Object.assign({}, aPerformance);
        // aPerformance의 속성을 그대로 복사한 새 객체 생성 (얕은 복사 수행), 원본을 보존하기 위해 복사된 속성을 받을 객체를 빈 객체로 설정, 이 객체가 함수의 반환값이 됨.

        console.log('\n' + result);
        return result;
    }
    // 기존과 똑같은 내용이 있는 새로운 배열을 만들고 그것을 사용하기 때문에 원본 데이터는 안전함
    // statementData.performances = invoice.performances; 만약 이렇게 하고 statementData.performances를 가공하면 invoice.performances도 바뀌어버려서 에러가 명확하지 않은 오류가 발생함

    // object.assign({}, aPerformance)로 invoice.performances의 각 원소를 얕은 복사해서 statementData.performances에 담으므로 이후 가공해도 원본 배열과 원소가 바뀌지 않음
}

function renderPlainText(data, plays) {
    let result = `청구 내역 (고객명: ${data.customer})\n`;

    for (let perf of data.performances) {
        result += ` ${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
    }
    
    // 결과값 계산
    result += `총액: ${usd(totalAmount(data))}\n`;
    result += `적립 포인트: ${totalVolumeCredits(data)}점\n`;
    return result;
}



function totalAmount(data) {
    let result = 0;
    for (let perf of data.performances ) {
        result += amountFor(perf);
    }
    return result;
}

function totalVolumeCredits(data) {
    let result = 0;
    for (let perf of data.performances) {
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

