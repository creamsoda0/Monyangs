package com.sboot.moabayo.csv;

import java.io.InputStreamReader;
import java.util.List;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.opencsv.bean.CsvToBeanBuilder;
import com.sboot.moabayo.vo.AgeGenderVO;
import com.sboot.moabayo.vo.RegionVO;
import com.sboot.moabayo.vo.TimeVO;

@Component
public class CsvReader {
    public List<AgeGenderVO> readAgeGender() throws Exception {
        return new CsvToBeanBuilder<AgeGenderVO>(
                new InputStreamReader(new ClassPathResource("static/csv/agegender.csv").getInputStream()))
                .withType(AgeGenderVO.class)
                .withIgnoreLeadingWhiteSpace(true)
                .build()
                .parse();
    }
    
    public List<RegionVO> readRegion() throws Exception {
        return new CsvToBeanBuilder<RegionVO>(
                new InputStreamReader(new ClassPathResource("static/csv/region.csv").getInputStream()))
                .withType(RegionVO.class)
                .withIgnoreLeadingWhiteSpace(true)
                .build()
                .parse();
    }
    
    public List<TimeVO> readTime() throws Exception {
        return new CsvToBeanBuilder<TimeVO>(
                new InputStreamReader(new ClassPathResource("static/csv/time.csv").getInputStream()))
                .withType(TimeVO.class)
                .withIgnoreLeadingWhiteSpace(true)
                .build()
                .parse();
    }
}