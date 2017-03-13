#!/bin/bash
apack midpoint-`cat package.json|jq -r '.version'`.zip index.js node_modules/
