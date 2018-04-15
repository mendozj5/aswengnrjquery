/*----------------------------------------------------------------------------*
 *	Becaue tasksController is assigned to an anonymous class, it
 *	is a singleton. 
 *----------------------------------------------------------------------------*/
tasksController=function(){
	/*-----------------------------------------------------------*
	 *
	 *-----------------------------------------------------------*/
	var taskPage;
	var initialised=false;

	/*----------------------------------------------------------------------------*
	 *Added for "tidy up" chapter
	 *----------------------------------------------------------------------------*/
	function clearTask(){
		$(taskPage).find('form').fromObject({});
	}

	function renderTable(){
		$.each($(taskPage).find('#tblTasks tbody tr'),
			function(idx, row){
				var due=Date.parse($(row).find('[datetime]').text());
				
				if (due.compareTo(Date.today())<0){
					$(row).addClass("overdue");
				}
				else if (due.compareTo((2).days().fromNow())<=0){
					$(row).addClass("warning");
				}
				
			}
		);
	}
	
	/*----------------------------------------------------------------------------*
	 *Added for "tidy up" chapter
	 *----------------------------------------------------------------------------*/
	function taskCountChanged(){
		var count=$(taskPage).find('#tblTasks tbody tr').length;
		
		/*----------------------------------------*
		 *
		 *----------------------------------------*/
		$('footer').find('#taskCount').text(count);		
	}

	/*----------------------------------------------------------------------------*
	 *Added after creating tasks-webstorage.js
 	 *----------------------------------------------------------------------------*/
	function errorLogger(errorCode, errorMessage){
		console.log(errorCode+':'+errorMessage);
	}



	return{
		init:function(page, callback){	
			if (initialised){
				callback();
			}
			else{
				taskPage=page;
				/*----------------------------------------------------------------------------*
		 		 *Added after creating tasks-webstorage.js
	 	 		 *----------------------------------------------------------------------------*/
				storageEngine.init(
					function(){
						storageEngine.initObjectStore('task',
								function(){
									callback();
								},
								errorLogger);
						}, errorLogger
					);

				/*----------------------------------------------------------*
				 *  APR-07-2018
				 *	Begin
	 			 *----------------------------------------------------------*/
				$(taskPage).find('#btnCloseDatabase').click(
					function(evt){
						evt.preventDefault();
						console.log("btnCLoseDatabase");
						storageEngine.closeSession();
				});	
				/*----------------------------------------------------------*
				 *  APR-07-2018
				 *	End
	 			 *----------------------------------------------------------*/
				
				/*----------------------------------------------------------*
	 			 *Added for "tidy up" chapter
	 			 *----------------------------------------------------------*/
				$(taskPage).find('#clearTask').click(function(evt){
					evt.preventDefault();
					clearTask();
				});	

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

				/*-----------------------------------------------------------*
				 *  The following no longer works because this listener
				 *	is added when the screen loads but the tasks have
				 *	not been loaded into the table at that point.	
				 *-----------------------------------------------------------*/
				$(taskPage).find('tbody tr').click(
					function(evt){
						$(evt.target).closest('td').siblings().addBack().toggleClass('rowHighlight');			
					}
				);

/*
						$(evt.target).closest('td').siblings().andSelf().toggleClass('rowHighlight');			
*/

				/*-----------------------------------------------------------*
				 *  The following 
				 *-----------------------------------------------------------*/
/*
				$(taskPage).find('#tblTasks tbody').on('click', 'tr',
					function(evt){
						$(evt.target).closest('td').siblings().addBack().toggleClass('rowHighlight');			
					}
				);
*/


				$(taskPage).find('#tblTasks tbody').on('click', '.deleteRow',
					/*-----------------------------------------*
           *	Anonymous function.  3rd argument to
					 * 	click function.
					 *-----------------------------------------*/
					function(evt){
						evt.preventDefault();
						storageEngine.delete('task', $(evt.target).data().taskId,
							function(){
								$(evt.target).parents('tr').remove();
								/*-------------------------------*
								 *Added for tidy up chapter 11
								 *-------------------------------*/
								taskCountChanged();
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
							/*-----------------------------------------*
							 *	APR-14-2018
							 *-----------------------------------------*/
							storageEngine.save('task',task,
								/*function(savedTask){
									$('#taskRow').tmpl(savedTask).appendTo($(taskPage).find('#tblTasks tbody'));
								}*/
								function(){
									$(taskPage).find('#tblTasks tbody').empty(); 
									tasksController.loadTasks(); 
									/*
									$(':input').val(''); 
									*/
									clearTask();
									$(taskPage).find('#taskCreation').addClass('not');
								},
								errorLogger);
						};
					}
				);

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

				/*---------------------------------------------------------*
				 *	APR-09-2018
				 *---------------------------------------------------------*/
				$(taskPage).find('#tblTasks tbody').on('click', '.completeRow', 
						function(evt){
							storageEngine.findById('task', $(evt.target).data().taskId, 
								function(task) {
										task.complete=true;
										storageEngine.save('task',task,function(){
										tasksController.loadTasks(); 
										}, errorLogger); 
								}, 
								errorLogger); 
						}
				);

				initialised=true;
			}
		},

		/*-------------------------------------------------------------------*
		 *  First and foremost, the following instance method, loadTask,
		 *	is called by the anonymous object defined as the 2nd parameter
		 *	of the anonymous function (i.e. taskController.init)) that is 
		 *	called by the anonymous function that is the only parameter
		 *	of $(document).ready.  $(document).ready is called by initScreen.
		 *
		 *	loadTasks is also called multiple times within this file.
		 *	
		 *	loadTasks' purpose is to load the grid with the details
		 *	(i.e. tasks).  Functionally, the details should be loaded
		 *	(or re-loaded) when 	
		 *-------------------------------------------------------------------*/
		loadTasks:function(){
			$(taskPage).find('#tblTasks body').empty();
			storageEngine.findAll('task',
				function(tasks){
					$.each(tasks,
					function(index,task){
						/*-------------------------------------------------*
						 *	APR-14-2018	
						 *	Ensure incomplete tasks have the complete
						 *	property set to false when the table loads.
						 *-------------------------------------------------*/	
						if (!task.complete){
							task.complete=false;
						}

						/*-------------------------------------------------*
						 *	MAR-01-2018	
						 *	Append row to table.
						 *-------------------------------------------------*/	
						$('#taskRow').tmpl(task).appendTo($(taskPage).find('#tblTasks tbody'));	

						/*-------------------------------------------------*
						 *	APR-09-2018	
						 *	Print fotter at the bottom
						 *-------------------------------------------------*/	
						taskCountChanged();	

						/*-------------------------------------------------*
						 *	APR-09-2018	
						 *	Actually, call to render has been here for 
						 *	a while.  Only change on APR-09 is that, 
						 *	in renderTable, we check dates for highlights,
						 *	depending on date.
						 *-------------------------------------------------*/	
						renderTable();
					});
					/*------------------------*
					 *	Not sure
					 *------------------------*/
/*
					taskCountChanged();	
					renderTable();
*/
			

					
				}, errorLogger);
		}
		
	}
}();
