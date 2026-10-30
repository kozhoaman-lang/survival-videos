"""Find the 14 paragraph boundaries in the narration: map cumulative *speech* time
(silence excluded) to cumulative letter count of the script, then snap to the nearest pause."""
import re, subprocess, numpy as np
from scipy.io import wavfile

subprocess.run(['ffmpeg', '-y', '-i', 'voice_forest.mp3', '-ac', '1', '-ar', '16000', 'voice_forest_16k.wav'],
               check=True, stderr=subprocess.DEVNULL)
sr, a = wavfile.read('voice_forest_16k.wav'); a = a.astype(np.float64) / 32768
hop = int(sr * 0.01)
rms = np.sqrt(np.convolve(a ** 2, np.ones(hop * 3) / (hop * 3), 'same'))[::hop]
db = 20 * np.log10(rms + 1e-9)
speech = db > -38
# pauses >= 0.25 s
pauses, i = [], 0
while i < len(speech):
    if not speech[i]:
        j = i
        while j < len(speech) and not speech[j]: j += 1
        if (j - i) * 0.01 >= 0.25: pauses.append((i * 0.01, j * 0.01))
        i = j
    else:
        i += 1
cum_speech = np.cumsum(speech) * 0.01  # speech seconds elapsed at each 10ms frame
total_speech = cum_speech[-1]

paras = [p.strip() for p in open('/home/claude/forest_narration_EN.txt').read().split('\n\n') if p.strip()]
letters = [len(re.sub(r'[^A-Za-z0-9]', '', p)) for p in paras]
cum = np.cumsum(letters) / sum(letters)
cuts = [0.0]
for k in range(len(paras) - 1):
    target = total_speech * cum[k]
    best = min(pauses, key=lambda p: abs(cum_speech[min(int(p[0] / 0.01), len(cum_speech) - 1)] - target))
    est_t = np.searchsorted(cum_speech, target) * 0.01
    cuts.append(round((best[0] + best[1]) / 2, 2))
    print(f'boundary {k+1:2}|{k+2:2}: est {est_t:6.2f}s -> pause {best[0]:6.2f}-{best[1]:6.2f} (len {best[1]-best[0]:.2f})')
cuts.append(round(len(a) / sr, 2))
print('cuts', cuts)
print('scene voice durations', [round(cuts[i + 1] - cuts[i], 2) for i in range(len(paras))])
open('cuts.txt', 'w').write(' '.join(map(str, cuts)))
