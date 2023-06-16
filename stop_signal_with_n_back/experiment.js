/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */

function getDisplayElement() {
  $("<div class = display_stage_background></div>").appendTo("body");
  return $("<div class = display_stage></div>").appendTo("body");
}

function addID() {
  jsPsych.data.addDataToLastTrial({ exp_id: "stop_signal_with_n_back" });
}

function evalAttentionChecks() {
  var check_percent = 1;
  if (run_attention_checks) {
    var attention_check_trials =
      jsPsych.data.getTrialsOfType("attention-check");
    var checks_passed = 0;
    for (var i = 0; i < attention_check_trials.length; i++) {
      if (attention_check_trials[i].correct === true) {
        checks_passed += 1;
      }
    }
    check_percent = checks_passed / attention_check_trials.length;
  }
  jsPsych.data.addDataToLastTrial({ att_check_percent: check_percent });
  return check_percent;
}

function assessPerformance() {
  var experiment_data = jsPsych.data.getTrialsOfType("stop-signal");
  var missed_count = 0;
  var trial_count = 0;
  var rt_array = [];
  var rt = 0;
  var correct = 0;
  var all_trials = 0;

  //record choices participants made
  var choice_counts = {};
  choice_counts[-1] = 0;
  choice_counts[77] = 0;
  choice_counts[90] = 0;

  for (var k = 0; k < possible_responses.length; k++) {
    choice_counts[possible_responses[k][1]] = 0;
  }
  for (var i = 0; i < experiment_data.length; i++) {
    if (experiment_data[i].trial_id == "test_trial") {
      all_trials += 1;
      key = experiment_data[i].key_press;
      choice_counts[key] += 1;
      if (experiment_data[i].stop_signal_condition == "go") {
        trial_count += 1;
      }

      if (
        experiment_data[i].stop_signal_condition == "go" &&
        experiment_data[i].rt != -1
      ) {
        rt = experiment_data[i].rt;
        rt_array.push(rt);
        if (
          experiment_data[i].key_press == experiment_data[i].correct_response
        ) {
          correct += 1;
        }
      } else if (
        experiment_data[i].stop_signal_condition == "stop" &&
        experiment_data[i].rt != -1
      ) {
        rt = experiment_data[i].rt;
        rt_array.push(rt);
      } else if (
        experiment_data[i].stop_signal_condition == "go" &&
        experiment_data[i].rt == -1
      ) {
        missed_count += 1;
      }
    }
  }

  //calculate average rt
  var avg_rt = -1;
  if (rt_array.length !== 0) {
    avg_rt = math.median(rt_array);
  }
  //calculate whether response distribution is okay
  var responses_ok = true;
  Object.keys(choice_counts).forEach(function (key, index) {
    if (choice_counts[key] > all_trials * 0.85) {
      responses_ok = false;
    }
  });
  var missed_percent = missed_count / trial_count;
  var accuracy = correct / trial_count;
  credit_var =
    missed_percent < 0.25 && avg_rt > 200 && responses_ok && accuracy > 0.6;
  jsPsych.data.addDataToLastTrial({
    final_credit_var: credit_var,
    final_missed_percent: missed_percent,
    final_avg_rt: avg_rt,
    final_responses_ok: responses_ok,
    final_accuracy: accuracy,
  });
}

var getResponse = function () {
  return correct_response;
};

var getInstructFeedback = function () {
  return (
    "<div class = centerbox><p class = center-block-text>" +
    feedback_instruct_text +
    "</p></div>"
  );
};

var getFeedback = function () {
  return (
    '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' +
    feedback_text +
    "</font></p></div></div>"
  );
};

