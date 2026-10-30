# Survival videos — animation code

Flat 2D vector animations for a "how to survive X" YouTube channel. Every frame is an SVG string, rasterized with `sharp` and piped to `ffmpeg` (1920x1080, 30 fps).

## Videos
- `blackout/` — How to Survive a 7-Day City Blackout (10 scenes)
- `forest/` — 7 Days Lost in the Forest (15 scenes)

## Files
- `lib.js` — render engine, hero character, UI (pills, captions, cards)
- `forest/forest_lib.js` — forest assets (trees, fire, shelter, helicopter, SOS, phone, rescuers…)
- `sceneN.js` — one scene each: `node sceneN.js` renders `sceneN.mp4`
- `sfx*.py` — procedural sound effects + music (numpy/scipy)
- `srt.py`, `align.py`, `find_cuts.py` — narration timing / splitting the voice-over by scene
- `assemble.py`, `refit.py` — fit each scene to its voice line, mix audio, build the final mp4
- `thumbs/make_thumbs.js` — YouTube thumbnails (1280x720)

## Requirements
Node.js with `sharp`, Python 3 with `numpy` + `scipy`, `ffmpeg`.
