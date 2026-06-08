const taskList = document.getElementById("taskList");

const modal = document.getElementById("taskModal");

const openModalBtn =
document.getElementById("openModalBtn");

const closeModalBtn =
document.getElementById("closeModalBtn");

const saveTaskBtn =
document.getElementById("saveTaskBtn");

openModalBtn.addEventListener("click", () => {
    modal.style.display = "flex";
});

closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

async function loadTasks() {

    const response =
        await fetch("/api/tasks");

    const tasks =
        await response.json();

    taskList.innerHTML = "";

    tasks.forEach(task => {

        let actionButton = "";

        if (task.status === "Pendiente") {

            actionButton = `
                <button
                    class="start-btn"
                    onclick="changeStatus(${task.id}, 'Iniciada')">
                    ▶ Iniciar
                </button>
            `;
        }

        else if (task.status === "Iniciada") {

            actionButton = `
                <button
                    class="finish-btn"
                    onclick="changeStatus(${task.id}, 'Finalizada')">
                    ✔ Finalizar
                </button>
            `;
        }

        const li =
            document.createElement("li");

        li.innerHTML = `

            <div class="task-info">

                <h3>${task.name}</h3>

                <p>
                    ⏱️ ${task.time} horas
                </p>

                <p>
                    📅 ${task.date}
                </p>

                <p class="status">
                    Estado:
                    <strong>${task.status}</strong>
                </p>

            </div>

            <div class="actions">

                ${actionButton}

                <button
                    class="delete-btn"
                    onclick="deleteTask(${task.id})">
                    🗑 Eliminar
                </button>

            </div>

        `;

        taskList.appendChild(li);
    });
}

saveTaskBtn.addEventListener(
    "click",
    async () => {

        const name =
            document.getElementById("taskName").value;

        const time =
            document.getElementById("taskTime").value;

        const date =
            document.getElementById("taskDate").value;

        if (!name) {
            alert("Ingrese un nombre");
            return;
        }

        await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
                name,
                time,
                date
            })
        });

        document.getElementById("taskName").value = "";
        document.getElementById("taskTime").value = "";
        document.getElementById("taskDate").value = "";

        modal.style.display = "none";

        loadTasks();
    }
);

async function changeStatus(id, status) {

    await fetch(
        `/api/tasks/${id}/status`,
        {
            method: "PATCH",
            headers: {
                "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
                status
            })
        }
    );

    loadTasks();
}

async function deleteTask(id) {

    await fetch(
        `/api/tasks/${id}`,
        {
            method: "DELETE"
        }
    );

    loadTasks();
}

loadTasks();