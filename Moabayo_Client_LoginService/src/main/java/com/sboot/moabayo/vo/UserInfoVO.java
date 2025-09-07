package com.sboot.moabayo.vo;

import lombok.Data;

@Data
public class UserInfoVO {

	private String id;
	private Long userId;
	private String name;
	private String role;

	public UserInfoVO(Long userId, String id, String name, String role) {
		this.id = id;
		this.name = name;
		this.role = role;
		this.userId = userId;
	}

	public UserInfoVO() {
	}
}
