# Looker API for Google Sheets

This Google Apps Script allows you to load the results for any saved Look in looker.

You can query the results in the following way:

* Save the script in the script editor (Tools > Script Editor)
* Replace your Looker base domain and your client id & secret
* In your sheet, you can use the included custom formulas

## Formulas

`=LOOKER_RUN_LOOK(1789, 1)`
* Return the results of a saved Look in csv (1) or the raw SQL (2)

`=LOOKER_GET_EXPLORES("model_name")`
* Return all explores within the given model

`=LOOKER_GET_DATA_DICTIONARY("model_name")`
* Return all dimensions and measures within all explores within the given model
