// Global Variables
let ingredients = [];
const ingredientInput = document.getElementById('ingredient-input');
const addIngredientBtn = document.getElementById('add-ingredient');
const ingredientList = document.getElementById('ingredient-list');
const recipeResults = document.getElementById('recipe-results');
const apiBaseUrl = "http://127.0.0.1:8000/api/";

// Scroll to next section
function scrollToContent() {
  const aboutSection = document.getElementById("about-section");
  aboutSection.scrollIntoView({ behavior: "smooth" });
}

// Add ingredient to the list
document.addEventListener('DOMContentLoaded', () => {
  if (ingredientInput && addIngredientBtn) {
    addIngredientBtn.addEventListener('click', () => {
      const ingredient = ingredientInput.value.trim();
      if (ingredient && !ingredients.includes(ingredient)) {
        ingredients.push(ingredient);
        updateIngredientList();
        fetchRecipes(); // Fetch recipes when a new ingredient is added
      }
      ingredientInput.value = '';
    });
  } else {
    console.error('Ingredient input or add button not found!');
  }
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
async function fetchRecipes() {
  console.log("Sending ingredients:", ingredients);

  // Check if ingredients array is empty
  if (ingredients.length === 0) {
    alert("Please add at least one ingredient!");
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}recipes/search/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients }),
    });

    if (response.ok) {
      const data = await response.json();

      // Check if recipes are returned
      if (data.length === 0) {
        alert("No recipes found for the given ingredients.");
        recipeResults.innerHTML = "<p>No recipes found. Try different ingredients.</p>";
        return;
      } else {
        displayRecipes(data);
      }
    } else {
      const errorText = await response.text(); // Get error message from backend
      console.error('Error fetching recipes:', response.status, errorText);
      alert(`Error fetching recipes: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Network error:', error);
    alert('Failed to connect to the server. Please check your connection.');
  }
}

// Display fetched recipes
function displayRecipes(recipes) {
  recipeResults.innerHTML = recipes.map(recipe => `
    <div class="recipe-card">
      <h3>${recipe.title}</h3>
      <p>${recipe.instructions}</p>
      <button onclick="saveToFavorites(${recipe.id})">♡ Save</button>
    </div>
  `).join('');
}

// Save a recipe to favorites
async function saveToFavorites(recipeId) {
  try {
    const response = await fetch(`${apiBaseUrl}recipes/${recipeId}/save/`, {
      method: 'POST',
    });

    if (response.ok) {
      alert('Recipe saved to favorites!');
    } else {
      alert('Failed to save recipe.');
    }
  } catch (error) {
    console.error('Error saving favorite:', error);
  }
}

// View recipe details
async function viewRecipe(recipeId) {
  try {
    const response = await fetch(`${apiBaseUrl}recipes/${recipeId}/`);
    if (response.ok) {
      const recipe = await response.json();
      console.log('Recipe details:', recipe);
      alert(`Recipe Details:\n\nTitle: ${recipe.title}\nInstructions: ${recipe.instructions}`);
    } else {
      const errorText = await response.text();
      console.error('Error fetching recipe details:', errorText);
      alert('Error fetching recipe details: ' + errorText);
    }
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    alert('Error fetching recipe details. Please try again later.');
  }
}

// Toggle favorite (heart icon)
function toggleFavorite(button) {
  button.classList.toggle('saved');
}

// Toggle dropdown menu visbility
function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);

  if (dropdown.style.display === "block") {
    dropdown.style.display = "none";
  } else {
    // Close other dropdowns if only one should be open at a time
    const allDropdowns = document.querySelectorAll('.dropdown');
    allDropdowns.forEach((menu) => {
      if (menu.id !== dropdownId) {
        menu.style.display = "none";
      }
    });
    
    // Open the clicked dropdown
    dropdown.style.display = "block";
  }
}

const filterTagsContainer = document.getElementById('filter-tags');
let selectedFilters = {};

// Add selected filter to the list
function selectFilter(category, value) {
  // Ensure the category exists in selectedFilters
  if (!selectedFilters[category]) {
    selectedFilters[category] = [];
  }

  // Add the value only if it's not already selected
  if (!selectedFilters[category].includes(value)) {
    selectedFilters[category].push(value);
    updateFilterTags();
  }

  // Close the dropdown after selection
  const dropdown = document.getElementById(`${category.toLowerCase()}-dropdown`);
  dropdown.style.display = "none";
}

// Remove a filter from the selected list
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

// Update displayed filter tags
function updateFilterTags() {
  filterTagsContainer.innerHTML = '';
  for (const [category, values] of Object.entries(selectedFilters)) {
    values.forEach((value) => {
      // Create a tag element for each selected filter
      const tag = document.createElement('div');
      tag.className = 'filter-tag';
      tag.innerHTML = `${value} <button onclick="removeFilter('${category}', '${value}')">x</button>`;
      filterTagsContainer.appendChild(tag);
    });
  }
}

const filterButtons = document.querySelectorAll(".filter-btn");
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Toggle the selected state
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
  const recipesDisplay = document.getElementById("recipes-display");
  recipesDisplay.innerHTML = `<p>Fetching recipes for filters: ${selectedFilters.join(", ")}</p>`;
}

// Recipe Display Section
const recipesContainer = document.getElementById("recipes-container");
const searchRecipesInput = document.getElementById("search-recipes");
const searchBtn = document.getElementById("search-btn");

const categories = {
  "Family-Friends Meals": [
    { title: "Spaghetti and Meatballs", image: "path-to-image", id: "1" }, // Images waiting to be chosen
    { title: "Chicken Alfredo Casserole", image: "path-to-image", id: "2" },
    { title: "Beef Tacos", image: "path-to-image", id: "3" },
  ],
  "Vegan Meals": [
    { title: "Black Bean and Quinoa Bowl", image: "path-to-image", id: "4" },
    { title: "Vegan Burritos", image: "path-to-image", id: "5" },
    { title: "Lentil Shepherd's Pie", image: "path-to-image", id: "6" },
  ],
};

// Loop through predefined categories and render recipes
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

// Toggle heart
function toggleHeart(button) {
  button.classList.toggle("saved");
}

// Simulate viewing a recipe
function viewRecipe(id) {
  alert(`Viewing recipe with ID: ${id}`);
}

// Filter recipes by query (simulation)
function filterRecipes(query) {
  // Simulate search functionality
  alert(`Searching for recipes containing: ${query}`);
}

// Search button functionality
searchBtn.addEventListener("click", () => {
  const query = searchRecipesInput.value.trim();
  if (query) {
    filterRecipes(query);
  }
});

// Initial render of recipes
renderRecipes();

async function fetchRecipesFromAPI(query) {
  try {
    const response = await fetch(`${apiBaseUrl}recipes/search/?q=${query}`);
    const data = await response.json();
    return data;
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

// Show/Hide Password (example)
const togglePassword = document.getElementById('toggle-password');
const passwordPlaceholder = document.getElementById('password-placeholder');

togglePassword.addEventListener('click', () => {
  if (passwordPlaceholder.textContent === '••••••••') {
    passwordPlaceholder.textContent = 'password123'; 
    togglePassword.textContent = 'Hide';
  } else {
    passwordPlaceholder.textContent = '••••••••';
    togglePassword.textContent = 'Show';
  }
});

// Simulate user data population
document.addEventListener('DOMContentLoaded', () => {
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
      // Update the user's data
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

// Favourites Section
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
  console.log(`Toggle Favourite for Recipe ID: ${recipeId}`);
}

function viewRecipe(recipeId) {
  alert(`View Recipe ID: ${recipeId}`);
}

