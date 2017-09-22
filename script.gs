// Replace this with your base domain e.g. https://mycompany.looker.com:19999/api/3.0
var BASE_URL = 'https://mycompany.looker.com:19999/api/3.0';
// Replace this with your API credentials
var CLIENT_ID = 'XXX';
var CLIENT_SECRET = 'XXX';

/**
 * Returns the results or the sql of a Look
 *
 * @param {123} id The unique ID of the Look
 * @param {1} format 1 for csv, 2 for raw sql
 * @return The Look results data
 * @customfunction
 */
function LOOKER_RUN_LOOK(id, format) {
    try {
        // set headers
        var options = {
            'method': 'get',
            'headers': {
                'Authorization': 'token ' + login()
            }
        };
        // set formatting to either csv or the raw sql query since sheets is limited
        var formatting;
        // convert param
        switch (format) {
            case 1:
                formatting = "csv";
                break;
            case 2:
                formatting = "sql";
                break;
            default:
                formatting = "csv";
                break;
        }
        // get request for the look
        var response = UrlFetchApp.fetch(BASE_URL + "/looks/" + id + "/run/" + formatting, options);
        // if it's csv, fill it in the cells, if it's the query, use one cell only, if not specified, throw error
        if (format == 1) {
            return Utilities.parseCsv(response.getContentText());
        } else if (format == 2)
            return response.getContentText();
        else {
            return "Please specify format: 1 (results) or 2 (sql query)"
        }
    } catch (err) {
        return "Oops! Something went wrong. Check if you're passing the correct parameters and that your Look exists!"
    }
}

/**
 * Get explores for a certain model
 *
 * @param {"model_name"} id The Model Name
 * @return All explores in the given Model
 * @customfunction
 */
function LOOKER_GET_EXPLORES(model_name) {
  try {
    var options = {
        'method': 'get',
        'headers': {
            'Authorization': 'token ' + login()
        }
    };

    var response = UrlFetchApp.fetch(BASE_URL + "/lookml_models/" + model_name, options);
    var explores = JSON.parse(response.getContentText()).explores;
    var result = [];

    for (var i = 0; i < explores.length; i++) {
        result.push(explores[i].name);
    }
    return result
  } catch(err) {
    return "Something went wrong. " + err
  }
}

/**
 * Get all fields that are used within explores with the given model
 *
 * @param {"model_name"} id The model name
 * @return All dimensions and measures in the given model
 * @customfunction
 */
function LOOKER_GET_DATA_DICTIONARY(model_name) {
  try {

  var options = {
        'method': 'get',
        'headers': {
            'Authorization': 'token ' + login()
        }
    };

    var response = UrlFetchApp.fetch(BASE_URL + "/lookml_models/" + model_name, options);
    var explores = JSON.parse(response.getContentText()).explores;

    var result = [];

    result.push(["Explore Name", "Type", "Name", "Description", "Label", "Type", "Hidden", "SQL"]);

    for (var i = 0; len = explores.length, i < len; i++) {
        var explore = explores[i].name;

        var explore_results = UrlFetchApp.fetch(BASE_URL + "/lookml_models/" + model_name + "/explores/" + explore, options);
        var dimensions = JSON.parse(explore_results.getContentText()).fields.dimensions;
        var measures = JSON.parse(explore_results.getContentText()).fields.measures;

        for (var j = 0; j < dimensions.length; j++) {
            result.push([explore, "Dimension", dimensions[j].name, dimensions[j].description, dimensions[j].label, dimensions[j].type, "hidden: " + dimensions[j].hidden, (dimensions[j].sql != null ? dimensions[j].sql : "")]);
        }

        for (var k = 0; k < measures.length; k++) {
            result.push([explore, "Measure", measures[k].name, measures[k].description, measures[k].label, measures[k].type, "hidden: " + measures[k].hidden, (dimensions[k].sql != null ? dimensions[k].sql : "")]);
        }
    }
    return result
  } catch(err) {
    return "Something went wrong. " + err
}
}

function login() {
  try{
    var post = {
        'method': 'post'
    };
    var response = UrlFetchApp.fetch(BASE_URL + "/login?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET, post);
    return JSON.parse(response.getContentText()).access_token;
  } catch(err) {
    return "Could not login to Looker. " + err
  }
}