var getCategorizeFeedback = function () {
  curr_trial = jsPsych.progress().current_trial_global - 1;
  trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id;
  if (
    trial_id == "practice_trial" &&
    jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition != "stop"
  ) {
    if (
      jsPsych.data.getDataByTrialIndex(curr_trial).key_press ==
      jsPsych.data.getDataByTrialIndex(curr_trial).correct_response
    ) {
      return (
        "<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>" +
        prompt_text
      );
    } else if (
      jsPsych.data.getDataByTrialIndex(curr_trial).key_press !=
        jsPsych.data.getDataByTrialIndex(curr_trial).correct_response &&
      jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1
    ) {
      return (
        "<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>" +
        prompt_text
      );
    } else if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1) {
      return (
        "<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>" +
        prompt_text
      );
    }
  } else if (
    trial_id == "practice_trial" &&
    jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == "stop"
  ) {
    if (jsPsych.data.getDataByTrialIndex(curr_trial).rt == -1) {
      return (
        "<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>" +
        prompt_text
      );
    } else if (jsPsych.data.getDataByTrialIndex(curr_trial).rt != -1) {
      return (
        "<div class = fb_box><div class = center-text><font size = 20>There was a star.</font></div></div>" +
        prompt_text
      );
    }
  }
};

var randomDraw = function (lst) {
  var index = Math.floor(Math.random() * lst.length);
  return lst[index];
};

var createTrialTypes = function (numTrialsPerBlock, delay) {
  first_stims = [];
  for (var i = 0; i < 3; i++) {
    //so that if delay for the block is 2, the first two stim will have no match (i.e. not yet 2 stim preceding them to be matched.)
    if (i < delay) {
      n_back_condition = "N/A";
    } else {
      n_back_condition = n_back_conditions[Math.floor(Math.random() * 5)];
    }
    stop_signal_condition = jsPsych.randomization
      .repeat(["go", "go", "stop"], 1)
      .pop();
    probe = randomDraw(letters);
    correct_response = possible_responses[1][1];
    if (n_back_condition == "match") {
      correct_response = possible_responses[0][1];
      probe = randomDraw([
        first_stims[i - delay].probe.toUpperCase(),
        first_stims[i - delay].probe.toLowerCase(),
      ]);
    } else if (n_back_condition == "mismatch") {
      probe = randomDraw(
        "bBdDgGtTvV".split("").filter(function (y) {
          return (
            $.inArray(y, [
              first_stims[i - delay].probe.toLowerCase(),
              first_stims[i - delay].probe.toUpperCase(),
            ]) == -1
          );
        })
      );
      correct_response = possible_responses[1][1];
    }

    first_stim = {
      n_back_condition: n_back_condition,
      stop_signal_condition: stop_signal_condition,
      probe: probe,
      correct_response: correct_response,
      delay: delay,
    };
    first_stims.push(first_stim);
  }

  stims = [];

  for (
    var numIterations = 0;
    numIterations <
    numTrialsPerBlock /
      (n_back_conditions.length * stop_signal_conditions.length);
    numIterations++
  ) {
    for (
      var numNBackConds = 0;
      numNBackConds < n_back_conditions.length;
      numNBackConds++
    ) {
      for (
        var numstop_signalConds = 0;
        numstop_signalConds < stop_signal_conditions.length;
        numstop_signalConds++
      ) {
        stop_signal_condition = stop_signal_conditions[numstop_signalConds];
        n_back_condition = n_back_conditions[numNBackConds];

        stim = {
          stop_signal_condition: stop_signal_condition,
          n_back_condition: n_back_condition,
        };

        stims.push(stim);
      }
    }
  }

  stims = jsPsych.randomization.repeat(stims, 1);
  stims = first_stims.concat(stims);

  stim_len = stims.length;

  new_stims = [];
  for (i = 0; i < stim_len; i++) {
    if (i < 3) {
      stim = stims.shift();
      n_back_condition = stim.n_back_condition;
      stop_signal_condition = stim.stop_signal_condition;
      probe = stim.probe;
      correct_response = stim.correct_response;
      delay = stim.delay;
    } else {
      stim = stims.shift();
      n_back_condition = stim.n_back_condition;
      stop_signal_condition = stim.stop_signal_condition;

      if (n_back_condition == "match") {
        probe = randomDraw([
          new_stims[i - delay].probe.toUpperCase(),
          new_stims[i - delay].probe.toLowerCase(),
        ]);
        correct_response = possible_responses[0][1];
      } else if (n_back_condition == "mismatch") {
        probe = randomDraw(
          "bBdDgGtTvV".split("").filter(function (y) {
            return (
              $.inArray(y, [
                new_stims[i - delay].probe.toLowerCase(),
                new_stims[i - delay].probe.toUpperCase(),
              ]) == -1
            );
          })
        );
        correct_response = possible_responses[1][1];
      }

      if (stop_signal_condition == "stop") {
        correct_response = -1;
      }
    }

    stim = {
      n_back_condition: n_back_condition,
      stop_signal_condition: stop_signal_condition,
      probe: probe,
      correct_response: correct_response,
      delay: delay,
    };
    new_stims.push(stim);
  }
  return new_stims;
};

