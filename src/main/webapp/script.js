/** Element which is chosen by user for now */
let toggledElement = null;

/** Loads list of user tasks from server and puts it into view*/
async function loadToDos() {
  let response = await fetch('/update-local-task-list');
  let tasksList = await response.json();

  const container = document.getElementById('task-container');
  console.log(tasksList);
  container.innerText = '';

  //Debug element
  container.appendChild(createListElement({
    place: {
      string: "place"
    },
    time: {
      date: "date"
    },
    comment: "comment",
    title: "debug"
  }))

  for (const task of tasksList) {
    container.appendChild(createListElement(task));
  }
}

/** Finds a container with task data where current event was called */
function findParentListView(event) {
  for (view of event.path) {
    if (view.localName === "li") {
      return view;
    }
  }
}

async function editFieldData(event) {
  console.log(event)

  const taskView = findParentListView(event);

  if (taskView !== toggledElement) {
    return;
  }

  const elementView = event.path[0];
  const askResult = prompt("Do you want to change this field?",
      elementView.innerText)
  if (askResult == null) {
    return;
  }
  elementView.innerText = askResult;
  const requestParams = "field=" + elementView.className + "&type=edit&"
      + "new_data=" + askResult + "&number=" + taskView.id;

  let req1 = fetch('/update-server-task-list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: requestParams
  });

  let req2 = fetch('/update-local-task-list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: requestParams
  });

  await req1
  await req2;
}

function createTaskCommentElement(task) {
  const taskCommentElement = document.createElement("input");
  taskCommentElement.setAttribute("class", "task_commentData");
  taskCommentElement.setAttribute("id", "comment" + task.datastoreId);
  //taskCommentElement.addEventListener("click", editFieldData);
  taskCommentElement.setAttribute("readonly", "readonly");
  taskCommentElement.setAttribute("value", task.comment);
  return taskCommentElement;
}

function createTaskTimeElement(task) {
  const taskTimeElement = document.createElement("input");
  taskTimeElement.setAttribute("class", "task_timeData");
  taskTimeElement.setAttribute("id", "time" + task.datastoreId);
  taskTimeElement.setAttribute("readonly", "readonly");
  //taskTimeElement.addEventListener("click", editFieldData);
  taskTimeElement.setAttribute("value", task.time.date);
  return taskTimeElement;
}

function createTaskTitleElement(task) {
  const taskTitleElement = document.createElement("input");
  taskTitleElement.setAttribute("class", "task_titleData");
  taskTitleElement.setAttribute("id", "title" + task.datastoreId);
  taskTitleElement.setAttribute("readonly", "readonly");
  //taskTitleElement.addEventListener("click", editFieldData);
  taskTitleElement.setAttribute("value", task.title);

  return taskTitleElement;
}

function createTaskPlaceElement(task) {
  const taskPlaceElement = document.createElement("input");
  taskPlaceElement.setAttribute("class", "task_placeData");
  taskPlaceElement.setAttribute("id", "place" + task.datastoreId);
  taskPlaceElement.setAttribute("readonly", "readonly");
  //taskPlaceElement.addEventListener("click", editFieldData);
  taskPlaceElement.setAttribute("value", task.place.name);
  return taskPlaceElement;
}

function getConfirmation() {
  return confirm("Do you really want to remove this task?");
}

/** Removes task which is connected with this view */
async function removeElement(view) {
  if (view === toggledElement) {
    untoggleElement();
  }

  const notificationText = "type=delete&number=" + view.id;
  await fetch('/update-server-task-list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: notificationText
  });

  await fetch('/update-local-task-list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: notificationText
  })

  view.remove();
}

function doRemoveEvent(event) {
  const view = findParentListView(event);
  const result = getConfirmation();
  if (result) {
    removeElement(view);
  }
}

