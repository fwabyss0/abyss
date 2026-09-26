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
  { label: 'Email',     handle: 'shrestaalish444@gmail.com', href: 'mailto:shrestaalish444@gmail.com',            accent: '#4ade80' },
  { label: 'CV',        handle: 'Download CV',    href: 'assets/cv.pdf',                                       accent: '#a78bfa' }
];

const STACK = [
  'JavaScript', 'TypeScript', 'Python', 'React', 'Next.js', 'Node.js',
  'HTML5', 'CSS3', 'Tailwind', 'Three.js', 'Git', 'Figma', 'Pandas',
  'NumPy', 'scikit-learn', 'PostgreSQL', 'Vite'
];

const SKILLS = [
  { name: 'Programming', level: 90, note: 'Python, JavaScript, HTML, CSS', tags: ['Python', 'JavaScript', 'HTML', 'CSS'] },
  { name: 'AI & ML', level: 85, note: 'TensorFlow, Neural Networks, Data Science, Deep Learning', tags: ['TensorFlow', 'Neural Networks', 'Data Science', 'Deep Learning'] },
  { name: 'Tools', level: 80, note: 'VS Code, GitHub, Git, DevTools', tags: ['VS Code', 'GitHub', 'Git', 'DevTools'] },
  { name: 'Creative', level: 75, note: 'Video Editing, UI/UX Design, Photography, Communication', tags: ['Video Editing', 'UI/UX Design', 'Photography', 'Communication'] }
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
    featured: true
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
    featured: true
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
  }
];

const EDUCATION = [
  {
    title: 'Secondary Education — Khwopa Secondary School',
    org: 'Khwopa Secondary School',
    period: '2023 — 2025',
    place: 'Bhaktapur, Nepal',
    note: 'Computer Science specialization'
  },
  {
    title: 'Higher Education — Softwarica College (Coventry University)',
    org: 'Softwarica College',
    period: '2025 — Present',
    place: 'Kathmandu, Nepal',
    note: 'Pursuing Bachelor\'s in Artificial Intelligence'
  }
];

const EXPERIENCE = [
  {
    title: 'Manager at Print Village',
    org: 'Print Village',
    period: 'Present',
    place: 'Changu Narayan-01, Bhaktapur, Nepal',
    note: 'Handling operations, client relations, and print production.'
  },
  {
    title: 'Freelance Web Developer',
    org: 'Independent',
    period: '2025 — Present',
    place: 'Remote',
    note: 'Front-end builds and landing pages for small businesses and creators. Solo end-to-end: scoping, design, build, deploy.'
  },
  {
    title: 'Web Development — Self-directed',
    org: 'Independent study',
    period: '2023 — Present',
    place: 'Kathmandu, Nepal',
    note: 'A structured self-education track: fundamentals, then frameworks, then systems design. Documented in public on GitHub.'
  },
  {
    title: 'Open-source Contributor',
    org: 'GitHub',
    period: '2024 — Present',
    place: 'Remote',
    note: 'Issues, docs, and small pull requests across front-end tooling and educational projects.'
  }
];
