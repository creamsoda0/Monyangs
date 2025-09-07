package com.sboot.moabayo.service;

import com.sboot.moabayo.dao.AccountMapper;
import com.sboot.moabayo.dao.BankProductMapper;
import com.sboot.moabayo.vo.AccountApplyRequest;
import com.sboot.moabayo.vo.AccountApplyResponse;
import com.sboot.moabayo.vo.AccountTxMeta;
import com.sboot.moabayo.vo.AccountTxMetaHolder;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AccountApplyServiceImpl implements AccountApplyService {


	  private final AccountMapper accountMapper;
	  private final BankProductMapper bankProductMapper; // 필요 시 상품 검증용
	  private final AccountBalanceService accountBalanceService; // ★ AOP 적용 서비스
	
	  private final SecureRandom rnd = new SecureRandom();
	
	  @Override
	  @Transactional
	  public AccountApplyResponse apply(Long userId, AccountApplyRequest req) {
	    // 0) 기본 검증
	    if (userId == null) throw new SecurityException("NO_USER");
	    if (req.product_id() == null) throw new IllegalArgumentException("PRODUCT_REQUIRED");
	    if (!req.open_new_account()) throw new IllegalArgumentException("ONLY_NEW_ACCOUNT_SUPPORTED");
	    if (req.amount() == null || req.amount() <= 0) throw new IllegalArgumentException("AMOUNT_REQUIRED");
	    if (req.consents() == null || !(req.consents().terms() && req.consents().privacy()))
	      throw new IllegalArgumentException("CONSENT_REQUIRED");

	    // 1) 계좌번호 생성 (중복 회피)
	    String accountNumber = generateUniqueAccountNumber();

	    // 2) 신규 계좌 INSERT (balance=0)
	    
	    Map<String,Object> row = new HashMap<>();
	    
	    row.put("user_id", userId);
	    row.put("account_id", req.product_id());
	    row.put("account_number", accountNumber);
	    row.put("account_name", defaultName(req));
	    row.put("balance", 0L); // ★ 0원으로 만들고, 아래 AOP plus로 채운다.
	    accountMapper.insertUserAccount(row);
	    
	    Long uaId = ((Number) row.get("user_account_id")).longValue();
	    row.put("user_account_id", uaId);
	    
	    // 3) 금액 이동: AOP 서비스 사용 (거래내역은 Aspect가 기록)
	    Long amt = req.amount();
	    
	    System.out.println("[AccountApplyServiceImpl] req.funding_user_account_id(): " + req.funding_user_account_id());

	    if (req.funding_user_account_id() != null) {
	      Long fromId = req.funding_user_account_id();

	      // (A) 네 서비스 메소드가 '이동/이체' 시나리오를 지원하면, 한 방에:
	      // accountBalanceService.transfer(fromId, uaId, amt,
	      //     "OPENING_FUND", "신규계좌 개설 자금 이체",
	      //     "DEPOSIT", "OPENING_DEPOSIT", "초기예치금");

	      // (B) 보통은 minus/plus 두 동작을 제공하므로, 순차 호출:
	      // 아래 메소드 시그니처는 예시야. 네 실제 메소드에 맞춰 파라미터만 맞추면 끝!
	        // 출금 (AOP가 거래로그 남김)
	        AccountTxMetaHolder.set(AccountTxMeta.builder()
	            .approvedAmount(amt)
	            .approvedNum("")
	            .accountType("WITHDRAW")
	            .category("TRANSFER_OUT")
	            .shopName("OPENING_FUND")
	            .shopNumber("")
	            .memo("신규계좌 개설 자금 이체")
	            .build()
	        );
	        System.out.println("[AccountApplyServiceImpl] fromId: " + fromId + "|amt: " + amt);
	      accountBalanceService.updateBalanceMinus(
	          fromId, amt
	      );
	      
	      
	        // 입금 (AOP가 거래로그 남김)
	        AccountTxMetaHolder.set(AccountTxMeta.builder()
	            .approvedAmount(amt)
	            .approvedNum("")
	            .accountType("DEPOSIT")
	            .category("TRANSFER_IN")
	            .shopName("OPENING_DEPOSIT")
	            .shopNumber("")
	            .memo("초기예치금")
	            .build()
	        );
	        System.out.println("[AccountApplyServiceImpl] uaId: " + uaId + "|amt: " + amt);
	      accountBalanceService.updateBalancePlus(
	          uaId, amt
	      );

	    } else {
	        // 입금 (AOP가 거래로그 남김)
	        AccountTxMetaHolder.set(AccountTxMeta.builder()
	            .approvedAmount(amt)
	            .approvedNum("")
	            .accountType("DEPOSIT")
	            .category("TRANSFER_IN")
	            .shopName("OPENING_DEPOSIT")
	            .shopNumber("")
	            .memo("초기예치금")
	            .build()
	        );
	        System.out.println("[AccountApplyServiceImpl] uaId: " + uaId + "|amt: " + amt);
	      // 자금원 없이 바로 신규 계좌에 돈을 넣는 케이스 (현금/외부 유입 개념)
	      accountBalanceService.updateBalancePlus(
	          uaId, amt
	      );
	    }

	    // 4) 응답
	    Long balanceAfter = amt; // 신규 계좌는 방금 입금된 금액만큼
	    return new AccountApplyResponse(true, uaId, accountNumber, (String)row.get("account_name"), balanceAfter);
	  }

	  // ==== 유틸 ====
	  private String defaultName(AccountApplyRequest req){
	    return (req.product_type() != null ? req.product_type() : "계좌") + "(신규)";
	  }

	  private String generateUniqueAccountNumber(){
	    for (int i=0;i<10;i++){
	      String cand = String.format("%03d-%03d-%03d",
	          100 + rnd.nextInt(900),
	          100 + rnd.nextInt(900),
	          100 + rnd.nextInt(900));
	      if (accountMapper.existsAccountNumber(cand) == 0) return cand;
	    }
	    throw new IllegalStateException("ACCOUNT_NUMBER_GEN_FAIL");
	  }
}
