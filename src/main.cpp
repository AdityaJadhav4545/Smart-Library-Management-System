#include <algorithm>
#include <cctype>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <sstream>
#include <string>
#include <unordered_map>
#include <vector>

using namespace std;

string trim(const string &value) {
    size_t start = value.find_first_not_of(" \t\r\n");
    if (start == string::npos) {
        return "";
    }
    size_t end = value.find_last_not_of(" \t\r\n");
    return value.substr(start, end - start + 1);
}

string toLowerText(string value) {
    for (char &ch : value) {
        ch = static_cast<char>(tolower(static_cast<unsigned char>(ch)));
    }
    return value;
}

string clipText(const string &value, size_t width) {
    if (value.size() <= width) {
        return value;
    }
    if (width <= 3) {
        return value.substr(0, width);
    }
    return value.substr(0, width - 3) + "...";
}

vector<string> split(const string &line, char delimiter) {
    vector<string> parts;
    string item;
    stringstream ss(line);
    while (getline(ss, item, delimiter)) {
        parts.push_back(item);
    }
    return parts;
}

int safeToInt(const string &value, int fallback = 0) {
    try {
        return stoi(trim(value));
    } catch (...) {
        return fallback;
    }
}

string readLine(const string &prompt) {
    cout << prompt;
    string value;
    getline(cin, value);
    return trim(value);
}

int readInt(const string &prompt, int minimum, int maximum) {
    while (true) {
        string text = readLine(prompt);
        stringstream ss(text);
        int value;
        char extra;
        if (ss >> value && !(ss >> extra) && value >= minimum && value <= maximum) {
            return value;
        }
        cout << "Enter a number from " << minimum << " to " << maximum << ".\n";
    }
}

