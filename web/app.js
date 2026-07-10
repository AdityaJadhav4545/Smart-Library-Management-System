const STORAGE_KEY = "smartLibraryWebStateV1";
const AUTH_KEY = "smartLibraryActiveUserV1";

const demoUsers = [
    { username: "admin", password: "admin123", name: "System Admin", role: "admin" },
    { username: "librarian", password: "lib123", name: "Library Staff", role: "librarian" },
    { username: "aarav", password: "member123", name: "Aarav Sharma", role: "member", memberId: "M001" }
];

const roleAccess = {
    admin: {
        tabs: ["dashboard", "books", "members", "circulation", "due", "activity", "dsa"],
        permissions: ["addBook", "deleteBook", "registerMember", "issueBook", "returnBook", "saveData", "resetData", "viewMembers", "viewActivity", "viewAllDue"]
    },
    librarian: {
        tabs: ["dashboard", "books", "members", "circulation", "due", "activity", "dsa"],
        permissions: ["addBook", "registerMember", "issueBook", "returnBook", "saveData", "viewMembers", "viewActivity", "viewAllDue"]
    },
    member: {
        tabs: ["dashboard", "books", "due", "dsa"],
        permissions: ["viewOwnDue"]
    }
};

const demoState = {
    books: [
        { id: "B001", title: "The C++ Programming Language", author: "Bjarne Stroustrup", category: "Programming", totalCopies: 4, availableCopies: 3, issueCount: 5 },
        { id: "B002", title: "Introduction to Algorithms", author: "Cormen Leiserson Rivest Stein", category: "DSA", totalCopies: 3, availableCopies: 2, issueCount: 7 },
        { id: "B003", title: "Clean Code", author: "Robert C Martin", category: "Software Engineering", totalCopies: 2, availableCopies: 2, issueCount: 4 },
        { id: "B004", title: "Data Structures Using C++", author: "D S Malik", category: "DSA", totalCopies: 5, availableCopies: 5, issueCount: 2 },
        { id: "B005", title: "Database System Concepts", author: "Silberschatz Korth Sudarshan", category: "Database", totalCopies: 2, availableCopies: 1, issueCount: 3 },
        { id: "B006", title: "Operating System Concepts", author: "Silberschatz Galvin Gagne", category: "Operating Systems", totalCopies: 1, availableCopies: 0, issueCount: 6 }
    ],
    members: [
        { id: "M001", name: "Aarav Sharma", contact: "aarav@example.com" },
        { id: "M002", name: "Diya Patel", contact: "diya@example.com" },
        { id: "M003", name: "Kabir Verma", contact: "kabir@example.com" },
        { id: "M004", name: "Ananya Rao", contact: "ananya@example.com" }
    ],
    borrowRecords: [
        { bookId: "B001", memberId: "M001", issueDate: "2026-06-25", dueDate: "2026-07-05", active: true },
        { bookId: "B002", memberId: "M003", issueDate: "2026-06-26", dueDate: "2026-07-06", active: true },
        { bookId: "B005", memberId: "M002", issueDate: "2026-06-20", dueDate: "2026-07-02", active: true },
        { bookId: "B006", memberId: "M004", issueDate: "2026-06-15", dueDate: "2026-06-30", active: true }
    ],
    waitlists: {
        B006: ["M002"]
    },
    transactions: [
        { type: "LOAD", bookId: "-", memberId: "-", date: "2026-07-01", note: "Demo data loaded" }
    ]
};

class AVLNode {
    constructor(book) {
        this.book = book;
        this.key = AVLTree.makeKey(book);
        this.height = 1;
        this.left = null;
        this.right = null;
    }
}

class AVLTree {
    constructor() {
        this.root = null;
    }

    static makeKey(book) {
        return `${book.title.toLowerCase()}#${book.id.toLowerCase()}`;
    }

    height(node) {
        return node ? node.height : 0;
    }

    update(node) {
        node.height = Math.max(this.height(node.left), this.height(node.right)) + 1;
    }