var getSSD = function () {
  if (delay == 1) {
    return SSD_1;
  } else if (delay == 2) {
    return SSD_2;
  } else if (delay == 3) {
    return SSD_3;
  }
};

var getStopStim = function () {
  return (
    stop_signal_boards[0] +
    preFileType +
    "stopSignal" +
    fileTypePNG +
    stop_signal_boards[1]
  );
};

var getSSType = function () {
  return stop_signal_condition;
};

var getStim = function () {
  stim = stims.shift();
  n_back_condition = stim.n_back_condition;
  stop_signal_condition = stim.stop_signal_condition;
  probe = stim.probe;
  correct_response = stim.correct_response;
  delay = stim.delay;

  if (probe == probe.toUpperCase()) {
    letter_case = "uppercase";
  } else if (probe == probe.toLowerCase()) {
    letter_case = "lowercase";
  }

  return (
    task_boards[0] +
    preFileType +
    letter_case +
    "_" +
    probe.toUpperCase() +
    fileTypePNG +
    task_boards[1]
  );
};

var getResponse = function () {
  return correct_response;
};

var appendData = function () {
  curr_trial = jsPsych.progress().current_trial_global;
  trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id;
  current_trial += 1;

  if (trial_id == "practice_trial") {
    current_block = practiceCount;
  } else if (trial_id == "test_trial") {
    current_block = testCount;
  }

  jsPsych.data.addDataToLastTrial({
    n_back_condition: n_back_condition,
    stop_signal_condition: stop_signal_condition,
    probe: probe,
    SSD_1: SSD_1,
    SSD_2: SSD_2,
    SSD_3: SSD_3,
    correct_response: correct_response,
    delay: delay,
    current_trial: current_trial,
    current_block: current_block,
  });

  if (trial_id == "test_trial" || trial_id == "practice_trial") {
    if (
      jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1 &&
      jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition ==
        "stop" &&
      SSD_1 < maxSSD &&
      delay == 1
    ) {
      jsPsych.data.addDataToLastTrial({ stop_acc: 1 });
      SSD_1 += 50;
    } else if (
      jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1 &&
      jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition ==
        "stop" &&
      SSD_1 > minSSD &&
      delay == 1
    ) {
      jsPsych.data.addDataToLastTrial({ stop_acc: 0 });
      SSD_1 -= 50;
    }

    if (
      jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1 &&
      jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition ==
        "stop" &&
      SSD_2 < maxSSD &&
      delay == 2
    ) {
      jsPsych.data.addDataToLastTrial({ stop_acc: 1 });
      SSD_2 += 50;
    } else if (
      jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1 &&
      jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition ==
        "stop" &&
      SSD_2 > minSSD &&
      delay == 2
    ) {
      jsPsych.data.addDataToLastTrial({ stop_acc: 0 });
      SSD_2 -= 50;
    }

    if (
      jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1 &&
      jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition ==
        "stop" &&
      SSD_3 < maxSSD &&
      delay == 3
    ) {
      jsPsych.data.addDataToLastTrial({ stop_acc: 1 });
      SSD_3 += 50;
    } else if (
      jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1 &&
      jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition ==
        "stop" &&
      SSD_3 > minSSD &&
      delay == 3
    ) {
      jsPsych.data.addDataToLastTrial({ stop_acc: 0 });
      SSD_3 -= 50;
    }

    if (
      jsPsych.data.getDataByTrialIndex(curr_trial).key_press == correct_response
    ) {
      jsPsych.data.addDataToLastTrial({
        correct_trial: 1,
      });
    } else if (
      jsPsych.data.getDataByTrialIndex(curr_trial).key_press != correct_response
    ) {
      jsPsych.data.addDataToLastTrial({
        correct_trial: 0,
      });
    }
  }
};

