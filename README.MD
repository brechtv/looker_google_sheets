# Looker API for Google Sheets

This Google Apps Script uses Looker API to load Looks, get data dictionaries, etc.


## Getting started

* Save the script in the script editor *(Tools > Script Editor)*
* Replace your Looker base domain and your client id & secret in the script and save
* Go back to your spreadsheet, you can now use the custom formulas listed below


## Formulas

`=LOOKER_RUN_LOOK(1789, 1)`
* Return the results of a saved Look in csv (1) or the raw SQL (2)

`=LOOKER_GET_EXPLORES("model_name")`
* Return all explores within the given model

`=LOOKER_GET_DATA_DICTIONARY("model_name")`
* Return all dimensions and measures within all explores within the given model


## Adding other formulas

Looker's API is extensive and only a handful of endpoints are used here. You use other endpoints using `UrlFetchApp` ([docs](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app)).

For example:

```
function LOOKER_OTHER_ENDPOINT(input) {

  var options = {
        'method': 'get',
        'headers': {
            'Authorization': 'token ' + token
        }
    };

    var response = UrlFetchApp.fetch("https://yourcompany.looker.com/this/that" + input, options);

    return Utilities.parseCsv(response.getContentText())
  }
```
