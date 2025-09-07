package com.sboot.moabayo.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttribute;

import com.sboot.moabayo.feign.UserDataFeignClient;
import com.sboot.moabayo.jwt.BankJwtGenerate;
import com.sboot.moabayo.service.AccountBalanceService;
import com.sboot.moabayo.service.AccountService;
import com.sboot.moabayo.service.BankProductService;
import com.sboot.moabayo.service.BankService;
import com.sboot.moabayo.service.KakaoApproveResponse;
import com.sboot.moabayo.service.KakaoPayService;
import com.sboot.moabayo.service.KakaoReadyResponse;
import com.sboot.moabayo.service.TransactionService;
import com.sboot.moabayo.vo.AccountVO;
import com.sboot.moabayo.vo.PwCheckRequest;
import com.sboot.moabayo.vo.PwCheckResponse;
import com.sboot.moabayo.vo.TransferRequest;
import com.sboot.moabayo.vo.TransferResponse;
import com.sboot.moabayo.vo.TxnRowVO;
import com.sboot.moabayo.vo.UserVO;

import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

//import com.sboot.moabayo.service.ProductService;
//import com.sboot.moabayo.vo.CardProductVO;

@Controller
@RequiredArgsConstructor
@RequestMapping("/bank")
public class BankController {

    // //////////////// 시작 \\\\\\\\\\\\\\\
    
    // \\\\\\\\\\\\\\\\ 종료 ///////////////
	
    private final BankService bankService;
    private final BankProductService bankProductService;
    private final AccountService accountService;
    private final AccountBalanceService accBalServ;
    private final TransactionService transactionService;
    private final KakaoPayService kakaoPayService;   // ✅ 추가
	
