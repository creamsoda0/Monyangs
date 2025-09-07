package com.sboot.moabayo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.sboot.moabayo.csv.CsvReader;
import com.sboot.moabayo.vo.AgeGenderVO;
import com.sboot.moabayo.vo.RegionVO;
import com.sboot.moabayo.vo.TimeVO;

@Controller
@RequestMapping("/csv")
public class CsvController {

  @Autowired private CsvReader csvReader;

  @GetMapping("/age")    @ResponseBody
  public List<AgeGenderVO> getAgeGender() throws Exception { return csvReader.readAgeGender(); }

  @GetMapping("/region") @ResponseBody
  public List<RegionVO> getRegion() throws Exception { return csvReader.readRegion(); }

  @GetMapping("/time")   @ResponseBody
  public List<TimeVO> getTime() throws Exception { return csvReader.readTime(); }

  @GetMapping("/segments/view")
  public String view(Model model) {
    model.addAttribute("title", "세그먼트 분석");
    return "segments/analytics";   // ← 앞에 / 붙이지 않기
  }
}





