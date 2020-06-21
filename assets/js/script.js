var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
	// create elements that make up a task item
	var taskLi = $('<li>').addClass('list-group-item');
	var taskSpan = $('<span>').addClass('badge badge-primary badge-pill').text(taskDate);
	var taskP = $('<p>').addClass('m-1').text(taskText);

	// append span and p element to parent li
	taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

	// append to ul list on the page
  $('#list-' + taskList).append(taskLi);
  
};

var loadTasks = function() {
	tasks = JSON.parse(localStorage.getItem('tasks'));

	// if nothing in localStorage, create a new object to track all task status arrays
	if (!tasks) {
		tasks = {
			toDo       : [],
			inProgress : [],
			inReview   : [],
			done       : []
		};
	}

	// loop over object properties
	$.each(tasks, function(list, arr) {
		// then loop over sub-array
		arr.forEach(function(task) {
			createTask(task.text, task.date, list);
		});
	});
};

var saveTasks = function() {
	localStorage.setItem('tasks', JSON.stringify(tasks));
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

// DUE DATE WAS CLICKED -- CHANGE DATE SPAN TO INPUT
$('.list-group').on('click', 'span', function() {
	// get current text
	var date = $(this).text().trim();

	// create new input element
  var dateInput = $('<input>')
    .attr('type', 'text')
    .addClass('form-control')
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // enable jQuery UI datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // when calendar is closed, force a 'change' event on the 'dateInput'
      $(this).trigger('change');
    }
  })

  // automatically focus on new element
  dateInput.trigger('focus');
});

// WHEN USER CLICKS OUTSIDE OF DATE INPUT, SAVE/UPDATE VALUES IN TASKS OBJECT, RESET UI
$('.list-group').on('change', 'input[type="text"]', function() {
  // get current text
  var date = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest('.list-group')
    .attr('id')
    .replace('list-', '');

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest('.list-group-item')
    .index();

  // update task in array and re-save to localStorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $('<span>')
    .addClass('badge badge-primary badge-pill')
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);

  // pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest('.list-group-item'));
})

// modal was triggered
$('#task-form-modal').on('show.bs.modal', function() {
	// clear values
	$('#modalTaskDescription, #modalDueDate').val('');
});

// modal is fully visible
$('#task-form-modal').on('shown.bs.modal', function() {
	// highlight textarea
	$('#modalTaskDescription').trigger('focus');
});

// save button in modal was clicked
$('#task-form-modal .btn-save').click(function() {
	// get form values
	var taskText = $('#modalTaskDescription').val();
	var taskDate = $('#modalDueDate').val();

	if (taskText && taskDate) {
		createTask(taskText, taskDate, 'toDo');

		// close modal
		$('#task-form-modal').modal('hide');

		// save in tasks array
		tasks.toDo.push({
			text : taskText,
			date : taskDate
		});

		saveTasks();
	}
});

// remove all tasks
$('#remove-tasks').on('click', function() {
	for (var key in tasks) {
		tasks[key].length = 0;
		$('#list-' + key).empty();
	}
	saveTasks();
});


// INTERACTIONS

// SORTABLE TASKS
$('.card .list-group').sortable({
  connectWith: $('.card .list-group'),
  scroll: false, 
  tolerance: 'pointer',
  helper: 'clone',
  activate: function(event) {
    $(this).addClass('dropover');
    $('.bottom-trash').addClass('bottom-trash-drag');
  },
  deactivate: function(event) {
    $(this).removeClass('dropover');
    $('.bottom-trash').removeClass('bottom-trash-drag');
  }, 
  over: function(event) {
    $(event.target).addClass('dropover-active');
  },
  out: function(event) {
    $(this).removeClass('dropover-active');
  },
  // fired when contents have been re-ordered within a list, when an item is removed from a list, or when an item is added to a list.  so moving from one column to the other will fire the update method on both moved from and moved to columns
  update: function(event) {
    // array to store the task data in
    var tempArr = [];

    // loop over current set of children in sortable list.  in the case of a task moving from one column to another, each column (.list-group) will have it's own children that it will push into it's own tempArr with the object data for the task
    $(this).children().each(function() {
      var text = $(this)
        .find('p')
        .text()
        .trim();

      var date = $(this)
        .find('span')
        .text()
        .trim();

      // add task data to the temp array as an object
      tempArr.push({
        text: text, 
        date: date
      })
    });
    // now update the objects in the tasks array with the tempArr for each status
    // trim down list's ID to match object property
    var arrName =$(this)
      .attr('id')
      .replace('list-', '');

    // update array on tasks object for that status type and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
});

// DRAG & DROP
$('#trash').droppable({
  accept: '.card .list-group-item',
  tolerance: 'touch',
  drop: function(event, ui) {
    ui.draggable.remove();
  },
  over: function(event, ui) {
    $('.bottom-trash').addClass('bottom-trash-active');
  },
  out: function(event, ui) {
    $('.bottom-trash').removeClass('bottom-trash-active');
  }
})

// DATE PICKER
$('#modalDueDate').datepicker({
  minDate: 1
});

// DUE DATE INDICATIONS
var auditTask = function(taskEl) {
  // get date from task element
  var date = $(taskEl).find('span').text().trim();


  // convert to moment object at 5:00pm
  var time = moment(date, 'L').set('hour', 17);

  // clear any previously applied time classes from the element
  $(taskEl).removeClass('list-group-item-warning list-group-item-danger');

  // apply new task if task is near/over due date
  if(moment().isAfter(time)) {
    $(taskEl).addClass('list-group-item-danger');
  } else if (Math.abs(moment().diff(time, 'days')) <= 2) {
    $(taskEl).addClass('list-group-item-warning');
  }
  console.log(taskEl);
};

setInterval(function() {
  $('.card .list-group-item').each(function(el) {
    auditTask(el);
  });
}, (1000 * 60) * 30);


// load tasks for the first time
loadTasks();
