package com.sboot.moabayo.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttribute;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.sboot.moabayo.dao.AccountMapper;
import com.sboot.moabayo.service.*;
import com.sboot.moabayo.vo.AccountApplyForm;
import com.sboot.moabayo.vo.AccountApplyRequest;
import com.sboot.moabayo.vo.AccountApplyResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/register")
public class BankRegisterController {

    private final AccountApplyServiceImpl accountApplyServiceImpl;

    private final BankService bankService;
    private final BankProductService bankProductService;
    private final AccountMapper accountMapper;
    private final AccountApplyService accountApplyService;
	
    @GetMapping("/product")
    public String productDetail(@RequestParam Integer id, Model model) {
        // id로 조회…
    	model.addAttribute("bpDetail", bankProductService.getById(id));
	
		/*
		 * System.out.println(id); System.out.println(bankProductService.getById(id));
		 */
		

        return "bpdetail";
    }
    
    @GetMapping("/apply")
    public String startApply(@RequestParam("productId") Integer productId, HttpServletRequest request,
    		HttpSession Session,
			/*
			 * @RequestParam(required=false) Long amount,
			 * 
			 * @RequestParam(required=false) Integer termMonths,
			 * 
			 * @RequestParam(required=false) BigDecimal taxRate,
			 */
                             Model model) {
    	
    	
        // productId로 bank_product 조회 → 모델 세팅
        // amount/termMonths/taxRate 있으면 초기값으로 바인딩

    	String loginId = (String) Session.getAttribute("loginId");
    	model.addAttribute("account", bankService.getUser(loginId));
    	model.addAttribute("bpDetail", bankProductService.getById(productId));
    	model.addAttribute("loginId", loginId);
        return "bpregister"; // 가입 위저드 뷰
    }
    
    // 계좌 목록(드롭다운)
    @ResponseBody
    @GetMapping("/api/accounts")
    public List<Map<String,Object>> myAccounts(
    		HttpServletRequest req, 
    		HttpSession session
    		){
    	Long userId = currentUserId(session);
    	return accountMapper.findSimpleAccountsByUserId(userId);
    }
    
    // 가입 신청
    @ResponseBody
    @PostMapping(value="/api/apply", consumes=MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<Void> apply(
    		@ModelAttribute AccountApplyForm form, 
    		HttpSession session,
    		RedirectAttributes ra
    		){
      Long userId = currentUserId(session);
      var req = new AccountApplyRequest(
    	        form.getProduct_id(),
    	        form.getProduct_type(),
    	        form.getFunding_user_account_id(),
    	        form.isOpenNew(),
    	        form.getAmount(),
    	        form.getTerm_months(),
    	        form.getTax_rate(),
    	        form.getAutopay_day(),
    	        form.getMaturity_option(),
    	        form.getSelected_bonuses().stream()
    	            .map(b -> new AccountApplyRequest.Bonus(b.getLabel(), b.getBp()))
    	            .collect(Collectors.toList()),
    	        new AccountApplyRequest.Consents(
    	            form.getConsents().isTerms(),
    	            form.getConsents().isPrivacy(),
    	            form.getConsents().isMarketing()
    	        )
    	    );
      System.out.println("[BankRegisterController] form.getProduct_id(): " + form.getProduct_id());
      System.out.println("[BankRegisterController] form.getProduct_type(): " + form.getProduct_type());
      System.out.println("[BankRegisterController] form.getFunding_user_account_id(): " + form.getFunding_user_account_id());
      System.out.println("[BankRegisterController] form.isOpenNew(): " + form.isOpenNew());
      System.out.println("[BankRegisterController] form.getAmount(): " + form.getAmount());
      System.out.println("[BankRegisterController] form.getTerm_months(): " + form.getTerm_months());
      System.out.println("[BankRegisterController] form.getTax_rate(): " + form.getTax_rate());
      System.out.println("[BankRegisterController] form.getAutopay_day(): " + form.getAutopay_day());
      System.out.println("[BankRegisterController] form.getMaturity_option(): " + form.getMaturity_option());
      System.out.println("[BankRegisterController] form.getSelected_bonuses().stream(): " + form.getSelected_bonuses().stream().map(b -> new AccountApplyRequest.Bonus(b.getLabel(), b.getBp()))
	            .collect(Collectors.toList()));
      System.out.println("[BankRegisterController] form.getConsents().isTerms(): " + form.getConsents().isTerms());
      System.out.println("[BankRegisterController] form.getConsents().isPrivacy(): " + form.getConsents().isPrivacy());
      System.out.println("[BankRegisterController] form.getConsents().isMarketing(): " + form.getConsents().isMarketing());
      
      AccountApplyResponse res = accountApplyService.apply(userId, req);

      // 성공 메시지와 결과 전달
      ra.addFlashAttribute("applyOk", true);
      ra.addFlashAttribute("newAccountNumber", res.account_number());
      ra.addFlashAttribute("newAccountName",   res.account_name());
      ra.addFlashAttribute("balanceAfterOpen", res.balance_after_open());

      // 성공 페이지로 전환(원하는 경로로 변경 가능)
      return ResponseEntity
    	        .status(HttpStatus.SEE_OTHER)          // 303
    	        .header(HttpHeaders.LOCATION, "/bank/account/list")
    	        .build();
    }

    // Session 에서 userId 가져오기
    private Long currentUserId(HttpSession session){
      Object v = session.getAttribute("userId");
      if (v instanceof Number n) return n.longValue();
      throw new SecurityException("NO_SESSION_USER");
    }
    
}
