#!/bin/bash

response=$(curl -s -w '\n%{http_code}' -X PUT http://localhost:8899/api/abort)

body=$(sed '$d' <<< "$response")
status=$(tail -n1 <<< "$response")

if [[ "$status" == "200" ]]; then
    notify-send "Transitioned into '$body'"
else
    notify-send "$body"
fi
