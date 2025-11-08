import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/main.css';
import '../styles/clubs.css';

// Clubs data from original
const CLUBS_DATA = [
  // Creativity
  {
    id: "standup",
    category: "Creativity",
    name: "Stand Up",
    image: "/images/stand up.png",
    short: "An organization dedicated to the art of comedy and intellectual humor.",
    full: `Stand Up is a student organization dedicated to the art of comedy and intelligent humor. We created this platform for students who want to develop their stand-up comedy skills, exchange witty ideas, and enjoy unique and clever jokes.`
  },
  {
    id: "amangeldy",
    category: "Creativity",
    name: "Amangeldy Studious",
    image: "/images/amangeldy.png",
    short: "Film and video club: scripts, filming, editing.",
    full: `Amangeldy Studious is a dynamic student organization dedicated to the art of film and video creation. We bring together creative people passionate about screenwriting, film, and video production to develop their skills and realize ambitious ideas.`
  },
  {
    id: "umit",
    category: "Creativity",
    name: "Театр \"Үміт\"",
    image: "/images/umit.png",
    short: "Amateur theatre: productions and poetry evenings.",
    full: `The Umit Theatre is art in its most refined and majestic form. It reveals the human soul through its performances; its main goal is the development of Kazakh culture and art at the university.`
  },
  {
    id: "orchestra",
    category: "Creativity",
    name: "MNU ORCHESTRA",
    image: "/images/orchestra.png",
    short: "Orchestra of National Instruments and Musical Heritage.",
    full: `MNU ORCHESTRA is an orchestra of national instruments that promotes the musical heritage and unique spiritual wealth of the Kazakh people.`
  },
  {
    id: "cybersport",
    category: "Creativity",
    name: "Cyber sport MNU",
    image: "/images/cyber.png",
    short: "Esports: tournaments and student communities.",
    full: `Cyber ​​sport MNU is a student organization that organizes tournaments for students, uniting gamers and giving them the opportunity to show their talents and make new friends!`
  },
  // Service
  {
    id: "enactus",
    category: "Service",
    name: "Enactus",
    image: "/images/enactus.png",
    short: "Entrepreneurial projects that create real social impact.",
    full: `Enactus is an international non-profit organization that unites students and business leaders to solve social challenges through entrepreneurship and innovation.`
  },
  {
    id: "womens_mentoring",
    category: "Service",
    name: "Woman's Mentoring Club",
    image: "/images/wmc.png",
    short: "Empowering women through mentorship and leadership development.",
    full: `Woman's Mentoring Club supports female students and staff at MNU in building leadership skills, confidence, and professional growth through mentoring and community.`
  },
  {
    id: "animal_law",
    category: "Service",
    name: "Animal Law Society",
    image: "/images/animal.png",
    short: "Advocating for animal rights and awareness.",
    full: `Animal Law Society is dedicated to protecting animal rights and promoting compassion, education, and ethical treatment of animals.`
  },
  {
    id: "irbis",
    category: "Service",
    name: "IrBIS",
    image: "/images/irbis.png",
    short: "Eco projects and environmental awareness.",
    full: `IrBIS is a student organization focused on environmental protection, green projects, and spreading ideas of modern environmentalism across the campus.`
  },
  // Intelligence
  {
    id: "quizemes",
    category: "Intelligence",
    name: "QuizEmes",
    image: "/images/quizemes.png",
    short: "Quizzes and intellectual games.",
    full: `QuizEmes is a student organization created by a group of friends to host trivia nights, quizzes, quests, and guest meetups that challenge the mind and bring people together.`
  },
  {
    id: "mhc",
    category: "Intelligence",
    name: "Mental Health Club (MHC)",
    image: "/images/mhc.png",
    short: "Mental health awareness and support.",
    full: `Mental Health Club promotes mental health awareness, provides peer support, and organizes events to reduce stigma around mental health issues.`
  },
];

const CATEGORIES = ['All', 'Creativity', 'Service', 'Intelligence'];

export default function Clubs() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedClub, setSelectedClub] = useState<typeof CLUBS_DATA[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredClubs = selectedCategory === 'All'
    ? CLUBS_DATA
    : CLUBS_DATA.filter((club) => club.category === selectedCategory);

  return (
    <div className="clubs-body">
      {/* Header */}
      <header className="header header-black visible">
        <div className="header-inner">
          <div className="left-section">
            <button type="button" className="icon-arw">
              ENG <i className="fa-solid fa-chevron-down"></i>
            </button>
          </div>

          <div className="logo">
            <Link to="/">
              <img src="/images/logo.png" alt="MNU Events" />
            </Link>
          </div>

          <nav>
            <ul>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/clubs">Clubs</Link></li>
              <li><Link to="/login">Log In</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="clubs-container">
        <h1 className="clubs-title">University Clubs</h1>

        {/* Category Filters */}
        <div className="clubs-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`club-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Clubs Grid */}
        <div className="clubs-grid">
          {filteredClubs.map((club) => (
            <div
              key={club.id}
              className="club-card"
              onClick={() => {
                setSelectedClub(club);
                setIsModalOpen(true);
              }}
            >
              <img src={club.image} alt={club.name} className="club-card__img" />
              <div className="club-card__body">
                <h3 className="club-card__title">{club.name}</h3>
                <p className="club-card__short">{club.short}</p>
                <span className={`club-card__category club-card__category--${club.category.toLowerCase()}`}>
                  {club.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && selectedClub && (
        <div className="club-modal" role="dialog" aria-modal="true">
          <div className="club-modal__backdrop" onClick={() => setIsModalOpen(false)}></div>
          <div className="club-modal__content">
            <button
              className="club-modal__close"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <img
              src={selectedClub.image}
              alt={selectedClub.name}
              className="club-modal__img"
            />
            <h2 className="club-modal__title">{selectedClub.name}</h2>
            <span className={`club-modal__category club-modal__category--${selectedClub.category.toLowerCase()}`}>
              {selectedClub.category}
            </span>
            <p className="club-modal__description">{selectedClub.full}</p>
            <button className="club-modal__join" onClick={() => alert('Join club feature coming soon!')}>
              Join Club
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
