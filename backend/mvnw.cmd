@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------

@IF "%DEBUG%" == "" @ECHO OFF
@SETLOCAL

SET ERROR_CODE=0

@REM To isolate internal variables from possible post scripts, we use another setlocal
@SETLOCAL EnableDelayedExpansion

@REM ==== START VALIDATION ====
IF NOT DEFINED JAVA_HOME (
  FOR %%i IN (java.exe) DO SET "JAVACMD=%%~$PATH:i"
  IF NOT DEFINED JAVACMD (
    ECHO Error: JAVA_HOME is not defined and cannot find java.exe in PATH. 1>&2
    EXIT /B 1
  )
) ELSE (
  SET "JAVACMD=%JAVA_HOME%\bin\java.exe"
)

IF NOT EXIST "%JAVACMD%" (
  ECHO Error: JAVA_HOME is not defined correctly. 1>&2
  ECHO Cannot execute %JAVACMD% 1>&2
  EXIT /B 1
)

SET "MAVEN_PROJECTBASEDIR=%~dp0"
IF "%MAVEN_PROJECTBASEDIR:~-1%"=="\" SET "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

SET "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
SET "WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"

IF NOT EXIST "%WRAPPER_JAR%" (
  ECHO Downloading Maven Wrapper Jar...
  powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar', '%WRAPPER_JAR%')}"
)

"%JAVACMD%" -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" %JVM_CONFIG_MAVEN_PROPS% %MAVEN_OPTS% %MAVEN_DEBUG_OPTS% -cp "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
IF ERRORLEVEL 1 GOTO error
GOTO end

:error
SET ERROR_CODE=1

:end
@ENDLOCAL
EXIT /B %ERROR_CODE%