    balance(node) {
        return node ? this.height(node.left) - this.height(node.right) : 0;
    }

    rotateRight(y) {
        const x = y.left;
        const t2 = x.right;
        x.right = y;
        y.left = t2;
        this.update(y);
        this.update(x);
        return x;
    }

    rotateLeft(x) {
        const y = x.right;
        const t2 = y.left;
        y.left = x;
        x.right = t2;
        this.update(x);
        this.update(y);
        return y;
    }

    insert(book) {
        this.root = this.insertNode(this.root, book);
    }

    insertNode(node, book) {
        if (!node) {
            return new AVLNode(book);
        }

        const key = AVLTree.makeKey(book);
        if (key < node.key) {
            node.left = this.insertNode(node.left, book);
        } else if (key > node.key) {
            node.right = this.insertNode(node.right, book);
        } else {
            node.book = book;
            return node;
        }

        this.update(node);
        const balance = this.balance(node);

        if (balance > 1 && key < node.left.key) {
            return this.rotateRight(node);
        }
        if (balance < -1 && key > node.right.key) {
            return this.rotateLeft(node);
        }
        if (balance > 1 && key > node.left.key) {
            node.left = this.rotateLeft(node.left);
            return this.rotateRight(node);
        }
        if (balance < -1 && key < node.right.key) {
            node.right = this.rotateRight(node.right);
            return this.rotateLeft(node);
        }
        return node;
    }

    inOrder() {
        const result = [];
        const walk = (node) => {
            if (!node) {
                return;
            }
            walk(node.left);
            result.push(node.book);
            walk(node.right);
        };
        walk(this.root);
        return result;
    }
}

class TrieNode {
    constructor() {
        this.children = new Map();
        this.bookIds = [];
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(title, bookId) {
        let current = this.root;
        for (const char of title.toLowerCase()) {
            if (!current.children.has(char)) {
                current.children.set(char, new TrieNode());
            }
            current = current.children.get(char);
            current.bookIds.push(bookId);
        }
    }

    searchPrefix(prefix) {
        let current = this.root;
        for (const char of prefix.toLowerCase()) {
            if (!current.children.has(char)) {
                return [];
            }
            current = current.children.get(char);
        }
        return [...new Set(current.bookIds)];
    }
}

class QueueNode {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class LinkedQueue {
    constructor(values = []) {
        this.frontNode = null;
        this.rearNode = null;
        this.count = 0;
        values.forEach((value) => this.enqueue(value));
    }

    enqueue(value) {
        const node = new QueueNode(value);
        if (!this.rearNode) {
            this.frontNode = node;
            this.rearNode = node;
        } else {
            this.rearNode.next = node;
            this.rearNode = node;
        }
        this.count += 1;
    }

    dequeue() {
        if (!this.frontNode) {
            return "";
        }
        const value = this.frontNode.value;
        this.frontNode = this.frontNode.next;
        if (!this.frontNode) {
            this.rearNode = null;
        }
        this.count -= 1;
        return value;
    }

    front() {
        return this.frontNode ? this.frontNode.value : "";
    }

    contains(value) {
        return this.toArray().includes(value);
    }

    remove(value) {
        const values = this.toArray().filter((item) => item !== value);
        this.frontNode = null;
        this.rearNode = null;
        this.count = 0;
        values.forEach((item) => this.enqueue(item));
    }

    toArray() {
        const values = [];
        let current = this.frontNode;
        while (current) {
            values.push(current.value);
            current = current.next;
        }
        return values;
    }
}

class StackNode {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class TransactionStack {
    constructor(values = []) {
        this.topNode = null;
        values.forEach((value) => this.push(value));
    }

    push(value) {
        const node = new StackNode(value);
        node.next = this.topNode;
        this.topNode = node;
    }

    toArray(limit = 20) {
        const values = [];
        let current = this.topNode;
        while (current && values.length < limit) {
            values.push(current.value);
            current = current.next;
        }
        return values;
    }
}

class MinHeap {
    constructor() {
        this.heap = [];
    }

