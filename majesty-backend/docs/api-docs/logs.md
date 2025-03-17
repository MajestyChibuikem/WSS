base url : /logs


#this works
retrieve all logs
    endpoint : /logs
    method : GET
    description : Retrieve all log entries from the system.
    response:
        success: this too is a sample format cedar
        [
            {
                "id": 1,
                "user_id": 123,
                "action": "LOGIN",
                "timestamp": "2023-10-01T12:34:56Z",
                "details": "User logged in successfully"
            },
            {
                "id": 2,
                "user_id": 456,
                "action": "UPDATE_USER",
                "timestamp": "2023-10-01T13:00:00Z",
                "details": "User updated profile"
            }
        ]
    


#this works
retrieve logs for a specific user
    endpoint : /logs/user/<int:user_id>
    method : GET
    description : get the log entries for a specific user
    parameter : user_id in int format
    response:
        success:
        [
            {
                "id": 1,
                "user_id": 123,
                "action": "LOGIN",
                "timestamp": "2023-10-01T12:34:56Z",
                "details": "User logged in successfully"
            },
            {   
                "id": 3,
                "user_id": 123,
                "action": "LOGOUT",
                "timestamp": "2023-10-01T14:00:00Z",
                "details": "User logged out"
            }
        ]


#this works now
Retrieve Logs by Action Type
    endpoint : /logs/action/<string:action>
    method : GET
    description : Retrieve all log entries filtered by a specific action type.

    #pretend this is a table
    Parameter	Type	Description
    action	    string	The action type to filter logs by (e.g., LOGIN, UPDATE_USER).


    response:
        success:
        [
            {
                "id": 1,
                "user_id": 123,
                "action": "LOGIN",
                "timestamp": "2023-10-01T12:34:56Z",
                "details": "User logged in successfully"
            },
            {
                "id": 4,
                "user_id": 456,
                "action": "LOGIN",
                "timestamp": "2023-10-01T15:00:00Z",
                "details": "User logged in successfully"
            }
        ]

    