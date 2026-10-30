"""Procedural SFX + ambience + quiet music bed for "7 days lost in the forest" (15 scenes).
Scene durations are parsed from scene1.js..scene15.js so the track always matches the render.
Writes soundtrack_forest.wav (44.1 kHz stereo 16-bit).  Based on /home/claude/blackout/sfx.py."""
import re, os
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.ndimage import uniform_filter1d
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 44100
DURS = []
for i in range(1, 16):
    src = open(os.path.join(HERE, f'scene{i}.js')).read()
    DURS.append(float(re.search(r'const DUR\s*=\s*([\d.]+)', src).group(1)))
S = [float(x) for x in np.concatenate([[0], np.cumsum(DURS)[:-1]])]   # scene start times
TOTAL = float(sum(DURS)); N = int(round(TOTAL * SR))
mix = np.zeros((N, 2), dtype=np.float32)
rng = np.random.default_rng(11)

# ---------------------------------------------------------------- primitives (from blackout/sfx.py)
def t_arr(d): return np.arange(int(d * SR)) / SR
def env(d, a=0.005, r=None):
    n = int(d * SR); e = np.ones(n)
    na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    if r is None: r = d * 0.6
    nr = min(n, int(r * SR)); e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, f1, f2, o=2): return sosfilt(butter(o, [f1, f2], 'band', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(d * SR))
def sweep(f0, f1, d, kind='sine'):
    t = t_arr(d); f = np.geomspace(f0, f1, len(t)); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) if kind == 'sine' else np.sign(np.sin(ph))
UI_SCALE = 0.6
AMBIENT_MODE = [True]
class Loud(np.ndarray): pass   # danger stings / whistles / big hits keep full level; UI blips & steps are scaled down
def loud(f):
    return lambda *a, **k: np.asarray(f(*a, **k)).view(Loud)
def add(at, x, vol=1.0, pan=0.0):
    i = int(round(at * SR))
    if i >= N or i < 0 or len(x) == 0: return
    if not isinstance(x, Loud) and not AMBIENT_MODE[0]: vol = vol * UI_SCALE
    x = x[: N - i] * vol
    mix[i:i + len(x), 0] += x * (1 - max(0, pan))
    mix[i:i + len(x), 1] += x * (1 + min(0, pan))
def add_pan(at, x, pan_arr, vol=1.0):
    """pan_arr: per-sample pan (+ = right)."""
    i = int(round(at * SR))
    if i >= N or i < 0: return
    n = min(len(x), N - i); x = x[:n] * vol; p = pan_arr[:n]
    mix[i:i + n, 0] += x * (1 - np.clip(p, 0, 1)); mix[i:i + n, 1] += x * (1 + np.clip(p, -1, 0))
def add_lr(at, xl, xr, vol=1.0):
    i = int(round(at * SR))
    if i >= N or i < 0: return
    n = min(len(xl), N - i)
    mix[i:i + n, 0] += xl[:n] * vol; mix[i:i + n, 1] += xr[:n] * vol
def kp(pts, d):
    """piecewise-linear curve from [(t,v),...] sampled over d seconds."""
    t = t_arr(d); a = np.array(pts, float); return np.interp(t, a[:, 0], a[:, 1])

# ---------------------------------------------------------------- UI sounds (old approach)
def pop(f=900):
    d = 0.12; return sweep(f, f * 0.47, d) * env(d, 0.002, 0.1) * 0.6
def ding():
    out = np.zeros(int(0.7 * SR))
    for k, f in enumerate([880, 1318.5]):
        t = t_arr(0.5); s = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 6)
        i = int(k * 0.09 * SR); out[i:i + len(s)] += s
    return out * 0.45
def ding_warm():
    out = np.zeros(int(1.6 * SR))
    for k, f in enumerate([523.25, 659.25, 783.99, 1046.5]):
        t = t_arr(1.2); s = (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 3.2)
        i = int(k * 0.07 * SR); out[i:i + len(s)] += s
    return out * 0.28
def buzz():
    d = 0.28; t = t_arr(d); x = np.sign(np.sin(2 * np.pi * 140 * t)) + 0.5 * np.sign(np.sin(2 * np.pi * 147 * t))
    return lp(x, 1200) * env(d, 0.005, 0.08) * 0.35
def whoosh(d=0.45):
    x = noise(d); t = t_arr(d); f = np.linspace(300, 3000, len(t)); y = np.zeros_like(x)
    for k in range(4):
        a, b = int(k * len(x) / 4), int((k + 1) * len(x) / 4)
        fc = f[(a + b) // 2]; y[a:b] = bp(x, fc * 0.6, fc * 1.4)[a:b]
    return y * np.sin(np.pi * t / d) ** 2 * 0.5
def click(): d = 0.03; return hp(noise(d), 2000) * env(d, 0.001, 0.025) * 0.6
def thud(): d = 0.25; t = t_arr(d); return (np.sin(2 * np.pi * 70 * t) + 0.4 * lp(noise(d), 300)) * np.exp(-t * 18) * 0.8
def tick(): d = 0.02; t = t_arr(d); return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 300) * 0.35
def beep(f=1760): d = 0.12; t = t_arr(d); return np.sin(2 * np.pi * f * t) * env(d, 0.003, 0.03) * 0.25
def boom(): d = 1.6; t = t_arr(d); return (np.sin(2 * np.pi * 48 * t * (1 - t * 0.15)) + 0.3 * lp(noise(d), 200)) * np.exp(-t * 2.2) * 0.65
def heartbeat(): d = 0.5; t = t_arr(d); s = np.sin(2 * np.pi * 55 * t) * np.exp(-t * 20); s2 = np.roll(s, int(0.18 * SR)) * 0.6; return (s + s2) * 0.4
def ring(): d = 1.2; t = t_arr(d); x = (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)) * (t % 0.6 < 0.4); return x * 0.08
def gulp(): d = 0.18; return sweep(300, 120, d) * np.exp(-t_arr(d) * 15) * 0.4
def slide(): d = 0.4; return bp(noise(d), 200, 900) * env(d, 0.05, 0.2) * 0.35
def rustle(d=0.5): return bp(noise(d), 1500, 6000) * env(d, 0.05, 0.3) * 0.25
def drip(): d = 0.15; return sweep(1400, 2600, d) * np.exp(-t_arr(d) * 30) * 0.25
def zap(): d = 0.4; x = hp(noise(d), 1500) * (rng.random(int(d * SR)) > 0.6); return x * env(d, 0.002, 0.2) * 0.5

# ---------------------------------------------------------------- new forest SFX
def step_leaf():
    d = 0.16; t = t_arr(d)
    crunch = bp(noise(d), 600, 4500) * np.exp(-t * 28) * (0.6 + 0.4 * rng.random(len(t)))
    thump = np.sin(2 * np.pi * rng.uniform(80, 110) * t) * np.exp(-t * 45) * 0.5
    return (crunch * 0.55 + thump) * rng.uniform(0.7, 1.0)
def step_soft():
    d = 0.1; t = t_arr(d); return lp(noise(d), 700) * np.exp(-t * 45) * 0.45 * rng.uniform(0.7, 1.0)
def whistle(d=0.42):
    t = t_arr(d)
    vib = 1 + 0.012 * np.sin(2 * np.pi * 6.5 * t) + 0.02 * np.exp(-t * 30)       # slight vibrato + attack chirp
    ph = 2 * np.pi * np.cumsum(2800 * vib) / SR
    tone = np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.1 * np.sin(3 * ph)
    tone *= (1 + 0.22 * np.sin(2 * np.pi * 34 * t))                              # pea trill
    air = bp(noise(d), 2400, 3600) * 0.35
    e = np.ones(len(t)); na = int(0.008 * SR); nr = int(0.07 * SR); e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr)
    x = (tone * 0.5 + air) * e
    out = np.zeros(len(x) + int(0.5 * SR)); out[:len(x)] += x
    for dl, g in ((0.17, 0.28), (0.34, 0.14)):                                   # outdoor slap echo
        i = int(dl * SR); out[i:i + len(x)] += lp(x, 2500) * g
    return out * 0.4
