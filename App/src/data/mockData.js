// Mock data for Mino Demo Mode
// 부산 지역 중심의 가상 지출 데이터

export const DEMO_EXPENSES = [
    // 1월 1일
    {
        id: 1,
        type: 'expense',
        amount: 4500,
        place: '스타벅스 해운대점',
        normalized_place: '스타벅스',
        category: 'Cafe',
        transaction_date: '2026-01-01T09:30:00',
        lat: 35.1631,
        lng: 129.1635,
        memo: '아메리카노'
    },
    {
        id: 2,
        type: 'expense',
        amount: 8900,
        place: '맥도날드 서면점',
        normalized_place: '맥도날드',
        category: 'Food',
        transaction_date: '2026-01-01T12:30:00',
        lat: 35.1579,
        lng: 129.0597,
        memo: '빅맥세트'
    },
    // 1월 2일
    {
        id: 3,
        type: 'expense',
        amount: 32000,
        place: '곱창골목 할매집',
        normalized_place: '곱창골목 할매집',
        category: 'Food',
        transaction_date: '2026-01-02T19:00:00',
        lat: 35.1561,
        lng: 129.0605,
        memo: '저녁 회식'
    },
    {
        id: 4,
        type: 'expense',
        amount: 1400,
        place: '부산교통공사',
        normalized_place: '부산지하철',
        category: 'Transport',
        transaction_date: '2026-01-02T08:15:00',
        lat: 35.1580,
        lng: 129.0592,
        memo: ''
    },
    // 1월 3일
    {
        id: 5,
        type: 'expense',
        amount: 5200,
        place: '이디야커피 광안리점',
        normalized_place: '이디야커피',
        category: 'Cafe',
        transaction_date: '2026-01-03T14:00:00',
        lat: 35.1531,
        lng: 129.1186,
        memo: '카페라떼'
    },
    {
        id: 6,
        type: 'expense',
        amount: 45000,
        place: '신세계백화점 센텀시티',
        normalized_place: '신세계백화점',
        category: 'Shopping',
        transaction_date: '2026-01-03T16:30:00',
        lat: 35.1692,
        lng: 129.1308,
        memo: '겨울 니트'
    },
    // 1월 4일
    {
        id: 7,
        type: 'expense',
        amount: 15000,
        place: '카카오택시',
        normalized_place: '카카오택시',
        category: 'Transport',
        transaction_date: '2026-01-04T23:30:00',
        lat: 35.1579,
        lng: 129.0597,
        memo: '서면→해운대'
    },
    {
        id: 8,
        type: 'expense',
        amount: 28000,
        place: '해운대 횟집',
        normalized_place: '해운대 횟집',
        category: 'Food',
        transaction_date: '2026-01-04T18:00:00',
        lat: 35.1587,
        lng: 129.1604,
        memo: '광어회'
    },
    // 1월 5일
    {
        id: 9,
        type: 'expense',
        amount: 6800,
        place: 'CU 편의점',
        normalized_place: 'CU',
        category: 'Others',
        transaction_date: '2026-01-05T22:00:00',
        lat: 35.1579,
        lng: 129.0597,
        memo: '야식'
    },
    {
        id: 10,
        type: 'expense',
        amount: 52000,
        place: '무신사스토어',
        normalized_place: '무신사',
        category: 'Shopping',
        transaction_date: '2026-01-05T15:00:00',
        lat: null,
        lng: null,
        memo: '후드티'
    },
    // 1월 6일
    {
        id: 11,
        type: 'expense',
        amount: 42800,
        place: '쿠팡이츠',
        normalized_place: '쿠팡이츠',
        category: 'Food',
        transaction_date: '2026-01-06T20:30:00',
        lat: 35.1579,
        lng: 129.0597,
        memo: '치킨+피자'
    },
    {
        id: 12,
        type: 'expense',
        amount: 5500,
        place: '투썸플레이스 PNU점',
        normalized_place: '투썸플레이스',
        category: 'Cafe',
        transaction_date: '2026-01-06T10:00:00',
        lat: 35.2314,
        lng: 129.0847,
        memo: '아이스아메리카노'
    },
    // 1월 7일
    {
        id: 13,
        type: 'expense',
        amount: 12000,
        place: '부산대학교 학생식당',
        normalized_place: '학생식당',
        category: 'Food',
        transaction_date: '2026-01-07T12:00:00',
        lat: 35.2319,
        lng: 129.0839,
        memo: '점심'
    },
    {
        id: 14,
        type: 'expense',
        amount: 89000,
        place: '교보문고 센텀시티점',
        normalized_place: '교보문고',
        category: 'Shopping',
        transaction_date: '2026-01-07T17:00:00',
        lat: 35.1694,
        lng: 129.1296,
        memo: '개발서적 2권'
    },
    // 1월 8일
    {
        id: 15,
        type: 'expense',
        amount: 4300,
        place: '메가커피 경성대점',
        normalized_place: '메가커피',
        category: 'Cafe',
        transaction_date: '2026-01-08T09:00:00',
        lat: 35.1407,
        lng: 129.1002,
        memo: ''
    },
    {
        id: 16,
        type: 'expense',
        amount: 18500,
        place: '본죽&비빔밥',
        normalized_place: '본죽',
        category: 'Food',
        transaction_date: '2026-01-08T12:30:00',
        lat: 35.1579,
        lng: 129.0597,
        memo: '전복죽'
    },
    {
        id: 17,
        type: 'expense',
        amount: 35000,
        place: 'CGV 센텀시티',
        normalized_place: 'CGV',
        category: 'Entertainment',
        transaction_date: '2026-01-08T19:00:00',
        lat: 35.1692,
        lng: 129.1308,
        memo: '영화 2인 + 팝콘'
    },
    // Fixed expenses
    {
        id: 18,
        type: 'expense',
        amount: 550000,
        place: '월세',
        normalized_place: '월세',
        category: 'Fixed',
        transaction_date: '2026-01-01T00:00:00',
        lat: null,
        lng: null,
        memo: '1월 월세'
    },
    {
        id: 19,
        type: 'expense',
        amount: 89000,
        place: 'SKT 통신비',
        normalized_place: 'SKT',
        category: 'Fixed',
        transaction_date: '2026-01-05T00:00:00',
        lat: null,
        lng: null,
        memo: '휴대폰 요금'
    },
    {
        id: 20,
        type: 'expense',
        amount: 14900,
        place: '넷플릭스',
        normalized_place: '넷플릭스',
        category: 'Fixed',
        transaction_date: '2026-01-08T00:00:00',
        lat: null,
        lng: null,
        memo: '구독료'
    },
    // Income
    {
        id: 21,
        type: 'income',
        amount: 2500000,
        place: '부산대학교',
        normalized_place: '부산대학교',
        category: 'Salary',
        transaction_date: '2026-01-05T00:00:00',
        lat: null,
        lng: null,
        memo: '연구비'
    }
];

