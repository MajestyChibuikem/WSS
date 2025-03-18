i updated the logging system to include the additional details you requested 
each log entry includes:
1. "acting_username" : the username of the user who performed the action
2. "affected_name" : the name of the entity (the wine name or username) that was affected by the action


this is the log structure
{
    "id": 1,
    "user_id": 123,
    "acting_username": "admin",
    "action": "ADD_WINE",
    "message": "Added wine: Cabernet Sauvignon",
    "timestamp": "2023-10-01T12:34:56Z",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0",
    "endpoint": "/wine/add",
    "method": "POST",
    "status_code": 201,
    "additional_data": null,
    "affected_name": "Cabernet Sauvignon"
}


how to rerieve logs

example 
1. /logs/logs
response
[
    {
        "id": 1,
        "user_id": 123,
        "acting_username": "admin",
        "action": "ADD_WINE",
        "message": "Added wine: Cabernet Sauvignon",
        "timestamp": "2023-10-01T12:34:56Z",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0",
        "endpoint": "/wine/add",
        "method": "POST",
        "status_code": 201,
        "additional_data": null,
        "affected_name": "Cabernet Sauvignon"
    },
    {
        "id": 2,
        "user_id": 456,
        "acting_username": "user123",
        "action": "LOGIN_SUCCESS",
        "message": "User logged in successfully",
        "timestamp": "2023-10-01T12:35:10Z",
        "ip_address": "192.168.1.2",
        "user_agent": "Mozilla/5.0",
        "endpoint": "/auth/login",
        "method": "POST",
        "status_code": 200,
        "additional_data": {"username": "user123", "roles": ["user"]},
        "affected_name": "user123"
    }
]
2. /logs/logs/user/<int:user_id>
reponse
[
    {
        "id": 2,
        "user_id": 456,
        "acting_username": "user123",
        "action": "LOGIN_SUCCESS",
        "message": "User logged in successfully",
        "timestamp": "2023-10-01T12:35:10Z",
        "ip_address": "192.168.1.2",
        "user_agent": "Mozilla/5.0",
        "endpoint": "/auth/login",
        "method": "POST",
        "status_code": 200,
        "additional_data": {"username": "user123", "roles": ["user"]},
        "affected_name": "user123"
    }
]

how to use the new fields

1   acting_username 
        This field shows the username of the user who performed the action.
        Use this to display who performed the action in the frontend.

2. affected_name
        This field shows the name of the entity that was affected by the action.
        For example:

            If the action is ADD_WINE, this will be the name of the wine added.

            If the action is UPDATE_USER, this will be the username of the user updated.


Example Use Cases
1. Displaying Logs in a Table
You can display logs in a table with columns for acting_username, action, affected_name, and timestamp.

Acting Username	Action	Affected Name	Timestamp
admin	ADD_WINE	Cabernet Sauvignon	2023-10-01T12:34:56Z
user123	LOGIN_SUCCESS	user123	2023-10-01T12:35:10Z

2. Filtering Logs
You can filter logs by:

User: Use the GET /logs/logs/user/<int:user_id> endpoint.

Action: Use the GET /logs/logs/action/<string:action> endpoint.

3. Showing Detailed Log Information
When a user clicks on a log entry, you can display detailed information, including:

acting_username

affected_name

message

timestamp

ip_address

user_agent

endpoint

method

status_code

additional_data


