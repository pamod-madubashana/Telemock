@echo off
setlocal

echo Running pre-PR checks...
echo.

echo [1/5] Prettier check
call npx prettier --write .
if errorlevel 1 goto :fail

echo.
echo [2/5] Rust format check
pushd src-tauri
call cargo fmt
if errorlevel 1 goto :fail_in_tauri

echo.
echo [3/5] Rust build
call cargo build --verbose
if errorlevel 1 goto :fail_in_tauri

echo.
echo [4/5] Rust tests
call cargo test --verbose --all-features
if errorlevel 1 goto :fail_in_tauri
popd

echo.
echo [5/5] NPM tests
call npm run test
if errorlevel 1 goto :fail

cls
echo.
echo All checks passed. Ready for PR.
exit /b 0

:fail_in_tauri
popd

:fail
echo.
echo Pre-PR checks failed.
exit /b 1