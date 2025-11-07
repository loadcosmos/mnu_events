// /js/clubs.js  (React + JSX via Babel CDN)
const { useState, useEffect, useRef } = React;

/* ------------------ ДАННЫЕ: ВСЕ КЛУБЫ (взяты полностью из твоего списка) ------------------ */
const CLUBS_DATA = [
  // Creativity
  {
    id: "standup",
    category: "Creativity",
    name: "Stand Up",
    image: "/images/stand up.png",
    short: "An organization dedicated to the art of comedy and intellectual humor.",
    full: `Stand Up is a student organization dedicated to the art of comedy and intelligent humor. We created this platform for students who want to develop their stand-up comedy skills, exchange witty ideas, and enjoy unique and clever jokes. Our mission is to make laughter and wit an integral part of student life, foster creative expression, and build a positive and fun community.`
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
  {
    id: "theactre",
    category: "Creativity",
    name: "TheActre",
    image: "/images/theactre.png",
    short: "Theatre organization: productions and acting.",
    full: `TheActre is a theatre organization dedicated to producing plays and developing students' creative skills.`
  },
  {
    id: "mobtrix",
    category: "Creativity",
    name: "The Mobtrix",
    image: "/images/tmt.png",
    short: "Dance organization: training and performances.",
    full: `The Mobtrix is ​​a dance organization dedicated to the self-expression and development of students in the field of dance.`
  },
  {
    id: "via",
    category: "Creativity",
    name: "VIA",
    image: "/images/via.png",
    short: "Musical group: performances and projects.",
    full: `VIA is a music team performing at university events; a place for creative growth.`
  },
  {
    id: "mnutimes",
    category: "Creativity",
    name: "MNU Times",
    image: "/images/times.png",
    short: "Media: photographers, videographers and content creators.",
    full: `MNU Times is a creative student community that brings together photographers, videographers, content creators, and designers to cover university events.`
  },
  {
    id: "namaste",
    category: "Creativity",
    name: "Namaste",
    image: "/images/namaste.png",
    short: "Yoga, meditation and healthy lifestyle.",
    full: `Namaste is an organization for yoga, meditation, and promoting an active and healthy lifestyle.`
  },
  {
    id: "ainalaiyn",
    category: "Creativity",
    name: "AINALAIYN",
    image: "/images/aynalayin.png",
    short: "Media club: letter, video, radio and SMM.",
    full: `AINALAIYN is a media club that brings together proactive students in the areas of writing, video, radio, and SMM.`
  },
  {
    id: "yellow",
    category: "Creativity",
    name: "Yellow Daily",
    image: "/images/yellow.png",
    short: "Club of events and activities.",
    full: `Yellow Daily is a club for those who love organizing events and implementing creative ideas.`
  },
  {
    id: "grafit",
    category: "Creativity",
    name: "Grafit",
    image: "/images/graffit.png",
    short: "Art club: drawing and visual creativity.",
    full: `Grafit is MNU's art club, inviting students into the world of artistic creativity and aesthetics.`
  },

  // Service
  {
  id: "enactus",
  category: "Service",
  name: "Enactus (Entrepreneurial Action Us)",
  image: "/images/enactus.png",
  short: "Entrepreneurial projects that create real social impact.",
  full: `Enactus is an international non-profit organization that unites students and business leaders to solve social challenges through entrepreneurship and innovation.`
},
{
  id: "womens_mentoring",
  category: "Service",
  name: "Woman’s Mentoring Club",
  image: "/images/wmc.png",
  short: "Empowering women through mentorship and leadership development.",
  full: `Woman’s Mentoring Club supports female students and staff at MNU in building leadership skills, confidence, and professional growth through mentoring and community.`
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
{
  id: "greeters",
  category: "Service",
  name: "GREETERS",
  image: "/images/greeters.png",
  short: "Buddy and volunteer support for first-year students.",
  full: `GREETERS are friendly mentors who help new students adapt to university life while actively participating in charity and volunteering activities.`
},
{
  id: "zhanshuak",
  category: "Service",
  name: "Zhanshuak",
  image: "/images/zhan.png",
  short: "Charity organization focused on helping others.",
  full: `Zhanshuak is a charitable organization that provides support to children and the elderly while organizing social projects and acts of kindness.`
},
{
  id: "zhastar",
  category: "Service",
  name: "Zhastar Rukhy",
  image: "/images/zhastar.png",
  short: "Youth organization for patriotic and social initiatives.",
  full: `Zhastar Rukhy is a youth movement that encourages students to participate in patriotic, educational, and community projects for positive change.`
},
{
  id: "liga_vol",
  category: "Service",
  name: "Volunteer League",
  image: "/images/liga.png",
  short: "Uniting students through volunteerism and kindness.",
  full: `Volunteer League brings together students who organize volunteer events, charity campaigns, and support meaningful community initiatives.`
},
{
  id: "student_gov",
  category: "Service",
  name: "Student Government",
  image: "/images/sg.png",
  short: "Representing students and addressing their needs.",
  full: `Student Government is a platform for student representation and dialogue with the university administration, promoting initiatives and solving student-related issues.`
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
    short: "Mental health support through workshops and movie nights.",
    full: `MHC is the first MNU organization founded by psychology students. We build a supportive community, host workshops, and raise awareness about mental health and psychology.`
  },
  {
    id: "empower",
    category: "Intelligence",
    name: "Empower",
    image: "/images/empower.png",
    short: "Gender equality and social awareness.",
    full: `Empower - организация, продвигающая идеи гендерного равенства и обсуждающая важные социальные темы.`
  },
  {
    id: "mnu_business",
    category: "Intelligence",
    name: "MNU BUSINESS CLUB",
    image: "/images/business.png",
    short: "Networking and entrepreneurship.",
    full: `Empower promotes gender equality and encourages open discussions on important social and feminist issues.`
},
  {
    id: "caseclub",
    category: "Intelligence",
    name: "Case Club MNU",
    image: "/images/mnu case.png",
    short: "Business case solving and career preparation.",
    full: `MNU BUSINESS CLUB connects entrepreneurial students to share ideas, gain practical skills, and build business networks.`
  },
  {
    id: "gambit",
    category: "Intelligence",
    name: "Gambit",
    image: "/images/gambit.png",
    short: "Chess lessons, tournaments, and workshops.",
    full: `Gambit is a chess club offering free lessons, tournaments, and master classes from skilled players, as well as coaching opportunities.`
  },
  {
    id: "hereditas",
    category: "Intelligence",
    name: "Hereditas",
    image: "/images/hereditas.png",
    short: "Historical discussions and lectures.",
    full: `Hereditas is a student history organization that educates and inspires through engaging discussions, lectures, and academic events.`
  },
  {
    id: "libertas",
    category: "Intelligence",
    name: "LIBERTAS",
    image: "/images/libertas.png",
    short: "Poetry, literature, and cinema.",
    full: `LIBERTAS is a space for intellectual and creative expression through poetry readings, film screenings, and literary discussions.`
  },
  {
    id: "proetcontra",
    category: "Intelligence",
    name: "Pro et Contra",
    image: "/images/pro et.png",
    short: "Political debates and critical thinking.",
    full: `Pro et Contra is a student organization focused on political debate, analytical discussion, and the development of critical thinking.`
  },
  {
    id: "pk_orda",
    category: "Intelligence",
    name: "ПК «Орда»",
    image: "/images/orda.png",
    short: "Pikirsaýys / debate — competitive speaking platform.",
    full: `Debate Club “Orda” (Kazakh) is a platform for students to practice public speaking and debating in Kazakh, fostering argumentation and confidence.`
  },
  {
    id: "debate_orda",
    category: "Intelligence",
    name: "Дебатный Клуб «Орда»",
    image: "/images/orda.png",
    short: "Debating and public speaking.",
    full: `Debate Club “Orda” develops students’ public speaking and argumentation skills through tournaments, discussions, and workshops.`
  },
  {
    id: "senbonzakura",
    category: "Intelligence",
    name: "Senbonzakura",
    image: "/images/senbonzakura.png",
    short: "Japanese culture: anime and manga.",
    full: `Senbonzakura is a community for fans of Japanese culture, anime, and manga — hosting events, screenings, and cultural discussions.`
  },
  {
    id: "hermes",
    category: "Intelligence",
    name: "Hermes",
    image: "/images/hermes.png",
    short: "Improving English communication.",
    full: `Hermes is an English-speaking club that helps students enhance their language skills through interactive meetings and conversations.`
  },
  {
    id: "hangyu",
    category: "Intelligence",
    name: "Hangyu",
    image: "/images/hangyu.png",
    short: "Korean language and culture club.",
    full: `Hangyu is a club that unites students interested in Korean culture, language, and traditions through events and practice sessions.`
  },
  {
    id: "mootcourt",
    category: "Intelligence",
    name: "Moot Court Club \"IUS PRIVATUM\"",
    image: "/images/ius priv.png",
    short: "Mock trials and legal practice.",
    full: `Moot Court Club “IUS PRIVATUM” brings together law students to participate in mock trials and improve their practical legal skills.`
  },
  {
    id: "lawmaker",
    category: "Intelligence",
    name: "LAWMAKER",
    image: "/images/lawmaker.png",
    short: "Research on law and legislation.",
    full: `LAWMAKER is a research-oriented club studying legislation, hosting seminars, and engaging with public institutions on law-making processes.`
  }
];

/* ------------------ Components ------------------ */

// Header with dropdown & wishlist button
function Header({ selectedLang, setSelectedLang, wishlistCount, onOpenWishlist }) {
  const [open, setOpen] = useState(false);
  const tRef = useRef(null);
  function handleMouseEnter(){ clearTimeout(tRef.current); setOpen(true); }
  function handleMouseLeave(){ tRef.current = setTimeout(()=>setOpen(false),160); }
  function selectLanguage(l){ setSelectedLang(l); setOpen(false); }
  return (
    <header className="header container">
      <div className="left-section" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <button className="icon-arw">{selectedLang} <i className="fa-solid fa-chevron-down"></i></button>
        {open && (
          <div className="dropdown-menu">
            {["ENG","РУС","ҚАЗ"].map(l => <button key={l} onClick={() => selectLanguage(l)} className={selectedLang===l ? 'active':''}>{l}</button>)}
          </div>
        )}
      </div>

      <div className="logo"><a href="#"><img src="/images/logo.png" alt="MNU Events" /></a></div>

      <div className="header-right">
        <nav>
          <ul>
            <li style={{display:'inline'}}><a href="#">Events</a></li>
            <li style={{display:'inline'}}><a href="/clubs.html" className="active">Clubs</a></li>
            <li style={{display:'inline'}}><a href="#">Log In</a></li>
          </ul>
        </nav>

        <button className="wishlist-btn" title="Wishlist" onClick={onOpenWishlist}>
          <i className="fa fa-heart" style={{color: 'var(--brand-red)'}}></i>
          <span style={{fontWeight:700}}>{`Wishlist (${wishlistCount})`}</span>
        </button>
      </div>
    </header>
  );
}

// Category Button
function CategoryButton({ cat, active, onClick }) {
  return (
    <button className={`cat-btn ${active ? 'active':''}`} onClick={onClick} style={{ backgroundImage: `url(${cat.img})` }}>
      <span className="label">{cat.title}</span>
    </button>
  );
}

// Club Card
function ClubCard({ club, onOpenDrawer, onToggleWish }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if(!el) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e=> { if(e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold:0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <article className="club-card" ref={ref}>
      <div className="club-left"><img src={club.image} alt={club.name} /></div>
      <div className="club-right">
        <h3>{club.name}</h3>
        <p>{club.short}</p>
        <div className="club-actions">
          <button className="btn-join" onClick={() => onOpenDrawer(club)}>I want to join</button>
          <button className="btn-wish" onClick={() => onToggleWish(club)}>Wishlist</button>
        </div>
      </div>
    </article>
  );
}

/* Bottom drawer */
function Drawer({ club, onClose, onToggleWish, isInWish }) {
  useEffect(()=> {
    // lock scroll while drawer open
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  function overlayClick(e){ if(e.target.classList && e.target.classList.contains('drawer-overlay')) onClose(); }

  return (
    <div className="drawer-overlay" onClick={overlayClick}>
      <div className="drawer" role="dialog" aria-modal="true">
        <button className="close-drawer" onClick={onClose} aria-label="Close">✕</button>

        <div className="drawer-left">
          <img className="club-photo" src={club.image} alt={club.name} />
        </div>

        <div className="drawer-right">
          <div>
            <div className="title">{club.name}</div>
            <p>{club.full}</p>
            <div className="drawer-actions">
              <button className="join-btn" onClick={() => alert('Форма присоединения (демо)')}>Join</button>
              <button className="wish-btn" onClick={() => onToggleWish(club)}>{ isInWish ? 'In wishlist ✅' : 'Add to Wishlist' }</button>
              <button onClick={onClose}>Close</button>
            </div>
            <div className="hint">Click outside the window or the Close / ✕ button to close</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Wishlist popup (mini) */
function WishlistPopup({ items, onClose, onRemove, onOpenClub }) {
  return (
    <div className="wishlist-modal" role="dialog" aria-modal="true">
      <h4>Wishlist ({items.length})</h4>
      {items.length === 0 && <div style={{color:'var(--muted)'}}>Empty - add clubs to favorites</div>}
      {items.map(it => (
        <div className="wish-item" key={it.id}>
          <img src={it.image} alt={it.name} />
          <div className="meta">
            <h5>{it.name}</h5>
            <p>{it.short}</p>
          </div>
          <div>
            <button onClick={() => onOpenClub(it)} style={{marginBottom:8}}>Open</button>
            <button onClick={() => onRemove(it)}>Remove</button>
          </div>
        </div>
      ))}
      <div style={{textAlign:'right', marginTop:10}}>
        <button onClick={onClose} style={{padding:'8px 12px', borderRadius:8}}>Close</button>
      </div>
    </div>
  );
}

/* ------------------ Main App ------------------ */
function App(){
  const [lang, setLang] = useState('ENG');
  const [activeCat, setActiveCat] = useState(null);
  const [drawerClub, setDrawerClub] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mnu_wishlist') || '[]'); }
    catch { return []; }
  });
  const [wishOpen, setWishOpen] = useState(false);

  useEffect(()=> { localStorage.setItem('mnu_wishlist', JSON.stringify(wishlist)); }, [wishlist]);

  const categories = [
    { key: 'Creativity', title: 'Creativity', img: 'images/creativity.jpg' },
    { key: 'Service', title: 'Service', img: 'images/service.jpg' },
    { key: 'Intelligence', title: 'Intelligence', img: 'images/intelligence.jpg' }
  ];

  const filtered = activeCat ? CLUBS_DATA.filter(c => c.category === activeCat) : [];

  function toggleWish(club){
    setWishlist(prev => {
      const exists = prev.find(x => x.id === club.id);
      if(exists) return prev.filter(x => x.id !== club.id);
      return [...prev, club];
    });
  }

  function openDrawer(club){
    setDrawerClub(club);
  }

  function closeDrawer(){ setDrawerClub(null); }

  function openWishlist(){ setWishOpen(true); }
  function closeWishlist(){ setWishOpen(false); }

  function removeFromWish(club){ setWishlist(prev => prev.filter(x => x.id !== club.id)); }
  function openFromWish(club){ setWishOpen(false); setTimeout(()=> openDrawer(club), 140); }

  return (
    <div>
      <Header selectedLang={lang} setSelectedLang={setLang} wishlistCount={wishlist.length} onOpenWishlist={openWishlist} />

      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-title">Discover MNU Clubs</div>
          <div className="hero-sub">Select a category—clubs will appear below. Click "I want to join" to open the club card (below).</div>

          <div className="categories" role="tablist" aria-label="Категории клубов">
            {categories.map(cat => (
              <CategoryButton key={cat.key} cat={cat} active={activeCat === cat.key} onClick={() => setActiveCat(activeCat === cat.key ? null : cat.key)} />
            ))}
          </div>
        </div>
      </section>

      <section className="clubs-section container">
        {!activeCat ? (
          <div style={{textAlign:'center', padding:'40px 0', color:'var(--muted)'}}>Select a category above to view clubs.</div>
        ) : (
          <>
            <h3 style={{color:'var(--brand-dark)', margin:0, fontSize:22}}>Clubs — {activeCat}</h3>
            <div className="clubs-grid" style={{marginTop:18}}>
              {filtered.map(c => <ClubCard key={c.id} club={c} onOpenDrawer={openDrawer} onToggleWish={toggleWish} />)}
            </div>
          </>
        )}
      </section>

      {/* Drawer */}
      { drawerClub && (
        <Drawer
          club={drawerClub}
          onClose={closeDrawer}
          onToggleWish={toggleWish}
          isInWish={!!wishlist.find(x => x.id === drawerClub.id)}
        />
      )}

      {/* Wishlist popup */}
      { wishOpen && (
        <WishlistPopup items={wishlist} onClose={closeWishlist} onRemove={removeFromWish} onOpenClub={openFromWish} />
      )}
    </div>
  );
}

/* render */
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
