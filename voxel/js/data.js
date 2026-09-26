/* ============================================================
   CONTENT — the single place to edit the portfolio.

   Every section, link, project and image path lives here.
   Nothing in the 3D world hard-codes portfolio content, so you
   can rewrite this file without touching rooms.js, main.js or ui.js.

   IMAGES are optional. Drop a file into assets/ and point the
   path here; if the file is missing the world shows a clean
   placeholder panel instead of a broken image.
   ============================================================ */

/* ---- asset roots ------------------------------------------------ */
export const ASSETS = {
  images: 'assets/images/',
  projects: 'assets/projects/',
  textures: 'assets/textures/',
  icons: 'assets/icons/'
};

/* Every personal image in one list. The ABOUT room shows
   `profile`, the PROJECTS room shows one panel per entry in
   `projects`. Delete a line to remove it, add a line to add it. */
export const MEDIA = {
  profile: 'assets/images/profile.jpg',

  projects: [
    { key: 'yatra',    image: 'assets/projects/yatra.png' },
    { key: 'printres', image: 'assets/projects/printres.png' },
    { key: 'abyss',    image: 'assets/projects/abyss.png' }
  ]
};

export const PROFILE = {
  name: 'ALISH SHRESTHA',
  role: 'AI STUDENT • WEB DEVELOPER • CREATOR',
  tagline: 'Building things where code meets the world.',

  age: 19,
  location: 'Changu Narayan-01, Bhaktapur, Nepal',
  nationality: 'Nepali',
  status: 'Open to internships, freelance work and collaborations',
  copyright: '© 2024 Alish Shrestha. All rights reserved.',

  about: [
    "I'm Alish — a nineteen-year-old AI student and web developer based in Bhaktapur, Nepal. I work across machine learning and the web: models on one side, interfaces on the other, and the bridge between them.",
    "Right now I study Artificial Intelligence at Softwarica College (Coventry University) while working as Manager at Print Village, where I handle operations, client relations and print production.",
    "This portfolio is the bridge. Instead of a page you scroll, it's a small voxel world you explore — every room is a section of who I am and what I've made."
  ],

  education: [
    {
      when: '2023 — 2025',
      what: 'Secondary Education — Computer Science',
      where: 'Khwopa Secondary School, Bhaktapur, Nepal',
      desc: 'Computer Science specialization: programming fundamentals, data structures, and the start of everything since.'
    },
    {
      when: '2025 — Present',
      what: "Bachelor's in Artificial Intelligence",
      where: 'Softwarica College (Coventry University), Kathmandu, Nepal',
      desc: 'Deep learning, neural networks, data science and computer vision — with the web work that keeps me honest.'
    }
  ],

  links: [
    { label: 'GitHub',    url: 'https://github.com/fwabyss0',                            icon: 'github',    color: '#a78bfa', handle: '@fwabyss0' },
    { label: 'LinkedIn',  url: 'https://www.linkedin.com/in/alish-shrestha-4276b8379/', icon: 'linkedin',  color: '#38bdf8' },
    { label: 'Instagram', url: 'https://www.instagram.com/aliisshhhhhh/',               icon: 'instagram', color: '#f472b6' },
    { label: 'Facebook',  url: 'https://www.facebook.com/alish.shrestha.138982',       icon: 'facebook',  color: '#60a5fa' },
    { label: 'Discord',   url: 'https://discord.com/users/fwabyss',                    icon: 'discord',   color: '#818cf8', handle: 'fwabyss' },
    { label: 'Email',     url: 'mailto:shresthaalish444@gmail.com',                    icon: 'mail',      color: '#4ade80', handle: 'shresthaalish444@gmail.com' }
  ]
};

