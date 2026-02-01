#!/bin/bash
cd /Users/yeduruabhiram/Desktop/mentlearn/new-version-mentlearn
export BROWSER=none
export CI=false
export PATH="$PATH:$(pwd)/node_modules/.bin"
node ./node_modules/react-scripts/bin/react-scripts.js start
