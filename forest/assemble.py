"""Final assembly for the forest video.
Voice is cut at the aligned paragraph boundaries; each scene (video + its SFX/music) is
retimed to last LEAD + voice + TAIL; music is ducked under the voice; everything is muxed."""
import subprocess, re, numpy as np
from scipy.io import wavfile

SR = 44100
LEAD, TAIL = 0.6, 2.4
cuts = [float(x) for x in open('cuts_aligned.txt').read().split()]
durs = [int(re.search(r'const DUR\s*=\s*([\d.]+)', open(f'scene{i}.js').read()).group(1)) for i in range(1, 16)]

def run(cmd):
    subprocess.run(cmd, check=True, stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)

def load(path):
    _, a = wavfile.read(path)
    a = a.astype(np.float64) / 32768.0
    return np.stack([a, a], 1) if a.ndim == 1 else a

run(['ffmpeg', '-y', '-i', 'voice_forest.mp3', '-ar', str(SR), '-ac', '2', 'voice_forest_44k.wav'])
voice_all, music_all = load('voice_forest_44k.wav'), load('soundtrack_forest.wav')
ostart = np.cumsum([0] + durs)
vparts, mparts, lst = [], [], []
for i in range(15):
    v = voice_all[int(cuts[i] * SR):int(cuts[i + 1] * SR)]
    env = np.abs(v).max(1); idx = np.where(env > 0.01)[0]
    v = v[max(idx[0] - 800, 0):idx[-1] + 2000]
    vlen = len(v) / SR
    T = round(LEAD + vlen + TAIL, 3)
    f = durs[i] / T
    out = f'fit_{i+1:02}.mp4'
    run(['ffmpeg', '-y', '-i', f'scene{i+1}.mp4', '-filter:v', f'setpts=PTS/{f:.5f},fps=30', '-t', f'{T}', '-an',
         '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', out])
    lst.append(f"file '{out}'")
    m = music_all[int(ostart[i] * SR):int(ostart[i + 1] * SR)]
    wavfile.write('_m.wav', SR, (m * 32767).astype(np.int16))
    run(['ffmpeg', '-y', '-i', '_m.wav', '-af', f'atempo={f:.5f}', '-ar', str(SR), '_mt.wav'])
    n = int(T * SR); mt = load('_mt.wav')
    mt = np.pad(mt, ((0, max(0, n - len(mt))), (0, 0)))[:n]
    vv = np.zeros((n, 2)); s = int(LEAD * SR); vv[s:s + len(v)] = v[:n - s]
    vparts.append(vv); mparts.append(mt)
    print(f'scene{i+1:2}: voice {vlen:5.2f}s | {durs[i]}s -> {T:5.2f}s (x{f:.2f})')
open('fit_list.txt', 'w').write('\n'.join(lst))
voice, music = np.concatenate(vparts), np.concatenate(mparts)
env = np.convolve(np.abs(voice).mean(1), np.ones(int(SR * 0.2)) / int(SR * 0.2), 'same')
env = np.clip(env / (np.percentile(env, 99) + 1e-9), 0, 1)
mix = voice * 1.15 + music * (1 + (10 ** (-9 / 20) - 1) * env)[:, None] * 0.85
mix = np.tanh(mix * 1.1) * 0.9
wavfile.write('mix_forest.wav', SR, (mix * 32767).astype(np.int16))
run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', 'fit_list.txt', '-c', 'copy', 'fit_video.mp4'])
run(['ffmpeg', '-y', '-i', 'fit_video.mp4', '-i', 'mix_forest.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
     '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest',
     '-movflags', '+faststart', 'forest_final.mp4'])
print('total', round(len(mix) / SR, 1), 's')