def branch_snap():
    d = 0.35; t = t_arr(d)
    x = hp(noise(d), 1500) * np.exp(-t * 400) * 1.0
    for f, g, dec in ((820, 0.6, 55), (1650, 0.5, 70), (2700, 0.35, 90)):
        x += np.sin(2 * np.pi * f * t) * g * np.exp(-t * dec)
    x += lp(noise(d), 500) * np.exp(-t * 35) * 0.4
    t2 = int(0.045 * SR); x[t2:] += x[:-t2] * 0.35                               # double crack
    return x * 0.8
def stomach_growl(d=1.5):
    t = t_arr(d)
    wob = 0.5 + 0.5 * np.sin(2 * np.pi * (4 + 3 * t / d) * t)
    f = 62 - 14 * t / d; ph = 2 * np.pi * np.cumsum(f * (1 + 0.04 * np.sin(2 * np.pi * 9 * t))) / SR
    x = bp(noise(d), 70, 320) * 0.9 * wob + np.sin(ph) * 0.5 * wob + 0.12 * bp(noise(d), 300, 900) * wob ** 2
    return x * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.7 * 0.9
def shiver(d=1.0):
    clicks = np.zeros(int(d * SR)); tt = rng.uniform(0, 0.04)
    while tt < d - 0.02:
        i = int(tt * SR); k = bp(noise(0.012), 1800, 6500) * np.exp(-t_arr(0.012) * 400) * rng.uniform(0.5, 1.0)
        clicks[i:i + len(k)] += k[: len(clicks) - i]; tt += rng.uniform(0.055, 0.085)
    cloth = bp(noise(d), 300, 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 13 * t_arr(d))) * 0.12
    return (clicks * 1.4 + cloth) * np.sin(np.pi * np.linspace(0, 1, len(clicks))) ** 0.5 * 0.5
def stone_clack():
    d = 0.14; t = t_arr(d); f = rng.uniform(900, 2300)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 75) * 0.5 + np.sin(2 * np.pi * f * 1.6 * t) * np.exp(-t * 110) * 0.25
            + hp(noise(d), 2500) * np.exp(-t * 300) * 0.5) * rng.uniform(0.6, 1.0) * 0.8
def dog_bark(far=True):
    out = np.zeros(int(1.2 * SR))
    for k, st in enumerate((0.0, 0.34)):
        d = 0.2; t = t_arr(d); f = np.linspace(520, 330, len(t)) * (1 + 0.1 * k)
        ph = 2 * np.pi * np.cumsum(f) / SR
        src = (np.sign(np.sin(ph)) * 0.4 + np.sin(ph) + 0.4 * np.sin(2 * ph))
        voc = bp(src, 500, 1000) + 0.8 * bp(src, 1400, 2200) + 0.4 * bp(noise(d), 800, 3000)
        voc *= np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.5 * np.exp(-t * 6)
        i = int(st * SR); out[i:i + len(voc)] += voc
    x = lp(out, 1800)
    for dl, g in ((0.28, 0.25), (0.55, 0.1)): i = int(dl * SR); x[i:] += x[:-i] * g          # distant echo
    return x * 0.3
def alert():
    """red-alert sting: dissonant cluster + siren blips + sub hit."""
    d = 1.6; t = t_arr(d); x = np.zeros(len(t))
    for f in (110, 116.5, 233, 311, 466):
        x += np.sign(np.sin(2 * np.pi * f * t)) * 0.18
    x = lp(x, 1800) * np.exp(-t * 2.0)
    blip = (np.sin(2 * np.pi * 880 * t) + 0.4 * np.sign(np.sin(2 * np.pi * 880 * t))) * ((t % 0.2) < 0.1) * (t < 0.4) * 0.25
    sub = np.sin(2 * np.pi * 45 * t * (1 - 0.1 * t)) * np.exp(-t * 3.5) * 0.9
    hit = lp(noise(d), 1500) * np.exp(-t * 14) * 0.5
    return (x * 0.8 + blip + sub + hit) * env(d, 0.003, 1.2) * 0.5
def stampx():
    th = thud() * 0.9; b = lp(np.sign(np.sin(2 * np.pi * 110 * t_arr(0.22))), 800) * env(0.22, 0.003, 0.15) * 0.22
    th[:len(b)] += b; return th
def stampok():
    d = ding() * 0.9; th = thud() * 0.5; d[:len(th)] += th; return d
def ping(f=1250): d = 0.7; t = t_arr(d); return np.sin(2 * np.pi * f * t) * np.exp(-t * 7) * 0.22
def key(): d = 0.03; t = t_arr(d); return (np.sin(2 * np.pi * rng.uniform(1800, 2600) * t) * np.exp(-t * 200) * 0.2 + hp(noise(d), 3000) * np.exp(-t * 300) * 0.2)
def dtmf(lo, hi): d = 0.13; t = t_arr(d); return (np.sin(2 * np.pi * lo * t) + np.sin(2 * np.pi * hi * t)) * env(d, 0.004, 0.02) * 0.14
def sms(): return np.concatenate([beep(1318) * 1.2, np.zeros(int(0.05 * SR)), beep(1760) * 1.2])
def beep_down(): d = 0.3; return (sweep(700, 300, d) + 0.3 * sweep(1400, 600, d)) * env(d, 0.005, 0.15) * 0.22
def beep_up(): d = 0.3; return (sweep(500, 1500, d) + 0.3 * sweep(1000, 3000, d)) * env(d, 0.005, 0.15) * 0.2
def batt_warn(): return np.concatenate([beep(988) * 1.2, np.zeros(int(0.1 * SR)), beep(740) * 1.2])
def toggle():
    d = 0.07; t = t_arr(d); x = np.sin(2 * np.pi * 1200 * t) * np.exp(-t * 60) * 0.3; c = click() * 0.5; x[:len(c)] += c; return x
def shutter(): c = np.zeros(int(0.2 * SR)); c[:int(0.03 * SR)] += click()[: int(0.03 * SR)] * 1.4; i = int(0.07 * SR); k = lp(noise(0.05), 3500) * np.exp(-t_arr(0.05) * 70); c[i:i + len(k)] += k * 0.7; return c
def sparkle():
    d = 0.5; t = t_arr(d); f = rng.choice([2093, 2637, 3136, 3520, 4186]); return np.sin(2 * np.pi * f * t) * np.exp(-t * 9) * 0.1
def breath(): d = 0.7; return bp(noise(d), 500, 3200) * env(d, 0.15, 0.4) * 0.2
def cloth(d=0.6): return bp(noise(d), 200, 2200) * env(d, 0.1, 0.3) * 0.28
def crinkle(d=1.0):
    x = np.zeros(int(d * SR))
    for _ in range(int(d * 55)):
        i = rng.integers(0, len(x) - 400); k = bp(noise(0.008), 2500, 8000) * np.exp(-t_arr(0.008) * 350) * rng.uniform(0.3, 1.0)
        x[i:i + len(k)] += k
    return x * env(d, 0.03, 0.3) * 0.5
def zipper(d=0.6):
    x = np.zeros(int(d * SR)); tt = 0.0
    while tt < d - 0.01:
        i = int(tt * SR); k = bp(noise(0.006), 2000 + 2500 * tt / d, 7000) * np.exp(-t_arr(0.006) * 500); x[i:i + len(k)] += k
        tt += 0.016 - 0.007 * tt / d
    return x * 0.5
def tear(d=0.4): return hp(noise(d), 1200) * (0.5 + 0.5 * rng.random(int(d * SR))) * env(d, 0.01, 0.15) * 0.3
def splash(d=0.7): return bp(noise(d), 300, 4000) * env(d, 0.02, 0.5) * 0.35
def sizzle(d=0.5): return hp(noise(d), 3000) * env(d, 0.02, 0.4) * 0.12
def steam(d=3.0): return bp(noise(d), 1200, 7000) * env(d, 0.4, 2.0) * 0.14
def bloop(): d = 0.08; return sweep(280, 620, d) * np.exp(-t_arr(d) * 38) * 0.25
def bubbling(d, dens=1.0):
    x = np.zeros(int(d * SR)); n = int(d * 14 * dens)
    for _ in range(n): i = rng.integers(0, len(x) - int(0.1 * SR)); b = bloop() * rng.uniform(0.4, 1.0); x[i:i + len(b)] += b
    return x + bp(noise(d), 500, 2500) * 0.015
