package com.sboot.moabayo.csv;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

public final class SegmentMini {
	  private static final String[][] UPJONG = {
	    {"ss001","요식/유흥"},{"ss002","유통"},{"ss003","스포츠/문화/레저"},{"ss004","가정생활/서비스"},
	    {"ss005","교육/학원"},{"ss006","의료"},{"ss007","자동차"},{"ss008","전자상거래"}
	  };
	  private static final Map<String,Integer> IDX = new HashMap<>(); // ss001 -> 0 ...
	  static { for (int i=0;i<UPJONG.length;i++) IDX.put(UPJONG[i][0], i); }

	  // 캐시: (age|gender) / region / bucket → 업종8개 비율(0~1)
	  private static final Map<String,double[]> AG = new HashMap<>();
	  private static final Map<String,double[]> RG = new HashMap<>();
	  private static final Map<Integer,double[]> TM = new HashMap<>();
	  private static volatile boolean loaded = false;

	  public static synchronized void ensureLoaded() {
	    if (loaded) return;
	    loadAgeGender("/csv/agegender.csv");
	    loadRegion("/csv/region.csv");
	    loadTime("/csv/time.csv");
	    loaded = true;
	  }

	  private static void loadAgeGender(String classpath) {
	    Map<String,double[]> sum = new HashMap<>();
	    Map<String,Double> den = new HashMap<>();
	    try (var in = SegmentMini.class.getResourceAsStream(classpath)) {
	      var r = new java.io.BufferedReader(new java.io.InputStreamReader(in, java.nio.charset.Charset.forName("MS949"))); // 필요시 UTF-8로 변경
	      String line = r.readLine(); // skip header
	      while ((line = r.readLine()) != null) {
	        String[] c = line.split(",", -1);
	        String upjong = c[0].trim();
	        String gender = c[2].trim();
	        String ageRaw = c[3].trim();
	        double tryCnt = safeD(c[5]);
	        Integer idx = IDX.get(upjong);
	        if (idx == null) continue;
	        String age = normalizeAge(ageRaw); // "30대" -> "30s", "70대이상" -> "70s+"
	        String key = age + "|" + gender;

	        sum.computeIfAbsent(key, k -> new double[8])[idx] += tryCnt;
	        den.put(key, den.getOrDefault(key, 0.0) + tryCnt);
	      }
	    } catch (Exception ignored) {}
	    // ratio 로 정규화
	    for (var e : sum.entrySet()) {
	      double total = den.getOrDefault(e.getKey(), 0.0);
	      double[] v = e.getValue(), out = new double[8];
	      if (total > 0) for (int i=0;i<8;i++) out[i] = v[i] / total;
	      AG.put(e.getKey(), out);
	    }
	  }

	  private static void loadRegion(String classpath) {
	    Map<String,double[]> sum = new HashMap<>();
	    Map<String,Double> den = new HashMap<>();
	    try (var in = SegmentMini.class.getResourceAsStream(classpath)) {
	      var r = new java.io.BufferedReader(new java.io.InputStreamReader(in, java.nio.charset.Charset.forName("MS949")));
	      String line = r.readLine();
	      while ((line = r.readLine()) != null) {
	        String[] c = line.split(",", -1);
	        String region = c[0].trim();
	        String upjong = c[1].trim();
	        double tryCnt = safeD(c[2]);
	        Integer idx = IDX.get(upjong);
	        if (idx == null) continue;
	        sum.computeIfAbsent(region, k -> new double[8])[idx] += tryCnt;
	        den.put(region, den.getOrDefault(region, 0.0) + tryCnt);
	      }
	    } catch (Exception ignored) {}
	    for (var e : sum.entrySet()) {
	      double total = den.getOrDefault(e.getKey(), 0.0);
	      double[] src = e.getValue(), out = new double[8];
	      if (total > 0) for (int i=0;i<8;i++) out[i] = src[i] / total;
	      RG.put(e.getKey(), out);
	    }
	  }

	  private static void loadTime(String classpath) {
	    Map<Integer,double[]> sum = new HashMap<>();
	    Map<Integer,Double> den = new HashMap<>();
	    try (var in = SegmentMini.class.getResourceAsStream(classpath)) {
	      var r = new java.io.BufferedReader(new java.io.InputStreamReader(in, java.nio.charset.Charset.forName("MS949")));
	      String line = r.readLine();
	      while ((line = r.readLine()) != null) {
	        String[] c = line.split(",", -1);
	        int bucket = safeI(c[0]);
	        String upjong = c[1].trim();
	        double tryCnt = safeD(c[2]);
	        Integer idx = IDX.get(upjong);
	        if (idx == null) continue;
	        sum.computeIfAbsent(bucket, k -> new double[8])[idx] += tryCnt;
	        den.put(bucket, den.getOrDefault(bucket, 0.0) + tryCnt);
	      }
	    } catch (Exception ignored) {}
	    for (var e : sum.entrySet()) {
	      double total = den.getOrDefault(e.getKey(), 0.0);
	      double[] src = e.getValue(), out = new double[8];
	      if (total > 0) for (int i=0;i<8;i++) out[i] = src[i] / total;
	      TM.put(e.getKey(), out);
	    }
	  }

	  public static Map<String,Double> ageGenderDist(String ageBand, String gender){
	    ensureLoaded();
	    double[] v = AG.getOrDefault(ageBand + "|" + gender, new double[8]);
	    return asMap(v);
	  }
	  public static Map<String,Double> regionDist(String region){
	    ensureLoaded();
	    double[] v = RG.getOrDefault(region, new double[8]);
	    return asMap(v);
	  }
	  public static Map<String,Double> timeDist(int bucket){
	    ensureLoaded();
	    double[] v = TM.getOrDefault(bucket, new double[8]);
	    return asMap(v);
	  }

	  // 가중합 + 스케일/클램프 (초기값: 0.5/0.3/0.2, scale 0.05, clamp ±0.1)
	  public static double[] combinedBonus(String ageBand, String gender, String region, int bucket){
	    ensureLoaded();
	    double[] ag = AG.getOrDefault(ageBand+"|"+gender, new double[8]);
	    double[] rg = RG.getOrDefault(region, new double[8]);
	    double[] tm = TM.getOrDefault(bucket, new double[8]);
	    double wAg=0.5, wRg=0.3, wTm=0.2, scale=0.05, min=-0.10, max=0.10;

	    double[] out = new double[8];
	    for (int i=0;i<8;i++){
	      double v = wAg*ag[i] + wRg*rg[i] + wTm*tm[i];
	      v = v * scale;
	      if (v < min) v = min; else if (v > max) v = max;
	      out[i] = v;
	    }
	    return out;
	  }

	  private static Map<String,Double> asMap(double[] v){
	    Map<String,Double> m = new LinkedHashMap<>();
	    for (int i=0;i<8;i++) m.put(UPJONG[i][1], v[i]); // 한글 라벨 키
	    return m;
	  }
	  private static String normalizeAge(String s){
	    if (s.contains("70")) return "70s+";
	    if (s.contains("60")) return "60s";
	    if (s.contains("50")) return "50s";
	    if (s.contains("40")) return "40s";
	    if (s.contains("30")) return "30s";
	    if (s.contains("20")) return "20s";
	    return "etc";
	  }
	  private static int safeI(String s){ try { return Integer.parseInt(s.trim()); } catch(Exception e){ return 0; } }
	  private static double safeD(String s){ try { return Double.parseDouble(s.trim()); } catch(Exception e){ return 0d; } }
	}
