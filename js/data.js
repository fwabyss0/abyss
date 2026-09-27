/* ============================================================
   DATA — every piece of copy on the site lives here.
   Edit this file to change content; no other file needs editing.
   ============================================================ */

const PROFILE = {
  name: 'Alish Shrestha',
  first: 'ALISH',
  last: 'SHRESTHA',
  role: ['COMPUTER SCIENCE & AI STUDENT', 'WEB DEVELOPER', 'CREATOR'],
  location: 'Changu Narayan-01, Bhaktapur, Nepal',
  timezone: 'Asia/Kathmandu',
  email: 'shrestaalish444@gmail.com'
};

// API Configuration
const API_KEYS = {
  weather: 'c4babc6f060dd6a90513fd541c6c8d42',
  tmdb: {
    apiKey: '8374984eee609823a3f80aee19ede44c',
    pass: '976654'
  },
  marvel: {
    clientId: 'c3Uc6oO0LGsMgK8Bat9p06uPfpdlLrLhNjU8sFom',
    secretId: 'ilrQVrcDBSpMzPih9kCkHbB9CTTMctGFQesZ2eR7WH4ShyVzqbYJoSkIoWLNQSrB1gRbWTW2UBAw57KzO9Iz3MpzdVk5G7Xa8WYWSkSFtr7HK7gLUqLyKmMbY6f1tvcU'
  }
};

const SOCIALS = [
  { label: 'GitHub',    handle: '@fwabyss0',     href: 'https://github.com/fwabyss0',                          accent: '#a855f7' },
  { label: 'LinkedIn',  handle: 'alish-shrestha', href: 'https://www.linkedin.com/in/alish-shrestha-4276b8379/',  accent: '#38bdf8' },
  { label: 'Instagram', handle: '@aliisshhhhhh',  href: 'https://www.instagram.com/aliisshhhhhh/',              accent: '#f472b6' },
  { label: 'Facebook',  handle: 'alish.shrestha', href: 'https://www.facebook.com/alish.shrestha.138982/',        accent: '#60a5fa' },
  { label: 'Email',     handle: 'shrestaalish444@gmail.com', href: 'mailto:shrestaalish444@gmail.com',            accent: '#4ade80' }
];

const STACK = [
  'JavaScript', 'TypeScript', 'Python', 'React', 'Next.js', 'Node.js',
  'HTML5', 'CSS3', 'Tailwind', 'Three.js', 'Git', 'Figma', 'Pandas',
  'NumPy', 'scikit-learn', 'PostgreSQL', 'Vite'
];

/* Skill categories. Each technology carries its own honest proficiency number
   — hover or focus a chip to see it. `color` is the technology's own brand
   colour: it drives both the icon and the conic ring that sweeps the chip's
   border up to that percentage. On a near-black page these read as small
   jewels of colour, which is the point. */
const SKILL_CATS = [
  {
    name: 'Programming',
    skills: [
      { name: 'Python',     percent: 70, icon: 'devicon-python-plain',        color: '#3776ab' },
      { name: 'JavaScript', percent: 65, icon: 'devicon-javascript-plain',    color: '#f7df1e' },
      { name: 'HTML',       percent: 85, icon: 'devicon-html5-plain',         color: '#e34f26' },
      { name: 'CSS',        percent: 80, icon: 'devicon-css3-plain',          color: '#1572b6' }
    ]
  },
  {
    name: 'AI & ML',
    skills: [
      { name: 'TensorFlow',      percent: 55, icon: 'devicon-tensorflow-original', color: '#ff6f00' },
      { name: 'Neural Networks', percent: 50, icon: 'devicon-pytorch-original',     color: '#ee4c2c' },
      { name: 'Data Science',    percent: 60, icon: 'devicon-pandas-plain',         color: '#14f1d9' },
      { name: 'Deep Learning',   percent: 50, icon: 'devicon-scikitlearn-plain',    color: '#b5ff6d' }
    ]
  },
  {
    name: 'Tools',
    skills: [
      { name: 'VS Code',        percent: 90, icon: 'devicon-vscode-plain',        color: '#007acc' },
      { name: 'GitHub',         percent: 75, icon: 'devicon-github-plain',       color: '#e6edf3' },
      { name: 'Git',            percent: 70, icon: 'devicon-git-plain',          color: '#f05032' },
      { name: 'DevTools',       percent: 65, icon: 'devicon-chrome-plain',       color: '#4caf50' },
      { name: 'Android Studio', percent: 10, icon: 'devicon-androidstudio-plain', color: '#a4c639' },
      { name: 'Flutter',        percent: 10, icon: 'devicon-flutter-plain',       color: '#02569b' }
    ]
  },
  {
    name: 'Creative',
    skills: [
      { name: 'Video Editing',  percent: 75, icon: 'devicon-premierepro-plain', color: '#ff6b9d' },
      { name: 'UI/UX Design',   percent: 60, icon: 'devicon-figma-plain',       color: '#ff9f43' },
      { name: 'Photography',   percent: 70, icon: 'devicon-photoshop-plain',   color: '#4ecdc4' },
      { name: 'Communication', percent: 80, icon: 'devicon-slack-plain',       color: '#a29bfe' }
    ]
  }
];

