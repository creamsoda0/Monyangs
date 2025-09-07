package com.sboot.moabayo.vo;

public final class AccountTxMetaHolder {
	 private static final ThreadLocal<AccountTxMeta> TL = new ThreadLocal<>();
	 private AccountTxMetaHolder() {}

	 public static void set(AccountTxMeta meta) { TL.set(meta); }
	 public static AccountTxMeta get() { return TL.get(); }
	 public static AccountTxMeta getAndClear() {
	     AccountTxMeta m = TL.get();
	     TL.remove();
	     return m;
	 }
	 public static void clear() { TL.remove(); }
}