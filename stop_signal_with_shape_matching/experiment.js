/* ************************************ */
/* Define helper functions */
/* ************************************ */
function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'stop_signal_with_shape_matching'})
}

function evalAttentionChecks() {
  var check_percent = 1
  if (run_attention_checks) {
    var attention_check_trials = jsPsych.data.getTrialsOfType('attention-check')
    var checks_passed = 0
    for (var i = 0; i < attention_check_trials.length; i++) {
      if (attention_check_trials[i].correct === true) {
        checks_passed += 1
      }
    }
    check_percent = checks_passed / attention_check_trials.length
  }
  jsPsych.data.addDataToLastTrial({"att_check_percent": check_percent})
  return check_percent
}

function assessPerformance() {
	var experiment_data = jsPsych.data.getTrialsOfType('stop-signal')
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
	var correct = 0
	var all_trials = 0
	
		//record choices participants made
	var choice_counts = {}
	choice_counts[-1] = 0
	choice_counts[77] = 0
	choice_counts[90] = 0
	
	for (var k = 0; k < possible_responses.length; k++) {
		choice_counts[possible_responses[k][1]] = 0
	}
	
	for (var i = 0; i < experiment_data.length; i++) {
		if (experiment_data[i].trial_id == 'test_trial') {
			all_trials += 1
			key = experiment_data[i].key_press
			choice_counts[key] += 1
			if (experiment_data[i].stop_signal_condition == 'go'){
				trial_count += 1
			}
			
			if ((experiment_data[i].stop_signal_condition == 'go') && (experiment_data[i].rt != -1)){
				rt = experiment_data[i].rt
				rt_array.push(rt)
				if (experiment_data[i].key_press == experiment_data[i].correct_response){
					correct += 1
				}
			} else if ((experiment_data[i].stop_signal_condition == 'stop') && (experiment_data[i].rt != -1)){
				rt = experiment_data[i].rt
				rt_array.push(rt)
			} else if ((experiment_data[i].stop_signal_condition == 'go') && (experiment_data[i].rt == -1)){
				missed_count += 1
			}
		}	
	}

	
	//calculate average rt
	var avg_rt = -1
	if (rt_array.length !== 0) {
		avg_rt = math.median(rt_array)
	} 
	//calculate whether response distribution is okay
	var responses_ok = true
	Object.keys(choice_counts).forEach(function(key, index) {
		if (choice_counts[key] > all_trials * 0.85) {
			responses_ok = false
		}
	})
	var missed_percent = missed_count/trial_count
	var accuracy = correct / trial_count
	credit_var = (missed_percent < 0.25 && avg_rt > 200 && responses_ok && accuracy > 0.60)
	jsPsych.data.addDataToLastTrial({final_credit_var: credit_var,
									 final_missed_percent: missed_percent,
									 final_avg_rt: avg_rt,
									 final_responses_ok: responses_ok,
									 final_accuracy: accuracy})
}


var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
		'</p></div>'
}

var getFeedback = function() {
	return '<div class = bigbox><div class = picture_box><p class = block-text>' + feedback_text + '</p></div></div>'
}

var getCategorizeFeedback = function(){
	curr_trial = jsPsych.progress().current_trial_global - 1
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	if ((trial_id == 'practice_trial') && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition != 'stop')){
		if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == jsPsych.data.getDataByTrialIndex(curr_trial).correct_response){
			
			
			return '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' + prompt_text
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != jsPsych.data.getDataByTrialIndex(curr_trial).correct_response) && (jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1)){
			
			
			return '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>' + prompt_text
	
		} else if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1){
			
			
			return '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>' + prompt_text
	
		}
	} else if ((trial_id == 'practice_trial') && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'stop')){
		
		if (jsPsych.data.getDataByTrialIndex(curr_trial).rt == -1){
			return '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' + prompt_text
		} else if (jsPsych.data.getDataByTrialIndex(curr_trial).rt != -1){
			return '<div class = fb_box><div class = center-text><font size = 20>There was a star.</font></div></div>' + prompt_text
		}
	}
}


var randomDraw = function(lst) {
  var index = Math.floor(Math.random() * (lst.length))
  return lst[index]
}

