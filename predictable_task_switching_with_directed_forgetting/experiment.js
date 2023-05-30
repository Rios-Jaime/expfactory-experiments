/* ************************************ */
/* Define helper functions */
/* ************************************ */
function addID() {
  jsPsych.data.addDataToLastTrial({
    exp_id: "predictable_task_switching_with_directed_forgetting",
  });
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
  return check_percent;
}

function assessPerformance() {
  /* Function to calculate the "credit_var", which is a boolean used to
	credit individual experiments in expfactory. */
  var experiment_data = jsPsych.data.getTrialsOfType("poldrack-single-stim");
  var missed_count = 0;
  var trial_count = 0;
  var rt_array = [];
  var rt = 0;
  var correct = 0;

  //record choices participants made
  var choice_counts = {};
  choice_counts[-1] = 0;
  choice_counts[77] = 0;
  choice_counts[90] = 0;
  for (var k = 0; k < possible_responses.length; k++) {
    choice_counts[possible_responses[k]] = 0;
  }
  for (var i = 0; i < experiment_data.length; i++) {
    if (experiment_data[i].trial_id == "test_trial") {
      trial_count += 1;
      rt = experiment_data[i].rt;
      key = experiment_data[i].key_press;
      choice_counts[key] += 1;
      if (rt == -1) {
        missed_count += 1;
      } else {
        rt_array.push(rt);
      }

      if (key == experiment_data[i].correct_response) {
        correct += 1;
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
    if (choice_counts[key] > trial_count * 0.85) {
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
  if (trial_id == "practice_trial") {
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
  }
};

var createTrialTypes = function (numTrialsPerBlock) {
  //probeTypeArray = jsPsych.randomization.repeat(probes, numTrialsPerBlock / 4)
  var whichQuadStart = jsPsych.randomization.repeat([1, 2, 3, 4], 1).pop();
  var predictable_cond_array = predictable_conditions[whichQuadStart % 2];
  var used_letters = [];

  var directed_forgetting_trial_type_list = [];
  var directed_forgetting_trial_types1 = jsPsych.randomization.repeat(
    directed_cond_array,
    numTrialsPerBlock / numConds
  );
  var directed_forgetting_trial_types2 = jsPsych.randomization.repeat(
    directed_cond_array,
    numTrialsPerBlock / numConds
  );
  var directed_forgetting_trial_types3 = jsPsych.randomization.repeat(
    directed_cond_array,
    numTrialsPerBlock / numConds
  );
  var directed_forgetting_trial_types4 = jsPsych.randomization.repeat(
    directed_cond_array,
    numTrialsPerBlock / numConds
  );
  directed_forgetting_trial_type_list.push(directed_forgetting_trial_types1);
  directed_forgetting_trial_type_list.push(directed_forgetting_trial_types2);
  directed_forgetting_trial_type_list.push(directed_forgetting_trial_types3);
  directed_forgetting_trial_type_list.push(directed_forgetting_trial_types4);

  directed_condition = jsPsych.randomization
    .repeat(directed_cond_array, 1)
    .pop();
  predictable_dimension = predictable_dimensions[whichQuadStart - 1];

  letters = getTrainingSet(used_letters, numLetters);
  cue = getCue();
  probe_info = getProbe(
    directed_condition,
    letters,
    cue,
    predictable_dimension
  );
  probe = probe_info[0];
  memorySet = probe_info[1];
  forgetSet = probe_info[2];
  correct_response = getCorrectResponse(
    predictable_dimension,
    cue,
    probe,
    letters
  );
  used_letters = used_letters.concat(letters);

  var stims = [];
  var first_stim = {
    whichQuad: whichQuadStart,
    predictable_condition: "N/A",
    predictable_dimension: predictable_dimension,
    directed_condition: directed_condition,
    letters: letters,
    cue: cue,
    probe: probe,
    correct_response: correct_response,
    memorySet: memorySet,
    forgetSet: forgetSet,
  };

  stims.push(first_stim);

  for (var i = 0; i < numTrialsPerBlock; i++) {
    whichQuadStart += 1;
    quadIndex = whichQuadStart % 4;
    if (quadIndex === 0) {
      quadIndex = 4;
    }
    directed_condition =
      directed_forgetting_trial_type_list[quadIndex - 1].pop();
    predictable_dimension = predictable_dimensions[quadIndex - 1];

    letters = getTrainingSet(used_letters, numLetters);
    cue = getCue();
    probe_info = getProbe(
      directed_condition,
      letters,
      cue,
      predictable_dimension
    );
    probe = probe_info[0];
    memorySet = probe_info[1];
    forgetSet = probe_info[2];
    correct_response = getCorrectResponse(
      predictable_dimension,
      cue,
      probe,
      letters
    );

    var stim = {
      whichQuad: quadIndex,
      predictable_condition: predictable_cond_array[i % 2],
      predictable_dimension: predictable_dimension,
      directed_condition: directed_condition,
      letters: letters,
      cue: cue,
      probe: probe,
      correct_response: correct_response,
      memorySet: memorySet,
      forgetSet: forgetSet,
    };

    stims.push(stim);

    used_letters = used_letters.concat(letters);
  }

  return stims;
};

//this is an algorithm to choose the training set based on rules of the game (training sets are composed of any letter not presented in the last two training sets)
var getTrainingSet = function (used_letters, numLetters) {
  var trainingArray = jsPsych.randomization.repeat(stimArray, 1);
  var letters = trainingArray
    .filter(function (y) {
      return jQuery.inArray(y, used_letters.slice(-numLetters * 2)) == -1;
    })
    .slice(0, numLetters);

  return letters;
};

//returns a cue randomly, either TOP or BOT
var getCue = function () {
  cue = directed_cue_array[Math.floor(Math.random() * 2)];
  return cue;
};

// Will pop out a probe type from the entire probeTypeArray and then choose a probe congruent with the probe type
var getProbe = function (directed_cond, letters, cue, predictable_dimension) {
  var trainingArray = jsPsych.randomization.repeat(stimArray, 1);
  var lastCue = cue;
  var lastSet_top = letters.slice(0, numLetters / 2);
  var lastSet_bottom = letters.slice(numLetters / 2);
  if (predictable_dimension == "forget") {
    if (directed_cond == "pos") {
      if (lastCue == "BOT") {
        probe = lastSet_top[Math.floor((Math.random() * numLetters) / 2)];
      } else if (lastCue == "TOP") {
        probe = lastSet_bottom[Math.floor((Math.random() * numLetters) / 2)];
      }
    } else if (directed_cond == "neg") {
      if (lastCue == "BOT") {
        probe = lastSet_bottom[Math.floor((Math.random() * numLetters) / 2)];
      } else if (lastCue == "TOP") {
        probe = lastSet_top[Math.floor((Math.random() * numLetters) / 2)];
      }
    } else if (directed_cond == "con") {
      newArray = trainingArray.filter(function (y) {
        return (
          y != lastSet_top[0] &&
          y != lastSet_top[1] &&
          y != lastSet_bottom[0] &&
          y != lastSet_bottom[1]
        );
      });
      probe = newArray.pop();
    }
    if (lastCue == "BOT") {
      memorySet = lastSet_top;
      forgetSet = lastSet_bottom;
    } else if (lastCue == "TOP") {
      memorySet = lastSet_bottom;
      forgetSet = lastSet_top;
    }
  } else if (predictable_dimension == "remember") {
    if (directed_cond == "pos") {
      if (lastCue == "BOT") {
        probe = lastSet_bottom[Math.floor((Math.random() * numLetters) / 2)];
      } else if (lastCue == "TOP") {
        probe = lastSet_top[Math.floor((Math.random() * numLetters) / 2)];
      }
    } else if (directed_cond == "neg") {
      if (lastCue == "BOT") {
        probe = lastSet_top[Math.floor((Math.random() * numLetters) / 2)];
      } else if (lastCue == "TOP") {
        probe = lastSet_bottom[Math.floor((Math.random() * numLetters) / 2)];
      }
    } else if (directed_cond == "con") {
      newArray = trainingArray.filter(function (y) {
        return (
          y != lastSet_top[0] &&
          y != lastSet_top[1] &&
          y != lastSet_bottom[0] &&
          y != lastSet_bottom[1]
        );
      });
      probe = newArray.pop();
    }

    if (lastCue == "BOT") {
      memorySet = lastSet_bottom;
      forgetSet = lastSet_top;
    } else if (lastCue == "TOP") {
      memorySet = lastSet_top;
      forgetSet = lastSet_bottom;
    }
  }

  return [probe, memorySet, forgetSet];
};

var getCorrectResponse = function (predictable_dimension, cue, probe, letters) {
  if (predictable_dimension == "remember") {
    if (cue == "TOP") {
      if (jQuery.inArray(probe, letters.slice(0, numLetters / 2)) != -1) {
        return possible_responses[0][1];
      } else {
        return possible_responses[1][1];
      }
    } else if (cue == "BOT") {
      if (jQuery.inArray(probe, letters.slice(numLetters / 2)) != -1) {
        return possible_responses[0][1];
      } else {
        return possible_responses[1][1];
      }
    }
  } else if (predictable_dimension == "forget") {
    if (cue == "TOP") {
      if (jQuery.inArray(probe, letters.slice(numLetters / 2)) != -1) {
        return possible_responses[0][1];
      } else {
        return possible_responses[1][1];
      }
    } else if (cue == "BOT") {
      if (jQuery.inArray(probe, letters.slice(0, numLetters / 2)) != -1) {
        return possible_responses[0][1];
      } else {
        return possible_responses[1][1];
      }
    }
  }
};

var getResponse = function () {
  return correct_response;
};

var appendData = function () {
  curr_trial = jsPsych.progress().current_trial_global;
  trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id;

  if (trial_id == "practice_trial") {
    current_block = practiceCount;
  } else {
    current_block = testCount;
  }

  current_trial += 1;

  var lastSet_top = letters.slice(0, numLetters / 2);
  var lastSet_bottom = letters.slice(numLetters / 2);

  jsPsych.data.addDataToLastTrial({
    predictable_condition: predictable_condition,
    predictable_dimension: predictable_dimension,
    directed_forgetting_condition: directed_condition,
    probe: probe,
    cue: cue,
    correct_response: correct_response,
    whichQuadrant: whichQuadrant,
    current_trial: current_trial,
    top_stim: lastSet_top,
    bottom_stim: lastSet_bottom,
    memory_set: memorySet,
    forget_set: forgetSet,
  });

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
};

var getTrainingStim = function () {
  return (
    task_boards[whichQuadrant - 1][0] +
    preFileType +
    letters[0] +
    fileTypePNG +
    task_boards[whichQuadrant - 1][1] +
    task_boards[whichQuadrant - 1][2] +
    preFileType +
    letters[1] +
    fileTypePNG +
    task_boards[whichQuadrant - 1][3] +
    preFileType +
    letters[2] +
    fileTypePNG +
    task_boards[whichQuadrant - 1][4] +
    task_boards[whichQuadrant - 1][5] +
    preFileType +
    letters[3] +
    fileTypePNG +
    task_boards[whichQuadrant - 1][6]
  );
};

var getCueStim = function () {
  return (
    center_boards[whichQuadrant - 1][0] +
    preFileType +
    cue +
    fileTypePNG +
    center_boards[whichQuadrant - 1][1]
  );
};

var getProbeStim = function () {
  return (
    center_boards[whichQuadrant - 1][0] +
    preFileType +
    probe +
    fileTypePNG +
    center_boards[whichQuadrant - 1][1]
  );
};

var getStartFix = function () {
  stim = stims.shift();
  predictable_condition = stim.predictable_condition;
  predictable_dimension = stim.predictable_dimension;
  directed_condition = stim.directed_condition;
  probe = stim.probe;
  letters = stim.letters;
  cue = stim.cue;
  correct_response = stim.correct_response;
  whichQuadrant = stim.whichQuad;
  memorySet = stim.memorySet;
  forgetSet = stim.forgetSet;

  return (
    fixation_boards[whichQuadrant - 1][0] +
    '<span style="color:white">+</span>' +
    fixation_boards[whichQuadrant - 1][1]
  );
};

var getFixation = function () {
  return (
    fixation_boards[whichQuadrant - 1][0] +
    '<span style="color:white">+</span>' +
    fixation_boards[whichQuadrant - 1][1]
  );
};

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = true;
var attention_check_thresh = 0.65;
var sumInstructTime = 0; //ms
var instructTimeThresh = 0; ///in seconds
var credit_var = 0;

// new vars
var practice_len = 16;
var exp_len = 240; // must be divisible by 16
var numTrialsPerBlock = 48; // divisible by 16
var numTestBlocks = exp_len / numTrialsPerBlock;

var accuracy_thresh = 0.75;
var rt_thresh = 1000;
var missed_thresh = 0.1;
var practice_thresh = 3; // 3 blocks of 16 trials
var numLetters = 4;

var directed_cond_array = ["pos", "pos", "neg", "con"];
var directed_cue_array = ["TOP", "BOT"];
var predictable_conditions = [
  ["switch", "stay"],
  ["stay", "switch"],
];
numConds =
  directed_cond_array.length *
  directed_cue_array.length *
  predictable_conditions.length;
var predictable_dimensions_list = [
  ["forget", "forget", "remember", "remember"],
  ["remember", "remember", "forget", "forget"],
];

var predictable_dimensions =
  predictable_dimensions_list[Math.floor(Math.random() * 2)];
var fileTypePNG = ".png'></img>";
var preFileType =
  "<img class = center src='/static/experiments/predictable_task_switching_with_directed_forgetting/images/";

var possible_responses = [
  ["M Key", 77],
  ["Z Key", 90],
];
var current_trial = 0;

var current_trial = 0;
var stimArray = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

var stims = createTrialTypes(practice_len);

var task_boards = [
  [
    [
      '<div class = bigbox><div class = quad_box><div class = decision-top-left><div class = lettersBox><div class = topLeft style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = topMiddle style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = topRight style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = bottomLeft style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = bottomMiddle style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = bottomRight style="font-size:50px;"><div class = cue-text>',
    ],
    ["</div></div></div></div></div>"],
  ],
  [
    [
      '<div class = bigbox><div class = quad_box><div class = decision-top-right><div class = lettersBox><div class = topLeft style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = topMiddle style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = topRight style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = bottomLeft style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = bottomMiddle style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = bottomRight style="font-size:50px;"><div class = cue-text>',
    ],
    ["</div></div></div></div></div>"],
  ],
  [
    [
      '<div class = bigbox><div class = quad_box><div class = decision-bottom-right><div class = lettersBox><div class = topLeft style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = topMiddle style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = topRight style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = bottomLeft style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = bottomMiddle style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = bottomRight style="font-size:50px;"><div class = cue-text>',
    ],
    ["</div></div></div></div></div>"],
  ],
  [
    [
      '<div class = bigbox><div class = quad_box><div class = decision-bottom-left><div class = lettersBox><div class = topLeft style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = topMiddle style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = topRight style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = bottomLeft style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = bottomMiddle style="font-size:50px;"><div class = cue-text>',
    ],
    [
      '</div></div><div class = bottomRight style="font-size:50px;"><div class = cue-text>',
    ],
    ["</div></div></div></div></div>"],
  ],
];

var center_boards = [
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-top-left><div class = cue-text>",
    ],
    ["</div></div></div></div>"],
  ],
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-top-right><div class = cue-text>",
    ],
    ["</div></div></div></div>"],
  ],
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-bottom-right><div class = cue-text>",
    ],
    ["</div></div></div></div>"],
  ],
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-bottom-left><div class = cue-text>",
    ],
    ["</div></div></div></div>"],
  ],
];

