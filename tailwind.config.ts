import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,jsx,ts,tsx}",
		"./components/**/*.{js,jsx,ts,tsx}",
		"./app/**/*.{js,jsx,ts,tsx}",
		"./src/**/*.{js,jsx,ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				"tertiary-container": "#00748b",
				"primary-fixed": "#ffdbd0",
				"on-error": "#ffffff",
				"on-tertiary-fixed-variant": "#004e5e",
				"on-secondary-container": "#656464",
				"primary": {
					DEFAULT: "#8f3514",
					foreground: "#ffffff",
				},
				"on-tertiary": "#ffffff",
				"surface-dim": "#dcd9d9",
				"inverse-primary": "#ffb59d",
				"outline-variant": "#ddc0b8",
				"surface-variant": "#e5e2e1",
				"tertiary": "#005a6c",
				"surface-container": "#f0eded",
				"on-secondary-fixed": "#1b1c1c",
				"primary-container": "#af4c2a",
				"on-tertiary-fixed": "#001f27",
				"surface-container-high": "#eae7e7",
				"on-surface": "#1c1b1b",
				"on-surface-variant": "#56423c",
				"error": "#ba1a1a",
				"on-primary-fixed": "#390b00",
				"secondary-fixed": "#e4e2e1",
				"on-primary-container": "#ffe6df",
				"secondary-container": "#e4e2e1",
				"surface-bright": "#fcf9f8",
				"surface-container-lowest": "#ffffff",
				"tertiary-fixed": "#b1ecff",
				"on-secondary": "#ffffff",
				"outline": "#8a726b",
				"surface-container-low": "#f6f3f2",
				"on-tertiary-container": "#cbf1ff",
				"on-primary": "#ffffff",
				"inverse-surface": "#313030",
				"secondary": "#5f5e5e",
				"surface-tint": "#9f4120",
				"surface-container-highest": "#e5e2e1",
				"surface": "#fcf9f8",
				"inverse-on-surface": "#f3f0ef",
				"error-container": "#ffdad6",
				"on-primary-fixed-variant": "#802a09",
				"on-secondary-fixed-variant": "#474747",
				"tertiary-fixed-dim": "#7ed2ec",
				"primary-fixed-dim": "#ffb59d",
				"secondary-fixed-dim": "#c8c6c6",
				"background": "#fcf9f8",
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				headline: ["Newsreader", "serif"],
				body: ["Inter", "sans-serif"],
				label: ["Inter", "sans-serif"],
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'geometric-float': {
					'0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
					'50%': { transform: 'translateY(-10px) rotate(2deg)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
				'geometric-float': 'geometric-float 5s ease-in-out infinite',
				'scale-in': 'scale-in 0.2s ease-out'
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