var getPTD = function(shape_matching_condition, stop_signal_condition){
	var probe_i = randomDraw([1,2,3,4,5,6,7,8,9,10])
	var target_i = 0
	var distractor_i = 0
	if (shape_matching_condition[0] == 'S') {
		target_i = probe_i
		correct_response = possible_responses[0][1]		
	} else {
		target_i = randomDraw([1,2,3,4,5,6,7,8,9,10].filter(function(y) {return y != probe_i}))				
		correct_response = possible_responses[1][1]
	}
	if (shape_matching_condition[1] == 'S') {
		distractor_i = target_i
	} else if (shape_matching_condition[2] == 'S') {
		distractor_i = probe_i
	} else if (shape_matching_condition[2] == 'D') {
		distractor_i = randomDraw([1,2,3,4,5,6,7,8,9,10].filter(function(y) {return $.inArray(y, [target_i, probe_i]) == -1}))
	} else if (shape_matching_condition[2] == 'N'){
		distractor_i = 'none'
	}
	
	if (stop_signal_condition == 'stop'){
		correct_response = -1
	
	}
	return [probe_i, target_i, distractor_i, correct_response]
}

							 
var createTrialTypes = function(numTrialsPerBlock){
	stop_signal_trial_types = ['go','go','stop']
	shape_matching_trial_types = ['DDD','SDD','DSD','DDS','SSS','SNN','DNN']
	
	var stims = []
	for(var numIterations = 0; numIterations < numTrialsPerBlock/21; numIterations++){
		for (var numShapeConds = 0; numShapeConds < shape_matching_trial_types.length; numShapeConds++){
			for (var stop_signal_nogoConds = 0; stop_signal_nogoConds < stop_signal_trial_types.length; stop_signal_nogoConds++){
			
				shape_matching_condition = shape_matching_trial_types[numShapeConds]
				stop_signal_condition = stop_signal_trial_types[stop_signal_nogoConds]
				
				answer_arr = getPTD(shape_matching_condition, stop_signal_condition)
				
				probe = answer_arr[0]
				target = answer_arr[1]
				distractor = answer_arr[2]
				correct_response = answer_arr[3]
				
				stim = {
					stop_signal_condition: stop_signal_condition,
					shape_matching_condition: shape_matching_condition,
					probe: probe,
					target: target,
					distractor: distractor,
					correct_response: correct_response
					}
			
				stims.push(stim)
			}
			
		}
	}
	stims = jsPsych.randomization.repeat(stims,1)
	return stims	
}

function getSSD(){
	if ((shape_matching_condition == "SNN") || (shape_matching_condition == "DNN")){
		return SSD_neutral
	} else if ((shape_matching_condition == "SSS") || (shape_matching_condition == "DSD")){
		return SSD_same
	} else if ((shape_matching_condition == "DDD") || (shape_matching_condition == "DDS") || (shape_matching_condition == "SDD")){
		return SSD_diff
	}
}

function getSSType(){
	return stop_signal_condition

}

var getStopStim = function(){
	return stop_boards[0] + 
		   	preFileType + 'stopSignal' + fileTypePNG + 
		   stop_boards[1] 
}


var getStim = function(){
	if ((shape_matching_condition == "SNN") || (shape_matching_condition == "DNN")){
		return task_boards[0]+ preFileType + target + '_green' + fileTypePNG + 
			   task_boards[1]+
			   task_boards[2]+ preFileType + probe + '_white' + fileTypePNG + 
			   task_boards[3]		   
		
	} else {

		return task_boards[0]+ preFileType + target + '_green' + fileTypePNG + 
			   task_boards[1]+ preFileType + distractor + '_red' + fileTypePNG + 
			   task_boards[2]+ preFileType + probe + '_white' + fileTypePNG + 
			   task_boards[3]		   
	}
}

		
var getMask = function(){
	stim = stims.shift()
	stop_signal_condition = stim.stop_signal_condition
	shape_matching_condition = stim.shape_matching_condition
	probe = stim.probe
	target = stim.target
	distractor = stim.distractor
	correct_response = stim.correct_response
	
	return mask_boards[0]+ preFileType + 'mask' + fileTypePNG + 
	       '<div class = centerbox><div class = fixation>+</div></div>' +
		   mask_boards[1]+ preFileType + 'mask' + fileTypePNG + 
		   '<div class = centerbox><div class = fixation>+</div></div>' +
		   mask_boards[2]
}


