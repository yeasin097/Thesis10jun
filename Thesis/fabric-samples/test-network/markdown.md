```java
items(permissionRequests) { request ->
PermissionRequestCard(
    request = request,
    onApprove = {
        scope.launch {
            permissionRequests = permissionRequests.filter { it != request }
        }
    },
    onReject = {
        scope.launch {
            permissionRequests = permissionRequests.filter { it != request }
        }
    }
)
}
```