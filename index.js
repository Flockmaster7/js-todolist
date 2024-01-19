const list = {
  todoList: [],
  doneList: [],
};

const addInput = document.getElementById("add");
const todoListElement = document.getElementById("todoList");
const doneListElement = document.getElementById("doneList");
const todoTotal = document.getElementById("todoTotal");
const doneTotal = document.getElementById("doneTotal");
const listContainerElement = document.querySelector(".list-container");

let count = 0;

todoListElement.addEventListener("dblclick", openUpdateInput);
todoListElement.addEventListener("click", handlerClick);
todoListElement.addEventListener("keydown", updateTodo);
todoListElement.addEventListener("focusout", updateInputBlur);
listContainerElement.addEventListener("scroll", handlerScroll);

doneListElement.addEventListener("click", handlerClick);

const itemSize = 52;
const height = 860;

let scrollTop = 0;

function handlerScroll(e) {
  scrollTop = e.target.scrollTop;
  render();
}

function calculateIndex() {
  const startIndex = Math.floor(scrollTop / itemSize);
  const finialStartIndex = Math.max(0, startIndex - 4);
  const visitNum = Math.ceil(height / itemSize);
  const endIndex = Math.min(list.todoList.length, startIndex + visitNum + 4);
  const whiteBoxPadding = (startIndex - 1) * itemSize;

  return {
    startIndex,
    finialStartIndex,
    endIndex,
    whiteBoxPadding,
  };
}

function render() {
  const { startIndex, finialStartIndex, whiteBoxPadding, endIndex } =
    calculateIndex();
  let newTodoList = "";
  for (let i = finialStartIndex; i < endIndex; i++) {
    const item = `
            <li class="item" draggable="true" id="${list.todoList[i].id}" ${
      i === finialStartIndex && startIndex !== 0
        ? 'style="padding-bottom:' + whiteBoxPadding + "px;"
        : ""
    }>
              <div class="left">
                <input id="${
                  list.todoList[i].id
                }" type="checkbox" class="checkbox-input" />
                <span id="span-${list.todoList[i].id}">${
      list.todoList[i].value
    }</span>
                <input type="text" class="update-input" id="input-${
                  list.todoList[i].id
                }" style="display: none;"/>
              </div>
              <span id="todoRemove-${
                list.todoList[i].id
              }" class="right">-</span>
            </li>
          `;
    newTodoList += item;
  }

  const newDoneList = list.doneList.map((item) => {
    return `
          <li class="item disabled" draggable="true" id="${item.id}">
            <div class="left">
              <input type="checkbox" class="checkbox-input" checked disabled />
              <span>${item.value}</span>
            </div>
            <span id="doneRemove-${item.id}" class="right">-</span>
          </li>
        `;
  });
  todoListElement.innerHTML = newTodoList;
  doneListElement.innerHTML = newDoneList.join("");
  todoTotal.innerHTML = list.todoList.length;
  doneTotal.innerHTML = list.doneList.length;

  if (listContainerElement.offsetHeight >= 850) {
    todoListElement.style.height = itemSize * list.todoList.length + "px";
  }
}

function handlerClick(e) {
  if (e.target.classList[0] === "checkbox-input") {
    done(Number(e.target.id));
  } else if (e.target.id.split("-").indexOf("todoRemove") !== -1) {
    removeTodo(e.target.id);
  } else if (e.target.id.split("-").indexOf("doneRemove") !== -1) {
    todo(e.target.id);
  }
}

function addTodo() {
  if (window.event.keyCode == 13 && addInput.value.trim().length !== 0) {
    const item = addInput.value;
    list.todoList.unshift({
      id: count++,
      value: item,
      check: false,
    });
    addInput.value = "";
    render();
  }
}

function addLargeTodo(todoCount) {
  console.time();
  list.todoList.reverse();
  for (let i = 0; i < todoCount; i++) {
    list.todoList.push({
      id: count++,
      value: count,
      check: false,
    });
  }
  list.todoList.reverse();
  console.timeEnd();
  addInput.value = "";
  requestAnimationFrame(() => {
    render();
  });
}

function removeTodo(targetId) {
  const id = Number(targetId.split("-")[1]);
  list.todoList = list.todoList.filter((item) => {
    return item.id !== id;
  });
  render();
}

function openUpdateInput(e) {
  if (e.target.nodeName !== "SPAN") return;
  const id = e.target.id.split("-")[1];
  const itemUpdateInput = document.getElementById(`input-${id}`);
  itemUpdateInput.style.display = "block";
  itemUpdateInput.focus();
  e.target.style.display = "none";
}

