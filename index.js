// Define the base URL for your json-server
const API_URL = 'http://localhost:3000/childhood_flix';

// Get DOM elements
const flixListContainer = document.getElementById('flix-list-container');
const addFlixForm = document.getElementById('add-flix-form');
const filterTypeSelect = document.getElementById('filter-type');
const flixDetailSection = document.getElementById('flix-detail-section');
const flixDetailContent = document.getElementById('flix-detail-content');
const mainContainer = document.querySelector('main'); // To adjust grid layout

// --- Functions for interacting with the API ---

// Function to fetch all flix items
async function fetchAllFlix() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const flixItems = await response.json();
        renderFlixList(flixItems);
    } catch (error) {
        console.error("Error fetching flix items:", error);
        flixListContainer.innerHTML = '<p style="color: red;">Failed to load flix. Please ensure the server is running.</p>';
    }
}

// Function to add a new flix item
async function addFlixItem(flixData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(flixData),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const newFlix = await response.json();
        console.log("Added new flix:", newFlix);

        // Re-fetch and re-render the list to include the new item
        fetchAllFlix();
        addFlixForm.reset(); // Clear the form
        alert('Flix added successfully!');
    } catch (error) {
        console.error("Error adding flix item:", error);
        alert('Failed to add flix. Please try again.');
    }
}

// Function to delete a flix item
async function deleteFlixItem(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log(`Deleted flix with ID: ${id}`);

        // Remove the item from the DOM
        document.getElementById(`flix-${id}`).remove();
        
        // Clear detail view if the deleted item was currently displayed
        if (flixDetailContent.dataset.currentFlixId === String(id)) {
            clearFlixDetail();
        }
        alert('Flix deleted successfully!');
    } catch (error) {
        console.error("Error deleting flix item:", error);
        alert('Failed to delete flix. Please try again.');
    }
}

// --- Functions for rendering and updating the UI ---

// Function to render a single flix item element
function createFlixItemElement(flix) {
    const flixDiv = document.createElement('div');
    flixDiv.classList.add('flix-item');
    flixDiv.id = `flix-${flix.id}`; // Add ID for easy targeting

    flixDiv.innerHTML = `
        <h3>${flix.title}</h3>
        <p><strong>Type:</strong> ${flix.type}</p>
        <p><strong>Year:</strong> ${flix.year || 'N/A'}</p>
        <button class="delete-btn" data-id="${flix.id}">Delete</button>
    `;

    // Event listener for showing details (Distinct Event Listener 1: Click on item)
    flixDiv.addEventListener('click', (event) => {
        // Prevent click on delete button from also triggering detail view
        if (!event.target.classList.contains('delete-btn')) {
            displayFlixDetail(flix);
        }
    });

    // Event listener for the delete button (Distinct Event Listener 2: Click on delete button)
    const deleteButton = flixDiv.querySelector('.delete-btn');
    deleteButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the parent flixDiv click from firing
        if (confirm(`Are you sure you want to delete "${flix.title}"?`)) {
            deleteFlixItem(flix.id);
        }
    });

    return flixDiv;
}

// Function to render the list of flix items
function renderFlixList(flixItems) {
    flixListContainer.innerHTML = ''; // Clear previous list
    // Array iteration: forEach to render each item
    flixItems.forEach(flix => {
        const flixElement = createFlixItemElement(flix);
        flixListContainer.appendChild(flixElement);
    });
}

// Function to display details of a selected flix item
function displayFlixDetail(flix) {
    flixDetailContent.innerHTML = `
        <h3>${flix.title}</h3>
        <p><strong>Type:</strong> ${flix.type}</p>
        <p><strong>Year:</strong> ${flix.year || 'N/A'}</p>
        <p><strong>Description:</strong> ${flix.description || 'No description available.'}</p>
    `;
    // Store current flix ID for clearing detail view if deleted
    flixDetailContent.dataset.currentFlixId = flix.id;
    // Adjust main layout to show detail section side-by-side
    mainContainer.classList.add('detail-view');
}

// Function to clear the detail view
function clearFlixDetail() {
    flixDetailContent.innerHTML = '<p>Click on an item in your collection to see its details here.</p>';
    delete flixDetailContent.dataset.currentFlixId; // Remove stored ID
    mainContainer.classList.remove('detail-view'); // Reset layout
}


// --- Event Listeners ---

// Event Listener 3: Form submission for adding a new flix
addFlixForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission behavior (page reload)

    const newFlix = {
        title: document.getElementById('title').value,
        type: document.getElementById('type').value,
        year: document.getElementById('year').value ? parseInt(document.getElementById('year').value) : null, // Convert to number or null
        description: document.getElementById('description').value
    };

    addFlixItem(newFlix);
});

// Event Listener 4: Filter by type (Distinct Event Listener 3: Change on select)
filterTypeSelect.addEventListener('change', async (event) => {
    const selectedType = event.target.value;
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allFlix = await response.json();

        let filteredFlix;
        if (selectedType === 'All') {
            filteredFlix = allFlix;
        } else {
            // Array iteration: filter to match selected type
            filteredFlix = allFlix.filter(flix => flix.type === selectedType);
        }
        renderFlixList(filteredFlix);
    } catch (error) {
        console.error("Error filtering flix items:", error);
        flixListContainer.innerHTML = '<p style="color: red;">Failed to filter flix. Please try again.</p>';
    }
});


// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAllFlix(); // Load all flix items when the page loads
});
