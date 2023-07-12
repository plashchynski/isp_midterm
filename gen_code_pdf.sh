#!/bin/bash

rm -rf tmp/*.pdf

paps ./part1/sketch.js | ps2pdf - tmp/1.pdf
paps ./part2/sketch.js | ps2pdf - tmp/2.pdf
paps ./part2/analyzer/sketch.js | ps2pdf - tmp/3.pdf

jupyter nbconvert --to pdf ./part3/Exercise\ 3.1.ipynb --output=4 --output-dir=./tmp/
jupyter nbconvert --to pdf ./part3/Exercise\ 3.2.ipynb --output=5 --output-dir=./tmp/
jupyter nbconvert --to pdf ./part3/Exercise\ 3.3.ipynb --output=6 --output-dir=./tmp/
jupyter nbconvert --to pdf ./part4/DeepSpeech.ipynb --output=7 --output-dir=./tmp/
jupyter nbconvert --to pdf ./part4/NoiseReductionExperiments.ipynb --output=8 --output-dir=./tmp/

"/System/Library/Automator/Combine PDF Pages.action/Contents/MacOS/join" -o code.pdf tmp/*.pdf
