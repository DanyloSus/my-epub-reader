# Custom EPUB Reader

A modern, customizable EPUB reader built with React and the R2D2BC library.

## Features

- 📚 **Full EPUB Support** - Built on the powerful R2D2BC library
- 🎨 **Customizable Themes** - Light, dark, and sepia themes
- 📖 **Table of Contents** - Easy navigation through chapters
- ⚙️ **Reading Settings** - Adjustable font size, family, line height, and margins
- 🔖 **Bookmarks & Highlights** - Save your progress and important passages
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⌨️ **Keyboard Navigation** - Arrow keys for page navigation
- 💾 **Persistent Settings** - Your preferences are saved automatically

## Architecture

This EPUB reader follows a modular architecture with clear separation of concerns:

```
src/
├── components/          # Reusable UI components
│   ├── ReaderToolbar/   # Top navigation bar
│   ├── TableOfContents/ # Navigation sidebar
│   ├── ReaderSettings/  # Settings panel
│   └── ReaderViewport/  # Main reading area
├── pages/               # Page-level components
├── store/               # Zustand state management
├── types/               # TypeScript type definitions
├── ui/                  # UI component abstractions
├── utils/               # Helper functions and utilities
└── theme.ts             # Material-UI theme configuration
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-epub-reader
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Using Your Own EPUB Files

Place your EPUB files in the `public` directory and update the `epubUrl` prop in the `ReaderViewport` component:

```tsx
<ReaderViewport epubUrl="/your-epub-file.epub" />
```

## Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist` directory.

## Technology Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Material-UI** - Consistent design system
- **Zustand** - Lightweight state management
- **Vite** - Fast build tool and development server
- **R2D2BC** - EPUB rendering engine

## R2D2BC Integration

This reader leverages the R2D2BC library for EPUB processing and rendering. Key integration points:

- **Dynamic Import** - R2D2BC is loaded dynamically to reduce initial bundle size
- **Event Handling** - Location changes, metadata updates, and TOC loading
- **Settings Application** - Real-time application of user preferences
- **Modular Design** - Easy to extend with additional R2D2BC modules

## Customization

### Adding New Themes

Update the theme options in `ReaderSettings.tsx`:

```tsx
const themes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'sepia', label: 'Sepia' },
  { value: 'custom', label: 'Custom Theme' }, // Add your theme
];
```

### Custom CSS Injection

You can inject custom CSS into the EPUB viewer by modifying the `injectables` array in `ReaderViewport.tsx`:

```tsx
const readerInstance = await D2Reader.load({
  url: epubUrl,
  injectables: [
    // Add your custom CSS files here
    '/path/to/custom.css'
  ],
  injectablesFixed: [],
});
```

### Adding New Modules

The R2D2BC library supports various modules. You can enable additional functionality by importing and configuring them:

```tsx
import { AnnotationModule } from '../../../r2d2bc/src/modules';

// Configure and add modules to your reader instance
```

## State Management

The application uses Zustand for state management with the following key features:

- **Persistent Storage** - Settings and bookmarks are saved to localStorage
- **Reactive Updates** - UI components automatically update when state changes
- **Type Safety** - Full TypeScript support for all state operations

## Performance Considerations

- **Lazy Loading** - R2D2BC is loaded only when needed
- **Debounced Settings** - Settings changes are debounced to prevent excessive updates
- **Optimized Rendering** - React components are optimized for minimal re-renders

## Browser Support

This reader supports all modern browsers that support:
- ES2020+ JavaScript features
- CSS Grid and Flexbox
- Web Workers (for EPUB processing)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [R2D2BC](https://github.com/d-i-t-a/R2D2BC) - The powerful EPUB rendering engine
- [Readium](https://readium.org/) - The open-source ecosystem for digital publishing
- [Material-UI](https://mui.com/) - React components implementing Google's Material Design
