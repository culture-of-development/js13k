

CALL uglifyjs ./app/game.js > app.js

CALL zip build/offline.zip app.js index.html styles.css

CALL ls -la build/