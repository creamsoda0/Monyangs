package com.sboot.moabayo.vo;

import lombok.Data;

@Data
public class UserVO {
	private long userId;
	private String createDate;
	private String accountNum;
	private String address;
	private String addressDetail; // 수정
	private String zipCode;       // 수정
	private String autoLogin;
	private String email;
	private String name;
	private String hashCode;
	private String mydataAccessToken;
	private String loginId;       // 수정
	private String password;
	private String phone;
	private String refreshToken;
	private String simplePassword;
	private String isAdmin;
//	private String gender;
//	private String birthDate;
}