    before(a, b) {
        if (a.dueDate !== b.dueDate) {
            return a.dueDate < b.dueDate;
        }
        return `${a.bookId}${a.memberId}` < `${b.bookId}${b.memberId}`;
    }

    push(value) {
        this.heap.push(value);
        this.up(this.heap.length - 1);
    }

    pop() {
        if (this.heap.length === 0) {
            return null;
        }
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.down(0);
        }
        return top;
    }

    up(index) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (!this.before(this.heap[index], this.heap[parent])) {
                break;
            }
            [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
            index = parent;
        }
    }

    down(index) {
        while (true) {
            const left = index * 2 + 1;
            const right = index * 2 + 2;
            let smallest = index;

            if (left < this.heap.length && this.before(this.heap[left], this.heap[smallest])) {
                smallest = left;
            }
            if (right < this.heap.length && this.before(this.heap[right], this.heap[smallest])) {
                smallest = right;
            }
            if (smallest === index) {
                break;
            }
            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }

    toSortedArray() {
        const result = [];
        while (this.heap.length) {
            result.push(this.pop());
        }
        return result;
    }
}

let currentUser = loadSessionUser();
let state = loadState();
let indexes = buildIndexes();

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        return clone(demoState);
    }
    try {
        return JSON.parse(saved);
    } catch {
        return clone(demoState);
    }
}

function loadSessionUser() {
    const saved = localStorage.getItem(AUTH_KEY);
    if (!saved) {
        return null;
    }
    try {
        const user = JSON.parse(saved);
        return demoUsers.some((demoUser) => demoUser.username === user.username && demoUser.role === user.role)
            ? user
            : null;
    } catch {
        return null;
    }
}