var appendData = function(){
	curr_trial = jsPsych.progress().current_trial_global
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	current_trial+=1
	
	
	if (trial_id == 'practice_trial'){
		current_block = practiceCount
	} else if (trial_id == 'test_trial'){
		current_block = testCount
	}
	
	jsPsych.data.addDataToLastTrial({
		stop_signal_condition: stop_signal_condition,
		correct_response: correct_response,
		probe: probe,
		target: target,
		distractor: distractor,
		shape_matching_condition: shape_matching_condition,
		
		current_trial: current_trial,
		current_block: current_block,
		SSD_same: SSD_same,
		SSD_diff: SSD_diff,
		SSD_neutral: SSD_neutral
		
	})
	
	
	if ((trial_id == 'test_trial') || (trial_id == 'practice_trial')){
		if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'stop') && (SSD_same < maxSSD) && ((shape_matching_condition == 'SSS') || (shape_matching_condition == 'DSD'))){
			jsPsych.data.addDataToLastTrial({stop_acc: 1})
			SSD_same+=50
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'stop') && (SSD_same > minSSD) && ((shape_matching_condition == 'SSS') || (shape_matching_condition == 'DSD'))){
			jsPsych.data.addDataToLastTrial({stop_acc: 0})
			SSD_same-=50
		}
		
		if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'stop') && (SSD_diff < maxSSD) && ((shape_matching_condition == 'DDD') || (shape_matching_condition == 'DDS')|| (shape_matching_condition == 'SDD'))){
			jsPsych.data.addDataToLastTrial({stop_acc: 1})
			SSD_diff+=50
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'stop') && (SSD_diff > minSSD) && ((shape_matching_condition == 'DDD') || (shape_matching_condition == 'DDS')|| (shape_matching_condition == 'SDD'))){
			jsPsych.data.addDataToLastTrial({stop_acc: 0})
			SSD_diff-=50
		}
		
		if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'stop') && (SSD_neutral < maxSSD) && ((shape_matching_condition == 'DNN') || (shape_matching_condition == 'SNN'))){
			jsPsych.data.addDataToLastTrial({stop_acc: 1})
			SSD_neutral+=50
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'stop') && (SSD_neutral > minSSD) && ((shape_matching_condition == 'DNN') || (shape_matching_condition == 'SNN'))){
			jsPsych.data.addDataToLastTrial({stop_acc: 0})
			SSD_neutral-=50
		}
		
		if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == correct_response){
			jsPsych.data.addDataToLastTrial({
				correct_trial: 1,
			})
	
		} else if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press != correct_response){
			jsPsych.data.addDataToLastTrial({
				correct_trial: 0,
			})
		}
	}
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = 0
var run_attention_checks = true

// task specific variables
// Set up variables for stimuli
var practice_len = 21 // must be divisible by 21, [3 (go,go,stop) by 7 (shape matching conditions)]
var exp_len = 420 // must be divisible by 21
var numTrialsPerBlock = 84; // divisible by 21
var numTestBlocks = exp_len / numTrialsPerBlock

var accuracy_thresh = 0.75
var rt_thresh = 1000
var missed_thresh = 0.10
var practice_thresh = 3 // 3 blocks of 28 trials

//the following three SSDs are for the relationship of the distractor to the target
var SSD_same = 350
var SSD_diff = 350
var SSD_neutral = 350
var maxSSD = 1000
var minSSD = 0 

var maxStopCorrect = 0.70
var minStopCorrect = 0.30

var maxStopCorrectPractice = 1
var minStopCorrectPractice = 0
 
var possible_responses = [['M Key', 77],['Z Key', 90]]


var current_trial = 0
var current_block = 0

var fileTypePNG = '.png"></img>'
var preFileType = '<img class = center src="/static/experiments/stop_signal_with_shape_matching/images/'




var task_boards = [['<div class = bigbox><div class = leftbox>'],['</div><div class = distractorbox>'],['</div><div class = rightbox>'],['</div></div>']]
				

