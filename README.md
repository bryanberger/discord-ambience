# Discord Ambience Bot

Had a quick idea to create an ambience music bot. It plays 7 channels of mixed ambience into a single voice broadcast in a channel of your choice.

## Build and Run

- cp `.env.example` to `.env`
- `docker compose up --build`

## Commands

```bash

# Join your current channel
xjoin

# Leave your channel
xleave

# Reconnect to your channel
xrejoin

# List available tracks by name
xtracks

# Set gain for a specific track by name (a number from 0 - 1 is 0 - 100% volume)
xgain FULL_ROOM 0.5

# Remix volume gain for all tracks (randomize volumes)
xremix

```
