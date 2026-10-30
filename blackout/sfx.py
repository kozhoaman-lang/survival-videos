"""Synthesize sound effects + an ambient music bed for the blackout video and write soundtrack.wav."""
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 44100
DUR = 298.0
N = int(DUR * SR)
mix = np.zeros((N, 2))
rng = np.random.default_rng(3)
S = [0, 20, 50, 85, 115, 150, 180, 225, 250, 278]  # scene start times (s)

def t_arr(d): return np.arange(int(d * SR)) / SR
def env(d, a=0.005, r=None):
    n = int(d * SR); e = np.ones(n)
    na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    if r is None: r = d * 0.6
    nr = min(n, int(r * SR)); e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def bp(x, f1, f2): return sosfilt(butter(2, [f1, f2], 'band', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(d * SR))
def sweep(f0, f1, d, kind='sine'):
    t = t_arr(d); f = np.geomspace(f0, f1, len(t)); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) if kind == 'sine' else np.sign(np.sin(ph))

def add(at, x, vol=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i < 0: return
    x = x[: N - i] * vol
    mix[i:i + len(x), 0] += x * (1 - max(0, pan))
    mix[i:i + len(x), 1] += x * (1 + min(0, pan))

# ---------- sound bank ----------
def pop():
    d = 0.12; return sweep(900, 420, d) * env(d, 0.002, 0.1) * 0.6
def ding():
    out = np.zeros(int(0.7 * SR))
    for k, f in enumerate([880, 1318.5]):
        t = t_arr(0.5); s = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 6)
        i = int(k * 0.09 * SR); out[i:i + len(s)] += s
    return out * 0.45
def buzz():
    d = 0.28; t = t_arr(d); x = np.sign(np.sin(2 * np.pi * 140 * t)) + 0.5 * np.sign(np.sin(2 * np.pi * 147 * t))
    return lp(x, 1200) * env(d, 0.005, 0.08) * 0.35
def whoosh(d=0.45):
    x = noise(d); t = t_arr(d); f = np.linspace(300, 3000, len(t))
    y = np.zeros_like(x)
    for k in range(4):  # coarse sweeping band
        a, b = int(k * len(x) / 4), int((k + 1) * len(x) / 4)
        fc = f[(a + b) // 2]; y[a:b] = bp(x, fc * 0.6, fc * 1.4)[a:b]
    return y * np.sin(np.pi * t / d) ** 2 * 0.5
def click(): d = 0.03; return hp(noise(d), 2000) * env(d, 0.001, 0.025) * 0.6
def thud(): d = 0.25; t = t_arr(d); return (np.sin(2 * np.pi * 70 * t) + 0.4 * lp(noise(d), 300)) * np.exp(-t * 18) * 0.8
def step(): d = 0.12; t = t_arr(d); return lp(noise(d), 500) * np.exp(-t * 40) * 0.5
def tick(): d = 0.02; t = t_arr(d); return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 300) * 0.35
def beep(): d = 0.12; t = t_arr(d); return np.sin(2 * np.pi * 1760 * t) * env(d, 0.003, 0.03) * 0.25
def boom(): d = 1.6; t = t_arr(d); return (np.sin(2 * np.pi * 48 * t * (1 - t * 0.15)) + 0.3 * lp(noise(d), 200)) * np.exp(-t * 2.2) * 0.9
def powerdown(): d = 1.3; return (sweep(320, 35, d) * 0.6 + 0.3 * sweep(640, 70, d)) * env(d, 0.01, 0.6) * 0.6
def powerup(): d = 0.9; return (sweep(50, 420, d) * 0.6 + 0.25 * sweep(100, 840, d)) * env(d, 0.05, 0.3) * 0.5
def hum(d, vol=1):
    t = t_arr(d); x = np.sin(2 * np.pi * 60 * t) + 0.5 * np.sin(2 * np.pi * 120 * t) + 0.2 * np.sin(2 * np.pi * 180 * t)
    return x * env(d, 0.3, 0.3) * 0.08 * vol
def crackle(d, ramp=True):
    t = t_arr(d); base = lp(noise(d), 900) * 0.25
    pops = np.zeros(len(t)); idx = rng.choice(len(t), int(d * 40), replace=False); pops[idx] = rng.uniform(-1, 1, len(idx))
    pops = hp(lp(pops, 6000), 800) * 3
    a = (t / d) if ramp else 1
    return (base + pops) * np.clip(a * 1.4, 0, 1) * env(d, 0.05, 0.4) * 0.6
