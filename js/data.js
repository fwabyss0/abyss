/**
 * Personal Portfolio Data Source
 * Alish Shrestha (Abyss)
 * Single source of truth for content, verified links, and project information.
 */

export const PROFILE = {
  name: "Alish Shrestha",
  preferredName: "Abyss",
  eyebrow: "AI STUDENT · WEB DEVELOPER · CREATOR",
  tagline: "I build digital experiences that bring ideas to life through technology, creativity, and thoughtful design.",
  availability: "Available for projects & collaboration",
  website: "https://www.sthaalish.com.np/",
  email: "shrestaalish444@gmail.com",
  phone: "+977 9826328462",
  phoneFormatted: "+977 9826328462",
  location: "Kathmandu & Bhaktapur, Nepal",
  education: "BSc (Hons) in Artificial Intelligence · Softwarica College (Coventry University)",
  portraitImage: "assets/alish-900.webp",
  portraitFallback: "assets/alish-cutout.png",
  portraitAlt: "Alish Shrestha (Abyss) — AI Student, Web Developer and Creator"
};

export const SOCIALS = [
  {
    name: "GitHub",
    handle: "fwabyss0",
    url: "https://github.com/fwabyss0",
    icon: "github"
  },
  {
    name: "LinkedIn",
    handle: "alish-shrestha",
    url: "https://www.linkedin.com/in/alish-shrestha-4276b8379",
    icon: "linkedin"
  },
  {
    name: "Instagram",
    handle: "@aliisshhhhhh",
    url: "https://www.instagram.com/aliisshhhhhh/",
    icon: "instagram"
  },
  {
    name: "Website",
    handle: "sthaalish.com.np",
    url: "https://www.sthaalish.com.np/",
    icon: "globe"
  }
];

export const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" }
];

export const PROJECTS = [
  {
    id: "yatra",
    title: "Yatra Travel Platform",
    tag: "WEB APPLICATION",
    year: "2026",
    description: "A travel discovery and itinerary exploration platform built with responsive listings, clean destination detail architecture, and seamless routing.",
    stack: ["JavaScript", "CSS3 Grid", "Responsive UX", "Netlify"],
    liveUrl: "https://yatrala.netlify.app/",
    githubUrl: "https://github.com/fwabyss0/Yatra",
    featured: true,
    accent: "#8b5cf6"
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
    featured: true,
    accent: "#38bdf8"
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
    featured: true,
    accent: "#f472b6"
  },
  {
    id: "print-village",
    title: "Print Village Workflow Portal",
    tag: "OPERATIONS & PRODUCTION",
    year: "2026",
    description: "Operations workflow and print production coordination tool managing client orders, media specifications, and shop schedules at Print Village.",
    stack: ["HTML5", "CSS3", "JavaScript", "Workflow Systems"],
    liveUrl: null, // Private internal system
    githubUrl: "https://github.com/fwabyss0/Print-Village",
    featured: false,
    accent: "#4ade80"
  }
];

export const SKILL_CATEGORIES = [
  {
    id: "programming",
    name: "Programming & Web",
    shortName: "Programming",
    tag: "CORE LANGUAGES",
    accent: "#38bdf8",
    description: "Languages and foundational software engineering for scalable web systems",
    skills: [
      { name: "Python", highlight: "AI & Scripting", badge: "Py", level: "Primary" },
      { name: "JavaScript (ES6+)", highlight: "Modern Frontend", badge: "JS", level: "Primary" },
      { name: "TypeScript", highlight: "Type-safe Engineering", badge: "TS", level: "Advanced" },
      { name: "HTML5 Semantic", highlight: "Structure & A11y", badge: "H5", level: "Core" },
      { name: "CSS3 / Modern CSS", highlight: "Glassmorphism & Flex/Grid", badge: "C3", level: "Core" }
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
      { name: "TensorFlow", highlight: "Deep Learning", badge: "TF", level: "Focus" },
      { name: "Neural Networks", highlight: "Architectures & Training", badge: "NN", level: "Focus" },
      { name: "NLP", highlight: "Text & Tokenization", badge: "NLP", level: "Research" },
      { name: "Data Science & Analysis", highlight: "Data Pipeline", badge: "DS", level: "Applied" },
      { name: "NumPy & Pandas", highlight: "Scientific Computing", badge: "NP", level: "Core" },
      { name: "Scikit-Learn", highlight: "Supervised Learning", badge: "SK", level: "Applied" }
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
      { name: "Git & GitHub", highlight: "Version Control & CI/CD", badge: "Git", level: "Daily" },
      { name: "VS Code", highlight: "Primary IDE & Extensions", badge: "VSC", level: "Daily" },
      { name: "Vite", highlight: "Lightning Build Tooling", badge: "Vite", level: "Daily" },
      { name: "Chrome DevTools", highlight: "Performance & Debugging", badge: "Dev", level: "Daily" },
      { name: "Vercel & Netlify", highlight: "Edge & Cloud Deployment", badge: "Cld", level: "Daily" }
    ]
  },
  {
    id: "creative",
    name: "Creative Technology & Production",
    shortName: "Creative Tech",
    tag: "PHYSICAL & DIGITAL",
    accent: "#f472b6",
    description: "Merging visual aesthetics, media production, and real-world print execution",
    skills: [
      { name: "UI/UX Design", highlight: "Design Systems & Tokens", badge: "UX", level: "Design" },
      { name: "Figma", highlight: "Interface Wireframes & Specs", badge: "Fig", level: "Design" },
      { name: "Photography & Imaging", highlight: "Visual Direction & Framing", badge: "Img", level: "Media" },
      { name: "Video Production", highlight: "Cinematic Editing", badge: "Vid", level: "Media" },
      { name: "Print Production", highlight: "Operations at Print Village", badge: "Prn", level: "Print" }
    ]
  }
];

export const MILESTONES = [
  {
    role: "BSc (Hons) in Artificial Intelligence",
    organization: "Softwarica College (Coventry University)",
    period: "2025 — Present",
    location: "Kathmandu, Nepal",
    details: "Deepening theoretical and practical study in machine learning, neural networks, computer vision, and cognitive systems.",
    type: "education"
  },
  {
    role: "Manager",
    organization: "Print Village",
    period: "Active",
    location: "Bhaktapur, Nepal",
    details: "Supervising print operations, technical production workflows, client communications, and precision output delivery.",
    type: "experience"
  },
  {
    role: "Secondary Education (+2 Computer Science)",
    organization: "Khwopa Secondary School",
    period: "2023 — 2025",
    location: "Bhaktapur, Nepal",
    details: "Graduated with major in Computer Science, studying algorithms, procedural programming, database fundamentals, and mathematics.",
    type: "education"
  }
];
