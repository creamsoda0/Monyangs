--삭제문
DROP TABLE card_transaction CASCADE CONSTRAINTS;
DROP TABLE admin CASCADE CONSTRAINTS;
DROP TABLE account_transaction CASCADE CONSTRAINTS;
DROP TABLE user_card CASCADE CONSTRAINTS;
DROP TABLE user_account CASCADE CONSTRAINTS;
DROP TABLE card_product CASCADE CONSTRAINTS;
DROP TABLE bank_product CASCADE CONSTRAINTS;
DROP TABLE users CASCADE CONSTRAINTS;
DROP TABLE region_stats CASCADE CONSTRAINTS;
DROP TABLE micro_payment_stats CASCADE CONSTRAINTS;
DROP TABLE age_stats CASCADE CONSTRAINTS;
DROP TABLE gender_stats CASCADE CONSTRAINTS;
DROP TABLE industry_codes CASCADE CONSTRAINTS;

drop sequence user_seq;
drop sequence acc_trns_seq;

------------------------------------------------
-- 1. 사용자 (users)
------------------------------------------------
CREATE TABLE users (
    user_id NUMBER(20,0) PRIMARY KEY,
    create_date DATE,
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
    is_admin NUMBER(1,0),
    tax NUMBER(5,2),                -- 유저에 따라 다르게 붙는 세금
    gender VARCHAR2(1) NOT NULL CHECK (gender IN ('F', 'M')),
    birth_date DATE NOT NULL
);

------------------------------------------------
-- 2. 은행 상품 (bank_product)
------------------------------------------------
CREATE TABLE bank_product (
    account_id NUMBER(8,0) PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    img VARCHAR2(255),
    description VARCHAR2(1000),
    category VARCHAR2(100),
    benefits VARCHAR2(1000),
    interest NUMBER(5,2),
    type VARCHAR2(50)
);

------------------------------------------------
-- 3. 카드 상품 (card_product)
------------------------------------------------
CREATE TABLE card_product (
    card_id NUMBER(8,0) PRIMARY KEY,
    img VARCHAR2(255),
    name VARCHAR2(100) NOT NULL,
    brand VARCHAR2(50),
    description VARCHAR2(1000),
    category VARCHAR2(100),
    benefits VARCHAR2(1000),
    interest NUMBER(5,2),       -- 카드 이자율
    limit NUMBER(8,0),          -- 카드 한도
    type VARCHAR2(50)
);

------------------------------------------------
-- 4. 사용자 계좌 (user_account)
------------------------------------------------
CREATE TABLE user_account (
    user_account_id NUMBER(20,0) PRIMARY KEY,
    user_id NUMBER(20,0) NOT NULL,
    account_id NUMBER(8,0) NOT NULL,
    account_number VARCHAR2(30) UNIQUE NOT NULL,
    account_name VARCHAR2(100),
    create_date DATE DEFAULT SYSDATE,
    balance NUMBER(20,0) DEFAULT 0 NOT NULL,
    CONSTRAINT fk_user_account_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_user_account_account FOREIGN KEY (account_id) REFERENCES bank_product(account_id)
);

------------------------------------------------
-- 5. 사용자 카드 (user_card)
------------------------------------------------
CREATE TABLE user_card (
    user_card_id NUMBER(8,0) PRIMARY KEY,
    user_id NUMBER(20,0) NOT NULL,
    card_id NUMBER(8,0) NOT NULL,
    CONSTRAINT fk_user_card_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_user_card_card FOREIGN KEY (card_id) REFERENCES card_product(card_id)
);

------------------------------------------------
-- 6. 계좌 거래 (account_transaction)
------------------------------------------------
CREATE TABLE account_transaction (
    account_transaction_id NUMBER(20,0) PRIMARY KEY,
    user_account_id NUMBER(20,0) NOT NULL,
    approved_amount NUMBER(20,2),
    approved_num VARCHAR2(255),
    account_type VARCHAR2(255),
    category VARCHAR2(255),
    date_time DATE,
    shop_name VARCHAR2(255),
    shop_number VARCHAR2(255),
    memo VARCHAR2(1000),        -- 거래 메모
    CONSTRAINT fk_account_transaction_user_account FOREIGN KEY (user_account_id) REFERENCES user_account(user_account_id)
);

