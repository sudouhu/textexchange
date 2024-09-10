// Initialize placeholders when loading
window.onload = function () {
    if (localStorage.getItem('mainText')) {
        document.getElementById('main-text').value = localStorage.getItem('mainText');
    }
    if (localStorage.getItem('placeholders')) {
        const placeholders = JSON.parse(localStorage.getItem('placeholders'));
        placeholders.forEach((placeholder, index) => addPlaceholder(placeholder.key, placeholder.value, index + 1));
    } else {
        addPlaceholder('', '', 1);
    }
    updatePreview();
};

// Add placeholder with number and delete button
function addPlaceholder(key = '', value = '', number = null) {
    const placeholderDiv = document.createElement('div');
    const placeholderIndex = number || document.querySelectorAll('#placeholders div').length + 1;

    placeholderDiv.setAttribute('data-number', `セット ${placeholderIndex}`);
    placeholderDiv.innerHTML = `
        <input type="text" placeholder="プレースホルダー" value="${key}" class="placeholder-key">
        <input type="text" placeholder="置換する内容" value="${value}" class="placeholder-value">
        <button class="delete-btn">削除</button>
    `;

    // Add delete functionality
    placeholderDiv.querySelector('.delete-btn').addEventListener('click', function () {
        placeholderDiv.remove();
        renumberPlaceholders();
        saveData();
        updatePreview();
    });

    document.getElementById('placeholders').appendChild(placeholderDiv);
    saveData();
}

// Update placeholder numbers after deletion
function renumberPlaceholders() {
    document.querySelectorAll('#placeholders div').forEach(function (div, index) {
        div.setAttribute('data-number', `セット ${index + 1}`);
    });
}

// Save data to localStorage
function saveData() {
    const mainText = document.getElementById('main-text').value;
    localStorage.setItem('mainText', mainText);

    const placeholders = [];
    document.querySelectorAll('#placeholders div').forEach(function (div) {
        const key = div.querySelector('.placeholder-key').value;
        const value = div.querySelector('.placeholder-value').value;
        placeholders.push({ key, value });
    });
    localStorage.setItem('placeholders', JSON.stringify(placeholders));
}

// Update preview in real-time
function updatePreview() {
    let previewText = document.getElementById('main-text').value;
    document.querySelectorAll('#placeholders div').forEach(function (div) {
        const key = div.querySelector('.placeholder-key').value;
        const value = div.querySelector('.placeholder-value').value;
        if (key) {
            const regex = new RegExp(`\\[${key}\\]`, 'g');
            previewText = previewText.replace(regex, value);
        }
    });
    document.getElementById('preview').innerHTML = previewText;
}

// Add new placeholder set when clicking the button
document.getElementById('add-placeholder').addEventListener('click', function () {
    addPlaceholder();
});

// Save text input and placeholder changes
document.getElementById('main-text').addEventListener('input', function () {
    saveData();
    updatePreview();
});

document.getElementById('placeholders').addEventListener('input', function () {
    saveData();
    updatePreview();
});

// Copy preview text to clipboard
document.getElementById('copy').addEventListener('click', function () {
    const previewText = document.getElementById('preview').textContent;
    navigator.clipboard.writeText(previewText).then(() => {
        alert('クリップボードにコピーされました');
    });
});
