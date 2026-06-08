const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;
const TASKS_FILE = path.join(__dirname, "tasks.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Cargar tareas de forma segura
function loadTasks() {
    try {
        if (!fs.existsSync(TASKS_FILE)) {
            // Si el archivo no existe, creamos uno vacío inicialmente
            fs.writeFileSync(TASKS_FILE, "[]", "utf8");
            return [];
        }
        const data = fs.readFileSync(TASKS_FILE, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.log("Error al leer tasks.json, inicializando vacío.");
        return [];
    }
}

// Guardar tareas en el JSON
function saveTasks(tasksData) {
    fs.writeFileSync(
        TASKS_FILE,
        JSON.stringify(tasksData, null, 2),
        "utf8"
    );
}

// Inicializar el array de tareas en memoria
let tasks = loadTasks();

// 1. Obtener todas las tareas
app.get("/api/tasks", (req, res) => {
    res.json(tasks);
});

// 2. Crear una nueva tarea
app.post("/api/tasks", (req, res) => {
    const { name, time, date } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({
            message: "El nombre de la tarea es obligatorio"
        });
    }

    // CORRECCIÓN: Asignar valores por defecto para evitar problemas en el JSON con 'undefined'
    const newTask = {
        id: Date.now(),
        name: name.trim(),
        time: time || 0,
        date: date || "",
        status: "Pendiente",
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    saveTasks(tasks);

    res.status(201).json(newTask);
});

// 3. Actualizar únicamente el estado de una tarea
app.patch("/api/tasks/:id/status", (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;

    const task = tasks.find(t => t.id === id);

    if (!task) {
        return res.status(404).json({
            message: "Tarea no encontrada"
        });
    }

    const estadosValidos = ["Pendiente", "Iniciada", "Finalizada"];

    if (!estadosValidos.includes(status)) {
        return res.status(400).json({
            message: "Estado inválido"
        });
    }

    task.status = status;
    saveTasks(tasks);

    res.json(task);
});

// 4. Eliminar una tarea
app.delete("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);

    // CORRECCIÓN: Buscamos el índice exacto para mutar el array de forma segura
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({
            message: "Tarea no encontrada"
        });
    }

    // Eliminamos el elemento en esa posición
    tasks.splice(taskIndex, 1);
    saveTasks(tasks);

    res.json({
        message: "Tarea eliminada correctamente"
    });
});

// Ruta principal para servir el Frontend
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});