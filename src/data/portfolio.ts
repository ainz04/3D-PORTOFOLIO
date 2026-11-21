export type SectionId = 'hero' | 'about' | 'projects' | 'contact'

export interface ProjectItem {
  id: string
  title: string
  category: string
  description: string
  tech: string[]
  accent: string
  status: string
  demoUrl: string
  repoUrl: string
}

export interface SkillGroup {
  name: string
  color: string
  items: string[]
}

export const PORTFOLIO_DATA = {
  identity: {
    name: 'JUDA',
    role: 'BOSS',
    photo: '/juda-photo.jpg',
    subtitle: 'AI Prompter, Pengembang AI & AI Product Builder',
    badgeId: 'JD-0001-BOSS',
    clearance: 'AI DEVELOPER // PRODUCT BUILDER',
    status: 'TERSEDIA UNTUK KOLABORASI',
    location: 'Indonesia (UTC+7)',
    telegramHandle: 't.me/A_JD04',
    telegramUrl: 'https://t.me/A_JD04',
    github: 'https://github.com/ainz04',
    instagram: 'https://www.instagram.com/jd_srt_?knvt=cDQ0dWJnZDB3OQ==',
    tagline:
      'AI Prompter dan Pengembang AI yang fokus merancang sistem prompt, otomatisasi alur kerja, serta membangun website dan aplikasi berbasis kecerdasan buatan yang siap digunakan untuk kebutuhan nyata.',
  },
  about: {
    headline: 'Merancang Sistem & Produk Berbasis AI.',
    bio: 'Saya berfokus pada pengembangan solusi berbasis kecerdasan buatan—mulai dari perancangan struktur prompt yang presisi (prompt engineering), integrasi LLM dan AI agent ke dalam alur kerja, hingga membangun website, aplikasi, dan tools digital yang efisien serta mudah digunakan.',
    stats: [
      { label: 'Bidang Utama', value: 'AI Dev' },
      { label: 'Keahlian Inti', value: 'Prompting' },
      { label: 'Produk', value: 'Web & App' },
    ],
  },
  skills: [
    {
      name: 'AI & Prompt Engineering',
      color: '#38bdf8',
      items: [
        'Prompt Architecture',
        'LLM Integration',
        'AI Agents & Workflow',
        'RAG & Context Design',
        'AI Automation',
      ],
    },
    {
      name: 'Web & App Development',
      color: '#a855f7',
      items: [
        'React & Next.js',
        'TypeScript',
        'Tailwind CSS',
        'Three.js / WebGL',
        'AI-Powered Apps',
      ],
    },
    {
      name: 'Backend & Integrasi',
      color: '#10b981',
      items: ['Node.js & API', 'Python', 'Database & Vector DB', 'Cloud Deployment'],
    },
  ] as SkillGroup[],
  projects: [
    {
      id: 'proj-1',
      title: 'AI Knowledge Assistant',
      category: 'AI Web Application',
      description:
        'Aplikasi web asisten AI untuk merangkum dokumen, menjawab pertanyaan berdasarkan konteks internal, dan mempercepat riset menggunakan arsitektur prompt terstruktur.',
      tech: ['React', 'TypeScript', 'LLM API', 'RAG'],
      accent: '#38bdf8',
      status: 'AI SYSTEM',
      demoUrl: '#',
      repoUrl: '#',
    },
    {
      id: 'proj-2',
      title: 'Prompt & Workflow Studio',
      category: 'AI Automation Tool',
      description:
        'Sistem pengelolaan template prompt dan otomatisasi alur kerja berbasis AI untuk mendukung produksi konten, analisis data, dan tugas operasional harian.',
      tech: ['Next.js', 'Node.js', 'AI Agents', 'PostgreSQL'],
      accent: '#a855f7',
      status: 'AUTOMATION',
      demoUrl: '#',
      repoUrl: '#',
    },
    {
      id: 'proj-3',
      title: 'Interactive 3D Web Portfolio',
      category: 'AI-Assisted Web Engineering',
      description:
        'Website portofolio interaktif berbasis WebGL 3D dengan fisika objek real-time yang dikembangkan secara efisien menggunakan pendekatan AI-assisted engineering.',
      tech: ['Three.js', 'React', 'TypeScript', 'Tailwind'],
      accent: '#f59e0b',
      status: 'LIVE',
      demoUrl: '#',
      repoUrl: '#',
    },
  ] as ProjectItem[],
}
