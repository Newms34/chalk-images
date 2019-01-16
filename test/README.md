# Tests

Here are some tests for `chalk-image`

----
## Running

For now, there's pretty much only one test. Just run `node test.js` in a terminal or cmd prompt window. Your options can be specified as follows:

 - **Color Mode**: If you wanna run in 16M or 256 color mode, run `node test.js -c 16`, `node test.js -c 16m` or `node test.js -c 256`.
 - **Promise**: If you wanna export it as a promise (this *won't* look any different in the tests, other than claiming it ran in a promise), run `node test.js -p`.
 - **Verbose**: If you want a little more info, run `node test.js -v`.

You can of course combine multiple flags, so `node test.js -p -c 256` will export a promise of the image in 256-color mode.

