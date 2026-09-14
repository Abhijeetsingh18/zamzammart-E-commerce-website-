@echo off
title ZamZam Mart - Spring Boot Backend
echo ============================================================
echo   Starting ZamZam Mart Backend (Spring Boot 3 - Java 21)
echo ============================================================
cd /d "%~dp0zamZamMart"
call mvn spring-boot:run
pause

