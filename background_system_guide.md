# Minecraft Portfolio — Background Generation System & Video Prompts

This guide outlines nine distinct background prompts (one for each screen), geometry-lock techniques for AI video generation (Runway Gen-3, Luma Dream Machine, Sora, or Midjourney), and a comprehensive troubleshooting matrix.

---

## 1. Global Aesthetic Guidelines & Geometry Lock

To maintain a unified visual universe across all nine screens:
1. **Grid Proportions**: Maintain rigid orthogonal cubic geometry based on a 16-pixel unit grid.
2. **Lighting**: Low-angle directional sunlight or ambient bioluminescent glows (no flat overexposed daylight).
3. **Camera**: Orthographic or slight isometric perspective ($30^\circ$ elevation angle, fixed focal distance).
4. **Palette**: Deep slate/obsidian void bases with vibrant accents (emerald `#2ecc71`, diamond `#5ce1e6`, gold `#f5a623`, enchant purple `#a855f7`).

### The Geometry-Lock Prompt Prefix:
> *"Isometric voxel diorama, rigid cubic geometry with visible voxel edges, 90-degree polygonal mesh alignment, hard voxel surface normals, no smooth curved surfaces, 16-bit block textures, volumetric raytraced lighting, photorealistic voxel rendering, 8k resolution, static camera."*

---

## 2. Nine Screen Background Prompts

| Screen # | Screen ID | Title | Master Generation Prompt |
|---|---|---|---|
| **1** | `hero` | Overworld Spawn | `Isometric voxel diorama of a lush Minecraft spawn clearing at sunrise, cubic pine trees, tiered grassy voxel hills, clean square sun, floating blocky clouds, warm morning golden lighting, clean geometry, 8k resolution, voxel art aesthetic.` |
| **2** | `about` | Explorer's Library | `Voxel interior of a cozy Minecraft explorer's library, dark oak bookshelves stacked with pixelated books, stone-brick hearth with gentle flame glow, workbench and lectern, warm ambient lighting.` |
| **3** | `skills` | Enchantment Chamber | `Voxel enchanting chamber, dark obsidian floor with glowing glyphs, floating enchanted books with purple particle runes, lapis lazuli pillars, deep atmospheric violet and cyan volumetric lighting.` |
| **4** | `projects` | Double-Chest Vault | `Underground Minecraft treasure vault, double wooden chests lined along smooth stone walls, item frames displaying glowing tools, warm torchlight casting square shadows across cobblestone floors.` |
| **5** | `experience`| Crafting Workshop | `Voxel engineering workshop with oak crafting tables, anvil, furnace with glowing red embers, blueprints spread across a wooden counter, warm industrial dungeon lighting.` |
| **6** | `achievements`| Advancements Hall | `Grand hall of trophies made of sandstone and gold blocks, golden pedestals holding pixelated relics, banners hanging from blocky arches, dramatic high-angle daylight through clerestory windows.` |
| **7** | `services` | Villager Trading Post | `Voxel desert trading bazaar, striped awnings over merchant stalls, piles of glowing emeralds and traded goods, acacia wood fences, bright desert midday sun casting crisp blocky shadows.` |
| **8** | `contact` | Scriptorium | `A solitary voxel writing desk perched before a large panoramic window overlooking a twilight pine forest, lit candle with pixel flicker, open parchment book, ink pot with feather quill.` |
| **9** | `outro` | The End Dimension | `Voxel End dimension, dark obsidian pillars reaching into an abyssal star-scattered void, shimmering purple Ender crystal with vertical beam of light, floating End stone islands, mysterious violet nebula.` |

---

## 3. Video Generation Troubleshooting Matrix

| Issue | Root Cause | Solution / Prompt Correction |
|---|---|---|
| **Smooth or melted blocks** | Diffusion model attempting photorealistic rounding | Add negative prompts: `(smooth curves, round edges, photorealistic organic shapes:1.4)`. Enforce: `stepped cubic voxels, voxelized mesh`. |
| **Inconsistent character appearance** | Character generation drifting between models | Use a fixed seed or reference image. Describe exact skin tone, purple hoodie, and dark hair coordinates. |
| **Changing geometry between frames** | Temporal instability in video model | Use **Motion Score $\le$ 3** (slow ambient particles or slow camera drift only). Lock background with static first frame. |
| **Excessive camera movement** | Video model defaulting to dynamic orbit | Include camera constraints: `fixed static camera, locked tripod shot, zero pan, zero tilt, subtle particle motion only`. |
| **Lighting inconsistency** | Dynamic day-night shifts between generations | Specify exact time: `Golden hour dawn (Screen 1)`, `Warm torch interior (Screens 2, 4, 5)`, `Void violet bioluminescence (Screens 3, 9)`. |
| **Backgrounds obscuring UI text** | Background too bright or high-contrast in center | Add CSS overlay: `background: rgba(10, 10, 15, 0.75); backdrop-filter: blur(8px);` (already built into `style.css`). |