var fixation_boards = [
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-top-left><div class = fixation>",
    ],
    ["</div></div></div></div>"],
  ],
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-top-right><div class = fixation>",
    ],
    ["</div></div></div></div>"],
  ],
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-bottom-right><div class = fixation>",
    ],
    ["</div></div></div></div>"],
  ],
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-bottom-left><div class = fixation>",
    ],
    ["</div></div></div></div>"],
  ],
];

var prompt_text_list =
  '<ul style="text-align:left;">' +
  "<li>Upper 2 quadrants: " +
  predictable_dimensions[0] +
  " the cued location</li>" +
  "<li>Lower 2 quadrants: " +
  predictable_dimensions[2] +
  " the cued location</li>" +
  "<li>Please respond if the probe (single letter) was in the memory set.</li>" +
  "<li>In memory set: " +
  possible_responses[0][0] +
  "</li>" +
  "<li>Not in memory set: " +
  possible_responses[1][0] +
  "</li>" +
  "</ul>";

var prompt_text =
  "<div class = prompt_box>" +
  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Upper 2 quadrants: ' +
  predictable_dimensions[0] +
  " the cued location</p>" +
  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Lower 2 quadrants: ' +
  predictable_dimensions[2] +
  " the cued location</p>" +
  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Please respond if the probe (single letter) was in the memory set.</p>' +
  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">In memory set: ' +
  possible_responses[0][0] +
  "</p>" +
  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Not in memory set: ' +
  possible_responses[1][0] +
  "</p>" +
  "</div>";

