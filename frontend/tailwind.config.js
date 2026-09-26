/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Warm, organic food-focused palette
        background: '#FFFDF7', // Very light cream
        surface: '#FFFDF7',
        'surface-container': '#F8EFE0', // Soft beige for cards
        'surface-container-high': '#F0E2CA', // Slightly darker beige
        'surface-container-lowest': '#FFFFFF',
        
        primary: '#D3661B', // Deep warm orange/rust
        'primary-container': '#EFA04F', // Bright orange/yellow
        'on-primary': '#FFFFFF',
        'on-primary-container': '#4A2300',

        secondary: '#8AA348', // Leafy green
        'secondary-container': '#A5C15F', 
        'on-secondary': '#FFFFFF',

        'on-surface': '#3A2718', // Deep brown (instead of black)
        'on-surface-variant': '#634B39', // Medium brown
        outline: '#D4C1A8',
        'outline-variant': '#E8DCCB',
        
        // Risk colors (adjusted for this warm theme)
        'risk-high': '#D9433B',
        'risk-caution': '#E89124',
        'risk-verify': '#E7BC25',
        'risk-safe': '#7BA543',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        display: ['Fraunces', 'serif'],
        body: ['Nunito', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        // Override the previous ones
        'body-sm': ['Nunito', 'sans-serif'],
        'body-lg': ['Nunito', 'sans-serif'],
        'body-md': ['Nunito', 'sans-serif'],
        'label-md': ['Nunito', 'sans-serif'],
        'headline-sm': ['Fraunces', 'serif'],
        'headline-md': ['Fraunces', 'serif'],
        'headline-lg': ['Fraunces', 'serif'],
        'label-lg': ['Nunito', 'sans-serif'],
        'label-sm': ['Nunito', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(211, 102, 27, 0.15)',
        'float': '0 20px 50px -15px rgba(58, 39, 24, 0.1)',
      }
    },
  },
  plugins: [],
};
