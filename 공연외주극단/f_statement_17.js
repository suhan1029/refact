// 리팩터링 첫번째 예시 중 12: 반복문을 파이프라인으로 바꾸기

function statement(invoice, plays) {
    const statementData = {}; 
    statementData.customer = invoice.customer;          
    statementData.performances = invoice.performances.map(enrichPerformance);   // 공연 객체 복사
    statementData.totalAmount = totalAmount(statementData);
    statementData.totalVolumeCredits = totalVolumeCredits(statementData);
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
        // for 반복문을 파이프라인으로 바꾸기
        return data.performances.reduce((total, p) => total + p.amount, 0);
    }

    function totalVolumeCredits(data) {
        // for 반복문을 파이프라인으로 바꾸기
        return data.performances.reduce((total, p) => total + p.volumeCredits, 0);
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