def ignite(): d = 0.9; t = t_arr(d); return lp(noise(d), 1500) * np.exp(-t * 4) * (1 - np.exp(-t * 30)) * 0.5 + np.sin(2 * np.pi * 60 * t) * np.exp(-t * 6) * 0.4
def fire_roar(d):
    t = t_arr(d); x = lp(noise(d), 1400) * (0.6 + 0.4 * lp(noise(d), 6))
    x += lp(noise(d), 250) * 0.8
    return x * np.clip(t / 2.5, 0, 1) * env(d, 0.3, 1.2) * 0.35
def wood_clatter():
    x = np.zeros(int(0.8 * SR))
    for dl in (0.0, 0.07, 0.15, 0.22, 0.36):
        i = int(dl * SR); k = stone_clack()[: int(0.1 * SR)]; k = lp(k, 1800) * 1.1; x[i:i + len(k)] += k
    return x
def owl():
    out = np.zeros(int(2.4 * SR)); pat = [(0.0, 0.28), (0.45, 0.28), (0.95, 0.7)]
    for st, d in pat:
        t = t_arr(d); f = 400 - 40 * t / d; ph = 2 * np.pi * np.cumsum(f) / SR
        s = (np.sin(ph) + 0.25 * np.sin(2 * ph)) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
        i = int(st * SR); out[i:i + len(s)] += s
    return lp(out, 1200) * 0.5
