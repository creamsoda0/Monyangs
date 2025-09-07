--삭제문
DROP TABLE account_transaction CASCADE CONSTRAINTS;
DROP TABLE region_stats CASCADE CONSTRAINTS;
DROP TABLE micro_payment_stats CASCADE CONSTRAINTS;
DROP TABLE age_stats CASCADE CONSTRAINTS;
DROP TABLE gender_stats CASCADE CONSTRAINTS;
DROP TABLE industry_codes CASCADE CONSTRAINTS;
DROP TABLE user_card CASCADE CONSTRAINTS;
DROP TABLE user_account CASCADE CONSTRAINTS;
DROP TABLE admin CASCADE CONSTRAINTS;
DROP TABLE coin_history CASCADE CONSTRAINTS;
DROP TABLE card_transaction CASCADE CONSTRAINTS;
DROP TABLE nyang_coin CASCADE CONSTRAINTS;
DROP TABLE card_product CASCADE CONSTRAINTS;
DROP TABLE bank_product CASCADE CONSTRAINTS;
DROP TABLE users CASCADE CONSTRAINTS;

--생성문
-- 1. users (최상위 부모 테이블)
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
    is_admin NUMBER(1,0)
);

-- 2. bank_product
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

-- 3. card_product
CREATE TABLE card_product (
    card_id NUMBER(8,0) PRIMARY KEY,
    img VARCHAR2(255),
    name VARCHAR2(100) NOT NULL,
    brand VARCHAR2(50),
    description VARCHAR2(1000),
    category VARCHAR2(100),
    benefits VARCHAR2(1000),
    interest NUMBER(5,2),
    type VARCHAR2(50)
);

