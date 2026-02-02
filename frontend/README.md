# Books I Read - Frontend

A modern, responsive book tracking application built with React and Vite.

## Features

- 📚 Track reading progress with visual progress bars
- ⭐ Rate and review books
- 📊 Analytics dashboard with daily/weekly/monthly stats
- 🎨 Dark mode support
- 📱 Fully responsive design (mobile-first)
- 📥 Import books from Goodreads CSV
- 📤 Share reading list
- 🏷️ Tag and categorize books
- 🔥 Reading streak tracking
- 📈 Reading pace calculator

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **React Router** - Navigation
- **React Hot Toast** - Notifications
- **CSS3** - Styling (no framework, custom design)

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   copy .env.example .env
   ```

3. Update `VITE_API_URL` in `.env`:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173)

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed Firebase deployment instructions.

### Quick Deploy

1. Create `.env.production`:
   ```bash
   copy .env.production.example .env.production
   ```

2. Update backend URL in `.env.production`

3. Deploy:
   ```bash
   npm run deploy
   ```

   Or use the Windows script:
   ```bash
   deploy.bat
   ```

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── api/            # API clients
│   │   ├── axiosClient.js
│   │   └── bookApi.js
│   ├── components/     # Reusable components
│   │   ├── AddBookForm.jsx
│   │   ├── AnalyticsModal.jsx
│   │   ├── BookCard.jsx
│   │   ├── ImportModal.jsx
│   │   ├── ShareModal.jsx
│   │   └── UpdateProgressModal.jsx
│   ├── data/           # Static data
│   │   └── quotes.js
│   ├── pages/          # Page components
│   │   ├── Dashboard.jsx
│   │   └── Login.jsx
│   ├── App.jsx         # Root component
│   ├── AuthContext.jsx # Authentication context
│   └── main.jsx        # Entry point
├── .env.example        # Environment template
├── firebase.json       # Firebase config
├── vite.config.js      # Vite configuration
└── package.json        # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Build and deploy to Firebase

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8080/api` |

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Features Detail

### Authentication
- JWT-based authentication
- Secure token storage
- Auto-redirect on session expiry

### Book Management
- Add books with cover, author, pages
- Update reading progress
- Set reading status (Want to Read, Reading, Finished)
- Add ratings and reviews
- Tag books for organization

### Analytics
- Daily reading activity (last 7 days)
- Weekly/Monthly/Yearly page counts
- Current reading streak
- Average reading pace
- Visual charts and statistics

### Import/Export
- Import from Goodreads CSV
- Share reading list (CSV/JSON)
- Copy shareable link

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Email: your-email@example.com