------------------------------------------------
-- 9. 관리자 (admin)
------------------------------------------------
CREATE TABLE admin (
    admin_id NUMBER(20,0) PRIMARY KEY,
    user_id NUMBER(20,0) UNIQUE,
    role VARCHAR2(50),
    create_date DATE,
    CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

------------------------------------------------
-- 10. 카드 거래 (card_transaction)
------------------------------------------------
CREATE TABLE card_transaction (
    card_transaction_id NUMBER(20,0) PRIMARY KEY,
    user_card_id NUMBER(8,0) NOT NULL,
    approved_amount NUMBER(20,2),
    approved_num VARCHAR2(255),
    card_type VARCHAR2(255),
    category VARCHAR2(255),
    date_time DATE,
    shop_name VARCHAR2(255),
    shop_number VARCHAR2(255),
    CONSTRAINT fk_card_transaction_user_card FOREIGN KEY (user_card_id) REFERENCES user_card(user_card_id)
);

------------------------------------------------
-- 11. 업종 코드 (industry_codes)
------------------------------------------------
CREATE TABLE industry_codes (
    upjong_code VARCHAR2(20) PRIMARY KEY,
    upjong VARCHAR2(100)
);

------------------------------------------------
-- 12. 성별 통계 (gender_stats)
------------------------------------------------
CREATE TABLE gender_stats (
    gender_stats_id NUMBER(10,0) PRIMARY KEY,
    upjong_code VARCHAR2(20),
    yearmonth DATE,
    gender VARCHAR2(10),
    card_total NUMBER(12,2),
    CONSTRAINT fk_gender_stats_upjong FOREIGN KEY (upjong_code) REFERENCES industry_codes(upjong_code)
);

------------------------------------------------
-- 13. 연령 통계 (age_stats)
------------------------------------------------
CREATE TABLE age_stats (
    age_stats_id NUMBER(10,0) PRIMARY KEY,
    upjong_code VARCHAR2(20),
    yearmonth DATE,
    age_group VARCHAR2(20),
    card_total NUMBER(12,2),
    CONSTRAINT fk_age_stats_upjong FOREIGN KEY (upjong_code) REFERENCES industry_codes(upjong_code)
);

------------------------------------------------
-- 14. 소액결제 통계 (micro_payment_stats)
------------------------------------------------
CREATE TABLE micro_payment_stats (
    payments_stats_id NUMBER(10,0) PRIMARY KEY,
    upjong_code VARCHAR2(20),
    yearmonth DATE,
    time_slot VARCHAR2(20),
    card_total NUMBER(12,2),
    CONSTRAINT fk_micro_payment_upjong FOREIGN KEY (upjong_code) REFERENCES industry_codes(upjong_code)
);

------------------------------------------------
-- 15. 지역 통계 (region_stats)
------------------------------------------------
CREATE TABLE region_stats (
    region_stats_id NUMBER(10,0) PRIMARY KEY,
    upjong_code VARCHAR2(20),
    sido VARCHAR2(20),
    sigungu VARCHAR2(20),
    upjong VARCHAR2(50),
    yearmonthdate DATE,
    total_address_code VARCHAR2(20),
    card_total NUMBER(12,2),
    CONSTRAINT fk_region_stats_upjong FOREIGN KEY (upjong_code) REFERENCES industry_codes(upjong_code)
);

/************************************************
 * 더미 데이터 (1 ~ 10)
 ************************************************/

-- users
INSERT INTO users VALUES (1, TO_DATE('2024-01-01','YYYY-MM-DD'), '111-222-333', '서울시 강남구', '101호', '06236', 'user1@example.com', '홍길동', 'hong1', 'pw1', '010-1111-2222', 'token1', '1111', 0, 'M', TO_DATE('1990-05-15','YYYY-MM-DD'));
INSERT INTO users VALUES (2, TO_DATE('2024-01-02','YYYY-MM-DD'), '222-333-444', '서울시 마포구', '202호', '04123', 'user2@example.com', '김철수', 'kimcs', 'pw2', '010-2222-3333', 'token2', '2222', 0, 'M', TO_DATE('1988-08-22','YYYY-MM-DD'));
INSERT INTO users VALUES (3, TO_DATE('2024-01-03','YYYY-MM-DD'), '333-444-555', '부산시 해운대구', '303호', '48095', 'user3@example.com', '이영희', 'leeyh', 'pw3', '010-3333-4444', 'token3', '3333', 0, 'F', TO_DATE('1992-03-10','YYYY-MM-DD'));
INSERT INTO users VALUES (4, TO_DATE('2024-01-04','YYYY-MM-DD'), '444-555-666', '대구시 수성구', '404호', '42111', 'user4@example.com', '박민수', 'parkms', 'pw4', '010-4444-5555', 'token4', '4444', 0, 'M', TO_DATE('1995-12-01','YYYY-MM-DD'));
INSERT INTO users VALUES (5, TO_DATE('2024-01-05','YYYY-MM-DD'), '555-666-777', '인천시 남동구', '505호', '21555', 'user5@example.com', '최지은', 'choije', 'pw5', '010-5555-6666', 'token5', '5555', 1, 'F', TO_DATE('1993-07-19','YYYY-MM-DD'));

-- bank_product
INSERT INTO bank_product VALUES (100, '냥코인 입출금통장', 'img0.png', '모으냥즈 자유입출금 통장', '예금', '모으냥즈 스페셜 케어 서비스', 0.15, '입출금'); -- 기존 냥코인 테이블을 이걸로 대체
INSERT INTO bank_product VALUES (101, '자유입출금통장', 'img1.png', '수수료 면제 통장', '예금', '인터넷뱅킹 무료', 0.10, '입출금');
INSERT INTO bank_product VALUES (102, '청년 적금', 'img2.png', '청년 전용 적금 상품', '적금', '이자 우대', 3.20, '적금');
INSERT INTO bank_product VALUES (103, '주택청약종합저축', 'img3.png', '내집마련 필수통장', '청약', '대출 우대', 1.50, '저축');
INSERT INTO bank_product VALUES (104, '정기예금', 'img4.png', '고정금리 예금 상품', '예금', '높은 금리', 2.80, '예금');
INSERT INTO bank_product VALUES (105, '어린이 적금', 'img5.png', '아이들을 위한 저축', '적금', '장학금 혜택', 2.00, '적금');

-- card_product
INSERT INTO card_product VALUES (201, 'card1.png', '플래티넘 카드', 'VISA', '해외 특화 카드', '프리미엄', '해외 이용 수수료 면제', 15.00, 10000001, '신용');
INSERT INTO card_product VALUES (202, 'card2.png', '체크 카드', 'Master', '실속형 체크카드', '일반', '교통카드 기능', 0.00, 10000002,'체크');
INSERT INTO card_product VALUES (203, 'card3.png', '쇼핑 카드', 'Amex', '쇼핑 전용 카드', '리워드', '온라인 캐시백', 18.00, 10000003, '신용');
INSERT INTO card_product VALUES (204, 'card4.png', '항공 마일리지 카드', 'VISA', '항공사 제휴 카드', '여행', '항공 마일리지 적립', 20.00, 10000004, '신용');
INSERT INTO card_product VALUES (205, 'card5.png', '학생 전용 체크카드', 'Master', '학생용 카드', '일반', '편의점 할인', 0.00, 10000005, '체크');

-- user_account
INSERT INTO user_account VALUES (301, 1, 101, '111-111-111', '홍길동 자유입출금', TO_DATE('2025-06-01','YYYY-MM-DD'), 100000);
INSERT INTO user_account VALUES (302, 2, 102, '222-222-222', '김철수 청년적금', TO_DATE('2024-06-02','YYYY-MM-DD'), 200000);
INSERT INTO user_account VALUES (303, 3, 103, '333-333-333', '이영희 청약저축', TO_DATE('2024-06-03','YYYY-MM-DD'), 3000);
INSERT INTO user_account VALUES (304, 4, 104, '444-444-444', '박민수 정기예금', TO_DATE('2024-06-04','YYYY-MM-DD'), 4000);
INSERT INTO user_account VALUES (305, 5, 105, '555-555-555', '최지은 어린이적금', TO_DATE('2024-06-05','YYYY-MM-DD'), 50000);

-- user_card
INSERT INTO user_card VALUES (401, 1, 201);
INSERT INTO user_card VALUES (402, 2, 202);
INSERT INTO user_card VALUES (403, 3, 203);
INSERT INTO user_card VALUES (404, 4, 204);
INSERT INTO user_card VALUES (405, 5, 205);

-- account_transaction
INSERT INTO account_transaction (account_transaction_id, user_account_id, approved_amount, approved_num, account_type, category, date_time, shop_name, shop_number, memo) VALUES
(1001, 301, 500000, 'ACC56789', 'Savings', 'Utilities', TO_DATE('2025-08-01 14:00','YYYY-MM-DD HH24:MI'), 'Electric Company', '02-1234-5678', 'Monthly Bill');
INSERT INTO account_transaction VALUES
(1002, 302, 150000, 'ACC56790', 'Checking', 'Rent', TO_DATE('2025-08-02 09:30','YYYY-MM-DD HH24:MI'), 'Landlord', '02-2345-6789', 'Rent Payment');
INSERT INTO account_transaction VALUES
(1003, 303, 200000, 'ACC56791', 'Savings', 'Groceries', TO_DATE('2025-08-03 18:20','YYYY-MM-DD HH24:MI'), 'Supermarket', '02-3456-7890', 'Weekly Shopping');
INSERT INTO account_transaction VALUES
(1004, 304, 75000, 'ACC56792', 'Checking', 'Dining', TO_DATE('2025-08-04 12:10','YYYY-MM-DD HH24:MI'), 'Cafe', '02-4567-8901', 'Lunch with Friends');
INSERT INTO account_transaction VALUES
(1005, 305, 300000, 'ACC56793', 'Deposit', 'Investment', TO_DATE('2025-08-05 16:45','YYYY-MM-DD HH24:MI'), 'Investment Firm', '02-5678-9012', 'Stock Investment');


-- admin
INSERT INTO admin VALUES (801, 1, 'SUPER_ADMIN', TO_DATE('2024-01-01','YYYY-MM-DD'));
INSERT INTO admin VALUES (802, 2, 'OPERATOR', TO_DATE('2024-01-02','YYYY-MM-DD'));
INSERT INTO admin VALUES (803, 3, 'VIEWER', TO_DATE('2024-01-03','YYYY-MM-DD'));
INSERT INTO admin VALUES (804, 4, 'OPERATOR', TO_DATE('2024-01-04','YYYY-MM-DD'));
INSERT INTO admin VALUES (805, 5, 'VIEWER', TO_DATE('2024-01-05','YYYY-MM-DD'));

-- card_transaction
INSERT INTO card_transaction VALUES (901, 401, 35000, 'CT001', '신용', '음식점', TO_DATE('2024-03-01','YYYY-MM-DD'), '맥도날드', '02-1111-1111');
INSERT INTO card_transaction VALUES (902, 402, 80000, 'CT002', '체크', '마트', TO_DATE('2024-03-02','YYYY-MM-DD'), '롯데마트', '02-2222-2222');
INSERT INTO card_transaction VALUES (903, 403, 150000, 'CT003', '신용', '쇼핑', TO_DATE('2024-03-03','YYYY-MM-DD'), '무신사', '02-3333-3333');
INSERT INTO card_transaction VALUES (904, 404, 500000, 'CT004', '신용', '여행', TO_DATE('2024-03-04','YYYY-MM-DD'), '대한항공', '02-4444-4444');
INSERT INTO card_transaction VALUES (905, 405, 12000, 'CT005', '체크', '편의점', TO_DATE('2024-03-05','YYYY-MM-DD'), 'GS25', '02-5555-5555');

CREATE SEQUENCE user_seq
START WITH 6
INCREMENT BY 1
NOCACHE;

CREATE SEQUENCE acc_trns_seq
START WITH 1006 -- 임시 값.
INCREMENT BY 1
NOCACHE;

-- 신규 계좌 PK 시퀀스
CREATE SEQUENCE user_account_id_seq
START WITH 307 
INCREMENT BY 1 
NOCACHE;

commit;

SELECT * FROM users;
SELECT * FROM bank_product;
SELECT * FROM card_product;
SELECT * FROM user_account;
SELECT * FROM user_card;
SELECT * FROM account_transaction;
SELECT * FROM admin;
SELECT * FROM card_transaction;
SELECT * FROM industry_codes;
SELECT * FROM gender_stats;
SELECT * FROM age_stats;
SELECT * FROM micro_payment_stats;
SELECT * FROM region_stats;