function saveSessionUser(user) {
    currentUser = user;
    if (user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(AUTH_KEY);
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function roleLabel(role) {
    const labels = {
        admin: "Admin",
        librarian: "Librarian",
        member: "Member"
    };
    return labels[role] || "Guest";
}

function can(permission) {
    if (!currentUser) {
        return false;
    }
    return roleAccess[currentUser.role]?.permissions.includes(permission) || false;
}

function canAccessTab(tabName) {
    if (!currentUser) {
        return false;
    }
    return roleAccess[currentUser.role]?.tabs.includes(tabName) || false;
}

function visibleActiveRecords() {
    const records = activeRecords();
    if (currentUser?.role === "member") {
        return records.filter((record) => record.memberId === currentUser.memberId);
    }
    return records;
}

function buildIndexes() {
    const bookMap = new Map();
    const memberMap = new Map();
    const avl = new AVLTree();
    const trie = new Trie();

    state.books.forEach((book) => {
        bookMap.set(book.id.toLowerCase(), book);
        avl.insert(book);
        trie.insert(book.title, book.id);
    });

    state.members.forEach((member) => {
        memberMap.set(member.id.toLowerCase(), member);
    });

    return { bookMap, memberMap, avl, trie };
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

function setStatus(message) {
    document.getElementById("statusText").textContent = message;
}

function showLogin(message = "") {
    document.getElementById("loginScreen").classList.remove("is-hidden");
    document.getElementById("appShell").classList.add("is-hidden");
    document.getElementById("loginError").textContent = message;
}

function showApp() {
    document.getElementById("loginScreen").classList.add("is-hidden");
    document.getElementById("appShell").classList.remove("is-hidden");
    renderAuthUI();
    render();
    switchTab(canAccessTab("dashboard") ? "dashboard" : roleAccess[currentUser.role].tabs[0]);
    setStatus(`Logged in as ${roleLabel(currentUser.role)}.`);
}

function renderAuthUI() {
    if (!currentUser) {
        return;
    }

    document.getElementById("currentUserName").textContent = currentUser.name;
    document.getElementById("currentUserRole").textContent = roleLabel(currentUser.role);

    document.querySelectorAll("[data-roles]").forEach((element) => {
        const roles = element.dataset.roles.split(",");
        element.classList.toggle("is-hidden", !roles.includes(currentUser.role));
    });

    document.querySelectorAll("[data-permission]").forEach((element) => {
        element.classList.toggle("is-hidden", !can(element.dataset.permission));
    });
}

function transaction(type, bookId, memberId, note, date = today()) {
    state.transactions.unshift({ type, bookId, memberId, date, note });
    state.transactions = state.transactions.slice(0, 40);
}

function activeRecords() {
    return state.borrowRecords.filter((record) => record.active);
}

function activeRecordsForBook(bookId) {
    return activeRecords()
        .filter((record) => record.bookId === bookId)
        .sort((a, b) => {
            if (a.issueDate !== b.issueDate) {
                return a.issueDate.localeCompare(b.issueDate);
            }
            return a.memberId.localeCompare(b.memberId);
        });
}

function borrowedCount(memberId) {
    return activeRecords().filter((record) => record.memberId === memberId).length;
}

function waitCount() {
    return Object.values(state.waitlists).reduce((sum, queue) => sum + queue.length, 0);
}

function getBook(id) {
    return indexes.bookMap.get(String(id).toLowerCase());
}

function getMember(id) {
    return indexes.memberMap.get(String(id).toLowerCase());
}

function render() {
    renderAuthUI();
    indexes = buildIndexes();
    renderMetrics();
    renderBooks();
    renderMembers();
    renderSelects();
    renderBorrowRecords();
    renderWaitlists();
    renderDue();
    renderActivity();
}

function renderMetrics() {
    const issuedRecords = currentUser?.role === "member" ? visibleActiveRecords() : activeRecords();
    const waitingTotal = currentUser?.role === "member"
        ? Object.values(state.waitlists).filter((queue) => queue.includes(currentUser.memberId)).length
        : waitCount();

    document.getElementById("metricBooks").textContent = state.books.length;
    document.getElementById("metricMembers").textContent = currentUser?.role === "member" ? "1" : state.members.length;
    document.getElementById("metricIssued").textContent = issuedRecords.length;
    document.getElementById("metricWaiting").textContent = waitingTotal;
}

function statusBadge(book) {
    if (book.availableCopies > 0) {
        return `<span class="badge green">${book.availableCopies}/${book.totalCopies} available</span>`;
    }
    return `<span class="badge red">0/${book.totalCopies} available</span>`;
}

function memberLabel(memberId) {
    const member = getMember(memberId);
    return member ? `${member.name} (${member.id})` : memberId;
}

function queueInfoForBook(book) {
    const waiting = state.waitlists[book.id] || [];
    const issued = activeRecordsForBook(book.id);

    if (book.availableCopies > 0) {
        return `<span class="muted-text">Available now</span>`;
    }

    if (currentUser?.role === "member") {
        return `<span class="badge yellow">${waiting.length} waiting</span>`;
    }

    const issuedRows = issued.length
        ? issued.map((record, index) => `
            <span>${index + 1}. ${escapeHtml(memberLabel(record.memberId))} issued ${escapeHtml(record.issueDate)}, due ${escapeHtml(record.dueDate)}</span>
        `).join("")
        : `<span>No active issued copies</span>`;

    const waitingRows = waiting.length
        ? waiting.map((memberId, index) => `<span>${index + 1}. ${escapeHtml(memberLabel(memberId))}</span>`).join("")
        : `<span>No one waiting</span>`;

    return `
        <div class="queue-cell">
            <strong>Issued order</strong>
            ${issuedRows}
            <strong>Waiting queue</strong>
            ${waitingRows}
        </div>
    `;
}

function renderBooks() {
    const tbody = document.getElementById("booksTable");
    const query = document.getElementById("bookSearch").value.trim();
    const mode = document.getElementById("bookSearchMode").value;
    let books = indexes.avl.inOrder();

    if (query && mode === "prefix") {
        const ids = indexes.trie.searchPrefix(query);
        books = ids.map((id) => getBook(id)).filter(Boolean);
        books.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (query && mode === "id") {
        const book = getBook(query);
        books = book ? [book] : [];
    }

    document.getElementById("bookResultCount").textContent = `${books.length} books`;

    if (!books.length) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty">No books found.</td></tr>`;
        return;
    }

    tbody.innerHTML = books.map((book) => `
        <tr>
            <td>${escapeHtml(book.id)}</td>
            <td>${escapeHtml(book.title)}</td>
            <td>${escapeHtml(book.author)}</td>
            <td>${escapeHtml(book.category)}</td>
            <td>${statusBadge(book)}</td>
            <td>${queueInfoForBook(book)}</td>
            <td>${book.issueCount}</td>
            <td>${can("deleteBook") ? `<button class="button small danger" data-delete-book="${escapeHtml(book.id)}" type="button">Delete</button>` : "-"}</td>
        </tr>
    `).join("");
}

function renderMembers() {
    const tbody = document.getElementById("membersTable");
    if (!can("viewMembers")) {
        document.getElementById("memberResultCount").textContent = "0 members";
        tbody.innerHTML = `<tr><td colspan="4" class="empty">Your role cannot view member records.</td></tr>`;
        return;
    }

    const query = document.getElementById("memberSearch").value.trim().toLowerCase();
    let members = [...state.members].sort((a, b) => a.name.localeCompare(b.name));

    if (query) {
        members = members.filter((member) =>
            member.id.toLowerCase().includes(query) ||
            member.name.toLowerCase().includes(query)
        );
    }

    document.getElementById("memberResultCount").textContent = `${members.length} members`;

    if (!members.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty">No members found.</td></tr>`;
        return;
    }

    tbody.innerHTML = members.map((member) => `
        <tr>
            <td>${escapeHtml(member.id)}</td>
            <td>${escapeHtml(member.name)}</td>
            <td>${escapeHtml(member.contact)}</td>
            <td>${borrowedCount(member.id)}</td>
        </tr>
    `).join("");
}

function renderSelects() {
    const issueBook = document.getElementById("issueBook");
    const issueMember = document.getElementById("issueMember");
    const returnRecord = document.getElementById("returnRecord");

    issueBook.innerHTML = indexes.avl.inOrder().map((book) =>
        `<option value="${escapeHtml(book.id)}">${escapeHtml(book.id)} - ${escapeHtml(book.title)} (${book.availableCopies}/${book.totalCopies})</option>`
    ).join("");

    issueMember.innerHTML = [...state.members]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((member) => `<option value="${escapeHtml(member.id)}">${escapeHtml(member.id)} - ${escapeHtml(member.name)}</option>`)
        .join("");

    const records = activeRecords();
    returnRecord.innerHTML = records.length
        ? records.map((record, index) => {
            const book = getBook(record.bookId);
            const member = getMember(record.memberId);
            return `<option value="${index}">${escapeHtml(record.bookId)} - ${escapeHtml(book?.title || "Unknown")} to ${escapeHtml(member?.name || record.memberId)}</option>`;
        }).join("")
        : `<option value="">No active records</option>`;
}

function renderBorrowRecords() {
    const tbody = document.getElementById("borrowTable");
    const records = visibleActiveRecords();

    if (!records.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty">No books are currently issued.</td></tr>`;
        return;
    }

    const current = document.getElementById("currentDate").value || today();
    tbody.innerHTML = records.map((record) => {
        const book = getBook(record.bookId);
        const member = getMember(record.memberId);
        const overdue = record.dueDate < current;
        return `
            <tr>
                <td>${escapeHtml(book?.title || record.bookId)}</td>
                <td>${escapeHtml(member?.name || record.memberId)}</td>
                <td>${record.issueDate}</td>
                <td>${record.dueDate}</td>
                <td><span class="badge ${overdue ? "red" : "green"}">${overdue ? "Overdue" : "Active"}</span></td>
            </tr>
        `;
    }).join("");
}

function renderWaitlists() {
    const container = document.getElementById("waitListView");
    if (currentUser?.role === "member") {
        container.innerHTML = `<div class="empty">Members can view queue counts in the Books section.</div>`;
        return;
    }

    const entries = state.books.filter((book) =>
        book.availableCopies === 0 || (state.waitlists[book.id] || []).length > 0
    );

    if (!entries.length) {
        container.innerHTML = `<div class="empty">No out-of-stock books or waiting members right now.</div>`;
        return;
    }

    container.innerHTML = entries.map((book) => {
        const values = state.waitlists[book.id] || [];
        const queue = new LinkedQueue(values);
        const issued = activeRecordsForBook(book.id);
        const issuedRows = issued.length
            ? issued.map((record, index) => `
                <span>${index + 1}. ${escapeHtml(memberLabel(record.memberId))} issued ${escapeHtml(record.issueDate)}, due ${escapeHtml(record.dueDate)}</span>
            `).join("")
            : `<span>No active issued copies</span>`;
        const waitingRows = queue.toArray().length
            ? queue.toArray().map((memberId, index) => `<span>${index + 1}. ${escapeHtml(memberLabel(memberId))}</span>`).join("")
            : `<span>No one waiting</span>`;

        return `
            <div class="wait-row">
                <div>
                    <strong>${escapeHtml(book.title)}</strong>
                    <span>${escapeHtml(book.id)}</span>
                    <span class="badge ${book.availableCopies === 0 ? "red" : "yellow"}">${book.availableCopies}/${book.totalCopies} available</span>
                </div>
                <div class="queue-cell">
                    <strong>Issued order</strong>
                    ${issuedRows}
                </div>
                <div class="queue-cell">
                    <strong>Waiting queue</strong>
                    ${waitingRows}
                </div>
            </div>
        `;
    }).join("");
}

function renderDue() {
    const tbody = document.getElementById("dueTable");
    const current = document.getElementById("currentDate").value || today();
    const heap = new MinHeap();

    visibleActiveRecords().forEach((record) => heap.push(record));
    const records = heap.toSortedArray();

    if (!records.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty">No active due records.</td></tr>`;
        return;
    }

    tbody.innerHTML = records.map((record) => {
        const book = getBook(record.bookId);
        const member = getMember(record.memberId);
        const overdue = record.dueDate < current;
        const badgeClass = overdue ? "red" : record.dueDate === current ? "yellow" : "green";
        const label = overdue ? "Overdue" : record.dueDate === current ? "Due today" : "Upcoming";
        return `
            <tr>
                <td>${escapeHtml(book?.title || record.bookId)}</td>
                <td>${escapeHtml(member?.name || record.memberId)}</td>
                <td>${record.dueDate}</td>
                <td><span class="badge ${badgeClass}">${label}</span></td>
            </tr>
        `;
    }).join("");
}

function renderActivity() {
    const tbody = document.getElementById("activityTable");
    if (!can("viewActivity")) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty">Your role cannot view staff activity.</td></tr>`;
        return;
    }

    const stack = new TransactionStack([...state.transactions].reverse());
    const rows = stack.toArray(20);

    if (!rows.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty">No transactions yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = rows.map((entry) => `
        <tr>
            <td>${escapeHtml(entry.type)}</td>
            <td>${escapeHtml(entry.bookId)}</td>
            <td>${escapeHtml(entry.memberId)}</td>
            <td>${escapeHtml(entry.date)}</td>
            <td>${escapeHtml(entry.note)}</td>
        </tr>
    `).join("");
}

function issueBook(event) {
    event.preventDefault();
    if (!can("issueBook")) {
        setStatus("Your role cannot issue books.");
        return;
    }

    const bookId = document.getElementById("issueBook").value;
    const memberId = document.getElementById("issueMember").value;
    const issueDate = document.getElementById("issueDate").value;
    const dueDate = document.getElementById("dueDate").value;
    const book = getBook(bookId);

    if (!book) {
        setStatus("Book not found.");
        return;
    }

    const alreadyBorrowed = activeRecords().some((record) =>
        record.bookId === bookId && record.memberId === memberId
    );

    if (alreadyBorrowed) {
        setStatus("This member already has this book.");
        return;
    }

    if (book.availableCopies <= 0) {
        const queue = new LinkedQueue(state.waitlists[bookId] || []);
        if (!queue.contains(memberId)) {
            queue.enqueue(memberId);
            state.waitlists[bookId] = queue.toArray();
            transaction("WAIT", bookId, memberId, "Added to waiting list", issueDate);
        }
        saveState();
        render();
        setStatus("No copy available. Member added to waiting list.");
        return;
    }

    book.availableCopies -= 1;
    book.issueCount += 1;
    state.borrowRecords.push({ bookId, memberId, issueDate, dueDate, active: true });
    transaction("ISSUE", bookId, memberId, `Due on ${dueDate}`, issueDate);
    saveState();
    render();
    setStatus("Book issued successfully.");
}

function returnBook(event) {
    event.preventDefault();
    if (!can("returnBook")) {
        setStatus("Your role cannot return books.");
        return;
    }

    const active = activeRecords();
    const selected = Number(document.getElementById("returnRecord").value);
    const returnDate = document.getElementById("returnDate").value;
    const record = active[selected];

    if (!record) {
        setStatus("No active record selected.");
        return;
    }

    const realRecord = state.borrowRecords.find((item) =>
        item.active &&
        item.bookId === record.bookId &&
        item.memberId === record.memberId &&
        item.issueDate === record.issueDate &&
        item.dueDate === record.dueDate
    );
    const book = getBook(record.bookId);

    if (!realRecord || !book) {
        setStatus("Return record could not be found.");
        return;
    }

    realRecord.active = false;
    book.availableCopies += 1;
    transaction("RETURN", record.bookId, record.memberId, "Book returned", returnDate);

    const queue = new LinkedQueue(state.waitlists[record.bookId] || []);
    if (queue.front() && book.availableCopies > 0) {
        const nextMember = queue.dequeue();
        state.waitlists[record.bookId] = queue.toArray();
        book.availableCopies -= 1;
        book.issueCount += 1;
        state.borrowRecords.push({
            bookId: record.bookId,
            memberId: nextMember,
            issueDate: returnDate,
            dueDate: addDays(returnDate, 7),
            active: true
        });
        transaction("ISSUE", record.bookId, nextMember, "Auto-issued from waiting list", returnDate);
        setStatus("Book returned and issued to next waiting member.");
    } else {
        setStatus("Book returned successfully.");
    }

    saveState();
    render();
}

function addDays(dateText, days) {
    const date = new Date(`${dateText}T00:00:00`);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function switchTab(tabName) {
    if (currentUser && !canAccessTab(tabName)) {
        setStatus("Your role cannot open that section.");
        tabName = "dashboard";
    }

    document.querySelectorAll(".tab-button").forEach((button) => {
        button.classList.toggle("active", button.dataset.tab === tabName);
    });
    document.querySelectorAll(".view").forEach((view) => {
        view.classList.toggle("active", view.id === tabName);
    });
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    document.getElementById("pageTitle").textContent = activeButton ? activeButton.textContent : "Dashboard";
}

function bindEvents() {
    document.getElementById("loginForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const username = document.getElementById("loginUsername").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;
        const user = demoUsers.find((entry) => entry.username === username && entry.password === password);

        if (!user) {
            showLogin("Invalid username or password.");
            return;
        }

        const { password: _password, ...safeUser } = user;
        saveSessionUser(safeUser);
        event.target.reset();
        showApp();
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
        saveSessionUser(null);
        switchTab("dashboard");
        showLogin("Logged out.");
    });

    document.querySelectorAll(".tab-button").forEach((button) => {
        button.addEventListener("click", () => switchTab(button.dataset.tab));
    });

    document.querySelectorAll("[data-jump]").forEach((button) => {
        button.addEventListener("click", () => switchTab(button.dataset.jump));
    });

    document.getElementById("bookForm").addEventListener("submit", (event) => {
        event.preventDefault();
        if (!can("addBook")) {
            setStatus("Your role cannot add books.");
            return;
        }

        const id = document.getElementById("bookId").value.trim();
        if (getBook(id)) {
            setStatus("Book ID already exists.");
            return;
        }
        const copies = Number(document.getElementById("bookCopies").value);
        state.books.push({
            id,
            title: document.getElementById("bookTitle").value.trim(),
            author: document.getElementById("bookAuthor").value.trim(),
            category: document.getElementById("bookCategory").value.trim(),
            totalCopies: copies,
            availableCopies: copies,
            issueCount: 0
        });
        transaction("ADD", id, "-", "Book added");
        event.target.reset();
        document.getElementById("bookCopies").value = 1;
        saveState();
        render();
        setStatus("Book added.");
    });

    document.getElementById("memberForm").addEventListener("submit", (event) => {
        event.preventDefault();
        if (!can("registerMember")) {
            setStatus("Your role cannot register members.");
            return;
        }

        const id = document.getElementById("memberId").value.trim();
        if (getMember(id)) {
            setStatus("Member ID already exists.");
            return;
        }
        state.members.push({
            id,
            name: document.getElementById("memberName").value.trim(),
            contact: document.getElementById("memberContact").value.trim()
        });
        transaction("MEMBER", "-", id, "Member registered");
        event.target.reset();
        saveState();
        render();
        setStatus("Member registered.");
    });

    document.getElementById("issueForm").addEventListener("submit", issueBook);
    document.getElementById("returnForm").addEventListener("submit", returnBook);
    document.getElementById("bookSearch").addEventListener("input", renderBooks);
    document.getElementById("bookSearchMode").addEventListener("change", renderBooks);
    document.getElementById("memberSearch").addEventListener("input", renderMembers);
    document.getElementById("refreshDueBtn").addEventListener("click", () => {
        renderDue();
        renderBorrowRecords();
        setStatus("Due list refreshed.");
    });

    document.getElementById("clearBookSearch").addEventListener("click", () => {
        document.getElementById("bookSearch").value = "";
        renderBooks();
    });

    document.getElementById("booksTable").addEventListener("click", (event) => {
        const button = event.target.closest("[data-delete-book]");
        if (!button) {
            return;
        }
        if (!can("deleteBook")) {
            setStatus("Your role cannot delete books.");
            return;
        }

        const bookId = button.dataset.deleteBook;
        const hasActive = activeRecords().some((record) => record.bookId === bookId);
        if (hasActive) {
            setStatus("Cannot delete a book that is currently issued.");
            return;
        }
        state.books = state.books.filter((book) => book.id !== bookId);
        delete state.waitlists[bookId];
        transaction("DELETE", bookId, "-", "Book deleted");
        saveState();
        render();
        setStatus("Book deleted.");
    });

    document.getElementById("saveDataBtn").addEventListener("click", () => {
        if (!can("saveData")) {
            setStatus("Your role cannot save library data.");
            return;
        }

        saveState();
        setStatus("Website data saved in this browser.");
    });

    document.getElementById("resetDataBtn").addEventListener("click", () => {
        if (!can("resetData")) {
            setStatus("Your role cannot reset demo data.");
            return;
        }

        if (!confirm("Reset website data to demo records?")) {
            return;
        }
        state = clone(demoState);
        saveState();
        render();
        setStatus("Demo data restored.");
    });
}

document.getElementById("issueDate").value = today();
document.getElementById("returnDate").value = today();
document.getElementById("currentDate").value = today();
document.getElementById("dueDate").value = addDays(today(), 7);

bindEvents();
if (currentUser) {
    showApp();
} else {
    showLogin();
}
saveState();
