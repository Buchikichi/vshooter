@echo off
set CUR=%~dp0
set COMP=c:\application\closure-compiler-v20190415.jar
set COMP_OPT=--compilation_level SIMPLE --warning_level DEFAULT --language_out=ES5
set JAVA_HOME="C:\Program Files\Java\jdk1.8.0_212"
set PATH=%JAVA_HOME%\bin;%PATH%
set LIBS=lib\util\*.js %2
set DIR_OUT=../resources/static/js

cd %CUR%
echo ***%1***
type %LIBS% %1.js > %1-all.js 2> nul
java -jar %COMP% %COMP_OPT% --js %1-all.js --js_output_file %DIR_OUT%/%1-min.js

del *-all.js