def rustle(d=0.5): return bp(noise(d), 1500, 6000) * env(d, 0.05, 0.3) * 0.25
def water(d): x = bp(noise(d), 400, 2500); return x * (0.7 + 0.3 * np.sin(2 * np.pi * 7 * t_arr(d))) * env(d, 0.2, 0.4) * 0.25
def drip(): d = 0.15; return sweep(1400, 2600, d) * np.exp(-t_arr(d) * 30) * 0.25
def wind(d):
    t = t_arr(d); x = bp(noise(d), 250, 1100)
    return x * (0.55 + 0.45 * np.sin(2 * np.pi * 0.25 * t) ** 2) * env(d, 1.0, 1.0) * 0.28
def generator(d, vol=1):
    t = t_arr(d); x = lp(np.sign(np.sin(2 * np.pi * 31 * t)), 400) * 0.5 + lp(noise(d), 600) * 0.3
    return x * (0.85 + 0.15 * np.sin(2 * np.pi * 8 * t)) * env(d, 0.4, 0.4) * 0.3 * vol
def siren(d):
    t = t_arr(d); f = 700 + 200 * np.sin(2 * np.pi * 0.6 * t); ph = 2 * np.pi * np.cumsum(f) / SR
    return lp(np.sin(ph), 1500) * env(d, 1.0, 0.6) * 0.09
def heartbeat(): d = 0.5; t = t_arr(d); s = np.sin(2 * np.pi * 55 * t) * np.exp(-t * 20); s2 = np.roll(s, int(0.18 * SR)) * 0.6; return (s + s2) * 0.6
def zap(): d = 0.4; x = hp(noise(d), 1500) * (rng.random(int(d * SR)) > 0.6) ; return x * env(d, 0.002, 0.2) * 0.5
def ring(): d = 1.2; t = t_arr(d); x = (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)) * (t % 0.6 < 0.4); return x * 0.08
def gulp(): d = 0.18; return sweep(300, 120, d) * np.exp(-t_arr(d) * 15) * 0.4
def slide(): d = 0.4; return bp(noise(d), 200, 900) * env(d, 0.05, 0.2) * 0.35

# ---------- music bed: soft pad that follows the mood ----------
def pad(at, d, freqs, vol):
    t = t_arr(d); x = np.zeros(len(t))
    for k, f in enumerate(freqs):
        x += np.sin(2 * np.pi * f * t + k) + 0.25 * np.sin(2 * np.pi * f * 2.003 * t)
    x *= (0.75 + 0.25 * np.sin(2 * np.pi * 0.12 * t))
    x = lp(x, 1800) / len(freqs)
    add(at, x * env(d, 2.0, 2.0), vol)
Am = [110, 130.81, 164.81]; Dm = [146.83, 174.61, 220.0]; F = [87.31, 130.81, 174.61]; C_ = [130.81, 164.81, 196.0]; E = [82.41, 123.47, 164.81]
pad(0, 52, Am, 0.06); pad(50, 37, Dm, 0.06); pad(85, 32, Am, 0.06); pad(115, 37, F, 0.055); pad(150, 32, C_, 0.055)
pad(180, 47, E, 0.06); pad(225, 27, Dm, 0.055); pad(250, 30, F, 0.06); pad(278, 20, C_ + [261.63], 0.07)
# soft rhythmic pulse so it doesn't feel static
for b in np.arange(2, 296, 0.75):
    d = 0.3; t = t_arr(d); add(b, np.sin(2 * np.pi * 55 * t) * np.exp(-t * 14) * 0.18)

# ---------- per-scene placement (local time + scene start) ----------
def at(sc, lt): return S[sc - 1] + lt
def pills(sc): add(at(sc, 0.3), pop(), 0.8, -0.6); add(at(sc, 0.45), pop(), 0.8, 0.6)
def caps(sc, ts):
    for x in ts: add(at(sc, x), whoosh(0.4), 0.35)
def steps(sc, a, b):
    for x in np.arange(a, b, 0.36): add(at(sc, x), step(), 0.6)