/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */
// generic task variables
var sumInstructTime = 0; //ms
var instructTimeThresh = 0; ///in seconds
var credit_var = 0;

var run_attention_checks = true;
var practice_len = 45; // 15 must be divisible by 15
var exp_len = 270; //270 must be divisible by 15
var numTrialsPerBlock = 45; // 45, must be divisible by 15 and we need to have a multiple of 3 blocks (3,6,9) in order to have equal delays across blocks
var numTestBlocks = exp_len / numTrialsPerBlock;
var practice_thresh = 3; // 3 blocks of 16 trials

var accuracy_thresh = 0.75;
var rt_thresh = 1000;
var missed_thresh = 0.1;
var SSD_1 = 350;
var SSD_2 = 350;
var SSD_3 = 350;

var maxSSD = 1000;
var minSSD = 0;
var maxStopCorrect = 0.7;
var minStopCorrect = 0.3;

var maxStopCorrectPractice = 1;
var minStopCorrectPractice = 0;

var delays = jsPsych.randomization.repeat([1, 2, 3], numTestBlocks / 3);

var delay = 1;

var pathSource = "/static/experiments/stop_signal_with_n_back/images/";
var fileTypePNG = ".png'></img>";
var preFileType =
  "<img class = center src='/static/experiments/stop_signal_with_n_back/images/";
var stop_stim =
  "<div class = bigbox><div class = starbox>" +
  preFileType +
  "stopSignal" +
  fileTypePNG +
  "</div></div>";

var n_back_conditions = jsPsych.randomization.repeat(
  ["match", "mismatch", "mismatch", "mismatch", "mismatch"],
  1
);
var stop_signal_conditions = jsPsych.randomization.repeat(
  ["go", "go", "stop"],
  1
);
var possible_responses = [
  ["M Key", 77],
  ["Z Key", 90],
];

var letters = "bBdDgGtTvV".split("");

var prompt_text_list =
  '<ul style = "text-align:left;">' +
  "<li>Match the current letter to the letter that appeared some number of trials ago</li>" +
  "<li>If they match, press the " +
  possible_responses[0][0] +
  "</li>" +
  "<li>If they mismatch, press the " +
  possible_responses[1][0] +
  "</li>" +
  "<li>Do not respond if you see a star!</li>" +
  "</ul>";

var prompt_text =
  "<div class = prompt_box>" +
  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Match the current letter to the letter that appeared 1 trial ago</p>' +
  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">If they match, press the ' +
  possible_responses[0][0] +
  "</p>" +
  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">If they mismatch, press the ' +
  possible_responses[1][0] +
  "</p>" +
  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Do not respond if you see a star!</p>' +
  "</div>";

var current_trial = 0;
var current_block = 0;

var letters_preload = [
  "uppercase_B",
  "uppercase_D",
  "uppercase_G",
  "uppercase_T",
  "uppercase_V",
  "lowercase_B",
  "lowercase_D",
  "lowercase_G",
  "lowercase_T",
  "lowercase_V",
  "remember",
  "forget",
  "stopSignal",
];
var pathSource = "/static/experiments/stop_signal_with_n_back/images/";
var images = [];
for (i = 0; i < letters_preload.length; i++) {
  images.push(pathSource + letters_preload[i] + ".png");
}
jsPsych.pluginAPI.preloadImages(images);
/* ************************************ */
/*          Define Game Boards          */
/* ************************************ */