export const DEMO_CONFIG = {
    budget: 1000000,
    gmail_user: 'demo@example.com',
    llm_provider: 'gemini',
    llm_model: 'gemini-2.0-flash',
    kakao_api_key: 'demo-key'
};

export const DEMO_CHAT_RESPONSES = [
    {
        keywords: ['지출', '소비', '쓴 돈', '얼마'],
        assistant: '이번 달 총 지출은 489,020원이에요. 예산 1,000,000원 중 약 49%를 사용하셨네요! 🎉\n\n카테고리별로 보면:\n- 🍽️ 식비: 125,200원 (가장 많이)\n- 🛍️ 쇼핑: 186,000원\n- ☕ 카페: 20,500원\n\n월세 등 고정비를 제외하면 변동 지출은 잘 관리되고 있어요!'
    },
    {
        keywords: ['카페', '커피', '스타벅스'],
        assistant: '이번 달 카페 지출은 총 20,500원이에요. 일 평균 약 2,500원 정도로, 하루 커피 한 잔 정도라 적당한 수준이에요! ☕\n\n다만 절약하고 싶다면:\n- 회사/학교 커피 머신 이용\n- 텀블러 지참 시 할인\n- 주 3회만 카페 방문 목표 설정\n\n이런 방법들을 추천드려요!'
    },
    {
        keywords: ['절약', '아끼는', '줄이는'],
        assistant: '지출을 줄일 수 있는 팁을 드릴게요! 💡\n\n1. 🛍️ 쇼핑 루틴 점검: 이번 달 의류 지출(18만원)이 다소 높아요. 계절 의류 구매였나요?\n2. 📅 구독 서비스: 넷플릭스 외에 사용하지 않는 구독이 있는지 확인해보세요.\n3. 🍱 배달 대신 포장: 배달비만 아껴도 한 달에 치킨 한 마리 값을 모을 수 있어요!'
    },
    {
        keywords: ['안녕', '반가워', '하이'],
        assistant: '안녕하세요! Mino입니다. 👋\n금융 생활에 대해 궁금한 점이 있으신가요?\n"이번 달 지출 어때?", "어디에 돈을 많이 썼어?" 처럼 물어보세요!'
    }
];