//PRE LOAD IMAGES HERE
var pathSource =
  "/static/experiments/predictable_task_switching_with_directed_forgetting/images/";
var images = [];

for (i = 0; i < stimArray.length; i++) {
  images.push(pathSource + stimArray[i] + ".png");
}

images.push(pathSource + "BOT.png");
images.push(pathSource + "TOP.png");
jsPsych.pluginAPI.preloadImages(images);
/* ************************************ */
/* Set up jsPsych blocks */
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

//Set up post task questionnaire
var post_task_block = {
  type: "survey-text",
  data: {
    exp_id: "predictable_task_switching_with_directed_forgetting",
    trial_id: "post task questions",
  },
  questions: [
    '<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
    '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>',
  ],
  rows: [15, 15],
  timing_response: 360000,
  columns: [60, 60],
};

var end_block = {
  type: "poldrack-text",
  data: {
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

var feedback_text =
  "Welcome to the experiment. This task will take around 30 minutes. Press <i>enter</i> to begin.";
var feedback_block = {
  type: "poldrack-single-stim",
  data: {
    trial_id: "feedback_block",
  },
  choices: [13],
  stimulus: getFeedback,
  timing_post_trial: 0,
  is_html: true,
  timing_response: 180000,
  response_ends_trial: true,
};

var feedback_instruct_text =
  "Welcome to the experiment. This task will take around 30 minutes. Press <i>enter</i> to begin.";
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
      "<p class = block-text>In this experiment, you will be presented with " +
      numLetters +
      " letters, all of which you must memorize." +
      " These " +
      numLetters +
      " letters will move clockwise from quadrant to quadrant across trials.</p> " +
      "<p class = block-text>You will be asked to remember or forget some letters, depending on which quadrant the letters are in. For now, remember all " +
      numLetters +
      " letters.</p>" +
      "<p class = block-text>After the " +
      numLetters +
      " letters disappear, you will receive a cue either TOP or BOT.  This cue states which of the " +
      numLetters +
      " letters you should forget or remember, either the top or bottom " +
      numLetters / 2 +
      " letters.</p>" +
      "<p class = block-text>When in the upper two quadrants, please  <i>" +
      predictable_dimensions[0] +
      "</i> the cued set.</p>" +
      "<p class = block-text>When in the lower two quadrants, please  <i>" +
      predictable_dimensions[2] +
      "</i> the cued set.</p>" +
      "<p class = block-text>The " +
      numLetters / 2 +
      " letters that you need to remember are called your memory set.</p>" +
      "</div>",

    "<div class = centerbox>" +
      "<p class = block-text>After, you will be presented with a probe (single letter).  Please indicate whether this probe was in your memory set.</p>" +
      "<p class = block-text>Press the <i>" +
      possible_responses[0][0] +
      "</i> if the probe was in the memory set, and the <i>" +
      possible_responses[1][0] +
      "  </i>if not.</p>" +
      "<p class = block-text>We will start practice when you finish instructions. Please make sure you understand the instructions before moving on. During practice, you will receive a reminder of the rules.  <i>This reminder will be taken out for test</i>.</p>" +
      "<p class = block-text>To avoid technical issues, please keep the experiment tab (on Chrome or Firefox) <i>active and in full-screen mode</i> for the whole duration of each task.</p>" +
      "</div>",
  ],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: 1000,
};

