// ==UserScript==
// @name         ChatGPT Prompt Manager
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Manages custom prompts for ChatGPT with a dropdown menu
// @author       You
// @match        https://chatgpt.com/*
// @grant        none
// ==/UserScript==



(function () {
  'use strict';

  const localKey = "chatgpt_prompt_objects";
  let prompts = [];

  function loadPrompts() {
    const data = localStorage.getItem(localKey);
    try {
      prompts = data ? JSON.parse(data) : [];
    } catch (e) {
      prompts = [];
    }
  }

  function savePrompts() {
    localStorage.setItem(localKey, JSON.stringify(prompts));
  }

  function insertPrompt(content) {
    const editor = document.querySelector("#prompt-textarea");
    if (editor) {
      editor.focus();
      document.getSelection().selectAllChildren(editor);
      document.execCommand("delete", false, null);
      document.execCommand("insertText", false, content);
    } else {
      alert("Prompt input not found!");
    }
  }

  function createPromptMenu() {
    loadPrompts();

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.top = "50px";
    wrapper.style.right = "20px";
    wrapper.style.zIndex = 9999;
    wrapper.style.fontFamily = "Arial";

    const menuBtn = document.createElement("button");
    menuBtn.textContent = "☰";
    menuBtn.style.color = "#000";
    menuBtn.style.fontSize = "20px";
    menuBtn.style.padding = "6px 12px";
    menuBtn.style.marginBottom = "5px";
    menuBtn.style.borderRadius = "6px";
    menuBtn.style.border = "1px solid #ccc";
    menuBtn.style.background = "#f9f9f9";
    menuBtn.style.cursor = "pointer";
    menuBtn.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";

    const dropdown = document.createElement("div");
    dropdown.style.display = "none";
    dropdown.style.marginTop = "10px";
    dropdown.style.background = "#fff";
    dropdown.style.border = "1px solid #ccc";
    dropdown.style.borderRadius = "8px";
    dropdown.style.padding = "10px";
    dropdown.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    dropdown.style.minWidth = "300px";

    const select = document.createElement("select");
    select.style.marginBottom = "10px";
    select.style.width = "100%";
    select.style.padding = "5px";
    select.style.border = "1px solid #ccc";
    select.style.borderRadius = "4px";
    select.style.color = "#000";

function refreshOptions(selectedIndex = null) {
  select.innerHTML = "";

  // ➕ Thêm option "No prompt"
  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "-- No prompt --";
  select.appendChild(emptyOption);

  prompts.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = item.title || `Prompt ${index + 1}`;
    select.appendChild(option);
  });

  // ✅ Không chọn gì cả lúc đầu hoặc chọn lại mục đã được chỉ định
  if (selectedIndex !== null) {
    select.selectedIndex = selectedIndex + 1; // +1 vì có thêm "-- No prompt --"
  } else {
    select.selectedIndex = 0;
  }
}


select.onchange = () => {
  const editor = document.querySelector("#prompt-textarea");

  if (select.value === "") {
    // Khi chọn "-- No prompt --", xóa nội dung input
    if (editor) {
      editor.focus();
      document.getSelection().selectAllChildren(editor);
      document.execCommand("delete", false, null);
    }
    return;
  }

  const selected = parseInt(select.value);
  if (!isNaN(selected)) {
    insertPrompt(prompts[selected].content);
  }
};





    refreshOptions();

    const formWrapper = document.createElement("div");
    formWrapper.style.display = "none";
    formWrapper.style.marginTop = "10px";

    const titleInput = document.createElement("input");
    titleInput.placeholder = "Title";
    titleInput.style.width = "100%";
    titleInput.style.marginBottom = "5px";
    titleInput.style.padding = "6px";
    titleInput.style.color = "#000";
    titleInput.style.border = "1px solid #ccc";
    titleInput.style.borderRadius = "4px";

    const contentInput = document.createElement("textarea");
    contentInput.placeholder = "Prompt content...";
    contentInput.style.width = "100%";
    contentInput.style.height = "100px";
    contentInput.style.padding = "6px";
    contentInput.style.marginBottom = "5px";
    contentInput.style.color = "#000";
    contentInput.style.border = "1px solid #ccc";
    contentInput.style.borderRadius = "4px";

    const saveFormBtn = document.createElement("button");
    saveFormBtn.textContent = "💾 Save";
    saveFormBtn.style.color = "#000";
    saveFormBtn.style.marginRight = "5px";
    saveFormBtn.style.padding = "6px 10px";
    saveFormBtn.style.border = "1px solid #ccc";
    saveFormBtn.style.borderRadius = "4px";

    const cancelFormBtn = document.createElement("button");
    cancelFormBtn.textContent = "❌ Cancel";
    cancelFormBtn.style.color = "#000";
    cancelFormBtn.style.padding = "6px 10px";
    cancelFormBtn.style.border = "1px solid #ccc";
    cancelFormBtn.style.borderRadius = "4px";

    formWrapper.appendChild(titleInput);
    formWrapper.appendChild(contentInput);
    formWrapper.appendChild(saveFormBtn);
    formWrapper.appendChild(cancelFormBtn);

    let editingIndex = null;

    const controlRow = document.createElement("div");
    controlRow.style.display = "flex";
    controlRow.style.justifyContent = "flex-end";
    controlRow.style.marginBottom = "10px";
    const addBtn = document.createElement("button");
    addBtn.textContent = "➕";
    addBtn.style.fontSize = "18px";
    addBtn.style.marginRight = "8px";

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.style.fontSize = "18px";
    editBtn.style.marginRight = "8px";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.style.fontSize = "18px";

    [addBtn, editBtn, deleteBtn].forEach(btn => {
      btn.style.padding = "6px 10px";
      btn.style.border = "1px solid #ccc";
      btn.style.borderRadius = "6px";
      btn.style.cursor = "pointer";
      btn.style.background = "#fff";
    });

    addBtn.onclick = () => {
      editingIndex = null;
      titleInput.value = "";
      contentInput.value = "";
      formWrapper.style.display = "block";
    };

    editBtn.onclick = () => {
      const selected = parseInt(select.value);
      if (isNaN(selected)) return;
      editingIndex = selected;
      titleInput.value = prompts[selected].title;
      contentInput.value = prompts[selected].content;
      formWrapper.style.display = "block";
    };

    deleteBtn.onclick = () => {
      const selected = parseInt(select.value);
      if (isNaN(selected)) return;
      if (confirm("Delete this prompt?")) {
        prompts.splice(selected, 1);
        savePrompts();
        refreshOptions();
      }
    };

    controlRow.appendChild(addBtn);
    controlRow.appendChild(editBtn);
    controlRow.appendChild(deleteBtn);

    saveFormBtn.onclick = () => {
      const title = titleInput.value.trim();
      const content = contentInput.value.trim();
      if (!title || !content) return alert("Fields cannot be empty!");

      let selectedAfter = 0;
      if (editingIndex !== null) {
        prompts[editingIndex] = { title, content };
        selectedAfter = editingIndex;
      } else {
        prompts.push({ title, content });
        selectedAfter = prompts.length - 1;
      }
      savePrompts();
      refreshOptions(selectedAfter);
        insertPrompt(prompts[selectedAfter].content);

      formWrapper.style.display = "none";
    };

    cancelFormBtn.onclick = () => {
      formWrapper.style.display = "none";
    };

    menuBtn.onclick = () => {
      dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
    };

    dropdown.appendChild(select);
    dropdown.appendChild(controlRow);
    dropdown.appendChild(formWrapper);

    wrapper.appendChild(menuBtn);
    wrapper.appendChild(dropdown);
    document.body.appendChild(wrapper);
  }

  const waitInterval = setInterval(() => {
    if (document.querySelector("#prompt-textarea")) {
      clearInterval(waitInterval);
      createPromptMenu();
    }
  }, 1000);
})();
