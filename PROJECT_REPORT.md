# Project Report: Smart Library Management System Using DSA

## Objective

The objective of this project is to build a Library Management System in C++
that demonstrates practical use of core data structures. The system manages
books, members, issue/return records, waiting lists, due dates, and file-based
storage.

## Modules

1. Book Management
   - Add a new book.
   - Delete a book if it is not currently issued.
   - Search by book ID.
   - Display all active books.

2. Member Management
   - Register a member.
   - Display members.
   - View active borrowed books of a selected member.

3. Issue and Return Management
   - Issue a book if copies are available.
   - Return a book.
   - Automatically offer returned copies to the first waiting member.

4. Search and Sorting
   - Exact lookup by ID.
   - Prefix search by title.
   - Sorted display by title.

5. Due Date Tracking
   - Active borrow records are inserted into a Min Heap.
   - The earliest due books are displayed first.

6. File Handling
   - Books, members, active borrow records, and waiting lists are stored in text files.

7. Role Based Website Access
   - Admin can manage books, members, circulation, activity, and demo reset.
   - Librarian can add books, register members, handle issue/return workflows, and view records.
   - Member can search books and view only their own due records.
   - Out-of-stock book queues show full issue/waiting details to staff and only queue counts to members.

## Data Structures Used

### 1. Hash Table

The project uses `unordered_map` to store books and members by ID.

Average time complexity:

- Insert: O(1)
- Search: O(1)
- Update: O(1)

### 2. AVL Tree

A custom AVL Tree stores active books using the key `title + book ID`. This
keeps books balanced and allows sorted display.

Time complexity:

- Insert: O(log n)
- Sorted traversal: O(n)

### 3. Trie

A custom Trie stores book titles character by character. It is used for prefix
search, for example searching `Data` can show `Data Structures Using C++`.

Time complexity:

- Insert title: O(L), where L is title length
- Prefix search: O(P + K), where P is prefix length and K is number of matches

### 4. Queue

A custom linked-list Queue stores waiting members for unavailable books.
Members are served in first-come-first-served order.

Time complexity:

- Enqueue: O(1)
- Dequeue: O(1)

### 5. Stack

A custom linked-list Stack stores recent transactions such as book issue,
return, stock update, waiting-list entry, and deletion.

Time complexity:

- Push: O(1)
- Display recent entries: O(k)

### 6. Min Heap

A custom Min Heap stores active borrow records ordered by due date. This allows
the system to show the earliest due or overdue books first.

Time complexity:

- Insert: O(log n)
- Remove minimum: O(log n)

## File Format

The project uses simple text files inside the `data` folder.

### books.txt

```text
bookId|title|author|category|totalCopies|availableCopies|issueCount
```

### members.txt

```text
memberId|name|emailOrPhone
```

### borrow_records.txt

```text
bookId|memberId|issueDate|dueDate
```

### waitlists.txt

```text
bookId|memberId1,memberId2,memberId3
```

## Conclusion

This project demonstrates how different data structures can work together in a
real application. The AVL Tree supports sorted display, the Trie supports fast
prefix search, the Queue manages fair waiting lists, the Stack keeps recent
activity, and the Min Heap orders due dates efficiently.