const PROJECTS = [
  {
    title: 'Yatra Travel Agency',
    tag: 'WEB APP',
    year: '2026',
    blurb: 'A travel experience platform for discovering destinations and planning routes — clean listing views, destination detail pages, and a Netlify deploy from the repo.',
    stack: ['JavaScript', 'Responsive UI', 'Netlify'],
    accent: '#a855f7',
    href: 'https://yatrala.netlify.app/',
    repo: 'https://github.com/fwabyss0/Yatra',
    featured: false
  },
  {
    title: 'Printing Resolution',
    tag: 'HARDWARE / WEB',
    year: '2026',
    blurb: 'A DIY instant-photo printer project — hardware build wired to a web interface that turns captured moments into printable Polaroid-style output.',
    stack: ['Arduino', 'Python', 'Web UI'],
    accent: '#38bdf8',
    href: 'https://printresolution.netlify.app/',
    repo: 'https://github.com/fwabyss0/pr',
    featured: false
  },
  {
    title: 'Abyss AI Chatbot',
    tag: 'EXPERIMENT',
    year: '2026',
    blurb: 'An AI-powered chatbot built with natural language processing and deep learning models for interactive conversations.',
    stack: ['Python', 'TensorFlow', 'Natural Language Processing'],
    accent: '#4ade80',
    href: 'https://github.com/fwabyss0/Protfolio.git',
    repo: 'https://github.com/fwabyss0/Protfolio.git',
    featured: false
  },
  {
    title: 'Voxel World Portfolio',
    tag: 'THREE.JS / WEBGL',
    year: '2026',
    blurb: 'An explorable 3D voxel world that turns this portfolio into a place — walk into a building to read a section, with a plain-HTML fallback for browsers without WebGL.',
    stack: ['JavaScript', 'Three.js', 'WebGL', 'HTML5'],
    accent: '#e4e4e7',
    href: 'voxel/index.html',
    repo: 'https://github.com/fwabyss0/Protfolio',
    featured: false
  }
];

/* `done: true` marks a completed stage. The education rail runs solid green
   through the completed stages and fades out over the one still in progress. */
const EDUCATION = [
  {
    title: 'Primary Education',
    org: 'North East English Secondary School',
    period: 'Primary',
    place: 'Bhaktapur, Nepal',
    note: 'Built a strong academic foundation across core subjects.',
    done: true
  },
  {
    title: 'Secondary Education',
    org: 'Khwopa Secondary School',
    period: '2023 — 2025',
    place: 'Bhaktapur, Nepal',
    note: 'Computer Science major — programming fundamentals and advanced mathematics.',
    done: true
  },
  {
    title: 'Higher Education',
    org: 'Softwarica College',
    period: '2025 — Present',
    place: 'Kathmandu, Nepal',
    note: 'BSc (Hons) in Artificial Intelligence, awarded by Coventry University.',
    done: false
  }
];

const EXPERIENCE = [
  {
    title: 'Manager at Print Village',
    org: 'Print Village',
    period: 'Present',
    place: 'Changu Narayan-01, Bhaktapur, Nepal',
    note: 'Handling operations, client relations, and print production.'
  }
];