var task_boards = [
  ["<div class = bigbox><div class = centerbox><div class = flanker-text>"],
  ["<div></div><div>"],
];

var task_boards = [
  "<div class = bigbox><div class = centerbox><div class = gng_number><div class = cue-text>",
  "</div></div></div></div>",
];
var stop_signal_boards = [
  "<div class = bigbox><div class = starbox>",
  "</div></div>",
];

var stims = createTrialTypes(practice_len, delay);

/* ************************************ */
/*        Set up jsPsych blocks         */
/* ************************************ */
// Set up attention check node
var attention_check_block = {
  type: "attention-check",
  data: {
    trial_id: "attention_check",
  },
  timing_response: 180000,
  response_ends_trial: true,
  timing_post_trial: 200,
};

var attention_node = {
  timeline: [attention_check_block],
  conditional_function: function () {
    return run_attention_checks;
  },
};

var end_block = {
  type: "poldrack-text",
  data: {
    exp_id: "stop_signal_with_n_back",
    trial_id: "end",
  },
  timing_response: 180000,
  text: "<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <i>enter</i> to continue.</p></div>",
  cont_key: [13],
  timing_post_trial: 0,
  on_finish: function () {
    assessPerformance();
    evalAttentionChecks();
  },
};

var feedback_instruct_text =
  "Welcome to the experiment. This experiment will take less than 10 minutes. Press <i>enter</i> to begin.";
var feedback_instruct_block = {
  type: "poldrack-text",
  data: {
    trial_id: "instruction",
  },
  cont_key: [13],
  text: getInstructFeedback,
  timing_post_trial: 0,
  timing_response: 180000,
};

/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
  type: "poldrack-instructions",
  data: {
    trial_id: "instruction",
  },
  pages: [
    "<div class = centerbox>" +
      "<p class = block-text>In this task, you will see a letter on every trial.</p>" +
      "<p class = block-text>You will be asked to match the current letter to the letter that appeared either 1, 2, 3 trials ago depending on the delay given to you for that block.</p>" +
      "<p class = block-text>Press the " +
      possible_responses[0][0] +
      " if the letters match, or the " +
      possible_responses[1][0] +
      " if they mismatch.</p>" +
      "<p class = block-text>Your delay (the number of trials ago to which you must match the current letter) will change from block to block. You will be given the delay at the start of every block of trials.</p>" +
      '<p class = block-text>Capitalization does not matter, so "T" matches with "t".</p> ' +
      "</div>",
    "<div class = centerbox>" +
      "<p class = block-text>On some trials, a star will appear around the letter.  The star will appear at the same time, or shortly after, the letter appears.</p>" +
      "<p class = block-text>If you see a star, please try your best to make no response on that trial. You should still remember the letter, however.</p>" +
      "<p class = block-text>If the star appears on a trial, and you try your best to withhold your response, you will find that you will be able to stop sometimes but not always.</p>" +
      "<p class = block-text>Please do not slow down your responses in order to wait for the star.  Continue to respond as quickly and accurately as possible.</p>" +
      "</div>",

    "<div class = centerbox>" +
      "<p class = block-text>We will start practice when you finish instructions. <i>Your delay for this practice round is 1</i>. Please make sure you understand the instructions before moving on. During practice, you will receive a reminder of the rules.  <i>This reminder will be taken out for test</i>.</p>" +
      "<p class = block-text>To avoid technical issues, please keep the experiment tab (on Chrome or Firefox) <i>active and in full-screen mode</i> for the whole duration of each task.</p>" +
      "</div>",
  ],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: 1000,
};

/* This function defines stopping criteria */