var mask_boards = [['<div class = bigbox><div class = leftbox>'],['</div><div class = rightbox>'],['</div></div>']]		

var stop_boards = ['<div class = starbox>','</div>']
		   
		


var stims = createTrialTypes(practice_len)


var prompt_text_list = '<ul style="text-align:left">'+

						'<li>Respond if the green and white shapes are the same or different!</li>' +
						'<li>Same: ' + possible_responses[0][0] + '</li>' +
						'<li>Different: ' + possible_responses[1][0] + '</li>' +
						'<li>Do not respond if you see a star around the white shape!</li>' +
						'<li>Do not slow down your responses to the shape to wait for the star.</li>' +
					   '</ul>'

var prompt_text = '<div class = prompt_box>'+
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Respond if the green and white shapes are the same or different!</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Same: ' + possible_responses[0][0] + '</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Different: ' + possible_responses[1][0] +'</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Do not respond if you see a star around the white shape</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Do not slow down your responses to the shape to wait for the star.</p>' +
				  '</div>'
				  
				  
var numbersPreload = ['1','2','3','4','5','6','7','8','9','10']
var colorsPreload = ['white','green','red']
var pathSource = "/static/experiments/stop_signal_with_shape_matching/images/"
var images = []
for(i=0;i<numbersPreload.length;i++){
	for (x=0;x<colorsPreload.length;x++){
		images.push(pathSource + numbersPreload[i] + '_' + colorsPreload[x] +'.png')
	}
}

images.push(pathSource + 'stopSignal.png')
images.push(pathSource + 'mask.png')
jsPsych.pluginAPI.preloadImages(images);
/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
// Set up attention check node
var attention_check_block = {
  type: 'attention-check',
  data: {
    trial_id: "attention_check"
  },
  timing_response: 180000,
  response_ends_trial: true,
  timing_post_trial: 200
}

var attention_node = {
  timeline: [attention_check_block],
  conditional_function: function() {
    return run_attention_checks
  }
}

//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       exp_id: "stop_signal_with_shape_matching",
       trial_id: "post_task_questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
              '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>'],
   rows: [15, 15],
   columns: [60,60],
   timing_response: 360000
};


var feedback_text = 
	'Welcome to the experiment. This experiment will take about 20 minutes. Press <i>enter</i> to begin.'
var feedback_block = {
	type: 'poldrack-single-stim',
	data: {
		trial_id: "feedback_block"
	},
	choices: [13],
	stimulus: getFeedback,
	timing_post_trial: 0,
	is_html: true,
	timing_response: 180000,
	response_ends_trial: true, 

};

var feedback_instruct_text =
	'Welcome to the experiment. This experiment will take less than 20 minutes. Press <i>enter</i> to begin.'
var feedback_instruct_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instruction"
	},
	cont_key: [13],
	text: getInstructFeedback,
	timing_post_trial: 0,
	timing_response: 180000
};

/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
	type: 'poldrack-instructions',
	data: {
		trial_id: "instruction"
	},
	pages: [
		'<div class = centerbox>'+
			'<p class = block-text>In this experiment you will see at least a green shape on the left side of the screen, and a white shape on the right side.</p> '+
		
			'<p class = block-text>You will be asked to judge whether the green shape on the left is the same as the white shape on the right.</p>'+
		
			'<p class = block-text>If the shapes are the same, please press the '+possible_responses[0][0]+'.  If the shapes are different, press the '+possible_responses[1][0]+'.</p>'+
				
			'<p class = block-text>On some trials, a red shape will overlap the green shape. Ignore this red shape, your job is to match the green shape to the white shape.</p>'+
		'</div>',
		
		'<div class = centerbox>'+
			'<p class = block-text>On some trials, a star will appear around all of the shapes.  The star will appear at the same time, or shortly after, the shapes appear.</p>'+
			
			'<p class = block-text>If you see a star appear, please try your best to make no response on that trial.</p>'+
			
			'<p class = block-text>If you try your best to withhold your response when a star appears, you will find that you will be able to stop sometimes but not always.</p>'+
		
			'<p class = block-text>Please do not slow down your responses in order to wait for the star.  Continue to respond as quickly and accurately as possible.</p>'+
		'</div>',
		
		'<div class = centerbox>'+						
			'<p class = block-text>We will start practice when you finish instructions. Please make sure you understand the instructions before moving on. During practice, you will receive a reminder of the rules.  <i>This reminder will be taken out for test</i>.</p>'+

			'<p class = block-text>To avoid technical issues, please keep the experiment tab (on Chrome or Firefox) <i>active and in full-screen mode</i> for the whole duration of each task.</p>'+
		'</div>'
	],
	allow_keys: false,
	show_clickable_nav: true,
	timing_post_trial: 1000
};