var instruction_node = {
  timeline: [feedback_instruct_block, instructions_block],
  /* This function defines stopping criteria */
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
    "<p class = block-text>In this experiment, you will be presented with " +
    numLetters +
    " letters, all of which you must memorize." +
    " These " +
    numLetters +
    " letters will move clockwise from quadrant to quadrant across trials.</p> " +
    "<p class = block-text>You will be asked to remember or forget some letters, depending on which quadrant the letters are in. For now, remember all " +
    numLetters +
    " letters.</p>" +
    "<p class = block-text>After the " +
    numLetters +
    " letters disappear, you will receive a cue either TOP or BOT.  This cue states which of the " +
    numLetters +
    " letters you should forget or remember, either the top or bottom " +
    numLetters / 2 +
    " letters.</p>" +
    "<p class = block-text>When in the upper two quadrants, please  <i>" +
    predictable_dimensions[0] +
    "</i> the cued set.</p>" +
    "<p class = block-text>When in the lower two quadrants, please  <i>" +
    predictable_dimensions[2] +
    "</i> the cued set.</p>" +
    "<p class = block-text>The " +
    numLetters / 2 +
    " letters that you need to remember are called your memory set.</p>" +
    "<p class = block-text>After, you will be presented with a probe (single letter).  Please indicate whether this probe was in your memory set.</p>" +
    "<p class = block-text>Press the <i>" +
    possible_responses[0][0] +
    "</i> if the probe was in the memory set, and the <i>" +
    possible_responses[1][0] +
    "  </i>if not.</p>" +
    "<p class = block-text>You will no longer receive the rule prompt, so remember the instructions before you continue. Press Enter to begin.</p>" +
    "</div>",
  cont_key: [13],
  timing_post_trial: 1000,
  on_finish: function () {
    feedback_text = "We will now start the test portion. Press enter to begin.";
  },
};