bool isValidDate(const string &date) {
    if (date.size() != 10 || date[4] != '-' || date[7] != '-') {
        return false;
    }
    for (size_t i = 0; i < date.size(); ++i) {
        if (i == 4 || i == 7) {
            continue;
        }
        if (!isdigit(static_cast<unsigned char>(date[i]))) {
            return false;
        }
    }
    int month = safeToInt(date.substr(5, 2), -1);
    int day = safeToInt(date.substr(8, 2), -1);
    return month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

int dateKey(const string &date) {
    if (!isValidDate(date)) {
        return 99999999;
    }
    int year = safeToInt(date.substr(0, 4));
    int month = safeToInt(date.substr(5, 2));
    int day = safeToInt(date.substr(8, 2));
    return year * 10000 + month * 100 + day;
}

string readDate(const string &prompt) {
    while (true) {
        string date = readLine(prompt);
        if (isValidDate(date)) {
            return date;
        }
        cout << "Use date format YYYY-MM-DD.\n";
    }
}

bool askYesNo(const string &prompt) {
    while (true) {
        string answer = toLowerText(readLine(prompt + " (y/n): "));
        if (answer == "y" || answer == "yes") {
            return true;
        }
        if (answer == "n" || answer == "no") {
            return false;
        }
        cout << "Please enter y or n.\n";
    }
}

struct Book {
    string id;
    string title;
    string author;
    string category;
    int totalCopies = 0;
    int availableCopies = 0;
    int issueCount = 0;
    bool active = true;
};

struct Member {
    string id;
    string name;
    string email;
    bool active = true;
};

struct BorrowRecord {
    string bookId;
    string memberId;
    string issueDate;
    string dueDate;
    bool active = true;
};

struct Transaction {
    string type;
    string bookId;
    string memberId;
    string date;
    string note;
};

class AVLTree {
private:
    struct Node {
        Book *book;
        string key;
        int height;
        Node *left;
        Node *right;

        explicit Node(Book *bookPtr)
            : book(bookPtr),
              key(makeKey(bookPtr)),
              height(1),
              left(nullptr),
              right(nullptr) {}
    };

    Node *root = nullptr;

    static string makeKey(const Book *book) {
        return toLowerText(book->title) + "#" + toLowerText(book->id);
    }

    int height(Node *node) const {
        return node == nullptr ? 0 : node->height;
    }

    int balanceFactor(Node *node) const {
        return node == nullptr ? 0 : height(node->left) - height(node->right);
    }

    void updateHeight(Node *node) {
        if (node != nullptr) {
            node->height = 1 + max(height(node->left), height(node->right));
        }
    }

    Node *rotateRight(Node *y) {
        Node *x = y->left;
        Node *t2 = x->right;

        x->right = y;
        y->left = t2;

        updateHeight(y);
        updateHeight(x);
        return x;
    }

    Node *rotateLeft(Node *x) {
        Node *y = x->right;
        Node *t2 = y->left;

        y->left = x;
        x->right = t2;

        updateHeight(x);
        updateHeight(y);
        return y;
    }

    Node *insert(Node *node, Book *book) {
        if (node == nullptr) {
            return new Node(book);
        }

        string key = makeKey(book);
        if (key < node->key) {
            node->left = insert(node->left, book);
        } else if (key > node->key) {
            node->right = insert(node->right, book);
        } else {
            node->book = book;
            return node;
        }

        updateHeight(node);
        int balance = balanceFactor(node);

        if (balance > 1 && key < node->left->key) {
            return rotateRight(node);
        }
        if (balance < -1 && key > node->right->key) {
            return rotateLeft(node);
        }
        if (balance > 1 && key > node->left->key) {
            node->left = rotateLeft(node->left);
            return rotateRight(node);
        }
        if (balance < -1 && key < node->right->key) {
            node->right = rotateRight(node->right);
            return rotateLeft(node);
        }

        return node;
    }

    void inorder(Node *node, vector<Book *> &books) const {
        if (node == nullptr) {
            return;
        }
        inorder(node->left, books);
        books.push_back(node->book);
        inorder(node->right, books);
    }

    void clear(Node *node) {
        if (node == nullptr) {
            return;
        }
        clear(node->left);
        clear(node->right);
        delete node;
    }

public:
    ~AVLTree() {
        clear();
    }

    void insert(Book *book) {
        root = insert(root, book);
    }

    vector<Book *> getBooksInOrder() const {
        vector<Book *> books;
        inorder(root, books);
        return books;
    }

    void clear() {
        clear(root);
        root = nullptr;
    }
};

class Trie {
private:
    struct Node {
        unordered_map<char, Node *> children;
        vector<string> bookIds;
    };

    Node *root;

    static string normalize(const string &text) {
        string result;
        for (char ch : text) {
            result.push_back(static_cast<char>(tolower(static_cast<unsigned char>(ch))));
        }
        return result;
    }

    void clear(Node *node) {
        if (node == nullptr) {
            return;
        }
        for (auto &entry : node->children) {
            clear(entry.second);
        }
        delete node;
    }

public:
    Trie() : root(new Node()) {}

    ~Trie() {
        clear(root);
    }

    void reset() {
        clear(root);
        root = new Node();
    }

    void insert(const string &title, const string &bookId) {
        string key = normalize(title);
        Node *current = root;
        for (char ch : key) {
            if (current->children.find(ch) == current->children.end()) {
                current->children[ch] = new Node();
            }
            current = current->children[ch];
            current->bookIds.push_back(bookId);
        }
    }

    vector<string> searchPrefix(const string &prefix) const {
        string key = normalize(prefix);
        Node *current = root;
        for (char ch : key) {
            auto it = current->children.find(ch);
            if (it == current->children.end()) {
                return {};
            }
            current = it->second;
        }
        return current->bookIds;
    }
};

class LinkedQueue {
private:
    struct Node {
        string value;
        Node *next;

        explicit Node(const string &value) : value(value), next(nullptr) {}
    };

    Node *frontNode = nullptr;
    Node *rearNode = nullptr;
    int count = 0;

public:
    LinkedQueue() = default;

    LinkedQueue(const LinkedQueue &other) {
        for (const string &value : other.toVector()) {
            enqueue(value);
        }
    }

    LinkedQueue &operator=(const LinkedQueue &other) {
        if (this != &other) {
            clear();
            for (const string &value : other.toVector()) {
                enqueue(value);
            }
        }
        return *this;
    }

    LinkedQueue(LinkedQueue &&other) noexcept
        : frontNode(other.frontNode), rearNode(other.rearNode), count(other.count) {
        other.frontNode = nullptr;
        other.rearNode = nullptr;
        other.count = 0;
    }

    LinkedQueue &operator=(LinkedQueue &&other) noexcept {
        if (this != &other) {
            clear();
            frontNode = other.frontNode;
            rearNode = other.rearNode;
            count = other.count;
            other.frontNode = nullptr;
            other.rearNode = nullptr;
            other.count = 0;
        }
        return *this;
    }

    ~LinkedQueue() {
        clear();
    }

    bool empty() const {
        return count == 0;
    }

    int size() const {
        return count;
    }

    bool contains(const string &value) const {
        Node *current = frontNode;
        while (current != nullptr) {
            if (current->value == value) {
                return true;
            }
            current = current->next;
        }
        return false;
    }

    void enqueue(const string &value) {
        Node *node = new Node(value);
        if (rearNode == nullptr) {
            frontNode = rearNode = node;
        } else {
            rearNode->next = node;
            rearNode = node;
        }
        ++count;
    }

    string front() const {
        return frontNode == nullptr ? "" : frontNode->value;
    }

    string dequeue() {
        if (frontNode == nullptr) {
            return "";
        }
        Node *old = frontNode;
        string value = old->value;
        frontNode = frontNode->next;
        if (frontNode == nullptr) {
            rearNode = nullptr;
        }
        delete old;
        --count;
        return value;
    }

    bool remove(const string &value) {
        Node *current = frontNode;
        Node *previous = nullptr;

        while (current != nullptr) {
            if (current->value == value) {
                if (previous == nullptr) {
                    frontNode = current->next;
                } else {
                    previous->next = current->next;
                }
                if (current == rearNode) {
                    rearNode = previous;
                }
                delete current;
                --count;
                return true;
            }
            previous = current;
            current = current->next;
        }
        return false;
    }

    vector<string> toVector() const {
        vector<string> values;
        Node *current = frontNode;
        while (current != nullptr) {
            values.push_back(current->value);
            current = current->next;
        }
        return values;
    }

    void clear() {
        while (!empty()) {
            dequeue();
        }
    }
};

class TransactionStack {
private:
    struct Node {
        Transaction data;
        Node *next;

        explicit Node(const Transaction &transaction)
            : data(transaction), next(nullptr) {}
    };

    Node *topNode = nullptr;
    int count = 0;
    int limit = 30;

public:
    ~TransactionStack() {
        clear();
    }

    void push(const Transaction &transaction) {
        Node *node = new Node(transaction);
        node->next = topNode;
        topNode = node;
        ++count;

        if (count > limit) {
            Node *current = topNode;
            while (current->next != nullptr && current->next->next != nullptr) {
                current = current->next;
            }
            delete current->next;
            current->next = nullptr;
            --count;
        }
    }

    void display(int maxRows = 10) const {
        if (topNode == nullptr) {
            cout << "No recent transactions.\n";
            return;
        }

        cout << left << setw(12) << "Type"
             << setw(10) << "Book"
             << setw(10) << "Member"
             << setw(13) << "Date"
             << "Note\n";
        cout << string(70, '-') << "\n";

        Node *current = topNode;
        int shown = 0;
        while (current != nullptr && shown < maxRows) {
            cout << left << setw(12) << clipText(current->data.type, 11)
                 << setw(10) << clipText(current->data.bookId, 9)
                 << setw(10) << clipText(current->data.memberId, 9)
                 << setw(13) << clipText(current->data.date, 12)
                 << current->data.note << "\n";
            current = current->next;
            ++shown;
        }
    }

    void clear() {
        while (topNode != nullptr) {
            Node *old = topNode;
            topNode = topNode->next;
            delete old;
        }
        count = 0;
    }
};

struct DueEntry {
    int dueKey;
    string dueDate;
    string bookId;
    string memberId;
};

class MinHeap {
private:
    vector<DueEntry> heap;

    bool comesBefore(const DueEntry &a, const DueEntry &b) const {
        if (a.dueKey != b.dueKey) {
            return a.dueKey < b.dueKey;
        }
        if (a.bookId != b.bookId) {
            return a.bookId < b.bookId;
        }
        return a.memberId < b.memberId;
    }

    void heapifyUp(int index) {
        while (index > 0) {
            int parent = (index - 1) / 2;
            if (!comesBefore(heap[index], heap[parent])) {
                break;
            }
            swap(heap[index], heap[parent]);
            index = parent;
        }
    }

    void heapifyDown(int index) {
        int size = static_cast<int>(heap.size());
        while (true) {
            int left = index * 2 + 1;
            int right = index * 2 + 2;
            int smallest = index;

            if (left < size && comesBefore(heap[left], heap[smallest])) {
                smallest = left;
            }
            if (right < size && comesBefore(heap[right], heap[smallest])) {
                smallest = right;
            }
            if (smallest == index) {
                break;
            }
            swap(heap[index], heap[smallest]);
            index = smallest;
        }
    }

public:
    bool empty() const {
        return heap.empty();
    }

    void push(const DueEntry &entry) {
        heap.push_back(entry);
        heapifyUp(static_cast<int>(heap.size()) - 1);
    }

    DueEntry pop() {
        DueEntry top = heap.front();
        heap[0] = heap.back();
        heap.pop_back();
        if (!heap.empty()) {
            heapifyDown(0);
        }
        return top;
    }
};

class Library {
private:
    unordered_map<string, Book> books;
    unordered_map<string, Member> members;
    vector<BorrowRecord> borrowRecords;
    unordered_map<string, LinkedQueue> waitLists;
    AVLTree titleIndex;
    Trie titleTrie;
    TransactionStack transactions;
    string dataDirectory = "data";

    string pathFor(const string &fileName) const {
        return dataDirectory + "/" + fileName;
    }

    void rebuildIndexes() {
        titleIndex.clear();
        titleTrie.reset();
        for (auto &entry : books) {
            Book &book = entry.second;
            if (book.active) {
                titleIndex.insert(&book);
                titleTrie.insert(book.title, book.id);
            }
        }
    }

    Book *findActiveBook(const string &bookId) {
        auto it = books.find(bookId);
        if (it == books.end() || !it->second.active) {
            return nullptr;
        }
        return &it->second;
    }

    Member *findActiveMember(const string &memberId) {
        auto it = members.find(memberId);
        if (it == members.end() || !it->second.active) {
            return nullptr;
        }
        return &it->second;
    }

    int activeBorrowIndex(const string &bookId, const string &memberId) const {
        for (int i = 0; i < static_cast<int>(borrowRecords.size()); ++i) {
            const BorrowRecord &record = borrowRecords[i];
            if (record.active && record.bookId == bookId && record.memberId == memberId) {
                return i;
            }
        }
        return -1;
    }

    int activeBorrowCountForBook(const string &bookId) const {
        int count = 0;
        for (const BorrowRecord &record : borrowRecords) {
            if (record.active && record.bookId == bookId) {
                ++count;
            }
        }
        return count;
    }

    int activeBorrowCountForMember(const string &memberId) const {
        int count = 0;
        for (const BorrowRecord &record : borrowRecords) {
            if (record.active && record.memberId == memberId) {
                ++count;
            }
        }
        return count;
    }

    void printBookHeader() const {
        cout << left << setw(8) << "ID"
             << setw(30) << "Title"
             << setw(24) << "Author"
             << setw(18) << "Category"
             << setw(12) << "Available"
             << "Issues\n";
        cout << string(102, '-') << "\n";
    }

    void printBookRow(const Book &book) const {
        string availability = to_string(book.availableCopies) + "/" + to_string(book.totalCopies);
        cout << left << setw(8) << clipText(book.id, 7)
             << setw(30) << clipText(book.title, 29)
             << setw(24) << clipText(book.author, 23)
             << setw(18) << clipText(book.category, 17)
             << setw(12) << availability
             << book.issueCount << "\n";
    }

    void recordTransaction(const string &type,
                           const string &bookId,
                           const string &memberId,
                           const string &date,
                           const string &note) {
        transactions.push({type, bookId, memberId, date, note});
    }

    void createBorrowing(const string &bookId,
                         const string &memberId,
                         const string &issueDate,
                         const string &dueDate,
                         const string &note) {
        Book *book = findActiveBook(bookId);
        if (book == nullptr) {
            return;
        }

        book->availableCopies--;
        book->issueCount++;
        borrowRecords.push_back({bookId, memberId, issueDate, dueDate, true});
        waitLists[bookId].remove(memberId);
        recordTransaction("ISSUE", bookId, memberId, issueDate, note + ", due " + dueDate);
    }

    void displayBorrowRecordsForMember(const string &memberId) const {
        bool found = false;
        for (const BorrowRecord &record : borrowRecords) {
            if (record.active && record.memberId == memberId) {
                if (!found) {
                    cout << "Active borrowed books:\n";
                    cout << left << setw(10) << "Book"
                         << setw(13) << "Issued"
                         << "Due\n";
                    cout << string(34, '-') << "\n";
                    found = true;
                }
                cout << left << setw(10) << record.bookId
                     << setw(13) << record.issueDate
                     << record.dueDate << "\n";
            }
        }
        if (!found) {
            cout << "No active borrowed books for this member.\n";
        }
    }

public:
    void addBook() {
        cout << "\n--- Add Book ---\n";
        string id = readLine("Book ID: ");
        if (id.empty()) {
            cout << "Book ID cannot be empty.\n";
            return;
        }

        Book *existing = findActiveBook(id);
        if (existing != nullptr) {
            cout << "Book already exists. Add more copies instead.\n";
            int extraCopies = readInt("Extra copies to add: ", 1, 1000);
            existing->totalCopies += extraCopies;
            existing->availableCopies += extraCopies;
            recordTransaction("STOCK", id, "-", "-", "Added " + to_string(extraCopies) + " copies");
            cout << "Copies updated.\n";
            return;
        }

        Book book;
        book.id = id;
        book.title = readLine("Title: ");
        book.author = readLine("Author: ");
        book.category = readLine("Category: ");
        book.totalCopies = readInt("Total copies: ", 1, 1000);
        book.availableCopies = book.totalCopies;
        book.issueCount = 0;
        book.active = true;

        books[id] = book;
        rebuildIndexes();
        recordTransaction("ADD", id, "-", "-", "Book added");
        cout << "Book added successfully.\n";
    }

    void deleteBook() {
        cout << "\n--- Delete Book ---\n";
        string id = readLine("Book ID: ");
        Book *book = findActiveBook(id);
        if (book == nullptr) {
            cout << "Book not found.\n";
            return;
        }

        if (activeBorrowCountForBook(id) > 0) {
            cout << "Cannot delete this book because copies are currently issued.\n";
            return;
        }

        book->active = false;
        waitLists[id].clear();
        rebuildIndexes();
        recordTransaction("DELETE", id, "-", "-", "Book removed");
        cout << "Book deleted from active records.\n";
    }

    void registerMember() {
        cout << "\n--- Register Member ---\n";
        string id = readLine("Member ID: ");
        if (id.empty()) {
            cout << "Member ID cannot be empty.\n";
            return;
        }

        Member *existing = findActiveMember(id);
        if (existing != nullptr) {
            cout << "Member already exists.\n";
            return;
        }

        Member member;
        member.id = id;
        member.name = readLine("Name: ");
        member.email = readLine("Email/phone: ");
        member.active = true;

        members[id] = member;
        recordTransaction("MEMBER", "-", id, "-", "Member registered");
        cout << "Member registered successfully.\n";
    }

    void searchBookById() {
        cout << "\n--- Search Book by ID ---\n";
        string id = readLine("Book ID: ");
        Book *book = findActiveBook(id);
        if (book == nullptr) {
            cout << "Book not found.\n";
            return;
        }

        printBookHeader();
        printBookRow(*book);
    }

    void searchBookByPrefix() {
        cout << "\n--- Search Book by Title Prefix ---\n";
        string prefix = readLine("Title prefix: ");
        if (prefix.empty()) {
            cout << "Prefix cannot be empty.\n";
            return;
        }

        vector<string> ids = titleTrie.searchPrefix(prefix);
        vector<Book *> matches;
        for (const string &id : ids) {
            Book *book = findActiveBook(id);
            if (book != nullptr) {
                matches.push_back(book);
            }
        }

        if (matches.empty()) {
            cout << "No matching books found.\n";
            return;
        }

        sort(matches.begin(), matches.end(), [](Book *a, Book *b) {
            if (toLowerText(a->title) != toLowerText(b->title)) {
                return toLowerText(a->title) < toLowerText(b->title);
            }
            return a->id < b->id;
        });

        printBookHeader();
        for (Book *book : matches) {
            printBookRow(*book);
        }
    }

    void displayBooksSorted() {
        cout << "\n--- Books Sorted by Title using AVL Tree ---\n";
        vector<Book *> sortedBooks = titleIndex.getBooksInOrder();
        if (sortedBooks.empty()) {
            cout << "No books available.\n";
            return;
        }

        printBookHeader();
        for (Book *book : sortedBooks) {
            printBookRow(*book);
        }
    }

    void issueBook() {
        cout << "\n--- Issue Book ---\n";
        string bookId = readLine("Book ID: ");
        string memberId = readLine("Member ID: ");

        Book *book = findActiveBook(bookId);
        if (book == nullptr) {
            cout << "Book not found.\n";
            return;
        }

        Member *member = findActiveMember(memberId);
        if (member == nullptr) {
            cout << "Member not found.\n";
            return;
        }

        if (activeBorrowIndex(bookId, memberId) != -1) {
            cout << "This member has already borrowed this book.\n";
            return;
        }

        if (book->availableCopies <= 0) {
            LinkedQueue &queue = waitLists[bookId];
            if (queue.contains(memberId)) {
                cout << "No copies available. Member is already in the waiting list.\n";
            } else {
                queue.enqueue(memberId);
                recordTransaction("WAIT", bookId, memberId, "-", "Added to waiting list");
                cout << "No copies available. Member added to waiting list at position "
                     << queue.size() << ".\n";
            }
            return;
        }

        string issueDate = readDate("Issue date (YYYY-MM-DD): ");
        string dueDate = readDate("Due date (YYYY-MM-DD): ");
        createBorrowing(bookId, memberId, issueDate, dueDate, "Issued manually");
        cout << "Book issued successfully.\n";
    }

    void returnBook() {
        cout << "\n--- Return Book ---\n";
        string bookId = readLine("Book ID: ");
        string memberId = readLine("Member ID: ");

        Book *book = findActiveBook(bookId);
        if (book == nullptr) {
            cout << "Book not found.\n";
            return;
        }

        int index = activeBorrowIndex(bookId, memberId);
        if (index == -1) {
            cout << "No active issue record found for this book and member.\n";
            return;
        }

        string returnDate = readDate("Return date (YYYY-MM-DD): ");
        borrowRecords[index].active = false;
        book->availableCopies++;
        recordTransaction("RETURN", bookId, memberId, returnDate, "Book returned");
        cout << "Book returned successfully.\n";

        LinkedQueue &queue = waitLists[bookId];
        while (!queue.empty() && findActiveMember(queue.front()) == nullptr) {
            queue.dequeue();
        }

        if (!queue.empty() && book->availableCopies > 0) {
            string nextMember = queue.front();
            cout << "Next waiting member is " << nextMember << ".\n";
            if (askYesNo("Issue this returned copy to the next waiting member now")) {
                string issueDate = readDate("New issue date (YYYY-MM-DD): ");
                string dueDate = readDate("New due date (YYYY-MM-DD): ");
                queue.dequeue();
                createBorrowing(bookId, nextMember, issueDate, dueDate, "Issued from waiting list");
                cout << "Book issued to waiting member.\n";
            }
        }
    }

    void showWaitingList() {
        cout << "\n--- Waiting List ---\n";
        string bookId = readLine("Book ID: ");
        Book *book = findActiveBook(bookId);
        if (book == nullptr) {
            cout << "Book not found.\n";
            return;
        }

        vector<string> values = waitLists[bookId].toVector();
        if (values.empty()) {
            cout << "Waiting list is empty for " << book->title << ".\n";
            return;
        }

        cout << "Waiting list for " << book->title << ":\n";
        for (size_t i = 0; i < values.size(); ++i) {
            cout << i + 1 << ". " << values[i];
            auto it = members.find(values[i]);
            if (it != members.end() && it->second.active) {
                cout << " - " << it->second.name;
            }
            cout << "\n";
        }
    }

    void showDueAndOverdue() {
        cout << "\n--- Due and Overdue Books using Min Heap ---\n";
        string currentDate = readDate("Current date (YYYY-MM-DD): ");
        int currentKey = dateKey(currentDate);

        MinHeap heap;
        for (const BorrowRecord &record : borrowRecords) {
            if (record.active) {
                heap.push({dateKey(record.dueDate), record.dueDate, record.bookId, record.memberId});
            }
        }

        if (heap.empty()) {
            cout << "No active borrowed books.\n";
            return;
        }

        cout << left << setw(10) << "Book"
             << setw(10) << "Member"
             << setw(13) << "Due Date"
             << "Status\n";
        cout << string(48, '-') << "\n";

        while (!heap.empty()) {
            DueEntry entry = heap.pop();
            cout << left << setw(10) << entry.bookId
                 << setw(10) << entry.memberId
                 << setw(13) << entry.dueDate
                 << (entry.dueKey < currentKey ? "OVERDUE" : "Upcoming") << "\n";
        }
    }

    void showRecentTransactions() const {
        cout << "\n--- Recent Transactions using Stack ---\n";
        transactions.display();
    }

    void displayMembers() const {
        cout << "\n--- Members ---\n";
        if (members.empty()) {
            cout << "No members registered.\n";
            return;
        }

        cout << left << setw(10) << "ID"
             << setw(28) << "Name"
             << setw(28) << "Email/Phone"
             << "Borrowed\n";
        cout << string(78, '-') << "\n";

        for (const auto &entry : members) {
            const Member &member = entry.second;
            if (!member.active) {
                continue;
            }
            cout << left << setw(10) << clipText(member.id, 9)
                 << setw(28) << clipText(member.name, 27)
                 << setw(28) << clipText(member.email, 27)
                 << activeBorrowCountForMember(member.id) << "\n";
        }

        string id = readLine("Enter member ID to view borrowed books, or press Enter: ");
        if (!id.empty()) {
            auto it = members.find(id);
            if (it == members.end() || !it->second.active) {
                cout << "Member not found.\n";
            } else {
                displayBorrowRecordsForMember(id);
            }
        }
    }

    void saveData(bool showMessage = true) const {
        ofstream bookFile(pathFor("books.txt"));
        for (const auto &entry : books) {
            const Book &book = entry.second;
            if (book.active) {
                bookFile << book.id << "|"
                         << book.title << "|"
                         << book.author << "|"
                         << book.category << "|"
                         << book.totalCopies << "|"
                         << book.availableCopies << "|"
                         << book.issueCount << "\n";
            }
        }

        ofstream memberFile(pathFor("members.txt"));
        for (const auto &entry : members) {
            const Member &member = entry.second;
            if (member.active) {
                memberFile << member.id << "|"
                           << member.name << "|"
                           << member.email << "\n";
            }
        }

        ofstream borrowFile(pathFor("borrow_records.txt"));
        for (const BorrowRecord &record : borrowRecords) {
            if (record.active) {
                borrowFile << record.bookId << "|"
                           << record.memberId << "|"
                           << record.issueDate << "|"
                           << record.dueDate << "\n";
            }
        }

        ofstream waitFile(pathFor("waitlists.txt"));
        for (const auto &entry : waitLists) {
            vector<string> queue = entry.second.toVector();
            if (queue.empty()) {
                continue;
            }
            waitFile << entry.first << "|";
            for (size_t i = 0; i < queue.size(); ++i) {
                if (i > 0) {
                    waitFile << ",";
                }
                waitFile << queue[i];
            }
            waitFile << "\n";
        }

        if (showMessage) {
            cout << "Data saved in the data folder.\n";
        }
    }

    void loadData(bool showMessage = true) {
        books.clear();
        members.clear();
        borrowRecords.clear();
        waitLists.clear();
        transactions.clear();

        ifstream bookFile(pathFor("books.txt"));
        string line;
        while (getline(bookFile, line)) {
            if (trim(line).empty()) {
                continue;
            }
            vector<string> parts = split(line, '|');
            if (parts.size() < 7) {
                continue;
            }
            Book book;
            book.id = trim(parts[0]);
            book.title = trim(parts[1]);
            book.author = trim(parts[2]);
            book.category = trim(parts[3]);
            book.totalCopies = safeToInt(parts[4]);
            book.availableCopies = safeToInt(parts[5]);
            book.issueCount = safeToInt(parts[6]);
            book.active = true;
            books[book.id] = book;
        }

        ifstream memberFile(pathFor("members.txt"));
        while (getline(memberFile, line)) {
            if (trim(line).empty()) {
                continue;
            }
            vector<string> parts = split(line, '|');
            if (parts.size() < 3) {
                continue;
            }
            Member member;
            member.id = trim(parts[0]);
            member.name = trim(parts[1]);
            member.email = trim(parts[2]);
            member.active = true;
            members[member.id] = member;
        }

        ifstream borrowFile(pathFor("borrow_records.txt"));
        while (getline(borrowFile, line)) {
            if (trim(line).empty()) {
                continue;
            }
            vector<string> parts = split(line, '|');
            if (parts.size() < 4) {
                continue;
            }
            BorrowRecord record;
            record.bookId = trim(parts[0]);
            record.memberId = trim(parts[1]);
            record.issueDate = trim(parts[2]);
            record.dueDate = trim(parts[3]);
            record.active = true;
            if (books.find(record.bookId) != books.end() &&
                members.find(record.memberId) != members.end()) {
                borrowRecords.push_back(record);
            }
        }

        ifstream waitFile(pathFor("waitlists.txt"));
        while (getline(waitFile, line)) {
            if (trim(line).empty()) {
                continue;
            }
            vector<string> parts = split(line, '|');
            if (parts.size() < 2) {
                continue;
            }
            string bookId = trim(parts[0]);
            vector<string> queuedMembers = split(parts[1], ',');
            for (const string &memberId : queuedMembers) {
                string cleaned = trim(memberId);
                if (!cleaned.empty() && members.find(cleaned) != members.end()) {
                    waitLists[bookId].enqueue(cleaned);
                }
            }
        }

        rebuildIndexes();
        if (showMessage) {
            cout << "Loaded " << books.size() << " books, "
                 << members.size() << " members, and "
                 << borrowRecords.size() << " active borrow records.\n";
        }
    }

    void run() {
        while (true) {
            cout << "\n";
            cout << "========== Smart Library Management System ==========\n";
            cout << "1. Add book\n";
            cout << "2. Delete book\n";
            cout << "3. Register member\n";
            cout << "4. Search book by ID\n";
            cout << "5. Search books by title prefix\n";
            cout << "6. Display books sorted by title\n";
            cout << "7. Issue book\n";
            cout << "8. Return book\n";
            cout << "9. Show waiting list\n";
            cout << "10. Show due and overdue books\n";
            cout << "11. Show recent transactions\n";
            cout << "12. Save data\n";
            cout << "13. Load data\n";
            cout << "14. Display members\n";
            cout << "0. Exit\n";

            int choice = readInt("Choose an option: ", 0, 14);
            switch (choice) {
                case 1:
                    addBook();
                    break;
                case 2:
                    deleteBook();
                    break;
                case 3:
                    registerMember();
                    break;
                case 4:
                    searchBookById();
                    break;
                case 5:
                    searchBookByPrefix();
                    break;
                case 6:
                    displayBooksSorted();
                    break;
                case 7:
                    issueBook();
                    break;
                case 8:
                    returnBook();
                    break;
                case 9:
                    showWaitingList();
                    break;
                case 10:
                    showDueAndOverdue();
                    break;
                case 11:
                    showRecentTransactions();
                    break;
                case 12:
                    saveData();
                    break;
                case 13:
                    loadData();
                    break;
                case 14:
                    displayMembers();
                    break;
                case 0:
                    if (askYesNo("Save before exit")) {
                        saveData();
                    }
                    cout << "Goodbye.\n";
                    return;
            }
        }
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    Library library;
   library.loadData(true);
    library.run();
    return 0;
}