/* This function defines stopping criteria */

var instruction_node = {
	timeline: [feedback_instruct_block, instructions_block],
	
	loop_function: function(data) {
		for (i = 0; i < data.length; i++) {
			if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
				rt = data[i].rt
				sumInstructTime = sumInstructTime + rt
			}
		}
		if (sumInstructTime <= instructTimeThresh * 1000) {
			feedback_instruct_text =
				'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <i>enter</i> to continue.'
			return true
		} else if (sumInstructTime > instructTimeThresh * 1000) {
			feedback_instruct_text = 'Done with instructions. Press <i>enter</i> to continue.'
			return false
		}
	}
}

var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end",
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <i>enter</i> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0,
	on_finish: function(){
  	assessPerformance()
  	evalAttentionChecks()
  }
};

var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instruction"
	},
	timing_response: 180000,
	text: '<div class = centerbox>'+
			'<p class = block-text>We will now start the test portion</p>'+
			
			'<p class = block-text>In this experiment you will see at least green shape on the left side of the screen, and a white shape on the right.</p> '+
		
			'<p class = block-text>You will be asked to judge whether the green shape on the left is the same the white shape on the right.</p>'+
		
			'<p class = block-text>If the shapes are the same, please press the '+possible_responses[0][0]+'.  If the shapes are different, press the '+possible_responses[1][0]+'.</p>'+
				
			'<p class = block-text>On some trials, a red shape will overlap the green shape. Ignore this red shape, your job is to match the green shape to the white shape.</p>'+
		
			'<p class = block-text>On some trials, you will see a star appear at the same time, or shortly after, the shapes appear. Do not respond if you see a star.</p>'+
			
			'<p class = block-text>If the star appears on a trial, and you try your best to withhold your response, you will find that you will be able to stop sometimes but not always.</p>'+
			
			'<p class = block-text>Do not slow down your responses to the shapes in order to wait for the star.</p>'+
	
			'<p class = block-text>You will no longer receive the rule prompt, so remember the instructions before you continue. Press Enter to begin.</p>'+ 
		 '</div>',
	cont_key: [13],
	timing_post_trial: 1000,
	on_finish: function(){
		feedback_text = "We will now start the test portion. Press enter to begin."
	}
};
 
var rest_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instruction"
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = center-block-text>Take a short break!</p><p class = center-block-text>Press <i>enter</i> to continue the test.</p></div>',
	cont_key: [13],
	timing_post_trial: 1000
};



var practiceTrials = []
practiceTrials.push(feedback_block)
practiceTrials.push(instructions_block)

for (i = 0; i < practice_len; i++) { 
	var mask_block = {
		type: 'poldrack-single-stim',
		stimulus: getMask,
		is_html: true,
		data: {
			"trial_id": "practice_mask",
		},
		choices: 'none',
		timing_response: 500, //500
		timing_post_trial: 0,
		response_ends_trial: false,
		prompt: prompt_text
	}
	
	var practice_block = {
		type: 'stop-signal',
		stimulus: getStim,
		SS_stimulus: getStopStim,
		SS_trial_type: getSSType, //getSSType,
		data: {
			"trial_id": "practice_trial"
		},
		is_html: true,
		choices: [possible_responses[0][1],possible_responses[1][1]],
		timing_stim: 1000,
		timing_response: 2000, //2000
		response_ends_trial: false,
		SSD: getSSD,
		timing_SS: 500, //500
		timing_post_trial: 0,
		on_finish: appendData,
		prompt: prompt_text,
		on_start: function(){
			stoppingTracker = []
			stoppingTimeTracker = []
		}
	}
	
	var categorize_block = {
		type: 'poldrack-single-stim',
		data: {
			trial_id: "practice-stop-feedback"
		},
		choices: 'none',
		stimulus: getCategorizeFeedback,
		timing_post_trial: 0,
		is_html: true,
		timing_stim: 500,
		timing_response: 500, //500
		response_ends_trial: false

	};
	practiceTrials.push(mask_block)
	practiceTrials.push(practice_block)
	practiceTrials.push(categorize_block)
}


