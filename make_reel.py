"""
Saba Mitzuyar — Auto Demo Reel Recorder
Navigates the game, captures live frames, compiles 15-sec reel with ffmpeg.
Run while dev server is on localhost:3000
"""
import subprocess, time, os, shutil, sys
from pathlib import Path
import pyautogui
import mss
from PIL import Image

pyautogui.FAILSAFE = True
pyautogui.PAUSE    = 0.04

FRAMES_DIR = Path("reel_frames")
OUTPUT     = Path("saba_mitzuyar_demo_reel.mp4")
FPS        = 30

# ── state ──────────────────────────────────────────────────────────────────
sct         = mss.mss()
fi          = 0          # global frame index
canvas_box  = None       # {"left","top","width","height"} in screen px

def grab_game():
    """Grab the game canvas area, return 960×540 PIL image."""
    full = sct.grab(sct.monitors[1])
    img  = Image.frombytes("RGB", full.size, full.bgra, "raw", "BGRX")
    cb   = canvas_box
    img  = img.crop((cb["left"], cb["top"],
                     cb["left"]+cb["width"],
                     cb["top"]+cb["height"]))
    return img.resize((960, 540), Image.LANCZOS)

def save_frame(img):
    global fi
    img.save(FRAMES_DIR / f"frame_{fi:05d}.jpg", quality=92)
    fi += 1

def hold_still(seconds):
    """Capture current screen and hold it for N seconds."""
    img = grab_game()
    for _ in range(int(seconds * FPS)):
        save_frame(img)

def record_live(seconds):
    """Capture live gameplay for N seconds."""
    end = time.time() + seconds
    while time.time() < end:
        t0 = time.time()
        save_frame(grab_game())
        elapsed = time.time() - t0
        wait    = (1/FPS) - elapsed
        if wait > 0:
            time.sleep(wait)

def press_key(key, times=1, delay=0.55):
    for _ in range(times):
        pyautogui.press(key)
        time.sleep(delay)

def detect_canvas():
    """Find actual game canvas by scanning for non-black pixels."""
    global canvas_box
    full = sct.grab(sct.monitors[1])
    img  = Image.frombytes("RGB", full.size, full.bgra, "raw", "BGRX")
    w, h = img.size
    px   = img.load()

    top = 0
    for y in range(h):
        if any(sum(px[x,y]) > 60 for x in range(0, w, 30)):
            top = y; break

    bot = h-1
    for y in range(h-1, 0, -1):
        if any(sum(px[x,y]) > 60 for x in range(0, w, 30)):
            bot = y; break

    left = 0
    for x in range(w):
        if any(sum(px[x,y]) > 60 for y in range(0, h, 30)):
            left = x; break

    right = w-1
    for x in range(w-1, 0, -1):
        if any(sum(px[x,y]) > 60 for y in range(0, h, 30)):
            right = x; break

    canvas_box = {"left": left, "top": top,
                  "width": right-left, "height": bot-top}
    print(f"  Canvas: {canvas_box}")

def game_click(rx, ry):
    """Click at relative position (0-1) inside game canvas."""
    x = canvas_box["left"] + int(canvas_box["width"]  * rx)
    y = canvas_box["top"]  + int(canvas_box["height"] * ry)
    pyautogui.click(x, y)
    time.sleep(0.3)

def find_ffmpeg():
    path = shutil.which("ffmpeg")
    if path:
        return path
    for p in Path(r"C:\Users\uzan2\AppData\Local\Microsoft\WinGet").rglob("ffmpeg.exe"):
        return str(p)
    return None

# ── MAIN ───────────────────────────────────────────────────────────────────

