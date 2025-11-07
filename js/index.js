function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedLang, setSelectedLang] = React.useState("ENG");
  const [isScrolled, setIsScrolled] = React.useState(false);
  const timeoutRef = React.useRef(null);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  const selectLanguage = (lang) => {
    setSelectedLang(lang);
    setTimeout(() => setIsOpen(false), 300);
  };

  return (
    <>
      {/* 🔹 Первый прозрачный хедер */}
      <header className="header header-transparent">
        <div className="header-inner">
          <div
            className="left-section"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="icon-arw">
              {selectedLang} <i className="fa-solid fa-chevron-down"></i>
            </button>

            {isOpen && (
              <div className="dropdown-menu">
                {["ENG", "РУС", "ҚАЗ"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => selectLanguage(lang)}
                    className={selectedLang === lang ? "active" : ""}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="logo">
            <a href="#"><img src="images/logo.png" alt="MNU Events" /></a>
          </div>

          <nav>
            <ul>
              <li><a href="/events.html">Events</a></li>
              <li><a href="/clubs.html">Clubs</a></li>
              <li><a href="/login.html">Log In</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* 🔹 Второй чёрный фиксированный хедер */}
      <header className={`header header-black ${isScrolled ? "visible" : ""}`}>
        <div className="header-inner">
          <div
            className="left-section"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="icon-arw">
              {selectedLang} <i className="fa-solid fa-chevron-down"></i>
            </button>

            {isOpen && (
              <div className="dropdown-menu">
                {["ENG", "РУС", "ҚАЗ"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => selectLanguage(lang)}
                    className={selectedLang === lang ? "active" : ""}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="logo">
            <a href="#"><img src="images/logo.png" alt="MNU Events" /></a>
          </div>

          <nav>
            <ul>
              <li><a href="/organizer.html">Events</a></li>
              <li><a href="#">Clubs</a></li>
              <li><a href="/login.html">Log In</a></li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}

/* ---------- HERO СЕКЦИЯ ---------- */
function Hero() {
  const slides = [
    {
      image: "images/backg.jpg",
      title: "Mascot Party 2025",
      text: "Join our dance workshop to groove, learn, and connect — perfect for all levels!",
      date: "March 12, 2025",
      time: "18:00",
      location: "MNU Main Hall",
      organizer: "DSA",
      organizerImg: "images/dsa.png",
      category: "Service",
    },
    {
      image: "images/event.png",
      title: "Art Night 2025",
      text: "An evening of creativity, music, and vibrant expression.",
      date: "Nov 5, 2025",
      time: "19:30",
      location: "Art Center Room 2",
      organizer: "Art Club",
      organizerImg: "images/grafit.png",
      category: "Creativity",
    },
    {
      image: "images/event6.jpg",
      title: "KPMG Case Championship 2025",
      text: "Join us for the KPMG x MNU Case Championship, where participants tackle real business cases.",
      date: "November 21, 2025",
      time: "15:00",
      location: "IT Hub Auditorium",
      organizer: "Case Club",
      organizerImg: "images/caseclub.png",
      category: "Intelligence",
    },
  ];

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [fade, setFade] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [frozenIndex, setFrozenIndex] = React.useState(null);
  const intervalRef = React.useRef(null);

  const startAuto = React.useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % slides.length);
        setFade(true);
      }, 150);
    }, 6000);
  }, [slides.length]);

  const stopAuto = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    startAuto();
    return () => stopAuto();
  }, [startAuto, stopAuto]);

  React.useEffect(() => {
    if (isModalOpen) {
      stopAuto();
      setFrozenIndex(activeIndex);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      startAuto();
      setFrozenIndex(null);
    }
  }, [isModalOpen, activeIndex, startAuto, stopAuto]);

  const displayIndex = isModalOpen && frozenIndex !== null ? frozenIndex : activeIndex;
  const currentSlide = slides[displayIndex];
  const catToLetter = { Service: "S", Creativity: "C", Intelligence: "I" };
  const sciLetter = catToLetter[currentSlide.category] ?? "";

  return (
    <section className="hero">
      <img
        src={currentSlide.image}
        alt={currentSlide.title}
        className={`background ${fade ? "fade-in" : "fade-out"}`}
      />
      <div className="overlay"></div>
      <Header />

      <div className={`content ${fade ? "fade-in" : "fade-out"}`}>
        <div className="sci-badge" data-cat={currentSlide.category}>
          {sciLetter}
        </div>
        <h1 className="hero-title">{currentSlide.title}</h1>
        <p className="text">{currentSlide.text}</p>
        <button
          className="btn"
          onClick={() => {
            setFrozenIndex(activeIndex);
            setIsModalOpen(true);
          }}
        >
          Learn More
        </button>
      </div>

      {isModalOpen && (
        <div className="event-modal" onClick={(e) => e.target.classList.contains("event-modal") && setIsModalOpen(false)}>
          <div className="modal-content">
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <img src={slides[frozenIndex].image} alt={slides[frozenIndex].title} className="modal-image" />
            <div className="sci-badge modal" data-cat={slides[frozenIndex].category}>
              {catToLetter[slides[frozenIndex].category] ?? ""}
            </div>
            <h2 className="modal-title">{slides[frozenIndex].title}</h2>
            <div className="event-meta">
              <p><img src="/svg/calendar.svg" alt="calendar" className="icon" />{slides[frozenIndex].date} · {slides[frozenIndex].time}</p>
              <p><img src="/svg/location.svg" alt="location" className="icon" />{slides[frozenIndex].location}</p>
            </div>
            <div className="organizer">
              <img src={slides[frozenIndex].organizerImg} alt={slides[frozenIndex].organizer} className="organizer-img" />
              <div className="organizer-info">
                <h4>{slides[frozenIndex].organizer}</h4>
                <p>Event Organizer</p>
              </div>
              <button className="club-btn">Club Page</button>
            </div>
            <div className="modal-description">
              <h3>Description</h3>
              <p>{slides[frozenIndex].text}</p>
            </div>
            <button className="join-btn">Join</button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------- ABOUT ---------- */
function About() {
  return (
    <section className="about-section">
      <div className="about-overlay"></div>
      <div className="content">
        <h1>MNU Events — your guide to university life.</h1>
        <p>All the most exciting campus events in one place — parties, exhibitions, lectures, and much more.</p>
        <p>We aim to inspire creativity, build connections, and celebrate student life through diverse cultural, social, and educational events.</p>
        <button className="btn">Join the Community</button>
      </div>
    </section>
  );
}

/* ---------- EVENT CALENDAR ---------- */
function EventCalendar() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = React.useState(today.toISOString().split("T")[0]);
  const [scrollIndex, setScrollIndex] = React.useState(0);

  const events = [
    {
      title: "Guest Lecture",
      description: "AI innovations and future tech trends.",
      img: "images/event1.jpg",
      date: "2025-11-05",
      time: "19:00",
      location: "Main Hall A",
      organizer: "MNU Charity",
      type: "I - Intelligence",
      category: "Lecture / Discussion",
    },
    {
      title: "Music Night",
      description: "Live performances by university bands.",
      img: "images/event2.jpg",
      date: "2025-11-07",
      time: "20:00",
      location: "Auditorium",
      organizer: "Student Council",
      type: "C - Creativity",
      category: "Concert / Performance",
    },
    {
      title: "Charity Day",
      description: "Volunteer to help local communities.",
      img: "images/event3.jpg",
      date: "2025-11-09",
      time: "10:00",
      location: "Campus Center",
      organizer: "Volunteer Club",
      type: "S - Service",
      category: "Social / Volunteering",
    },
  ];

  const days = Array.from({ length: 30 - today.getDate() + 1 }, (_, i) => {
    const day = today.getDate() + i;
    const date = `2025-11-${day.toString().padStart(2, "0")}`;
    return { day, date };
  });

  const filteredEvents = events.filter((e) => e.date === selectedDate);
  const visibleCount = 10;
  const maxIndex = Math.max(0, days.length - visibleCount);
  const scrollLeft = () => setScrollIndex((i) => Math.max(0, i - 1));
  const scrollRight = () => setScrollIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <section className="events">
      <p className="events-text">Don’t Miss Out!</p>
      <h2 className="events-title">
        <span className="black">Upcoming</span> <span className="red">Events</span>
      </h2>

      <div className="calendar-section">
        <h2 className="calendar-title">November 2025</h2>

        <div className="calendar-strip-container">
          {scrollIndex > 0 && (
            <button className="arrow-btn left" onClick={scrollLeft}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
          )}

          <div className="calendar-strip">
            {days.slice(scrollIndex, scrollIndex + visibleCount).map((dayObj) => {
              const dateObj = new Date(dayObj.date);
              const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" });
              return (
                <button
                  key={dayObj.date}
                  className={`calendar-day ${selectedDate === dayObj.date ? "active" : ""}`}
                  onClick={() => setSelectedDate(dayObj.date)}
                >
                  <span className="weekday">{weekday}</span>
                  <span className="day-number">{dayObj.day}</span>
                </button>
              );
            })}
          </div>

          {scrollIndex < maxIndex && (
            <button className="arrow-btn right" onClick={scrollRight}>
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          )}
        </div>

        <div className="calendar-events">
          {filteredEvents.length > 0 ? (
            <div className="event-grid">
              {filteredEvents.map((event, i) => (
                <div className="event-card" key={i}>
                  <div className="event-image">
                    <img src={event.img} alt={event.title} />
                    <span className={`event-tag ${event.type.toLowerCase()}`}>
                      {event.type.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <p className="event-category">{event.category}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-events">No events on this date 🎈</p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- APP ---------- */
function App() {
  return (
    <div className="wrapper">
      <Hero />
      <About />
      <EventCalendar />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