var practiceCount = 0
var practiceNode = {
	timeline: practiceTrials,
	loop_function: function(data){
		practiceCount += 1
		current_trial = 0
	
		var total_trials = 0
		var sum_responses = 0
		var total_sum_rt = 0
		
		var go_trials = 0
		var go_correct = 0
		var go_rt = 0
		var sum_go_responses = 0
		
		var stop_trials = 0
		var stop_correct = 0
		var stop_rt = 0
		var sum_stop_responses = 0
		
	
		for (var i = 0; i < data.length; i++){
			if ((data[i].trial_id == "practice_trial") && (data[i].stop_signal_condition == 'go')){
				total_trials+=1
				go_trials+=1
				if (data[i].rt != -1){
					total_sum_rt += data[i].rt
					go_rt += data[i].rt
					sum_go_responses += 1
					if (data[i].key_press == data[i].correct_response){
						go_correct += 1
		
					}
				}
		
			} else if ((data[i].trial_id == "practice_trial") && (data[i].stop_signal_condition == 'stop')){
				total_trials+=1
				stop_trials+=1
				if (data[i].rt != -1){
					total_sum_rt += data[i].rt
					stop_rt += data[i].rt
					sum_stop_responses += 1
				}
				if (data[i].key_press == -1){
					stop_correct += 1
	
				}
			}
		}
	
		var accuracy = go_correct / go_trials
		var missed_responses = (go_trials - sum_go_responses) / go_trials
		var ave_rt = go_rt / sum_go_responses
		var stop_acc = stop_correct / stop_trials
	
	
		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"
		if (practiceCount == practice_thresh){
			feedback_text +=
				'</p><p class = block-text>Done with this practice.' 
				stims = createTrialTypes(numTrialsPerBlock)
				return false
		}
		
		if ((accuracy > accuracy_thresh) && (stop_acc < maxStopCorrectPractice) && (stop_acc > minStopCorrectPractice)){
			feedback_text +=
					'</p><p class = block-text>Done with this practice. Press Enter to continue.' 
			stims = createTrialTypes(numTrialsPerBlock)
			return false
	
		} else {
		
			if (accuracy < accuracy_thresh){
			feedback_text +=
					'</p><p class = block-text>We are going to try practice again to see if you can achieve higher accuracy.  Remember: <br>' + prompt_text_list
			}
		
			if (missed_responses > missed_thresh){
			feedback_text +=
					'</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.'
			}

	      	if (ave_rt > rt_thresh){
	        	feedback_text += 
	            	'</p><p class = block-text>You have been responding too slowly.'
	      	}
		
			if (stop_acc === maxStopCorrectPractice){
				feedback_text +=
				'</p><p class = block-text>Do not slow down and wait for the star to appear. Please respond as quickly and accurately as possible when a star does not appear.'
			}
		
			if (stop_acc === minStopCorrectPractice){
				feedback_text +=
				'</p><p class = block-text>You have not been stopping your response when stars are present.  Please try your best to stop your response if you see a star.'
			}
		
			feedback_text +=
				'</p><p class = block-text>Redoing this practice. Press Enter to continue.' 
			stims = createTrialTypes(practice_len)
			return true
		}
	
	}
	
}


