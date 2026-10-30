"""Re-cut the narration at the real paragraph pauses, then retime each video scene
(and its SFX/music) so the scene lasts exactly as long as its voice line + small padding.
Result: continuous narration with no dead air."""
import subprocess, numpy as np
from scipy.io import wavfile

SR = 44100
LEAD, TAIL = 0.4, 1.1
# paragraph-pause midpoints found with silencedetect d=0.6
cuts = [0, 19.48, 41.72, 66.95, 85.97, 107.46, 128.30, 161.89, 181.51, 202.90, 221.309]
orig = [20, 30, 35, 30, 35, 30, 45, 25, 28, 20]

def run(cmd):
    subprocess.run(cmd, check=True, stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)

def load(path):
    sr, a = wavfile.read(path)
    a = a.astype(np.float64) / 32768.0
    if a.ndim == 1: a = np.stack([a, a], 1)
    return a

voice_all = load_from = None
run(['ffmpeg', '-y', '-i', 'voice_combined.mp3', '-ar', str(SR), '-ac', '2', 'voice_combined.wav'])
voice_all = load('voice_combined.wav')
music_all = load('soundtrack.wav')

ostart = np.cumsum([0] + orig)
segs, lst = [], []
for i in range(10):
    v = voice_all[int(cuts[i] * SR):int(cuts[i + 1] * SR)]
    # trim leading/trailing near-silence of the voice clip
    env = np.abs(v).max(1)
    idx = np.where(env > 0.01)[0]
    v = v[max(idx[0] - 800, 0):idx[-1] + 2000]
    vlen = len(v) / SR
    T = round(LEAD + vlen + TAIL, 3)
    f = orig[i] / T  # speed factor for the video scene
    # video: retime scene
    out = f'fit_scene{i+1}.mp4'
    run(['ffmpeg', '-y', '-i', f'scene{i+1}.mp4', '-filter:v', f'setpts=PTS/{f:.5f},fps=30',
         '-t', f'{T}', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', out])
    lst.append(f"file '{out}'")
    # music/sfx: same retime with atempo (pitch preserved) so SFX stay on their visual events
    m = music_all[int(ostart[i] * SR):int(ostart[i + 1] * SR)]
    wavfile.write('_m.wav', SR, (m * 32767).astype(np.int16))
    run(['ffmpeg', '-y', '-i', '_m.wav', '-af', f'atempo={f:.5f}', '-ar', str(SR), '_mt.wav'])
    mt = load('_mt.wav')
    n = int(T * SR)
    mt = np.pad(mt, ((0, max(0, n - len(mt))), (0, 0)))[:n]
    vv = np.zeros((n, 2)); s = int(LEAD * SR); vv[s:s + len(v)] = v[:n - s]
    segs.append((vv, mt))
    print(f'scene{i+1}: voice {vlen:5.2f}s  scene {orig[i]}s -> {T:5.2f}s  speed x{f:.2f}')

open('fit_list.txt', 'w').write('\n'.join(lst))
voice = np.concatenate([s[0] for s in segs]); music = np.concatenate([s[1] for s in segs])

# duck music under the voice (smoothed envelope), up to -9 dB
env = np.convolve(np.abs(voice).mean(1), np.ones(int(SR * 0.2)) / int(SR * 0.2), 'same')
env = np.clip(env / (np.percentile(env, 99) + 1e-9), 0, 1)
gain = 1 + (10 ** (-9 / 20) - 1) * env
mix = voice * 1.15 + music * gain[:, None] * 0.85
mix = np.tanh(mix * 1.1) * 0.9
wavfile.write('mix_fit.wav', SR, (mix * 32767).astype(np.int16))
print('total', len(mix) / SR)
