package com.sboot.moabayo.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.sboot.moabayo.jwt.CardJwtGenerate;
import com.sboot.moabayo.service.CardProductService;
import com.sboot.moabayo.vo.CardProductVO;
import com.sboot.moabayo.vo.CardSummaryVO;

import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/usercard")
public class CardController {

	private final CardProductService service;

	public CardController(CardProductService service) {
		this.service = service;
	}

	@GetMapping("/cardList")
	public String showCardList(HttpServletRequest request, HttpSession session) {
	    try {
	        // 1) 토큰: Authorization 헤더 우선, 없으면 쿠키에서
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
	            return "redirect:/loginpage";
	        }

	        // 2) 토큰 검증 (기존 로직 유지: CardJwtGenerate 사용)
	        Jwts.parserBuilder()
	            .setSigningKey(CardJwtGenerate.getKey())
	            .build()
	            .parseClaimsJws(token);

	        // (선택) subject 등 꺼내서 세션/모델에 저장하고 싶다면:
	        // String loginId = Jwts.parserBuilder()
	        //         .setSigningKey(CardJwtGenerate.getKey())
	        //         .build()
	        //         .parseClaimsJws(token).getBody().getSubject();
	        // session.setAttribute("loginId", loginId);

	        // 3) 세션에 토큰 저장(필요시)
	        session.setAttribute("token", token);

	        // 4) URL 정리해서 페이지 진입
	        return "redirect:/usercard/toCardList";
	    } catch (Exception e) {
	        return "redirect:/error";
	    }
	}


	@GetMapping("/toCardList")
	public String toCardList(Model model) {
		CardSummaryVO summary = new CardSummaryVO();
		summary.setOwnedCount(5);
		summary.setTotalSpend(1234.56);
		summary.setExpectedReward(100);
		summary.setAlertsCount(1);
		summary.setDaysUntilBilling(10);

		model.addAttribute("summary", summary); // 꼭 이 부분이 있어야 함

		return "index"; // 또는 해당 뷰 이름
	}

	@GetMapping("/allcardList")
	public String allCardList(Model model) {
		List<CardProductVO> cards = service.findAll();
		model.addAttribute("cards", cards);
		return "cardList"; // JSP나 Thymeleaf 템플릿
	}

	@GetMapping("/newcard")
	public String newCard(@RequestParam(required = false) Long cardId, Model model) {
		List<CardProductVO> cards = service.findAll();

		// 만약 cardId가 있으면 해당 카드만 선택
		CardProductVO selectedCard = null;
		if (cardId != null) {
			selectedCard = cards.stream().filter(c -> c.getCardId().equals(cardId)).findFirst().orElse(null);
		}

		// 기본적으로 첫 번째 카드 사용
		if (selectedCard == null && !cards.isEmpty()) {
			selectedCard = cards.get(0);
		}

		model.addAttribute("cardImgUrl", selectedCard != null ? selectedCard.getImg() : null);
		return "newcard"; // newcard.html
	}

	@GetMapping("/mycard")
	public String mycard(Model model) {
		return "/mycard"; // mycard.html
	}

	@GetMapping("/recommend")
	public String recommendCards(Model model) {
//	    List<CardProductVO> cardList = service.getRecommendCards(); // 카드 리스트 조회
////	    model.addAttribute("cardList", cardList);
		return "/recommend"; // cardList.html 렌더링
	}

	@GetMapping("/manage")
	public String cardmanage(Model model) {
		return "/card-manage";
	}

	@PostMapping("/detail")
	public String detail(@RequestParam String cardId, Model model) {

		/*
		 * model.addAttribute("card", cardService.findCard(cardId));
		 * model.addAttribute("benefits", cardService.findBenefits(cardId));
		 */
		return "/card-detail";
	}

	@GetMapping("/register")
	public String cardregister(Model model) {
		return "/card-register";
	}
}
