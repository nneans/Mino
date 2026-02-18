// Mock data for Mino Demo Mode
// 부산 지역 중심의 풍부한 가상 지출 데이터 (2026년 1~2월)

// Helper: Generate ID
let _id = 0;
const nextId = () => ++_id;

// ============================================
// 1월 지출 데이터
// ============================================
const JAN_EXPENSES = [
    // --- 1월 1일 ---
    { id: nextId(), type: 'expense', amount: 4500, place: '스타벅스 해운대점', normalized_place: '스타벅스', category: 'Cafe', transaction_date: '2026-01-01T09:30:00', lat: 35.1631, lng: 129.1635, memo: '아메리카노' },
    { id: nextId(), type: 'expense', amount: 8900, place: '맥도날드 서면점', normalized_place: '맥도날드', category: 'Food', transaction_date: '2026-01-01T12:30:00', lat: 35.1579, lng: 129.0597, memo: '빅맥세트' },
    { id: nextId(), type: 'expense', amount: 15000, place: '교보문고 광안리점', normalized_place: '교보문고', category: 'Shopping', transaction_date: '2026-01-01T15:00:00', lat: 35.1531, lng: 129.1186, memo: '신간 소설' },
    // --- 1월 2일 ---
    { id: nextId(), type: 'expense', amount: 32000, place: '곱창골목 할매집', normalized_place: '곱창골목 할매집', category: 'Food', transaction_date: '2026-01-02T19:00:00', lat: 35.1561, lng: 129.0605, memo: '저녁 회식' },
    { id: nextId(), type: 'expense', amount: 1400, place: '부산교통공사', normalized_place: '부산지하철', category: 'Transport', transaction_date: '2026-01-02T08:15:00', lat: 35.1580, lng: 129.0592, memo: '' },
    { id: nextId(), type: 'expense', amount: 6500, place: '편의점 GS25', normalized_place: 'GS25', category: 'Food', transaction_date: '2026-01-02T22:10:00', lat: 35.1590, lng: 129.0610, memo: '야식 라면' },
    // --- 1월 3일 ---
    { id: nextId(), type: 'expense', amount: 5200, place: '이디야커피 광안리점', normalized_place: '이디야커피', category: 'Cafe', transaction_date: '2026-01-03T14:00:00', lat: 35.1531, lng: 129.1186, memo: '카페라떼' },
    { id: nextId(), type: 'expense', amount: 45000, place: '신세계백화점 센텀시티', normalized_place: '신세계백화점', category: 'Shopping', transaction_date: '2026-01-03T16:30:00', lat: 35.1692, lng: 129.1308, memo: '겨울 니트' },
    // --- 1월 4일 ---
    { id: nextId(), type: 'expense', amount: 15000, place: '카카오택시', normalized_place: '카카오택시', category: 'Transport', transaction_date: '2026-01-04T23:30:00', lat: 35.1579, lng: 129.0597, memo: '서면→해운대' },
    { id: nextId(), type: 'expense', amount: 28000, place: '해운대 횟집', normalized_place: '해운대 횟집', category: 'Food', transaction_date: '2026-01-04T18:00:00', lat: 35.1587, lng: 129.1604, memo: '광어회' },
    { id: nextId(), type: 'expense', amount: 4800, place: '메가커피 해운대점', normalized_place: '메가커피', category: 'Cafe', transaction_date: '2026-01-04T10:00:00', lat: 35.1625, lng: 129.1630, memo: '아이스라떼' },
    // --- 1월 5일 ---
    { id: nextId(), type: 'expense', amount: 6800, place: 'CU 편의점', normalized_place: 'CU', category: 'Others', transaction_date: '2026-01-05T22:00:00', lat: 35.1579, lng: 129.0597, memo: '야식' },
    { id: nextId(), type: 'expense', amount: 52000, place: '무신사스토어', normalized_place: '무신사', category: 'Shopping', transaction_date: '2026-01-05T15:00:00', lat: null, lng: null, memo: '후드티' },
    { id: nextId(), type: 'expense', amount: 9500, place: '김밥천국 부산대점', normalized_place: '김밥천국', category: 'Food', transaction_date: '2026-01-05T12:00:00', lat: 35.2314, lng: 129.0847, memo: '점심' },
    // --- 1월 6일 ---
    { id: nextId(), type: 'expense', amount: 42800, place: '쿠팡이츠', normalized_place: '쿠팡이츠', category: 'Food', transaction_date: '2026-01-06T20:30:00', lat: 35.1579, lng: 129.0597, memo: '치킨+피자' },
    { id: nextId(), type: 'expense', amount: 5500, place: '투썸플레이스 PNU점', normalized_place: '투썸플레이스', category: 'Cafe', transaction_date: '2026-01-06T10:00:00', lat: 35.2314, lng: 129.0847, memo: '아이스아메리카노' },
    { id: nextId(), type: 'expense', amount: 18000, place: '올리브영 서면점', normalized_place: '올리브영', category: 'Shopping', transaction_date: '2026-01-06T14:30:00', lat: 35.1575, lng: 129.0600, memo: '스킨케어' },
    // --- 1월 7일 ---
    { id: nextId(), type: 'expense', amount: 12000, place: '부산대학교 학생식당', normalized_place: '학생식당', category: 'Food', transaction_date: '2026-01-07T12:00:00', lat: 35.2319, lng: 129.0839, memo: '점심' },
    { id: nextId(), type: 'expense', amount: 89000, place: '교보문고 센텀시티점', normalized_place: '교보문고', category: 'Shopping', transaction_date: '2026-01-07T17:00:00', lat: 35.1694, lng: 129.1296, memo: '개발서적 2권' },
    // --- 1월 8일 ---
    { id: nextId(), type: 'expense', amount: 4300, place: '메가커피 경성대점', normalized_place: '메가커피', category: 'Cafe', transaction_date: '2026-01-08T09:00:00', lat: 35.1407, lng: 129.1002, memo: '' },
    { id: nextId(), type: 'expense', amount: 18500, place: '본죽&비빔밥', normalized_place: '본죽', category: 'Food', transaction_date: '2026-01-08T12:30:00', lat: 35.1579, lng: 129.0597, memo: '전복죽' },
    { id: nextId(), type: 'expense', amount: 35000, place: 'CGV 센텀시티', normalized_place: 'CGV', category: 'Entertainment', transaction_date: '2026-01-08T19:00:00', lat: 35.1692, lng: 129.1308, memo: '영화 2인 + 팝콘' },
    // --- 1월 9일 ---
    { id: nextId(), type: 'expense', amount: 7900, place: '도미노피자', normalized_place: '도미노피자', category: 'Food', transaction_date: '2026-01-09T19:30:00', lat: 35.1580, lng: 129.0595, memo: '포장 할인' },
    { id: nextId(), type: 'expense', amount: 1400, place: '부산교통공사', normalized_place: '부산지하철', category: 'Transport', transaction_date: '2026-01-09T08:30:00', lat: 35.1580, lng: 129.0592, memo: '' },
    // --- 1월 10일 ---
    { id: nextId(), type: 'expense', amount: 29000, place: '이마트 해운대점', normalized_place: '이마트', category: 'Shopping', transaction_date: '2026-01-10T11:00:00', lat: 35.1650, lng: 129.1620, memo: '주간 장보기' },
    { id: nextId(), type: 'expense', amount: 5000, place: '스타벅스 서면점', normalized_place: '스타벅스', category: 'Cafe', transaction_date: '2026-01-10T15:30:00', lat: 35.1578, lng: 129.0600, memo: '카라멜 마키아또' },
    // --- 1월 12일 ---
    { id: nextId(), type: 'expense', amount: 65000, place: '나이키 부산점', normalized_place: '나이키', category: 'Shopping', transaction_date: '2026-01-12T14:00:00', lat: 35.1560, lng: 129.0610, memo: '운동화' },
    { id: nextId(), type: 'expense', amount: 8500, place: '김해국제공항 편의점', normalized_place: '편의점', category: 'Food', transaction_date: '2026-01-12T06:30:00', lat: 35.1796, lng: 128.9380, memo: '간식' },
    // --- 1월 14일 ---
    { id: nextId(), type: 'expense', amount: 35000, place: '헬스장 월회비', normalized_place: '헬스장', category: 'Exercise', transaction_date: '2026-01-14T00:00:00', lat: 35.1582, lng: 129.0600, memo: '' },
    { id: nextId(), type: 'expense', amount: 12000, place: '서면 돈까스집', normalized_place: '돈까스집', category: 'Food', transaction_date: '2026-01-14T12:30:00', lat: 35.1575, lng: 129.0598, memo: '점심' },
    // --- 1월 15일 ---
    { id: nextId(), type: 'expense', amount: 4200, place: '이디야커피 서면점', normalized_place: '이디야커피', category: 'Cafe', transaction_date: '2026-01-15T09:00:00', lat: 35.1578, lng: 129.0602, memo: '' },
    { id: nextId(), type: 'expense', amount: 23000, place: '배달의민족', normalized_place: '배달의민족', category: 'Food', transaction_date: '2026-01-15T20:00:00', lat: null, lng: null, memo: '족발' },
    // --- 1월 17일 ---
    { id: nextId(), type: 'expense', amount: 15000, place: '다이소 센텀점', normalized_place: '다이소', category: 'Shopping', transaction_date: '2026-01-17T13:00:00', lat: 35.1690, lng: 129.1305, memo: '생활용품' },
    // --- 1월 19일 ---
    { id: nextId(), type: 'expense', amount: 54000, place: '부산 자갈치시장', normalized_place: '자갈치시장', category: 'Food', transaction_date: '2026-01-19T17:00:00', lat: 35.0966, lng: 129.0305, memo: '회 모둠' },
    { id: nextId(), type: 'expense', amount: 12000, place: '카카오택시', normalized_place: '카카오택시', category: 'Transport', transaction_date: '2026-01-19T21:00:00', lat: 35.0970, lng: 129.0310, memo: '자갈치→서면' },
    // --- 1월 21일 ---
    { id: nextId(), type: 'expense', amount: 3800, place: 'CU 편의점', normalized_place: 'CU', category: 'Food', transaction_date: '2026-01-21T07:30:00', lat: 35.1579, lng: 129.0597, memo: '삼각김밥' },
    { id: nextId(), type: 'expense', amount: 45000, place: '유니클로 센텀시티', normalized_place: '유니클로', category: 'Shopping', transaction_date: '2026-01-21T15:00:00', lat: 35.1692, lng: 129.1308, memo: '겨울 후리스' },
    // --- 1월 23일 ---
    { id: nextId(), type: 'expense', amount: 8000, place: '부산대 카페거리', normalized_place: '카페거리', category: 'Cafe', transaction_date: '2026-01-23T14:00:00', lat: 35.2316, lng: 129.0845, memo: '디저트+음료' },
    // --- 1월 25일 ---
    { id: nextId(), type: 'expense', amount: 22000, place: '배달의민족', normalized_place: '배달의민족', category: 'Food', transaction_date: '2026-01-25T19:30:00', lat: null, lng: null, memo: '중식' },
    { id: nextId(), type: 'expense', amount: 16500, place: '넷플릭스 + 웨이브', normalized_place: '구독서비스', category: 'Others', transaction_date: '2026-01-25T00:00:00', lat: null, lng: null, memo: 'OTT 합산' },
    // --- 1월 27일 ---
    { id: nextId(), type: 'expense', amount: 4500, place: '스타벅스 PNU점', normalized_place: '스타벅스', category: 'Cafe', transaction_date: '2026-01-27T10:00:00', lat: 35.2314, lng: 129.0847, memo: '아메리카노' },
    { id: nextId(), type: 'expense', amount: 9800, place: '국밥집 서면', normalized_place: '국밥집', category: 'Food', transaction_date: '2026-01-27T12:30:00', lat: 35.1576, lng: 129.0595, memo: '돼지국밥' },
    // --- 1월 29일 ---
    { id: nextId(), type: 'expense', amount: 32000, place: '술집 서면', normalized_place: '술집', category: 'Food', transaction_date: '2026-01-29T21:00:00', lat: 35.1575, lng: 129.0600, memo: '소주+안주' },
    { id: nextId(), type: 'expense', amount: 18000, place: '카카오택시', normalized_place: '카카오택시', category: 'Transport', transaction_date: '2026-01-29T23:30:00', lat: 35.1575, lng: 129.0600, memo: '서면→해운대' },
    // --- 1월 고정 비용 ---
    { id: nextId(), type: 'expense', amount: 550000, place: '월세', normalized_place: '월세', category: 'Fixed', transaction_date: '2026-01-01T00:00:00', lat: null, lng: null, memo: '1월 월세' },
    { id: nextId(), type: 'expense', amount: 89000, place: 'SKT 통신비', normalized_place: 'SKT', category: 'Fixed', transaction_date: '2026-01-05T00:00:00', lat: null, lng: null, memo: '휴대폰 요금' },
    { id: nextId(), type: 'expense', amount: 14900, place: '넷플릭스', normalized_place: '넷플릭스', category: 'Fixed', transaction_date: '2026-01-08T00:00:00', lat: null, lng: null, memo: '구독료' },
    { id: nextId(), type: 'expense', amount: 55000, place: '국민건강보험공단', normalized_place: '건강보험', category: 'Fixed', transaction_date: '2026-01-10T00:00:00', lat: null, lng: null, memo: '건강보험료' },
    // --- 1월 수입 ---
    { id: nextId(), type: 'income', amount: 2500000, place: '부산대학교', normalized_place: '부산대학교', category: 'Salary', transaction_date: '2026-01-05T00:00:00', lat: null, lng: null, memo: '연구비' },
    { id: nextId(), type: 'income', amount: 150000, place: '부모님 용돈', normalized_place: '용돈', category: 'Allowance', transaction_date: '2026-01-15T00:00:00', lat: null, lng: null, memo: '' },
];

