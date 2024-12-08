/* SCROLL TO NEXT SECTION */
function scrollToContent() {
  const aboutSection = document.getElementById("about-section");
  aboutSection.scrollIntoView({ behavior: "smooth" });
}

/* SEARCH RECIPES SECTION */
const ingredientInput = document.getElementById('ingredient-input');
const addIngredientBtn = document.getElementById('add-ingredient');
const ingredientList = document.getElementById('ingredient-list');
const recipeResults = document.getElementById('recipe-results');

let ingredients = [];

// Add ingredient to the list
addIngredientBtn.addEventListener('click', () => {
  const ingredient = ingredientInput.value.trim();
  if (ingredient && !ingredients.includes(ingredient)) {
    ingredients.push(ingredient);
    updateIngredientList();
    fetchRecipes(); // Fetch recipes when a new ingredient is added
  }
  ingredientInput.value = '';
});

// Update ingredient list display
function updateIngredientList() {
  ingredientList.innerHTML = '';
  ingredients.forEach((ingredient, index) => {
    const div = document.createElement('div');
    div.innerHTML = `${ingredient} <button onclick="removeIngredient(${index})">x</button>`;
    ingredientList.appendChild(div);
  });
}

// Remove ingredient from the list
function removeIngredient(index) {
  ingredients.splice(index, 1);
  updateIngredientList();
  fetchRecipes(); // Update recipes based on remaining ingredients
}

// Fetch recipes from API
async function fetchRecipes(ingredients) {
  const response = await fetch('/api/recipes/search/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients }),
  });

  if (response.ok) {
      const data = await response.json();
      displayRecipes(data);
  } else {
      alert('Error fetching recipes');
  }
}

// Display fetched recipes
function displayRecipes(recipes) {
  const recipeResults = document.getElementById('recipe-results');
  recipeResults.innerHTML = recipes.map(recipe => `
      <div class="recipe-card">
          <h3>${recipe.title}</h3>
          <button onclick="saveToFavorites(${recipe.id})">♡ Save</button>
      </div>
  `).join('');
}

async function saveToFavorites(recipeId) {
  const response = await fetch(`/api/recipes/${recipeId}/save/`, {
      method: 'POST',
  });

  if (response.ok) {
      alert('Recipe saved to favorites');
  } else {
      alert('Failed to save recipe');
  }
}

// Handle "View Recipe" button
function viewRecipe(recipeId) {
  alert(`Recipe ID: ${recipeId} (implement detailed view)`);
}

// Toggle favorite (heart icon)
function toggleFavorite(button) {
  button.classList.toggle('saved');
}

/* Filters */
function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);

  // Toggle visibility
  if (dropdown.style.display === "block") {
    dropdown.style.display = "none";
  } else {
    // Close all other dropdowns
    const allDropdowns = document.querySelectorAll('.dropdown');
    allDropdowns.forEach((menu) => (menu.style.display = "none"));

    // Open the clicked dropdown
    dropdown.style.display = "block";
  }

  // Close other dropdowns if only one should be open at a time
  const allDropdowns = document.querySelectorAll('.dropdown');
  allDropdowns.forEach((menu) => {
    if (menu.id !== dropdownId) {
      menu.style.display = "none";
    }
  });
}

const filterTagsContainer = document.getElementById('filter-tags');
let selectedFilters = {};

// Function to select a filter
function selectFilter(category, value) {
  if (!selectedFilters[category]) {
    selectedFilters[category] = [];
  }

  if (!selectedFilters[category].includes(value)) {
    selectedFilters[category].push(value);
    updateFilterTags();
  }

  // Close the dropdown after selection
  const dropdown = document.getElementById(`${category.toLowerCase()}-dropdown`);
  dropdown.style.display = "none";
}

// Function to remove a filter
function removeFilter(category, value) {
  if (selectedFilters[category]) {
    selectedFilters[category] = selectedFilters[category].filter(
      (filter) => filter !== value
    );
    if (selectedFilters[category].length === 0) {
      delete selectedFilters[category];
    }
    updateFilterTags();
  }
}