def record():
    global fi
    FRAMES_DIR.mkdir(exist_ok=True)
    for f in FRAMES_DIR.glob("frame_*.jpg"):
        f.unlink()
    fi = 0

    print("\n[WAIT] Opening game — do not touch mouse/keyboard!")
    subprocess.Popen(["cmd", "/c", "start", "http://localhost:3000"])
    time.sleep(4)
    pyautogui.hotkey("win", "up")   # maximise
    time.sleep(1.5)

    # Click centre to give focus
    mon = sct.monitors[1]
    cx  = mon["left"] + mon["width"]  // 2
    cy  = mon["top"]  + mon["height"] // 2
    pyautogui.click(cx, cy)
    time.sleep(1)
    detect_canvas()

    # ── 1. MAIN MENU  2.5 s ─────────────────────────────────────────
    print("[CAM] [1/7] Main menu")
    hold_still(2.5)

    # ── Click 'התחל כאן' ────────────────────────────────────────────
    print("[CLICK]  Starting game from level 1...")
    game_click(0.122, 0.448)   # button position
    time.sleep(3.8)            # wait for scene + transition card

    # ── 2. TRANSITION CARD  1 s ─────────────────────────────────────
    print("[CAM] [2/7] Level transition card")
    hold_still(1.0)
    time.sleep(1.2)            # let transition finish

    # ── Activate god mode ───────────────────────────────────────────
    game_click(0.5, 0.5)
    time.sleep(0.2)
    press_key("g")             # God mode ON
    time.sleep(0.4)

    # ── 3. EARTH WORLD  2 s — walk right ────────────────────────────
    print("[CAM] [3/7] Earth world — level 1")
    pyautogui.keyDown("d")
    record_live(2.0)
    pyautogui.keyUp("d")

    # ── Skip to Water world level 10 ────────────────────────────────
    print("[SKIP]  Jumping to Water world (level 10)...")
    for _ in range(9):
        press_key("o", delay=0.65)
    time.sleep(2.5)

    # ── 4. WATER WORLD  1.8 s ───────────────────────────────────────
    print("[CAM] [4/7] Water world — level 10")
    game_click(0.5, 0.5)
    press_key("g")             # re-enable god mode in new level
    time.sleep(0.3)
    pyautogui.keyDown("d")
    record_live(1.8)
    pyautogui.keyUp("d")

    # ── Skip to Sky world level 20 ──────────────────────────────────
    print("[SKIP]  Jumping to Sky world (level 20)...")
    for _ in range(10):
        press_key("o", delay=0.65)
    time.sleep(2.5)

    # ── 5. SKY WORLD  1.8 s ─────────────────────────────────────────
    print("[CAM] [5/7] Sky world — level 20")
    game_click(0.5, 0.5)
    press_key("g")
    time.sleep(0.3)
    pyautogui.keyDown("d")
    record_live(1.8)
    pyautogui.keyUp("d")

    # ── Skip to Space world level 30 ────────────────────────────────
    print("[SKIP]  Jumping to Space world (level 30)...")
    for _ in range(10):
        press_key("o", delay=0.65)
    time.sleep(2.5)

    # ── 6. SPACE WORLD  1.8 s ───────────────────────────────────────
    print("[CAM] [6/7] Space world — level 30")
    game_click(0.5, 0.5)
    press_key("g")
    time.sleep(0.3)
    pyautogui.keyDown("d")
    record_live(1.8)
    pyautogui.keyUp("d")

    # ── Skip to Boss level 40 ───────────────────────────────────────
    print("[SKIP]  Jumping to Boss level (40)...")
    for _ in range(10):
        press_key("o", delay=0.65)
    time.sleep(3.5)

    # ── 7. BOSS FIGHT  2.5 s ────────────────────────────────────────
    print("[CAM] [7/7] Boss fight — Stone Giant!")
    game_click(0.5, 0.5)
    press_key("g")
    time.sleep(0.3)
    pyautogui.keyDown("d")
    record_live(2.5)
    pyautogui.keyUp("d")

    total_sec = fi / FPS
    print(f"\n[OK] Captured {fi} frames = {total_sec:.1f} sec")
    compile_video()


def compile_video():
    global fi
    ffmpeg = find_ffmpeg()
    if not ffmpeg:
        print("[ERROR] ffmpeg not found!")
        return

    total_dur = fi / FPS
    fade_out  = max(0, total_dur - 0.5)

    print(f"\n[VIDEO]  Compiling {fi} frames → {OUTPUT} …")
    cmd = [
        ffmpeg, "-y",
        "-framerate", str(FPS),
        "-i", str(FRAMES_DIR / "frame_%05d.jpg"),
        "-vf", (
            f"scale=960:540:force_original_aspect_ratio=decrease,"
            f"pad=960:540:(ow-iw)/2:(oh-ih)/2:color=black,"
            f"fade=t=in:st=0:d=0.6,"
            f"fade=t=out:st={fade_out:.2f}:d=0.5"
        ),
        "-c:v", "libx264",
        "-preset", "slow",
        "-crf", "17",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        str(OUTPUT)
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        mb = OUTPUT.stat().st_size / 1024 / 1024
        print(f"\n[DONE]  Done!  →  {OUTPUT.resolve()}  ({mb:.1f} MB, {total_dur:.1f}s)")
        subprocess.Popen(["cmd", "/c", "start", "", str(OUTPUT.resolve())])
    else:
        print("[ERROR]  ffmpeg error:\n", result.stderr[-3000:])


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    print("="*55)
    print("  SABA MITZUYAR -- AUTO DEMO REEL")
    print("="*55)
    print("  * Keep this window visible")
    print("  * Move mouse to TOP-LEFT corner to ABORT")
    print("  * The script takes ~75 seconds to complete")
    print("="*55)
    if sys.stdin.isatty():
        input("\n  Press ENTER to start...\n")
    else:
        print("\n  Auto-starting in 3 seconds...")
        time.sleep(3)
    time.sleep(2)
    try:
        record()
    except pyautogui.FailSafeException:
        pyautogui.keyUp("d")
        print("\n[ABORT]  Aborted by user (failsafe triggered)")
