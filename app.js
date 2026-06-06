// Default Mock Data
const DEFAULT_EVENTS = [
    {
        id: "event-1",
        title: "Campus Hackathon 2026",
        category: "Technical",
        date: "2026-06-15",
        time: "09:00",
        location: "Main Seminar Hall",
        capacity: 150,
        registeredCount: 124,
        organizer: "Google Developer Student Club",
        description: "A 24-hour coding challenge to solve real-world problems. Mentorship, delicious meals, and exclusive swags included!"
    },
    {
        id: "event-2",
        title: "Rhythm & Beats - Music Fest",
        category: "Cultural",
        date: "2026-06-20",
        time: "18:00",
        location: "Open Air Theatre (OAT)",
        capacity: 500,
        registeredCount: 489,
        organizer: "Cultural & Fine Arts Society",
        description: "Experience the biggest musical evening of the semester featuring local student bands, dance routines, and DJ sets!"
    },
    {
        id: "event-3",
        title: "Inter-College Cricket Trophy",
        category: "Sports",
        date: "2026-06-25",
        time: "08:30",
        location: "Main Campus Grounds",
        capacity: 120,
        registeredCount: 95,
        organizer: "Campus Athletics Department",
        description: "Come support our home team in the final match of the tournament as they battle for the campus championship cup!"
    },
    {
        id: "event-4",
        title: "AI & Humanities Lecture",
        category: "Academic",
        date: "2026-06-28",
        time: "14:00",
        location: "Tech Auditorium B",
        capacity: 80,
        registeredCount: 78,
        organizer: "Department of AI Research",
        description: "An interactive seminar hosted by visiting professor Dr. Evelyn Ross on the ethical implications of next-gen AI systems."
    }
];

// Application State
let state = {
    events: JSON.parse(localStorage.getItem("cp_events")) || DEFAULT_EVENTS,
    myRegistrations: JSON.parse(localStorage.getItem("cp_my_registrations")) || []
};

// DOM Elements
const eventsGrid = document.getElementById("events-grid");
const myRegGrid = document.getElementById("my-registrations-grid");
const searchInput = document.getElementById("search-input");
const filterCategory = document.getElementById("filter-category");

const feedEmptyState = document.getElementById("feed-empty-state");
const regEmptyState = document.getElementById("reg-empty-state");
const regCountBadge = document.getElementById("reg-count-badge");

const hostForm = document.getElementById("host-event-form");
const eventDateInput = document.getElementById("event-date");

const themeToggleBtn = document.getElementById("theme-toggle");
const toastContainer = document.getElementById("toast-container");
const browseEventsBtn = document.getElementById("browse-events-btn");

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    setupTabNavigation();
    setMinDateInput();
    updateUI();

    // Event Listeners
    searchInput.addEventListener("input", updateUI);
    filterCategory.addEventListener("change", updateUI);
    hostForm.addEventListener("submit", handleHostEvent);
    themeToggleBtn.addEventListener("click", toggleTheme);
    
    browseEventsBtn.addEventListener("click", () => {
        switchTab("feed");
    });
});

// State Persistence
function saveState() {
    localStorage.setItem("cp_events", JSON.stringify(state.events));
    localStorage.setItem("cp_my_registrations", JSON.stringify(state.myRegistrations));
}

