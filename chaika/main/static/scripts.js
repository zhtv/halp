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

// Обновление данных профиля родителя
function getCSRFToken() {
    return document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}

function saveParentProfile() {
    const fullNameInput = document.querySelector('#full_name');
    const phoneInput = document.querySelector('#phone_number');
    const currentPassword = document.querySelector('#current_password');
    const newPassword = document.querySelector('#new_password');

    const fullName = fullNameInput ? fullNameInput.value.trim() : '';
    const phoneNumber = phoneInput ? phoneInput.value.trim() : '';
    const currentPwd = currentPassword ? currentPassword.value.trim() : '';
    const newPwd = newPassword ? newPassword.value.trim() : '';

    // Валидация пароля на клиенте
    if (newPwd && (!validatePassword(newPwd))) {
        showPasswordError("Пароль должен быть не менее 8 символов и содержать хотя бы одну цифру.");
        return;
    }

    if (newPwd && currentPwd && newPwd === currentPwd) {
        showPasswordError("Новый пароль не должен совпадать с текущим.");
        return;
    }

    fetch('/update-profile/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken(),
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: new URLSearchParams({
            full_name: fullName,
            phone_number: phoneNumber,
            current_password: currentPwd,
            new_password: newPwd
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            if (data.error && data.error.toLowerCase().includes("пароль")) {
                showPasswordError(data.error);
            } else {
                console.error("Ошибка:", data.error);
            }
            // При ошибке форма остается открытой — ничего менять не нужно
        } else {
            clearPasswordFields();
            if (currentPwd && newPwd) {
                alert("Пароль успешно изменён!");
                collapsePasswordEditUI();
            } else {
                alert("Профиль успешно обновлён!");
                // можно дополнительно свернуть редактирование ФИО/телефона, если нужно
            }

            // Сворачиваем UI для изменения пароля после успешного обновления
            const container = document.querySelector('input[name="new_password"]').closest('.tabblockinside');
            if (container) {
                const viewMode = container.querySelector('.view-mode');
                const editMode = container.querySelector('.edit-mode');
                const cancelButton = container.querySelector('.cancel-edit-btn');
                const saveButton = container.querySelector('.save-edit-btn');
                const editButton = container.querySelector('button[onclick^="toggleEdit"]');
                
                if (editMode) editMode.style.display = 'none';
                if (viewMode) viewMode.style.display = 'inline';
                if (cancelButton) cancelButton.style.display = 'none';
                if (saveButton) saveButton.style.display = 'none';
                if (editButton) editButton.style.display = 'inline';
            }
        }
    })
    .catch(error => {
        console.error("Ошибка при сохранении профиля:", error);
    });
}

function collapsePasswordEditUI() {
    const container = document.querySelector('#current_password')?.closest('.tabblockinside');
    if (!container) return;

    const viewMode = container.querySelector('.view-mode');
    const editMode = container.querySelector('.edit-mode');
    const cancelButton = container.querySelector('.cancel-edit-btn');
    const saveButton = container.querySelector('.save-edit-btn');
    const editButton = container.querySelector('button[onclick^="toggleEdit"]');

    if (viewMode) {
        viewMode.textContent = "установлен";
        viewMode.style.display = 'inline';
    }
    if (editMode) editMode.style.display = 'none';
    if (cancelButton) cancelButton.style.display = 'none';
    if (saveButton) saveButton.style.display = 'none';
    if (editButton) editButton.style.display = 'inline';
}

function validatePassword(password) {
    return password.length >= 8 && /\d/.test(password);
}

function showPasswordError(message) {
    const errorElem = document.querySelector('#error_current_password');
    if (errorElem) {
        errorElem.textContent = message;
        errorElem.style.display = 'inline';
    }
}

function clearPasswordFields() {
    const currentPassword = document.getElementById('current_password');
    const newPassword = document.getElementById('new_password');
    const errorCurrent = document.getElementById('error_current_password');
    const errorNew = document.getElementById('error_new_password');

    if (currentPassword) currentPassword.value = '';
    if (newPassword) newPassword.value = '';
    if (errorCurrent) {
        errorCurrent.innerText = '';
        errorCurrent.style.display = 'none';
    }
    if (errorNew) {
        errorNew.innerText = '';
        errorNew.style.display = 'none';
    }
}


// Функция редактирования (без изменений)
function toggleEdit(button) {
    const container = button.parentElement;
    const viewMode = container.querySelector('.view-mode');
    const editMode = container.querySelector('.edit-mode');
    const cancelButton = container.querySelector('.cancel-edit-btn');
    const saveButton = container.querySelector('.save-edit-btn');
    const buttonImage = button.querySelector('img');

    if (editMode.style.display === 'none' || editMode.style.display === '') {
        // Включаем режим редактирования
        editMode.dataset.originalValue = editMode.value || '';
        editMode.style.display = 'inline';
        viewMode.style.display = 'none';
        cancelButton.style.display = 'inline';
        saveButton.style.display = 'inline';
        button.style.display = 'none'; // скрываем кнопку "Редактировать"
        const errorElems = container.querySelectorAll('.error');
        errorElems.forEach(el => el.textContent = '');
    }
}

