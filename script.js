// script.js

const bookList = document.getElementById("book-list");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const genreSelect = document.getElementById("genre-select");
const recommendationList = document.getElementById("recommendation-list");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const closeModal = document.getElementById("close-modal");

const BASE_URL = "https://openlibrary.org";

// Show recommended books on initial load
window.addEventListener("DOMContentLoaded", () => {
  fetchBooks("bestseller", "Fiction", recommendationList);
});

// Search form handler
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = searchInput.value;
  const genre = genreSelect.value;
  fetchBooks(query, genre, bookList);
});

// Fetch books from API
function fetchBooks(query, genre, targetList) {
  targetList.innerHTML = "<p>Loading books...</p>";
  let url = `${BASE_URL}/search.json?q=${encodeURIComponent(query)}`;
  if (genre) {
    url += `+subject:${encodeURIComponent(genre)}`;
  }

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      targetList.innerHTML = "";
      if (!data.docs || data.docs.length === 0) {
        targetList.innerHTML = "<p>No books found.</p>";
        return;
      }
      const books = data.docs.slice(0, 10); // limit to 10 books
      books.forEach((book) => {
        const bookDiv = document.createElement("div");
        bookDiv.className = "book-card";

        const coverUrl = book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : "https://via.placeholder.com/150x200?text=No+Cover";

        const author = book.author_name ? book.author_name.join(", ") : "Unknown Author";
        const subject = book.subject ? book.subject.slice(0, 3).join(", ") : "General";
        const description = book.first_sentence ? book.first_sentence.join(" ") : "No description available.";

        bookDiv.innerHTML = `
          <img src="${coverUrl}" alt="${book.title}">
          <h3>${book.title}</h3>
          <p><strong>Author:</strong> ${author}</p>
          <p><strong>Genre:</strong> ${subject}</p>
          <p><strong>Description:</strong> ${description}</p>
          <button onclick="showDetails('${book.key}')">Read More</button>
        `;

        targetList.appendChild(bookDiv);
      });
    })
    .catch((err) => {
      console.error("Error fetching books:", err);
      targetList.innerHTML = "<p>Error loading books.</p>";
    });
}

// Fetch detailed info and show in modal
function showDetails(key) {
  fetch(`${BASE_URL}${key}.json`)
    .then((res) => res.json())
    .then((data) => {
      const title = data.title || "No title available";
      const description = data.description
        ? typeof data.description === "string"
          ? data.description
          : data.description.value
        : "No description available.";

      modalBody.innerHTML = `
        <h2>${title}</h2>
        <p>${description}</p>
      `;
      modal.style.display = "block";
    })
    .catch((err) => {
      console.error("Error fetching book details:", err);
    });
}

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target == modal) {
    modal.style.display = "none";
  }
});
