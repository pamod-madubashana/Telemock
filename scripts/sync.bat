@echo off
REM Script to reset 'featured' branch to match main

REM 1. Switch to master and pull latest
git switch master
git pull origin master

REM 2. Delete local featured branch if it exists
git branch -D featured 2>nul

REM 3. Delete remote featured branch if it exists
git push origin --delete featured

REM 4. Recreate featured branch from master
git switch -c featured

REM 5. Push new featured branch to remote
git push -u origin featured

echo Featured branch has been reset ✅
pause