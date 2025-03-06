#!/usr/bin/env bash

set -eu

local subCommand=$1
local drizzleConfigPath="drizzle-dev.config.ts" # TODO FIXME

if [[ "${subCommand}" == "build" ]]; then
  npx drizzle-kit generate --config="${drizzleConfigPath}"
elif [[ "${subCommand}" == "migrate" ]]; then
  npx drizzle-kit migrate --config="${drizzleConfigPath}"
elif [[ "${subCommand}" == "push" ]]; then
  npx drizzle-kit push --config="${drizzleConfigPath}"
else
  echo "Unsupported sub-command ${subCommand}"
fi
