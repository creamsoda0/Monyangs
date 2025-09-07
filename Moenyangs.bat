@echo off
setlocal enabledelayedexpansion
set BASE_PATH=E:\moabayo

:: 서버 실행 함수 정의
:runServer
set DIR=%1
set NAME=%2
set PORT=%3

pushd %DIR%
echo [INFO] %NAME% 서버 실행 중...
start /b cmd /c "mvnw.cmd spring-boot:run"
popd

call :waitForPort %PORT%
echo done > %BASE_PATH%\step_%PORT%.done
exit /b

:: 각 서버 병렬 실행
call :runServer Moabayo_Eureka_Server Eureka 8012
call :runServer Moabayo_Client_Bank Bank 8813
call :runServer Moabayo_Client_Card Card 8814
call :runServer Moabayo_Client_LoginService LoginService 8811
call :runServer Moabayo_Client_Admin Admin 8815
call :runServer Moabayo_Client_Main Main 8812

echo 모든 서버가 실행되었습니다. 이 창을 닫으면 서버들도 종료됩니다.
pause
exit /b

:waitForPort
setlocal
set PORT=%1
echo %PORT% 포트 오픈 대기 중...
:waitloop
powershell -Command ^
    "(new-object System.Net.Sockets.TcpClient).ConnectAsync('localhost',%PORT%).Wait(1000)" >nul 2>&1
if errorlevel 1 (
    timeout /t 1 >nul
    goto waitloop
)
echo %PORT% 포트가 열렸습니다.
endlocal
exit /b