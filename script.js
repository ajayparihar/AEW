/* 
  Author: Ajay Singh
  Version: 1.1
  Date: 21-09-2024
  Description: JavaScript for the AEW application. Fetches project data from Google Sheets and updates the UI.
*/

// Constants
const API_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRT_ixy3nU4dbCgnMMyR05vP4dQePsnwZ4_UgCuP-x0XdcHVv9X87v6kYP-q2ouBk8UIaK8khj80FJ3/pub?gid=1138944004&single=true&output=csv';
const NO_RECORDS_MESSAGE = 'No records found. Please refresh the page.';
const ERROR_MESSAGE = 'Failed to fetch data. Please check your connection and try again.';

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const cardContainer = document.getElementById('card-container');
const projectCountDisplay = document.getElementById('projects-count');
const citiesCountDisplay = document.getElementById('cities-count');
const companiesCountDisplay = document.getElementById('companies-count');
const logo = document.getElementById('logo');
const headerTitle = document.getElementById('header-title');

// Variables
let totalProjects = 0;
let cities = new Set();
let companies = new Set();
let projectsList = [];
let citiesList = [];
let companiesList = [];

// Show loading screen
const showLoadingScreen = () => {
    loadingScreen.style.display = 'flex';
};

// Hide loading screen
const hideLoadingScreen = () => {
    loadingScreen.style.display = 'none';
};

// Update dashboard counts
const updateDashboardCounts = (visibleCards) => {
    const projectsCount = visibleCards ? visibleCards.length : totalProjects;
    const citiesCount = visibleCards ? new Set(visibleCards.map(card => card.getAttribute('data-city'))).size : cities.size;
    const companiesCount = visibleCards ? new Set(visibleCards.map(card => card.getAttribute('data-company'))).size : companies.size;

    projectCountDisplay.textContent = projectsCount;
    citiesCountDisplay.textContent = citiesCount;
    companiesCountDisplay.textContent = companiesCount;
};

// Create a project card
const createCard = (index, company, place, customer, phone, project) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-project', project);
    card.setAttribute('data-city', place);
    card.setAttribute('data-company', company);

    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';

    const cardFront = document.createElement('div');
    cardFront.className = 'card-face front';
    cardFront.innerHTML = `
        <div class="card-number">${index + 1}</div>
        <div class="company-name">${company}</div>
        <div class="place-name">${place}</div>
    `;

    const cardBack = document.createElement('div');
    cardBack.className = 'card-face back';
    cardBack.innerHTML = `
        <div class="company-name">${company}</div>
        <div class="customer-name">${customer.split(':').join('<br>')}</div>
        <div class="project-description">${project}</div>
        <div class="place-name">${place}</div>
        ${createPhoneNumbers(phone)}
    `;

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);

    // Toggle card flip on click
    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
    });

    return card;
};

// Create phone number elements
const createPhoneNumbers = (phone) => {
    const phoneNumbers = phone.match(/\d{10}/g);
    if (!phoneNumbers) return '';

    return `<div class="phone-numbers">
        ${phoneNumbers.map(num => `
            <i class="fas fa-phone phone-icon" data-number="${num.trim()}"></i>
        `).join('')}
    </div>`;
};

// Attach click listeners to phone icons
const attachPhoneClickListeners = () => {
    const phoneIcons = document.querySelectorAll('.phone-icon');
    phoneIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            const number = event.target.getAttribute('data-number');
            if (confirm(`Do you want to call this number: ${number}?`)) {
                window.location.href = `tel:${number}`;
            }
            event.stopPropagation(); // Prevent card flip
        });
    });
};

// Fetch CSV data from the API
const fetchCSVData = async () => {
    showLoadingScreen();
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.text();
        processCSVData(data);
    } catch (error) {
        console.error('Fetch error:', error);
        cardContainer.innerHTML = `<div class="error-message">${ERROR_MESSAGE}</div>`;
    } finally {
        hideLoadingScreen();
    }
};

// Process the fetched CSV data
const processCSVData = (data) => {
    const rows = data.split('\n').filter(row => row.trim() !== '').slice(1); // Skip header
    totalProjects = rows.length;
    cardContainer.innerHTML = ''; // Clear existing cards

    if (totalProjects === 0) {
        cardContainer.innerHTML = `<p>${NO_RECORDS_MESSAGE}</p>`;
        return;
    }

    rows.forEach((row, index) => {
        const columns = row.split(',');
        if (columns.length === 5) {
            const [company, place, customer, phone, project] = columns.map(col => col.trim());
            companies.add(company);
            cities.add(place);

            const card = createCard(index, company, place, customer, phone, project);
            cardContainer.appendChild(card);
        } else {
            console.warn(`Skipping malformed row ${index + 1}: ${row}`);
        }
    });

    // Attach phone click listeners after cards are created
    attachPhoneClickListeners();
    updateDashboardCounts();
    createProjectsList();
    createCitiesList();
    createCompaniesList();
};

// Create the projects list
const createProjectsList = () => {
    const projectsSet = new Set();
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const project = card.getAttribute('data-project');
        if (project) projectsSet.add(project);
    });
    projectsList = Array.from(projectsSet).sort();
};

// Create the cities list
const createCitiesList = () => {
    citiesList = Array.from(cities).sort();
};

// Create the companies list
const createCompaniesList = () => {
    companiesList = Array.from(companies).sort();
};

// Popup management system
const popupManager = {
    currentPopup: null,
    
    openPopup: function(popup) {
        if (this.currentPopup) {
            this.closePopup();
        }
        this.currentPopup = popup;
        popup.style.display = 'flex';
    },
    
    closePopup: function() {
        if (this.currentPopup) {
            this.currentPopup.style.display = 'none';
            this.currentPopup = null;
        }
    }
};

