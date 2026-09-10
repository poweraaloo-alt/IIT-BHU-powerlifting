# IPF Powerlifting Meet Nominations

## What it does

Public leaderboard for the IIT BHU Powerlifting Team Trials. It displays nominations separated into Boys and Girls with IPF weight-category filters and lifter-name search, plus a beginner-friendly explanation of the meet flow.

Event details shown in the public header: Saturday, 12 September; reporting at 6:00 PM (tentative); SAC Gym. Organizer Instagram links: `@power_aaloo` and `@thee_nightowll`.

## Data model

- `Nomination`: stable id, name, gender (`boys` or `girls`), bodyweight, derived or supplied IPF category, squat, bench, deadlift, computed/provided total, and source row.
- `NominationsResponse`: source URL, server sync timestamp, all nominations, and boys/girls counts.

## Key flows

1. Public visitor opens `/` and sees a competition-style nomination board.
2. Backend fetches the public Google Sheet export as CSV and flexibly maps name, gender, bodyweight, category, squat, bench, deadlift, and total headers.
3. Missing category is derived from bodyweight using the Boys/Girls IPF class lists. Missing total is computed only when all three lifts are numeric.
4. Visitor switches Boys/Girls, chooses an IPF class, searches by name, or changes sorting.
5. Visitor opens `/meet-flow` to learn check-in, weigh-in, lifting order, attempts, scoring, and results.
6. Visitor opens `/leaderboard` to view the second public sheet as a flexible all-field sortable leaderboard with total and DOTS options.
7. Visitor opens `/live-scoreboard` to view every populated column from the live score sheet, with search and sort-by-any-field controls.

## Source

Public Google Sheet: `https://docs.google.com/spreadsheets/d/1di092MyHACgqD_uRcb_87ZZhyVeOkFFwE3SQwdmtXOE/edit?usp=sharing`

No authentication or admin area is implemented; the feed is read-only.

Leaderboard source: `https://docs.google.com/spreadsheets/d/1XvE0Tk6CjVw5bzf0QTKt2Is6RLuHUYiWZ5BT6r7rwzo/edit?gid=1215517829#gid=1215517829`.

Live score source: `https://docs.google.com/spreadsheets/d/1rKJjmGL5u18pFv9rBsnZKgDiX-URXE898bp0C8wPUtM/edit?gid=1220789478#gid=1220789478`.