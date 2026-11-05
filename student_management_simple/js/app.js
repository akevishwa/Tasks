const STORAGE_KEY = "simpleStudentManagementData";

let students = [];
let attendance = [];
let tasks = [];
let activities = [];

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      students = saved.students || [];
      attendance = saved.attendance || [];
      tasks = saved.tasks || [];
      activities = saved.activities || [];
    }
  } catch (error) {
    alert("Saved data could not be read. Starting with empty data.");
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ students, attendance, tasks, activities }));
  renderAll();
}

function showPage(pageName) {
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(button => button.classList.remove("active"));
  document.getElementById(pageName).classList.add("active");
  document.querySelector(`[data-page="${pageName}"]`).classList.add("active");
}

document.querySelectorAll(".nav-btn").forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

function studentName(id) {
  const student = students.find(item => item.id === id);
  return student ? student.name : "Unknown student";
}

function renderStudents() {
  const search = document.getElementById("studentSearch").value.toLowerCase().trim();
  const filtered = students.filter(student =>
    student.id.toLowerCase().includes(search) || student.name.toLowerCase().includes(search)
  );
  const tbody = document.getElementById("studentsTable");
  tbody.innerHTML = filtered.length ? filtered.map(student => `
    <tr>
      <td>${escapeText(student.id)}</td><td>${escapeText(student.name)}</td>
      <td>${escapeText(student.phone)}</td><td>${escapeText(student.course)}</td>
      <td>${escapeText(student.batch)}</td><td><span class="status">${student.status}</span></td>
      <td><button class="small-btn" data-edit-student="${student.id}">Edit</button>
      <button class="small-btn delete" data-delete-student="${student.id}">Delete</button></td>
    </tr>`).join("") : `<tr><td colspan="7" class="empty">No students found.</td></tr>`;

  document.getElementById("recentStudents").innerHTML = students.slice(-5).map(student =>
    `<tr><td>${escapeText(student.id)}</td><td>${escapeText(student.name)}</td><td>${escapeText(student.course)}</td><td>${student.status}</td></tr>`
  ).join("") || `<tr><td colspan="4" class="empty">No students added yet.</td></tr>`;

  const options = students.map(student => `<option value="${student.id}">${escapeText(student.name)} (${escapeText(student.id)})</option>`).join("");
  document.getElementById("taskStudent").innerHTML = options;
  document.getElementById("activityStudent").innerHTML = options;
}

function escapeText(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

document.getElementById("studentForm").addEventListener("submit", event => {
  event.preventDefault();
  const editId = document.getElementById("studentEditId").value;
  const student = {
    id: document.getElementById("studentId").value.trim(),
    name: document.getElementById("studentName").value.trim(),
    phone: document.getElementById("studentPhone").value.trim(),
    course: document.getElementById("studentCourse").value.trim(),
    batch: document.getElementById("studentBatch").value.trim(),
    status: document.getElementById("studentStatus").value
  };
  if (Object.values(student).some(value => !value)) return alert("Please fill in all student fields.");
  const duplicate = students.some(item => item.id.toLowerCase() === student.id.toLowerCase() && item.id !== editId);
  if (duplicate) return alert("This Student ID already exists.");
  if (editId) {
    students = students.map(item => item.id === editId ? student : item);
  } else {
    students.push(student);
  }
  resetStudentForm();
  saveData();
});

function resetStudentForm() {
  document.getElementById("studentForm").reset();
  document.getElementById("studentEditId").value = "";
  document.getElementById("studentFormTitle").textContent = "Add Student";
}
document.getElementById("cancelStudentEdit").addEventListener("click", resetStudentForm);
document.getElementById("studentSearch").addEventListener("input", renderStudents);

document.getElementById("studentsTable").addEventListener("click", event => {
  const editId = event.target.dataset.editStudent;
  const deleteId = event.target.dataset.deleteStudent;
  if (editId) {
    const student = students.find(item => item.id === editId);
    document.getElementById("studentEditId").value = student.id;
    document.getElementById("studentId").value = student.id;
    document.getElementById("studentName").value = student.name;
    document.getElementById("studentPhone").value = student.phone;
    document.getElementById("studentCourse").value = student.course;
    document.getElementById("studentBatch").value = student.batch;
    document.getElementById("studentStatus").value = student.status;
    document.getElementById("studentFormTitle").textContent = "Edit Student";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (deleteId && confirm("Delete this student and their attendance, tasks and activities?")) {
    students = students.filter(item => item.id !== deleteId);
    attendance = attendance.filter(item => item.studentId !== deleteId);
    tasks = tasks.filter(item => item.studentId !== deleteId);
    activities = activities.filter(item => item.studentId !== deleteId);
    saveData();
  }
});

function renderAttendance() {
  const date = document.getElementById("attendanceDate").value;
  document.getElementById("attendanceTable").innerHTML = students.map(student => {
    const record = attendance.find(item => item.studentId === student.id && item.date === date);
    return `<tr><td>${escapeText(student.name)}</td><td>
      <select data-attendance="${student.id}">
        <option ${record?.status === "Present" ? "selected" : ""}>Present</option>
        <option ${record?.status === "Absent" ? "selected" : ""}>Absent</option>
        <option ${record?.status === "Leave" ? "selected" : ""}>Leave</option>
      </select></td></tr>`;
  }).join("") || `<tr><td colspan="2" class="empty">Add students first.</td></tr>`;
}
document.getElementById("attendanceDate").value = new Date().toLocaleDateString("en-CA");
document.getElementById("attendanceDate").addEventListener("change", renderAttendance);
document.getElementById("attendanceForm").addEventListener("submit", event => {
  event.preventDefault();
  const date = document.getElementById("attendanceDate").value;
  document.querySelectorAll("[data-attendance]").forEach(select => {
    const studentId = select.dataset.attendance;
    const existing = attendance.find(item => item.studentId === studentId && item.date === date);
    if (existing) existing.status = select.value;
    else attendance.push({ studentId, date, status: select.value });
  });
  saveData();
  alert("Attendance saved.");
});

document.getElementById("taskForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!students.length) return alert("Add a student first.");
  tasks.push({
    id: Date.now(), studentId: document.getElementById("taskStudent").value,
    title: document.getElementById("taskTitle").value.trim(),
    dueDate: document.getElementById("taskDueDate").value,
    status: document.getElementById("taskStatus").value
  });
  event.target.reset();
  saveData();
});
document.getElementById("tasksTable").addEventListener("change", event => {
  if (event.target.dataset.taskStatus) {
    const task = tasks.find(item => item.id === Number(event.target.dataset.taskStatus));
    if (task) task.status = event.target.value;
    saveData();
  }
});
document.getElementById("tasksTable").addEventListener("click", event => {
  const id = Number(event.target.dataset.deleteTask);
  if (id && confirm("Delete this task?")) {
    tasks = tasks.filter(item => item.id !== id);
    saveData();
  }
});

document.getElementById("activityForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!students.length) return alert("Add a student first.");
  activities.push({
    id: Date.now(), studentId: document.getElementById("activityStudent").value,
    description: document.getElementById("activityDescription").value.trim(),
    type: document.getElementById("activityType").value,
    points: Number(document.getElementById("activityPoints").value)
  });
  event.target.reset();
  saveData();
});
document.getElementById("activitiesTable").addEventListener("click", event => {
  const id = Number(event.target.dataset.deleteActivity);
  if (id && confirm("Delete this activity?")) {
    activities = activities.filter(item => item.id !== id);
    saveData();
  }
});

