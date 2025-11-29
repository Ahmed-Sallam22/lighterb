# Light ERP

A modern ERP (Enterprise Resource Planning) system built with React and Tailwind CSS.

## Features

- **Modern UI**: Clean and intuitive interface with Tailwind CSS
- **Responsive Design**: Works seamlessly across all devices
- **Navigation System**: Smooth scrolling navigation bar with 12 routes
- **Feature Cards**: Interactive cards showcasing different modules
- **Search Functionality**: Dropdown search in the navbar
- **User Profile**: User information display in the navbar

## Tech Stack

- **React** - UI framework
- **React Router v6** - Client-side routing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

## Color Scheme

- Primary Background (Navbar/Footer): `#08252F`
- Card Background: `#28819C`
- Accent colors for icons and elements

## Project Structure

```
src/
├── layouts/
│   └── MainLayout.jsx  # Main layout wrapper with Navbar and Footer
├── components/
│   ├── Navbar.jsx      # Top navigation bar with menu, search, and user profile
│   └── Footer.jsx      # Footer with company info and logo
├── pages/
│   ├── Home.jsx        # Landing page with routes and feature cards
│   ├── Dashboard.jsx   # Dashboard with statistics
│   ├── Projects.jsx    # Project management
│   ├── Tasks.jsx       # Task tracking
│   ├── Team.jsx        # Team directory
│   ├── Settings.jsx    # Application settings
│   └── ...             # Other route pages
├── App.jsx             # Main router configuration
└── index.css           # Global styles with Tailwind directives
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features & Routes

### Layout
- **MainLayout**: Consistent layout wrapper for all pages with Navbar and Footer

### Navigation (Navbar)
- Menu icon for navigation
- Logo with link to home
- Search functionality with dropdown
- Home button
- User profile with name and role

### Pages

#### Home (`/`)
- Welcome title with Light ERP branding
- Horizontal scrolling navigation bar (10 visible routes)
- Feature cards with icons, titles, and descriptions
- Smooth animations and hover effects

#### Dashboard (`/dashboard`)
- Statistics overview cards
- Real-time metrics display

#### Projects (`/projects`)
- Project cards with status and progress bars
- Visual completion tracking

#### Tasks (`/tasks`)
- Task table with priorities and due dates
- Assignee information

#### Team (`/team`)
- Team member directory
- Profile cards with roles and contact info

#### Settings (`/settings`)
- Profile settings
- Notification preferences
- Save functionality

#### Additional Routes
- Calendar, Reports, Analytics, Documents, Messages, Notifications, Help
- (Placeholder pages ready for implementation)

### Footer
- Copyright information
- Company logo

## Customization

You can customize the colors in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      'primary-bg': '#08252F',
      'card-bg': '#28819C',
    },
  },
}
```

## License

© 2025 Light Idea Company. All rights reserved.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
