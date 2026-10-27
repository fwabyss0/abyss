/**
 * SINGLE CENTRAL CONFIGURATION FILE
 * Alish Shrestha (Abyss) — Minecraft-Inspired Interactive Portfolio
 * Controls all screen metadata, navigation, content, game mechanics, and prompts.
 */

export const PORTFOLIO_CONFIG = {
  // Identity
  player: {
    name: "Alish Shrestha",
    alias: "Abyss",
    title: "AI Student & Web Developer",
    edition: "BSc (Hons) AI · Creator Edition",
    location: "Kathmandu & Bhaktapur, Nepal",
    education: "BSc (Hons) in Artificial Intelligence · Softwarica College (Coventry University)",
    website: "https://www.sthaalish.com.np/",
    email: "shrestaalish444@gmail.com",
    phone: "+977 9826328462",
    portraitImage: "assets/alish-900.webp",
    portraitFallback: "assets/alish-cutout.png",
    availability: "Online — Available for projects & collaboration",
    version: "1.21.4-DEV",
    coordinates: "X: 27.6710, Y: 64, Z: 85.4298 (Bhaktapur, NP)"
  },

  // Social Links
  socials: [
    {
      id: "github",
      name: "GitHub",
      handle: "fwabyss0",
      url: "https://github.com/fwabyss0",
      iconKey: "githubPixel"
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      handle: "alish-shrestha",
      url: "https://www.linkedin.com/in/alish-shrestha-4276b8379",
      iconKey: "linkedinPixel"
    },
    {
      id: "instagram",
      name: "Instagram",
      handle: "@aliisshhhhhh",
      url: "https://www.instagram.com/aliisshhhhhh/",
      iconKey: "instagramPixel"
    },
    {
      id: "website",
      name: "Website",
      handle: "sthaalish.com.np",
      url: "https://www.sthaalish.com.np/",
      iconKey: "globePixel"
    }
  ],

  // 9 Core Screens
  screens: [
    {
      id: "hero",
      slot: 1,
      label: "Spawn",
      tag: "OVERWORLD",
      title: "ALISH SHRESTHA",
      subtitle: "// ABYSS",
      description: "Welcome to my interactive domain. Explore my projects, skills, crafting progression, and services.",
      hotbarIcon: "spawnCompass",
      tooltip: "Press 1 or click to visit Spawn Main Menu"
    },
    {
      id: "about",
      slot: 2,
      label: "Profile",
      tag: "PLAYER STATS",
      title: "Player Profile & Book",
      subtitle: "Inspecting player inventory, stats, and personal journey chronicle.",
      hotbarIcon: "playerHead",
      tooltip: "Press 2 or click to view Player Stats & Written Book"
    },
    {
      id: "skills",
      slot: 3,
      label: "Enchant",
      tag: "ENCHANTMENT TABLE",
      title: "Skills & Enchantments",
      subtitle: "Hover over enchanted books to view technical powers and mastery levels.",
      hotbarIcon: "enchantTable",
      tooltip: "Press 3 or click to enter the Enchantment Table"
    },
    {
      id: "projects",
      slot: 4,
      label: "Chest",
      tag: "LOOT CHEST",
      title: "Project Inventory Chest",
      subtitle: "Double-chest storage containing verified production builds and interactive applications.",
      hotbarIcon: "chest",
      tooltip: "Press 4 or click to open Project Chest Inventory"
    },
    {
      id: "experience",
      slot: 5,
      label: "Craft",
      tag: "CRAFTING TABLE",
      title: "Experience Crafting Table",
      subtitle: "Recipes that combined education, tools, and technical milestones into career progression.",
      hotbarIcon: "craftingTable",
      tooltip: "Press 5 or click to inspect 3x3 Crafting Recipes"
    },
    {
      id: "achievements",
      slot: 6,
      label: "Advance",
      tag: "ADVANCEMENTS",
      title: "Achievements & Milestones",
      subtitle: "Tree of advancements unlocked through engineering, academic pursuit, and management.",
      hotbarIcon: "advancementTrophy",
      tooltip: "Press 6 or click to view Advancements Menu"
    },
    {
      id: "services",
      slot: 7,
      label: "Trading",
      tag: "VILLAGER TRADING",
      title: "Villager Trading Post",
      subtitle: "Exchange emerald tokens for specialized engineering, AI development, and creative tech services.",
      hotbarIcon: "villagerEmerald",
      tooltip: "Press 7 or click to trade with the Wandering Villager"
    },
    {
      id: "contact",
      slot: 8,
      label: "Quill",
      tag: "BOOK & QUILL",
      title: "Book & Quill Communication",
      subtitle: "Write a transmission message or copy coordinates to establish a direct connection.",
      hotbarIcon: "bookAndQuill",
      tooltip: "Press 8 or click to open Book & Quill"
    },
    {
      id: "outro",
      slot: 9,
      label: "The End",
      tag: "THE END DIMENSION",
      title: "The End: Let's Build Together",
      subtitle: "The portal stands open. Return to world or collaborate on the next digital frontier.",
      hotbarIcon: "endCrystal",
      tooltip: "Press 9 or click to enter The End Dimension"
    }
  ],

  // Written Book Content (Screen 2: About)
  writtenBook: {
    title: "Chronicles of Abyss",
    author: "Alish Shrestha",
    pages: [
      {
        pageNumber: 1,
        title: "I. The Origin",
        content: `I'm an AI student and developer dedicated to building useful digital experiences through technology, problem-solving, and creative experimentation.\n\nI treat software not just as syntax, but as tangible interactive systems where human imagination meets computational rigor.`
      },
      {
        pageNumber: 2,
        title: "II. Academic Journey",
        content: `Currently pursuing a BSc (Hons) in Artificial Intelligence at Softwarica College, partnered with Coventry University in the UK.\n\nMy curriculum delves deep into neural network architectures, machine learning mathematical foundations, NLP transformers, and autonomous agents.`
      },
      {
        pageNumber: 3,
        title: "III. Creative & Operations",
        content: `Beyond code, I oversee physical production operations at Print Village in Bhaktapur.\n\nBridging high-speed digital tools with real-world physical machinery has given me a deep respect for operational discipline, deadline delivery, and end-to-end product craftsmanship.`
      }
    ]
  },

  // Focus Domains (Screen 2)
  focusAreas: [
    {
      icon: "🧠",
      title: "Artificial Intelligence",
      description: "Delving into neural networks, deep learning architectures, NLP tokenization, and cognitive systems at Softwarica (Coventry University)."
    },
    {
      icon: "🌐",
      title: "Web Engineering",
      description: "Engineering lightweight, highly performant interfaces with semantic markup, modern CSS layouts, and clean modular JavaScript."
    },
    {
      icon: "🖨️",
      title: "Creative Production & Ops",
      description: "Managing operations, print workflows, and media production at Print Village, bridging digital code and tangible real-world output."
    }
  ],

  // Skills & Enchantments (Screen 3)
  skillCategories: [
    {
      id: "programming",
      name: "Programming & Web",
      shortName: "Programming",
      tag: "CORE LANGUAGES",
      accent: "#38bdf8",
      description: "Languages and software engineering foundations for responsive web systems",
      skills: [
        { name: "Python", highlight: "AI & Automation", badge: "Py", level: "V", levelName: "Primary Mastery" },
        { name: "JavaScript (ES6+)", highlight: "Modern Frontend", badge: "JS", level: "V", levelName: "Primary Mastery" },
        { name: "TypeScript", highlight: "Type-safe Engineering", badge: "TS", level: "IV", levelName: "Advanced" },
        { name: "HTML5 Semantic", highlight: "Structure & A11y", badge: "H5", level: "V", levelName: "Core Foundation" },
        { name: "CSS3 / Modern CSS", highlight: "Responsive & Flex/Grid", badge: "C3", level: "V", levelName: "Core Foundation" }
      ]
    },
    {
      id: "ai-ml",
      name: "Artificial Intelligence & ML",
      shortName: "AI & ML",
      tag: "NEURAL & DATA",
      accent: "#a855f7",
      description: "Academic focus & practical machine learning models at Softwarica / Coventry",
      skills: [
        { name: "TensorFlow", highlight: "Deep Learning Models", badge: "TF", level: "IV", levelName: "Research Focus" },
        { name: "Neural Networks", highlight: "Architectures & Weights", badge: "NN", level: "IV", levelName: "Academic Focus" },
        { name: "NLP", highlight: "Text Processing & Embeddings", badge: "NLP", level: "III", levelName: "Applied Research" },
        { name: "Data Science", highlight: "Pipelines & Analysis", badge: "DS", level: "IV", levelName: "Applied Practice" },
        { name: "NumPy & Pandas", highlight: "Vector Computations", badge: "NP", level: "IV", levelName: "Core Library" },
        { name: "Scikit-Learn", highlight: "Supervised Algorithms", badge: "SK", level: "IV", levelName: "Model Training" }
      ]
    },
    {
      id: "tools",
      name: "Development Tools & Workflow",
      shortName: "Dev Tools",
      tag: "DEV ECOSYSTEM",
      accent: "#34d399",
      description: "Tooling for rapid development, version control, and dependable deployments",
      skills: [
        { name: "Git & GitHub", highlight: "Version Control & Branching", badge: "Git", level: "V", levelName: "Daily Workflow" },
        { name: "VS Code", highlight: "IDE Configuration", badge: "VSC", level: "V", levelName: "Daily Environment" },
        { name: "Vite", highlight: "Lightning Fast Bundling", badge: "Vite", level: "V", levelName: "Build Tooling" },
        { name: "Chrome DevTools", highlight: "Performance Audits & Profiling", badge: "Dev", level: "IV", levelName: "Diagnostic" },
        { name: "Vercel & Netlify", highlight: "CI/CD & Cloud Edge", badge: "Cld", level: "V", levelName: "Deployment" }
      ]
    },
    {
      id: "creative",
      name: "Creative Technology & Production",
      shortName: "Creative Tech",
      tag: "PHYSICAL & DIGITAL",
      accent: "#f472b6",
      description: "Visual aesthetics, media production, and real-world print execution",
      skills: [
        { name: "UI/UX Design", highlight: "Design Systems & Tokens", badge: "UX", level: "IV", levelName: "Design Craft" },
        { name: "Figma", highlight: "Wireframes & Mockups", badge: "Fig", level: "IV", levelName: "Prototyping" },
        { name: "Photography & Imaging", highlight: "Composition & Color", badge: "Img", level: "IV", levelName: "Visual Direction" },
        { name: "Video Production", highlight: "Pacing & Motion", badge: "Vid", level: "III", levelName: "Media Editing" },
        { name: "Print Production", highlight: "Shop Management at Print Village", badge: "Prn", level: "V", levelName: "Operational Master" }
      ]
    }
  ],

  // Real Projects (Screen 4: Chest Inventory)
  projects: [
    {
      id: "yatra",
      title: "Yatra Travel Platform",
      tag: "WEB APPLICATION",
      year: "2026",
      description: "A travel discovery and itinerary exploration platform built with responsive listings, clean destination detail architecture, and seamless routing.",
      stack: ["JavaScript", "CSS3 Grid", "Responsive UX", "Netlify"],
      liveUrl: "https://yatrala.netlify.app/",
      githubUrl: "https://github.com/fwabyss0/Yatra",
      accent: "#8b5cf6",
      iconKey: "spawnCompass",
      rarity: "rare",
      rarityLabel: "Rare Item",
      chestSlot: 1,
      lore: "Crafted for seamless navigation across global travel horizons."
    },
    {
      id: "polaroid-printer",
      title: "Polaroid Printer Experience",
      tag: "CREATIVE HARDWARE & WEB",
      year: "2026",
      description: "An interactive instant-photo printing platform connecting custom hardware concepts with a modern web interface for tangible Polaroid-style print captures.",
      stack: ["JavaScript", "Hardware Interface", "Vercel", "Web UI"],
      liveUrl: "https://polariod-printer.vercel.app/",
      githubUrl: "https://github.com/fwabyss0/PolariodPrinter",
      accent: "#38bdf8",
      iconKey: "paperScroll",
      rarity: "epic",
      rarityLabel: "Epic Gear",
      chestSlot: 2,
      lore: "Binds the digital screen to physical photographic paper."
    },
    {
      id: "sashon",
      title: "Sashon Marketing Platform",
      tag: "CLIENT WEB PLATFORM",
      year: "2026",
      description: "High-conversion digital brand presence and marketing website crafted for business reach with refined interactive components and dynamic layouts.",
      stack: ["JavaScript", "Vanilla CSS", "Responsive Design", "Vercel"],
      liveUrl: "https://sashon.vercel.app/",
      githubUrl: "https://github.com/fwabyss0/sashon",
      accent: "#f472b6",
      iconKey: "goldIngot",
      rarity: "uncommon",
      rarityLabel: "Uncommon",
      chestSlot: 3,
      lore: "An elegant merchant display engineered for commercial outreach."
    },
    {
      id: "print-village",
      title: "Print Village Workflow Portal",
      tag: "OPERATIONS & PRODUCTION",
      year: "2026",
      description: "Operations workflow and print production coordination tool managing client orders, media specifications, and shop schedules at Print Village.",
      stack: ["HTML5", "CSS3", "JavaScript", "Workflow Systems"],
      liveUrl: null,
      githubUrl: "https://github.com/fwabyss0/Print-Village",
      accent: "#4ade80",
      iconKey: "anvil",
      rarity: "legendary",
      rarityLabel: "Legendary Tool",
      chestSlot: 4,
      lore: "Forged in the heart of daily printing and manufacturing operations."
    }
  ],

  // Experience as Minecraft 3x3 Crafting Recipes (Screen 5)
  craftingRecipes: [
    {
      id: "ai-degree",
      result: {
        title: "BSc (Hons) Artificial Intelligence",
        subtitle: "Softwarica College (Coventry University)",
        period: "2025 — Present",
        location: "Kathmandu, Nepal",
        iconKey: "beacon",
        description: "Engaged in comprehensive study of deep learning architectures, computational mathematics, computer vision, and cognitive AI systems."
      },
      grid: [
        { item: "Python", iconKey: "diamondPickaxe" },
        { item: "Linear Algebra", iconKey: "redstoneDust" },
        { item: "Neural Networks", iconKey: "netherStar" },
        { item: "NLP Research", iconKey: "paperScroll" },
        { item: "Coventry Univ", iconKey: "beacon" },
        { item: "Model Training", iconKey: "xpBottle" },
        { item: "Data Science", iconKey: "lapisLazuli" },
        { item: "Machine Learning", iconKey: "potionBottle" },
        { item: "Ethics in AI", iconKey: "shield" }
      ]
    },
    {
      id: "print-village-manager",
      result: {
        title: "Operations & Production Manager",
        subtitle: "Print Village",
        period: "Active Practice",
        location: "Bhaktapur, Nepal",
        iconKey: "anvil",
        description: "Directing print production pipelines, technical hardware calibration, client communications, and precision output delivery."
      },
      grid: [
        { item: "Print Machinery", iconKey: "anvil" },
        { item: "Client Orders", iconKey: "paperScroll" },
        { item: "Media Specs", iconKey: "mapIcon" },
        { item: "Team Leadership", iconKey: "shield" },
        { item: "Quality Control", iconKey: "goldIngot" },
        { item: "Shop Schedule", iconKey: "clock" },
        { item: "Color Calibration", iconKey: "lapisLazuli" },
        { item: "Hardware Maint", iconKey: "ironIngot" },
        { item: "Vendor Relations", iconKey: "villagerEmerald" }
      ]
    },
    {
      id: "cs-foundations",
      result: {
        title: "+2 Computer Science Graduate",
        subtitle: "Khwopa Secondary School",
        period: "2023 — 2025",
        location: "Bhaktapur, Nepal",
        iconKey: "paperScroll",
        description: "Graduated with major in Computer Science, mastering procedural programming, algorithmic thinking, database logic, and discrete mathematics."
      },
      grid: [
        { item: "Algorithms", iconKey: "redstoneTorch" },
        { item: "C Programming", iconKey: "ironIngot" },
        { item: "Data Structures", iconKey: "chest" },
        { item: "Database/SQL", iconKey: "woodPlank" },
        { item: "Discrete Math", iconKey: "mapIcon" },
        { item: "OOP Concepts", iconKey: "paperScroll" },
        { item: "Web Basics", iconKey: "spawnCompass" },
        { item: "Hardware Basics", iconKey: "craftingTable" },
        { item: "Excellence", iconKey: "goldenApple" }
      ]
    }
  ],

  // Advancements (Screen 6)
  advancements: [
    {
      id: "taking-inventory",
      title: "Taking Inventory",
      category: "Advancement",
      desc: "Open and examine the double-chest inventory containing production web apps and hardware projects.",
      iconKey: "chest",
      unlocked: true,
      xpReward: 35
    },
    {
      id: "enchanter",
      title: "Enchanter",
      category: "Goal",
      desc: "Attain and inspect 20+ specialized tech enchantments across Python, AI/ML, and modern web engineering.",
      iconKey: "enchantTable",
      unlocked: true,
      xpReward: 50
    },
    {
      id: "the-academic-portal",
      title: "Into the Academy",
      category: "Challenge",
      desc: "Entered the degree realm at Softwarica College (Coventry University) in Artificial Intelligence.",
      iconKey: "netherStar",
      unlocked: true,
      xpReward: 75
    },
    {
      id: "master-crafter",
      title: "Master Crafter",
      category: "Goal",
      desc: "Crafted and deployed live platforms: Yatra Travel Platform, Polaroid Printer, and Sashon.",
      iconKey: "diamondPickaxe",
      unlocked: true,
      xpReward: 50
    },
    {
      id: "print-operator",
      title: "The Operator",
      category: "Advancement",
      desc: "Managed daily hardware, print production, and precision delivery pipelines at Print Village.",
      iconKey: "anvil",
      unlocked: true,
      xpReward: 40
    },
    {
      id: "free-the-end",
      title: "Free The End",
      category: "Challenge",
      desc: "Traveled to the End Dimension and unlocked direct transmission channels with Abyss.",
      iconKey: "endCrystal",
      unlocked: true,
      xpReward: 100
    }
  ],

  // Villager Service Trades (Screen 7)
  services: [
    {
      id: "web-engineering",
      title: "Full-Stack Web Engineering",
      villagerRole: "Master Architect",
      costEmeralds: 24,
      costItem: "Compass",
      costItemKey: "spawnCompass",
      offering: "Custom Web Experience",
      offeringKey: "beacon",
      description: "High-performance web apps with clean semantic HTML, modular JS, glassmorphic or pixel-themed CSS design, and edge deployment.",
      deliverables: ["Responsive architecture", "Ultra-fast load times", "Interactive state logic", "Production deployment"]
    },
    {
      id: "ai-prototyping",
      title: "AI & ML Prototyping",
      villagerRole: "Alchemist of Mind",
      costEmeralds: 32,
      costItem: "Nether Star",
      costItemKey: "netherStar",
      offering: "Trained Model & API",
      offeringKey: "potionBottle",
      description: "Prototyping applied machine learning solutions, natural language processing pipelines, and data exploration workflows using Python & TensorFlow.",
      deliverables: ["Exploratory data analysis", "Custom model training", "Inference endpoint integration", "Comprehensive report"]
    },
    {
      id: "creative-print-systems",
      title: "Creative Tech & Print Pipeline",
      villagerRole: "Guild Overseer",
      costEmeralds: 16,
      costItem: "Written Book",
      costItemKey: "bookAndQuill",
      offering: "Production System",
      offeringKey: "anvil",
      description: "Connecting digital tools to hardware peripherals and coordinating precision physical print production workflows.",
      deliverables: ["Hardware-web interface", "Print production setup", "Workflow automation", "Brand aesthetic design"]
    }
  ],

  // Contact (Screen 8)
  contact: {
    heading: "Book & Quill Transmission",
    subheading: "Sign your name, pen a transmission message, or copy my coordinates to collaborate.",
    recipient: "Alish Shrestha (Abyss)",
    email: "shrestaalish444@gmail.com",
    phone: "+977 9826328462",
    location: "Kathmandu & Bhaktapur, Nepal"
  },

  // Outro (Screen 9)
  outro: {
    heading: "LET'S BUILD SOMETHING.",
    quote: "The End is not the conclusion, but the gateway to what we build next.",
    buttonText: "Return to Spawn (1)",
    emailCta: "Initiate Transmission",
    copyCta: "Copy Coordinate / Email"
  },

  // Game Mechanics & XP Progression
  gameMechanics: {
    baseScreenXp: 35,
    minigameXpRange: [20, 45],
    heartsTotal: 10,
    hungerTotal: 10,
    startingLevel: 21,
    xpToLevelFormula: (xp) => Math.floor(Math.sqrt(xp / 20)) + 1
  },

  // Mining Minigame (Press 'M')
  miningMinigame: {
    ores: [
      { id: "coal", name: "Coal Ore", iconKey: "coalOre", hitsRequired: 3, xp: 15, drop: "1x Lump of Coal" },
      { id: "iron", name: "Iron Ore", iconKey: "ironOre", hitsRequired: 4, xp: 25, drop: "1x Raw Iron Ingot" },
      { id: "gold", name: "Gold Ore", iconKey: "goldOre", hitsRequired: 5, xp: 35, drop: "1x Raw Gold Ingot" },
      { id: "redstone", name: "Redstone Ore", iconKey: "redstoneOre", hitsRequired: 4, xp: 30, drop: "4x Redstone Dust" },
      { id: "diamond", name: "Diamond Ore", iconKey: "diamondOre", hitsRequired: 6, xp: 50, drop: "1x Flawless Diamond" },
      { id: "emerald", name: "Emerald Ore", iconKey: "emeraldOre", hitsRequired: 5, xp: 45, drop: "1x Villager Emerald" }
    ]
  },

  // F3 Debug Overlay Simulated Data
  debugConfig: {
    engine: "Minecraft Portfolio Engine v2.0",
    resolution: "1920x1080 (DPR 2.0)",
    renderer: "HTML5 Canvas + Vanilla CSS Grid/Flex",
    biome: "minecraft:lush_developer_plains",
    difficulty: "Creative / Hardcore Engineering",
    fpsTarget: "60.0 fps"
  },

  // Background Prompts for AI Generation & Documentation (Section 8)
  backgroundPrompts: [
    {
      screenId: "hero",
      title: "Hero Spawn World",
      prompt: "Isometric voxel diorama of a lush Minecraft spawn clearing at sunrise, cubic pine trees, tiered grassy voxel hills, clean square sun, floating blocky clouds, warm morning golden lighting, clean geometry, 8k resolution, voxel art aesthetic.",
      geometryLock: "Rigid cubic blocks, no smoothed edges, 90-degree polygonal mesh alignment, hard voxel surface normals."
    },
    {
      screenId: "about",
      title: "About Player Profile",
      prompt: "Voxel interior of a cozy Minecraft explorer's library, dark oak bookshelves stacked with pixelated books, stone-brick hearth with gentle flame glow, workbench and lectern, warm ambient lighting.",
      geometryLock: "Strict 16-pixel unit modular grid, orthogonal book alignment, crisp wood grain texture boundaries."
    },
    {
      screenId: "skills",
      title: "Skills Enchantment Table",
      prompt: "Voxel enchanting chamber, dark obsidian floor with glowing glyphs, floating enchanted books with purple particle runes, lapis lazuli pillars, deep atmospheric violet and cyan volumetric lighting.",
      geometryLock: "Orthogonal obsidian blocks, cubic crystal glyphs, planar particle emission along voxel axes."
    },
    {
      screenId: "projects",
      title: "Projects Chest Vault",
      prompt: "Underground Minecraft treasure vault, double wooden chests lined along smooth stone walls, item frames displaying glowing tools, warm torchlight casting square shadows across cobblestone floors.",
      geometryLock: "Uniform cubic block dimensions, square shadow boundaries, strict axis-aligned storage chests."
    },
    {
      screenId: "experience",
      title: "Experience Crafting Workshop",
      prompt: "Voxel engineering workshop with oak crafting tables, anvil, furnace with glowing red embers, blueprints spread across a wooden counter, warm industrial dungeon lighting.",
      geometryLock: "Standard 3x3 cubic grid proportions, distinct block face separations, no organic curved distortions."
    },
    {
      screenId: "achievements",
      title: "Advancements Hall",
      prompt: "Grand hall of trophies made of sandstone and gold blocks, golden pedestals holding pixelated relics, banners hanging from blocky arches, dramatic high-angle daylight through clerestory windows.",
      geometryLock: "Stepped arch architecture using cubic stairs and slabs, precise symmetrical block counts."
    },
    {
      screenId: "services",
      title: "Villager Trading Outpost",
      prompt: "Voxel desert trading bazaar, striped awnings over merchant stalls, piles of glowing emeralds and traded goods, acacia wood fences, bright desert midday sun casting crisp blocky shadows.",
      geometryLock: "Perpendicular fence posts, cubic fabric canopy segments, sharp angular shadows."
    },
    {
      screenId: "contact",
      title: "Book & Quill Scriptorium",
      prompt: "A solitary voxel writing desk perched before a large panoramic window overlooking a twilight pine forest, lit candle with pixel flicker, open parchment book, ink pot with feather quill.",
      geometryLock: "Flat planar desk surface, cubic candle cylinder approximation, blocky window mullions."
    },
    {
      screenId: "outro",
      title: "The End Dimension Outro",
      prompt: "Voxel End dimension, dark obsidian pillars reaching into an abyssal star-scattered void, shimmering purple Ender crystal with vertical beam of light, floating End stone islands, mysterious violet nebula.",
      geometryLock: "Monolithic vertical obsidian columns with square cross-sections, faceted cubic crystal geometry."
    }
  ]
};
