import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  BarChart3,
  Search,
  Star,
  Heart,
  MessageCircle,
  Target,
  Sparkles,
  Library,
  ArrowRight,
  BookMarked,
  PenLine,
  Globe,
  ChevronDown,
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Library,
      title: 'Track Your Library',
      description: 'Organize books by reading status — currently reading, finished, or want to read. Never lose track of your progress.',
      color: '#6d28d9',
      bg: '#ede9fe',
    },
    {
      icon: PenLine,
      title: 'Write Reviews & Reflections',
      description: 'Share thoughtful reviews and private reflections. Rate books, add notes, and capture your reading experience.',
      color: '#2563eb',
      bg: '#dbeafe',
    },
    {
      icon: Users,
      title: 'Social Reading',
      description: 'Follow friends, discover what they\'re reading, like and comment on reviews. Reading is better together.',
      color: '#16a34a',
      bg: '#dcfce7',
    },
    {
      icon: Sparkles,
      title: 'AI Recommendations',
      description: 'Get personalized book suggestions powered by AI, based on your reading history and preferences.',
      color: '#f59e0b',
      bg: '#fef3c7',
    },
    {
      icon: BarChart3,
      title: 'Reading Analytics',
      description: 'Visualize your reading habits with detailed stats — books per month, genres explored, pages read, and more.',
      color: '#ec4899',
      bg: '#fce7f3',
    },
    {
      icon: BookMarked,
      title: 'Curated Lists',
      description: 'Create and share book lists for any occasion. Browse lists from other readers and discover hidden gems.',
      color: '#0891b2',
      bg: '#cffafe',
    },
  ];

  const stats = [
    { label: 'Books Tracked', icon: BookOpen },
    { label: 'Reviews Written', icon: Star },
    { label: 'Reading Lists', icon: BookMarked },
    { label: 'Readers', icon: Heart },
  ];

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-violet-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] tracking-tight">Books I Read</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-3 sm:px-5 py-2 text-sm font-semibold text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-xl transition-all duration-200 cursor-pointer bg-transparent border-none"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all duration-200 cursor-pointer border-none"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:pt-32 sm:pb-20 sm:px-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-100/40 dark:bg-violet-800/10 blur-3xl" />
          <div className="absolute top-20 -left-40 w-[400px] h-[400px] rounded-full bg-slate-100/50 dark:bg-blue-800/10 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-full mb-6 sm:mb-8">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-600" />
            <span className="text-xs sm:text-sm font-medium text-violet-700 dark:text-violet-400">Your personal reading companion</span>
          </div>

          <h1 className="text-[2.25rem] leading-[1.15] sm:text-6xl lg:text-7xl font-black text-[var(--color-text-primary)] tracking-tight sm:leading-[1.1] mb-5 sm:mb-6">
            Track, Share &
            <br />
            <span className="text-violet-600 dark:text-violet-400">Love Reading</span>
          </h1>

          <p className="text-base sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2 sm:px-0">
            Your all-in-one platform to organize your bookshelf, write reviews,
            set reading goals, and connect with fellow book lovers.
          </p>

          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-col sm:flex-row px-2 sm:px-0">
            <button
              onClick={() => navigate('/register')}
              className="group w-full sm:w-auto px-8 py-3.5 sm:py-4 text-base font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border-none flex items-center justify-center gap-2"
            >
              Start Reading Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 text-base font-semibold text-[var(--color-text-primary)] bg-white dark:bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] rounded-2xl hover:border-violet-300 dark:hover:border-violet-500/40 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              I Have an Account
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="mt-12 sm:mt-16 animate-bounce">
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-text-light)] mx-auto" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-14 px-4 sm:py-20 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight mb-3 sm:mb-4">
              Everything You Need to Read More
            </h2>
            <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto">
              A complete toolkit for tracking, discussing, and falling in love with books.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-white dark:bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-5 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-500/30"
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-4 sm:mb-5"
                  style={{ background: feature.bg, color: feature.color }}
                >
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] mb-1.5 sm:mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-[0.9375rem] text-[var(--color-text-secondary)] leading-relaxed m-0">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 px-4 sm:py-20 sm:px-6 bg-[var(--color-bg-secondary)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-[var(--color-text-secondary)]">
              Get started in minutes — it's that simple.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-8">
            {[
              {
                step: '1',
                icon: Search,
                title: 'Find & Add Books',
                description: 'Search millions of books and add them to your personal library with one tap.',
              },
              {
                step: '2',
                icon: Target,
                title: 'Track & Review',
                description: 'Update your reading progress, set goals, write reviews and personal reflections.',
              },
              {
                step: '3',
                icon: Globe,
                title: 'Share & Discover',
                description: 'Follow readers, explore curated lists, and get AI-powered recommendations.',
              },
            ].map((item) => (
              <div key={item.step} className="flex sm:flex-col items-start sm:items-center sm:text-center gap-4 sm:gap-0">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-violet-600 flex items-center justify-center sm:mx-auto sm:mb-5">
                    <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2} />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:left-1/2 sm:ml-8 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-violet-600">{item.step}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] mb-1 sm:mb-2 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-[0.9375rem] text-[var(--color-text-secondary)] leading-relaxed max-w-xs sm:mx-auto">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Highlights */}
      <section className="py-14 px-4 sm:py-20 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-violet-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-amber-300 fill-amber-300" />
                ))}
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-4">
                Join Readers Who Love<br className="hidden sm:block" /> Their Reading Journey
              </h2>

              <p className="text-violet-100 text-base sm:text-lg max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
                Whether you read one book a month or one a week, Books I Read helps you
                make every page count.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-violet-200 text-sm font-medium">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Row */}
      <section className="py-12 px-4 sm:py-16 sm:px-6 bg-[var(--color-bg-secondary)]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                icon: Heart,
                title: 'Like & Comment',
                description: 'Engage with reviews from other readers and build your reading community.',
              },
              {
                icon: MessageCircle,
                title: 'Discuss Books',
                description: 'Share your thoughts through reviews and reflections that spark conversations.',
              },
              {
                icon: Target,
                title: 'Set Reading Goals',
                description: 'Set yearly goals, track your pace, and celebrate milestones along the way.',
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-white dark:bg-[var(--color-bg)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] transition-all duration-200 hover:shadow-md">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-[0.9375rem] sm:text-base font-bold text-[var(--color-text-primary)] mb-1 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed m-0">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:py-24 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight mb-3 sm:mb-4">
            Ready to Start Reading?
          </h2>
          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] mb-8 sm:mb-10 max-w-lg mx-auto">
            Create your free account and begin building your personal reading library today.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="group w-full sm:w-auto px-10 py-3.5 sm:py-4 text-base sm:text-lg font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border-none flex items-center justify-center gap-2 mx-auto"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Books I Read</span>
          </div>
          <p className="text-sm text-[var(--color-text-light)] m-0">
            Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 inline-block align-middle mx-0.5" /> for book lovers
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
