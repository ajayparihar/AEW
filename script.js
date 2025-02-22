/* 
  Author: Ajay Singh
  Version: 1.2
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
let activeFilter = {
    type: null,
    value: null
};

// Show loading screen
const showLoadingScreen = () => {
    loadingScreen.style.display = 'flex';
    // Trigger reflow to ensure transition works
    loadingScreen.offsetHeight;
    loadingScreen.classList.add('visible');
};

// Hide loading screen
const hideLoadingScreen = () => {
    loadingScreen.classList.remove('visible');
    // Wait for transition to complete before hiding
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 300); // Match the transition duration in CSS
};

// Update dashboard counts and UI
const updateDashboardCounts = (visibleCards) => {
    const projectsCount = visibleCards ? visibleCards.length : totalProjects;
    const citiesCount = visibleCards ? new Set(visibleCards.map(card => card.getAttribute('data-city'))).size : cities.size;
    const companiesCount = visibleCards ? new Set(visibleCards.map(card => card.getAttribute('data-company'))).size : companies.size;

    // Update counts and set data attributes for totals
    if (visibleCards) {
        projectCountDisplay.textContent = projectsCount;
        citiesCountDisplay.textContent = citiesCount;
        companiesCountDisplay.textContent = companiesCount;
        
        projectCountDisplay.parentElement.setAttribute('data-total', `/ ${totalProjects}`);
        citiesCountDisplay.parentElement.setAttribute('data-total', `/ ${cities.size}`);
        companiesCountDisplay.parentElement.setAttribute('data-total', `/ ${companies.size}`);

        // If city filter is active, show number of projects in the city
        if (activeFilter.type === 'cities') {
            citiesCountDisplay.textContent = visibleCards.length;
        }
    } else {
        projectCountDisplay.textContent = projectsCount;
        citiesCountDisplay.textContent = citiesCount;
        companiesCountDisplay.textContent = companiesCount;
        
        projectCountDisplay.parentElement.removeAttribute('data-total');
        citiesCountDisplay.parentElement.removeAttribute('data-total');
        companiesCountDisplay.parentElement.removeAttribute('data-total');
    }

    // Update filter indicators
    updateFilterIndicators();
};

// Update filter indicators
const updateFilterIndicators = () => {
    const projectsElement = document.getElementById('total-projects');
    const citiesElement = document.getElementById('distinct-cities');
    const companiesElement = document.getElementById('distinct-companies');
    const dashboard = document.getElementById('dashboard');

    // Reset all labels to their original text
    projectsElement.querySelector('.stat-label').textContent = 'Total Projects';
    citiesElement.querySelector('.stat-label').textContent = 'Cities';
    companiesElement.querySelector('.stat-label').textContent = 'Companies';

    // Remove active class from all
    projectsElement.classList.remove('active-filter');
    citiesElement.classList.remove('active-filter');
    companiesElement.classList.remove('active-filter');

    // Remove existing clear filter button if exists
    const existingClearButton = document.getElementById('clear-filter');
    if (existingClearButton) {
        existingClearButton.remove();
    }

    // Add active class and clear button if there's an active filter
    if (activeFilter.type) {
        let activeElement;
        let filterText;
        
        switch(activeFilter.type) {
            case 'projects':
                activeElement = projectsElement;
                filterText = 'Projects';
                activeElement.querySelector('.stat-label').textContent = `PROJECTS: ${activeFilter.value}`;
                break;
            case 'cities':
                activeElement = citiesElement;
                filterText = 'Cities';
                activeElement.querySelector('.stat-label').textContent = `PROJECTS IN ${activeFilter.value}`;
                break;
            case 'companies':
                activeElement = companiesElement;
                filterText = 'Companies';
                activeElement.querySelector('.stat-label').textContent = `COMPANIES: ${activeFilter.value}`;
                break;
        }

        if (activeElement) {
            activeElement.classList.add('active-filter');
            
            // Create clear filter button
            const clearButton = document.createElement('div');
            clearButton.id = 'clear-filter';
            clearButton.className = 'dashboard-item clickable';
            clearButton.textContent = `Clear ${filterText} Filter`;
            clearButton.addEventListener('click', clearFilter);
            
            // Add the clear button to dashboard
            dashboard.appendChild(clearButton);
        }
    }
};

// Filter cards based on selection
const filterCards = (type, value) => {
    const cards = document.querySelectorAll('.card');
    
    if (activeFilter.type === type && activeFilter.value === value) {
        // If clicking the same filter, clear it
        clearFilter();
        return;
    }

    activeFilter.type = type;
    activeFilter.value = value;

    // Get the correct data attribute based on type
    let dataAttribute;
    switch(type) {
        case 'projects':
            dataAttribute = 'data-project';
            break;
        case 'cities':
            dataAttribute = 'data-city';
            break;
        case 'companies':
            dataAttribute = 'data-company';
            break;
        default:
            console.error('Invalid filter type:', type);
            return;
    }

    console.log(`Filtering by ${dataAttribute} with value: ${value}`);

    cards.forEach(card => {
        const cardValue = card.getAttribute(dataAttribute);
        card.style.display = cardValue === value ? 'block' : 'none';
    });

    const visibleCards = Array.from(cards).filter(card => card.style.display !== 'none');
    console.log(`Filtered to ${visibleCards.length} visible cards`);
    updateDashboardCounts(visibleCards);
};

// Clear active filter
const clearFilter = () => {
    console.log('Clearing filter');
    activeFilter.type = null;
    activeFilter.value = null;

    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.display = 'block';
    });

    updateDashboardCounts();
};

// Initialize dashboard click handlers
const initializeDashboard = () => {
    // Add click handlers with debug logging
    const projectsElement = document.getElementById('total-projects');
    const citiesElement = document.getElementById('distinct-cities');
    const companiesElement = document.getElementById('distinct-companies');

    if (!projectsElement || !citiesElement || !companiesElement) {
        console.error('One or more dashboard elements not found:', {
            projects: !projectsElement,
            cities: !citiesElement,
            companies: !companiesElement
        });
        return;
    }

    projectsElement.addEventListener('click', () => {
        console.log('Projects clicked, showing popup');
        showPopup('projects');
    });

    citiesElement.addEventListener('click', () => {
        console.log('Cities clicked, showing popup');
        showPopup('cities');
    });

    companiesElement.addEventListener('click', () => {
        console.log('Companies clicked, showing popup');
        showPopup('companies');
    });
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
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Add click outside listener
        const closeOnClickOutside = (e) => {
            if (e.target.classList.contains('popup-overlay')) {
                this.closePopup();
                popup.removeEventListener('click', closeOnClickOutside);
            }
        };
        popup.addEventListener('click', closeOnClickOutside);
    },
    
    closePopup: function() {
        if (this.currentPopup) {
            this.currentPopup.style.display = 'none';
            this.currentPopup = null;
            document.body.style.overflow = ''; // Restore scrolling
        }
    }
};

// Show popup with distinct values
const showPopup = (type) => {
    console.log(`Showing popup for type: ${type}`);
    const popup = document.getElementById(`${type}Popup`);
    const list = document.getElementById(`${type}List`);
    let searchInput;
    
    // Get the correct search input based on type
    switch(type) {
        case 'projects':
            searchInput = document.getElementById('projectSearch');
            break;
        case 'cities':
            searchInput = document.getElementById('citySearch');
            break;
        case 'companies':
            searchInput = document.getElementById('companySearch');
            break;
    }
    
    let items;
    switch(type) {
        case 'projects':
            items = projectsList;
            break;
        case 'cities':
            items = citiesList;
            break;
        case 'companies':
            items = companiesList;
            break;
        default:
            console.error(`Invalid type: ${type}`);
            return;
    }
    
    console.log('Elements found:', {
        popup: popup?.id,
        list: list?.id,
        searchInput: searchInput?.id,
        itemsCount: items?.length
    });
    
    if (!popup || !list || !searchInput) {
        console.error(`Popup elements for ${type} not found`);
        return;
    }

    // Clear previous content
    list.innerHTML = '';
    searchInput.value = '';
    
    // Check if there are distinct values
    if (!items || items.length === 0) {
        console.warn(`No items found for ${type}`);
        const element = document.getElementById(type === 'projects' ? 'total-projects' : 
                                             type === 'cities' ? 'distinct-cities' : 'distinct-companies');
        element.classList.add('ripple');
        setTimeout(() => {
            element.classList.remove('ripple');
        }, 600);
        return;
    }

    // Create and append list items
    const createListItems = (items) => {
        list.innerHTML = '';
        items.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'popup-item';
            if (activeFilter.type === type && activeFilter.value === item) {
                li.classList.add('selected');
            }
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

    // Remove any existing event listeners
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);

    // Add search functionality
    newSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredItems = items.filter(item => 
            item.toLowerCase().includes(searchTerm)
        );
        createListItems(filteredItems);
    });

    // Show the popup
    popupManager.openPopup(popup);
};

// Initialize close buttons
const initializeCloseButtons = () => {
    const closeButtons = document.querySelectorAll('.popup-close');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            popupManager.closePopup();
        });
    });

    // Add escape key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            popupManager.closePopup();
        }
    });
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
    `;

    const cardBack = document.createElement('div');
    cardBack.className = 'card-face back';
    cardBack.innerHTML = `
        <div class="company-name">${company}</div>
        <div class="customer-name">${customer.split(':').join('<br>')}</div>
        <div class="project-description">${project}</div>
        ${createPhoneNumbers(phone)}
    `;

    const placeNameDiv = document.createElement('div');
    placeNameDiv.className = 'place-name';
    placeNameDiv.textContent = place;

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);
    card.appendChild(placeNameDiv);

    // Touch event handling for mobile swipe
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let isTouchDevice = 'ontouchstart' in window;

    if (isTouchDevice) {
        card.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        card.addEventListener('touchmove', (e) => {
            touchEndX = e.touches[0].clientX;
            touchEndY = e.touches[0].clientY;
        }, { passive: true });

        card.addEventListener('touchend', () => {
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // Calculate the absolute values for comparison
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);
            
            // If the swipe is more horizontal than vertical and significant enough (40px)
            if (absDeltaX > absDeltaY && absDeltaX > 40) {
                card.classList.toggle('flipped');
            }
            // If the swipe is more vertical than horizontal and significant enough (40px)
            else if (absDeltaY > absDeltaX && absDeltaY > 40) {
                card.classList.toggle('flipped');
            }
        });
    } else {
        // Desktop click handling
        card.addEventListener('click', (e) => {
            // Don't flip if clicking on phone icon or if it's a touch device
            if (!e.target.classList.contains('phone-icon')) {
                card.classList.toggle('flipped');
            }
        });
    }

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

    // Clear existing sets
    cities.clear();
    companies.clear();
    const projectsSet = new Set();

    rows.forEach((row, index) => {
        const columns = row.split(',');
        if (columns.length === 5) {
            const [company, place, customer, phone, project] = columns.map(col => col.trim());
            companies.add(company);
            cities.add(place);
            projectsSet.add(project);

            const card = createCard(index, company, place, customer, phone, project);
            cardContainer.appendChild(card);
        } else {
            console.warn(`Skipping malformed row ${index + 1}: ${row}`);
        }
    });

    // Create sorted lists
    projectsList = Array.from(projectsSet).sort();
    citiesList = Array.from(cities).sort();
    companiesList = Array.from(companies).sort();

    // Attach phone click listeners after cards are created
    attachPhoneClickListeners();
    updateDashboardCounts();
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    fetchCSVData();
    initializeDashboard();
    initializeCloseButtons();
});

// Add click handlers for header elements
logo.addEventListener('click', () => {
    window.location.reload();
});

headerTitle.addEventListener('click', () => {
    window.location.reload();
});
