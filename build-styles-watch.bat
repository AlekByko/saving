call build-styles.bat
node ./watch-and-run.js ./styles "cmd /C build-styles.bat" ".+\.less$"