// ============================================
// 2월 지출 데이터
// ============================================
const FEB_EXPENSES = [
    // --- 2월 1일 ---
    { id: nextId(), type: 'expense', amount: 4500, place: '스타벅스 해운대점', normalized_place: '스타벅스', category: 'Cafe', transaction_date: '2026-02-01T09:30:00', lat: 35.1631, lng: 129.1635, memo: '아메리카노' },
    { id: nextId(), type: 'expense', amount: 11000, place: '서면 돈까스집', normalized_place: '돈까스집', category: 'Food', transaction_date: '2026-02-01T12:00:00', lat: 35.1575, lng: 129.0598, memo: '점심' },
    { id: nextId(), type: 'expense', amount: 1400, place: '부산교통공사', normalized_place: '부산지하철', category: 'Transport', transaction_date: '2026-02-01T08:15:00', lat: 35.1580, lng: 129.0592, memo: '' },
    // --- 2월 2일 ---
    { id: nextId(), type: 'expense', amount: 7800, place: '국밥집 서면', normalized_place: '국밥집', category: 'Food', transaction_date: '2026-02-02T12:30:00', lat: 35.1576, lng: 129.0595, memo: '돼지국밥' },
    { id: nextId(), type: 'expense', amount: 38000, place: '올리브영 해운대점', normalized_place: '올리브영', category: 'Shopping', transaction_date: '2026-02-02T15:00:00', lat: 35.1625, lng: 129.1630, memo: '화장품' },
    // --- 2월 3일 ---
    { id: nextId(), type: 'expense', amount: 5000, place: '이디야커피 서면점', normalized_place: '이디야커피', category: 'Cafe', transaction_date: '2026-02-03T09:30:00', lat: 35.1578, lng: 129.0602, memo: '아메리카노' },
    { id: nextId(), type: 'expense', amount: 25000, place: '배달의민족', normalized_place: '배달의민족', category: 'Food', transaction_date: '2026-02-03T19:30:00', lat: null, lng: null, memo: '떡볶이 세트' },
    // --- 2월 4일 ---
    { id: nextId(), type: 'expense', amount: 1400, place: '부산교통공사', normalized_place: '부산지하철', category: 'Transport', transaction_date: '2026-02-04T08:00:00', lat: 35.1580, lng: 129.0592, memo: '' },
    { id: nextId(), type: 'expense', amount: 8500, place: '맥도날드 PNU점', normalized_place: '맥도날드', category: 'Food', transaction_date: '2026-02-04T12:00:00', lat: 35.2314, lng: 129.0847, memo: '빅맥세트' },
    { id: nextId(), type: 'expense', amount: 6200, place: '투썸플레이스 서면점', normalized_place: '투썸플레이스', category: 'Cafe', transaction_date: '2026-02-04T14:30:00', lat: 35.1578, lng: 129.0600, memo: '케이크+커피' },
    // --- 2월 5일 ---
    { id: nextId(), type: 'expense', amount: 55000, place: '무신사스토어', normalized_place: '무신사', category: 'Shopping', transaction_date: '2026-02-05T11:00:00', lat: null, lng: null, memo: '봄 자켓' },
    { id: nextId(), type: 'expense', amount: 15000, place: '서면 삼겹살집', normalized_place: '삼겹살집', category: 'Food', transaction_date: '2026-02-05T19:00:00', lat: 35.1576, lng: 129.0598, memo: '삼겹살 1인분' },
    // --- 2월 6일 ---
    { id: nextId(), type: 'expense', amount: 4300, place: '메가커피 서면점', normalized_place: '메가커피', category: 'Cafe', transaction_date: '2026-02-06T08:45:00', lat: 35.1578, lng: 129.0598, memo: '아이스아메리카노' },
    { id: nextId(), type: 'expense', amount: 42000, place: '쿠팡이츠', normalized_place: '쿠팡이츠', category: 'Food', transaction_date: '2026-02-06T20:00:00', lat: 35.1579, lng: 129.0597, memo: '치킨' },
    // --- 2월 7일 ---
    { id: nextId(), type: 'expense', amount: 25000, place: '해운대 횟집', normalized_place: '해운대 횟집', category: 'Food', transaction_date: '2026-02-07T18:30:00', lat: 35.1587, lng: 129.1604, memo: '소고기초밥' },
    { id: nextId(), type: 'expense', amount: 12000, place: '카카오택시', normalized_place: '카카오택시', category: 'Transport', transaction_date: '2026-02-07T22:30:00', lat: 35.1587, lng: 129.1604, memo: '해운대→서면' },
    // --- 2월 8일 ---
    { id: nextId(), type: 'expense', amount: 35000, place: 'CGV 센텀시티', normalized_place: 'CGV', category: 'Entertainment', transaction_date: '2026-02-08T14:00:00', lat: 35.1692, lng: 129.1308, memo: 'IMAX 영화' },
    { id: nextId(), type: 'expense', amount: 9000, place: '스타벅스 센텀점', normalized_place: '스타벅스', category: 'Cafe', transaction_date: '2026-02-08T16:30:00', lat: 35.1694, lng: 129.1296, memo: '프라푸치노' },
    // --- 2월 9일 ---
    { id: nextId(), type: 'expense', amount: 48000, place: '신세계백화점 센텀시티', normalized_place: '신세계백화점', category: 'Shopping', transaction_date: '2026-02-09T13:00:00', lat: 35.1692, lng: 129.1308, memo: '발렌타인 선물' },
    { id: nextId(), type: 'expense', amount: 18000, place: '이탈리안 레스토랑', normalized_place: '레스토랑', category: 'Food', transaction_date: '2026-02-09T19:00:00', lat: 35.1580, lng: 129.0600, memo: '파스타' },
    // --- 2월 10일 ---
    { id: nextId(), type: 'expense', amount: 32000, place: '이마트 서면점', normalized_place: '이마트', category: 'Shopping', transaction_date: '2026-02-10T10:00:00', lat: 35.1575, lng: 129.0595, memo: '주간 장보기' },
    { id: nextId(), type: 'expense', amount: 1400, place: '부산교통공사', normalized_place: '부산지하철', category: 'Transport', transaction_date: '2026-02-10T08:00:00', lat: 35.1580, lng: 129.0592, memo: '' },
    // --- 2월 11일 ---
    { id: nextId(), type: 'expense', amount: 9200, place: '김밥천국 서면점', normalized_place: '김밥천국', category: 'Food', transaction_date: '2026-02-11T12:30:00', lat: 35.1576, lng: 129.0598, memo: '점심' },
    { id: nextId(), type: 'expense', amount: 4500, place: '스타벅스 PNU점', normalized_place: '스타벅스', category: 'Cafe', transaction_date: '2026-02-11T09:30:00', lat: 35.2314, lng: 129.0847, memo: '아메리카노' },
    // --- 2월 12일 ---
    { id: nextId(), type: 'expense', amount: 120000, place: '병원 진료비', normalized_place: '병원', category: 'Medical', transaction_date: '2026-02-12T10:00:00', lat: 35.1590, lng: 129.0610, memo: '감기 진료+약' },
    { id: nextId(), type: 'expense', amount: 6700, place: 'CU 편의점', normalized_place: 'CU', category: 'Food', transaction_date: '2026-02-12T22:00:00', lat: 35.1579, lng: 129.0597, memo: '비타민 음료' },
    // --- 2월 13일 ---
    { id: nextId(), type: 'expense', amount: 4200, place: '이디야커피 PNU점', normalized_place: '이디야커피', category: 'Cafe', transaction_date: '2026-02-13T10:00:00', lat: 35.2314, lng: 129.0847, memo: '' },
    { id: nextId(), type: 'expense', amount: 15000, place: '서면 쌀국수', normalized_place: '쌀국수집', category: 'Food', transaction_date: '2026-02-13T12:30:00', lat: 35.1575, lng: 129.0600, memo: '포' },
    // --- 2월 14일 ---
    { id: nextId(), type: 'expense', amount: 85000, place: '르부르봉 레스토랑', normalized_place: '레스토랑', category: 'Food', transaction_date: '2026-02-14T19:00:00', lat: 35.1588, lng: 129.1600, memo: '발렌타인 디너' },
    { id: nextId(), type: 'expense', amount: 35000, place: '꽃배달', normalized_place: '꽃배달', category: 'Shopping', transaction_date: '2026-02-14T14:00:00', lat: null, lng: null, memo: '장미 꽃다발' },
    { id: nextId(), type: 'expense', amount: 15000, place: '카카오택시', normalized_place: '카카오택시', category: 'Transport', transaction_date: '2026-02-14T22:00:00', lat: 35.1588, lng: 129.1600, memo: '' },
    // --- 2월 15일 ---
    { id: nextId(), type: 'expense', amount: 5500, place: '투썸플레이스 PNU점', normalized_place: '투썸플레이스', category: 'Cafe', transaction_date: '2026-02-15T14:00:00', lat: 35.2314, lng: 129.0847, memo: '딸기케이크' },
    { id: nextId(), type: 'expense', amount: 28000, place: '삼겹살집 광안리', normalized_place: '삼겹살집', category: 'Food', transaction_date: '2026-02-15T19:30:00', lat: 35.1531, lng: 129.1186, memo: '2인분' },
    // --- 2월 16일 ---
    { id: nextId(), type: 'expense', amount: 1400, place: '부산교통공사', normalized_place: '부산지하철', category: 'Transport', transaction_date: '2026-02-16T08:30:00', lat: 35.1580, lng: 129.0592, memo: '' },
    { id: nextId(), type: 'expense', amount: 7800, place: '서면 라멘집', normalized_place: '라멘집', category: 'Food', transaction_date: '2026-02-16T12:00:00', lat: 35.1576, lng: 129.0598, memo: '돈코츠 라멘' },
    // --- 2월 17일 ---
    { id: nextId(), type: 'expense', amount: 22000, place: '배달의민족', normalized_place: '배달의민족', category: 'Food', transaction_date: '2026-02-17T20:00:00', lat: null, lng: null, memo: '짜장면+탕수육' },
    { id: nextId(), type: 'expense', amount: 4800, place: '메가커피 PNU점', normalized_place: '메가커피', category: 'Cafe', transaction_date: '2026-02-17T09:00:00', lat: 35.2314, lng: 129.0847, memo: '' },
    // --- 2월 18일 ---
    { id: nextId(), type: 'expense', amount: 4500, place: '스타벅스 서면점', normalized_place: '스타벅스', category: 'Cafe', transaction_date: '2026-02-18T09:00:00', lat: 35.1578, lng: 129.0600, memo: '아메리카노' },
    { id: nextId(), type: 'expense', amount: 12000, place: '부산대학교 학생식당', normalized_place: '학생식당', category: 'Food', transaction_date: '2026-02-18T12:00:00', lat: 35.2319, lng: 129.0839, memo: '점심' },
    // --- 2월 고정 비용 ---
    { id: nextId(), type: 'expense', amount: 550000, place: '월세', normalized_place: '월세', category: 'Fixed', transaction_date: '2026-02-01T00:00:00', lat: null, lng: null, memo: '2월 월세' },
    { id: nextId(), type: 'expense', amount: 89000, place: 'SKT 통신비', normalized_place: 'SKT', category: 'Fixed', transaction_date: '2026-02-05T00:00:00', lat: null, lng: null, memo: '휴대폰 요금' },
    { id: nextId(), type: 'expense', amount: 14900, place: '넷플릭스', normalized_place: '넷플릭스', category: 'Fixed', transaction_date: '2026-02-08T00:00:00', lat: null, lng: null, memo: '구독료' },
    { id: nextId(), type: 'expense', amount: 55000, place: '국민건강보험공단', normalized_place: '건강보험', category: 'Fixed', transaction_date: '2026-02-10T00:00:00', lat: null, lng: null, memo: '건강보험료' },
    { id: nextId(), type: 'expense', amount: 35000, place: '헬스장 월회비', normalized_place: '헬스장', category: 'Exercise', transaction_date: '2026-02-14T00:00:00', lat: 35.1582, lng: 129.0600, memo: '' },
    // --- 2월 수입 ---
    { id: nextId(), type: 'income', amount: 2500000, place: '부산대학교', normalized_place: '부산대학교', category: 'Salary', transaction_date: '2026-02-05T00:00:00', lat: null, lng: null, memo: '연구비' },
    { id: nextId(), type: 'income', amount: 200000, place: '부모님 용돈', normalized_place: '용돈', category: 'Allowance', transaction_date: '2026-02-14T00:00:00', lat: null, lng: null, memo: '설날 용돈' },
];

