package com.sboot.moabayo.vo;

import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AccountApplyForm {
  private Long   product_id;
  private String product_type;                 // '예금' | '적금'
  private Long   funding_user_account_id;      // 자금원
  private String open_new_account;             // "yes" | "no"
  private Long   amount;
  private Integer term_months;
  private Double  tax_rate;
  private String  autopay_day;
  private String  maturity_option;

  // nested binding: selected_bonuses[0].label / selected_bonuses[0].bp
  private List<Bonus> selected_bonuses = new ArrayList<>();
  // nested binding: consents.terms / consents.privacy / consents.marketing
  private Consents consents = new Consents();

  @Getter @Setter
  public static class Bonus {
    private String label;
    private Double bp;
  }

  @Getter @Setter
  public static class Consents {
    private boolean terms;
    private boolean privacy;
    private boolean marketing;
  }

  public boolean isOpenNew() {
    return "yes".equalsIgnoreCase(open_new_account);
  }
}