function updateInputBlur(e) {
  if (!e.target.id.includes("input-")) return;
  const id = e.target.id.split("-")[1];
  const itemUpdateValue = document.getElementById(`span-${id}`);
  e.target.style.display = "none";
  itemUpdateValue.style.display = "block";
}

function updateTodo(e) {
  const id = Number(e.target.id.split("-")[1]);
  if (window.event.keyCode === 13 && e.target.value.trim().length !== 0) {
    for (let i = 0; i < list.todoList.length; i++) {
      if (list.todoList[i].id === id) {
        list.todoList[i].value = e.target.value;
        break;
      }
    }
    render();
  }
}

function doneOperator(id) {
  const doneItem = list.todoList.find((item) => {
    return item.id === id;
  });
  list.doneList.push(doneItem);
  list.todoList = list.todoList.filter((item) => {
    return item.id !== id;
  });
}

function todoOperator(targetId) {
  const id = Number(targetId.includes("-") ? targetId.split("-")[1] : targetId);
  const doneItem = list.doneList.find((item) => {
    return item.id === id;
  });
  list.todoList.push(doneItem);
  list.doneList = list.doneList.filter((item) => {
    return item.id !== id;
  });
}

function done(id) {
  doneOperator(id);
  render();
}

function todo(id) {
  todoOperator(id);
  render();
}

let current;

function dragstart(e) {
  setTimeout(() => {
    e.target.classList.add("moving");
  });
  e.dataTransfer.effectAllowed = "move";
  current = e.target;
}

function dragover(e) {
  e.preventDefault();
}

function dragend(e) {
  e.target.classList.remove("moving");
  console.log(e.target);
  render();
}

function curryChangeList(arr) {
  return function (id1, id2) {
    const tarIndex = arr.findIndex((item) => item.id === Number(id1));
    const curIndex = arr.findIndex((item) => item.id === Number(id2));
    [arr[tarIndex], arr[curIndex]] = [arr[curIndex], arr[tarIndex]];
  };
}

function transformTodoFromDone(id1, id2) {
  const doneIndex = list.doneList.findIndex((item) => item.id === Number(id2));
  const todoIndex = list.todoList.findIndex((item) => item.id === Number(id1));
  list.todoList.splice(todoIndex, 0, list.doneList[doneIndex]);
  list.doneList.splice(doneIndex, 1);
}

function transformDonefromTodo(id1, id2) {
  const todoIndex = list.todoList.findIndex((item) => {
    return item.id === Number(id2);
  });
  const doneIndex = list.doneList.findIndex((item) => item.id === Number(id1));
  list.doneList.splice(doneIndex + 1, 0, list.todoList[todoIndex]);
  list.todoList.splice(todoIndex, 1);
}

todoListElement.ondragstart = dragstart;
todoListElement.ondragend = dragend;
todoListElement.ondragover = dragover;
todoListElement.ondragenter = function (e) {
  if (e.target == todoListElement) {
    if (todoListElement.childNodes.length === 0) {
      todoOperator(current.id);
    }
    return;
  }
  if (e.target == current) return;
  const childrenList = Array.from(todoListElement.childNodes);
  const draggingItmeIndex = childrenList.indexOf(current);
  const targetItemIndex = childrenList.indexOf(e.target);
  if (
    list.todoList.findIndex((item) => item.id === Number(current.id)) === -1
  ) {
    transformTodoFromDone(e.target.id, current.id);
  } else {
    curryChangeList(list.todoList)(Number(e.target.id), Number(current.id));
  }

  if (draggingItmeIndex < targetItemIndex) {
    todoListElement.insertBefore(current, e.target.nextElementSibling);
  } else {
    todoListElement.insertBefore(current, e.target);
  }
};

doneListElement.ondragover = dragover;
doneListElement.ondragstart = dragstart;
doneListElement.ondragend = dragend;
doneListElement.ondragenter = function (e) {
  e.preventDefault();
  if (e.target == doneListElement) {
    if (doneListElement.childNodes.length === 0) {
      doneOperator(Number(current.id));
    }
    return;
  }
  if (e.target == current) return;

  const childrenList = Array.from(doneListElement.childNodes);
  const draggingItmeIndex = childrenList.indexOf(current);
  const targetItemIndex = childrenList.indexOf(e.target);

  if (
    list.doneList.findIndex((item) => item.id === Number(current.id)) === -1
  ) {
    transformDonefromTodo(e.target.id, current.id);
  } else {
    curryChangeList(list.doneList)(Number(e.target.id), Number(current.id));
  }

  if (draggingItmeIndex < targetItemIndex) {
    doneListElement.insertBefore(current, e.target.nextElementSibling);
  } else {
    doneListElement.insertBefore(current, e.target);
  }
};