// ============================================
// COMBINED EXPENSES
// ============================================
export const DEMO_EXPENSES = [...JAN_EXPENSES, ...FEB_EXPENSES];

// ============================================
// DEMO CONFIG
// ============================================
export const DEMO_CONFIG = {
    budget: 1200000,
    gmail_user: 'demo@example.com',
    llm_provider: 'groq',
    llm_model: 'llama3-70b-8192',
    kakao_api_key: 'demo-key',
    api_keys: [{ provider: 'groq', key: 'demo-key', model: 'llama3-70b-8192' }],
    fixed_expenses: [
        { name: '월세', amount: 550000, type: 'expense', day: 1 },
        { name: 'SKT 통신비', amount: 89000, type: 'expense', day: 5 },
        { name: '넷플릭스', amount: 14900, type: 'expense', day: 8 },
        { name: '건강보험', amount: 55000, type: 'expense', day: 10 },
        { name: '헬스장', amount: 35000, type: 'expense', day: 14 },
        { name: '연구비', amount: 2500000, type: 'income', day: 5 },
    ],
    include_fixed: true,
    use_location_sorting: false,
    monthly_budgets: {},
};

// ============================================
// DEMO GOALS
// ============================================
export const DEMO_GOALS = [
    { id: 1, name: '유럽 여행', target_amount: 3000000, current_amount: 1200000, icon: '✈️', created_at: '2025-11-01' },
    { id: 2, name: '맥북 프로', target_amount: 2500000, current_amount: 850000, icon: '💻', created_at: '2025-12-15' },
    { id: 3, name: '비상금 200만원', target_amount: 2000000, current_amount: 1750000, icon: '🏦', created_at: '2025-10-01' },
];