def bird_note(f0, f1, d, vib=0):
    t = t_arr(d); f = np.linspace(f0, f1, len(t)) * (1 + vib * np.sin(2 * np.pi * 25 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR; return (np.sin(ph) + 0.15 * np.sin(2 * ph)) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.8
def bird():
    kind = rng.integers(0, 4); base = rng.uniform(2200, 4200); parts = []
    if kind == 0:   # tweet-tweet
        for _ in range(rng.integers(2, 4)): parts += [bird_note(base, base * 1.35, 0.09), np.zeros(int(0.07 * SR))]
    elif kind == 1: # trill
        for _ in range(rng.integers(6, 11)): parts += [bird_note(base, base * 0.9, 0.035), np.zeros(int(0.025 * SR))]
    elif kind == 2: # warble
        f = base
        for _ in range(rng.integers(4, 8)):
            f2 = base * rng.uniform(0.8, 1.4); parts += [bird_note(f, f2, rng.uniform(0.06, 0.12), 0.02), np.zeros(int(0.02 * SR))]; f = f2
    else:           # descending whistle
        parts += [bird_note(base * 1.2, base * 0.75, 0.3)]
    return np.concatenate(parts) * 0.5

def heli_core(d, f_rotor, f_whine, hard=1.0):
    """f_rotor / f_whine: per-sample frequency arrays (Hz). returns mono at unit-ish amplitude."""
    n = len(f_rotor); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(f_rotor) / SR
    pulse = (0.5 + 0.5 * np.cos(ph)) ** 5
    body = lp(rng.standard_normal(n), 420) * 1.4 + np.sin(2 * np.pi * np.cumsum(f_rotor * 5.5) / SR) * 0.3
    slap = hp(rng.standard_normal(n), 1200) * pulse ** 2 * 0.25 * hard
    thump = body * pulse * (1 + 0.15 * np.sin(2 * np.pi * 0.7 * t))
    tail = np.sin(2 * np.pi * np.cumsum(f_rotor * 4.2) / SR) * 0.08
    wph = 2 * np.pi * np.cumsum(f_whine) / SR
    whine = (np.sin(wph) + 0.4 * np.sin(2 * wph) + 0.15 * np.sin(3 * wph)) * (1 + 0.04 * np.sin(2 * np.pi * 3.1 * t))
    hiss = bp(rng.standard_normal(n), 1800, 6500) * 0.12
    return thump * 0.9 + slap + tail + whine * 0.05 + hiss * 0.8
def heli_pass(at, d, t_close, pan0, pan1, peak, far=0.5):
    """far flyover: volume bell around t_close, doppler on whine & rotor, filter opens as it gets near."""
    t = t_arr(d); width = d * 0.28
    prox = np.exp(-((t - t_close) / width) ** 2)
    dop = 1 + 0.07 * np.tanh(-(t - t_close) / (width * 0.5))
    x = heli_core(d, 11.5 * dop, 560 * dop)
    lo, hi = lp(x, 900), lp(x, 5000)
    m = np.clip(prox ** 0.8, 0, 1); x = lo * (1 - m) + hi * m
    g = (0.12 + 0.88 * prox) ** 1.4 * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.5
    pan = np.interp(t, [0, t_close, d], [pan0, (pan0 + pan1) / 2, pan1])
    add_pan(at, x * g, pan, peak)
def heli_hover(at, d, gain_pts, pan_pts, peak, near=1.0, wash=0.0):
    t = t_arr(d)
    g = np.interp(t, *zip(*gain_pts)); pan = np.interp(t, *zip(*pan_pts))
    f_r = 13.5 + 0.8 * np.sin(2 * np.pi * 0.23 * t)
    x = heli_core(d, f_r, 640 + 20 * np.sin(2 * np.pi * 0.4 * t))
    x = lp(x, 1200) * (1 - near) + x * near
    if wash:
        w = lp(rng.standard_normal(len(t)), 700) * (0.6 + 0.4 * np.sin(2 * np.pi * 13.5 * t)) * np.clip(g - 0.4, 0, 1)
        x = x + w * wash
    add_pan(at, x * g, pan, peak)

for _n in ('alert', 'boom', 'stampx', 'whistle', 'branch_snap', 'dog_bark', 'ignite', 'fire_roar'):
    globals()[_n] = loud(globals()[_n])

# ---------------------------------------------------------------- ambience controls (levels per layer over time)
CR = 50
LAYERS = ['birds', 'wind', 'crickets', 'owl', 'rain', 'stream', 'fire', 'room']
LV = {k: np.zeros(int(TOTAL * CR) + 2) for k in LAYERS}
def A(layer, sc, t0, t1, v):
    g0 = S[sc - 1] + t0; g1 = S[sc - 1] + (DURS[sc - 1] if t1 is None else t1)
    LV[layer][int(g0 * CR):int(g1 * CR)] = v
def lvl(layer, tt):
    return float(LV[layer][min(int(tt * CR), len(LV[layer]) - 1)])
def ambience(): pass  # filled below

# scene-by-scene time-of-day ambience  (A(layer, scene, t0, t1(None=end), level))
A('birds', 1, 0, None, .8);  A('wind', 1, 0, None, .3)
A('birds', 2, 0, None, .7);  A('wind', 2, 0, None, .3)
A('birds', 3, 0, 22.4, .2);  A('wind', 3, 0, 22.4, .15); A('birds', 3, 22.4, None, .7); A('wind', 3, 22.4, None, .3)
A('crickets', 4, 0, 9, .5); A('crickets', 4, 9, 11.5, .25); A('crickets', 4, 11.5, None, .1); A('wind', 4, 0, None, .5); A('birds', 4, 0, 8, .1); A('owl', 4, 0, 8, .2)
A('rain', 4, 8.8, 10, .3); A('rain', 4, 10, 11.5, .6); A('rain', 4, 11.5, None, 1.0)
A('rain', 5, 0, 2.5, .5); A('crickets', 5, 0, None, .5); A('wind', 5, 0, None, .4); A('owl', 5, 0, None, .2)
A('birds', 6, 0, None, .6); A('wind', 6, 0, None, .2); A('stream', 6, 0, None, .9); A('fire', 6, 13, None, .5)
A('birds', 7, 0, 12.6, .55); A('wind', 7, 0, 12.6, .3); A('fire', 7, 0, 12.2, .45)
A('crickets', 7, 13.2, None, .6); A('owl', 7, 13.2, None, .35); A('wind', 7, 13.2, None, .4); A('fire', 7, 13.2, None, .9)
A('birds', 8, 0, None, .5); A('birds', 8, 3, 6.5, .2); A('wind', 8, 0, None, .3); A('birds', 8, 26, None, .6); A('wind', 8, 26, None, .25)
A('birds', 9, 0, 12, .35); A('wind', 9, 0, 12, .3); A('birds', 9, 12, 20.4, .5); A('wind', 9, 12, 20.4, .55); A('fire', 9, 12.9, 20.4, .12)
A('birds', 9, 20.4, None, .3); A('wind', 9, 20.4, None, .4)
A('birds', 10, 0, 7, .5); A('birds', 10, 7, 14.2, .12); A('wind', 10, 0, 14.4, .3)
A('crickets', 10, 14.6, None, .5); A('wind', 10, 14.6, None, .3); A('fire', 10, 14.6, None, .85); A('owl', 10, 16, None, .2)
A('crickets', 11, 0, 16, .7); A('wind', 11, 0, 16.6, .55); A('owl', 11, 0, 16.6, .45); A('fire', 11, 0, 16.6, .5)
A('birds', 11, 17, None, .85); A('stream', 11, 16.6, None, .8); A('wind', 11, 16.6, None, .2); A('fire', 11, 16.6, 24.8, .6); A('fire', 11, 25.4, None, 1.0)
A('birds', 12, 0, 5, .6); A('birds', 12, 5, 17, .35); A('birds', 12, 17, None, .6); A('wind', 12, 0, None, .2)
A('birds', 13, 0, None, .3); A('wind', 13, 0, None, .25); A('fire', 13, 0, None, .8)
A('birds', 14, 0, None, .55); A('wind', 14, 0, None, .2); A('fire', 14, 0, None, .35)
A('room', 15, 0, None, .6); A('birds', 15, 0, None, .12)

def smooth_levels():
    for k in LAYERS:
        LV[k] = np.clip(uniform_filter1d(LV[k], size=int(CR * 1.8), mode='nearest'), 0, 1.5)
def full(layer):  # level at SR rate
    return np.interp(np.arange(N) / SR, np.arange(len(LV[layer])) / CR, LV[layer]).astype(np.float32)

def render_ambience():
    smooth_levels()
    t_full = np.arange(N) / SR
    # wind: slow gusty band noise, decorrelated L/R
    g = full('wind')
    for ch in (0, 1):
        x = bp(rng.standard_normal(N), 110, 900) + 0.5 * lp(rng.standard_normal(N), 160)
        gust = 0.55 + 0.45 * np.sin(2 * np.pi * 0.11 * t_full + rng.uniform(0, 6)) * np.sin(2 * np.pi * 0.047 * t_full + rng.uniform(0, 6))
        mix[:, ch] += (x * gust * g * 0.24).astype(np.float32); del x, gust
    # rain: broadband patter, stereo
    g = full('rain')
    for ch in (0, 1):
        x = bp(rng.standard_normal(N), 900, 9000, 2) * 0.9 + hp(rng.standard_normal(N), 6000) * 0.25
        mix[:, ch] += (x * g * 0.06).astype(np.float32); del x
    # stream babble: band noise amplitude-modulated by slow-ish filtered noise
    g = full('stream')
    for ch in (0, 1):
        x = bp(rng.standard_normal(N), 500, 3800)
        mod = 0.65 + 0.7 * np.clip(lp(rng.standard_normal(N), 14) * 6, -0.5, 0.5)
        y = bp(rng.standard_normal(N), 1500, 5500) * np.clip(lp(rng.standard_normal(N), 25) * 8 + 0.4, 0, 1)
        mix[:, ch] += ((x * mod * 0.8 + y * 0.35) * g * 0.17).astype(np.float32); del x, mod, y
    # room tone (scene 15)
    g = full('room'); x = lp(rng.standard_normal(N), 220) + 0.3 * lp(rng.standard_normal(N), 900)
    for ch in (0, 1): mix[:, ch] += (x * g * 0.14).astype(np.float32)
    del x
    # fire: low rumble + crackle pops
    g = full('fire'); x = bp(rng.standard_normal(N), 70, 500) * (0.7 + 0.3 * lp(rng.standard_normal(N), 5) * 3)
    dens = np.where(g > 0.02, 14 + 30 * g, 0)
    imp = (rng.random(N) < dens / SR) * rng.exponential(1.0, N)
    pops = hp(lp(imp, 7000), 700) * 2.2
    big = (rng.random(N) < (g * 1.4) / SR) * rng.uniform(1, 2.5, N)
    pops += hp(lp(big, 4500), 500) * 4
    fx = ((x * 0.22 + pops * 0.16) * g).astype(np.float32); del x, imp, pops, big
    mix[:, 0] += fx * 0.9; mix[:, 1] += fx * 0.9; del fx
    # crickets: 3 voices with chirp trains
    g = full('crickets')
    for f, rate, pan, ph0 in ((4350, 2.8, -0.5, 0.0), (4700, 3.3, 0.4, 0.37), (3950, 2.3, 0.1, 0.71), (4550, 3.0, -0.2, 0.52)):
        out = np.zeros(N, np.float32)
        for a in range(0, N, SR * 30):
            b = min(N, a + SR * 30); tt = np.arange(a, b) / SR
            if g[a:b].max() < 0.01: continue
            gate = (((tt * rate + ph0) % 1) < 0.3) * (0.5 + 0.5 * np.sin(2 * np.pi * 52 * tt)) ** 1.6
            out[a:b] = (np.sin(2 * np.pi * f * tt) * gate * g[a:b] * (0.8 + 0.2 * np.sin(2 * np.pi * 0.07 * tt + ph0 * 9))).astype(np.float32)
        mix[:, 0] += out * 0.075 * (1 - max(0, pan)); mix[:, 1] += out * 0.075 * (1 + min(0, pan)); del out
    # birds & owls: sparse random events driven by their level curves
    tt = 0.5
    while tt < TOTAL - 2:
        lv = lvl('birds', tt)
        if rng.random() < lv * 0.30:
            add(tt, bird(), rng.uniform(0.17, 0.3) * (0.5 + 0.5 * lv), rng.uniform(-0.8, 0.8))
        tt += 0.5
    tt = 3.0
    while tt < TOTAL - 4:
        lv = lvl('owl', tt)
        if rng.random() < lv * 0.14: add(tt, owl(), 0.28, rng.choice([-0.7, 0.7]))
        tt += 1.0
    # distant light wind-through-leaves rustle accents in day scenes
    tt = 4.0
    while tt < TOTAL - 2:
        if lvl('wind', tt) > 0.2 and rng.random() < 0.08: add(tt, rustle(rng.uniform(0.8, 1.6)), 0.1, rng.uniform(-0.7, 0.7))
        tt += 1.0

# ---------------------------------------------------------------- music bed
def pad(g0, d, freqs, vol, cut=1800, bright=0.25, fade=2.5):
    t = t_arr(d); xs = []
    for ch, det in ((0, 0.9985), (1, 1.0015)):
        x = np.zeros(len(t))
        for k, f in enumerate(freqs):
            x += np.sin(2 * np.pi * f * det * t + k * 1.3) + bright * np.sin(2 * np.pi * f * 2.003 * det * t + k)
        x *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * t + ch)
        xs.append(lp(x, cut) / len(freqs))
    e = env(d, fade, fade)
    add_lr(g0, xs[0] * e, xs[1] * e, vol)
def pluck(g0, f, vol, dec=1.4, pan=0.0):
    d = 3.0; t = t_arr(d)
    x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) + 0.08 * np.sin(6 * np.pi * f * t)) * np.exp(-t * dec) * (1 - np.exp(-t * 200))
    add(g0, x, vol, pan)
def drone(g0, d, f, vol, cut=300):
    t = t_arr(d)
    x = np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 1.5 * t * 1.002) + 0.35 * np.sin(2 * np.pi * f * 2.0 * t * 0.998)
    x = lp(x, cut) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.08 * t)) * env(d, 3.0, 3.0)
    add(g0, x, vol)
