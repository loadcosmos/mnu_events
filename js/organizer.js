function Sidebar({ currentPage, onSelectPage }) {
  const menu = [
    { id: "home", label: "Recommendations", icon: "fa-lightbulb" },
    { id: "create", label: "Add Event", icon: "fa-plus" },
    { id: "events", label: "My Events", icon: "fa-calendar-days" },
    { id: "profile", label: "Profile", icon: "fa-user" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="images/logo.png" alt="MNU Events" />
        <h2 className="slider-title">Event Organizer</h2>
      </div>

      <nav className="sidebar-menu">
        {menu.map((item) => (
          <button
            key={item.id}
            className={`menu-btn ${currentPage === item.id ? "active" : ""}`}
            onClick={() => onSelectPage(item.id)}
          >
            <i className={`fa-solid ${item.icon}`}></i> {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="logout-btn"
          onClick={() => (window.location.href = "index.html")}
        >
          <i className="fa-solid fa-right-from-bracket"></i> Log Out
        </button>
      </div>
    </aside>
  );
}

function OrganizerHome() {
  return (
    <div className="page-content">
      <h1>Recommendations</h1>
      <p>Check out the activities of other clubs for inspiration and collaborations!</p>
    </div>
  );
}

function CreateEvent() {
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    type: "",
    category: "",
    imageFile: null,
    imagePreview: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Event was submitted successfully!");
    setForm({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      type: "",
      category: "",
      imageFile: null,
      imagePreview: null,
    });
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the form?")) {
      setForm({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        type: "",
        category: "",
        imageFile: null,
        imagePreview: null,
      });
    }
  };

  const handleImageRemove = () => {
    setForm({ ...form, imageFile: null, imagePreview: null });
  };

  return (
    <div className="page-content">
      <h1>Add Event or Lecture</h1>

      <form className="event-form" onSubmit={handleSubmit}>
        {/* Image upload */}
        <div className="image-upload">
          <label htmlFor="imageInput" className="image-label">
            {form.imagePreview ? (
              <>
                <img
                  src={form.imagePreview}
                  alt="Preview"
                  className="image-preview"
                />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={handleImageRemove}
                >
                  ✖ Remove
                </button>
              </>
            ) : (
              <>
                <i className="fa-solid fa-image"></i>
                <p>Click to add event photo</p>
              </>
            )}
          </label>
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  setForm({
                    ...form,
                    imageFile: file,
                    imagePreview: reader.result,
                  });
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>

        {/* Inputs */}
        <input
          type="text"
          name="title"
          placeholder="Enter event title"
          value={form.title}
          onChange={handleChange}
          required
        />

        {/* Date + time */}
        <div className="datetime-row">
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
          />
        </div>

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
        />

        {/* Type + SCI */}
        <div className="dropdown-row">
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            required
          >
            <option value="" disabled hidden>
              Select type
            </option>
            <option value="Event">Event</option>
            <option value="Lecture">Lecture</option>
          </select>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="" disabled hidden>
              Select SCI letter
            </option>
            <option value="Service">Service</option>
            <option value="Creativity">Creativity</option>
            <option value="Intelligence">Intelligence</option>
          </select>
        </div>

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        ></textarea>

        {/* Buttons */}
        <div className="button-row">
          <button type="submit" className="submit-btn">Submit</button>
          <button type="button" className="reset-btn" onClick={handleReset}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ================== Organizer Profile storage helpers ================== */
const ORG_PROFILE_LS = 'organizer_profile_v1';
const ORG_PROFILE_DEFAULT = {
  logoDataUrl: '',
  orgName: 'Charity Club',
  email: 'charity@mnuevents.edu',
  description: 'Мы проводим мероприятия, направленные на помощь обществу.'
};
function loadOrganizerProfile() {
  try {
    const raw = localStorage.getItem(ORG_PROFILE_LS);
    return raw ? JSON.parse(raw) : ORG_PROFILE_DEFAULT;
  } catch {
    return ORG_PROFILE_DEFAULT;
  }
}
function saveOrganizerProfile(data) {
  try { localStorage.setItem(ORG_PROFILE_LS, JSON.stringify(data)); } catch {}
}

/* ================== Profile (clean mockup style, red buttons) ================== */
function Profile() {
  const [profile, setProfile] = React.useState(loadOrganizerProfile());
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const fileRef = React.useRef(null);

  React.useEffect(() => { setProfile(loadOrganizerProfile()); }, []);

  const pickFile = () => fileRef.current?.click();
  const onFileChange = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setProfile(prev => ({ ...prev, logoDataUrl: reader.result }));
    reader.readAsDataURL(f);
  };
  const onField = (k) => (e) => setProfile(prev => ({ ...prev, [k]: e.target.value }));
  const removePhoto = () => setProfile(prev => ({ ...prev, logoDataUrl: '' }));

  const onSave = () => {
    setSaving(true);
    setTimeout(() => {
      saveOrganizerProfile(profile);
      setSaving(false);
      setEditing(false);
    }, 300);
  };
  const onCancel = () => { setProfile(loadOrganizerProfile()); setEditing(false); };

  const Row = ({ label, children }) => (
    <div style={{
      display:'grid',
      gridTemplateColumns:'220px 1fr 18px',
      alignItems:'center',
      gap:12,
      padding:'14px 0',
      borderBottom:'1px solid #f5f5f6'
    }}>
      <div style={{color:'#6b7280', fontSize:14}}>{label}</div>
      <div>{children}</div>
      <div style={{textAlign:'right', color:'#cbd5e1', fontSize:18}}>
        <i className="fa-solid fa-chevron-right"></i>
      </div>
    </div>
  );

  const inputCls = { width:'100%', border:'1px solid #e5e7eb', borderRadius:10, padding:'10px 12px', fontSize:15, outline:'none' };

  return (
    <div className="page-content">
      <h1>Account Settings</h1>

      <div className="profile-card">
        <div style={{fontWeight:600, color:'#6b7280', marginBottom:12}}>Basic info</div>

        {/* Avatar + actions */}
        <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:6}}>
          <div style={{
            width:72, height:72, borderRadius:'50%', overflow:'hidden',
            border:'1px solid #eee', background:'#fafafa', display:'grid', placeItems:'center'
          }}>
            {profile.logoDataUrl
              ? <img src={profile.logoDataUrl} alt="Club Logo" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
              : <img src="images/charity.png" alt="Club Logo" style={{width:'100%', height:'100%', objectFit:'cover'}}/>}
          </div>

          <div style={{display:'flex', gap:10}}>
            <button type="button" className="reset-btn" onClick={pickFile}>
              Upload new picture
            </button>
            {profile.logoDataUrl && (
              <button type="button" className="reset-btn" onClick={removePhoto}>
                Remove
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={onFileChange}/>
          </div>
        </div>

        <div style={{borderTop:'1px solid #f0f0f0', marginTop:10}}>
          <Row label="Organization">
            {editing ? (
              <input
                style={inputCls}
                type="text"
                value={profile.orgName}
                onChange={onField('orgName')}
                placeholder="Organization name"
              />
            ) : (
              <span style={{fontSize:16, fontWeight:600}}>{profile.orgName}</span>
            )}
          </Row>

          <Row label="Email">
            {editing ? (
              <input
                style={inputCls}
                type="email"
                value={profile.email}
                onChange={onField('email')}
                placeholder="name@mnuevents.edu"
              />
            ) : (
              <span>{profile.email}</span>
            )}
          </Row>

          <Row label="Description">
            {editing ? (
              <textarea
                style={{...inputCls, resize:'vertical'}}
                rows="4"
                value={profile.description}
                onChange={onField('description')}
                placeholder="Brief description"
              />
            ) : (
              <span style={{whiteSpace:'pre-wrap'}}>{profile.description}</span>
            )}
          </Row>
        </div>

        {/* Actions (red primary) */}
        <div style={{display:'flex', gap:12, justifyContent:'flex-end', marginTop:16}}>
          {editing ? (
            <>
              <button className="submit-btn" onClick={onSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button className="reset-btn" onClick={onCancel} disabled={saving}>Cancel</button>
            </>
          ) : (
            <button className="submit-btn" onClick={() => setEditing(true)}>Edit profile</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================== App Shell ================== */
function OrganizerApp() {
  const [page, setPage] = React.useState("home");

  return (
    <div className="organizer-wrapper">
      <Sidebar currentPage={page} onSelectPage={setPage} />
      <main className="main-section">
        {page === "home" && <OrganizerHome />}
        {page === "create" && <CreateEvent />}
        {page === "events" && <MyEvents />}
        {page === "profile" && <Profile />}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<OrganizerApp />);

function MyEvents() {
  const [events] = React.useState([
    { title: "Art Night", date: "2025-11-12", category: "Creativity" },
    { title: "Charity Day", date: "2025-11-20", category: "Service" },
  ]);

  return (
    <div className="page-content">
      <h1>Мои мероприятия</h1>
      <table className="events-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Дата</th>
            <th>Категория</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={i}>
              <td>{e.title}</td>
              <td>{e.date}</td>
              <td>{e.category}</td>
              <td>
                <button className="edit-btn">Ред.</button>
                <button className="delete-btn">Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