// ============================================
// DEMO GRAPH DATA (소비 패턴)
// ============================================
export const DEMO_GRAPH_DATA = {
    nodes: [
        { id: 'place_스타벅스', label: '스타벅스', type: 'place' },
        { id: 'place_메가커피', label: '메가커피', type: 'place' },
        { id: 'place_이디야커피', label: '이디야커피', type: 'place' },
        { id: 'place_맥도날드', label: '맥도날드', type: 'place' },
        { id: 'place_배달의민족', label: '배달의민족', type: 'place' },
        { id: 'place_카카오택시', label: '카카오택시', type: 'place' },
        { id: 'time_Morning', label: '아침', type: 'time' },
        { id: 'time_Lunch', label: '점심', type: 'time' },
        { id: 'time_Night', label: '밤', type: 'time' },
        { id: 'day_Saturday', label: '토요일', type: 'day' },
        { id: 'day_Friday', label: '금요일', type: 'day' },
        { id: 'day_Monday', label: '월요일', type: 'day' },
    ],
    links: [
        { source: 'place_스타벅스', target: 'time_Morning', relation: 'VISITED_AT', weight: 8 },
        { source: 'place_메가커피', target: 'time_Morning', relation: 'VISITED_AT', weight: 5 },
        { source: 'place_이디야커피', target: 'time_Morning', relation: 'VISITED_AT', weight: 4 },
        { source: 'place_맥도날드', target: 'time_Lunch', relation: 'VISITED_AT', weight: 4 },
        { source: 'place_배달의민족', target: 'time_Night', relation: 'VISITED_AT', weight: 6 },
        { source: 'place_카카오택시', target: 'time_Night', relation: 'VISITED_AT', weight: 5 },
        { source: 'place_스타벅스', target: 'day_Monday', relation: 'VISITED_ON', weight: 4 },
        { source: 'place_배달의민족', target: 'day_Saturday', relation: 'VISITED_ON', weight: 3 },
        { source: 'place_카카오택시', target: 'day_Friday', relation: 'VISITED_ON', weight: 4 },
    ]
};

