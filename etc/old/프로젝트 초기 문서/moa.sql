-- 자식 테이블 먼저 삭제
DROP TABLE Mydata_transaction;
DROP TABLE Mydata_account;
DROP TABLE coin_history;
DROP TABLE transaction;
DROP TABLE habit_habit_log;
DROP TABLE habit_log;
DROP TABLE habit;
DROP TABLE nyang_coin;
DROP TABLE user_card;
DROP TABLE admin;
DROP TABLE card;
DROP TABLE users;

-- 사용자 테이블
CREATE TABLE users (
    id NUMBER(20) PRIMARY KEY,
    create_date DATE,  -- 계정 생성일
    account_num VARCHAR2(255),
    address VARCHAR2(255),
    address_detail VARCHAR2(255),
    zip_code VARCHAR2(255),
    email VARCHAR2(255),
    name VARCHAR2(255),
    login_id VARCHAR2(255),
    password VARCHAR2(255),
    phone VARCHAR2(255),
    refresh_token VARCHAR2(255),
    simple_password VARCHAR2(255),
    is_admin NUMBER(1) DEFAULT 0
);

-- 은행 예적금대출상품 목록 테이블
CREATE TABLE BANK_PRODUCT (
    ID              NUMBER PRIMARY KEY,                      -- 내부 사용 id
    NAME            VARCHAR2(100) NOT NULL,                 -- 상품명
    IMG             VARCHAR2(255),                          -- 이미지 경로 (추후 개발)
    DESCRIPTION     VARCHAR2(1000),                         -- 상세설명
    CATEGORY        VARCHAR2(100),                          -- 소비습관 관련 카테고리
    BENEFITS        VARCHAR2(1000),                         -- 혜택 설명
    INTEREST        NUMBER(5,2),                            -- 이율(%) 예: 3.75%
    TYPE            VARCHAR2(50) 
    --CHECK (TYPE IN ('예금', '입출금', '적금', '대출'))  -- 상품 유형
);

-- 유저가 보유한 계좌 목록 테이블
CREATE TABLE USER_ACCOUNT (
    USER_ID         NUMBER NOT NULL,                      -- 유저 ID
    ACCOUNT_ID      NUMBER NOT NULL,                      -- 계좌 ID (내부 식별용)
    ACCOUNT_NUMBER  VARCHAR2(30) UNIQUE NOT NULL,         -- 계좌번호
    ACCOUNT_NAME    VARCHAR2(100),                        -- 사용자가 지정한 별명

    PRIMARY KEY (USER_ID, ACCOUNT_ID),
    FOREIGN KEY (USER_ID) REFERENCES USERS(ID),
    FOREIGN KEY (ACCOUNT_ID) REFERENCES BANK_PRODUCT(ID)
);

-- 카드 상품 목록 테이블
CREATE TABLE CARD_PRODUCT (
    ID              NUMBER PRIMARY KEY,                       -- 내부 사용 id
    IMG             VARCHAR2(255),                            -- 카드 이미지
    NAME            VARCHAR2(100) NOT NULL,                   -- 카드 이름
    BRAND           VARCHAR2(50),
        -- CHECK (BRAND IN ('비자', '마스터카드', '아메리칸익스프레스')),  -- 결제 브랜드
    DESCRIPTION     VARCHAR2(1000),                           -- 상세설명
    CATEGORY        VARCHAR2(100),                            -- 소비습관 관련 카테고리
    BENEFITS        VARCHAR2(1000),                           -- 혜택 설명
    INTEREST        NUMBER(5,2),                              -- 이율(%)
    TYPE            VARCHAR2(50) 
        -- CHECK (TYPE IN ('할인카드', '적립카드', '체크카드', '트럼프카드')) -- 카드 타입
);

-- 유저가 보유한 카드 목록 테이블
CREATE TABLE USER_CARD (
    USER_ID         NUMBER NOT NULL,                      -- 유저 ID
    CARD_ID         NUMBER NOT NULL,                      -- 카드 ID

    PRIMARY KEY (USER_ID, CARD_ID),
    FOREIGN KEY (USER_ID) REFERENCES USERS(ID),
    FOREIGN KEY (CARD_ID) REFERENCES CARD_PRODUCT(ID)
);