var instruction_node = {
  timeline: [feedback_instruct_block, instructions_block],

  loop_function: function (data) {
    for (i = 0; i < data.length; i++) {
      if (data[i].trial_type == "poldrack-instructions" && data[i].rt != -1) {
        rt = data[i].rt;
        sumInstructTime = sumInstructTime + rt;
      }
    }
    if (sumInstructTime <= instructTimeThresh * 1000) {
      feedback_instruct_text =
        "Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <i>enter</i> to continue.";
      return true;
    } else if (sumInstructTime > instructTimeThresh * 1000) {
      feedback_instruct_text =
        "Done with instructions. Press <i>enter</i> to continue.";
      return false;
    }
  },
};

var start_test_block = {
  type: "poldrack-text",
  data: {
    trial_id: "instruction",
  },
  timing_response: 180000,
  text:
    "<div class = centerbox>" +
    "<p class = block-text>We will now begin the test portion.</p>" +
    "<p class = block-text>You will be asked to match the current letter to the letter that appeared either 1, 2, 3 trials ago depending on the delay given to you for that block.</p>" +
    "<p class = block-text>Press the " +
    possible_responses[0][0] +
    " if they match, or the " +
    possible_responses[1][0] +
    " if they mismatch.</p>" +
    "<p class = block-text>Your delay (the number of trials ago to which you must match the current letter) will change from block to block.</p>" +
    "<p class = block-text>Do not respond if you see a star! You should remember the letter on that trial, however.</p>" +
    '<p class = block-text>Capitalization does not matter, so "T" matches with "t".</p> ' +
    "<p class = block-text>You will no longer receive the rule prompt, so remember the instructions before you continue. Press Enter to begin.</p>" +
    "</div>",
  cont_key: [13],
  timing_post_trial: 1000,
  on_finish: function () {
    feedback_text =
      "Your delay for this block is " +
      delay +
      ". Please match the current letter to the letter that appeared " +
      delay +
      " trial(s) ago. Press enter to begin.";
  },
};

var fixation_block = {
  type: "poldrack-single-stim",
  stimulus: "<div class = centerbox><div class = fixation>+</div></div>",
  is_html: true,
  choices: "none",
  data: {
    trial_id: "fixation",
  },
  timing_response: 500, //500
  timing_post_trial: 0,
};

var feedback_text =
  "Welcome to the experiment. This experiment will take about 10 minutes. Press <i>enter</i> to begin.";
var feedback_block = {
  type: "poldrack-single-stim",
  data: {
    trial_id: "practice-no-stop-feedback",
  },
  choices: [13],
  stimulus: getFeedback,
  timing_post_trial: 0,
  is_html: true,
  timing_response: 180000,
  response_ends_trial: true,
};

//Set up post task questionnaire
var post_task_block = {
  type: "survey-text",
  data: {
    trial_id: "post task questions",
  },
  questions: [
    '<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
    '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>',
  ],
  rows: [15, 15],
  columns: [60, 60],
  timing_response: 360000,
};

/* ************************************ */
/*        Set up timeline blocks        */
/* ************************************ */
var practiceTrials = [];
practiceTrials.push(feedback_block);
practiceTrials.push(instructions_block);
for (i = 0; i < practice_len + 3; i++) {
  var practice_fixation_block = {
    type: "poldrack-single-stim",
    stimulus: "<div class = centerbox><div class = fixation>+</div></div>",
    is_html: true,
    choices: "none",
    data: {
      trial_id: "practice_fixation",
    },
    timing_response: 500, //500
    timing_post_trial: 0,
    prompt: prompt_text,
  };

  var practice_block = {
    type: "stop-signal",
    stimulus: getStim,
    SS_stimulus: getStopStim,
    SS_trial_type: getSSType, //getSSType,
    data: {
      trial_id: "practice_trial",
    },
    is_html: true,
    choices: [possible_responses[0][1], possible_responses[1][1]],
    timing_stim: 1000,
    timing_response: 2000, //2000
    response_ends_trial: false,
    SSD: getSSD,
    timing_SS: 500, //500
    timing_post_trial: 0,
    on_finish: appendData,
    prompt: prompt_text,
  };

  var categorize_block = {
    type: "poldrack-single-stim",
    data: {
      trial_id: "practice-stop-feedback",
    },
    choices: "none",
    stimulus: getCategorizeFeedback,
    timing_post_trial: 0,
    is_html: true,
    timing_stim: 500,
    timing_response: 500, //500
    response_ends_trial: false,
  };
  practiceTrials.push(practice_fixation_block);
  practiceTrials.push(practice_block);
  practiceTrials.push(categorize_block);
}

