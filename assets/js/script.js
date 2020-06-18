var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// P WAS CLICKED -- DELEGATE CLICK LISTENER ON P TO PARENT UL AND REPLACE P WITH TEXTAREA INPUT.  SECOND ARGUMENT OF .ON() IS THE CHILD ELEMENT THAT WILL DELEGATE TO IT'S PARENT THAT .ON() IS ATTACHED TO
$('.list-group').on('click', 'p', function() {
	// store p value
	var text = $(this).text().trim();
	// create new <textarea> element
	var textInput = $('<textarea>')
		// add a class
		.addClass('form-control')
		// populate with stored p text value
		.val(text);
	// replace clicked on p with the new <textarea> element
	$(this).replaceWith(textInput);
	// focus on it --- trigger focus event
	textInput.trigger('focus');
});

// SAVE DATA TO TASKS OBJECT AND UPDATE UI WHEN CLICKED AWAY FROM TEXTAREA
$('.list-group').on('blur', 'textarea', function() {
	// get the textarea's current value/text
	var text = $(this).val().trim();

	// get the parent ul's id attribute
	var status = $(this)
		// parent ul
		.closest('.list-group')
		// get id
		.attr('id')
		// strip out 'list' from id value so we're left with the name of the array (one from the tasks object) the task belongs to
		.replace('list-', '');

	// get the task's position in the list of other li elements
	var index = $(this).closest('.list-group-item').index();

	// access array from tasks object with [] notation, then access the task at the index of the array and create<or>get/set a text property to the value of the text variable
	// tasks[toDo][0].text = text  ...will set it on the first toDo task
	tasks[status][index].text = text;
	saveTasks();

	// recreate p element
	var taskP = $('<p>').addClass('m-1').text(text);

	// replace textarea with p element
	$(this).replaceWith(taskP);
});
// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // automatically focus on new element
  dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("blur", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


