/*----------------------------------------------------------------------------*
 *JJTM, FEB-22-2018
 *This file contains the code related to user interface event handling.
 *tasksController is "linked" to tasks.html by the following call in
 *tasks.html: 
 *
 *<script src="./javascript/tasks-controller.js"></script>
 * .
 * .
 *$(document).ready(
 *	function(){
 *		tasksController.init($('#taskPage'));
 *	}
 *)
 *----------------------------------------------------------------------------*/
tasksController=function(){
	var taskPage;
	var initialised=false;


	/*----------------------------------------------------------------------------*
	 *Added after creating tasks-webstorage.js
 	 *----------------------------------------------------------------------------*/
	function errorLogger(errorCode, errorMessage){
		console.log(errorCode+':'+errorMessage);
	}



	return{
		init:function(page){	
			/*----------------------------------------------------------------------------*
	 		 *Added after creating tasks-webstorage.js
 	 		 *----------------------------------------------------------------------------*/
			storageEngine.init(
				function(){
					storageEngine.initObjectStore('task',
							function(){
							},
							errorLogger);
					}, errorLogger
				);

			if (!initialised){
				taskPage=page;
				$(taskPage).find('[required="required"]').prev('label').append('<span></span>').children('span').addClass('required');
				$(taskPage).find('tbody tr:even').addClass('even');
				
				$(taskPage).find('#btnAddTask').click(
					/*-----------------------------------------*
           *	Anonymous function.  Argument to
					 * 	click function.
					 *-----------------------------------------*/
					function(evt){
						evt.preventDefault();
						$(taskPage).find('#taskCreation').removeClass('not');
					}
				);

				$(taskPage).find('tbody tr').click(
					/*-----------------------------------------*
           *	Anonymous function.  Argument to
					 * 	click function.
					 *-----------------------------------------*/
					function(evt){
/*
						$(evt.target).closest('td').siblings().andSelf().toggleClass('rowHighlight');			
*/
						$(evt.target).closest('td').siblings().addBack().toggleClass('rowHighlight');			
					}
				);

				$(taskPage).find('#tblTasks tbody').on('click', '.deleteRow',
					/*-----------------------------------------*
           *	Anonymous function.  3rd argument to
					 * 	click function.
					 *-----------------------------------------*/
					function(evt){
						evt.preventDefault();
/*
						$(evt.target).parents('tr').remove();
*/
						storageEngine.delete('task', $(evt.target).data().taskId,
							function(){
								$(evt.target).parents('tr').remove();
							},
							errorLogger);
					}
				);

				$(taskPage).find('#saveTask').click(
					/*-----------------------------------------*
           *	Anonymous function.  3rd argument to
					 * 	click function.
					 *-----------------------------------------*/
					function(evt){
						evt.preventDefault();
						if ($(taskPage).find('form').valid()){
							var task=$('form').toObject();
							storageEngine.save('task',task,
								/*function(savedTask){
									$('#taskRow').tmpl(savedTask).appendTo($(taskPage).find('#tblTasks tbody'));
								}*/
								function(){
									$(taskPage).find('#tblTasks tbody').empty(); 
									tasksController.loadTasks(); 
									$(':input').val(''); 
									$(taskPage).find('#taskCreation').addClass('not');
								},
								errorLogger);
						};
					}
				);

				initialised=true;
			}

			/*-------------------------------------------------------------------*
		 	 *	After tasks-webstorage.js
		 	 *-------------------------------------------------------------------*/
			$(taskPage).find('#tblTasks tbody'). on('click', '.editRow', 
				function(evt) { 
					$(taskPage).find('#taskCreation').removeClass('not'); 
					storageEngine.findById('task', $(evt.target).data().taskId, 
					function(task) { 
						$(taskPage).find('form').fromObject(task); 
					}, 
					errorLogger); 
				} 
			); 


			
		},

		/*-------------------------------------------------------------------*
		 *	After tasks-webstorage.js
		 *-------------------------------------------------------------------*/
		loadTasks:function(){
			storageEngine.findAll('task',
				function(tasks){
					$.each(tasks,
					function(index,task){
						$('#taskRow').tmpl(task).appendTo($(taskPage).find('#tblTasks tbody'));	
					});
				}, errorLogger);
		}
		
	}
}();
