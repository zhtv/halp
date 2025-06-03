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
    const tabBlockInside = button.closest('.tabblockinside');
    const viewSpan = tabBlockInside.querySelector('.view-mode');
    const input = tabBlockInside.querySelector('.edit-mode');
    const pencilBtn = tabBlockInside.querySelector('button[title="Редактировать"]');
    const saveBtn = tabBlockInside.querySelector('.save-edit-btn');
    const cancelBtn = tabBlockInside.querySelector('.cancel-edit-btn');
    
    if (input.style.display === 'none') {
        // Включаем режим редактирования
        viewSpan.style.display = 'none';
        input.style.display = 'block';
        pencilBtn.style.display = 'none';
        if (saveBtn) saveBtn.style.display = 'inline-block';
        if (cancelBtn) cancelBtn.style.display = 'inline-block';
        
        // Фокусируемся на поле ввода
        input.focus();
    } else {
        // Выключаем режим редактирования
        viewSpan.style.display = 'inline';
        input.style.display = 'none';
        pencilBtn.style.display = 'inline-block';
        if (saveBtn) saveBtn.style.display = 'none';
        if (cancelBtn) cancelBtn.style.display = 'none';
    }
}

function saveField(button) {
    const container = button.parentElement;
    const viewMode = container.querySelector('.view-mode');
    const editMode = container.querySelector('.edit-mode');
    const cancelButton = container.querySelector('.cancel-edit-btn');
    const saveButton = container.querySelector('.save-edit-btn');
    const editButton = container.querySelector('button[onclick^="toggleEdit"]');
    const currentPassword = editMode?.querySelector('input[name="current_password"]');
    const newPassword = editMode?.querySelector('input[name="new_password"]');
    const errorElement = container.parentElement.querySelector('.error');

    // Очистим ошибки
    ['full_name', 'phone_number', 'current_password', 'new_password'].forEach(field => {
        const el = document.getElementById('error_' + field);
        if (el) el.innerText = '';
    });

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
                    errorElem.innerText = "ФИО должно содержать только русские буквы и пробелы, максимум 50 символов.";
                    errorElem.style.display = 'inline';
                }
                return;
            }
        }

        // Исправленная валидация номера телефона - используем value вместо fieldValue
        if (fieldName === 'phone_number' && value && !/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(value)) {
            if (errorElem) {
                errorElem.innerText = "Формат телефона: +7(XXX)XXX-XX-XX";
                errorElem.style.display = 'inline';
            }
            return;
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
    const saveButton = container.querySelector('.save-edit-btn');
    const inputs = editMode.querySelectorAll('input');
    
    inputs.forEach(input => {
        const fieldName = input.name;
        const originalField = viewMode.querySelector(`[data-field="${fieldName}"]`);
        
        if (originalField) {
            if (input.type === 'tel') {
                // Очищаем временное значение
                delete tempInputValues[input.id];
                if (input.name) delete tempInputValues[input.name];
                
                if (originalField.textContent.trim() === '') {
                    input.value = '+7(';
                } else {
                    input.value = originalField.textContent;
                    formatPhoneNumber({target: input});
                }
            } else {
                input.value = originalField.textContent;
            }
        }
    });

    editMode.style.display = 'none';
    viewMode.style.display = 'inline';
    button.style.display = 'none';
    if (saveButton) saveButton.style.display = 'none';
    if (editButton) editButton.style.display = 'inline';

    const errorElements = container.querySelectorAll('.error');
    errorElements.forEach(errorElement => {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        errorElement.classList.remove('active');
    });
}

// Функция для инициализации поля телефона
function initPhoneInput(input) {
    // Получаем родительский контейнер
    const container = input.closest('.tabblockinside');
    if (!container) return;
    
    // Получаем оригинальное значение из режима просмотра
    const viewMode = container.querySelector('.view-mode');
    const originalValue = viewMode.textContent.trim();
    
    // Устанавливаем значение для редактирования
    if (!originalValue || originalValue === 'не заполнено') {
        input.value = '+7(';
    } else {
        input.value = originalValue;
        formatPhoneNumber(input);
    }
    
    // Устанавливаем курсор в правильное место (после +7()
    setTimeout(() => {
        input.setSelectionRange(3, 3);
    }, 0);
}

