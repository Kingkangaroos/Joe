/* Settings credential-source regression — ChatGPT (OpenAI) */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','settings.html'),'utf8');

assert.match(src,/placeholder="Paste your Hevy API key"/,'Hevy field should use a generic non-secret placeholder');
assert.match(src,/const HEVY_KEY = 'hevy_api_key'/,'Hevy storage key contract should remain explicit');
assert.match(src,/localStorage\.setItem\(HEVY_KEY, v\)/,'manual Save should still persist the user-entered Hevy key on-device');
assert.doesNotMatch(src,/if\s*\(!localStorage\.getItem\(HEVY_KEY\)\)[\s\S]{0,350}?localStorage\.setItem\(HEVY_KEY\s*,\s*['"][^'"]+['"]\)/,'Settings must never boot with an embedded literal Hevy credential');
assert.match(src,/Existing device Hevy key, if configured manually\. No embedded fallback\./,'source should document the no-fallback boundary');
console.log('Settings credential smoke: Hevy remains manual/device-configured with no embedded fallback credential.');
