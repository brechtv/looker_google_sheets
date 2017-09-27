# Looker API for Google Sheets

This Google Apps Script uses Looker API to load Looks, get data dictionaries, etc.

> fair warning: I'm still adding stuff so check back for the latest version, feel free to fork and open a pull request.

## Install

* Save the script in the script editor *(Tools > Script Editor)*
* Refresh your Sheet, you should now have a "Looker API Credentials" menu on top.
* Click the menu and set your base URL, client id and client secret
> *Note*: these are stored on the spreadsheet environment, anyone with access to the sheet will be able to use them. Switch to [userProperties](https://developers.google.com/apps-script/guides/properties) to make them user specific. This might break the formulas for users without API creds.
* Go back to your spreadsheet, you can now use the custom formulas listed below


## How to use

`=LOOKER_RUN_LOOK(1789, 1)`
* Return the results of a saved Look in csv (1) or the raw SQL (2)

`=LOOKER_GET_LOOKS_BY_USER(123)`
* Return all Looks from the user

`=LOOKER_GET_LOOKS_BY_SPACE(456)`
* Return all Looks within the given space

`=LOOKER_GET_LOOKS_BY_DASHBOARD(789)`
* Return all Looks on a dashboard

`=LOOKER_GET_EXPLORES("model_name")`
* Return all Explores within the given model

`=LOOKER_GET_DATA_DICTIONARY("model_name")`
* Return all dimensions and measures within all Explores within the given model


## Adding other formulas

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
