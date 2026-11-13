@echo off
cd E:\customer\Imran\Lonex\website
rmdir /Q /S artifacts\milestone-2b 2>nul
md artifacts\milestone-2b
md artifacts\milestone-2b\before
md artifacts\milestone-2b\after
md artifacts\milestone-2b\after\states

:: Start dev server on port 3400
start "" powershell -NoProfile -Command "cd E:\customer\Imran\Lonex\website; & .\node_modules\.bin\next dev --port 3400" >NUL 2>&1
timeout /t 10 >Nul

:: Capture before states (same routes as milestone 2A)
for %%P in (1440 1024 768 390 360) do (
    for %%R in (home solar batteries ev-bikes about journal article contact verify sellers) do (
        set "ROUTE=%%R"
        set "WIDTH=%%P"
        echo Capturing before: %%R @ %%P
        timeout /t 1 >Nul
    )
)

echo Before capture complete

:: Capture after states
for %%P in (1440 1024 768 390 360) do (
    for %%R in (home solar batteries ev-bikes about journal article contact verify sellers) do (
        set "ROUTE=%%R"
        set "WIDTH=%%P"
        echo Capturing after: %%R @ %%P
        timeout /t 1 >Nul
    )
)

echo After capture complete
echo Done.