    @GetMapping("/verify")
    public String handleToken(HttpServletRequest request, HttpSession session) {
        try {
            // 1) 토큰 가져오기: Authorization 헤더 우선, 없으면 쿠키(ACCESS_TOKEN)
            String auth = request.getHeader("Authorization");
            String token = null;

            if (auth != null && auth.startsWith("Bearer ")) {
                token = auth.substring(7).trim();
            } else if (request.getCookies() != null) {
                for (Cookie c : request.getCookies()) {
                    if ("ACCESS_TOKEN".equals(c.getName())) {
                        token = c.getValue();
                        break;
                    }
                }
            }

            if (token == null || token.isBlank()) {
                // 토큰이 전혀 없으면 로그인 페이지로
                return "redirect:/loginpage";
            }

            // 2) 토큰 검증 (기존 로직 그대로 유지)
            String loginId = Jwts.parserBuilder()
                    .setSigningKey(BankJwtGenerate.getKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();

            UserVO user = bankService.getUser(loginId);
            if (user == null) {
                return "redirect:/loginpage";
            }

            // 3) 세션에 보관 (기존과 동일)
            session.setAttribute("token", token);
            session.setAttribute("loginId", loginId);
            session.setAttribute("userId", user.getUserId());

            // 4) URL에서 토큰 제거된 상태로 진입
            return "redirect:/bank/index";
        } catch (Exception e) {
            System.err.println(e);
            return "redirect:/error";
        }
    }

	
	@GetMapping("/index")
	public String showBankIndex(
            @SessionAttribute(name = "token",   required = false) String token,
            @SessionAttribute(name = "loginId", required = false) String loginId,
            @SessionAttribute(name = "userId",  required = false) Object userIdObj, // 세션 타입 안전 처리
			Model model) {
        // //////////////// 뱅크 메인 페이지 DB 연결 부분 시작 \\\\\\\\\\\\\\\
        // 세션 체크
        if (userIdObj == null || loginId == null) {
            return "redirect:/loginpage";
        }

        // userId를 Long으로 안전 변환 (세션에 String/Integer/Long 어떤 형태로든 대비)
        Long userId;
        if (userIdObj instanceof Long) {
            userId = (Long) userIdObj;
        } else if (userIdObj instanceof Integer) {
            userId = ((Integer) userIdObj).longValue();
        } else {
            userId = Long.valueOf(userIdObj.toString()); // "123" 형태 처리
        }

        System.out.println("세션 토큰: " + token);
        System.out.println("loginId: " + loginId);
        System.out.println("userId: " + userId);

        model.addAttribute("loginId", loginId);

        AccountVO nyang = bankService.getNyangcoinAccount(userId);
        
        model.addAttribute("nyang", nyang);                 // null = 미보유
        model.addAttribute("hasNyang", nyang != null);
        
        
        // \\\\\\\\\\\\\\\\ 뱅크 메인 페이지 DB 연결 부분 종료 ///////////////
		return "/index";
	}
	
	@GetMapping("/account/list")
	public String showAccountList(HttpSession session, Model model) {
		String loginId = (String) session.getAttribute("loginId");
		model.addAttribute("loginId", loginId);
		Long userId = (Long) session.getAttribute("userId");
		
		List<AccountVO> acclist = accountService.getUserAccountsWithHistory(userId);
		System.out.println("acclist: " + acclist.toString());
		
		model.addAttribute("acclist", acclist);
		
		
	    return "account-list"; // accountList.html 렌더링
	}
	
	@GetMapping("/recommend")
	public String recommendAccounts(Model model) {
//	    List<CardProductVO> cardList = service.getRecommendCards(); // 카드 리스트 조회
//	    model.addAttribute("cardList", cardList);
	    return "/recommend"; // cardList.html 렌더링
	}
	
	@GetMapping("/product/list")
	public String bankProduct(Model model) {
		model.addAttribute("products", bankProductService.findAll());

	    return "/bankProductList"; // cardList.html 렌더링
	}
	
	@GetMapping("/history")
	public String bankhistory(HttpSession session, Model model) {
	    Long userId = (Long) session.getAttribute("userId");
	    List<TxnRowVO> txnlist = transactionService.search(userId);
	    System.out.println(txnlist.toString());
	    model.addAttribute("txnlist", txnlist);
		
		return "/transactions";
	}
	//카카오 금액입력란으로 가는 메소드입니다.
	@GetMapping("/charge")
	public String coincharge(HttpSession session, Model model) {
		return "/coin/coin-charge";
	}
    /** 금액 입력 → 진행 화면 */
    @PostMapping("/ready")
    public String coinpay(@RequestParam int amount, Model model) {
    	System.out.println("/ready amount: " + amount);
        model.addAttribute("amount", amount); // 진행 카드에 현재 금액 보여주기
        return "/coin/coin-pay";
    }

    /**
     * 진행 화면에서 호출하는 Ready API
     * - x-www-form-urlencoded 로 amount 를 받음
     * - 카카오 ready 호출(또는 스텁) 후 redirectUrl, tid 반환
     */
    @PostMapping(value = "/ready-api",
                 consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE,
                 produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> readyApi(@RequestParam int amount, 
    									HttpSession session,
    									HttpServletRequest req) {
        // 현재 도메인 기준 success/cancel/fail URL 생성
        String base = baseUrl(req); // ex) http://localhost:8813
        String success = base + "/bank/kakao/success";
        String cancel  = base + "/bank/kakao/cancel";
        String fail    = base + "/bank/kakao/fail";

        KakaoReadyResponse ready = kakaoPayService.ready(amount, success, cancel, fail);

        Map<String, Object> resp = new HashMap<>();
        resp.put("redirectUrl", ready.getNextRedirectPcUrl());
        resp.put("tid", ready.getTid());
        session.setAttribute("paid_amount", amount); // 클라이언트에서 사용하기 위해 반환
        System.out.println("/ready-api amount: " + amount);
        return resp;
    }

    /** 카카오 성공 redirect → Approve → 완료 페이지 */
    @GetMapping("/kakao/success")
    public String kakaoSuccess(@RequestParam("pg_token") String pgToken,
                               @RequestParam(value = "tid", required = false) String tidFromQuery, // 일부 환경용
                               HttpSession session,
                               HttpServletRequest req) {
    	
    	
    	Long amount = (Long) session.getAttribute("paid_amount");
        KakaoApproveResponse approve = kakaoPayService.approve(amount, pgToken, tidFromQuery);

        // 승인 성공 → 완료 페이지로
        System.out.println("approve.getAmount(): " + approve.getAmount());
        System.out.println("getAmount().getTotal(): " + approve.getAmount().getTotal());
        
        // 백엔드 개발 필요 - 업데이트 유저 어카운트 & 어카운트 트랜잭션 로그 추가해야함
        Long userId = (Long) session.getAttribute("userId");
        AccountVO avo = bankService.getNyangcoinAccount(userId);
        accBalServ.updateBalancePlus(avo.getId(), amount);
        // 로그 추가
        bankService.insertAccountTransactionLog(
        		userId,
        		100L,
        		amount,
        		"approvedNum",
        		"DEPOSIT",
        		"예금",
        		"모으냥즈",
        		"111-111-111",
        		"모으냥즈 뱅크 예금"
        		);
        
        
        // 완료 페이지로 리다이렉트 (쿼리 간결히)
        String url = String.format("/bank/complete?status=success&amount=%s&tid=%s",
                amount != null ? amount : "",
                approve != null ? encode(approve.getTid()) : "");
        return "redirect:" + url;
    }

    /** 결제창에서 취소 */
    @GetMapping("/kakao/cancel")
    public String kakaoCancel(@RequestParam(value = "tid", required = false) String tid) {
        return "redirect:/bank/complete?status=cancel" + (tid != null ? "&tid=" + encode(tid) : "");
    }

    /** 실패(에러 포함) */
    @GetMapping("/kakao/fail")
    public String kakaoFail(@RequestParam(value = "message", required = false) String message,
                            @RequestParam(value = "tid", required = false) String tid) {
        String url = "/bank/complete?status=fail";
        if (message != null) url += "&errorMessage=" + encode(message);
        if (tid != null) url += "&tid=" + encode(tid);
        return "redirect:" + url;
    }

    @GetMapping("/complete")
    public String complete(@RequestParam(required = false) String status,
                           @RequestParam(required = false) String amount,
                           @RequestParam(required = false) String tid,
                           @RequestParam(required = false, name="errorMessage") String errorMessage,
                           HttpSession session,
                           Model model) {

        int amountInt = 0;
        try {
            if (amount != null) amountInt = Integer.parseInt(amount.replaceAll("[^0-9]", ""));
        } catch (Exception ignore) {}

        Long userId = (Long) session.getAttribute("userId");
        Long balanceAfter = null;
        if (userId != null) {
            var nyang = bankService.getNyangcoinAccount(userId);
            if (nyang != null) balanceAfter = nyang.getBalance(); // 타입 맞게
        }

        model.addAttribute("status", (status == null) ? "fail" : status);
        model.addAttribute("amount", amountInt);
        model.addAttribute("tid", (tid == null) ? "" : tid);
        model.addAttribute("approvedAt", LocalDateTime.now());
        model.addAttribute("errorMessage", (errorMessage == null) ? "" : errorMessage);
        model.addAttribute("balanceAfter", balanceAfter);

        return "coin/coin-complete";
    }



    // ───────── helpers ─────────
    private static String baseUrl(HttpServletRequest req) {
        String scheme = req.getScheme(); // http/https
        String host   = req.getServerName();
        int port      = req.getServerPort();
        String p = (("http".equals(scheme) && port==80) || ("https".equals(scheme) && port==443))
                ? "" : ":" + port;
        return scheme + "://" + host + p;
    }
    private static String encode(String s){
        try { return java.net.URLEncoder.encode(s, java.nio.charset.StandardCharsets.UTF_8); }
        catch(Exception e){ return s; }
    }
    @GetMapping("/transfer")
    public String gotransfer (HttpSession session, Model model) {
    	Long userId = (Long) session.getAttribute("userId");
    	List<AccountVO> acclist = accountService.getAccountsByUserId(userId);
    	model.addAttribute("acclist", acclist);
    	
    	return "/transfer/transfer";
    }
    
    // ───────── 계좌로 유저 찾기 ─────────
    // 계좌번호(account_number) 는 Unique 값이니까 유저를 찾을 수 있음
    @GetMapping("/api/user")
    public ResponseEntity<UserVO> getUserByAccountNumber(@RequestParam String query) {
    	UserVO user = accountService.getUserByAccountNumber(query);
    	
    	return ResponseEntity.ok(user);
    }
    
    @PostMapping(
    		  value = "/api/transfer",
    		  consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    		)
	public ResponseEntity<?> dotransfer(@ModelAttribute TransferRequest req,
            							HttpSession session) {
    	System.out.println("-----------dotransfer 시작-----------");
    	System.out.println("@ModelAttribute raw String: " + req.getToAccountNumber());
    	System.out.println("req.getFromAccountNumber = " + req.getFromAccountNumber());
    	System.out.println("req.getSendAmount = " + req.getSendAmount());
    	System.out.println("req.getMemo = " + req.getMemo());

        if (req.getSendAmount() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "invalid params"));
        }
        // 1) 로그인 사용자 확인 (세션/보안컨텍스트 방식에 맞게 수정)
        String loginId = (String) session.getAttribute("loginId");
        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }
        UserVO sender = bankService.getUser(loginId);
        if (sender == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "사용자를 찾을 수 없습니다."));
        }

        // 2) 요청 검증
        System.out.println("req.getAmount: " + req.getSendAmount());
        if (req.getSendAmount() <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "유효한 금액이 아닙니다."));
        }
        if (req.getToAccountNumber() == null || req.getToAccountNumber().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "수취 계좌번호를 입력해주세요."));
        }

        // 3) 수취인 조회 (계좌번호 -> 사용자)
        UserVO receiver = accountService.getUserByAccountNumber(req.getToAccountNumber());
        if (receiver == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "수취 계좌를 찾을 수 없습니다."));
        }

        // 4) 실제 이체 수행 (서비스 @Transactional 내부에서 minus -> plus 순서)
        try {
            // 승인번호 서버에서 생성(형식은 프로젝트 맞게)
            String approvedNum = "TX-" + System.currentTimeMillis();
            System.out.println("sender: " + sender.getUserId() + "(" + req.getFromAccountNumber() +  ")");
            System.out.println("receiver: " + receiver.getUserId() + "(" + req.getToAccountNumber() +  ")");
            System.out.println("req.getSendAmount: " + req.getSendAmount());
            System.out.println("approvedNum: " + approvedNum);
            System.out.println("req.getMemo: " + req.getMemo());
            bankService.transfer(
                sender.getUserId(),
                req.getFromAccountNumber(),
                receiver.getUserId(),
                req.getToAccountNumber(),
                req.getSendAmount(),
                approvedNum,
                req.getMemo()
            );

            return ResponseEntity.ok(
                new TransferResponse(true, approvedNum, receiver.getName())
            );

        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
        	System.out.println("error e: " + e);
        	System.out.println("error message: " + e.getMessage());
        	System.out.println("error Cause: " + e.getCause());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "시스템 오류가 발생했습니다."));
        }
    }

    

    
    // feign client
    private final UserDataFeignClient udFeignClient;
    // 프런트 바디용 Record
    public static class VerifyPwRequest {
    	private String password;
    	public String getPassword() {return password;}
    	public void setPassword(String password) { this.password = password; }
    }
    
    @PostMapping(value = "/pwcheck",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
            )
    public ResponseEntity<Map<String,Object>> verifyPassword(
    		@SessionAttribute(name = "loginId", required = true) String loginId,
    		@ModelAttribute VerifyPwRequest req,
            HttpServletRequest request
    ) {
        // 1) LoginService에 위임
    	System.out.println("[BankController.verifyPassword] 세션에 있던 loginId: " + loginId);
    	System.out.println("[BankController.verifyPassword] 백엔드로 들어온 패스워드: " + req.getPassword());
        PwCheckResponse res = udFeignClient.pwcheck(new PwCheckRequest(loginId, req.getPassword()));

        // 2) 프런트 규격에 맞게 단순화해서 응답
        return ResponseEntity.ok(Map.of("ok", res.ok()));
    }
    
}