function saveField(button) {
    const container = button.parentElement;
    const viewMode = container.querySelector('.view-mode');
    const cancelButton = container.querySelector('.cancel-edit-btn');
    const editButton = container.querySelector('button[onclick^="toggleEdit"]');
    const saveButton = container.querySelector('.save-edit-btn');

    // Очистим ошибки
    ['full_name', 'phone_number', 'current_password', 'new_password'].forEach(field => {
        const el = document.getElementById('error_' + field);
        if (el) el.innerText = '';
    });

    const currentPassword = container.querySelector('input[name="current_password"]');
    const newPassword = container.querySelector('input[name="new_password"]');

    if (currentPassword && newPassword) {
        // Обработка смены пароля
        const currentPwd = currentPassword.value.trim();
        const newPwd = newPassword.value.trim();

        let hasError = false;

        if (!currentPwd) {
            const errEl = document.getElementById('error_current_password');
            if (errEl) {
                errEl.innerText = "Введите текущий пароль.";
                errEl.style.display = 'inline';
            }
            hasError = true;
        }

        if (!newPwd) {
            document.getElementById('error_new_password').innerText = "Введите новый пароль.";
            hasError = true;
        }

        if (newPwd && !validatePassword(newPwd)) {
            const errEl = document.getElementById('error_new_password');
            if (errEl) {
                errEl.innerText = "Пароль должен быть не менее 8 символов и содержать хотя бы одну цифру.";
                errEl.style.display = 'inline'; // <--- ЭТО ВАЖНО
            }
            hasError = true;
        }

        if (newPwd && currentPwd && newPwd === currentPwd) {
            const errEl = document.getElementById('error_new_password');
            if (errEl) {
                errEl.innerText = "Новый пароль не должен совпадать с текущим.";
                errEl.style.display = 'inline';
            }
            hasError = true;
        }

        if (hasError) return;

        saveParentProfile();

    } else {
        // Обработка ФИО и телефона
        const editInput = container.querySelector('.edit-mode');
        if (!editInput || editInput.value.trim() === '') {
            const fieldName = editInput?.name || '';
            const errorElem = document.getElementById('error_' + fieldName);
            if (errorElem) {
                errorElem.innerText = "Поле не может быть пустым!";
                errorElem.style.display = 'inline';
            }
            return;
        }

        const fieldName = editInput?.name || '';
        const value = editInput?.value.trim() || '';
        const errorElem = document.getElementById('error_' + fieldName);

        // Валидация
        if (fieldName === 'full_name') {
            const nameRegex = /^[А-Яа-яЁё\s\-]{1,50}$/;
            if (!nameRegex.test(value)) {
                if (errorElem) {
                    errorElem.innerText = "ФИО должно содержать только буквы и пробелы, максимум 50 символов.";
                    errorElem.style.display = 'inline';
                }
                return;
            }
        }

        if (fieldName === 'phone_number') {
            const phoneRegex = /^[0-9+()\-\s]{1,15}$/;
            if (!phoneRegex.test(value) || /[A-Za-zА-Яа-яЁё]/.test(value)) {
                if (errorElem) {
                    errorElem.innerText = "Телефон может содержать только цифры, пробелы и спецсимволы, максимум 15 символов.";
                    errorElem.style.display = 'inline';
                }
                return;
            }
        }

        // Если ошибок нет — только тогда скрываем поле и сохраняем
        viewMode.textContent = value;
        editInput.style.display = 'none';
        viewMode.style.display = 'inline';
        cancelButton.style.display = 'none';
        saveButton.style.display = 'none';
        editButton.style.display = 'inline';

        saveParentProfile();

    }
}

function cancelEdit(button) {
    const container = button.parentElement;
    const editMode = container.querySelector('.edit-mode');
    const viewMode = container.querySelector('.view-mode');
    const editButton = container.querySelector('button[onclick^="toggleEdit"]');
    const saveButton = container.querySelector('.save-edit-btn'); // Добавляем кнопку "Сохранить"

    editMode.style.display = 'none';
    viewMode.style.display = 'inline';
    button.style.display = 'none';  // скрываем кнопку "Отмена"
    if (saveButton) saveButton.style.display = 'none'; // скрываем кнопку "Сохранить"
    if (editButton) editButton.style.display = 'inline';  // показываем кнопку "Редактировать"

    // Очистка ошибок
    const errorElems = container.querySelectorAll('.error');
    errorElems.forEach(el => el.textContent = '');
}