// Улучшенная функция форматирования номера телефона
function formatPhoneNumber(input) {
    // Если передано событие вместо input элемента
    if (input.target) {
        input = input.target;
    }

    // Сохраняем позицию курсора и предыдущее значение
    let cursorPos = input.selectionStart;
    const prevValue = input.value;
    const prevCursorPos = cursorPos;
    
    // Удаляем все нецифровые символы, кроме ведущего +
    let value = input.value.replace(/\D/g, '');
    
    // Обеспечиваем наличие 7 в начале (код России)
    if (!value.startsWith('7') && value.length > 0) {
        value = '7' + value;
    }
    
    // Форматируем номер
    let formattedValue = '+7(';
    let newCursorPos = 3; // Позиция после +7(
    
    if (value.length > 1) {
        // Добавляем первые 3 цифры
        formattedValue += value.substring(1, 4);
        newCursorPos = Math.min(newCursorPos + Math.min(3, value.length - 1), 6);
        
        if (value.length > 4) {
            formattedValue += ')';
            if (cursorPos > 6) newCursorPos++;
            
            // Добавляем следующие 3 цифры
            formattedValue += value.substring(4, 7);
            newCursorPos = Math.min(newCursorPos + Math.min(3, value.length - 4), 10);
            
            if (value.length > 7) {
                formattedValue += '-';
                if (cursorPos > 10) newCursorPos++;
                
                // Добавляем следующие 2 цифры
                formattedValue += value.substring(7, 9);
                newCursorPos = Math.min(newCursorPos + Math.min(2, value.length - 7), 13);
                
                if (value.length > 9) {
                    formattedValue += '-';
                    if (cursorPos > 13) newCursorPos++;
                    
                    // Добавляем последние 2 цифры
                    formattedValue += value.substring(9, 11);
                    newCursorPos = Math.min(newCursorPos + Math.min(2, value.length - 9), 16);
                }
            }
        }
    }
    
    // Устанавливаем новое значение
    input.value = formattedValue;
    
    // Корректируем позицию курсора при удалении символов
    if (prevValue.length > formattedValue.length) {
        // Если удаляем символ, корректируем позицию
        if (prevCursorPos === 7 && formattedValue.charAt(6) !== ')') {
            newCursorPos = 6; // При удалении ) возвращаемся к последней цифре
        } else if (prevCursorPos === 11 && formattedValue.charAt(10) !== '-') {
            newCursorPos = 10; // При удалении - возвращаемся к последней цифре
        } else if (prevCursorPos === 14 && formattedValue.charAt(13) !== '-') {
            newCursorPos = 13; // При удалении - возвращаемся к последней цифре
        } else if (prevCursorPos <= 3 && formattedValue.length > 3) {
            newCursorPos = 3; // Не даем курсору уйти перед +7(
        }
    }
    
    // Сохраняем позицию курсора при вводе
    if (prevValue.length < formattedValue.length) {
        // При вводе цифры сохраняем позицию
        if (prevCursorPos === 3 && formattedValue.length > 3) {
            newCursorPos = 4; // После ввода первой цифры
        } else if (prevCursorPos === 7 && formattedValue.length > 7) {
            newCursorPos = 8; // После ввода цифры после скобки
        } else if (prevCursorPos === 11 && formattedValue.length > 11) {
            newCursorPos = 12; // После ввода цифры после дефиса
        }
    }
    
    // Учитываем, куда пользователь хочет поставить курсор
    if (cursorPos < 3) newCursorPos = 3; // Не даем ставить курсор перед +7(
    if (cursorPos > formattedValue.length) newCursorPos = formattedValue.length;
    
    // Устанавливаем курсор на новую позицию
    setTimeout(() => {
        input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
    
    // Проверка валидности
    const errorElem = input.closest('.tabblock')?.querySelector('.error');
    if (errorElem) {
        if (input.value && !/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(input.value)) {
            errorElem.textContent = "Формат телефона: +7(XXX)XXX-XX-XX";
            errorElem.style.display = 'inline';
        } else {
            errorElem.textContent = '';
            errorElem.style.display = 'none';
        }
    }
}

// Глобальные переменные для управления детьми
let childrenTabs = [];
let childrenData = {};
const maxChildren = 5;

// Функция загрузки данных детей с сервера
async function loadChildrenData() {
    try {
        const response = await fetch('/get_children_data/', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        if (data.success) {
            childrenData = {};
            data.children.forEach((child, index) => {
                childrenData[child.id] = child;
            });
            renderChildrenTabs();
            
            // Показываем вкладку родителя, даже если есть дети
            const parentTab = document.querySelector('.tab[data-tab="parent"]');
            if (parentTab) parentTab.click();
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных детей:', error);
    }
}

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

// Функция отрисовки вкладок детей
function renderChildrenTabs() {
    const tabsContainer = document.querySelector('.tabs');
    
    // 1. Полностью удаляем ВСЕ вкладки детей
    document.querySelectorAll('.tab[data-child-id^="child-"]').forEach(tab => tab.remove());
    document.querySelectorAll('.tab-content[id^="child-"]').forEach(content => content.remove());
    
    // 2. Очищаем массив вкладок
    childrenTabs = [];
    
    // 3. Создаем новые вкладки для каждого ребенка из актуальных данных
    Object.keys(childrenData).forEach((childId, index) => {
        const child = childrenData[childId];
        const childNumber = index + 1;
        const childIdStr = `child-${childNumber}`;
        
        // Создаем новую вкладку
        const newTab = document.createElement('div');
        newTab.classList.add('tab');
        newTab.setAttribute('data-child-id', childIdStr);
        newTab.setAttribute('data-child-db-id', childId);
        // Применяем truncate сразу при создании вкладки
        newTab.textContent = truncateText(child.full_name, 20) || `Ребёнок ${childNumber}`;
        newTab.title = child.full_name || ''; // Добавляем полное имя в title
        newTab.onclick = (e) => showTab(e, childIdStr);
        
        // Вставляем перед кнопкой добавления
        const addButton = document.querySelector('.add_child');
        tabsContainer.insertBefore(newTab, addButton);
        
        // Создаем контент вкладки
        const newContent = document.createElement('div');
        newContent.classList.add('tab-content');
        newContent.id = childIdStr;
        newContent.style.display = 'none';
        newContent.setAttribute('data-child-db-id', childId);
        newContent.innerHTML = generateChildTabContent(child, childId);
        
        document.querySelector('.cabinet').appendChild(newContent);
        
        // Сохраняем ссылки
        childrenTabs.push({
            id: childIdStr,
            dbId: childId,
            contentElement: newContent,
            tabElement: newTab
        });
    });
}

// Генерация HTML для вкладки ребенка
function generateChildTabContent(child, childId) {
    const birthDate = child.birth_date ? new Date(child.birth_date).toISOString().split('T')[0] : '';
    
    return `
        <div class="left-content">
            <div class="tabblock">
                <label>ФИО ребёнка:</label>
                <div class="tabblockinside">
                    <span class="view-mode">${child.full_name || 'не заполнено'}</span>
                    <input class="edit-mode" type="text" value="${child.full_name || ''}" 
                        placeholder="Иванова Анна Ивановна" style="display:none;"
                        data-field="full_name" data-child-id="${childId}">
                    <button title="Редактировать" onclick="toggleEdit(this)">
                        <img src="${STATIC.pencil}" alt="Редактировать">
                    </button>
                    <button title="Сохранить" class="save-edit-btn" onclick="saveChildField(this, '${childId}')" style="display:none;">
                        <img src="${STATIC.save}" alt="Сохранить">
                    </button>
                    <button title="Отменить" class="cancel-edit-btn" onclick="cancelEdit(this)" style="display:none;">
                        <img src="${STATIC.cancel}" alt="Отмена">
                    </button>
                </div>
                <div class="error" id="error_child_full_name_${childId}"></div>
            </div>
            <div class="tabblock">
                <label>Дата рождения:</label>
                <div class="tabblockinside">
                    <span class="view-mode">${child.birth_date || 'не заполнено'}</span>
                    <input class="edit-mode" type="date" value="${birthDate}" style="display:none;"
                        data-field="birth_date" data-child-id="${childId}">
                    <button title="Редактировать" onclick="toggleEdit(this)">
                        <img src="${STATIC.pencil}" alt="Редактировать">
                    </button>
                    <button title="Сохранить" class="save-edit-btn" onclick="saveChildField(this, '${childId}')" style="display:none;">
                        <img src="${STATIC.save}" alt="Сохранить">
                    </button>
                    <button title="Отменить" class="cancel-edit-btn" onclick="cancelEdit(this)" style="display:none;">
                        <img src="${STATIC.cancel}" alt="Отмена">
                    </button>
                </div>
                <div class="error" id="error_child_birth_date_${childId}"></div>
            </div>                    
            <div class="tabblock">
                <label>Номер телефона:</label>
                <div class="tabblockinside">
                    <span class="view-mode">${child.phone_number || 'не заполнено'}</span>
                    <input class="edit-mode" type="tel" value="{{ child.phone_number }}" 
                    placeholder="+7(9XX)XXX-XX-XX" style="display:none;" 
                    oninput="formatPhoneNumber(this)" onfocus="initPhoneInput(this)"
                    data-field="phone_number" data-child-id="{{ childId }}">
                    <button title="Редактировать" onclick="toggleEdit(this)">
                        <img src="${STATIC.pencil}" alt="Редактировать">
                    </button>
                    <button title="Сохранить" class="save-edit-btn" onclick="saveChildField(this, '${childId}')" style="display:none;">
                        <img src="${STATIC.save}" alt="Сохранить">
                    </button>
                    <button title="Отменить" class="cancel-edit-btn" onclick="cancelEdit(this)" style="display:none;">
                        <img src="${STATIC.cancel}" alt="Отмена">
                    </button>
                </div>
                <div class="error" id="error_child_phone_${childId}"></div>
            </div>
            <div class="tabblock">
                <label>Почта:</label>
                <div class="tabblockinside">
                    <span class="view-mode">${child.email || 'не заполнено'}</span>
                    <input class="edit-mode" type="email" value="${child.email || ''}" 
                        placeholder="teatr-studio99@mail.ru" style="display:none;"
                        data-field="email" data-child-id="${childId}">
                    <button title="Редактировать" onclick="toggleEdit(this)">
                        <img src="${STATIC.pencil}" alt="Редактировать">
                    </button>
                    <button title="Сохранить" class="save-edit-btn" onclick="saveChildField(this, '${childId}')" style="display:none;">
                        <img src="${STATIC.save}" alt="Сохранить">
                    </button>
                    <button title="Отменить" class="cancel-edit-btn" onclick="cancelEdit(this)" style="display:none;">
                        <img src="${STATIC.cancel}" alt="Отмена">
                    </button>
                </div>
                <div class="error" id="error_child_email_${childId}"></div>
            </div>
            <div class="tabblock">
                <label>Группа:</label>
                <span class="view-mode">${child.group_name || 'заполняется администратором'}</span>
            </div>
            <div class="tabblock">
                <label>ФИО и номер телефона курирующего педагога:</label>
                <span class="view-mode">${child.teacher_info || 'заполняется администратором'}</span>
            </div>
            <button class="delete_child" onclick="deleteChild(event, '${childId}')">Удалить запись о ребёнке</button>
            <div class="error" id="error_full_name"></div>
        </div>
        <div class="right-content">
            <a>По всем вопросам, включая изменение данных о группе ребёнка, пожалуйста, обращайтесь в <span>АДМИНИСТРАЦИЮ</span>, или</a>
            <button class="open-modal-btn" onclick="openModal()">ОСТАВЬТЕ ЗАЯВКУ</button>
        </div>
    `;
}

function truncateText(text, maxLength) {
    if (!text) return text;
    return text.length > maxLength 
        ? text.substring(0, maxLength) + '...' 
        : text;
}

// Функция сохранения поля ребенка
async function saveChildField(button, childId) {
    const container = button.closest('.tabblockinside');
    const viewMode = container.querySelector('.view-mode');
    const editMode = container.querySelector('.edit-mode');
    const cancelButton = container.querySelector('.cancel-edit-btn');
    const saveButton = container.querySelector('.save-edit-btn');
    const editButton = container.querySelector('button[onclick^="toggleEdit"]');
    const input = container.querySelector('.edit-mode');
    const fieldName = input.getAttribute('data-field');
    let fieldValue = input.value.trim();
    const errorElement = container.parentElement.querySelector('.error');
    
    // Очищаем предыдущие ошибки
    errorElement.textContent = '';
    errorElement.style.display = 'none';
    
    // Валидация
    let isValid = true;
    
    if (fieldName === 'full_name') {
        if (!fieldValue) {
            errorElement.textContent = 'Введите ФИО ребёнка';
            errorElement.style.display = 'inline';
            isValid = false;
        } else {
            const nameRegex = /^[А-Яа-яЁё\s\-]{1,50}$/;
            if (!nameRegex.test(fieldValue)) {
                errorElement.textContent = "ФИО должно содержать только буквы и пробелы, максимум 50 символов.";
                errorElement.style.display = 'inline';
                isValid = false;
            }
        }
    }
    
    if (fieldName === 'phone_number' && fieldValue) {
        if (!/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(fieldValue)) {
            errorElement.textContent = 'Формат телефона: +7(XXX)XXX-XX-XX';
            errorElement.style.display = 'inline';
            isValid = false;
        }
    }
    
    if (fieldName === 'email' && fieldValue) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)) {
            errorElement.textContent = 'Введите корректный email';
            errorElement.style.display = 'inline';
            isValid = false;
        }
    }
    
    if (!isValid) return;
    
    try {
        const response = await fetch('/update_child_data/', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: `child_id=${encodeURIComponent(childId)}&field_name=${encodeURIComponent(fieldName)}&field_value=${encodeURIComponent(fieldValue)}`,
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        if (data.success) {
            // Обновляем данные в локальном хранилище
            if (!childrenData[childId]) childrenData[childId] = {};
            childrenData[childId][fieldName] = fieldValue || null;
            
            // Форматируем значение для отображения
            let displayValue = fieldValue || 'не заполнено';
            if (fieldName === 'birth_date' && fieldValue) {
                displayValue = new Date(fieldValue).toLocaleDateString('ru-RU');
            }
            
            // Обновляем отображение
            viewMode.textContent = displayValue;
            
            // Скрываем поле редактирования и показываем просмотр
            editMode.style.display = 'none';
            viewMode.style.display = 'inline';
            saveButton.style.display = 'none';
            cancelButton.style.display = 'none';
            editButton.style.display = 'inline';
            
            // Обновляем текст вкладки, если это ФИО
            if (fieldName === 'full_name') {
                const tab = document.querySelector(`.tab[data-child-db-id="${childId}"]`);
                if (tab) {
                    const displayName = fieldValue 
                        ? truncateText(fieldValue, 20)  // Увеличьте лимит, если нужно
                        : `Ребёнок ${childrenTabs.findIndex(c => c.dbId === childId) + 1}`;
                    tab.textContent = displayName;
                    tab.title = fieldValue || '';  // Добавьте title с полным именем
                }
            }
        } else {
            errorElement.textContent = data.error || 'Ошибка сохранения';
            errorElement.style.display = 'inline';
        }
    } catch (error) {
        console.error('Ошибка при сохранении данных ребенка:', error);
        errorElement.textContent = 'Ошибка соединения с сервером';
        errorElement.style.display = 'inline';
    }
}

// Функция добавления ребенка
async function addChild() {
    if (Object.keys(childrenData).length >= maxChildren) {
        alert(`Нельзя добавить больше ${maxChildren} детей!`);
        return;
    }
    
    try {
        const response = await fetch('/add_child/', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        if (data.success) {
            // Загружаем обновленные данные
            await loadChildrenData();
            
            // Активируем вкладку нового ребенка
            const newChildTab = document.querySelector(`.tab[data-child-db-id="${data.child_id}"]`);
            if (newChildTab) newChildTab.click();
        } else {
            alert(data.error || 'Ошибка при добавлении ребенка');
        }
    } catch (error) {
        console.error('Ошибка при добавлении ребенка:', error);
        alert('Ошибка соединения с сервером');
    }
}

// Функция удаления ребенка
async function deleteChild(event, childId) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!confirm('Вы уверены, что хотите удалить данные этого ребёнка? Данное действие нельзя отменить.')) {
        return;
    }

    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="loader">Удаление...</span>';
    button.disabled = true;

    try {
        const response = await fetch('/delete_child/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': getCSRFToken(),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: `child_id=${encodeURIComponent(childId)}`,
            credentials: 'same-origin'
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Ошибка сервера');
        }

        // 1. Полностью очищаем текущие данные
        childrenData = {};
        childrenTabs = [];

        // 2. Загружаем актуальные данные с сервера
        await loadChildrenData();

        // 3. Принудительно переключаемся на вкладку родителя
        const parentTab = document.querySelector('.tab[data-tab="parent"]');
        if (parentTab) {
            parentTab.click();
        }

    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка при удалении: ' + error.message);
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Упрощенная функция перенумерации
function renumberChildTabs() {
    const tabsContainer = document.querySelector('.tabs');
    const childTabs = Array.from(document.querySelectorAll('.tab[data-child-id^="child-"]'));
    
    // Сортируем вкладки по текущим номерам
    childTabs.sort((a, b) => {
        const aNum = parseInt(a.getAttribute('data-child-id').split('-')[1]);
        const bNum = parseInt(b.getAttribute('data-child-id').split('-')[1]);
        return aNum - bNum;
    });

    // Перенумеровываем последовательно
    childTabs.forEach((tab, index) => {
        const newNumber = index + 1;
        const newId = `child-${newNumber}`;
        const dbId = tab.getAttribute('data-child-db-id');
        
        // Обновляем вкладку
        tab.setAttribute('data-child-id', newId);
        
        // Обновляем соответствующий контент
        const content = document.querySelector(`.tab-content[data-child-db-id="${dbId}"]`);
        if (content) {
            content.id = newId;
        }
        
        // Обновляем текст вкладки, если нет имени
        if (!tab.textContent.match(/^Ребёнок \d+$/)) {
            tab.textContent = tab.textContent.replace(/^Ребёнок \d+/, `Ребёнок ${newNumber}`);
        }
    });
}

// Вспомогательная функция для получения CSRF токена
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Загружаем данные детей при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadChildrenData();
});

// Форматируем телефонные номера при загрузке
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        if (input.value && input.value.startsWith('+7')) {
            formatPhoneNumber(input);
        } else if (!input.value) {
            input.value = '+7(';
        }
    });
});

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
    document.getElementById("request-textarea").value = "";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// Загрузка заявок при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadRequests();
});