def tense(sc, t0, t1, root, notes, vol=1.0, stabs=()):
    """low drone + sparse minor plucks (+ optional dissonant stabs at scene-local times)."""
    g0 = S[sc - 1] + t0; d = t1 - t0
    drone(g0 - 1.0, d + 2.0, root, 0.035 * vol)
    tt = t0 + rng.uniform(1.5, 3.0)
    while tt < t1 - 3:
        pluck(S[sc - 1] + tt, rng.choice(notes), 0.028 * vol, 0.9, rng.uniform(-0.5, 0.5)); tt += rng.uniform(3.2, 6.0)
    for ts in stabs:
        for f in (root * 4, root * 4 * 1.0595): pluck(S[sc - 1] + ts, f, 0.03 * vol, 1.2)

def music():
    gs = lambda sc: S[sc - 1]
    # scene 1-3: neutral, quiet
    pad(gs(1) - .5, DURS[0] + 2, [130.81, 164.81, 196, 246.94], .045)
    pad(gs(2) - 1, DURS[1] + 2, [110, 130.81, 164.81, 196], .045)
    pad(gs(3) - 1, DURS[2] + 2, [87.31, 130.81, 174.61, 220], .04)
    # 4: tense minor (Em)
    tense(4, 0, DURS[3], 82.41, [164.81, 196, 246.94, 329.63, 311.13], 1.0, stabs=(3.0, 16.4))
    # 5: dusk shelter, Dm soft
    pad(gs(5) - 1, DURS[4] + 2, [73.42, 110, 146.83, 174.61], .04, cut=1400)
    # 6: C-ish
    pad(gs(6) - 1, DURS[5] + 2, [130.81, 196, 261.63, 329.63], .042)
    # 7: day G -> night Am
    pad(gs(7) - 1, 14.5, [98, 146.83, 196, 246.94], .04); pad(gs(7) + 12, DURS[6] - 12 + 1, [110, 164.81, 220, 261.63], .042, cut=1500)
    # 8: tense (Dm)
    tense(8, 0, DURS[7], 73.42, [146.83, 174.61, 220, 233.08, 293.66], 1.0, stabs=(6.2,))
    # 9: F -> C (hope on connection)
    pad(gs(9) - 1, 21.5, [87.31, 130.81, 174.61, 220], .04); pad(gs(9) + 19.5, DURS[8] - 19.5 + 1, [130.81, 196, 261.63, 329.63], .05, cut=2400, bright=.35)
    # 10: tense Am with a harsh stab on the mushroom
    tense(10, 0, 14.5, 55.0, [110, 130.81, 164.81, 220, 233.08], 1.0, stabs=(7.0,))
    pad(gs(10) + 13.5, DURS[9] - 13.5 + 1, [110, 164.81, 220, 261.63], .038, cut=1400)
    # 11: tense Em (night) -> sparse hopeful Am/C (morning)
    tense(11, 0, 16.6, 82.41, [164.81, 196, 246.94, 293.66, 311.13], 1.0, stabs=(3.0,))
    pad(gs(11) + 16, 6.5, [110, 164.81, 220, 261.63], .04, cut=1500); pad(gs(11) + 22, DURS[10] - 22 + 1, [130.81, 196, 261.63, 329.63], .045, cut=2200, bright=.3)
    # 12: Am, tension then relief on the whistle
    pad(gs(12) - 1, 19.5, [110, 130.81, 164.81, 196], .042, cut=1500); pad(gs(12) + 17.8, DURS[11] - 17.8 + 1, [130.81, 196, 261.63, 329.63], .05, cut=2400, bright=.35)
    # 13-15: warmer, brighter
    pad(gs(13) - 1, DURS[12] + 2, [130.81, 196, 261.63, 329.63, 392, 493.88], .06, cut=3200, bright=.45)
    pad(gs(13) + 15, 8, [196, 293.66, 392, 493.88], .035, cut=3800, bright=.5)
    pad(gs(14) - 1, DURS[13] + 2, [130.81, 196, 261.63, 329.63, 392, 587.33], .06, cut=3400, bright=.45)
    for i, (tin, f) in enumerate(zip([4.3, 6.6, 8.6, 10.7, 12.4, 13.8], [523.25, 587.33, 659.25, 783.99, 880, 1046.5])): pluck(gs(14) + tin + .05, f, .035, 1.8, -0.3 + .12 * i)
    pad(gs(15) - 1, 10, [98, 146.83, 196, 246.94, 392], .055, cut=3000, bright=.4)
    pad(gs(15) + 8.5, DURS[14] - 8.5, [130.81, 196, 261.63, 329.63, 392, 523.25], .065, cut=3600, bright=.5)

# ---------------------------------------------------------------- scene placement helpers
def at(sc, lt): return S[sc - 1] + lt
def pills(sc): add(at(sc, 0.3), pop(), 0.8, -0.6); add(at(sc, 0.45), pop(), 0.8, 0.6)
def caps(sc, lst):
    """captions: lst of (tA, tB) -> whoosh at first word, pop at second."""
    for a, b in lst: add(at(sc, a), whoosh(0.4), 0.3); add(at(sc, b), pop(1100), 0.5)
def pill(sc, t, pan=0.0): add(at(sc, t), pop(1000), 0.55, pan)
def card(sc, t, pan=0.0, v=0.8): add(at(sc, t), pop(), v, pan)
def steps(sc, a, b, period=0.349, vol=0.5, pan=0.0, soft=False):
    x = a
    while x < b: add(at(sc, x), step_soft() if soft else step_leaf(), vol, pan); x += period
def run(sc, a, b, vol=0.55):
    steps(sc, a, b, 0.196, vol)
def whistle_blast(sc, ts, v=0.55, pan=0.0):
    for x in ts: add(at(sc, x), whistle(), v, pan)
def panx(x): return float(np.clip((x - 960) / 960, -0.9, 0.9))

