--삭제문
DROP TABLE industry_codes CASCADE CONSTRAINTS;
DROP TABLE gender_stats CASCADE CONSTRAINTS;
DROP TABLE age_stats CASCADE CONSTRAINTS;
DROP TABLE micro_payment_stats CASCADE CONSTRAINTS;
DROP TABLE region_stats CASCADE CONSTRAINTS;

-- 1. 업종코드 (참조 테이블)
CREATE TABLE industry_codes (
    upjong_code VARCHAR2(20) PRIMARY KEY,                         -- 업종 코드
    upjong VARCHAR2(100)                                          -- 업종 대분류
);

-- 2. 성별 통계
CREATE TABLE gender_stats (
    id NUMBER PRIMARY KEY,
    upjong_code VARCHAR2(20),
    yearmonth DATE,                                      -- 기준 년월 (1일 고정)
    gender VARCHAR2(10),
    card_total NUMBER,
    CONSTRAINT fk_gender_upjong FOREIGN KEY (upjong_code) REFERENCES industry_codes(upjong_code)
);

-- 3. 연령 통계
CREATE TABLE age_stats (
    id NUMBER PRIMARY KEY,
    upjong_code VARCHAR2(20),
    yearmonth DATE,                                      -- 기준 년월 (1일 고정)
    age_group VARCHAR2(20),
    card_total NUMBER,
    CONSTRAINT fk_age_upjong FOREIGN KEY (upjong_code) REFERENCES industry_codes(upjong_code)
);

-- 4. 시간대별 소액결제 통계
CREATE TABLE micro_payment_stats (
    id NUMBER PRIMARY KEY,
    upjong_code VARCHAR2(20),
    yearmonth DATE,                                      -- 기준 년월 (1일 고정)
    time_slot VARCHAR2(20),
    card_total NUMBER,
    CONSTRAINT fk_micro_upjong FOREIGN KEY (upjong_code) REFERENCES industry_codes(upjong_code)
);

-- 5. 지역별 통계
CREATE TABLE region_stats (
    id NUMBER PRIMARY KEY,
    upjong_code VARCHAR2(20),
    sido VARCHAR2(20),
    sigungu VARCHAR2(20),
    upjong VARCHAR2(50),
    yearmonthdate DATE,                                     -- 기준 일자
    total_address_code VARCHAR2(20),
    card_total NUMBER,
    CONSTRAINT fk_region_upjong FOREIGN KEY (upjong_code) REFERENCES industry_codes(upjong_code)
);

commit;

select * from industry_codes;
select * from gender_stats;
select * from age_stats;
select * from micro_payment_stats;
select * from region_stats;

SELECT
    s.sid,
    s.serial#,
    s.username,
    l.locked_mode,
    o.object_name,
    o.object_type
FROM
    v$locked_object l
JOIN
    dba_objects o ON l.object_id = o.object_id
JOIN
    v$session s ON l.session_id = s.sid
WHERE
    o.object_name = 'AGE_UPJONG_SUMMARY';
    
ALTER SYSTEM KILL SESSION '128,49237' IMMEDIATE;