# S1 — city goes dark
pills(1); add(at(1, 0), hum(6.4, 1.2))
for x in np.arange(5.7, 6.4, 0.07): add(at(1, x), click(), 0.5)
add(at(1, 6.4), powerdown()); add(at(1, 6.4), boom()); caps(1, [6.9, 13.8])
# S2 — hour 1
pills(2); caps(2, [2.5, 14.2, 24.3]); steps(2, 3.6, 7.0); steps(2, 23.6, 26.6)
add(at(2, 7.4), slide()); [add(at(2, x), pop()) for x in (8.0, 8.6, 9.2)]; add(at(2, 10.4), click(), 1.2)
add(at(2, 15.0), click(), 1.4); add(at(2, 16.8), click(), 1.4); add(at(2, 15.3), ding(), 0.8); add(at(2, 17.1), ding(), 0.8)
add(at(2, 18.6), pop()); add(at(2, 19.4), zap()); add(at(2, 20.2), zap(), 0.8); add(at(2, 27.0), click(), 1.4); add(at(2, 27.2), pop())
# S3 — fridge clock
pills(3); caps(3, [1.8, 14.3, 22.6]); add(at(3, 2.6), pop())
for x in np.arange(3.0, 35.0, 0.5): add(at(3, x), tick(), 0.7)
add(at(3, 8.0), pop()); add(at(3, 8.3), pop(), 0.7); add(at(3, 11.4), click()); steps(3, 13.8, 16.4)
add(at(3, 17.3), whoosh(0.8), 0.7); add(at(3, 17.5), bp(noise(2.4), 2000, 8000) * env(2.4, 0.2, 1.5) * 0.12)
add(at(3, 18.4), buzz()); add(at(3, 20.3), thud())
[add(at(3, x), pop()) for x in (23.4, 24.0, 24.6, 25.2, 27.4, 28.0)]
# S4 — candles
pills(4); add(at(4, 2.0), bp(noise(0.3), 1000, 5000) * env(0.3, 0.01, 0.2) * 0.4)
[add(at(4, 2.4 + i * 0.7), pop(), 0.5) for i in range(4)]
add(at(4, 6.3), buzz()); add(at(4, 6.3), boom(), 0.5); caps(4, [6.4, 14.6, 20.4])
add(at(4, 8.2), crackle(5.45)); add(at(4, 11.0), siren(2.65)); add(at(4, 11.2), pop()); add(at(4, 11.6), pop(), 0.7)
add(at(4, 13.6), whoosh(0.5), 0.6); add(at(4, 15.4), ding(), 0.8); add(at(4, 20.2), crackle(9.8, False), 0.12); add(at(4, 21.6), pop())
# S5 — water
pills(5); caps(5, [2.0, 10.6, 17.6, 24.6]); add(at(5, 0), generator(7.0, 0.35)); add(at(5, 7.0), powerdown(), 0.6)
add(at(5, 2.6), pop()); add(at(5, 3.0), pop(), 0.7); add(at(5, 7.0), buzz())
for x in np.arange(0.5, 7.4, 0.5): add(at(5, x), drip(), 0.6, 0.3)
add(at(5, 7.4), lp(noise(2.6), 400) * env(2.6, 0.2, 1.0) * 0.3)
add(at(5, 10.3), water(6.6)); add(at(5, 12.0), ding(), 0.8)
[add(at(5, x), pop()) for x in (17.3, 17.7, 18.6, 21.8)]; [add(at(5, 20.0 + k * 0.22), pop(), 0.6) for k in range(7)]
steps(5, 24.0, 27.0); add(at(5, 25.0), water(2.0), 0.5); add(at(5, 27.4), ding(), 0.8); add(at(5, 27.8), pop(), 0.7)
add(at(5, 29.4), pop()); add(at(5, 30.0), buzz()); add(at(5, 30.2), pop(), 0.7)
# S6 — phone
pills(6); caps(6, [2.4, 11.4, 19.4]); [add(at(6, x), click(), 1.2) for x in (6.2, 7.4, 9.0)]
[add(at(6, x), pop(), 0.6) for x in (6.2, 7.4, 9.0)]; [add(at(6, 9.0 + k * 0.12), tick(), 0.8) for k in range(12)]
add(at(6, 11.0), whoosh(0.5), 0.6); add(at(6, 12.0), whoosh(2.0), 0.5); add(at(6, 14.0), ding()); add(at(6, 14.2), pop(), 0.7)
add(at(6, 15.4), ring()); add(at(6, 17.0), buzz()); add(at(6, 19.0), whoosh(0.5), 0.6)
add(at(6, 20.4), pop()); add(at(6, 21.0), ding(), 0.6); add(at(6, 24.4), pop()); add(at(6, 24.9), buzz()); add(at(6, 25.0), pop(), 0.7)
# S7 — temperature + CO
pills(7); caps(7, [2.4, 14.3, 19.5, 26.3, 33.6]); add(at(7, 0), wind(14.0))
add(at(7, 8.0), rustle()); add(at(7, 9.4), rustle(0.8)); add(at(7, 8.2), pop(), 0.7); add(at(7, 11.0), pop()); add(at(7, 11.5), pop(), 0.7)
add(at(7, 14.0), whoosh(0.5), 0.6); add(at(7, 14.0), bp(noise(5), 3500, 6000) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t_arr(5))) * env(5, 0.5, 0.5) * 0.06)
add(at(7, 15.0), pop()); add(at(7, 15.6), gulp()); add(at(7, 16.0), gulp()); add(at(7, 16.6), pop()); add(at(7, 17.0), pop(), 0.7)
add(at(7, 19.0), generator(14.0)); add(at(7, 33.0), generator(12.0, 0.45))
[add(at(7, x), pop()) for x in (21.0, 21.5, 22.0)]; [add(at(7, x + 0.5), buzz(), 0.7) for x in (21.0, 21.5, 22.0)]
add(at(7, 22.6), pop(), 0.7); [add(at(7, x), heartbeat(), 0.7) for x in np.arange(23.0, 33.0, 0.9)]
add(at(7, 26.2), boom(), 0.6); add(at(7, 27.0), pop(), 0.7); add(at(7, 33.0), whoosh(0.5), 0.6)
add(at(7, 33.2), slide()); add(at(7, 35.6), whoosh(0.8), 0.5); add(at(7, 36.4), pop()); add(at(7, 37.4), ding())
# S8 — gas station
pills(8); caps(8, [2.4, 15.6]); add(at(8, 2.8), pop()); add(at(8, 3.3), buzz()); add(at(8, 6.2), pop()); add(at(8, 6.7), buzz())
add(at(8, 6.8), pop(), 0.7); add(at(8, 9.4), lp(noise(1.2), 600) * env(1.2, 0.1, 0.6) * 0.3); add(at(8, 10.4), pop(), 0.7); add(at(8, 11.4), pop())
add(at(8, 15.0), whoosh(0.5), 0.6); add(at(8, 15.3), pop()); add(at(8, 15.6), sweep(200, 700, 1.4) * env(1.4, 0.05, 0.3) * 0.15)
add(at(8, 16.2), pop(), 0.7); add(at(8, 17.6), pop(), 0.6); add(at(8, 18.0), pop()); add(at(8, 18.1), rustle(0.4)); add(at(8, 18.8), pop(), 0.7)
# S9 — power back
for x in np.arange(1.0, 2.4, 0.09): add(at(9, x), zap(), 0.25)
add(at(9, 2.4), powerup()); add(at(9, 2.4), hum(8.6, 0.6)); add(at(9, 2.6), pop()); caps(9, [4.0, 11.6, 20.2])
[add(at(9, x), pop()) for x in (5.6, 6.6, 7.8)]; add(at(9, 6.4), click(), 1.2); add(at(9, 6.9), pop(), 0.7); add(at(9, 11.0), whoosh(0.5), 0.6)
for x in np.arange(11.5, 20.0, 1.0): add(at(9, x), beep())
add(at(9, 15.4), pop(), 0.7); add(at(9, 20.3), click(), 1.2)
[add(at(9, x), thud(), 0.8) for x in (21.4, 22.0, 22.6, 23.2)]; [add(at(9, x - 0.8), whoosh(0.5), 0.3) for x in (21.4, 22.0, 22.6, 23.2)]
# S10 — outro
pills(10); caps(10, [1.4, 10.2, 15.8]); add(at(10, 0), hum(19, 0.4))
[add(at(10, 4.0 + i * 0.7), pop()) for i in range(5)]; add(at(10, 15.6), ding()); add(at(10, 15.8), ding(), 0.6)

# ---------- master: gentle limiter, fade out, write ----------
mix = np.tanh(mix * 1.3) * 0.8
fo = int(1.0 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
wavfile.write('soundtrack.wav', SR, (mix * 32767).astype(np.int16))
print('peak', float(np.abs(mix).max()), 'rms', float(np.sqrt((mix ** 2).mean())))
