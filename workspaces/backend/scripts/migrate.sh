#!/usr/bin/env bash

set -eu

while true; do
    read -p "Enter a name for the new migration: " migrationName

    if [[ -n "${migrationName}" ]]; then
      break;
    fi
done


pnpm prisma migrate dev "${migrationName}"
pnpm wrangler d1 migrations create icedgate-example "${migrationName}"