def place():
    # ===== S1: lost off the trail (21)
    pills(1); steps(1, 0.5, 4.0, vol=.45); steps(1, 4.6, 6.5, vol=.45)
    add(at(1, 4.9), rustle(0.6), .35, .5); add(at(1, 8.2), shutter(), .6)
    add(at(1, 8.4), rustle(0.7), .45, .6); steps(1, 8.5, 9.6, 0.17, .35, .7, soft=True); caps(1, [(8.8, 9.2), (15.7, 16.1)])
    add(at(1, 12.5), pop(), .8); add(at(1, 12.55), beep_down(), .8); add(at(1, 12.7), batt_warn(), .5)
    add(at(1, 14.7), pop(), .8); add(at(1, 14.9), ding(), .6)
    for i in range(7): add(at(1, 16.4 + i * .25), pop(800 + i * 90), .7)
    add(at(1, 16.4 - .1), thud(), .4)
    for x in (13.0, 17.5): add(at(1, x), cloth(.5), .2)
    # ===== S2: S.T.O.P. (23)
    pills(2); run(2, 0.8, 4.0); caps(2, [(3.6, 4.0), (7.0, 7.4)])
    add(at(2, 4.0), stampx(), 1.0); add(at(2, 4.0), alert(), .22); add(at(2, 4.1), cloth(.6), .2)
    add(at(2, 7.3), breath(), .6, .3)
    for x in (7.0, 10.0, 13.0, 17.0): add(at(2, x), pop(700), .85); add(at(2, x + .18), ding(), .35)
    add(at(2, 8.0), click(), 1.0); add(at(2, 8.6), slide(), .4); add(at(2, 9.0), gulp(), 1.0); add(at(2, 9.35), gulp(), .8); add(at(2, 10.1), click(), .8)
    add(at(2, 10.8), pop(), .7, .3); add(at(2, 11.0), sweep(500, 800, .25) * env(.25, .01, .2) * .15, 1, .3)
    add(at(2, 13.6), whoosh(.6), .4, -.3); add(at(2, 13.9), ding(), .5, -.3)
    for i in range(9): add(at(2, 13.3 + i * .25), step_soft(), .35 + .03 * i, -0.8 + i * .12)
    add(at(2, 17.8), pop(), .85, .6); add(at(2, 18.9), pop(), .6, .6); add(at(2, 19.0), pop(1000), .6, .6); add(at(2, 19.6), stampok(), .8, .8)
    # ===== S3: stay put (29)
    pills(3); caps(3, [(1.2, 1.6), (23.6, 24.0)]); add(at(3, .3), whoosh(.6), .4)
    add(at(3, 4.6), pop(), .9, 0); add(at(3, 4.7), thud(), .35)
    for x in np.arange(5.4, 9.2, 1.0): add(at(3, x), ping(), .5)
    add(at(3, 9.2), whoosh(.8), .4)
    for i, x in enumerate(np.arange(9.4, 15.7, .55)): add(at(3, x), tick(), .5 + .1 * np.sin(i), -.3 + .6 * (i % 2))
    add(at(3, 13.4), stampok(), .8, -.2); add(at(3, 15.2), whoosh(.7), .4)
    add(at(3, 15.6), pop(), .85, .6); steps(3, 16.0, 17.6, .3, .3, .7, soft=True)
    add(at(3, 17.6), sweep(900, 140, 1.0) * env(1.0, .02, .8) * .25, 1, .7); add(at(3, 18.5), branch_snap(), .35, .7)
    add(at(3, 17.9), stampx(), .9, .7); add(at(3, 18.6), thud(), .8, .7); add(at(3, 19.0), rustle(.6), .3, .7)
    add(at(3, 19.9), pop(), .85, .6); add(at(3, 20.0), sms(), .8, .6); add(at(3, 21.4), sms(), .5, .6)
    add(at(3, 22.5), whoosh(1.2), .45); steps(3, 22.8, 24.6, .349, .5)
    add(at(3, 25.0), cloth(.6), .45); add(at(3, 25.15), thud(), .35); add(at(3, 25.2), pop(700), .7, -.3); add(at(3, 25.3), ding_warm(), .5)
    # ===== S4: the cold (21)
    pills(4); caps(4, [(4.2, 4.6), (16.4, 16.8)])
    add(at(4, 0.8), branch_snap(), .5, .6); add(at(4, 1.0), lp(noise(2.4), 160) * env(2.4, .5, 1.5) * .55, 1, .6)
    add(at(4, 1.2), step_soft(), .5, .6); add(at(4, 1.9), step_soft(), .5, .6); add(at(4, 2.6), step_soft(), .45, .55)
    add(at(4, 3.0), alert(), .8); add(at(4, 3.0), stampx(), 1.0, .6)
    add(at(4, 4.4), pop(), .85, .8); add(at(4, 4.8), sweep(600, 180, 3.8) * env(3.8, .1, 3.0) * .08, 1, .8)
    add(at(4, 9.5), cloth(.8), .4)
    for x in np.arange(10.0, 21, .85): add(at(4, x + rng.uniform(0, .3)), drip(), .4, rng.uniform(-.6, .6))
    for x in np.arange(12.2, 16.3, 1.15): add(at(4, x), shiver(1.0), .8)
    steps(4, 14.0, 16.3, .42, .45); add(at(4, 16.25), thud(), .5)
    add(at(4, 16.4), alert(), .9)
    for x in np.arange(16.9, 21, 1.0): add(at(4, x), heartbeat(), .75 * (1 - (x - 16.9) / 6))
    add(at(4, 17.4), shiver(1.2), .6)
    # ===== S5: shelter (29)
    pills(5); caps(5, [(13.4, 13.8), (19.3, 19.7)])
    steps(5, 1.0, 9.6, .349, .4, 0.2)
    for i, x in enumerate([2.2, 4.4, 6.5, 8.6]): add(at(5, x), branch_snap(), .45, .1 + .1 * i)
    for x in np.arange(1.6, 9.2, 1.25): add(at(5, x), wood_clatter(), .3, .3); add(at(5, x + .5), rustle(.5), .35, .3)
    add(at(5, 9.7), pop(), .85, .8); add(at(5, 10.8), tear(.4), .7, .8); add(at(5, 10.8), crinkle(2.0), .5, .2); add(at(5, 11.2), pop(), .7, .8)
    add(at(5, 13.8), pop(), .85, .8); add(at(5, 15.0), pop(1100), .7, .8); add(at(5, 15.2), ding(), .7, .8)
    add(at(5, 16.6), pop(), .85, .5); add(at(5, 16.6), alert(), .45, .5)
    add(at(5, 19.3), pop(), .85, .8); add(at(5, 21.2), stampx(), .9, .9); add(at(5, 21.2), buzz(), .45, .9)
    for i, x in enumerate(np.arange(23.2, 24.4, .1)): add(at(5, x), rustle(.35), .35, -.1)
    add(at(5, 24.2), stampok(), .8, .9); add(at(5, 24.0), cloth(1.2), .35); steps(5, 25.4, 26.9, .349, .45)
    add(at(5, 26.9), cloth(.6), .3); add(at(5, 27.3), ding_warm(), .35)
    # ===== S6: water (27)
    pills(6); caps(6, [(15.6, 16.0), (19.7, 20.1)])
    add(at(6, 2.6), pop(), .85, -.3); add(at(6, 3.0), pop(900), .6, -.3); add(at(6, 4.4), pop(1100), .5); add(at(6, 4.6), pop(), .85, .3); add(at(6, 4.7), drip(), .6, .3); add(at(6, 5.0), pop(900), .6, .3)
    add(at(6, 6.5), whoosh(.4), .4)
    for x in (7.2, 7.9, 8.6): add(at(6, x), gulp(), 1.0); add(at(6, x + .05), splash(.2), .15)
    add(at(6, 9.6), pop(), .9, .5)
    for i in range(10): add(at(6, 9.8 + i * .22), bloop(), .5, rng.uniform(-.2, .8))
    add(at(6, 10.1), pop(900), .6, .5); add(at(6, 10.3), alert(), .35, .5)
    steps(6, 11.2, 12.4, .349, .4)
    add(at(6, 12.3), ignite(), .8, .6)
    add(at(6, 13.6), bubbling(8.8, 1.0), .5, .6); add(at(6, 13.6), bubbling(1.8, .5), .3, .6)
    add(at(6, 15.0), pop(), .85, .6)
    for x in np.arange(15.6, 18.8, 1.0): add(at(6, x), tick(), .8, .6)
    add(at(6, 18.8), tick(), .8, .6); add(at(6, 19.4), pop(900), .9, .6); add(at(6, 19.45), ding(), .7, .6); add(at(6, 19.6), pop(), .85, -.3)
    for x in np.arange(20.2, 22.4, 1.0): add(at(6, x), tick(), .7, .6)
    add(at(6, 22.5), ding_warm(), .45); add(at(6, 22.7), whoosh(1.3), .4)
    for i in range(10): add(at(6, 22.75 + i * .13), tick(), .5, -.5 + i * .12)
    add(at(6, 23.2), pop(), .6, 0)
    # ===== S7: fire (24)
    pills(7); caps(7, [(6.0, 6.4), (13.3, 13.7), (17.8, 18.2)])
    for tin, pan in ((1.2, -.5), (2.6, 0), (3.9, .5)): card(7, tin, pan); pill(7, tin + .2, pan)
    for tin, pan in ((1.9, -.25), (3.3, .25)): add(at(7, tin), pop(1200), .6, pan)
    add(at(7, 5.7), whoosh(.5), .35)
    for k in range(5):
        t0 = 7.0 + k * .95
        add(at(7, t0 + .1), cloth(.35), .3, -.3); add(at(7, t0 + .05), whoosh(.35), .25, -.1); add(at(7, 7.88 + k * .95), sizzle(.45), 1.0, .1)
    add(at(7, 8.2), steam(3.5), .9); add(at(7, 10.8), pop(), .8, .5)
    add(at(7, 12.2), whoosh(1.2), .35)
    add(at(7, 15.2), pop(), .8, .4)
    for i in range(3): add(at(7, 15.0 + i * .18), stone_clack(), .7, .2)
    add(at(7, 19.3), pop(), .85, .8); add(at(7, 19.3), fire_roar(4.7), .6, .6); add(at(7, 19.6), pop(900), .6, .8)
    add(at(7, 20.3), stampx(), 1.0, .8); add(at(7, 20.3), alert(), .55, .6)
    # ===== S8: signals (36)
    pills(8); caps(8, [(6.2, 6.7), (10.6, 11.0), (26.6, 27.0)])
    heli_pass(at(8, 1.0), 5.8, 2.9, .8, -.8, .45)
    add(at(8, 2.2), pop(), .5, -.2)
    for x in (4.3, 4.65, 5.0, 5.35): add(at(8, x), step_soft(), .4, -.2)
    add(at(8, 5.8), whoosh(1.0), .5); add(at(8, 6.6), pop(), .8); add(at(8, 6.1), shutter(), .45)
    for x in np.arange(6.4, 9.2, .6): add(at(8, x), ping(1500), .35)
    add(at(8, 7.4), pop(), .85, .5); add(at(8, 7.5), stampx(), .8, .6); add(at(8, 8.0), pop(900), .7, .2)
    add(at(8, 9.2), whoosh(.9), .45)
    add(at(8, 10.5), pop(), .9); add(at(8, 10.55), ding(), .6); add(at(8, 11.0), pop(1000), .6)
    add(at(8, 15.0), pop(), .85, .6)
    for i in range(3):
        x = 15.6 + i * .95; add(at(8, x), whistle(), .6, .1); add(at(8, x), pop(1200), .45, .6)
    for i, x in enumerate((20.2, 20.95, 21.7)): add(at(8, x), pop(500 + 80 * i), .6, -.2 + .3 * i); add(at(8, x + .03), whoosh(.3), .25, -.2 + .3 * i)
    add(at(8, 20.3), pop(1000), .6)
    heli_hover(at(8, 22.3), 4.4, [(0, 0), (.6, 1), (3.4, 1), (4.4, 0)], [(0, .55), (4.4, .45)], .2, near=0.0)
    for i, x in enumerate(np.arange(22.6, 25.4, .35)): add(at(8, x), sparkle(), .8, -.2 + .15 * (i % 4))
    add(at(8, 24.4), pop(), .6, .3)
    for i, x in enumerate(np.linspace(26.7, 29.5, 20)): add(at(8, x + rng.uniform(-.03, .03)), stone_clack(), .75, -.8 + 1.6 * (i / 19))
    add(at(8, 29.7), pop(), .8, .7); add(at(8, 29.8), pop(1000), .6, .7)
    add(at(8, 30.6), pop(), .85, -.5); add(at(8, 30.9), pop(1000), .6, -.5); add(at(8, 31.0), ding(), .5, -.5)
    add(at(8, 31.6), whoosh(.6), .35, .8); add(at(8, 31.9), cloth(1.2), .22, .8)
    # ===== S9: phone (25)
    pills(9); caps(9, [(5.9, 6.4), (20.6, 21.0)])
    add(at(9, 1.8), pop(), .85, -.3); add(at(9, 1.85), beep_down(), .8, -.3); add(at(9, 1.9), stampx(), .6, -.3); add(at(9, 2.1), pop(900), .6, -.3)
    add(at(9, 3.0), pop(), .85, .4); add(at(9, 3.05), batt_warn(), .9, .4); add(at(9, 3.3), pop(900), .6, .4)
    add(at(9, 4.9), pop(), .85, .5); add(at(9, 6.05), toggle(), 1.0, .5); add(at(9, 6.5), beep_up(), .35, .5)
    add(at(9, 7.0), whoosh(.6), .35); add(at(9, 8.4), cloth(1.0), .5)
    add(at(9, 9.4), ding_warm(), .5)
    add(at(9, 10.4), pop(), .85, .5); add(at(9, 10.9), pop(900), .6, .5); add(at(9, 11.4), stampx(), .8, .5)
    add(at(9, 11.6), sweep(500, 90, 1.0) * env(1.0, .02, .7) * .15, 1, .5)
    add(at(9, 12.0), whoosh(.8), .35); steps(9, 12.6, 17.2, .349, .4, 0, soft=False)
    add(at(9, 14.2), pop(900), .6, .5)
    add(at(9, 16.8), whoosh(.9), .3, -.2); add(at(9, 17.3), pop(1000), .6)
    add(at(9, 18.8), cloth(.7), .35)
    add(at(9, 19.6), whoosh(.5), .4); add(at(9, 19.7), pop(), .8)
    add(at(9, 20.6), beep_up(), .9); add(at(9, 20.8), pop(), .85, .5); add(at(9, 21.0), pop(1000), .6, .5); add(at(9, 21.1), ding(), .8)
    add(at(9, 22.4), whoosh(.5), .35)
    for i, (lo, hi) in enumerate(((852, 1477), (697, 1209), (697, 1209))): add(at(9, 22.7 + i * .25), dtmf(lo, hi), 1.0)
    add(at(9, 22.6), pop(), .8, .7); add(at(9, 23.6), ring(), 1.0); add(at(9, 24.4), ring(), 1.0)
    # ===== S10: hunger (24)
    pills(10); caps(10, [(7.4, 7.8), (18.6, 19.0)])
    add(at(10, 0.8), stomach_growl(1.6), .9); add(at(10, 2.1), stomach_growl(1.2), .7)
    steps(10, 3.4, 6.0, .349, .45)
    for x in (4.2, 4.9, 5.5): add(at(10, x), rustle(.4), .15, .6)
    for x in (5.5,): add(at(10, x), sparkle(), .6, .6)
    add(at(10, 6.0), cloth(.5), .4); add(at(10, 6.05), click(), .7)
    add(at(10, 7.0), boom(), 1.0); add(at(10, 7.0), alert(), .9); add(at(10, 7.1), pop(), .8, -.2); add(at(10, 7.5), stampx(), 1.0, .8)
    for x in np.arange(7.6, 14.2, .62): add(at(10, x), heartbeat(), .9 * (1 - .4 * (x - 7.6) / 6.6))
    add(at(10, 12.3), pop(1000), .8, .5); add(at(10, 12.3), thud(), .9); add(at(10, 12.35), alert(), .35)
    add(at(10, 14.0), whoosh(1.0), .4); add(at(10, 14.8), pop(), .85); add(at(10, 14.85), ding_warm(), .5)
    add(at(10, 15.4), pop(1000), .6); add(at(10, 19.0), ding_warm(), .35); add(at(10, 19.1), cloth(.8), .25)
    # ===== S11: night 5 -> morning (27)
    pills(11); caps(11, [(6.6, 7.0), (13.6, 14.0), (21.0, 21.4)])
    add(at(11, 3.0), branch_snap(), 1.0, .6); add(at(11, 3.2), alert(), .55)
    for x in np.arange(3.3, 9.4, .55 - 0.0): add(at(11, x), heartbeat(), .6)
    for x, p in ((3.4, .9), (5.0, -.85), (5.6, .95)): add(at(11, x), sparkle(), .7, p); add(at(11, x), lp(noise(.5), 400) * env(.5, .05, .4) * .12, 1, p)
    for x in (6.8, 7.65, 8.5): add(at(11, x), whistle(), .55, -.1)
    add(at(11, 6.3), cloth(.5), .3)
    add(at(11, 13.6), lp(noise(3), 120) * env(3, .5, 2) * .6, 1)
    add(at(11, 13.8), rustle(2.6), .06)
    add(at(11, 16.6), whoosh(1.5), .45); add(at(11, 16.8), ding_warm(), .35)
    add(at(11, 17.3), pop(), .8, -.2)
    for i, x in enumerate((20.3, 20.55, 20.8)): add(at(11, x), pop(), .8, .3 + .25 * i); add(at(11, x + .2), pop(1000), .5, .3 + .25 * i)
    steps(11, 20.3, 21.2, .349, .4, .3); add(at(11, 21.6), splash(.5), .6, .7); add(at(11, 21.9), gulp(), .8, .7)
    add(at(11, 22.2), ding(), .8, .2); steps(11, 22.2, 23.4, .349, .4, 0)
    add(at(11, 23.4), cloth(.5), .3); add(at(11, 23.7), wood_clatter(), .5, -.5); steps(11, 23.9, 25.0, .349, .4, -.2)
    add(at(11, 25.0), ding(), .8, .4); add(at(11, 25.0), wood_clatter(), .8, .3); add(at(11, 25.0), ignite(), .35, .3)
    add(at(11, 25.9), ding(), .8, .7)
    for x in (25.5, 26.1, 26.7): add(at(11, x), whistle(), .5, .1)
    # ===== S12: don't hide (21)
    pills(12); caps(12, [(17.0, 17.4)])
    steps(12, 2.0, 8.0, .349, .12, .85, soft=True); steps(12, 9.0, 13.0, .349, .12, .9, soft=True)
    for x in (1.9, 2.9, 3.9, 9.6): add(at(12, x), pop(600), .4, .8)
    add(at(12, 3.6), dog_bark(), .55, .85)
    add(at(12, 5.4), pop(), .8, -.3); add(at(12, 5.45), stampx(), .8, -.3)
    for x in np.arange(5.4, 17.0, .72): add(at(12, x), heartbeat(), .55)
    add(at(12, 8.0), cloth(.5), .15, -.3); add(at(12, 11.5), dog_bark(), .5, .85)
    add(at(12, 13.2), pop(), .85, .5); add(at(12, 14.0), pop(1000), .85, .8); add(at(12, 14.1), ding(), .35, .8)
    add(at(12, 15.0), dog_bark(), .55, .8)
    steps(12, 16.8, 17.7, .349, .5, -.2); add(at(12, 16.7), rustle(.6), .35, -.3)
    steps(12, 17.9, 20.0, .22, .12, .8, soft=True)
    for i, x in enumerate((18.1, 18.85, 19.6)): add(at(12, x), whistle(), .6, -.2); add(at(12, x + .02), pop(1100), .35, 0)
    add(at(12, 18.2), stampok(), .8, 0); add(at(12, 18.3), pop(), .8, .8); add(at(12, 18.35), sparkle(), .8, .8)
    add(at(12, 18.55), dog_bark(), .6, .85); add(at(12, 19.4), dog_bark(), .65, .85); add(at(12, 20.2), dog_bark(), .55, .85)
    add(at(12, 20.6), ding_warm(), .4)
    # ===== S13: found (21)
    pills(13); caps(13, [(10.3, 10.7), (17.6, 18.0)])
    heli_hover(at(13, 1.8), 4.2, [(0, 0), (.8, .5), (3.2, .8), (4.2, 0)], [(0, .75), (4.2, .55)], .32, near=0.35)
    steps(13, 4.8, 7.6, .196, .5)
    add(at(13, 5.4), pop(), .7, .6); add(at(13, 5.5), pop(1000), .5, .6)
    add(at(13, 7.4), rustle(.6), .45, -.3); add(at(13, 8.0), whoosh(.45), .3, 0); add(at(13, 8.9), steam(4.0), 1.0, -.2); add(at(13, 8.9), sizzle(1.0), 1.2, -.2)
    heli_hover(at(13, 12.8), 8.2, [(0, 0), (.4, .12), (2.5, .6), (3.1, .5), (4.8, .85), (8.2, .95)],
               [(0, .85), (2.5, .35), (4.0, .1), (5.0, -.1), (8.2, -.1)], .42, near=1.0, wash=0.3)
    for i, x in enumerate(np.arange(17.5, 21, .25)): add(at(13, x), sparkle(), .55, -.7 + .1 * i % 1.4)
    add(at(13, 17.6), ding_warm(), .55)
    # ===== S14: recap (17)
    pills(14); caps(14, [(1.6, 2.0)]); add(at(14, 1.6), ding_warm(), .45)
    cards = [4.3, 6.6, 8.6, 10.7, 12.4, 13.8]
    for i, x in enumerate(cards): card(14, x, -.7 + i * .28, .8); pill(14, x + .15, -.7 + i * .28); add(at(14, x + .25), ding(), .3, -.7 + i * .28)
    add(at(14, 10.7), bubbling(1.5, 1.2), .4, 0)
    add(at(14, 14.3), stampx(), .8, .55); add(at(14, 15.0), ding_warm(), .4)
    # ===== S15: outro (21)
    pills(15); caps(15, [(2.6, 3.0), (8.4, 8.8), (15.8, 16.2)])
    add(at(15, 2.0), cloth(.4), .2)
    add(at(15, 2.8), pop(), .8, .1); add(at(15, 2.9), sms(), .6, .1)
    for i, x in enumerate(np.linspace(3.6, 5.0, 21)): add(at(15, x), key(), .8, 0.1)
    add(at(15, 5.6), whoosh(.5), .35); add(at(15, 5.7), beep_up() * .7, .8); add(at(15, 5.9), ding(), .6)
    for x in (7.0, 7.1, 7.2): add(at(15, x), pop(850 + (x - 7) * 800), .6, -.8 + (x - 7) * 3)
    for k, ta in enumerate((8.2, 9.6, 11.0)):
        add(at(15, ta), whoosh(.9), .35, -.5 + k * .3); add(at(15, ta + .85), cloth(.35), .5, .6); add(at(15, ta + .9), thud(), .35, .6)
        add(at(15, ta + .9), pop(), .75, .6); add(at(15, ta + 1.05), ding(), .4, .6)
    add(at(15, 12.2), zipper(.7), .8, .6)
    for x in np.arange(15.8, 20.2, .785): add(at(15, x + .39), thud(), .22)
    add(at(15, 16.0), pop(), .9); add(at(15, 16.1), ding_warm(), .55)
    for x in (16.8, 17.7, 18.6): add(at(15, x), click(), .6)
    add(at(15, 18.0), ding(), .25)

