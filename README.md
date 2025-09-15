# \# 🐾 모으냥즈 (MouNyangs)

# 

# Spring Boot + MSA 구조로 구현한 금융/플래너 데모 서비스입니다.  

# Eureka 기반의 서비스 디스커버리, OpenFeign을 통한 서비스 간 호출, JWT + Spring Security 인증/인가를 포함합니다.  

# 모든 API는 `@RestController` 를 통해 JSON 형식으로 제공됩니다.

# 

# ---

# 

# \## 🚀 아키텍처

# 

# \- \*\*MSA 구조\*\*

# &nbsp; - 서비스별 독립 배포 가능

# &nbsp; - Eureka를 통한 서비스 등록/탐색

# &nbsp; - OpenFeign으로 서비스 간 통신

# 

# ---

# 

# \## 🔑 핵심 기술

# 

# \- \*\*Eureka-Server\*\* : 서비스 디스커버리

# \- \*\*OpenFeign\*\* : 서비스 간 REST 호출

# \- \*\*JWT\*\* : Access/Refresh 토큰 기반 인증

# \- \*\*Spring Security\*\* : 엔드포인트 보호 및 인증 처리

# \- \*\*RestController\*\* : REST API 제공

# 

# ---

# 

# \## ⚙️ 실행 방법

# 

# \### 요구사항

# \- JDK 21+

# \- Maven 3.9+

# \- 포트 사용:  

# &nbsp; - Eureka-Server: 8200  

# &nbsp; - Gateway: 8201  

# &nbsp; - Login-Service: 8202  

# &nbsp; - Planner-Service: 8888  

# 

# \### 실행 순서

# 1\. `eureka-server` 실행  

# &nbsp;  ```bash

# &nbsp;  cd eureka-server

# &nbsp;  mvn spring-boot:run