var practiceCount = 0;
var practiceNode = {
  timeline: practiceTrials,
  loop_function: function (data) {
    practiceCount += 1;
    current_trial = 0;

    var total_trials = 0;

    var sum_stop_rt = 0;
    var sum_go_rt = 0;

    var sumGo_correct = 0;
    var sumStop_correct = 0;

    var num_go_responses = 0;
    var num_stop_responses = 0;

    var go_length = 0;
    var stop_length = 0;

    for (i = 0; i < data.length; i++) {
      if (data[i].trial_id == "practice_trial") {
        total_trials += 1;
        if (data[i].stop_signal_condition == "go") {
          go_length += 1;
          if (data[i].rt != -1) {
            num_go_responses += 1;
            sum_go_rt += data[i].rt;
            if (data[i].key_press == data[i].correct_response) {
              sumGo_correct += 1;
            }
          }
        } else if (data[i].stop_signal_condition == "stop") {
          stop_length += 1;
          if (data[i].rt != -1) {
            num_stop_responses += 1;
            sum_stop_rt += data[i].rt;
          } else if (data[i].rt == -1) {
            sumStop_correct += 1;
          }
        }
      }
    }

    var average_rt = sum_go_rt / num_go_responses;
    var missed_responses = (go_length - num_go_responses) / go_length;
    var aveLetterRespondCorrect = sumGo_correct / go_length;
    var stop_signal_respond = num_stop_responses / stop_length;

    feedback_text =
      "<br>Please take this time to read your feedback and to take a short break! Press enter to continue.";

    if (practiceCount == practice_thresh) {
      feedback_text += "</p><p class = block-text>Done with this practice.";
      delay = delays.pop();
      stims = createTrialTypes(numTrialsPerBlock, delay);
      return false;
    }

    if (
      aveLetterRespondCorrect > accuracy_thresh &&
      stop_signal_respond > minStopCorrectPractice &&
      stop_signal_respond < maxStopCorrectPractice
    ) {
      feedback_text +=
        "</p><p class = block-text>Done with this practice. Press Enter to continue.";
      delay = delays.pop();
      stims = createTrialTypes(numTrialsPerBlock, delay);
      return false;
    } else {
      if (aveLetterRespondCorrect < accuracy_thresh) {
        feedback_text +=
          "</p><p class = block-text>We are going to try practice again to see if you can achieve higher accuracy.  Remember: <br>" +
          prompt_text_list;
      }

      if (missed_responses > missed_thresh) {
        feedback_text +=
          "</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.";
      }

      if (average_rt > rt_thresh) {
        feedback_text +=
          "</p><p class = block-text>You have been responding too slowly.";
      }

      if (stop_signal_respond === maxStopCorrectPractice) {
        feedback_text +=
          "</p><p class = block-text>You have not been stopping your response when stars are present.  Please try your best to stop your response if you see a star.";
      }

      if (stop_signal_respond === minStopCorrectPractice) {
        feedback_text +=
          "</p><p class = block-text>Do not slow down and wait for the star to appear. Please respond as quickly and accurately as possible when a star does not appear.";
      }

      feedback_text +=
        "</p><p class = block-text>Redoing this practice. Press Enter to continue.";
      stims = createTrialTypes(practice_len, delay);
      return true;
    }
  },
};

