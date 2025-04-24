base url : /categories

create a new category
    method: POST
    endpoint : /categories/create
    description: creates a new category 

    sample json:
        {
            "name": "beverages",
            "description": "this is the categories for beverages"  
        }



get all categories
    endpoint: /categories/get
    method: GET

delete a category
    endpoint: /categories/delete/<int:category.id>
    Authorization: Bearer <JWT_TOKEN>
    method: DELETE
