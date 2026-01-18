/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary neon colors
        'neon-pink': '#FF0080',
        'neon-pink-light': '#FF1493',
        'neon-cyan': '#00FFFF',
        'neon-green': '#39FF14',
        'neon-blue': '#0080FF',
        'neon-yellow': '#FFD700',
        'neon-purple': '#8B00FF',

        // Background system
        'void': '#000000',
        'void-light': '#0A0A0A',
        'void-purple': '#1a0a1f',
        'void-navy': '#0a1420',

        // Text colors
        'ghost': '#E0E0E0',
        'ghost-dim': '#8B8B8B',
        'ghost-bright': '#FFFFFF',
      },
      fontFamily: {
        'display': ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'neon-pink': '0 0 20px rgba(255, 0, 128, 0.5), 0 0 40px rgba(255, 0, 128, 0.3)',
        'neon-cyan': '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)',
        'neon-green': '0 0 20px rgba(57, 255, 20, 0.5), 0 0 40px rgba(57, 255, 20, 0.3)',
        'neon-blue': '0 0 20px rgba(0, 128, 255, 0.5), 0 0 40px rgba(0, 128, 255, 0.3)',
        'card': '0 0 40px rgba(255, 0, 128, 0.15), 0 10px 60px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(ellipse at 20% 20%, rgba(255, 0, 128, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(139, 0, 255, 0.1) 0%, transparent 70%)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'border-flow': 'border-flow 3s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'border-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
    },
  },
  plugins: [],
}
