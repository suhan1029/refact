// 리팩터링 첫번째 예시 중 11: invoice와 plays를 통해 전달되는 데이터를 중간 데이터 구조로 옮겨서 계산 관련 코드를 전부 statement() 함수로 모으고 renderPlainText()는 data 매개변수로 전달된 데이터만 처리하게 만들기
// 연극 제목도 중간 데이터 구조에서 가져오기(실제로 데이터를 담기)

// 함수 옮기기를 적용하여 총합을 구하는 부분까지 옮기기

function statement(invoice, plays) {
    const statementData = {}; 
    statementData.customer = invoice.customer;          
    statementData.performances = invoice.performances.map(enrichPerformance);   // 공연 객체 복사
    statementData.totalAmount = totalAmount(statementData);                     // 총합을 구하는 부분
    statementData.totalVolumeCredits = totalVolumeCredits(statementData);       // 총합을 구하는 부분
    return renderPlainText(statementData, plays);

    function enrichPerformance(aPerformance) {
        const result = Object.assign({}, aPerformance);     // 얕은 복사 수행
        result.play = playFor(result);  
        result.amount = amountFor(result);
        result.volumeCredits = volumeCreditsFor(result);
        return result;
    }

    function playFor(aPerformance) {  
        return plays[aPerformance.playID];
    }

    function amountFor(aPerformance) {
        let result = 0;

        switch (aPerformance.play.type) {  
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
                throw new Error(`알 수 없는 장르: ${aPerformance.play.type}`);
        }                                         
        return result;
    }

    function volumeCreditsFor(aPerformance) {
        let result = 0;
        result += Math.max(aPerformance.audience - 30, 0);
        if ("comedy" === aPerformance.play.type)
            result += Math.floor(aPerformance.audience / 5);
        return result;
    }

    function totalAmount(data) {
        let result = 0;
        for (let perf of data.performances) {
            result += perf.amount;
        }
        return result;
    }

    function totalVolumeCredits(data) {
        let result = 0;
        for (let perf of data.performances) {
            result += perf.volumeCredits;
        }
        return result;
    }
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

// 함수 실행을 위해 추가한 부분
const fs = require('fs');
const { setDefaultAutoSelectFamily } = require('net');

// JSON 파일 불러오기
const invoiceData = JSON.parse(fs.readFileSync('invoices.json', 'utf8'));
const invoice = invoiceData[0]; // 첫 번째 요소 선택
const plays = JSON.parse(fs.readFileSync('plays.json', 'utf8'));

// statement 함수 실행 후 결과 출력
console.log(statement(invoice, plays));