var testTrials = [];
testTrials.push(feedback_block);
testTrials.push(attention_node);
for (i = 0; i < numTrialsPerBlock + 3; i++) {
  var test_block = {
    type: "stop-signal",
    stimulus: getStim,
    SS_stimulus: getStopStim,
    SS_trial_type: getSSType, //getSSType,
    data: {
      trial_id: "test_trial",
    },
    is_html: true,
    choices: [possible_responses[0][1], possible_responses[1][1]],
    timing_stim: 1000,
    timing_response: 2000, //2000
    response_ends_trial: false,
    SSD: getSSD,
    timing_SS: 500, //500
    timing_post_trial: 0,
    on_finish: appendData,
  };
  testTrials.push(fixation_block);
  testTrials.push(test_block);
}

var testCount = 0;
var testNode = {
  timeline: testTrials,
  loop_function: function (data) {
    testCount += 1;
    current_trial = 0;

    var total_trials = 0;

    var sum_stop_rt = 0;
    var sum_go_rt = 0;

    var sumGo_correct = 0;
    var sumStop_correct = 0;

    var num_go_responses = 0;
    var num_stop_responses = 0;

    var go_length = 0;
    var stop_length = 0;

    for (var i = 0; i < data.length; i++) {
      if (data[i].trial_id == "test_trial") {
        total_trials += 1;
        if (data[i].stop_signal_condition == "go") {
          go_length += 1;
          if (data[i].rt != -1) {
            num_go_responses += 1;
            sum_go_rt += data[i].rt;
            if (data[i].key_press == data[i].correct_response) {
              sumGo_correct += 1;
            }
          }
        } else if (data[i].stop_signal_condition == "stop") {
          stop_length += 1;
          if (data[i].rt != -1) {
            num_stop_responses += 1;
            sum_stop_rt += data[i].rt;
          } else if (data[i].rt == -1) {
            sumStop_correct += 1;
          }
        }
      }
    }

    var average_rt = sum_go_rt / num_go_responses;
    var missed_responses = (go_length - num_go_responses) / go_length;
    var aveLetterRespondCorrect = sumGo_correct / go_length;
    var stop_signal_respond = num_stop_responses / stop_length;

    feedback_text =
      "<br>Please take this time to read your feedback and to take a short break! Press enter to continue.";
    feedback_text +=
      "</p><p class = block-text>You have completed: " +
      testCount +
      " out of " +
      numTestBlocks +
      " blocks of trials.";

    if (aveLetterRespondCorrect < accuracy_thresh) {
      feedback_text +=
        "</p><p class = block-text>Your accuracy is too low.  Remember: <br>" +
        prompt_text_list;
    }
    if (missed_responses > missed_thresh) {
      feedback_text +=
        "</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.";
    }

    if (average_rt > rt_thresh) {
      feedback_text +=
        "</p><p class = block-text>You have been responding too slowly.";
    }

    if (stop_signal_respond > maxStopCorrect) {
      feedback_text +=
        "</p><p class = block-text>You have not been stopping your response when stars are present.  Please try your best to stop your response if you see a star.";
    }

    if (stop_signal_respond < minStopCorrect) {
      feedback_text +=
        "</p><p class = block-text>Do not slow down and wait for the star to appear. Please respond as quickly and accurately as possible when a star does not appear.";
    }

    if (testCount == numTestBlocks) {
      feedback_text +=
        "</p><p class = block-text>Done with this test. Press Enter to continue.<br> If you have been completing tasks continuously for an hour or more, please take a 15-minute break before starting again.";
      return false;
    } else {
      delay = delays.pop();
      stims = createTrialTypes(numTrialsPerBlock, delay);
      feedback_text +=
        "</p><p class = block-text><i>For the next round of trials, your delay is " +
        delay +
        "</i>.  Press Enter to continue.";
      return true;
    }
  },
};

/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

var stop_signal_with_n_back_experiment = [];

stop_signal_with_n_back_experiment.push(practiceNode);
stop_signal_with_n_back_experiment.push(feedback_block);

stop_signal_with_n_back_experiment.push(start_test_block);
stop_signal_with_n_back_experiment.push(testNode);
stop_signal_with_n_back_experiment.push(feedback_block);

stop_signal_with_n_back_experiment.push(post_task_block);
stop_signal_with_n_back_experiment.push(end_block);
