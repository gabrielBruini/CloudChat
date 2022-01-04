var users = []

function userJoin(id, username) {
    const user = {id, username}

    users.push(user)

    return user

}


function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }

}

function getAllusers () {
        
    return users
}

module.exports = {userJoin, userLeave, getAllusers}