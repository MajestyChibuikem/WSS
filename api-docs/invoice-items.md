Base URL : /invoice_items

Get invoice items
    endpoint : /invoice_items/<int:invoice_id>
    method : GET
    description : Retrieves all invoice items for a given invoice. Only accessible to the invoice owner or an admin.
    request header : Authorization: Bearer <JWT_TOKEN>
    response:
        success 200 :
        {
            "invoice_items" : [
                {
                    "id": 1,
                    "wine_id" : 1123,
                    "quantity" : 2,
                    "price" : "29.99"
                }
            ]
        }
        error 404: not found
        {
            "message" : "invoice not found"
        }
        error 403 : unauthorized
        {
            "message" : "unauthorized"
        }
        error 500 : internal server error
        {
            "message" : "an error occured while trying to retieve invoice items"
        }


create invoice item
    endpoint : /invoice_items
    method : POST
    decription : Creates a new invoice item. Requires invoice_id, wine_id, quantity, and price. Only accessible to the invoice owner or an admin.
    request headers : Authorization: Bearer <JWT_TOKEN>
    request body:
    {
        "invoice_id" : 1,
        "wine_id" : 123,
        "quantity" : 2,
        "price" : 29.99
    }
    response:
        success:
        {
            "message" : "invoice item created succesfully",
            "invoice_item_id" : 1
        }
        error 400 : missing fields
        {
            "message" : "invoice_id, wine_id, quantity and price are required"
        }
        error 404 : invoice not found
        {
            "message" : "invoice not found"
        }
        error 403 : unauthorized access
        {
            "message" : "unauthorized"
        }
        error 500 : imternal server error
        {
            "message" : "an error occured while creating the invoice item"
        }

update invoice item
    endpoint : /invoice_items/<int:item_id>
    method : PUT
    decription : Updates an existing invoice item. Allows modifying the quantity and/or price. Only accessible to the invoice owner or an admin.
    request headers: Authorization: Bearer <JWT_TOKEN>
    request body : 
    {
        "quantity" : 3,
        "price" : 9.9
    }
    response
        success:
        {
            "message" : "invoice item updated successfully"
        }
        error 400 : missing fields
        {
            "message" : "no data provided"
        }
        error 403 : unauthorized
        {
            "message" : "unauthorized"
        }
        error 500 : internal server error
        {
            "message" : "an error occured while updating the invoice item"
        }


delete invoice item
    endpoint : /invoice_items/<int:item_id>
    method : DELETE
    description : Deletes an invoice item. Only accessible to the invoice owner or an admin.
    request headers : Authorization: Bearer <JWT_TOKEN>
    response:
        success:
        {
            "message" : "invoice item deleted successfully"
        }
        error 404: not found
        {
            "message" : "invoice item not found"
        }
        error 403 : unauthorized
        {
            "message" : "unauthorized"
        }
        error 500 : internal server error
        {
            "message" : "an error occured while trying to delete the invoice item"
        }