// Tab switcher logic
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabName = btn.getAttribute("data-tab");
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Buttons
    document.querySelectorAll(".tab-btn").forEach(btn => {
        if (btn.getAttribute("data-tab") === tabName) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Content Panes
    document.querySelectorAll(".tab-pane").forEach(pane => {
        if (pane.id === `tab-${tabName}`) {
            pane.classList.add("active");
        } else {
            pane.classList.remove("active");
        }
    });
}

// Date input validation: prevent setting past dates
function setMinDateInput() {
    const today = new Date().toISOString().split("T")[0];
    eventDateInput.setAttribute("min", today);
}

// UI Updating Hub
function updateUI() {
    renderEventsFeed();
    renderMyRegistrations();
    updateBadgeCounts();
    lucide.createIcons();
}

// Update Header Navigation Badge
function updateBadgeCounts() {
    regCountBadge.textContent = state.myRegistrations.length;
}

// Tab 1: Render All Available Campus Events
function renderEventsFeed() {
    eventsGrid.innerHTML = "";
    
    const query = searchInput.value.toLowerCase().trim();
    const category = filterCategory.value.toLowerCase();
    
    const filtered = state.events.filter(e => {
        const matchesQuery = e.title.toLowerCase().includes(query) || e.organizer.toLowerCase().includes(query);
        const matchesCategory = category === "all" || e.category.toLowerCase() === category;
        return matchesQuery && matchesCategory;
    });

    if (filtered.length === 0) {
        feedEmptyState.style.display = "flex";
        eventsGrid.style.display = "none";
    } else {
        feedEmptyState.style.display = "none";
        eventsGrid.style.display = "grid";

        filtered.forEach(e => {
            const isRegistered = state.myRegistrations.includes(e.id);
            const isFull = e.registeredCount >= e.capacity;
            const remainingSpots = e.capacity - e.registeredCount;
            
            const card = document.createElement("div");
            card.className = "event-card";
            
            card.innerHTML = `
                <div class="event-card-header">
                    <span class="event-category-badge badge-${e.category.toLowerCase()}">${e.category}</span>
                    <span class="seat-status-badge ${remainingSpots <= 5 ? 'critical' : ''}">
                        ${isFull ? 'Sold Out' : `${remainingSpots} spots remaining`}
                    </span>
                </div>
                <h3 class="event-title">${e.title}</h3>
                
                <div class="event-details">
                    <div class="event-detail-item">
                        <i data-lucide="calendar"></i>
                        <span>${formatDate(e.date)} @ ${formatTime(e.time)}</span>
                    </div>
                    <div class="event-detail-item">
                        <i data-lucide="map-pin"></i>
                        <span>${e.location}</span>
                    </div>
                    <div class="event-detail-item">
                        <i data-lucide="users"></i>
                        <span>${e.registeredCount} / ${e.capacity} Registered</span>
                    </div>
                </div>

                <p class="event-description">${e.description}</p>
                
                <div class="event-footer">
                    <div class="organizer-info">
                        <span class="organizer-label">Host</span>
                        <span class="organizer-name" title="${e.organizer}">${e.organizer}</span>
                    </div>
                    <div>
                        ${isRegistered ? `
                            <button type="button" class="btn btn-danger" onclick="handleCancel('${e.id}')">
                                <span>Cancel Registration</span>
                            </button>
                        ` : `
                            <button type="button" class="btn ${isFull ? 'btn-disabled' : 'btn-primary'}" 
                                ${isFull ? 'disabled' : ''} onclick="handleRegister('${e.id}')">
                                <span>${isFull ? 'Full capacity' : 'Register'}</span>
                            </button>
                        `}
                    </div>
                </div>
            `;
            eventsGrid.appendChild(card);
        });
    }
}

// Tab 2: Render User's Registered Events Grid
function renderMyRegistrations() {
    myRegGrid.innerHTML = "";
    
    const registeredEvents = state.events.filter(e => state.myRegistrations.includes(e.id));
    
    if (registeredEvents.length === 0) {
        regEmptyState.style.display = "flex";
        myRegGrid.style.display = "none";
    } else {
        regEmptyState.style.display = "none";
        myRegGrid.style.display = "grid";

        registeredEvents.forEach(e => {
            const card = document.createElement("div");
            card.className = "event-card";
            
            card.innerHTML = `
                <div class="event-card-header">
                    <span class="event-category-badge badge-${e.category.toLowerCase()}">${e.category}</span>
                    <span class="badge badge-pill" style="background-color: var(--color-academic);">Registered</span>
                </div>
                <h3 class="event-title">${e.title}</h3>
                
                <div class="event-details">
                    <div class="event-detail-item">
                        <i data-lucide="calendar"></i>
                        <span>${formatDate(e.date)} @ ${formatTime(e.time)}</span>
                    </div>
                    <div class="event-detail-item">
                        <i data-lucide="map-pin"></i>
                        <span>${e.location}</span>
                    </div>
                    <div class="event-detail-item">
                        <i data-lucide="info"></i>
                        <span>Organized by ${e.organizer}</span>
                    </div>
                </div>

                <p class="event-description">${e.description}</p>
                
                <div class="event-footer" style="justify-content: flex-end;">
                    <button type="button" class="btn btn-danger" onclick="handleCancel('${e.id}')">
                        <i data-lucide="x-circle"></i>
                        <span>Withdraw Spot</span>
                    </button>
                </div>
            `;
            myRegGrid.appendChild(card);
        });
    }
}

// Actions Handlers
function handleRegister(id) {
    const event = state.events.find(e => e.id === id);
    if (!event) return;
    
    if (event.registeredCount >= event.capacity) {
        showToast("Registration failed: Event is full!", "error");
        return;
    }
    
    if (state.myRegistrations.includes(id)) {
        showToast("You are already registered for this event.", "info");
        return;
    }
    
    event.registeredCount++;
    state.myRegistrations.push(id);
    saveState();
    updateUI();
    showToast(`Registered successfully for "${event.title}"!`, "success");
}

function handleCancel(id) {
    const event = state.events.find(e => e.id === id);
    if (!event) return;
    
    event.registeredCount = Math.max(0, event.registeredCount - 1);
    state.myRegistrations = state.myRegistrations.filter(regId => regId !== id);
    saveState();
    updateUI();
    showToast(`Withdrew registration for "${event.title}".`, "info");
}

function handleHostEvent(e) {
    e.preventDefault();
    
    const title = document.getElementById("event-title").value.trim();
    const category = document.getElementById("event-category").value;
    const date = document.getElementById("event-date").value;
    const time = document.getElementById("event-time").value;
    const location = document.getElementById("event-location").value.trim();
    const capacity = parseInt(document.getElementById("event-capacity").value);
    const organizer = document.getElementById("event-organizer").value.trim();
    const description = document.getElementById("event-description").value.trim();
    
    if (!title || !category || !date || !time || !location || isNaN(capacity) || !organizer || !description) {
        showToast("Please fill all the form details properly.", "error");
        return;
    }
    
    const newEvent = {
        id: `event-${Date.now()}`,
        title,
        category,
        date,
        time,
        location,
        capacity,
        registeredCount: 0,
        organizer,
        description
    };
    
    state.events.unshift(newEvent);
    saveState();
    updateUI();
    
    hostForm.reset();
    setMinDateInput();
    
    showToast(`"${title}" published successfully!`, "success");
    switchTab("feed");
}

// Helpers
function formatTime(timeStr) {
    const [hour, min] = timeStr.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    h = h ? h : 12; // 0 should be 12
    return `${h}:${min} ${ampm}`;
}

function formatDate(dateStr) {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", options);
}

// Theme Engine
function initTheme() {
    const savedTheme = localStorage.getItem("cp_theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const activeTheme = savedTheme || systemTheme;
    document.documentElement.setAttribute("data-theme", activeTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("cp_theme", nextTheme);
}

// Notification System
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "info";
    if (type === "success") icon = "check-circle";
    if (type === "error") icon = "alert-circle";
    
    toast.innerHTML = `
        <i data-lucide="${icon}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    lucide.createIcons();
    
    // Animate out after 2.7s, remove after 3s
    setTimeout(() => {
        toast.style.animation = "fadeOut 0.3s ease-in forwards";
    }, 2700);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