// детей
let childrenTabs = []; // Массив объектов { id: 'child-1', contentElement, tabElement }
const maxChildren = 4;

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
    if (childrenTabs.length >= maxChildren) {
        alert("Нельзя добавить больше 5 детей!");
        return;
    }

    const nextNumber = childrenTabs.length + 2;
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
                        <span class="view-mode">заполняется администратором</span>
                    </div>
                    <div class="tabblock">
                        <label>ФИО и номер телефона курирующего педагога:</label>
                        <span class="view-mode">заполняется администратором</span>
                    </div>
            <button class="delete_child" onclick="removeChildTab('${childId}')">Удалить ребёнка</button>
        </div>
        <div class="right-content">
            <a>По всем вопросам, включая изменение данных о группе ребёнка, пожалуйста, обращайтесь в <span>АДМИНИСТРАЦИЮ</span>, или</a>
            <button class="open-modal-btn" onclick="openModal()">ОСТАВЬТЕ ЗАЯВКУ</button>
        </div>
    `;

    document.querySelector('.cabinet').appendChild(newContent);
    childrenTabs.push({ id: childId, contentElement: newContent, tabElement: newTab });
    showTab({ currentTarget: newTab }, childId);
}

// Функция удаления вкладки ребёнка
function removeChildTab(childId) {
    const index = childrenTabs.findIndex(child => child.id === childId);
    if (index === -1) return;

    const { contentElement, tabElement } = childrenTabs[index];

    contentElement.remove();
    tabElement.remove();

    childrenTabs.splice(index, 1);

    // Пересоздать нумерацию
    childrenTabs.forEach((child, i) => {
        const newNumber = i + 2;
        const newId = 'child-' + newNumber;

        child.id = newId;
        child.contentElement.id = newId;
        child.tabElement.setAttribute('data-child-id', newId);
        child.tabElement.textContent = 'Ребёнок ' + newNumber;

        // Обновить обработчик клика
        child.tabElement.onclick = function(event) {
            showTab(event, newId);
        };

        // Обновить кнопку удаления в HTML содержимом (если нужно)
        const deleteButton = child.contentElement.querySelector('.delete_child');
        if (deleteButton) {
            deleteButton.setAttribute('onclick', `removeChildTab('${newId}')`);
        }
    });

    // Вернуться на вкладку родителя
    const parentTab = document.querySelector('.tab[onclick*="parent"]');
    if (parentTab) {
        parentTab.click();
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
        alert("Заявка успешно отправлена, мы постараемся обработать её как можно скорее!");

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

// чтобы страница не обновлялась при отправке формы, регистрация
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const url = form.dataset.url;  // Получаем URL из data-url атрибута

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                cookie = cookie.trim();
                if (cookie.startsWith(name + '=')) {
                    cookieValue = decodeURIComponent(cookie.slice(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Очистить ошибки
        ['email', 'password', 'password2'].forEach(field => {
            document.getElementById('error_' + field).innerText = '';
        });

        const formData = new FormData(form);

        fetch(url, {
            method: "POST",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRFToken": getCookie('csrftoken')
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error('HTTP error ' + response.status);
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Регистрация прошла успешно!');
                window.location.href = authUrl;  // Перенаправление на страницу входа
            } else {
                for (const [field, errs] of Object.entries(data.errors)) {
                    const errorText = errs.map(e => e.message).join(', ');
                    document.getElementById('error_' + field).innerText = errorText;
                }
            }
        })
        .catch(err => {
            alert('Произошла ошибка, попробуйте позже.');
            console.error(err);
        });
    });

    // Функция получения CSRF cookie
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                cookie = cookie.trim();
                if (cookie.startsWith(name + '=')) {
                    cookieValue = decodeURIComponent(cookie.slice(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});

// АВТОРИЗАЦИЯ
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('authForm');
    const url = form.dataset.url;

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                cookie = cookie.trim();
                if (cookie.startsWith(name + '=')) {
                    cookieValue = decodeURIComponent(cookie.slice(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Очистка ошибок
        ['username', 'password'].forEach(field => {
            document.getElementById('error_' + field).innerText = '';
        });

        const formData = new FormData(form);

        fetch(url, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error('HTTP error ' + response.status);
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Редирект после успешной авторизации
                window.location.href = data.redirect_url;
            } else {
                for (const [field, errs] of Object.entries(data.errors)) {
                    const errorText = errs.map(e => e.message).join(', ');
                    document.getElementById('error_' + field).innerText = errorText;
                }
            }
        })
        .catch(err => {
            alert('Произошла ошибка, попробуйте позже.');
            console.error(err);
        });
    });
});