// Функция для загрузки заявок
function loadRequests() {
    fetch('/get-requests/')
        .then(response => response.json())
        .then(data => {
            const requestsList = document.getElementById('requests-list');
            requestsList.innerHTML = '';
            
            if (data.requests.length === 0) {
                requestsList.innerHTML = '<p>У вас пока нет заявок</p>';
                return;
            }
            
            data.requests.forEach(request => {
                const requestElement = document.createElement('div');
                requestElement.className = 'request-item';
                requestElement.innerHTML = `
                    <div class="request-header">
                        <a class="request-id">Заявка №${request.id}</a>
                        <a class="request-date">${request.created_at}</a>
                        <div class="status">
                            <a class="announce">Статус:</a>
                            <a class="request-status ${request.status.toLowerCase().replace(' ', '-')}">
                                ${request.status}
                            </a>
                        </div>
                    </div>
                    <div class="request-text">
                        <a class="announce">Текст заявки:</a>
                        <a>${request.text}</a>
                    </div>
                    ${request.admin_comment ? 
                        `<div class="admin-comment">
                            <hr>
                            <a class="announce">Комментарий администратора:</a>
                            <a>${request.admin_comment}</a>
                        </div>` : ''}
                `;
                requestsList.appendChild(requestElement);
            });
        })
        .catch(error => {
            console.error('Ошибка при загрузке заявок:', error);
        });
}