# ---------------------------------------------------------------- build & master
CACHE = os.environ.get('AMB_CACHE')
if CACHE and os.path.exists(CACHE): mix[:] = np.load(CACHE)
else:
    render_ambience()
    if CACHE: np.save(CACHE, mix)
def sec_rms(name):
    print('  ' + name + ': ' + ' '.join(f'{20 * np.log10(np.sqrt((mix[int(S[i] * SR):int((S[i] + DURS[i]) * SR)].astype(np.float64) ** 2).mean()) + 1e-9):.0f}' for i in range(15)))
if os.environ.get('DBG'): sec_rms('ambience-only rms dB/scene')
amb_only = mix.copy() if os.environ.get('DBG') else None
music()
if os.environ.get('DBG'): sec_rms('ambience+music')
AMBIENT_MODE[0] = False
place()

mix64 = mix.astype(np.float64)
sm = np.tanh(mix64 * 1.5)                          # soft clip (old: tanh(mix*1.3)*0.8)
fo = int(1.0 * SR); sm[-fo:] *= np.linspace(1, 0, fo)[:, None]
peak = np.abs(sm).max()
sm *= 10 ** (-1 / 20) / peak                         # peak -> -1 dBFS
wavfile.write(os.path.join(HERE, 'soundtrack_forest.wav'), SR, (sm * 32767).astype(np.int16))

rms = float(np.sqrt((sm ** 2).mean()))
print('scene DURs:', [int(d) if d == int(d) else d for d in DURS])
print(f'sum of DURs: {TOTAL:.3f} s   wav length: {len(sm) / SR:.3f} s ({len(sm)} samples)')
print(f'peak: {np.abs(sm).max():.4f} ({20 * np.log10(np.abs(sm).max()):.2f} dBFS)   rms: {rms:.4f} ({20 * np.log10(rms):.2f} dBFS)')
# per-scene RMS / peak
for i in range(15):
    a, b = int(S[i] * SR), int((S[i] + DURS[i]) * SR); seg = sm[a:b]
    print(f'  scene {i + 1:2d}: rms {20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9):6.1f} dB  peak {20 * np.log10(np.abs(seg).max() + 1e-9):6.1f} dB')
np.save('/tmp/claude-0/-home-claude/4fef88d3-6a03-52cc-bd12-3787654fb2ea/scratchpad/sm.npy', sm.astype(np.float32)) if os.path.isdir('/tmp/claude-0/-home-claude/4fef88d3-6a03-52cc-bd12-3787654fb2ea/scratchpad') else None
