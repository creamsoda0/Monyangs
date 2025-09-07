package com.sboot.moabayo.aspect;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// 새로운 Annotation Type 을 정의
// @AccountTxLogged(Type= ?) 으로 사용할 수 있음
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AccountTxLogged {
 String type(); // "DEPOSIT" | "WITHDRAW"
}