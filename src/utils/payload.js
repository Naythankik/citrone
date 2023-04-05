module.exports = generatePayload

function generatePayload(user){
    return{
        userId: user._id,
        username: user.username,
        role: user.role
    }
}