# Smart Library Management System Using DSA in C++

This is a console-based Library Management System built for a DSA project in C++.
It is not only a CRUD application: the main features are powered by visible data
structures and algorithms.

## Features

- Add and delete books
- Register library members
- Search books by exact book ID
- Search books by title prefix
- Display all books in sorted order
- Issue and return books
- Maintain a waiting list when a book is unavailable
- Show due and overdue books
- Show recent transactions
- Save and load data from text files

## DSA Concepts Used

| Feature | Data Structure / Algorithm |
| --- | --- |
| Fast book and member lookup by ID | Hash table using `unordered_map` |
| Sorted display of books by title | Custom AVL Tree |
| Prefix search by book title | Custom Trie |
| Waiting list for unavailable books | Custom linked-list Queue |
| Recent transaction history | Custom linked-list Stack |
| Due/overdue book ordering | Custom Min Heap |
| Persistent records | File handling |

## Project Structure

```text
SmartLibraryDSA/
  src/
    main.cpp
  data/
    books.txt
    members.txt
    borrow_records.txt
    waitlists.txt
  index.html
  web/
    app.js
    library-shelf.png
    style.css
  build.bat
  run.bat
  start-website.bat
  README.md
  PROJECT_REPORT.md
```

## Library Management Website

The project includes a real browser-based Library Management System. It runs
directly on the website and stores data in browser `localStorage`.

Website features:

- Role-based login
- Add and delete books
- Register members
- Search books by title prefix or book ID
- Issue books
- Return books
- Maintain waiting lists
- Show role-aware queue details for out-of-stock books
- Show due and overdue books
- Show recent transactions
- Reset demo data

Demo website accounts:

| Role | Username | Password | Access |
| --- | --- | --- | --- |
| Admin | `admin` | `admin123` | Full access, add/delete books, register members, reset demo data |
| Librarian | `librarian` | `lib123` | Add books, register members, issue/return books, and view records |
| Member | `aarav` | `member123` | Search books and view only their own due records |

Queue visibility:

- Admin and Librarian can see out-of-stock books with full active issue order and waiting-list member details.
- Member can see only the number of members waiting for an out-of-stock book.

The website also demonstrates the same DSA concepts in JavaScript:

- AVL Tree for sorted book display
- Trie for title prefix search
- Linked-list Queue for waiting lists
- Stack for transactions
- Min Heap for due-date ordering
- Hash Map for fast ID lookup

From the project folder, run:

```bat
start-website.bat
```

It will open:

```text
http://localhost:8080/
```

If Python is not installed, you can still open `index.html` directly in the
browser.

The original C++ console project is still included for DSA code submission.
Use `run.bat` if you also want to run the C++ version.

## How to Build

Open a terminal in the project folder and run:

```bat
build.bat
```

Or compile manually:

```bat
g++ -std=c++17 -Wall -Wextra -pedantic src\main.cpp -o build\SmartLibraryDSA.exe
```

## How to Run

```bat
run.bat
```

You can also run the generated executable:

```bat
build\SmartLibraryDSA.exe
```

Run it from the project root folder so it can read and write files inside the
`data` folder.

## Sample Data

Example book IDs:

- `B001`
- `B002`
- `B006`

Example member IDs:

- `M001`
- `M002`
- `M004`

## Suggested Demo Flow

1. Choose option `6` to display books sorted by title using the AVL Tree.
2. Choose option `5` and search prefix `Data` to test Trie prefix search.
3. Choose option `10` and enter date `2026-07-01` to test the Min Heap due-date order.
4. Choose option `9` and enter `B006` to show the linked-list waiting queue.
5. Return book `B006` from member `M004` to demonstrate queue-based waiting-list issue.
