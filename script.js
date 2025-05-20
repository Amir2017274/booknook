document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const genreSelect = document.getElementById("genreSelect");
  const searchButton = document.getElementById("searchButton");
  const resultsList = document.getElementById("resultsList");
  const recommendationsList = document.getElementById("recommendationsList");
  const reviewForm = document.getElementById("reviewForm");
  const reviewList = document.getElementById("reviewList");
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modalContent");
  const closeButton = document.querySelector(".close-button");

  function createBookCard(book) {
    const card = document.createElement("div");
    card.className = "book-card";

    const img = document.createElement("img");
    img.src = book.image || "https://via.placeholder.com/150x220?text=No+Image";
    img.alt = book.title;
    card.appendChild(img);

    const title = document.createElement("h3");
    title.textContent = book.title;
    card.appendChild(title);

    const author = document.createElement("p");
    author.textContent = `Author: ${book.author || "Unknown"}`;
    card.appendChild(author);

    const genre = document.createElement("p");
    genre.textContent = `Genre: ${book.genre || "N/A"}`;
    card.appendChild(genre);

    const desc = document.createElement("p");
    desc.textContent = book.description
      ? book.description.length > 100
        ? book.description.slice(0, 100) + "..."
        : book.description
      : "No description available.";
    card.appendChild(desc);

    const readMoreBtn = document.createElement("button");
    readMoreBtn.textContent = "Read More";
    readMoreBtn.className = "read-more";
    readMoreBtn.addEventListener("click", () => openModal(book));
    card.appendChild(readMoreBtn);

    return card;
  }

  function openModal(book) {
    modalContent.innerHTML = `
      <h2>${book.title}</h2>
      <p><strong>Author:</strong> ${book.author || "Unknown"}</p>
      <p><strong>Genre:</strong> ${book.genre || "N/A"}</p>
      <img src="${book.image || "https://via.placeholder.com/150x220?text=No+Image"}" alt="${book.title}" style="max-width: 200px; margin-bottom: 1rem;">
      <p>${book.description || "No description available."}</p>
    `;
    modal.classList.remove("hidden");
  }

  function closeModal() {
    modal.classList.add("hidden");
    modalContent.innerHTML = "";
  }

  closeButton.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  async function searchBooks() {
    const query = searchInput.value.trim();
    const genre = genreSelect.value;

    if (!query) {
      alert("Please enter a book title.");
      return;
    }

    resultsList.innerHTML = "<p>Loading...</p>";

    try {
      let url = `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}`;
      if (genre) {
        url += `&subject=${encodeURIComponent(genre)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!data.docs || data.docs.length === 0) {
        resultsList.innerHTML = "<p>No books found.</p>";
        return;
      }

      resultsList.innerHTML = "";

      data.docs.slice(0, 10).forEach((doc) => {
        const book = {
          title: doc.title,
          author: doc.author_name ? doc.author_name.join(", ") : "Unknown",
          genre: genre || "N/A",
          image: doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
            : null,
          description: doc.first_sentence ? doc.first_sentence.join(" ") : "",
        };
        resultsList.appendChild(createBookCard(book));
      });
    } catch (error) {
      resultsList.innerHTML = "<p>Error fetching books. Try again later.</p>";
      console.error(error);
    }
  }

  function showRecommendations() {
    const recommendedBooks = [
      {
        title: "1984",
        author: "George Orwell",
        genre: "Science Fiction",
        image: "https://covers.openlibrary.org/b/id/8226191-M.jpg",
        description:
          "A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.",
      },
      {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        genre: "Romance",
        image: "https://covers.openlibrary.org/b/id/8231856-M.jpg",
        description:
          "A romantic novel that critiques the British landed gentry at the end of the 18th century.",
      },
      {
        title: "Harry Potter and the Sorcerer's Stone",
        author: "J.K. Rowling",
        genre: "Fantasy",
        image: "https://covers.openlibrary.org/b/id/7984916-M.jpg",
        description:
          "The first book in the Harry Potter series, introducing the young wizard and his adventures.",
      },
    ];

    recommendationsList.innerHTML = "";
    recommendedBooks.forEach((book) => {
      recommendationsList.appendChild(createBookCard(book));
    });
  }

  function loadReviews() {
    const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
    reviewList.innerHTML = "";

    if (reviews.length === 0) {
      reviewList.innerHTML = "<p>No reviews yet.</p>";
      return;
    }

    reviews.forEach((r) => {
      const reviewEl = document.createElement("div");
      reviewEl.className = "review";
      reviewEl.innerHTML = `<strong>${r.name}</strong>: <p>${r.text}</p>`;
      reviewList.appendChild(reviewEl);
    });
  }

  function saveReview(name, text) {
    const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
    reviews.push({ name, text });
    localStorage.setItem("reviews", JSON.stringify(reviews));
  }

  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = reviewForm.name.value.trim();
    const text = reviewForm.review.value.trim();

    if (!name || !text) {
      alert("Please fill out both fields.");
      return;
    }

    saveReview(name, text);
    loadReviews();
    reviewForm.reset();
  });

  searchButton.addEventListener("click", searchBooks);

  showRecommendations();

  loadReviews();
});
