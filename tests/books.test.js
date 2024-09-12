process.env.NODE_ENV = "test"
const request = require("supertest");
const app = require("../app");
const Book = require("../models/book");

jest.mock("../models/book");

describe("GET /books", () => {
  test("should return a list of books", async () => {
    Book.findAll.mockResolvedValue([
      { isbn: "123456", title: "Book 1", author: "Author 1" },
      { isbn: "7891011", title: "Book 2", author: "Author 2" }
    ]);

    const response = await request(app).get("/books");
    expect(response.statusCode).toBe(200);
    expect(response.body.books.length).toBe(2);
    expect(response.body.books[0].title).toBe("Book 1");
  });

  test("should handle errors", async () => {
    Book.findAll.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/books");
    expect(response.statusCode).toBe(500);
  });
});


describe("GET /books/:id", () => {
  test("should return a single book", async () => {
    Book.findOne.mockResolvedValue({
      isbn: "123456",
      title: "Book 1",
      author: "Author 1"
    });

    const response = await request(app).get("/books/123456");
    expect(response.statusCode).toBe(200);
    expect(response.body.book.title).toBe("Book 1");
  });

  test("should handle errors", async () => {
    Book.findOne.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/books/123456");
    expect(response.statusCode).toBe(500); 
  });
});


describe("POST /books", () => {
  const newBook = {
    isbn: "123456",
    title: "Book 1",
    author: "Author 1",
    published_year: 2021,
    genre: "Fiction",
    available: true
  };

  test("should create a new book", async () => {
    Book.create.mockResolvedValue(newBook);

    const response = await request(app).post("/books").send(newBook);
    expect(response.statusCode).toBe(201);
    expect(response.body.book.title).toBe("Book 1");
  });

  test("should handle validation errors", async () => {
    const invalidBook = {
      title: "Book 1",
      author: "Author 1"
    };

    const response = await request(app).post("/books").send(invalidBook);
    expect(response.statusCode).toBe(400);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});

describe("PUT /books/:isbn", () => {
  const updatedBook = {
    title: "Updated Book",
    author: "Updated Author",
    published_year: 2022,
    genre: "Non-fiction",
    available: false
  };

  test("should update an existing book", async () => {
    Book.update.mockResolvedValue(updatedBook);

    const response = await request(app).put("/books/123456").send(updatedBook);
    expect(response.statusCode).toBe(200);
    expect(response.body.book.title).toBe("Updated Book");
  });

  test("should return an error if ISBN is in body", async () => {
    const invalidBook = {
      isbn: "123456",
      title: "Updated Book"
    };

    const response = await request(app).put("/books/123456").send(invalidBook);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Not allowed");
  });

  test("should handle validation errors", async () => {
    const invalidBook = {
      title: ""
    };

    const response = await request(app).put("/books/123456").send(invalidBook);
    expect(response.statusCode).toBe(400);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});

describe("DELETE /books/:isbn", () => {
  test("should delete a book", async () => {
    Book.remove.mockResolvedValue();

    const response = await request(app).delete("/books/123456");
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Book deleted");
  });

  test("should handle errors", async () => {
    Book.remove.mockRejectedValue(new Error("Database error"));

    const response = await request(app).delete("/books/123456");
    expect(response.statusCode).toBe(500); // Assuming 500 for server error
  });
});
