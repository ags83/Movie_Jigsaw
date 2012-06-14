			var mousePos = {}
			
            window.requestAnimFrame = (function(callback){
                return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function(callback){
                    window.setTimeout(callback, 1000 / 60);
                };
            })();
			
            window.onload = function(){
			
                var canvas = document.getElementById("myCanvas");
				//need temporary canvas to draw the whole video on first to increase fps.
				var _canvas =  document.createElement('canvas');
				_canvas.width = canvas.width;
				_canvas.height = canvas.height;
				
				var _context = _canvas.getContext("2d");

                var context = canvas.getContext("2d");
                var video = document.getElementById("myVideo");
				
				
				var myJigsaw = new Jigsaw(context, video, canvas, _canvas, 3, 3,1);
				
				//Need to pass in some arguments to the listener functions
				dragpeice.jigsaw = droppeice.jigsaw = myJigsaw;
				dragpeice.canvas = canvas;
				
				canvas.addEventListener("mousedown", dragpeice);
				canvas.addEventListener("mouseup", droppeice);
				
				//start rendering
                drawFrame(context, video, canvas, _canvas, _context, myJigsaw);
            };
			
			
			
            
            function drawFrame(context, video, canvas, _canvas,_context, myJigsaw){
				
				context.clearRect(0,0,canvas.width, canvas.height);
				
				//drawing the full video on another invisible canvas first speeds things up by a big factor
				_context.drawImage(video, 0,0)
				
				var draggingpeice = -1;
				var isOver = false;
				var checkIfRight = false;

				//draw a border around the jigsaw area
				context.rect( myJigsaw.x,myJigsaw.y ,myJigsaw.width, myJigsaw.height);
				context.lineWidth = 10;
				context.strokeStyle = "000";
				context.stroke();
				
				
			
				for ( var i = 0; i < myJigsaw.peices.length ; i++){
						
						//if the peice is being dropped or dragged then check if it is close to a grid area to be 'dropped' into
					
					if ( myJigsaw.peices[i].dropped == true ||  myJigsaw.peices[i].dragging == true){	
							
							for ( var gridIndex = 0; gridIndex < myJigsaw.grid.length ; gridIndex++){
		
								if ((Math.abs(myJigsaw.peices[i].x -  myJigsaw.grid[gridIndex]["x"]) < 15) && (Math.abs(myJigsaw.peices[i].y -  myJigsaw.grid[gridIndex]["y"]) < 15)){
									
									if (myJigsaw.peices[i].dropped == true ){
										//snap the peice in if it is close enough
										myJigsaw.peices[i].x  = myJigsaw.grid[gridIndex]["x"];
										myJigsaw.peices[i].y =  myJigsaw.grid[gridIndex]["y"];
										//set the grid to hold the peice (need this to check if solved or not)
										myJigsaw.grid[gridIndex]["peice"] = i;
										
									}
									//set this variable to true if the peice is close to a grid area
									isOver = true;
								}
								
							}
						}
						if ( myJigsaw.peices[i].dropped == true){
							//peice is now dropped to set property to false
							myJigsaw.peices[i].dropped = false;
							if (isOver == true){ 
								//if a peice has been dropped into a grid area then set the flag to check wether the jigsaw is solved or not
								checkIfRight = true; 
							}
						}
						// if peice is being dragged then need to draw it relative to the mouse position - the offset.  
						if( myJigsaw.peices[i].dragging == true){
							//store which peice is being dragged for rendering purposes
							draggingpeice = i;
							myJigsaw.peices[i].x = mousePos['x'] - myJigsaw.peices[i].offsetX;
							myJigsaw.peices[i].y = mousePos['y'] - myJigsaw.peices[i].offsetY;
						}
						else {
							//if peice is not being dragged then we draw it on the context.
							context.drawImage(_canvas, myJigsaw.peices[i].sx , myJigsaw.peices[i].sy, myJigsaw.ow, myJigsaw.oh, myJigsaw.peices[i].x, myJigsaw.peices[i].y, myJigsaw.pw, myJigsaw.ph);
						}
				}
				//if a peice is being dragged then we want it showing on top of any other peice, so need to draw it last
				if ( draggingpeice >= 0){
					context.drawImage(_canvas, myJigsaw.peices[draggingpeice].sx , myJigsaw.peices[draggingpeice].sy, myJigsaw.ow, myJigsaw.oh, myJigsaw.peices[draggingpeice].x, myJigsaw.peices[draggingpeice].y, myJigsaw.pw, myJigsaw.ph);
					context.beginPath();
					context.lineWidth = 3;
					//if the peice is over a 'droppable' area then draw a green border around, otherwise draw a red border
					if(isOver == true){
						context.strokeStyle = "44ED3B";	
					 }
					 else {
						context.strokeStyle = "FA4B62";	
					 }
					context.strokeRect( myJigsaw.peices[draggingpeice].x, myJigsaw.peices[draggingpeice].y, myJigsaw.pw, myJigsaw.ph);

				}
				//loop through all elements of the grid and check that the peice order is correct
				if(checkIfRight == true){
					for (  gridIndex = 0; gridIndex < myJigsaw.grid.length ; gridIndex++){
						if (myJigsaw.grid[gridIndex]["peice"] != gridIndex){
							break;
						}
					}
					if(gridIndex == myJigsaw.grid.length ){
						myJigsaw.solved = true;
					}
					else {
						myJigsaw.solved = false;
					}	
				}
				
				//If correct then draw some congratulations text
				if ( myJigsaw.solved == true) {
						context.beginPath();
						context.font = "100pt Calibri";
						context.fillStyle = "#51FA4B";
						context.textAlign = "center";
						context.textBaseline = "middle";
						context.fillText("WELL DONE !!!", canvas.width / 2, canvas.height / 2);
				}
		
				//move onto next frame
                requestAnimFrame(function(){
                    drawFrame(context, video, canvas, _canvas,_context, myJigsaw);
                });
            }
            // a jigsaw peice stores the source video x and y coordinates and the destination x and y of the canvas it will be drawn on to.
			function peice(sourceX , sourceY, destX, destY){
				this.sx = sourceX;
				this.sy = sourceY;
		
				this.x = destX;
				this.y = destY;
				
				
				this.dragging = false;
				this.dropped = false;
				//offset for dragging, set when the peice is being dragged to draw it in the correct position
				this.offsetX = 0;
				this.offsetY = 0;
			}
			
			// only listen for mouse movements if 'mousedown' event has occured
			function initOnMouseMove(canvas){
				canvas.addEventListener("mousemove", myMouseMove );
			}
			
			function myMouseMove(e){
				mousePos['x'] = e.clientX; 
				mousePos['y'] = e.clientY; 
			}
			
			function closeOnMouseMove(canvas){
				canvas.removeEventListener("mousemove", myMouseMove, false);
			}
			
						function dragpeice(evt){
			
				//need to find the peice that has been clicked on and set its state to 'dragging' and set the offset of the mouse position
				mousePos['x'] = evt.clientX; 
				mousePos['y'] = evt.clientY; 
				
				initOnMouseMove(dragpeice.canvas);
				myJigsaw = dragpeice.jigsaw;
				
				for ( var i = myJigsaw.peices.length-1; i >=  0; i--){
						if(  mousePos['x'] > myJigsaw.peices[i].x && mousePos['x'] < (myJigsaw.peices[i].x + myJigsaw.pw) && mousePos['y'] > myJigsaw.peices[i].y && mousePos['y'] < (myJigsaw.peices[i].y + myJigsaw.ph) ){
							 myJigsaw.peices[i].offsetX = mousePos['x'] -  myJigsaw.peices[i].x;
							 myJigsaw.peices[i].offsetY = mousePos['y'] -  myJigsaw.peices[i].y;
							 myJigsaw.peices[i].dragging = true;
							//only drag the peice on top if overlapping.  Only drag 1 peice at a time.
							 break;
						}
				}
			}
			
			function droppeice(evt){
				//if mouseup then clear the mouse data and set the peices states
				mousePos['x'] = -1; 
				mousePos['y'] = -1; 
				
				myJigsaw = droppeice.jigsaw;
				for ( var i = 0; i < myJigsaw.peices.length ; i++){
							 myJigsaw.peices[i].dragging = false;
							 myJigsaw.peices[i].dropped = true;
				}
			}
			
			function Jigsaw(context, video, canvas, _canvas, horizNum, vertNum, scaleFactor ){
				
				//number of peices horizontally and vertically
				this.horizNum = horizNum;
				this.vertNum = vertNum;
				
				//a jigsaw object has an array of Peices and a Grid which is a list of positions on the canvas where the peice will fit
				this.peices= [];
				this.grid = [];
				//scaling from the source video
				this.sf = scaleFactor;
				
				this.dragging = -1;
				
				//the individual peice width of the original video source
				this.ow = video.videoWidth / horizNum;
				this.oh = video.videoHeight / vertNum;
				//scaling original peice height and width 
				this.pw = this.ow * this.sf;
				this.ph = this.oh * this.sf;
				
				
				//height and width of the whole jigsaw
				this.height =  this.ph * vertNum;
				this.width =  this.pw * horizNum;
				
				paddingX = ( canvas.width / 2 ) - (this.width / 2);
				paddingY = ( canvas.height / 2 ) - (this.height / 2);
				
				//x,y coordinates of the Jigsaw
				this.x = paddingX;
				this.y = paddingY;
				
				
				
				this.solved = false;
				

				var sourceX = 0;
				var sourceY = 0;
				
				// this array is used for shuffling the grid peices on initialisation
				var tempDestinations =[];
				
				var destX = 0;
				var destY = 0;
				var count = 0;
				
				
				//create the jigsaw peices and set up the grid
				for(j = 0; j < vertNum; j++) {
						sourceX = 0;
						sourceY = j * this.oh;
						for(var  i = 0; i < horizNum; i++) {
							sourceX = i * this.ow;
							
							destX = (sourceX * this.sf ) + (paddingX);
							destY = (sourceY * this.sf )  + (paddingY);
							
							tempDestinations[count] = [destX, destY];
							
							
							var apeice = new peice(sourceX , sourceY, destX, destY);
							this.peices[count] = apeice;
							
							this.grid[count] = {};
							this.grid[count]["x"] = destX;
							this.grid[count]["y"] = destY;
							//a grid section will store the peice that it currently holds
							this.grid[count]["peice"] = count;
							
							count = count + 1;
						}
					}
					
					//randomise the placement of initial Jigsaw peices
					tempDestinations = shuffle(tempDestinations);
					
					for ( i = 0; i < this.peices.length ; i++){
						this.peices[i].x = tempDestinations[i][0];
						this.peices[i].y = tempDestinations[i][1];
					}
					
				}
			
			function shuffle(array) {
				var tmp, current, top = array.length;

				if(top) while(--top) {
					current = Math.floor(Math.random() * (top + 1));
					tmp = array[current];
					array[current] = array[top];
					array[top] = tmp;
				}
				return array;
			}	
		

