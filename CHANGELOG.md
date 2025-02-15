# v1.3.4 (2025-02-12)
## What's Changed
### 🐛 Bug Fixes
* modals now not return errors ([ba8868c](https://github.com/drackp2m/round-timer/commit/ba8868cea78163fbcb7a670838a8f8b742abd919)) by Marc Jovaní González

**Full Changelog**: https://github.com/drackp2m/round-timer/compare/v1.3.3...v1.3.4

# v1.3.3 (2025-02-10)
## What's Changed
### 🚀 Performance Improvements
* add lint to json files that works with `ng lint` ([1563c90](https://github.com/drackp2m/round-timer/commit/1563c90ad4a18358e426a3c7fe737fcaa66d7671)) by Marc Jovaní González

**Full Changelog**: https://github.com/drackp2m/round-timer/compare/v1.3.2...v1.3.3

# v1.3.2 (2025-02-07)
## What's Changed
### 🧪 Tests
* using testing library and jest, create CalculateMatchTurnUseCase spec ([dc949b9](https://github.com/drackp2m/round-timer/commit/dc949b9c917c91e090ed32d67463be296435068e)) by Marc Jovaní González
### ♻️ Code Refactoring
* add new eslint rules and apply fixes ([678bcb7](https://github.com/drackp2m/round-timer/commit/678bcb74e0ca21451de7b65e94b1639e14195ece)) by Marc Jovaní González
* add new eslint rules, apply eslint fixes ([3f20ef4](https://github.com/drackp2m/round-timer/commit/3f20ef412f78fda99dac7ae05b4a58f4b709e707)) by Marc Jovaní González
### 🚀 Performance Improvements
* try to improve eslint performance ([de6e5b3](https://github.com/drackp2m/round-timer/commit/de6e5b3ff4ebf2c9e070590c685fabb92d6be5d1)) by Marc Jovaní González
### 💻 Continuous Integration
* add step install to avoid installing node modules several times in parallel ([16a698c](https://github.com/drackp2m/round-timer/commit/16a698c11d3936ecd538cff88c55d01ebf81b1fb)) by Marc Jovaní González
* use cache in all steps ([cc0543e](https://github.com/drackp2m/round-timer/commit/cc0543e86b67d839a1fe72b4d41f8cb848508048)) by Marc Jovaní González

**Full Changelog**: https://github.com/drackp2m/round-timer/compare/v1.3.1...v1.3.2

# v1.3.1 (2025-01-17)
## What's Changed
### 🎨 Styles
* add colors to list ([7d84e35](https://github.com/drackp2m/round-timer/commit/7d84e35ba6bbfd4bf43e327a93ac834ccbfa8ee8)) by Marc Jovaní González

**Full Changelog**: https://github.com/drackp2m/round-timer/compare/v1.3.0...v1.3.1

# v1.3.0 (2025-01-17)
## What's Changed
### ✨ Features
* add option to emit value when modal close, improve create user / match ([d79d009](https://github.com/drackp2m/round-timer/commit/d79d0095e0ebfd9df58770122c8422a8a6cd44c0)) by Marc Jovaní González

**Full Changelog**: https://github.com/drackp2m/round-timer/compare/v1.2.0...v1.3.0

# v1.2.0 (2025-01-17)
## What's Changed
### ✨ Features
* set Player store to Entity Signal Store ([fd16ac7](https://github.com/drackp2m/round-timer/commit/fd16ac7fa70e6230361a5ed8a24617a0d1479b49)) by Marc Jovaní González

**Full Changelog**: https://github.com/drackp2m/round-timer/compare/v1.1.1...v1.2.0

# v1.1.1 (2025-01-15)
## What's Changed
### ♻️ Code Refactoring
* create base and updatable model to simplify creation / update of models ([1978019](https://github.com/drackp2m/round-timer/commit/19780192404c959ecec3c5b76fb608d084919f53)) by Marc Jovaní González
### 🐛 Bug Fixes
* prevent wrap o nickname in match turns list ([9d7e275](https://github.com/drackp2m/round-timer/commit/9d7e27558ea1c76f37490ce2c4d26bd9ab302580)) by Marc Jovaní González

**Full Changelog**: https://github.com/drackp2m/round-timer/compare/v1.1.0...v1.1.1

# v1.1.0 (2025-01-12)
## What's Changed
### ✨ Features
* create directive for radio and checkbox input types ([eb3c5cd](https://github.com/drackp2m/round-timer/commit/eb3c5cd6a3b4a3e4a60a70acf18bd65c143ea052)) by Marc Jovaní González
### 🎒 Chores
* update deps ([fbe788f](https://github.com/drackp2m/round-timer/commit/fbe788faacee3991e3b114ba99150b4b2678d713)) by Marc Jovaní González

**Full Changelog**: https://github.com/drackp2m/round-timer/compare/v1.0.1...v1.1.0

# v1.0.1 (2025-01-11)
## What's Changed
### 🎨 Styles
* remove bottom padding by class on modal, remove some semantic release deps ([07ad9c6](https://github.com/drackp2m/round-timer/commit/07ad9c6d9422ff469bf3d8a6d05a7264fe51fdb7)) by Marc Jovaní González

**Full Changelog**: https://github.com/drackp2m/round-timer/compare/v1.0.0...v1.0.1

# v1.0.0 (2025-01-11)
## What's Changed
### ✨ Features
* add dark mode, add appearance section on settings ([8bbead8](https://github.com/drackp2m/round-timer/commit/8bbead85a0a5f05214b3066f0756e6796bb6bd51)) by Marc Jovaní González
* add victoryType to Game, insert match on IndexedDB ([fb951e5](https://github.com/drackp2m/round-timer/commit/fb951e55ca7bc636a8704c18bf971e5122ebfea7)) by Marc Jovaní González
* added button and svg components ([2a77821](https://github.com/drackp2m/round-timer/commit/2a778218f68de10777a7b6e86ef8b96c77e88dcb)) by Marc Jovaní González
* count seconds of turn and next player ([470979d](https://github.com/drackp2m/round-timer/commit/470979d3cc1cee10ee52a5966c222c1700cf88e6)) by Marc Jovaní González
* create stores and modal service ([77a351f](https://github.com/drackp2m/round-timer/commit/77a351f1161763b94f79425ca2a18f09f670b92f)) by Marc Jovaní González
* created models for matches, migrations and form ([4d1564d](https://github.com/drackp2m/round-timer/commit/4d1564da6154e6e605210478cdb1023de736ddb4)) by Marc Jovaní González
* custom router-link directive, with class active by default using exact true ([beab429](https://github.com/drackp2m/round-timer/commit/beab429004b34abd95061720e940a238dc4d34d7)) by Marc Jovaní González
* finish modal to create new user, with inputs and selects ([4e40105](https://github.com/drackp2m/round-timer/commit/4e401052755f5102f5a1dd56f261d8dde851ca7f)) by Marc Jovaní González
* logo and title on header ([f7abc99](https://github.com/drackp2m/round-timer/commit/f7abc99a65697a548d42ba53b9ca14176551fc1d)) by Marc Jovaní González
* make label effect to select elements ([9d714ab](https://github.com/drackp2m/round-timer/commit/9d714abfa847b8d8e28bf0921fa3d602e41b97f0)) by Marc Jovaní González
* modal works perfectly ([5f27e41](https://github.com/drackp2m/round-timer/commit/5f27e41f40ac124eb0298ec8650c46e44be7f8bd)) by Marc Jovaní González
* save players ([f0fb125](https://github.com/drackp2m/round-timer/commit/f0fb1254479cfb6ce158d186420a2de23cae9770)) by Marc Jovaní González
* set 'things' on match page ([7936145](https://github.com/drackp2m/round-timer/commit/7936145dd3652e2e7dd09a36a11ebb935e7d0d85)) by Marc Jovaní González
* show player list with icon ([1ecae71](https://github.com/drackp2m/round-timer/commit/1ecae7143e2cadfca19dee123157ca3878e2707d)) by Marc Jovaní González
* sort players according to selections on NewMatchPage ([f4a6c1f](https://github.com/drackp2m/round-timer/commit/f4a6c1f4d955b69c3eb0d17b08f5afbea72851af)) by Marc Jovaní González
### 🎨 Styles
* add base, theme, component and utility css layers ([49e25da](https://github.com/drackp2m/round-timer/commit/49e25da606eac05b0066aafb6421490a0896217b)) by Marc Jovaní González
* fix use of css reset with layer base, fix -light / -dark css variables ([5d12172](https://github.com/drackp2m/round-timer/commit/5d12172f0aac8771ddce7298c89cc86984704c88)) by Marc Jovaní González
* improve data on match page ([3a1dc8e](https://github.com/drackp2m/round-timer/commit/3a1dc8eaab1486eec8425f7d0880243a4d91d1a4)) by Marc Jovaní González
* improve look of match page ([df25ed8](https://github.com/drackp2m/round-timer/commit/df25ed822a1b066802ea50033bd04e52d26a78f4)) by Marc Jovaní González
* improve modal overlay color, improve input / select focus styles ([d5922cd](https://github.com/drackp2m/round-timer/commit/d5922cdb82bb29deefed826235beeb0a9dc1b809)) by Marc Jovaní González
* match section full-height, turns scroll with auto-scroll on new items ([db43682](https://github.com/drackp2m/round-timer/commit/db43682e5f0f094d0fc6dcd87a5cc31d3cbc7897)) by Marc Jovaní González
* use dark icon on index.html :P ([9e3d957](https://github.com/drackp2m/round-timer/commit/9e3d957bc7c56def2ee08972cdaa998c82222f51)) by Marc Jovaní González
### ♻️ Code Refactoring
* add todo comment ([ef985b4](https://github.com/drackp2m/round-timer/commit/ef985b4ed700cb9881e51e65785c74c75564b7cd)) by Marc Jovaní González
* improve player badge and button contents alignment ([8ae17f4](https://github.com/drackp2m/round-timer/commit/8ae17f46a19e9e34fb95ec285828d63acb1c2a5c)) by Marc Jovaní González
* rename participant to player, and fix non-relative imports ([5bb9472](https://github.com/drackp2m/round-timer/commit/5bb9472b545d3909497e31d6656af7e284ebd70c)) by Marc Jovaní González
* rename timer to match ([b49e5b7](https://github.com/drackp2m/round-timer/commit/b49e5b7cb59a4ab5db34e4f065850e937bf6920a)) by Marc Jovaní González
### 🐛 Bug Fixes
* add dash to empty times, show first fast, use new dark icon ([628178e](https://github.com/drackp2m/round-timer/commit/628178ec42b7cb60a27fb84a9de1f95d6db44c1c)) by Marc Jovaní González
* add padding to modal, add bottom text to badge ([b5c0bf9](https://github.com/drackp2m/round-timer/commit/b5c0bf9723c2e4075d7b304c6b4f84ca69caf365)) by Marc Jovaní González
* dashboard title ([7390f58](https://github.com/drackp2m/round-timer/commit/7390f58d501707bb61546d3322ad24b2b850ae42)) by Marc Jovaní González
* modal now works without visual glitches ([e695697](https://github.com/drackp2m/round-timer/commit/e69569705b5d41a1a120a2d57ff11906f99c5dbd)) by Marc Jovaní González
* move match creation to store ([a5f336b](https://github.com/drackp2m/round-timer/commit/a5f336b4a56fffb9657012f45a15bba2be18da41)) by Marc Jovaní González
* no more errors on commitlint ([fb54584](https://github.com/drackp2m/round-timer/commit/fb54584cdd7a289afd3eacae390ade234b27bfa9)) by Marc Jovaní González
* pull from dev on github actions workflow ([d132a87](https://github.com/drackp2m/round-timer/commit/d132a8785dbbcaadaeaf51cf01425327319fa950)) by Marc Jovaní González
* remove initial slash from imges src ([4c389dc](https://github.com/drackp2m/round-timer/commit/4c389dccb640aae91e86173ae2ecb6a8e4688546)) by Marc Jovaní González
* routes with hash to work in github pages ([2aee328](https://github.com/drackp2m/round-timer/commit/2aee328891a78941c7cd14672488fac5a799d339)) by Marc Jovaní González
* show correct current player name at bottom of match page ([12f28c1](https://github.com/drackp2m/round-timer/commit/12f28c15a3fca8d1253731fcdc14e766447ca235)) by Marc Jovaní González
* solve main issues on basic timer actions, add icon to fastest turn ([830dc1d](https://github.com/drackp2m/round-timer/commit/830dc1d995b712a94189c88449b64c88c3df2a65)) by Marc Jovaní González
* try to fix commitizen ([85f5645](https://github.com/drackp2m/round-timer/commit/85f564504764a2eaeebbf9effc28850bca8d43dd)) by Marc Jovaní González
### 🚀 Performance Improvements
* improve modal to show elements only when open ([a1cc8a4](https://github.com/drackp2m/round-timer/commit/a1cc8a4a71b68efd4921cf5480cf42728a9f3e08)) by Marc Jovaní González
* use zoneless change detection ([eddccad](https://github.com/drackp2m/round-timer/commit/eddccad37d2ff6468168b6889359a9f5767d9176)) by Marc Jovaní González
### 🏗️‍ Build System
* try to work with service worker and manifest ([4c6858f](https://github.com/drackp2m/round-timer/commit/4c6858f5363638a7f33b443007ff1645a11a9ba1)) by Marc Jovaní González
* update icon and colors of TodoTree plugin configuration on devcontainer ([8503d9f](https://github.com/drackp2m/round-timer/commit/8503d9f2b628712bbe55c30f1cab9843be5341e0)) by Marc Jovaní González
### 💻 Continuous Integration
* fix version of ubuntu on github pages deploy ([5d1cd1c](https://github.com/drackp2m/round-timer/commit/5d1cd1c1c1481160aabaa2573adc842b85afd4eb)) by Marc Jovaní González
* remove dependency on build step of github actions workflow ([5183f6a](https://github.com/drackp2m/round-timer/commit/5183f6ad8cbdb63e1fc856355c7bbcd58bbeb36a)) by Marc Jovaní González
* try to use semantic-release ([8ff5607](https://github.com/drackp2m/round-timer/commit/8ff5607de1be37e4182287b53256e0ab282b90a2)) by Marc Jovaní González
* use node 23.6, add semantic release ([3757c9c](https://github.com/drackp2m/round-timer/commit/3757c9cc9914f1819c6df67e8bb16b2862b7ff1b)) by Marc Jovaní González
### 🎒 Chores
* add commitlint with emojis ([bb63828](https://github.com/drackp2m/round-timer/commit/bb63828df3251322ac4cb2c57553a8c3c89620bd)) by Marc Jovaní González

**Full Changelog**: https://github.com/drackp2m/round-timer/compare/...v1.0.0
