# Running VawaScents locally

Two things need to run together: the Laravel **backend** (API) and the Expo **mobile** app. The mobile app talks to the backend over HTTP, so whichever device you're testing on (phone, emulator, browser) needs network access to wherever the backend is running.

## 1. Start the backend

```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

`--host=0.0.0.0` is important — the default `php artisan serve` only binds to `127.0.0.1`, which a phone or emulator can't reach. Binding to `0.0.0.0` exposes it on your machine's LAN IP too.

Find your machine's LAN IP (you'll need it for the mobile `.env`):

```bash
hostname -I   # Linux
ipconfig getifaddr en0   # macOS, Wi-Fi
```

Verify it's reachable:

```bash
curl http://<your-lan-ip>:8000/up
```

## 2. Configure the mobile app's API URL

Copy the example env file if you haven't already, and point it at your backend:

```bash
cd mobile
cp .env.example .env
```

Edit `mobile/.env`:

```dotenv
EXPO_PUBLIC_API_URL=http://<your-lan-ip>:8000/api
```

- **Physical device (USB or Wi-Fi)**: use your machine's LAN IP, as above.
- **Android emulator**: your LAN IP also works (the emulator shares the host's network), but if it doesn't, use the emulator's special host alias instead: `http://10.0.2.2:8000/api`.
- **Web browser preview**: `http://127.0.0.1:8000/api` works fine too, since the browser runs on the same machine as the backend.

Restart the Expo dev server after changing `.env` — it's only read at startup.

## 3. Start the mobile app

```bash
cd mobile
npx expo start
```

This prints a QR code and a terminal menu. From there:

| Key | Target |
|---|---|
| `a` | Open on a connected Android device/emulator |
| `i` | Open on iOS simulator (macOS only) |
| `w` | Open in a web browser |

Or skip the menu and target a platform directly:

```bash
npx expo start --android
npx expo start --web
```

### Running on a physical Android phone (USB)

1. On the phone: **Settings → About phone → tap "Build number" 7×** to enable Developer Options, then **Settings → Developer options → USB debugging → on**.
2. Plug the phone in via USB, accept the "Allow USB debugging" prompt on the phone.
3. Confirm the machine sees it:
   ```bash
   adb devices
   ```
   You should see your device listed as `device` (not `unauthorized`).
4. `npx expo start --android` — Expo installs the Expo Go app automatically on first run, then loads VawaScents into it.

### Running on a physical phone over Wi-Fi (no USB)

1. Make sure the phone and this machine are on the **same Wi-Fi network**.
2. Install **Expo Go** from the Play Store / App Store.
3. `npx expo start`, then scan the QR code from the Expo Go app (Android) or the Camera app (iOS).

## 4. Setting up and running the Android emulator

An Android SDK with two AVDs (`Pixel_4`, `Pixel_5`) is already set up on this machine at `/mnt/data/android/Sdk`.

### One-time shell setup

Make sure these are set (already in `~/.bashrc` on this machine):

```bash
export ANDROID_HOME=/mnt/data/android/Sdk
export ANDROID_SDK_ROOT=/mnt/data/android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
```

### List available emulators

```bash
emulator -list-avds
```

### Create a new one (if you want a different device/API level)

Requires a system image installed first:

```bash
# See what's installed / available
sdkmanager --list | grep system-images

# Install one, e.g. Android 14 (API 34), Google APIs, x86_64
sdkmanager "system-images;android-34;google_apis;x86_64"

# Create the AVD
avdmanager create avd -n Pixel_7 -k "system-images;android-34;google_apis;x86_64" -d pixel_7
```

### Launch an emulator

```bash
emulator -avd Pixel_5
```

Boot takes 30–90 seconds. Once it's up:

```bash
adb devices   # should list "emulator-5554  device"
```

### Open VawaScents on it

With the emulator running and the backend started (step 1):

```bash
cd mobile
npx expo start --android
```

Expo will detect the running emulator and install/launch Expo Go on it automatically.

## Auth methods

The app supports three ways in, all from the same auth screen:

- **Email or phone + password** — standard register/login form.
- **Google Sign-In** — needs OAuth client IDs from [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Until configured, the button shows "not configured" instead of crashing. Set these in `mobile/.env`:
  ```dotenv
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
  ```
  The same client IDs (comma-separated) go into `backend/.env` as `GOOGLE_CLIENT_IDS`.
- **Biometrics (Face/Touch ID)** — not a separate sign-in method; it gates *resuming* a saved session. After logging in once with password or Google on a device with biometrics enrolled, relaunching the app shows a Face/Touch ID unlock screen instead of silently restoring the session.

New accounts (any method) still go through one-time phone OTP verification before reaching the rest of the app (`phone.verified` middleware on the backend) — the OTP is logged to the backend's log file (`storage/logs/laravel.log`) rather than actually texted, until a real SMS provider is wired up.

## Troubleshooting

- **Blank screen on web / "nothing happens" on device**: check the Metro terminal for a red error box, or run `adb logcat *:E` for Android. The most common cause is the app unable to reach `EXPO_PUBLIC_API_URL` — double check the IP and that the backend is bound to `0.0.0.0`.
- **"Network request failed"**: the phone/emulator and backend aren't on a route to each other. If on real Wi-Fi, confirm both are on the same network and no client isolation is enabled on the router.
- **LAN IP changed**: your machine's IP can change between networks/reboots — re-run `hostname -I` and update `mobile/.env`, then restart `expo start`.
- **`adb devices` shows nothing**: for physical phones, re-check USB debugging is on and you accepted the authorization prompt; try a different USB cable/port. For emulators, confirm it finished booting (`adb shell getprop sys.boot_completed` should print `1`).