// Function to update filter tags display
function updateFilterTags() {
  filterTagsContainer.innerHTML = '';
  for (const [category, values] of Object.entries(selectedFilters)) {
    values.forEach((value) => {
      const tag = document.createElement('div');
      tag.className = 'filter-tag';
      tag.innerHTML = `${value} <button onclick="removeFilter('${category}', '${value}')">x</button>`;
      filterTagsContainer.appendChild(tag);
    });
  }
}

/* RECIPES PAGE */
const filterButtons = document.querySelectorAll(".filter-btn");
const recipesDisplay = document.getElementById("recipes-display");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Toggle the active class
    button.classList.toggle("selected");

    // Fetch filtered recipes
    fetchFilteredRecipes();
  });
});

// Fetch recipes based on selected filters
function fetchFilteredRecipes() {
  const selectedFilters = Array.from(document.querySelectorAll(".filter-btn.selected"))
    .map((btn) => btn.getAttribute("data-filter"));

  // Simulating fetching filtered recipes
  recipesDisplay.innerHTML = `<p>Fetching recipes for filters: ${selectedFilters.join(", ")}</p>`;

  // Add API call logic here if needed
}

/* Recipe Display Section */
const recipesContainer = document.getElementById("recipes-container");
const searchRecipesInput = document.getElementById("search-recipes");
const searchBtn = document.getElementById("search-btn");

const categories = {
  "Family-Friends Meals": [
    { title: "Spaghetti and Meatballs", image: "path-to-image", id: "1" },
    { title: "Chicken Alfredo Casserole", image: "path-to-image", id: "2" },
    { title: "Beef Tacos", image: "path-to-image", id: "3" },
  ],
  "Vegan Meals": [
    { title: "Black Bean and Quinoa Bowl", image: "path-to-image", id: "4" },
    { title: "Vegan Burritos", image: "path-to-image", id: "5" },
    { title: "Lentil Shepherd's Pie", image: "path-to-image", id: "6" },
  ],
};

// Function to render recipes
function renderRecipes() {
  recipesContainer.innerHTML = "";
  for (const [category, recipes] of Object.entries(categories)) {
    const categoryDiv = document.createElement("div");
    categoryDiv.classList.add("recipe-category");

    const categoryTitle = document.createElement("h3");
    categoryTitle.classList.add("recipe-category-title");
    categoryTitle.innerText = category;

    categoryDiv.appendChild(categoryTitle);

    recipes.forEach((recipe) => {
      const card = document.createElement("div");
      card.classList.add("recipe-card");

      card.innerHTML = `
        <div class="recipe-card-content">
          <h3>${recipe.title}</h3>
          <div class="recipe-actions">
            <button class="heart-btn" onclick="toggleHeart(this)">♡</button>
            <button class="view-recipe-btn" onclick="viewRecipe('${recipe.id}')">View Recipe</button>
          </div>
        </div>
        <img src="${recipe.image}" alt="${recipe.title}">
      `;
      categoryDiv.appendChild(card);
    });

    recipesContainer.appendChild(categoryDiv);
  }
}

// Function to toggle heart
function toggleHeart(button) {
  button.classList.toggle("saved");
}

// Function to simulate viewing a recipe
function viewRecipe(id) {
  alert(`Viewing recipe with ID: ${id}`);
}

// Function to filter recipes
function filterRecipes(query) {
  // Simulate search functionality
  alert(`Searching for recipes containing: ${query}`);
}

// Event Listener for search button
searchBtn.addEventListener("click", () => {
  const query = searchRecipesInput.value.trim();
  if (query) {
    filterRecipes(query);
  }
});

// Initial render
renderRecipes();