export const SECTIONS = [
  {
    id: 'home',
    icon: 'home',
    slot: 1,
    label: 'HOME',
    title: 'Alish Shrestha',
    subtitle: 'AI Student • Web Developer • Creator',
    kind: 'hub',
    color: '#a855f7',
    /* the room's accent colour, shared by the portal, the lights
       and the HUD. One value keeps the whole room coherent. */
    accent: 0xa855f7,
    blocks: 'home'
  },
  {
    id: 'about',
    icon: 'book',
    slot: 2,
    label: 'ABOUT',
    title: 'About Me',
    subtitle: 'Who I am — and where I am',
    kind: 'about',
    color: '#38bdf8',
    accent: 0x38bdf8,
    blocks: 'lapis'
  },
  {
    id: 'skills',
    icon: 'sword',
    slot: 3,
    label: 'SKILLS',
    title: 'Skills',
    subtitle: 'The tools I actually reach for',
    kind: 'skills',
    color: '#4ade80',
    accent: 0x4ade80,
    blocks: 'emerald',
    groups: [
      { name: 'Programming', skills: ['Python', 'JavaScript', 'HTML', 'CSS'] },
      { name: 'AI & ML',     skills: ['TensorFlow', 'Neural Networks', 'Data Science', 'Deep Learning'] },
      { name: 'Tools',       skills: ['VS Code', 'GitHub', 'Git', 'DevTools'] },
      { name: 'Creative',    skills: ['Video Editing', 'UI/UX Design', 'Photography', 'Communication'] }
    ]
  },
  {
    id: 'experience',
    icon: 'compass',
    slot: 4,
    label: 'EXPERIENCE',
    title: 'Experience',
    subtitle: 'Where I have been and what I do',
    kind: 'timeline',
    color: '#fbbf24',
    accent: 0xfbbf24,
    blocks: 'copper',
    items: [
      { when: '2025 — Present', what: 'AI Student',   where: 'Softwarica College · Coventry University', desc: "Bachelor's in Artificial Intelligence. Deep learning, neural networks, data science and computer vision." },
      { when: '2024 — Present', what: 'Manager',      where: 'Print Village, Bhaktapur', desc: 'Operations, client relations and print production. Running the day-to-day of a real business while studying full time.' },
      { when: '2023 — Present', what: 'Web Developer', where: 'Freelance & personal projects', desc: 'Responsive websites and interactive 3D experiences — client work plus my own experiments that go too far.' },
      { when: 'Ongoing',         what: 'Creator',      where: 'Instagram / open source', desc: 'Documenting the build process, shipping small tools, and sharing what I learn along the way.' }
    ]
  },
  {
    id: 'projects',
    icon: 'gem',
    slot: 5,
    label: 'PROJECTS',
    title: 'Projects',
    subtitle: 'Things I built and put my name on',
    kind: 'projects',
    color: '#f43f5e',
    accent: 0xf43f5e,
    blocks: 'diamond',
    /* `mediaKey` is looked up in MEDIA.projects; when the image is
       missing the in-world PROJECTS screens fall back to a
       generated code/UI panel instead of a broken image. */
    items: [
      {
        name: 'Yatra Travel Agency',
        tag: 'Web · Travel Platform',
        desc: 'A travel agency web platform with search, listings and a clean booking flow.',
        link: 'https://yatrala.netlify.app',
        repo: 'https://github.com/fwabyss0/Yatra',
        mediaKey: 'yatra'
      },
      {
        name: 'Printing Resolution',
        tag: 'Web · Print Services',
        desc: 'Online presence for print services — quotations, service listings and a contact flow.',
        link: 'https://printresolution.netlify.app/',
        repo: 'https://github.com/fwabyss0/pr',
        mediaKey: 'printres'
      },
      {
        name: 'Abyss AI Chatbot',
        tag: 'Python · LLM',
        desc: 'A conversational AI chatbot experiment — retrieval, prompting and a web front-end.',
        repo: 'https://github.com/fwabyss0/Protfolio',
        mediaKey: 'abyss'
      }
    ]
  },
  {
    id: 'contact',
    icon: 'mail',
    slot: 6,
    label: 'CONTACT',
    title: 'Contact',
    subtitle: 'The fastest way to reach me',
    kind: 'contact',
    color: '#c084fc',
    accent: 0xc084fc,
    blocks: 'amethyst',
    items: [
      { label: 'Email',     value: 'shresthaalish444@gmail.com',   note: 'Best for anything serious', url: 'mailto:shresthaalish444@gmail.com' },
      { label: 'GitHub',    value: '@fwabyss0',                    note: 'Code, experiments, commits', url: 'https://github.com/fwabyss0' },
      { label: 'LinkedIn',  value: 'in/alish-shrestha',            note: 'Internships & recruiters', url: 'https://www.linkedin.com/in/alish-shrestha-4276b8379/' },
      { label: 'Instagram', value: '@aliisshhhhhh',                note: 'Behind the build', url: 'https://www.instagram.com/aliisshhhhhh/' },
      { label: 'Discord',   value: 'fwabyss',                      note: 'Quick chat', url: 'https://discord.com/users/fwabyss' },
      { label: 'Location',  value: 'Changu Narayan-01, Bhaktapur', note: 'Nepal 🇳🇵', url: '' }
    ],
    note: 'Open to internships, freelance work, collaborations and interesting problems.'
  }
];

export const HOTBAR = SECTIONS;

/* Look up the image path for a project's `mediaKey`, or null when
   the user has not supplied one. ui.js and the 3D screens both use
   this, so a missing image degrades to a placeholder in both. */
export function projectImage(mediaKey) {
  if (!mediaKey) return null;
  const hit = MEDIA.projects.find(p => p.key === mediaKey);
  return hit ? hit.image : null;
}
