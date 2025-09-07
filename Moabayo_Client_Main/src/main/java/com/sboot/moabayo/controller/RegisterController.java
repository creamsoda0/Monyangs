package com.sboot.moabayo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.sboot.moabayo.service.RegisterService;
import com.sboot.moabayo.vo.UserVO;

@Controller
@RequestMapping("/registration")
public class RegisterController {

	@Autowired
    private RegisterService registerService;
	
	 @PostMapping("/register")
	    public String register(UserVO vo) {
		 BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		 String pw = vo.getPassword(); 
			String encodedPwd = encoder.encode(pw);
			vo.setPassword(encodedPwd);
			String id = vo.getLoginId();			
			System.out.println(encodedPwd);
		    registerService.register(vo);
	        return "redirect:/registration/welcome"; // 가입 성공 후 이동
	    }
	 
	    @ResponseBody
	    @GetMapping("/checkId")
	    public ResponseEntity<String> checkId(@RequestParam("loginId") String id) {
	        if (id == null || id.trim().length() < 4) {
	            return ResponseEntity.badRequest().body("invalid");
	        }
	        boolean exists = registerService.isLoginIdExists(id.trim());
	        return ResponseEntity.ok(exists ? "duplicate" : "ok");
	    }
	    
		@GetMapping("/welcome")
		public String welcomepage(Model model) {
			return "login/welcome";
		}

//	    @GetMapping("/check")
//	    public ResponseEntity<String> checkUserId(@RequestParam String userid) {
//	        boolean exists = registerService.isUserIdExists(userid);
//	        return exists ? ResponseEntity.ok("DUPLICATE") : ResponseEntity.ok("OK");
//	    }
}