async function fetchRecipesFromAPI(query) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/recipes/search/?q=${query}`);
    const data = await response.json();
    return data; // Assume the API returns an array of recipes
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
}

searchButton.addEventListener("click", async () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    searchResults.innerHTML = "<p>Please enter a recipe name to search.</p>";
    return;
  }

  const filteredRecipes = await fetchRecipesFromAPI(query);

  if (filteredRecipes.length > 0) {
    searchResults.innerHTML = `
      <p>Found ${filteredRecipes.length} recipe(s):</p>
      <ul>
        ${filteredRecipes
          .map(
            (recipe) =>
              `<li>
                <strong>${recipe.title}</strong>
                <button onclick="viewRecipe(${recipe.id})">View Recipe</button>
              </li>`
          )
          .join("")}
      </ul>
    `;
  } else {
    searchResults.innerHTML = "<p>No recipes found. Try a different search term.</p>";
  }
});

/* PROFILE PAGE */
// Tab Switching Logic
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    // Remove 'active' class from all buttons and contents
    tabButtons.forEach((btn) => btn.classList.remove('active'));
    tabContents.forEach((content) => content.classList.remove('active'));

    // Add 'active' class to the clicked button and the corresponding content
    button.classList.add('active');
    document.getElementById(button.getAttribute('data-tab')).classList.add('active');
  });
});

// Show/Hide Password Logic
const togglePassword = document.getElementById('toggle-password');
const passwordPlaceholder = document.getElementById('password-placeholder');

togglePassword.addEventListener('click', () => {
  if (passwordPlaceholder.textContent === '••••••••') {
    passwordPlaceholder.textContent = 'password123'; // Replace with the actual password logic
    togglePassword.textContent = 'Hide';
  } else {
    passwordPlaceholder.textContent = '••••••••';
    togglePassword.textContent = 'Show';
  }
});

// Populate User Info (Optional - Simulating a Fetch)
document.addEventListener('DOMContentLoaded', () => {
  // Simulate fetching user data
  const userData = {
    name: 'Beatrice Giurgica',
    email: 'beatrice3m@gmail.com',
  };

  // Populate the form fields with user data
  const displayNameField = document.getElementById('display-name');
  displayNameField.value = userData.name;

  // Handle form submission
  const accountForm = document.getElementById('account-form');
  accountForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent form submission

    // Get the updated name
    const updatedName = displayNameField.value.trim();

    if (updatedName) {
      // Update the user's data (simulated API call)
      fetch('/api/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: updatedName }),
      })
        .then((response) => {
          if (response.ok) {
            alert('Your information has been updated successfully!');
          } else {
            alert('Error updating your information. Please try again.');
          }
        })
        .catch(() => {
          alert('Network error. Please try again later.');
        });
    } else {
      alert('Display name is required!');
    }
  });

  // Handle discard button
  accountForm.addEventListener('reset', () => {
    // Reset the name field to the original value
    displayNameField.value = userData.name;
  });
});

// Favourites Logic
const favouritesRecipes = document.getElementById('favourites-recipes');
// Dynamically populate the favourites recipes (mock data for now)
const mockFavourites = [
  { title: 'Spaghetti and Meatballs', image: 'spaghetti.jpg', id: 1 },
  { title: 'Vegan Burritos', image: 'burritos.jpg', id: 2 },
];

favouritesRecipes.innerHTML = mockFavourites
  .map(
    (recipe) => `
    <div class="recipe-card">
      <div class="recipe-info">
        <h3>${recipe.title}</h3>
        <button class="heart-btn saved" onclick="toggleFavourite(${recipe.id})">❤</button>
        <button onclick="viewRecipe('${recipe.id}')">View Recipe</button>
      </div>
      <div class="recipe-image">
        <img src="${recipe.image}" alt="${recipe.title}">
      </div>
    </div>
  `
  )
  .join('');

function toggleFavourite(recipeId) {
  // Remove recipe logic
  console.log(`Toggle Favourite for Recipe ID: ${recipeId}`);
}

function viewRecipe(recipeId) {
  alert(`View Recipe ID: ${recipeId}`);
}

