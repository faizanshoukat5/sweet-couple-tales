# Sweet Couple Tales 💕

A beautiful romantic memories journal app for couples to preserve their special moments together.

## 🌟 Features

- **Create Beautiful Memories**: Write your love story with rich text, photos, and special dates
- **Timeline View**: Browse through your relationship journey chronologically
- **Mark Favorites**: Highlight your most cherished moments
- **Search & Filter**: Find specific memories by date, keywords, or tags
- **Photo Albums**: Organize your photos into beautiful albums
- **Shared Calendar**: Keep track of important dates and anniversaries
- **Goals & Bucket List**: Plan your future adventures together
- **Private Chat**: Communicate with your partner within the app
- **Export Memories**: Backup your memories as JSON or PDF
- **Notifications**: Get reminded of anniversaries and special dates

## 🚀 Live Demo

**URL**: [Sweet Couple Tales](https://sweet-couple-tales.netlify.app)

## 📁 Repository

**GitHub**: https://github.com/faizanshoukat5/sweet-couple-tales

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Database, Authentication, Storage)
- **Build Tool**: Vite
- **Deployment**: Netlify

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account

### 1. Clone the Repository

```bash
git clone https://github.com/faizanshoukat5/sweet-couple-tales.git
cd sweet-couple-tales
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

Run the migrations to set up your database schema:

```bash
# If you have Supabase CLI installed
supabase db reset

# Or manually run the SQL files in supabase/migrations/ in your Supabase dashboard
```

### 5. Configure Storage

In your Supabase dashboard:

1. Go to Storage
2. Create two buckets:
   - `memory-photos` (for memory photos)
   - `album-photos` (for album photos)
3. Set appropriate RLS policies for authenticated users

### 6. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## 📊 Database Schema

The app uses the following main tables:

- **profiles**: User profile information
- **memories**: Individual memory entries with photos and tags
- **albums**: Photo album collections
- **album_photos**: Direct photos uploaded to albums
- **album_memories**: Junction table linking memories to albums
- **goals**: Shared goals and bucket list items
- **important_dates**: Anniversaries and special dates
- **couples**: Partner relationships
- **messages**: Private chat messages

## 🔐 Authentication & Security

- Email/password authentication via Supabase Auth
- Row Level Security (RLS) policies ensure users only access their own data
- Partner relationships managed through the couples table
- All sensitive data is properly secured

## 🎨 Design Features

- Romantic pastel color palette
- Responsive design for all devices
- Smooth animations and micro-interactions
- Apple-level design aesthetics
- Intuitive user experience

## 📱 Key Components

- **Memory Management**: Create, edit, delete, and organize memories
- **Photo Upload**: Single and bulk photo upload with drag & drop
- **Album Browser**: Organize photos and memories into albums
- **Shared Calendar**: View important dates with recurring events
- **Partner Chat**: Real-time messaging between partners
- **Profile Setup**: Configure user profiles and partner connections

## 🚀 Deployment

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Environment Variables for Production

```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 💖 About

Sweet Couple Tales is designed to help couples preserve and celebrate their love story. Every relationship has beautiful moments that deserve to be remembered forever.

## 🐛 Issues & Support

If you encounter any issues or have suggestions, please [open an issue](https://github.com/faizanshoukat5/sweet-couple-tales/issues) on GitHub.

---

Made with 💕 for couples everywhere