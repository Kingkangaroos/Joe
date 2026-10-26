# Teeth transparency repair — 26 October 2026

The previous ten WebP assets had alpha outside the silhouette but still contained baked white/grey checkerboard patches inside the silhouette gaps. AI background-extraction edits preserve each existing level's tooth, toothbrush, costume and purple pedestal, remove checkerboard remnants, and repair holes from the earlier extraction.

All ten assets are replaced at their existing paths. Git history retains the prior originals. park31.js uses a Teeth-specific cache suffix `teeth-alpha-20261026` without changing other mission asset versions. Main's existing Park 3.1 iframe, the roster, modal and evolution animation use this shared resolver. No layout, scoring, completion or user-state changes.

Generated with built-in imagegen, one background extraction per existing level. Prompt: remove baked white/grey checkerboard and pixelated halo, preserve existing character/pose/costume/brush/purple platform and square canvas, repair earlier accidental holes; output actual RGBA transparency. Final web files are alpha-preserving WebP conversions. Visual review of all ten outputs and alpha-channel checks required before commit. Device-specific iPhone/PWA appearance still requires real-device confirmation.
