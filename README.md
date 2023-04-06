# CITRONE

### About citrone
  Citrone makes it easy for educators to create learning experiences that positively engage students.

## Routings
- Default routes : GET [/](/),[/api/citrone/](/api/citrone/),[/*](/*)

#### User Routes

- Default user route / Get a user profile : GET : [/api/citrone/user](/api/citrone/user)
- Create a user : POST :  [/api/citrone/auth](/api/citrone/user)
- update a user profile : PUT :  [/api/citrone/user](/api/citrone/user)

- logout a user : POST :  [/api/citrone/auth/logout](/api/citrone/user/logout)
- login a user : POST :  [/api/citrone/auth/login](/api/citrone/user/login)

- Forget Password : POST : [/api/citrone/auth/forget-password](/forget-password)


### Password Reset
- Reset Password : POST : [/api/citrone/resetPassword/:token](/api/citrone/resetPassword/:token)