var testTrials = []
testTrials.push(feedback_block)
testTrials.push(attention_node)
for (i = 0; i < numTrialsPerBlock; i++) {
	var mask_block = {
		type: 'poldrack-single-stim',
		stimulus: getMask,
		is_html: true,
		data: {
			"trial_id": "test_mask",
		},
		choices: 'none',
		timing_response: 500, //500
		timing_post_trial: 0,
		response_ends_trial: false
	}
	
	var test_block = {
		type: 'stop-signal',
		stimulus: getStim,
		SS_stimulus: getStopStim,
		SS_trial_type: getSSType,
		data: {
			"trial_id": "test_trial"
		},
		is_html: true,
		choices: [possible_responses[0][1],possible_responses[1][1]],
		timing_stim: 1000,
		timing_response: 2000, //2000
		response_ends_trial: false,
		SSD: getSSD,
		timing_SS: 500, //500
		timing_post_trial: 0,
		on_finish: appendData,
		on_start: function(){
			stoppingTracker = []
			stoppingTimeTracker = []
		}
	}
	testTrials.push(mask_block)
	testTrials.push(test_block)
}

var testCount = 0
var testNode = {
	timeline: testTrials,
	loop_function: function(data) {
		testCount += 1
		stims = createTrialTypes(numTrialsPerBlock)
		current_trial = 0
	
		var total_trials = 0
		var sum_responses = 0
		var total_sum_rt = 0
		
		var go_trials = 0
		var go_correct = 0
		var go_rt = 0
		var sum_go_responses = 0
		
		var stop_trials = 0
		var stop_correct = 0
		var stop_rt = 0
		var sum_stop_responses = 0
		
	
		for (var i = 0; i < data.length; i++){
			if ((data[i].trial_id == "test_trial") && (data[i].stop_signal_condition == 'go')){
				total_trials+=1
				go_trials+=1
				if (data[i].rt != -1){
					total_sum_rt += data[i].rt
					go_rt += data[i].rt
					sum_go_responses += 1
					if (data[i].key_press == data[i].correct_response){
						go_correct += 1
		
					}
				}
		
			} else if ((data[i].trial_id == "test_trial") && (data[i].stop_signal_condition == 'stop')){
				total_trials+=1
				stop_trials+=1
				if (data[i].rt != -1){
					total_sum_rt += data[i].rt
					stop_rt += data[i].rt
					sum_stop_responses += 1
				}
				if (data[i].key_press == -1){
					stop_correct += 1
	
				}			
			}
		}
	
		var accuracy = go_correct / go_trials
		var missed_responses = (go_trials - sum_go_responses) / go_trials
		var ave_rt = go_rt / sum_go_responses
		var stop_acc = stop_correct / stop_trials
	
		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"
		feedback_text += "</p><p class = block-text>You have completed: "+testCount+" out of "+numTestBlocks+" blocks of trials."
		
		if (accuracy < accuracy_thresh){
			feedback_text +=
					'</p><p class = block-text>Your accuracy is too low.  Remember: <br>' + prompt_text_list
		}
		
		if (missed_responses > missed_thresh){
			feedback_text +=
					'</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.'
		}

      	if (ave_rt > rt_thresh){
        	feedback_text += 
            	'</p><p class = block-text>You have been responding too slowly.'
      	}
		
		if (stop_acc > maxStopCorrect){
			feedback_text +=
			'</p><p class = block-text>Do not slow down and wait for the star to appear. Please respond as quickly and accurately as possible when a star does not appear.'
		
		}
		
		if (stop_acc < minStopCorrect){
			feedback_text +=
			'</p><p class = block-text>You have not been stopping your response when stars are present.  Please try your best to stop your response if you see a star.'
		
		}
	
		if (testCount == numTestBlocks){
			feedback_text +=
					'</p><p class = block-text>Done with this test. Press Enter to continue.<br> If you have been completing tasks continuously for an hour or more, please take a 15-minute break before starting again.'
			return false
		} else {
		
			return true
		}
	
	}
}



/* create experiment definition array */
stop_signal_with_shape_matching_experiment = []

stop_signal_with_shape_matching_experiment.push(practiceNode)
stop_signal_with_shape_matching_experiment.push(feedback_block)

stop_signal_with_shape_matching_experiment.push(start_test_block)
stop_signal_with_shape_matching_experiment.push(testNode)
stop_signal_with_shape_matching_experiment.push(feedback_block)

stop_signal_with_shape_matching_experiment.push(post_task_block)
stop_signal_with_shape_matching_experiment.push(end_block)
