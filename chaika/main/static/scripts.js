// УНИЧТОЖЕНИЕ ПЕРЕКРЫТИЯ КОНТЕНТА ШАПКОЙ
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const updatePadding = () => {
      document.documentElement.style.setProperty(
        '--header-height', 
        header.offsetHeight + 'px'
      );
    };
    
    updatePadding();
    window.addEventListener('resize', updatePadding);
});

// ЛИЧНЫЙ КАБИНЕТ

let usedChildNumbers = new Set([1]); // Уже есть один ребенок по умолчанию
const maxChildren = 5;

// Функция переключения вкладок
function showTab(event, tabId) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.style.display = 'none');

    const targetContent = document.getElementById(tabId);
    if (targetContent) targetContent.style.display = 'flex';

    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    event.currentTarget.classList.add('active');
}

// Функция редактирования (без изменений)
function toggleEdit(button) {
    const container = button.parentElement;
    const viewMode = container.querySelector('.view-mode');
    const editMode = container.querySelector('.edit-mode');
    const cancelButton = container.querySelector('.cancel-edit-btn');
    let errorElem = container.querySelector('.error-message');
    const buttonImage = button.querySelector('img');

    if (editMode.style.display === 'none' || editMode.style.display === '') {
        // Включаем режим редактирования
        editMode.dataset.originalValue = editMode.value || '';
        editMode.style.display = 'inline';
        viewMode.style.display = 'none';
        cancelButton.style.display = 'inline';
        buttonImage.src = STATIC.save;
        button.title = "Сохранить";
        if (errorElem) errorElem.style.display = 'none';
    } else {
        // Сохранение
        if (editMode.value.trim() === '') {
            if (!errorElem) {
                errorElem = document.createElement('span');
                errorElem.className = 'error-message';
                errorElem.style.color = '#D4003D';
                errorElem.style.fontWeight = 'bold';
                errorElem.style.marginLeft = '5px';
                container.appendChild(errorElem);
            }
            errorElem.textContent = 'Поле не может быть пустым!';
            errorElem.style.display = 'inline';
            return;
        }

        viewMode.textContent = editMode.value;
        editMode.style.display = 'none';
        viewMode.style.display = 'inline';
        cancelButton.style.display = 'none';
        buttonImage.src = STATIC.pencil;
        button.title = "Редактировать";
        if (errorElem) errorElem.style.display = 'none';
    }
}

function cancelEdit(button) {
    const container = button.parentElement;
    const editMode = container.querySelector('.edit-mode');
    const viewMode = container.querySelector('.view-mode');
    const editButton = container.querySelector('button[onclick^="toggleEdit"]');
    const buttonImage = editButton.querySelector('img');
    let errorElem = container.querySelector('.error-message');

    // Отмена редактирования, восстановление прежнего значения
    editMode.value = editMode.dataset.originalValue || '';
    editMode.style.display = 'none';
    viewMode.style.display = 'inline';
    button.style.display = 'none';
    buttonImage.src = STATIC.pencil;
    if (errorElem) errorElem.style.display = 'none';
}


// Получаем первый свободный номер
function getNextAvailableChildNumber() {
    for (let i = 1; i <= maxChildren; i++) {
        if (!usedChildNumbers.has(i)) {
            return i;
        }
    }
    return null;
}

// Функция добавления новой вкладки для ребёнка
function addChild() {
    const nextNumber = getNextAvailableChildNumber();
    if (nextNumber === null) {
        alert("Нельзя добавить больше 5 детей!");
        return;
    }

    usedChildNumbers.add(nextNumber);
    const childId = 'child-' + nextNumber;

    const newTab = document.createElement('div');
    newTab.classList.add('tab');
    newTab.setAttribute('data-child-id', childId);
    newTab.textContent = 'Ребёнок ' + nextNumber;
    newTab.onclick = function(event) {
        showTab(event, childId);
    };

    const tabsContainer = document.querySelector('.tabs');
    const addButtonContainer = document.querySelector('.add_child');
    tabsContainer.insertBefore(newTab, addButtonContainer);

    const newContent = document.createElement('div');
    newContent.classList.add('tab-content');
    newContent.id = childId;
    newContent.style.display = 'none';

    newContent.innerHTML = `
        <div class="left-content">
            <div class="tabblock">
                <label>ФИО ребёнка:</label>
                <div class="tabblockinside">
                    <span class="view-mode">не заполнено</span>
                    <input class="edit-mode" type="text" placeholder="Иванова Анна Ивановна" style="display:none;">
                    <button title="Редактировать" onclick="toggleEdit(this)">
                        <img src="${STATIC.pencil}" alt="Редактировать">
                    </button>
                    <button title="Отменить" class="cancel-edit-btn" onclick="cancelEdit(this)" style="display:none;">
                        <img src="${STATIC.cancel}" alt="Отмена">
                    </button>
                </div>
            </div>
            <div class="tabblock">
                <label>Дата рождения:</label>
                <div class="tabblockinside">
                    <span class="view-mode">не заполнено</span>
                    <input class="edit-mode" type="date" style="display:none;">
                    <button title="Редактировать" onclick="toggleEdit(this)">
                        <img src="${STATIC.pencil}" alt="Редактировать">
                    </button>
                    <button title="Отменить" class="cancel-edit-btn" onclick="cancelEdit(this)" style="display:none;">
                        <img src="${STATIC.cancel}" alt="Отмена">
                    </button>
                </div>
            </div>                    
            <div class="tabblock">
                <label>Номер телефона:</label>
                <div class="tabblockinside">
                    <span class="view-mode">не заполнено</span>
                    <input class="edit-mode" type="tel" placeholder="+7(9XX)XXXXXXX" style="display:none;" oninput="formatPhoneNumber(this)">
                    <button title="Редактировать" onclick="toggleEdit(this)">
                        <img src="${STATIC.pencil}" alt="Редактировать">
                    </button>
                    <button title="Отменить" class="cancel-edit-btn" onclick="cancelEdit(this)" style="display:none;">
                        <img src="${STATIC.cancel}" alt="Отмена">
                    </button>
                </div>
            </div>
            <div class="tabblock">
                <label>Почта:</label>
                <div class="tabblockinside">
                    <span class="view-mode">не заполнено</span>
                    <input class="edit-mode" type="email" placeholder="teatr-studio99@mail.ru" style="display:none;">
                    <button title="Редактировать" onclick="toggleEdit(this)">
                        <img src="${STATIC.pencil}" alt="Редактировать">
                    </button>
                    <button title="Отменить" class="cancel-edit-btn" onclick="cancelEdit(this)" style="display:none;">
                        <img src="${STATIC.cancel}" alt="Отмена">
                    </button>
                </div>
            </div>
            <div class="tabblock">
                <label>Группа:</label>
                <span class="view-mode">ТМА (Театр Молодого Актёра) младшая и старшая</span>
            </div>
            <div class="tabblock">
                <label>ФИО и номер телефона курирующего педагога:</label>
                <span class="view-mode">Наталья Юрьевна Воробьёва, +7(921)123-45-67</span>
            </div>
        </div>
        <div class="right-content">
            <a>По всем вопросам, включая изменение данных о группе ребёнка, пожалуйста, обращайтесь в <span>АДМИНИСТРАЦИЮ</span>, или</a>
            <button class="open-modal-btn" onclick="openModal()">ОСТАВЬТЕ ЗАЯВКУ</button>
        </div>
    `;

    document.querySelector('.cabinet').appendChild(newContent);
    showTab({ currentTarget: newTab }, childId);
}

