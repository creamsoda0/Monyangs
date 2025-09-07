package com.sboot.moabayo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

  // /admin 및 그 하위 모든 경로 -> index.html 로 포워드
  @GetMapping({"/admin", "/admin/**"})
  public String forwardAdmin() {
    return "forward:/index.html";
  }
}
