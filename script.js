let tabCount = 0;
let currentTab = null;

window.onload = function () {
    if (localStorage.getItem('tabs')) {
        const tabs = JSON.parse(localStorage.getItem('tabs'));
        tabs.forEach((tabData, index) => addTab(tabData, index + 1));
    } else {
        addTab(null, 1); // Add a default tab on load
    }
    setTimeout(() => {
        updateAllPreviews(); // Ensure previews are updated after loading
    }, 0);
};

// Function to add a new tab
function addTab(tabData = null, tabIndex = null) {
    tabCount++;
    const tabList = document.getElementById('tab-list');
    const tabItem = document.createElement('li');
    const currentTabIndex = tabIndex || tabCount;

    tabItem.textContent = `セット ${currentTabIndex}`;
    tabItem.dataset.index = currentTabIndex;
    tabItem.addEventListener('click', function () {
        setActiveTab(currentTabIndex);
    });

    tabList.appendChild(tabItem);

    // Create the corresponding set container (hidden initially)
    const setContainer = document.createElement('div');
    setContainer.classList.add('set-container');
    setContainer.id = `set-container-${currentTabIndex}`;
    setContainer.style.display = 'none'; // Hidden by default

    // Adding HTML structure for dynamic placeholders
    setContainer.innerHTML = `
        <textarea class="main-text" placeholder="テキストを入力してください...">${tabData?.text || ''}</textarea>
        <div class="placeholder-container">
            ${tabData?.placeholders ? tabData.placeholders.map(createPlaceholderHTML).join('') : ''}
        </div>
        <button class="add-placeholder-btn">プレースホルダーを追加</button>
        <h3>リアルタイムプレビュー</h3>
        <div class="preview"></div>
        <button class="copy-btn">プレビューをコピー</button>
        <button class="delete-set-btn">削除</button>
    `;

    // Delete set button functionality
    setContainer.querySelector('.delete-set-btn').addEventListener('click', function () {
        tabItem.remove();
        setContainer.remove();
        renumberTabs();
        saveTabs();
    });

    // Copy preview functionality
    setContainer.querySelector('.copy-btn').addEventListener('click', function () {
        const previewText = setContainer.querySelector('.preview').textContent;
        navigator.clipboard.writeText(previewText).then(() => {
            alert('プレビューがクリップボードにコピーされました');
        });
    });

    // Add placeholder button functionality
    const addPlaceholderBtn = setContainer.querySelector('.add-placeholder-btn');
    addPlaceholderBtn.addEventListener('click', function () {
        const placeholderContainer = setContainer.querySelector('.placeholder-container');
        const newPlaceholderHTML = createPlaceholderHTML();
        placeholderContainer.insertAdjacentHTML('beforeend', newPlaceholderHTML);
        updateAllPreviews();
        attachPlaceholderEvents(placeholderContainer.lastElementChild); // Attach event listeners to the new placeholder
    });

    // Attach event listeners for placeholders already present (loaded from localStorage)
    setContainer.querySelectorAll('.placeholder-set').forEach(attachPlaceholderEvents);

    // Event listeners for main text
    const mainText = setContainer.querySelector('.main-text');
    mainText.addEventListener('input', updateAllPreviews);

    document.getElementById('sets-container').appendChild(setContainer);

    if (!currentTab) {
        setActiveTab(currentTabIndex); // Activate the first tab
    }

    saveTabs();
    updateAllPreviews(); // Ensure initial preview is updated
}

// Helper function to generate HTML for placeholders
function createPlaceholderHTML(placeholder = { key: '', value: '' }) {
    return `
        <div class="placeholder-set">
            <input type="text" placeholder="プレースホルダー" class="placeholder-key" value="${placeholder.key}">
            <input type="text" placeholder="置換する内容" class="placeholder-value" value="${placeholder.value}">
            <button class="delete-placeholder-btn">削除</button>
        </div>

    `;
}

// Attach event listeners to a placeholder set
function attachPlaceholderEvents(placeholderSet) {
    const placeholderKey = placeholderSet.querySelector('.placeholder-key');
    const placeholderValue = placeholderSet.querySelector('.placeholder-value');
    const deleteBtn = placeholderSet.querySelector('.delete-placeholder-btn');

    // Update preview on input
    placeholderKey.addEventListener('input', updateAllPreviews);
    placeholderValue.addEventListener('input', updateAllPreviews);

    // Delete placeholder set
    deleteBtn.addEventListener('click', function () {
        placeholderSet.remove();
        updateAllPreviews();
    });
}

// Set the active tab
function setActiveTab(tabIndex) {
    document.querySelectorAll('#tab-list li').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`#tab-list li[data-index="${tabIndex}"]`).classList.add('active');

    document.querySelectorAll('.set-container').forEach(container => {
        container.style.display = 'none';
    });
    document.getElementById(`set-container-${tabIndex}`).style.display = 'block';

    currentTab = tabIndex;
}

// Renumber tabs after deletion
function renumberTabs() {
    document.querySelectorAll('#tab-list li').forEach(function (tabItem, index) {
        tabItem.textContent = `セット ${index + 1}`;
        tabItem.dataset.index = index + 1;
        document.getElementById(`set-container-${tabItem.dataset.index}`).id = `set-container-${index + 1}`;
    });
    tabCount = document.querySelectorAll('#tab-list li').length;
}

// Save tabs to localStorage
function saveTabs() {
    const tabsData = [];
    document.querySelectorAll('.set-container').forEach(setContainer => {
        const text = setContainer.querySelector('.main-text').value;
        const placeholders = Array.from(setContainer.querySelectorAll('.placeholder-set')).map(set => ({
            key: set.querySelector('.placeholder-key').value,
            value: set.querySelector('.placeholder-value').value,
        }));
        tabsData.push({ text, placeholders });
    });
    localStorage.setItem('tabs', JSON.stringify(tabsData));
}

// Update all previews
function updateAllPreviews() {
    document.querySelectorAll('.set-container').forEach(setContainer => {
        let previewText = setContainer.querySelector('.main-text').value;
        const placeholders = Array.from(setContainer.querySelectorAll('.placeholder-set'));
        placeholders.forEach(placeholder => {
            const key = placeholder.querySelector('.placeholder-key').value;
            const value = placeholder.querySelector('.placeholder-value').value;
            if (key) {
                const regex = new RegExp(`\\【${key}\\】`, 'g');
                previewText = previewText.replace(regex, value);
            }
        });

        setContainer.querySelector('.preview').textContent = previewText;
    });

    saveTabs(); // Make sure to save after updating previews
}

// Add new tab when button is clicked
document.getElementById('add-tab').addEventListener('click', function () {
    addTab();
});
