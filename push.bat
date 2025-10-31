@echo off
setlocal enabledelayedexpansion
set GIT_SSH_COMMAND=C:\Program Files\Git\usr\bin\ssh.exe -i C:\Users\Administrator\.ssh\id_ed25519 -o StrictHostKeyChecking=no
git push -v

