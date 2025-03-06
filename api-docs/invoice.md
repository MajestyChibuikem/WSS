base url : /invoices

get all invoices
    endpoint: /invoices
    method : GET
    description : Retrieves all invoices for the logged-in user.
    request headers : Authorization: Bearer <JWT_TOKEN>
    response :
        success:
        {
            "invoices" : [
                {
                    "id" : 1,
                    "invoice_number" : "672e4792671364929498",
                    "total_amount" : " 127019",
                    "created_at" : "time-stamp",
                    "status" : "completed"
                    "notes" : "samples dess"
                }
            ]
        }
        error 500 : internal server error
        {
            "message" : "an error ocurred while retrieving invoices"
        }

get invoice by id
    endpoint : /invoices/<int:invoice_id>
    method : GET
    description : Retrieves a single invoice by its ID. Only accessible to the invoice owner.
    request headers : Authorization: Bearer <JWT_TOKEN>
    reponse:
        success:
        {
            "invoice": {
                "id" : 1,
                "invoice_number" : "3y7309171",
                "total_amount" : "200",
                "created_at" : "timestamp oo",
                "status" : "completed",
                "notes" : "sample notes
            }
        }
        error 404 : invoice not found
        {
            "message" : "invoice not found"
        }
        error 500 : internal server error
        {
            "message" : "an error occured while getting the invoice by id
        }


create invoice
    endpoint: /invoice/
    method : POST
    description : Creates a new invoice for the logged-in user. Requires total_amount in the request body. Optionally, notes can be provided.
    request headers : Authorization: Bearer <JWT_TOKEN>
    request body:
    {
        "total_amount" : 222,
        "notes" : "sample notes"
    }
    response:
        success:
        {
            "message" : "invoice created successfully",
            "invoice_id: 1
        }
        error 400 : missing fields
        {
            "message" : "total amounts is required"
        }