var practiceTrials = [];
practiceTrials.push(feedback_block);
practiceTrials.push(instructions_block);
for (i = 0; i < practice_len + 1; i++) {
  var start_fixation_block = {
    type: "poldrack-single-stim",
    stimulus: getStartFix,
    is_html: true,
    choices: "none",
    data: {
      trial_id: "practice_start_fixation",
    },
    timing_post_trial: 0,
    timing_stim: 500, //500
    timing_response: 500, //500
    prompt: prompt_text,
  };

  var fixation_block = {
    type: "poldrack-single-stim",
    stimulus: getFixation,
    is_html: true,
    choices: "none",
    data: {
      trial_id: "practice_fixation",
    },
    timing_post_trial: 0,
    timing_stim: 2000, //2000
    timing_response: 2000, //2000
    prompt: prompt_text,
  };

  var ITI_fixation_block = {
    type: "poldrack-single-stim",
    is_html: true,
    choices: [possible_responses[0][1], possible_responses[1][1]],
    data: {
      trial_id: "practice_ITI_fixation",
    },
    timing_post_trial: 0,
    timing_stim: 1000, //1000
    timing_response: 1000, //1000
    prompt: prompt_text,
  };

  var training_block = {
    type: "poldrack-single-stim",
    stimulus: getTrainingStim,
    is_html: true,
    data: {
      trial_id: "practice_six_letters",
    },
    choices: "none",
    timing_post_trial: 0,
    timing_stim: 2000, //2000
    timing_response: 2000, //2000
    prompt: prompt_text,
  };

  var cue_block = {
    type: "poldrack-single-stim",
    stimulus: getCueStim,
    is_html: true,
    data: {
      trial_id: "practice_cue",
    },
    choices: false,
    timing_post_trial: 0,
    timing_stim: 1000, //1000
    timing_response: 1000, //1000
    prompt: prompt_text,
  };

  var practice_probe_block = {
    type: "poldrack-single-stim",
    stimulus: getProbeStim,
    choices: [possible_responses[0][1], possible_responses[1][1]],
    data: { trial_id: "practice_trial" },
    timing_stim: 1000, //1000
    timing_response: 2000, //2000
    timing_feedback_duration: 0,
    is_html: true,
    on_finish: appendData,
    prompt: prompt_text,
    timing_post_trial: 0,
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
    timing_stim: 500, //500
    timing_response: 500, //500
    response_ends_trial: false,
  };

  practiceTrials.push(start_fixation_block); //500
  practiceTrials.push(training_block); //2000
  practiceTrials.push(cue_block); //1000
  practiceTrials.push(fixation_block); //2000
  practiceTrials.push(practice_probe_block); //1000
  practiceTrials.push(categorize_block); //500
}