-- 4. nyang_coin (users 참조)
CREATE TABLE nyang_coin (
    nyang_id NUMBER(20,0) PRIMARY KEY,
    create_date DATE,
    money NUMBER(20,2),
    user_id NUMBER(20,0),
    CONSTRAINT fk_nyang_coin_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 5. card_transaction (users, card_product 참조)
CREATE TABLE card_transaction (
    card_transaction_id NUMBER(20,0) PRIMARY KEY,
    approved_amount NUMBER(20,2),
    approved_num VARCHAR2(255),
    card_history_id NUMBER(20,0),
    card_id NUMBER(20,0),
    card_type VARCHAR2(255),
    category VARCHAR2(255),
    date_time DATE,
    shop_name VARCHAR2(255),
    shop_number VARCHAR2(255),
    user_id NUMBER(20,0),
    CONSTRAINT fk_card_transaction_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_card_transaction_card_product FOREIGN KEY (card_id) REFERENCES card_product(card_id)
);

-- 6. coin_history (nyang_coin 참조)
CREATE TABLE coin_history (
    history_id NUMBER(20,0) PRIMARY KEY,
    create_date DATE,
    total_amt NUMBER(20,2),
    trans_amt NUMBER(20,2),
    trans_type VARCHAR2(255),
    nyang_id NUMBER(20,0),
    CONSTRAINT fk_coin_history_nyang_coin FOREIGN KEY (nyang_id) REFERENCES nyang_coin(nyang_id)
);

-- 7. admin (users 참조)
CREATE TABLE admin (
    admin_id NUMBER(20,0) PRIMARY KEY,
    user_id NUMBER(20,0),
    role VARCHAR2(50),
    create_date DATE,
    CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE UNIQUE INDEX admin_user_id_unique ON admin(user_id);

-- 8. user_account (users, bank_product 참조)
CREATE TABLE user_account (
    user_account_id NUMBER(8,0) PRIMARY KEY,
    user_id NUMBER(8,0) NOT NULL,
    account_id NUMBER(8,0) NOT NULL,
    account_number VARCHAR2(30) NOT NULL UNIQUE,
    account_name VARCHAR2(100),
    CONSTRAINT fk_user_account_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_user_account_bank_product FOREIGN KEY (account_id) REFERENCES bank_product(account_id)
);

-- 9. user_card (users, card_product 참조)
CREATE TABLE user_card (
    user_card_id NUMBER(8,0) PRIMARY KEY,
    user_id NUMBER(8,0) NOT NULL,
    card_id NUMBER(8,0) NOT NULL,
    CONSTRAINT fk_user_card_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_user_card_card_product FOREIGN KEY (card_id) REFERENCES card_product(card_id)
);

-- 10. industry_codes
CREATE TABLE industry_codes (
    upjong_code VARCHAR2(20) PRIMARY KEY,
    upjong VARCHAR2(100)
);

-- 11. gender_stats (industry_codes 참조)
CREATE TABLE gender_stats (
    gender_stats_id NUMBER(8,0) PRIMARY KEY,
    upjong_code VARCHAR2(20),
    yearmonth DATE,
    gender VARCHAR2(10),
    card_total NUMBER(8,2),
    CONSTRAINT fk_gender_stats_industry_codes FOREIGN KEY (upjong_code) REFERENCES industry_codes(upjong_code)
);

-- 12. age_stats (industry_codes 참조)
CREATE TABLE age_stats (
    age_stats_id NUMBER(8,0) PRIMARY KEY,
    upjong_code VARCHAR2(20),
    yearmonth DATE,
    age_group VARCHAR2(20),
    card_total NUMBER(8,2),
    CONSTRAINT fk_age_stats_industry_codes FOREIGN KEY (upjong_code) REFERENCES industry_codes(upjong_code)
);

-- 13. micro_payment_stats (industry_codes 참조)
CREATE TABLE micro_payment_stats (
    payments_stats_id NUMBER(8,0) PRIMARY KEY,
    upjong_code VARCHAR2(20),
    yearmonth DATE,
    time_slot VARCHAR2(20),
    card_total NUMBER(8,2),
    CONSTRAINT fk_micro_payment_stats_industry_codes FOREIGN KEY (upjong_code) REFERENCES industry_codes(upjong_code)
);

-- 14. region_stats (industry_codes 참조)
CREATE TABLE region_stats (
    region_stats_id NUMBER(8,0) PRIMARY KEY,
    upjong_code VARCHAR2(20),
    sido VARCHAR2(20),
    sigungu VARCHAR2(20),
    upjong VARCHAR2(50),
    yearmonthdate DATE,
    total_address_code VARCHAR2(20),
    card_total NUMBER(8,2),
    CONSTRAINT fk_region_stats_industry_codes FOREIGN KEY (upjong_code) REFERENCES industry_codes(upjong_code)
);

-- 15. account_transaction (users, bank_product 참조)
CREATE TABLE account_transaction (
    account_transaction_id NUMBER(20,0) PRIMARY KEY,
    approved_amount NUMBER(20,2),
    approved_num VARCHAR2(255),
    account_history_id NUMBER(20,0),
    account_id NUMBER(20,0),
    account_type VARCHAR2(255),
    category VARCHAR2(255),
    date_time DATE,
    shop_name VARCHAR2(255),
    shop_number VARCHAR2(255),
    user_id NUMBER(20,0),
    CONSTRAINT fk_account_transaction_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_account_transaction_bank_product FOREIGN KEY (account_id) REFERENCES bank_product(account_id)
);

--더미 데이터
--users
INSERT INTO users (user_id, create_date, account_num, address, address_detail, zip_code, email, name, login_id, password, phone, refresh_token, simple_password, is_admin) VALUES
(1, TO_DATE('2025-08-01','YYYY-MM-DD'), 'ACC123', 'Seoul', 'Gangnam-gu', '06130', 'user1@example.com', 'Kim Minsoo', 'minsoo1', 'pass123', '010-1234-5678', 'token1', 'simple1', 0);
INSERT INTO users VALUES
(2, TO_DATE('2025-08-02','YYYY-MM-DD'), 'ACC124', 'Busan', 'Haeundae-gu', '48095', 'user2@example.com', 'Lee Jihye', 'jihye2', 'pass234', '010-2345-6789', 'token2', 'simple2', 0);
INSERT INTO users VALUES
(3, TO_DATE('2025-08-03','YYYY-MM-DD'), 'ACC125', 'Incheon', 'Namdong-gu', '21625', 'user3@example.com', 'Park Daeho', 'daeho3', 'pass345', '010-3456-7890', 'token3', 'simple3', 1);
INSERT INTO users VALUES
(4, TO_DATE('2025-08-04','YYYY-MM-DD'), 'ACC126', 'Daegu', 'Suseong-gu', '42088', 'user4@example.com', 'Choi Hana', 'hana4', 'pass456', '010-4567-8901', 'token4', 'simple4', 0);
INSERT INTO users VALUES
(5, TO_DATE('2025-08-05','YYYY-MM-DD'), 'ACC127', 'Daejeon', 'Yuseong-gu', '34055', 'user5@example.com', 'Jung Minjae', 'minjae5', 'pass567', '010-5678-9012', 'token5', 'simple5', 0);

--bank_product
INSERT INTO bank_product (account_id, name, img, description, category, benefits, interest, type) VALUES
(101, 'Standard Savings', NULL, 'Basic savings account', 'Savings', 'No fees', 1.2, 'Savings');
INSERT INTO bank_product VALUES
(102, 'Premium Checking', NULL, 'Premium checking account', 'Checking', 'Cashback benefits', 0.5, 'Checking');
INSERT INTO bank_product VALUES
(103, 'Youth Savings', NULL, 'Savings account for youth', 'Savings', 'High interest rate', 2.0, 'Savings');
INSERT INTO bank_product VALUES
(104, 'Business Checking', NULL, 'Account for small business', 'Checking', 'Business tools', 0.3, 'Checking');
INSERT INTO bank_product VALUES
(105, 'Fixed Deposit', NULL, 'Fixed deposit account', 'Deposit', 'Higher interest', 3.5, 'Deposit');

--card_product
INSERT INTO card_product (card_id, img, name, brand, description, category, benefits, interest, type) VALUES
(201, NULL, 'Visa Classic', 'Visa', 'Basic Visa card', 'Credit', 'Reward points', 1.5, 'Credit');
INSERT INTO card_product VALUES
(202, NULL, 'Master Gold', 'MasterCard', 'Gold credit card', 'Credit', 'Travel insurance', 2.0, 'Credit');
INSERT INTO card_product VALUES
(203, NULL, 'Amex Platinum', 'Amex', 'Platinum card', 'Credit', 'Airport lounge', 2.5, 'Credit');
INSERT INTO card_product VALUES
(204, NULL, 'Visa Debit', 'Visa', 'Debit card', 'Debit', 'No annual fee', 0.0, 'Debit');
INSERT INTO card_product VALUES
(205, NULL, 'Master Cashback', 'MasterCard', 'Cashback card', 'Credit', 'Cashback rewards', 1.8, 'Credit');

--nyang_coin
INSERT INTO nyang_coin (nyang_id, create_date, money, user_id) VALUES
(301, TO_DATE('2025-07-20','YYYY-MM-DD'), 1000, 1);
INSERT INTO nyang_coin VALUES
(302, TO_DATE('2025-07-21','YYYY-MM-DD'), 1500, 2);
INSERT INTO nyang_coin VALUES
(303, TO_DATE('2025-07-22','YYYY-MM-DD'), 500, 3);
INSERT INTO nyang_coin VALUES
(304, TO_DATE('2025-07-23','YYYY-MM-DD'), 2000, 4);
INSERT INTO nyang_coin VALUES
(305, TO_DATE('2025-07-24','YYYY-MM-DD'), 1200, 5);

--card_transaction
INSERT INTO card_transaction (card_transaction_id, approved_amount, approved_num, card_history_id, card_id, card_type, category, date_time, shop_name, shop_number, user_id) VALUES
(401, 120000, 'APR12345', 501, 201, 'Credit', 'Shopping', TO_DATE('2025-08-01 10:00','YYYY-MM-DD HH24:MI'), 'ABC Store', '010-0000-1111', 1);
INSERT INTO card_transaction VALUES
(402, 45000, 'APR12346', 502, 202, 'Credit', 'Dining', TO_DATE('2025-08-02 12:30','YYYY-MM-DD HH24:MI'), 'XYZ Restaurant', '010-0000-2222', 2);
INSERT INTO card_transaction VALUES
(403, 78000, 'APR12347', 503, 203, 'Credit', 'Travel', TO_DATE('2025-08-03 15:45','YYYY-MM-DD HH24:MI'), 'Travel Agency', '010-0000-3333', 3);
INSERT INTO card_transaction VALUES
(404, 23000, 'APR12348', 504, 204, 'Debit', 'Groceries', TO_DATE('2025-08-04 09:20','YYYY-MM-DD HH24:MI'), 'Supermarket', '010-0000-4444', 4);
INSERT INTO card_transaction VALUES
(405, 67000, 'APR12349', 505, 205, 'Credit', 'Entertainment', TO_DATE('2025-08-05 20:10','YYYY-MM-DD HH24:MI'), 'Cinema', '010-0000-5555', 5);

--coin_history
INSERT INTO coin_history (history_id, create_date, total_amt, trans_amt, trans_type, nyang_id) VALUES
(601, TO_DATE('2025-08-01','YYYY-MM-DD'), 10000, 500, 'Deposit', 301);
INSERT INTO coin_history VALUES
(602, TO_DATE('2025-08-02','YYYY-MM-DD'), 10500, 300, 'Withdrawal', 301);
INSERT INTO coin_history VALUES
(603, TO_DATE('2025-08-03','YYYY-MM-DD'), 15000, 1000, 'Deposit', 302);
INSERT INTO coin_history VALUES
(604, TO_DATE('2025-08-04','YYYY-MM-DD'), 5000, 200, 'Withdrawal', 303);
INSERT INTO coin_history VALUES
(605, TO_DATE('2025-08-05','YYYY-MM-DD'), 22000, 1200, 'Deposit', 304);

--admin
INSERT INTO admin (admin_id, user_id, role, create_date) VALUES
(701, 3, 'superadmin', TO_DATE('2025-01-01','YYYY-MM-DD'));
INSERT INTO admin VALUES
(702, 4, 'moderator', TO_DATE('2025-02-01','YYYY-MM-DD'));
INSERT INTO admin VALUES
(703, 5, 'manager', TO_DATE('2025-03-01','YYYY-MM-DD'));
INSERT INTO admin VALUES
(704, 1, 'support', TO_DATE('2025-04-01','YYYY-MM-DD'));
INSERT INTO admin VALUES
(705, 2, 'admin', TO_DATE('2025-05-01','YYYY-MM-DD'));

--user_account
INSERT INTO user_account (user_account_id, user_id, account_id, account_number, account_name) VALUES
(801, 1, 101, '111-222-333', 'Minsoo Account');
INSERT INTO user_account VALUES
(802, 2, 102, '222-333-444', 'Jihye Account');
INSERT INTO user_account VALUES
(803, 3, 103, '333-444-555', 'Daeho Account');
INSERT INTO user_account VALUES
(804, 4, 104, '444-555-666', 'Hana Account');
INSERT INTO user_account VALUES
(805, 5, 105, '555-666-777', 'Minjae Account');

--user_card
INSERT INTO user_card (user_card_id, user_id, card_id) VALUES
(901, 1, 201);
INSERT INTO user_card VALUES
(902, 2, 202);
INSERT INTO user_card VALUES
(903, 3, 203);
INSERT INTO user_card VALUES
(904, 4, 204);
INSERT INTO user_card VALUES
(905, 5, 205);

--account_transaction
INSERT INTO account_transaction (account_transaction_id, approved_amount, approved_num, account_history_id, account_id, account_type, category, date_time, shop_name, shop_number, user_id) VALUES
(1001, 500000, 'ACC56789', 1101, 101, 'Savings', 'Utilities', TO_DATE('2025-08-01 14:00','YYYY-MM-DD HH24:MI'), 'Electric Company', '02-1234-5678', 1);
INSERT INTO account_transaction VALUES
(1002, 150000, 'ACC56790', 1102, 102, 'Checking', 'Rent', TO_DATE('2025-08-02 09:30','YYYY-MM-DD HH24:MI'), 'Landlord', '02-2345-6789', 2);
INSERT INTO account_transaction VALUES
(1003, 200000, 'ACC56791', 1103, 103, 'Savings', 'Groceries', TO_DATE('2025-08-03 18:20','YYYY-MM-DD HH24:MI'), 'Supermarket', '02-3456-7890', 3);
INSERT INTO account_transaction VALUES
(1004, 75000, 'ACC56792', 1104, 104, 'Checking', 'Dining', TO_DATE('2025-08-04 12:10','YYYY-MM-DD HH24:MI'), 'Cafe', '02-4567-8901', 4);
INSERT INTO account_transaction VALUES
(1005, 300000, 'ACC56793', 1105, 105, 'Deposit', 'Investment', TO_DATE('2025-08-05 16:45','YYYY-MM-DD HH24:MI'), 'Investment Firm', '02-5678-9012', 5);

commit;

--조회문
SELECT * FROM users;
SELECT * FROM bank_product;
SELECT * FROM card_product;
SELECT * FROM nyang_coin;
SELECT * FROM card_transaction;
SELECT * FROM coin_history;
SELECT * FROM admin;
SELECT * FROM user_account;
SELECT * FROM user_card;
SELECT * FROM industry_codes;
SELECT * FROM gender_stats;
SELECT * FROM age_stats;
SELECT * FROM micro_payment_stats;
SELECT * FROM region_stats;
SELECT * FROM account_transaction;