function createButtonElements() {
  const buttonHolder = document.createElement("div");
  buttonHolder.setAttribute("class", "task_buttonHolder");

  const removeButton = document.createElement("img")
  removeButton.setAttribute("class", "task_button")
  removeButton.addEventListener("click", doRemoveEvent);
  removeButton.setAttribute("src", "./images/clear-48dp.svg");

  buttonHolder.appendChild(removeButton);
  return buttonHolder;
}

function buildTaskRightPanel(task) {
  const taskRightPanel = document.createElement("div");

  taskRightPanel.setAttribute("class", "task_rightPanel");

  taskRightPanel.appendChild(createButtonElements());
  taskRightPanel.appendChild(createTaskTimeElement(task));
  taskRightPanel.appendChild(createTaskPlaceElement(task));
  return taskRightPanel;
}

function buildMainTaskDataPanel(task) {
  const mainTaskPanel = document.createElement("div");
  mainTaskPanel.appendChild(createTaskTitleElement(task));
  mainTaskPanel.appendChild(createTaskCommentElement(task));
  return mainTaskPanel;
}

function toggleElement(element) {
  const id = element.id;
  element.setAttribute("class",
      "tasklist_node_chosen shadowed_chosen_element")
  toggledElement = element

  const comment = document.getElementById("comment" + id)
  const title = document.getElementById("title" + id)
  const place = document.getElementById("place" + id)
  const time = document.getElementById("time" + id)

  comment.setAttribute("class", "task_commentData_chosen");
  comment.removeAttribute("readonly");

  title.setAttribute("class", "task_titleData_chosen");
  title.removeAttribute("readonly");

  place.setAttribute("class", "task_placeData_chosen");
  place.removeAttribute("readonly");

  time.setAttribute("class", "task_timeData_chosen");
  time.removeAttribute("readonly");
}

function untoggleElement() {
  if (toggledElement === null) {
    return;
  }

  const id = toggledElement.id;
  toggledElement.setAttribute("class",
      "tasklist_node shadowed_element");

  const comment = document.getElementById("comment" + id)
  const title = document.getElementById("title" + id)
  const place = document.getElementById("place" + id)
  const time = document.getElementById("time" + id)

  comment.setAttribute("class", "task_commentData");
  comment.setAttribute("readonly", "readonly");

  title.setAttribute("class", "task_titleData");
  title.setAttribute("readonly", "readonly");

  place.setAttribute("class", "task_placeData");
  place.setAttribute("readonly", "readonly");

  time.setAttribute("class", "task_timeData");
  time.setAttribute("readonly", "readonly");
  toggledElement = null;
}

function doToggleEvent(event) {
  console.log(event)

  let currentElement;
  for (const view of event.path) {
    if (view.localName === "li") {
      currentElement = view;
    }
  }

  if (toggledElement != null) {
    if (currentElement === toggledElement) {
      untoggleElement()
      return
    } else {
      untoggleElement();
    }
  }

  toggleElement(currentElement)
}

function createListElement(task) {
  const liElement = document.createElement("li");
  liElement.setAttribute("class", "tasklist_node shadowed_element");
  liElement.setAttribute("id", task.datastoreId);

  liElement.addEventListener("click", doToggleEvent)

  liElement.appendChild(buildMainTaskDataPanel(task));
  liElement.appendChild(buildTaskRightPanel(task))
  return liElement;
}

async function addNewView(event) {
  untoggleElement();

  console.log(event);
  const requestParams = "type=add&task-text=title&task-place=place&task-comment=comment&task-date=date";
  const response = await fetch('/update-local-task-list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: requestParams
  });

  const task = await response.json();

  const newListElement = createListElement(task);
  document.getElementById('task-container')
  .appendChild(newListElement);
  toggleElement(newListElement);
}

async function buildComposeButton() {
  const btnElement = document.getElementById("task-composer-button");
  btnElement.addEventListener("click", addNewView);

}

async function doPreparation() {
  await loadToDos();
  await buildComposeButton();
}