var practiceCount = 0;
var practiceNode = {
  timeline: practiceTrials,
  loop_function: function (data) {
    practiceCount += 1;
    current_trial = 0;
    stims = createTrialTypes(practice_len);

    var sum_rt = 0;
    var sum_responses = 0;
    var correct = 0;
    var total_trials = 0;

    for (var i = 0; i < data.length; i++) {
      if (data[i].trial_id == "practice_trial") {
        total_trials += 1;
        if (data[i].rt != -1) {
          sum_rt += data[i].rt;
          sum_responses += 1;
          if (data[i].key_press == data[i].correct_response) {
            correct += 1;
          }
        }
      }
    }

    var accuracy = correct / total_trials;
    var missed_responses = (total_trials - sum_responses) / total_trials;
    var ave_rt = sum_rt / sum_responses;

    feedback_text =
      "<br>Please take this time to read your feedback and to take a short break! Press enter to continue";

    if (accuracy > accuracy_thresh) {
      feedback_text +=
        "</p><p class = block-text>Done with this practice. Press Enter to continue.";
      stims = createTrialTypes(numTrialsPerBlock);
      return false;
    } else if (accuracy < accuracy_thresh) {
      feedback_text +=
        "</p><p class = block-text>We are going to try practice again to see if you can achieve higher accuracy.  Remember: <br>" +
        prompt_text_list;

      if (missed_responses > missed_thresh) {
        feedback_text +=
          "</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.";
      }

      if (ave_rt > rt_thresh) {
        feedback_text +=
          "</p><p class = block-text>You have been responding too slowly.";
      }

      if (practiceCount == practice_thresh) {
        feedback_text += "</p><p class = block-text>Done with this practice.";
        stims = createTrialTypes(numTrialsPerBlock);
        return false;
      }

      feedback_text +=
        "</p><p class = block-text>Redoing this practice. Press Enter to continue.";

      return true;
    }
  },
};

