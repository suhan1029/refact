// 중간 데이터 생성을 전담하는 함수

export default function createStatementData(invoice, plays) {
    const result = {};  // 변수명 바꾸기
    result.customer = invoice.customer;          
    result.performances = invoice.performances.map(enrichPerformance);   // 공연 객체 복사
    result.totalAmount = totalAmount(result);
    result.totalVolumeCredits = totalVolumeCredits(result);
    return result;

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