// Функция удаления вкладки ребёнка
function removeChildTab(childId, number) {
    console.log('Удаляем ребёнка с id:', childId);

    const content = document.getElementById(childId);
    if (content && content.parentNode) {
        content.parentNode.removeChild(content);
    }

    const tab = document.querySelector(`.tab[data-child-id="${childId}"]`);
    if (tab && tab.parentNode) {
        tab.parentNode.removeChild(tab);
    }

    usedChildNumbers.delete(number); // Освобождаем номер

    const activeTab = document.querySelector('.tab.active');
    if (!activeTab || activeTab.getAttribute('data-child-id') === childId) {
        const parentTab = document.querySelector('.tab[onclick*="parent"]');
        if (parentTab) {
            parentTab.click();
        }
    }
}

// ОБУЧЕНИЕ
document.addEventListener("DOMContentLoaded", function () {
    const sections = {
        drama: document.querySelector(".drama"),
        estradnoe: document.querySelector(".estradnoe"),
        kukolnoe: document.querySelector(".kukolnoe")
    };

    const buttons = document.querySelectorAll(".otdels h3");

    function showSection(section) {
        Object.values(sections).forEach(div => div.style.display = "none");
        sections[section].style.display = "block";
    }

    buttons[0].addEventListener("click", () => showSection("drama"));
    buttons[1].addEventListener("click", () => showSection("estradnoe"));
    buttons[2].addEventListener("click", () => showSection("kukolnoe"));

    showSection("drama");
});

// ОТКРЫТИЕ И ЗАКРЫТИЕ МОДАЛКИ
function openModal() {
    document.getElementById("modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

function submitRequest() {
    var textarea = document.getElementById("textarea"); // Получаем textarea
    var text = textarea.value.trim(); // Убираем пробелы в начале и в конце

    if (text === "") {
        // Если текстовое поле пустое, показываем сообщение
        alert("Пожалуйста, опишите вашу проблему перед отправкой!");
    } else {
        // Если текст не пустой, показываем сообщение об отправке
        alert("Заявка успешно отправлена!");

        // Очистка поля ввода
        textarea.value = ""; 

        // Закрытие модального окна
        closeModal();
    }
}

// АНИМАЦИЯ
document.addEventListener("DOMContentLoaded", function () {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show'); // добавляем класс при появлении элемента
            } else {
                entry.target.classList.remove('show'); // убираем класс, когда элемент выходит из области видимости
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
});

// анимация которая проигрывается один раз и больше не двигается
// document.addEventListener("DOMContentLoaded", function () {
//     const observer = new IntersectionObserver((entries) => {
//         entries.forEach(entry => {
//             if (entry.isIntersecting) {
//                 entry.target.classList.add('show');
//                 observer.unobserve(entry.target); // чтобы не повторять
//             }
//         });
//     }, {
//         threshold: 0.1
//     });

//     document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
// });

// АДМИН-ПАНЕЛЬ
    document.addEventListener("DOMContentLoaded", function () {
        const tabButtons = document.querySelectorAll(".admin-tab-button");
        const tabContents = document.querySelectorAll(".admin-tab-content");

        tabButtons.forEach(button => {
            button.addEventListener("click", () => {
                const target = button.getAttribute("data-tab");

                tabButtons.forEach(btn => btn.classList.remove("admin-active"));
                tabContents.forEach(tab => tab.classList.remove("admin-active"));

                button.classList.add("admin-active");
                document.getElementById(target).classList.add("admin-active");
            });
        });
    });
