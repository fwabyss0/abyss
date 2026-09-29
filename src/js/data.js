/* ============================================================
   DATA — every piece of copy on the site lives here.
   Edit this file to change content; no other file needs editing.
   ============================================================ */

export const PROFILE = {
  name: 'Alish Shrestha',
  first: 'ALISH',
  last: 'SHRESTHA',
  role: ['COMPUTER SCIENCE & AI STUDENT', 'WEB DEVELOPER', 'CREATOR'],
  location: 'Changu Narayan-01, Bhaktapur, Nepal',
  timezone: 'Asia/Kathmandu',
  email: 'shrestaalish444@gmail.com'
};

// API Configuration
export const API_KEYS = {
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

export const SOCIALS = [
  { label: 'GitHub',    handle: '@fwabyss0',     href: 'https://github.com/fwabyss0',                          accent: '#a855f7' },
  { label: 'LinkedIn',  handle: 'alish-shrestha', href: 'https://www.linkedin.com/in/alish-shrestha-4276b8379/',  accent: '#38bdf8' },
  { label: 'Instagram', handle: '@aliisshhhhhh',  href: 'https://www.instagram.com/aliisshhhhhh/',              accent: '#f472b6' },
  { label: 'Facebook',  handle: 'alish.shrestha', href: 'https://www.facebook.com/alish.shrestha.138982/',        accent: '#60a5fa' },
  { label: 'Email',     handle: 'shrestaalish444@gmail.com', href: 'mailto:shrestaalish444@gmail.com',            accent: '#4ade80' }
];

/* ============================================================
   MUSIC — the player's track list.

   TWO WAYS TO ADD A TRACK. Use either or mix them freely; the
   player handles both. Whichever you pick, each entry needs at
   least a `title`.

   ---- 1. SPOTIFY (recommended) ------------------------------
   In Spotify: right-click the track → Share → Embed → copy the
   iframe code. You only need the `src` value from it, which
   looks like:

       https://open.spotify.com/embed/track/1abcDEF2ghiJ3klm

   That is the normal share URL with /embed/ inserted after the
   type. The player injects it into an iframe only when you
   actually press play, so nothing loads until then.

   No API key, client id, or secret is needed or used anywhere —
   the embed is a plain public URL. If Spotify is unreachable the
   player simply stays as it is; it does not break the page.

       { title: 'Track name', artist: 'Artist', spotify: 'https://open.spotify.com/embed/track/ID' }

   A Spotify playlist works too — just use
   /embed/playlist/ID or /embed/album/ID.

   ---- 2. YOUR OWN AUDIO FILES -------------------------------
   Put the files in an audio/ folder at the repo root, then point
   `src` at one. MP3 works everywhere; .m4a and .ogg are fine too.
   This is the only option that plays without any third-party
   embed, and it is fully under your control.

       { title: 'Track name', artist: 'Artist', src: 'audio/track-01.mp3' }

   ---- A NOTE ON AUTOPLAY -----------------------------------
   Nothing starts on its own. Browsers block unprompted audio,
   and unsolicited sound is hostile. Playback begins on a real
   click, every time.

   ---- A NOTE ON COPYRIGHT ----------------------------------
   Only add audio you own or have the right to publish. Putting
   songs ripped from streaming services on your own site is
   copyright infringement and can get the domain taken down.

   Until you add an entry the player shows "No tracks yet" and
   every control is disabled. It will not error, and it will not
   fetch anything.
   ========================================================== */
export const TRACKS = [
  // { title: 'Track name', artist: 'Artist', spotify: 'https://open.spotify.com/embed/track/ID' },
  // { title: 'Track name', artist: 'Artist', src: 'audio/track-01.mp3' }
];

export const STACK = [
  'JavaScript', 'TypeScript', 'Python', 'React', 'Next.js', 'Node.js',
  'HTML5', 'CSS3', 'Tailwind', 'Three.js', 'Git', 'Figma', 'Pandas',
  'NumPy', 'scikit-learn', 'PostgreSQL', 'Vite'
];

/* Skill categories. Each technology carries its own honest proficiency number
   — hover or focus a chip to see it. `color` is the technology's own brand
   colour: it drives both the icon and the conic ring that sweeps the chip's
   border up to that percentage. On a near-black page these read as small
   jewels of colour, which is the point. */
export const SKILL_CATS = [
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

export const PROJECTS = [
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
  }
];

/* `done: true` marks a completed stage. The education rail runs solid green
   through the completed stages and fades out over the one still in progress. */
export const EDUCATION = [
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

export const EXPERIENCE = [
  {
    title: 'Manager at Print Village',
    org: 'Print Village',
    period: 'Present',
    place: 'Changu Narayan-01, Bhaktapur, Nepal',
    note: 'Handling operations, client relations, and print production.'
  }
];

