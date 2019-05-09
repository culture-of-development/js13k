

CALL uglifyjs ./app/game.js > app.js

CALL zip build/offline.zip app.js index.html styles.css world.png *.m4a

CALL ls -la build/