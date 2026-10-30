"""Phrase-level forced alignment without ASR.
Speech segments (between pauses) are aligned to text phrases (split at punctuation) with DP:
each segment covers 1..k consecutive phrases, or k segments cover one phrase.
Cost = squared relative mismatch between segment duration and rate*letters.
Paragraph boundaries are read off the aligned phrase boundaries."""
import re, numpy as np
from scipy.io import wavfile

sr, a = wavfile.read('voice_forest_16k.wav'); a = a.astype(np.float64) / 32768
hop = int(sr * 0.01)
rms = np.sqrt(np.convolve(a ** 2, np.ones(hop * 3) / (hop * 3), 'same'))[::hop]
speech = 20 * np.log10(rms + 1e-9) > -38
# speech segments separated by pauses >= 0.18 s
segs, i, n = [], 0, len(speech)
while i < n:
    if speech[i]:
        j = i
        while j < n:
            if not speech[j]:
                k = j
                while k < n and not speech[k]: k += 1
                if (k - j) * 0.01 >= 0.18: break
                j = k
            else:
                j += 1
        segs.append((i * 0.01, j * 0.01)); i = j
    else:
        i += 1

paras = [p.strip() for p in open('/home/claude/forest_narration_EN.txt').read().split('\n\n') if p.strip()]
units, para_end = [], []  # para_end[k] = index of last unit of paragraph k
for p in paras:
    parts = [u for u in re.split(r'(?<=[.,?!:;…—])\s+|\s+—\s+', p) if re.search(r'[A-Za-z0-9]', u)]
    units += parts; para_end.append(len(units) - 1)
L = np.array([len(re.sub(r'[^A-Za-z0-9]', '', u)) + 2 for u in units], float)  # +2 ~ word onset overhead
D = np.array([e - s for s, e in segs])
rate = D.sum() / L.sum()
m, nu = len(segs), len(units)
INF = 1e18
cost = np.full((m + 1, nu + 1), INF); back = {}
cost[0, 0] = 0
K = 6
for i in range(m + 1):
    for j in range(nu + 1):
        if cost[i, j] >= INF: continue
        for a_ in range(1, K + 1):       # a_ segments
            for b_ in range(1, K + 1):   # b_ units
                if a_ > 1 and b_ > 1: continue
                ii, jj = i + a_, j + b_
                if ii > m or jj > nu: continue
                d = segs[ii - 1][1] - segs[i][0] if a_ > 1 else D[i]
                exp = rate * L[j:jj].sum()
                c = ((d - exp) / max(exp, 0.4)) ** 2 + 0.15 * (a_ - 1) + 0.05 * (b_ - 1)
                if cost[i, j] + c < cost[ii, jj]:
                    cost[ii, jj] = cost[i, j] + c; back[(ii, jj)] = (i, j)
# backtrack: unit index -> end time of the segment group that ends at that unit
unit_end_time, node = {}, (m, nu)
while node != (0, 0):
    pi, pj = back[node]
    unit_end_time[node[1] - 1] = segs[node[0] - 1][1]
    node = (pi, pj)
cuts = [0.0]
for k in range(len(paras) - 1):
    u = para_end[k]
    end = unit_end_time.get(u)
    nxt = [s for s, e in segs if s >= end - 0.01][0]
    cuts.append(round((end + nxt) / 2, 2))
    print(f'{k+1:2}|{k+2:2}: speech ends {end:6.2f}, next starts {nxt:6.2f} | last phrase: "{units[u][-28:]}"')
cuts.append(round(len(a) / sr, 2))
print('total cost', round(cost[m, nu], 2), 'segments', m, 'phrases', nu)
print('cuts', cuts)
print('durs', [round(cuts[i + 1] - cuts[i], 2) for i in range(len(paras))])
open('cuts_aligned.txt', 'w').write(' '.join(map(str, cuts)))
