

$(async function () {
    await getTableWithUsers();
    await getDefaultModal();
    await addNewUser();
    await findThisUser();
})


const userFetchService = {
    head: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': null
    },

    findAllUsers: async () => await fetch('api/admin'),
    findThisUser: async () => await fetch(`api/this_user`),
    findOneUser: async (id) => await fetch(`api/user/${id}`),
    addNewUser: async (user, id) => await fetch('api/register', {method: 'POST', headers: userFetchService.head, body: JSON.stringify(user)}),
    updateUser: async (user) => await fetch(`api/update`, {method: 'PUT', headers: userFetchService.head, body: JSON.stringify(user)}),
    deleteUser: async (id) => await fetch(`api/delete/${id}`, {method: 'DELETE', headers: userFetchService.head})
}

const emailAutorityAdmin = document.getElementById("email_aut_admin");
const roleAuthorityAdmin =document.getElementById("role_auth_admin")

async function getTableWithUsers() {
    let table = $('#mainTableWithUsers tbody');
    table.empty();

    await userFetchService.findAllUsers()
        .then(res => res.json())
        .then(users => {
            users.forEach(user => {
                let count = 0
                let newTitle = user.role[count].title
                if (user.role.length > 1) {
                    for (let i = 1; i < user.role.length ; i++) {
                        newTitle += ", " + user.role[i].title
                    }
                }
                let tableFilling = `$(
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td>${user.password.slice(0, 15)}...</td>
                            <td>${newTitle}</td>
                            <td>
                                <button type="button" data-userid="${user.id}" data-action="edit" class="btn btn-primary" 
                                data-toggle="modal" data-target="#someDefaultModal">Edit</button>
                            </td>
                            <td>
                                <button type="button" data-userid="${user.id}" data-action="delete" class="btn btn-danger" 
                                data-toggle="modal" data-target="#someDefaultModal">Delete</button>
                            </td>
                        </tr>
                )`;
                table.append(tableFilling);
            })
        })

    // обрабатываем нажатие на любую из кнопок edit или delete
    // достаем из нее данные и отдаем модалке, которую к тому же открываем
    $("#mainTableWithUsers").find('button').on('click', (event) => {
        let defaultModal = $('#someDefaultModal');

        let targetButton = $(event.target);
        let buttonUserId = targetButton.attr('data-userid');
        let buttonAction = targetButton.attr('data-action');

        defaultModal.attr('data-userid', buttonUserId);
        defaultModal.attr('data-action', buttonAction);
        defaultModal.modal('show');
    })
}


async function findThisUser(){
    await userFetchService.findThisUser()
    .then(res => res.json())
    .then(user => {
        emailAutorityAdmin.textContent = user.email
        roleAuthorityAdmin.textContent = user.role[0].title
    })
}



async function getDefaultModal() {
    $('#someDefaultModal').modal({
        keyboard: true,
        backdrop: "static",
        show: false
    }).on("show.bs.modal", (event) => {
        let thisModal = $(event.target);
        let userid = thisModal.attr('data-userid');
        let action = thisModal.attr('data-action');
        switch (action) {
            case 'edit':
                editUser(thisModal, userid);
                break;
            case 'delete':
                deleteUser(thisModal, userid);
                break;
        }
    }).on("hidden.bs.modal", (e) => {
        let thisModal = $(e.target);
        thisModal.find('.modal-title').html('');
        thisModal.find('.modal-body').html('');
        thisModal.find('.modal-footer').html('');
    })
}


async function editUser(modal, id) {
    let preuser = await userFetchService.findOneUser(id);
    let user = preuser.json();

    let editButton = `<button  class="btn btn-outline-success" id="editButton">Edit</button>`;
    let closeButton = `<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>`
    modal.find('.modal-footer').append(editButton);
    modal.find('.modal-footer').append(closeButton);

    user.then(user => {
        let bodyForm = `
            <form class="form-group" id="editUser">
                <input type="text" class="form-control" id="id" name="id" value="${user.id}" disabled><br>
                <input class="form-control" type="text" id="username" value="${user.username}"><br>
                <input class="form-control" type="password" id="password" value="${user.password}"><br>
                <input class="form-control" id="email" type="email" value="${user.email}">
                <label class="col col-form-label" for="roles"><strong>Role</strong></label>
                <form id="rolesForNewUser">
                <div class="form-check">
                  <input type="checkbox" class="form-check-input" id="roleAdmin" name="ROLE_ADMIN" value="ROLE_ADMIN">
                  <label class="form-check-label" for="roleAdmin">ROLE_ADMIN</label>
                </div>
                <div class="form-check">
                  <input type="checkbox" class="form-check-input" id="roleActor" name="ROLE_ACTOR" value="ROLE_ACTOR">
                  <label class="form-check-label" for="roleActor">ROLE_ACTOR</label>
                </div>
                <div class="form-check">
                  <input type="checkbox" class="form-check-input" id="roleUser" name="ROLE_USER" value="ROLE_USER">
                  <label class="form-check-label" for="roleUser">ROLE_USER</label>
                </div>
                </form>
                
            </form>
        `;
        modal.find('.modal-body').append(bodyForm);
    })

    $("#editButton").on('click', async () => {
        let idEd = modal.find("#id").val().trim();
        let username = modal.find("#username").val().trim();
        let password = modal.find("#password").val().trim();
        let email = modal.find("#email").val().trim();
        let role = modal.find(".form-check-input");
        const arrRolle = []
        let z ={}
        let id, title, authority
        for (let i = 0; i < role.length; i++) {
            if (role[i].checked) {
                id = i+1
                title = role[i].value
                authority = ''
                z = {id,title,authority}
                arrRolle.push(z)
            }
        }
        let data = {
            id: idEd,
            username: username,
            password: password,
            email: email,
            role: arrRolle

        }
        const response = await userFetchService.updateUser(data, id);

        if (response.ok) {
            await getTableWithUsers();
            modal.modal('hide');
        } else {
            let body = await response.json();
            let alert = `<div class="alert alert-danger alert-dismissible fade show col-12" role="alert" id="sharaBaraMessageError">
                            ${body.info}
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>`;
            modal.find('.modal-body').prepend(alert);
        }
    })
}

async function deleteUser(modal, id) {
    await userFetchService.deleteUser(id);
    await getTableWithUsers();
    modal.find('.modal-title').html('');
    modal.find('.modal-body').html('User was deleted');
    let closeButton = `<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>`
    modal.find('.modal-footer').append(closeButton);
}



async function addNewUser(modal) {
    $('#addNewUserButton').click(async () =>  {
        let addUserFormNew = $('#addNewUserForm')
        let username = addUserFormNew.find('#AddNewUsername').val().trim();
        let password = addUserFormNew.find('#AddNewUserPassword').val().trim();
        let email = addUserFormNew.find('#AddNewUserEmail').val().trim();

        let data = {
            username: username,
            password: password,
            email: email
        }
        const response = userFetchService.addNewUser(data);
        alert("New user Create")
        if (response.ok) {
            await getTableWithUsers()
        } else {
            let body = await response.json();
            let alert = `<div class="alert alert-danger alert-dismissible fade show col-12" role="alert" id="sharaBaraMessageError">
                            ${body.info}
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>`;
            addUserForm.prepend(alert)
        }
    })
}
