# PC Telemetry HUD - iOS Mobile Client

Standalone deployment repository for building the **PC Telemetry HUD** iOS application (`.ipa`) via GitHub Actions.

## Repository Contents

* `frontend/` - Web assets (HTML, CSS, JavaScript, icons) loaded by Capacitor.
* `ios/` - Native iOS Xcode workspace and configuration (`App.xcworkspace`, `Podfile`, etc.).
* `capacitor.config.json` - Capacitor configuration defining app identity and web directory.
* `package.json` & `package-lock.json` - Node dependencies for Capacitor CLI and iOS runtime.
* `.github/workflows/build.yml` - CI workflow for automated macOS unsigned IPA builds.

## Automated GitHub Actions Build

Every push to `main`/`master` or manual trigger via **Run workflow** (`workflow_dispatch`) executes:
1. `npm ci` (Installs Capacitor 7 and dependencies).
2. `npx cap sync ios` (Syncs web assets to the iOS project and resolves CocoaPods).
3. `xcodebuild` (Compiles Release scheme for `generic/platform=iOS` unsigned).
4. Packages `HUD-Dashboard.ipa` and uploads it as a workflow artifact.

## Sideloading the IPA on iOS

Download `HUD-Dashboard.ipa` from the GitHub Actions Artifacts section and install it using any sideloading tool:
* **AltStore / AltServer** (Windows & macOS)
* **Sideloadly** (Windows & macOS)
* **TrollStore** (iOS 14.0 - 16.6.1)
* **Scarlet / SideStore**