// ============================================
// DEMO CHAT RESPONSES
// ============================================
export const DEMO_CHAT_RESPONSES = [
    {
        keywords: ['지출', '소비', '쓴 돈', '얼마', '이번 달'],
        assistant: '이번 달(2월) 총 지출은 약 1,350,200원이에요. 예산 1,200,000원 대비 **112.5%** 를 사용하셨네요. 😅\n\n카테고리별로 보면:\n- 🍽️ 식비: 약 340,000원 (가장 많이)\n- 🛍️ 쇼핑: 약 208,000원\n- ☕ 카페: 약 54,000원\n- 🚕 교통: 약 32,000원\n- 🏠 고정비: 약 709,000원\n\n고정비를 제외한 변동 지출은 641,200원으로, 전월보다 약 10% 줄었어요!\n💡 배달 음식 비용을 줄이면 월 5만원 이상 절약이 가능합니다.'
    },
    {
        keywords: ['카페', '커피', '스타벅스', '음료'],
        assistant: '이번 달 카페 지출은 총 약 54,000원이에요. ☕\n\n가장 많이 간 곳:\n1. 🥇 스타벅스 — 약 18,000원 (4회)\n2. 🥈 메가커피 — 약 9,100원 (2회)\n3. 🥉 이디야/투썸 — 약 26,900원\n\n전월(~49,800원) 대비 약 8% 증가했어요.\n\n💡 스타벅스 대신 메가커피를 이용하면 잔당 약 1,200원 절약 가능!\n월 20잔 기준 약 24,000원 세이브!'
    },
    {
        keywords: ['절약', '아끼는', '줄이는', '팁', '어떻게'],
        assistant: '데이터 기반 절약 팁을 드릴게요! 💡\n\n1. 🛵 **배달 비용 점검**: 이번 달 배달 음식 약 89,000원 → 주 1회로 줄이면 월 4만원 절약\n2. ☕ **카페 루틴 조정**: 월·수·금만 방문 목표 → 월 1.5만원 절약\n3. 🚕 **택시 대신 지하철**: 야간 택시 비용이 평균 15,000원 → 막차 이용 시 14,000원 절약\n4. 🛍️ **충동구매 방지**: 쇼핑 전 24시간 대기 규칙 적용\n\n이 방법들을 모두 실천하면 **월 약 10만원** 이상 절약 가능합니다! 🎯'
    },
    {
        keywords: ['안녕', '반가워', '하이', '뭐해'],
        assistant: '안녕하세요! Mino입니다. 👋\n\n금융 생활에 대해 궁금한 점이 있으신가요?\n\n물어볼 수 있는 것들:\n- "이번 달 지출 어때?"\n- "카페 지출 분석해줘"\n- "절약 팁 알려줘"\n- "지난달이랑 비교해줘"\n- "식비 줄이는 방법"\n\n편하게 물어보세요! 😊'
    },
    {
        keywords: ['비교', '지난달', '전월', '변화'],
        assistant: '1월 vs 2월 비교 분석이에요! 📊\n\n| 항목 | 1월 | 2월 | 변화 |\n|------|------|------|------|\n| 총 지출 | 1,452,000원 | 1,350,200원 | ▼7.0% |\n| 식비 | 370,000원 | 340,000원 | ▼8.1% |\n| 쇼핑 | 334,000원 | 208,000원 | ▼37.7% |\n| 카페 | 49,800원 | 54,000원 | ▲8.4% |\n\n✅ **좋은 점**: 쇼핑 지출이 크게 줄었어요!\n⚠️ **주의**: 카페와 의료비가 소폭 증가\n\n전체적으로 **7% 절약**에 성공했습니다! 🎉'
    },
    {
        keywords: ['식비', '음식', '밥', '먹은'],
        assistant: '이번 달 식비 상세 분석이에요! 🍽️\n\n총 식비: 약 340,000원 (전월 대비 ▼8.1%)\n\n지출처 Top 5:\n1. 배달의민족: 47,000원 (2회)\n2. 발렌타인 디너: 85,000원 (1회)\n3. 삼겹살집: 43,000원 (2회)\n4. 외식(기타): 85,000원\n5. 편의점/간식: 약 15,000원\n\n💡 개선 포인트:\n- 배달 주문 → 포장으로 전환 시 건당 3,000~5,000원 절약\n- 학생식당 이용 빈도를 높이면 점심값 50% 절감 가능\n- 주말 자취 요리로 월 10만원 이상 절약 가능!'
    },
    {
        keywords: ['목표', '저축', '모으기'],
        assistant: '현재 저축 목표 현황이에요! 🎯\n\n1. ✈️ **유럽 여행** — 120만원 / 300만원 (40%)\n   → 매달 50만원씩 모으면 4개월 후 달성!\n\n2. 💻 **맥북 프로** — 85만원 / 250만원 (34%)\n   → 현재 속도면 약 5개월 소요\n\n3. 🏦 **비상금 200만원** — 175만원 / 200만원 (87.5%)\n   → 거의 다 왔어요! 이번 달이면 달성 가능! 🎉\n\n💡 팁: 매달 고정 저축 40만원 + 절약분 10만원 = 총 50만원 저축 가능!'
    },
];

// ============================================
// DEMO INBOX EMAILS (Parsed expenses for inbox view)
// ============================================
export const DEMO_EMAILS = [
    {
        id: 1,
        subject: '[Mino_DATA] 삼성카드 결제 승인',
        from: 'noreply@samsungcard.com',
        body: '삼성카드 결제 승인\n카드번호: 9412-****-****-1234\n승인금액: 45,000원\n가맹점: 신세계백화점 센텀시티\n승인일시: 2026-02-09 13:00',
        date: '2026-02-09T13:01:00',
        parsed: true
    },
    {
        id: 2,
        subject: '[Mino_DATA] KB국민카드 결제 승인',
        from: 'noreply@kbcard.com',
        body: 'KB국민카드 결제 승인\n카드번호: 5482-****-****-5678\n승인금액: 85,000원\n가맹점: 르부르봉 레스토랑\n승인일시: 2026-02-14 19:00',
        date: '2026-02-14T19:01:00',
        parsed: true
    },
];