var testTrials = [];
testTrials.push(feedback_block);
testTrials.push(attention_node);
for (i = 0; i < numTrialsPerBlock + 1; i++) {
  var start_fixation_block = {
    type: "poldrack-single-stim",
    stimulus: getStartFix,
    is_html: true,
    choices: "none",
    data: {
      trial_id: "test_start_fixation",
    },
    timing_post_trial: 0,
    timing_stim: 500, //500
    timing_response: 500, //500
  };

  var fixation_block = {
    type: "poldrack-single-stim",
    stimulus: getFixation,
    is_html: true,
    choices: "none",
    data: {
      trial_id: "test_fixation",
    },
    timing_post_trial: 0,
    timing_stim: 2000, //2000
    timing_response: 2000, //2000
  };

  var ITI_fixation_block = {
    type: "poldrack-single-stim",
    is_html: true,
    choices: [possible_responses[0][1], possible_responses[1][1]],
    data: {
      trial_id: "test_ITI_fixation",
    },
    timing_post_trial: 0,
    timing_stim: 1000, //1000
    timing_response: 1000, //1000
  };

  var training_block = {
    type: "poldrack-single-stim",
    stimulus: getTrainingStim,
    is_html: true,
    data: {
      trial_id: "test_six_letters",
    },
    choices: "none",
    timing_post_trial: 0,
    timing_stim: 2000, //2000
    timing_response: 2000, //2000
  };

  var cue_block = {
    type: "poldrack-single-stim",
    stimulus: getCueStim,
    is_html: true,
    data: {
      trial_id: "test_cue",
    },
    choices: false,
    timing_post_trial: 0,
    timing_stim: 1000, //1000
    timing_response: 1000, //1000
  };

  var probe_block = {
    type: "poldrack-single-stim",
    stimulus: getProbeStim,
    is_html: true,
    data: {
      trial_id: "test_trial",
    },
    choices: [possible_responses[0][1], possible_responses[1][1]],
    timing_post_trial: 0,
    timing_stim: 1000, //1000
    timing_response: 2000, //2000
    response_ends_trial: false,
    on_finish: appendData,
  };
  testTrials.push(start_fixation_block); //500
  testTrials.push(training_block); //2000
  testTrials.push(cue_block); //1000
  testTrials.push(fixation_block); //2000
  testTrials.push(probe_block); //1000
}