-- 냥코인 보유 테이블
CREATE TABLE nyang_coin (
    id NUMBER(20) PRIMARY KEY,
    create_date DATE,  -- 발행일
    money NUMBER(20),
    user_id NUMBER(20),
    FOREIGN KEY (user_id) REFERENCES users(id)
);


-- 아직 지원씨로부터 머신러닝 DB 구조가 오지 않아 작업 보류됨
-- -- 습관 테이블
-- CREATE TABLE habit (
--     id NUMBER(20) PRIMARY KEY,
--     create_date DATE,  -- 생성일
--     habit_name VARCHAR2(255),
--     saving NUMBER(20),       -- 절약액
--     state NUMBER,            -- 상태(진행중 등)
--     target_money NUMBER(20), -- 목표 금액
--     title VARCHAR2(255),
--     user_id NUMBER(20),
--     FOREIGN KEY (user_id) REFERENCES users(id)
-- );

-- -- 습관 로그 테이블
-- CREATE TABLE habit_log (
--     id NUMBER(20) PRIMARY KEY,
--     create_date DATE,  -- 로그 기록일
--     save_day DATE,     -- 절약한 날짜
--     save_money NUMBER(20),
--     habit_id NUMBER(20),
--     FOREIGN KEY (habit_id) REFERENCES habit(id)
-- );

-- -- 습관 - 습관 로그 연결 테이블
-- CREATE TABLE habit_habit_log (
--     habit_id NUMBER(20),
--     habit_log_id NUMBER(20),
--     PRIMARY KEY (habit_id, habit_log_id),
--     FOREIGN KEY (habit_id) REFERENCES habit(id),
--     FOREIGN KEY (habit_log_id) REFERENCES habit_log(id)
-- );

-- 카드 거래 내역 테이블
CREATE TABLE transaction (
    id NUMBER(20) PRIMARY KEY,
    approved_amount NUMBER(20),  -- 승인금액
    approved_num VARCHAR2(255),  -- 승인번호
    card_history_id NUMBER(20),
    card_id NUMBER(20),
    card_type VARCHAR2(255),
    category VARCHAR2(255),
    date_time DATE,              -- 거래일시
    shop_name VARCHAR2(255),
    shop_number VARCHAR2(255),
    user_id NUMBER(20),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (card_id) REFERENCES card(id)
);

-- 냥코인 거래 내역 테이블
CREATE TABLE coin_history (
    id NUMBER(20) PRIMARY KEY,
    create_date DATE,         -- 거래 일자
    total_amt NUMBER(20),     -- 전체 잔액
    trans_amt NUMBER(20),     -- 거래 금액
    trans_type VARCHAR2(255), -- 거래 타입 (충전, 사용 등)
    nyang_id NUMBER(20),
    FOREIGN KEY (nyang_id) REFERENCES nyang_coin(id)
);

