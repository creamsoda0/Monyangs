package com.sboot.moabayo.vo;

import java.util.List;

import lombok.Data;

@Data
public class CardSummaryVO {
	private int ownedCount;
	private double totalSpend;
	private double expectedReward;
	private int alertsCount;
	private int daysUntilBilling;
	private List<String> weeklyEvents;
	private List<String> alerts;
	private String insightTitle;
	private String insightDescription;
}