var testCount = 0;
var testNode = {
  timeline: testTrials,
  loop_function: function (data) {
    testCount += 1;
    current_trial = 0;
    stims = createTrialTypes(numTrialsPerBlock);

    var sum_rt = 0;
    var sum_responses = 0;
    var correct = 0;
    var total_trials = 0;

    for (var i = 0; i < data.length; i++) {
      if (data[i].trial_id == "test_trial") {
        total_trials += 1;
        if (data[i].rt != -1) {
          sum_rt += data[i].rt;
          sum_responses += 1;
          if (data[i].key_press == data[i].correct_response) {
            correct += 1;
          }
        }
      }
    }

    var accuracy = correct / total_trials;
    var missed_responses = (total_trials - sum_responses) / total_trials;
    var ave_rt = sum_rt / sum_responses;

    feedback_text =
      "<br>Please take this time to read your feedback and to take a short break! Press enter to continue";
    feedback_text +=
      "</p><p class = block-text>You have completed: " +
      testCount +
      " out of " +
      numTestBlocks +
      " blocks of trials.";

    if (accuracy < accuracy_thresh) {
      feedback_text +=
        "</p><p class = block-text>Your accuracy is too low.  Remember: <br>" +
        prompt_text_list;
    }

    if (missed_responses > missed_thresh) {
      feedback_text +=
        "</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.";
    }

    if (ave_rt > rt_thresh) {
      feedback_text +=
        "</p><p class = block-text>You have been responding too slowly.";
    }

    if (testCount == numTestBlocks) {
      feedback_text +=
        "</p><p class = block-text>Done with this test. Press Enter to continue.<br>If you have been completing tasks continuously for an hour or more, please take a 15-minute break before starting again.";
      return false;
    } else {
      return true;
    }
  },
};

/* create experiment definition array */
var predictable_task_switching_with_directed_forgetting_experiment = [];

predictable_task_switching_with_directed_forgetting_experiment.push(
  practiceNode
);
predictable_task_switching_with_directed_forgetting_experiment.push(
  feedback_block
);

predictable_task_switching_with_directed_forgetting_experiment.push(
  start_test_block
);
predictable_task_switching_with_directed_forgetting_experiment.push(testNode);
predictable_task_switching_with_directed_forgetting_experiment.push(
  feedback_block
);

predictable_task_switching_with_directed_forgetting_experiment.push(
  post_task_block
);
predictable_task_switching_with_directed_forgetting_experiment.push(end_block);
