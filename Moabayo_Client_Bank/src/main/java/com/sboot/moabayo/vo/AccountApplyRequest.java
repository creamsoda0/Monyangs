package com.sboot.moabayo.vo;

import java.util.List;


public record AccountApplyRequest(
    Long product_id,
    String product_type,                 // '예금' | '적금' 등 (뷰에서 내려옴)
    Long funding_user_account_id,        // 자금원 (선택)
    boolean open_new_account,            // 신규 개설 여부 (필수: yes)
    Long amount,                         // 예치금(예금) / 월납입액(적금)
    Integer term_months,                 // 3/6/12/24/36
    Double tax_rate,                     // 0.154 등
    String autopay_day,                  // 적금일(선택)
    String maturity_option,              // 만기처리(선택)
    List<Bonus> selected_bonuses,        // [{label, bp}]
    Consents consents                    // {terms, privacy, marketing}
) {
  public record Bonus(String label, Double bp){}
  public record Consents(boolean terms, boolean privacy, boolean marketing){}
}