function renderTasks() {
  document.getElementById("tasksTable").innerHTML = tasks.map(task => `
    <tr><td>${escapeText(studentName(task.studentId))}</td><td>${escapeText(task.title)}</td>
    <td>${task.dueDate}</td><td><select data-task-status="${task.id}">
      <option ${task.status === "Pending" ? "selected" : ""}>Pending</option>
      <option ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
      <option ${task.status === "Completed" ? "selected" : ""}>Completed</option>
    </select></td><td><button class="small-btn delete" data-delete-task="${task.id}">Delete</button></td></tr>`
  ).join("") || `<tr><td colspan="5" class="empty">No tasks yet.</td></tr>`;
}
function renderActivities() {
  document.getElementById("activitiesTable").innerHTML = activities.map(activity => `
    <tr><td>${escapeText(studentName(activity.studentId))}</td><td>${escapeText(activity.description)}</td>
    <td>${activity.type}</td><td>${activity.type === "Positive" ? "+" : "-"}${activity.points}</td>
    <td><button class="small-btn delete" data-delete-activity="${activity.id}">Delete</button></td></tr>`
  ).join("") || `<tr><td colspan="5" class="empty">No activities yet.</td></tr>`;
}
function renderDashboard() {
  const today = document.getElementById("attendanceDate").value;
  document.getElementById("totalStudents").textContent = students.length;
  document.getElementById("presentToday").textContent = attendance.filter(item => item.date === today && item.status === "Present").length;
  document.getElementById("pendingTasks").textContent = tasks.filter(item => item.status !== "Completed").length;
  document.getElementById("totalPoints").textContent = activities.reduce((total, item) => total + (item.type === "Positive" ? item.points : -item.points), 0);
}
function renderAll() {
  renderStudents();
  renderAttendance();
  renderTasks();
  renderActivities();
  renderDashboard();
}
document.getElementById("loadSampleBtn").addEventListener("click", () => {
  if (!confirm("Load sample data? This replaces the current data.")) return;
  students = [
    { id: "STU001", name: "Arun Kumar", phone: "9876543210", course: "Full Stack", batch: "2026", status: "Active" },
    { id: "STU002", name: "Priya S", phone: "9876543211", course: "JavaScript", batch: "2026", status: "Active" },
    { id: "STU003", name: "Rahul M", phone: "9876543212", course: "Full Stack", batch: "2026", status: "Active" }
  ];
  attendance = [];
  tasks = [{ id: Date.now(), studentId: "STU001", title: "Create a portfolio page", dueDate: new Date().toLocaleDateString("en-CA"), status: "Pending" }];
  activities = [{ id: Date.now() + 1, studentId: "STU002", description: "Helped a classmate", type: "Positive", points: 5 }];
  saveData();
  alert("Sample data loaded.");
});

loadData();
renderAll();