// Show popup with distinct values
const showPopup = (type) => {
    const popup = document.getElementById(`${type}Popup`);
    const list = document.getElementById(`${type}List`);
    const searchInput = document.getElementById(`${type.slice(0, -1)}Search`);
    const items = type === 'projects' ? projectsList : 
                 type === 'cities' ? citiesList : companiesList;
    
    if (!popup || !list || !searchInput) {
        console.error(`Popup elements for ${type} not found`);
        return;
    }

    // Clear previous content
    list.innerHTML = '';
    searchInput.value = '';
    
    // Check if there are distinct values
    if (items.length === 0) {
        // Add ripple effect
        const element = document.getElementById(type === 'projects' ? 'total-projects' : type === 'cities' ? 'distinct-cities' : 'distinct-companies');
        element.classList.add('ripple');
        setTimeout(() => {
            element.classList.remove('ripple'); // Remove ripple class after animation
        }, 600); // Match the duration of the ripple animation
        return; // Do not open the popup if there are no items
    }

    // Create and append list items
    const createListItems = (items) => {
        list.innerHTML = '';
        items.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'popup-item';
            li.textContent = item;
            li.addEventListener('click', () => {
                filterCards(type, item);
                popupManager.closePopup();
            });
            list.appendChild(li);
        });
    };

    // Initial list creation
    createListItems(items);
    
    // Add search functionality
    const handleSearch = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredItems = items.filter(item => 
            item.toLowerCase().includes(searchTerm)
        );
        createListItems(filteredItems);
    };
    
    // Remove existing listener and add new one
    searchInput.removeEventListener('input', handleSearch);
    searchInput.addEventListener('input', handleSearch);
    
    // Add close button handler
    const closeBtn = popup.querySelector('.popup-close');
    if (closeBtn) {
        closeBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            popupManager.closePopup();
        };
    }

    // Add outside click handler
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popupManager.closePopup();
        }
    });

    // Open the popup
    popupManager.openPopup(popup);
    searchInput.focus(); // Focus on the search input, not on any list item
};

// Filter cards based on selected value
const filterCards = (type, selectedValue) => {
    const cards = Array.from(document.querySelectorAll('.card'));
    const attribute = type === 'projects' ? 'data-project' : 
                     type === 'cities' ? 'data-city' : 'data-company';
    
    // Hide all cards first
    cards.forEach(card => {
        const value = card.getAttribute(attribute);
        if (value === selectedValue) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update card numbers for visible cards
    const visibleCards = cards.filter(card => card.getAttribute(attribute) === selectedValue);
    visibleCards.forEach((card, index) => {
        card.querySelector('.card-number').textContent = index + 1;
    });

    // Update dashboard counts
    updateDashboardCounts(visibleCards);

    // Update dashboard title based on selected value
    const dashboardTitle = document.getElementById('distinct-cities'); // Change this to the relevant ID
    if (type === 'cities') {
        dashboardTitle.innerHTML = `Cities: <span id="cities-count">${visibleCards.length}</span> - ${selectedValue}`;
    } else if (type === 'projects') {
        const projectTitle = document.getElementById('total-projects');
        projectTitle.innerHTML = `Total Projects: <span id="projects-count">${visibleCards.length}</span> - ${selectedValue}`;
    } else if (type === 'companies') {
        const companiesTitle = document.getElementById('distinct-companies');
        companiesTitle.innerHTML = `Companies: <span id="companies-count">${visibleCards.length}</span> - ${selectedValue}`;
    }

    // Add a reset button if not already present
    if (!document.getElementById('reset-filter')) {
        const resetButton = document.createElement('div');
        resetButton.id = 'reset-filter';
        resetButton.className = 'reset-button';
        resetButton.textContent = 'Show All';
        resetButton.onclick = resetCardFilter;
        document.getElementById('dashboard').appendChild(resetButton);
    }
};

// Reset card filter
const resetCardFilter = () => {
    const cards = Array.from(document.querySelectorAll('.card'));
    cards.forEach((card, index) => {
        card.style.display = 'block';
        card.querySelector('.card-number').textContent = index + 1;
    });
    
    // Reset dashboard counts
    updateDashboardCounts();

    // Reset dashboard titles to original state
    const dashboardTitle = document.getElementById('total-projects');
    dashboardTitle.innerHTML = `Total Projects: <span id="projects-count">${totalProjects}</span>`;
    
    const citiesTitle = document.getElementById('distinct-cities');
    citiesTitle.innerHTML = `Cities: <span id="cities-count">${cities.size}</span>`;
    
    const companiesTitle = document.getElementById('distinct-companies');
    companiesTitle.innerHTML = `Companies: <span id="companies-count">${companies.size}</span>`;

    // Remove the reset button
    const resetButton = document.getElementById('reset-filter');
    if (resetButton) {
        resetButton.remove();
    }
};

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
    fetchCSVData();

    // Add click handlers for dashboard items
    const addDashboardClickHandler = (id, type) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showPopup(type);
            });
        } else {
            console.error(`Element with id ${id} not found`);
        }
    };

    // Add click listeners to dashboard items
    addDashboardClickHandler('total-projects', 'projects');
    addDashboardClickHandler('distinct-cities', 'cities');
    addDashboardClickHandler('distinct-companies', 'companies');

    // Logo and header title clicks
    logo.addEventListener('click', () => location.reload());
    headerTitle.addEventListener('click', () => location.reload());
});
