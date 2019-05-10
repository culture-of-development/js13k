

if exist "./output" rd /q /s "./output"

CALL mkdir output

CALL cd app

CALL copy /y /b audio.js + game.js app.js

CALL uglifyjs -m -c drop_console=true --toplevel app.js -o ../output/app.min.js

CALL del app.js

CALL cd ..

for %%I in (index.html styles.css world.png *.m4a) do copy %%I "./output"

if exist "./build" rd /q /s "./build"

CALL mkdir build

CALL zip build/offline.zip ./output/*

CALL ls -la build/