-- 관리자 정보 테이블
CREATE TABLE admin (
    id NUMBER(20) PRIMARY KEY,
    user_id NUMBER(20) UNIQUE,
    role VARCHAR2(50),       -- 관리자 역할 (ex: OWNER, STAFF)
    create_date DATE,        -- 생성일
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 아직 지원씨로부터 머신러닝 DB 구조가 오지 않아 작업 보류됨
-- -- 마이데이터 계좌 테이블
-- CREATE TABLE Mydata_account (
--     trade_id VARCHAR2(50) PRIMARY KEY,          -- 거래 고유 ID
--     trade_date DATE NOT NULL,                   -- 계좌 거래일
--     bank_name VARCHAR2(100) NOT NULL,           -- 은행명
--     account_balance NUMBER(15, 2) NOT NULL      -- 계좌 잔액
-- );

-- -- 마이데이터 거래 내역 테이블
-- CREATE TABLE Mydata_transaction (
--     transaction_id NUMBER PRIMARY KEY,
--     trade_id VARCHAR2(50) NOT NULL,                  -- 계좌 식별자
--     trade_detail_date DATE NOT NULL,                 -- 거래 상세 날짜
--     trade_time DATE NOT NULL,                        -- 거래 시간
--     transaction_type VARCHAR2(10) NOT NULL,          -- 입출금 타입
--     trade_type VARCHAR2(50) NOT NULL,                -- 거래 유형
--     bankbook_note VARCHAR2(255),                     -- 거래 메모
--     trade_amount NUMBER(15, 2) NOT NULL,             -- 거래 금액
--     balance_after_trade NUMBER(15, 2) NOT NULL,      -- 거래 후 잔액
--     CONSTRAINT fk_account_trade
--         FOREIGN KEY (trade_id)
--         REFERENCES Mydata_account(trade_id)
--         ON DELETE CASCADE
-- );




-- ========================
-- 사용자 테이블 (users)
-- ========================
INSERT INTO users VALUES (1, SYSDATE, 'ACC001', 'Seoul', '101-ho', '10001', 'alice@example.com', 'Alice', 'alice01', 'pass123', '010-1111-1111', 'token1', '1234', 0);
INSERT INTO users VALUES (2, SYSDATE, 'ACC002', 'Busan', '202-ho', '20002', 'bob@example.com', 'Bob', 'bob02', 'pass234', '010-2222-2222', 'token2', '2345', 0);
INSERT INTO users VALUES (3, SYSDATE, 'ACC003', 'Incheon', '303-ho', '30003', 'carol@example.com', 'Carol', 'carol03', 'pass345', '010-3333-3333', 'token3', '3456', 1);
INSERT INTO users VALUES (4, SYSDATE, 'ACC004', 'Daegu', '404-ho', '40004', 'dave@example.com', 'Dave', 'dave04', 'pass456', '010-4444-4444', 'token4', '4567', 0);
INSERT INTO users VALUES (5, SYSDATE, 'ACC005', 'Gwangju', '505-ho', '50005', 'eve@example.com', 'Eve', 'eve05', 'pass567', '010-5555-5555', 'token5', '5678', 1);

-- ========================
-- 카드 테이블 (card)
-- ========================
INSERT INTO card VALUES (1, 'KB 국민카드', '쇼핑 5% 할인', 'img/kb.png', 'KB');
INSERT INTO card VALUES (2, '신한 카드', '영화 50% 할인', 'img/shinhan.png', 'Shinhan');
INSERT INTO card VALUES (3, '삼성카드', '항공 마일리지 적립', 'img/samsung.png', 'Samsung');
INSERT INTO card VALUES (4, '하나카드', '해외결제 수수료 면제', 'img/hana.png', 'Hana');
INSERT INTO card VALUES (5, '현대카드', '음식점 10% 할인', 'img/hyundai.png', 'Hyundai');

-- ========================
-- 유저 카드 연결 테이블 (user_card)
-- ========================
INSERT INTO user_card VALUES (1, 1);
INSERT INTO user_card VALUES (2, 2);
INSERT INTO user_card VALUES (3, 3);
INSERT INTO user_card VALUES (4, 4);
INSERT INTO user_card VALUES (5, 5);

-- ========================
-- 냥코인 테이블 (nyang_coin)
-- ========================
INSERT INTO nyang_coin VALUES (1, SYSDATE, 1000, 1);
INSERT INTO nyang_coin VALUES (2, SYSDATE, 1500, 2);
INSERT INTO nyang_coin VALUES (3, SYSDATE, 2000, 3);
INSERT INTO nyang_coin VALUES (4, SYSDATE, 2500, 4);
INSERT INTO nyang_coin VALUES (5, SYSDATE, 3000, 5);

-- ========================
-- 습관 테이블 (habit)
-- ========================
INSERT INTO habit VALUES (1, SYSDATE, '운동하기', 100, 1, 1000, '건강관리', 1);
INSERT INTO habit VALUES (2, SYSDATE, '독서하기', 200, 1, 1500, '자기계발', 2);
INSERT INTO habit VALUES (3, SYSDATE, '물 마시기', 50, 0, 500, '수분섭취', 3);
INSERT INTO habit VALUES (4, SYSDATE, '명상하기', 80, 1, 800, '마음챙김', 4);
INSERT INTO habit VALUES (5, SYSDATE, '아침 일찍 일어나기', 120, 1, 1200, '습관형성', 5);

-- ========================
-- 습관 로그 테이블 (habit_log)
-- ========================
INSERT INTO habit_log VALUES (1, SYSDATE, SYSDATE, 100, 1);
INSERT INTO habit_log VALUES (2, SYSDATE, SYSDATE, 200, 2);
INSERT INTO habit_log VALUES (3, SYSDATE, SYSDATE, 50, 3);
INSERT INTO habit_log VALUES (4, SYSDATE, SYSDATE, 80, 4);
INSERT INTO habit_log VALUES (5, SYSDATE, SYSDATE, 120, 5);

-- ========================
-- 습관-로그 조인 테이블 (habit_habit_log)
-- ========================
INSERT INTO habit_habit_log VALUES (1, 1);
INSERT INTO habit_habit_log VALUES (2, 2);
INSERT INTO habit_habit_log VALUES (3, 3);
INSERT INTO habit_habit_log VALUES (4, 4);
INSERT INTO habit_habit_log VALUES (5, 5);

-- ========================
-- 거래 내역 테이블 (transaction)
-- ========================
INSERT INTO transaction VALUES (1, 50000, 'APP001', 1, 1, 'Credit', '식비', SYSDATE, '마트A', '001', 1);
INSERT INTO transaction VALUES (2, 80000, 'APP002', 2, 2, 'Credit', '쇼핑', SYSDATE, '백화점B', '002', 2);
INSERT INTO transaction VALUES (3, 30000, 'APP003', 3, 3, 'Debit', '교통', SYSDATE, '버스C', '003', 3);
INSERT INTO transaction VALUES (4, 45000, 'APP004', 4, 4, 'Credit', '카페', SYSDATE, '카페D', '004', 4);
INSERT INTO transaction VALUES (5, 70000, 'APP005', 5, 5, 'Debit', '영화', SYSDATE, '영화관E', '005', 5);

-- ========================
-- 코인 내역 테이블 (coin_history)
-- ========================
INSERT INTO coin_history VALUES (1, SYSDATE, 1000, 100, 'deposit', 1);
INSERT INTO coin_history VALUES (2, SYSDATE, 1500, 200, 'withdraw', 2);
INSERT INTO coin_history VALUES (3, SYSDATE, 2000, 300, 'deposit', 3);
INSERT INTO coin_history VALUES (4, SYSDATE, 2500, 400, 'withdraw', 4);
INSERT INTO coin_history VALUES (5, SYSDATE, 3000, 500, 'deposit', 5);

-- ========================
-- 관리자 테이블 (admin)
-- ========================
INSERT INTO admin VALUES (1, 3, 'ADMIN', SYSDATE);
INSERT INTO admin VALUES (2, 5, 'MANAGER', SYSDATE);
INSERT INTO admin VALUES (3, 1, 'EDITOR', SYSDATE);
INSERT INTO admin VALUES (4, 4, 'VIEWER', SYSDATE);
INSERT INTO admin VALUES (5, 2, 'OWNER', SYSDATE);

-- ========================
-- 마이데이터 계좌 테이블 (Mydata_account)
-- ========================
INSERT INTO Mydata_account VALUES ('TR001', SYSDATE, 'KB국민은행', 1000000);
INSERT INTO Mydata_account VALUES ('TR002', SYSDATE, '신한은행', 800000);
INSERT INTO Mydata_account VALUES ('TR003', SYSDATE, '하나은행', 600000);
INSERT INTO Mydata_account VALUES ('TR004', SYSDATE, '카카오뱅크', 400000);
INSERT INTO Mydata_account VALUES ('TR005', SYSDATE, 'NH농협', 700000);

-- ========================
-- 마이데이터 거래 테이블 (Mydata_transaction)
-- ========================
INSERT INTO Mydata_transaction VALUES (1, 'TR001', SYSDATE, SYSDATE, 'D', '이체', '친구 송금', 50000, 950000);
INSERT INTO Mydata_transaction VALUES (2, 'TR002', SYSDATE, SYSDATE, 'W', '입금', '월급', 200000, 1000000);
INSERT INTO Mydata_transaction VALUES (3, 'TR003', SYSDATE, SYSDATE, 'D', '출금', 'ATM 출금', 100000, 500000);
INSERT INTO Mydata_transaction VALUES (4, 'TR004', SYSDATE, SYSDATE, 'W', '이체', '생활비', 150000, 550000);
INSERT INTO Mydata_transaction VALUES (5, 'TR005', SYSDATE, SYSDATE, 'D', '쇼핑', '인터넷 쇼핑 결제', 200000, 500000);


SELECT * FROM users;
SELECT * FROM card;
SELECT * FROM user_card;
SELECT * FROM nyang_coin;
SELECT * FROM habit;
SELECT * FROM habit_log;
SELECT * FROM habit_habit_log;
SELECT * FROM transaction;
SELECT * FROM coin_history;
SELECT * FROM admin;
SELECT * FROM Mydata_account;
SELECT * FROM Mydata_transaction;