// Отправка заявки
function submitRequest() {
    const textarea = document.getElementById("request-textarea");
    const text = textarea.value.trim();

    if (text === "") {
        alert("Пожалуйста, опишите вашу проблему перед отправкой!");
        return;
    }

    const formData = new FormData();
    formData.append('text', text);

    fetch('/create-request/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Заявка успешно отправлена, мы постараемся обработать её как можно скорее!");
            closeModal();
            loadRequests(); // Обновляем список заявок
        } else {
            alert(data.error || "Произошла ошибка при отправке заявки");
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert("Произошла ошибка при отправке заявки");
    });
}

// Вспомогательная функция для получения CSRF токена
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

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

// Обработка изменения статуса заявки
document.addEventListener('DOMContentLoaded', function() {
    // Общий обработчик для всех кнопок сохранения (и активные и архивные заявки)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('save-changes')) {
            const requestId = e.target.dataset.requestId;
            const row = document.querySelector(`tr[data-request-id="${requestId}"]`);
            
            // Ищем элементы в зависимости от того, где находится заявка (архив или активные)
            const statusSelect = row.querySelector('.status-select');
            let commentField = row.querySelector('.admin-comment');
            
            // В архиве комментарий может быть в другом месте (зависит от вашей верстки)
            if (!commentField) {
                commentField = row.querySelector('textarea');
            }
            
            const newStatus = statusSelect.value;
            const comment = commentField ? commentField.value : '';
            
            updateRequestStatus(requestId, newStatus, comment);
        }
    });

    // Обработчик фильтра по статусу (активные заявки)
    document.getElementById('status-filter')?.addEventListener('change', function() {
        const status = this.value;
        const rows = document.querySelectorAll('#admin-requests .request-row');
        
        rows.forEach(row => {
            if (status === 'all' || row.classList.contains(`status-${status}`)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Обработчик фильтра по статусу (архивные заявки)
    document.getElementById('archive-status-filter')?.addEventListener('change', function() {
        const status = this.value;
        const rows = document.querySelectorAll('#admin-archive-requests .request-row');
        
        rows.forEach(row => {
            if (status === 'all' || row.classList.contains(`status-${status}`)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Функция для обновления счетчика новых заявок
    function updateNewRequestsCount(count) {
        const counterElement = document.getElementById('new-requests-count');
        if (counterElement) {
            counterElement.textContent = `новые: ${count}`;
        }
        
        // Также обновляем текст в заголовке вкладки
        const tabButtons = document.querySelectorAll('.admin-tab-button');
        tabButtons.forEach(button => {
            if (button.dataset.tab === 'admin-requests') {
                button.textContent = `Активные заявки (новые: ${count})`;
            }
        });
    }

    function updateRequestStatus(requestId, newStatus, comment) {
        const formData = new FormData();
        formData.append('request_id', requestId);
        formData.append('status', newStatus);
        formData.append('comment', comment || ''); // Всегда отправляем комментарий, даже пустой
        
        fetch('/update-request-status/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const row = document.querySelector(`tr[data-request-id="${requestId}"]`);
                
                if (row) {
                    // Обновляем класс статуса и отображение
                    row.className = `request-row status-${newStatus}`;
                    const statusDisplay = row.querySelector('.status-display');
                    if (statusDisplay) {
                        const statusText = row.querySelector(`.status-select option[value="${newStatus}"]`).textContent;
                        statusDisplay.textContent = statusText;
                    }
                    
                    // Обновляем комментарий везде, где он отображается
                    const commentDisplays = row.querySelectorAll('.comment-display');
                    commentDisplays.forEach(display => {
                        display.textContent = comment || '-';
                    });
                    
                    const commentInputs = row.querySelectorAll('.admin-comment');
                    commentInputs.forEach(input => {
                        input.value = comment || '';
                    });
                    
                    // Определяем, нужно ли перемещать заявку
                    const isArchive = row.closest('#admin-archive-requests');
                    const shouldBeInArchive = ['completed', 'rejected'].includes(newStatus);
                    const shouldBeInActive = ['new', 'in_progress'].includes(newStatus);
                    
                    if (isArchive && shouldBeInActive) {
                        // Перемещаем в активные заявки
                        const activeTable = document.querySelector('#admin-requests tbody');
                        if (activeTable) {
                            row.remove();
                            activeTable.appendChild(row);
                            
                            // Применяем текущий фильтр активных заявок
                            const activeFilter = document.getElementById('status-filter')?.value || 'all';
                            if (activeFilter !== 'all' && !row.classList.contains(`status-${activeFilter}`)) {
                                row.style.display = 'none';
                            }
                        }
                    } else if (!isArchive && shouldBeInArchive) {
                        // Перемещаем в архив
                        const archiveTable = document.querySelector('#admin-archive-requests tbody');
                        if (archiveTable) {
                            row.remove();
                            archiveTable.appendChild(row);
                            
                            // Применяем текущий фильтр архива
                            const archiveFilter = document.getElementById('archive-status-filter')?.value || 'all';
                            if (archiveFilter !== 'all' && !row.classList.contains(`status-${archiveFilter}`)) {
                                row.style.display = 'none';
                            }
                        }
                    }
                }
                
                // Обновляем счетчик новых заявок
                if (data.new_requests_count !== undefined) {
                    updateNewRequestsCount(data.new_requests_count);
                }
                
                // Показываем уведомление об успешном сохранении
                showNotification('Изменения сохранены успешно', 'success');
            } else {
                alert(data.error || 'Произошла ошибка при обновлении статуса');
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при обновлении статуса');
        });
    }

    // Вспомогательная функция для показа уведомлений
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});

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