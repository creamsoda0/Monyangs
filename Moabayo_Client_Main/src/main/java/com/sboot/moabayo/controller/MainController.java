package com.sboot.moabayo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;



@Controller
public class MainController {

	
	
	@GetMapping("/mainpage")
	public String gomainpage() {
		return "main/mainpage";
	}

	@GetMapping("/loginpage")
	public String gologinpage(Model model) {
		return "login/login";
	}

	@GetMapping("/registerpage")
	public String goregisterpage(Model model) {
		return "login/register";
	}

	@GetMapping("/mypage")
	public String myPage() {
		return "mypage/mypage";
	}
	
	// __Cloudinary__ 페이지 접근
	@GetMapping("cloudinary")
	public String upload_image(Model model) {
		return "main/cloudinaryUploader";
	}
}
