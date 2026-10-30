"""Build narration.srt: the voiceover script timed to the rendered scenes."""
import re

scenes = [
    (20, "It's 8:47 PM. You're halfway through dinner when the whole city goes dark. Not just your building — every building, every streetlight, every traffic signal. The power company says repairs could take a week. Seven days without electricity. Here's how you survive every one of them."),
    (30, "Hour one. Your first move isn't panic — it's inventory. Find every flashlight, every battery, every power bank you own. Then unplug your TV, your computer and anything expensive. When the power comes back, it can return with a surge strong enough to fry them. Leave one lamp switched on, so you'll know the second it's back."),
    (35, "Hour six. Your fridge is now a ticking clock. A closed fridge keeps food safe for about four hours. A full freezer holds for around 48 hours — half full, about 24. So the rule is simple: keep the doors shut. Every time you open them, you let the cold out. Eat the perishables first — milk, meat, leftovers — and save the canned food for later."),
    (30, "Night one. It's tempting to light candles everywhere. Don't. Candles start thousands of house fires every year — and with the traffic lights out, fire trucks may take longer to reach you. Use flashlights and battery lanterns instead. If you must light a candle, never leave it alone."),
    (35, "Day two. In tall buildings, water is pushed up by electric pumps. When they stop, your faucets can run dry. Fill your bathtub and every pot you have while there's still pressure. Plan for one gallon of water per person, per day — for drinking and basic cleaning. The bathtub water is for flushing the toilet, not for drinking."),
    (30, "Day three. Your phone is now your lifeline — and it's dying. Turn on low-power mode, dim the screen and close every app. Send texts instead of calling: texts need less signal and often get through when calls don't. Need a charge? Your car can do it — but only outside, in the open air."),
    (45, "Day four. Without heating or air conditioning, your home starts fighting you. If it's cold, wear layers, close off unused rooms and live in one small space. If it's hot, drink water constantly and stay on the lowest floor. But here's the mistake that kills people in almost every major blackout: running a generator, a grill or a camp stove indoors. They release carbon monoxide — a gas you can't see or smell. Generators go outside, at least 20 feet from any window or door."),
    (25, "Day five. Here's what most people don't expect: gas pumps run on electricity. So do ATMs and card readers. The gas station down the street can be full of fuel and still unable to sell you a drop. That's why smart preppers keep a full tank and some cash at home — before anything goes wrong."),
    (28, "Day seven. A lamp flickers on. The power is back. Don't plug everything in at once — wait a few minutes, then reconnect your devices one at a time. Then check your fridge. Remember the four-hour clock? It ran out days ago. Meat, milk, eggs and leftovers all have to go. When in doubt, throw it out."),
    (20, "Seven days. No electricity. And you made it — because you stayed calm, kept the fridge shut, saved your water and kept the generator outside. Most people never think about this until the lights go out. Now you have. Subscribe, and I'll see you in the next survival scenario."),
]

def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

out, n, start = [], 1, 0.0
for dur, text in scenes:
    sents = re.split(r'(?<=[.?!])\s+', text)
    words = [len(s.split()) for s in sents]
    usable = dur - 1.0
    t = start + 0.4
    for s, w in zip(sents, words):
        d = usable * w / sum(words)
        out.append(f"{n}\n{ts(t)} --> {ts(t + d - 0.1)}\n{s}\n"); n += 1; t += d
    start += dur
open('narration.srt', 'w').write('\n'.join(out))
print('cues', n - 1, 'total', start)
